import React, { useState } from 'react';
import {
  Pill as PillIcon, Plus, Edit2, Trash2, AlertTriangle, ShieldAlert,
  Sparkles, Check, Clock, ChevronDown, ChevronUp, Info, HeartHandshake, AlertCircle
} from 'lucide-react';
import {
  MED_CATEGORIES, MEAL_RELATIONS, COMMON_DRUGS_CATALOG,
  formatMedListToReadableText
} from '../data/drugFoodInteractions.js';

const MEAL_OPTIONS = [
  { k: 'des', label: 'Desayuno', short: 'Des' },
  { k: 'c1', label: 'Merienda AM', short: 'M-AM' },
  { k: 'alm', label: 'Almuerzo', short: 'Alm' },
  { k: 'c2', label: 'Merienda PM', short: 'M-PM' },
  { k: 'cen', label: 'Cena', short: 'Cen' }
];

export default function MedicationsSection({ p, c, set, upd }) {
  const medList = Array.isArray(p.gen?.medList) ? p.gen.medList : [];
  const medAlerts = c.medAlerts || { byType: { coordinacion: [], cruce_patologia: [], sinergia: [] }, totalAlerts: 0, disclaimer: '' };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos' | 'coordinacion' | 'cruce' | 'sinergia'
  const [showNotes, setShowNotes] = useState(false);

  // Form State
  const initialForm = {
    nombre: '',
    categoria: 'Antihipertensivo',
    dosisFrecuencia: '',
    relacionComidas: 'con_comidas',
    tiemposComida: [],
    observacion: ''
  };
  const [form, setForm] = useState(initialForm);

  // Abrir formulario para agregar
  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (item) => {
    setForm({
      nombre: item.nombre || '',
      categoria: item.categoria || 'Otro',
      dosisFrecuencia: item.dosisFrecuencia || '',
      relacionComidas: item.relacionComidas || 'con_comidas',
      tiemposComida: Array.isArray(item.tiemposComida) ? item.tiemposComida : [],
      observacion: item.observacion || ''
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  // Guardar medicamento
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    const newItem = {
      id: editingId || ('med-' + Math.random().toString(36).slice(2, 9)),
      nombre: form.nombre.trim(),
      categoria: form.categoria,
      dosisFrecuencia: form.dosisFrecuencia.trim(),
      relacionComidas: form.relacionComidas,
      tiemposComida: form.tiemposComida,
      observacion: form.observacion.trim()
    };

    let updatedList;
    if (editingId) {
      updatedList = medList.map(m => m.id === editingId ? newItem : m);
    } else {
      updatedList = [...medList, newItem];
    }

    upd(prev => {
      let next = { ...prev };
      if (!next.gen) next.gen = {};
      next.gen.medList = updatedList;
      // Sincronizar un resumen legible en gen.meds para compatibilidad
      next.gen.meds = formatMedListToReadableText(updatedList);
      return next;
    });

    setIsFormOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // Eliminar medicamento
  const handleDelete = (id) => {
    const updatedList = medList.filter(m => m.id !== id);
    upd(prev => {
      let next = { ...prev };
      if (!next.gen) next.gen = {};
      next.gen.medList = updatedList;
      next.gen.meds = formatMedListToReadableText(updatedList);
      return next;
    });
  };

  // Pre-llenar desde el catálogo rápido
  const handleSelectPreset = (preset) => {
    setForm({
      nombre: preset.nombre,
      categoria: preset.categoria,
      dosisFrecuencia: preset.dosisFrecuencia,
      relacionComidas: preset.relacionComidas,
      tiemposComida: preset.tiemposDefault || [],
      observacion: preset.observacion || ''
    });
  };

  // Toggle tiempo de comida
  const toggleMealTime = (k) => {
    setForm(prev => {
      const exists = prev.tiemposComida.includes(k);
      return {
        ...prev,
        tiemposComida: exists
          ? prev.tiemposComida.filter(x => x !== k)
          : [...prev.tiemposComida, k]
      };
    });
  };

  const cruceList = medAlerts.byType?.cruce_patologia || [];
  const coordList = medAlerts.byType?.coordinacion || [];
  const sinergiaList = medAlerts.byType?.sinergia || [];

  return (
    <section className="card p-5 border-l-4" style={{ borderLeftColor: 'var(--brand)' }}>
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--sunken)] text-brand">
            <PillIcon className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="h2 mb-0">Medicamentos y Suplementos</h2>
              <span className="pill ok text-xs font-semibold">
                {medList.length} {medList.length === 1 ? 'fármaco' : 'fármacos'}
              </span>
              {medAlerts.totalAlerts > 0 && (
                <span className="pill warn text-xs font-semibold">
                  {medAlerts.totalAlerts} {medAlerts.totalAlerts === 1 ? 'alerta' : 'alertas'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-0.5">
              Monitoreo estructurado de fármacos, horarios de comidas, sinergias y cruces con la dieta RIISS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm flex items-center gap-1.5"
            onClick={handleOpenAdd}
          >
            <Plus className="w-4 h-4" /> Agregar medicamento
          </button>
        </div>
      </div>

      {/* Formulario Modal / Colapsible para Agregar o Editar */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="mb-5 p-4 rounded-lg bg-[var(--sunken)] border border-line grid gap-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <span className="text-sm font-semibold text-brand">
              {editingId ? 'Editar Medicamento / Suplemento' : 'Nuevo Medicamento / Suplemento'}
            </span>
            <button
              type="button"
              className="text-xs text-muted hover:text-ink"
              onClick={() => { setIsFormOpen(false); setEditingId(null); }}
            >
              Cerrar
            </button>
          </div>

          {/* Sugerencias Rápidas de Fármacos Clínicos Habituales */}
          {!editingId && (
            <div>
              <div className="eyebrow text-[11px] mb-1.5">Sugerencias rápidas de fármacos habituales (clic para autocompletar):</div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-surface rounded border border-line">
                {COMMON_DRUGS_CATALOG.map((catItem) => (
                  <button
                    key={catItem.nombre}
                    type="button"
                    className="chipbtn text-xs py-0.5 px-2 hover:bg-brand-soft"
                    onClick={() => handleSelectPreset(catItem)}
                  >
                    + {catItem.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="lbl">Nombre del fármaco o suplemento *</label>
              <input
                type="text"
                required
                className="inp text-sm"
                placeholder="Ej. Carbonato de calcio, Amlodipino, Metformina"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div>
              <label className="lbl">Categoría farmacológica</label>
              <select
                className="inp text-sm"
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
              >
                {MED_CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="lbl">Dosis y frecuencia</label>
              <input
                type="text"
                className="inp text-sm"
                placeholder="Ej. 500 mg cada 8 h con las comidas"
                value={form.dosisFrecuencia}
                onChange={e => setForm({ ...form, dosisFrecuencia: e.target.value })}
              />
            </div>

            <div>
              <label className="lbl">Relación con las comidas</label>
              <select
                className="inp text-sm"
                value={form.relacionComidas}
                onChange={e => setForm({ ...form, relacionComidas: e.target.value })}
              >
                {MEAL_RELATIONS.map(r => (
                  <option key={r.k} value={r.k}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tiempos de Comida Programados */}
          <div>
            <label className="lbl mb-1.5">Tiempos de comida asociados (coordinación horaria):</label>
            <div className="flex flex-wrap gap-2">
              {MEAL_OPTIONS.map(mo => {
                const active = form.tiemposComida.includes(mo.k);
                return (
                  <button
                    key={mo.k}
                    type="button"
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                      active
                        ? 'bg-brand text-white border-brand shadow-sm'
                        : 'bg-surface hover:bg-surface-alt border-line text-ink'
                    }`}
                    onClick={() => toggleMealTime(mo.k)}
                  >
                    {active ? '✓ ' : ''}{mo.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted mt-1">
              Seleccione en qué tiempos de comida se debe tomar este medicamento para sincronizarlo con el menú del paciente.
            </p>
          </div>

          <div>
            <label className="lbl">Observaciones o cuidados clínicos adicionales</label>
            <input
              type="text"
              className="inp text-sm"
              placeholder="Ej. Tomar con el primer bocado; no tomar con leche o té"
              value={form.observacion}
              onChange={e => setForm({ ...form, observacion: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => { setIsFormOpen(false); setEditingId(null); }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> {editingId ? 'Guardar cambios' : 'Agregar fármaco'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Medicamentos Activos */}
      <div className="mb-5">
        {medList.length === 0 ? (
          <div className="p-4 rounded-lg bg-[var(--sunken)] border border-line text-center">
            <PillIcon className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-ink">No hay medicamentos o suplementos agregados aún</p>
            <p className="text-xs text-muted max-w-md mx-auto mt-1 mb-3">
              Agregue los medicamentos que toma el paciente para activar la verificación automática de sinergias, precauciones con la dieta RIISS y horarios con las comidas.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-primary inline-flex items-center gap-1"
              onClick={handleOpenAdd}
            >
              <Plus className="w-3.5 h-3.5" /> Agregar primer medicamento
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {medList.map((m) => {
              const relObj = MEAL_RELATIONS.find(r => r.k === m.relacionComidas);
              const mealPills = (m.tiemposComida || []).map(tk => {
                const opt = MEAL_OPTIONS.find(o => o.k === tk);
                return opt ? opt.short : tk;
              });

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg border border-line bg-surface hover:border-brand-soft transition-all flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-[15rem]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-ink">{m.nombre}</span>
                      <span className="pill text-[11px] font-normal" style={{ background: 'var(--sunken)' }}>
                        {m.categoria}
                      </span>
                      {relObj && (
                        <span className={`pill text-[11px] ${
                          m.relacionComidas === 'con_comidas'
                            ? 'ok'
                            : m.relacionComidas === 'en_ayunas'
                            ? 'warn'
                            : ''
                        }`}>
                          {relObj.label.split('(')[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
                      {m.dosisFrecuencia && (
                        <span><strong>Dosis:</strong> {m.dosisFrecuencia}</span>
                      )}
                      {mealPills.length > 0 && (
                        <span className="flex items-center gap-1 text-brand">
                          <Clock className="w-3 h-3" />
                          <span>Tiempos:</span>
                          <span className="font-medium">{mealPills.join(', ')}</span>
                        </span>
                      )}
                    </div>

                    {m.observacion && (
                      <p className="text-xs text-muted italic mt-1 bg-[var(--sunken)] px-2 py-0.5 rounded border border-line/50 inline-block">
                        {m.observacion}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm p-1.5 text-muted hover:text-brand"
                      title="Editar medicamento"
                      onClick={() => handleEdit(m)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm p-1.5 text-muted hover:text-danger"
                      title="Eliminar medicamento"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN DE ALERTAS Y SINERGIAS FÁRMACO–ALIMENTO */}
      <div className="mt-4 pt-4 border-t border-line">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <h3 className="h3 mb-0 text-sm">Alertas y Sinergias Fármaco–Alimento Automáticas</h3>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              className={`px-2 py-1 rounded transition-all ${
                activeFilter === 'todos' ? 'bg-brand text-white' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setActiveFilter('todos')}
            >
              Todos ({medAlerts.totalAlerts})
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded transition-all ${
                activeFilter === 'coordinacion' ? 'bg-amber-600 text-white' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setActiveFilter('coordinacion')}
            >
              Coordinación ({coordList.length})
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded transition-all ${
                activeFilter === 'cruce' ? 'bg-rose-600 text-white' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setActiveFilter('cruce')}
            >
              Cruces RIISS ({cruceList.length})
            </button>
            <button
              type="button"
              className={`px-2 py-1 rounded transition-all ${
                activeFilter === 'sinergia' ? 'bg-emerald-600 text-white' : 'text-muted hover:text-ink'
              }`}
              onClick={() => setActiveFilter('sinergia')}
            >
              Sinergias ({sinergiaList.length})
            </button>
          </div>
        </div>

        {medAlerts.totalAlerts === 0 ? (
          <div className="p-3 rounded-lg bg-[var(--sunken)] border border-line text-xs text-muted flex items-center gap-2">
            <Info className="w-4 h-4 text-brand shrink-0" />
            <span>
              No se detectaron interferencias farmacológicas críticas con los datos ingresados actualmente.
            </span>
          </div>
        ) : (
          <div className="grid gap-2.5">
            {/* 1. Cruces con Patología o Dieta RIISS (Rojo / Ámbar Crítico) */}
            {(activeFilter === 'todos' || activeFilter === 'cruce') && cruceList.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20 text-xs text-ink"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-red-800 dark:text-red-300 text-xs">
                        {alert.titulo}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200">
                        {alert.med}
                      </span>
                    </div>
                    <p className="text-ink leading-relaxed">
                      {alert.mensaje}
                    </p>
                    <div className="pt-1 text-red-900 dark:text-red-300 font-medium">
                      ↳ <strong>Acción clínica:</strong> {alert.accion}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 2. Coordinación con Comidas y Horarios (Ámbar) */}
            {(activeFilter === 'todos' || activeFilter === 'coordinacion') && coordList.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 text-xs text-ink"
              >
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-amber-800 dark:text-amber-300 text-xs">
                        {alert.titulo}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        {alert.med}
                      </span>
                    </div>
                    <p className="text-ink leading-relaxed">
                      {alert.mensaje}
                    </p>
                    <div className="pt-1 text-amber-900 dark:text-amber-300 font-medium">
                      ↳ <strong>Recomendación dietética:</strong> {alert.accion}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 3. Sinergia y Apoyo Nutricional (Verde / Azul) */}
            {(activeFilter === 'todos' || activeFilter === 'sinergia') && sinergiaList.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs text-ink"
              >
                <div className="flex items-start gap-2.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs">
                        {alert.titulo}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                        {alert.med}
                      </span>
                    </div>
                    <p className="text-ink leading-relaxed">
                      {alert.mensaje}
                    </p>
                    <div className="pt-1 text-emerald-900 dark:text-emerald-300 font-medium">
                      ↳ <strong>Sinergia con alimentos:</strong> {alert.accion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aviso de Prudencia Clínica */}
        <div className="mt-3 p-2.5 rounded bg-[var(--sunken)] border border-line text-[11px] text-muted flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
          <p className="leading-tight">{medAlerts.disclaimer}</p>
        </div>
      </div>

      {/* Notas adicionales de medicamentos (Retrocompatibilidad con texto libre) */}
      <div className="mt-3 pt-2">
        <button
          type="button"
          className="text-xs text-brand hover:underline flex items-center gap-1"
          onClick={() => setShowNotes(!showNotes)}
        >
          {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showNotes ? 'Ocultar texto libre / notas generales de medicamentos' : 'Ver / editar texto libre o notas clínicas de medicamentos'}</span>
        </button>

        {showNotes && (
          <div className="mt-2 pt-2 border-t border-line">
            <textarea
              className="inp text-xs"
              rows={2}
              placeholder="Texto libre de medicamentos y suplementos..."
              value={p.gen?.meds || ''}
              onChange={e => set('gen.meds', e.target.value)}
            />
          </div>
        )}
      </div>
    </section>
  );
}
