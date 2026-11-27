import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Baby, Activity, AlertTriangle, CheckCircle2, Info, ChevronRight, Sparkles, Scale, Heart, LayoutGrid
} from 'lucide-react';
import {
  GROWTH_CHARTS_CATALOG,
  getPatientEffectiveAge,
  getSuggestedChart,
  evaluateCatalogChart,
  PREGNANCY_CUTOFFS,
  evaluatePregnancyStatus,
  evaluatePediatricNutrition
} from '../data/growthChartsData.js';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);

export default function GrowthChartsView({ p, c, set, upd }) {
  const g = p.gen || {};
  const a = p.antro || {};

  const edadAnos = num(g.edad);
  const edadMeses = num(g.edadMeses);
  const isEmbarazada = Boolean(g.embarazada || num(g.semGestacional) > 0);
  const semGestacional = num(g.semGestacional);
  const pesoPregest = num(g.pesoPregestacional);

  const peso = num(a.peso);
  const talla = num(a.talla);
  const pc = num(a.pc);
  const sexo = g.sexo === 'F' ? 'F' : 'M';

  // Cálculo de edad efectiva total del paciente
  const effectiveAge = useMemo(() => {
    return getPatientEffectiveAge(edadAnos, edadMeses);
  }, [edadAnos, edadMeses]);

  // Determinación automática y estricta según edad del paciente:
  // - Menor de 19 años -> Gráficas de Crecimiento OMS (0 a 19 años)
  // - Mayor o igual a 19 años -> IMC de Adulto (OMS / OPS)
  // - Embarazada -> Curva Atalah / MINSAL
  const evaluationModel = useMemo(() => {
    if (isEmbarazada && sexo === 'F') return 'embarazada';
    if (effectiveAge.isUnder2 || effectiveAge.is2to5 || effectiveAge.is5to19) {
      return 'pediatrico';
    }
    if (effectiveAge.isAdult) {
      return 'adulto';
    }
    if (g.modeloEvaluacion && g.modeloEvaluacion !== 'auto') {
      return g.modeloEvaluacion;
    }
    return 'adulto';
  }, [isEmbarazada, sexo, effectiveAge, g.modeloEvaluacion]);

  // Sugerencia automática de gráficas según grupo de edad y sexo
  const suggested = useMemo(() => {
    return getSuggestedChart(effectiveAge, sexo);
  }, [effectiveAge, sexo]);

  // Estado de la gráfica seleccionada en el catálogo interactivo (por defecto la sugerida)
  const [selectedChartId, setSelectedChartId] = useState(suggested.defaultChartId);

  // Sincronizar automáticamente la gráfica sugerida cuando cambie el grupo de edad del paciente o el sexo
  useEffect(() => {
    if (suggested?.defaultChartId) {
      setSelectedChartId(suggested.defaultChartId);
    }
  }, [suggested.groupId, suggested.defaultChartId, sexo]);

  // Cálculos antropométricos generales
  const heightM = talla ? talla / 100 : null;
  const imc = peso && heightM ? peso / (heightM * heightM) : null;

  // Evaluación obstétrica
  const pregnancyResult = useMemo(() => {
    if (evaluationModel !== 'embarazada') return null;
    return evaluatePregnancyStatus(semGestacional, imc, pesoPregest, heightM);
  }, [evaluationModel, semGestacional, imc, pesoPregest, heightM]);

  // Evaluación pediátrica integral (multicriterio)
  const pediatricResult = useMemo(() => {
    if (evaluationModel !== 'pediatrico') return null;
    return evaluatePediatricNutrition({
      ageYears: edadAnos,
      ageMonths: edadMeses,
      sex: sexo,
      weightKg: peso,
      heightCm: talla,
      hcCm: pc
    });
  }, [evaluationModel, edadAnos, edadMeses, sexo, peso, talla, pc]);

  // Evaluación específica de la gráfica actualmente seleccionada en el catálogo
  const chartEval = useMemo(() => {
    if (evaluationModel !== 'pediatrico') return null;
    return evaluateCatalogChart(selectedChartId, {
      ageYears: edadAnos,
      ageMonths: edadMeses,
      sex: sexo,
      weightKg: peso,
      heightCm: talla,
      hcCm: pc
    });
  }, [evaluationModel, selectedChartId, edadAnos, edadMeses, sexo, peso, talla, pc]);

  // Dimensiones del gráfico SVG
  const svgWidth = 640;
  const svgHeight = 360;
  const padding = { top: 30, right: 35, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // ==== RENDERIZADOR DE GRÁFICA DE EMBARAZADA (ATALAH / MINSAL EL SALVADOR) ====
  const renderPregnancyChart = () => {
    const minW = 6, maxW = 42;
    const minImc = 16, maxImc = 40;

    const scaleX = w => padding.left + ((w - minW) / (maxW - minW)) * plotWidth;
    const scaleY = val => padding.top + plotHeight - ((val - minImc) / (maxImc - minImc)) * plotHeight;

    const pointsBajo = PREGNANCY_CUTOFFS.map(c => `${scaleX(c.week)},${scaleY(c.bajo)}`);
    const pointsNorm = PREGNANCY_CUTOFFS.map(c => `${scaleX(c.week)},${scaleY(c.normal)}`);
    const pointsSobre = PREGNANCY_CUTOFFS.map(c => `${scaleX(c.week)},${scaleY(c.sobrepeso)}`);

    // Polígonos de zonas coloreadas
    const polyBajo = [
      `${scaleX(minW)},${scaleY(minImc)}`,
      ...pointsBajo,
      `${scaleX(maxW)},${scaleY(minImc)}`
    ].join(' ');

    const polyNormal = [
      ...pointsBajo,
      ...([...pointsNorm].reverse())
    ].join(' ');

    const polySobrepeso = [
      ...pointsNorm,
      ...([...pointsSobre].reverse())
    ].join(' ');

    const polyObesidad = [
      ...pointsSobre,
      `${scaleX(maxW)},${scaleY(maxImc)}`,
      `${scaleX(minW)},${scaleY(maxImc)}`
    ].join(' ');

    const hasPatientPoint = semGestacional && imc && semGestacional >= minW && semGestacional <= maxW;
    const ptX = hasPatientPoint ? scaleX(semGestacional) : null;
    const ptY = hasPatientPoint ? scaleY(Math.min(maxImc, Math.max(minImc, imc))) : null;

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-surface border border-line rounded-lg shadow-2xs font-sans">
          {/* Zonas de clasificación */}
          <polygon points={polyObesidad} fill="#fecdd3" opacity="0.8" />
          <polygon points={polySobrepeso} fill="#fed7aa" opacity="0.8" />
          <polygon points={polyNormal} fill="#bbf7d0" opacity="0.8" />
          <polygon points={polyBajo} fill="#bfdbfe" opacity="0.8" />

          {/* Grid lines */}
          {Array.from({ length: 19 }).map((_, i) => {
            const w = minW + i * 2;
            const x = scaleX(w);
            return (
              <g key={`gx-${w}`}>
                <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotHeight} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                <text x={x} y={padding.top + plotHeight + 16} fontSize="9" textAnchor="middle" fill="var(--muted)">{w}</text>
              </g>
            );
          })}

          {Array.from({ length: 13 }).map((_, i) => {
            const val = minImc + i * 2;
            const y = scaleY(val);
            return (
              <g key={`gy-${val}`}>
                <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                <text x={padding.left - 8} y={y + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{val}</text>
              </g>
            );
          })}

          {/* Líneas divisorias */}
          <polyline points={pointsSobre.join(' ')} fill="none" stroke="#ea580c" strokeWidth="2" />
          <polyline points={pointsNorm.join(' ')} fill="none" stroke="#16a34a" strokeWidth="2" />
          <polyline points={pointsBajo.join(' ')} fill="none" stroke="#2563eb" strokeWidth="2" />

          {/* Etiquetas de zonas */}
          <text x={scaleX(38)} y={scaleY(36)} fill="#be123c" fontSize="11" fontWeight="bold">Obesidad</text>
          <text x={scaleX(38)} y={scaleY(30.5)} fill="#c2410c" fontSize="11" fontWeight="bold">Sobrepeso</text>
          <text x={scaleX(38)} y={scaleY(26)} fill="#15803d" fontSize="11" fontWeight="bold">Normal</text>
          <text x={scaleX(38)} y={scaleY(20)} fill="#1d4ed8" fontSize="11" fontWeight="bold">Bajo peso</text>

          {/* Ejes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />
          <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />

          {/* Títulos de ejes */}
          <text x={padding.left + plotWidth / 2} y={svgHeight - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ink)">
            SEMANA GESTACIONAL
          </text>
          <text
            x={-(padding.top + plotHeight / 2)}
            y={16}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="var(--ink)"
          >
            ÍNDICE DE MASA CORPORAL (IMC kg/m²)
          </text>

          {/* Punto de la paciente */}
          {hasPatientPoint && (
            <g>
              <circle cx={ptX} cy={ptY} r="10" fill="#dc2626" opacity="0.3" className="animate-ping" />
              <circle cx={ptX} cy={ptY} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <line x1={ptX} y1={ptY} x2={ptX} y2={padding.top + plotHeight} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={padding.left} y1={ptY} x2={ptX} y2={ptY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              <rect x={ptX - 45} y={ptY - 26} width="90" height="18" rx="4" fill="var(--ink)" opacity="0.9" />
              <text x={ptX} y={ptY - 14} fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                Sem {semGestacional} · IMC {f1(imc)}
              </text>
            </g>
          )}
        </svg>

        {!hasPatientPoint && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {!semGestacional
                ? 'Ingrese la semana de gestación (entre semana 6 y 42) en Datos del Paciente para graficar el punto sobre la curva.'
                : 'Ingrese peso y talla actuales para calcular el IMC y trazar la posición gestacional.'}
            </span>
          </div>
        )}
      </div>
    );
  };

  // ==== RENDERIZADOR DEL CATÁLOGO INTERACTIVO Y GRÁFICAS PEDIÁTRICAS (OMS 2006 / 2007 - MINSAL) ====
  const renderPediatricChart = () => {
    if (!chartEval) return null;
    const { chartMeta, chartGroup, curves, hasPatientPoint, ptX, ptY, ptLabel, diagnosis, level, interpCutText, isAgeMismatch, mismatchWarning } = chartEval;
    const { minX, maxX, minY, maxY, xLabel, yLabel } = chartMeta;

    const scaleX = x => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
    const scaleY = y => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

    const patientSvgX = hasPatientPoint ? scaleX(ptX) : null;
    const patientSvgY = hasPatientPoint ? scaleY(ptY) : null;

    // Calcular ticks agradables para el gráfico
    const numTicksX = 7;
    const numTicksY = 7;
    const ticksX = Array.from({ length: numTicksX }).map((_, i) => minX + i * ((maxX - minX) / (numTicksX - 1)));
    const ticksY = Array.from({ length: numTicksY }).map((_, i) => minY + i * ((maxY - minY) / (numTicksY - 1)));

    return (
      <div className="space-y-4">
        {/* 1. CATÁLOGO INTERACTIVO DE GRÁFICAS OFICIALES CON SUGERENCIA AUTOMÁTICA */}
        <div className="bg-sunken/60 rounded-xl border border-line p-3.5 space-y-3">
          {/* Banner de Sugerencia Automática */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-brand-soft/50 border border-brand/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand shrink-0" />
              <div className="text-xs text-ink font-semibold">
                <span>Gráficas sugeridas para este paciente </span>
                <span className="text-brand font-bold">({sexo === 'F' ? 'Femenino' : 'Masculino'} · {effectiveAge.formattedAge || 'Sin edad'}):</span>
              </div>
              <span className="pill text-[10px] font-bold bg-brand text-white shadow-xs">
                {suggested.groupName}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggested.suggestedChartIds.map(scId => {
                const scMeta = GROWTH_CHARTS_CATALOG.flatMap(g => g.charts).find(c => c.id === scId);
                if (!scMeta) return null;
                const isActive = selectedChartId === scId;
                return (
                  <button
                    key={scId}
                    type="button"
                    onClick={() => setSelectedChartId(scId)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-brand text-white border-brand font-bold shadow-xs'
                        : 'bg-surface text-ink border-line hover:border-brand/40'
                    }`}
                  >
                    <span className="font-extrabold text-[11px]">{scMeta.shortCode}</span>
                    <span className="hidden sm:inline">{scMeta.name.split('(')[0].trim()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 Grupos de Tablas Oficiales en Tarjetas Organizadas */}
          <div className="grid gap-3 md:grid-cols-3">
            {GROWTH_CHARTS_CATALOG.map(group => {
              const isGroupSuggested = suggested.groupId === group.groupId;
              return (
                <div
                  key={group.groupId}
                  className={`p-3 rounded-lg border transition-all ${
                    isGroupSuggested
                      ? 'border-brand/60 bg-surface shadow-2xs ring-1 ring-brand/20'
                      : 'border-line bg-surface/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink">{group.groupName}</span>
                        {isGroupSuggested && (
                          <span className="badge badge-primary text-[9px] px-1.5 py-0">Sugerido</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted">{group.norma} · {group.ageRangeText}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {group.charts.map(chart => {
                      const isChartActive = selectedChartId === chart.id;
                      return (
                        <button
                          key={chart.id}
                          type="button"
                          onClick={() => setSelectedChartId(chart.id)}
                          className={`w-full text-left p-2 rounded-md border text-xs transition-all flex items-center justify-between gap-2 ${
                            isChartActive
                              ? 'bg-brand text-white border-brand font-semibold shadow-xs'
                              : 'bg-surface-alt/70 text-ink border-line hover:bg-surface hover:border-line-hover'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                isChartActive ? 'bg-white/20 text-white' : 'bg-sunken text-brand'
                              }`}>
                                {chart.shortCode}
                              </span>
                              <span className="truncate">{chart.name}</span>
                            </div>
                          </div>
                          {isChartActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-white" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Alerta de Desajuste si el usuario selecciona manualmente una tabla que no corresponde a la edad del paciente */}
          {isAgeMismatch && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <strong>Esta gráfica no corresponde al rango de edad actual del paciente.</strong> El paciente tiene{' '}
                <span className="font-semibold">{effectiveAge.formattedAge || 'edad sin especificar'}</span>, mientras que esta tabla oficial está estandarizada para{' '}
                <span className="font-semibold">{chartGroup.ageRangeText}</span>.
              </div>
            </div>
          )}
        </div>

        {/* 2. TRAZADO DINÁMICO DE LA GRÁFICA SVG */}
        <div className="p-3 bg-surface rounded-xl border border-line shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="badge badge-primary text-[10px] px-2 py-0.5">{chartMeta.shortCode}</span>
              <span className="text-xs font-bold text-ink uppercase tracking-wide">
                {chartMeta.name} — Niñ{sexo === 'F' ? 'as' : 'os'} ({chartGroup.groupName})
              </span>
            </div>
            {hasPatientPoint && (
              <span className={`pill ${level} text-xs font-bold`}>
                Diagnóstico: {diagnosis}
              </span>
            )}
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-surface border border-line rounded-lg shadow-2xs font-sans">
            {/* Ejes X e Y */}
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />
            <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />

            {/* Grid lines X */}
            {ticksX.map(val => {
              const x = scaleX(val);
              return (
                <g key={`gx-${val}`}>
                  <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotHeight} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                  <text x={x} y={padding.top + plotHeight + 15} fontSize="9" textAnchor="middle" fill="var(--muted)">
                    {f1(val)}
                  </text>
                </g>
              );
            })}

            {/* Grid lines Y */}
            {ticksY.map(val => {
              const y = scaleY(val);
              return (
                <g key={`gy-${val}`}>
                  <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                  <text x={padding.left - 8} y={y + 3} fontSize="9" textAnchor="end" fill="var(--muted)">
                    {f0(val)}
                  </text>
                </g>
              );
            })}

            {/* Trazado de Curvas Normativas DE */}
            {curves.map(c => {
              const pointsStr = c.points.map(pt => `${scaleX(pt.x)},${scaleY(pt.y)}`).join(' ');
              const lastPt = c.points[c.points.length - 1];
              return (
                <g key={c.name}>
                  <polyline points={pointsStr} fill="none" stroke={c.color} strokeWidth="1.8" />
                  <text x={scaleX(lastPt.x) + 4} y={scaleY(lastPt.y) + 3} fontSize="8.5" fill={c.color} fontWeight="bold">
                    {c.name}
                  </text>
                </g>
              );
            })}

            {/* Títulos de Ejes */}
            <text x={padding.left + plotWidth / 2} y={svgHeight - 10} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--ink)">
              {xLabel}
            </text>
            <text
              x={-(padding.top + plotHeight / 2)}
              y={16}
              transform="rotate(-90)"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill="var(--ink)"
            >
              {yLabel}
            </text>

            {/* Punto del Paciente */}
            {hasPatientPoint && (
              <g>
                <circle cx={patientSvgX} cy={patientSvgY} r="10" fill="#dc2626" opacity="0.3" className="animate-ping" />
                <circle cx={patientSvgX} cy={patientSvgY} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                <line x1={patientSvgX} y1={patientSvgY} x2={patientSvgX} y2={padding.top + plotHeight} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
                <line x1={padding.left} y1={patientSvgY} x2={patientSvgX} y2={patientSvgY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
                <rect x={patientSvgX - 45} y={patientSvgY - 26} width="90" height="18" rx="4" fill="var(--ink)" opacity="0.9" />
                <text x={patientSvgX} y={patientSvgY - 14} fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                  {ptLabel}
                </text>
              </g>
            )}
          </svg>

          {/* Información y Cortes Estadísticos bajo la Gráfica */}
          <div className="mt-2.5 p-2.5 bg-surface-alt rounded-lg border border-line text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="font-semibold text-ink">
                {chartMeta.description}
              </div>
              {interpCutText && (
                <div className="text-[11px] text-muted">
                  <strong>Puntos de corte normativos calculados:</strong> {interpCutText}
                </div>
              )}
            </div>
            {hasPatientPoint ? (
              <span className={`pill ${level} text-xs font-bold`}>
                {diagnosis}
              </span>
            ) : (
              <span className="text-xs text-muted italic">
                {isAgeMismatch
                  ? 'Punto no trazable: la edad actual está fuera del rango de este indicador.'
                  : 'Ingrese edad, peso y talla para trazar la posición exacta del paciente sobre esta curva.'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==== RENDERIZADOR DE EVALUACIÓN ANTROPOMÉTRICA DE ADULTO ====
  const renderAdultChart = () => {
    const isAdultoMayor = edadAnos != null && edadAnos >= 65;
    const currentImc = imc;
    const imcSecoVal = c.imcSeco;

    // Rango visual para la barra de IMC: 14 a 44 kg/m²
    const minVal = 14, maxVal = 44;
    const getPosPct = v => Math.min(100, Math.max(0, ((v - minVal) / (maxVal - minVal)) * 100));

    // Rangos según OMS convencional o OPS Adulto Mayor
    const ranges = isAdultoMayor ? [
      { name: 'Bajo peso', from: 14, to: 23, color: '#38bdf8' },
      { name: 'Normal (OPS)', from: 23, to: 28, color: '#22c55e' },
      { name: 'Sobrepeso', from: 28, to: 32, color: '#eab308' },
      { name: 'Obesidad', from: 32, to: 44, color: '#ef4444' },
    ] : [
      { name: 'Bajo peso', from: 14, to: 18.5, color: '#38bdf8' },
      { name: 'Normal (OMS)', from: 18.5, to: 24.9, color: '#22c55e' },
      { name: 'Sobrepeso', from: 25.0, to: 29.9, color: '#eab308' },
      { name: 'Obesidad I', from: 30.0, to: 34.9, color: '#f97316' },
      { name: 'Obesidad II', from: 35.0, to: 39.9, color: '#ef4444' },
      { name: 'Obesidad III', from: 40.0, to: 44, color: '#991b1b' },
    ];

    const markerPct = currentImc ? getPosPct(currentImc) : null;
    const secoMarkerPct = imcSecoVal ? getPosPct(imcSecoVal) : null;

    return (
      <div className="space-y-4">
        {/* Calibrador de IMC en Adulto */}
        <div className="p-4 bg-sunken rounded-xl border border-line">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Calibrador Visual de IMC {isAdultoMayor ? '(Criterios OPS · Adulto Mayor ≥ 65 años)' : '(Puntos de Corte Estándar OMS)'}
              </span>
              <div className="text-[11px] text-muted">
                {isAdultoMayor
                  ? 'Bajo peso < 23 · Normal 23 a 28 · Sobrepeso 28 a 32 · Obesidad > 32 kg/m²'
                  : 'Bajo peso < 18.5 · Normal 18.5 a 24.9 · Sobrepeso 25 a 29.9 · Obesidad ≥ 30 kg/m²'}
              </div>
            </div>
            {c.imcCl && (
              <span className={`pill ${c.imcCl.level} text-xs font-bold`}>
                IMC: {f1(currentImc)} kg/m² · {c.imcCl.label}
              </span>
            )}
          </div>

          {/* Barra Visual de Espectro de IMC */}
          <div className="relative pt-6 pb-2">
            {/* Marcador del Paciente */}
            {markerPct != null && (
              <div
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-300 z-10"
                style={{ left: `${markerPct}%` }}
              >
                <div className="px-2 py-0.5 rounded bg-ink text-surface text-[10px] font-bold shadow-sm whitespace-nowrap">
                  {f1(currentImc)} kg/m²
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-ink" />
              </div>
            )}

            {/* Barra de segmentos */}
            <div className="h-6 w-full rounded-md overflow-hidden flex shadow-inner border border-line">
              {ranges.map(rg => {
                const wPct = ((rg.to - rg.from) / (maxVal - minVal)) * 100;
                return (
                  <div
                    key={rg.name}
                    style={{ width: `${wPct}%`, backgroundColor: rg.color }}
                    className="h-full relative group transition-opacity hover:opacity-90 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow"
                    title={`${rg.name}: ${rg.from} - ${rg.to} kg/m²`}
                  >
                    <span className="hidden sm:inline truncate px-1">{rg.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Si existe Peso Seco, marcador secundario */}
            {secoMarkerPct != null && (
              <div
                className="absolute bottom-[-14px] -translate-x-1/2 flex flex-col items-center transition-all duration-300 z-10"
                style={{ left: `${secoMarkerPct}%` }}
              >
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-brand" />
                <div className="px-1.5 py-0.2 rounded bg-brand text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                  Seco: {f1(imcSecoVal)}
                </div>
              </div>
            )}

            {/* Escala numérica inferior */}
            <div className="flex justify-between text-[10px] text-muted num mt-1 px-1">
              <span>14</span>
              <span>18.5</span>
              <span>25.0</span>
              <span>30.0</span>
              <span>35.0</span>
              <span>40+</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Parámetros Antropométricos de Adulto */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="p-3 bg-surface rounded-lg border border-line shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-ink">Circunferencia de Cintura</span>
              {c.cinturaCl && <span className={`pill ${c.cinturaCl.level} text-[10px]`}>{c.cinturaCl.label}</span>}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="num text-2xl font-bold text-ink">{c.cintura != null ? f1(c.cintura) : '—'}</span>
              <span className="text-xs text-muted">cm</span>
            </div>
            <div className="text-[11px] text-muted mt-1">
              {sexo === 'M' ? 'Corte: Normal < 94 · Riesgo ≥ 102 cm' : 'Corte: Normal < 80 · Riesgo ≥ 88 cm'}
            </div>
          </div>

          <div className="p-3 bg-surface rounded-lg border border-line shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-ink">Índice Cintura / Cadera</span>
              {c.iccCl && <span className={`pill ${c.iccCl.level} text-[10px]`}>{c.iccCl.label}</span>}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="num text-2xl font-bold text-ink">{c.icc != null ? f2(c.icc) : '—'}</span>
            </div>
            <div className="text-[11px] text-muted mt-1">
              {sexo === 'M' ? 'Límite normal: ≤ 0.90 (Androide si > 0.90)' : 'Límite normal: ≤ 0.85 (Androide si > 0.85)'}
            </div>
          </div>

          <div className="p-3 bg-surface rounded-lg border border-line shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-ink">Masa Muscular / Grasa</span>
              {c.gc != null && <span className="pill ok text-[10px]">{f1(c.gc)}% grasa</span>}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="num text-lg font-bold text-ink">{c.ambc != null ? `${f1(c.ambc)} cm²` : '—'}</span>
              <span className="text-[11px] text-muted">cAMB (Heymsfield)</span>
            </div>
            <div className="text-[11px] text-muted mt-1">
              {c.pesoSeco != null ? `Peso seco activo: ${f1(c.pesoSeco)} kg` : (c.pAj != null ? `Peso ajustado: ${f1(c.pAj)} kg` : 'Reserva muscular y grasa')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card p-5 border-l-4 border-l-brand bg-surface">
      {/* Encabezado del Módulo Antropométrico Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="eyebrow" style={{ fontSize: '.7rem', color: 'var(--brand)' }}>
                {evaluationModel === 'embarazada'
                  ? 'MINSAL EL SALVADOR · ATALAH'
                  : evaluationModel === 'pediatrico'
                  ? 'MINSAL UNIDAD DE NUTRICIÓN · OMS 2006/2007'
                  : 'EVALUACIÓN ANTROPOMÉTRICA DE ADULTO'}
              </span>
              <span className="badge badge-primary text-[10px] py-0.5 px-2">
                Curvas Oficiales
              </span>
            </div>
            <h3 className="h3 mb-0 text-ink">
              {evaluationModel === 'embarazada'
                ? 'Curva de Evaluación Nutricional de la Embarazada (IMC / Semanas)'
                : evaluationModel === 'pediatrico'
                ? 'Catálogo de Gráficas de Crecimiento (OMS / MINSAL)'
                : 'Diagnóstico Antropométrico de Adulto'}
            </h3>
          </div>
        </div>

        {/* Selector de Población / Modelo */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg shadow-2xs border border-line p-0.5 bg-sunken">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'adulto' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, modeloEvaluacion: 'adulto', embarazada: false } }));
              }}
              title="Evaluación de Adulto (IMC según criterios OMS / OPS para mayores de 19 años)"
            >
              Adulto (IMC ≥ 19 a)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'pediatrico' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, modeloEvaluacion: 'pediatrico', embarazada: false } }));
              }}
              title="Gráficas de Crecimiento OMS (MINSAL El Salvador para menores de 19 años)"
            >
              Pediatría (OMS &lt; 19 a)
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'embarazada' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, modeloEvaluacion: 'embarazada', embarazada: true, sexo: 'F' } }));
              }}
              title="Evaluación Nutricional de la Embarazada (Atalah / MINSAL)"
            >
              Embarazada
            </button>
          </div>
        </div>
      </div>

      {/* Indicador informativo de criterio aplicado */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-surface-alt border border-line text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand shrink-0" />
          <span className="text-ink">
            {evaluationModel === 'pediatrico' ? (
              <>
                <strong>Criterio Pediátrico y Adolescente Activo (OMS):</strong> Paciente menor de 19 años ({effectiveAge.formattedAge || 'edad no especificada'}). Se evalúa con las <strong>Tablas Oficiales de Crecimiento OMS 2006 y 2007 (MINSAL El Salvador)</strong> según su grupo de edad y sexo ({sexo === 'F' ? 'Femenino' : 'Masculino'}).
              </>
            ) : evaluationModel === 'adulto' ? (
              <>
                <strong>Criterio de Adulto Activo:</strong> Paciente de 19 años o más ({effectiveAge.formattedAge || 'edad no especificada'}). Se evalúa el estado nutricional mediante <strong>Índice de Masa Corporal (IMC)</strong> {edadAnos >= 65 ? 'bajo criterios OPS (Adulto Mayor)' : 'según puntos de corte estándar de la OMS'}.
              </>
            ) : (
              <>
                <strong>Criterio Obstétrico Activo:</strong> Evaluación gestacional mediante curva de Atalah / MINSAL según semanas de amenorrea e IMC.
              </>
            )}
          </span>
        </div>
        <span className="pill text-[10px] font-bold uppercase tracking-wider shrink-0 bg-brand-soft text-brand">
          {evaluationModel === 'pediatrico' ? 'OMS < 19 AÑOS' : evaluationModel === 'adulto' ? 'IMC ADULTO ≥ 19 AÑOS' : 'GESTACIONAL'}
        </span>
      </div>

      {/* Inputs específicos para el modelo */}
      {evaluationModel === 'embarazada' && (
        <div className="mb-4 p-3 bg-brand-soft/30 border border-brand/20 rounded-lg grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <label className="font-semibold text-ink block mb-1">Semana Gestacional:</label>
            <input
              type="number"
              min="6"
              max="42"
              className="inp text-xs"
              placeholder="Ej. 24"
              value={g.semGestacional || ''}
              onChange={e => set('gen.semGestacional', e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Peso Pregestacional (kg):</label>
            <input
              type="number"
              step="any"
              className="inp text-xs"
              placeholder="Ej. 58.5"
              value={g.pesoPregestacional || ''}
              onChange={e => set('gen.pesoPregestacional', e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Estado de Gestación:</label>
            <div className="text-muted pt-2">
              {semGestacional
                ? `Trimestre ${semGestacional < 14 ? '1°' : semGestacional < 28 ? '2°' : '3°'} (${semGestacional} semanas)`
                : 'Ingrese semanas'}
            </div>
          </div>
        </div>
      )}

      {evaluationModel === 'pediatrico' && (
        <div className="mb-4 p-3 bg-brand-soft/30 border border-brand/20 rounded-lg grid gap-3 sm:grid-cols-4 text-xs">
          <div>
            <label className="font-semibold text-ink block mb-1">Edad en Años:</label>
            <input
              type="number"
              min="0"
              max="19"
              className="inp text-xs"
              value={g.edad || ''}
              onChange={e => set('gen.edad', e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Edad en Meses cumplidos:</label>
            <input
              type="number"
              min="0"
              max="228"
              className="inp text-xs"
              placeholder="Ej. 18"
              value={g.edadMeses || ''}
              onChange={e => set('gen.edadMeses', e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Perímetro Cefálico (cm):</label>
            {effectiveAge.isUnder2 ? (
              <input
                type="number"
                step="any"
                className="inp text-xs"
                placeholder="0-24m (ej. 45)"
                value={a.pc || ''}
                onChange={e => set('antro.pc', e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="text"
                  disabled
                  className="inp text-xs opacity-50 cursor-not-allowed bg-[var(--sunken)]"
                  value={a.pc || ''}
                  placeholder="Solo aplicable de 0 a 24 meses"
                />
                <span className="text-[10px] text-muted italic block mt-0.5">
                  Solo aplicable de 0 a 24 meses (desactivado para ≥ 2 años)
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Tipo de Medición:</label>
            <select
              className="inp text-xs"
              value={a.longitudTipo || (effectiveAge.isUnder2 ? 'acostado' : 'de_pie')}
              onChange={e => set('antro.longitudTipo', e.target.value)}
            >
              <option value="de_pie">De pie (Estatura / Talla)</option>
              <option value="acostado">Acostado (Longitud recumbente)</option>
            </select>
          </div>
        </div>
      )}

      {/* Área del Gráfico Interactivo */}
      <div className="mb-4">
        {evaluationModel === 'embarazada' && renderPregnancyChart()}
        {evaluationModel === 'pediatrico' && renderPediatricChart()}
        {evaluationModel === 'adulto' && renderAdultChart()}
      </div>

      {/* Diagnóstico Antropométrico y Conexión en Cascada con el PAN */}
      <div className="p-4 rounded-lg border bg-surface-alt border-line">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-xs font-bold text-ink uppercase tracking-wider">
              Diagnóstico Antropométrico Derivado y Conexión en Cascada con el PAN:
            </span>
          </div>
          {evaluationModel === 'embarazada' && pregnancyResult && (
            <span className={`pill ${pregnancyResult.level} text-xs font-bold`}>
              {pregnancyResult.diagnosis}
            </span>
          )}
          {evaluationModel === 'pediatrico' && chartEval && (
            <span className={`pill ${chartEval.level} text-xs font-bold`}>
              {chartEval.chartMeta.shortCode}: {chartEval.diagnosis}
            </span>
          )}
          {evaluationModel === 'adulto' && c.imcCl && (
            <span className={`pill ${c.imcCl.level} text-xs font-bold`}>
              {c.imcCl.label}
            </span>
          )}
        </div>

        {evaluationModel === 'embarazada' && pregnancyResult && (
          <div className="text-xs text-ink space-y-1.5 leading-relaxed">
            <div>
              <strong>Diagnóstico Gestacional:</strong> Paciente en semana {pregnancyResult.week} con IMC de {f1(pregnancyResult.imc)} kg/m², clasificada en <strong>{pregnancyResult.diagnosis}</strong> según la curva de Atalah / MINSAL El Salvador.
            </div>
            <div>
              <strong>Meta de ganancia de peso total (IOM / MINSAL):</strong> {pregnancyResult.targetGain} ({pregnancyResult.weeklyGainRate}).
            </div>
            <div className="text-muted pt-1 border-t border-line">
              <strong>Impacto en Requerimientos y Prescripción:</strong> Adición energética de {semGestacional < 14 ? '+0 kcal (1er T)' : semGestacional < 28 ? '+340 kcal/día (2do T)' : '+452 kcal/día (3er T)'}, proteína adicional de +25 g/día para síntesis de tejidos materno-fetales, y dieta de consistencia fraccionada rica en folatos, hierro y calcio sin restricción calórica perjudicial.
            </div>
          </div>
        )}

        {evaluationModel === 'pediatrico' && chartEval && (
          <div className="text-xs text-ink space-y-1.5 leading-relaxed">
            <div>
              <strong>Diagnóstico Pediátrico para la Gráfica Activa ({chartEval.chartMeta.name}):</strong>{' '}
              <strong className="text-brand">{chartEval.diagnosis}</strong> (Norma: {chartEval.chartGroup.norma}).
            </div>
            {pediatricResult && Object.keys(pediatricResult.indicators).length > 0 && (
              <div className="pt-1">
                <span className="font-semibold text-muted">Evaluación integral según datos ingresados:</span>
                <div className="grid gap-1 sm:grid-cols-2 mt-1">
                  {Object.entries(pediatricResult.indicators).map(([k, ind]) => (
                    <div key={k} className="flex items-center gap-1.5 text-[11px] p-1 rounded bg-surface border border-line">
                      <span className="text-muted font-medium">• {ind.name}:</span>
                      <span className="font-semibold text-ink">{ind.diag}</span>
                      <span className="num text-muted">({f1(ind.value)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="text-muted pt-1 border-t border-line">
              <strong>Impacto en Requerimientos y Prescripción:</strong> Se aplican requerimientos energéticos infantojuveniles (fórmulas Schofield / FAO-OMS pediátricas) garantizando proteína y micronutrientes para crecimiento estatural, evitando dietas hipocalóricas restrictivas.
            </div>
          </div>
        )}

        {evaluationModel === 'adulto' && (
          <div className="text-xs text-ink space-y-1.5 leading-relaxed">
            <div>
              <strong>Diagnóstico Antropométrico de Adulto:</strong> Paciente clasificado en <strong>{c.imcCl?.label || 'Sin clasificar'}</strong> con un IMC de <strong>{f1(c.imc)} kg/m²</strong> ({c.imcEscala}).
              {c.pesoSeco != null && (
                <span> · Con peso seco ({f1(c.pesoSeco)} kg): IMC {f1(c.imcSeco)} kg/m².</span>
              )}
            </div>
            {c.cinturaCl && (
              <div>
                <strong>Riesgo Cardiovascular (Cintura):</strong> {f1(c.cintura)} cm — <strong>{c.cinturaCl.label}</strong> {c.icc != null ? `(ICC: ${f2(c.icc)} · distribución ${c.iccCl?.label || ''})` : ''}.
              </div>
            )}
            <div className="text-muted pt-1 border-t border-line">
              <strong>Impacto en Requerimientos y Prescripción:</strong> Determinación del peso de cálculo (peso real, seco, ideal Hamwi o ajustado en obesidad), cálculo de gasto energético con factor de actividad física, factor de estrés y <strong>Factor Térmico de los Alimentos (ETA)</strong>, cuadrando la distribución de macronutrientes e intercambios con los lineamientos de la RIISS.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
