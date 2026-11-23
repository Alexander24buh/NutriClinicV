import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MEAL_TIMES } from '../data/exchangeDatabase.js';
import { RISS_DIETS } from '../data/rissDatabase.js';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);
const fs = n => n == null ? '—' : (n > 0.049 ? '+' : n < -0.049 ? '-' : '') + Math.abs(n).toFixed(1);

// Limpia cualquier símbolo extraño o etiqueta para que jsPDF renderice texto 100% limpio
const cleanStr = (s) => {
  if (s === null || s === undefined || s === '') return '—';
  return String(s)
    .replace(/<[^>]*>/g, '')
    .replace(/−/g, '-')
    .replace(/·/g, '|')
    .replace(/✓/g, '[OK]')
    .replace(/↑/g, '[Alto]')
    .replace(/↓/g, '[Bajo]')
    .trim() || '—';
};

export function exportClinicalReportPDF({ p, c, SINT, PATOL, RECALL, FORMULAS, pesText }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  const brandColor = [11, 98, 119]; // #0b6277
  const inkColor = [16, 39, 45];    // #10272d
  const mutedColor = [83, 104, 110]; // #53686e
  const softBg = [238, 243, 244];

  const checkPageBreak = (neededHeight = 25) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 16;
    }
  };

  const addSectionHeader = (title) => {
    checkPageBreak(16);
    y += 3;
    doc.setFillColor(...softBg);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...brandColor);
    doc.text(title.toUpperCase(), margin + 3, y + 4.8);
    y += 10;
  };

  // ==== ENCABEZADO DEL DOCUMENTO ====
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('NutriClínica', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('FICHA CLÍNICA DE VALORACIÓN Y PLAN NUTRICIONAL', margin, 17);

  const g = p.gen || {};
  const fechaTexto = `Fecha: ${g.fecha || '—'}`;
  const expTexto = `Expediente: ${g.expediente || 'S/N'}`;
  doc.setFontSize(9);
  doc.text(fechaTexto, pageWidth - margin, 11, { align: 'right' });
  doc.text(expTexto, pageWidth - margin, 17, { align: 'right' });

  y = 33;

  // ==== 1. IDENTIFICACIÓN DEL PACIENTE ====
  addSectionHeader('1. Identificación y Datos Clínicos Generales');

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: inkColor,
      lineColor: [211, 224, 226],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [243, 247, 248],
      textColor: mutedColor,
      fontStyle: 'bold'
    },
    body: [
      [
        { content: 'Paciente:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: cleanStr(g.nombre), colSpan: 3 },
        { content: 'Edad / Sexo:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: `${g.edad ? g.edad + ' años' : '—'} / ${g.sexo === 'M' ? 'Masculino' : g.sexo === 'F' ? 'Femenino' : '—'}` }
      ],
      [
        { content: 'Diagnóstico médico:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: cleanStr(g.dx), colSpan: 5 }
      ],
      [
        { content: 'Motivo de consulta:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: cleanStr(g.motivo), colSpan: 5 }
      ],
      [
        { content: 'Medicamentos / Supl.:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: cleanStr(g.meds), colSpan: 2 },
        { content: 'Antecedentes:', styles: { fontStyle: 'bold', fillColor: [248, 250, 251] } },
        { content: cleanStr(g.antecedentes), colSpan: 2 }
      ]
    ]
  });
  y = doc.lastAutoTable.finalY + 3;

  // Subtabla estructurada de Fármacos / Suplementos y Horarios
  const medList = Array.isArray(g.medList) ? g.medList : [];
  if (medList.length > 0) {
    const medTableRows = medList.map(m => {
      const relLabel = m.relacionComidas === 'con_comidas' ? 'Con comidas' : m.relacionComidas === 'en_ayunas' ? 'En ayunas' : m.relacionComidas === 'separado_comidas' ? 'Separado comidas' : 'Indiferente';
      const tiemposText = (m.tiemposComida || []).map(tk => {
        const mt = MEAL_TIMES.find(o => o.k === tk);
        return mt ? mt.n.split(' ')[0] : tk;
      }).join(', ') || '—';
      return [
        cleanStr(m.nombre),
        cleanStr(m.categoria),
        cleanStr(m.dosisFrecuencia),
        cleanStr(relLabel),
        cleanStr(tiemposText),
        cleanStr(m.observacion || '—')
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.6, textColor: inkColor, lineColor: [211, 224, 226] },
      headStyles: { fillColor: [83, 104, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Medicamento / Suplemento', 'Categoría', 'Dosis / Frecuencia', 'Toma c/ alimentos', 'Tiempos', 'Observaciones']],
      body: medTableRows
    });
    y = doc.lastAutoTable.finalY + 3;
  }

  // Alertas / Sinergias Fármaco–Alimento si existen
  const drugAlerts = (c.medAlerts?.alerts || []).slice(0, 3);
  if (drugAlerts.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'plain',
      styles: { fontSize: 7.2, cellPadding: 1.8, textColor: inkColor },
      body: [
        [
          {
            content: `ALERTAS Y SINERGIAS FÁRMACO–ALIMENTO:\n` +
              drugAlerts.map(a => `• [${a.med}] ${a.titulo}: ${a.accion}`).join('\n'),
            styles: { fillColor: [254, 249, 195], textColor: [113, 63, 18] }
          }
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 2. ANTROPOMETRÍA ====
  addSectionHeader('2. A. Valoración Antropométrica');

  const imcText = c.imc != null ? `${f1(c.imc)} kg/m² ${c.imcCl ? '(' + c.imcCl.label + ')' : ''}` : '—';
  const cambioText = c.cambio != null ? `${fs(-c.cambio)}% en ${c.per.l.toLowerCase()} ${c.cambioCl ? '(' + c.cambioCl.label + ')' : ''}` : '—';
  const piText = c.pi ? `${f1(c.pi)} kg (${f0(c.pctPI)}% del ideal)` : '—';
  const cintText = c.cintura != null ? `${f1(c.cintura)} cm ${c.cinturaCl ? '(' + c.cinturaCl.label + ')' : ''}` : '—';

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: inkColor, lineColor: [211, 224, 226] },
    head: [['Indicador', 'Valor', 'Indicador', 'Valor']],
    headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    body: [
      ['Peso actual / Talla', `${p.antro.peso || '—'} kg / ${p.antro.talla || '—'} cm`, 'Peso habitual', `${p.antro.habitual || '—'} kg`],
      ['IMC', cleanStr(imcText), 'Cambio de peso', cleanStr(cambioText)],
      ['Peso ideal (Hamwi)', cleanStr(piText), 'Peso ajustado', c.pAj ? `${f1(c.pAj)} kg` : '—'],
      ['Circunf. Cintura', cleanStr(cintText), 'Índice Cintura/Cadera', c.icc != null ? `${f2(c.icc)} ${c.iccCl ? '(' + c.iccCl.label + ')' : ''}` : '—'],
      ['CMB / AMB', c.cmb != null ? `${f1(c.cmb)} cm / ${f1(c.amb)} cm²` : '—', 'AMB corregida (Heymsfield)', c.ambc != null ? `${f1(c.ambc)} cm²` : '—'],
      ['Grasa corporal (4 pliegues)', c.gc != null ? `${f1(c.gc)}% (${f1(c.mg)} kg)` : '—', 'Masa libre de grasa', c.mlg != null ? `${f1(c.mlg)} kg` : '—']
    ]
  });
  y = doc.lastAutoTable.finalY + 3;

  // Cuadro específico para Embarazo o Pediatría según modelo activo
  if (c.isEmbarazada && c.pregnancyEval) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2, textColor: inkColor },
      body: [
        [
          {
            content: `EVALUACIÓN NUTRICIONAL GESTACIONAL (Curvas Atalah / MINSAL El Salvador):\n` +
              `• Semana gestacional: ${c.pregnancyEval.week} semanas  |  IMC actual: ${f1(c.pregnancyEval.imc)} kg/m²\n` +
              `• Diagnóstico antropométrico: ${c.pregnancyEval.diagnosis}\n` +
              `• Meta de ganancia ponderal (IOM / MINSAL): ${c.pregnancyEval.targetGain} (${c.pregnancyEval.weeklyGainRate})` +
              (p.gen.pesoPregestacional ? `  |  Peso pregestacional: ${p.gen.pesoPregestacional} kg` : ''),
            styles: { fillColor: [240, 249, 255], textColor: [12, 74, 96] }
          }
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 3;
  } else if (c.isPediatrico && c.pediatricEval && c.pediatricEval.primaryDiagnosis) {
    const inds = c.pediatricEval.indicators || {};
    const indLines = Object.values(inds).map(ind => `• ${ind.name}: ${ind.value} -> ${ind.diag}`).join('\n');
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2, textColor: inkColor },
      body: [
        [
          {
            content: `EVALUACIÓN DE CRECIMIENTO INFANTIL Y ADOLESCENTE (Patrones OMS 2006 / 2007 - MINSAL):\n` +
              `• Diagnóstico antropométrico primario: ${c.pediatricEval.primaryDiagnosis}\n` +
              (indLines ? `${indLines}\n` : '') +
              (p.antro.pc ? `• Perímetro cefálico: ${p.antro.pc} cm  ` : '') +
              (p.gen.edadMeses ? `• Edad en meses: ${p.gen.edadMeses} m` : ''),
            styles: { fillColor: [254, 252, 232], textColor: [113, 63, 18] }
          }
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 3;
  }

  // ==== 3. BIOQUÍMICA ====
  const bs = (c.bio || []).filter(b => b.v != null);
  if (bs.length > 0 || c.egfr != null || c.caCorregido != null) {
    addSectionHeader('3. B. Parámetros Bioquímicos y Función Renal');

    const extraBioRows = [];
    if (c.egfr != null) {
      extraBioRows.push(['TFG Estimada (CKD-EPI 2021)', f1(c.egfr), 'mL/min/1.73m²', '≥ 90', cleanStr(c.egfrStage)]);
    }
    if (c.caCorregido != null) {
      extraBioRows.push(['Calcio corregido por albúmina', f1(c.caCorregido), 'mg/dL', '8.5 – 10.2', cleanStr(c.caCorregidoFlag?.label)]);
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2, textColor: inkColor },
      headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Parámetro de Laboratorio', 'Resultado', 'Unidad', 'Referencia', 'Interpretación Clínica']],
      body: [
        ...extraBioRows,
        ...bs.map(b => [
          b.n,
          String(b.v),
          b.u,
          cleanStr(b.ref),
          cleanStr(`${b.flag?.dir || ''} ${b.flag?.label || ''}`)
        ])
      ]
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 4. CLÍNICA Y DIETÉTICA ====
  addSectionHeader('4. C y D. Evaluación Clínica, Tamizaje y Dietética');
  const labList = (map, list) => list.filter(x => map && map[x[0]]).map(x => x[1]);
  const sintTxt = labList(p.clin?.sint, SINT).join(', ') || 'Ninguno referido';
  const patTxt = labList(p.clin?.pat, PATOL).join(', ') || 'Ninguna registrada';
  const efTxt = `Masa muscular: ${p.clin?.musculo || 'normal'} | Grasa subcutánea: ${p.clin?.grasa || 'normal'} | Edema: ${p.clin?.edema === 'no' ? 'ausente' : p.clin?.edema} | Ascitis: ${p.clin?.ascitis === 'si' ? 'presente' : 'ausente'}`;

  const recallItems = RECALL
    .filter(([k]) => p.dieta?.rec?.[k] && (p.dieta.rec[k].txt || p.dieta.rec[k].hora))
    .map(([k, n]) => `${n}${p.dieta.rec[k].hora ? ' (' + p.dieta.rec[k].hora + ')' : ''}: ${p.dieta.rec[k].txt}`);

  const clinBody = [
    [{ content: 'Síntomas digestivos:', styles: { fontStyle: 'bold', width: 42 } }, cleanStr(sintTxt)],
    [{ content: 'Patologías coexistentes:', styles: { fontStyle: 'bold' } }, cleanStr(patTxt)],
    [{ content: 'Exploración física:', styles: { fontStyle: 'bold' } }, cleanStr(efTxt)],
    [{ content: 'Tamizaje (ASPEN/AND):', styles: { fontStyle: 'bold' } }, `${c.tamizaje?.n || 0} de 6 criterios. ${cleanStr(c.tamizaje?.msg)}`],
  ];

  if (c.refeeding?.isRisk) {
    clinBody.push([
      { content: 'ALERTA REALIMENTACIÓN:', styles: { fontStyle: 'bold', textColor: [172, 46, 40] } },
      { content: cleanStr(`Riesgo detectado (${c.refeeding.reasons.join('; ')}). Iniciar con 10-15 kcal/kg/día y vigilar P, K, Mg.`), styles: { textColor: [172, 46, 40] } }
    ]);
  }

  if (recallItems.length > 0) {
    clinBody.push([{ content: 'Recordatorio 24h:', styles: { fontStyle: 'bold' } }, cleanStr(recallItems.join('\n'))]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8.2, cellPadding: 2, textColor: inkColor, lineColor: [211, 224, 226] },
    columnStyles: { 0: { cellWidth: 42, fillColor: [248, 250, 251] } },
    body: clinBody
  });
  y = doc.lastAutoTable.finalY + 4;

  // ==== 5. DIAGNÓSTICO NUTRICIONAL (PES) ====
  if (p.pes?.items?.length > 0) {
    addSectionHeader('5. Diagnóstico Nutricional (Formato PES)');
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: inkColor, lineColor: [211, 224, 226] },
      headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['#', 'Enunciado Diagnóstico (Problema — Etiología — Signos y Síntomas)']],
      columnStyles: { 0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' } },
      body: p.pes.items.map((it, idx) => [String(idx + 1), cleanStr(pesText(it))])
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 6. DIAGNÓSTICO Y CLASIFICACIÓN DE DIETA SEGÚN RISS (MINSAL) ====
  const rissData = p.plan?.riss;
  if (rissData) {
    addSectionHeader('6. Diagnóstico y Clasificación de Dieta según RISS (MINSAL)');
    const primObj = RISS_DIETS.find(d => d.id === (rissData.primaryDiet || 'normal')) || RISS_DIETS[0];
    const secObjs = (rissData.secondaryDiets || []).map(id => RISS_DIETS.find(d => d.id === id)).filter(Boolean);
    const prescrTitle = [primObj.name, ...secObjs.map(s => s.name)].join(' + ');
    const activeDiets = [primObj, ...secObjs];
    const allowedSummary = activeDiets.flatMap(d => d.allowed).slice(0, 4).join('; ');
    const forbiddenSummary = activeDiets.flatMap(d => d.forbidden).slice(0, 4).join('; ');

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8.2, cellPadding: 2.2, textColor: inkColor, lineColor: [211, 224, 226] },
      columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold', fillColor: [248, 250, 251] } },
      body: [
        [
          { content: 'Dieta RISS Prescrita:', styles: { fontStyle: 'bold' } },
          { content: cleanStr(prescrTitle), styles: { fontStyle: 'bold', textColor: brandColor } }
        ],
        [
          { content: 'Justificación Clínica:', styles: { fontStyle: 'bold' } },
          cleanStr(rissData.justificacion || primObj.description)
        ],
        [
          { content: 'Alimentos Permitidos:', styles: { fontStyle: 'bold', textColor: [16, 120, 70] } },
          cleanStr(allowedSummary || 'Alimentos según requerimiento individual')
        ],
        [
          { content: 'Restricciones RISS:', styles: { fontStyle: 'bold', textColor: [180, 40, 40] } },
          cleanStr(forbiddenSummary || 'Sin restricciones severas adicionales')
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 7. REQUERIMIENTOS ENERGÉTICOS Y MACRONUTRIENTES ====
  addSectionHeader('7. Prescripción Calórica y Distribución de Macronutrientes');
  const F = FORMULAS.find(x => x.k === p.req.formula) || FORMULAS[0];
  const m = c.macros;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: inkColor, lineColor: [211, 224, 226] },
    headStyles: { fillColor: [243, 247, 248], textColor: inkColor, fontStyle: 'bold' },
    body: [
      [
        { content: 'Fórmula:', styles: { fontStyle: 'bold' } },
        cleanStr(F.n),
        { content: 'Peso de cálculo:', styles: { fontStyle: 'bold' } },
        c.wCalc != null ? `${f1(c.wCalc)} kg` : '—',
        { content: 'VCT Prescrito:', styles: { fontStyle: 'bold' } },
        { content: `${f0(c.vct)} kcal/día`, styles: { fontStyle: 'bold', textColor: brandColor } }
      ]
    ]
  });
  y = doc.lastAutoTable.finalY + 2;

  if (m) {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 2, textColor: inkColor },
      headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['Macronutriente', 'Gramos / día', 'Calorías (kcal)', '% del VCT', 'g / kg de peso']],
      body: [
        ['Carbohidratos (CHO)', `${f1(m.c.g)} g`, `${f0(m.c.kcal)} kcal`, `${f1(m.c.pct)} %`, `${f2(m.c.gkg)} g/kg`],
        ['Proteínas (CHON)', `${f1(m.p.g)} g`, `${f0(m.p.kcal)} kcal`, `${f1(m.p.pct)} %`, `${f2(m.p.gkg)} g/kg`],
        ['Grasas / Lípidos (COOH)', `${f1(m.l.g)} g`, `${f0(m.l.kcal)} kcal`, `${f1(m.l.pct)} %`, `${f2(m.l.gkg)} g/kg`],
        [
          { content: 'TOTAL', styles: { fontStyle: 'bold' } },
          { content: `${f1(m.c.g + m.p.g + m.l.g)} g`, styles: { fontStyle: 'bold' } },
          { content: `${f0(m.totalKcal)} kcal`, styles: { fontStyle: 'bold' } },
          { content: `${f1(m.totalPct)} %`, styles: { fontStyle: 'bold' } },
          { content: `Fibra: ${f0(c.fibra)} g | Agua: ${c.liquidos ? f0(c.liquidos) + ' mL' : '—'}`, styles: { fontStyle: 'bold' } }
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 8. PLAN DE INTERCAMBIOS Y DISTRIBUCIÓN POR TIEMPOS DE COMIDA ====
  const T = c.plan;
  if (T && T.tot && T.tot.eq > 0) {
    addSectionHeader('8. Distribución de Intercambios por Tiempo de Comida');

    const activeRows = T.rows.filter(r => r.tot > 0);
    const baseVct = c.vct > 0 ? c.vct : (T.tot.kcal || 1);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 1.8, textColor: inkColor, lineColor: [211, 224, 226] },
      headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right', fontStyle: 'bold' },
        7: { halign: 'right' }
      },
      head: [[
        'Grupo de Alimento',
        ...MEAL_TIMES.map(mt => mt.n),
        'Total Int.',
        'Kcal'
      ]],
      body: [
        ...activeRows.map(r => [
          r.g.n,
          ...r.eq.map(val => val > 0 ? String(val) : '—'),
          String(r.tot),
          `${f0(r.kcal)}`
        ]),
        [
          { content: 'Aporte por tiempo (kcal)', styles: { fontStyle: 'bold', fillColor: [243, 247, 248] } },
          ...T.meal.map(ml => ({ content: `${f0(ml.kcal)} kcal`, styles: { fontStyle: 'bold', fillColor: [243, 247, 248] } })),
          { content: `${f1(T.tot.eq)}`, styles: { fontStyle: 'bold', fillColor: [243, 247, 248] } },
          { content: `${f0(T.tot.kcal)} kcal`, styles: { fontStyle: 'bold', fillColor: [243, 247, 248] } }
        ],
        [
          { content: '% Distribución calórica', styles: { fontStyle: 'bold', textColor: brandColor } },
          ...T.meal.map(ml => ({
            content: `${f1((ml.kcal / baseVct) * 100)} %`,
            styles: { fontStyle: 'bold', textColor: brandColor }
          })),
          { content: '100 %', styles: { fontStyle: 'bold' } },
          { content: `P:${f0(T.tot.P)}g C:${f0(T.tot.C)}g G:${f0(T.tot.L)}g`, styles: { fontSize: 7 } }
        ]
      ]
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ==== 9. MENÚ EN 5 TIEMPOS DE COMIDA Y RECOMENDACIONES ====
  const hasMenu = MEAL_TIMES.some(mt => p.plan?.menu?.[mt.k]);
  if (hasMenu || p.plan?.objetivos || p.plan?.recs) {
    addSectionHeader('9. Menú en 5 Tiempos de Comida y Recomendaciones');

    if (p.plan?.objetivos) {
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 2.2, textColor: inkColor },
        body: [[{ content: 'Objetivos del Plan:', styles: { fontStyle: 'bold', width: 38, fillColor: [248, 250, 251] } }, cleanStr(p.plan.objetivos)]]
      });
      y = doc.lastAutoTable.finalY + 3;
    }

    if (hasMenu) {
      const costLevelMap = {
        economico: 'Económico ($)',
        regular: 'Regular ($$)',
        costoso: 'Más costoso ($$$)'
      };
      const activeCostStr = costLevelMap[p.plan?.costLevel] || 'Regular ($$)';

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { fontSize: 8.2, cellPadding: 2.2, textColor: inkColor, lineColor: [211, 224, 226] },
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold', fillColor: [248, 250, 251] } },
        head: [[`Tiempo de Comida (${activeCostStr})`, 'Plato Típico Salvadoreño Adaptado (Porciones e Intercambios)']],
        body: MEAL_TIMES
          .filter(mt => p.plan?.menu?.[mt.k])
          .map(mt => [mt.n, cleanStr(p.plan.menu[mt.k])])
      });
      y = doc.lastAutoTable.finalY + 3;
    }

    if (p.plan?.recs) {
      const recsList = p.plan.recs.split('\n').filter(Boolean).map(r => `• ${cleanStr(r)}`).join('\n');
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        theme: 'grid',
        styles: { fontSize: 8.2, cellPadding: 2.5, textColor: inkColor },
        headStyles: { fillColor: [243, 247, 248], textColor: brandColor, fontStyle: 'bold' },
        head: [['Recomendaciones Nutricionales Personalizadas']],
        body: [[recsList]]
      });
      y = doc.lastAutoTable.finalY + 3;
    }
  }

  // ==== 9. SEGUIMIENTO Y FIRMA ====
  checkPageBreak(35);
  y += 14;
  doc.setDrawColor(160, 175, 180);
  doc.setLineWidth(0.3);
  doc.line(margin + 10, y, margin + 80, y);
  doc.line(pageWidth - margin - 80, y, pageWidth - margin - 10, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedColor);
  doc.text('Nutricionista Clínico', margin + 45, y + 5, { align: 'center' });
  doc.text('Firma y Sello Profesional', pageWidth - margin - 45, y + 5, { align: 'center' });

  if (p.plan?.proxima) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...brandColor);
    doc.text(`Próxima cita programada: ${p.plan.proxima}`, pageWidth / 2, y + 12, { align: 'center' });
  }

  // Numeración de páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedColor);
    doc.text(
      `NutriClínica v2.0 · Reporte Clínico Confidencial · Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  const safeName = (g.nombre || 'Paciente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Reporte_NutriClinica_${safeName}_${g.fecha || 'consulta'}.pdf`);
}
