// Base de datos de Listas de Intercambio de Alimentos (ADA / Listas para la Diabetes) y Modelo Clínico

export const EXCHANGE_GROUPS = [
  // Paso 1: Lácteos, Vegetales y Frutas (Base de Carbohidratos)
  { k: 'incaparina', n: 'Incaparina', cho: 15, p: 4, l: 1, kcal: 85, step: 1, cat: 'Carbohidratos' },
  { k: 'leche_dc', n: 'Leche DC (sin grasa / 1%)', cho: 12, p: 8, l: 2, kcal: 100, step: 1, cat: 'Lácteos' },
  { k: 'leche_sd', n: 'Leche SD (reducida 2%)', cho: 12, p: 8, l: 5, kcal: 120, step: 1, cat: 'Lácteos' },
  { k: 'leche_entera', n: 'Leche entera (4%)', cho: 12, p: 8, l: 8, kcal: 160, step: 1, cat: 'Lácteos' },
  { k: 'veg_sa', n: 'Vegetales S/A (sin almidón)', cho: 5, p: 2, l: 0, kcal: 25, step: 1, cat: 'Vegetales' },
  { k: 'frutas', n: 'Frutas', cho: 15, p: 0, l: 0, kcal: 60, step: 1, cat: 'Frutas' },

  // Paso 2: Almidones y Otros Carbohidratos (Cuadre de CHO)
  { k: 'almidones', n: 'Almidones', cho: 15, p: 3, l: 1, kcal: 80, step: 2, cat: 'Almidones' },
  { k: 'otros_cho', n: 'Otros CHO (Azúcares)', cho: 15, p: 0, l: 0, kcal: 60, step: 2, cat: 'Azúcares' },

  // Paso 3: Proteínas (Cuadre de CHON)
  { k: 'prot_magra', n: 'Proteína magra', cho: 0, p: 7, l: 2, kcal: 45, step: 3, cat: 'Proteínas' },
  { k: 'prot_sm', n: 'Proteína SM (semimagra)', cho: 0, p: 7, l: 5, kcal: 75, step: 3, cat: 'Proteínas' },
  { k: 'prot_grasa', n: 'Proteína grasa (alta en grasa)', cho: 0, p: 7, l: 8, kcal: 100, step: 3, cat: 'Proteínas' },

  // Paso 4: Grasas y Alcohol (Cuadre de COOH / Lípidos)
  { k: 'grasas', n: 'Grasas', cho: 0, p: 0, l: 5, kcal: 45, step: 4, cat: 'Grasas' },
  { k: 'alcohol', n: 'Alcohol', cho: 0, p: 0, l: 0, kcal: 100, step: 4, cat: 'Alcohol' },
];

export const MEAL_TIMES = [
  { k: 'des', n: 'Desayuno', minPct: 30, maxPct: 35, rangeLabel: '30 - 35%' },
  { k: 'c1', n: 'Merienda AM', minPct: 5, maxPct: 10, rangeLabel: '5 - 10%' },
  { k: 'alm', n: 'Almuerzo', minPct: 25, maxPct: 30, rangeLabel: '25 - 30%' },
  { k: 'c2', n: 'Merienda PM', minPct: 5, maxPct: 10, rangeLabel: '5 - 10%' },
  { k: 'cen', n: 'Cena', minPct: 20, maxPct: 25, rangeLabel: '20 - 25%' },
];

// Catálogo completo del documento PDF "Listas de Alimentos para la Diabetes"
export const FOOD_EXCHANGE_CATALOG = [
  {
    groupKey: 'almidones',
    title: 'Almidones: Panes, Cereales, Granos, Vegetales con Almidón, Galletas y Legumbres',
    nutrientNote: '1 opción = 15 g CHO, 3 g proteína, 1 g grasa y 80 calorías.',
    subcategories: [
      {
        name: 'Panes y Tortillas',
        items: [
          { food: 'Tortilla de maíz', portion: '1 tortilla pequeña (6 pulgadas de diámetro)', meals: ['des', 'alm', 'cen'] },
          { food: 'Tortilla de harina (blanca o integral)', portion: '1 tortilla pequeña (6 pulg) o ⅓ grande (10 pulg)', meals: ['des', 'alm', 'cen'] },
          { food: 'Pan de molde integral, blanco, centeno o masa madre', portion: '1 rebanada (1 oz)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Pan de molde bajo en calorías (light)', portion: '2 rebanadas (1½ oz)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Pan sin gluten', portion: '1 rebanada (1 oz)', meals: ['des', 'cen'] },
          { food: 'Bolillo / Pan francés', portion: '4½ a 5 pulgadas de largo o ⅓ unidad (1 oz)', meals: ['des', 'alm', 'cen'] },
          { food: 'Bagel (rosca de pan)', portion: '½ de bagel grande (1 oz)', meals: ['des', 'c1'] },
          { food: 'Panecillo inglés (English muffin)', portion: '½ panecillo', meals: ['des', 'c1'] },
          { food: 'Pan pita', portion: '½ pita (6 pulgadas de diámetro)', meals: ['alm', 'cen'] },
          { food: 'Pan para hamburguesa o salchicha', portion: '½ pan (¾ oz)', meals: ['alm', 'cen'] },
          { food: 'Panqueque (pancake)', portion: '1 panqueque (4 pulg de diámetro, ½ pulg grosor)', meals: ['des', 'cen'] },
          { food: 'Waffle', portion: '1 waffle (cuadrado o redondo de 4 pulgadas)', meals: ['des'] },
          { food: 'Pan de maíz (cornbread)', portion: 'Cubo de 1¾ pulgadas (1½ oz)', meals: ['alm', 'cen'] },
          { food: 'Tortilla crujiente para tacos (cuenta +1 grasa)', portion: '2 tortillas (5 pulgadas)', meals: ['alm', 'cen'] },
        ]
      },
      {
        name: 'Cereales y Granos (porciones cocidas)',
        items: [
          { food: 'Avena cocida (o crema de avena / arroz)', portion: '½ taza', meals: ['des', 'c1', 'cen'] },
          { food: 'Arroz blanco o integral cocido', portion: '⅓ taza', meals: ['alm', 'cen'] },
          { food: 'Arroz silvestre cocido', portion: '½ taza', meals: ['alm', 'cen'] },
          { food: 'Pastas cocidas (trigo integral, blanca o multigrano)', portion: '⅓ taza', meals: ['alm', 'cen'] },
          { food: 'Quinua cocida (todos los colores)', portion: '⅓ taza', meals: ['alm', 'cen'] },
          { food: 'Cereal listo para comer sin endulzar', portion: '¾ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Cereal inflado', portion: '1½ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Cereal de salvado (hojuelas o palitos)', portion: '½ taza', meals: ['des', 'c1'] },
          { food: 'Granola o Muesli', portion: '¼ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Cuscús, Bulgur, Cebada o Amaranto cocido', portion: '⅓ taza', meals: ['alm', 'cen'] },
          { food: 'Polenta cocida o Sémola cocida', portion: '⅓ a ½ taza', meals: ['des', 'alm', 'cen'] },
          { food: 'Germen de trigo seco', portion: '3 Cdas', meals: ['des', 'c1'] },
        ]
      },
      {
        name: 'Vegetales con Almidón y Tubérculos',
        items: [
          { food: 'Papa hervida (de todo tipo)', portion: '½ taza o ½ papa mediana (3 oz)', meals: ['alm', 'cen'] },
          { food: 'Papa horneada con cáscara', portion: '½ de papa grande (3 oz)', meals: ['alm', 'cen'] },
          { food: 'Puré de papa', portion: '½ taza', meals: ['alm', 'cen'] },
          { food: 'Camote (batata / boniato) cocido', portion: '½ taza (3½ oz)', meals: ['alm', 'cen', 'c2'] },
          { food: 'Plátano macho o banano maduro cocido', portion: '½ taza', meals: ['des', 'alm', 'cen'] },
          { food: 'Elote (maíz en grano cocido)', portion: '½ taza', meals: ['alm', 'cen'] },
          { food: 'Elote en mazorca', portion: 'Trozo de 3¾–4½ pulgadas (½ mazorca grande)', meals: ['alm', 'cen'] },
          { food: 'Yuca (cassava / mandioca) cocida', portion: '⅓ taza', meals: ['alm', 'cen'] },
          { food: 'Malanga (yautía)', portion: '1 pequeña o ½ taza en puré', meals: ['alm', 'cen'] },
          { food: 'Calabaza de invierno (zapallo / butternut)', portion: '1 taza', meals: ['alm', 'cen'] },
          { food: 'Chícharos (guisantes / arvejas) verdes cocidos', portion: '½ taza', meals: ['alm', 'cen'] },
        ]
      },
      {
        name: 'Galletas Saladas y Bocadillos',
        items: [
          { food: 'Galletas de soda (saltinas)', portion: '6 galletas', meals: ['c1', 'c2', 'alm', 'cen'] },
          { food: 'Galletas de trigo integral horneadas', portion: '5 cuadrados regulares (¾ oz)', meals: ['c1', 'c2'] },
          { food: 'Galletas Graham', portion: '3 cuadrados (de 2½ pulgadas)', meals: ['c1', 'c2'] },
          { food: 'Galletas de animalitos', portion: '8 galletas', meals: ['c1', 'c2'] },
          { food: 'Tortitas de arroz (rice cakes)', portion: '2 tortitas (4 pulgadas de diámetro)', meals: ['c1', 'c2'] },
          { food: 'Palomitas de maíz (sin grasa agregada)', portion: '3 tazas', meals: ['c1', 'c2'] },
          { food: 'Barra de granola', portion: '1 barra (¾ oz)', meals: ['c1', 'c2'] },
          { food: 'Pretzels', portion: '¾ oz (aprox. 20 pequeños)', meals: ['c1', 'c2'] },
          { food: 'Chips horneados (de papa o pan pita)', portion: 'Aprox. 8 chips (¾ oz)', meals: ['c1', 'c2'] },
        ]
      },
      {
        name: 'Frijoles, Chícharos y Lentejas (1 Almidón + 1 Proteína Magra)',
        items: [
          { food: 'Frijoles cocidos (negros, colorados, blancos, pintos)', portion: '½ taza', meals: ['des', 'alm', 'cen'] },
          { food: 'Frijoles refritos o volteados', portion: '½ taza', meals: ['des', 'alm', 'cen'] },
          { food: 'Lentejas cocidas', portion: '½ taza', meals: ['alm', 'cen'] },
          { food: 'Garbanzos o habas cocidas', portion: '½ taza', meals: ['alm', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'frutas',
    title: 'Frutas y Jugos de Fruta',
    nutrientNote: '1 opción = 15 g CHO, 0 g proteína, 0 g grasa y 60 calorías.',
    subcategories: [
      {
        name: 'Frutas Frescas y Secas',
        items: [
          { food: 'Manzana fresca sin pelar', portion: '1 manzana pequeña (4 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Plátano (guineo / banana)', portion: '1 plátano pequeño o ½ mediano (4 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Papaya picada', portion: '1 taza en cubos (o ½ papaya de 8 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Melón cantalupo o melón verde (honeydew)', portion: '1 taza picado en cubos', meals: ['des', 'c1', 'c2'] },
          { food: 'Sandía', portion: '1¼ taza cortada en cubos', meals: ['des', 'c1', 'c2'] },
          { food: 'Piña fresca (ananá)', portion: '¾ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Fresas enteras (frutillas)', portion: '1¼ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Naranja fresca', portion: '1 naranja mediana (8½ oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Mandarina o tangerina', portion: '1 grande (6 oz) o 2 pequeñas', meals: ['c1', 'c2'] },
          { food: 'Mango fresco', portion: '½ mango pequeño (5½ oz) o ½ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Uvas frescas', portion: '17 uvas pequeñas (3 oz)', meals: ['c1', 'c2'] },
          { food: 'Pera fresca', portion: '½ pera grande (4 oz)', meals: ['c1', 'c2'] },
          { food: 'Durazno (melocotón) o Nectarina fresca', portion: '1 mediano (5½–6 oz)', meals: ['c1', 'c2'] },
          { food: 'Kiwi en rebanadas', portion: '½ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Arándanos (moras azules)', portion: '¾ taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Frambuesas o Zarzamoras', portion: '1 taza', meals: ['des', 'c1', 'c2'] },
          { food: 'Guayaba', portion: '2 guayabas pequeñas (2 oz)', meals: ['c1', 'c2'] },
          { food: 'Ciruelas frescas', portion: '2 ciruelas pequeñas (5 oz)', meals: ['c1', 'c2'] },
          { food: 'Fruta seca (pasas, arándanos secos)', portion: '2 Cdas', meals: ['des', 'c1', 'c2'] },
          { food: 'Jugo 100% de naranja, manzana o piña', portion: '½ taza (4 oz líq)', meals: ['des'] },
        ]
      }
    ]
  },
  {
    groupKey: 'leche_dc',
    title: 'Leche y Sustitutos: Sin Grasa o Bajos en Grasa (1%)',
    nutrientNote: '1 opción = 12 g CHO, 8 g proteína, 0–3 g grasa y 100 calorías.',
    subcategories: [
      {
        name: 'Lácteos Descremados (DC)',
        items: [
          { food: 'Leche descremada o baja en grasa (1%) (con o sin lactosa)', portion: '1 taza (8 oz líq)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Yogur natural o griego sin grasa (sin azúcar)', portion: '¾ taza (6 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Leche evaporada descremada', portion: '½ taza (4 oz líq)', meals: ['des', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'leche_sd',
    title: 'Leche y Sustitutos: Reducidos en Grasa (2%)',
    nutrientNote: '1 opción = 12 g CHO, 8 g proteína, 5 g grasa y 120 calorías.',
    subcategories: [
      {
        name: 'Lácteos Semidescremados (SD)',
        items: [
          { food: 'Leche reducida en grasa al 2% (o deslactosada 2%)', portion: '1 taza (8 oz líq)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Kéfir o leche acidophilus al 2%', portion: '1 taza (8 oz líq)', meals: ['des', 'c1', 'c2'] },
          { food: 'Yogur natural semidescremado', portion: '¾ taza (6 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Leche de soja natural', portion: '1 taza (8 oz líq)', meals: ['des', 'c1', 'c2'] },
        ]
      }
    ]
  },
  {
    groupKey: 'leche_entera',
    title: 'Leche y Sustitutos: Grasa Regular (4%)',
    nutrientNote: '1 opción = 12 g CHO, 8 g proteína, 8 g grasa y 160 calorías.',
    subcategories: [
      {
        name: 'Lácteos Enteros',
        items: [
          { food: 'Leche entera de vaca o cabra (4%)', portion: '1 taza (8 oz líq)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Yogur natural entero', portion: '1 taza (8 oz)', meals: ['des', 'c1', 'c2'] },
          { food: 'Leche evaporada entera', portion: '½ taza (4 oz líq)', meals: ['des', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'veg_sa',
    title: 'Vegetales sin Almidón (S/A)',
    nutrientNote: '1 opción = ½ taza cocidos o 1 taza crudos = 5 g CHO, 2 g proteína, 0 g grasa y 25 calorías.',
    subcategories: [
      {
        name: 'Vegetales Frescos y Cocidos',
        items: [
          { food: 'Ensalada de lechuga, espinaca, rúcula o berros', portion: '1 taza cruda', meals: ['alm', 'cen'] },
          { food: 'Tomate fresco, pepino y rábanos en rodajas', portion: '1 taza cruda', meals: ['des', 'alm', 'cen'] },
          { food: 'Brócoli o Coliflor al vapor', portion: '½ taza cocida', meals: ['alm', 'cen'] },
          { food: 'Calabacín (zucchini / pipián) o Chayote (güisquil) cocido', portion: '½ taza cocida', meals: ['alm', 'cen'] },
          { food: 'Ejotes (habichuelas verdes) o Espárragos cocidos', portion: '½ taza cocida', meals: ['alm', 'cen'] },
          { food: 'Zanahoria rallada o cocida', portion: '1 taza cruda o ½ taza cocida', meals: ['alm', 'cen'] },
          { food: 'Espinaca, acelga o hierbas salteadas al vapor', portion: '½ taza cocida', meals: ['des', 'alm', 'cen'] },
          { food: 'Chirmol / Pico de gallo (tomate, cebolla, cilantro)', portion: '½ taza', meals: ['des', 'alm', 'cen'] },
          { food: 'Pimientos dulces (chiles pimientos), cebolla y hongos', portion: '½ taza cocida o 1 taza cruda', meals: ['des', 'alm', 'cen'] },
          { food: 'Nopales, apio, jícama o palmitos', portion: '½ taza cocida o 1 taza cruda', meals: ['alm', 'cen', 'c1', 'c2'] },
          { food: 'Repollo (col verde o morada) o Curtido', portion: '½ taza cocido o 1 taza crudo', meals: ['alm', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'prot_magra',
    title: 'Proteínas Magras (Bajas en Grasa)',
    nutrientNote: '1 opción = 0 g CHO, 7 g proteína, 2 g grasa y 45 calorías.',
    subcategories: [
      {
        name: 'Aves, Pescados, Carnes Magras y Claras',
        items: [
          { food: 'Pechuga de pollo o pavo sin piel (a la plancha o cocida)', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Pescado blanco o azul (tilapia, robalo, bacalao, trucha, salmón)', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Atún en lata en agua (escurrido)', portion: '1 oz (30 g)', meals: ['alm', 'cen', 'c2'] },
          { food: 'Carne de res magra (lomito, falda, bistec sin grasa)', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Lomo de cerdo magro', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Claras de huevo', portion: '2 claras de huevo', meals: ['des', 'cen'] },
          { food: 'Requesón (cottage cheese) o Ricotta bajo en grasa', portion: '¼ taza (2 oz)', meals: ['des', 'c1', 'c2', 'cen'] },
          { food: 'Queso fresco bajo en grasa (≤ 3 g grasa/oz)', portion: '1 oz (30 g)', meals: ['des', 'cen'] },
          { food: 'Jamón de pavo bajo en grasa', portion: '1 oz (1–2 rodajas)', meals: ['des', 'c1', 'cen'] },
          { food: 'Camarones o mariscos al natural', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Tofu light', portion: '½ taza (4 oz)', meals: ['alm', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'prot_sm',
    title: 'Proteínas Semimagras (Moderadas en Grasa)',
    nutrientNote: '1 opción = 0 g CHO, 7 g proteína, 5 g grasa y 75 calorías.',
    subcategories: [
      {
        name: 'Huevos, Carnes y Quesos Semimagros',
        items: [
          { food: 'Huevo entero de gallina', portion: '1 huevo', meals: ['des', 'cen'] },
          { food: 'Queso mozzarella, feta o queso fresco artesanal', portion: '1 oz (30 g)', meals: ['des', 'cen', 'c1', 'c2'] },
          { food: 'Queso ricotta regular', portion: '¼ taza (2 oz)', meals: ['des', 'cen'] },
          { food: 'Pollo o pavo (muslo/pierna o con piel)', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Carne de res (cortes regulares o molida 85% magra)', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Chuleta o milanesa de cerdo', portion: '1 oz (30 g)', meals: ['alm', 'cen'] },
          { food: 'Tofu firme regular', portion: '½ taza (4 oz)', meals: ['alm', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'prot_grasa',
    title: 'Proteínas con Alto Contenido de Grasa',
    nutrientNote: '1 opción = 0 g CHO, 7 g proteína, 8 g grasa y 100 calorías. (Limitar a ≤ 3 porciones/sem).',
    subcategories: [
      {
        name: 'Quesos Maduros y Embutidos',
        items: [
          { food: 'Queso cheddar, suizo, Monterrey Jack, parmesano o americano', portion: '1 oz (30 g)', meals: ['des', 'alm', 'cen'] },
          { food: 'Salchicha o embutido regular', portion: '1 oz (o 1 hot dog)', meals: ['des', 'cen'] },
          { food: 'Costilla de cerdo', portion: '1 oz (30 g)', meals: ['alm'] },
          { food: 'Mantequilla de maní / almendra (como aporte proteico)', portion: '1 Cda', meals: ['des', 'c1', 'c2'] },
        ]
      }
    ]
  },
  {
    groupKey: 'grasas',
    title: 'Grasas: Monoinsaturadas, Poliinsaturadas y Saturadas',
    nutrientNote: '1 opción = 0 g CHO, 0 g proteína, 5 g grasa y 45 calorías.',
    subcategories: [
      {
        name: 'Grasas Monoinsaturadas (Cardiosaludables)',
        items: [
          { food: 'Aceite de oliva, canola o maní', portion: '1 cdta (5 mL)', meals: ['des', 'alm', 'cen'] },
          { food: 'Aguacate (palta)', portion: '2 Cdas (1 oz / 30 g)', meals: ['des', 'alm', 'cen'] },
          { food: 'Almendras o Anacardos (marañón)', portion: '6 unidades', meals: ['c1', 'c2', 'des'] },
          { food: 'Cacahuates (maníes)', portion: '10 unidades', meals: ['c1', 'c2'] },
          { food: 'Nueces de nogal o Pecanas', portion: '4 mitades', meals: ['c1', 'c2', 'des'] },
          { food: 'Pistachos', portion: '16 unidades', meals: ['c1', 'c2'] },
          { food: 'Mantequilla de maní o almendra (sin grasas trans)', portion: '1½ cdta', meals: ['des', 'c1', 'c2'] },
          { food: 'Aceitunas negras o verdes', portion: '8 negras o 10 verdes', meals: ['alm', 'cen'] },
        ]
      },
      {
        name: 'Grasas Poliinsaturadas',
        items: [
          { food: 'Aceite de maíz, girasol, soya o cártamo', portion: '1 cdta (5 mL)', meals: ['des', 'alm', 'cen'] },
          { food: 'Semillas de chía, linaza, girasol, calabaza o ajonjolí', portion: '1 Cda', meals: ['des', 'c1', 'c2'] },
          { food: 'Mayonesa regular', portion: '1 cdta (o 1 Cda reducida en grasa)', meals: ['alm', 'cen'] },
          { food: 'Margarina sin grasas trans', portion: '1 cdta', meals: ['des', 'cen'] },
          { food: 'Aderezo para ensalada regular', portion: '1 Cda (o 2 Cdas bajo en grasa)', meals: ['alm', 'cen'] },
        ]
      },
      {
        name: 'Grasas Saturadas',
        items: [
          { food: 'Crema ácida o crema fresca regular', portion: '2 Cdas (o 3 Cdas light)', meals: ['des', 'cen'] },
          { food: 'Queso crema regular', portion: '1 Cda (½ oz)', meals: ['des', 'c1', 'cen'] },
          { food: 'Mantequilla en barra', portion: '1 cdta', meals: ['des', 'cen'] },
          { food: 'Tocino cocido', portion: '1 rebanada', meals: ['des'] },
        ]
      }
    ]
  },
  {
    groupKey: 'incaparina',
    title: 'Incaparina / Mezclas Vegetales Fortificadas',
    nutrientNote: '1 opción = 15 g CHO, 4 g proteína, 1 g grasa y 85 calorías.',
    subcategories: [
      {
        name: 'Atoles y Bebidas Fortificadas',
        items: [
          { food: 'Atol de Incaparina cocido en agua', portion: '1 taza (2 Cdas rasas de harina / 18–20 g)', meals: ['des', 'c1', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'otros_cho',
    title: 'Otros Carbohidratos: Azúcares, Dulces y Postres',
    nutrientNote: '1 opción = 15 g CHO y 60 calorías.',
    subcategories: [
      {
        name: 'Endulzantes y Postres Simples',
        items: [
          { food: 'Miel de abeja o Sirope de agave', portion: '1 Cda', meals: ['des', 'c1'] },
          { food: 'Mermelada o jalea 100% fruta', portion: '1½ Cda (o 1 Cda regular)', meals: ['des', 'c1'] },
          { food: 'Azúcar (blanca o morena)', portion: '1 Cda', meals: ['des', 'c1', 'c2'] },
          { food: 'Gelatina regular', portion: '½ taza', meals: ['alm', 'c2', 'cen'] },
        ]
      }
    ]
  },
  {
    groupKey: 'alcohol',
    title: 'Bebidas Alcohólicas',
    nutrientNote: '1 equivalente = ~100 calorías.',
    subcategories: [
      {
        name: 'Bebidas',
        items: [
          { food: 'Vino tinto, blanco o rosado', portion: '5 oz líq (1 copa)', meals: ['alm', 'cen'] },
          { food: 'Cerveza light', portion: '12 oz líq (1 lata)', meals: ['alm', 'cen'] },
          { food: 'Licor destilado (vodka, ron, whisky, tequila)', portion: '1½ oz líq', meals: ['cen'] },
        ]
      }
    ]
  }
];

/**
 * Genera sugerencias de menú clínico para cada tiempo de comida respetando
 * estrictamente los intercambios asignados y las porciones del documento PDF.
 */
export function generateMealMenuFromExchanges(eqMap, variantIndex = 0) {
  const result = {};

  // Opciones curadas por grupo y tiempo de comida basadas en el PDF
  const templates = {
    incaparina: {
      des: ['taza de atol de Incaparina (2 Cdas en agua)'],
      c1: ['taza de atol de Incaparina'],
      alm: ['taza de Incaparina'],
      c2: ['taza de Incaparina'],
      cen: ['taza de atol de Incaparina caliente'],
    },
    leche_dc: {
      des: ['taza (8 oz) de leche descremada (sin grasa / 1%)', '¾ taza (6 oz) de yogur natural descremado'],
      c1: ['¾ taza (6 oz) de yogur griego sin grasa', 'taza (8 oz) de leche descremada'],
      alm: ['taza (8 oz) de leche descremada'],
      c2: ['¾ taza (6 oz) de yogur natural descremado', 'taza (8 oz) de leche 1%'],
      cen: ['taza (8 oz) de leche descremada tibia', '¾ taza de yogur natural sin grasa'],
    },
    leche_sd: {
      des: ['taza (8 oz) de leche semidescremada al 2%', '¾ taza (6 oz) de yogur natural al 2%'],
      c1: ['¾ taza (6 oz) de yogur natural al 2%', 'taza (8 oz) de leche semidescremada'],
      alm: ['taza (8 oz) de leche al 2%'],
      c2: ['¾ taza (6 oz) de yogur natural al 2%', 'taza (8 oz) de kéfir / leche al 2%'],
      cen: ['taza (8 oz) de leche semidescremada al 2%', '¾ taza (6 oz) de yogur natural'],
    },
    leche_entera: {
      des: ['taza (8 oz) de leche entera', 'taza (8 oz) de yogur natural entero'],
      c1: ['taza (8 oz) de yogur natural entero'],
      alm: ['taza (8 oz) de leche entera'],
      c2: ['taza (8 oz) de yogur natural entero'],
      cen: ['taza (8 oz) de leche entera'],
    },
    veg_sa: {
      des: [
        '½ taza de espinacas, tomate y cebolla salteados (1 opc. vegetal S/A)',
        '1 taza de tomate y pepino fresco en rodajas (1 opc. vegetal S/A)',
        '½ taza de chirmol / pico de gallo y champiñones (1 opc. vegetal S/A)'
      ],
      c1: [
        '1 taza de bastones de pepino, apio y zanahoria cruda',
        '1 taza de jícama y pepino con limón'
      ],
      alm: [
        '1 taza de ensalada fresca (lechuga, tomate, pepino) o ½ taza de brócoli y calabacín al vapor',
        '½ taza de ejotes y zanahoria al vapor + ensalada de hojas verdes',
        '1 taza de ensalada mixta (espinaca, tomate, pimientos) o ½ taza de chayote y coliflor cocidos'
      ],
      c2: [
        '1 taza de pepino y apio fresco',
        '1 taza de zanahoria y jícama en bastones'
      ],
      cen: [
        '½ taza de vegetales cocidos al vapor (calabacín, brócoli o ejotes)',
        '1 taza de ensalada fresca de lechuga, tomate y pepino',
        '½ taza de espinacas o acelgas salteadas con tomate'
      ]
    },
    frutas: {
      des: [
        '1 taza de papaya picada en cubos',
        '1 manzana pequeña (4 oz) o ¾ taza de piña fresca',
        '1 plátano pequeño (4 oz) o 1¼ taza de fresas enteras'
      ],
      c1: [
        '1 manzana pequeña (4 oz) sin pelar',
        '1 naranja mediana o 2 mandarinas pequeñas',
        '1 taza de melón picado en cubos o 17 uvas pequeñas'
      ],
      alm: [
        '1¼ taza de sandía en cubos o ¾ taza de piña fresca',
        '1 durazno mediano (6 oz) o ½ mango pequeño',
        '1 taza de papaya o melón en cubos'
      ],
      c2: [
        '1¼ taza de fresas enteras o ½ pera grande (4 oz)',
        '1 plátano pequeño (4 oz) o 2 guayabas pequeñas',
        '¾ taza de arándanos o 1 manzana pequeña'
      ],
      cen: [
        '½ taza de kiwi en rebanadas o 1 manzana pequeña',
        '1 taza de papaya en cubos'
      ]
    },
    almidones: {
      des: [
        (n) => {
          if (n === 1) return '1 tortilla de maíz (6 pulg) o 1 rebanada de pan integral (1 almidón)';
          if (n === 2) return '2 tortillas de maíz (6 pulg) o ½ taza de avena cocida + 1 rebanada de pan integral (2 almidones)';
          if (n === 3) return '½ taza de frijoles cocidos (1) + 2 tortillas de maíz (2) [Total: 3 almidones]';
          if (n === 4) return '½ taza de avena cocida (1) + ½ taza de frijoles (1) + 2 tortillas de maíz (2) [Total: 4 almidones]';
          if (n === 5) return '½ taza de avena cocida (1) + ½ taza de frijoles (1) + 2 tortillas de maíz (2) + ½ taza de plátano maduro cocido (1) [Total: 5 almidones]';
          return `${n} opciones de almidón (ej. ½ taza de frijoles + ½ taza de avena + tortillas de maíz o pan integral: 1 reb / 1 tortilla = 1 opción)`;
        },
        (n) => {
          if (n === 1) return '½ taza de avena cocida en agua (1 almidón)';
          if (n === 2) return '2 rebanadas de pan integral tostado (2 almidones)';
          if (n === 3) return '1 panqueque de 4 pulg (1) + ½ taza de avena (1) + 1 rebanada de pan integral (1) [Total: 3 almidones]';
          return `${n} opciones de almidón: ${Math.floor(n / 2)} tortillas de maíz + ½ taza de frijoles cocidos + pan integral`;
        }
      ],
      c1: [
        (n) => n === 1
          ? '6 galletas de soda (saltinas) o 3 tazas de palomitas de maíz naturales (1 almidón)'
          : `${n} opciones de almidón (ej. ${n * 3} cuadrados de galleta Graham o ${n} barras de granola de ¾ oz)`,
        (n) => n === 1
          ? '5 galletas de trigo integral horneadas o 2 tortitas de arroz (rice cakes) (1 almidón)'
          : `${n} opciones de almidón (ej. ½ taza de avena o galletas integrales)`
      ],
      alm: [
        (n) => {
          if (n === 1) return '⅓ taza de arroz cocido o 1 tortilla de maíz (1 almidón)';
          if (n === 2) return '⅔ taza de arroz cocido (2 almidones) o ⅓ taza de arroz + 1 tortilla de maíz';
          if (n === 3) return '⅓ taza de arroz (1) + ½ taza de frijoles cocidos (1) + 1 tortilla de maíz (1) [Total: 3 almidones]';
          if (n === 4) return '⅔ taza de arroz (2) + ½ taza de frijoles o lentejas (1) + 1 tortilla de maíz (1) [Total: 4 almidones]';
          if (n === 5) return '⅔ taza de arroz (2) + ½ taza de frijoles (1) + ½ taza de papa o elote cocido (1) + 1 tortilla de maíz (1) [Total: 5 almidones]';
          return `${n} opciones de almidón (combinar: ⅓ taza de arroz = 1, ½ taza de frijoles/lentejas = 1, ½ taza de papa/camote = 1, 1 tortilla de maíz = 1)`;
        },
        (n) => {
          if (n <= 2) return `${n === 1 ? '⅓ taza' : '⅔ taza'} de pasta integral o quinua cocida (${n} almidón)`;
          return `⅔ taza de pasta o arroz integral (2) + ½ taza de garbanzos o lentejas (1) ${n > 3 ? `+ ${n - 3} tortilla(s) de maíz` : ''} [Total: ${n} almidones]`;
        }
      ],
      c2: [
        (n) => n === 1
          ? '3 cuadrados de galletas Graham o 6 galletas de soda / saltinas (1 almidón)'
          : `${n} opciones de almidón (ej. 1 rebanada de pan integral + 3 tazas de palomitas de maíz sin grasa)`,
        (n) => n === 1
          ? '¾ taza de cereal sin azúcar o ¼ taza de granola (1 almidón)'
          : `${n} opciones de almidón (galletas integrales o pan tostado)`
      ],
      cen: [
        (n) => {
          if (n === 1) return '1 tortilla de maíz (6 pulg) o 1 rebanada de pan integral (1 almidón)';
          if (n === 2) return '2 tortillas de maíz o ½ taza de papa/camote cocido + 1 tortilla (2 almidones)';
          if (n === 3) return '½ taza de frijoles cocidos (1) + 2 tortillas de maíz (2) [Total: 3 almidones]';
          if (n === 4) return '½ taza de frijoles (1) + ½ taza de plátano maduro o papa hervida (1) + 2 tortillas de maíz (2) [Total: 4 almidones]';
          return `${n} opciones de almidón (ej. ½ taza de frijoles + tortillas de maíz + ⅓ taza de arroz o ½ taza de papa)`;
        }
      ]
    },
    prot_magra: {
      des: [
        (n) => `${n * 2} claras de huevo o ${n} oz de queso fresco bajo en grasa / requesón (${n * 0.25} taza) (${n} prot. magra)`,
        (n) => `${n} oz de jamón de pavo bajo en grasa o ¼ taza de requesón (cottage) (${n} prot. magra)`
      ],
      c1: [(n) => `${n * 0.25} taza de requesón (cottage) bajo en grasa o ${n} oz de jamón de pavo (${n} prot. magra)`],
      alm: [
        (n) => `${n} oz (${n * 30} g) de pechuga de pollo a la plancha sin piel o filete de pescado al horno (${n} prot. magra)`,
        (n) => `${n} oz (${n * 30} g) de lomito de res magro asado o atún en agua (${n} prot. magra)`
      ],
      c2: [(n) => `${n} oz de queso fresco light o ¼ taza de requesón (${n} prot. magra)`],
      cen: [
        (n) => `${n} oz (${n * 30} g) de filete de pescado / pollo deshebrado o ${n * 2} claras de huevo (${n} prot. magra)`,
        (n) => `${n} oz (${n * 30} g) de atún en agua o queso fresco bajo en grasa (${n} prot. magra)`
      ]
    },
    prot_sm: {
      des: [
        (n) => n === 1
          ? '1 huevo entero revuelto o cocido (o 1 oz de queso fresco/mozzarella) (1 prot. SM)'
          : `${n} huevos enteros (o ${n - 1} huevo + 1 oz de queso fresco/mozzarella) (${n} prot. SM)`,
      ],
      c1: [(n) => `${n} oz de queso mozzarella o feta (${n} prot. SM)`],
      alm: [
        (n) => `${n} oz (${n * 30} g) de carne de res asada / guisada o pollo (${n} prot. SM)`,
        (n) => `${n} oz (${n * 30} g) de lomo/chuleta de cerdo o carne molida 85% magra (${n} prot. SM)`
      ],
      c2: [(n) => `${n} huevo duro o ${n} oz de queso mozzarella (${n} prot. SM)`],
      cen: [
        (n) => n === 1
          ? '1 huevo entero o 1 oz (30 g) de queso fresco / mozzarella o pollo (1 prot. SM)'
          : `${n} oz (${n * 30} g) de pollo/res o ${n} huevos enteros (${n} prot. SM)`
      ]
    },
    prot_grasa: {
      des: [(n) => `${n} oz de queso cheddar/suizo o ${n} Cda de mantequilla de maní (${n} prot. grasa)`],
      c1: [(n) => `${n} Cda de mantequilla de maní o almendra (${n} prot. grasa)`],
      alm: [(n) => `${n} oz de carne o queso maduro (${n} prot. grasa)`],
      c2: [(n) => `${n} Cda de mantequilla de maní (${n} prot. grasa)`],
      cen: [(n) => `${n} oz de queso regular (${n} prot. grasa)`]
    },
    grasas: {
      des: [
        (n) => {
          if (n === 1) return '1 cdta de aceite de oliva/canola o 2 Cdas (1 oz) de aguacate (1 grasa)';
          if (n === 2) return '1 cdta de aceite para cocinar (1) + 2 Cdas de aguacate (1) [Total: 2 grasas]';
          if (n === 3) return '1 cdta de aceite (1) + 2 Cdas de aguacate (1) + 6 almendras o 2 Cdas de crema light (1) [Total: 3 grasas]';
          return `${n} opciones de grasa (ej. 1 cdta de aceite = 1, 2 Cdas de aguacate = 1, 6 almendras = 1)`;
        }
      ],
      c1: [
        (n) => `${n * 6} almendras o ${n * 10} maníes / cacahuates sin sal (${n} grasa${n > 1 ? 's' : ''})`,
        (n) => `${n * 4} mitades de nuez de nogal o ${n} Cda de semillas de chía/girasol (${n} grasa${n > 1 ? 's' : ''})`
      ],
      alm: [
        (n) => {
          if (n === 1) return '1 cdta de aceite de oliva/canola o 2 Cdas de aguacate (1 grasa)';
          if (n === 2) return '1 cdta de aceite de oliva para cocinar (1) + 2 Cdas (1 oz) de aguacate en la ensalada (1) [Total: 2 grasas]';
          return `1–2 cdtas de aceite vegetal + ${n - 1} porción(es) de aguacate (2 Cdas c/u) [Total: ${n} grasas]`;
        }
      ],
      c2: [
        (n) => `${n * 6} almendras o ${n} porción de 1½ cdta de mantequilla de maní (${n} grasa${n > 1 ? 's' : ''})`
      ],
      cen: [
        (n) => {
          if (n === 1) return '1 cdta de aceite de oliva o 2 Cdas de aguacate (1 grasa)';
          if (n === 2) return '1 cdta de aceite para cocinar (1) + 2 Cdas de aguacate (1) [Total: 2 grasas]';
          return `1 cdta de aceite + 2 Cdas de aguacate + semillas/nueces [Total: ${n} grasas]`;
        }
      ]
    },
    otros_cho: {
      des: [(n) => `${n} Cda de miel o mermelada 100% fruta (${n} otro CHO)`],
      c1: [(n) => `½ taza de gelatina o ${n} Cda de miel (${n} otro CHO)`],
      alm: [(n) => `½ taza de gelatina regular (${n} otro CHO)`],
      c2: [(n) => `½ taza de gelatina o 1 Cda de mermelada (${n} otro CHO)`],
      cen: [(n) => `1 Cda de miel (${n} otro CHO)`],
    }
  };

  MEAL_TIMES.forEach((meal, mIdx) => {
    const mk = meal.k;
    const parts = [];

    EXCHANGE_GROUPS.forEach(g => {
      const arr = eqMap[g.k] || [];
      const val = parseFloat(String(arr[mIdx] || '0').replace(',', '.'));
      if (!val || val <= 0) return;

      const groupTemplates = templates[g.k];
      if (!groupTemplates) {
        parts.push(`${val} int. de ${g.n}`);
        return;
      }

      const mealOptions = groupTemplates[mk] || groupTemplates.des || [];
      if (!mealOptions.length) {
        parts.push(`${val} int. de ${g.n}`);
        return;
      }

      const chosen = mealOptions[variantIndex % mealOptions.length];
      if (typeof chosen === 'function') {
        parts.push('• ' + chosen(val));
      } else {
        if (val === 1) {
          parts.push(`• 1 ${chosen.replace(/^1\s+/, '')}`);
        } else {
          parts.push(`• ${val} porciones: ${chosen}`);
        }
      }
    });

    result[mk] = parts.length > 0
      ? parts.join('\n')
      : '';
  });

  return result;
}
