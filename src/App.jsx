import React, { useState, useMemo, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import {
  Plus, Trash2, Copy, Check as CheckIcon, Sun, Moon, Cloud, CloudOff,
  Download, Upload, Search, Database, AlertTriangle, RefreshCw, X, ExternalLink, Activity,
  FileDown, Printer, CheckCircle2
} from 'lucide-react';
import {
  getCloudConfig, saveCloudConfig, isCloudConfigured, testCloudConnection,
  savePatientToCloud, syncAllPatientsToCloud, fetchAllPatientsFromCloud, SQL_SETUP_SCRIPT
} from './lib/supabase.js';
import {
  EXCHANGE_GROUPS, MEAL_TIMES, generateMealMenuFromExchanges
} from './data/exchangeDatabase.js';
import ExchangePlanSection from './components/ExchangePlanSection.jsx';
import { exportClinicalReportPDF } from './lib/pdfExport.js';

// ==== LOGIC START ====
const KEY = 'nutriclinica.v1';
const THEME_KEY = 'nutriclinica_theme';
const MEALS = MEAL_TIMES.map(m => [m.k, m.n]);
const RECALL = [...MEALS, ['noc', 'Otros / nocturno']];
const uid = () => Math.random().toString(36).slice(2, 10);
const pad2 = n => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
};
const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);
const fs = n => n == null ? '—' : (n > 0.049 ? '+' : n < -0.049 ? '−' : '') + Math.abs(n).toFixed(1);
const lv = (level, label, dir = '') => ({ level, label, dir });
const rng = (v, lo, hi) => v < lo ? lv('low', 'Bajo', '↓') : v > hi ? lv('warn', 'Alto', '↑') : lv('ok', 'Normal', '✓');
const getIn = (o, path) => path.split('.').reduce((x, k) => x == null ? x : x[k], o);
const setIn = (o, path, val) => {
  const ks = path.split('.');
  const rec = (obj, i) => {
    const k = ks[i];
    const base = Array.isArray(obj) ? [...obj] : { ...(obj && typeof obj === 'object' ? obj : {}) };
    base[k] = i === ks.length - 1 ? val : rec(obj ? obj[k] : undefined, i + 1);
    return base;
  };
  return rec(o, 0);
};
const merge = (a, b) => {
  if (b === undefined) return a;
  if (b === null || typeof b !== 'object' || Array.isArray(b)) return b;
  const o = { ...(a && typeof a === 'object' && !Array.isArray(a) ? a : {}) };
  for (const k in b) o[k] = merge(o[k], b[k]);
  return o;
};
const round05 = x => Math.round(x * 2) / 2;

const PERIODOS = [
  { k: '1s', l: '1 semana', sig: 1, sev: 2 },
  { k: '1m', l: '1 mes', sig: 5, sev: 5 },
  { k: '3m', l: '3 meses', sig: 7.5, sev: 7.5 },
  { k: '6m', l: '6 meses', sig: 10, sev: 10 },
  { k: '6m+', l: 'Más de 6 meses', sig: 10, sev: 10 }
];

const BIO = [
  { k: 'glucosa', n: 'Glucosa en ayunas', s: 'glucosa en ayunas', u: 'mg/dL', ref: () => '70 – 99', f: v => v < 70 ? lv('low', 'Baja', '↓') : v < 100 ? lv('ok', 'Normal', '✓') : v < 126 ? lv('warn', 'Elevada (prediabetes)', '↑') : lv('crit', 'Alta (rango diabético)', '↑') },
  { k: 'hba1c', n: 'Hemoglobina glucosilada (HbA1c)', s: 'HbA1c', u: '%', ref: () => '< 5.7', f: v => v < 5.7 ? lv('ok', 'Normal', '✓') : v < 6.5 ? lv('warn', 'Prediabetes', '↑') : v < 7 ? lv('warn', 'Rango diabético', '↑') : lv('crit', 'Sobre la meta (≥ 7 %)', '↑') },
  { k: 'creatinina', n: 'Creatinina sérica', s: 'creatinina', u: 'mg/dL', ref: s => s === 'M' ? '0.7 – 1.3' : s === 'F' ? '0.6 – 1.1' : '0.6 – 1.3', f: (v, s) => s === 'M' ? rng(v, 0.7, 1.3) : s === 'F' ? rng(v, 0.6, 1.1) : rng(v, 0.6, 1.3) },
  { k: 'bun', n: 'Nitrógeno ureico (BUN)', s: 'BUN', u: 'mg/dL', ref: () => '7 – 20', f: v => rng(v, 7, 20) },
  { k: 'urea', n: 'Urea', s: 'urea', u: 'mg/dL', ref: () => '15 – 45', f: v => rng(v, 15, 45) },
  { k: 'albumina', n: 'Albúmina sérica', s: 'albúmina', u: 'g/dL', ref: () => '3.5 – 5.0', f: v => v > 5 ? lv('warn', 'Alta', '↑') : v >= 3.5 ? lv('ok', 'Normal', '✓') : v >= 2.8 ? lv('warn', 'Hipoalbuminemia leve', '↓') : v >= 2.1 ? lv('crit', 'Hipoalbuminemia moderada', '↓') : lv('crit', 'Hipoalbuminemia grave', '↓') },
  { k: 'fosforo', n: 'Fósforo sérico', s: 'fósforo', u: 'mg/dL', ref: () => '2.5 – 4.5', f: v => v < 2.5 ? lv('crit', 'Hipofosfatemia (alerta realimentación)', '↓') : v > 4.5 ? lv('warn', 'Hiperfosfatemia', '↑') : lv('ok', 'Normal', '✓') },
  { k: 'calcio', n: 'Calcio sérico', s: 'calcio', u: 'mg/dL', ref: () => '8.5 – 10.2', f: v => v < 8.5 ? lv('warn', 'Hipocalcemia', '↓') : v > 10.2 ? lv('warn', 'Hipercalcemia', '↑') : lv('ok', 'Normal', '✓') },
  { k: 'magnesio', n: 'Magnesio sérico', s: 'magnesio', u: 'mg/dL', ref: () => '1.7 – 2.4', f: v => v < 1.7 ? lv('warn', 'Hipomagnesemia', '↓') : v > 2.4 ? lv('warn', 'Hipermagnesemia', '↑') : lv('ok', 'Normal', '✓') },
  { k: 'pcr', n: 'Proteína C Reactiva (PCR)', s: 'PCR', u: 'mg/L', ref: () => '< 5.0', f: v => v > 10 ? lv('crit', 'Inflamación aguda / severa', '↑') : v > 5 ? lv('warn', 'Elevada (inflamación leve)', '↑') : lv('ok', 'Normal', '✓') },
  { k: 'colesterol', n: 'Colesterol total', s: 'colesterol total', u: 'mg/dL', ref: () => '< 200', f: v => v < 200 ? lv('ok', 'Deseable', '✓') : v < 240 ? lv('warn', 'Limítrofe', '↑') : lv('crit', 'Alto', '↑') },
  { k: 'ldl', n: 'Colesterol LDL', s: 'LDL', u: 'mg/dL', ref: () => '< 100', f: v => v < 100 ? lv('ok', 'Óptimo', '✓') : v < 130 ? lv('ok', 'Cercano al óptimo', '✓') : v < 160 ? lv('warn', 'Limítrofe alto', '↑') : v < 190 ? lv('crit', 'Alto', '↑') : lv('crit', 'Muy alto', '↑') },
  { k: 'hdl', n: 'Colesterol HDL', s: 'HDL', u: 'mg/dL', ref: s => s === 'M' ? '≥ 40' : s === 'F' ? '≥ 50' : '≥ 40 (H) / ≥ 50 (M)', f: (v, s) => { const lo = s === 'F' ? 50 : 40; return v < lo ? lv('warn', 'Bajo', '↓') : v >= 60 ? lv('ok', 'Alto (protector)', '✓') : lv('ok', 'Aceptable', '✓'); } },
  { k: 'tg', n: 'Triglicéridos', s: 'triglicéridos', u: 'mg/dL', ref: () => '< 150', f: v => v < 150 ? lv('ok', 'Normal', '✓') : v < 200 ? lv('warn', 'Limítrofe', '↑') : v < 500 ? lv('crit', 'Alto', '↑') : lv('crit', 'Muy alto', '↑') },
  { k: 'potasio', n: 'Potasio', s: 'potasio', u: 'mEq/L', ref: () => '3.5 – 5.0', f: v => rng(v, 3.5, 5.0) },
  { k: 'sodio', n: 'Sodio', s: 'sodio', u: 'mEq/L', ref: () => '135 – 145', f: v => rng(v, 135, 145) },
  { k: 'hemoglobina', n: 'Hemoglobina', s: 'hemoglobina', u: 'g/dL', ref: s => s === 'M' ? '13.5 – 17.5' : s === 'F' ? '12.0 – 15.5' : '12.0 – 17.5', f: (v, s) => s === 'M' ? rng(v, 13.5, 17.5) : s === 'F' ? rng(v, 12, 15.5) : rng(v, 12, 17.5) },
];

const SINT = [['nauseas', 'Náuseas'], ['vomito', 'Vómito'], ['diarrea', 'Diarrea'], ['estrenimiento', 'Estreñimiento'], ['disfagia', 'Disfagia'], ['odinofagia', 'Odinofagia'], ['dolor', 'Dolor abdominal'], ['distension', 'Distensión / flatulencia'], ['pirosis', 'Pirosis / reflujo'], ['hiporexia', 'Anorexia / hiporexia'], ['saciedad', 'Saciedad temprana'], ['disgeusia', 'Disgeusia (alteración del gusto)'], ['mucositis', 'Mucositis / lesiones orales'], ['masticacion', 'Dificultad para masticar']];
const PATOL = [['dm2', 'Diabetes mellitus tipo 2'], ['dm1', 'Diabetes mellitus tipo 1'], ['hta', 'Hipertensión arterial'], ['dislipidemia', 'Dislipidemia'], ['obesidad', 'Obesidad'], ['erc', 'Enfermedad renal crónica'], ['hepato', 'Hepatopatía'], ['icc', 'Insuficiencia cardíaca'], ['epoc', 'EPOC'], ['cancer', 'Cáncer'], ['gastro', 'Gastritis / enfermedad ácido-péptica'], ['celiaca', 'Celiaquía / intolerancias'], ['tiroides', 'Enfermedad tiroidea'], ['vih', 'VIH / inmunosupresión'], ['ecv', 'Enfermedad cardiovascular']];
const SEV = [['normal', 'Sin pérdida'], ['leve', 'Leve'], ['moderada', 'Moderada'], ['severa', 'Severa']];
const EDEMA = [['no', 'Ausente'], ['+', '+ (leve)'], ['++', '++ (moderado)'], ['+++', '+++ (severo)']];
const FREC = [['d', 'Diario'], ['w46', '4–6 veces/sem'], ['w13', '1–3 veces/sem'], ['r', 'Rara vez / nunca']];
const GRUPOS_FREC = [['cer', 'Cereales y tubérculos'], ['ver', 'Verduras'], ['fru', 'Frutas'], ['lac', 'Lácteos'], ['car', 'Carnes, pescado y huevo'], ['leg', 'Leguminosas'], ['gra', 'Grasas y frituras'], ['azu', 'Azúcares y bebidas azucaradas'], ['ult', 'Ultraprocesados y comida rápida']];
const INGESTA = [['', 'Sin dato'], ['>75', 'Mayor al 75 % de lo requerido'], ['50-75', 'Entre 50 y 75 %'], ['<50', 'Menor al 50 %']];

const FORMULAS = [
  { k: 'mifflin', n: 'Mifflin-St Jeor', d: 'Estima el gasto en reposo en adultos; muy usada en población general y con sobrepeso.' },
  { k: 'hb', n: 'Harris-Benedict (1919)', d: 'Ecuación clásica; puede sobrestimar el gasto en obesidad.' },
  { k: 'hbrev', n: 'Harris-Benedict revisada (Roza-Shizgal)', d: 'Actualización de 1984 de la ecuación original.' },
  { k: 'who', n: 'FAO/OMS/UNU (Schofield)', d: 'Usa solo peso, sexo y grupo de edad (18–30, 30–60, más de 60 años).' },
  { k: 'cunning', n: 'Cunningham (masa libre de grasa)', d: 'Requiere porcentaje de grasa; se calcula con los 4 pliegues (Durnin-Womersley).' },
  { k: 'kdoqi', n: 'KDOQI: enfermedad renal crónica (kcal/kg)', d: 'KDOQI 2020 sugiere 25–35 kcal/kg/día según edad, actividad y estado nutricional. No usa factores de actividad ni estrés.', kg: true, def: '30' },
  { k: 'espen', n: 'ESPEN: paciente enfermo (kcal/kg)', d: 'Referencia de 25–30 kcal/kg/día para pacientes hospitalizados o polimórbidos. No usa factores de actividad ni estrés.', kg: true, def: '27' },
  { k: 'kg', n: 'kcal/kg personalizado', d: 'Defina libremente las kcal por kilo de peso de cálculo.', kg: true, def: '25' },
];
const ACT = [['res', 'Sin factor de actividad', 1.0], ['sed', 'Sedentario', 1.2], ['lig', 'Ligera (1–3 días/sem)', 1.375], ['mod', 'Moderada (3–5 días/sem)', 1.55], ['int', 'Intensa (6–7 días/sem)', 1.725], ['muy', 'Muy intensa o trabajo físico', 1.9], ['custom', 'Personalizado', null]];
const EST = [['none', 'Sin estrés metabólico', 1.0], ['cirm', 'Cirugía menor o electiva', 1.1], ['canc', 'Cáncer o inflamación crónica', 1.2], ['frac', 'Fractura o trauma menor', 1.25], ['sepsis', 'Infección grave o sepsis', 1.3], ['trau', 'Politrauma o TCE', 1.4], ['quem', 'Quemaduras moderadas', 1.5], ['custom', 'Personalizado', null]];
const PRESETS = [{ n: 'Balanceada 15/55/30', p: 15, c: 55, l: 30 }, { n: 'Hiperproteica 25/45/30', p: 25, c: 45, l: 30 }, { n: 'Control glucémico 20/45/35', p: 20, c: 45, l: 35 }];

const GRUPOS = EXCHANGE_GROUPS.map(g => ({
  k: g.k,
  n: g.n,
  p: g.p,
  c: g.cho,
  l: g.l,
  kcal: g.kcal
}));
const PROBLEMAS = [
  ['Ingesta', ['Ingesta deficiente de energía', 'Ingesta excesiva de energía', 'Ingesta oral inadecuada', 'Ingesta inadecuada de líquidos', 'Ingesta inadecuada de proteína', 'Ingesta excesiva de proteína', 'Ingesta excesiva de carbohidratos', 'Ingesta excesiva de grasa', 'Ingesta inadecuada de fibra', 'Ingesta excesiva de sodio', 'Ingesta excesiva de alcohol', 'Aumento de las necesidades de energía o nutrientes']],
  ['Clínico', ['Dificultad para deglutir', 'Dificultad para masticar', 'Alteración de la función gastrointestinal', 'Alteración de valores de laboratorio relacionados con la nutrición', 'Interacción alimento-medicamento', 'Bajo peso', 'Pérdida de peso involuntaria', 'Sobrepeso', 'Obesidad', 'Ganancia de peso involuntaria', 'Desnutrición', 'Utilización alterada de nutrientes']],
  ['Conductual y ambiental', ['Conocimientos deficientes relacionados con la alimentación y la nutrición', 'Creencias y actitudes alimentarias inadecuadas', 'Poca disposición para el cambio en la dieta o el estilo de vida', 'Selección inadecuada de alimentos', 'Actividad física insuficiente', 'Acceso limitado a alimentos o agua']],
];
const OTRO = '__otro__';
const ETIO_SUG = ['ingesta oral limitada por náuseas, disgeusia y saciedad temprana', 'consumo frecuente de bebidas azucaradas y alimentos ricos en grasa, con baja actividad física', 'desequilibrio entre la ingesta y el gasto energético', 'conocimientos insuficientes sobre alimentación saludable', 'incremento de las necesidades por estado catabólico', 'restricciones dietéticas impuestas por la enfermedad', 'acceso limitado a alimentos', 'actividad física insuficiente'];
const REC_SUG = ['Fraccionar la alimentación en 5 tiempos de comida al día.', 'Preferir cereales integrales y tubérculos cocidos en porciones medidas.', 'Sustituir las bebidas azucaradas por agua natural.', 'Aumentar el consumo de verduras y frutas enteras.', 'Limitar el sodio a menos de 2,000 mg al día y no agregar sal en la mesa.', 'Preferir preparaciones al horno, asadas o hervidas en lugar de fritas.', 'Acompañar cada tiempo principal con una fuente de proteína de alto valor biológico.', 'Realizar al menos 150 minutos de actividad física moderada por semana, según tolerancia.', 'Registrar peso y glucosa capilar y llevar el registro a la siguiente consulta.'];

const DW = {
  M: [[17, 19, 1.1620, 0.0630], [20, 29, 1.1631, 0.0632], [30, 39, 1.1422, 0.0544], [40, 49, 1.1620, 0.0700], [50, 200, 1.1715, 0.0779]],
  F: [[17, 19, 1.1549, 0.0678], [20, 29, 1.1599, 0.0717], [30, 39, 1.1423, 0.0632], [40, 49, 1.1333, 0.0612], [50, 200, 1.1339, 0.0645]]
};

function clasifIMC(imc, edad) {
  if (imc == null) return null;
  if (edad != null && edad >= 65) {
    if (imc < 23) return lv('warn', 'Bajo peso (adulto mayor)', '↓');
    if (imc < 28) return lv('ok', 'Peso normal', '✓');
    if (imc < 32) return lv('warn', 'Sobrepeso', '↑');
    return lv('crit', 'Obesidad', '↑');
  }
  const t = [
    [16, 'Delgadez severa (grado III)', 'crit', '↓'],
    [17, 'Delgadez moderada (grado II)', 'crit', '↓'],
    [18.5, 'Delgadez leve (grado I)', 'warn', '↓'],
    [25, 'Peso normal', 'ok', '✓'],
    [30, 'Sobrepeso', 'warn', '↑'],
    [35, 'Obesidad grado I', 'warn', '↑'],
    [40, 'Obesidad grado II', 'crit', '↑'],
    [Infinity, 'Obesidad grado III', 'crit', '↑']
  ];
  const r = t.find(x => imc < x[0]);
  return lv(r[2], r[1], r[3]);
}
const gv = (p, g) => {
  const o = (p.plan.vals && p.plan.vals[g.k]) || {};
  const pick = f => {
    const n = num(o[f]);
    return n == null ? g[f] : n;
  };
  const P = pick('p'), C = pick('c'), L = pick('l');
  const hasCustom = (o.p !== undefined && o.p !== '') || (o.c !== undefined && o.c !== '') || (o.l !== undefined && o.l !== '');
  const kcal = hasCustom ? (4 * P + 4 * C + 9 * L) : (g.kcal ?? (4 * P + 4 * C + 9 * L));
  return { P, C, L, kcal };
};

function planTotals(p) {
  const eqs = p.plan.eq || {};
  const rows = GRUPOS.map(g => {
    const v = gv(p, g);
    const eq = MEALS.map((m, i) => num((eqs[g.k] || [])[i]) || 0);
    const tot = eq.reduce((a, b) => a + b, 0);
    return { g, v, eq, tot, kcal: tot * v.kcal, P: tot * v.P, C: tot * v.C, L: tot * v.L };
  });
  const meal = MEALS.map((m, i) => {
    const s = { kcal: 0, P: 0, C: 0, L: 0 };
    rows.forEach(r => {
      s.kcal += r.eq[i] * r.v.kcal;
      s.P += r.eq[i] * r.v.P;
      s.C += r.eq[i] * r.v.C;
      s.L += r.eq[i] * r.v.L;
    });
    return s;
  });
  const tot = { kcal: 0, P: 0, C: 0, L: 0, eq: 0 };
  rows.forEach(r => {
    tot.kcal += r.kcal;
    tot.P += r.P;
    tot.C += r.C;
    tot.L += r.L;
    tot.eq += r.tot;
  });
  return { rows, meal, tot };
}

function calc(p) {
  const g = p.gen, a = p.antro, r = p.req, d = p.dieta, cl = p.clin;
  const edad = num(g.edad), sexo = g.sexo || '';
  const peso = num(a.peso), talla = num(a.talla), hab = num(a.habitual);
  const o = { edad, sexo, peso, talla, hab };
  const h = talla > 0 ? talla / 100 : null;
  o.imc = peso > 0 && h ? peso / (h * h) : null;
  o.imcCl = clasifIMC(o.imc, edad);
  o.imcEscala = edad != null && edad >= 65 ? 'OPS, adulto mayor' : 'OMS, adulto';
  const per = PERIODOS.find(x => x.k === a.periodo) || PERIODOS[2];
  o.per = per;
  o.cambio = peso > 0 && hab > 0 ? (hab - peso) / hab * 100 : null;
  o.cambioCl = null;
  if (o.cambio != null) {
    o.cambioCl = o.cambio > per.sev ? lv('crit', 'Pérdida severa', '↓') : o.cambio >= per.sig ? lv('warn', 'Pérdida significativa', '↓') : o.cambio > 0 ? lv('ok', 'Pérdida no significativa', '✓') : lv('ok', 'Sin pérdida', '✓');
  }
  o.rango = h ? [18.5 * h * h, 24.9 * h * h] : null;
  o.pi = null;
  if (talla > 0 && (sexo === 'M' || sexo === 'F')) {
    const inch = talla / 2.54;
    o.pi = sexo === 'M' ? 48 + 2.7 * (inch - 60) : 45.5 + 2.3 * (inch - 60);
  }
  o.pctPI = o.pi && peso ? peso / o.pi * 100 : null;
  o.pAj = o.pi && peso ? (peso > o.pi ? o.pi + 0.25 * (peso - o.pi) : peso) : null;
  const cint = num(a.cintura), cad = num(a.cadera);
  o.cintura = cint;
  o.cinturaCl = null;
  if (cint != null && sexo) {
    const t = sexo === 'M' ? [94, 102] : [80, 88];
    o.cinturaCl = cint >= t[1] ? lv('crit', 'Riesgo muy aumentado', '↑') : cint >= t[0] ? lv('warn', 'Riesgo aumentado', '↑') : lv('ok', 'Sin riesgo', '✓');
  }
  o.icc = cint && cad ? cint / cad : null;
  o.iccCl = null;
  if (o.icc != null && sexo) {
    const lim = sexo === 'M' ? 0.90 : 0.85;
    o.iccCl = o.icc > lim ? lv('warn', 'Obesidad abdominal', '↑') : lv('ok', 'Normal', '✓');
  }

  // Antropometría muscular y Heymsfield AMBc
  const cb = num(a.cb), tri = num(a.pct);
  o.cmb = cb != null && tri != null ? cb - Math.PI * tri / 10 : null;
  o.amb = o.cmb != null ? o.cmb * o.cmb / (4 * Math.PI) : null;
  o.ambc = null;
  if (o.amb != null && (sexo === 'M' || sexo === 'F')) {
    o.ambc = sexo === 'M' ? Math.max(0, o.amb - 10) : Math.max(0, o.amb - 6.5);
  }

  const pl = [a.pct, a.pbi, a.psub, a.psup].map(num);
  o.sum4 = pl.every(x => x != null) ? pl.reduce((s, x) => s + x, 0) : null;
  o.gc = null;
  if (o.sum4 > 0 && edad != null && edad >= 17 && sexo) {
    const row = DW[sexo].find(q => edad >= q[0] && edad <= q[1]);
    if (row) {
      const D = row[2] - row[3] * Math.log10(o.sum4);
      o.gc = 495 / D - 450;
    }
  }
  o.mg = o.gc != null && peso ? peso * o.gc / 100 : null;
  o.mlg = o.mg != null ? peso - o.mg : null;

  // peso de cálculo
  o.wCalc = r.pesoBase === 'ideal' ? o.pi : r.pesoBase === 'ajustado' ? o.pAj : peso;

  // bioquímica básica
  o.bio = BIO.map(b => {
    const v = num(p.bio[b.k]);
    return { k: b.k, n: b.n, s: b.s, u: b.u, ref: b.ref(sexo), v, flag: v == null ? null : b.f(v, sexo) };
  });

  // TFG estimada (CKD-EPI 2021)
  const cr = num(p.bio.creatinina);
  o.egfr = null;
  o.egfrStage = null;
  o.egfrFlag = null;
  if (cr != null && cr > 0 && edad != null && edad >= 18 && (sexo === 'M' || sexo === 'F')) {
    const isFem = sexo === 'F';
    const kappa = isFem ? 0.7 : 0.9;
    const alpha = isFem ? -0.241 : -0.302;
    const crK = cr / kappa;
    const minCr = Math.min(crK, 1);
    const maxCr = Math.max(crK, 1);
    const egfrVal = 142 * Math.pow(minCr, alpha) * Math.pow(maxCr, -1.200) * Math.pow(0.9938, edad) * (isFem ? 1.012 : 1.0);
    o.egfr = egfrVal;

    if (egfrVal >= 90) {
      o.egfrStage = 'Estadio G1 (Normal / Alto)';
      o.egfrFlag = lv('ok', '≥ 90 mL/min (G1 · Normal)', '✓');
    } else if (egfrVal >= 60) {
      o.egfrStage = 'Estadio G2 (Levemente disminuida)';
      o.egfrFlag = lv('ok', '60–89 mL/min (G2 · Leve)', '✓');
    } else if (egfrVal >= 45) {
      o.egfrStage = 'Estadio G3a (Disminución leve-moderada)';
      o.egfrFlag = lv('warn', '45–59 mL/min (G3a)', '↓');
    } else if (egfrVal >= 30) {
      o.egfrStage = 'Estadio G3b (Disminución moderada-grave)';
      o.egfrFlag = lv('warn', '30–44 mL/min (G3b)', '↓');
    } else if (egfrVal >= 15) {
      o.egfrStage = 'Estadio G4 (Disminución grave)';
      o.egfrFlag = lv('crit', '15–29 mL/min (G4 · Grave)', '↓');
    } else {
      o.egfrStage = 'Estadio G5 (Falla renal terminal)';
      o.egfrFlag = lv('crit', '< 15 mL/min (G5 · Falla)', '↓');
    }
  }

  // Calcio Corregido por Albúmina
  const ca = num(p.bio.calcio);
  const alb = num(p.bio.albumina);
  o.caCorregido = null;
  o.caCorregidoFlag = null;
  if (ca != null) {
    if (alb != null && alb < 4.0) {
      o.caCorregido = ca + 0.8 * (4.0 - alb);
    } else {
      o.caCorregido = ca;
    }
    o.caCorregidoFlag = o.caCorregido < 8.5 ? lv('warn', 'Hipocalcemia corregida', '↓') : o.caCorregido > 10.2 ? lv('warn', 'Hipercalcemia corregida', '↑') : lv('ok', 'Normal', '✓');
  }

  // Gasto energético
  const F = r.formula, W = o.wCalc, A = edad, M = sexo === 'M';
  o.kgMode = !!(FORMULAS.find(x => x.k === F) || {}).kg;
  let geb = null;
  if (F === 'mifflin' && W && talla && A != null && sexo) geb = 10 * W + 6.25 * talla - 5 * A + (M ? 5 : -161);
  else if (F === 'hb' && W && talla && A != null && sexo) geb = M ? 66.5 + 13.75 * W + 5.003 * talla - 6.775 * A : 655.1 + 9.563 * W + 1.850 * talla - 4.676 * A;
  else if (F === 'hbrev' && W && talla && A != null && sexo) geb = M ? 88.362 + 13.397 * W + 4.799 * talla - 5.677 * A : 447.593 + 9.247 * W + 3.098 * talla - 4.330 * A;
  else if (F === 'who' && W && A != null && sexo) { geb = A < 30 ? (M ? 15.057 * W + 692.2 : 14.818 * W + 486.6) : A <= 60 ? (M ? 11.472 * W + 873.1 : 8.126 * W + 845.6) : (M ? 11.711 * W + 587.7 : 9.082 * W + 658.5); }
  else if (F === 'cunning' && peso && o.gc != null) geb = 500 + 22 * peso * (1 - o.gc / 100);
  else if (o.kgMode) { const k = num(r.kcalkg); if (W && k) geb = k * W; }
  o.geb = geb;
  o.af = num(r.actVal) ?? 1;
  o.fe = num(r.estVal) ?? 1;
  o.get = geb == null ? null : o.kgMode ? geb : geb * o.af * o.fe;
  o.ajuste = num(r.ajuste) || 0;
  o.vct = o.get == null ? null : o.get + o.ajuste;
  o.kcalkg = o.vct && W ? o.vct / W : null;

  // Macronutrientes
  o.macros = null;
  if (o.vct && W) {
    const m = {};
    if (r.modo === 'pct') {
      const q = { p: num(r.pct.p) || 0, c: num(r.pct.c) || 0, l: num(r.pct.l) || 0 };
      m.p = { pct: q.p, kcal: o.vct * q.p / 100 };
      m.c = { pct: q.c, kcal: o.vct * q.c / 100 };
      m.l = { pct: q.l, kcal: o.vct * q.l / 100 };
    } else {
      const q = { p: num(r.gkg.p) || 0, c: num(r.gkg.c) || 0, l: num(r.gkg.l) || 0 };
      m.p = { kcal: q.p * W * 4 };
      m.c = { kcal: q.c * W * 4 };
      m.l = { kcal: q.l * W * 9 };
      ['p', 'c', 'l'].forEach(k => { m[k].pct = m[k].kcal / o.vct * 100; });
    }
    m.p.g = m.p.kcal / 4;
    m.c.g = m.c.kcal / 4;
    m.l.g = m.l.kcal / 9;
    ['p', 'c', 'l'].forEach(k => { m[k].gkg = m[k].g / W; });
    m.totalKcal = m.p.kcal + m.c.kcal + m.l.kcal;
    m.totalPct = m.p.pct + m.c.pct + m.l.pct;
    m.diff = m.totalKcal - o.vct;
    m.okTotal = Math.abs(m.diff) <= Math.max(25, o.vct * 0.01);
    o.macros = m;
  }
  o.fibra = o.vct ? o.vct / 1000 * 14 : null;
  const liq = num(r.liq);
  o.liquidos = liq && peso ? liq * peso : null;

  // Dieta
  const ke = num(d.kcalEst), pe = num(d.protEst);
  o.adecKcal = ke != null && o.vct ? ke / o.vct * 100 : null;
  o.adecProt = pe != null && o.macros ? pe / o.macros.p.g * 100 : null;

  // Tamizaje (criterios ASPEN/AND)
  const crit = [];
  let datos = 0;
  if (d.ingesta) { datos++; if (d.ingesta !== '>75') crit.push('Ingesta energética insuficiente'); }
  if (o.cambio != null) { datos++; if (o.cambio >= per.sig) crit.push('Pérdida de peso significativa'); }
  datos++;
  if (cl.grasa && cl.grasa !== 'normal') crit.push('Pérdida de grasa subcutánea');
  if (cl.musculo && cl.musculo !== 'normal') crit.push('Pérdida de masa muscular');
  if ((cl.edema && cl.edema !== 'no') || cl.ascitis === 'si') crit.push('Acumulación de líquidos');
  if (cl.fuerza) { datos++; if (cl.fuerza === 'disminuida') crit.push('Fuerza de prensión disminuida'); }

  const extra = [];
  if ((o.imc != null && o.imcCl && o.imcCl.label.toLowerCase().includes('bajo peso')) || (o.imc != null && o.imc < 18.5)) extra.push('IMC en rango de bajo peso');
  if (alb != null && alb < 3.5) extra.push('Albúmina baja (marcador de inflamación sistémica)');

  o.tamizaje = {
    crit,
    n: crit.length,
    extra,
    msg: crit.length >= 2 ? 'Cumple 2 o más de las 6 características: compatible con desnutrición (criterios ASPEN/AND). Confirme con el juicio clínico.' : crit.length === 1 ? 'Cumple 1 característica. Vigile la evolución y reevalúe.' : 'Sin características de desnutrición con los datos ingresados.',
    level: crit.length >= 2 ? 'crit' : crit.length === 1 ? 'warn' : 'ok'
  };

  // Alerta de Síndrome de Realimentación (Criterios NICE / ASPEN)
  const pFos = num(p.bio.fosforo);
  const pK = num(p.bio.potasio);
  const pMg = num(p.bio.magnesio);
  const refeedingReasons = [];
  let majorCriteria = 0;
  let minorCriteria = 0;

  if (o.imc != null && o.imc < 16) { majorCriteria++; refeedingReasons.push(`IMC extremadamente bajo (${f1(o.imc)} kg/m² < 16)`); }
  else if (o.imc != null && o.imc < 18.5) { minorCriteria++; refeedingReasons.push(`IMC en bajo peso (${f1(o.imc)} kg/m² < 18.5)`); }

  if (o.cambio != null && o.cambio > 15) { majorCriteria++; refeedingReasons.push(`Pérdida de peso severa (${f1(o.cambio)} % en ${per.l})`); }
  else if (o.cambio != null && o.cambio >= 10) { minorCriteria++; refeedingReasons.push(`Pérdida de peso moderada (${f1(o.cambio)} % en ${per.l})`); }

  if (d.ingesta === '<50') { majorCriteria++; refeedingReasons.push('Ingesta alimentaria muy deficiente (< 50 %)'); }
  else if (d.ingesta === '50-75') { minorCriteria++; refeedingReasons.push('Ingesta alimentaria reducida (50–75 %)'); }

  if ((pFos != null && pFos < 2.5) || (pK != null && pK < 3.5) || (pMg != null && pMg < 1.7)) {
    majorCriteria++;
    refeedingReasons.push('Electrolitos séricos basales disminuidos (Fósforo, Potasio o Magnesio)');
  }

  const isHighRefeeding = majorCriteria >= 1 || minorCriteria >= 2;
  o.refeeding = {
    isRisk: isHighRefeeding,
    level: isHighRefeeding ? 'crit' : 'ok',
    reasons: refeedingReasons
  };

  o.plan = planTotals(p);
  return o;
}

function evidencias(p, o) {
  const E = [];
  if (o.imc != null && o.imcCl) E.push(`IMC ${f1(o.imc)} kg/m² (${o.imcCl.label.toLowerCase()})`);
  if (o.cambio != null && o.cambio > 0) E.push(`pérdida de peso de ${f1(o.cambio)} % en ${o.per.l.toLowerCase()}`);
  if (o.cintura != null) E.push(`circunferencia de cintura de ${f0(o.cintura)} cm${o.cinturaCl && o.cinturaCl.level !== 'ok' ? ' (' + o.cinturaCl.label.toLowerCase() + ')' : ''}`);
  if (o.egfr != null) E.push(`TFG estimada ${f0(o.egfr)} mL/min/1.73m² (${o.egfrStage})`);
  o.bio.forEach(b => {
    if (b.v != null && b.flag && b.flag.level !== 'ok') E.push(`${b.s} ${b.v} ${b.u} (${b.flag.label.toLowerCase()})`);
  });
  if (o.adecKcal != null) E.push(`ingesta energética estimada de ${f0(num(p.dieta.kcalEst))} kcal/día (${f0(o.adecKcal)} % del VCT)`);
  else if (p.dieta.ingesta && p.dieta.ingesta !== '>75') E.push(`ingesta ${p.dieta.ingesta === '<50' ? 'menor al 50 %' : 'entre 50 y 75 %'} de lo requerido`);
  const s = SINT.filter(x => p.clin.sint[x[0]]).map(x => x[1].toLowerCase());
  if (s.length) E.push('síntomas: ' + s.join(', '));
  if (p.clin.musculo && p.clin.musculo !== 'normal') E.push(`pérdida de masa muscular ${p.clin.musculo}`);
  if (p.clin.grasa && p.clin.grasa !== 'normal') E.push(`pérdida de grasa subcutánea ${p.clin.grasa}`);
  if (p.clin.edema && p.clin.edema !== 'no') E.push(`edema ${p.clin.edema}`);
  return E;
}

const pesText = it => {
  const pr = it.problema === OTRO ? (it.custom || '') : it.problema;
  const clean = s => (s || '').trim().replace(/[.;,\s]+$/, '');
  return `${clean(pr) || '[problema]'} relacionado con ${clean(it.etio) || '[etiología]'}, evidenciado por ${clean(it.signos) || '[signos y síntomas]'}.`;
};

function split05(total, w) {
  const units = Math.round(total * 2);
  const sw = w.reduce((a, b) => a + b, 0);
  if (!units || !sw) return w.map(() => 0);
  const raw = w.map(x => x / sw * units);
  const fl = raw.map(Math.floor);
  const rest = units - fl.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]);
  for (let j = 0; j < rest; j++) fl[order[j % order.length][1]]++;
  return fl.map(u => u / 2);
}

function suggestPlan(o) {
  const m = o.macros;
  if (!m) return null;
  const kc = o.vct;
  const leche_sd = kc >= 1800 ? 2 : 1;
  const veg_sa = kc >= 2000 ? 4 : 3;
  const frutas = kc >= 1800 ? 3 : 2;

  const choStep1 = leche_sd * 12 + veg_sa * 5 + frutas * 15;
  const pStep1 = leche_sd * 8 + veg_sa * 2;
  const lStep1 = leche_sd * 5;

  const almidones = Math.max(1, Math.round(Math.max(0, m.c.g - choStep1) / 15));
  const pCum2 = pStep1 + almidones * 3;
  const lCum2 = lStep1 + almidones * 1;

  const totalProt = Math.max(1, Math.round(Math.max(0, m.p.g - pCum2) / 7));
  const prot_sm = Math.min(totalProt, Math.max(1, Math.floor(totalProt * 0.5)));
  const prot_magra = Math.max(0, totalProt - prot_sm);

  const lCum3 = lCum2 + prot_magra * 2 + prot_sm * 5;
  const grasas = Math.max(0, Math.round(Math.max(0, m.l.g - lCum3) / 5));

  const tot = {
    incaparina: 0,
    leche_dc: 0,
    leche_sd,
    leche_entera: 0,
    veg_sa,
    frutas,
    almidones,
    otros_cho: 0,
    prot_magra,
    prot_sm,
    prot_grasa: 0,
    grasas,
    alcohol: 0
  };

  const W = {
    incaparina: [0.5, 0.25, 0, 0, 0.25],
    leche_dc: [0.45, 0.15, 0, 0.15, 0.25],
    leche_sd: [0.45, 0.15, 0, 0.15, 0.25],
    leche_entera: [0.5, 0.2, 0, 0, 0.3],
    veg_sa: [0.25, 0, 0.45, 0, 0.30],
    frutas: [0.30, 0.35, 0, 0.35, 0],
    almidones: [0.32, 0.07, 0.31, 0.07, 0.23],
    otros_cho: [0.3, 0.3, 0.2, 0.2, 0],
    prot_magra: [0.25, 0, 0.45, 0, 0.30],
    prot_sm: [0.35, 0, 0.35, 0, 0.30],
    prot_grasa: [0.4, 0, 0.3, 0, 0.3],
    grasas: [0.35, 0.05, 0.32, 0.05, 0.23],
    alcohol: [0, 0, 0.5, 0, 0.5]
  };

  const eq = {};
  for (const k in tot) {
    eq[k] = split05(tot[k], W[k]).map(x => x ? String(x) : '');
  }
  return eq;
}

const blankPatient = () => ({
  id: uid(),
  ejemplo: false,
  gen: { nombre: '', edad: '', sexo: '', fecha: today(), expediente: '', dx: '', motivo: '', meds: '', antecedentes: '' },
  antro: { peso: '', talla: '', habitual: '', periodo: '3m', cintura: '', cadera: '', cb: '', pct: '', pbi: '', psub: '', psup: '' },
  bio: { glucosa: '', hba1c: '', creatinina: '', bun: '', urea: '', albumina: '', fosforo: '', calcio: '', magnesio: '', pcr: '', colesterol: '', ldl: '', hdl: '', tg: '', potasio: '', sodio: '', hemoglobina: '' },
  clin: { sint: {}, pat: {}, musculo: 'normal', grasa: 'normal', edema: 'no', ascitis: 'no', fuerza: '', hidratacion: '', piel: '', oral: '', otros: '' },
  dieta: { rec: {}, ingesta: '', kcalEst: '', protEst: '', agua: '', alcohol: '', tabaco: '', suplementos: '', alergias: '', apetito: '', actividad: '', frec: {}, notas: '' },
  req: { formula: 'mifflin', pesoBase: 'real', kcalkg: '30', actKey: 'sed', actVal: '1.2', estKey: 'none', estVal: '1', ajuste: '0', modo: 'pct', pct: { p: '15', c: '55', l: '30' }, gkg: { p: '1', c: '4', l: '1' }, liq: '30' },
  pes: { items: [] },
  plan: { totals: {}, eq: {}, vals: {}, menu: {}, objetivos: '', recs: '', indicadores: '', proxima: '', seg: [] },
});

function seedPatients() {
  const mk = o => merge(blankPatient(), o);
  const a = mk({
    ejemplo: true,
    gen: { nombre: 'María Elena Rivas', edad: '54', sexo: 'F', expediente: 'EJ-0001', dx: 'Diabetes mellitus tipo 2, obesidad grado I e hipertensión arterial', motivo: 'Control glucémico y reducción de peso', meds: 'Metformina 850 mg cada 12 h; losartán 50 mg al día', antecedentes: 'Madre con diabetes tipo 2.' },
    antro: { peso: '78.5', talla: '158', habitual: '81', periodo: '3m', cintura: '98', cadera: '108', cb: '31', pct: '24', pbi: '12', psub: '28', psup: '30' },
    bio: { glucosa: '142', hba1c: '7.8', creatinina: '0.8', bun: '14', urea: '30', albumina: '4.1', fosforo: '3.6', calcio: '9.4', magnesio: '2.0', pcr: '6.2', colesterol: '218', ldl: '138', hdl: '44', tg: '195', potasio: '4.2', sodio: '139', hemoglobina: '12.8' },
    clin: { sint: { pirosis: true, distension: true }, pat: { dm2: true, hta: true, dislipidemia: true, obesidad: true }, fuerza: 'normal', hidratacion: 'normal' },
    dieta: { rec: { des: { hora: '07:00', txt: '2 tortillas de maíz, 1 huevo revuelto con aceite, 1 taza de café con 2 cucharadas de azúcar' }, c1: { hora: '10:00', txt: '1 pan dulce y 1 gaseosa de 355 mL' }, alm: { hora: '13:00', txt: '1 taza de arroz, 1 muslo de pollo frito, ensalada pequeña, 1 vaso de refresco natural con azúcar' }, c2: { hora: '16:30', txt: '1 banano' }, cen: { hora: '19:30', txt: '3 pupusas de queso con curtido, 1 taza de café con azúcar' } }, ingesta: '>75', kcalEst: '2300', protEst: '78', agua: '4 vasos al día', alcohol: 'No', tabaco: 'No', suplementos: 'Ninguno', alergias: 'Ninguna conocida', apetito: 'Conservado', actividad: 'Caminata ocasional, menos de 30 min, 2 veces por semana', frec: { cer: 'd', ver: 'w13', fru: 'w13', lac: 'w13', car: 'd', leg: 'w13', gra: 'd', azu: 'd', ult: 'w13' } },
    req: { formula: 'mifflin', pesoBase: 'real', actKey: 'lig', actVal: '1.375', ajuste: '-400', modo: 'pct', pct: { p: '20', c: '45', l: '35' } },
    pes: {
      items: [
        { id: uid(), problema: 'Obesidad', custom: '', etio: 'consumo frecuente de bebidas azucaradas y alimentos ricos en grasa, con baja actividad física', signos: 'IMC 31.4 kg/m²; circunferencia de cintura de 98 cm; HbA1c 7.8 %; ingesta estimada de 2,300 kcal/día' },
        { id: uid(), problema: 'Conocimientos deficientes relacionados con la alimentación y la nutrición', custom: '', etio: 'falta de orientación nutricional previa para el manejo de la diabetes', signos: 'consumo diario de azúcares simples y porciones grandes de carbohidratos; glucosa en ayunas de 142 mg/dL' },
      ]
    },
    plan: {
      objetivos: 'Mejorar el control glucémico (HbA1c menor de 7 %), reducir entre 5 y 7 % del peso corporal en 6 meses y mejorar el perfil lipídico.',
      recs: 'Fraccionar la alimentación en 5 tiempos de comida al día.\nSustituir las bebidas azucaradas por agua natural.\nPreferir cereales integrales y tubérculos cocidos en porciones medidas.\nPreferir preparaciones al horno, asadas o hervidas en lugar de fritas.',
      indicadores: 'Peso, circunferencia de cintura, glucosa capilar en ayunas, HbA1c a los 3 meses y perfil lipídico.',
      proxima: '2026-11-10',
      menu: { des: '2 tortillas de maíz, 1 huevo cocido, ½ taza de frijoles, café sin azúcar', c1: '1 manzana pequeña', alm: '½ taza de arroz, 90 g de pollo a la plancha, ensalada libre, agua natural', c2: '1 yogur natural descremado', cen: '2 pupusas de frijol con queso, curtido, té sin azúcar' },
      seg: [{ id: uid(), fecha: '2026-07-14', peso: '81.0', nota: 'Consulta inicial' }, { id: uid(), fecha: '2026-09-01', peso: '79.8', nota: 'Inicio del plan de alimentación' }]
    }
  });
  a.plan.eq = suggestPlan(calc(a));
  const b = mk({
    ejemplo: true,
    gen: { nombre: 'Carlos Alberto Méndez', edad: '71', sexo: 'M', expediente: 'EJ-0002', dx: 'Enfermedad renal crónica estadio 4 sin diálisis e hipertensión arterial', motivo: 'Pérdida de peso y disminución del apetito en los últimos 3 meses', meds: 'Amlodipino 5 mg al día; carbonato de calcio; eritropoyetina' },
    antro: { peso: '58', talla: '170', habitual: '66', periodo: '3m', cintura: '84', cadera: '94', cb: '24', pct: '8', pbi: '5', psub: '10', psup: '9' },
    bio: { glucosa: '96', hba1c: '5.6', creatinina: '3.4', bun: '58', urea: '124', albumina: '3.0', fosforo: '5.2', calcio: '8.2', magnesio: '2.1', pcr: '12.5', colesterol: '170', ldl: '92', hdl: '38', tg: '140', potasio: '5.3', sodio: '138', hemoglobina: '10.2' },
    clin: { sint: { nauseas: true, hiporexia: true, disgeusia: true, saciedad: true }, pat: { erc: true, hta: true }, musculo: 'moderada', grasa: 'leve', edema: '+', ascitis: 'no', fuerza: 'disminuida', hidratacion: 'normal' },
    dieta: { rec: { des: { hora: '07:30', txt: '1 pan francés con frijoles molidos, café sin azúcar' }, alm: { hora: '13:00', txt: '½ taza de arroz, 1 trozo pequeño de pollo guisado, ½ tortilla' }, cen: { hora: '19:00', txt: '1 taza de atol de maíz y 1 pan' } }, ingesta: '<50', kcalEst: '1100', protEst: '38', agua: '1 litro al día (restricción indicada)', alcohol: 'No', tabaco: 'Exfumador', apetito: 'Muy disminuido, con saciedad temprana', actividad: 'Sedentario; camina dentro de casa', frec: { cer: 'd', ver: 'w13', fru: 'r', lac: 'w13', car: 'w46', leg: 'w46', gra: 'w13', azu: 'r', ult: 'w13' } },
    req: { formula: 'kdoqi', kcalkg: '32', actKey: 'sed', actVal: '1.2', ajuste: '0', modo: 'gkg', gkg: { p: '0.8', c: '4.95', l: '1' }, liq: '17' },
    pes: {
      items: [
        { id: uid(), problema: 'Ingesta oral inadecuada', custom: '', etio: 'náuseas, disgeusia y saciedad temprana asociadas a uremia', signos: 'ingesta estimada menor al 50 % de los requerimientos; pérdida de peso de 12.1 % en 3 meses; albúmina 3.0 g/dL' },
        { id: uid(), problema: 'Alteración de valores de laboratorio relacionados con la nutrición', custom: '', etio: 'disminución de la función renal', signos: 'creatinina 3.4 mg/dL; BUN 58 mg/dL; potasio 5.3 mEq/L' },
      ]
    },
    plan: { objetivos: 'Frenar la pérdida de peso, cubrir al menos el 90 % de los requerimientos y controlar potasio y fósforo.', recs: 'Fraccionar la alimentación en 5 o 6 tiempos pequeños.\nAcompañar cada tiempo principal con una fuente de proteína de alto valor biológico.\nLimitar alimentos ricos en potasio y fósforo según indicación del nefrólogo.\nRegistrar peso y glucosa capilar y llevar el registro a la siguiente consulta.', indicadores: 'Peso, ingesta (recordatorio), albúmina, potasio, fósforo y hemoglobina.', proxima: '2026-10-27' }
  });
  b.plan.eq = suggestPlan(calc(b));
  return [a, b];
}

function migrateLegacyPlan(pt) {
  const eq = pt.plan && pt.plan.eq;
  if (!eq) return pt;
  const legacyMap = {
    cer: 'almidones',
    ver: 'veg_sa',
    fru: 'frutas',
    aoa: 'prot_magra',
    lac: 'leche_sd',
    gra: 'grasas',
    azu: 'otros_cho'
  };
  let migrated = false;
  const newEq = { ...eq };
  for (const oldK in legacyMap) {
    if (Array.isArray(eq[oldK]) && eq[oldK].some(Boolean)) {
      const newK = legacyMap[oldK];
      if (!newEq[newK] || !newEq[newK].some(Boolean)) {
        newEq[newK] = eq[oldK];
      }
      delete newEq[oldK];
      migrated = true;
    }
  }
  if (migrated) {
    return { ...pt, plan: { ...pt.plan, eq: newEq } };
  }
  return pt;
}

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.patients) && s.patients.length) {
        const patients = s.patients.map(x => migrateLegacyPlan(merge(blankPatient(), x)));
        return { patients, activeId: patients.some(x => x.id === s.activeId) ? s.activeId : patients[0].id };
      }
    }
  } catch (e) {
    // Ignore error
  }
  const patients = seedPatients();
  return { patients, activeId: patients[0].id };
}

function reportText(p, o) {
  const L = [];
  const g = p.gen;
  const lab = (map, list) => list.filter(x => map[x[0]]).map(x => x[1]);
  L.push('FICHA DE VALORACIÓN Y PLAN NUTRICIONAL');
  L.push(`Paciente: ${g.nombre || '—'} | Edad: ${g.edad || '—'} años | Sexo: ${g.sexo === 'M' ? 'Masculino' : g.sexo === 'F' ? 'Femenino' : '—'} | Fecha: ${g.fecha || '—'}`);
  L.push(`Diagnóstico médico: ${g.dx || '—'}`);
  L.push(`Motivo de consulta: ${g.motivo || '—'}`);
  L.push('');
  L.push('A. ANTROPOMETRÍA');
  L.push(`Peso ${p.antro.peso || '—'} kg | Talla ${p.antro.talla || '—'} cm | Peso habitual ${p.antro.habitual || '—'} kg`);
  L.push(`IMC ${f1(o.imc)} kg/m²${o.imcCl ? ' (' + o.imcCl.label + ')' : ''}`);
  if (o.cambio != null) L.push(`Cambio de peso: ${fs(-o.cambio)} % en ${o.per.l.toLowerCase()}${o.cambioCl ? ' (' + o.cambioCl.label + ')' : ''}`);
  if (o.pi) L.push(`Peso ideal (Hamwi) ${f1(o.pi)} kg (${f0(o.pctPI)} % del ideal)`);
  if (o.cintura != null) L.push(`Cintura ${f1(o.cintura)} cm${o.cinturaCl ? ' (' + o.cinturaCl.label + ')' : ''}${o.icc != null ? ' | ICC ' + f2(o.icc) : ''}`);
  if (o.cmb != null) L.push(`CMB ${f1(o.cmb)} cm | AMB ${f1(o.amb)} cm²${o.ambc != null ? ' | AMBc (Heymsfield) ' + f1(o.ambc) + ' cm²' : ''}`);
  if (o.gc != null) L.push(`Grasa corporal estimada (Durnin-Womersley) ${f1(o.gc)} %`);
  L.push('');
  L.push('B. BIOQUÍMICA');
  if (o.egfr != null) L.push(`Tasa de Filtración Glomerular (CKD-EPI 2021): ${f1(o.egfr)} mL/min/1.73m² (${o.egfrStage})`);
  if (o.caCorregido != null) L.push(`Calcio corregido por albúmina: ${f1(o.caCorregido)} mg/dL (${o.caCorregidoFlag.label})`);
  const bs = o.bio.filter(b => b.v != null);
  if (!bs.length) L.push('Sin datos de laboratorio.');
  bs.forEach(b => L.push(`${b.n}: ${b.v} ${b.u} (ref. ${b.ref}) ${b.flag.dir} ${b.flag.label}`));
  L.push('');
  L.push('C. CLÍNICA');
  L.push(`Síntomas digestivos: ${lab(p.clin.sint, SINT).join(', ') || 'ninguno referido'}`);
  L.push(`Patologías coexistentes: ${lab(p.clin.pat, PATOL).join(', ') || 'ninguna registrada'}`);
  L.push(`Exploración física: masa muscular ${p.clin.musculo}; grasa subcutánea ${p.clin.grasa}; edema ${p.clin.edema === 'no' ? 'ausente' : p.clin.edema}; ascitis ${p.clin.ascitis === 'si' ? 'presente' : 'ausente'}`);
  L.push(`Tamizaje desnutrición: ${o.tamizaje.msg}`);
  if (o.refeeding.isRisk) L.push(`ALERTA: Alto riesgo de Síndrome de Realimentación detectado (${o.refeeding.reasons.join('; ')}).`);
  L.push('');
  L.push('D. DIETÉTICA');
  RECALL.forEach(([k, n]) => {
    const r = p.dieta.rec[k];
    if (r && (r.txt || r.hora)) L.push(`${n}${r.hora ? ' (' + r.hora + ')' : ''}: ${r.txt || ''}`);
  });
  if (o.adecKcal != null) L.push(`Ingesta estimada ${f0(num(p.dieta.kcalEst))} kcal (${f0(o.adecKcal)} % del VCT)`);
  L.push('');
  L.push('DIAGNÓSTICO NUTRICIONAL (PES)');
  if (!p.pes.items.length) L.push('Sin diagnósticos registrados.');
  p.pes.items.forEach((it, i) => L.push(`${i + 1}. ${pesText(it)}`));
  L.push('');
  L.push('REQUERIMIENTOS');
  const F = FORMULAS.find(x => x.k === p.req.formula);
  L.push(`Fórmula: ${F.n}${o.kgMode ? ' (' + p.req.kcalkg + ' kcal/kg)' : ''} | Peso de cálculo: ${f1(o.wCalc)} kg`);
  if (o.geb != null) {
    L.push(`GEB ${f0(o.geb)} kcal${o.kgMode ? '' : ` × AF ${o.af} × FE ${o.fe} = GET ${f0(o.get)} kcal`} | Ajuste ${o.ajuste > 0 ? '+' : ''}${f0(o.ajuste)} kcal | VCT ${f0(o.vct)} kcal`);
  }
  if (o.macros) {
    const m = o.macros;
    L.push(`Proteínas ${f0(m.p.g)} g (${f1(m.p.pct)} %, ${f2(m.p.gkg)} g/kg) | Carbohidratos ${f0(m.c.g)} g (${f1(m.c.pct)} %) | Lípidos ${f0(m.l.g)} g (${f1(m.l.pct)} %)`);
  }
  L.push('');
  L.push('PLAN NUTRICIONAL');
  if (p.plan.objetivos) L.push('Objetivos: ' + p.plan.objetivos);
  const T = o.plan;
  T.rows.filter(r => r.tot > 0).forEach(r => L.push(`${r.g.n}: ${r.eq.map((e, i) => e ? MEALS[i][1] + ' ' + e : '').filter(Boolean).join(', ')} (total ${r.tot})`));
  if (T.tot.eq > 0) L.push(`Total del plan: ${f0(T.tot.kcal)} kcal | P ${f0(T.tot.P)} g | CHO ${f0(T.tot.C)} g | L ${f0(T.tot.L)} g`);
  MEALS.forEach(([k, n]) => {
    if (p.plan.menu[k]) L.push(`Menú ${n}: ${p.plan.menu[k]}`);
  });
  if (p.plan.recs) {
    L.push('Recomendaciones:');
    p.plan.recs.split('\n').filter(Boolean).forEach(x => L.push('- ' + x));
  }
  if (p.plan.indicadores) L.push('Indicadores de seguimiento: ' + p.plan.indicadores);
  if (p.plan.proxima) L.push('Próxima cita: ' + p.plan.proxima);
  return L.join('\n');
}
// ==== LOGIC END ====

const Ctx = createContext(null);
const useCtx = () => useContext(Ctx);
const idOf = path => 'f-' + path.replace(/\./g, '-');

function Pill({ f }) {
  if (!f) return null;
  return (
    <span className={'pill ' + f.level}>
      {f.dir && <span aria-hidden="true">{f.dir}</span>}
      {f.label}
    </span>
  );
}

function Field({ label, hint, className = '', children }) {
  return (
    <label className={'block min-w-0 ' + className}>
      <span className="lbl">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

// Sanitiza entradas numéricas (permite signo negativo solo cuando allowSigned es true, como en req.ajuste)
const sanitizeNumInput = (raw, allowSigned = false) => {
  if (raw === null || raw === undefined || raw === '') return '';
  let str = String(raw).replace(',', '.');
  if (allowSigned) {
    const isNeg = str.trim().startsWith('-');
    const cleaned = str.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const norm = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
    return (isNeg ? '-' : '') + norm;
  }
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  const norm = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
  const n = parseFloat(norm);
  if (Number.isFinite(n) && n < 0) return '0';
  return norm;
};

function In({ path, unit, num: isNum, signed, type, className = '', placeholder }) {
  const { p, set } = useCtx();
  const v = getIn(p, path);
  const allowSigned = Boolean(signed || path === 'req.ajuste');

  const handleChange = e => {
    const val = isNum ? sanitizeNumInput(e.target.value, allowSigned) : e.target.value;
    set(path, val);
  };

  const handleKeyDown = e => {
    if (isNum) {
      if (['e', 'E', '+'].includes(e.key) || (!allowSigned && e.key === '-')) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className={'relative ' + className}>
      <input
        id={idOf(path)}
        className={'inp' + (unit ? ' pr' : '')}
        value={v ?? ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        inputMode={isNum ? 'decimal' : undefined}
        type={type === 'date' ? 'date' : isNum && !allowSigned ? 'number' : 'text'}
        min={isNum && !allowSigned ? '0' : undefined}
        step={isNum && !allowSigned ? 'any' : undefined}
        placeholder={placeholder}
        autoComplete="off"
      />
      {unit && <span className="unit">{unit}</span>}
    </div>
  );
}

function Sel({ path, options, onChange }) {
  const { p, set } = useCtx();
  const v = getIn(p, path);
  return (
    <select
      id={idOf(path)}
      className="inp"
      value={v ?? ''}
      onChange={e => onChange ? onChange(e.target.value) : set(path, e.target.value)}
    >
      {options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Area({ path, rows = 3, placeholder }) {
  const { p, set } = useCtx();
  const v = getIn(p, path);
  return (
    <textarea
      id={idOf(path)}
      className="inp"
      rows={rows}
      value={v ?? ''}
      onChange={e => set(path, e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Check({ path, label }) {
  const { p, set } = useCtx();
  const v = !!getIn(p, path);
  return (
    <label className="chk">
      <input id={idOf(path)} type="checkbox" checked={v} onChange={e => set(path, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Metric({ label, value, unit, flag, note }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-line last:border-0">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {note && <div className="hint">{note}</div>}
      </div>
      <div className="flex flex-col items-end gap-1 text-right">
        <div className="num text-sm whitespace-nowrap">
          {value}{unit && <span className="text-muted text-xs ml-1">{unit}</span>}
        </div>
        <Pill f={flag} />
      </div>
    </div>
  );
}

function Stat({ label, value, unit }) {
  return (
    <div className="min-w-[4.2rem]">
      <div className="eyebrow" style={{ fontSize: '0.64rem' }}>{label}</div>
      <div className="num text-lg leading-tight">
        {value}{unit && <span className="text-xs text-muted ml-1">{unit}</span>}
      </div>
    </div>
  );
}

const TABS = [
  ['paciente', 'Paciente'],
  ['valoracion', 'Valoración ABCD'],
  ['req', 'Requerimientos'],
  ['pes', 'Diagnóstico PES'],
  ['plan', 'Plan y seguimiento'],
  ['reporte', 'Reporte']
];

function SaveStatusBadge({ saveStatus, lastSavedAt, isCloudActive }) {
  if (saveStatus === 'saving') {
    return (
      <span className="pill warn text-[11px]" role="status">
        <RefreshCw className="w-3 h-3 animate-spin" /> Guardando cambios...
      </span>
    );
  }
  if (saveStatus === 'syncing_cloud') {
    return (
      <span className="pill low text-[11px]" role="status">
        <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando con nube...
      </span>
    );
  }
  if (saveStatus === 'error') {
    return (
      <span className="pill crit text-[11px]" role="status">
        <AlertTriangle className="w-3 h-3" /> Cambios sin sincronizar en nube
      </span>
    );
  }
  if (saveStatus === 'saved_cloud' && isCloudActive) {
    return (
      <span className="pill ok text-[11px]" role="status" title="Sincronizado en navegador local y base de datos Supabase">
        <CheckCircle2 className="w-3 h-3" /> Sincronizado en nube{lastSavedAt ? ` · ${lastSavedAt}` : ''}
      </span>
    );
  }
  return (
    <span className="pill ok text-[11px]" role="status" title="Datos guardados en el almacenamiento local de este navegador">
      <CheckCircle2 className="w-3 h-3" /> Guardado localmente{lastSavedAt ? ` · ${lastSavedAt}` : ''}
    </span>
  );
}

function Header({ tab, setTab, theme, toggleTheme, onOpenCloud, isCloudActive, saveStatus, lastSavedAt }) {
  const { p, c } = useCtx();
  return (
    <header className="sticky z-30 bg-surface border-b border-line no-print" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="brandname">NutriClínica</h1>
                <span className="pill ok text-[10px] py-0.5 px-2">v2.0 Clínico</span>
                <SaveStatusBadge saveStatus={saveStatus} lastSavedAt={lastSavedAt} isCloudActive={isCloudActive} />
              </div>
              <div className="text-xs text-muted truncate mt-0.5">
                {p.gen.nombre || 'Paciente sin nombre'}{p.ejemplo ? ' · ejemplo' : ''}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="hidden sm:flex flex-wrap gap-x-5 gap-y-1">
              <Stat label="IMC" value={f1(c.imc)} unit="kg/m²" />
              <Stat label="Cambio" value={c.cambio == null ? '—' : fs(-c.cambio)} unit="%" />
              <Stat label="GEB" value={f0(c.geb)} unit="kcal" />
              <Stat label="VCT" value={f0(c.vct)} unit="kcal" />
              <Stat label="Proteína" value={c.macros ? f0(c.macros.p.g) : '—'} unit="g" />
              {c.egfr != null && <Stat label="eGFR" value={f0(c.egfr)} unit="mL/min" />}
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`btn btn-sm ${isCloudActive ? 'border-brand text-brand' : ''}`}
                onClick={onOpenCloud}
                title="Configuración de base de datos en la nube (Supabase)"
              >
                {isCloudActive ? <Cloud className="w-4 h-4 text-brand" /> : <CloudOff className="w-4 h-4 text-muted" />}
                <span className="hidden md:inline">{isCloudActive ? 'Nube Conectada' : 'Nube'}</span>
              </button>

              <button
                className="btn btn-sm"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label="Cambiar tema claro / oscuro"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-warn" /> : <Moon className="w-4 h-4 text-brand" />}
              </button>
            </div>
          </div>
        </div>

        <nav role="tablist" aria-label="Módulos" className="flex overflow-x-auto -mb-px">
          {TABS.map(([k, n], i) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              className="tab"
              onClick={() => setTab(k)}
            >
              <span className="num text-xs mr-1.5 opacity-70">{i + 1}</span>{n}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Sidebar({ state, setActive, addP, onExportJson, onImportJson, onOpenCloud, isCloudActive }) {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return state.patients;
    const q = search.toLowerCase();
    return state.patients.filter(p =>
      (p.gen.nombre && p.gen.nombre.toLowerCase().includes(q)) ||
      (p.gen.expediente && p.gen.expediente.toLowerCase().includes(q)) ||
      (p.gen.dx && p.gen.dx.toLowerCase().includes(q))
    );
  }, [state.patients, search]);

  return (
    <aside className="no-print min-w-0">
      <div className="card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="eyebrow">Pacientes ({state.patients.length})</span>
          <span className={`pill text-[10px] ${isCloudActive ? 'ok' : 'na'}`}>
            {isCloudActive ? '☁ Sincronizado' : 'Local'}
          </span>
        </div>

        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="inp text-xs pl-8 py-1.5"
            placeholder="Buscar por nombre o exp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary w-full mb-3" onClick={addP}>
          <Plus className="w-4 h-4 mr-1" /> Nuevo paciente
        </button>

        <ul className="grid gap-1.5 max-h-[19rem] overflow-y-auto mb-3">
          {filteredPatients.map(x => {
            const act = x.id === state.activeId;
            return (
              <li key={x.id}>
                <button
                  onClick={() => setActive(x.id)}
                  aria-current={act ? 'true' : undefined}
                  className="w-full text-left rounded-md px-2.5 py-2 border transition-colors"
                  style={{
                    background: act ? 'var(--brand-soft)' : 'var(--surface)',
                    borderColor: act ? 'var(--brand)' : 'var(--line)'
                  }}
                >
                  <div className="text-sm font-medium truncate">{x.gen.nombre || 'Paciente sin nombre'}</div>
                  <div className="text-xs text-muted truncate">
                    {[x.gen.expediente && `Exp: ${x.gen.expediente}`, x.gen.edad && `${x.gen.edad} a`, x.gen.sexo === 'M' ? 'M' : x.gen.sexo === 'F' ? 'F' : ''].filter(Boolean).join(' · ') || 'Sin datos'}
                  </div>
                </button>
              </li>
            );
          })}
          {filteredPatients.length === 0 && (
            <li className="text-xs text-muted p-2 text-center">No se encontraron pacientes.</li>
          )}
        </ul>

        {/* Respaldo y Nube */}
        <div className="pt-3 border-t border-line grid gap-1.5">
          <div className="eyebrow mb-1 text-[10px]">Copia de Seguridad</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button className="btn btn-sm text-xs justify-start" onClick={onExportJson} title="Descargar todos los pacientes en un archivo JSON">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button className="btn btn-sm text-xs justify-start" onClick={() => fileInputRef.current?.click()} title="Importar pacientes desde un archivo JSON">
              <Upload className="w-3.5 h-3.5" /> Importar
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJson}
              accept=".json"
              className="hidden"
            />
          </div>

          <button className="btn btn-sm text-xs justify-center mt-1 border-dashed" onClick={onOpenCloud}>
            <Database className="w-3.5 h-3.5 text-brand" />
            <span>Gestionar Nube / Supabase</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function TabPaciente({ removeP }) {
  const { c } = useCtx();
  const [conf, setConf] = useState(false);
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,19rem)]">
      <section className="card p-5">
        <h2 className="h2">Datos generales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" className="sm:col-span-2"><In path="gen.nombre" /></Field>
          <Field label="Edad"><In path="gen.edad" num unit="años" /></Field>
          <Field label="Sexo"><Sel path="gen.sexo" options={[['', 'Seleccione'], ['F', 'Femenino'], ['M', 'Masculino']]} /></Field>
          <Field label="Fecha de consulta"><In path="gen.fecha" type="date"/></Field>
          <Field label="No. de expediente"><In path="gen.expediente" /></Field>
          <Field label="Diagnóstico médico" className="sm:col-span-2"><In path="gen.dx" /></Field>
          <Field label="Motivo de consulta" className="sm:col-span-2"><Area path="gen.motivo" rows={2} /></Field>
          <Field label="Medicamentos y suplementos" className="sm:col-span-2"><Area path="gen.meds" rows={2} /></Field>
          <Field label="Antecedentes personales y familiares" className="sm:col-span-2"><Area path="gen.antecedentes" rows={2} /></Field>
        </div>
      </section>
      <div className="grid gap-4 content-start">
        {c.edad != null && c.edad < 18 && (
          <div className="card p-4" style={{ borderColor: 'var(--warn)' }}>
            <div className="text-sm font-medium" style={{ color: 'var(--warn)' }}>Paciente menor de 18 años</div>
            <p className="hint">Las ecuaciones y clasificaciones de esta herramienta son para adultos. En pediatría use curvas de crecimiento y requerimientos por edad.</p>
          </div>
        )}
        {!c.sexo && (
          <div className="card p-4">
            <div className="text-sm font-medium">Falta indicar el sexo</div>
            <p className="hint">Se necesita para el peso ideal, las ecuaciones de gasto energético y los rangos de laboratorio.</p>
          </div>
        )}
        <div className="card p-4">
          <div className="eyebrow mb-2">Paciente</div>
          {!conf ? (
            <button className="btn btn-danger w-full" onClick={() => setConf(true)}>
              <Trash2 className="w-4 h-4 mr-1" /> Eliminar paciente
            </button>
          ) : (
            <div className="grid gap-2">
              <p className="text-sm">Se borrarán todos los datos de este paciente. Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button className="btn btn-danger flex-1" onClick={() => { setConf(false); removeP(); }}>Sí, eliminar</button>
                <button className="btn flex-1" onClick={() => setConf(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubA() {
  const { c } = useCtx();
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="grid gap-4 content-start">
        <section className="card p-5">
          <h3 className="h3">Peso y talla</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Peso actual"><In path="antro.peso" num unit="kg" /></Field>
            <Field label="Talla"><In path="antro.talla" num unit="cm" /></Field>
            <Field label="Peso habitual"><In path="antro.habitual" num unit="kg" /></Field>
          </div>
          <div className="mt-4 max-w-sm">
            <Field label="Tiempo en que ocurrió el cambio de peso" hint="Define el umbral de pérdida significativa (Blackburn).">
              <Sel path="antro.periodo" options={PERIODOS.map(x => [x.k, x.l])} />
            </Field>
          </div>
        </section>
        <section className="card p-5">
          <h3 className="h3">Circunferencias</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Cintura"><In path="antro.cintura" num unit="cm" /></Field>
            <Field label="Cadera"><In path="antro.cadera" num unit="cm" /></Field>
            <Field label="Circunferencia del brazo"><In path="antro.cb" num unit="cm" /></Field>
          </div>
        </section>
        <section className="card p-5">
          <h3 className="h3">Pliegues cutáneos</h3>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Tricipital"><In path="antro.pct" num unit="mm" /></Field>
            <Field label="Bicipital"><In path="antro.pbi" num unit="mm" /></Field>
            <Field label="Subescapular"><In path="antro.psub" num unit="mm" /></Field>
            <Field label="Suprailíaco"><In path="antro.psup" num unit="mm" /></Field>
          </div>
          <p className="hint">Con los cuatro pliegues se estima el porcentaje de grasa (Durnin-Womersley). Es una estimación; no sustituye a una medición directa de composición corporal.</p>
        </section>
      </div>
      <div className="grid gap-4 content-start">
        <section className="card p-5">
          <div className="eyebrow">Índice de masa corporal</div>
          <div className="flex items-end gap-2 mt-1">
            <span className="num text-4xl leading-none">{f1(c.imc)}</span>
            <span className="text-sm text-muted pb-1">kg/m²</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Pill f={c.imcCl} />
            {c.imcCl && <span className="hint" style={{ margin: 0 }}>{c.imcEscala}</span>}
          </div>
          {!c.imcCl && <p className="hint">Ingrese peso y talla para calcular.</p>}
        </section>
        <section className="card px-5 py-2">
          <Metric label="Cambio de peso" value={c.cambio == null ? '—' : fs(-c.cambio)} unit="%" flag={c.cambioCl} note={c.cambio == null ? 'Requiere peso actual y habitual' : 'Respecto al peso habitual'} />
          <Metric label="Peso ideal (Hamwi)" value={f1(c.pi)} unit="kg" note={c.pctPI != null ? f0(c.pctPI) + ' % del peso ideal' : 'Requiere talla y sexo'} />
          <Metric label="Rango de peso saludable" value={c.rango ? f1(c.rango[0]) + ' – ' + f1(c.rango[1]) : '—'} unit="kg" note="IMC de 18.5 a 24.9" />
          <Metric label="Peso ajustado" value={f1(c.pAj)} unit="kg" note="Ideal + 25 % del exceso; igual al real si está bajo el ideal" />
          <Metric label="Cintura" value={f1(c.cintura)} unit="cm" flag={c.cinturaCl} />
          <Metric label="Índice cintura/cadera" value={f2(c.icc)} flag={c.iccCl} />
          <Metric label="Circunferencia muscular del brazo (CMB)" value={f1(c.cmb)} unit="cm" note="Brazo − π × pliegue tricipital" />
          <Metric label="Área muscular del brazo (AMB)" value={f1(c.amb)} unit="cm²" note="Fórmula clásica no corregida" />
          <Metric label="AMB corregida (AMBc Heymsfield)" value={f1(c.ambc)} unit="cm²" note={c.sexo ? (c.sexo === 'M' ? 'AMB − 10 cm² (descuenta hueso en hombres)' : 'AMB − 6.5 cm² (mujeres)') : 'Requiere sexo'} />
          <Metric label="Grasa corporal estimada" value={f1(c.gc)} unit="%" note={c.mg != null ? `Masa grasa ${f1(c.mg)} kg · masa libre ${f1(c.mlg)} kg` : 'Requiere los 4 pliegues, edad y sexo'} />
        </section>
      </div>
    </div>
  );
}

function SubB() {
  const { p, c, set } = useCtx();
  return (
    <div className="grid gap-4">
      {/* Tarjetas de cálculo clínico avanzado: TFG y Calcio Corregido */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-4 border-l-4" style={{ borderLeftColor: c.egfrFlag ? 'var(--' + c.egfrFlag.level + ')' : 'var(--line)' }}>
          <div className="eyebrow mb-1">Tasa de Filtración Glomerular Estimada (CKD-EPI 2021)</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-2xl font-semibold">{c.egfr != null ? f1(c.egfr) : '—'}</span>
            <span className="text-xs text-muted">mL/min/1.73 m²</span>
            {c.egfrFlag && <Pill f={c.egfrFlag} />}
          </div>
          <div className="text-xs text-muted mt-1">
            {c.egfrStage || 'Requiere creatinina sérica, edad y sexo del paciente.'}
          </div>
        </section>

        <section className="card p-4 border-l-4" style={{ borderLeftColor: c.caCorregidoFlag ? 'var(--' + c.caCorregidoFlag.level + ')' : 'var(--line)' }}>
          <div className="eyebrow mb-1">Calcio Corregido por Albúmina</div>
          <div className="flex items-baseline gap-2">
            <span className="num text-2xl font-semibold">{c.caCorregido != null ? f1(c.caCorregido) : '—'}</span>
            <span className="text-xs text-muted">mg/dL</span>
            {c.caCorregidoFlag && <Pill f={c.caCorregidoFlag} />}
          </div>
          <div className="text-xs text-muted mt-1">
            {c.caCorregido != null ? 'Fórmula de Payne: Ca + 0.8 × (4.0 − Albúmina).' : 'Requiere calcio y albúmina sérica.'}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <h3 className="h3">Parámetros bioquímicos</h3>
        <div className="table-responsive">
          <table className="tbl" style={{ minWidth: '42rem' }}>
            <thead>
              <tr>
                <th className="stick">Parámetro</th>
                <th>Valor</th>
                <th>Unidad</th>
                <th>Referencia</th>
                <th>Interpretación</th>
              </tr>
            </thead>
            <tbody>
              {c.bio.map(b => (
                <tr key={b.k}>
                  <td className="stick font-medium">{b.n}</td>
                  <td style={{ width: '7.5rem' }}>
                    <input
                      id={'f-bio-' + b.k}
                      type="number"
                      min="0"
                      step="any"
                      className="inp num"
                      inputMode="decimal"
                      value={p.bio[b.k] ?? ''}
                      onKeyDown={e => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                      onChange={e => set('bio.' + b.k, sanitizeNumInput(e.target.value, false))}
                      autoComplete="off"
                      aria-label={b.n}
                    />
                  </td>
                  <td className="text-muted">{b.u}</td>
                  <td className="num text-muted whitespace-nowrap">{b.ref}</td>
                  <td>{b.flag ? <Pill f={b.flag} /> : <span className="text-muted text-xs">Sin dato</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint mt-3">Rangos de referencia generales para adultos. Se incluye Fósforo, Magnesio y PCR para monitoreo nutricional de inflamación y síndrome de realimentación.</p>
      </section>
    </div>
  );
}

function SubC() {
  const { c } = useCtx();
  const t = c.tamizaje;
  return (
    <div className="grid gap-4">
      {c.refeeding.isRisk && (
        <div className="card p-4 bg-crit-soft border border-crit rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-crit flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-crit">Alerta Clínica: Alto Riesgo de Síndrome de Realimentación (NICE / ASPEN)</div>
            <p className="mt-1 text-ink">
              Factores de riesgo detectados: <strong>{c.refeeding.reasons.join('; ')}</strong>.
            </p>
            <div className="mt-2 text-xs text-muted">
              Recomendación: Iniciar alimentación a 10–15 kcal/kg/día, suplementar tiamina antes de los hidratos de carbono y vigilar fósforo, potasio y magnesio cada 12–24 horas.
            </div>
          </div>
        </div>
      )}

      <section className="card p-5">
        <h3 className="h3">Síntomas digestivos</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {SINT.map(([k, n]) => <Check key={k} path={'clin.sint.' + k} label={n} />)}
        </div>
      </section>
      <section className="card p-5">
        <h3 className="h3">Patologías coexistentes</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PATOL.map(([k, n]) => <Check key={k} path={'clin.pat.' + k} label={n} />)}
        </div>
      </section>
      <section className="card p-5">
        <h3 className="h3">Exploración física enfocada en nutrición</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Pérdida de masa muscular" hint="Temporales, clavículas, hombros, interóseos, cuádriceps">
            <Sel path="clin.musculo" options={SEV} />
          </Field>
          <Field label="Pérdida de grasa subcutánea" hint="Región orbital, tríceps, costillas">
            <Sel path="clin.grasa" options={SEV} />
          </Field>
          <Field label="Edema"><Sel path="clin.edema" options={EDEMA} /></Field>
          <Field label="Ascitis"><Sel path="clin.ascitis" options={[['no', 'Ausente'], ['si', 'Presente']]} /></Field>
          <Field label="Fuerza de prensión"><Sel path="clin.fuerza" options={[['', 'No evaluada'], ['normal', 'Normal'], ['disminuida', 'Disminuida']]} /></Field>
          <Field label="Estado de hidratación"><Sel path="clin.hidratacion" options={[['', 'No evaluado'], ['normal', 'Normal'], ['deshidratacion', 'Deshidratación'], ['sobrecarga', 'Sobrecarga de líquidos']]} /></Field>
          <Field label="Piel, cabello y uñas" className="sm:col-span-2 lg:col-span-1"><In path="clin.piel" /></Field>
          <Field label="Cavidad oral y dentición" className="sm:col-span-2 lg:col-span-1"><In path="clin.oral" /></Field>
          <Field label="Otros hallazgos" className="sm:col-span-2 lg:col-span-3"><Area path="clin.otros" rows={2} /></Field>
        </div>
      </section>
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="h3" style={{ margin: 0 }}>Tamizaje de desnutrición (criterios ASPEN/AND)</h3>
          <span className={'pill ' + t.level}>{t.n} de 6 características</span>
        </div>
        <p className="text-sm mt-3">{t.msg}</p>
        {t.crit.length > 0 && (
          <ul className="mt-2 text-sm list-disc pl-5">
            {t.crit.map(x => <li key={x}>{x}</li>)}
          </ul>
        )}
        {t.extra.length > 0 && (
          <div className="mt-3">
            <div className="eyebrow mb-1">Otros hallazgos de riesgo</div>
            <ul className="text-sm list-disc pl-5">
              {t.extra.map(x => <li key={x}>{x}</li>)}
            </ul>
          </div>
        )}
        <p className="hint">Se alimenta de la ingesta (módulo D), la pérdida de peso (A) y la exploración física. Es una ayuda de tamizaje, no un diagnóstico.</p>
      </section>
    </div>
  );
}

function SubD() {
  const { p, c } = useCtx();
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="card p-5">
          <h3 className="h3">Recordatorio de 24 horas</h3>
          <div className="grid gap-4">
            {RECALL.map(([k, n]) => (
              <div key={k} className="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4 items-start">
                <div>
                  <div className="text-sm font-medium mb-1">{n}</div>
                  <In path={'dieta.rec.' + k + '.hora'} placeholder="Hora" />
                </div>
                <Field label="Alimentos, preparación y cantidad">
                  <Area path={'dieta.rec.' + k + '.txt'} rows={2} />
                </Field>
              </div>
            ))}
          </div>
        </section>
        <div className="grid gap-4 content-start">
          <section className="card p-5">
            <h3 className="h3">Adecuación de la ingesta</h3>
            <div className="grid gap-4">
              <Field label="Ingesta habitual respecto a lo requerido">
                <Sel path="dieta.ingesta" options={INGESTA} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Energía estimada"><In path="dieta.kcalEst" num unit="kcal" /></Field>
                <Field label="Proteína estimada"><In path="dieta.protEst" num unit="g" /></Field>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-line">
              <Metric
                label="Adecuación de energía"
                value={c.adecKcal == null ? '—' : f0(c.adecKcal)}
                unit="% del VCT"
                flag={c.adecKcal == null ? null : c.adecKcal < 75 ? lv('warn', 'Baja', '↓') : c.adecKcal > 110 ? lv('warn', 'Excesiva', '↑') : lv('ok', 'Adecuada', '✓')}
                note={c.vct ? null : 'Calcule el VCT en Requerimientos'}
              />
              <Metric
                label="Adecuación de proteína"
                value={c.adecProt == null ? '—' : f0(c.adecProt)}
                unit="% de la meta"
                flag={c.adecProt == null ? null : c.adecProt < 75 ? lv('warn', 'Baja', '↓') : c.adecProt > 125 ? lv('warn', 'Alta', '↑') : lv('ok', 'Adecuada', '✓')}
              />
            </div>
          </section>
          <section className="card p-5">
            <h3 className="h3">Hábitos</h3>
            <div className="grid gap-3">
              <Field label="Apetito"><In path="dieta.apetito" /></Field>
              <Field label="Consumo de agua"><In path="dieta.agua" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Alcohol"><In path="dieta.alcohol" /></Field>
                <Field label="Tabaco"><In path="dieta.tabaco" /></Field>
              </div>
              <Field label="Suplementos"><In path="dieta.suplementos" /></Field>
              <Field label="Alergias e intolerancias"><In path="dieta.alergias" /></Field>
              <Field label="Actividad física"><Area path="dieta.actividad" rows={2} /></Field>
            </div>
          </section>
        </div>
      </div>
      <section className="card p-5">
        <h3 className="h3">Frecuencia de consumo habitual</h3>
        <div className="overflow-x-auto">
          <table className="tbl" style={{ minWidth: '30rem' }}>
            <thead>
              <tr>
                <th>Grupo de alimentos</th>
                <th>Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {GRUPOS_FREC.map(([k, n]) => (
                <tr key={k}>
                  <td>{n}</td>
                  <td style={{ width: '14rem' }}>
                    <Sel path={'dieta.frec.' + k} options={[['', 'Sin dato'], ...FREC]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Field label="Notas dietéticas"><Area path="dieta.notas" rows={2} /></Field>
        </div>
      </section>
    </div>
  );
}

function TabValoracion({ sub, setSub }) {
  const subs = [['A', 'Antropometría'], ['B', 'Bioquímica'], ['C', 'Clínica'], ['D', 'Dietética']];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="seg" role="group" aria-label="Componente de la valoración">
          {subs.map(([k, n]) => (
            <button key={k} aria-pressed={sub === k} onClick={() => setSub(k)}>
              <span className="num mr-1">{k}</span>{n}
            </button>
          ))}
        </div>
      </div>
      {sub === 'A' && <SubA />}
      {sub === 'B' && <SubB />}
      {sub === 'C' && <SubC />}
      {sub === 'D' && <SubD />}
    </div>
  );
}

function TabReq() {
  const { p, c, set, upd } = useCtx();
  const r = p.req;
  const F = FORMULAS.find(x => x.k === r.formula) || FORMULAS[0];
  const fmt = n => Math.round(n * 100) / 100;
  const switchMode = m => {
    if (m === r.modo) return;
    upd(x => {
      let y = setIn(x, 'req.modo', m);
      const mm = c.macros;
      if (mm) {
        if (m === 'gkg') {
          y = setIn(y, 'req.gkg', { p: String(fmt(mm.p.gkg)), c: String(fmt(mm.c.gkg)), l: String(fmt(mm.l.gkg)) });
        } else {
          y = setIn(y, 'req.pct', { p: String(Math.round(mm.p.pct * 10) / 10), c: String(Math.round(mm.c.pct * 10) / 10), l: String(Math.round(mm.l.pct * 10) / 10) });
        }
      }
      return y;
    });
  };
  const choDiff = () => {
    if (r.modo === 'pct') {
      const v = Math.max(0, 100 - (num(r.pct.p) || 0) - (num(r.pct.l) || 0));
      set('req.pct.c', String(Math.round(v * 10) / 10));
    } else if (c.vct && c.wCalc) {
      const kc = c.vct - (num(r.gkg.p) || 0) * c.wCalc * 4 - (num(r.gkg.l) || 0) * c.wCalc * 9;
      set('req.gkg.c', String(fmt(Math.max(0, kc / 4 / c.wCalc))));
    }
  };
  const applyPreset = pr => upd(x => {
    let y = setIn(x, 'req.modo', 'pct');
    return setIn(y, 'req.pct', { p: String(pr.p), c: String(pr.c), l: String(pr.l) });
  });
  const onFormula = k => {
    const f = FORMULAS.find(x => x.k === k);
    upd(x => {
      let y = setIn(x, 'req.formula', k);
      if (f.kg) y = setIn(y, 'req.kcalkg', f.def);
      return y;
    });
  };
  const onAct = k => {
    const o = ACT.find(x => x[0] === k);
    upd(x => {
      let y = setIn(x, 'req.actKey', k);
      if (o[2] != null) y = setIn(y, 'req.actVal', String(o[2]));
      return y;
    });
  };
  const onEst = k => {
    const o = EST.find(x => x[0] === k);
    upd(x => {
      let y = setIn(x, 'req.estKey', k);
      if (o[2] != null) y = setIn(y, 'req.estVal', String(o[2]));
      return y;
    });
  };
  const m = c.macros;
  const unitIn = (k) => r.modo === 'pct' ? { path: 'req.pct.' + k, unit: '%' } : { path: 'req.gkg.' + k, unit: 'g/kg' };
  const rows = [['p', 'Proteínas'], ['c', 'Carbohidratos'], ['l', 'Lípidos']];
  const need = c.geb == null ? (F.kg ? 'Ingrese el peso (y la talla y el sexo si usa peso ideal o ajustado) y las kcal/kg.' : c.sexo ? 'Complete edad, peso y talla en Antropometría.' : 'Indique el sexo y complete edad, peso y talla.') : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="grid gap-4 content-start">
        {c.refeeding.isRisk && (
          <div className="card p-4 bg-warn-soft border border-warn rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warn flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-warn">Precaución: Manejo de Realimentación sugerido</div>
              <p className="mt-1">
                Para prevenir el Síndrome de Realimentación, se aconseja pautar inicialmente entre <strong>10 y 15 kcal/kg/día</strong> (aprox. {f0(c.wCalc * 12)} kcal/día) con bajo aporte de carbohidratos simples y progresión gradual cada 48-72 h.
              </p>
            </div>
          </div>
        )}

        <section className="card p-5">
          <h3 className="h3">Gasto energético</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fórmula" className="sm:col-span-2" hint={F.d}>
              <Sel path="req.formula" options={FORMULAS.map(x => [x.k, x.n])} onChange={onFormula} />
            </Field>
            <Field label="Peso de cálculo" hint={c.wCalc != null ? `Se usan ${f1(c.wCalc)} kg` : 'Requiere los datos de antropometría'}>
              <Sel path="req.pesoBase" options={[['real', 'Peso real'], ['ideal', 'Peso ideal (Hamwi)'], ['ajustado', 'Peso ajustado']]} />
            </Field>
            {F.kg && (
              <Field label="Energía por kilo">
                <In path="req.kcalkg" num unit="kcal/kg" />
              </Field>
            )}
            {!F.kg && (
              <>
                <div className="grid gap-2">
                  <Field label="Factor de actividad física">
                    <Sel path="req.actKey" options={ACT.map(x => [x[0], x[1]])} onChange={onAct} />
                  </Field>
                  <div className="max-w-[9rem]"><In path="req.actVal" num unit="×" /></div>
                </div>
                <div className="grid gap-2">
                  <Field label="Factor de estrés térmico y metabólico">
                    <Sel path="req.estKey" options={EST.map(x => [x[0], x[1]])} onChange={onEst} />
                  </Field>
                  <div className="max-w-[9rem]"><In path="req.estVal" num unit="×" /></div>
                </div>
              </>
            )}
            <Field label="Ajuste según el objetivo" hint="Negativo para bajar de peso, positivo para ganar o repletar.">
              <In path="req.ajuste" num unit="kcal/día" />
            </Field>
            <Field label="Líquidos" hint={c.liquidos ? `Aproximadamente ${f0(c.liquidos)} mL al día` : null}>
              <In path="req.liq" num unit="mL/kg" />
            </Field>
          </div>
          {F.kg && <p className="hint">Con fórmulas por kilo no se aplican los factores de actividad ni de estrés. Los factores de estrés son valores orientativos: ajústelos con el juicio clínico.</p>}
        </section>
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="h3" style={{ margin: 0 }}>Distribución de macronutrientes</h3>
            <div className="seg" role="group" aria-label="Modo de entrada">
              <button aria-pressed={r.modo === 'pct'} onClick={() => switchMode('pct')}>% del VCT</button>
              <button aria-pressed={r.modo === 'gkg'} onClick={() => switchMode('gkg')}>g por kg</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESETS.map(pr => (
              <button key={pr.n} className="chipbtn" onClick={() => applyPreset(pr)}>{pr.n}</button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="tbl" style={{ minWidth: '34rem' }}>
              <thead>
                <tr>
                  <th>Macronutriente</th>
                  <th style={{ width: '8.5rem' }}>{r.modo === 'pct' ? 'Porcentaje' : 'g por kg'}</th>
                  <th className="r">Gramos</th>
                  <th className="r">kcal</th>
                  <th className="r">% VCT</th>
                  <th className="r">g/kg</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, n]) => {
                  const u = unitIn(k);
                  return (
                    <tr key={k}>
                      <td>{n}</td>
                      <td><In path={u.path} num unit={u.unit} /></td>
                      <td className="r num">{m ? f0(m[k].g) : '—'}</td>
                      <td className="r num">{m ? f0(m[k].kcal) : '—'}</td>
                      <td className="r num">{m ? f1(m[k].pct) : '—'}</td>
                      <td className="r num">{m ? f2(m[k].gkg) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td />
                  <td />
                  <td className="r num">{m ? f0(m.totalKcal) : '—'}</td>
                  <td className="r num">{m ? f1(m.totalPct) : '—'}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button className="btn btn-sm" onClick={choDiff}>Carbohidratos por diferencia</button>
            {m && (
              <span className={'pill ' + (m.okTotal ? 'ok' : 'warn')}>
                {m.okTotal ? '✓ La distribución cierra con el VCT' : (m.diff > 0 ? '↑ Excede el VCT en ' : '↓ Falta para el VCT: ') + f0(Math.abs(m.diff)) + ' kcal'}
              </span>
            )}
          </div>
        </section>
      </div>
      <div className="grid gap-4 content-start lg:sticky lg:top-40">
        <section className="card p-5">
          <div className="eyebrow">Valor calórico total</div>
          <div className="flex items-end gap-2 mt-1">
            <span className="num text-4xl leading-none">{f0(c.vct)}</span>
            <span className="text-sm text-muted pb-1">kcal/día</span>
          </div>
          {c.kcalkg != null && <div className="text-sm text-muted mt-1 num">{f1(c.kcalkg)} kcal/kg de peso de cálculo</div>}
          {need && <p className="hint">{need}</p>}
          <div className="mt-4 text-sm">
            <div className="flex justify-between py-1.5 border-b border-line">
              <span>{F.kg ? 'Energía por kilo × peso' : 'GEB'}</span>
              <span className="num">{f0(c.geb)} kcal</span>
            </div>
            {!F.kg && (
              <>
                <div className="flex justify-between py-1.5 border-b border-line">
                  <span className="text-muted">× Factor de actividad</span>
                  <span className="num">{c.af}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-line">
                  <span className="text-muted">× Factor de estrés</span>
                  <span className="num">{c.fe}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-line">
                  <span>= Gasto energético total</span>
                  <span className="num">{f0(c.get)} kcal</span>
                </div>
              </>
            )}
            <div className="flex justify-between py-1.5 border-b border-line">
              <span className="text-muted">± Ajuste</span>
              <span className="num">{c.ajuste > 0 ? '+' : ''}{f0(c.ajuste)} kcal</span>
            </div>
            <div className="flex justify-between py-1.5 font-semibold">
              <span>= VCT</span>
              <span className="num">{f0(c.vct)} kcal</span>
            </div>
          </div>
        </section>
        <section className="card p-5">
          <h3 className="h3">Macronutrientes diarios</h3>
          {m ? (
            <>
              <div className="flex h-3 rounded overflow-hidden" role="img" aria-label="Distribución porcentual de macronutrientes" style={{ background: 'var(--sunken)' }}>
                {[['p', 'var(--m1)'], ['c', 'var(--m2)'], ['l', 'var(--m3)']].map(([k, col]) => (
                  <div key={k} style={{ width: Math.max(0, Math.min(100, m[k].pct / Math.max(m.totalPct, 100) * 100)) + '%', background: col }} />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[['p', 'Proteínas', 'var(--m1)'], ['c', 'Carbohidratos', 'var(--m2)'], ['l', 'Lípidos', 'var(--m3)']].map(([k, n, col]) => (
                  <div key={k}>
                    <div className="text-xs text-muted flex items-center gap-1.5">
                      <span style={{ width: '.6rem', height: '.6rem', background: col, borderRadius: 2, display: 'inline-block' }} />{n}
                    </div>
                    <div className="num text-xl">{f0(m[k].g)}<span className="text-xs text-muted ml-1">g</span></div>
                    <div className="num text-xs text-muted">{f0(m[k].kcal)} kcal · {f1(m[k].pct)} %</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-line text-sm grid gap-1">
                <div className="flex justify-between">
                  <span className="text-muted">Fibra sugerida (14 g/1000 kcal)</span>
                  <span className="num">{f0(c.fibra)} g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Líquidos</span>
                  <span className="num">{c.liquidos ? f0(c.liquidos) + ' mL' : '—'}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="hint">Los gramos aparecen cuando el VCT está calculado.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function PesLine({ it }) {
  const pr = it.problema === OTRO ? it.custom : it.problema;
  const part = (v, cls, ph) => v && v.trim() ? <span className={cls}>{v.trim().replace(/[.;,\s]+$/, '')}</span> : <span className="pes-empty">{ph}</span>;
  return (
    <p className="leading-relaxed">
      {part(pr, 'pes-p', '[problema]')} <span className="text-muted">relacionado con</span> {part(it.etio, 'pes-e', '[etiología]')}<span className="text-muted">, evidenciado por</span> {part(it.signos, 'pes-s', '[signos y síntomas]')}<span className="text-muted">.</span>
    </p>
  );
}

function TabPES() {
  const { p, c, upd } = useCtx();
  const empty = { problema: '', custom: '', etio: '', signos: '' };
  const [d, setD] = useState(empty);
  const [editId, setEditId] = useState(null);
  const ev = useMemo(() => evidencias(p, c), [p, c]);
  const sd = (k, v) => setD(x => ({ ...x, [k]: v }));
  const addSign = t => setD(x => ({ ...x, signos: (x.signos.trim() ? x.signos.trim().replace(/[.;,\s]+$/, '') + '; ' : '') + t }));
  const valid = d.problema && (d.problema !== OTRO || d.custom.trim());
  const save = () => {
    if (!valid) return;
    upd(x => {
      const items = editId ? x.pes.items.map(i => i.id === editId ? { ...d, id: editId } : i) : [...x.pes.items, { ...d, id: uid() }];
      return setIn(x, 'pes.items', items);
    });
    setD(empty);
    setEditId(null);
  };
  const remove = id => upd(x => setIn(x, 'pes.items', x.pes.items.filter(i => i.id !== id)));
  const edit = it => {
    setD({ problema: it.problema, custom: it.custom || '', etio: it.etio, signos: it.signos });
    setEditId(it.id);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <section className="card p-5">
        <h2 className="h2">{editId ? 'Editar diagnóstico' : 'Nuevo diagnóstico nutricional'}</h2>
        <div className="grid gap-4">
          <Field label="Problema (P)">
            <select id="pes-problema" className="inp" value={d.problema} onChange={e => sd('problema', e.target.value)}>
              <option value="">Seleccione un diagnóstico estándar</option>
              {PROBLEMAS.map(([g, list]) => (
                <optgroup key={g} label={g}>
                  {list.map(x => <option key={x} value={x}>{x}</option>)}
                </optgroup>
              ))}
              <optgroup label="Otro"><option value={OTRO}>Otro (escribir)</option></optgroup>
            </select>
          </Field>
          {d.problema === OTRO && (
            <Field label="Problema personalizado">
              <input id="pes-custom" className="inp" value={d.custom} onChange={e => sd('custom', e.target.value)} />
            </Field>
          )}
          <div>
            <Field label="Etiología (E): relacionado con…">
              <textarea id="pes-etio" className="inp" rows={2} value={d.etio} onChange={e => sd('etio', e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ETIO_SUG.map(t => <button key={t} className="chipbtn" onClick={() => sd('etio', t)}>{t}</button>)}
            </div>
          </div>
          <div>
            <Field label="Signos y síntomas (S): evidenciado por…">
              <textarea id="pes-signos" className="inp" rows={3} value={d.signos} onChange={e => sd('signos', e.target.value)} />
            </Field>
            <div className="eyebrow mt-3 mb-1.5">Datos de este paciente (clic para insertar)</div>
            <div className="flex flex-wrap gap-1.5">
              {ev.length ? ev.map(t => <button key={t} className="chipbtn" onClick={() => addSign(t)}>{t}</button>) : <span className="hint" style={{ margin: 0 }}>Ingrese datos de valoración para ver sugerencias.</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" disabled={!valid} style={{ opacity: valid ? 1 : 0.5 }} onClick={save}>
              {editId ? 'Guardar cambios' : 'Agregar al diagnóstico'}
            </button>
            {(editId || d.problema || d.etio || d.signos) && (
              <button className="btn" onClick={() => { setD(empty); setEditId(null); }}>Limpiar</button>
            )}
          </div>
        </div>
      </section>
      <div className="grid gap-4 content-start">
        <section className="card p-5" style={{ background: 'var(--sunken)' }}>
          <div className="eyebrow mb-2">Vista previa del enunciado PES</div>
          <PesLine it={d} />
        </section>
        <section className="card p-5">
          <h3 className="h3">Diagnósticos del paciente ({p.pes.items.length})</h3>
          {!p.pes.items.length && <p className="hint">Aún no hay diagnósticos. Arme uno a la izquierda y agréguelo.</p>}
          <ol className="grid gap-3">
            {p.pes.items.map((it, i) => (
              <li key={it.id} className="rounded-md border border-line p-3">
                <div className="flex gap-2">
                  <span className="num text-muted text-sm">{i + 1}.</span>
                  <div className="min-w-0 text-sm"><PesLine it={it} /></div>
                </div>
                <div className="flex gap-2 mt-2 justify-end">
                  <button className="btn btn-sm" onClick={() => edit(it)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(it.id)}>Quitar</button>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function Spark({ pts }) {
  if (pts.length < 2) return <p className="hint">Agregue al menos dos controles de peso para ver la tendencia.</p>;
  const W = 360, H = 150, L = 42, R = 16, T = 22, B = 26;
  const ys = pts.map(x => x.y);
  const mn = Math.min(...ys), mx = Math.max(...ys);
  let lo = mn, hi = mx;
  if (hi - lo < 1) { lo -= 0.5; hi += 0.5; }
  const pd = (hi - lo) * 0.2;
  lo -= pd;
  hi += pd;
  const t0 = pts[0].t, t1 = pts[pts.length - 1].t, span = Math.max(1, t1 - t0);
  const X = t => L + (t - t0) / span * (W - L - R), Y = y => T + (hi - y) / (hi - lo) * (H - T - B);
  const path = pts.map((q, i) => (i ? 'L' : 'M') + X(q.t).toFixed(1) + ' ' + Y(q.y).toFixed(1)).join(' ');
  const ticks = mn === mx ? [mn] : [mn, mx];
  const dl = s => s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(2, 4);
  const all = pts.length <= 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Tendencia del peso en los controles">
      {ticks.map(v => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={Y(v)} y2={Y(v)} style={{ stroke: 'var(--line)' }} strokeWidth="1" strokeDasharray="3 3" />
          <text x={L - 6} y={Y(v) + 4} textAnchor="end" fontSize="10" style={{ fill: 'var(--muted)' }}>{v.toFixed(1)}</text>
        </g>
      ))}
      <path d={path} fill="none" style={{ stroke: 'var(--brand)' }} strokeWidth="2" strokeLinejoin="round" />
      {pts.map((q, i) => {
        const last = i === pts.length - 1;
        return (
          <g key={i}>
            <circle cx={X(q.t)} cy={Y(q.y)} r={last ? 4.5 : 3} style={{ fill: 'var(--brand)' }} />
            {(all || i === 0 || last) && (
              <text x={X(q.t)} y={Y(q.y) - 8} textAnchor={i === 0 ? 'start' : last ? 'end' : 'middle'} fontSize="10" style={{ fill: 'var(--ink)' }}>{q.y.toFixed(1)}</text>
            )}
          </g>
        );
      })}
      <text x={L} y={H - 6} fontSize="10" textAnchor="start" style={{ fill: 'var(--muted)' }}>{dl(pts[0].f)}</text>
      <text x={W - R} y={H - 6} fontSize="10" textAnchor="end" style={{ fill: 'var(--muted)' }}>{dl(pts[pts.length - 1].f)}</text>
    </svg>
  );
}

function TabPlan() {
  const { p, c, set, upd } = useCtx();
  const [seg, setSeg] = useState({ fecha: today(), peso: '', nota: '' });
  const addRec = t => {
    const cur = (p.plan.recs || '').trim();
    if (cur.split('\n').includes(t)) return;
    set('plan.recs', (cur ? cur + '\n' : '') + t);
  };
  const addSeg = () => {
    if (!num(seg.peso)) return;
    upd(x => setIn(x, 'plan.seg', [...x.plan.seg, { id: uid(), ...seg }].sort((a, b) => a.fecha < b.fecha ? -1 : 1)));
    setSeg({ fecha: today(), peso: '', nota: '' });
  };
  const delSeg = id => upd(x => setIn(x, 'plan.seg', x.plan.seg.filter(s => s.id !== id)));
  const pts = p.plan.seg.map(s => ({ t: new Date(s.fecha + 'T00:00:00').getTime(), y: num(s.peso), f: s.fecha })).filter(q => q.y != null && Number.isFinite(q.t));

  return (
    <div className="grid gap-5">
      {/* Modelo de Cálculo de Intercambios, Distribución por Tiempos y Sugerencias de Alimentos */}
      <ExchangePlanSection p={p} c={c} set={set} upd={upd} Pill={Pill} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h3 className="h3">Objetivos del plan</h3>
          <Area path="plan.objetivos" rows={5} placeholder="Metas de peso, control metabólico y plazos" />
        </section>
        <section className="card p-5">
          <h3 className="h3">Recomendaciones personalizadas</h3>
          <Area path="plan.recs" rows={5} placeholder="Una recomendación por línea" />
          <div className="flex flex-wrap gap-1.5 mt-3">
            {REC_SUG.map(t => <button key={t} className="chipbtn" onClick={() => addRec(t)}>{t}</button>)}
          </div>
        </section>
      </div>

      <section className="card p-5">
        <h3 className="h3">Seguimiento</h3>
        <div className="grid gap-4 sm:grid-cols-2 mb-5">
          <Field label="Próxima cita"><In path="plan.proxima" type="date" /></Field>
          <Field label="Indicadores a monitorear"><In path="plan.indicadores" /></Field>
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <div className="grid gap-3 sm:grid-cols-[9.5rem_7rem_minmax(0,1fr)_auto] items-end mb-3">
              <Field label="Fecha">
                <input id="seg-fecha" type="date" className="inp" value={seg.fecha} onChange={e => setSeg({ ...seg, fecha: e.target.value })} />
              </Field>
              <Field label="Peso">
                <div className="relative">
                  <input
                    id="seg-peso"
                    type="number"
                    min="0"
                    step="any"
                    className="inp pr"
                    inputMode="decimal"
                    value={seg.peso}
                    onKeyDown={e => { if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault(); }}
                    onChange={e => setSeg({ ...seg, peso: sanitizeNumInput(e.target.value, false) })}
                  />
                  <span className="unit">kg</span>
                </div>
              </Field>
              <Field label="Observaciones">
                <input id="seg-nota" className="inp" value={seg.nota} onChange={e => setSeg({ ...seg, nota: e.target.value })} />
              </Field>
              <button className="btn btn-primary" onClick={addSeg}>Registrar</button>
            </div>
            <div className="table-responsive">
              <table className="tbl" style={{ minWidth: '26rem' }}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th className="r">Peso</th>
                    <th className="r">IMC</th>
                    <th>Observaciones</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {p.plan.seg.length ? p.plan.seg.map(s => {
                    const pw = num(s.peso);
                    return (
                      <tr key={s.id}>
                        <td className="num whitespace-nowrap">{s.fecha}</td>
                        <td className="r num">{f1(pw)} kg</td>
                        <td className="r num">{pw && c.talla ? f1(pw / Math.pow(c.talla / 100, 2)) : '—'}</td>
                        <td>{s.nota}</td>
                        <td className="r">
                          <button className="btn btn-sm btn-danger" onClick={() => delSeg(s.id)} aria-label={'Quitar control del ' + s.fecha}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan="5" className="text-muted">Sin controles registrados.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="eyebrow mb-1">Peso (kg) por control</div>
            <Spark pts={pts} />
          </div>
        </div>
      </section>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow" style={{ fontSize: '.64rem' }}>{k}</div>
      <div className="text-sm break-words">{v || '—'}</div>
    </div>
  );
}

function TabReporte() {
  const { p, c } = useCtx();
  const [state, setState] = useState('');
  const [txt, setTxt] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const lab = (map, list) => list.filter(x => map[x[0]]).map(x => x[1]);

  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      setState('Generando documento PDF estructurado...');
      exportClinicalReportPDF({ p, c, SINT, PATOL, RECALL, FORMULAS, pesText });
      setState('✓ PDF clínico descargado correctamente.');
      setTxt(null);
    } catch (err) {
      console.error('Error generando PDF:', err);
      setState('Error al generar el PDF: ' + (err.message || 'Intente imprimir como PDF.'));
    } finally {
      setExportingPdf(false);
    }
  };

  const copy = async () => {
    const t = reportText(p, c);
    let ok = false;
    try {
      await navigator.clipboard.writeText(t);
      ok = true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = t;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e2) {
        ok = false;
      }
    }
    if (ok) {
      setState('Informe copiado al portapapeles.');
      setTxt(null);
    } else {
      setState('No se pudo copiar automáticamente. Seleccione y copie el texto de abajo.');
      setTxt(t);
    }
  };

  const g = p.gen;
  const T = c.plan;
  const m = c.macros;
  const F = FORMULAS.find(x => x.k === p.req.formula);
  const bs = c.bio.filter(b => b.v != null);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3 no-print">
        <button className="btn btn-primary" onClick={handleExportPdf} disabled={exportingPdf}>
          <FileDown className="w-4 h-4 mr-1" /> {exportingPdf ? 'Generando PDF...' : 'Descargar PDF Clínico'}
        </button>
        <button className="btn" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1" /> Imprimir reporte
        </button>
        <button className="btn" onClick={copy}>
          <Copy className="w-4 h-4 mr-1" /> Copiar como texto
        </button>
        {state && <span className="text-sm text-brand font-medium" role="status">{state}</span>}
      </div>
      {txt && (
        <textarea
          className="inp num no-print"
          rows={12}
          readOnly
          value={txt}
          onFocus={e => e.target.select()}
          aria-label="Texto del informe"
        />
      )}
      <article className="paper rep p-6 sm:p-8 grid gap-7">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="eyebrow">Ficha clínica nutricional</div>
            <h2 className="serif text-3xl" style={{ fontWeight: 600, lineHeight: 1.15 }}>Valoración y plan nutricional</h2>
          </div>
          <div className="text-sm text-muted text-right">
            Fecha de consulta
            <div className="num text-ink">{g.fecha || '—'}</div>
          </div>
        </header>
        <section>
          <h4>Identificación</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KV k="Paciente" v={g.nombre} />
            <KV k="Edad" v={g.edad && g.edad + ' años'} />
            <KV k="Sexo" v={g.sexo === 'M' ? 'Masculino' : g.sexo === 'F' ? 'Femenino' : ''} />
            <KV k="Expediente" v={g.expediente} />
            <div className="sm:col-span-2"><KV k="Diagnóstico médico" v={g.dx} /></div>
            <div className="sm:col-span-2"><KV k="Motivo de consulta" v={g.motivo} /></div>
            <div className="sm:col-span-2"><KV k="Medicamentos y suplementos" v={g.meds} /></div>
            <div className="sm:col-span-2"><KV k="Antecedentes" v={g.antecedentes} /></div>
          </div>
        </section>
        <section>
          <h4>A. Antropometría</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KV k="Peso / talla" v={`${p.antro.peso || '—'} kg / ${p.antro.talla || '—'} cm`} />
            <div>
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>IMC</div>
              <div className="text-sm"><span className="num">{f1(c.imc)}</span> kg/m² <Pill f={c.imcCl} /></div>
            </div>
            <div>
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>Cambio de peso</div>
              <div className="text-sm"><span className="num">{c.cambio == null ? '—' : fs(-c.cambio) + ' %'}</span> {c.cambio != null && <span className="text-muted">en {c.per.l.toLowerCase()}</span>} <Pill f={c.cambioCl} /></div>
            </div>
            <KV k="Peso ideal (Hamwi)" v={c.pi ? `${f1(c.pi)} kg (${f0(c.pctPI)} %)` : ''} />
            <div>
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>Cintura / ICC</div>
              <div className="text-sm"><span className="num">{c.cintura != null ? f1(c.cintura) + ' cm' : '—'}{c.icc != null ? ' · ' + f2(c.icc) : ''}</span> <Pill f={c.cinturaCl} /></div>
            </div>
            <KV k="Brazo (CMB / AMB)" v={c.cmb != null ? `${f1(c.cmb)} cm / ${f1(c.amb)} cm²` : ''} />
            <KV k="AMB corregida (Heymsfield)" v={c.ambc != null ? `${f1(c.ambc)} cm²` : '—'} />
            <KV k="Grasa corporal estimada" v={c.gc != null ? `${f1(c.gc)} % (${f1(c.mg)} kg)` : ''} />
          </div>
        </section>
        <section>
          <h4>B. Bioquímica</h4>
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            <div className="border border-line rounded p-2.5">
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>TFG Estimada (CKD-EPI 2021)</div>
              <div className="text-sm font-medium">{c.egfr != null ? `${f1(c.egfr)} mL/min/1.73m² · ${c.egfrStage}` : 'Sin datos de creatinina/edad'}</div>
            </div>
            <div className="border border-line rounded p-2.5">
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>Calcio Corregido (Payne)</div>
              <div className="text-sm font-medium">{c.caCorregido != null ? `${f1(c.caCorregido)} mg/dL · ${c.caCorregidoFlag.label}` : 'Sin datos de calcio/albúmina'}</div>
            </div>
          </div>
          {bs.length ? (
            <div className="overflow-x-auto">
              <table className="tbl" style={{ minWidth: '34rem' }}>
                <thead>
                  <tr>
                    <th>Parámetro</th>
                    <th className="r">Valor</th>
                    <th>Referencia</th>
                    <th>Interpretación</th>
                  </tr>
                </thead>
                <tbody>
                  {bs.map(b => (
                    <tr key={b.k}>
                      <td>{b.n}</td>
                      <td className="r num">{b.v} {b.u}</td>
                      <td className="num text-muted">{b.ref}</td>
                      <td><Pill f={b.flag} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted">Sin datos de laboratorio.</p>
          )}
        </section>
        <section>
          <h4>C. Clínica y Seguridad</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <KV k="Síntomas digestivos" v={lab(p.clin.sint, SINT).join(', ') || 'Ninguno referido'} />
            <KV k="Patologías coexistentes" v={lab(p.clin.pat, PATOL).join(', ') || 'Ninguna registrada'} />
            <KV k="Exploración física" v={`Masa muscular: ${p.clin.musculo}. Grasa subcutánea: ${p.clin.grasa}. Edema: ${p.clin.edema === 'no' ? 'ausente' : p.clin.edema}. Ascitis: ${p.clin.ascitis === 'si' ? 'presente' : 'ausente'}.`} />
            <div>
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>Tamizaje de desnutrición</div>
              <div className="text-sm">
                <span className={'pill ' + c.tamizaje.level}>{c.tamizaje.n} de 6 características</span>
                <div className="mt-1">{c.tamizaje.msg}</div>
              </div>
            </div>
          </div>
          {c.refeeding.isRisk && (
            <div className="mt-3 p-3 bg-crit-soft border border-crit rounded text-xs text-crit">
              <strong>Alerta Clínica:</strong> Paciente con riesgo de Síndrome de Realimentación ({c.refeeding.reasons.join('; ')}).
            </div>
          )}
        </section>
        <section>
          <h4>D. Dietética</h4>
          <div className="grid gap-3">
            {RECALL.filter(([k]) => p.dieta.rec[k] && (p.dieta.rec[k].txt || p.dieta.rec[k].hora)).map(([k, n]) => (
              <div key={k} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] text-sm">
                <div className="font-medium">{n}{p.dieta.rec[k].hora && <span className="num text-muted"> · {p.dieta.rec[k].hora}</span>}</div>
                <div>{p.dieta.rec[k].txt}</div>
              </div>
            ))}
            {!RECALL.some(([k]) => p.dieta.rec[k] && (p.dieta.rec[k].txt || p.dieta.rec[k].hora)) && (
              <p className="text-sm text-muted">Sin recordatorio registrado.</p>
            )}
            <div className="grid gap-4 sm:grid-cols-3 mt-1">
              <KV k="Energía estimada" v={c.adecKcal != null ? `${f0(num(p.dieta.kcalEst))} kcal (${f0(c.adecKcal)} % del VCT)` : p.dieta.kcalEst && p.dieta.kcalEst + ' kcal'} />
              <KV k="Proteína estimada" v={p.dieta.protEst && p.dieta.protEst + ' g'} />
              <KV k="Apetito y actividad" v={[p.dieta.apetito, p.dieta.actividad].filter(Boolean).join('. ')} />
            </div>
          </div>
        </section>
        <section>
          <h4>Diagnóstico nutricional (PES)</h4>
          {p.pes.items.length ? (
            <ol className="grid gap-3 text-sm">
              {p.pes.items.map((it, i) => (
                <li key={it.id} className="flex gap-2">
                  <span className="num text-muted">{i + 1}.</span>
                  <div><PesLine it={it} /></div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Sin diagnósticos registrados.</p>
          )}
        </section>
        <section>
          <h4>Requerimientos</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KV k="Fórmula" v={F.n} />
            <KV k="Peso de cálculo" v={c.wCalc != null ? f1(c.wCalc) + ' kg' : ''} />
            <KV
              k={c.kgMode ? 'Energía por kilo' : 'GEB × AF × FE'}
              v={c.geb != null ? (c.kgMode ? `${p.req.kcalkg} kcal/kg → ${f0(c.geb)} kcal` : `${f0(c.geb)} × ${c.af} × ${c.fe} = ${f0(c.get)} kcal`) : ''}
            />
            <div>
              <div className="eyebrow" style={{ fontSize: '.64rem' }}>VCT</div>
              <div className="num text-xl">{f0(c.vct)}<span className="text-xs text-muted ml-1">kcal</span></div>
            </div>
          </div>
          {m && (
            <div className="overflow-x-auto mt-4">
              <table className="tbl" style={{ minWidth: '26rem' }}>
                <thead>
                  <tr>
                    <th>Macronutriente</th>
                    <th className="r">Gramos</th>
                    <th className="r">kcal</th>
                    <th className="r">% VCT</th>
                    <th className="r">g/kg</th>
                  </tr>
                </thead>
                <tbody>
                  {[['p', 'Proteínas'], ['c', 'Carbohidratos'], ['l', 'Lípidos']].map(([k, n]) => (
                    <tr key={k}>
                      <td>{n}</td>
                      <td className="r num">{f0(m[k].g)}</td>
                      <td className="r num">{f0(m[k].kcal)}</td>
                      <td className="r num">{f1(m[k].pct)}</td>
                      <td className="r num">{f2(m[k].gkg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="hint">Fibra sugerida {f0(c.fibra)} g/día{c.liquidos ? ` · Líquidos ${f0(c.liquidos)} mL/día`: ''}</p>
            </div>
          )}
        </section>
        <section>
          <h4>Plan nutricional</h4>
          {p.plan.objetivos && <div className="mb-4"><KV k="Objetivos" v={p.plan.objetivos} /></div>}
          {T.tot.eq > 0 ? (
            <div className="overflow-x-auto">
              <table className="tbl" style={{ minWidth: '42rem' }}>
                <thead>
                  <tr>
                    <th>Grupo</th>
                    {MEALS.map(([k, n]) => <th key={k} style={{ textAlign: 'center' }}>{n}</th>)}
                    <th className="r">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {T.rows.filter(r => r.tot > 0).map(r => (
                    <tr key={r.g.k}>
                      <td>{r.g.n}</td>
                      {r.eq.map((e, i) => <td key={i} style={{ textAlign: 'center' }} className="num">{e || '·'}</td>)}
                      <td className="r num">{r.tot}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Aporte (kcal)</td>
                    {T.meal.map((x, i) => <td key={i} style={{ textAlign: 'center' }} className="num">{f0(x.kcal)}</td>)}
                    <td className="r num">{f0(T.tot.kcal)}</td>
                  </tr>
                </tfoot>
              </table>
              <p className="hint">Total del plan: {f0(T.tot.kcal)} kcal · P {f0(T.tot.P)} g · CHO {f0(T.tot.C)} g · L {f0(T.tot.L)} g</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Sin distribución de equivalentes.</p>
          )}
          {MEALS.some(([k]) => p.plan.menu[k]) && (
            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              {MEALS.filter(([k]) => p.plan.menu[k]).map(([k, n]) => <KV key={k} k={'Menú · ' + n} v={p.plan.menu[k]} />)}
            </div>
          )}
          {p.plan.recs && (
            <div className="mt-4">
              <div className="eyebrow mb-1" style={{ fontSize: '.64rem' }}>Recomendaciones</div>
              <ul className="list-disc pl-5 text-sm grid gap-1">
                {p.plan.recs.split('\n').filter(Boolean).map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <KV k="Indicadores de seguimiento" v={p.plan.indicadores} />
            <KV k="Próxima cita" v={p.plan.proxima} />
          </div>
          {p.plan.seg.length > 0 && (
            <div className="mt-4">
              <div className="eyebrow mb-1" style={{ fontSize: '.64rem' }}>Evolución del peso</div>
              <div className="text-sm num">{p.plan.seg.map(s => `${s.fecha}: ${f1(num(s.peso))} kg`).join('  ·  ')}</div>
            </div>
          )}
        </section>
        <footer className="grid gap-8 sm:grid-cols-2 pt-6 mt-2">
          <div className="border-t border-line pt-2 text-sm text-muted">Nutricionista</div>
          <div className="border-t border-line pt-2 text-sm text-muted">Firma y sello</div>
        </footer>
      </article>
    </div>
  );
}

// Modal de Base de Datos en la Nube (Supabase)
function CloudModal({ isOpen, onClose, patients, onPatientsUpdated }) {
  const [config, setConfig] = useState(getCloudConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveCloudConfig(config);
    setTestResult({ success: true, message: 'Configuración guardada en este navegador.' });
  };

  const handleTest = async () => {
    saveCloudConfig(config);
    setTesting(true);
    setTestResult(null);
    const res = await testCloudConnection();
    setTesting(false);
    if (res.success) {
      setTestResult({ success: true, message: '¡Conexión exitosa con la base de datos Supabase!' });
    } else {
      setTestResult({ success: false, message: res.error, needTable: res.needTable });
    }
  };

  const handlePush = async () => {
    saveCloudConfig(config);
    setSyncing(true);
    setSyncMessage(null);
    const res = await syncAllPatientsToCloud(patients);
    setSyncing(false);
    if (res.success) {
      setSyncMessage({ success: true, text: `¡Se subieron ${res.count} pacientes a Supabase!` });
    } else {
      setSyncMessage({ success: false, text: `Error al subir: ${res.error}` });
    }
  };

  const handlePull = async () => {
    saveCloudConfig(config);
    setSyncing(true);
    setSyncMessage(null);
    const res = await fetchAllPatientsFromCloud();
    setSyncing(false);
    if (res.success) {
      if (res.patients.length > 0) {
        onPatientsUpdated(res.patients);
        setSyncMessage({ success: true, text: `¡Se descargaron ${res.patients.length} pacientes desde Supabase!` });
      } else {
        setSyncMessage({ success: false, text: 'No hay pacientes guardados en la base de datos en la nube.' });
      }
    } else {
      setSyncMessage({ success: false, text: `Error al descargar: ${res.error}` });
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-brand" />
            <h3 className="h3 mb-0">Base de Datos en la Nube (Supabase)</h3>
          </div>
          <button className="btn btn-sm p-1" onClick={onClose} aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted mb-4">
          Conecta tu proyecto con una base de datos PostgreSQL gratuita en <strong>Supabase</strong> para que tus pacientes se sincronicen en tiempo real y no dependan únicamente del almacenamiento local del navegador.
        </p>

        <div className="grid gap-3 mb-4">
          <Field label="URL del Proyecto Supabase" hint="Ejemplo: https://xyzcompany.supabase.co">
            <input
              className="inp text-sm"
              placeholder="https://TU_PROYECTO.supabase.co"
              value={config.url}
              onChange={e => setConfig({ ...config, url: e.target.value })}
            />
          </Field>

          <Field label="Supabase Anon / Public Key" hint="Encuéntrala en Supabase > Project Settings > API > Project API Keys > anon public">
            <input
              type="password"
              className="inp text-sm"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={config.key}
              onChange={e => setConfig({ ...config, key: e.target.value })}
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <button className="btn btn-primary btn-sm" onClick={handleTest} disabled={testing || !config.url || !config.key}>
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              Probar conexión
            </button>
            <button className="btn btn-sm" onClick={handleSave}>Guardar credenciales</button>
          </div>

          {testResult && (
            <div className={`p-3 rounded text-xs ${testResult.success ? 'bg-ok-soft text-ok' : 'bg-crit-soft text-crit'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Acciones de Sincronización */}
        <div className="p-3 bg-sunken rounded-md border border-line mb-4">
          <div className="eyebrow mb-2">Acciones de Sincronización</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-sm btn-primary flex-1" onClick={handlePush} disabled={syncing || !config.url || !config.key}>
              <Upload className="w-3.5 h-3.5" /> Subir ({patients.length}) a la nube
            </button>
            <button className="btn btn-sm flex-1" onClick={handlePull} disabled={syncing || !config.url || !config.key}>
              <Download className="w-3.5 h-3.5" /> Descargar de la nube
            </button>
          </div>

          {syncMessage && (
            <div className={`mt-2 p-2 rounded text-xs ${syncMessage.success ? 'bg-ok-soft text-ok' : 'bg-crit-soft text-crit'}`}>
              {syncMessage.text}
            </div>
          )}
        </div>

        {/* Script SQL para crear tabla */}
        <div className="border-t border-line pt-3">
          <button
            className="text-xs text-brand flex items-center justify-between w-full font-medium"
            onClick={() => setShowSql(!showSql)}
          >
            <span>¿Primera vez configurando Supabase? Ver script SQL</span>
            <span>{showSql ? '− Ocultar' : '+ Mostrar'}</span>
          </button>

          {showSql && (
            <div className="mt-2">
              <p className="text-[11px] text-muted mb-2">
                Copia y pega este script en el menú <strong>SQL Editor</strong> de tu panel de Supabase y presiona "Run":
              </p>
              <pre className="p-2.5 rounded bg-surface border border-line text-[11px] overflow-x-auto num max-h-36">
                {SQL_SETUP_SCRIPT}
              </pre>
              <button className="btn btn-sm text-xs mt-2 w-full" onClick={copySql}>
                {copiedSql ? <CheckIcon className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? '¡Copiado al portapapeles!' : 'Copiar Script SQL'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 text-right">
          <button className="btn btn-sm" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const formatTimeHHMM = () => {
  const d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
};

export default function App() {
  const [state, setState] = useState(loadState);
  const [tab, setTab] = useState('paciente');
  const [sub, setSub] = useState('A');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [isCloudOpen, setIsCloudOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved_local');
  const [lastSavedAt, setLastSavedAt] = useState(formatTimeHHMM);
  const isCloudActive = isCloudConfigured();

  // Gestión del tema (Modo claro / oscuro)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const p = state.patients.find(x => x.id === state.activeId) || state.patients[0];

  // Guardado automático en localStorage y sincronización en segundo plano con Supabase (si está configurada)
  useEffect(() => {
    setSaveStatus('saving');
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      const nowStr = formatTimeHHMM();
      setLastSavedAt(nowStr);
      if (!isCloudConfigured()) {
        setSaveStatus('saved_local');
        return;
      }
    } catch (e) {
      setSaveStatus('error');
      return;
    }

    // Si Supabase está configurado, sincronizar el paciente activo con debounce de 1.2s
    setSaveStatus('syncing_cloud');
    const timer = setTimeout(async () => {
      try {
        const res = await savePatientToCloud(p);
        if (res.success) {
          setLastSavedAt(formatTimeHHMM());
          setSaveStatus('saved_cloud');
        } else {
          setSaveStatus('saved_local');
        }
      } catch (err) {
        setSaveStatus('saved_local');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [state, p]);

  // Prevenir cierre accidental de la pestaña si hay un guardado o sincronización en curso
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'saving' || saveStatus === 'syncing_cloud') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  const upd = useCallback(fn => setState(s => ({
    ...s,
    patients: s.patients.map(x => x.id === s.activeId ? fn(x) : x)
  })), []);

  const set = useCallback((path, val) => upd(x => setIn(x, path, val)), [upd]);
  const c = useMemo(() => calc(p), [p]);
  const setActive = id => setState(s => ({ ...s, activeId: id }));

  const addP = () => {
    const b = blankPatient();
    setState(s => ({ patients: [...s.patients, b], activeId: b.id }));
    setTab('paciente');
  };

  const removeP = () => setState(s => {
    const rest = s.patients.filter(x => x.id !== s.activeId);
    if (!rest.length) {
      const b = blankPatient();
      return { patients: [b], activeId: b.id };
    }
    return { patients: rest, activeId: rest[0].id };
  });

  // Exportar respaldo JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nutriclinica_respaldo_${today()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar respaldo JSON
  const handleImportJson = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && Array.isArray(parsed.patients) && parsed.patients.length) {
          const validPatients = parsed.patients.map(x => merge(blankPatient(), x));
          setState({
            patients: validPatients,
            activeId: validPatients.some(x => x.id === parsed.activeId) ? parsed.activeId : validPatients[0].id
          });
          alert(`¡Respaldo importado exitosamente con ${validPatients.length} pacientes!`);
        } else if (Array.isArray(parsed) && parsed.length) {
          const validPatients = parsed.map(x => merge(blankPatient(), x));
          setState({
            patients: validPatients,
            activeId: validPatients[0].id
          });
          alert(`¡Respaldo importado exitosamente con ${validPatients.length} pacientes!`);
        } else {
          alert('El archivo JSON no contiene una estructura válida de pacientes.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Cuando se sincroniza desde Supabase
  const handlePatientsFromCloud = cloudPatients => {
    const valid = cloudPatients.map(x => merge(blankPatient(), x));
    setState(s => ({
      patients: valid,
      activeId: valid.some(x => x.id === s.activeId) ? s.activeId : valid[0].id
    }));
  };

  const ctx = useMemo(() => ({ p, c, set, upd }), [p, c, set, upd]);

  return (
    <Ctx.Provider value={ctx}>
      <Header
        tab={tab}
        setTab={setTab}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenCloud={() => setIsCloudOpen(true)}
        isCloudActive={isCloudActive}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
      />
      <div className="print-layout mx-auto max-w-[1400px] px-4 sm:px-6 py-5 grid gap-5 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <Sidebar
          state={state}
          setActive={setActive}
          addP={addP}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onOpenCloud={() => setIsCloudOpen(true)}
          isCloudActive={isCloudActive}
        />
        <main className="min-w-0" key={p.id}>
          {tab === 'paciente' && <TabPaciente removeP={removeP} />}
          {tab === 'valoracion' && <TabValoracion sub={sub} setSub={setSub} />}
          {tab === 'req' && <TabReq />}
          {tab === 'pes' && <TabPES />}
          {tab === 'plan' && <TabPlan />}
          {tab === 'reporte' && <TabReporte />}
          <p className="hint mt-6 no-print">Herramienta de apoyo para profesionales de la nutrición clínica. Los cálculos son orientativos y no reemplazan el juicio clínico.</p>
        </main>
      </div>

      <CloudModal
        isOpen={isCloudOpen}
        onClose={() => setIsCloudOpen(false)}
        patients={state.patients}
        onPatientsUpdated={handlePatientsFromCloud}
      />
    </Ctx.Provider>
  );
}
