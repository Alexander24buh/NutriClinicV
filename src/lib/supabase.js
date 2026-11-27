import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'nutriclinica_cloud_config';

export const SQL_SETUP_SCRIPT = `-- Copia y ejecuta este script en el 'SQL Editor' de tu proyecto Supabase:

-- 1. Tabla de pacientes (Sincronización de expediente)
create table if not exists public.patients (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.patients enable row level security;

create policy "Acceso público pacientes"
  on public.patients
  for all
  using (true)
  with check (true);

-- 2. Tabla de control de uso mensual de IA (Protección de costos y límite)
create table if not exists public.uso_ia_mensual (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  periodo text not null, -- Formato 'YYYY-MM', ej: '2026-11'
  usos_actuales integer not null default 0,
  limite_mensual integer not null default 20,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_periodo unique (user_id, periodo)
);

alter table public.uso_ia_mensual enable row level security;

-- El usuario autenticado solo puede hacer SELECT de su propio registro (ver sus usos)
create policy "Usuario autenticado solo puede ver sus propios usos de IA"
  on public.uso_ia_mensual
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Función RPC atómica para verificar y descontar uso de forma segura
create or replace function public.verificar_y_consumir_uso_ia(
  p_user_id uuid,
  p_periodo text,
  p_limite_defecto integer default 20
)
returns table (
  permitido boolean,
  usos_actuales integer,
  limite_mensual integer,
  usos_restantes integer,
  mensaje text
)
language plpgsql
security definer
as $$
declare
  v_registro public.uso_ia_mensual%rowtype;
begin
  insert into public.uso_ia_mensual (user_id, periodo, usos_actuales, limite_mensual, updated_at)
  values (p_user_id, p_periodo, 0, p_limite_defecto, now())
  on conflict (user_id, periodo) do nothing;

  select * into v_registro
  from public.uso_ia_mensual
  where user_id = p_user_id and periodo = p_periodo
  for update;

  if v_registro.usos_actuales >= v_registro.limite_mensual then
    return query select 
      false, 
      v_registro.usos_actuales, 
      v_registro.limite_mensual, 
      0, 
      'Has alcanzado tu límite mensual de personalizaciones con IA.'::text;
    return;
  end if;

  update public.uso_ia_mensual
  set usos_actuales = usos_actuales + 1,
      updated_at = now()
  where user_id = p_user_id and periodo = p_periodo
  returning * into v_registro;

  return query select 
    true, 
    v_registro.usos_actuales, 
    v_registro.limite_mensual, 
    (v_registro.limite_mensual - v_registro.usos_actuales), 
    'Uso registrado exitosamente.'::text;
end;
$$;
`;

export function getCloudConfig() {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const local = localStorage.getItem(CONFIG_KEY);
    const parsed = local ? JSON.parse(local) : {};

    return {
      url: parsed.url || envUrl || '',
      key: parsed.key || envKey || '',
      autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
    };
  } catch (e) {
    return { url: '', key: '', autoSync: true };
  }
}

export function saveCloudConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    clientInstance = null; // Reiniciar instancia
    return true;
  } catch (e) {
    console.error('Error guardando configuración de nube', e);
    return false;
  }
}

let clientInstance = null;

export function getSupabaseClient() {
  const { url, key } = getCloudConfig();
  if (!url || !key) return null;
  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key);
    } catch (e) {
      console.error('Error inicializando Supabase', e);
      return null;
    }
  }
  return clientInstance;
}

export function isCloudConfigured() {
  const { url, key } = getCloudConfig();
  return Boolean(url && key);
}

export async function testCloudConnection() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Falta ingresar la URL y la Anon Key de Supabase.' };
  }

  try {
    const { data, error } = await client.from('patients').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          error: 'Conexión establecida, pero la tabla "patients" no existe aún. Ejecuta el script SQL en Supabase.',
          needTable: true
        };
      }
      return { success: false, error: error.message };
    }
    return { success: true, count: data ? data.length : 0 };
  } catch (e) {
    return { success: false, error: e.message || 'Error de conexión a la red.' };
  }
}

export async function savePatientToCloud(patient) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Sin conexión a la nube configurada.' };

  try {
    const { error } = await client.from('patients').upsert({
      id: patient.id,
      data: patient,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function syncAllPatientsToCloud(patients) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Sin conexión a la nube configurada.' };

  try {
    const records = patients.map(p => ({
      id: p.id,
      data: p,
      updated_at: new Date().toISOString()
    }));

    const { error } = await client.from('patients').upsert(records);
    if (error) throw error;
    return { success: true, count: records.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export async function fetchAllPatientsFromCloud() {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Sin conexión a la nube configurada.' };

  try {
    const { data, error } = await client.from('patients').select('data, updated_at');
    if (error) throw error;
    if (!data || !data.length) return { success: true, patients: [] };

    const patients = data.map(row => row.data);
    return { success: true, patients };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ==========================================
// AUTENTICACIÓN Y CONTROL DE SESIÓN
// ==========================================

export async function getAuthSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error) throw error;
    return session;
  } catch (e) {
    console.warn('Error obteniendo sesión de Supabase:', e);
    return null;
  }
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error) throw error;
    return user;
  } catch (e) {
    return null;
  }
}

export async function signInWithEmail(email, password) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase no está configurado (URL y Clave requeridas).' };
  try {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (e) {
    return { success: false, error: e.message || 'Error al iniciar sesión.' };
  }
}

export async function signUpWithEmail(email, password) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase no está configurado (URL y Clave requeridas).' };
  try {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (e) {
    return { success: false, error: e.message || 'Error al registrar usuario.' };
  }
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return { success: true };
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function onAuthStateChange(callback) {
  const client = getSupabaseClient();
  if (!client || !client.auth) return { unsubscribe: () => {} };
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}

// ==========================================
// CONSULTA DE LÍMITES DE USO DE IA (RLS SELECT)
// ==========================================

export async function getMonthlyAiUsage() {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, unconfigured: true, usos_actuales: 0, limite_mensual: 20, usos_restantes: 20 };
  }

  const session = await getAuthSession();
  if (!session || !session.user) {
    return { success: false, unauthenticated: true, usos_actuales: 0, limite_mensual: 20, usos_restantes: 0 };
  }

  const periodo = new Date().toISOString().slice(0, 7); // ej: '2026-11'

  try {
    const { data, error } = await client
      .from('uso_ia_mensual')
      .select('usos_actuales, limite_mensual')
      .eq('user_id', session.user.id)
      .eq('periodo', periodo)
      .maybeSingle();

    if (error) {
      console.warn('Advertencia al consultar uso_ia_mensual:', error.message);
      return { success: true, usos_actuales: 0, limite_mensual: 20, usos_restantes: 20, periodo };
    }

    const usos_actuales = data?.usos_actuales ?? 0;
    const limite_mensual = data?.limite_mensual ?? 20;
    const usos_restantes = Math.max(0, limite_mensual - usos_actuales);

    return {
      success: true,
      usos_actuales,
      limite_mensual,
      usos_restantes,
      periodo
    };
  } catch (e) {
    return { success: false, error: e.message, usos_actuales: 0, limite_mensual: 20, usos_restantes: 20 };
  }
}

