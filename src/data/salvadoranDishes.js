// Base de Datos Estructurada de Platillos Salvadoreños con Equivalencias Nutricionales
// Integrado con tabla_intercambios.xlsx, medidas caseras salvadoreñas y filtros clínicos

export const SALVADORAN_DISHES = [
  // ==========================================
  // DESAYUNOS SALVADOREÑOS
  // ==========================================
  {
    id: 'des_tipico_clasico',
    name: 'Desayuno Típico Clásico Saludable',
    mealType: 'des',
    proteinType: 'huevo_lacteo',
    costLevel: 'economico',
    description: 'Frijoles rojos volteados o parados de la olla, plátano sancochado, cuajada fresca o requesón, huevo revuelto con tomate y cebolla, y tortilla de maíz del comal.',
    prepNotes: 'Preparar frijoles sin manteca ni tocino. Plátano hervido o al vapor. Huevo al sartén con spray vegetal o 1 cdta de aceite medido.',
    clinicalTags: ['hipertension_friendly', 'renal_adaptable', 'diabetes_friendly'],
    renalNote: 'Doble cocción para el plátano o sustituir por tortilla. Frijoles con remojo previo de 24 h.',
    ingredients: [
      { name: 'Frijoles rojos de seda cocidos (de la olla)', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Plátano maduro sancochado', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado del comal', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Huevo entero revuelto con tomate y cebolla', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'unidad', exchanges: 1, step: 3 },
      { name: 'Cuajada fresca salvadoreña o requesón magro', exchangeGroup: 'prot_magra', baseQty: 1, unit: 'oz (30 g)', exchanges: 1, step: 3 },
      { name: 'Chirimol natural (tomate, cebolla, cilantro)', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Aceite vegetal para cocción o aguacate criollo', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta / 2 Cdas', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'des_pupusas_saludables',
    name: 'Pupusas Tradicionales Saludables al Comal (Frijol con Quesillo / Ayote / Espinaca)',
    mealType: 'des',
    proteinType: 'lacteo',
    costLevel: 'economico',
    description: 'Elaboradas con masa de maíz nixtamalizado o arroz, quesillo bajo en grasa, frijol molido sin manteca o ayote/espinaca, acompañadas de curtido tradicional y salsa de tomate natural.',
    prepNotes: 'Cocer al comal sin aceite añadido en la plancha. Curtido a base de vinagre de manzana o piña con orégano y sal mínima. Salsa natural de tomate hervido sin consomé.',
    clinicalTags: ['diabetes_friendly', 'renal_adaptable', 'hipertension_friendly'],
    renalNote: 'Preferir masa de arroz o maíz con relleno de quesillo bajo en sal y ayote tierno. Curtido sin sal añadida.',
    ingredients: [
      { name: 'Pupusas de maíz o arroz al comal (masa)', exchangeGroup: 'almidones', baseQty: 2, unit: 'unidades', exchanges: 2, step: 2 },
      { name: 'Frijol rojo molido sin manteca (relleno)', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Quesillo bajo en grasa / queso fresco tierno', exchangeGroup: 'prot_sm', baseQty: 1.5, unit: 'oz (45 g)', exchanges: 1.5, step: 3 },
      { name: 'Curtido salvadoreño tradicional (repollo, zanahoria)', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Salsa de tomate criollo natural caliente', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Rocío de aceite vegetal para palmeo', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'des_casamiento_aguacate',
    name: 'Casamiento Salvadoreño con Huevo y Aguacate',
    mealType: 'des',
    proteinType: 'huevo_leguminosa',
    costLevel: 'regular',
    description: 'Mezcla tradicional de arroz blanco y frijoles rojos cocidos salteados con cebollín y chile verde, acompañado de huevo estrellado en aceite medido, lascas de aguacate y queso fresco.',
    prepNotes: 'Sofreír el casamiento con rocío vegetal medido y olores naturales (chile verde, cebolla, ajo). Huevo al gusto cocinado con 1 cdta de aceite.',
    clinicalTags: ['hipertension_friendly', 'renal_adaptable'],
    renalNote: 'Arroz con frijoles bien enjuagados; moderar aguacate si hay hiperpotasemia.',
    ingredients: [
      { name: 'Casamiento salvadoreño (arroz y frijoles cocidos)', exchangeGroup: 'almidones', baseQty: 0.75, unit: 'taza', exchanges: 2, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Huevo entero estrellado o revuelto', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'unidad', exchanges: 1, step: 3 },
      { name: 'Queso fresco tierno artesanal', exchangeGroup: 'prot_magra', baseQty: 1, unit: 'oz (30 g)', exchanges: 1, step: 3 },
      { name: 'Aguacate criollo fresco en lascas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Tomate y cebollín en la cocción', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
    ]
  },
  {
    id: 'des_tamal_elote_gallina',
    name: 'Tamal de Elote o Tamal de Gallina (Porción Controlada)',
    mealType: 'des',
    proteinType: 'aves',
    costLevel: 'regular',
    description: 'Tamal de elote tierno recién elaborado o tamal de masa de maíz con pechuga de gallina desgrasada en salsa criolla, acompañado de café negro o café con leche descremada.',
    prepNotes: 'Preparado con masa de maíz colada con poco aceite vegetal en lugar de manteca de cerdo. Pechuga desgrasada hervida previamente.',
    clinicalTags: ['bland', 'diabetes_friendly'],
    renalNote: 'Tamal de gallina desgrasado; controlar líquidos totales si hay restricción hídrica.',
    ingredients: [
      { name: 'Tamal de maíz / elote tierno mediano', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad (120 g)', exchanges: 2, step: 2 },
      { name: 'Pechuga de gallina o pollo deshebrada (relleno)', exchangeGroup: 'prot_magra', baseQty: 1.5, unit: 'oz (45 g)', exchanges: 1.5, step: 3 },
      { name: 'Salsa criolla de tomate y especias naturales', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Aceite vegetal en la masa (medido)', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Café caliente con leche descremada al 1%', exchangeGroup: 'leche_dc', baseQty: 1, unit: 'taza (8 oz)', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'des_platano_frijol_requeson',
    name: 'Plátano Sancochado con Frijoles Molidos y Requesón Criollo',
    mealType: 'des',
    proteinType: 'lacteo',
    costLevel: 'economico',
    description: 'Plátano maduro hervido con canela, servido con frijoles rojos molidos cocidos sin grasa y requesón artesanal bajo en grasa y sal.',
    prepNotes: 'Hervir plátano con raja de canela en agua sin azúcar añadida. Frijol licuado y cocido a fuego lento.',
    clinicalTags: ['hipertension_friendly', 'bland', 'low_fat'],
    renalNote: 'Doble hervor para el plátano desechando el agua de cocción para remover potasio.',
    ingredients: [
      { name: 'Plátano maduro hervido en rodajas', exchangeGroup: 'almidones', baseQty: 0.75, unit: 'taza', exchanges: 1.5, step: 2 },
      { name: 'Frijoles rojos molidos sin manteca', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz caliente', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Requesón magro artesanal salvadoreño', exchangeGroup: 'prot_magra', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Aguacate criollo fresco en rodajas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Papaya criolla picada fresca', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'des_omelette_loroco',
    name: 'Omelette Salvadoreño con Loroco Fresco y Quesillo',
    mealType: 'des',
    proteinType: 'huevo',
    costLevel: 'regular',
    description: 'Huevos batidos con flor de loroco tierno, tomate picado y quesillo bajo en grasa, acompañado de pan francés medido o tortilla de maíz y fruta picada.',
    prepNotes: 'Saltear el loroco y tomate antes de verter los huevos. Usar sartén antiadherente con rocío de aceite medido.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Apto y rico en proteína de alto valor biológico con bajo fósforo inorgánico.',
    ingredients: [
      { name: 'Huevos enteros batidos con 1 clara adicional', exchangeGroup: 'prot_sm', baseQty: 1.5, unit: 'unidades', exchanges: 1.5, step: 3 },
      { name: 'Quesillo bajo en grasa / queso fresco rallado', exchangeGroup: 'prot_magra', baseQty: 1, unit: 'oz (30 g)', exchanges: 1, step: 3 },
      { name: 'Flor de loroco fresco picado con tomate y cebollín', exchangeGroup: 'veg_sa', baseQty: 0.75, unit: 'taza', exchanges: 0.75, step: 1 },
      { name: 'Pan francés salvadoreño medido (o 2 tortillas)', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad (1 oz)', exchanges: 1, step: 2 },
      { name: 'Aceite vegetal para el sartén', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Melón o papaya salvadoreña picada', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'des_atol_elote_shuco',
    name: 'Atol de Elote o Atol Shuco Tradicional (Versión Clínica)',
    mealType: 'des',
    proteinType: 'cereal_leguminosa',
    costLevel: 'economico',
    description: 'Atol de maíz tierno o maíz fermentado con frijoles enteros y pepitoria molida, acompañado de pan francés tostado y queso fresco.',
    prepNotes: 'Cocer el atol con canela natural y sin azúcar refinada añadida. Servir caliente.',
    clinicalTags: ['bland', 'diabetes_friendly'],
    renalNote: 'Vigilar contenido de potasio y líquidos en el atol.',
    ingredients: [
      { name: 'Atol de elote o shuco casero sin azúcar', exchangeGroup: 'almidones', baseQty: 1, unit: 'taza (8 oz)', exchanges: 2, step: 2 },
      { name: 'Pan francés salvadoreño tostado al horno', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad (1 oz)', exchanges: 1, step: 2 },
      { name: 'Queso fresco desgrasado en lascas', exchangeGroup: 'prot_sm', baseQty: 1.5, unit: 'oz (45 g)', exchanges: 1.5, step: 3 },
      { name: 'Pepitoria o semilla de ayote tostada y molida', exchangeGroup: 'grasas', baseQty: 1, unit: 'Cda', exchanges: 1, step: 4 },
    ]
  },

  // ==========================================
  // ALMUERZOS SALVADOREÑOS
  // ==========================================
  {
    id: 'alm_sopa_res',
    name: 'Sopa de Res Salvadoreña Tradicional con Verduras Criollas',
    mealType: 'alm',
    proteinType: 'res',
    costLevel: 'regular',
    description: 'Posta de res magra cocida a fuego lento con elote, yuca, güisquil, pipián, zanahoria, repollo y ejotes, servida con arroz blanco, tortilla de maíz y limón.',
    prepNotes: 'Desgrasar el caldo refrigerando previamente o retirando la grasa superficial. Usar posta de res magra. Verduras al vapor o hervidas en el caldo desgrasado.',
    clinicalTags: ['hipertension_friendly', 'renal_adaptable', 'bland'],
    renalNote: 'Doble cocción en agua para la yuca y papa; caldo colado con bajo contenido de sodio y fósforo.',
    ingredients: [
      { name: 'Posta de res magra cocida en trozo', exchangeGroup: 'prot_sm', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Yuca hervida o trozo de elote tierno', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza / ½ elote', exchanges: 1, step: 2 },
      { name: 'Arroz blanco cocido al vapor', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Verduras criollas de la sopa (güisquil, pipián, repollo)', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aguacate criollo fresco en la mesa', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Sandía fresca en cubos de postre', exchangeGroup: 'frutas', baseQty: 1.25, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_gallo_chicha_ligero',
    name: 'Gallo en Chicha Tradicional (Versión Ligera y Desgrasada)',
    mealType: 'alm',
    proteinType: 'aves',
    costLevel: 'regular',
    description: 'Pechuga o muslo de pollo sin piel cocinado en salsa criolla tradicional (tomate, cebolla, ciruelas pasas, canela y especias con dulzor medido), arroz blanco, ensalada fresca de pepino y rábano, y tortilla.',
    prepNotes: 'Sellar el pollo sin piel en seco. Salsa con base de tomate natural, canela y pimienta gorda con ciruela pasa medida para el toque aromático sin exceso de azúcar.',
    clinicalTags: ['diabetes_friendly', 'low_fat', 'bland'],
    renalNote: 'Pollo hervido para desfosforilar; limitar caldo concentrado.',
    ingredients: [
      { name: 'Pechuga de pollo sin piel en salsa chicha ligera', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Arroz blanco al vapor con vegetales', exchangeGroup: 'almidones', baseQty: 0.66, unit: 'taza', exchanges: 2, step: 2 },
      { name: 'Tortilla de maíz del comal', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Ensalada fresca de pepino, rábano y lechuga con limón', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aceite de oliva para aderezar ensalada', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Piña salvadoreña en trozos', exchangeGroup: 'frutas', baseQty: 0.75, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_carne_asada_chirimol',
    name: 'Carne Asada al Carbón con Chirimol Criollo y Frijoles Parados',
    mealType: 'alm',
    proteinType: 'res',
    costLevel: 'costoso',
    description: 'Filete de res magro (corte de salón o lomito) asado a la parrilla, acompañado de chirimol fresco (tomate, cebolla, cilantro, limón), frijoles rojos parados de la olla, arroz y tortilla.',
    prepNotes: 'Asar al carbón o plancha caliente sin grasas añadidas. Chirimol con sal reducida y abundante jugo de limón.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly'],
    renalNote: 'Carne magra en porción exacta; frijoles con remojo prolongado de 24 horas.',
    ingredients: [
      { name: 'Filete de res magro asado a la plancha o carbón', exchangeGroup: 'prot_sm', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Frijoles rojos de la olla (parados)', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Arroz blanco con ejotes', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Chirimol fresco con tomate, cilantro y limón', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Aguacate criollo fresco en rebanadas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Naranja criolla fresca en gajos', exchangeGroup: 'frutas', baseQty: 1, unit: 'unidad mediana', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_pescado_plancha_tilapia',
    name: 'Pescado a la Plancha al Ajo y Limón (Boca Colorada o Tilapia Fresca)',
    mealType: 'alm',
    proteinType: 'pescado',
    costLevel: 'costoso',
    description: 'Filete de pescado blanco fresco a la plancha sazonado con ajo majado, orégano y jugo de limón, acompañado de ensalada fresca con aguacate, arroz jardinero y tortilla.',
    prepNotes: 'Cocinar en sartén antiadherente con rocío de aceite de oliva. Ensalada fresca variada aderezada con limón y cilantro.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat', 'renal_adaptable'],
    renalNote: 'Excelente opción proteica de alta digestibilidad con bajo contenido de grasa saturada y sodio.',
    ingredients: [
      { name: 'Filete de pescado fresco (tilapia o corvina) a la plancha', exchangeGroup: 'prot_magra', baseQty: 3.5, unit: 'oz (105 g)', exchanges: 3.5, step: 3 },
      { name: 'Arroz jardinero cocido con ejote y zanahoria', exchangeGroup: 'almidones', baseQty: 0.66, unit: 'taza', exchanges: 2, step: 2 },
      { name: 'Tortilla de maíz del comal', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Ensalada fresca (lechuga, tomate, pepino, rábano)', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aceite de oliva virgen extra en la cocción', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Aguacate fresco en cubos sobre la ensalada', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Papaya fresca picada en cubos', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_sopa_gallina_india',
    name: 'Sopa de Gallina India Tradicional (Desgrasada)',
    mealType: 'alm',
    proteinType: 'aves',
    costLevel: 'regular',
    description: 'Pechuga de gallina india asada aparte, caldo desgrasado con verduras criollas (güisquil, zanahoria, papa), arroz blanco y tortilla de maíz caliente.',
    prepNotes: 'Cocer la gallina con hierbabuena, apio y ajo. Retirar la pechuga y asar al comal para eliminar grasa. Desgrasar el caldo antes de servir con las verduras.',
    clinicalTags: ['bland', 'hipertension_friendly', 'renal_adaptable'],
    renalNote: 'Caldo colado sin cubitos comerciales; doble hervor a las papas para lixiviar potasio.',
    ingredients: [
      { name: 'Pechuga de gallina india desgrasada asada al comal', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Papa hervida en cubos en el caldo', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Arroz blanco al vapor', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Verduras criollas (güisquil tierno, zanahoria, ejotes)', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aceite vegetal medido para dorar la pechuga', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Guayabas frescas o rodajas de melón', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_rellenos_guisquil_pacaya',
    name: 'Rellenos de Güisquil o Pacaya en Salsa de Tomate Criollo',
    mealType: 'alm',
    proteinType: 'vegetariano_huevo',
    costLevel: 'economico',
    description: 'Lajas de güisquil tierno o pacaya cocidas al vapor, rellenas de quesillo bajo en grasa, envueltas en huevo batido al sartén antiadherente y bañadas en salsa de tomate natural, arroz y ensalada verde.',
    prepNotes: 'Hervir el güisquil o pacaya hasta estar tierno. Envolver con claras y yema batida en sartén de teflón con poco aceite. Salsa criolla con orégano y laurel.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'bland'],
    renalNote: 'Pacaya bien hervida para desalar y ablandar; quesillo bajo en sodio.',
    ingredients: [
      { name: 'Güisquil o pacaya tierna para relleno', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Quesillo bajo en grasa / queso fresco (relleno)', exchangeGroup: 'prot_sm', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Huevo batido para capear (1 huevo + 1 clara)', exchangeGroup: 'prot_magra', baseQty: 1, unit: 'intercambio', exchanges: 1, step: 3 },
      { name: 'Arroz blanco cocido con verduras', exchangeGroup: 'almidones', baseQty: 0.66, unit: 'taza', exchanges: 2, step: 2 },
      { name: 'Tortilla de maíz caliente', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Salsa de tomate criollo natural con orégano', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Aceite vegetal para el capeado', exchangeGroup: 'grasas', baseQty: 1.5, unit: 'cdta', exchanges: 1.5, step: 4 },
    ]
  },
  {
    id: 'alm_pollo_guisado_verduras',
    name: 'Pollo Guisado Criollo con Papa, Zanahoria y Tomate Natural',
    mealType: 'alm',
    proteinType: 'aves',
    costLevel: 'economico',
    description: 'Pieza de pollo sin piel guisada lentamente en salsa de tomate criollo con papas, zanahoria y güisquil en cubos, arroz blanco y ensalada verde fresca.',
    prepNotes: 'Retirar totalmente la piel y grasa visible del pollo antes de sellar. Guisar con tomates maduros licuados, cebolla, ajo y una pizca de achiote natural.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat', 'bland', 'renal_adaptable'],
    renalNote: 'Papa hervida en doble cocción si hay hiperpotasemia.',
    ingredients: [
      { name: 'Pechuga o cuadril de pollo sin piel guisado', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Papa hervida en dados dentro del guisado', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Arroz blanco cocido al vapor', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Verduras del guiso (zanahoria, güisquil) + ensalada verde', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aceite vegetal para la preparación', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Manzana pequeña o rebanada de piña', exchangeGroup: 'frutas', baseQty: 1, unit: 'unidad / ¾ taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_salpicon_res',
    name: 'Salpicón Tradicional de Res con Rábano y Hierbabuena',
    mealType: 'alm',
    proteinType: 'res',
    costLevel: 'regular',
    description: 'Carne de res magra cocida y picada finamente con rábano fresco, hierbabuena criolla picada, cebolla morada y abundante jugo de limón, acompañada de arroz blanco, frijoles y tortilla.',
    prepNotes: 'Hervir corte de posta magra con ajo y cebolla. Picar en frío y mezclar con rábano fresco crujiente, hierbabuena y limón recién exprimido sin aceite añadido.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat', 'bland'],
    renalNote: 'Carne desgrasada; excelente opción sin fósforo inorgánico.',
    ingredients: [
      { name: 'Carne de res magra picada finamente estilo salpicón', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Arroz blanco al vapor', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Frijoles rojos de la olla (enteros)', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz caliente', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Rábano fresco, hierbabuena criolla y cebolla morada', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aguacate fresco en lascas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Mango verde o naranja criolla fresca con limón', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_chiles_rellenos',
    name: 'Chiles Rellenos de Picadillo de Res Magra y Vegetales',
    mealType: 'alm',
    proteinType: 'res',
    costLevel: 'regular',
    description: 'Chiles verdes asados rellenos de picadillo de carne molida magra de res con papa y zanahoria finamente picadas, bañados en salsa de tomate natural, arroz y tortilla.',
    prepNotes: 'Asar chiles verdes y pelar al vapor. Rellenar con carne de res molida 95/5 sofrita con vegetales. Hornear o calentar con salsa de tomate sin capear en fritura profunda.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Chile asado y pelado; salsa natural sin cubitos.',
    ingredients: [
      { name: 'Carne molida de res magra (95/5) en picadillo', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Chile verde dulce grande asado + salsa de tomate', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Papa picada en el relleno de carne', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Arroz blanco cocido al vapor', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Aceite vegetal para el sofrito del picadillo', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Sandía o melón picado fresco', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'alm_sopa_frijoles_masitas',
    name: 'Sopa de Frijoles Rojos con Masitas de Maíz, Güisquil y Pipián',
    mealType: 'alm',
    proteinType: 'leguminosa_lacteo',
    costLevel: 'economico',
    description: 'Frijoles rojos salvadoreños de seda en sopa caliente con masitas tiernas de maíz nixtamalizado, trozos de güisquil, pipián y cuajada fresca o huevo duro picado.',
    prepNotes: 'Cocer los frijoles con ajo y cebolla. Agregar masitas de maíz condimentadas con cilantro y saltearlas en la sopa. Servir con cuajada fresca desgrasada.',
    clinicalTags: ['diabetes_friendly', 'bland'],
    renalNote: 'Requiere precaución o remojo previo prolongado por contenido de fósforo y potasio en renales.',
    ingredients: [
      { name: 'Sopa de frijoles rojos de seda enteros', exchangeGroup: 'almidones', baseQty: 0.75, unit: 'taza', exchanges: 1.5, step: 2 },
      { name: 'Masitas de maíz o yuca cocida en la sopa', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza / 2 masitas', exchanges: 1, step: 2 },
      { name: 'Arroz blanco cocido', exchangeGroup: 'almidones', baseQty: 0.33, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Cuajada fresca salvadoreña o huevo duro picado', exchangeGroup: 'prot_sm', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Güisquil y pipián tiernos cocidos en la sopa', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aguacate fresco en lascas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
    ]
  },

  // ==========================================
  // CENAS SALVADOREÑAS
  // ==========================================
  {
    id: 'cen_tipica_ligera',
    name: 'Cena Típica Ligera con Frijoles Parados y Plátano Asado',
    mealType: 'cen',
    proteinType: 'lacteo',
    costLevel: 'economico',
    description: 'Frijoles rojos de la olla (parados), queso fresco artesanal o requesón tierno, aguacate fresco, plátano asado al comal y tortilla de maíz caliente.',
    prepNotes: 'Plátano asado a fuego suave en comal sin grasa. Frijoles salcochados naturales.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'bland', 'renal_adaptable'],
    renalNote: 'Doble cocción para el plátano o sustituir por 1 tortilla adicional.',
    ingredients: [
      { name: 'Frijoles rojos parados de la olla', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Plátano maduro asado al comal', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza (½ plátano)', exchanges: 1, step: 2 },
      { name: 'Tortilla de maíz nixtamalizado', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Queso fresco desgrasado artesanal', exchangeGroup: 'prot_sm', baseQty: 1.5, unit: 'oz (45 g)', exchanges: 1.5, step: 3 },
      { name: 'Aguacate criollo fresco en rodajas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
      { name: 'Pipián o güisquil salcochado en dados', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
    ]
  },
  {
    id: 'cen_yuca_pollo_magro',
    name: 'Yuca Sancochada con Chicharrón de Pollo Magro al Airfryer',
    mealType: 'cen',
    proteinType: 'aves',
    costLevel: 'regular',
    description: 'Yuca tierna hervida con ajo y sal medida, curtido de repollo con zanahoria, salsa de tomate natural y daditos de pechuga de pollo magro dorados al horno o airfryer.',
    prepNotes: 'Hervir la yuca hasta que abra suave. Pollo sazonado con ajo, mostaza y orégano, dorado con rocío vegetal sin fritura en manteca.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Doble hervor a la yuca para eliminar potasio. Curtido sin sal añadida.',
    ingredients: [
      { name: 'Yuca blanca sancochada tierna', exchangeGroup: 'almidones', baseQty: 0.66, unit: 'taza (100 g)', exchanges: 2, step: 2 },
      { name: 'Daditos de pechuga de pollo dorados al horno / airfryer', exchangeGroup: 'prot_magra', baseQty: 2.5, unit: 'oz (75 g)', exchanges: 2.5, step: 3 },
      { name: 'Curtido tradicional salvadoreño (repollo y zanahoria)', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Salsa criolla de tomate natural caliente', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Aceite vegetal para dorar el pollo', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_pastelitos_horno',
    name: 'Pastelitos Salvadoreños de Carne o Pollo al Horno / Airfryer',
    mealType: 'cen',
    proteinType: 'res_aves',
    costLevel: 'regular',
    description: 'Masa de maíz condimentada con achiote natural horneada sin fritura, rellena de picadillo de carne de res o pollo magro con papa y zanahoria, con curtido y salsa.',
    prepNotes: 'Armar pastelitos con masa de maíz delgada, hornear a 200°C o en freidora de aire hasta que queden crujientes. Cero fritura en aceite profundo.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Masa de maíz natural; controlar porciones de picadillo.',
    ingredients: [
      { name: 'Pastelitos de masa de maíz horneados (masa)', exchangeGroup: 'almidones', baseQty: 2, unit: 'unidades (100 g)', exchanges: 2, step: 2 },
      { name: 'Picadillo de carne molida magra o pollo (relleno)', exchangeGroup: 'prot_magra', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Curtido salvadoreño tradicional', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Salsa criolla de tomate natural sin grasa', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Aceite en spray para hornear la masa', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_enchiladas_horneadas',
    name: 'Enchiladas Salvadoreñas Crujientes al Horno',
    mealType: 'cen',
    proteinType: 'huevo_lacteo',
    costLevel: 'economico',
    description: 'Tortillas de maíz tostadas al horno sin grasa, con frijoles molidos sin manteca untados, huevo duro en rodajas, curtido de repollo, salsa de tomate, aguacate y queso rallado.',
    prepNotes: 'Hornear tortillas del comal hasta que doren como tostadas. Frijoles molidos hervidos. Huevo duro cocido 10 min.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Queso fresco en lugar de queso duro salado; curtido sin sal añadida.',
    ingredients: [
      { name: 'Tortillas de maíz tostadas al horno (tipo tostada)', exchangeGroup: 'almidones', baseQty: 2, unit: 'unidades', exchanges: 2, step: 2 },
      { name: 'Frijoles rojos molidos untados', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Huevo duro sancochado en rodajas', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'unidad', exchanges: 1, step: 3 },
      { name: 'Queso fresco tierno desgrasado rallado', exchangeGroup: 'prot_magra', baseQty: 1, unit: 'oz (30 g)', exchanges: 1, step: 3 },
      { name: 'Curtido salvadoreño y salsa de tomate natural', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aguacate criollo fresco en lascas', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_panes_pollo_salvadorenos',
    name: 'Panes con Pollo Salvadoreños (Versión Equilibrada y Saludable)',
    mealType: 'cen',
    proteinType: 'aves',
    costLevel: 'regular',
    description: 'Pan francés salvadoreño medido relleno de pechuga de pollo desmenuzada en salsa criolla natural, berro fresco, rodajas de pepino, tomate maduro y rábano crujiente.',
    prepNotes: 'Salsa de tomate asado con orégano, laurel y semillas de ajonjolí licuadas. Pollo hervido y desmenuzado sin grasa.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'bland'],
    renalNote: 'Pan francés medido; berro y vegetales frescos bien lavados.',
    ingredients: [
      { name: 'Pan francés salvadoreño medido (o pan integral)', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad (2 oz)', exchanges: 2, step: 2 },
      { name: 'Pechuga de pollo deshebrada en salsa criolla', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'oz (90 g)', exchanges: 3, step: 3 },
      { name: 'Vegetales frescos (berro, tomate en rodajas, pepino, rábano)', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Toque de mayonesa ligera o aguacate untado', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta / 2 Cdas', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_sopa_tortilla',
    name: 'Sopa de Tortilla Salvadoreña con Pechuga, Aguacate y Quesillo',
    mealType: 'cen',
    proteinType: 'aves_lacteo',
    costLevel: 'regular',
    description: 'Caldo criollo de tomate natural con cilantro, tiras de tortilla de maíz horneadas crujientes, pechuga de pollo deshebrada, quesillo bajo en grasa y cubitos de aguacate.',
    prepNotes: 'Hornear tiras de tortilla de comal con spray vegetal hasta dorar. Caldo de tomate hervido con cebolla y apio.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat', 'bland'],
    renalNote: 'Aguacate medido; caldo colado bajo en sodio.',
    ingredients: [
      { name: 'Tiras de tortilla de maíz horneadas crujientes', exchangeGroup: 'almidones', baseQty: 2, unit: 'tortillas (60 g)', exchanges: 2, step: 2 },
      { name: 'Pechuga de pollo deshebrada cocida', exchangeGroup: 'prot_magra', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Quesillo bajo en grasa / queso fresco en cubos', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'oz (30 g)', exchanges: 1, step: 3 },
      { name: 'Caldo de tomate criollo natural con cilantro', exchangeGroup: 'veg_sa', baseQty: 1.5, unit: 'taza', exchanges: 1.5, step: 1 },
      { name: 'Aguacate fresco en cubitos', exchangeGroup: 'grasas', baseQty: 2, unit: 'Cdas (30 g)', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_quesadilla_leche',
    name: 'Quesadilla Tradicional de Arroz con Café y Leche Descremada',
    mealType: 'cen',
    proteinType: 'lacteo_huevo',
    costLevel: 'regular',
    description: 'Porción controlada de quesadilla artesanal de harina de arroz y queso bajo en sal, servida con café con leche descremada caliente y queso fresco en lascas.',
    prepNotes: 'Elaborada con harina de arroz, requesón y edulcorante o azúcar reducida en porción controlada.',
    clinicalTags: ['bland'],
    renalNote: 'Harina de arroz es muy bien tolerada; controlar lácteos según fósforo.',
    ingredients: [
      { name: 'Quesadilla artesanal de harina de arroz (porción)', exchangeGroup: 'almidones', baseQty: 1, unit: 'rebanada (40 g)', exchanges: 1.5, step: 2 },
      { name: 'Leche 100% descremada en café caliente', exchangeGroup: 'leche_dc', baseQty: 1, unit: 'taza (8 oz)', exchanges: 1, step: 1 },
      { name: 'Queso fresco desgrasado o requesón magro', exchangeGroup: 'prot_magra', baseQty: 1.5, unit: 'oz (45 g)', exchanges: 1.5, step: 3 },
      { name: 'Mantequilla o grasa de la quesadilla (incorporada)', exchangeGroup: 'grasas', baseQty: 1, unit: 'cdta', exchanges: 1, step: 4 },
      { name: 'Manzana pequeña o compota de fruta sin azúcar', exchangeGroup: 'frutas', baseQty: 1, unit: 'unidad', exchanges: 1, step: 1 },
    ]
  },

  // ==========================================
  // REFRIGERIOS / MERIENDAS TÍPICAS (AM / PM)
  // ==========================================
  {
    id: 'rec_fruta_alguashte',
    name: 'Fruta Picada de Temporada con Limón y Alguashte Tostado',
    mealType: 'snack',
    proteinType: 'semillas',
    costLevel: 'economico',
    description: 'Mango verde, jícama, pepino criollo o piña en trozos con jugo de limón y espolvoreado con alguashte (semilla de ayote tostada y molida).',
    prepNotes: 'Alguashte tostado al comal sin sal añadida. Contabilizado como grasa cardiosaludable rica en zinc y magnesio.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat'],
    renalNote: 'Preferir jícama, pepino o manzana si el paciente requiere restricción estricta de potasio.',
    ingredients: [
      { name: 'Fruta fresca salvadoreña (mango verde, pepino o jícama)', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza (120 g)', exchanges: 1, step: 1 },
      { name: 'Alguashte puro (semilla de ayote tostada molida sin sal)', exchangeGroup: 'grasas', baseQty: 1, unit: 'Cda sopera (15 g)', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'rec_elote_sancochado',
    name: 'Elote Tierno Sancochado con Queso Fresco Rallado y Limón',
    mealType: 'snack',
    proteinType: 'vegetariano',
    costLevel: 'economico',
    description: 'Elote tierno entero hervido con sal ligera, aderezado con jugo de limón fresco y 1 Cda de queso fresco artesanal rallado.',
    prepNotes: 'Hervir el elote con tusa para conservar su dulzor natural. Evitar mayonesa y aderezos industriales con alto sodio.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly'],
    renalNote: 'Doble hervor si hay hiperpotasemia.',
    ingredients: [
      { name: 'Elote tierno entero hervido', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad mediana', exchanges: 1, step: 2 },
      { name: 'Queso fresco desgrasado rallado', exchangeGroup: 'prot_magra', baseQty: 0.5, unit: 'oz (15 g)', exchanges: 0.5, step: 3 },
      { name: 'Rocío de salsa de tomate natural casera', exchangeGroup: 'veg_sa', baseQty: 2, unit: 'Cdas', exchanges: 0.25, step: 1 },
    ]
  },
  {
    id: 'rec_licuado_avena_fruta',
    name: 'Licuado de Guineo o Papaya con Leche Descremada y Avena Integral',
    mealType: 'snack',
    proteinType: 'lacteo',
    costLevel: 'regular',
    description: 'Bebida fría batida con leche descremada, trozos de papaya criolla o guineo de seda y hojuelas de avena integral con canela.',
    prepNotes: 'Licuar en frío sin azúcar añadida. Aporta fibra soluble betaglucano y calcio.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'bland'],
    renalNote: 'Preferir leche de arroz o manzana si el paciente está en diálisis con fósforo alto.',
    ingredients: [
      { name: 'Leche descremada al 1% o bebida vegetal fortificada', exchangeGroup: 'leche_dc', baseQty: 1, unit: 'taza (8 oz)', exchanges: 1, step: 1 },
      { name: 'Papaya criolla dulce o guineo mediano', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza / 1 guineo', exchanges: 1, step: 1 },
      { name: 'Avena integral en hojuelas crudas', exchangeGroup: 'almidones', baseQty: 0.25, unit: 'taza (20 g)', exchanges: 0.5, step: 2 },
    ]
  },
  {
    id: 'rec_nuegados_horneados',
    name: 'Nuegados de Yuca Horneados con Miel de Panela Medida',
    mealType: 'snack',
    proteinType: 'cereal',
    costLevel: 'regular',
    description: 'Masa de yuca rallada con queso fresco tierno horneada sin fritura, bañada con 1 Cda medida de miel de panela aromatizada con canela.',
    prepNotes: 'Hornear bolitas de yuca a 190°C hasta dorar. Servir con miel de atado de dulce medida.',
    clinicalTags: ['bland'],
    renalNote: 'Yuca rallada lavada; porción de miel controlada en diabetes.',
    ingredients: [
      { name: 'Nuegados de yuca horneados al comal', exchangeGroup: 'almidones', baseQty: 2, unit: 'bolitas (80 g)', exchanges: 1.5, step: 2 },
      { name: 'Miel de panela / atado de dulce casera', exchangeGroup: 'otros_cho', baseQty: 1, unit: 'Cda (15 ml)', exchanges: 1, step: 2 },
      { name: 'Queso fresco en la masa', exchangeGroup: 'prot_sm', baseQty: 0.5, unit: 'oz (15 g)', exchanges: 0.5, step: 3 },
    ]
  },
  {
    id: 'rec_canillitas_leche',
    name: 'Canillita o Dulce de Leche Salvadoreño (Porción de Ajuste Calórico)',
    mealType: 'snack',
    proteinType: 'lacteo_dulce',
    costLevel: 'economico',
    description: 'Dulce tradicional artesanal a base de leche y canela, en porción exacta de 25 g para pacientes hipercatabólicos o cuadre de carbohidratos.',
    prepNotes: 'Porción unitaria medida para complementar requerimientos energéticos elevados.',
    clinicalTags: ['hipercalorica_only'],
    renalNote: 'Evitar en pacientes diabéticos o en restricción de fósforo/calorías.',
    ingredients: [
      { name: 'Canillita de leche tradicional artesanal', exchangeGroup: 'otros_cho', baseQty: 1, unit: 'unidad (25 g)', exchanges: 1, step: 2 },
      { name: 'Té de manzanilla o zacate de limón caliente', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 0, step: 1 },
    ]
  },
  {
    id: 'rec_requeson_fruta_pepitoria',
    name: 'Requesón Salvadoreño con Papaya y Pepitoria Tostada',
    mealType: 'snack',
    proteinType: 'lacteo_semillas',
    costLevel: 'economico',
    description: 'Requesón artesanal magro servido con cubos de papaya dulce o melón, espolvoreado con pepitoria (semilla de ayote) tostada sin sal.',
    prepNotes: 'Requesón fresco pasteurizado sin sal añadida. Pepitoria tostada al comal.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'low_fat', 'renal_adaptable'],
    renalNote: 'Excelente aporte de proteína pura de suero lácteo de fácil digestión.',
    ingredients: [
      { name: 'Requesón artesanal salvadoreño magro', exchangeGroup: 'prot_magra', baseQty: 2, unit: 'oz (60 g)', exchanges: 2, step: 3 },
      { name: 'Papaya criolla picada fresca', exchangeGroup: 'frutas', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Pepitoria tostada al comal sin sal', exchangeGroup: 'grasas', baseQty: 1, unit: 'Cda (10 g)', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'rec_atol_avena_canela',
    name: 'Atol de Avena o Incaparina Típico con Canela y Galleta de Soda',
    mealType: 'snack',
    proteinType: 'cereal',
    costLevel: 'economico',
    description: 'Atol caliente de hojuelas de avena o Incaparina cocido en agua con abundante raja de canela, acompañado de galletas de soda o trigo integral.',
    prepNotes: 'Cocinar en agua con canela y clavo de olor sin azúcar refinada.',
    clinicalTags: ['diabetes_friendly', 'hipertension_friendly', 'bland'],
    renalNote: 'Atol en agua; controlar líquidos totales si hay pauta estricta.',
    ingredients: [
      { name: 'Atol de avena o Incaparina cocido en agua con canela', exchangeGroup: 'almidones', baseQty: 1, unit: 'taza (8 oz)', exchanges: 1, step: 2 },
      { name: 'Galletas de soda o trigo horneadas', exchangeGroup: 'almidones', baseQty: 4, unit: 'galletas', exchanges: 0.75, step: 2 },
      { name: 'Semillas de marañón o maní tostado', exchangeGroup: 'grasas', baseQty: 6, unit: 'unidades', exchanges: 1, step: 4 },
    ]
  },

  // ==========================================
  // PREPARACIONES CLÍNICAS HOSPITALARIAS (HOSPITAL SAN JUAN DE DIOS / RIISS)
  // ==========================================
  {
    id: 'des_hosp_tortitas_brocoli',
    name: 'Tortitas Pequeñas de Brócoli con Queso Fresco y Puré de Papa',
    mealType: 'des',
    proteinType: 'huevo_lacteo',
    costLevel: 'economico',
    description: '2 tortitas pequeñas de brócoli, con 1 ½ cda de incaparina sin sabor, rellenas con 1 onza de queso fresco y fritas en 1 cda de aceite, servidas con ½ taza de puré de papa.',
    prepNotes: 'Brócoli cocido al vapor y picado, mezclar con incaparina para dar consistencia y freír con aceite vegetal medido.',
    clinicalTags: ['bland', 'renal_adaptable', 'diabetes_friendly'],
    ingredients: [
      { name: 'Puré de papa casero', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Incaparina sin sabor en las tortitas', exchangeGroup: 'incaparina', baseQty: 1.5, unit: 'cda', exchanges: 0.5, step: 1 },
      { name: 'Queso fresco artesanal (relleno)', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'onza (30 g)', exchanges: 1, step: 3 },
      { name: 'Brócoli cocido picado', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Aceite vegetal para dorar', exchangeGroup: 'grasas', baseQty: 1, unit: 'cda', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'des_hosp_chilaquila',
    name: 'Chilaquila de Tortilla con Quesillo y Puré de Brócoli',
    mealType: 'des',
    proteinType: 'lacteo',
    costLevel: 'economico',
    description: '1 tortilla de maíz pequeña rellena con 1 onza de quesillo, frita en 1 cda de aceite, acompañada de ½ taza de puré de brócoli con 1 ½ cda de incaparina sin sabor.',
    prepNotes: 'Tortilla de maíz rellena de quesillo bajo en sal y dorada con aceite medido. Brócoli hecho puré con incaparina.',
    clinicalTags: ['bland', 'diabetes_friendly'],
    ingredients: [
      { name: 'Tortilla de maíz pequeña', exchangeGroup: 'almidones', baseQty: 1, unit: 'unidad', exchanges: 1, step: 2 },
      { name: 'Quesillo bajo en grasa / queso fresco', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'onza (30 g)', exchanges: 1, step: 3 },
      { name: 'Puré de brócoli con incaparina', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Incaparina sin sabor en puré', exchangeGroup: 'incaparina', baseQty: 1.5, unit: 'cda', exchanges: 0.5, step: 1 },
      { name: 'Aceite vegetal para freír', exchangeGroup: 'grasas', baseQty: 1, unit: 'cda', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'alm_hosp_chaomein_pollo',
    name: 'Chao Mein Hospitalario de Pollo y Vegetales Criollos',
    mealType: 'alm',
    proteinType: 'aves',
    costLevel: 'regular',
    description: '½ taza de pasta (fideos) cocida con ½ taza de vegetales cocidos (zanahoria, güisquil), 1 cda de aceite y 3 onzas de pechuga de pollo sin piel a la plancha.',
    prepNotes: 'Fideos hervidos al dente, saltear con güisquil y zanahoria con aceite vegetal medido y pechuga desgrasada.',
    clinicalTags: ['bland', 'diabetes_friendly', 'hipertension_friendly'],
    ingredients: [
      { name: 'Pasta fideos cocida', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Pechuga de pollo sin piel en trocitos', exchangeGroup: 'prot_magra', baseQty: 3, unit: 'onzas (90 g)', exchanges: 3, step: 3 },
      { name: 'Vegetales cocidos (güisquil, zanahoria)', exchangeGroup: 'veg_sa', baseQty: 1, unit: 'taza', exchanges: 1, step: 1 },
      { name: 'Aceite vegetal de cocción', exchangeGroup: 'grasas', baseQty: 1, unit: 'cda', exchanges: 1, step: 4 },
    ]
  },
  {
    id: 'cen_hosp_coditos_tomate',
    name: 'Coditos en Salsa de Tomate Natural con Queso Duro Blando y Manzana',
    mealType: 'cen',
    proteinType: 'lacteo',
    costLevel: 'economico',
    description: '½ taza de coditos de pasta cocida con ½ taza de jugo de vegetales (tomate) cocido, 1 ½ taza de incaparina cocida con 1 cda de crema espesa, 1 onza de queso duro blando y 1 manzana en trozos.',
    prepNotes: 'Pasta cocida con salsa natural de tomate criollo y queso desgrasado.',
    clinicalTags: ['bland'],
    ingredients: [
      { name: 'Coditos de pasta cocida', exchangeGroup: 'almidones', baseQty: 0.5, unit: 'taza', exchanges: 1, step: 2 },
      { name: 'Queso duro blando salvadoreño', exchangeGroup: 'prot_sm', baseQty: 1, unit: 'onza (30 g)', exchanges: 1, step: 3 },
      { name: 'Salsa natural de tomate y vegetales', exchangeGroup: 'veg_sa', baseQty: 0.5, unit: 'taza', exchanges: 0.5, step: 1 },
      { name: 'Incaparina sin sabor', exchangeGroup: 'incaparina', baseQty: 1.5, unit: 'taza cocida', exchanges: 1, step: 1 },
      { name: 'Crema espesa o aceite', exchangeGroup: 'grasas', baseQty: 1, unit: 'cda', exchanges: 1, step: 4 },
      { name: 'Manzana fresca en trozos', exchangeGroup: 'frutas', baseQty: 1, unit: 'unidad', exchanges: 1, step: 1 },
    ]
  }
];

// Matriz de los 7 Menús Hospitalarios de El Salvador (Hospital Nacional San Miguel)
export const HOSPITAL_MENUS_SAN_MIGUEL = [
  {
    menuNum: 1,
    dayName: 'Menú 1',
    meals: {
      des: {
        title: 'Puré de zanahoria y Frijoles licuados',
        text: '½ taza de puré de zanahoria agregar 1 ½ cda de incaparina sin sabor.\n½ taza de frijoles licuados con 1 cda de aceite + 1 ½ cda de incaparina sin sabor.'
      },
      c1: {
        title: 'Yogur con fruta',
        text: '½ taza de yogur + ½ taza de mango maduro + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Pechuga a la plancha con puré',
        text: '3 onzas de pechuga sin piel a la plancha.\n½ taza de puré de zanahoria + 3 cdas de incaparina sin sabor + 1 cda de crema espesa.'
      },
      c2: {
        title: 'Licuado de melocotón',
        text: '½ taza de leche entera + ½ taza de melocotones en almíbar (enlatado) + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Coditos en salsa de tomate',
        text: '½ taza de coditos (pasta) cocida + ½ taza de jugo de vegetales (tomate) cocido + 1 ½ taza de incaparina sin sabor + 1 cda de crema espesa.\nServir con: 1 onza de queso duro blando.\n1 manzana en trozos.'
      }
    }
  },
  {
    menuNum: 2,
    dayName: 'Menú 2',
    meals: {
      des: {
        title: 'Tortitas de brócoli con queso y puré de papa',
        text: '2 tortitas pequeñas de brócoli, agregar 1 ½ cda de incaparina sin sabor, rellenar con 1 onza de queso fresco y freír en 1 cda de aceite.\n½ taza de puré de papa.'
      },
      c1: {
        title: 'Licuado de guineo',
        text: '½ taza de leche entera + 1 guineo pequeño + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Sopa de frijoles con pipianes',
        text: '½ taza de frijoles enteros + 2 onzas de queso fresco + ½ taza de pipianes sancochados + 1 cda de aceite + ½ taza de caldo (sopa).'
      },
      c2: {
        title: 'Pera sancochada con leche',
        text: '1 pera sancochada.\n½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Relleno de güisquil con arroz',
        text: '½ güisquil pequeño, rellenar con 1 onza de quesillo (no empanizar, ni freír).\n½ taza de arroz con vegetales + 1 ½ cda de incaparina sin sabor con 1 cda de aceite.\n1 guineo de seda pequeño.'
      }
    }
  },
  {
    menuNum: 3,
    dayName: 'Menú 3',
    meals: {
      des: {
        title: 'Pupusa casera con queso y tomatada',
        text: '1 pupusa pequeña (a la masa agregar 1 ½ cda de incaparina sin sabor), rellenar con 1 onza de queso fresco o cuajada y freír en 1 cda de aceite.\n½ taza de tomatada sin aceite.'
      },
      c1: {
        title: 'Manzana sancochada con leche',
        text: '1 manzana sancochada.\n½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Pollo guisado con pepino y aguacate',
        text: '1 pierna de pollo + 2 cdas de salsa de tomate + 3 cdas de incaparina sin sabor.\n½ tortilla de maíz pequeña.\n1 taza de pepino en rodajas + ½ aguacate pequeño.'
      },
      c2: {
        title: 'Yogur con guineo',
        text: '½ taza de yogur + 1 guineo de seda pequeño + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Sopa de verduras con papa y queso',
        text: '½ taza de vegetales cocidos (güisquil, pipián, repollo y brócoli) + ½ taza de papa cocida + 1 onza de queso duro blando + 1 ½ cda de incaparina sin sabor.\n½ taza de caldo (sopa).\n½ aguacate pequeño.\n1 pera pequeña.'
      }
    }
  },
  {
    menuNum: 4,
    dayName: 'Menú 4',
    meals: {
      des: {
        title: 'Casamiento con queso fresco y pipianes',
        text: '½ taza de casamiento, agregar 1 ½ cda de incaparina sin sabor, no agregar aceite.\n1 onza de queso fresco.\n½ taza de pipianes guisados sin aceite.'
      },
      c1: {
        title: 'Atol de leche con pasas',
        text: '½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 3 cdas de pasas + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Casamiento con cuajada y crema',
        text: '½ taza de casamiento sin aceite + 1 ½ cda de incaparina sin sabor.\n2 onzas de cuajada.\n½ taza de pipianes + 1 ½ cda de incaparina sin sabor + 1 cda de crema espesa.'
      },
      c2: {
        title: 'Licuado de guineo',
        text: '½ taza de leche entera + 1 guineo pequeño + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Plátano frito con cuajada y melocotón',
        text: '½ plátano frito con 1 cda de aceite vegetal.\n1 onza de cuajada.\n½ taza de puré de zanahoria + 1 ½ cda de incaparina sin sabor.\n½ taza de melocotones en almíbar (enlatados).'
      }
    }
  },
  {
    menuNum: 5,
    dayName: 'Menú 5',
    meals: {
      des: {
        title: 'Chilaquila de quesillo con puré de brócoli',
        text: '1 tortilla de maíz pequeña + 1 onza de quesillo, freír en 1 cda de aceite.\n½ taza de puré de brócoli + 1 ½ cda de incaparina sin sabor.'
      },
      c1: {
        title: 'Yogur con guineo',
        text: '½ taza de yogur + 1 guineo de seda pequeño + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Chao mein de pollo con vegetales',
        text: '½ taza de pasta (fideos) cocida.\n½ taza de vegetales cocidos (zanahoria, güisquil) + 1 cda de aceite + 3 onzas de pechuga de pollo sin piel cruda.'
      },
      c2: {
        title: 'Manzana sancochada con leche',
        text: '1 manzana sancochada.\n½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Papas fritas con queso y puré de brócoli',
        text: '½ taza de papas (sancochar antes) y luego freír en 1 cda de aceite, agregar 1 onza de queso duro rallado.\n½ taza de puré de brócoli + 1 ½ cda de incaparina sin sabor.\n1 guineo de seda pequeño.'
      }
    }
  },
  {
    menuNum: 6,
    dayName: 'Menú 6',
    meals: {
      des: {
        title: 'Plátano frito con queso y puré de zanahoria',
        text: '½ plátano frito con 1 cda de aceite.\n1 onza de queso fresco.\n½ taza de puré de zanahoria + 1 ½ cda incaparina sin sabor.'
      },
      c1: {
        title: 'Licuado de melocotón en almíbar',
        text: '½ taza de leche entera + ½ taza de melocotones en almíbar (enlatado) + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Frijoles licuados con cuajada y pipianes',
        text: '½ taza de frijoles licuados, sin aceite.\n2 onzas de cuajada.\n½ taza de pipianes con 1 cda de crema espesa.'
      },
      c2: {
        title: 'Yogur con mango maduro',
        text: '½ taza de yogur + ½ taza de mango maduro + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Pupusa casera con queso y tomatada',
        text: '1 pupusa, rellena con 1 onza de queso fresco y freír en 1 cda de aceite.\n½ taza de tomatada sin aceite + 1 ½ cda de incaparina sin sabor.\n1 manzana pequeña en trozos.'
      }
    }
  },
  {
    menuNum: 7,
    dayName: 'Menú 7',
    meals: {
      des: {
        title: 'Tortitas de papa con quesillo y brócoli',
        text: '1 tortita pequeña de papa, agregar 1 ½ cda de incaparina sin sabor, rellenar con 1 onza de quesillo, freír en 1 cda de aceite.\n½ taza de brócoli sancochado.'
      },
      c1: {
        title: 'Pera sancochada con leche',
        text: '1 pera sancochada.\n½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 1 cda de aceite (sin usar).'
      },
      alm: {
        title: 'Sopa de tortilla con pollo y aguacate',
        text: '1 taza de vegetales crudos (tomate, cebolla, chile) + 1 tortilla de maíz + ½ taza de caldo de pollo (licuado), luego cocinar.\nServir con: 3 onzas de pechuga de pollo sancochado + ½ aguacate pequeño.'
      },
      c2: {
        title: 'Atol de leche con pasas',
        text: '½ taza de leche entera + 1 ½ cda de incaparina sin sabor + 3 cdas de pasas + 1 cda de aceite (sin usar).'
      },
      cen: {
        title: 'Casamiento con pipianes y aguacate',
        text: '½ taza de casamiento sin aceite, agregar 1 ½ cda de incaparina sin sabor.\n½ taza de pipianes al vapor.\n½ aguacate pequeño.\n1 pera pequeña.'
      }
    }
  }
];

// Recomendaciones Clínicas Hospitalarias Obligatorias de El Salvador (pie del documento)
export const HOSPITAL_GENERAL_RECOMMENDATIONS = [
  'No se incluyen en las verduras: papa, yuca, camote, elote. Estos se contabilizan como carbohidratos.',
  'Se recomienda no utilizar aderezos de tipo mayonesa, salsa de tomate industrial, pepinesa, etc. Si puede utilizar vinagre y hierbas aromáticas para dar sabor a sus comidas.',
  'Consuma como mínimo 1 litro de agua por día. Reduzca el consumo de sal y productos que la contengan (cubitos, sazonadores, consomés, sopas deshidratadas, enlatados, etc.)',
  'Es importante no omitir ningún tiempo de comida. Y realizar actividad física.',
  'Puede dar sabor a las comidas con hierbas aromáticas, sal, ajo, apio, cúrcuma, comino, pimienta, etc.'
];

export const PROTEIN_CATEGORIES = [
  { id: 'aves', label: 'Aves (Pollo / Gallina)' },
  { id: 'res', label: 'Res Magra' },
  { id: 'pescado', label: 'Pescado y Mariscos' },
  { id: 'huevo', label: 'Huevo y Claras' },
  { id: 'lacteo', label: 'Lácteos (Cuajada / Quesillo / Requesón)' },
  { id: 'leguminosa', label: 'Frijoles y Granos' },
  { id: 'vegetariano', label: 'Vegetales / Rellenos' }
];

export const DAYS_OF_WEEK = [
  { key: 'lunes', name: 'Lunes', short: 'Lun' },
  { key: 'martes', name: 'Martes', short: 'Mar' },
  { key: 'miercoles', name: 'Miércoles', short: 'Mié' },
  { key: 'jueves', name: 'Jueves', short: 'Jue' },
  { key: 'viernes', name: 'Viernes', short: 'Vie' },
  { key: 'sabado', name: 'Sábado', short: 'Sáb' },
  { key: 'domingo', name: 'Domingo', short: 'Dom' },
];
