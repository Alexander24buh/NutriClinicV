// Motor de Alertas y Sinergias Fármaco–Alimento para NutriClínica
// Basado en farmacología clínica nutricional, lineamientos de la RIISS (MINSAL El Salvador),
// guías KDOQI/KDIGO (Renal), ADA (Diabetes), AHA/ACC (Cardiovascular) e IOM (Gestación).

export const MED_CATEGORIES = [
  'Antihipertensivo',
  'Quelante de fósforo',
  'Estimulante de eritropoyesis',
  'Hipoglucemiante / Insulina',
  'Hipolipemiante',
  'Suplemento vitamínico/mineral',
  'Gastroprotector / Digestivo',
  'Otro'
];

export const MEAL_RELATIONS = [
  { k: 'con_comidas', label: 'Con las comidas (o primer bocado)' },
  { k: 'en_ayunas', label: 'En ayunas (30–60 min antes)' },
  { k: 'separado_comidas', label: 'Separado de comidas (2 h antes/después)' },
  { k: 'indiferente', label: 'Según indicación / indiferente' }
];

export const COMMON_DRUGS_CATALOG = [
  // Quelantes de fósforo
  {
    nombre: 'Carbonato de calcio',
    categoria: 'Quelante de fósforo',
    dosisFrecuencia: '500–1000 mg con comidas',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des', 'alm', 'cen'],
    observacion: 'Actúa como quelante solo si se toma con alimentos ricos en fósforo.'
  },
  {
    nombre: 'Acetato de calcio',
    categoria: 'Quelante de fósforo',
    dosisFrecuencia: '667 mg con comidas',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des', 'alm', 'cen'],
    observacion: 'Quelante de fósforo; tomar estrictamente con el primer bocado.'
  },
  {
    nombre: 'Sevelamer',
    categoria: 'Quelante de fósforo',
    dosisFrecuencia: '800–1600 mg con comidas',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des', 'alm', 'cen'],
    observacion: 'Quelante no cálcico. Tomar con alimentos; no masticar tabletas.'
  },

  // Estimulantes de eritropoyesis
  {
    nombre: 'Eritropoyetina (EPO / alfa)',
    categoria: 'Estimulante de eritropoyesis',
    dosisFrecuencia: '2000–4000 UI SC 1–3 veces/sem',
    relacionComidas: 'indiferente',
    tiemposDefault: [],
    observacion: 'Requiere depósitos adecuados de hierro, ácido fólico y B12 para respuesta óptima.'
  },
  {
    nombre: 'Darbepoetina alfa',
    categoria: 'Estimulante de eritropoyesis',
    dosisFrecuencia: '20–40 mcg SC cada 1–2 sem',
    relacionComidas: 'indiferente',
    tiemposDefault: [],
    observacion: 'Monitorear saturación de transferrina y ferritina.'
  },

  // Hipoglucemiantes / Insulina
  {
    nombre: 'Metformina',
    categoria: 'Hipoglucemiante / Insulina',
    dosisFrecuencia: '850 mg cada 12 h',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des', 'cen'],
    observacion: 'Tomar con o inmediatamente tras las comidas para reducir náuseas y diarrea.'
  },
  {
    nombre: 'Glibenclamida',
    categoria: 'Hipoglucemiante / Insulina',
    dosisFrecuencia: '5 mg al día antes del desayuno',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des'],
    observacion: 'Tomar 15–30 min antes de comer. Riesgo de hipoglucemia severa si se salta la comida.'
  },
  {
    nombre: 'Insulina NPH / Análogo basal',
    categoria: 'Hipoglucemiante / Insulina',
    dosisFrecuencia: 'Dosis pautada SC',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des', 'cen'],
    observacion: 'Sincronizar pico de acción con tiempos de comida y colaciones para evitar hipoglucemia.'
  },
  {
    nombre: 'Empagliflozina',
    categoria: 'Hipoglucemiante / Insulina',
    dosisFrecuencia: '10–25 mg por la mañana',
    relacionComidas: 'indiferente',
    tiemposDefault: ['des'],
    observacion: 'Inhibidor SGLT2. Asegurar buena hidratación; vigilar cetoacidosis euglucémica.'
  },

  // Antihipertensivos
  {
    nombre: 'Losartán',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '50 mg cada 12–24 h',
    relacionComidas: 'indiferente',
    tiemposDefault: ['des'],
    observacion: 'ARA-II. Disminuye excreción de potasio; vigilar potasio sérico y evitar sustitutos de sal con KCl.'
  },
  {
    nombre: 'Enalapril',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '10–20 mg cada 12–24 h',
    relacionComidas: 'indiferente',
    tiemposDefault: ['des'],
    observacion: 'IECA. Riesgo de hiperpotasemia en ERC o con suplementos/sustitutos de sal potásicos.'
  },
  {
    nombre: 'Amlodipino',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '5–10 mg al día',
    relacionComidas: 'indiferente',
    tiemposDefault: ['des'],
    observacion: 'Bloqueador de canales de calcio. Evitar jugo de toronja (inhibe CYP3A4 y eleva toxicidad).'
  },
  {
    nombre: 'Espironolactona',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '25 mg al día',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['des'],
    observacion: 'Ahorrador de potasio. Contraindicado uso de sales de potasio; alto riesgo de hiperpotasemia.'
  },
  {
    nombre: 'Furosemida',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '20–40 mg por la mañana',
    relacionComidas: 'en_ayunas',
    tiemposDefault: ['des'],
    observacion: 'Diurético de asa. Tomar por la mañana para evitar nicturia. Vigilar pérdidas de K, Mg y Na.'
  },

  // Hipolipemiantes
  {
    nombre: 'Atorvastatina',
    categoria: 'Hipolipemiante',
    dosisFrecuencia: '20–40 mg por la noche',
    relacionComidas: 'indiferente',
    tiemposDefault: ['cen'],
    observacion: 'Evitar toronja (pomelo). Potenciar con fibra soluble y reducción de grasas saturadas.'
  },
  {
    nombre: 'Simvastatina',
    categoria: 'Hipolipemiante',
    dosisFrecuencia: '20 mg por la noche',
    relacionComidas: 'con_comidas',
    tiemposDefault: ['cen'],
    observacion: 'Tomar por la noche. Prohibido jugo de toronja por riesgo de rabdomiólisis.'
  },

  // Gastroprotectores
  {
    nombre: 'Omeprazol',
    categoria: 'Gastroprotector / Digestivo',
    dosisFrecuencia: '20–40 mg en ayunas',
    relacionComidas: 'en_ayunas',
    tiemposDefault: ['des'],
    observacion: 'Tomar 30–60 min antes del desayuno. El uso crónico disminuye absorción de B12, Fe, Ca y Mg.'
  },

  // Suplementos vitamínicos y minerales
  {
    nombre: 'Sulfato ferroso',
    categoria: 'Suplemento vitamínico/mineral',
    dosisFrecuencia: '300 mg (60 mg Fe elemental) al día',
    relacionComidas: 'en_ayunas',
    tiemposDefault: ['c1'],
    observacion: 'Mejor absorción en ayunas con vitamina C (cítricos). Separar de lácteos, café, té y antiácidos.'
  },
  {
    nombre: 'Ácido fólico',
    categoria: 'Suplemento vitamínico/mineral',
    dosisFrecuencia: '1–5 mg al día',
    relacionComidas: 'indiferente',
    tiemposDefault: ['des'],
    observacion: 'Crucial en embarazo (tubo neural) y en anemia o ERC bajo terapia con eritropoyetina.'
  },
  {
    nombre: 'Levotiroxina',
    categoria: 'Otro',
    dosisFrecuencia: '50–100 mcg en ayunas estricto',
    relacionComidas: 'en_ayunas',
    tiemposDefault: ['des'],
    observacion: 'Tomar solo con agua 30–60 min antes del desayuno. Separar 4 horas de calcio, hierro y soya.'
  }
];

export const CLINICAL_PRUDENCE_DISCLAIMER =
  'Aviso de prudencia clínica: Esta sección orienta la planificación dietética, la sincronización horaria con las comidas y la prevención de interferencias nutricionales. No sustituye la prescripción médica ni autoriza la suspensión o modificación de dosis de medicamentos.';

// Evaluador principal de alertas y sinergias farmacológicas
export function evaluateMedicationAlerts(p, c) {
  const medList = (p.gen && Array.isArray(p.gen.medList)) ? p.gen.medList : [];
  const textMeds = (p.gen && p.gen.meds) ? String(p.gen.meds).toLowerCase() : '';
  const pat = (p.clin && p.clin.pat) || {};
  const dxText = (p.gen && p.gen.dx ? String(p.gen.dx) : '').toLowerCase();
  const primaryDiet = p.plan?.riss?.primaryDiet || 'normal';
  const secondaryDiets = p.plan?.riss?.secondaryDiets || [];
  const allDiets = [primaryDiet, ...secondaryDiets];

  const hasERC = pat.erc || dxText.includes('renal') || dxText.includes('erc') || (c.egfr != null && c.egfr < 60);
  const hasHTA = pat.hta || dxText.includes('hipertens') || dxText.includes('hta');
  const hasDM = pat.dm2 || pat.dm1 || dxText.includes('diabet');
  const hasDislip = pat.dislipidemia || dxText.includes('dislip') || dxText.includes('colesterol');
  const isEmbarazada = Boolean(c.isEmbarazada || p.gen?.embarazada);
  const isPediatrico = Boolean(c.isPediatrico);

  const kLab = num(p.bio?.potasio);
  const pLab = num(p.bio?.fosforo);
  const caLab = c.caCorregido != null ? c.caCorregido : num(p.bio?.calcio);

  const items = [...medList];

  // Si no hay lista estructurada pero hay texto libre, extraer ítems implícitos
  if (items.length === 0 && textMeds.trim().length > 0) {
    COMMON_DRUGS_CATALOG.forEach(cd => {
      const match = textMeds.includes(cd.nombre.toLowerCase().split(' ')[0]);
      if (match) {
        items.push({
          id: 'auto-' + cd.nombre,
          nombre: cd.nombre,
          categoria: cd.categoria,
          dosisFrecuencia: 'Según prescripción médica',
          relacionComidas: cd.relacionComidas,
          tiemposComida: cd.tiemposDefault || [],
          observacion: cd.observacion
        });
      }
    });
  }

  const coordinacionAlerts = [];
  const cruceAlerts = [];
  const sinergiaAlerts = [];

  // Helper para buscar presencia de medicamento
  const hasMed = (keywords) => {
    return items.some(m => {
      const nm = (m.nombre || '').toLowerCase();
      const obs = (m.observacion || '').toLowerCase();
      return keywords.some(k => nm.includes(k) || obs.includes(k));
    }) || keywords.some(k => textMeds.includes(k));
  };

  // 1. REGLAS POR ÍTEM ESPECÍFICO
  items.forEach(med => {
    const name = (med.nombre || '').toLowerCase();
    const cat = med.categoria || '';
    const rel = med.relacionComidas || '';
    const tiempos = Array.isArray(med.tiemposComida) ? med.tiemposComida : [];

    // --- A. QUELANTES DE FÓSFORO (Carbonato de calcio, Sevelamer, Acetato) ---
    if (cat === 'Quelante de fósforo' || name.includes('carbonato de calcio') || name.includes('sevelamer') || name.includes('acetato de calcio')) {
      const isConComidas = rel === 'con_comidas';
      if (!isConComidas) {
        coordinacionAlerts.push({
          id: `coord-quelante-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Coordinación crítica: Quelante de fósforo con primer bocado',
          mensaje: `${med.nombre} debe administrarse estrictamente durante las comidas principales (primeros bocados). Si se toma en ayunas o entre comidas, se absorbe como suplemento de calcio y NO quelará el fósforo dietético.`,
          accion: 'Asignar toma en Desayuno, Almuerzo y/o Cena junto con los alimentos con fósforo.'
        });
      } else if (tiempos.length === 0) {
        coordinacionAlerts.push({
          id: `coord-quelante-time-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Sin tiempos de comida definidos para quelante',
          mensaje: `${med.nombre} requiere coincidir con los tiempos que aporten mayor contenido de fósforo proteico.`,
          accion: 'Seleccione en el menú los tiempos donde el paciente consumirá las fuentes proteicas.'
        });
      }

      // Cruce con patología / Calcio elevado
      if (caLab != null && caLab > 10.2 && (name.includes('carbonato') || name.includes('acetato') || cat === 'Quelante de fósforo')) {
        cruceAlerts.push({
          id: `cruce-quelante-ca-${med.id || name}`,
          med: med.nombre,
          severidad: 'crit',
          titulo: 'Alerta de Hipercalcemia con Quelante Cálcico',
          mensaje: `Calcio sérico corregido elevado (${caLab.toFixed(1)} mg/dL). El uso de quelantes a base de calcio en presencia de hipercalcemia o producto Ca×P alto incrementa el riesgo de calcificación vascular en ERC.`,
          accion: 'Notificar al médico tratante para valorar cambio a quelante no cálcico (ej. Sevelamer) y restringir fuentes de calcio añadidas.'
        });
      }
    }

    // --- B. ESTIMULANTES DE ERITROPOYESIS (EPO) ---
    if (cat === 'Estimulante de eritropoyesis' || name.includes('eritropoyetina') || name.includes('epo') || name.includes('darbepoetina')) {
      sinergiaAlerts.push({
        id: `sinergia-epo-${med.id || name}`,
        med: med.nombre,
        severidad: 'ok',
        titulo: 'Sinergia Hematopoyética: Depósitos de Hierro, Folatos y B12',
        mensaje: `La respuesta medular a ${med.nombre} depende críticamente de depósitos adecuados de hierro (ferritina y saturación de transferrina), ácido fólico y vitamina B12.`,
        accion: 'Asegurar fuentes de hierro de alta biodisponibilidad y folatos en el plan, respetando las restricciones de fósforo y potasio de la RIISS.'
      });

      if (hasERC && allDiets.includes('hipoproteica')) {
        cruceAlerts.push({
          id: `cruce-epo-prot-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Equilibrio proteico en terapia con Eritropoyetina y ERC',
          mensaje: `Paciente con ERC y prescripción hipoprotéica. Aunque la eritropoyesis consume aminoácidos, no se debe sobrepasar la meta proteica (${p.req?.gkg?.p || '0.8'} g/kg) para no acelerar la uremia.`,
          accion: 'Priorizar que al menos el 60% de la proteína pautada sea de Alto Valor Biológico (huevo, aves preparadas sin piel).'
        });
      }
    }

    // --- C. HIPOGLUCEMIANTES / INSULINA (Metformina, Sulfonilureas, Insulina) ---
    if (cat === 'Hipoglucemiante / Insulina' || name.includes('metformina') || name.includes('glibenclamida') || name.includes('insulina')) {
      if (name.includes('metformina')) {
        if (rel !== 'con_comidas') {
          coordinacionAlerts.push({
            id: `coord-metf-${med.id || name}`,
            med: med.nombre,
            severidad: 'warn',
            titulo: 'Tolerancia digestiva: Metformina con alimentos',
            mensaje: 'Metformina debe tomarse siempre junto con o inmediatamente después de los alimentos principales para minimizar efectos gastrointestinales adversos (diarrea, náuseas, dolor cólico).',
            accion: 'Pautar con el Desayuno y/o Cena.'
          });
        }
        sinergiaAlerts.push({
          id: `sinergia-metf-${med.id || name}`,
          med: med.nombre,
          severidad: 'ok',
          titulo: 'Sinergia Glucémica: Fibra soluble y control de carbohidratos',
          mensaje: 'El efecto sensibilizador a la insulina de la metformina se potencia notablemente al fraccionar los carbohidratos complejos e incluir fibra soluble (avena, verduras cocidas).',
          accion: 'Distribuir carbohidratos de forma homogénea en los 5 tiempos de comida sin saltarse tiempos.'
        });
      }

      if (name.includes('glibenclamida') || name.includes('glimepirida') || name.includes('insulina')) {
        coordinacionAlerts.push({
          id: `coord-secreta-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Prevención de Hipoglucemia: Fraccionamiento obligatorio',
          mensaje: `Fármaco secretagogo/insulínico activo. El retraso o la omisión de un tiempo de comida con carbohidratos desencadena hipoglucemia severa.`,
          accion: 'Garantizar aporte regular de carbohidratos complejos en 5 tiempos de comida sincronizados con los horarios de medicación.'
        });
      }
    }

    // --- D. ANTIHIPERTENSIVOS (IECA / ARA-II / Amlodipino / Espironolactona) ---
    if (cat === 'Antihipertensivo' || name.includes('losartan') || name.includes('enalapril') || name.includes('amlodipino') || name.includes('espironolactona')) {
      // Sinergia general con dieta hiposódica
      sinergiaAlerts.push({
        id: `sinergia-hta-${med.id || name}`,
        med: med.nombre,
        severidad: 'ok',
        titulo: 'Sinergia Antihipertensiva con Dieta Hiposódica RIISS',
        mensaje: `La restricción de sodio a < 2,000 mg/día (dieta hiposódica leve/moderada RIISS) potencia de forma sinérgica la eficacia hipotensora de ${med.nombre}.`,
        accion: 'Evitar alimentos ultraprocesados, consomés en polvo y sal de mesa.'
      });

      // Cruce crítico de Potasio con IECA / ARA-II / Espironolactona
      if (name.includes('losartan') || name.includes('enalapril') || name.includes('captopril') || name.includes('valsartan') || name.includes('espironolactona')) {
        const kHigh = kLab != null && kLab >= 5.0;
        if (hasERC || kHigh || allDiets.includes('baja_potasio')) {
          cruceAlerts.push({
            id: `cruce-k-ieca-${med.id || name}`,
            med: med.nombre,
            severidad: kHigh ? 'crit' : 'warn',
            titulo: `Riesgo de Hiperpotasemia con ${med.nombre}`,
            mensaje: `${med.nombre} bloquea el eje renina-angiotensina-aldosterona, reduciendo la excreción urinaria de potasio. En presencia de ${hasERC ? 'ERC' : 'riesgo renal'}${kLab ? ' (K sérico: ' + kLab.toFixed(1) + ' mEq/L)' : ''}, existe alto riesgo de hiperpotasemia arrítmica.`,
            accion: 'Prohibir estrictamente sustitutos de sal formulados con Cloruro de Potasio (KCl). Aplicar técnica de doble cocción o remojo a tubérculos y verduras si se requiere control de potasio.'
          });
        }
      }

      // Amlodipino / Estatinas y Toronja
      if (name.includes('amlodipino')) {
        coordinacionAlerts.push({
          id: `coord-amlodipino-grapefruit-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Interacción con Toronja (Pomelo)',
          mensaje: 'La toronja inhibe la enzima intestinal CYP3A4, aumentando excesivamente los niveles plasmáticos de amlodipino y provocando hipotensión o edema periférico.',
          accion: 'Excluir toronja o jugo de toronja de las meriendas y desayunos.'
        });
      }
    }

    // --- E. HIPOLIPEMIANTES (Atorvastatina, Simvastatina) ---
    if (cat === 'Hipolipemiante' || name.includes('estatina') || name.includes('atorvastatina') || name.includes('simvastatina')) {
      coordinacionAlerts.push({
        id: `coord-statin-grapefruit-${med.id || name}`,
        med: med.nombre,
        severidad: 'warn',
        titulo: 'Contraindicación de Toronja con Estatinas',
        mensaje: 'El consumo de toronja aumenta drásticamente la concentración de estatinas en sangre, elevando el riesgo de toxicidad hepática y rabdomiólisis.',
        accion: 'No incluir toronja ni zumos cítricos amargos en el plan alimentario.'
      });
      sinergiaAlerts.push({
        id: `sinergia-statin-${med.id || name}`,
        med: med.nombre,
        severidad: 'ok',
        titulo: 'Sinergia Ateroprotectora: Fibra soluble y fitoesteroles',
        mensaje: 'La incorporación de fibra soluble (avena, leguminosas toleradas) y ácidos grasos monoinsaturados (aguacate, aceite vegetal) complementa el efecto reductor de LDL.',
        accion: 'Mantener grasas saturadas < 7% del VCT según dieta baja en grasa RIISS.'
      });
    }

    // --- F. GASTROPROTECTORES (Omeprazol, Antiácidos) ---
    if (cat === 'Gastroprotector / Digestivo' || name.includes('omeprazol') || name.includes('esomeprazol') || name.includes('pantoprazol')) {
      if (rel !== 'en_ayunas') {
        coordinacionAlerts.push({
          id: `coord-ibp-ayunas-${med.id || name}`,
          med: med.nombre,
          severidad: 'warn',
          titulo: 'Horario óptimo de IBP en ayunas',
          mensaje: 'Los inhibidores de bomba de protones deben tomarse 30 a 60 minutos antes del primer alimento del día para máxima inhibición ácida.',
          accion: 'Programar antes del Desayuno.'
        });
      }
      cruceAlerts.push({
        id: `cruce-ibp-micronutrientes-${med.id || name}`,
        med: med.nombre,
        severidad: 'warn',
        titulo: 'Vigilancia de Micronutrientes por Hipoclorhidria',
        mensaje: 'El uso crónico de IBP disminuye la biodisponibilidad de Vitamina B12, Hierro no hemo, Calcio y Magnesio.',
        accion: 'Vigilar hemoglobina, magnesio sérico y asegurar fuentes dietéticas con potenciadores de absorción.'
      });
    }

    // --- G. LEVOTIROXINA ---
    if (name.includes('levotiroxina') || name.includes('eutirox')) {
      coordinacionAlerts.push({
        id: `coord-levo-${med.id || name}`,
        med: med.nombre,
        severidad: 'warn',
        titulo: 'Toma estricta en ayunas y separación de minerales',
        mensaje: 'Levotiroxina debe tomarse en ayunas estricto solo con agua (60 min antes del desayuno). Se debe separar al menos 4 horas de suplementos de calcio, hierro, soya o antiácidos.',
        accion: 'Programar suplementos de calcio o hierro en la tarde/noche si el paciente toma levotiroxina matutina.'
      });
    }

    // --- H. HIERRO ORAL ---
    if (name.includes('hierro') || name.includes('ferroso')) {
      sinergiaAlerts.push({
        id: `sinergia-fe-vitc-${med.id || name}`,
        med: med.nombre,
        severidad: 'ok',
        titulo: 'Potenciación con Vitamina C y separación de lácteos',
        mensaje: 'El hierro oral aumenta su absorción al consumirse con alimentos ricos en Vitamina C (limón, guayaba, naranja). Debe separarse de lácteos, café y té.',
        accion: 'No tomar el suplemento con leche o café con leche.'
      });
    }
  });

  // 2. ALERTAS CONTEXTUALES DE CONDICIONES ESPECIALES (Embarazo / Pediatría)
  if (isEmbarazada) {
    const hasPrenatal = items.some(m => m.categoria === 'Suplemento vitamínico/mineral' || (m.nombre || '').toLowerCase().includes('folic') || (m.nombre || '').toLowerCase().includes('prenatal'));
    if (!hasPrenatal) {
      sinergiaAlerts.push({
        id: 'sinergia-emb-prenatal',
        med: 'Suplementación Gestacional',
        severidad: 'warn',
        titulo: 'Recomendación de Suplementación en Embarazo (MINSAL)',
        mensaje: 'La norma técnica materna de El Salvador recomienda suplementación profiláctica con Ácido Fólico (preconcepcional / 1er trimestre) y Hierro elemental + Calcio.',
        accion: 'Verificar prescripción de micronutrientes prenatales y coordinar tomas separando calcio de hierro.'
      });
    }
  }

  const allAlerts = [...cruceAlerts, ...coordinacionAlerts, ...sinergiaAlerts];

  return {
    items,
    alerts: allAlerts,
    byType: {
      cruce_patologia: cruceAlerts,
      coordinacion: coordinacionAlerts,
      sinergia: sinergiaAlerts
    },
    totalAlerts: allAlerts.length,
    disclaimer: CLINICAL_PRUDENCE_DISCLAIMER
  };
}

// Genera un texto conciso de medicamentos para mantener sincronizado `p.gen.meds`
export function formatMedListToReadableText(medList) {
  if (!Array.isArray(medList) || medList.length === 0) return '';
  return medList.map(m => {
    let s = m.nombre;
    if (m.dosisFrecuencia) s += ` (${m.dosisFrecuencia})`;
    if (m.relacionComidas && m.relacionComidas !== 'indiferente') {
      const relLabel = MEAL_RELATIONS.find(r => r.k === m.relacionComidas)?.label || m.relacionComidas;
      s += ` - ${relLabel}`;
    }
    return s;
  }).join('; ');
}
