// Motor de Menús Típicos Salvadoreños en 5 Tiempos de Comida y Planificador Semanal (7 Días)
// Integrado con Sistema de Intercambios ADA (tabla_intercambios.xlsx), Niveles de Costo
// y Adaptaciones Clínicas de Seguridad RIISS 2014 (MINSAL)

import { EXCHANGE_GROUPS, MEAL_TIMES } from './exchangeDatabase.js';
import { SALVADORAN_DISHES, DAYS_OF_WEEK } from './salvadoranDishes.js';

export const COST_LEVELS = [
  {
    id: 'economico',
    name: 'Económico',
    badge: 'Económico ($)',
    desc: 'Ingredientes locales accesibles y de consumo diario (tortilla de maíz, frijoles salcochados, güisquil, pipián, ayote, huevo, frutas de temporada y chirmol natural).'
  },
  {
    id: 'regular',
    name: 'Regular',
    badge: 'Regular ($$)',
    desc: 'Preparaciones balanceadas típicas salvadoreñas (pollo desgrasado entomatado, quesillo desgrasado, arroz blanco o avena, ejotes, zanahoria y frutas variadas).'
  },
  {
    id: 'costoso',
    name: 'Más costoso',
    badge: 'Más costoso ($$$)',
    desc: 'Opciones de mayor costo por porción (filete de corvina/pescado fresco, lomito de res magro, pechuga de pavo, aguacate Hass y semillas de marañón o almendras tostadas).'
  }
];

// Reglas de adaptación y salvaguardas RIISS para platos salvadoreños
export function getRiissAdaptationNotes(rissData = {}) {
  const activeIds = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const notes = [];

  if (activeIds.includes('blanda') || activeIds.includes('mec_suave')) {
    notes.push('Preparaciones suaves y tiernas: chirmol sin chile ni cebolla cruda; curtido al vapor suave sin vinagre ácido; frijoles licuados colados para evitar meteorismo.');
  }
  if (activeIds.includes('baja_grasa') || activeIds.includes('hipocalorica')) {
    notes.push('Cero frituras: plátano salcochado/hervido en vez de plátano frito; pupusas de comal sin aceite rellenas de frijol y requesón magro; frijoles cocidos sin manteca ni tocino.');
  }
  if (activeIds.includes('baja_cho')) {
    notes.push('Control glucémico: tortillas de maíz nixtamalizado en porciones medidas; frutas enteras frescas; atoles sin azúcar refinada agregada ni pan dulce.');
  }
  if (activeIds.includes('hiposodica_leve') || activeIds.includes('hiposodica_moderada') || activeIds.includes('hiposodica_estricta')) {
    notes.push('Bajo en sodio: salsas naturales a base de tomate, orégano y ajo sin cubitos ni consomés comerciales; quesillo bajo en sal en lugar de queso duro o morolique.');
  }
  if (activeIds.includes('baja_potasio')) {
    notes.push('Bajo en potasio: papa y plátano con técnica RIISS de remojo prolongado y doble cocción desechando el agua; sustituir guineo maduro y tomate crudo abundante por manzana, pera o piña.');
  }
  if (activeIds.includes('baja_fosforo') || activeIds.includes('hipoproteica')) {
    notes.push('Renal: porciones exactas de pollo o claras; excluir quesos añejados, mariscos y sodas oscuras; carnes blancas hervidas para reducir fósforo orgánico.');
  }

  if (!notes.length) {
    notes.push('Cocción típica saludable: preparaciones asadas al comal, hervidas o al vapor, sin manteca ni exceso de grasa.');
  }

  return notes;
}

// Filtra platillos según la patología activa / prescripción RIISS
export function filterDishesByClinicalCondition(dishes, rissData = {}) {
  const activeRiiss = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const isRenal = activeRiiss.some(d => d.includes('renal') || d.includes('hipoproteica') || d.includes('baja_potasio') || d.includes('baja_fosforo'));
  const isDiabetes = activeRiiss.some(d => d.includes('baja_cho') || d.includes('hipocalorica'));
  const isHypertension = activeRiiss.some(d => d.includes('hiposodica'));
  const isLowFat = activeRiiss.some(d => d.includes('baja_grasa'));

  return dishes.filter(dish => {
    // Si es diabético, excluir postres con azúcar o panela libre
    if (isDiabetes && dish.clinicalTags?.includes('hipercalorica_only')) {
      return false;
    }
    // Si es bajo en grasa, evitar platillos de cerdo graso o embutidos
    if (isLowFat && dish.clinicalTags?.includes('high_fat')) {
      return false;
    }
    return true;
  });
}

// Escala dinámicamente un platillo salvadoreño para que coincida exactamente con los intercambios asignados a un tiempo de comida
export function scaleDishToMealExchanges(dish, mealExchanges = {}, options = {}) {
  if (!dish) return null;

  const { rissData = {} } = options;
  const activeRiiss = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const isLowK = activeRiiss.includes('baja_potasio');
  const isLowNa = activeRiiss.some(d => d.includes('hiposodica'));
  const isBland = activeRiiss.includes('blanda') || activeRiiss.includes('mec_suave');

  // Intercambios asignados al tiempo de comida
  const targetAlm = parseFloat(String(mealExchanges.almidones || 0).replace(',', '.')) || 0;
  const targetPM = parseFloat(String(mealExchanges.prot_magra || 0).replace(',', '.')) || 0;
  const targetPSM = parseFloat(String(mealExchanges.prot_sm || 0).replace(',', '.')) || 0;
  const targetPG = parseFloat(String(mealExchanges.prot_grasa || 0).replace(',', '.')) || 0;
  const targetGrasa = parseFloat(String(mealExchanges.grasas || 0).replace(',', '.')) || 0;
  const targetVeg = parseFloat(String(mealExchanges.veg_sa || 0).replace(',', '.')) || 0;
  const targetFruta = parseFloat(String(mealExchanges.frutas || 0).replace(',', '.')) || 0;
  const targetLacteo = (parseFloat(String(mealExchanges.leche_sd || 0).replace(',', '.')) || 0) +
                       (parseFloat(String(mealExchanges.leche_dc || 0).replace(',', '.')) || 0) +
                       (parseFloat(String(mealExchanges.leche_entera || 0).replace(',', '.')) || 0);
  const targetOtrosCho = parseFloat(String(mealExchanges.otros_cho || 0).replace(',', '.')) || 0;

  const totalTargetProt = targetPM + targetPSM + targetPG;

  const scaledIngredients = [];

  // 1. Escalar Almidones (tortillas, frijoles, plátano, arroz, yuca, papas)
  const baseAlmIngs = dish.ingredients.filter(ing => ing.exchangeGroup === 'almidones');
  if (targetAlm > 0) {
    if (baseAlmIngs.length === 1) {
      const ing = baseAlmIngs[0];
      const scaledQty = ing.baseQty * (targetAlm / (ing.exchanges || 1));
      let displayUnit = ing.unit;
      if (ing.name.toLowerCase().includes('tortilla')) {
        const count = Math.max(1, Math.round(targetAlm));
        displayUnit = count === 1 ? 'tortilla caliente' : 'tortillas calientes del comal';
        scaledIngredients.push({
          name: `${count} ${displayUnit} de maíz nixtamalizado`,
          measure: `${count} unidad(es)`,
          group: 'almidones',
          exchanges: targetAlm,
          cho: targetAlm * 15,
          p: targetAlm * 3,
          l: targetAlm * 1,
          kcal: targetAlm * 80
        });
      } else {
        scaledIngredients.push({
          name: ing.name,
          measure: `${scaledQty.toFixed(scaledQty % 1 === 0 ? 0 : 2)} ${displayUnit}`,
          group: 'almidones',
          exchanges: targetAlm,
          cho: targetAlm * 15,
          p: targetAlm * 3,
          l: targetAlm * 1,
          kcal: targetAlm * 80
        });
      }
    } else if (baseAlmIngs.length > 1) {
      // Repartir proporcionalmente los almidones entre los componentes del plato
      let remAlm = targetAlm;
      // Asignar al menos 1 intercambio a tortillas si existen, y el resto a legumbres/arroz/tubérculos
      const hasTortilla = baseAlmIngs.find(i => i.name.toLowerCase().includes('tortilla'));
      const otherAlms = baseAlmIngs.filter(i => !i.name.toLowerCase().includes('tortilla'));

      if (hasTortilla && remAlm > 1) {
        const tortCount = remAlm >= 3 ? 2 : 1;
        scaledIngredients.push({
          name: `${tortCount} ${tortCount === 1 ? 'tortilla de maíz nixtamalizado del comal' : 'tortillas de maíz del comal'}`,
          measure: `${tortCount} unidad(es)`,
          group: 'almidones',
          exchanges: tortCount,
          cho: tortCount * 15,
          p: tortCount * 3,
          l: tortCount * 1,
          kcal: tortCount * 80
        });
        remAlm -= tortCount;
      }

      if (otherAlms.length > 0 && remAlm > 0) {
        const portionEach = remAlm / otherAlms.length;
        otherAlms.forEach(ing => {
          const qty = ing.baseQty * (portionEach / (ing.exchanges || 1));
          scaledIngredients.push({
            name: ing.name,
            measure: `${qty.toFixed(qty % 1 === 0 ? 0 : 2)} ${ing.unit}`,
            group: 'almidones',
            exchanges: portionEach,
            cho: portionEach * 15,
            p: portionEach * 3,
            l: portionEach * 1,
            kcal: portionEach * 80
          });
        });
      }
    } else {
      // El plato base no tenía almidón explícito, añadir tortilla de maíz o frijol
      scaledIngredients.push({
        name: `${targetAlm} tortilla(s) de maíz nixtamalizado del comal (o arroz al vapor)`,
        measure: `${targetAlm} unidad(es)`,
        group: 'almidones',
        exchanges: targetAlm,
        cho: targetAlm * 15,
        p: targetAlm * 3,
        l: targetAlm * 1,
        kcal: targetAlm * 80
      });
    }
  }

  // 2. Escalar Proteínas (pollo, res, pescado, huevo, quesillo/cuajada)
  const baseProtIngs = dish.ingredients.filter(ing => ['prot_magra', 'prot_sm', 'prot_grasa'].includes(ing.exchangeGroup));
  if (totalTargetProt > 0) {
    if (baseProtIngs.length > 0) {
      const primaryProt = baseProtIngs[0];
      const targetOz = totalTargetProt;
      const isEgg = primaryProt.name.toLowerCase().includes('huevo') || primaryProt.unit.includes('unidad');
      const measureStr = isEgg
        ? `${Math.round(targetOz)} huevo(s) entero(s) o claras revueltas`
        : `${(targetOz * 30).toFixed(0)} g (${targetOz.toFixed(1)} oz)`;

      scaledIngredients.push({
        name: primaryProt.name,
        measure: measureStr,
        group: primaryProt.exchangeGroup,
        exchanges: totalTargetProt,
        cho: 0,
        p: totalTargetProt * 7,
        l: targetPM * 2 + targetPSM * 5 + targetPG * 8,
        kcal: targetPM * 45 + targetPSM * 75 + targetPG * 100
      });
    } else {
      scaledIngredients.push({
        name: 'Proteína salvadoreña (pechuga de pollo desgrasada, huevo o queso fresco)',
        measure: `${(totalTargetProt * 30).toFixed(0)} g (${totalTargetProt} oz)`,
        group: 'prot_magra',
        exchanges: totalTargetProt,
        cho: 0,
        p: totalTargetProt * 7,
        l: totalTargetProt * 3,
        kcal: totalTargetProt * 55
      });
    }
  }

  // 3. Escalar Vegetales sin Almidón (chirimol, ensalada criolla, curtido, güisquil, pipián)
  if (targetVeg > 0) {
    const baseVeg = dish.ingredients.find(i => i.exchangeGroup === 'veg_sa');
    const vegName = baseVeg ? baseVeg.name : 'Verduras criollas (güisquil, pipián, tomate, pepino y rábano con limón)';
    const cups = targetVeg === 1 ? '1 taza' : `${targetVeg} tazas`;
    scaledIngredients.push({
      name: vegName,
      measure: `${cups} fresca(s) o al vapor`,
      group: 'veg_sa',
      exchanges: targetVeg,
      cho: targetVeg * 5,
      p: targetVeg * 2,
      l: 0,
      kcal: targetVeg * 25
    });
  }

  // 4. Escalar Frutas (papaya, sandía, piña, manzana criolla, melón)
  if (targetFruta > 0) {
    const baseFruta = dish.ingredients.find(i => i.exchangeGroup === 'frutas');
    const frutaName = baseFruta ? baseFruta.name : 'Fruta salvadoreña fresca de temporada (papaya, piña, melón o sandía)';
    scaledIngredients.push({
      name: frutaName,
      measure: `${targetFruta} porción(es) fresca(s) picada(s)`,
      group: 'frutas',
      exchanges: targetFruta,
      cho: targetFruta * 15,
      p: 0,
      l: 0,
      kcal: targetFruta * 60
    });
  }

  // 5. Escalar Grasas Saludables (aguacate criollo, aceite de oliva/vegetal, semillas de ayote)
  if (targetGrasa > 0) {
    const baseGrasa = dish.ingredients.find(i => i.exchangeGroup === 'grasas');
    let grasaDesc = '1 cdta de aceite vegetal para cocción';
    if (targetGrasa === 1) {
      grasaDesc = baseGrasa ? baseGrasa.name : '2 Cdas (30 g / 1 oz) de aguacate criollo fresco o 1 cdta de aceite';
    } else if (targetGrasa === 2) {
      grasaDesc = '2 Cdas de aguacate criollo (1 grasa) + 1 cdta de aceite de oliva en cocción (1 grasa)';
    } else {
      grasaDesc = `2 Cdas de aguacate criollo + ${targetGrasa - 1} cdta(s) de aceite vegetal medido`;
    }

    if (isLowK && grasaDesc.includes('aguacate')) {
      grasaDesc = `${targetGrasa} cdta(s) de aceite de oliva/vegetal para cocción (Aviso RIISS: aguacate omitido por potasio)`;
    }

    scaledIngredients.push({
      name: 'Grasa cardiosaludable (medida)',
      measure: grasaDesc,
      group: 'grasas',
      exchanges: targetGrasa,
      cho: 0,
      p: 0,
      l: targetGrasa * 5,
      kcal: targetGrasa * 45
    });
  }

  // 6. Escalar Lácteos (leche descremada, bebida caliente)
  if (targetLacteo > 0) {
    scaledIngredients.push({
      name: 'Bebida láctea (leche descremada o yogur natural sin grasa)',
      measure: `${targetLacteo} taza(s) (8 oz)`,
      group: 'leche_dc',
      exchanges: targetLacteo,
      cho: targetLacteo * 12,
      p: targetLacteo * 8,
      l: targetLacteo * 2,
      kcal: targetLacteo * 100
    });
  }

  // 7. Otros Carbohidratos (Azúcares o miel)
  if (targetOtrosCho > 0) {
    scaledIngredients.push({
      name: 'Miel de panela pura o dulce tradicional medido',
      measure: `${targetOtrosCho} Cda(s) rasa(s)`,
      group: 'otros_cho',
      exchanges: targetOtrosCho,
      cho: targetOtrosCho * 15,
      p: 0,
      l: 0,
      kcal: targetOtrosCho * 60
    });
  }

  // Sumas nutricionales
  const totalCho = scaledIngredients.reduce((s, i) => s + (i.cho || 0), 0);
  const totalP = scaledIngredients.reduce((s, i) => s + (i.p || 0), 0);
  const totalL = scaledIngredients.reduce((s, i) => s + (i.l || 0), 0);
  const totalKcal = totalCho * 4 + totalP * 4 + totalL * 9;

  return {
    dishId: dish.id,
    dishName: dish.name,
    description: dish.description,
    proteinType: dish.proteinType,
    prepNotes: dish.prepNotes,
    clinicalNotes: isLowK ? dish.renalNote : null,
    ingredients: scaledIngredients,
    totals: {
      cho: totalCho,
      p: totalP,
      l: totalL,
      kcal: totalKcal
    }
  };
}

// Generador Automático de Menú de 7 Días (Lunes a Domingo)
// Respeta variedad de proteínas, no repite el plato fuerte en días consecutivos y cuadra intercambios
export function generate7DaySalvadoranMenu({
  eqMap = {},
  costLevel = 'regular',
  rissData = {},
  snackConfig = 'both',
  customOverrides = {}
}) {
  const filteredDishes = filterDishesByClinicalCondition(SALVADORAN_DISHES, rissData);

  const breakfasts = filteredDishes.filter(d => d.mealType === 'des');
  const lunches = filteredDishes.filter(d => d.mealType === 'alm');
  const dinners = filteredDishes.filter(d => d.mealType === 'cen');
  const snacks = filteredDishes.filter(d => d.mealType === 'snack');

  // Secuencia de rotación de proteínas para Almuerzo a lo largo de los 7 días
  // Lun: Aves (Pollo guisado) | Mar: Res (Sopa de res) | Mié: Pescado (Tilapia plancha) | Jue: Vegetariano (Rellenos) | Vie: Aves (Gallo en chicha / Gallina) | Sáb: Pescado o Frijoles | Dom: Res (Carne asada / Chiles rellenos)
  const proteinRotationOrder = ['aves', 'res', 'pescado', 'vegetariano_huevo', 'aves', 'leguminosa_lacteo', 'res'];

  const weeklySchedule = {};

  DAYS_OF_WEEK.forEach((day, dayIdx) => {
    const dayKey = day.key;
    const dayMenu = {
      dayKey,
      dayName: day.name,
      meals: {}
    };

    MEAL_TIMES.forEach((mt, mIdx) => {
      const mk = mt.k;

      // Verificar si la merienda está activa según la configuración del paciente
      if (mk === 'c1' && (snackConfig === 'pm_only' || snackConfig === 'none')) {
        return;
      }
      if (mk === 'c2' && (snackConfig === 'am_only' || snackConfig === 'none')) {
        return;
      }

      // Obtener intercambios del tiempo de comida actual
      const mealExchanges = {};
      EXCHANGE_GROUPS.forEach(g => {
        const val = parseFloat(String((eqMap[g.k] || [])[mIdx] || '0').replace(',', '.'));
        if (val > 0) mealExchanges[g.k] = val;
      });

      // Si el nutricionista ya asignó un platillo manual específico para este día y tiempo
      const overrideDishId = customOverrides[`${dayKey}_${mk}`];
      let selectedDish = null;

      if (overrideDishId) {
        selectedDish = filteredDishes.find(d => d.id === overrideDishId);
      }

      if (!selectedDish) {
        if (mk === 'des') {
          // Rotar desayunos asegurando variedad
          const bIdx = (dayIdx + (costLevel === 'costoso' ? 2 : 0)) % breakfasts.length;
          selectedDish = breakfasts[bIdx] || breakfasts[0];
        } else if (mk === 'alm') {
          // Buscar platillo que coincida con la proteína rotada del día
          const targetProt = proteinRotationOrder[dayIdx % proteinRotationOrder.length];
          const matchProt = lunches.find(d => d.proteinType === targetProt && (!dayIdx || lunches[(dayIdx - 1) % lunches.length]?.id !== d.id));
          selectedDish = matchProt || lunches[dayIdx % lunches.length];
        } else if (mk === 'cen') {
          // Rotar cenas sin repetir el mismo tipo de proteína del almuerzo de hoy
          const lunchProt = dayMenu.meals.alm?.proteinType;
          const matchCen = dinners.find((d, idx) => d.proteinType !== lunchProt && (idx % 7 === dayIdx % dinners.length));
          selectedDish = matchCen || dinners[dayIdx % dinners.length];
        } else {
          // Refrigerios AM / PM
          const offset = mk === 'c1' ? 0 : 2;
          selectedDish = snacks[(dayIdx + offset) % snacks.length] || snacks[0];
        }
      }

      if (selectedDish) {
        const scaled = scaleDishToMealExchanges(selectedDish, mealExchanges, { rissData });
        dayMenu.meals[mk] = {
          mealTimeName: mt.n,
          ...scaled
        };
      }
    });

    weeklySchedule[dayKey] = dayMenu;
  });

  return weeklySchedule;
}

// Consolida y calcula la Lista de Compras Semanal categorizada a partir del plan de 7 días
export function calculateWeeklyGroceryList(weeklyPlan = {}) {
  const categories = {
    verduras_frutas: {
      title: 'Verduras, Hortalizas y Frutas Frescas',
      items: {}
    },
    carnes_lacteos: {
      title: 'Carnes Magras, Huevos y Lácteos Criollos',
      items: {}
    },
    granos_abarrotes: {
      title: 'Granos, Cereales, Panes y Abarrotes',
      items: {}
    },
    grasas_condimentos: {
      title: 'Grasas Cardiosaludables, Semillas y Especias',
      items: {}
    }
  };

  Object.values(weeklyPlan).forEach(day => {
    Object.values(day.meals || {}).forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        let catKey = 'granos_abarrotes';
        const group = ing.group;
        const nameLower = (ing.name || '').toLowerCase();

        if (group === 'veg_sa' || group === 'frutas' || nameLower.includes('plátano') || nameLower.includes('yuca') || nameLower.includes('papa')) {
          catKey = 'verduras_frutas';
        } else if (['prot_magra', 'prot_sm', 'prot_grasa', 'leche_dc', 'leche_sd', 'leche_entera'].includes(group)) {
          catKey = 'carnes_lacteos';
        } else if (group === 'grasas' || nameLower.includes('aceite') || nameLower.includes('alguashte') || nameLower.includes('pepitoria')) {
          catKey = 'grasas_condimentos';
        }

        const itemKey = ing.name.trim();
        if (!categories[catKey].items[itemKey]) {
          categories[catKey].items[itemKey] = {
            name: ing.name,
            measureList: []
          };
        }
        categories[catKey].items[itemKey].measureList.push(ing.measure);
      });
    });
  });

  // Resumir cantidades
  const formattedList = {};
  Object.entries(categories).forEach(([catKey, cat]) => {
    formattedList[catKey] = {
      title: cat.title,
      items: Object.values(cat.items).map(item => {
        const count = item.measureList.length;
        return {
          name: item.name,
          frequency: count,
          sampleMeasure: item.measureList[0],
          summary: `${count} vez/veces en la semana (${item.measureList[0]})`
        };
      })
    };
  });

  return formattedList;
}

// Guía de Sustitución Rápida / Equivalencias Prácticas para el Paciente
export function getQuickSubstitutionGuide() {
  return [
    {
      group: '1 Opción de Almidón (15g CHO, 80 kcal)',
      examples: '1 tortilla de maíz nixtamalizado = ½ taza de frijoles rojos salcochados = ⅓ taza de arroz blanco o integral = ½ taza de plátano sancochado = ½ taza de yuca hervida = 1 rebanada de pan de molde integral = 1 tamal de elote pequeño.'
    },
    {
      group: '1 Opción de Proteína Magra (7g Prot, 45-55 kcal)',
      examples: '1 oz (30 g) de pechuga de pollo sin piel = 1 oz de filete de pescado fresco (tilapia o corvina) = 2 claras de huevo = ¼ taza de requesón magro salvadoreño = 1 oz de posta de res magra.'
    },
    {
      group: '1 Opción de Proteína Semimagra (7g Prot, 5g Grasa, 75 kcal)',
      examples: '1 huevo entero cocido o revuelto = 1 oz (30 g) de queso fresco artesanal tierno = 1 oz de quesillo bajo en grasa para pupusas = 1 oz de carne molida de res magra.'
    },
    {
      group: '1 Opción de Vegetales Sin Almidón (5g CHO, 2g Prot, 25 kcal)',
      examples: '1 taza de vegetales crudos o ½ taza cocidos: güisquil, pipián, tomate, cebolla, pepino, rábano, berro, flor de loroco, ejotes o repollo para curtido.'
    },
    {
      group: '1 Opción de Fruta Fresca (15g CHO, 60 kcal)',
      examples: '1 taza de papaya picada = 1¼ taza de sandía en cubos = ¾ taza de piña salvadoreña = 1 guineo de seda mediano = 1 naranja criolla en gajos = 1 manzana pequeña.'
    },
    {
      group: '1 Opción de Grasa Saludable (5g Grasa, 45 kcal)',
      examples: '2 Cdas (30 g) de aguacate criollo fresco = 1 cdta de aceite de oliva o vegetal = 1 Cda de alguashte o pepitoria molida tostada sin sal = 10 maníes tostados.'
    },
    {
      group: '1 Opción de Lácteo Descremado (12g CHO, 8g Prot, 100 kcal)',
      examples: '1 taza (8 oz / 240 ml) de leche descremada fluida = 1 taza de yogur natural sin azúcar ni grasa.'
    }
  ];
}

// Mantener compatibilidad con la función anterior de 1 día
export function generateSalvadoranMenu({
  eqMap = {},
  costLevel = 'regular',
  rissData = {},
  variantIndex = 0,
  snackConfig = 'both'
}) {
  const week = generate7DaySalvadoranMenu({
    eqMap,
    costLevel,
    rissData,
    snackConfig
  });

  const dayKeys = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const dayChosen = week[dayKeys[variantIndex % dayKeys.length]] || week.lunes;

  const result = {};
  MEAL_TIMES.forEach(mt => {
    const meal = dayChosen.meals[mt.k];
    if (!meal) {
      result[mt.k] = '';
      return;
    }
    const lines = [
      `🍲 ${meal.dishName}`,
      meal.description ? `  ${meal.description}` : '',
      `  • Ingredientes medidos:`,
      ...meal.ingredients.map(ing => `    - ${ing.name}: ${ing.measure}`),
      meal.prepNotes ? `  • Preparación: ${meal.prepNotes}` : '',
      meal.clinicalNotes ? `  • Aviso clínico: ${meal.clinicalNotes}` : ''
    ].filter(Boolean);

    result[mt.k] = lines.join('\n');
  });

  return result;
}
