import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper para leer variables de entorno locales si no están en process.env
function getEnv(key, fallback = '') {
  if (process.env[key]) return process.env[key];
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k.trim() === key) {
          return v.join('=').trim();
        }
      }
    }
  } catch (e) {
    // ignorar error de lectura
  }
  return fallback;
}

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Manejo de CORS si es necesario
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método no permitido. Utilice POST.' });
  }

  try {
    // 1. Obtener y validar token de autorización
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
      return sendJson(res, 401, {
        error: 'No autorizado. Se requiere iniciar sesión en Supabase para utilizar la IA.'
      });
    }

    const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
    const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
    const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || supabaseAnonKey;

    if (!supabaseUrl || !supabaseAnonKey) {
      return sendJson(res, 500, {
        error: 'Falta la configuración de Supabase (URL y Clave) en las variables de entorno del servidor.'
      });
    }

    // Validar usuario autenticado
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return sendJson(res, 401, {
        error: 'Sesión inválida o expirada. Por favor inicie sesión nuevamente.'
      });
    }

    const userId = user.id;
    const periodo = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Cliente administrativo o con token para consultar/actualizar cuota
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 2. Consultar registro de uso_ia_mensual para el periodo actual
    let { data: registro, error: fetchErr } = await adminClient
      .from('uso_ia_mensual')
      .select('*')
      .eq('user_id', userId)
      .eq('periodo', periodo)
      .maybeSingle();

    if (!registro) {
      // Crear registro inicial con 0 usos si no existe para este mes
      const { data: nuevo, error: insertErr } = await adminClient
        .from('uso_ia_mensual')
        .insert({
          user_id: userId,
          periodo: periodo,
          usos_actuales: 0,
          limite_mensual: 20,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertErr && insertErr.code !== '23505') {
        console.error('Error insertando registro mensual de IA:', insertErr);
      }
      registro = nuevo || { usos_actuales: 0, limite_mensual: 20 };
    }

    const limite = registro.limite_mensual ?? 20;
    const usosActuales = registro.usos_actuales ?? 0;

    // Validación de límite mensual ANTES de llamar a Gemini
    if (usosActuales >= limite) {
      return sendJson(res, 429, {
        error: 'Has alcanzado tu límite mensual de personalizaciones con IA.',
        usos_actuales: usosActuales,
        limite_mensual: limite,
        usos_restantes: 0,
        periodo
      });
    }

    // 3. Preparar datos para Gemini
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const {
      patient = {},
      computed = {},
      exchanges = {},
      mealTime = '',
      rissData = null,
      customInstructions = ''
    } = body;

    const geminiApiKey = getEnv('GEMINI_API_KEY') || getEnv('VITE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      return sendJson(res, 500, {
        error: 'GEMINI_API_KEY no está configurada en el servidor (.env.local).'
      });
    }

    // Construir el prompt clínico especializado en gastronomía salvadoreña y prescripción RIISS
    const prompt = `Actúa como un Nutricionista Clínico salvadoreño experto en el Proceso de Atención Nutricional (PAN) y en los Lineamientos Técnicos para la Prescripción de Dietas Hospitalarias (RIISS).

Personaliza una propuesta de menú salvadoreño para el siguiente paciente:
- Paciente: ${patient.name || 'Paciente Adulto'}, ${patient.age || 'Adulto'} años, Sexo: ${patient.sex === 'm' ? 'Masculino' : 'Femenino'}.
- Diagnósticos médicos: ${patient.diagnoses || 'Ninguno especificado'}.
- Prescripción dietética / RIISS: ${rissData?.nombre || 'Dieta General / Normal'}.
- Alergias o intolerancias: ${patient.allergies || 'Ninguna'}.
- Medicamentos actuales: ${(patient.medications || []).map(m => m.nombre).join(', ') || 'Ninguno'}.
- Requerimientos diarios meta: ${Math.round(computed.vct || 2000)} kcal (CHO: ${Math.round(computed.choG || 250)}g, Prot: ${Math.round(computed.chonG || 75)}g, Lípidos: ${Math.round(computed.coohG || 55)}g).
${mealTime ? `- Tiempo de comida específico a personalizar: ${mealTime}` : '- Planificar tiempos de comida del día (Desayuno, Refrigerio Matutino, Almuerzo, Refrigerio Vespertino, Cena).'}

Intercambios de alimentos asignados para esta preparación:
- Cereales/Almidones: ${exchanges.almidones || 0} porciones
- Leguminosas: ${exchanges.leguminosas || 0} porciones
- Carnes/Sustitutos: ${exchanges.carnes || 0} porciones
- Verduras: ${exchanges.vegetales || 0} porciones
- Frutas: ${exchanges.frutas || 0} porciones
- Lácteos: ${exchanges.lacteos || 0} porciones
- Grasas: ${exchanges.grasas || 0} porciones
- Azúcares: ${exchanges.azucares || 0} porciones

Instrucciones adicionales del profesional:
${customInstructions || 'Priorizar ingredientes típicos salvadoreños accesibles y de temporada, respetando estrictamente las porciones y las restricciones médicas.'}

REGLAS ESTRICTAS DE RESPUESTA:
1. No utilices decimales en las porciones (ejemplo: NO pongas 0.75 tazas, utiliza números enteros prácticos: 1 taza, 2 tortillas, 3 onzas, 1 unidad).
2. Nombra los platillos con su denominación tradicional salvadoreña (ej: casamiento, sopa de res desgrasada, chilaquilas con quesillo bajo en grasa, salpicón magro, plátano sancochado, frijoles volteados o parados).
3. Entrega una redacción clara, apetitosa y profesional lista para entregar al paciente, con la preparación culinaria sugerida y medidas caseras exactas.`;

    // 4. Llamada a Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    };

    let geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify(geminiPayload)
    });

    // Fallback a gemini-1.5-flash si gemini-2.5-flash reporta no disponible
    if (!geminiRes.ok && (geminiRes.status === 404 || geminiRes.status === 400)) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey
        },
        body: JSON.stringify(geminiPayload)
      });
      if (fallbackRes.ok) {
        geminiRes = fallbackRes;
      }
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Error desde Gemini API:', geminiRes.status, errText);
      return sendJson(res, 502, {
        error: `Error al conectar con el servicio de IA de Gemini (${geminiRes.status}). No se consumió crédito de tu cuenta.`
      });
    }

    const geminiData = await geminiRes.json();
    const generatedText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return sendJson(res, 502, {
        error: 'La IA no devolvió contenido para esta solicitud. No se consumió crédito.'
      });
    }

    // 5. Incrementar usos_actuales en Supabase (+1) solo tras éxito comprobado
    const nuevosUsos = usosActuales + 1;
    const { error: updateErr } = await adminClient
      .from('uso_ia_mensual')
      .update({
        usos_actuales: nuevosUsos,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('periodo', periodo);

    if (updateErr) {
      console.warn('Advertencia actualizando usos_ia_mensual:', updateErr);
    }

    const usosRestantes = Math.max(0, limite - nuevosUsos);

    // 6. Devolver respuesta exitosa
    return sendJson(res, 200, {
      success: true,
      menuPersonalizado: generatedText,
      usos_actuales: nuevosUsos,
      limite_mensual: limite,
      usos_restantes: usosRestantes,
      periodo
    });

  } catch (err) {
    console.error('Error general en /api/personalizar-menu:', err);
    return sendJson(res, 500, {
      error: 'Error interno del servidor procesando la personalización con IA: ' + (err.message || 'desconocido')
    });
  }
}
