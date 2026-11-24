import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Download, Copy, Printer, Check, X, Edit3, Eye, RefreshCw,
  Building2, Bed, Calendar, UserCheck, AlertCircle, Sparkles
} from 'lucide-react';
import {
  generateClinicalNoteData,
  downloadClinicalNoteDocx
} from '../lib/clinicalNoteEngine.js';

export default function ClinicalNoteModal({ isOpen, onClose, p, c, set, upd }) {
  if (!isOpen) return null;

  const g = p.gen || {};

  // Estado local para los metadatos hospitalarios (con persistencia en paciente vía set)
  const [servicio, setServicio] = useState(g.servicio || 'Unidad de Cuidados Intermedios Adultos');
  const [cama, setCama] = useState(g.cama || '05');
  const [deih, setDeih] = useState(g.deih || '3°');
  const [diaEvolucion, setDiaEvolucion] = useState(g.diaEvolucion || '5°');
  const [responsable, setResponsable] = useState(g.responsable || 'Lic. Nutricionista Clínico');
  const [orientacion, setOrientacion] = useState(
    g.orientacion || (g.sexo === 'M' ? 'orientado y colaborador durante el interrogatorio' : 'orientada y colaboradora durante el interrogatorio')
  );
  const [obstetricos, setObstetricos] = useState(g.obstetricos || '');

  // Modo de edición libre de la nota
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Sincronizar metadatos en el paciente
  const syncHospitalMetadata = () => {
    upd(prev => {
      let next = { ...prev };
      if (!next.gen) next.gen = {};
      next.gen.servicio = servicio;
      next.gen.cama = cama;
      next.gen.deih = deih;
      next.gen.diaEvolucion = diaEvolucion;
      next.gen.responsable = responsable;
      next.gen.orientacion = orientacion;
      next.gen.obstetricos = obstetricos;
      return next;
    });
  };

  // Crear un objeto paciente temporal con los metadatos actualizados
  const patientWithMeta = useMemo(() => {
    return {
      ...p,
      gen: {
        ...g,
        servicio,
        cama,
        deih,
        diaEvolucion,
        responsable,
        orientacion,
        obstetricos
      }
    };
  }, [p, g, servicio, cama, deih, diaEvolucion, responsable, orientacion, obstetricos]);

  // Generar datos de la nota
  const noteData = useMemo(() => {
    return generateClinicalNoteData(patientWithMeta, c);
  }, [patientWithMeta, c]);

  // Inicializar o actualizar texto libre si no se está editando activamente
  useEffect(() => {
    if (!isEditingRaw) {
      setCustomText(noteData.fullRawText);
    }
  }, [noteData, isEditingRaw]);

  // Copiar al portapapeles
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customText || noteData.fullRawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = customText || noteData.fullRawText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Descargar Word (.docx)
  const handleDownloadDocx = async () => {
    try {
      setDownloading(true);
      syncHospitalMetadata();
      await downloadClinicalNoteDocx(patientWithMeta, c, noteData);
    } catch (err) {
      console.error('Error al generar Word:', err);
      alert('Error al generar el documento Word (.docx): ' + (err.message || err));
    } finally {
      setDownloading(false);
    }
  };

  // Imprimir nota
  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor permita ventanas emergentes para imprimir la nota.');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nota Nutricional - ${g.nombre || 'Paciente'}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.25; color: #111; margin: 2.5cm; }
            h2, h3, h4 { margin-top: 1em; margin-bottom: 0.3em; font-size: 11pt; }
            p { margin-top: 0; margin-bottom: 0.8em; text-align: justify; }
            .header-bold { font-weight: bold; margin-bottom: 0.2em; }
            .label-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-bold">${noteData.headerLine1}</div>
          <div class="header-bold" style="margin-bottom: 1.2em;">${noteData.headerLine2}</div>
          <p>${noteData.parrafoIntro1}</p>
          <p>${noteData.parrafoIntro2}</p>
          <div class="label-bold">Datos de laboratorio</div>
          <p>${noteData.datosLaboratorioTexto}</p>
          <div class="label-bold">Datos Antropométricos:</div>
          ${noteData.antroLines.map(l => `<div>${l}</div>`).join('')}
          <div style="margin-top: 0.8em;"><span class="label-bold">Diagnóstico nutricional: </span>${noteData.diagNutri}</div>
          <div style="margin-top: 0.8em;" class="label-bold">Requerimientos nutricionales:</div>
          ${noteData.reqLines.map(l => `<div>${l}</div>`).join('')}
          <div style="margin-top: 0.8em;"><span class="label-bold">Prescripción dietoterapéutica: </span>${noteData.prescripcionTexto}</div>
          <div style="margin-top: 0.8em;" class="label-bold">Educación alimentaria y nutricional:</div>
          ${noteData.eduParagraphs.map(p => `<p>${p}</p>`).join('')}
        </body>
      </html>
    `;
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface rounded-xl border border-line shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Encabezado del Modal */}
        <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface-alt">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-soft text-brand flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="h3 mb-0 text-base">Generador de Nota de Atención Nutricional Hospitalaria</h3>
                <span className="pill ok text-[10px] font-semibold">Word (.docx) editable</span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Redacción clínica profesional estructurada según estándares hospitalarios y lineamientos RIISS
              </p>
            </div>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-surface"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Doble Columna (Ajuste de Parámetros + Vista Previa) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid gap-5 lg:grid-cols-[18.5rem_minmax(0,1fr)]">
          
          {/* Columna Izquierda: Parámetros del Entorno Hospitalario */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-[var(--sunken)] border border-line">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-brand mb-2.5">
                <Building2 className="w-4 h-4" />
                <span>Datos del Servicio Hospitalario</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="lbl text-[11px]">Servicio / Unidad</label>
                  <input
                    type="text"
                    className="inp text-xs py-1"
                    placeholder="Ej. Cuidados Intermedios Adultos"
                    value={servicio}
                    onChange={e => setServicio(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="lbl text-[11px]">Cama</label>
                    <input
                      type="text"
                      className="inp text-xs py-1"
                      placeholder="Ej. 05"
                      value={cama}
                      onChange={e => setCama(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="lbl text-[11px]">DEIH</label>
                    <input
                      type="text"
                      className="inp text-xs py-1"
                      placeholder="Ej. 3° DEIH"
                      value={deih}
                      onChange={e => setDeih(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="lbl text-[11px]">Día de evolución de enfermedad</label>
                  <input
                    type="text"
                    className="inp text-xs py-1"
                    placeholder="Ej. 5° día"
                    value={diaEvolucion}
                    onChange={e => setDiaEvolucion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl text-[11px]">Responsable de la nota</label>
                  <input
                    type="text"
                    className="inp text-xs py-1"
                    placeholder="Ej. Lic. Alexa / Nutricionista"
                    value={responsable}
                    onChange={e => setResponsable(e.target.value)}
                  />
                </div>

                <div>
                  <label className="lbl text-[11px]">Estado de orientación y cooperación</label>
                  <input
                    type="text"
                    className="inp text-xs py-1"
                    placeholder="Orientada y colaboradora..."
                    value={orientacion}
                    onChange={e => setOrientacion(e.target.value)}
                  />
                </div>

                {(g.sexo === 'F' || c.isEmbarazada) && (
                  <div>
                    <label className="lbl text-[11px]">Antecedentes Gineco-Obstétricos</label>
                    <input
                      type="text"
                      className="inp text-xs py-1"
                      placeholder="Ej. G5, P3, A1, V3, AU 40 cm"
                      value={obstetricos}
                      onChange={e => setObstetricos(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-line bg-surface text-xs space-y-1.5 text-muted">
              <div className="flex items-center gap-1.5 text-ink font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>Compatibilidad Total Word / Docs</span>
              </div>
              <p className="leading-relaxed">
                El archivo descargado se genera con márgenes clínicos de 2.54 cm, tipografía Arial, encabezados en negrita y estructura idéntica a las notas hospitalarias institucionales.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa y Edición */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-ink uppercase tracking-wider">
                  Vista Previa del Documento
                </span>
                <span className="text-xs text-muted">
                  ({g.nombre || 'Paciente'})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className={`btn btn-sm text-xs py-1 px-2.5 flex items-center gap-1 ${
                    !isEditingRaw ? 'btn-primary' : 'btn-ghost text-muted'
                  }`}
                  onClick={() => setIsEditingRaw(false)}
                >
                  <Eye className="w-3.5 h-3.5" /> Formateada
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-xs py-1 px-2.5 flex items-center gap-1 ${
                    isEditingRaw ? 'btn-primary' : 'btn-ghost text-muted'
                  }`}
                  onClick={() => setIsEditingRaw(true)}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar texto
                </button>
              </div>
            </div>

            {/* Contenedor de la Nota (Estilo Hoja de Hospital) */}
            <div className="flex-1 bg-surface-alt rounded-lg border border-line p-4 sm:p-6 overflow-y-auto max-h-[56vh] font-sans text-sm leading-relaxed text-ink shadow-inner">
              {isEditingRaw ? (
                <textarea
                  className="w-full h-full min-h-[46vh] bg-transparent border-0 resize-none font-sans text-sm leading-relaxed focus:outline-none focus:ring-0 text-ink"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="Redacción de la nota clínica..."
                />
              ) : (
                <div className="space-y-4">
                  {/* Encabezado */}
                  <div>
                    <div className="font-bold text-sm tracking-wide">{noteData.headerLine1}</div>
                    <div className="font-bold text-sm tracking-wide">{noteData.headerLine2}</div>
                  </div>

                  {/* Introducción clínica */}
                  <p className="text-justify leading-relaxed">{noteData.parrafoIntro1}</p>
                  <p className="text-justify leading-relaxed">{noteData.parrafoIntro2}</p>

                  {/* Laboratorio */}
                  <div>
                    <div className="font-bold text-sm">Datos de laboratorio</div>
                    <p className="text-justify leading-relaxed mt-0.5">{noteData.datosLaboratorioTexto}</p>
                  </div>

                  {/* Antropometría */}
                  <div>
                    <div className="font-bold text-sm">Datos Antropométricos:</div>
                    <div className="space-y-0.5 mt-0.5">
                      {noteData.antroLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>

                  {/* Diagnóstico */}
                  <div>
                    <span className="font-bold text-sm">Diagnóstico nutricional: </span>
                    <span>{noteData.diagNutri}</span>
                  </div>

                  {/* Requerimientos */}
                  <div>
                    <div className="font-bold text-sm">Requerimientos nutricionales:</div>
                    <div className="space-y-0.5 mt-0.5">
                      {noteData.reqLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>

                  {/* Prescripción */}
                  <div>
                    <span className="font-bold text-sm">Prescripción dietoterapéutica: </span>
                    <span>{noteData.prescripcionTexto}</span>
                  </div>

                  {/* Educación y recomendaciones */}
                  <div className="space-y-2.5">
                    <div className="font-bold text-sm">Educación alimentaria y nutricional:</div>
                    {noteData.eduParagraphs.map((parr, idx) => (
                      <p key={idx} className="text-justify leading-relaxed">{parr}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="px-5 py-3.5 border-t border-line flex flex-wrap items-center justify-between gap-3 bg-surface-alt">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-sm flex items-center gap-1.5"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto'}</span>
            </button>
            <button
              type="button"
              className="btn btn-sm flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="btn btn-sm"
              onClick={onClose}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-2 px-4 shadow-sm"
              disabled={downloading}
              onClick={handleDownloadDocx}
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Generando Word...' : 'Descargar Word (.docx)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
