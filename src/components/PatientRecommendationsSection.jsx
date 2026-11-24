import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Plus,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import {
  RECOMMENDATION_SETS,
  detectPatientRecommendations,
  buildRecommendationsText
} from '../data/patientRecommendations.js';

export default function PatientRecommendationsSection({ p, c, set, upd }) {
  const [selectedCatId, setSelectedCatId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSetId, setExpandedSetId] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Detección automática según patologías, laboratorio y ciclo vital
  const detectedSets = useMemo(() => {
    return detectPatientRecommendations(p, c);
  }, [p.gen, p.clin, p.bio, c.imc, c.egfr, c.isEmbarazada, c.isPediatrico, c.isAdulto]);

  const currentRecsText = p.plan?.recs || '';

  // Filtrado de conjuntos de recomendaciones para exploración
  const filteredSets = useMemo(() => {
    return RECOMMENDATION_SETS.filter(set => {
      const matchesSearch = !searchTerm ||
        set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.items.some(it => it.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = !selectedCatId || set.id === selectedCatId;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCatId]);

  // Aplicar todas las recomendaciones sugeridas al plan
  const handleApplyDetected = (mode = 'append') => {
    if (!detectedSets.length) return;
    const newText = buildRecommendationsText(detectedSets);
    if (mode === 'replace') {
      set('plan.recs', newText);
    } else {
      const existing = (currentRecsText || '').trim();
      const combined = existing ? `${existing}\n\n${newText}` : newText;
      set('plan.recs', combined);
    }
  };

  // Agregar una recomendación individual
  const handleAddSingleItem = (itemText) => {
    const existing = (currentRecsText || '').trim();
    if (existing.includes(itemText)) return;
    const formatted = itemText.startsWith('•') ? itemText : `• ${itemText}`;
    set('plan.recs', existing ? `${existing}\n${formatted}` : formatted);
  };

  // Agregar un conjunto completo
  const handleAddEntireSet = (setObj) => {
    const existing = (currentRecsText || '').trim();
    const setHeader = `--- ${setObj.title.toUpperCase()} ---`;
    const linesToAdd = [setHeader, ...setObj.items.map(it => `• ${it}`)];
    const textToAdd = linesToAdd.join('\n');
    set('plan.recs', existing ? `${existing}\n\n${textToAdd}` : textToAdd);
  };

  // Copiar al portapapeles
  const handleCopy = () => {
    if (!currentRecsText) return;
    navigator.clipboard.writeText(currentRecsText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <section className="card p-5 border-t-4 border-t-brand">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow" style={{ fontSize: '.7rem', color: 'var(--brand)' }}>
                GUÍAS CLÍNICAS Y EDUCACIÓN NUTRICIONAL
              </span>
            </div>
            <h3 className="h3 mb-0">Recomendaciones Específicas por Paciente</h3>
          </div>
        </div>

        {/* Acciones de texto */}
        <div className="flex items-center gap-2">
          {currentRecsText && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-outline flex items-center gap-1.5"
                title="Copiar recomendaciones"
              >
                <Copy className="w-4 h-4" />
                <span>{copyFeedback ? '¡Copiado!' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={() => set('plan.recs', '')}
                className="btn btn-sm btn-ghost text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                title="Limpiar recomendaciones"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* BANNER DE DETECCIÓN AUTOMÁTICA SEGÚN PERFIL DEL PACIENTE */}
      <div className="mb-5 p-4 rounded-xl border border-brand/20 bg-brand-soft/20">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand animate-pulse" />
            <h4 className="font-semibold text-sm text-text-primary">
              Guías sugeridas según perfil clínico y diagnóstico:
            </h4>
          </div>
          {detectedSets.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyDetected('append')}
                className="btn btn-xs btn-primary flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar sugeridas al plan</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyDetected('replace')}
                className="btn btn-xs btn-outline text-xs"
                title="Reemplaza el texto actual por las guías sugeridas"
              >
                Reemplazar todo
              </button>
            </div>
          )}
        </div>

        {detectedSets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {detectedSets.map(s => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <strong>{s.shortTitle}</strong>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted italic">
            No se detectaron condiciones patológicas específicas que requieran restricción estricta. Puedes seleccionar guías del catálogo inferior o redactar recomendaciones abiertas.
          </p>
        )}
      </div>

      {/* ÁREA DE TEXTO EDITABLE DE RECOMENDACIONES (p.plan.recs) */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Recomendaciones prescritas en el plan del paciente (editables):
        </label>
        <textarea
          value={currentRecsText}
          onChange={e => set('plan.recs', e.target.value)}
          rows={6}
          className="w-full text-sm font-sans p-3 rounded-lg border border-line bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          placeholder="Escribe o agrega recomendaciones desde las guías sugeridas o el catálogo..."
        />
        <div className="flex justify-between items-center text-xs text-text-muted mt-1 px-1">
          <span>{currentRecsText.split('\n').filter(Boolean).length} ítems registrados</span>
          <span>Se sincroniza automáticamente con la nota Word (.docx) y el reporte PDF</span>
        </div>
      </div>

      {/* EXPLORADOR Y SELECTOR DE GUÍAS CLÍNICAS */}
      <div className="border border-line rounded-xl overflow-hidden bg-surface-muted/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="font-semibold text-xs text-text-primary uppercase tracking-wider">
              Explorar Catálogo de Recomendaciones Clínicas (17 Patologías / Grupos)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar (ej. potasio, alfalfa, sal...)"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-md border border-line bg-surface text-text-primary"
              />
            </div>
            <select
              value={selectedCatId}
              onChange={e => setSelectedCatId(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-md border border-line bg-surface text-text-primary"
            >
              <option value="">Todas las patologías</option>
              {RECOMMENDATION_SETS.map(s => (
                <option key={s.id} value={s.id}>{s.shortTitle}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LISTADO DE CONJUNTOS DE GUÍAS CON ACORDEÓN */}
        <div className="grid gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredSets.map(setObj => {
            const isExpanded = expandedSetId === setObj.id;
            const isDetected = detectedSets.some(d => d.id === setObj.id);

            return (
              <div
                key={setObj.id}
                className={`border rounded-lg transition overflow-hidden bg-surface ${
                  isDetected ? 'border-brand/40 shadow-xs' : 'border-line'
                }`}
              >
                <div
                  className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-surface-muted/60 transition"
                  onClick={() => setExpandedSetId(isExpanded ? null : setObj.id)}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-xs font-semibold text-brand px-2 py-0.5 rounded bg-brand-soft/50">
                      {setObj.badge}
                    </span>
                    <span className="font-medium text-sm text-text-primary truncate">
                      {setObj.title}
                    </span>
                    {isDetected && (
                      <span className="text-2xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Sugerida
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEntireSet(setObj);
                      }}
                      className="btn btn-2xs btn-outline text-brand border-brand/30 hover:bg-brand-soft flex items-center gap-1"
                      title="Agregar todas las recomendaciones de este grupo"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">Agregar grupo</span>
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-3 pt-1 border-t border-line/60 bg-surface-muted/20">
                    <p className="text-xs text-text-muted mb-2 italic">
                      {setObj.description}
                    </p>
                    <div className="space-y-1.5">
                      {setObj.items.map((item, idx) => {
                        const isAlreadyAdded = currentRecsText.includes(item);
                        return (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-surface border border-transparent hover:border-line text-xs transition"
                          >
                            <span className="text-text-primary leading-relaxed flex-1">
                              • {item}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddSingleItem(item)}
                              disabled={isAlreadyAdded}
                              className={`btn btn-2xs shrink-0 flex items-center gap-1 ${
                                isAlreadyAdded
                                  ? 'btn-ghost text-emerald-600 dark:text-emerald-400 cursor-default'
                                  : 'btn-outline text-brand border-brand/30 hover:bg-brand-soft'
                              }`}
                            >
                              {isAlreadyAdded ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Agregada</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Agregar</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
