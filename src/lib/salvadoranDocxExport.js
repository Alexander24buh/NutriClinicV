// Generador y Exportador de Menús de 7 Días a Google Docs (.docx)
// Formato idéntico al documento clínico oficial del Hospital Nacional "San Juan de Dios" San Miguel / El Salvador
// Formato Horizontal (Landscape), Tabla de 8 Columnas (Tiempo de comida | Menú 1 - Menú 7),
// 5 Recomendaciones Clínicas y Sello/Firma Profesional (J.V.P.M. 1040).

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
  PageOrientation
} from 'docx';
import { MEAL_TIMES } from '../data/exchangeDatabase.js';
import { DAYS_OF_WEEK, HOSPITAL_MENUS_SAN_MIGUEL, HOSPITAL_GENERAL_RECOMMENDATIONS } from '../data/salvadoranDishes.js';
import { cleanDecimalsToIntegers } from '../data/salvadoranMenuEngine.js';

const BORDER_BLACK = { style: BorderStyle.SINGLE, size: 8, color: '000000' };

const fullTableBorder = {
  top: BORDER_BLACK,
  bottom: BORDER_BLACK,
  left: BORDER_BLACK,
  right: BORDER_BLACK
};

const cellMargins = { top: 80, bottom: 80, left: 100, right: 100 };

export async function generateSalvadoranMenuDocx(patient = {}, computed = {}, weeklyPlan = {}) {
  const g = patient.gen || {};
  const pl = patient.plan || {};
  const req = patient.req || {};

  const nombre = g.nombre || 'Paciente';
  const expediente = g.expediente || 'S/N';
  const fecha = g.fecha || new Date().toISOString().slice(0, 10);
  const responsable = g.responsable || 'Licda. Diana Carolina Cortéz Sorto';
  const jvpm = g.jvpm || 'J.V.P.M. No. 1040';

  const vct = computed.get || computed.vctMeta || (req.kcalkg ? Math.round(Number(req.kcalkg) * (computed.wCalc || 60)) : 1800);
  const macros = computed.m || {
    p: { pct: 18, g: Math.round(vct * 0.18 / 4) },
    c: { pct: 54, g: Math.round(vct * 0.54 / 4) },
    l: { pct: 28, g: Math.round(vct * 0.28 / 9) }
  };

  // 1. Encabezado Oficial Hospital San Miguel (Tabla de 2 columnas sin bordes)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          // Lado Izquierdo: HOSPITAL NACIONAL SAN MIGUEL
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 60, left: 0, right: 0 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: 'HOSPITAL\n', bold: true, size: 20, color: '1E293B', font: 'Arial' }),
                  new TextRun({ text: 'NACIONAL\n', bold: true, size: 15, color: '475569', font: 'Arial' }),
                  new TextRun({ text: 'SAN MIGUEL', bold: true, size: 18, color: '1E293B', font: 'Arial' })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({ text: '· · · ☼ · · ·', size: 14, color: '94A3B8' })
                ]
              })
            ]
          }),
          // Lado Derecho: Sello Institucional NUTRICIÓN
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 60, left: 0, right: 0 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 10 },
                children: [
                  new TextRun({ text: 'Hospital Nacional "San Juan de Dios"\n', bold: true, size: 16, color: '334155', font: 'Arial' }),
                  new TextRun({ text: 'San Miguel\n', size: 15, color: '475569', font: 'Arial' }),
                  new TextRun({ text: 'NUTRICIÓN', bold: true, size: 20, color: 'B91C1C', font: 'Arial' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Datos breves del paciente en subtítulo
  const patientSubheader = new Paragraph({
    spacing: { before: 40, after: 100 },
    children: [
      new TextRun({ text: 'Paciente: ', bold: true, size: 17 }),
      new TextRun({ text: `${nombre}    `, size: 17 }),
      new TextRun({ text: 'Expediente: ', bold: true, size: 17 }),
      new TextRun({ text: `${expediente}    `, size: 17 }),
      new TextRun({ text: 'Fecha: ', bold: true, size: 17 }),
      new TextRun({ text: `${fecha}    `, size: 17 }),
      new TextRun({ text: 'Prescripción: ', bold: true, size: 17 }),
      new TextRun({ text: `${vct} kcal/día (P: ${macros.p.pct}% · CHO: ${macros.c.pct}% · L: ${macros.l.pct}%)`, size: 17, italics: true })
    ]
  });

  // 2. Filas de la Gran Tabla de 8 Columnas (Tiempo de Comida | Menú 1 - Menú 7)
  const mealRowsMeta = [
    { key: 'des', label: 'Desayuno' },
    { key: 'c1', label: 'Refrigerio' },
    { key: 'alm', label: 'Almuerzo' },
    { key: 'c2', label: 'Refrigerio' },
    { key: 'cen', label: 'Cena' }
  ];

  // Columnas: Tiempo (11%) + 7 Menús (12.71% c/u) = 100%
  const colWidths = [11, 12.71, 12.71, 12.71, 12.71, 12.71, 12.71, 12.71];

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: colWidths[0], type: WidthType.PERCENTAGE },
        borders: fullTableBorder,
        margins: cellMargins,
        shading: { fill: 'FFFFFF' },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Tiempo de\ncomida', bold: true, size: 17, font: 'Arial' })]
          })
        ]
      }),
      ...[1, 2, 3, 4, 5, 6, 7].map((num, idx) => (
        new TableCell({
          width: { size: colWidths[idx + 1], type: WidthType.PERCENTAGE },
          borders: fullTableBorder,
          margins: cellMargins,
          shading: { fill: 'FFFFFF' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Menú ${num}`, bold: true, size: 17, font: 'Arial' })]
            })
          ]
        })
      ))
    ]
  });

  // Generar las 5 filas de tiempos de comida
  const dayKeysOrder = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const mealTableRows = mealRowsMeta.map(mMeta => {
    return new TableRow({
      children: [
        // Columna 1: Nombre del tiempo de comida
        new TableCell({
          width: { size: colWidths[0], type: WidthType.PERCENTAGE },
          borders: fullTableBorder,
          margins: cellMargins,
          children: [
            new Paragraph({
              children: [new TextRun({ text: mMeta.label, bold: true, size: 17, font: 'Arial' })]
            })
          ]
        }),
        // Columnas 2 a 8: Contenido del Menú 1 al Menú 7
        ...[0, 1, 2, 3, 4, 5, 6].map(colIdx => {
          const hospTemplate = HOSPITAL_MENUS_SAN_MIGUEL[colIdx];
          const hospMeal = hospTemplate?.meals[mMeta.key];

          // Si el planificador semanal tiene un menú personalizado para este día
          const dayKey = dayKeysOrder[colIdx];
          const dynamicMeal = weeklyPlan[dayKey]?.meals[mMeta.key];

          const cellParagraphs = [];

          if (dynamicMeal && dynamicMeal.ingredients?.length > 0) {
            // Usar platillo adaptado con medidas exactas
            cellParagraphs.push(
              new Paragraph({
                spacing: { after: 20 },
                children: [new TextRun({ text: `${dynamicMeal.dishName}:`, bold: true, size: 15, font: 'Arial' })]
              })
            );

            dynamicMeal.ingredients.forEach(ing => {
              const cleanMeas = cleanDecimalsToIntegers(ing.measure || '');
              const cleanNm = cleanDecimalsToIntegers(ing.name || '');
              const displayText = cleanNm.toLowerCase().startsWith(cleanMeas.toLowerCase()) || cleanNm.match(/^\d+/)
                ? `• ${cleanNm}`
                : `• ${cleanMeas} de ${cleanNm}`;

              cellParagraphs.push(
                new Paragraph({
                  spacing: { after: 15 },
                  children: [new TextRun({ text: displayText, size: 14, font: 'Arial' })]
                })
              );
            });

            if (dynamicMeal.prepNotes) {
              cellParagraphs.push(
                new Paragraph({
                  spacing: { after: 10 },
                  children: [new TextRun({ text: dynamicMeal.prepNotes, italics: true, size: 13, color: '475569', font: 'Arial' })]
                })
              );
            }
          } else if (hospMeal) {
            // Usar receta oficial del hospital
            if (hospMeal.title) {
              cellParagraphs.push(
                new Paragraph({
                  spacing: { after: 20 },
                  children: [new TextRun({ text: `${hospMeal.title}:`, bold: true, size: 15, font: 'Arial' })]
                })
              );
            }
            hospMeal.text.split('\n').forEach(line => {
              cellParagraphs.push(
                new Paragraph({
                  spacing: { after: 15 },
                  children: [new TextRun({ text: line, size: 14, font: 'Arial' })]
                })
              );
            });
          } else {
            cellParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: 'Según prescripción médica.', size: 14, font: 'Arial' })]
              })
            );
          }

          return new TableCell({
            width: { size: colWidths[colIdx + 1], type: WidthType.PERCENTAGE },
            borders: fullTableBorder,
            margins: cellMargins,
            children: cellParagraphs
          });
        })
      ]
    });
  });

  // 3. Filas de Recomendaciones Clínicas al pie de la tabla (abarcando todo el ancho)
  const recommendationsRows = HOSPITAL_GENERAL_RECOMMENDATIONS.map(rec => {
    return new TableRow({
      children: [
        new TableCell({
          columnSpan: 8,
          borders: fullTableBorder,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
          children: [
            new Paragraph({
              spacing: { after: 10 },
              children: [
                new TextRun({ text: `- ${rec}`, size: 15, font: 'Arial' })
              ]
            })
          ]
        })
      ]
    });
  });

  // Construir la Tabla Principal Completa
  const mainHospitalTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: fullTableBorder,
    rows: [
      tableHeaderRow,
      ...mealTableRows,
      ...recommendationsRows
    ]
  });

  // 4. Sello y Firma Profesional en Cuadro Inferior Derecho
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          // Espacio en blanco a la izquierda (60%)
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            },
            children: [new Paragraph({ text: '' })]
          }),
          // Cuadro de firma bordeado a la derecha (40%)
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: fullTableBorder,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: `${responsable}   `, bold: true, size: 16, font: 'Arial' }),
                  new TextRun({ text: 'Licda. Diana Cortéz', size: 15, font: 'Arial' })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 20 },
                children: [
                  new TextRun({ text: 'LICENCIADA EN NUTRICIÓN Y DIETÉTICA   ', size: 14, font: 'Arial' }),
                  new TextRun({ text: 'Nutricionista y Dietista', size: 14, font: 'Arial' })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: jvpm, bold: true, size: 16, color: '1E3A8A', font: 'Arial' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Ensamblar Documento en Orientación Landscape (Horizontal)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.LANDSCAPE
            },
            margin: { top: 720, bottom: 720, left: 720, right: 720 }
          }
        },
        children: [
          headerTable,
          patientSubheader,
          mainHospitalTable,
          new Paragraph({ spacing: { before: 120, after: 60 }, text: '' }),
          signatureTable
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

// Descarga directa del archivo en el navegador
export async function downloadSalvadoranMenuDocx(patient = {}, computed = {}, weeklyPlan = {}) {
  const blob = await generateSalvadoranMenuDocx(patient, computed, weeklyPlan);
  const patientName = (patient.gen?.nombre || 'Paciente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ ]/g, '').replace(/\s+/g, '_');
  const dateStr = patient.gen?.fecha || new Date().toISOString().slice(0, 10);
  const filename = `Menu_Hospitalario_SanMiguel_${patientName}_${dateStr}.docx`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
