// Motor de Menús Típicos Salvadoreños en 5 Tiempos de Comida
// Integrado con Sistema de Intercambios ADA, Niveles de Costo (Económico, Regular, Más Costoso)
// y Adaptaciones Clínicas de Seguridad RIISS 2014 (MINSAL)

import { EXCHANGE_GROUPS, MEAL_TIMES } from './exchangeDatabase.js';

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

// Catálogo de componentes de platos salvadoreños por grupo de intercambio y nivel de costo
const SALVADORAN_ITEMS = {
  economico: {
    almidones: {
      des: (n) => {
        if (n === 1) return '1 tortilla de maíz nixtamalizado caliente del comal (1 almidón)';
        if (n === 2) return '2 tortillas de maíz del comal o 1 tortilla + ½ taza de frijoles salcochados enteros (2 almidones)';
        if (n === 3) return '½ taza de frijoles negros o rojos de la olla (1) + 2 tortillas de maíz nixtamalizado (2) [Total: 3 almidones]';
        if (n === 4) return '½ taza de frijoles de la olla (1) + ½ taza de plátano salcochado en rodajas (1) + 2 tortillas de maíz (2) [Total: 4 almidones]';
        return `½ taza de frijoles salcochados + ½ taza de plátano hervido + ${n - 2} tortillas de maíz del comal [Total: ${n} almidones]`;
      },
      c1: (n) => n === 1 ? '1 tortilla de maíz tostada al comal (tipo tostada sin grasa) o 6 galletas de soda (1 almidón)' : `${n} tortillas tostadas al comal o galletas`,
      alm: (n) => {
        if (n === 1) return '1 tortilla de maíz caliente o ⅓ taza de arroz blanco cocido con verduras (1 almidón)';
        if (n === 2) return '1 tortilla de maíz (1) + ⅓ taza de arroz blanco al vapor (1) [Total: 2 almidones]';
        if (n === 3) return '⅓ taza de arroz al vapor (1) + ½ taza de frijoles de la olla (1) + 1 tortilla de maíz (1) [Total: 3 almidones]';
        if (n === 4) return '⅓ taza de arroz (1) + ½ taza de frijoles rojos salcochados (1) + ½ taza de yuca o papa hervida (1) + 1 tortilla de maíz (1) [Total: 4 almidones]';
        return `⅓ taza de arroz + ½ taza de frijoles + ${n - 2} tortillas de maíz nixtamalizado [Total: ${n} almidones]`;
      },
      c2: (n) => n === 1 ? '1 tortilla tostada al comal o 3 tazas de palomitas de maíz caseras sin manteca (1 almidón)' : `${n} almidones ligeros de maíz`,
      cen: (n) => {
        if (n === 1) return '1 tortilla de maíz del comal o 1 pupusa de maíz tostada al comal rellena de frijol salcochado molido (1 almidón)';
        if (n === 2) return '2 pupusas saludables de maíz al comal (sin aceite) rellenas de frijol molido sin manteca (2 almidones)';
        if (n === 3) return '2 pupusas saludables de maíz al comal rellenas de frijol (2) + ½ taza de frijoles de la olla o 1 tortilla adicional (1) [Total: 3 almidones]';
        return `2 pupusas saludables de maíz al comal (2) + ½ taza de plátano salcochado (1) + ${n - 3} tortilla(s) [Total: ${n} almidones]`;
      }
    },
    prot_magra: {
      des: (n) => `${n * 2} claras de huevo revueltas con tomate y cebolla picada (estilo huevo picado salvadoreño sin grasa) (${n} prot. magra)`,
      c1: (n) => `${n} oz de queso fresco tierno desgrasado (${n} prot. magra)`,
      alm: (n) => `${n} oz (${n * 30} g) de pechuga de pollo desgrasada guisada con tomate, cebolla y chile verde dulce criollo (${n} prot. magra)`,
      c2: (n) => `${n} oz de requesón magro salvadoreño (${n} prot. magra)`,
      cen: (n) => `${n} oz (${n * 30} g) de pollo deshebrado en chirmol de tomate cocido o ${n * 2} claras de huevo (${n} prot. magra)`
    },
    prot_sm: {
      des: (n) => n === 1
        ? '1 huevo entero revuelto con tomate, cebollín y chile verde dulce (1 prot. SM)'
        : `${n} huevos enteros picados al comal con tomate y cebolla (${n} prot. SM)`,
      c1: (n) => `${n} oz de quesillo blanco bajo en grasa (${n} prot. SM)`,
      alm: (n) => `${n} oz (${n * 30} g) de posta de cerdo magra o carne molida de res magra guisada con papa y verduras (${n} prot. SM)`,
      c2: (n) => `${n} huevo duro sancochado (${n} prot. SM)`,
      cen: (n) => n === 1
        ? '1 oz (30 g) de queso fresco artesanal o 1 huevo revuelto tierno (1 prot. SM)'
        : `${n} oz de queso fresco tierno desgrasado o pollo deshebrado (${n} prot. SM)`
    },
    grasas: {
      des: (n) => {
        if (n === 1) return '1 cdta de aceite vegetal para el sartén o 2 Cdas (1 oz) de aguacate criollo fresco (1 grasa)';
        return `1 cdta de aceite para cocinar + ${n - 1} porción(es) de aguacate criollo (2 Cdas c/u) [Total: ${n} grasas]`;
      },
      c1: (n) => `${n * 10} maníes o cacahuates salvadoreños tostados al comal sin sal (${n} grasa${n > 1 ? 's' : ''})`,
      alm: (n) => {
        if (n === 1) return '1 cdta de aceite para el guisado o 2 Cdas de aguacate criollo (1 grasa)';
        return `1 cdta de aceite en la preparación + 2 Cdas de aguacate criollo en rodajas [Total: ${n} grasas]`;
      },
      c2: (n) => `${n * 10} maníes tostados sin sal o 1 Cda de pepitoria (semillas de ayote tostadas sin sal) (${n} grasa${n > 1 ? 's' : ''})`,
      cen: (n) => {
        if (n === 1) return '2 Cdas (1 oz) de aguacate criollo fresco o 1 cdta de aceite de cocción (1 grasa)';
        return `2 Cdas de aguacate criollo (1) + 1 cdta de aceite vegetal en la cocción (${n - 1}) [Total: ${n} grasas]`;
      }
    },
    veg_sa: {
      des: '½ taza de chirmol natural cocido (tomate, cebolla y cilantro sin grasa)',
      c1: '1 taza de pepino criollo con salpicón de limón',
      alm: '1 taza de sopa de verduras criolla colada/escurrida (güisquil, pipián y ayote tierno hervidos) + ensalada de pepino y rábano',
      c2: '1 taza de bastones de jícama fresca con limón',
      cen: '½ taza de pipián o güisquil salcochado en trozos con hierbabuena y tomate'
    },
    frutas: {
      des: '1 taza de papaya criolla fresca picada en cubos',
      c1: '1 guineo de seda mediano (o 1 mango verde de temporada con limón)',
      alm: '1 rebanada de sandía fresca en cubos (1¼ taza)',
      c2: '1 naranja criolla fresca en gajos o 2 guayabas',
      cen: '1 taza de papaya fresca o 1 rodaja de melón'
    }
  },

  regular: {
    almidones: {
      des: (n) => {
        if (n === 1) return '1 tortilla de maíz nixtamalizado caliente o 1 rebanada de pan de caja integral (1 almidón)';
        if (n === 2) return '1 taza de atol de avena cocida en agua con canela sin azúcar (2 almidones) o 2 tortillas de maíz';
        if (n === 3) return '½ taza de frijoles rojos salcochados (1) + 2 tortillas de maíz nixtamalizado (2) [Total: 3 almidones]';
        if (n === 4) return '½ taza de avena en hojuelas cocida (1) + ½ taza de frijoles (1) + 2 tortillas de maíz (2) [Total: 4 almidones]';
        return `½ taza de avena cocida + ½ taza de frijoles + ${n - 2} tortillas de maíz [Total: ${n} almidones]`;
      },
      c1: (n) => n === 1 ? '5 galletas de trigo integral o 2 tortitas de arroz horneadas (1 almidón)' : `${n} opciones de almidón integral`,
      alm: (n) => {
        if (n === 1) return '⅓ taza de arroz blanco o integral cocido con ejotes (1 almidón)';
        if (n === 2) return '⅔ taza de arroz blanco al vapor con zanahoria picada (2 almidones)';
        if (n === 3) return '⅓ taza de arroz blanco con vegetales (1) + ½ taza de frijoles rojos de la olla (1) + 1 tortilla de maíz (1) [Total: 3 almidones]';
        if (n === 4) return '⅔ taza de arroz con verduras (2) + ½ taza de lentejas o frijoles (1) + 1 tortilla de maíz (1) [Total: 4 almidones]';
        return `⅔ taza de arroz + ½ taza de frijoles + ${n - 2} tortillas de maíz [Total: ${n} almidones]`;
      },
      c2: (n) => n === 1 ? '6 galletas de soda o 3 cuadrados de galleta Graham (1 almidón)' : `${n} galletas horneadas`,
      cen: (n) => {
        if (n === 1) return '1 tortilla de maíz caliente o ½ taza de frijoles salcochados (1 almidón)';
        if (n === 2) return '2 pupusas saludables de masa de maíz hechas al comal sin grasa (rellenas de quesillo desgrasado y frijol sin manteca) (2 almidones)';
        if (n === 3) return '2 pupusas de maíz al comal (2) + ½ taza de frijoles cocidos o 1 tortilla (1) [Total: 3 almidones]';
        return `2 pupusas de maíz al comal (2) + ½ taza de plátano cocido (1) + ${n - 3} tortilla(s) [Total: ${n} almidones]`;
      }
    },
    prot_magra: {
      des: (n) => `${n * 2} claras de huevo revueltas con loroco fresco picado y tomate (${n} prot. magra)`,
      c1: (n) => `${n * 0.25} taza de requesón magro o ${n} oz de jamón de pechuga de pavo bajo en sodio (${n} prot. magra)`,
      alm: (n) => `${n} oz (${n * 30} g) de pechuga de pollo a la plancha entomatada con orégano y laurel (${n} prot. magra)`,
      c2: (n) => `${n} oz de queso fresco desgrasado o requesón (${n} prot. magra)`,
      cen: (n) => `${n} oz (${n * 30} g) de pechuga de pollo deshebrada salteada con ejotes y tomate (${n} prot. magra)`
    },
    prot_sm: {
      des: (n) => n === 1
        ? '1 huevo entero revuelto con loroco tierno y chirmol (1 prot. SM)'
        : `${n} huevos revueltos con loroco o 1 huevo + 1 oz de quesillo desgrasado (${n} prot. SM)`,
      c1: (n) => `${n} oz de quesillo salvadoreño bajo en grasa (${n} prot. SM)`,
      alm: (n) => `${n} oz (${n * 30} g) de carne de res magra (corte de salón o bolovique) guisada con tomate y hierbas (${n} prot. SM)`,
      c2: (n) => `${n} huevo duro cocido con una pizca de orégano (${n} prot. SM)`,
      cen: (n) => n === 1
        ? '1 oz (30 g) de queso fresco tierno desgrasado o quesillo en la pupusa (1 prot. SM)'
        : `${n} oz de quesillo bajo en grasa o carne deshebrada (${n} prot. SM)`
    },
    grasas: {
      des: (n) => {
        if (n === 1) return '1 cdta de aceite de oliva o canola para el comal / sartén (1 grasa)';
        return `1 cdta de aceite para cocinar (1) + 2 Cdas (1 oz) de aguacate fresco (1) [Total: ${n} grasas]`;
      },
      c1: (n) => `${n * 6} almendras o ${n * 10} maníes horneados sin sal (${n} grasa${n > 1 ? 's' : ''})`,
      alm: (n) => {
        if (n === 1) return '1 cdta de aceite de oliva en la preparación del pollo (1 grasa)';
        return `1 cdta de aceite de oliva para cocinar (1) + 2 Cdas de aguacate fresco en la ensalada (1) [Total: ${n} grasas]`;
      },
      c2: (n) => `${n * 6} almendras tostadas sin sal o 1½ cdta de mantequilla de maní natural (${n} grasa${n > 1 ? 's' : ''})`,
      cen: (n) => {
        if (n === 1) return '2 Cdas (1 oz) de aguacate fresco en rodajas (1 grasa)';
        return `2 Cdas de aguacate fresco (1) + 1 cdta de aceite vegetal para la cocción (${n - 1}) [Total: ${n} grasas]`;
      }
    },
    veg_sa: {
      des: '½ taza de vegetales salteados (tomate, cebollín y loroco fresco)',
      c1: '1 taza de bastones de zanahoria y pepino fresco con limón',
      alm: '½ taza de ejotes tiernos y zanahoria al vapor + 1 taza de ensalada verde (lechuga, tomate y rábano)',
      c2: '1 taza de pepino y apio con limón y una pizca de orégano',
      cen: '½ taza de pipián tierno salteado con tomate + curtido salvadoreño natural sin chile'
    },
    frutas: {
      des: '1 manzana pequeña fresca (o ¾ taza de piña salvadoreña en trozos)',
      c1: '1 pera mediana fresca o 1 taza de papaya en cubos',
      alm: '¾ taza de piña fresca picada con unas gotas de limón',
      c2: '1¼ taza de fresas frescas enteras o 1 mandarina',
      cen: '1 manzana pequeña o ½ taza de compota de manzana casera sin azúcar'
    }
  },

  costoso: {
    almidones: {
      des: (n) => {
        if (n === 1) return '1 rebanada de pan de molde integral de masa madre tostado o 1 tortilla de maíz (1 almidón)';
        if (n === 2) return '2 rebanadas de pan integral de masa madre o 1 taza de avena cocida con semillas (2 almidones)';
        if (n === 3) return '½ taza de frijoles negros parados (1) + 2 tortillas de maíz nixtamalizado o 2 rebanadas de pan integral (2) [Total: 3 almidones]';
        if (n === 4) return '½ taza de avena cocida (1) + ½ taza de frijoles negros (1) + 2 rebanadas de pan integral (2) [Total: 4 almidones]';
        return `Avena en hojuelas + frijoles negros + pan integral de masa madre [Total: ${n} almidones]`;
      },
      c1: (n) => n === 1 ? '2 tortitas de arroz inflado integral horneadas (rice cakes) o 1 barra de granola horneada (1 almidón)' : `${n} opciones de almidón horneado`,
      alm: (n) => {
        if (n === 1) return '⅓ taza de quinua perlada cocida o arroz integral al vapor (1 almidón)';
        if (n === 2) return '⅓ taza de arroz integral (1) + ½ taza de papa horneada con romero y cáscara (1) [Total: 2 almidones]';
        if (n === 3) return '⅓ taza de arroz integral al vapor (1) + ½ taza de lentejas cocidas (1) + 1 tortilla de maíz (1) [Total: 3 almidones]';
        if (n === 4) return '⅓ taza de quinua (1) + ½ taza de papa o camote al horno (1) + ½ taza de lentejas (1) + 1 tortilla de maíz (1) [Total: 4 almidones]';
        return `Quinua o arroz integral + papa horneada + legumbres [Total: ${n} almidones]`;
      },
      c2: (n) => n === 1 ? '3 galletas de trigo horneadas o 2 tortitas de arroz (1 almidón)' : `${n} almidones integrales`,
      cen: (n) => {
        if (n === 1) return '½ taza de papa horneada con romero o 1 rebanada de pan integral de centeno (1 almidón)';
        if (n === 2) return '½ taza de papa cocida al vapor (1) + 1 tortilla de maíz o pan pita integral (1) [Total: 2 almidones]';
        if (n === 3) return '½ taza de frijoles negros cocidos (1) + 2 tortillas de maíz caliente (2) [Total: 3 almidones]';
        return `Papa cocida + frijoles negros + tortillas de maíz [Total: ${n} almidones]`;
      }
    },
    prot_magra: {
      des: (n) => `${n * 2} claras de huevo en omelette tierno con espinacas y ${n * 0.25} taza de requesón descremado (${n} prot. magra)`,
      c1: (n) => `${n} oz de pechuga de pavo ahumada artesanal baja en sodio (${n} prot. magra)`,
      alm: (n) => `${n} oz (${n * 30} g) de filete de corvina fresca o tilapia a la plancha con ajo, perejil y rocío de limón (${n} prot. magra)`,
      c2: (n) => `${n * 0.25} taza de requesón magro o ${n} oz de atún en agua escurrido (${n} prot. magra)`,
      cen: (n) => `${n} oz (${n * 30} g) de filete de pescado blanco al horno en papillote con finas hierbas o lomito de res magro (${n} prot. magra)`
    },
    prot_sm: {
      des: (n) => n === 1
        ? '1 huevo pochado escalfado sobre rodajas de tomate y albahaca (1 prot. SM)'
        : `${n} huevos pochados o 1 huevo + 1 oz de queso mozzarella magro (${n} prot. SM)`,
      c1: (n) => `${n} oz de queso mozzarella light o queso feta (${n} prot. SM)`,
      alm: (n) => `${n} oz (${n * 30} g) de lomito de res asado a la parrilla con chimichurri casero sin sal excesiva (${n} prot. SM)`,
      c2: (n) => `${n} huevo cocido o 1 oz de queso mozzarella fresco (${n} prot. SM)`,
      cen: (n) => n === 1
        ? '1 oz (30 g) de queso fresco artesanal desgrasado o salmón a la plancha (1 prot. SM)'
        : `${n} oz de filete de pescado o pollo deshebrado (${n} prot. SM)`
    },
    grasas: {
      des: (n) => {
        if (n === 1) return '2 Cdas (1 oz) de aguacate Hass fresco en rebanadas (1 grasa monoinsaturada)';
        return `2 Cdas de aguacate Hass (1) + 1 cdta de aceite de oliva virgen extra en cocción (${n - 1}) [Total: ${n} grasas]`;
      },
      c1: (n) => `${n * 6} almendras enteras tostadas sin sal o ${n * 8} semillas de marañón salvadoreño tostadas sin sal (${n} grasa${n > 1 ? 's' : ''})`,
      alm: (n) => {
        if (n === 1) return '1 cdta de aceite de oliva virgen extra para aderezar la ensalada o asar el pescado (1 grasa)';
        return `1 cdta de aceite de oliva virgen extra (1) + 2 Cdas de aguacate Hass en la ensalada (1) [Total: ${n} grasas]`;
      },
      c2: (n) => `${n * 4} mitades de nuez de nogal o ${n * 8} semillas de marañón tostadas sin sal (${n} grasa${n > 1 ? 's' : ''})`,
      cen: (n) => {
        if (n === 1) return '2 Cdas (1 oz) de aguacate Hass en rebanadas o 1 cdta de aceite de oliva virgen extra (1 grasa)';
        return `2 Cdas de aguacate Hass (1) + 1 cdta de aceite de oliva virgen extra (${n - 1}) [Total: ${n} grasas]`;
      }
    },
    veg_sa: {
      des: '½ taza de espinacas baby y champiñones salteados en aceite de oliva con tomate cherry',
      c1: '1 taza de apio fresco y pepino en bastones con jugo de limón y menta',
      alm: '½ taza de espárragos o ejotes al vapor + 1 taza de ensalada verde mixta (rúcula, espinaca y tomate cherry)',
      c2: '1 taza de pepino persa y pimientos dulces en julianas',
      cen: '½ taza de zucchini (calabacín verde) y berenjena asada a la plancha con finas hierbas'
    },
    frutas: {
      des: '1¼ taza de fresas frescas enteras o ¾ taza de arándanos (blueberries)',
      c1: '1 manzana verde o pera mediana fresca',
      alm: '¾ taza de piña fresca con kiwi en rebanadas o papaya dulce',
      c2: '¾ taza de arándanos frescos o 1 durazno mediano fresco',
      cen: '½ taza de kiwi o 1 manzana verde cocida al vapor con canela'
    }
  }
};

// Generador de menús salvadoreños en 3, 4 o 5 tiempos según intercambios, nivel de costo y reglas RIISS
export function generateSalvadoranMenu({
  eqMap = {},
  costLevel = 'regular',
  rissData = {},
  variantIndex = 0,
  snackConfig = 'both'
}) {
  const catalog = SALVADORAN_ITEMS[costLevel] || SALVADORAN_ITEMS.regular;
  const result = {};
  const activeRiiss = [rissData.primaryDiet, ...(rissData.secondaryDiets || [])].filter(Boolean);
  const isLowK = activeRiiss.includes('baja_potasio');
  const isBland = activeRiiss.includes('blanda') || activeRiiss.includes('mec_suave');
  const isLowFat = activeRiiss.includes('baja_grasa');

  MEAL_TIMES.forEach((meal, mIdx) => {
    const mk = meal.k;

    // Si la merienda fue eliminada / desactivada por el paciente, no generar menú
    if (mk === 'c1' && (snackConfig === 'pm_only' || snackConfig === 'none')) {
      result[mk] = '';
      return;
    }
    if (mk === 'c2' && (snackConfig === 'am_only' || snackConfig === 'none')) {
      result[mk] = '';
      return;
    }

    const parts = [];

    // Paso 1: Revisar intercambios asignados en este tiempo
    const lechesSD = parseFloat(String((eqMap.leche_sd || [])[mIdx] || '0').replace(',', '.'));
    const lechesDC = parseFloat(String((eqMap.leche_dc || [])[mIdx] || '0').replace(',', '.'));
    const lechesEnt = parseFloat(String((eqMap.leche_entera || [])[mIdx] || '0').replace(',', '.'));
    const incaparina = parseFloat(String((eqMap.incaparina || [])[mIdx] || '0').replace(',', '.'));
    const totLeche = lechesSD + lechesDC + lechesEnt;

    if (totLeche > 0) {
      const lecheText = isLowFat || lechesDC > 0
        ? `${totLeche} taza(s) (8 oz) de leche 100% descremada o yogur natural sin grasa`
        : `${totLeche} taza(s) (8 oz) de leche semidescremada al 2% o kéfir`;
      parts.push(`• Bebida láctea: ${lecheText}`);
    }

    if (incaparina > 0) {
      parts.push(`• Atol tradicional: ${incaparina} taza(s) de atol de Incaparina caliente cocido en agua con canela`);
    }

    // Vegetales sin almidón
    const vegCount = parseFloat(String((eqMap.veg_sa || [])[mIdx] || '0').replace(',', '.'));
    if (vegCount > 0) {
      let vegDesc = catalog.veg_sa[mk] || '1 taza de verduras salcochadas o ensalada fresca';
      if (isLowK) {
        vegDesc = '1 taza de güisquil, chayote o ejotes cocidos con técnica RIISS de doble hervor y desalado';
      } else if (isBland) {
        vegDesc = '½ taza de pipián o chayote cocido tierno sin piel y sin chile';
      }
      parts.push(`• Vegetales criollos (${vegCount} int.): ${vegDesc}`);
    }

    // Frutas
    const fruitCount = parseFloat(String((eqMap.frutas || [])[mIdx] || '0').replace(',', '.'));
    if (fruitCount > 0) {
      let fruitDesc = catalog.frutas[mk] || '1 porción de fruta fresca de temporada';
      if (isLowK) {
        fruitDesc = '1 manzana pequeña pelada o 1 taza de piña o sandía en porción medida (excluye guineo maduro y cítricos por K)';
      }
      parts.push(`• Fruta salvadoreña (${fruitCount} int.): ${fruitDesc}`);
    }

    // Almidones (cereales, tortillas, plátano, frijoles)
    const almidonCount = parseFloat(String((eqMap.almidones || [])[mIdx] || '0').replace(',', '.'));
    if (almidonCount > 0) {
      const almFn = catalog.almidones[mk] || catalog.almidones.des;
      let almText = typeof almFn === 'function' ? almFn(almidonCount) : `${almidonCount} porciones de almidón típico`;
      if (isLowK && almText.includes('plátano')) {
        almText += ' (Aviso RIISS: plátano cocido con doble hervor previo)';
      }
      parts.push(`• Almidón base (${almidonCount} int.): ${almText}`);
    }

    // Proteínas Magras
    const protMagraCount = parseFloat(String((eqMap.prot_magra || [])[mIdx] || '0').replace(',', '.'));
    if (protMagraCount > 0) {
      const pmFn = catalog.prot_magra[mk] || catalog.prot_magra.alm;
      const pmText = typeof pmFn === 'function' ? pmFn(protMagraCount) : `${protMagraCount} oz de proteína magra`;
      parts.push(`• Proteína magra (${protMagraCount} int.): ${pmText}`);
    }

    // Proteínas Semimagras
    const protSmCount = parseFloat(String((eqMap.prot_sm || [])[mIdx] || '0').replace(',', '.'));
    if (protSmCount > 0) {
      const psmFn = catalog.prot_sm[mk] || catalog.prot_sm.des;
      const psmText = typeof psmFn === 'function' ? psmFn(protSmCount) : `${protSmCount} oz de proteína semimagra`;
      parts.push(`• Proteína semimagra (${protSmCount} int.): ${psmText}`);
    }

    // Proteínas Altas en Grasa (se adaptan si hay dieta baja en grasa)
    const protGrasaCount = parseFloat(String((eqMap.prot_grasa || [])[mIdx] || '0').replace(',', '.'));
    if (protGrasaCount > 0) {
      if (isLowFat) {
        parts.push(`• Proteína sustituta (${protGrasaCount} int.): ${protGrasaCount} oz de quesillo desgrasado o queso fresco tierno (Adaptación RIISS: excluye queso duro o chicharrón graso)`);
      } else {
        parts.push(`• Proteína tradicional (${protGrasaCount} int.): ${protGrasaCount} oz de queso fresco artesanal o 1 Cda de mantequilla de maní`);
      }
    }

    // Grasas Saludables
    const grasaCount = parseFloat(String((eqMap.grasas || [])[mIdx] || '0').replace(',', '.'));
    if (grasaCount > 0) {
      const grFn = catalog.grasas[mk] || catalog.grasas.alm;
      let grText = typeof grFn === 'function' ? grFn(grasaCount) : `${grasaCount} grasa(s)`;
      if (isLowK && grText.includes('aguacate')) {
        grText = `${grasaCount} cdta(s) de aceite vegetal o de oliva para cocción (Aviso RIISS: aguacate restringido por potasio)`;
      }
      parts.push(`• Grasa cardiosaludable (${grasaCount} int.): ${grText}`);
    }

    // Otros Carbohidratos (Azúcares)
    const otrosChoCount = parseFloat(String((eqMap.otros_cho || [])[mIdx] || '0').replace(',', '.'));
    if (otrosChoCount > 0) {
      parts.push(`• Azúcares permitidos (${otrosChoCount} int.): ${otrosChoCount} Cda de miel natural o ½ taza de gelatina regular`);
    }

    result[mk] = parts.length > 0 ? parts.join('\n') : '';
  });

  return result;
}
