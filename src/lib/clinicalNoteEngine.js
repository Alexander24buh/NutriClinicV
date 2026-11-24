// Motor de Redacción y Generación de Notas de Atención Nutricional Hospitalaria
// Basado en el modelo PAN (Proceso de Atención Nutricional) y estándares clínicos hospitalarios.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle
} from 'docx';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);
const fs = n => n == null ? '—' : (n > 0.049 ? '+' : n < -0.049 ? '-' : '') + Math.abs(n).toFixed(1);

// Genera la redacción clínica estructurada en texto plano y secciones
export function generateClinicalNoteData(p, c) {
  const g = p.gen || {};
  const a = p.antro || {};
  const b = p.bio || {};
  const cl = p.clin || {};
  const d = p.dieta || {};
  const r = p.req || {};
  const pl = p.plan || {};

  const sexoStr = g.sexo === 'M' ? 'masculino' : g.sexo === 'F' ? 'femenino' : 'no especificado';
  const isFem = g.sexo === 'F';
  const isEmbarazada = Boolean(c.isEmbarazada || g.embarazada);
  const isPediatrico = Boolean(c.isPediatrico);

  // A. Encabezado institucional
  const servicio = g.servicio || 'Unidad de Cuidados Intermedios Adultos';
  const cama = g.cama ? String(g.cama).padStart(2, '0') : '01';
  const expediente = g.expediente || 'S/N';
  const nombre = g.nombre || 'Paciente sin nombre';
  const responsable = g.responsable || 'Lic. Nutricionista Clínico';

  const headerLine1 = `${servicio} ${cama}`;
  const headerLine2 = `${expediente} ${nombre}----- Hecho por ${responsable} NUTRICIÓN`;

  // B. Información clínica y evaluación nutricional
  // Párrafo 1: Identificación clínica, estancia, motivo y diagnósticos
  let edadTexto = '';
  if (g.edad) {
    edadTexto = `${g.edad} años`;
    if (g.edadMeses) edadTexto += `, ${g.edadMeses} meses`;
  } else if (g.edadMeses) {
    edadTexto = `${g.edadMeses} meses`;
  } else {
    edadTexto = 'edad no especificada';
  }

  const deihTexto = g.deih ? `en su ${g.deih} DEIH` : 'durante su estancia hospitalaria';
  const motivoTexto = g.motivo ? `ingreso hospitalario por ${g.motivo.trim().replace(/[.;\s]+$/, '')}` : 'ingreso hospitalario para manejo y soporte nutricional especializado';
  const diaEvolTexto = g.diaEvolucion ? `, actualmente en su ${g.diaEvolucion} día de evolución de la enfermedad` : '';

  let dxTexto = g.dx ? g.dx.trim().replace(/[.;\s]+$/, '') : 'en estudio clínico';
  if (isEmbarazada && g.semGestacional && !dxTexto.toLowerCase().includes('embarazo')) {
    dxTexto = `embarazo de ${g.semGestacional} semanas, ${dxTexto}`;
  }

  const parrafoIntro1 = `Paciente del sexo ${sexoStr} de ${edadTexto}, ${deihTexto}, ${motivoTexto}${diaEvolTexto}, con diagnóstico médico: ${dxTexto}.`;

  // Párrafo 2: Anamnesis alimentaria, apetito, síntomas digestivos, antecedentes y alergias
  const orientacionTexto = g.orientacion ? g.orientacion.trim().replace(/[.;\s]+$/, '') : (isFem ? 'orientada y colaboradora durante el interrogatorio' : 'orientado y colaborador durante el interrogatorio');
  
  let apetitoDesc = 'se encuentra conservado';
  if (d.apetito) {
    const ap = d.apetito.toLowerCase();
    if (ap.includes('disminuido') || ap.includes('bajo') || ap.includes('hiporexia')) apetitoDesc = 'se encuentra disminuido';
    else if (ap.includes('bueno') || ap.includes('bien')) apetitoDesc = 'se encuentra bien';
    else apetitoDesc = `se encuentra ${d.apetito.toLowerCase()}`;
  }

  const sintActivos = Object.entries(cl.sint || {}).filter(([_, v]) => Boolean(v)).map(([k]) => {
    const map = {
      nauseas: 'náuseas',
      vomito: 'vómitos ocasionales',
      diarrea: 'diarrea',
      estrenimiento: 'estreñimiento',
      disfagia: 'dificultad para deglutir (disfagia)',
      odinofagia: 'dolor al tragar (odinofagia)',
      dolor: 'dolor abdominal',
      distension: 'distensión abdominal',
      pirosis: 'pirosis / reflujo gastroesofágico',
      hiporexia: 'hiporexia',
      saciedad: 'saciedad temprana',
      disgeusia: 'alteración del gusto (disgeusia)',
      mucositis: 'lesiones orales / mucositis',
      masticacion: 'dificultad para la masticación'
    };
    return map[k] || k;
  });

  let sintTexto = 'sin síntomas gastrointestinales agudos referidos en el momento de la evaluación';
  if (sintActivos.length > 0) {
    sintTexto = `refiere ${sintActivos.join(', ')} como síntoma gastrointestinal`;
  }

  const numTiempos = pl.menu ? Object.values(pl.menu).filter(v => v && String(v).trim()).length : 0;
  const tiemposTexto = numTiempos >= 4 ? `realizando ${numTiempos} tiempos de comida al día` : 'realizando los 3 tiempos de comida principales al día';

  let obstetricosTexto = '';
  if (isFem && g.obstetricos) {
    obstetricosTexto = ` Con antecedentes gineco-obstétricos de ${g.obstetricos.trim().replace(/[.;\s]+$/, '')}.`;
  } else if (isEmbarazada && g.semGestacional) {
    obstetricosTexto = ` Con gestación actual en evolución de ${g.semGestacional} semanas.`;
  }

  let antecedentesTexto = '';
  if (g.antecedentes && g.antecedentes.trim()) {
    antecedentesTexto = ` Antecedentes: ${g.antecedentes.trim().replace(/[.;\s]+$/, '')}.`;
  }

  const alergiasTexto = d.alergias && d.alergias.trim() && !d.alergias.toLowerCase().includes('ningun')
    ? `Refiere alergia a: ${d.alergias.trim()}.`
    : 'Niega alergias alimentarias.';

  const parrafoIntro2 = `Paciente ${orientacionTexto}, en anamnesis alimentaria refiere que su apetito ${apetitoDesc}, ${tiemposTexto}, sin complicaciones de masticación ni aversión por alimentos específicos; ${sintTexto}.${obstetricosTexto}${antecedentesTexto} ${alergiasTexto}`;

  // C. Datos de laboratorio
  const labItems = [];
  if (b.hemoglobina) labItems.push(`Hemoglobina: ${b.hemoglobina} g/dL`);
  if (b.glucosa) labItems.push(`Glucosa: ${b.glucosa} mg/dL`);
  if (b.hba1c) labItems.push(`HbA1c: ${b.hba1c} %`);
  if (b.creatinina) labItems.push(`Creatinina: ${b.creatinina} mg/dL`);
  if (b.bun) labItems.push(`BUN: ${b.bun} mg/dL`);
  if (b.urea) labItems.push(`Urea: ${b.urea} mg/dL`);
  if (c.egfr != null) labItems.push(`TFG estimada (CKD-EPI 2021): ${f1(c.egfr)} mL/min/1.73m²`);
  if (b.sodio) labItems.push(`Sodio: ${b.sodio} mEq/L`);
  if (b.potasio) labItems.push(`Potasio: ${b.potasio} mEq/L`);
  if (b.calcio) labItems.push(`Calcio: ${b.calcio} mg/dL`);
  if (c.caCorregido != null) labItems.push(`Calcio corregido: ${f1(c.caCorregido)} mg/dL`);
  if (b.fosforo) labItems.push(`Fósforo: ${b.fosforo} mg/dL`);
  if (b.magnesio) labItems.push(`Magnesio: ${b.magnesio} mg/dL`);
  if (b.albumina) labItems.push(`Albúmina: ${b.albumina} g/dL`);
  if (b.pcr) labItems.push(`PCR: ${b.pcr} mg/L`);
  if (b.colesterol) labItems.push(`Colesterol total: ${b.colesterol} mg/dL`);
  if (b.ldl) labItems.push(`LDL: ${b.ldl} mg/dL`);
  if (b.hdl) labItems.push(`HDL: ${b.hdl} mg/dL`);
  if (b.tg) labItems.push(`Triglicéridos: ${b.tg} mg/dL`);

  const datosLaboratorioTexto = labItems.length > 0
    ? labItems.join(', ') + '.'
    : 'No se cuenta con reporte de exámenes de laboratorio recientes en el expediente al momento de la nota.';

  // D. Datos Antropométricos
  const tallaM = num(a.talla) ? (num(a.talla) / 100).toFixed(2) : (a.talla || '—');
  const antroLines = [
    `Peso actual: ${a.peso ? a.peso + ' kg' : '—'}`,
    `Talla: ${tallaM} mt`,
    `IMC: ${c.imc != null ? f2(c.imc) + ' kg/m²' : '—'}`
  ];
  if (a.pesoSeco) antroLines.push(`Peso seco estimado: ${a.pesoSeco} kg${c.imcSeco != null ? ' (IMC peso seco: ' + f2(c.imcSeco) + ' kg/m²)' : ''}`);
  if (a.habitual) antroLines.push(`Peso habitual: ${a.habitual} kg${c.cambio != null ? ' (cambio: ' + fs(-c.cambio) + ' %)' : ''}`);
  if (c.pi != null) antroLines.push(`Peso ideal (Hamwi): ${f1(c.pi)} kg`);
  if (c.pAj != null && c.pAj !== num(a.peso)) antroLines.push(`Peso ajustado: ${f1(c.pAj)} kg`);
  if (a.cintura) antroLines.push(`Circunferencia de cintura: ${a.cintura} cm`);
  if (c.icc != null) antroLines.push(`Índice cintura/cadera: ${f2(c.icc)}`);
  if (a.cb) antroLines.push(`Circunferencia de brazo (CMB): ${a.cb} cm`);
  if (a.pc) antroLines.push(`Perímetro cefálico: ${a.pc} cm`);

  // E. Diagnóstico nutricional
  let diagNutri = '';
  if (isEmbarazada && c.pregnancyEval) {
    diagNutri = `${c.pregnancyEval.diagnosis} según la gráfica para evaluación nutricional de la embarazada según índice de masa corporal (MINSAL) con gestación de ${g.semGestacional || 'edad gestacional activa'} semanas; meta de ganancia ponderal recomendada de ${c.pregnancyEval.targetGain}`;
  } else if (isPediatrico && c.pediatricEval?.primaryDiagnosis) {
    diagNutri = `${c.pediatricEval.primaryDiagnosis} según las curvas de crecimiento de la Organización Mundial de la Salud (OMS 2006/2007 - MINSAL)`;
  } else if (c.imcCl) {
    diagNutri = `${c.imcCl.label} según criterios de la Organización Mundial de la Salud (OMS)`;
  } else {
    diagNutri = 'Estado nutricional en evaluación';
  }

  // Hallazgos clínicos agregados al diagnóstico
  const hallazgosDiag = [];
  if (b.hemoglobina && num(b.hemoglobina) < (isFem ? 12 : 13.5)) {
    const hbVal = num(b.hemoglobina);
    hallazgosDiag.push(hbVal < 8 ? 'anemia severa' : hbVal < 10 ? 'anemia moderada' : 'anemia leve');
  }
  if (b.glucosa && num(b.glucosa) >= 126) hallazgosDiag.push('descontrol glucémico en ayunas');
  if (b.potasio && num(b.potasio) > 5.0) hallazgosDiag.push('hiperpotasemia');
  if (b.creatinina && num(b.creatinina) > 1.3) hallazgosDiag.push('compromiso de la función renal');
  if (c.cambio != null && c.cambio >= 5) hallazgosDiag.push(`pérdida de peso significativa (${f1(c.cambio)} %)`);

  if (hallazgosDiag.length > 0) {
    diagNutri += `; con ${hallazgosDiag.join(', ')} asociada a cuadro clínico de base`;
  }
  diagNutri += '.';

  // F. Requerimientos nutricionales
  const reqKcal = c.vct != null ? f0(c.vct) : (r.kcalkg && a.peso ? f0(num(r.kcalkg) * num(a.peso)) : '—');
  const reqProt = c.macros?.p?.g != null ? f0(c.macros.p.g) : (r.gkg?.p && a.peso ? f0(num(r.gkg.p) * num(a.peso)) : '—');
  const reqLiq = c.liquidos != null ? f0(c.liquidos) : '—';

  let calDetalle = `Calóricos: ${reqKcal} kcal/día`;
  if (c.kcalkg != null) calDetalle += ` (${f1(c.kcalkg)} kcal/kg/día)`;
  if (c.geb != null) {
    calDetalle += ` [GEB: ${f0(c.geb)} kcal`;
    if (c.etaKcal) calDetalle += `, ETA: +${f0(c.etaKcal)} kcal (${c.etaPct ?? 10}%)`;
    calDetalle += ']';
  }

  const reqLines = [
    calDetalle,
    `Proteicos: ${reqProt} g/día${c.macros?.p?.gkg != null ? ' (' + f1(c.macros.p.gkg) + ' g/kg/día, ' + f1(c.macros.p.pct) + '% VCT)' : ''}`
  ];
  if (c.macros) {
    reqLines.push(`Carbohidratos: ${f0(c.macros.c.g)} g/día (${f1(c.macros.c.pct)}% VCT)`);
    reqLines.push(`Lípidos: ${f0(c.macros.l.g)} g/día (${f1(c.macros.l.pct)}% VCT)`);
  }
  if (c.liquidos != null) {
    reqLines.push(`Líquidos: ${reqLiq} mL/día`);
  }

  // G. Prescripción dietoterapéutica
  const rissName = pl.riss?.primaryDiet ? (pl.riss.primaryDiet === 'blanda' ? 'Dieta Blanda' : pl.riss.primaryDiet === 'embarazada' ? 'Dieta de la Embarazada' : pl.riss.primaryDiet === 'pediatrica' ? 'Dieta Pediátrica' : 'Dieta Hospitalaria') : 'Dieta normal / equilibrada';
  const rissSec = (pl.riss?.secondaryDiets || []).map(s => {
    const names = {
      hipocalorica: 'hipocalórica',
      baja_cho: 'baja en carbohidratos simples',
      hipoproteica: 'hipoprotéica',
      hiperproteica: 'hiperprotéica',
      hiposodica_leve: 'hiposódica leve',
      hiposodica_moderada: 'hiposódica moderada',
      hiposodica_estricta: 'hiposódica estricta',
      baja_grasa: 'baja en grasa',
      baja_potasio: 'baja en potasio',
      baja_fosforo: 'baja en fósforo',
      alta_fibra: 'alta en fibra'
    };
    return names[s] || s;
  });

  let prescripcionTexto = rissName;
  if (rissSec.length > 0) {
    prescripcionTexto += ` (${rissSec.join(', ')})`;
  }

  const sCfg = pl.snackConfig || 'both';
  if (sCfg === 'none') {
    prescripcionTexto += ' con fraccionamiento en 3 tiempos de comida principales según lineamientos hospitalarios RIISS.';
  } else if (sCfg === 'pm_only') {
    prescripcionTexto += ' con fraccionamiento en 4 tiempos de comida (Desayuno, Almuerzo, Merienda PM y Cena) según lineamientos hospitalarios RIISS.';
  } else if (sCfg === 'am_only') {
    prescripcionTexto += ' con fraccionamiento en 4 tiempos de comida (Desayuno, Merienda AM, Almuerzo y Cena) según lineamientos hospitalarios RIISS.';
  } else {
    prescripcionTexto += ' con fraccionamiento en 5 tiempos de comida según lineamientos hospitalarios RIISS.';
  }

  // H. Educación alimentaria y nutricional (Párrafos clínicos naturales como en el ejemplo)
  const eduParagraphs = [];

  // Párrafo 1: Azúcares simples y carbohidratos
  const hasDiabetes = cl.pat?.dm2 || cl.pat?.dm1 || dxTexto.toLowerCase().includes('diabet');
  if (hasDiabetes || rissSec.includes('baja en carbohidratos simples')) {
    eduParagraphs.push(
      'Evitar el consumo de azúcares simples como: refrescos, miel, mermelada, gelatina con azúcar, dulce de panela, dulces, panes dulces o paletas azucaradas.'
    );
    eduParagraphs.push(
      'Se brinda educación alimentaria y nutricional sobre la importancia de realizar los 3 tiempos de comida principales y distribuir los carbohidratos en refrigerios saludables fraccionados para favorecer el control glucémico, prevenir cetosis gestacional o hipoglucemias y mejorar la tolerancia gástrica ante síntomas digestivos.'
    );
  } else {
    eduParagraphs.push(
      'Se brinda educación alimentaria y nutricional sobre la importancia de realizar los 3 tiempos de comida principales y 2 refrigerios saludables fraccionados para asegurar un aporte energético y de nutrientes estable durante el día.'
    );
  }

  // Párrafo 2: Selección de alimentos y proteínas magras
  eduParagraphs.push(
    'Se recomienda priorizar en sus tiempos de comida el consumo de vegetales sin almidón, legumbres, frutas enteras con moderación, cereales integrales y proteínas de alto valor biológico principalmente magras como el pescado, aves sin piel, claras de huevo y lácteos bajos en grasa, moderando el consumo de carnes rojas y embutidos.'
  );

  // Párrafo 3: Selección de grasas y cocción
  eduParagraphs.push(
    'Se orienta sobre la selección de grasas saludables en cantidades moderadas como el aceite de oliva, aguacate o semillas, evitando frituras, manteca y grasas saturadas, tanto para el control metabólico como por precaución ante sobrecarga digestiva y presencia de vómitos o náuseas.'
  );

  // Párrafo 4: Hidratación
  const liqTarget = reqLiq !== '—' ? `${reqLiq} mL/día` : 'abundante';
  eduParagraphs.push(
    `En cuanto a bebidas, se recomienda priorizar el consumo de agua pura (${liqTarget}) y sueros de rehidratación oral sin azúcar si hay pérdidas, evitando estrictamente refrescos, gaseosas, jugos azucarados y bebidas endulzadas.`
  );

  // Párrafo 5: Sodio y prevención cardiovascular/renal
  const hasHTA = cl.pat?.hta || dxTexto.toLowerCase().includes('hipertens');
  const hasRenal = cl.pat?.erc || dxTexto.toLowerCase().includes('renal') || (c.egfr != null && c.egfr < 60);
  if (hasHTA || hasRenal) {
    eduParagraphs.push(
      'Se recomendó disminuir el consumo de sal, consomés, cubitos, embutidos y enlatados debido a sus antecedentes de hipertensión esencial y como medida preventiva para la protección de la función renal y el control tensional.'
    );
  }

  // Párrafo 6: Cuidados de medicamentos o técnicas especiales
  if (hasRenal && rissSec.includes('baja en potasio')) {
    eduParagraphs.push(
      'Para el control del potasio, se instruyó a la paciente/familia en la técnica de remojo prolongado y doble cocción de verduras y tubérculos (descartando el agua de primer hervor), evitando el uso de sales dietéticas formuladas con cloruro de potasio.'
    );
  }

  if (g.medList && g.medList.length > 0) {
    const medNotes = g.medList.map(m => {
      let txt = `${m.nombre}`;
      if (m.relacionComidas === 'con_comidas') txt += ' (tomar estrictamente junto con las comidas principales)';
      else if (m.relacionComidas === 'en_ayunas') txt += ' (tomar en ayunas separado de los alimentos)';
      return txt;
    }).join('; ');
    eduParagraphs.push(`Coordinación farmacológica: Sincronizar los medicamentos prescritos (${medNotes}) según los horarios de comidas establecidos para evitar interferencias en su absorción.`);
  }

  // Generar texto plano completo (para visualización, copiado o edición rápida)
  const fullRawText = [
    headerLine1,
    headerLine2,
    '',
    parrafoIntro1,
    '',
    parrafoIntro2,
    '',
    'Datos de laboratorio',
    datosLaboratorioTexto,
    '',
    'Datos Antropométricos:',
    ...antroLines,
    '',
    `Diagnóstico nutricional: ${diagNutri}`,
    '',
    'Requerimientos nutricionales:',
    ...reqLines,
    '',
    `Prescripción dietoterapéutica: ${prescripcionTexto}`,
    '',
    ...eduParagraphs
  ].join('\n');

  return {
    metadata: { servicio, cama, expediente, nombre, responsable },
    headerLine1,
    headerLine2,
    parrafoIntro1,
    parrafoIntro2,
    datosLaboratorioTexto,
    antroLines,
    diagNutri,
    reqLines,
    prescripcionTexto,
    eduParagraphs,
    fullRawText
  };
}

// Genera el documento Word (.docx) nativo con formato hospitalario limpio y sobrio
export async function generateClinicalNoteDocx(p, c, customNoteData = null) {
  const note = customNoteData || generateClinicalNoteData(p, c);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 21, // 10.5 pt
            color: '111827'
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              after: 120  // 6 pt after
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch = 2.54 cm
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: [
          // A. Encabezado institucional
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: note.headerLine1,
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: note.headerLine2,
                bold: true,
                size: 22
              })
            ]
          }),

          // B. Información clínica y evaluación nutricional
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: note.parrafoIntro1 })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({ text: note.parrafoIntro2 })
            ]
          }),

          // C. Datos de laboratorio
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Datos de laboratorio', bold: true, size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { after: 180 },
            children: [
              new TextRun({ text: note.datosLaboratorioTexto })
            ]
          }),

          // D. Datos Antropométricos
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Datos Antropométricos:', bold: true, size: 22 })
            ]
          }),
          ...note.antroLines.map(line => new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: line })
            ]
          })),

          // E. Diagnóstico nutricional
          new Paragraph({
            spacing: { before: 120, after: 180 },
            children: [
              new TextRun({ text: 'Diagnóstico nutricional: ', bold: true }),
              new TextRun({ text: note.diagNutri })
            ]
          }),

          // F. Requerimientos nutricionales
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Requerimientos nutricionales:', bold: true, size: 22 })
            ]
          }),
          ...note.reqLines.map(line => new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: line })
            ]
          })),

          // G. Prescripción dietoterapéutica
          new Paragraph({
            spacing: { before: 120, after: 180 },
            children: [
              new TextRun({ text: 'Prescripción dietoterapéutica: ', bold: true }),
              new TextRun({ text: note.prescripcionTexto })
            ]
          }),

          // H. Educación alimentaria y nutricional
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'Educación alimentaria y nutricional:', bold: true, size: 22 })
            ]
          }),
          ...note.eduParagraphs.map(pText => new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({ text: pText })
            ]
          }))
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

// Descarga directa del archivo .docx
export async function downloadClinicalNoteDocx(p, c, customNoteData = null) {
  const blob = await generateClinicalNoteDocx(p, c, customNoteData);
  const patientName = (p.gen?.nombre || 'Paciente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ ]/g, '').replace(/\s+/g, '_');
  const dateStr = p.gen?.fecha || new Date().toISOString().slice(0, 10);
  const filename = `Nota_Nutricional_${patientName}_${dateStr}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
