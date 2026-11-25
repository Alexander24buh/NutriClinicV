/**
 * Normativa Oficial RIISS MINSAL (El Salvador) / INCAP 2012 (Segunda Edición)
 * Fuente: Menchú, M., Torún, B. y Elías, L. G. Recomendaciones Nutricionales del INCAP, Guatemala. INCAP, 2012.
 * Lineamientos Técnicos para la Prescripción de Dietas en Hospitales de la RIISS (MINSAL 2014)
 *
 * Tablas de Requerimientos de Calorías y Proteínas (Anexos 1A y 1B),
 * con cálculo y cuadre exacto de Carbohidratos y Lípidos según patología, edad y sexo.
 */

// 1. ANEXO No. 1A: NIÑOS Y NIÑAS DE 0 A 9.9 AÑOS
export const RIISS_PEDIATRIC_TABLE = [
  // 0 a 11.9 meses
  { label: '0 a 2.9 meses', minMeses: 0, maxMeses: 2.99, pesoRef: 4.3, kcalKg: 102, kcalTotal: 440, protKg: 1.64, protTotal: 8 },
  { label: '3 a 5.9 meses', minMeses: 3, maxMeses: 5.99, pesoRef: 6.7, kcalKg: 82, kcalTotal: 550, protKg: 1.25, protTotal: 8 },
  { label: '6 a 8.9 meses', minMeses: 6, maxMeses: 8.99, pesoRef: 7.9, kcalKg: 79, kcalTotal: 620, protKg: 1.76, protTotal: 14 },
  { label: '9 a 11.9 meses', minMeses: 9, maxMeses: 11.99, pesoRef: 8.8, kcalKg: 80, kcalTotal: 700, protKg: 1.76, protTotal: 16 },

  // 1 a 4.9 años
  { label: '1 a 1.9 años', minAnos: 1, maxAnos: 1.99, pesoRef: 10.6, kcalKg: 81, kcalTotal: 850, protKg: 1.54, protTotal: 16 },
  { label: '2 a 2.9 años', minAnos: 2, maxAnos: 2.99, pesoRef: 13.0, kcalKg: 83, kcalTotal: 1075, protKg: 1.31, protTotal: 17 },
  { label: '3 a 3.9 años', minAnos: 3, maxAnos: 3.99, pesoRef: 15.2, kcalKg: 79, kcalTotal: 1200, protKg: 1.21, protTotal: 18 },
  { label: '4 a 4.9 años', minAnos: 4, maxAnos: 4.99, pesoRef: 17.3, kcalKg: 76, kcalTotal: 1300, protKg: 1.16, protTotal: 20 },

  // 5 a 9.9 años
  { label: '5 a 5.9 años', minAnos: 5, maxAnos: 5.99, pesoRef: 18.3, kcalKg: 74, kcalTotal: 1350, protKg: 1.14, protTotal: 21 },
  { label: '6 a 6.9 años', minAnos: 6, maxAnos: 6.99, pesoRef: 20.4, kcalKg: 73, kcalTotal: 1475, protKg: 1.20, protTotal: 24 },
  { label: '7 a 7.9 años', minAnos: 7, maxAnos: 7.99, pesoRef: 22.6, kcalKg: 71, kcalTotal: 1600, protKg: 1.23, protTotal: 28 },
  { label: '8 a 8.9 años', minAnos: 8, maxAnos: 8.99, pesoRef: 25.0, kcalKg: 69, kcalTotal: 1725, protKg: 1.24, protTotal: 31 },
  { label: '9 a 9.9 años', minAnos: 9, maxAnos: 9.99, pesoRef: 27.6, kcalKg: 67, kcalTotal: 1850, protKg: 1.24, protTotal: 34 }
];

// 2. ANEXO No. 1B: ADOLESCENTES Y ADULTOS
export const RIISS_ADULT_TABLE = {
  M: [
    { label: '10 a 11.9 años', minAnos: 10, maxAnos: 11.99, tallaRef: 1.38, pesoRef: 32, kcalKg: 54, kcalTotal: 1750, protKg: 1.23, protTotal: 40 },
    { label: '12 a 13.9 años', minAnos: 12, maxAnos: 13.99, tallaRef: 1.50, pesoRef: 41, kcalKg: 50, kcalTotal: 2075, protKg: 1.21, protTotal: 50 },
    { label: '14 a 15.9 años', minAnos: 14, maxAnos: 15.99, tallaRef: 1.63, pesoRef: 53, kcalKg: 47, kcalTotal: 2450, protKg: 1.19, protTotal: 63 },
    { label: '16 a 17.9 años', minAnos: 16, maxAnos: 17.99, tallaRef: 1.69, pesoRef: 61, kcalKg: 44, kcalTotal: 2625, protKg: 1.16, protTotal: 70 },
    { label: '18 a 29.9 años', minAnos: 18, maxAnos: 29.99, tallaRef: 1.70, pesoRef: 64, kcalKg: 41, kcalTotal: 2600, protKg: 1.12, protTotal: 71 },
    { label: '30 a 59.9 años', minAnos: 30, maxAnos: 59.99, tallaRef: 1.70, pesoRef: 64, kcalKg: 39, kcalTotal: 2500, protKg: 1.12, protTotal: 71 },
    { label: '60 años y más', minAnos: 60, maxAnos: 150, tallaRef: 1.70, pesoRef: 64, kcalKg: 33, kcalTotal: 2100, protKg: 1.12, protTotal: 71 }
  ],
  F: [
    { label: '10 a 11.9 años', minAnos: 10, maxAnos: 11.99, tallaRef: 1.39, pesoRef: 33, kcalKg: 48, kcalTotal: 1600, protKg: 1.22, protTotal: 41 },
    { label: '12 a 13.9 años', minAnos: 12, maxAnos: 13.99, tallaRef: 1.50, pesoRef: 42, kcalKg: 43, kcalTotal: 1825, protKg: 1.19, protTotal: 51 },
    { label: '14 a 15.9 años', minAnos: 14, maxAnos: 15.99, tallaRef: 1.56, pesoRef: 49, kcalKg: 40, kcalTotal: 1925, protKg: 1.16, protTotal: 57 },
    { label: '16 a 17.9 años', minAnos: 16, maxAnos: 17.99, tallaRef: 1.57, pesoRef: 52, kcalKg: 38, kcalTotal: 1950, protKg: 1.12, protTotal: 58 },
    { label: '18 a 29.9 años', minAnos: 18, maxAnos: 29.99, tallaRef: 1.57, pesoRef: 55, kcalKg: 37, kcalTotal: 2050, protKg: 1.12, protTotal: 61 },
    { label: '30 a 59.9 años', minAnos: 30, maxAnos: 59.99, tallaRef: 1.57, pesoRef: 55, kcalKg: 37, kcalTotal: 2050, protKg: 1.12, protTotal: 61 },
    { label: '60 años y más', minAnos: 60, maxAnos: 150, tallaRef: 1.57, pesoRef: 55, kcalKg: 33, kcalTotal: 1800, protKg: 1.12, protTotal: 61 }
  ]
};

// 3. ADICIONALES DE GESTACIÓN Y LACTANCIA (INCAP 2012 / RIISS MINSAL)
export const RIISS_PREGNANCY_ADDITIONS = {
  t2: { label: 'Segundo trimestre', addKcal: 360, addProt: 13 },
  t3: { label: 'Tercer trimestre', addKcal: 475, addProt: 42 }
};

export const RIISS_LACTATION_ADDITIONS = {
  m0_6: { label: 'Primeros 6 meses', addKcal: 600, addProt: 26 },
  m7_12: { label: '7 a 12 meses', addKcal: 0, addProt: 18 }
};

// 4. DISTRIBUCIÓN DE MACRONUTRIENTES SEGÚN PATOLOGÍA Y DIETA RIISS
export const RIISS_PATHOLOGY_MACROS = {
  normal: {
    name: 'Dieta normal o corriente',
    targetLipidPct: 28, // Rango normativo 25 - 30%
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  blanda: {
    name: 'Dieta blanda',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  mec_suave: {
    name: 'Dieta mecánicamente suave',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  hipocalorica: {
    name: 'Dieta hipocalórica (Obesidad IMC > 26)',
    targetLipidPct: 25, // Rango 25 - 30%
    targetChoRange: [50, 55],
    targetProtRange: [15, 20],
    kcalModifier: (baseKcal, w) => {
      if (w) return Math.min(Math.max(w * 22, 1200), 1600);
      return 1350;
    }
  },
  hipercalorica: {
    name: 'Dieta hipercalórica (Hipermetabolismo)',
    targetLipidPct: 28,
    targetChoRange: [50, 55],
    targetProtRange: [15, 20],
    kcalModifier: (baseKcal, w) => {
      if (w) return Math.max(w * 38, 2400);
      return Math.max(baseKcal * 1.25, 2500);
    }
  },
  hiperproteica: {
    name: 'Dieta hiperproteica (Sepsis, Quemados, Cáncer, Desnutrición)',
    targetLipidPct: 27,
    targetChoRange: [50, 55],
    targetProtRange: [18, 25],
    protGkgTarget: 1.8 // RIISS pág 18: 1.5 a 2.0 g/kg/d
  },
  hipoproteica: {
    name: 'Dieta hipoproteica (ERC I-III, Falla hepática)',
    targetLipidPct: 32, // RIISS pág 20: grasa > 30%
    targetChoRange: [60, 70], // carbohidratos > 60%
    targetProtRange: [6, 10], // proteínas < 10%
    protGkgTarget: 0.7 // RIISS pág 20: 0.5 a 0.8 g/kg/d
  },
  alta_cho: {
    name: 'Dieta alta en carbohidratos (Cirrosis, estados febriles)',
    targetLipidPct: 18, // 15 - 20%
    targetChoRange: [65, 70],
    targetProtRange: [10, 15]
  },
  baja_cho: {
    name: 'Dieta baja en carbohidratos (EPOC, Hígado Graso, Triglicéridos)',
    targetLipidPct: 35, // 35%
    targetChoRange: [40, 40], // 40%
    targetProtRange: [25, 25] // 25%
  },
  baja_grasa: {
    name: 'Dieta baja en grasa (Hígado graso, Colelitiasis, Dislipidemia)',
    targetLipidPct: 22, // 20 - 25% (menos de 25%)
    targetChoRange: [55, 60],
    targetProtRange: [15, 20]
  },
  hiposodica: {
    name: 'Dieta hiposódica (HTA, ERC, Retención)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  baja_potasio: {
    name: 'Dieta baja en potasio (<1600 mg K)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  alta_potasio: {
    name: 'Dieta alta en potasio (3900 a 6825 mg K)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  baja_fosforo: {
    name: 'Dieta baja en fósforo (<800 mg P)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  alta_calcio: {
    name: 'Dieta alta en calcio (>1200 mg Ca)',
    targetLipidPct: 30,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  baja_calcio: {
    name: 'Dieta baja en calcio',
    targetLipidPct: 30,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  alta_fibra: {
    name: 'Dieta alta en fibra (>30 g fibra)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  baja_fibra: {
    name: 'Dieta baja en fibra (<20 g fibra)',
    targetLipidPct: 28,
    targetChoRange: [55, 60],
    targetProtRange: [10, 15]
  },
  libre_gluten: {
    name: 'Dieta libre de gluten',
    targetLipidPct: 28,
    targetChoRange: [50, 60],
    targetProtRange: [10, 15]
  },
  liquidos_claros: {
    name: 'Dieta de líquidos claros',
    targetLipidPct: 0,
    targetChoRange: [97, 97],
    targetProtRange: [3, 3],
    fixedKcal: 650,
    fixedProtG: 8
  },
  liquidos_completos: {
    name: 'Dieta de líquidos completos',
    targetLipidPct: 32,
    targetChoRange: [50, 55],
    targetProtRange: [10, 15],
    fixedKcal: 1650
  }
};

/**
 * Busca la fila exacta de referencia en las tablas INCAP 2012 / RIISS
 */
export function lookupRiissReference(edadAnos, edadMeses, sexo = 'M', semGestacional = null, lactanciaEtapa = null) {
  const isFemale = sexo === 'F';
  const a = edadAnos != null ? edadAnos : 30;

  // 1. Población pediátrica 0 a 9.9 años (Anexo 1A)
  if (edadAnos != null && edadAnos < 10) {
    if (edadAnos < 1 || (edadMeses != null && edadMeses < 12 && (edadAnos == null || edadAnos === 0))) {
      const meses = edadMeses != null ? edadMeses : (edadAnos != null ? edadAnos * 12 : 5);
      const match = RIISS_PEDIATRIC_TABLE.find(item => item.minMeses !== undefined && meses >= item.minMeses && meses <= item.maxMeses)
        || RIISS_PEDIATRIC_TABLE[1];
      return {
        ...match,
        tablaOrigen: 'Anexo 1A: Niños/as 0 a 11.9 meses',
        grupoLabel: `${match.label} (Lactantes)`,
        additions: null
      };
    } else {
      const match = RIISS_PEDIATRIC_TABLE.find(item => item.minAnos !== undefined && a >= item.minAnos && a <= item.maxAnos)
        || RIISS_PEDIATRIC_TABLE[RIISS_PEDIATRIC_TABLE.length - 1];
      const subCat = a < 5 ? 'Niños/as de 1 a 4.9 años' : 'Niños/as de 5 a 9.9 años';
      return {
        ...match,
        tablaOrigen: `Anexo 1A: ${subCat}`,
        grupoLabel: `${match.label} (${match.pesoRef} kg ref.)`,
        additions: null
      };
    }
  }

  // 2. Adolescentes y Adultos (Anexo 1B)
  const tableList = RIISS_ADULT_TABLE[isFemale ? 'F' : 'M'];
  const match = tableList.find(item => a >= item.minAnos && a <= item.maxAnos)
    || tableList[tableList.length - 1];

  let additions = null;
  let extraLabel = '';

  // Gestación
  if (isFemale && semGestacional != null) {
    const sem = Number(semGestacional);
    if (sem >= 14 && sem < 28) {
      additions = { ...RIISS_PREGNANCY_ADDITIONS.t2, tipo: 'embarazo' };
      extraLabel = ' + Embarazo 2T (+360 kcal, +13g prot)';
    } else if (sem >= 28) {
      additions = { ...RIISS_PREGNANCY_ADDITIONS.t3, tipo: 'embarazo' };
      extraLabel = ' + Embarazo 3T (+475 kcal, +42g prot)';
    }
  }

  // Lactancia
  if (isFemale && !additions && lactanciaEtapa) {
    if (lactanciaEtapa === 'm0_6' || lactanciaEtapa === '6m' || lactanciaEtapa === true) {
      additions = { ...RIISS_LACTATION_ADDITIONS.m0_6, tipo: 'lactancia' };
      extraLabel = ' + Lactancia 1-6m (+600 kcal, +26g prot)';
    } else if (lactanciaEtapa === 'm7_12' || lactanciaEtapa === '12m') {
      additions = { ...RIISS_LACTATION_ADDITIONS.m7_12, tipo: 'lactancia' };
      extraLabel = ' + Lactancia 7-12m (+0 kcal, +18g prot)';
    }
  }

  return {
    ...match,
    tablaOrigen: `Anexo 1B: ${isFemale ? 'Mujeres' : 'Hombres'} (INCAP 2012)`,
    grupoLabel: `${match.label} (${isFemale ? 'Mujeres' : 'Hombres'})${extraLabel}`,
    additions
  };
}

/**
 * Calcula los requerimientos energéticos y de macronutrientes según la norma RIISS / INCAP 2012.
 * Adjudica calorías y proteínas según la tabla, y cuadra exactamente carbohidratos y lípidos.
 *
 * @param {Object} p - Paciente
 * @param {Object} c - Datos calculados clínicos
 * @param {Object} options - { baseMode: 'peso' | 'total' }
 * @returns {Object} Resultado con VCT, Kcal/kg, Proteínas, Carbohidratos y Lípidos cuadra al 100%
 */
export function calculateRiissEnergyAndMacros(p, c = {}, options = {}) {
  const g = p.gen || {};
  const cl = p.clin || {};
  const r = p.req || {};
  const sexo = g.sexo === 'F' ? 'F' : 'M';

  const num = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const edadAnos = num(g.edad);
  const edadMeses = num(g.edadMeses);
  const peso = c.wCalc || num(p.antro?.peso) || (sexo === 'F' ? 55 : 64);
  const semGest = num(g.semGestacional);
  const isEmbarazada = Boolean(c.isEmbarazada || (g.embarazada && sexo === 'F'));

  // Detectar etapa de lactancia
  let lactanciaEtapa = g.lactanciaEtapa || null;
  if (!lactanciaEtapa && g.lactancia) lactanciaEtapa = 'm0_6';
  const dxText = (g.dx || '').toLowerCase() + ' ' + (g.motivo || '').toLowerCase() + ' ' + (g.antecedentes || '').toLowerCase();
  if (!lactanciaEtapa && !isEmbarazada && sexo === 'F' && (dxText.includes('lactanc') || dxText.includes('puerperio'))) {
    lactanciaEtapa = 'm0_6';
  }

  // 1. Obtener la fila de referencia de la tabla INCAP 2012 / RIISS
  const ref = lookupRiissReference(edadAnos, edadMeses, sexo, isEmbarazada ? semGest : null, lactanciaEtapa);

  // 2. Determinar la patología o dieta terapéutica activa
  const activeDietKey = p.plan?.riss?.primaryDiet || 'normal';
  const dietRule = RIISS_PATHOLOGY_MACROS[activeDietKey] || RIISS_PATHOLOGY_MACROS.normal;

  // 3. Determinar el modo base: 'peso' (kcal/kg x peso) o 'total' (kcal totales de la tabla)
  const baseMode = options.baseMode || r.rissBaseMode || 'peso';

  // Adiciones por embarazo o lactancia
  const addKcal = ref.additions?.addKcal || 0;
  const addProt = ref.additions?.addProt || 0;

  // Calorías y proteínas calculadas según ambas modalidades
  const kcalByWeight = Math.round(peso * ref.kcalKg) + addKcal;
  const kcalByTable = ref.kcalTotal + addKcal;

  const protByWeight = Math.round((peso * ref.protKg) * 10) / 10 + addProt;
  const protByTable = ref.protTotal + addProt;

  // Selección de calorías y proteínas base según modo
  let baseKcal = baseMode === 'total' ? kcalByTable : kcalByWeight;
  let baseProtG = baseMode === 'total' ? protByTable : protByWeight;

  // 4. Modificaciones por Patología RIISS (dietas terapéuticas)
  let finalKcal = baseKcal;
  if (dietRule.fixedKcal) {
    finalKcal = dietRule.fixedKcal;
  } else if (dietRule.kcalModifier) {
    finalKcal = Math.round(dietRule.kcalModifier(baseKcal, peso));
  }

  let finalProtG = baseProtG;
  if (dietRule.fixedProtG) {
    finalProtG = dietRule.fixedProtG;
  } else if (dietRule.protGkgTarget) {
    finalProtG = Math.round(dietRule.protGkgTarget * peso * 10) / 10;
  }

  // 5. CÁLCULO Y CUADRE EXACTO DE LÍPIDOS Y CARBOHIDRATOS
  // a) Proteína:
  // Si la patología fija un % exacto (ej. baja en CHO fija 25%, hipoproteica < 10%)
  let protPct = Math.round(((finalProtG * 4) / finalKcal) * 1000) / 10;
  if (dietRule.targetProtRange && dietRule.targetProtRange[0] === dietRule.targetProtRange[1]) {
    protPct = dietRule.targetProtRange[0];
    finalProtG = Math.round(((finalKcal * (protPct / 100)) / 4) * 10) / 10;
  }

  const protKcal = Math.round(finalProtG * 4);

  // b) Lípidos: se asigna el porcentaje meta según la norma RIISS / patología
  let lipidPct = dietRule.targetLipidPct;
  let lipidKcal = Math.round(finalKcal * (lipidPct / 100));
  let lipidG = Math.round((lipidKcal / 9) * 10) / 10;

  // c) Carbohidratos: se calculan por diferencia exacta para que la suma sea exactamente 100% y cuadre con el VCT
  let choPct = Math.round((100 - protPct - lipidPct) * 10) / 10;
  if (choPct < 0) {
    choPct = 40;
    lipidPct = Math.max(0, Math.round((100 - protPct - choPct) * 10) / 10);
    lipidKcal = Math.round(finalKcal * (lipidPct / 100));
    lipidG = Math.round((lipidKcal / 9) * 10) / 10;
  }

  const choKcal = Math.round(finalKcal * (choPct / 100));
  const choG = Math.round((choKcal / 4) * 10) / 10;

  const totalKcalMacros = protKcal + choKcal + lipidKcal;
  const totalPct = Math.round((protPct + choPct + lipidPct) * 10) / 10;

  return {
    vct: finalKcal,
    kcalKg: Math.round((finalKcal / peso) * 10) / 10,
    pesoCalc: peso,
    grupoLabel: ref.grupoLabel,
    tablaOrigen: ref.tablaOrigen,
    dietaNombre: dietRule.name,
    dietaKey: activeDietKey,
    baseMode,
    refRow: {
      kcalKg: ref.kcalKg,
      kcalTotal: ref.kcalTotal,
      protKg: ref.protKg,
      protTotal: ref.protTotal,
      pesoRef: ref.pesoRef,
      tallaRef: ref.tallaRef,
      addKcal,
      addProt
    },
    comparative: {
      kcalByWeight,
      kcalByTable,
      protByWeight,
      protByTable
    },
    macros: {
      p: {
        g: Math.round(finalProtG * 10) / 10,
        gkg: Math.round((finalProtG / peso) * 100) / 100,
        kcal: protKcal,
        pct: protPct
      },
      c: {
        g: choG,
        gkg: Math.round((choG / peso) * 100) / 100,
        kcal: choKcal,
        pct: choPct
      },
      l: {
        g: lipidG,
        gkg: Math.round((lipidG / peso) * 100) / 100,
        kcal: lipidKcal,
        pct: lipidPct
      },
      totalKcal: totalKcalMacros,
      totalPct: totalPct
    }
  };
}
