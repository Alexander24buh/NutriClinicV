// Generador y Exportador de Menús de 7 Días a Google Docs (.docx)
// Diseñado para compatibilidad nativa con Google Docs y Microsoft Word
// Incluye Encabezado Clínico, Tabla de Intercambios, Menú Semanal con Medidas Caseras,
// Guía de Sustitución Rápida y Lista de Compras Semanal Consolidada.

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  HeightRule
} from 'docx';
import { MEAL_TIMES, EXCHANGE_GROUPS } from '../data/exchangeDatabase.js';
import { DAYS_OF_WEEK } from '../data/salvadoranDishes.js';
import { calculateWeeklyGroceryList, getQuickSubstitutionGuide } from '../data/salvadoranMenuEngine.js';

const BRAND_COLOR = '0D9488'; // Teal médico profesional
const BRAND_DARK = '115E59';
const GRAY_BG = 'F8FAFC';
const GRAY_BORDER = 'E2E8F0';
const TEXT_MUTED = '64748B';

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
  left: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER },
  right: { style: BorderStyle.SINGLE, size: 1, color: GRAY_BORDER }
};

const cellMargins = { top: 120, bottom: 120, left: 160, right: 160 };

export async function generateSalvadoranMenuDocx(patient = {}, computed = {}, weeklyPlan = {}) {
  const g = patient.gen || {};
  const pl = patient.plan || {};
  const req = patient.req || {};
  const riss = pl.riss || {};

  const nombre = g.nombre || 'Paciente';
  const edad = g.edad ? `${g.edad} años` : (g.edadMeses ? `${g.edadMeses} meses` : 'No especificada');
  const sexo = g.sexo === 'M' ? 'Masculino' : g.sexo === 'F' ? 'Femenino' : '—';
  const expediente = g.expediente || 'S/N';
  const fecha = g.fecha || new Date().toISOString().slice(0, 10);
  const responsable = g.responsable || 'Lic. en Nutrición Clínica';
  const dx = g.dx || 'Atención Nutricional Integral';

  // Metas nutricionales
  const vct = computed.get || computed.vctMeta || (req.kcalkg ? Math.round(Number(req.kcalkg) * (computed.wCalc || 60)) : 1800);
  const macros = computed.m || {
    p: { pct: 18, g: Math.round(vct * 0.18 / 4) },
    c: { pct: 54, g: Math.round(vct * 0.54 / 4) },
    l: { pct: 28, g: Math.round(vct * 0.28 / 9) }
  };

  // 1. Encabezado Clínico Institucional
  const headerSection = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: 'NUTRICLÍNICA / EGONUTRIV · ATENCIÓN NUTRICIONAL', bold: true, size: 18, color: BRAND_DARK })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'PLAN DE ALIMENTACIÓN Y MENÚ SALVADOREÑO DE 7 DÍAS', bold: true, size: 30, color: BRAND_COLOR })
      ]
    }),
    new Paragraph({
      spacing: { after: 180 },
      children: [
        new TextRun({ text: 'Paciente: ', bold: true, size: 22 }),
        new TextRun({ text: `${nombre}    `, size: 22 }),
        new TextRun({ text: 'Edad: ', bold: true, size: 22 }),
        new TextRun({ text: `${edad}    `, size: 22 }),
        new TextRun({ text: 'Sexo: ', bold: true, size: 22 }),
        new TextRun({ text: `${sexo}    `, size: 22 }),
        new TextRun({ text: 'Expediente: ', bold: true, size: 22 }),
        new TextRun({ text: `${expediente}\n`, size: 22 }),
        new TextRun({ text: 'Diagnóstico / Condición: ', bold: true, size: 20 }),
        new TextRun({ text: `${dx}    `, size: 20 }),
        new TextRun({ text: 'Fecha: ', bold: true, size: 20 }),
        new TextRun({ text: `${fecha}\n`, size: 20 }),
        new TextRun({ text: 'Prescripción Dietoterapéutica: ', bold: true, size: 20, color: BRAND_DARK }),
        new TextRun({
          text: `${vct} kcal/día · Proteínas: ${macros.p.pct}% (${macros.p.g} g) · Carbohidratos: ${macros.c.pct}% (${macros.c.g} g) · Lípidos: ${macros.l.pct}% (${macros.l.g} g)`,
          bold: true,
          size: 20
        }),
        new TextRun({ text: `\nProfesional a cargo: ${responsable}`, italics: true, size: 18, color: TEXT_MUTED })
      ]
    })
  ];

  // 2. Tabla de Intercambios por Tiempo de Comida
  const eqMap = pl.eq || {};
  const activeMealTimes = MEAL_TIMES.filter(mt => {
    if (mt.k === 'c1' && (pl.snackConfig === 'pm_only' || pl.snackConfig === 'none')) return false;
    if (mt.k === 'c2' && (pl.snackConfig === 'am_only' || pl.snackConfig === 'none')) return false;
    return true;
  });

  const exchangeTableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: { fill: BRAND_COLOR },
          margins: cellMargins,
          children: [new Paragraph({ children: [new TextRun({ text: 'Grupo de Alimento', bold: true, color: 'FFFFFF', size: 18 })] })]
        }),
        ...activeMealTimes.map(mt => new TableCell({
          width: { size: 70 / activeMealTimes.length, type: WidthType.PERCENTAGE },
          shading: { fill: BRAND_COLOR },
          margins: cellMargins,
          alignment: AlignmentType.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: mt.n, bold: true, color: 'FFFFFF', size: 18 })] })]
        }))
      ]
    }),
    ...EXCHANGE_GROUPS.map((gItem, rIdx) => {
      const rowVals = (eqMap[gItem.k] || ['', '', '', '', '']);
      const totalInRow = rowVals.reduce((acc, v) => acc + (parseFloat(String(v).replace(',', '.')) || 0), 0);
      if (totalInRow === 0) return null;

      return new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            shading: { fill: rIdx % 2 === 0 ? GRAY_BG : 'FFFFFF' },
            borders: cellBorder,
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: gItem.n, bold: true, size: 18 })] })]
          }),
          ...activeMealTimes.map((mt, mIdx) => {
            const originalMIdx = MEAL_TIMES.findIndex(x => x.k === mt.k);
            const val = (eqMap[gItem.k] || [])[originalMIdx] || '';
            return new TableCell({
              width: { size: 70 / activeMealTimes.length, type: WidthType.PERCENTAGE },
              shading: { fill: rIdx % 2 === 0 ? GRAY_BG : 'FFFFFF' },
              borders: cellBorder,
              margins: cellMargins,
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: val ? String(val) : '—', size: 18 })] })]
            });
          })
        ]
      });
    }).filter(Boolean)
  ];

  const exchangeTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: exchangeTableRows
  });

  // 3. Menú Semanal de 7 Días (Lunes a Domingo)
  const menuDaysSections = [];

  DAYS_OF_WEEK.forEach(dayInfo => {
    const dayData = weeklyPlan[dayInfo.key] || { dayName: dayInfo.name, meals: {} };

    menuDaysSections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({ text: `📅 ${dayInfo.name.toUpperCase()}`, bold: true, size: 24, color: BRAND_DARK })
        ]
      })
    );

    const dayMealRows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            shading: { fill: '0F766E' },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: 'Tiempo de Comida', bold: true, color: 'FFFFFF', size: 18 })] })]
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            shading: { fill: '0F766E' },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: 'Platillo Típico Salvadoreño', bold: true, color: 'FFFFFF', size: 18 })] })]
          }),
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { fill: '0F766E' },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: 'Ingredientes Medidos (Medida Casera)', bold: true, color: 'FFFFFF', size: 18 })] })]
          })
        ]
      }),
      ...activeMealTimes.map((mt, idx) => {
        const meal = dayData.meals[mt.k];
        if (!meal) return null;

        const ingLines = (meal.ingredients || []).map(
          ing => `• ${ing.name}: ${ing.measure}`
        );

        const prepText = meal.prepNotes ? `\nPreparación: ${meal.prepNotes}` : '';
        const renalText = meal.clinicalNotes ? `\nAviso clínico: ${meal.clinicalNotes}` : '';

        return new TableRow({
          children: [
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              shading: { fill: idx % 2 === 0 ? GRAY_BG : 'FFFFFF' },
              borders: cellBorder,
              margins: cellMargins,
              children: [
                new Paragraph({ children: [new TextRun({ text: mt.n, bold: true, size: 18, color: BRAND_DARK })] }),
                new Paragraph({ children: [new TextRun({ text: `${Math.round(meal.totals?.kcal || 0)} kcal`, size: 16, color: TEXT_MUTED })] })
              ]
            }),
            new TableCell({
              width: { size: 33, type: WidthType.PERCENTAGE },
              shading: { fill: idx % 2 === 0 ? GRAY_BG : 'FFFFFF' },
              borders: cellBorder,
              margins: cellMargins,
              children: [
                new Paragraph({ children: [new TextRun({ text: meal.dishName || 'Platillo balanceado', bold: true, size: 18 })] }),
                new Paragraph({ children: [new TextRun({ text: meal.description || '', size: 16, italics: true, color: TEXT_MUTED })] }),
                prepText ? new Paragraph({ children: [new TextRun({ text: prepText, size: 15, color: '0369A1' })] }) : new Paragraph({ text: '' }),
                renalText ? new Paragraph({ children: [new TextRun({ text: renalText, size: 15, color: 'B45309' })] }) : new Paragraph({ text: '' })
              ]
            }),
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              shading: { fill: idx % 2 === 0 ? GRAY_BG : 'FFFFFF' },
              borders: cellBorder,
              margins: cellMargins,
              children: ingLines.map(line => new Paragraph({
                spacing: { after: 20 },
                children: [new TextRun({ text: line, size: 17 })]
              }))
            })
          ]
        });
      }).filter(Boolean)
    ];

    menuDaysSections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: dayMealRows
      })
    );
  });

  // 4. Guía de Sustitución Rápida / Equivalencias
  const subGuide = getQuickSubstitutionGuide();
  const subGuideParagraphs = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 120 },
      children: [
        new TextRun({ text: 'GUÍA PRÁCTICA DE EQUIVALENCIAS Y SUSTITUCIÓN EN CASA', bold: true, size: 24, color: BRAND_DARK })
      ]
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: 'Si no tiene disponible alguno de los alimentos del menú, puede sustituirlo por cualquier otra opción del mismo grupo respetando su medida exacta:',
          italics: true,
          size: 18
        })
      ]
    }),
    ...subGuide.map(item => new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `• ${item.group}: `, bold: true, size: 18, color: BRAND_COLOR }),
        new TextRun({ text: item.examples, size: 18 })
      ]
    }))
  ];

  // 5. Lista de Compras Semanal Consolidada
  const groceryList = calculateWeeklyGroceryList(weeklyPlan);
  const groceryParagraphs = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 120 },
      children: [
        new TextRun({ text: '🛒 LISTA DE COMPRAS SEMANAL (CONSOLIDADA DE 7 DÍAS)', bold: true, size: 24, color: BRAND_DARK })
      ]
    }),
    ...Object.values(groceryList).map(cat => [
      new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [
          new TextRun({ text: `■ ${cat.title}:`, bold: true, size: 20, color: '0F766E' })
        ]
      }),
      ...cat.items.map(item => new Paragraph({
        spacing: { after: 30 },
        children: [
          new TextRun({ text: `   [  ] ${item.name} `, bold: true, size: 17 }),
          new TextRun({ text: `— ${item.summary}`, size: 16, color: TEXT_MUTED })
        ]
      }))
    ]).flat()
  ];

  // Construcción del Documento Completo
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 }
          }
        },
        children: [
          ...headerSection,
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 160, after: 100 },
            children: [
              new TextRun({ text: 'DISTRIBUCIÓN DE INTERCAMBIOS POR TIEMPO DE COMIDA', bold: true, size: 22, color: BRAND_DARK })
            ]
          }),
          exchangeTable,
          ...menuDaysSections,
          ...subGuideParagraphs,
          ...groceryParagraphs,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 100 },
            children: [
              new TextRun({
                text: '— Documento editable generado con NutriClínica · Compatible con Google Docs y MS Word —',
                italics: true,
                size: 16,
                color: TEXT_MUTED
              })
            ]
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

// Descarga directa en el navegador
export async function downloadSalvadoranMenuDocx(patient = {}, computed = {}, weeklyPlan = {}) {
  const blob = await generateSalvadoranMenuDocx(patient, computed, weeklyPlan);
  const patientName = (patient.gen?.nombre || 'Paciente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ ]/g, '').replace(/\s+/g, '_');
  const dateStr = patient.gen?.fecha || new Date().toISOString().slice(0, 10);
  const filename = `Menu_Semanal_7Dias_${patientName}_${dateStr}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
