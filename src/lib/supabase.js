import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'nutriclinica_cloud_config';

export const SQL_SETUP_SCRIPT = `-- Copia y ejecuta este script en el 'SQL Editor' de tu proyecto Supabase:

create table if not exists patients (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS) con acceso mediante la anon key
alter table patients enable row level security;

create policy "Acceso público lectura y escritura"
  on patients
  for all
  using (true)
  with check (true);
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
