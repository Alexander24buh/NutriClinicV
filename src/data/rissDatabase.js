// Base de datos de Lineamientos Técnicos para la Prescripción de Dietas Hospitalarias (RIISS - MINSAL)
// Clasificación genérica oficial, criterios clínicos, macronutrientes, alimentos permitidos y no permitidos

export const RISS_DIETS = [
  {
    id: 'normal',
    name: 'Dieta normal o corriente',
    category: 'General',
    description: 'Provee una alimentación completa y equilibrada para pacientes cuya condición clínica no requiere modificaciones nutricionales ni de textura.',
    energy: '1,800 – 2,300 kcal (o según requerimiento individual)',
    macros: { cho: '55 – 60%', p: '10 – 15% (0.8–1.0 g/kg)', l: '25 – 30%' },
    indications: [
      'Pacientes hospitalizados o ambulatorios sin alteraciones metabólicas o digestivas',
      'Postquirúrgicos tardíos con tránsito intestinal restablecido',
      'Maternidad y convalecencia sin comorbilidades'
    ],
    allowed: [
      'Todos los grupos de alimentos en porciones balanceadas',
      'Cereales integrales, leguminosas, frutas y verduras de todo tipo',
      'Carnes magras, pescado, pollo, huevos y lácteos',
      'Grasas vegetales saludables con métodos de cocción asado, hervido, horneado o al vapor'
    ],
    forbidden: [
      'Exceso de alimentos ultraprocesados y frituras profundas',
      'Bebidas azucaradas comerciales y exceso de azúcares refinados'
    ]
  },
  {
    id: 'embarazada',
    name: 'Dieta de la Embarazada / Gestación (RIISS)',
    category: 'Ciclo Vital',
    description: 'Aporte de nutrientes y energía para cubrir las demandas metabólicas del crecimiento fetal, placenta y tejidos maternos, previniendo deficiencias y complicaciones obstétricas.',
    energy: 'Requerimiento basal materno + 340 kcal/día (2°T) o + 452 kcal/día (3°T)',
    macros: { cho: '50 – 55% (complejos)', p: '15 – 20% (+25 g/día en 2° y 3°T, mín. 1.1 g/kg)', l: '25 – 30% (omega-3/DHA)' },
    indications: [
      'Embarazo único o múltiple en cualquier trimestre de gestación',
      'Prevención de restricción del crecimiento intrauterino (RCIU) y preeclampsia',
      'Gestante con bajo peso, sobrepeso u obesidad según curva de Atalah'
    ],
    allowed: [
      'Lácteos pasteurizados descremados o semidescremados (calcio y proteína)',
      'Carnes magras, pollo, huevos y pescados cocidos completamente (cero alimentos crudos)',
      'Leguminosas (frijoles, lentejas) ricas en hierro y folatos',
      'Frutas y vegetales frescos bien lavados y desinfectados',
      'Fraccionamiento en 5 a 6 tiempos pequeños para prevenir pirosis y náuseas'
    ],
    forbidden: [
      'Lácteos no pasteurizados (quesos de leche cruda) por riesgo de Listeria monocytogenes',
      'Carnes o mariscos crudos o a medio cocer (ceviches crudos, huevos crudos)',
      'Pescados de gran tamaño con alto contenido de mercurio (tiburón, pez espada)',
      'Bebidas alcohólicas (cero consumo) y exceso de cafeína (> 200 mg/día)',
      'Dietas cetogénicas o hipocalóricas severas (< 1500 kcal) que inducen cetosis fetal'
    ]
  },
  {
    id: 'pediatrica',
    name: 'Dieta Pediátrica y del Adolescente (RIISS)',
    category: 'Ciclo Vital',
    description: 'Alimentación balanceada adaptada a las necesidades dinámicas de crecimiento físico, maduración ósea y desarrollo cognitivo en la infancia y adolescencia.',
    energy: 'Según fórmulas pediátricas de crecimiento (FAO/OMS / Schofield)',
    macros: { cho: '50 – 60%', p: '12 – 15% (1.1–1.5 g/kg)', l: '25 – 30% (ácidos grasos esenciales)' },
    indications: [
      'Población pediátrica (lactantes mayores, preescolares, escolares y adolescentes)',
      'Recuperación de retardo en talla o prevención de desnutrición infantil'
    ],
    allowed: [
      'Alimentos naturales variados de los 5 grupos de la canasta alimentaria',
      'Lácteos fortificados, huevos enteros, carnes magras, leguminosas con cereales',
      'Verduras y frutas frescas en presentaciones de fácil masticación y deglución'
    ],
    forbidden: [
      'Comida chatarra, snacks ultraprocesados con sellos de advertencia',
      'Bebidas azucaradas comerciales, energizantes o café'
    ]
  },

  // ---- MODIFICACIONES DE CONSISTENCIA ----
  {
    id: 'liq_clara',
    name: 'Dieta líquida clara',
    category: 'Consistencia',
    description: 'Proporciona líquidos, electrolitos y energía en forma de fácil digestión, con mínimo residuo intestinal. Transitoria (máx. 24–48 h).',
    energy: '500 – 800 kcal/día',
    macros: { cho: '97% (100–120 g)', p: '3%', l: '0%' },
    indications: [
      'Etapa inicial postquirúrgica inmediata tras restablecimiento de ruidos hidroaéreos',
      'Preparación para endoscopías o colonoscopías',
      'Gastroenteritis aguda severa o reposo digestivo relativo'
    ],
    allowed: [
      'Caldos claros desgrasados y perfectamente colados',
      'Té claro sin leche (manzanilla, menta)',
      'Suero de rehidratación oral',
      'Agua de arroz tostado colada',
      'Gelatina regular sin trozos de fruta ni lácteos',
      'Jugos claros colados no cítricos diluidos al 50% (manzana, uva blanca)'
    ],
    forbidden: [
      'Leche, yogur o cualquier producto lácteo',
      'Jugos cítricos o con pulpa',
      'Caldos con grasa, carnes o verduras sin colar',
      'Bebidas gaseosas oscuras, café cargado, alcohol y alimentos sólidos'
    ]
  },
  {
    id: 'liq_completa',
    name: 'Dieta líquida completa',
    category: 'Consistencia',
    description: 'Aporte de líquidos y nutrientes en consistencia líquida o semilíquida a temperatura ambiente. Poco residuo intestinal.',
    energy: '1,500 – 1,800 kcal/día',
    macros: { cho: '50 – 55%', p: '10 – 15%', l: '30 – 35%' },
    indications: [
      'Transición entre dieta líquida clara y blanda',
      'Disfagia moderada a severa para sólidos',
      'Procesos inflamatorios agudos del tracto gastrointestinal',
      'Cirugía de cabeza y cuello, estenosis esofágica parcial'
    ],
    allowed: [
      'Sopas crema coladas y licuadas (verduras con pollo)',
      'Leche descremada o semidescremada, yogur natural batido',
      'Atoles colados suaves (avena, maicena)',
      'Huevos tibios licuados en caldos',
      'Gelatina, flan suave, nieves de fruta no ácida'
    ],
    forbidden: [
      'Alimentos enteros, picados o troceados',
      'Carnes fibrosas sin licuar y colar',
      'Verduras o frutas crudas',
      'Panes duros, galletas enteras, nueces y semillas'
    ]
  },
  {
    id: 'mec_suave',
    name: 'Dieta mecánicamente suave (molida / puré)',
    category: 'Consistencia',
    description: 'Textura suave, molida o en puré para facilitar masticación y deglución sin alterar el contenido nutricional estándar.',
    energy: '1,800 – 2,300 kcal (según requerimiento)',
    macros: { cho: '55 – 60%', p: '10 – 15%', l: '25 – 30%' },
    indications: [
      'Problemas mecánicos de masticación por edentulia parcial o total',
      'Cirugía dental, maxilofacial o traumatismo mandibular',
      'Disfagia orofaríngea leve a moderada',
      'Deterioro neurológico o debilidad muscular senil'
    ],
    allowed: [
      'Carnes molidas tiernas, picadas muy finas o deshebradas suaves',
      'Pescado blanco suave desmenuzado sin espinas',
      'Huevos revueltos tiernos o pasados por agua',
      'Puré de papas, camote, plátano o verduras cocidas',
      'Pastas cocidas muy suaves, arroz bien cocido o sémola',
      'Frutas maduras en compota o papilla (papaya, banano, manzana cocida)'
    ],
    forbidden: [
      'Carnes duras, secas o fibrosas',
      'Alimentos crujientes (tostadas, chips, vegetales crudos duros)',
      'Frutos secos enteros, semillas enteras',
      'Alimentos pegajosos o con corteza dura'
    ]
  },
  {
    id: 'blanda',
    name: 'Dieta blanda',
    category: 'Consistencia',
    description: 'Alimentos tiernos y de fácil digestión, con moderada reducción de fibra insoluble y sin irritantes químicos ni grasas fritas.',
    energy: '1,800 – 2,300 kcal (según requerimiento)',
    macros: { cho: '55 – 60%', p: '10 – 15%', l: '25 – 30%' },
    indications: [
      'Periodo postoperatorio de cirugía abdominal tras tolerancia a líquidos',
      'Gastritis aguda o crónica, úlcera péptica en cicatrización',
      'Reflujo gastroesofágico (ERGE) y hernia hiatal',
      'Enfermedades inflamatorias gastrointestinales en remisión'
    ],
    allowed: [
      'Carnes magras (pechuga de pollo, pescado blanco) hervidas, asadas o al vapor',
      'Huevo cocido o revuelto con mínimo aceite',
      'Arroz blanco, pasta suave, pan blanco tostado, avena cocida',
      'Zanahoria, chayote, calabacita y papa cocidos sin piel',
      'Frutas cocidas, al horno o crudas muy maduras y no ácidas (manzana pelada, pera, banano)',
      'Queso fresco bajo en grasa, requesón'
    ],
    forbidden: [
      'Frituras, chicharrones, tocino y embutidos',
      'Especias irritantes (pimienta negra, chile, mostaza, curry, ajo crudo concentrado)',
      'Café cargado, té negro, bebidas de cola y bebidas alcohólicas',
      'Verduras flatulentas crudas (repollo, coliflor, brócoli, cebolla cruda)',
      'Frutas cítricas o muy ácidas (piña ácida, limón en exceso)'
    ]
  },

  // ---- MODIFICACIONES CALÓRICAS Y DE MACRONUTRIENTES ----
  {
    id: 'hipocalorica',
    name: 'Dieta hipocalórica',
    category: 'Calorías y Macros',
    description: 'Restricción energética controlada para inducir balance negativo de energía preservando la masa libre de grasa.',
    energy: '1,200 – 1,500 kcal/día (déficit de 500 a 750 kcal)',
    macros: { cho: '50 – 55%', p: '15 – 20% (1.2–1.5 g/kg de peso ideal/ajustado)', l: '25 – 30%' },
    indications: [
      'Sobrepeso (IMC 25–29.9 kg/m²) y Obesidad (IMC ≥ 30 kg/m²)',
      'Síndrome metabólico con exceso ponderal',
      'Preparación prequirúrgica en cirugía bariátrica u ortopédica'
    ],
    allowed: [
      'Abundantes vegetales sin almidón (hojas verdes, pepino, tomate, zucchini)',
      'Frutas enteras con fibra en porciones controladas (manzana, pera, fresas)',
      'Cereales integrales y leguminosas en porciones medidas',
      'Proteínas de alto valor biológico muy magras (pollo sin piel, pescado blanco, claras)',
      'Aceite de oliva virgen y aguacate en medidas exactas',
      'Agua natural como bebida principal'
    ],
    forbidden: [
      'Azúcares libres, miel, jarabes, repostería y dulces',
      'Bebidas azucaradas, gaseosas, refrescos con azúcar',
      'Frituras, embutidos y carnes con alto contenido graso',
      'Comida rápida y ultraprocesados'
    ]
  },
  {
    id: 'hipercalorica',
    name: 'Dieta hipercalórica',
    category: 'Calorías y Macros',
    description: 'Aporte energético elevado para revertir estados de balance calórico negativo y catabolismo muscular.',
    energy: '2,300 – 3,000 kcal/día (o requerimiento + 30–50%)',
    macros: { cho: '50 – 55%', p: '15 – 20%', l: '25 – 30%' },
    indications: [
      'Desnutrición moderada a severa (pérdida de peso > 10%)',
      'Sepsis o infección sistémica prolongada',
      'Cáncer avanzado con caquexia tumoral',
      'Politraumatismo, quemaduras extensas o hipertiroidismo'
    ],
    allowed: [
      'Fraccionamiento en 5 a 6 tiempos de comida',
      'Alimentos densos en nutrientes y calorías saludables',
      'Frutos secos (nueces, almendras), semillas y crema de maní',
      'Aceite de oliva en crudo sobre los platos',
      'Huevos, carnes magras, lácteos enteros enriquecidos con leche en polvo o suplementos'
    ],
    forbidden: [
      'Alimentos de bajo aporte nutricional ("calorías vacías")',
      'Llenado gástrico previo a comidas con caldos sin calorías o agua abundante'
    ]
  },
  {
    id: 'hiperproteica',
    name: 'Dieta hiperprotéica',
    category: 'Proteínas',
    description: 'Elevado contenido proteico para favorecer síntesis de tejidos, cicatrización y reposición de masa muscular.',
    energy: '1,800 – 2,300 kcal (según balance)',
    macros: { cho: '50 – 55%', p: '15 – 25% (1.5 – 2.0 g/kg/día)', l: '25 – 30%' },
    indications: [
      'Hipoalbuminemia (< 3.5 g/dL) no atribuible a sobrecarga hídrica aislada',
      'Úlceras por presión estadios II, III y IV',
      'Grandes quemados y cirugías mayores de alta demanda plástica',
      'VIH/SIDA, cáncer en quimioterapia/radioterapia, síndrome nefrótico'
    ],
    allowed: [
      'Pechuga de pollo, pavo, pescado blanco y azul',
      'Claras de huevo cocidas (2 a 4 por día)',
      'Requesón, queso fresco desgrasado, yogur griego descremado',
      'Lentejas, frijoles y garbanzos combinados con cereales',
      'Proteínas con > 60% de alto valor biológico'
    ],
    forbidden: [
      'Carnes grasas o fritas que eleven lípidos en lugar de proteína neta',
      'Embutidos procesados ricos en nitritos y sodio'
    ]
  },
  {
    id: 'hipoproteica',
    name: 'Dieta hipoprotéica',
    category: 'Proteínas',
    description: 'Restricción controlada de proteínas para reducir carga de solutos nitrogenados en insuficiencia renal o encefalopatía.',
    energy: '1,800 – 2,200 kcal/día (garantizar calorías para evitar catabolismo proteico propio)',
    macros: { cho: '60 – 65%', p: '< 10% (0.55 – 0.8 g/kg/día, > 50–70% de AVB)', l: '25 – 30%' },
    indications: [
      'Enfermedad renal crónica estadios 3, 4 y 5 sin diálisis (eGFR < 60 mL/min/1.73m²)',
      'Encefalopatía hepática aguda o crónica recurrente'
    ],
    allowed: [
      'Porciones de carne y huevo estrictamente pesadas y medidas (AVB prioritario)',
      'Aporte calórico principal mediante carbohidratos complejos y grasas saludables (aceite de oliva)',
      'Vegetales seleccionados según niveles de potasio'
    ],
    forbidden: [
      'Exceso de carnes rojas y productos cárnicos procesados',
      'Quesos maduros ricos en proteínas y fósforo',
      'Suplementos proteicos o batidos sin supervisión nefrológica estricta'
    ]
  },
  {
    id: 'baja_cho',
    name: 'Dieta baja en carbohidratos / Control glucémico',
    category: 'Carbohidratos',
    description: 'Control estricto de la carga glucémica y restricción de carbohidratos simples para optimizar control metabólico.',
    energy: '1,500 – 2,000 kcal (según meta ponderal)',
    macros: { cho: '40 – 45%', p: '20 – 25%', l: '30 – 35% (predominio mono y poliinsaturado)' },
    indications: [
      'Diabetes mellitus tipo 1 y 2, intolerancia a la glucosa, prediabetes',
      'Hipertrigliceridemia severa (TG > 200–500 mg/dL)',
      'Enfermedad hepática esteatósica metabólica (MASLD / Hígado graso)',
      'EPOC o insuficiencia respiratoria (para disminuir cociente respiratorio de CO2)'
    ],
    allowed: [
      'Vegetales sin almidón (brócoli, espinacas, lechuga, pepino, tomate medido)',
      'Cereales integrales en porciones medidas (avena en hojuelas, tortilla de maíz, arroz integral)',
      'Frutas enteras con cáscara de bajo a moderado índice glucémico (fresas, manzana, pera)',
      'Pescados, pechuga de pollo, huevos, aguacate y aceite de oliva'
    ],
    forbidden: [
      'Azúcar de caña, panela, miel, siropes y jaleas comerciales',
      'Bebidas gaseosas, tés envasados azucarados, jugos embotellados',
      'Pan dulce, galletas dulces, pastelería y harinas refinadas en exceso'
    ]
  },
  {
    id: 'alta_cho',
    name: 'Dieta alta en carbohidratos',
    category: 'Carbohidratos',
    description: 'Enfocada en preservar reservas de glucógeno y evitar gluconeogénesis a expensas de aminoácidos.',
    energy: '1,800 – 2,400 kcal',
    macros: { cho: '65 – 70%', p: '10 – 15%', l: '15 – 20%' },
    indications: [
      'Cirrosis hepática compensada o hepatitis en fase resolutiva',
      'Glucogenosis o alteraciones del metabolismo de lípidos',
      'Prevención de encefalopatía en hepatopatía crónica'
    ],
    allowed: [
      'Frutas, verduras, arroz, avena, maíz, papa, legumbres suaves',
      'Miel natural o azúcares simples en casos de catabolismo hepático vigilado'
    ],
    forbidden: [
      'Comidas grasas que enlentezcan vaciamiento gástrico',
      'Carnes rojas excesivas'
    ]
  },
  {
    id: 'baja_grasa',
    name: 'Dieta baja en grasa',
    category: 'Grasas',
    description: 'Restricción de lípidos totales y grasas saturadas para reducir estimulación biliar y pancreatitis o aterogénesis.',
    energy: '1,500 – 2,000 kcal',
    macros: { cho: '55 – 60%', p: '15 – 20%', l: '< 25% (20–25%, saturada < 7–10%)' },
    indications: [
      'Colelitiasis sintomática, colecistitis y post-colecistectomía temprana',
      'Pancreatitis aguda en fase de realimentación o pancreatitis crónica',
      'Dislipidemia aterogénica (colesterol total > 200 mg/dL, LDL > 130 mg/dL)',
      'Síndrome de malabsorción de grasas y esteatorrea'
    ],
    allowed: [
      'Lácteos 100% descremados o desgrasados (leche 0%, yogur light, requesón)',
      'Clara de huevo, pechuga de pollo y pavo sin piel',
      'Pescado blanco (merluza, corvina, tilapia) cocido sin grasa',
      'Abundantes verduras al vapor o hervidas, frutas frescas',
      'Cocciones hervidas, escalfadas, al vapor o asadas a la plancha con rocío mínimo'
    ],
    forbidden: [
      'Carnes grasas (costilla, piel de ave, cerdo graso, carne molida con grasa)',
      'Embutidos (chorizo, longaniza, salchichas regulares, tocino)',
      'Lácteos enteros, queso crema, quesos maduros y crema de leche',
      'Mantequilla, manteca vegetal o de cerdo, mayonesa regular, aderezos cremosos',
      'Frituras, pasteles hojaldrados y comidas rápidas'
    ]
  },

  // ---- MODIFICACIONES EN ELECTROLITOS Y MINERALES ----
  {
    id: 'hiposodica_leve',
    name: 'Dieta hiposódica leve',
    category: 'Minerales y Electrolitos',
    description: 'Control moderado de sodio para el manejo de hipertensión arterial leve o prevención cardiovascular.',
    energy: '2,000 – 3,000 mg de Sodio / día (aprox. 5 a 7.5 g de sal)',
    macros: { cho: 'Normal', p: 'Normal', l: 'Normal' },
    indications: [
      'Hipertensión arterial estadio 1',
      'Insuficiencia cardíaca leve compensada',
      'Enfermedad renal crónica inicial con control presórico'
    ],
    allowed: [
      'Preparación de alimentos con poca sal (1 pizca en cocina y sin salero de mesa)',
      'Hierbas aromáticas naturales (orégano, albahaca, romero, perejil, ajo, laurel, tomillo, jugo de limón)'
    ],
    forbidden: [
      'Uso del salero en la mesa',
      'Consomés en polvo, cubitos de caldo, sopas instantáneas',
      'Salsas comerciales (soya, inglesa, barbacoa, kétchup regular)',
      'Snacks empaquetados salados y frutos secos fritos con sal'
    ]
  },
  {
    id: 'hiposodica_moderada',
    name: 'Dieta hiposódica moderada',
    category: 'Minerales y Electrolitos',
    description: 'Restricción rigurosa de sodio sin sal añadida en cocción ni en mesa.',
    energy: '1,000 – 2,000 mg de Sodio / día (aprox. 2.5 a 5 g de sal)',
    macros: { cho: 'Normal', p: 'Normal', l: 'Normal' },
    indications: [
      'Hipertensión arterial refractaria o estadio 2',
      'Insuficiencia cardíaca congestiva clase funcional II-III',
      'Edema moderado por síndrome nefrótico',
      'Cirrosis hepática con ascitis leve a moderada'
    ],
    allowed: [
      'Alimentos frescos naturales cocinados sin sal añadida',
      'Especias y condimentos 100% naturales no salinos',
      'Pan sin sal y galletas sin sal añadida'
    ],
    forbidden: [
      'Todo tipo de embutidos y carnes curadas o saladas',
      'Quesos salados (queso duro, queso morolique, feta)',
      'Enlatados regulares (atún enlatado con sal, vegetales enlatados sin lavar)',
      'Comida procesada, panes comerciales regulares con alto sodio'
    ]
  },
  {
    id: 'hiposodica_estricta',
    name: 'Dieta hiposódica estricta',
    category: 'Minerales y Electrolitos',
    description: 'Máxima restricción sódica hospitalaria. Selección de alimentos naturalmente bajos en sodio.',
    energy: '500 – 1,000 mg de Sodio / día (< 2.5 g de sal)',
    macros: { cho: 'Normal', p: 'Normal', l: 'Normal' },
    indications: [
      'Insuficiencia cardíaca descompensada aguda',
      'Ascitis severa o refractaria',
      'Edema anasárquico e hipertensión arterial maligna'
    ],
    allowed: [
      'Alimentos cocinados exclusivamente al natural con hierbas frescas',
      'Carnes frescas lavadas, cereales hervidos en agua pura',
      'Frutas y verduras frescas seleccionadas'
    ],
    forbidden: [
      'Cualquier sal añadida, alimentos enlatados, panes leudados con bicarbonato o sal',
      'Mariscos naturales con alto contenido sódico basal'
    ]
  },
  {
    id: 'baja_potasio',
    name: 'Dieta baja en potasio',
    category: 'Minerales y Electrolitos',
    description: 'Restricción de alimentos ricos en potasio y aplicación de técnicas culinarias de desalado y doble cocción.',
    energy: '< 1,600 – 2,000 mg de Potasio / día',
    macros: { cho: 'Normal', p: 'Ajustado a función renal', l: 'Normal' },
    indications: [
      'Enfermedad renal crónica estadios 4 y 5 con hiperpotasemia (K > 5.0 mEq/L)',
      'Insuficiencia renal aguda oligoanúrica',
      'Insuficiencia suprarrenal o uso de fármacos ahorradores de potasio con elevación sérica'
    ],
    allowed: [
      'Frutas bajas en potasio: manzana, pera, piña, uvas, arándanos, sandía en porción moderada',
      'Verduras bajas en potasio tras remojo: chayote, pepino pelado, lechuga, ejotes cocidos',
      'Técnica RISS obligatoria: remojo previo de verduras y tubérculos (8–12 h) y doble cocción desechando el agua'
    ],
    forbidden: [
      'Banano, plátano verde o maduro, cítricos (naranja, mandarina, toronja), melón, ciruelas',
      'Aguacate, tomate fresco, salsa de tomate y pasta de tomate concentrada',
      'Papa o camote sin técnica de remojo y doble hervor',
      'Espinacas crudas, acelgas, champiñones, alcachofas',
      'Leguminosas sin remojo prolongado y doble cocción',
      'Chocolate, cacao, frutos secos, sustitutos de sal a base de cloruro de potasio (KCl)'
    ]
  },
  {
    id: 'baja_fosforo',
    name: 'Dieta baja en fósforo',
    category: 'Minerales y Electrolitos',
    description: 'Control estricto de fuentes de fósforo orgánico e inorgánico para prevenir osteodistrofia renal y calcificaciones vasculares.',
    energy: '< 800 – 1,000 mg de Fósforo / día',
    macros: { cho: 'Normal', p: 'Ajustado a función renal', l: 'Normal' },
    indications: [
      'Enfermedad renal crónica con hiperfosfatemia (P > 4.5 mg/dL)',
      'Pacientes renales en hemodiálisis o diálisis peritoneal con fósforo elevado'
    ],
    allowed: [
      'Clara de huevo (excelente proteína sin fósforo yema)',
      'Leche en porción muy controlada (máx. ½ taza al día si está permitida)',
      'Carnes blancas frescas hervidas (el hervor reduce el fósforo orgánico soluble)',
      'Arroz blanco y pastas refinadas (tienen menor fósforo fítico que los integrales)'
    ],
    forbidden: [
      'Quesos madurados y procesados (cheddar, parmesano, queso procesado en rebanadas)',
      'Vísceras (hígado, riñones), mariscos',
      'Frutos secos (almendras, nueces, maní) y semillas',
      'Bebidas gaseosas oscuras (sodas de cola) ricas en aditivos de ácido fosfórico inorgánico (E338-E343)',
      'Cerveza, cacao y chocolate'
    ]
  },

  // ---- MODIFICACIONES EN FIBRA Y ESPECIALES ----
  {
    id: 'alta_fibra',
    name: 'Dieta alta en fibra',
    category: 'Fibra',
    description: 'Aporte incrementado de fibra dietética total (> 30 g/día) con adecuado aporte hídrico.',
    energy: '1,800 – 2,200 kcal',
    macros: { cho: '55 – 60%', p: '15%', l: '25 – 30%' },
    indications: [
      'Constipación / estreñimiento intestinal crónico',
      'Diverticulosis colónica no inflamada',
      'Dislipidemia y prevención de cáncer colorrectal'
    ],
    allowed: [
      'Cereales integrales con salvado, avena integral, quinua',
      'Legumbres (frijoles, lentejas, garbanzos)',
      'Frutas y vegetales con piel comestible bien lavada'
    ],
    forbidden: [
      'Cereales excesivamente refinados',
      'Baja ingesta de líquidos (debe acompañarse de suficiente agua)'
    ]
  },
  {
    id: 'baja_fibra',
    name: 'Dieta baja en fibra / Bajo residuo',
    category: 'Fibra',
    description: 'Reducción de fibra a < 15–20 g/día para disminuir volumen y frecuencia de heces en el colon.',
    energy: '1,800 – 2,200 kcal',
    macros: { cho: '55 – 60%', p: '15%', l: '25 – 30%' },
    indications: [
      'Diverticulitis aguda en fase activa',
      'Enfermedad inflamatoria intestinal (Crohn o Colitis ulcerosa) en brote agudo',
      'Estenosis intestinal parcial o diarreas severas'
    ],
    allowed: [
      'Arroz blanco, fideos, pan blanco refinado',
      'Zanahoria cocida sin piel, chayote cocido',
      'Carnes magras tiernas, caldos desgrasados, gelatina'
    ],
    forbidden: [
      'Cereales integrales, salvado de trigo, legumbres',
      'Frutas crudas con cáscara, verduras crudas',
      'Frutos secos y semillas'
    ]
  },
  {
    id: 'sin_gluten',
    name: 'Dieta libre de gluten',
    category: 'Especiales',
    description: 'Exclusión absoluta de prolaminas tóxicas del trigo, cebada, centeno y derivados para permitir regeneración de vellosidades intestinales.',
    energy: 'Según requerimiento',
    macros: { cho: 'Normal', p: 'Normal', l: 'Normal' },
    indications: [
      'Enfermedad celíaca confirmada por serología o biopsia duodenal',
      'Dermatitis herpetiforme',
      'Sensibilidad al gluten no celíaca'
    ],
    allowed: [
      'Maíz, arroz, papa, yuca, plátano, quinua, amaranto, legumbres al natural',
      'Carnes, huevos, frutas y vegetales frescos sin procesar ni empanizar',
      'Productos certificados con el sello "Libre de Gluten"'
    ],
    forbidden: [
      'Trigo (harinas, panes, pastas, galletas, sémola, cuscús)',
      'Cebada (malta, cerveza regular)',
      'Centeno',
      'Avena convencional contaminada por molienda cruzada',
      'Alimentos procesados con aditivos espesantes de origen desconocido'
    ]
  }
];

// Motor de razonamiento clínico para clasificar y sugerir dietas RISS según el perfil del paciente
export function evaluateRissDietRecommendation(p, c) {
  const g = p.gen || {};
  const a = p.antro || {};
  const bio = p.bio || {};
  const clin = p.clin || {};
  const dxText = (g.dx || '').toLowerCase() + ' ' + (g.motivo || '').toLowerCase() + ' ' + (g.antecedentes || '').toLowerCase();

  const num = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const imc = c.imc;
  const egfr = c.egfr;
  const glu = num(bio.glucosa);
  const hba1c = num(bio.hba1c);
  const alb = num(bio.albumina);
  const tg = num(bio.tg);
  const col = num(bio.colesterol);
  const ldl = num(bio.ldl);
  const potasio = num(bio.potasio);
  const fosforo = num(bio.fosforo);
  const sodio = num(bio.sodio);

  const primaryDiet = { id: 'normal', name: 'Dieta normal o corriente', reason: 'Condición clínica basal estable sin compromiso digestivo o metabólico severo.' };
  const secondaryDiets = [];

  const isEmbarazada = Boolean(g.embarazada || num(g.semGestacional) > 0);
  const isPediatrico = !isEmbarazada && ((g.edad != null && num(g.edad) < 19) || (g.edadMeses != null && num(g.edadMeses) < 228));

  if (isEmbarazada) {
    primaryDiet.id = 'embarazada';
    primaryDiet.name = 'Dieta de la Embarazada / Gestación (RIISS)';
    primaryDiet.reason = `Paciente gestante en semana ${g.semGestacional || '—'}. Lineamientos RIISS prescriben dieta normocalórica con adición energética por trimestre (+340 kcal 2T, +452 kcal 3T), +25 g de proteína, fraccionamiento en 5-6 tiempos para evitar reflujo y aporte asegurado de folatos, hierro y calcio.`;
  } else if (isPediatrico) {
    primaryDiet.id = 'pediatrica';
    primaryDiet.name = 'Dieta Pediátrica y del Adolescente (RIISS)';
    primaryDiet.reason = `Paciente pediátrico/adolescente (${g.edad || '—'} años). Prescripción orientada a crecimiento y desarrollo según curvas OMS y RIISS, asegurando proteína y micronutrientes sin dietas hipocalóricas perjudiciales.`;
  }

  // 1. Evaluación de consistencia
  const sint = clin.sint || {};
  if (sint.disfagia || clin.oral?.toLowerCase().includes('mastic') || clin.oral?.toLowerCase().includes('dientes') || clin.oral?.toLowerCase().includes('edentulia')) {
    primaryDiet.id = 'mec_suave';
    primaryDiet.name = 'Dieta mecánicamente suave (molida / puré)';
    primaryDiet.reason = 'Presencia de alteración masticatoria / disfagia mecánica o edentulia.';
  } else if (sint.nauseas || sint.vomito || sint.pirosis || sint.distension || dxText.includes('gastritis') || dxText.includes('reflujo') || dxText.includes('ulcera')) {
    if (!isEmbarazada) {
      primaryDiet.id = 'blanda';
      primaryDiet.name = 'Dieta blanda';
      primaryDiet.reason = 'Síntomas digestivos activos (náuseas/pirosis/gastritis) que requieren fácil digestión sin irritantes.';
    }
  }

  // 2. Modificaciones de Energía
  if (!isEmbarazada && !isPediatrico) {
    if (imc != null && imc >= 30) {
      secondaryDiets.push({
        id: 'hipocalorica',
        name: 'Dieta hipocalórica',
        reason: `Obesidad (IMC ${imc.toFixed(1)} kg/m² ≥ 30) según lineamientos RISS para inducir pérdida ponderal controlada.`
      });
    } else if (imc != null && imc >= 25 && imc < 30) {
      secondaryDiets.push({
        id: 'hipocalorica',
        name: 'Dieta hipocalórica',
        reason: `Sobrepeso (IMC ${imc.toFixed(1)} kg/m²) con comorbilidades según lineamientos RISS.`
      });
    }
  } else if (c.tamizaje?.level === 'crit' || (imc != null && imc < 18.5) || (c.cambio != null && c.cambio >= 10)) {
    secondaryDiets.push({
      id: 'hipercalorica',
      name: 'Dieta hipercalórica',
      reason: 'Riesgo alto de desnutrición / pérdida de peso involuntaria marcada.'
    });
  }

  // 3. Modificaciones de Proteínas
  if (egfr != null && egfr < 60 && !dxText.includes('dialisis') && !dxText.includes('hemodialisis')) {
    secondaryDiets.push({
      id: 'hipoproteica',
      name: 'Dieta hipoprotéica (0.6 - 0.8 g/kg)',
      reason: `Enfermedad renal crónica estadio ${c.egfrStage || '3-5'} (TFG ${Math.round(egfr)} mL/min/1.73m²) sin diálisis para preservar función residual.`
    });
  } else if (alb != null && alb < 3.5) {
    secondaryDiets.push({
      id: 'hiperproteica',
      name: 'Dieta hiperprotéica (1.5 - 2.0 g/kg)',
      reason: `Hipoalbuminemia marcada (${alb.toFixed(1)} g/dL < 3.5) o estado hipercatabólico.`
    });
  }

  // 4. Modificaciones de Carbohidratos
  const hasDiabetes = clin.pat?.dm1 || clin.pat?.dm2 || dxText.includes('diabet') || (glu != null && glu >= 126) || (hba1c != null && hba1c >= 6.5);
  const hasHighTG = tg != null && tg >= 200;
  if (hasDiabetes || hasHighTG) {
    secondaryDiets.push({
      id: 'baja_cho',
      name: 'Dieta baja en carbohidratos / Control glucémico',
      reason: hasDiabetes
        ? `Diabetes mellitus / hiperglucemia (Glucosa ${glu || '—'} mg/dL, HbA1c ${hba1c || '—'}%) que exige control estricto de CHO según RISS.`
        : `Hipertrigliceridemia moderada-severa (TG ${tg} mg/dL) para frenar lipogénesis hepática de novo.`
    });
  }

  // 5. Modificaciones de Grasas
  const hasHighLipids = (col != null && col >= 200) || (ldl != null && ldl >= 130) || clin.pat?.dislipidemia || dxText.includes('dislipidemia') || dxText.includes('colelitiasis') || dxText.includes('vesicula') || dxText.includes('pancreatitis');
  if (hasHighLipids) {
    secondaryDiets.push({
      id: 'baja_grasa',
      name: 'Dieta baja en grasa (< 25% VCT)',
      reason: 'Perfil lipídico aterogénico, dislipidemia o patología biliopancreática según RISS.'
    });
  }

  // 6. Modificaciones de Sodio / Presión arterial
  const hasHTA = clin.pat?.hta || dxText.includes('hipertension') || dxText.includes('hta') || (clin.edema && clin.edema !== 'no');
  if (hasHTA) {
    const isSevere = clin.edema === '+++' || dxText.includes('insuficiencia cardiaca') || dxText.includes('ascitis');
    secondaryDiets.push({
      id: isSevere ? 'hiposodica_moderada' : 'hiposodica_leve',
      name: isSevere ? 'Dieta hiposódica moderada (1-2 g Na)' : 'Dieta hiposódica leve (2-3 g Na)',
      reason: isSevere
        ? 'Presencia de edema marcado o compromiso cardiopulmonar / ascitis.'
        : 'Hipertensión arterial diagnosticada para control hemodinámico según lineamientos RISS.'
    });
  }

  // 7. Modificaciones de Potasio y Fósforo
  if (potasio != null && potasio >= 5.0) {
    secondaryDiets.push({
      id: 'baja_potasio',
      name: 'Dieta baja en potasio (< 1,600 mg/día)',
      reason: `Hiperpotasemia sérica activa (${potasio.toFixed(1)} mEq/L ≥ 5.0) que exige restricción de K y técnica de doble cocción RISS.`
    });
  }

  if (fosforo != null && fosforo >= 4.5) {
    secondaryDiets.push({
      id: 'baja_fosforo',
      name: 'Dieta baja en fósforo (< 800 mg/día)',
      reason: `Hiperfosfatemia sérica activa (${fosforo.toFixed(1)} mg/dL ≥ 4.5) que requiere restricción de fosfatos orgánicos e inorgánicos RISS.`
    });
  }

  // Si no se asignó consistencia especial pero hay patologías metabólicas, la consistencia base es Normal
  return {
    primaryDiet,
    secondaryDiets,
    fullName: [primaryDiet.name, ...secondaryDiets.map(d => d.name)].join(' + ')
  };
}
