// Base de Datos y Motor Matemático de Gráficas de Crecimiento y Estado Nutricional
// Referencias:
// 1. MINSAL El Salvador / MINSAL Chile 2021: Gráfica de Evaluación Nutricional de la Embarazada según IMC
// 2. OMS 2006: Patrones de Crecimiento Infantil (0 a 5 años) - MINSAL Unidad de Nutrición
// 3. OMS 2007: Crecimiento y Desarrollo de Niños y Adolescentes (5 a 19 años) - MINSAL Unidad de Nutrición

// ==== 0. CÁLCULO DE EDAD EFECTIVA Y CLASIFICACIÓN DE GRUPO ====
export function getPatientEffectiveAge(edadYears, edadMonths) {
  const y = (edadYears !== null && edadYears !== undefined && edadYears !== '') ? parseFloat(String(edadYears).replace(',', '.')) : null;
  const m = (edadMonths !== null && edadMonths !== undefined && edadMonths !== '') ? parseFloat(String(edadMonths).replace(',', '.')) : null;

  if (y === null && m === null) {
    return {
      totalMonths: null,
      totalYears: null,
      group: null,
      isUnder2: false,
      is2to5: false,
      is5to19: false,
      isAdult: false,
      formattedAge: 'Edad no especificada'
    };
  }

  let totalMonths = 0;
  if (y !== null && m !== null) {
    totalMonths = y * 12 + m;
  } else if (y !== null) {
    totalMonths = y * 12;
  } else {
    totalMonths = m;
  }

  const totalYears = totalMonths / 12;

  const isUnder2 = totalMonths <= 24;
  const is2to5 = totalMonths > 24 && totalMonths < 60;
  const is5to19 = totalMonths >= 60 && totalYears <= 19;
  const isAdult = totalYears >= 19;

  let group = 'g1';
  let formattedAge = '';
  if (isAdult) {
    group = 'adult';
    formattedAge = `${Math.floor(totalYears)} años`;
  } else if (is5to19) {
    group = 'g3';
    formattedAge = `${Math.floor(totalYears)} años${totalMonths % 12 > 0 ? ` ${Math.round(totalMonths % 12)} m` : ''}`;
  } else if (is2to5) {
    group = 'g2';
    formattedAge = `${Math.floor(totalYears)} años ${Math.round(totalMonths % 12)} meses (${Math.round(totalMonths)} m)`;
  } else {
    group = 'g1';
    formattedAge = `${Math.round(totalMonths)} meses`;
  }

  return {
    totalMonths,
    totalYears,
    group,
    isUnder2,
    is2to5,
    is5to19,
    isAdult,
    formattedAge
  };
}

// Catálogo interactivo de 8 Gráficas Oficiales divididas en 3 grupos de edad
export const GROWTH_CHARTS_CATALOG = [
  {
    groupId: 'g1',
    groupName: 'Grupo 1: 0 a 24 meses',
    norma: 'OMS 2006 · MINSAL',
    ageRangeText: '0 a 24 meses (Lactantes menores y mayores)',
    minMonths: 0,
    maxMonths: 24,
    charts: [
      {
        id: 'g1_w_age',
        name: 'Peso para la Edad (P/E)',
        shortCode: 'P/E',
        groupId: 'g1',
        description: 'Vigilancia de ganancia de peso y desnutrición global en lactantes de 0 a 24 meses.',
        xKey: 'm',
        xLabel: 'Edad (Meses)',
        yLabel: 'Peso (kg)',
        unitX: 'meses',
        unitY: 'kg',
        minX: 0,
        maxX: 24,
        minY: 1.5,
        maxY: 16,
        dataKey: 'weightForAge'
      },
      {
        id: 'g1_l_age',
        name: 'Longitud para la Edad (L/E)',
        shortCode: 'L/E',
        groupId: 'g1',
        description: 'Evaluación del crecimiento lineal recumbente y desnutrición crónica (retardo en talla).',
        xKey: 'm',
        xLabel: 'Edad (Meses)',
        yLabel: 'Longitud (cm)',
        unitX: 'meses',
        unitY: 'cm',
        minX: 0,
        maxX: 24,
        minY: 40,
        maxY: 100,
        dataKey: 'lengthForAge'
      },
      {
        id: 'g1_hc_age',
        name: 'Perímetro Cefálico para la Edad (PC/E)',
        shortCode: 'PC/E',
        groupId: 'g1',
        description: 'Vigilancia del neurodesarrollo y detección precoz de microcefalia o macrocefalia.',
        xKey: 'm',
        xLabel: 'Edad (Meses)',
        yLabel: 'Perímetro Cefálico (cm)',
        unitX: 'meses',
        unitY: 'cm',
        minX: 0,
        maxX: 24,
        minY: 30,
        maxY: 54,
        dataKey: 'hcForAge'
      }
    ]
  },
  {
    groupId: 'g2',
    groupName: 'Grupo 2: 2 a menor de 5 años',
    norma: 'OMS 2006 · MINSAL',
    ageRangeText: '2 a menor de 5 años (24 a 59 meses)',
    minMonths: 24.01,
    maxMonths: 59.99,
    charts: [
      {
        id: 'g2_w_h',
        name: 'Peso para la Talla (P/T)',
        shortCode: 'P/T',
        groupId: 'g2',
        description: 'Estándar de oro para desnutrición aguda, emaciación, sobrepeso y obesidad sin sesgo de edad.',
        xKey: 'h',
        xLabel: 'Talla (cm)',
        yLabel: 'Peso (kg)',
        unitX: 'cm',
        unitY: 'kg',
        minX: 65,
        maxX: 120,
        minY: 6,
        maxY: 32,
        dataKey: 'weightForHeight'
      },
      {
        id: 'g2_h_age',
        name: 'Talla para la Edad (T/E)',
        shortCode: 'T/E',
        groupId: 'g2',
        description: 'Evaluación de estatura de pie y detección de retardo crónico de crecimiento.',
        xKey: 'y',
        xLabel: 'Edad (Años)',
        yLabel: 'Talla (cm)',
        unitX: 'años',
        unitY: 'cm',
        minX: 2,
        maxX: 5,
        minY: 75,
        maxY: 125,
        dataKey: 'heightForAge'
      },
      {
        id: 'g2_w_age',
        name: 'Peso para la Edad (P/E)',
        shortCode: 'P/E',
        groupId: 'g2',
        description: 'Vigilancia epidemiológica de bajo peso en niños preescolares de 2 a 5 años.',
        xKey: 'y',
        xLabel: 'Edad (Años)',
        yLabel: 'Peso (kg)',
        unitX: 'años',
        unitY: 'kg',
        minX: 2,
        maxX: 5,
        minY: 6,
        maxY: 30,
        dataKey: 'weightForAge'
      }
    ]
  },
  {
    groupId: 'g3',
    groupName: 'Grupo 3: 5 a 19 años',
    norma: 'OMS 2007 · MINSAL',
    ageRangeText: '5 a 19 años cumplidos (Niños, Niñas y Adolescentes)',
    minMonths: 60,
    maxMonths: 228,
    charts: [
      {
        id: 'g3_bmi_age',
        name: 'Índice de Masa Corporal para la Edad (IMC/E)',
        shortCode: 'IMC/E',
        groupId: 'g3',
        description: 'Diagnóstico de delgadez severa, delgadez, sobrepeso y obesidad en la edad escolar y adolescencia.',
        xKey: 'y',
        xLabel: 'Edad (Años)',
        yLabel: 'IMC (kg/m²)',
        unitX: 'años',
        unitY: 'kg/m²',
        minX: 5,
        maxX: 19,
        minY: 10,
        maxY: 36,
        dataKey: 'bmiForAge'
      },
      {
        id: 'g3_h_age',
        name: 'Talla para la Edad (T/E)',
        shortCode: 'T/E',
        groupId: 'g3',
        description: 'Evaluación del estirón puberal y talla final en niños y adolescentes de 5 a 19 años.',
        xKey: 'y',
        xLabel: 'Edad (Años)',
        yLabel: 'Talla (cm)',
        unitX: 'años',
        unitY: 'cm',
        minX: 5,
        maxX: 19,
        minY: 90,
        maxY: 200,
        dataKey: 'heightForAge'
      }
    ]
  }
];

// Helper para obtener la sugerencia de gráfica según la edad y sexo
export function getSuggestedChart(effectiveAge, sex = 'M') {
  const group = effectiveAge?.group;
  if (group === 'g1') {
    return {
      defaultChartId: 'g1_w_age',
      suggestedChartIds: ['g1_w_age', 'g1_l_age', 'g1_hc_age'],
      groupId: 'g1',
      groupName: 'Grupo 1: 0 a 24 meses (OMS 2006)',
      title: `Niñ${sex === 'F' ? 'as' : 'os'} 0 a 24 meses · OMS 2006`
    };
  }
  if (group === 'g2') {
    return {
      defaultChartId: 'g2_w_h',
      suggestedChartIds: ['g2_w_h', 'g2_h_age', 'g2_w_age'],
      groupId: 'g2',
      groupName: 'Grupo 2: 2 a menor de 5 años (OMS 2006)',
      title: `Niñ${sex === 'F' ? 'as' : 'os'} 2 a < 5 años · OMS 2006`
    };
  }
  // Grupo 3 o por defecto para pediatría / adolescencia
  return {
    defaultChartId: 'g3_bmi_age',
    suggestedChartIds: ['g3_bmi_age', 'g3_h_age'],
    groupId: 'g3',
    groupName: 'Grupo 3: 5 a 19 años (OMS 2007)',
    title: `Niñ${sex === 'F' ? 'as' : 'os'} y Adolescentes 5 a 19 años · OMS 2007`
  };
}

// ==== 1. CURVAS DE EVALUACIÓN NUTRICIONAL DE LA EMBARAZADA (ATALAH / MINSAL EL SALVADOR) ====
export const PREGNANCY_CUTOFFS = [
  { week: 6, bajo: 18.5, normal: 25.0, sobrepeso: 30.0 },
  { week: 8, bajo: 18.7, normal: 25.1, sobrepeso: 30.0 },
  { week: 10, bajo: 19.0, normal: 25.2, sobrepeso: 30.1 },
  { week: 12, bajo: 19.2, normal: 25.3, sobrepeso: 30.2 },
  { week: 14, bajo: 19.4, normal: 25.5, sobrepeso: 30.3 },
  { week: 16, bajo: 19.6, normal: 25.7, sobrepeso: 30.5 },
  { week: 18, bajo: 19.8, normal: 25.8, sobrepeso: 30.7 },
  { week: 20, bajo: 20.0, normal: 26.0, sobrepeso: 30.8 },
  { week: 22, bajo: 20.4, normal: 26.2, sobrepeso: 31.0 },
  { week: 24, bajo: 20.7, normal: 26.5, sobrepeso: 31.2 },
  { week: 26, bajo: 21.1, normal: 26.7, sobrepeso: 31.5 },
  { week: 28, bajo: 21.4, normal: 27.0, sobrepeso: 31.7 },
  { week: 30, bajo: 21.8, normal: 27.2, sobrepeso: 31.9 },
  { week: 32, bajo: 22.1, normal: 27.5, sobrepeso: 32.1 },
  { week: 34, bajo: 22.4, normal: 27.7, sobrepeso: 32.3 },
  { week: 36, bajo: 22.7, normal: 28.0, sobrepeso: 32.5 },
  { week: 38, bajo: 22.9, normal: 28.2, sobrepeso: 32.7 },
  { week: 40, bajo: 23.1, normal: 28.4, sobrepeso: 32.9 },
  { week: 42, bajo: 23.3, normal: 28.6, sobrepeso: 33.0 },
];

export function evaluatePregnancyStatus(week, imc, pregestWeight, heightM) {
  if (!week || !imc || week < 6 || week > 42) {
    return null;
  }
  // Interpolación de cortes según semana gestacional
  const sorted = [...PREGNANCY_CUTOFFS].sort((a, b) => a.week - b.week);
  let cLow, cHigh;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (week >= sorted[i].week && week <= sorted[i + 1].week) {
      cLow = sorted[i];
      cHigh = sorted[i + 1];
      break;
    }
  }
  if (!cLow) {
    if (week < sorted[0].week) { cLow = sorted[0]; cHigh = sorted[0]; }
    else { cLow = sorted[sorted.length - 1]; cHigh = sorted[sorted.length - 1]; }
  }

  const factor = cHigh.week === cLow.week ? 0 : (week - cLow.week) / (cHigh.week - cLow.week);
  const bajoCut = cLow.bajo + factor * (cHigh.bajo - cLow.bajo);
  const normCut = cLow.normal + factor * (cHigh.normal - cLow.normal);
  const sobreCut = cLow.sobrepeso + factor * (cHigh.sobrepeso - cLow.sobrepeso);

  let diagnosis = 'Normal';
  let level = 'ok';
  let zoneColor = '#10b981'; // green

  if (imc < bajoCut) {
    diagnosis = 'Bajo peso gestacional';
    level = 'crit';
    zoneColor = '#3b82f6'; // blue
  } else if (imc < normCut) {
    diagnosis = 'Estado nutricional normal';
    level = 'ok';
    zoneColor = '#10b981'; // green
  } else if (imc < sobreCut) {
    diagnosis = 'Sobrepeso gestacional';
    level = 'warn';
    zoneColor = '#f59e0b'; // amber
  } else {
    diagnosis = 'Obesidad gestacional';
    level = 'crit';
    zoneColor = '#ef4444'; // red
  }

  // Recomendación de ganancia total de peso según IOM / MINSAL
  let pregestImc = null;
  if (pregestWeight && heightM) {
    pregestImc = pregestWeight / (heightM * heightM);
  }
  const refImc = pregestImc || imc;
  let targetGain = '';
  let weeklyGainRate = '';

  if (refImc < 18.5) {
    targetGain = '12.5 – 18.0 kg';
    weeklyGainRate = '0.5 kg/semana (2do y 3er trimestre)';
  } else if (refImc < 25.0) {
    targetGain = '11.5 – 16.0 kg';
    weeklyGainRate = '0.4 kg/semana (2do y 3er trimestre)';
  } else if (refImc < 30.0) {
    targetGain = '7.0 – 11.5 kg';
    weeklyGainRate = '0.3 kg/semana (2do y 3er trimestre)';
  } else {
    targetGain = '5.0 – 9.0 kg';
    weeklyGainRate = '0.2 kg/semana (2do y 3er trimestre)';
  }

  return {
    week,
    imc,
    diagnosis,
    level,
    zoneColor,
    cuts: { bajoCut, normCut, sobreCut },
    pregestImc,
    targetGain,
    weeklyGainRate
  };
}

// ==== 2. REFERENCIAS OMS 2006: 0 A 24 MESES (PESO/EDAD, LONGITUD/EDAD, PERÍMETRO CEFÁLICO) ====
export const WHO_0_24_MONTHS = {
  F: { // Niñas
    weightForAge: [ // meses, -3DE, -2DE, 0 (Mediana), +2DE
      { m: 0, sd3neg: 2.0, sd2neg: 2.4, m0: 3.2, sd2pos: 4.2 },
      { m: 3, sd3neg: 4.0, sd2neg: 4.5, m0: 5.8, sd2pos: 7.5 },
      { m: 6, sd3neg: 5.3, sd2neg: 5.7, m0: 7.3, sd2pos: 9.3 },
      { m: 9, sd3neg: 6.1, sd2neg: 6.5, m0: 8.2, sd2pos: 10.4 },
      { m: 12, sd3neg: 6.7, sd2neg: 7.0, m0: 8.9, sd2pos: 11.5 },
      { m: 18, sd3neg: 7.7, sd2neg: 8.1, m0: 10.2, sd2pos: 13.0 },
      { m: 24, sd3neg: 8.5, sd2neg: 9.0, m0: 11.5, sd2pos: 14.8 },
    ],
    lengthForAge: [ // meses, -3DE (RS), -2DE (R), 0 (N), +2DE (A)
      { m: 0, sd3neg: 43.6, sd2neg: 45.4, m0: 49.1, sd2pos: 52.9 },
      { m: 3, sd3neg: 54.0, sd2neg: 55.6, m0: 59.8, sd2pos: 64.0 },
      { m: 6, sd3neg: 60.0, sd2neg: 61.2, m0: 65.7, sd2pos: 70.3 },
      { m: 9, sd3neg: 64.3, sd2neg: 65.3, m0: 70.1, sd2pos: 75.0 },
      { m: 12, sd3neg: 68.0, sd2neg: 68.9, m0: 74.0, sd2pos: 79.2 },
      { m: 18, sd3neg: 74.0, sd2neg: 74.9, m0: 80.7, sd2pos: 86.5 },
      { m: 24, sd3neg: 78.7, sd2neg: 80.0, m0: 86.4, sd2pos: 92.9 },
    ],
    hcForAge: [ // Perímetro Cefálico: meses, -2DE (MIC), 0 (N), +2DE (MAC)
      { m: 0, sd2neg: 31.7, m0: 33.9, sd2pos: 36.1 },
      { m: 3, sd2neg: 37.4, m0: 39.5, sd2pos: 41.7 },
      { m: 6, sd2neg: 40.2, m0: 42.2, sd2pos: 44.4 },
      { m: 12, sd2neg: 43.2, m0: 45.2, sd2pos: 47.3 },
      { m: 24, sd2neg: 45.4, m0: 47.2, sd2pos: 49.5 },
    ]
  },
  M: { // Niños
    weightForAge: [
      { m: 0, sd3neg: 2.1, sd2neg: 2.5, m0: 3.3, sd2pos: 4.4 },
      { m: 3, sd3neg: 4.4, sd2neg: 5.0, m0: 6.4, sd2pos: 8.0 },
      { m: 6, sd3neg: 5.9, sd2neg: 6.4, m0: 7.9, sd2pos: 9.8 },
      { m: 9, sd3neg: 6.7, sd2neg: 7.1, m0: 8.9, sd2pos: 11.0 },
      { m: 12, sd3neg: 7.4, sd2neg: 7.7, m0: 9.6, sd2pos: 12.0 },
      { m: 18, sd3neg: 8.4, sd2neg: 8.8, m0: 10.9, sd2pos: 13.7 },
      { m: 24, sd3neg: 9.1, sd2neg: 9.7, m0: 12.2, sd2pos: 15.3 },
    ],
    lengthForAge: [
      { m: 0, sd3neg: 44.2, sd2neg: 46.1, m0: 49.9, sd2pos: 53.7 },
      { m: 3, sd3neg: 55.6, sd2neg: 57.3, m0: 61.4, sd2pos: 65.5 },
      { m: 6, sd3neg: 61.9, sd2neg: 63.3, m0: 67.6, sd2pos: 71.9 },
      { m: 9, sd3neg: 66.2, sd2neg: 67.5, m0: 72.0, sd2pos: 76.5 },
      { m: 12, sd3neg: 69.8, sd2neg: 71.0, m0: 75.7, sd2pos: 80.5 },
      { m: 18, sd3neg: 76.2, sd2neg: 77.2, m0: 82.3, sd2pos: 87.8 },
      { m: 24, sd3neg: 81.0, sd2neg: 82.1, m0: 87.8, sd2pos: 93.9 },
    ],
    hcForAge: [
      { m: 0, sd2neg: 32.1, m0: 34.5, sd2pos: 36.9 },
      { m: 3, sd2neg: 38.3, m0: 40.5, sd2pos: 42.7 },
      { m: 6, sd2neg: 41.2, m0: 43.3, sd2pos: 45.5 },
      { m: 12, sd2neg: 44.2, m0: 46.1, sd2pos: 48.3 },
      { m: 24, sd2neg: 46.3, m0: 48.3, sd2pos: 50.4 },
    ]
  }
};

// ==== 3. REFERENCIAS OMS 2006: 2 A 5 AÑOS (PESO/TALLA, TALLA/EDAD, PESO/EDAD) ====
export const WHO_2_5_YEARS = {
  F: { // Niñas 2 a 5 años
    weightForAge: [ // Años, -3DE (DS), -2DE (D), 0 (N), +2DE
      { y: 2, sd3neg: 8.5, sd2neg: 9.0, m0: 11.5, sd2pos: 14.8 },
      { y: 2.5, sd3neg: 9.3, sd2neg: 9.9, m0: 12.7, sd2pos: 16.5 },
      { y: 3, sd3neg: 10.0, sd2neg: 10.8, m0: 13.9, sd2pos: 18.1 },
      { y: 3.5, sd3neg: 10.8, sd2neg: 11.6, m0: 15.0, sd2pos: 19.7 },
      { y: 4, sd3neg: 11.5, sd2neg: 12.3, m0: 16.1, sd2pos: 21.2 },
      { y: 4.5, sd3neg: 12.1, sd2neg: 13.0, m0: 17.2, sd2pos: 22.9 },
      { y: 5, sd3neg: 12.7, sd2neg: 13.7, m0: 18.2, sd2pos: 24.5 },
    ],
    weightForHeight: [ // Talla (cm), -3DE (DS), -2DE (D), 0 (N), +2DE (SP), +3DE (OB)
      { h: 75, sd3neg: 7.2, sd2neg: 7.8, m0: 9.1, sd2pos: 10.8, sd3pos: 11.9 },
      { h: 80, sd3neg: 8.1, sd2neg: 8.8, m0: 10.2, sd2pos: 12.1, sd3pos: 13.3 },
      { h: 85, sd3neg: 9.1, sd2neg: 9.8, m0: 11.5, sd2pos: 13.6, sd3pos: 15.0 },
      { h: 90, sd3neg: 10.1, sd2neg: 11.0, m0: 12.9, sd2pos: 15.3, sd3pos: 17.0 },
      { h: 95, sd3neg: 11.2, sd2neg: 12.2, m0: 14.3, sd2pos: 17.3, sd3pos: 19.2 },
      { h: 100, sd3neg: 12.3, sd2neg: 13.4, m0: 15.8, sd2pos: 19.4, sd3pos: 21.7 },
      { h: 105, sd3neg: 13.5, sd2neg: 14.8, m0: 17.5, sd2pos: 21.8, sd3pos: 24.5 },
      { h: 110, sd3neg: 14.8, sd2neg: 16.3, m0: 19.4, sd2pos: 24.4, sd3pos: 27.6 },
      { h: 115, sd3neg: 16.2, sd2neg: 17.9, m0: 21.4, sd2pos: 27.3, sd3pos: 31.0 },
      { h: 120, sd3neg: 17.7, sd2neg: 19.6, m0: 23.6, sd2pos: 30.5, sd3pos: 34.8 },
    ],
    heightForAge: [
      { y: 2, sd3neg: 78.7, sd2neg: 80.0, m0: 86.4, sd2pos: 92.9 },
      { y: 2.5, sd3neg: 82.5, sd2neg: 84.0, m0: 90.7, sd2pos: 97.5 },
      { y: 3, sd3neg: 86.0, sd2neg: 87.7, m0: 95.1, sd2pos: 102.5 },
      { y: 3.5, sd3neg: 89.4, sd2neg: 91.2, m0: 99.0, sd2pos: 106.8 },
      { y: 4, sd3neg: 92.5, sd2neg: 94.1, m0: 102.7, sd2pos: 111.3 },
      { y: 4.5, sd3neg: 95.4, sd2neg: 97.1, m0: 106.2, sd2pos: 115.2 },
      { y: 5, sd3neg: 98.4, sd2neg: 99.9, m0: 109.4, sd2pos: 118.9 },
    ]
  },
  M: { // Niños 2 a 5 años
    weightForAge: [
      { y: 2, sd3neg: 9.1, sd2neg: 9.7, m0: 12.2, sd2pos: 15.3 },
      { y: 2.5, sd3neg: 9.9, sd2neg: 10.5, m0: 13.3, sd2pos: 16.8 },
      { y: 3, sd3neg: 10.6, sd2neg: 11.3, m0: 14.3, sd2pos: 18.3 },
      { y: 3.5, sd3neg: 11.3, sd2neg: 12.0, m0: 15.3, sd2pos: 19.8 },
      { y: 4, sd3neg: 11.9, sd2neg: 12.7, m0: 16.3, sd2pos: 21.2 },
      { y: 4.5, sd3neg: 12.5, sd2neg: 13.4, m0: 17.3, sd2pos: 22.7 },
      { y: 5, sd3neg: 13.0, sd2neg: 14.1, m0: 18.3, sd2pos: 24.2 },
    ],
    weightForHeight: [
      { h: 75, sd3neg: 7.5, sd2neg: 8.1, m0: 9.4, sd2pos: 11.0, sd3pos: 12.0 },
      { h: 80, sd3neg: 8.5, sd2neg: 9.2, m0: 10.6, sd2pos: 12.4, sd3pos: 13.5 },
      { h: 85, sd3neg: 9.5, sd2neg: 10.3, m0: 11.9, sd2pos: 13.9, sd3pos: 15.2 },
      { h: 90, sd3neg: 10.5, sd2neg: 11.4, m0: 13.3, sd2pos: 15.6, sd3pos: 17.2 },
      { h: 95, sd3neg: 11.6, sd2neg: 12.6, m0: 14.7, sd2pos: 17.4, sd3pos: 19.3 },
      { h: 100, sd3neg: 12.7, sd2neg: 13.8, m0: 16.2, sd2pos: 19.4, sd3pos: 21.6 },
      { h: 105, sd3neg: 13.8, sd2neg: 15.1, m0: 17.8, sd2pos: 21.6, sd3pos: 24.2 },
      { h: 110, sd3neg: 15.1, sd2neg: 16.5, m0: 19.6, sd2pos: 24.1, sd3pos: 27.2 },
      { h: 115, sd3neg: 16.5, sd2neg: 18.2, m0: 21.6, sd2pos: 26.9, sd3pos: 30.5 },
      { h: 120, sd3neg: 18.0, sd2neg: 19.9, m0: 23.8, sd2pos: 30.0, sd3pos: 34.2 },
    ],
    heightForAge: [
      { y: 2, sd3neg: 81.0, sd2neg: 82.1, m0: 87.8, sd2pos: 93.9 },
      { y: 2.5, sd3neg: 84.5, sd2neg: 85.9, m0: 91.9, sd2pos: 98.4 },
      { y: 3, sd3neg: 88.0, sd2neg: 89.6, m0: 96.1, sd2pos: 103.3 },
      { y: 3.5, sd3neg: 91.2, sd2neg: 93.0, m0: 99.9, sd2pos: 107.5 },
      { y: 4, sd3neg: 94.2, sd2neg: 96.0, m0: 103.3, sd2pos: 111.7 },
      { y: 4.5, sd3neg: 97.0, sd2neg: 98.9, m0: 106.7, sd2pos: 115.5 },
      { y: 5, sd3neg: 99.9, sd2neg: 100.7, m0: 110.0, sd2pos: 119.2 },
    ]
  }
};

// ==== 4. REFERENCIAS OMS 2007: 5 A 19 AÑOS (IMC/EDAD, TALLA/EDAD) ====
export const WHO_5_19_YEARS = {
  F: { // Niñas y Adolescentes de 5 a 19 años
    bmiForAge: [ // años, -3DE (DS), -2DE (D), +1DE (SP), +2DE (OB), +3DE
      { y: 5, sd3neg: 11.8, sd2neg: 12.7, m0: 15.3, sd1pos: 16.9, sd2pos: 18.9, sd3pos: 21.5 },
      { y: 7, sd3neg: 11.9, sd2neg: 12.8, m0: 15.4, sd1pos: 17.3, sd2pos: 19.8, sd3pos: 23.3 },
      { y: 9, sd3neg: 12.2, sd2neg: 13.1, m0: 16.1, sd1pos: 18.3, sd2pos: 21.4, sd3pos: 26.0 },
      { y: 11, sd3neg: 12.7, sd2neg: 13.8, m0: 17.2, sd1pos: 19.9, sd2pos: 23.7, sd3pos: 29.1 },
      { y: 13, sd3neg: 13.4, sd2neg: 14.7, m0: 18.5, sd1pos: 21.6, sd2pos: 25.8, sd3pos: 31.7 },
      { y: 15, sd3neg: 14.1, sd2neg: 15.5, m0: 19.7, sd1pos: 23.1, sd2pos: 27.5, sd3pos: 33.4 },
      { y: 17, sd3neg: 14.5, sd2neg: 16.0, m0: 20.6, sd1pos: 24.2, sd2pos: 28.8, sd3pos: 34.6 },
      { y: 19, sd3neg: 14.7, sd2neg: 16.3, m0: 21.2, sd1pos: 25.0, sd2pos: 29.7, sd3pos: 35.5 },
    ],
    heightForAge: [
      { y: 5, sd3neg: 98.4, sd2neg: 100.7, m0: 109.4, sd2pos: 118.9, sd3pos: 123.6 },
      { y: 7, sd3neg: 109.8, sd2neg: 112.2, m0: 121.7, sd2pos: 131.9, sd3pos: 136.9 },
      { y: 9, sd3neg: 119.9, sd2neg: 122.5, m0: 132.8, sd2pos: 144.1, sd3pos: 149.7 },
      { y: 11, sd3neg: 129.5, sd2neg: 132.5, m0: 144.0, sd2pos: 156.4, sd3pos: 162.7 },
      { y: 13, sd3neg: 138.8, sd2neg: 142.1, m0: 153.8, sd2pos: 166.0, sd3pos: 172.1 },
      { y: 15, sd3neg: 144.4, sd2neg: 147.8, m0: 159.4, sd2pos: 171.1, sd3pos: 177.0 },
      { y: 17, sd3neg: 146.4, sd2neg: 149.8, m0: 161.4, sd2pos: 173.0, sd3pos: 178.8 },
      { y: 19, sd3neg: 146.9, sd2neg: 150.3, m0: 162.0, sd2pos: 173.6, sd3pos: 179.4 },
    ]
  },
  M: { // Niños y Adolescentes de 5 a 19 años
    bmiForAge: [
      { y: 5, sd3neg: 12.1, sd2neg: 13.0, m0: 15.3, sd1pos: 16.6, sd2pos: 18.3, sd3pos: 20.6 },
      { y: 7, sd3neg: 12.3, sd2neg: 13.1, m0: 15.5, sd1pos: 17.0, sd2pos: 19.0, sd3pos: 21.8 },
      { y: 9, sd3neg: 12.6, sd2neg: 13.5, m0: 16.1, sd1pos: 17.9, sd2pos: 20.5, sd3pos: 24.3 },
      { y: 11, sd3neg: 13.1, sd2neg: 14.1, m0: 17.2, sd1pos: 19.5, sd2pos: 22.9, sd3pos: 27.8 },
      { y: 13, sd3neg: 13.8, sd2neg: 14.9, m0: 18.5, sd1pos: 21.3, sd2pos: 25.2, sd3pos: 30.7 },
      { y: 15, sd3neg: 14.7, sd2neg: 16.0, m0: 20.0, sd1pos: 23.1, sd2pos: 27.2, sd3pos: 32.8 },
      { y: 17, sd3neg: 15.5, sd2neg: 16.9, m0: 21.4, sd1pos: 24.6, sd2pos: 28.9, sd3pos: 34.4 },
      { y: 19, sd3neg: 16.0, sd2neg: 17.6, m0: 22.2, sd1pos: 25.4, sd2pos: 29.7, sd3pos: 35.3 },
    ],
    heightForAge: [
      { y: 5, sd3neg: 99.9, sd2neg: 100.7, m0: 110.0, sd2pos: 119.2, sd3pos: 123.9 },
      { y: 7, sd3neg: 111.0, sd2neg: 113.4, m0: 121.7, sd2pos: 132.5, sd3pos: 137.4 },
      { y: 9, sd3neg: 120.5, sd2neg: 123.1, m0: 133.3, sd2pos: 144.1, sd3pos: 149.3 },
      { y: 11, sd3neg: 129.2, sd2neg: 132.3, m0: 143.5, sd2pos: 155.6, sd3pos: 161.4 },
      { y: 13, sd3neg: 139.5, sd2neg: 143.1, m0: 156.0, sd2pos: 169.5, sd3pos: 176.1 },
      { y: 15, sd3neg: 151.0, sd2neg: 155.1, m0: 169.0, sd2pos: 182.5, sd3pos: 189.0 },
      { y: 17, sd3neg: 157.0, sd2neg: 161.1, m0: 175.2, sd2pos: 188.4, sd3pos: 194.7 },
      { y: 19, sd3neg: 158.4, sd2neg: 162.5, m0: 176.5, sd2pos: 189.6, sd3pos: 195.9 },
    ]
  }
};

// Evaluador integral de pediatría / adolescencia (OMS 2006 / 2007)
export function evaluatePediatricNutrition({ ageYears, ageMonths, sex = 'M', weightKg, heightCm, hcCm }) {
  const gender = sex === 'F' ? 'F' : 'M';
  const effAge = getPatientEffectiveAge(ageYears, ageMonths);
  const months = effAge.totalMonths;
  const years = effAge.totalYears;

  if (months == null && years == null) {
    return { error: 'Falta la edad (años o meses) para evaluación pediátrica.' };
  }

  const results = {
    category: 'pediatrico',
    ageYears: years,
    ageMonths: months,
    effectiveAge: effAge,
    sex: gender,
    indicators: {},
    primaryDiagnosis: 'Evaluación en proceso',
    level: 'ok'
  };

  // 1. Grupo 0 a 24 meses
  if (effAge.isUnder2) {
    const data = WHO_0_24_MONTHS[gender];
    if (weightKg && data.weightForAge) {
      const interp = interpolateCurve(data.weightForAge, 'm', months);
      if (interp) {
        let diag = 'Peso Normal para la Edad (N)';
        let lvl = 'ok';
        if (weightKg < interp.sd3neg) { diag = 'Desnutrición Severa (DS)'; lvl = 'crit'; }
        else if (weightKg < interp.sd2neg) { diag = 'Desnutrición (D)'; lvl = 'warn'; }
        else if (weightKg > interp.sd2pos) { diag = 'Peso elevado para la edad'; lvl = 'warn'; }
        results.indicators.weightForAge = { value: weightKg, interp, diag, lvl, name: 'Peso para la Edad' };
      }
    }

    if (heightCm && data.lengthForAge) {
      const interp = interpolateCurve(data.lengthForAge, 'm', months);
      if (interp) {
        let diag = 'Longitud Normal (N)';
        let lvl = 'ok';
        if (heightCm < interp.sd3neg) { diag = 'Retardo Severo en el Crecimiento (RS)'; lvl = 'crit'; }
        else if (heightCm < interp.sd2neg) { diag = 'Retardo en el Crecimiento (R)'; lvl = 'warn'; }
        else if (heightCm > interp.sd2pos) { diag = 'Talla Alta (A)'; lvl = 'ok'; }
        results.indicators.heightForAge = { value: heightCm, interp, diag, lvl, name: 'Longitud para la Edad' };
      }
    }

    if (hcCm && data.hcForAge) {
      const interp = interpolateCurve(data.hcForAge, 'm', months);
      if (interp) {
        let diag = 'Perímetro Cefálico Normal (N)';
        let lvl = 'ok';
        if (hcCm < interp.sd2neg) { diag = 'Microcefalia (MIC) - Alerta 2° Nivel'; lvl = 'crit'; }
        else if (hcCm > interp.sd2pos) { diag = 'Macrocefalia (MAC) - Alerta 2° Nivel'; lvl = 'crit'; }
        results.indicators.hcForAge = { value: hcCm, interp, diag, lvl, name: 'Perímetro Cefálico para la Edad' };
      }
    }
  }

  // 2. Grupo 2 a 5 años (24 a 60 meses)
  else if (effAge.is2to5) {
    const data = WHO_2_5_YEARS[gender];
    if (weightKg && heightCm && data.weightForHeight) {
      const interp = interpolateCurve(data.weightForHeight, 'h', heightCm);
      if (interp) {
        let diag = 'Estado Nutricional Normal (N)';
        let lvl = 'ok';
        if (weightKg < interp.sd3neg) { diag = 'Desnutrición Aguda Severa (DS)'; lvl = 'crit'; }
        else if (weightKg < interp.sd2neg) { diag = 'Desnutrición Aguda (D)'; lvl = 'warn'; }
        else if (weightKg > interp.sd3pos) { diag = 'Obesidad (OB)'; lvl = 'crit'; }
        else if (weightKg > interp.sd2pos) { diag = 'Sobrepeso (SP)'; lvl = 'warn'; }
        results.indicators.weightForHeight = { value: weightKg, interp, diag, lvl, name: 'Peso para la Talla' };
      }
    }

    if (heightCm && data.heightForAge) {
      const interp = interpolateCurve(data.heightForAge, 'y', years);
      if (interp) {
        let diag = 'Talla Normal para la Edad (N)';
        let lvl = 'ok';
        if (heightCm < interp.sd3neg) { diag = 'Retardo Severo en Talla (RS)'; lvl = 'crit'; }
        else if (heightCm < interp.sd2neg) { diag = 'Retardo en Talla (R)'; lvl = 'warn'; }
        else if (heightCm > interp.sd2pos) { diag = 'Talla Alta (A)'; lvl = 'ok'; }
        results.indicators.heightForAge = { value: heightCm, interp, diag, lvl, name: 'Talla para la Edad' };
      }
    }

    if (weightKg && data.weightForAge) {
      const interp = interpolateCurve(data.weightForAge, 'y', years);
      if (interp) {
        let diag = 'Peso Normal para la Edad (N)';
        let lvl = 'ok';
        if (weightKg < interp.sd3neg) { diag = 'Desnutrición Severa (DS)'; lvl = 'crit'; }
        else if (weightKg < interp.sd2neg) { diag = 'Desnutrición (D)'; lvl = 'warn'; }
        else if (weightKg > interp.sd2pos) { diag = 'Peso elevado para la edad'; lvl = 'warn'; }
        results.indicators.weightForAge = { value: weightKg, interp, diag, lvl, name: 'Peso para la Edad' };
      }
    }
  }

  // 3. Grupo 5 a 19 años
  else if (effAge.is5to19) {
    const data = WHO_5_19_YEARS[gender];
    const imc = (weightKg && heightCm) ? weightKg / Math.pow(heightCm / 100, 2) : null;

    if (imc && data.bmiForAge) {
      const interp = interpolateCurve(data.bmiForAge, 'y', years);
      if (interp) {
        let diag = 'IMC Normal para la Edad (N)';
        let lvl = 'ok';
        if (imc < interp.sd3neg) { diag = 'Delgadez Severa (DS)'; lvl = 'crit'; }
        else if (imc < interp.sd2neg) { diag = 'Delgadez (D)'; lvl = 'warn'; }
        else if (imc > interp.sd2pos) { diag = 'Obesidad (O)'; lvl = 'crit'; }
        else if (imc > interp.sd1pos) { diag = 'Sobrepeso (SP)'; lvl = 'warn'; }
        results.indicators.bmiForAge = { value: imc, interp, diag, lvl, name: 'IMC para la Edad (OMS 2007)' };
      }
    }

    if (heightCm && data.heightForAge) {
      const interp = interpolateCurve(data.heightForAge, 'y', years);
      if (interp) {
        let diag = 'Talla Normal para la Edad (N)';
        let lvl = 'ok';
        if (heightCm < interp.sd3neg) { diag = 'Retardo Severo en Talla (RS)'; lvl = 'crit'; }
        else if (heightCm < interp.sd2neg) { diag = 'Retardo en Talla (R)'; lvl = 'warn'; }
        else if (heightCm > (interp.sd3pos || interp.sd2pos)) { diag = 'Talla Alta (A)'; lvl = 'ok'; }
        results.indicators.heightForAge = { value: heightCm, interp, diag, lvl, name: 'Talla para la Edad (OMS 2007)' };
      }
    }
  }

  // Determinar diagnóstico prioritario
  if (results.indicators.bmiForAge) {
    results.primaryDiagnosis = results.indicators.bmiForAge.diag;
    results.level = results.indicators.bmiForAge.lvl;
  } else if (results.indicators.weightForHeight) {
    results.primaryDiagnosis = results.indicators.weightForHeight.diag;
    results.level = results.indicators.weightForHeight.lvl;
  } else if (results.indicators.weightForAge) {
    results.primaryDiagnosis = results.indicators.weightForAge.diag;
    results.level = results.indicators.weightForAge.lvl;
  }

  return results;
}

// ==== EVALUADOR ESPECÍFICO PARA CUALQUIERA DE LAS 8 GRÁFICAS DEL CATÁLOGO ====
export function evaluateCatalogChart(chartId, { ageYears, ageMonths, sex = 'M', weightKg, heightCm, hcCm }) {
  const gender = sex === 'F' ? 'F' : 'M';
  const effAge = getPatientEffectiveAge(ageYears, ageMonths);

  // Buscar información de la gráfica en el catálogo
  let chartMeta = null;
  let chartGroup = null;
  for (const grp of GROWTH_CHARTS_CATALOG) {
    const found = grp.charts.find(c => c.id === chartId);
    if (found) {
      chartMeta = found;
      chartGroup = grp;
      break;
    }
  }

  if (!chartMeta) {
    chartMeta = GROWTH_CHARTS_CATALOG[2].charts[0]; // fallback IMC/E 5-19a
    chartGroup = GROWTH_CHARTS_CATALOG[2];
  }

  // Comprobar coincidencia con el grupo de edad del paciente
  const isAgeMismatch = effAge.group !== null && effAge.group !== chartGroup.groupId;
  let mismatchWarning = null;
  if (isAgeMismatch) {
    mismatchWarning = `Esta gráfica no corresponde al rango de edad actual del paciente (${effAge.formattedAge || 'sin edad'}). Está estandarizada para: ${chartGroup.ageRangeText}.`;
  }

  // Obtener datos crudos según indicador y sexo
  let rawData = [];
  let curves = [];
  let ptX = null;
  let ptY = null;
  let ptLabel = '';
  let diagnosis = 'Datos incompletos';
  let level = 'ok';
  let interp = null;
  let interpCutText = '';

  const imc = (weightKg && heightCm) ? weightKg / Math.pow(heightCm / 100, 2) : null;

  switch (chartMeta.id) {
    // ---- GRUPO 1: 0 A 24 MESES ----
    case 'g1_w_age': {
      rawData = WHO_0_24_MONTHS[gender].weightForAge;
      ptX = effAge.totalMonths;
      ptY = weightKg;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} m · ${ptY.toFixed(1)} kg` : '';
      curves = [
        { name: '+2 DE', points: rawData.map(p => ({ x: p.m, y: p.sd2pos })), color: '#dc2626' },
        { name: '0 (Mediana)', points: rawData.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (D)', points: rawData.map(p => ({ x: p.m, y: p.sd2neg })), color: '#ea580c' },
        { name: '-3 DE (DS)', points: rawData.map(p => ({ x: p.m, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'm', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} kg · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Desnutrición Severa (DS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Desnutrición (D)'; level = 'warn'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Peso elevado para la edad'; level = 'warn'; }
          else { diagnosis = 'Peso Normal para la Edad (N)'; level = 'ok'; }
        }
      }
      break;
    }

    case 'g1_l_age': {
      rawData = WHO_0_24_MONTHS[gender].lengthForAge;
      ptX = effAge.totalMonths;
      ptY = heightCm;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} m · ${ptY.toFixed(1)} cm` : '';
      curves = [
        { name: '+2 DE (A)', points: rawData.map(p => ({ x: p.m, y: p.sd2pos })), color: '#2563eb' },
        { name: '0 (N)', points: rawData.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (R)', points: rawData.map(p => ({ x: p.m, y: p.sd2neg })), color: '#ea580c' },
        { name: '-3 DE (RS)', points: rawData.map(p => ({ x: p.m, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'm', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} cm · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Retardo Severo en el Crecimiento (RS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Retardo en el Crecimiento (R)'; level = 'warn'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Talla Alta (A)'; level = 'ok'; }
          else { diagnosis = 'Longitud Normal (N)'; level = 'ok'; }
        }
      }
      break;
    }

    case 'g1_hc_age': {
      rawData = WHO_0_24_MONTHS[gender].hcForAge;
      ptX = effAge.totalMonths;
      ptY = hcCm;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} m · ${ptY.toFixed(1)} cm` : '';
      curves = [
        { name: '+2 DE (MAC)', points: rawData.map(p => ({ x: p.m, y: p.sd2pos })), color: '#dc2626' },
        { name: '0 (N)', points: rawData.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (MIC)', points: rawData.map(p => ({ x: p.m, y: p.sd2neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'm', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} cm · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd2neg) { diagnosis = 'Microcefalia (MIC) - Alerta 2° Nivel'; level = 'crit'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Macrocefalia (MAC) - Alerta 2° Nivel'; level = 'crit'; }
          else { diagnosis = 'Perímetro Cefálico Normal (N)'; level = 'ok'; }
        }
      }
      break;
    }

    // ---- GRUPO 2: 2 A MENOR DE 5 AÑOS ----
    case 'g2_w_h': {
      rawData = WHO_2_5_YEARS[gender].weightForHeight;
      ptX = heightCm;
      ptY = weightKg;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} cm · ${ptY.toFixed(1)} kg` : '';
      curves = [
        { name: '+3 DE (OB)', points: rawData.map(p => ({ x: p.h, y: p.sd3pos })), color: '#7f1d1d' },
        { name: '+2 DE (SP)', points: rawData.map(p => ({ x: p.h, y: p.sd2pos })), color: '#ea580c' },
        { name: '0 (N)', points: rawData.map(p => ({ x: p.h, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (D)', points: rawData.map(p => ({ x: p.h, y: p.sd2neg })), color: '#f59e0b' },
        { name: '-3 DE (DS)', points: rawData.map(p => ({ x: p.h, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'h', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} kg · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)} | +3DE: ${interp.sd3pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Desnutrición Aguda Severa (DS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Desnutrición Aguda (D)'; level = 'warn'; }
          else if (ptY > interp.sd3pos) { diagnosis = 'Obesidad (OB)'; level = 'crit'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Sobrepeso (SP)'; level = 'warn'; }
          else { diagnosis = 'Estado Nutricional Normal (N)'; level = 'ok'; }
        }
      }
      break;
    }

    case 'g2_h_age': {
      rawData = WHO_2_5_YEARS[gender].heightForAge;
      ptX = effAge.totalYears;
      ptY = heightCm;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} a · ${ptY.toFixed(1)} cm` : '';
      curves = [
        { name: '+2 DE (A)', points: rawData.map(p => ({ x: p.y, y: p.sd2pos })), color: '#2563eb' },
        { name: '0 (N)', points: rawData.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (R)', points: rawData.map(p => ({ x: p.y, y: p.sd2neg })), color: '#ea580c' },
        { name: '-3 DE (RS)', points: rawData.map(p => ({ x: p.y, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'y', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} cm · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Retardo Severo en Talla (RS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Retardo en Talla (R)'; level = 'warn'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Talla Alta (A)'; level = 'ok'; }
          else { diagnosis = 'Talla Normal para la Edad (N)'; level = 'ok'; }
        }
      }
      break;
    }

    case 'g2_w_age': {
      rawData = WHO_2_5_YEARS[gender].weightForAge;
      ptX = effAge.totalYears;
      ptY = weightKg;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} a · ${ptY.toFixed(1)} kg` : '';
      curves = [
        { name: '+2 DE', points: rawData.map(p => ({ x: p.y, y: p.sd2pos })), color: '#dc2626' },
        { name: '0 (N)', points: rawData.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (D)', points: rawData.map(p => ({ x: p.y, y: p.sd2neg })), color: '#ea580c' },
        { name: '-3 DE (DS)', points: rawData.map(p => ({ x: p.y, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'y', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} kg · [-2DE: ${interp.sd2neg.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Desnutrición Severa (DS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Desnutrición (D)'; level = 'warn'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Peso elevado para la edad'; level = 'warn'; }
          else { diagnosis = 'Peso Normal para la Edad (N)'; level = 'ok'; }
        }
      }
      break;
    }

    // ---- GRUPO 3: 5 A 19 AÑOS ----
    case 'g3_bmi_age': {
      rawData = WHO_5_19_YEARS[gender].bmiForAge;
      ptX = effAge.totalYears;
      ptY = imc;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} a · IMC ${ptY.toFixed(1)}` : '';
      curves = [
        { name: '+3 DE (OB Severa)', points: rawData.map(p => ({ x: p.y, y: p.sd3pos })), color: '#7f1d1d' },
        { name: '+2 DE (Obesidad)', points: rawData.map(p => ({ x: p.y, y: p.sd2pos })), color: '#b91c1c' },
        { name: '+1 DE (Sobrepeso)', points: rawData.map(p => ({ x: p.y, y: p.sd1pos })), color: '#ea580c' },
        { name: '0 (Normal)', points: rawData.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (Delgadez)', points: rawData.map(p => ({ x: p.y, y: p.sd2neg })), color: '#f59e0b' },
        { name: '-3 DE (Delgadez Severa)', points: rawData.map(p => ({ x: p.y, y: p.sd3neg })), color: '#7f1d1d' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'y', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} kg/m² · [-2DE: ${interp.sd2neg.toFixed(1)} | +1DE: ${interp.sd1pos.toFixed(1)} | +2DE: ${interp.sd2pos.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Delgadez Severa (DS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Delgadez (D)'; level = 'warn'; }
          else if (ptY > interp.sd2pos) { diagnosis = 'Obesidad (OB)'; level = 'crit'; }
          else if (ptY > interp.sd1pos) { diagnosis = 'Sobrepeso (SP)'; level = 'warn'; }
          else { diagnosis = 'IMC Normal para la Edad (N)'; level = 'ok'; }
        }
      }
      break;
    }

    case 'g3_h_age': {
      rawData = WHO_5_19_YEARS[gender].heightForAge;
      ptX = effAge.totalYears;
      ptY = heightCm;
      ptLabel = ptX != null && ptY != null ? `${ptX.toFixed(1)} a · ${ptY.toFixed(1)} cm` : '';
      curves = [
        { name: '+3 DE (Talla Alta)', points: rawData.map(p => ({ x: p.y, y: p.sd3pos })), color: '#2563eb' },
        { name: '0 (Normal)', points: rawData.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
        { name: '-2 DE (Retardo en Talla)', points: rawData.map(p => ({ x: p.y, y: p.sd2neg })), color: '#ea580c' },
        { name: '-3 DE (Retardo Severo)', points: rawData.map(p => ({ x: p.y, y: p.sd3neg })), color: '#b91c1c' },
      ];
      if (ptX != null && ptY != null) {
        interp = interpolateCurve(rawData, 'y', ptX);
        if (interp) {
          interpCutText = `Mediana: ${interp.m0.toFixed(1)} cm · [-2DE: ${interp.sd2neg.toFixed(1)} | Mediana: ${interp.m0.toFixed(1)}]`;
          if (ptY < interp.sd3neg) { diagnosis = 'Retardo Severo en Talla (RS)'; level = 'crit'; }
          else if (ptY < interp.sd2neg) { diagnosis = 'Retardo en Talla (R)'; level = 'warn'; }
          else if (ptY > (interp.sd3pos || interp.sd2pos)) { diagnosis = 'Talla Alta (A)'; level = 'ok'; }
          else { diagnosis = 'Talla Normal para la Edad (N)'; level = 'ok'; }
        }
      }
      break;
    }
  }

  // Comprobar si el punto del paciente está en el rango graficable
  const hasPatientPoint = ptX != null && ptY != null &&
    ptX >= chartMeta.minX && ptX <= chartMeta.maxX &&
    ptY >= chartMeta.minY && ptY <= chartMeta.maxY;

  return {
    chartMeta,
    chartGroup,
    sex: gender,
    isAgeMismatch,
    mismatchWarning,
    curves,
    ptX,
    ptY,
    ptLabel,
    hasPatientPoint,
    interp,
    interpCutText,
    diagnosis,
    level,
    imc
  };
}

export function interpolateCurve(list, keyX, valX) {
  if (!list || !list.length) return null;
  const sorted = [...list].sort((a, b) => a[keyX] - b[keyX]);
  if (valX <= sorted[0][keyX]) return sorted[0];
  if (valX >= sorted[sorted.length - 1][keyX]) return sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (valX >= a[keyX] && valX <= b[keyX]) {
      const factor = (valX - a[keyX]) / (b[keyX] - a[keyX]);
      const res = {};
      for (const k in a) {
        if (typeof a[k] === 'number') {
          res[k] = a[k] + factor * (b[k] - a[k]);
        } else {
          res[k] = a[k];
        }
      }
      return res;
    }
  }
  return sorted[sorted.length - 1];
}
