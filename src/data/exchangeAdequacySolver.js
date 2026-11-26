// Motor Clínico de Adecuación y Recálculo Automático de Intercambios (95% - 105%)
// Resuelve la cuadratura exacta de Kcal, Carbohidratos, Proteínas y Lípidos según tabla_intercambios.xlsx
// y emite diagnósticos clínicos cuando las dietas RIISS o fórmulas presentan choques matemáticos.

import { EXCHANGE_GROUPS, MEAL_TIMES } from './exchangeDatabase.js';

// Matriz nutricional de referencia
const NUTRIENTS = {
  incaparina: { cho: 15, p: 4, l: 1, kcal: 85 },
  leche_dc: { cho: 12, p: 8, l: 2, kcal: 100 },
  leche_sd: { cho: 12, p: 8, l: 5, kcal: 120 },
  leche_entera: { cho: 12, p: 8, l: 8, kcal: 160 },
  veg_sa: { cho: 5, p: 2, l: 0, kcal: 25 },
  frutas: { cho: 15, p: 0, l: 0, kcal: 60 },
  almidones: { cho: 15, p: 3, l: 1, kcal: 80 },
  otros_cho: { cho: 15, p: 0, l: 0, kcal: 60 },
  prot_magra: { cho: 0, p: 7, l: 2, kcal: 45 },
  prot_sm: { cho: 0, p: 7, l: 5, kcal: 75 },
  prot_grasa: { cho: 0, p: 7, l: 8, kcal: 100 },
  grasas: { cho: 0, p: 0, l: 5, kcal: 45 }
};

// Calcula los totales y porcentajes de adecuación para un set de intercambios
export function evaluateAdequacy(totals, targets) {
  let totalCho = 0;
  let totalP = 0;
  let totalL = 0;

  Object.entries(totals).forEach(([groupKey, count]) => {
    const n = parseFloat(String(count).replace(',', '.')) || 0;
    if (n > 0 && NUTRIENTS[groupKey]) {
      totalCho += n * NUTRIENTS[groupKey].cho;
      totalP += n * NUTRIENTS[groupKey].p;
      totalL += n * NUTRIENTS[groupKey].l;
    }
  });

  const totalKcal = totalCho * 4 + totalP * 4 + totalL * 9;

  const targetCho = targets.cho || 1;
  const targetP = targets.p || 1;
  const targetL = targets.l || 1;
  const targetKcal = targets.kcal || 1;

  const adecCho = (totalCho / targetCho) * 100;
  const adecP = (totalP / targetP) * 100;
  const adecL = (totalL / targetL) * 100;
  const adecKcal = (totalKcal / targetKcal) * 100;

  const diffKcal = targetKcal - totalKcal;

  const inRangeCho = adecCho >= 95.0 && adecCho <= 105.0;
  const inRangeP = adecP >= 95.0 && adecP <= 105.0;
  const inRangeL = adecL >= 95.0 && adecL <= 105.0;
  const inRangeKcal = adecKcal >= 95.0 && adecKcal <= 105.0;

  const isAdequate = inRangeCho && inRangeP && inRangeL && inRangeKcal;

  // Puntuación de desviación cuadrática
  const deviationScore =
    Math.pow(adecCho - 100, 2) +
    Math.pow(adecP - 100, 2) +
    Math.pow(adecL - 100, 2) +
    Math.pow(adecKcal - 100, 2);

  return {
    totalCho,
    totalP,
    totalL,
    totalKcal,
    diffKcal,
    adecCho,
    adecP,
    adecL,
    adecKcal,
    inRangeCho,
    inRangeP,
    inRangeL,
    inRangeKcal,
    isAdequate,
    deviationScore
  };
}

// Analizador Clínico: Diagnostica por qué no cuadran los intercambios cuando la prescripción es extrema
export function diagnoseExchangeConflict(targets, rissData = {}) {
  const vct = targets.kcal || 1800;
  const targetCho = targets.cho || 225;
  const targetP = targets.p || 67.5;
  const targetL = targets.l || 56;

  const activeRiiss = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const isRenal = activeRiiss.some(d => d.includes('renal') || d.includes('hipoproteica'));
  const isLowFat = activeRiiss.includes('baja_grasa');
  const isLowCarb = activeRiiss.includes('baja_cho');
  const isHypocaloric = activeRiiss.includes('hipocalorica') || vct < 1400;

  const pctP = ((targetP * 4) / vct) * 100;
  const pctCho = ((targetCho * 4) / vct) * 100;
  const pctL = ((targetL * 9) / vct) * 100;

  // 1. Conflicto Renal Hipoproteico
  if (pctP < 12 || isRenal || targetP < 50) {
    // Calcular proteína obligatoria de los almidones necesarios para el VCT
    const minAlm = Math.max(6, Math.round((targetCho * 0.7) / 15));
    const protFromAlm = minAlm * 3;
    if (protFromAlm > targetP * 0.7) {
      return {
        conflict: true,
        type: 'renal_protein_saturation',
        title: 'Conflicto Clínico: Saturación de Proteína Vegetal por Almidones (Dieta Hipoproteica)',
        description: `En la prescripción hipoproteica (${pctP.toFixed(1)}% VCT / ${targetP.toFixed(0)}g proteína), los ${minAlm} intercambios de almidón necesarios para aportar los carbohidratos prescritos (${targetCho.toFixed(0)}g) aportan por sí solos ${protFromAlm}g de proteína vegetal (3g/porción).`,
        impact: `Esto deja un margen de solo ${(targetP - protFromAlm).toFixed(0)}g de proteína para lácteos, carnes y huevo, haciendo que cualquier ración adicional eleve la proteína por encima del 105% de adecuación.`,
        recommendations: [
          'Utilizar almidones modificados aproteicos (fécula de maíz, tapioca) o compensar calorías con azúcares simples medidos / miel y grasas cardiosaludables.',
          'Ajustar la meta de proteína en la prescripción a un mínimo fisiológico de 0.75 - 0.8 g/kg para permitir incluir alimentos de alto valor biológico.',
          'Reducir o sustituir los lácteos tradicionales por bebidas de arroz o almendra con bajo aporte de proteína y fósforo.'
        ]
      };
    }
  }

  // 2. Conflicto de Dieta Baja en Grasa (Colelitiasis, Dislipidemia, Pancreatitis)
  if (pctL < 23 || isLowFat) {
    return {
      conflict: true,
      type: 'low_fat_restriction',
      title: 'Conflicto Clínico: Restricción Lipídica Estricta (< 23% VCT)',
      description: `La meta de lípidos es de solo ${targetL.toFixed(0)}g (${pctL.toFixed(1)}% del VCT). Las proteínas semimagras (huevo entero, queso fresco, quesillo) y los lácteos enteros aportan de 5 a 8g de grasa por porción, lo que satura rápidamente la cuota lipídica.`,
      impact: 'Si se seleccionan quesos convencionales o huevos enteros, la adecuación de grasa sobrepasará el 105%.',
      recommendations: [
        'Utilizar exclusivamente proteína magra (pechuga sin piel, claras de huevo, pescado blanco) que solo aportan 2g de grasa.',
        'Prescribir leche 100% descremada (leche_dc) o desgrasada y controlar el aceite de cocción a cucharaditas medidas.'
      ]
    };
  }

  // 3. Conflicto de Dieta Baja en Carbohidratos (EPOC, Hipertrigliceridemia)
  if (pctCho < 45 || isLowCarb) {
    return {
      conflict: true,
      type: 'low_carb_elevation',
      title: 'Conflicto Clínico: Dieta Reducida en Carbohidratos (EPOC / Triglicéridos)',
      description: `La meta de carbohidratos es baja (${targetCho.toFixed(0)}g / ${pctCho.toFixed(1)}% VCT) mientras que las proteínas y grasas son elevadas (${pctP.toFixed(1)}% P, ${pctL.toFixed(1)}% L).`,
      impact: 'Al incluir frutas y lácteos básicos de la norma, los intercambios de almidón deben limitarse estrictamente para no sobrepasar el 105% de adecuación de CHO.',
      recommendations: [
        'Priorizar tortilla de maíz en porciones individuales y vegetales de hoja verde.',
        'Aumentar carnes magras/semimagras y grasas monoinsaturadas (aguacate, aceite de oliva) para alcanzar las calorías totales sin exceder los carbohidratos.'
      ]
    };
  }

  // 4. Conflicto Hipocalórico / Pediátrico
  if (isHypocaloric) {
    return {
      conflict: true,
      type: 'low_calorie_budget',
      title: 'Conflicto Clínico: Presupuesto Calórico Reducido (< 1400 kcal)',
      description: `El VCT asignado es de ${vct.toFixed(0)} kcal. En dietas hospitalarias bajas en calorías, 2 vasos de leche y 2 frutas ya consumen más de 350 kcal.`,
      impact: 'Queda un margen muy estrecho para almidones y proteínas sin exceder el 105% de energía.',
      recommendations: [
        'Ajustar lácteos a 1 vaso de leche descremada al día y frutas a 2 raciones pequeñas.',
        'Verificar si el paciente requiere suplementación o aumento progresivo de calorías.'
      ]
    };
  }

  return {
    conflict: false,
    type: 'none',
    title: 'Prescripción Dietética Estándar',
    description: 'La prescripción de macronutrientes se encuentra dentro de los rangos fisiológicos equilibrados.',
    recommendations: []
  };
}

// Algoritmo de Optimización: Busca la combinación de intercambios que estrictamente garantice 95% - 105% en los 4 parámetros
export function autoSolveExchangesToAdequacy(targets, options = {}) {
  const {
    rissData = {},
    allowHalf = true,
    preferredMilk = 'leche_sd'
  } = options;

  const targetKcal = targets.kcal || 1800;
  const targetCho = targets.cho || (targetKcal * 0.55) / 4;
  const targetP = targets.p || (targetKcal * 0.18) / 4;
  const targetL = targets.l || (targetKcal * 0.27) / 9;

  const activeRiiss = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const isRenal = activeRiiss.some(d => d.includes('renal') || d.includes('hipoproteica'));
  const isLowFat = activeRiiss.includes('baja_grasa') || (targetL * 9 / targetKcal) < 0.24;
  const isLowCarb = activeRiiss.includes('baja_cho') || (targetCho * 4 / targetKcal) < 0.45;
  const isHypocaloric = targetKcal < 1450;

  // Determinar grupo lácteo idóneo según la patología
  let milkKey = preferredMilk;
  if (isLowFat || isRenal) milkKey = 'leche_dc';
  if (isHypocaloric && milkKey === 'leche_entera') milkKey = 'leche_dc';

  // Espacio de búsqueda inteligente
  const milkOptions = isHypocaloric ? [1, 0.5, 0] : isRenal ? [0.5, 1, 0] : [1, 2, 1.5];
  const vegOptions = isHypocaloric ? [2, 3, 2.5] : [3, 4, 2.5, 3.5, 5];
  const fruitOptions = isHypocaloric ? [1.5, 2, 1] : [2, 3, 2.5, 3.5];
  const incaparinaOptions = [0]; // Por defecto 0 a menos que sea solicitada

  let bestAdequateSolution = null;
  let bestClosestSolution = null;
  let lowestDeviation = Infinity;

  // Búsqueda exhaustiva guiada en microsegundos
  for (const nMilk of milkOptions) {
    for (const nVeg of vegOptions) {
      for (const nFruit of fruitOptions) {
        for (const nIncap of incaparinaOptions) {
          // 1. Carbohidratos y proteínas de la base (Lácteos + Vegetales + Frutas)
          const baseCho =
            nMilk * NUTRIENTS[milkKey].cho +
            nVeg * NUTRIENTS.veg_sa.cho +
            nFruit * NUTRIENTS.frutas.cho +
            nIncap * NUTRIENTS.incaparina.cho;

          const baseP =
            nMilk * NUTRIENTS[milkKey].p +
            nVeg * NUTRIENTS.veg_sa.p +
            nFruit * NUTRIENTS.frutas.p +
            nIncap * NUTRIENTS.incaparina.p;

          const baseL =
            nMilk * NUTRIENTS[milkKey].l +
            nIncap * NUTRIENTS.incaparina.l;

          // 2. Almidones para cubrir los carbohidratos restantes
          const remCho = targetCho - baseCho;
          if (remCho < 0) continue;

          const rawAlm = remCho / NUTRIENTS.almidones.cho;
          const almCandidates = allowHalf
            ? [Math.floor(rawAlm * 2) / 2, Math.round(rawAlm * 2) / 2, Math.ceil(rawAlm * 2) / 2]
            : [Math.floor(rawAlm), Math.round(rawAlm), Math.ceil(rawAlm)];

          const uniqueAlms = Array.from(new Set(almCandidates)).filter(a => a >= 0);

          for (const nAlm of uniqueAlms) {
            const curCho = baseCho + nAlm * NUTRIENTS.almidones.cho;
            const curP = baseP + nAlm * NUTRIENTS.almidones.p;
            const curL = baseL + nAlm * NUTRIENTS.almidones.l;

            // 3. Proteínas restantes para cubrir la meta
            const remP = targetP - curP;
            const targetProtExchanges = remP > 0 ? remP / 7 : 0;

            // Repartir proteína entre magra y semimagra
            // Si la dieta es baja en grasa, usar casi todo magro; si no, repartir 50/50
            const totalProtN = allowHalf
              ? Math.max(0, Math.round(targetProtExchanges * 2) / 2)
              : Math.max(0, Math.round(targetProtExchanges));

            const protSmRatio = isLowFat ? 0 : 0.4;
            const nProtSm = allowHalf
              ? Math.round(totalProtN * protSmRatio * 2) / 2
              : Math.round(totalProtN * protSmRatio);
            const nProtMagra = Math.max(0, totalProtN - nProtSm);

            const afterProtL = curL + nProtMagra * NUTRIENTS.prot_magra.l + nProtSm * NUTRIENTS.prot_sm.l;

            // 4. Grasas para cubrir los lípidos restantes
            const remL = targetL - afterProtL;
            const rawGrasas = remL > 0 ? remL / NUTRIENTS.grasas.l : 0;
            const grasasCandidates = allowHalf
              ? [Math.floor(rawGrasas * 2) / 2, Math.round(rawGrasas * 2) / 2, Math.ceil(rawGrasas * 2) / 2]
              : [Math.floor(rawGrasas), Math.round(rawGrasas), Math.ceil(rawGrasas)];

            const uniqueGrasas = Array.from(new Set(grasasCandidates)).filter(g => g >= 0);

            for (const nGrasa of uniqueGrasas) {
              const candidateTotals = {
                incaparina: nIncap > 0 ? String(nIncap) : '',
                leche_dc: milkKey === 'leche_dc' && nMilk > 0 ? String(nMilk) : '',
                leche_sd: milkKey === 'leche_sd' && nMilk > 0 ? String(nMilk) : '',
                leche_entera: milkKey === 'leche_entera' && nMilk > 0 ? String(nMilk) : '',
                veg_sa: nVeg > 0 ? String(nVeg) : '',
                frutas: nFruit > 0 ? String(nFruit) : '',
                almidones: nAlm > 0 ? String(nAlm) : '',
                otros_cho: '',
                prot_magra: nProtMagra > 0 ? String(nProtMagra) : '',
                prot_sm: nProtSm > 0 ? String(nProtSm) : '',
                prot_grasa: '',
                grasas: nGrasa > 0 ? String(nGrasa) : '',
                alcohol: ''
              };

              const evalRes = evaluateAdequacy(candidateTotals, {
                cho: targetCho,
                p: targetP,
                l: targetL,
                kcal: targetKcal
              });

              if (evalRes.isAdequate) {
                if (!bestAdequateSolution || evalRes.deviationScore < bestAdequateSolution.evalRes.deviationScore) {
                  bestAdequateSolution = {
                    totals: candidateTotals,
                    evalRes
                  };
                }
              }

              if (evalRes.deviationScore < lowestDeviation) {
                lowestDeviation = evalRes.deviationScore;
                bestClosestSolution = {
                  totals: candidateTotals,
                  evalRes
                };
              }
            }
          }
        }
      }
    }
  }

  // Si encontramos una solución perfectamente adecuada (95% - 105% en todo)
  if (bestAdequateSolution) {
    return {
      success: true,
      totals: bestAdequateSolution.totals,
      evaluation: bestAdequateSolution.evalRes,
      diagnostic: {
        conflict: false,
        title: 'Adecuación Exitosa (95% – 105%)',
        message: 'Todos los macronutrientes (Carbohidratos, Proteínas y Lípidos) y las Calorías Totales se encuentran estrictamente dentro del rango de adecuación del 95% al 105%.'
      }
    };
  }

  // Si no fue posible alcanzar el 100% perfecto debido a restricciones clínicas, emitir diagnóstico
  const diagnostic = diagnoseExchangeConflict(
    { kcal: targetKcal, cho: targetCho, p: targetP, l: targetL },
    rissData
  );

  return {
    success: false,
    totals: bestClosestSolution ? bestClosestSolution.totals : {},
    evaluation: bestClosestSolution ? bestClosestSolution.evalRes : null,
    diagnostic: {
      ...diagnostic,
      message: `No fue posible cuadrar simultáneamente los 4 macronutrientes al 95-105% debido a: ${diagnostic.title}. Se asignó la solución más cercana clínicamente (${bestClosestSolution?.evalRes.adecP.toFixed(1)}% Prot, ${bestClosestSolution?.evalRes.adecCho.toFixed(1)}% CHO, ${bestClosestSolution?.evalRes.adecL.toFixed(1)}% Grasa).`
    }
  };
}
