/**
 * Catálogo estructurado de Recomendaciones Nutricionales Clínicas por Tipo de Paciente y Patología
 * Extraído y adaptado de los lineamientos clínicos oficiales (RECOMENDACIONES_GENERALES.odt).
 */

export const RECOMMENDATION_SETS = [
  {
    id: 'lactancia_menores_6m',
    title: 'Nutrición en Niños Menores de 6 Meses / Lactancia Materna Exclusiva',
    shortTitle: 'Lactancia < 6 meses',
    category: 'Pediatría y Lactancia',
    badge: 'Lactancia',
    color: 'emerald',
    description: 'Lineamientos para lactantes menores de 6 meses y madres en período de lactancia.',
    items: [
      'Practicar la lactancia materna exclusiva desde el nacimiento hasta los 6 meses cumplidos (180 días) de edad.',
      'Introducir los alimentos complementarios a partir de los 6 meses de edad (180 días), manteniendo la lactancia materna continuada.',
      'Suplementación materna: La madre lactante debe recibir suplementos de vitaminas y minerales o productos fortificados en su alimentación diaria, tanto por su propia salud como para asegurar concentraciones normales de micronutrientes en su leche.'
    ]
  },
  {
    id: 'erc',
    title: 'Enfermedad Renal Crónica (ERC)',
    shortTitle: 'Enfermedad Renal Crónica',
    category: 'Nefrología',
    badge: 'Renal',
    color: 'purple',
    description: 'Control de potasio, fósforo, sodio, técnicas de doble cocción y proteínas AVB.',
    items: [
      'Priorizar proteínas de alto valor biológico (huevo, pescado de agua dulce, pollo, lomo de cerdo y lácteos controlados en cantidades adecuadas). Consumir 2 claras de huevo al día y huevo entero máximo 1 vez a la semana.',
      'Realizar 3 comidas principales y 2-3 refrigerios pequeños fraccionados al día; evitar ayunos prolongados y no dejar pasar muchas horas entre comidas.',
      'Técnica de remojo para control de potasio: Remojar previamente papas, verduras, hortalizas y legumbres durante 12 horas, eliminando y renovando el agua de remojo 2 a 3 veces.',
      'Técnica de doble cocción para potasio: Cocinar con abundante agua; al romper el hervor, cambiar totalmente el agua de cocción y hervir por segunda vez para reducir a la mitad el potasio del alimento. Desechar siempre los caldos sobrantes.',
      'Utilizar preferentemente verduras congeladas (presentan menor contenido de potasio residual).',
      'Control de Fósforo inorgánico: Evitar alimentos procesados y aditivos de fósforo. Preferir lácteos descremados, queso fresco y requesón en las porciones prescritas.',
      'Restricción estricta de sodio: Evitar añadir sal en la mesa y omitir alimentos precocinados, consomés, salsas comerciales y sopas instantáneas. Como alternativa sazonar con especias naturales: perejil, ajo, orégano y tomillo.',
      'Formas de cocción saludables: Asados, salcochados, al vapor, guisados o a la plancha.',
      'Evitar bebidas carbonatadas, azucaradas o alcohólicas ya que impiden una adecuada hidratación y aportan aditivos nocivos.',
      'Evitar comer con distractores (celular, televisión) y realizar ejercicio físico diario adaptado a su capacidad y prescripción médica.'
    ]
  },
  {
    id: 'obesidad',
    title: 'Manejo de Obesidad y Control de Peso en Adultos',
    shortTitle: 'Obesidad y Control de Peso',
    category: 'Metabólico',
    badge: 'Obesidad',
    color: 'amber',
    description: 'Distribución del plato, control de porciones, saciedad y supresión de azúcares simples.',
    items: [
      'Distribución del plato saludable: Dividir las comidas asegurando que los vegetales y ensaladas frescas ocupen al menos la mitad del plato principal.',
      'Incluir vegetales y frutas de variados colores con bajo contenido de azúcar y alto contenido de fibra para prolongar la plenitud y saciedad.',
      'Control visual de porciones: Utilizar platos medianos o pequeños para que la porción se aprecie abundante; servirse únicamente la cantidad prescrita y no repetir plato.',
      'Aprender a escuchar las señales de saciedad del cuerpo y evitar comer por impulso emocional.',
      'Proteínas magras y saciantes: Seleccionar pollo sin piel, pavo, pescado, legumbres y claras de huevo preparadas sin grasa.',
      'Cocinar los alimentos asados, al vapor, a la plancha o al horno, eliminando preparaciones con excesos de grasa (frituras y empanizados).',
      'Evitar estrictamente azúcares simples: Refrescos, miel, mermelada, gelatina azucarada, dulce de panela, golosinas y pastelería.',
      'Consumir cereales y harinas integrales (avena, tortilla de maíz, arroz integral) para optimizar la saciedad y regular la absorción de nutrientes.',
      'Lácteos y derivados descremados: Leche líquida o en polvo descremada (no saborizada), yogur natural sin azúcar, requesón, cuajada y queso fresco bajo en grasa.',
      'Seleccionar aceites vegetales en crudo (oliva, canola) y evitar totalmente grasas sólidas como manteca vegetal o margarina.',
      'Hidratación: Beber entre 1.5 y 2.0 litros de agua pura al día. Evitar jugos comerciales, bebidas azucaradas y bebidas alcohólicas.',
      'Comer despacio sin distractores (pantallas/televisión) y realizar al menos 30 minutos de actividad física regular diaria.'
    ]
  },
  {
    id: 'ansiedad_comer',
    title: 'Estrategias para Disminuir la Ansiedad de Comer y Hambre Emocional',
    shortTitle: 'Ansiedad de Comer / Picoteo',
    category: 'Conductual',
    badge: 'Conducta',
    color: 'sky',
    description: 'Horarios estables, combinación de macronutrientes saciantes y sustitución inteligente de snacks.',
    items: [
      'Establecer una rutina con horarios fijos de comidas: Previene la ansiedad anticipatoria y reduce los episodios de picoteo descontrolado.',
      'Elegir alimentos saciantes en cada comida: Combinar proteína (huevo, pollo, carne magra, frijoles), grasas saludables (aguacate, semillas) y carbohidratos complejos integrales para estabilizar la glucosa.',
      'Incrementar la fibra dietética: Consumir frutas enteras, verduras y legumbres que retardan el vaciamiento gástrico.',
      'Hidratación preventiva: Ante un impulso repentino de comer, beber un vaso de agua pura para verificar si se trata de sed no reconocida.',
      'Snacks inteligentes preparados: Si aparece ansiedad entre comidas, elegir opciones seguras como yogur natural descremado, pepino o tomate con limón y pizca de sal, o un puñado medido de frutos secos.',
      'Distinción de emociones: Si se busca comida sin hambre física real, reconocer el estado emocional (aburrimiento, estrés, tristeza) y sustituir por una caminata o actividad placentera.',
      'Estrategias de conducta: Comer despacio, masticar con calma y no utilizar la comida como sistema de premio o alivio emocional.'
    ]
  },
  {
    id: 'pediatria_perdida_peso',
    title: 'Pérdida de Peso y Hábitos Saludables en Niños y Adolescentes',
    shortTitle: 'Pérdida de Peso Pediátrica',
    category: 'Pediatría',
    badge: 'Pediatría',
    color: 'teal',
    description: 'Pautas de alimentación familiar, platos atractivos, hidratación y 60 min de actividad.',
    items: [
      'Mantener horarios regulares de comida: Ofrecer 3 comidas principales y 1 a 2 refrigerios saludables sin omitir ningún tiempo.',
      'Reducir al mínimo alimentos ultraprocesados: Eliminar gaseosas, jugos envasados, frituras, golosinas y repostería industrial.',
      'Incrementar frutas y verduras a un mínimo de 5 porciones diarias en presentaciones atractivas (bastoncitos crujientes, ensaladas coloridas, licuados sin azúcar).',
      'Controlar las porciones según la edad: Usar platos acordes al tamaño del niño; no forzar a terminar el plato cuando manifieste saciedad.',
      'Proteínas de calidad en cada comida: Pollo, pescado, huevo, frijoles, lentejas y lácteos bajos en grasa para favorecer desarrollo y saciedad.',
      'Elegir carbohidratos integrales: Pan y tortillas de maíz integrales, avena y arroz integral por su aporte de fibra.',
      'Agua como bebida principal: Motivar al niño o adolescente a portar su propia botella de agua natural; evitar bebidas azucaradas.',
      'Limitar pantallas y promover actividad física: Asegurar al menos 60 minutos diarios de movimiento activo (juegos, bicicleta, caminata en familia).',
      'Ambiente familiar saludable: La familia debe comer el mismo menú balanceado; nunca utilizar la comida como premio o castigo.'
    ]
  },
  {
    id: 'desnutricion',
    title: 'Desnutrición, Bajo Peso y Recuperación Ponderal',
    shortTitle: 'Desnutrición / Bajo Peso',
    category: 'Clínica General',
    badge: 'Recuperación',
    color: 'rose',
    description: 'Fraccionamiento hipercalórico, mezclas con Incaparina y densidad proteica.',
    items: [
      'Realizar de 5 a 6 tiempos de comida al día (3 principales y 2 a 3 meriendas); evitar ayunos prolongados y no omitir ningún tiempo.',
      'Incluir proteína magra en cada tiempo principal: Pollo sin piel, huevo, pescado, carne roja sin gordura, jamón de pavo o atún en agua, midiendo la porción con la palma de la mano.',
      'Consumir lácteos 2 veces al día para aporte de calcio y proteínas de alto valor biológico.',
      'Incorporar Incaparina en la alimentación diaria para enriquecimiento calórico y proteico.',
      'Elaborar mezclas alimentarias de alta densidad: Arroz con huevo, casamiento tradicional, licuados de leche con avena o Incaparina y fruta, tortas de carne o pollo con arroz e Incaparina agregada a la masa.',
      'Consumir frutas de 2 a 3 veces al día y al menos 2 porciones diarias de verduras de diversos colores para reposición de micronutrientes.',
      'Mantener una óptima hidratación con agua pura a lo largo del día, preferentemente separada de las comidas principales para evitar saciedad temprana.',
      'Evitar alimentos procesados o chatarras que aportan calorías vacías sin valor nutricional.'
    ]
  },
  {
    id: 'embarazo',
    title: 'Alimentación Balanceada en la Embarazada (Gestación)',
    shortTitle: 'Embarazo / Gestación',
    category: 'Materno-Fetal',
    badge: 'Gestación',
    color: 'pink',
    description: 'Fraccionamiento en 5-6 tiempos, folatos, hierro sin lácteos concurrentes y cero café.',
    items: [
      'Fraccionar la alimentación en 5 a 6 tiempos pequeños al día para evitar reflujo, acidez y garantizar aporte energético constante.',
      'No omitir ningún tiempo de comida ni realizar ayunos prolongados.',
      'Incluir 1 porción de proteína magra en cada tiempo principal (desayuno, almuerzo y cena): Pollo sin piel, huevo bien cocido, pescado bajo en mercurio, carne magra y atún en agua.',
      'Consumir lácteos pasteurizados y desnatados al menos 2 veces al día (leche descremada, yogur natural, requesón y cuajada fresca sin exceso de sal).',
      'Priorizar alimentos ricos en ácido fólico: Aguacate, hojas verdes oscuras (espinaca, berro, chipilín, mora) y legumbres.',
      'Toma de suplementos de hierro: Tomar el hierro con agua o jugo de frutas cítricas (vitamina C). NUNCA consumirlo simultáneamente con lácteos, té o café ya que bloquean su absorción.',
      'Evitar el consumo de café, té y bebidas energéticas (la cafeína incrementa el riesgo de bajo peso fetal y complicaciones obstétricas).',
      'Inocuidad alimentaria rigurosa: Prohibir carnes, pescados, mariscos o huevos crudos o tibios; desinfectar rigurosamente frutas y verduras.',
      'Grasas saludables: Aguacate, frutos secos y aceite de oliva para el desarrollo cerebral fetal y absorción de vitaminas liposolubles.',
      'Hidratación de 2.0 a 2.5 litros de agua al día para prevenir infecciones urinarias y estreñimiento.',
      'Caminar 30 minutos diarios de 3 a 4 días por semana, siempre que la evaluación ginecológica y obstétrica lo permita.'
    ]
  },
  {
    id: 'dm',
    title: 'Diabetes Mellitus (DM1, DM2 y Diabetes Gestacional)',
    shortTitle: 'Diabetes Mellitus',
    category: 'Endocrinología',
    badge: 'Diabetes',
    color: 'indigo',
    description: 'Horarios estrictos, cero azúcares simples, carbohidratos medidos y frutas ácidas.',
    items: [
      'Mantener horarios fijos de comida: Realizar los 3 tiempos de comida principales y 2 refrigerios planificados al día para prevenir oscilaciones glucémicas.',
      'Eliminar por completo el consumo de azúcares simples: Refrescos, miel, mermeladas, dulces de panela, golosinas y repostería. Endulzar con edulcorantes aprobados si se requiere.',
      'Limitar y medir las porciones de carbohidratos por tiempo de comida; preferir siempre granos enteros y cereales integrales por su fibra reguladora.',
      'Preferir frutas enteras ácidas y de bajo índice glucémico (fresas, manzana verde, kiwi, naranja o mandarina en gajos); evitar jugos colados.',
      'Consumir verduras sin almidón 2 a 3 veces al día; moderar el consumo de remolacha y zanahoria cocida por su contenido de carbohidratos simples.',
      'Incluir proteína magra en cada tiempo principal: Pollo sin piel, pescado fresco, claras de huevo, sardina o pavo.',
      'Consumir lácteos descremados 2 veces al día (leche descremada, yogur sin azúcar, requesón).',
      'Grasas cardioprotectoras: Aguacate, frutos secos y aceite vegetal en frío; evitar margarina, manteca y embutidos con grasa saturada.',
      'Formas de cocción saludables: Asados, salcochados, al vapor, guisados o a la plancha sin grasas añadidas.',
      'Hidratación abundante con agua pura durante todo el día.'
    ]
  },
  {
    id: 'cirrosis',
    title: 'Cirrosis Hepática y Hepatopatía Crónica No Alcohólica',
    shortTitle: 'Cirrosis Hepática',
    category: 'Gastroenterología',
    badge: 'Hepático',
    color: 'orange',
    description: 'Colación nocturna obligatoria contra sarcopenia, fraccionamiento y preservación proteica.',
    items: [
      'Refrigerio nocturno obligatorio (Late Evening Snack): Consumir una colación rica en carbohidratos complejos antes de dormir para prevenir el catabolismo proteico y la sarcopenia durante el ayuno de la noche.',
      'Evitar estrictamente ayunos prolongados: Realizar de 5 a 6 comidas pequeñas y bien distribuidas al día.',
      'NO suspender el consumo de proteínas: Priorizar proteínas vegetales (legumbres), lácteos descremados y carnes blancas (pollo sin piel, pescado fresco) en cada tiempo principal.',
      'Suspensión total y absoluta de bebidas alcohólicas (incluyendo cerveza y vino).',
      'Evitar alimentos procesados, enlatados y embutidos por su excesiva carga de sodio y conservantes.',
      'Control hídrico: Si existe ascitis o edema periférico moderar los líquidos a aproximadamente 1 a 1.2 litros al día bajo supervisión médica.',
      'Suplementación nutricional adecuada en caso de déficit demostrado: Vitamina D, zinc, magnesio, tiamina y ácido fólico.',
      'Realizar actividad física suave (caminatas diarias) según tolerancia para preservar fuerza y masa muscular.'
    ]
  },
  {
    id: 'esteatosis',
    title: 'Esteatosis Hepática (Hígado Graso / MASLD)',
    shortTitle: 'Hígado Graso / Esteatosis',
    category: 'Gastroenterología',
    badge: 'Hígado Graso',
    color: 'amber',
    description: 'Mitad del plato con verduras sin almidón, licuado verde matutino y cero alcohol.',
    items: [
      'Distribución del plato: En almuerzo y cena la MITAD del plato debe contener verduras variadas sin almidón (güisquil, pipián, ejote, tomate, cebolla, espinaca, pepino, repollo, berenjena, mora, chipilín). No incluye papa, yuca, camote, plátano ni elote como verduras.',
      'Consumir de 2 a 3 porciones de fruta fresca al día respetando raciones individuales (1 manzana pequeña, 1 pera, 1 mandarina, 8 fresas, 1 kiwi, 1 taza de papaya o melón en cubos).',
      'Priorizar harinas y cereales integrales (máximo 2 porciones por tiempo de comida): Avena integral, pan integral, arroz integral, tortilla de maíz.',
      'Consumir legumbres a diario al menos 2 veces al día: Frijoles salcochados, lentejas o garbanzos (ración de 3 cucharadas) por su alto aporte de fibra soluble hepatoprotectora.',
      'Proteína limpia en cada tiempo de comida: Pescado, pechuga de pollo sin piel, salmón, sardina, atún en agua o huevo medido según la palma de la mano.',
      'Cocinar sin grasa: Formas de cocción a la plancha, al vapor, al horno, asado o salcochado.',
      'Licuado matutino en ayunas: 1 vaso con agua + 1 manzana verde pequeña con cáscara (bien lavada) + 1 puñado de espinaca o perejil + 1 cucharada de jugo de limón.',
      'Suspender totalmente: Azúcares añadidos, harinas refinadas, frituras, comida rápida y alcohol en cualquiera de sus presentaciones.',
      'Elegir lácteos desgrasados: Leche descremada, yogur descremado sin azúcar, requesón, cuajada y queso fresco.',
      'Beber 2 litros (8 vasos) de agua al día y realizar actividad física regular de al menos 30 a 45 minutos 4 veces por semana.'
    ]
  },
  {
    id: 'anemia',
    title: 'Manejo Nutricional de la Anemia Ferropénica',
    shortTitle: 'Anemia Ferropénica',
    category: 'Hematología',
    badge: 'Anemia',
    color: 'red',
    description: 'Hierro hemo y no hemo, sinergia con vitamina C y separación de inhibidores.',
    items: [
      'Consumir alimentos ricos en hierro hemo (alta biodisponibilidad): Carne roja magra, pollo, pescado fresco, sardinas y atún.',
      'Consumir fuentes vegetales de hierro no hemo: Frijoles, lentejas, garbanzos, soya, espinaca, acelga, berro, avena fortificada e Incaparina.',
      'Sinergia con Vitamina C: Combinar siempre los alimentos ricos en hierro no hemo con fuentes de vitamina C (limón, mandarina, naranja, kiwi, fresas, tomate) para multiplicar la absorción intestinal.',
      'Evitar inhibidores con las comidas: No consumir café, té (negro o verde), chocolate ni bebidas de cola cerca de las comidas ricas en hierro, ya que los polifenoles y taninos bloquean su absorción.',
      'Separación estricta de lácteos: No mezclar en la misma comida lácteos (leche, queso, yogur) con las fuentes de hierro ni con el suplemento ferroso, debido a que el calcio compite por el mismo transportador.',
      'Consumir alimentos ricos en proteína en desayuno, almuerzo y cena para apoyar la síntesis de hemoglobina.',
      'Mantener una óptima hidratación con agua pura.'
    ]
  },
  {
    id: 'talasemia',
    title: 'Talasemia y Protección ante Sobrecarga de Hierro',
    shortTitle: 'Talasemia',
    category: 'Hematología',
    badge: 'Talasemia',
    color: 'violet',
    description: 'Consumo de calcio para inhibir absorción de hierro, zinc, cobre y folatos.',
    items: [
      'Aumentar el consumo de lácteos (leche, yogur, queso) y alimentos ricos en calcio con las comidas principales para reducir de forma controlada la absorción intestinal de hierro y proteger la masa ósea.',
      'Asegurar un aporte óptimo de ácido fólico y vitamina B12 para respaldar la producción de glóbulos rojos: Hojas verdes, cítricos, legumbres, semillas de girasol y alimentos fortificados.',
      'Aporte adecuado de zinc y cobre: Consumir carnes de ave, semillas de calabaza, lentejas y garbanzos para soporte inmunitario.',
      'Mantener una hidratación adecuada y continua durante todo el día.',
      'Evitar suplementos de hierro o alimentos con excesiva fortificación ferrosa sin expresa prescripción médica.'
    ]
  },
  {
    id: 'autismo',
    title: 'Recomendaciones Nutricionales en Trastorno del Espectro Autista (TEA)',
    shortTitle: 'Espectro Autista (TEA)',
    category: 'Neurodesarrollo',
    badge: 'TEA',
    color: 'blue',
    description: 'Evaluación de gluten/caseína, supresión de aditivos, azúcar refinada y estimulantes.',
    items: [
      'Evaluar sensibilidad a gluten y caseína: En pacientes con síntomas digestivos o desregulación conductual, evaluar prueba supervisada de exclusión de gluten (trigo, cebada, centeno) y caseína (lácteos enteros de vaca).',
      'Evitar azúcar refinada y ultraprocesados (golosinas, bebidas azucaradas, panadería industrial) que desestabilizan la energía y alteran la conducta.',
      'Suprimir aditivos y colorantes artificiales: Evitar tartrazina, rojo allura, benzoato de sodio y glutamato monosódico por posible hipersensibilidad neuroconductual.',
      'Evitar cafeína y estimulantes (refrescos de cola, té helado, café, chocolate en exceso) que aumentan la ansiedad y fragmentan el sueño.',
      'Identificar y registrar alimentos desencadenantes de malestar digestivo (estreñimiento crónico, gases o reflujo).',
      'Promover una dieta equilibrada rica en alimentos frescos, proteínas limpias (pollo sin piel, pescado fresco, huevo) y grasas ricas en omega-3 (aguacate, semillas).'
    ]
  },
  {
    id: 'lupus',
    title: 'Guía Alimentaria en Lupus Eritematoso Sistémico (LES)',
    shortTitle: 'Lupus (LES)',
    category: 'Inmunología',
    badge: 'LES',
    color: 'fuchsia',
    description: 'Dieta antiinflamatoria, omega-3, calcio/vit D y PROHIBICIÓN ESTRICTA DE ALFALFA.',
    items: [
      'Patrón alimentario antiinflamatorio: Frutas y verduras frescas de variados colores (espinaca, brócoli, güisquil, pipián, zanahoria, papaya, frutos rojos, cítricos).',
      'Incluir ácidos grasos Omega-3 para atenuar la inflamación articular: Salmón, sardina, atún, semillas de chía, linaza molida y nueces.',
      'Carbohidratos integrales: Avena, arroz integral, quinoa y pan integral para el control metabólico.',
      'Asegurar calcio y Vitamina D: Imprescindible para contrarrestar la desmineralización ósea asociada al uso terapéutico de corticoides; consumir lácteos bajos en grasa y bebidas fortificadas.',
      'ALERTA CRÍTICA: Prohibir estrictamente el consumo de alfalfa (brotes, semillas o suplementos) debido a que su aminoácido L-canavanina puede reactivar brotes lúpicos severos.',
      'Limitar estrictamente el sodio y productos ultraprocesados, en especial ante compromiso renal o hipertensión.',
      'Usar aceite de oliva como grasa principal y cocinar al vapor, horno o plancha. Hidratarse con suficiente agua pura.'
    ]
  },
  {
    id: 'hernia_hiatal',
    title: 'Hernia Hiatal y Enfermedad por Reflujo Gastroesofágico (ERGE)',
    shortTitle: 'Hernia Hiatal / Reflujo',
    category: 'Gastroenterología',
    badge: 'Reflujo',
    color: 'emerald',
    description: 'Comidas pequeñas, no recostarse antes de 2-3h, elevación de cabecera y alimentos no irritantes.',
    items: [
      'Realizar comidas pequeñas y frecuentes: Hacer de 5 a 6 tomas al día en lugar de comidas copiosas para disminuir la presión intragástrica.',
      'Masticar despacio y con calma para evitar tragar aire y disminuir el reflujo mecánico.',
      'Higiene postural: No recostarse inmediatamente después de comer; esperar al menos de 2 a 3 horas antes de acostarse.',
      'Elevar la cabecera de la cama de 10 a 15 cm y usar ropa holgada sin cinturones apretados.',
      'Alimentos y bebidas prohibidos: Cítricos y frutas muy ácidas (naranja, limón, piña, tomate y salsas de tomate), picantes, café, té negro, bebidas con gas, chocolate, frituras y alcohol.',
      'Alimentos recomendados: Pollo sin piel, pescado horneado, clara de huevo, verduras suaves (güisquil, pipián, zanahoria), cereales simples (avena, pan tostado, tortilla de maíz) y frutas no ácidas (papaya, melón, manzana, guineo).'
    ]
  },
  {
    id: 'gota',
    title: 'Hiperuricemia y Prevención de Crisis de Gota',
    shortTitle: 'Hiperuricemia / Gota',
    category: 'Reumatología',
    badge: 'Gota',
    color: 'red',
    description: 'Supresión de vísceras, cerveza, purinas altas y fructosa; aporte abundante de agua.',
    items: [
      'Prohibir totalmente vísceras de cualquier animal (hígado, riñones, corazón, sesos) por su altísimo contenido de purinas.',
      'Evitar carnes rojas y procesadas: Res, cerdo, cordero, tocino y embutidos comerciales.',
      'Restringir mariscos y pescados ricos en purinas: Sardinas, anchoas, caballa, camarones, langostas y mejillones.',
      'Cero bebidas alcohólicas: Suprimir la cerveza de forma rigurosa (su contenido de levadura y alcohol bloquea la excreción renal de uratos) y evitar licores.',
      'Evitar bebidas y alimentos con jarabe de maíz alto en fructosa (JMAF) y azúcares simples (gaseosas, jugos industriales, postres).',
      'Omitir caldos concentrados de carne o mariscos (las purinas se disuelven en el caldo de cocción).',
      'Consumir lácteos descremados (leche, requesón, yogur) por su demostrado efecto uricosúrico protector.',
      'Hidratación abundante: Beber de 2.5 a 3.0 litros de agua pura al día para facilitar la depuración renal del ácido úrico.'
    ]
  },
  {
    id: 'gastritis',
    title: 'Gastritis Aguda/Crónica y Úlcera Péptica',
    shortTitle: 'Gastritis / Úlcera',
    category: 'Gastroenterología',
    badge: 'Gastritis',
    color: 'amber',
    description: 'Comidas frecuentes, evitar tomate/cebolla/ajo crudos, temperatura templada y nada de irritantes.',
    items: [
      'Comidas pequeñas y frecuentes: Realizar 5 tomas al día para evitar acumulación excesiva de ácido gástrico.',
      'Comer despacio, masticando exhaustivamente cada bocado.',
      'Esperar al menos 1.5 a 2 horas antes de acostarse tras la última comida.',
      'Evitar temperaturas extremas: No consumir alimentos ni bebidas excesivamente calientes o heladas para no lesionar la mucosa gástrica.',
      'Alimentos estrictamente prohibidos: Tomate crudo, cebolla cruda, ajo crudo, chile picante, condimentos artificiales (consomé, salsa inglesa, mostaza), café, té negro o verde, bebidas carbonatadas, alcohol y frituras.',
      'Frutas cítricas a evitar: Naranja, mandarina, piña, kiwi, mango verde y limón.',
      'Alimentos protectores recomendados: Papa salcochada, avena, pan tostado, tortilla de maíz, pechuga de pollo, pescado magro, claras de huevo, requesón, cuajada fresca, güisquil, pipián, zanahoria cocida, papaya, melón y agua pura.'
    ]
  }
];

/**
 * Motor clínico de detección de recomendaciones según perfil del paciente
 * @param {Object} p - Objeto del paciente
 * @param {Object} c - Datos calculados clínicos
 * @returns {Array} Lista de recommendation sets aplicables
 */
export function detectPatientRecommendations(p, c = {}) {
  const g = p.gen || {};
  const cl = p.clin || {};
  const pat = cl.pat || {};
  const sint = cl.sint || {};
  const bio = p.bio || {};

  const num = v => {
    if (v === null || v === undefined || v === '') return null;
    const n = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  };

  const edadAnos = num(g.edad);
  const edadMeses = num(g.edadMeses);
  const imc = c.imc;
  const egfr = c.egfr;
  const glu = num(bio.glucosa);
  const hba1c = num(bio.hba1c);
  const acidoUrico = num(bio.acidoUrico || bio.ac_urico);
  const hb = num(bio.hemoglobina);

  const dxText = [
    g.dx || '',
    g.motivo || '',
    g.antecedentes || '',
    cl.otros || ''
  ].join(' ').toLowerCase();

  const isEmbarazada = Boolean(c.isEmbarazada || (g.embarazada && g.sexo === 'F') || g.modeloEvaluacion === 'embarazada');
  const isPediatrico = Boolean(c.isPediatrico || (!isEmbarazada && edadAnos != null && edadAnos < 19));
  const isAdulto = Boolean(c.isAdulto || (!isEmbarazada && !isPediatrico && edadAnos != null && edadAnos >= 19));

  const matchedIds = new Set();

  // 1. Lactancia menores de 6 meses
  if (edadMeses != null && edadMeses < 6 && (edadAnos == null || edadAnos === 0)) {
    matchedIds.add('lactancia_menores_6m');
  }

  // 2. Pérdida de peso pediátrica / Hábitos en niños
  if (isPediatrico && (
    (imc != null && imc >= 25) ||
    c.pediatricEval?.primaryDiagnosis?.toLowerCase().includes('sobrepeso') ||
    c.pediatricEval?.primaryDiagnosis?.toLowerCase().includes('obesidad') ||
    dxText.includes('obesidad') ||
    dxText.includes('sobrepeso')
  )) {
    matchedIds.add('pediatria_perdida_peso');
  }

  // 3. Embarazo
  if (isEmbarazada || dxText.includes('embaraz') || dxText.includes('gestac')) {
    matchedIds.add('embarazo');
  }

  // 4. Enfermedad Renal Crónica
  if (pat.erc || (egfr != null && egfr < 60) || dxText.includes('renal') || dxText.includes('erc') || dxText.includes('nefro')) {
    matchedIds.add('erc');
  }

  // 5. Obesidad y control de peso en adultos
  if (!isPediatrico && !isEmbarazada && (pat.obesidad || (imc != null && imc >= 28) || dxText.includes('obesidad') || dxText.includes('sobrepeso'))) {
    matchedIds.add('obesidad');
  }

  // 6. Desnutrición / Bajo peso
  if (pat.desnutricion || (imc != null && imc < 18.5) || dxText.includes('desnutri') || dxText.includes('bajo peso') || dxText.includes('delgadez') || dxText.includes('perdida ponderal')) {
    matchedIds.add('desnutricion');
  }

  // 7. Diabetes Mellitus
  if (pat.dm || pat.dm1 || pat.dm2 || (glu != null && glu >= 126) || (hba1c != null && hba1c >= 6.5) || dxText.includes('diabet') || dxText.includes('dm1') || dxText.includes('dm2') || dxText.includes('glicemia')) {
    matchedIds.add('dm');
  }

  // 8. Ansiedad de comer / Hambre emocional
  if (sint.ansiedad || dxText.includes('ansiedad') || dxText.includes('atrac') || dxText.includes('apetito voraz') || dxText.includes('compulsiv')) {
    matchedIds.add('ansiedad_comer');
  }

  // 9. Cirrosis Hepática
  if (pat.cirrosis || dxText.includes('cirrosis') || dxText.includes('hepatopat') || dxText.includes('falla hepat') || dxText.includes('hepatocelular')) {
    matchedIds.add('cirrosis');
  }

  // 10. Esteatosis Hepática (Hígado Graso)
  if (pat.esteatosis || dxText.includes('esteatos') || dxText.includes('graso') || dxText.includes('masld') || dxText.includes('nash')) {
    matchedIds.add('esteatosis');
  }

  // 11. Anemia ferropénica
  if (pat.anemia || (hb != null && hb < 12) || dxText.includes('anemia') || dxText.includes('ferrop')) {
    matchedIds.add('anemia');
  }

  // 12. Talasemia
  if (dxText.includes('talasem')) {
    matchedIds.add('talasemia');
  }

  // 13. Trastorno del Espectro Autista (TEA)
  if (dxText.includes('autis') || dxText.includes('tea') || dxText.includes('asperger')) {
    matchedIds.add('autismo');
  }

  // 14. Lupus Eritematoso Sistémico (LES)
  if (pat.lupus || dxText.includes('lupus') || dxText.includes('les')) {
    matchedIds.add('lupus');
  }

  // 15. Hernia Hiatal / Reflujo Gastroesofágico
  if (sint.reflujo || sint.pirosis || dxText.includes('hernia') || dxText.includes('hiatal') || dxText.includes('reflujo') || dxText.includes('erge')) {
    matchedIds.add('hernia_hiatal');
  }

  // 16. Gota / Hiperuricemia
  if (pat.gota || (acidoUrico != null && acidoUrico > 7.0) || dxText.includes('gota') || dxText.includes('hiperuric')) {
    matchedIds.add('gota');
  }

  // 17. Gastritis y Úlcera Péptica
  if (pat.gastritis || sint.gastritis || sint.acidez || sint.epigastralgia || dxText.includes('gastrit') || dxText.includes('ulcera') || dxText.includes('epigastr')) {
    matchedIds.add('gastritis');
  }

  // Retornar los objetos completos de las recomendaciones detectadas
  return RECOMMENDATION_SETS.filter(set => matchedIds.has(set.id));
}

/**
 * Formatea un arreglo de recomendaciones en texto plano para el plan de atención
 * @param {Array} sets - Lista de recommendation sets
 * @returns {string} Texto multilínea listo para plan.recs
 */
export function buildRecommendationsText(sets) {
  if (!sets || !sets.length) return '';
  const lines = [];
  sets.forEach(s => {
    lines.push(`--- ${s.title.toUpperCase()} ---`);
    s.items.forEach(item => {
      lines.push(`• ${item}`);
    });
    lines.push('');
  });
  return lines.join('\n').trim();
}
