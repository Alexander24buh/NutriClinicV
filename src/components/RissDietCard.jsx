import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, BookOpen, CheckCircle2, XCircle, Info, Sparkles, ChevronDown, ChevronUp, Stethoscope
} from 'lucide-react';
import { RISS_DIETS, evaluateRissDietRecommendation } from '../data/rissDatabase.js';

export default function RissDietCard({ p, c, set, upd }) {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedDietForDetail, setSelectedDietForDetail] = useState(null);

  // Evaluación automática con base en los datos clínicos del paciente
  const autoRec = useMemo(() => {
    return evaluateRissDietRecommendation(p, c);
  }, [p.gen, p.antro, p.bio, p.clin, c.imc, c.egfr, c.tamizaje, c.isAdulto, c.isPediatrico, c.isEmbarazada]);

  const currentRiss = p.plan?.riss || {
    primaryDiet: autoRec.primaryDiet.id,
    secondaryDiets: autoRec.secondaryDiets.map(d => d.id),
    justificacion: [autoRec.primaryDiet.reason, ...autoRec.secondaryDiets.map(d => d.reason)].join(' ')
  };

  const primaryDietObj = RISS_DIETS.find(d => d.id === (currentRiss.primaryDiet || 'normal')) || RISS_DIETS[0];
  const secondaryDietObjs = (currentRiss.secondaryDiets || []).map(id => RISS_DIETS.find(d => d.id === id)).filter(Boolean);

  const allActiveDiets = [primaryDietObj, ...secondaryDietObjs];

  // Acción para aplicar la recomendación sugerida por el motor RISS
  const handleApplyAutoRecommendation = () => {
    const newRiss = {
      primaryDiet: autoRec.primaryDiet.id,
      secondaryDiets: autoRec.secondaryDiets.map(d => d.id),
      justificacion: [autoRec.primaryDiet.reason, ...autoRec.secondaryDiets.map(d => d.reason)].join(' ')
    };
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        riss: newRiss
      }
    }));
  };

  const handleSetPrimary = (dietId) => {
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        riss: {
          ...(x.plan.riss || {}),
          primaryDiet: dietId
        }
      }
    }));
  };

  const handleToggleSecondary = (dietId) => {
    const cur = currentRiss.secondaryDiets || [];
    const updated = cur.includes(dietId)
      ? cur.filter(id => id !== dietId)
      : [...cur, dietId];
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        riss: {
          ...(x.plan.riss || {}),
          secondaryDiets: updated
        }
      }
    }));
  };

  const handleJustificationChange = (e) => {
    const val = e.target.value;
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        riss: {
          ...(x.plan.riss || {}),
          justificacion: val
        }
      }
    }));
  };

  // Dietas clasificadas por categorías para el selector
  const consistencyDiets = RISS_DIETS.filter(d => d.category === 'General' || d.category === 'Consistencia');
  const modDiets = RISS_DIETS.filter(d => d.category !== 'General' && d.category !== 'Consistencia');

  return (
    <section className="card p-5 border-l-4 border-l-brand relative overflow-hidden bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow" style={{ fontSize: '.7rem', color: 'var(--brand)' }}>MINSAL · RIISS 2014</span>
              <span className="badge badge-primary text-[10px] py-0.5 px-2">Protocolo Clínico Obligatorio</span>
            </div>
            <h3 className="h3 mb-0 text-ink">Diagnóstico y Prescripción de Dieta según RISS</h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-ghost text-xs text-brand flex items-center gap-1.5"
            onClick={() => {
              setSelectedDietForDetail(primaryDietObj);
              setShowRulesModal(true);
            }}
          >
            <BookOpen className="w-4 h-4" /> Ver Reglas y Restricciones RISS
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary text-xs flex items-center gap-1.5"
            onClick={handleApplyAutoRecommendation}
            title="Aplica la clasificación recomendada según laboratorios y patologías"
          >
            <Sparkles className="w-3.5 h-3.5" /> Aplicar sugerencia RISS
          </button>
        </div>
      </div>

      {/* Banner de Prescripción Activa */}
      <div className="p-3.5 bg-brand-soft/40 border border-brand/20 rounded-lg mb-4">
        <div className="text-xs text-brand font-semibold mb-1 uppercase tracking-wider">
          Prescripción Hospitalaria / Clínica Activa:
        </div>
        <div className="text-base font-bold text-ink flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-0.5 bg-brand text-white rounded-md text-xs font-semibold shadow-xs">
            {primaryDietObj.name}
          </span>
          {secondaryDietObjs.map(d => (
            <span key={d.id} className="px-2 py-0.5 bg-surface border border-brand/40 text-brand rounded-md text-xs font-medium">
              + {d.name}
            </span>
          ))}
        </div>
      </div>

      {/* Selectores de Dieta RISS */}
      <div className="grid gap-4 lg:grid-cols-2 mb-4">
        <div>
          <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
            1. Consistencia Base (RISS)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {consistencyDiets.map(d => {
              const active = currentRiss.primaryDiet === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`text-left p-2 rounded border text-xs transition-all ${
                    active
                      ? 'bg-brand text-white border-brand font-bold shadow-xs'
                      : 'bg-surface hover:bg-surface-alt border-line text-ink'
                  }`}
                  onClick={() => handleSetPrimary(d.id)}
                >
                  <div className="truncate font-medium">{d.name.replace('Dieta ', '')}</div>
                  <div className={`text-[10px] truncate ${active ? 'text-white/80' : 'text-muted'}`}>{d.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1.5">
            2. Modificaciones de Nutrientes, Calorías y Minerales (RISS)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {modDiets.map(d => {
              const active = (currentRiss.secondaryDiets || []).includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`px-2.5 py-1 rounded-full border text-xs transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-brand text-white border-brand font-bold shadow-xs'
                      : 'bg-surface hover:bg-surface-alt border-line text-ink'
                  }`}
                  onClick={() => handleToggleSecondary(d.id)}
                >
                  <span>{d.name.replace('Dieta ', '')}</span>
                  {active && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Justificación Clínica según RISS */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="riss-justificacion" className="text-xs font-bold text-ink uppercase tracking-wider">
            3. Justificación Clínica y Criterios RISS
          </label>
          <span className="text-[11px] text-muted">Explicación médica basada en parámetros de laboratorio y comorbilidades</span>
        </div>
        <textarea
          id="riss-justificacion"
          rows={3}
          className="inp w-full text-xs font-sans leading-relaxed"
          placeholder="Justificación basada en patología, comorbilidades, laboratorios (eGFR, glucosa, perfil lipídico) y requerimientos..."
          value={currentRiss.justificacion || ''}
          onChange={handleJustificationChange}
        />
      </div>

      {/* Ficha Resumen de Alimentos Permitidos y Restringidos de la Dieta Actual */}
      <div className="mt-4 pt-3 border-t border-line">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand" /> Resumen de Reglas Alimentarias de la Dieta Prescrita
          </div>
          <span className="text-[11px] text-muted">Aplica a los 5 tiempos de comida</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="p-3 bg-ok-soft/30 border border-ok/30 rounded-lg">
            <div className="font-bold text-ok flex items-center gap-1 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Alimentos Permitidos y Prioritarios:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-ink">
              {allActiveDiets.flatMap(d => d.allowed).slice(0, 4).map((item, idx) => (
                <li key={idx} className="leading-snug">{item}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 bg-crit-soft/30 border border-crit/30 rounded-lg">
            <div className="font-bold text-crit flex items-center gap-1 mb-1.5">
              <XCircle className="w-3.5 h-3.5" /> Restricciones y Alimentos No Permitidos:
            </div>
            <ul className="list-disc pl-4 space-y-1 text-ink">
              {allActiveDiets.flatMap(d => d.forbidden).slice(0, 4).map((item, idx) => (
                <li key={idx} className="leading-snug">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal / Visor Completo de Lineamientos RISS */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-surface rounded-xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-line animate-fade-in">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-alt rounded-t-xl">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand" />
                <h3 className="h3 mb-0 text-ink">Manual de Prescripción de Dietas Hospitalarias RIISS</h3>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost text-muted hover:text-ink text-base px-2"
                onClick={() => setShowRulesModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              <div className="flex flex-wrap gap-1.5 pb-3 border-b border-line">
                {allActiveDiets.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedDietForDetail?.id === d.id ? 'bg-brand text-white shadow-xs' : 'bg-surface-alt border border-line text-ink'
                    }`}
                    onClick={() => setSelectedDietForDetail(d)}
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedDietForDetail && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-brand mb-1">{selectedDietForDetail.name}</h4>
                    <p className="text-sm text-ink">{selectedDietForDetail.description}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-3 bg-surface-alt rounded border border-line">
                      <strong className="text-ink block mb-0.5">Aporte Energético:</strong>
                      <span className="text-muted">{selectedDietForDetail.energy}</span>
                    </div>
                    <div className="p-3 bg-surface-alt rounded border border-line">
                      <strong className="text-ink block mb-0.5">Distribución de Macronutrientes:</strong>
                      <span className="text-muted">
                        CHO: {selectedDietForDetail.macros.cho} | Prot: {selectedDietForDetail.macros.p} | Grasa: {selectedDietForDetail.macros.l}
                      </span>
                    </div>
                  </div>

                  <div>
                    <strong className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                      Indicaciones Clínicas:
                    </strong>
                    <ul className="list-disc pl-5 text-xs text-ink space-y-1">
                      {selectedDietForDetail.indications.map((ind, i) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="p-3.5 bg-ok-soft/30 border border-ok/40 rounded-lg">
                      <strong className="text-ok font-bold flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Alimentos Permitidos:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1.5 text-ink">
                        {selectedDietForDetail.allowed.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-crit-soft/30 border border-crit/40 rounded-lg">
                      <strong className="text-crit font-bold flex items-center gap-1.5 mb-2">
                        <XCircle className="w-4 h-4" /> Alimentos No Permitidos / Restringidos:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1.5 text-ink">
                        {selectedDietForDetail.forbidden.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-line bg-surface-alt flex justify-end rounded-b-xl">
              <button
                type="button"
                className="btn btn-primary btn-sm text-xs"
                onClick={() => setShowRulesModal(false)}
              >
                Cerrar Guía
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
