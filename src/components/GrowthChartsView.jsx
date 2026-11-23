import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Baby, Activity, AlertTriangle, CheckCircle2, Info, ChevronRight, Sparkles, Scale, Heart
} from 'lucide-react';
import {
  PREGNANCY_CUTOFFS, evaluatePregnancyStatus,
  WHO_0_24_MONTHS, WHO_2_5_YEARS, WHO_5_19_YEARS,
  evaluatePediatricNutrition
} from '../data/growthChartsData.js';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');

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

  // Determinación automática del modelo de evaluación
  const evaluationModel = useMemo(() => {
    if (isEmbarazada) return 'embarazada';
    if (edadAnos != null && edadAnos < 19) return 'pediatrico';
    if (edadMeses != null && edadMeses < 228) return 'pediatrico';
    return 'adulto';
  }, [isEmbarazada, edadAnos, edadMeses]);

  // Subindicador activo para pediatría
  const defaultPediatricSub = useMemo(() => {
    const m = edadMeses != null ? edadMeses : (edadAnos != null ? edadAnos * 12 : 24);
    if (m <= 24) return 'w_age';
    if (m < 60) return 'w_h';
    return 'bmi_age';
  }, [edadMeses, edadAnos]);

  const [pediatricIndicator, setPediatricIndicator] = useState(defaultPediatricSub);

  // Cálculos de evaluación
  const heightM = talla ? talla / 100 : null;
  const imc = peso && heightM ? peso / (heightM * heightM) : null;

  const pregnancyResult = useMemo(() => {
    if (evaluationModel !== 'embarazada') return null;
    return evaluatePregnancyStatus(semGestacional, imc, pesoPregest, heightM);
  }, [evaluationModel, semGestacional, imc, pesoPregest, heightM]);

  const pediatricResult = useMemo(() => {
    if (evaluationModel !== 'pediatrico') return null;
    return evaluatePediatricNutrition({
      ageYears: edadAnos,
      ageMonths: edadMeses,
      sexo,
      weightKg: peso,
      heightCm: talla,
      hcCm: pc
    });
  }, [evaluationModel, edadAnos, edadMeses, sexo, peso, talla, pc]);

  // Dimensiones del gráfico SVG
  const svgWidth = 640;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };
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
              {/* Círculo pulsante */}
              <circle cx={ptX} cy={ptY} r="10" fill="#dc2626" opacity="0.3" className="animate-ping" />
              <circle cx={ptX} cy={ptY} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              {/* Líneas guía */}
              <line x1={ptX} y1={ptY} x2={ptX} y2={padding.top + plotHeight} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={padding.left} y1={ptY} x2={ptX} y2={ptY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              {/* Etiqueta del punto */}
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

  // ==== RENDERIZADOR DE GRÁFICAS PEDIÁTRICAS (OMS 2006 / 2007 - MINSAL) ====
  const renderPediatricChart = () => {
    const isUnder2 = (edadMeses != null && edadMeses <= 24) || (edadAnos != null && edadAnos < 2);
    const is2to5 = !isUnder2 && ((edadAnos != null && edadAnos < 5) || (edadMeses != null && edadMeses < 60));
    const is5to19 = !isUnder2 && !is2to5;

    let title = '';
    let xLabel = '';
    let yLabel = '';
    let minX = 0, maxX = 24, minY = 0, maxY = 20;
    let curves = [];
    let patientPt = null;

    if (isUnder2) {
      const data = WHO_0_24_MONTHS[sexo];
      if (pediatricIndicator === 'w_age') {
        title = `Peso para la Edad (Niñ${sexo === 'F' ? 'as' : 'os'} 0 a 24 meses - OMS 2006)`;
        xLabel = 'Edad (Meses)';
        yLabel = 'Peso (kg)';
        minX = 0; maxX = 24; minY = 2; maxY = 16;
        curves = [
          { name: '+2 DE', points: data.weightForAge.map(p => ({ x: p.m, y: p.sd2pos })), color: '#dc2626' },
          { name: '0 (Mediana)', points: data.weightForAge.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (D)', points: data.weightForAge.map(p => ({ x: p.m, y: p.sd2neg })), color: '#ea580c' },
          { name: '-3 DE (DS)', points: data.weightForAge.map(p => ({ x: p.m, y: p.sd3neg })), color: '#b91c1c' },
        ];
        if (edadMeses != null && peso) patientPt = { x: edadMeses, y: peso, label: `${edadMeses} m · ${f1(peso)} kg` };
      } else if (pediatricIndicator === 'l_age') {
        title = `Longitud para la Edad (Niñ${sexo === 'F' ? 'as' : 'os'} 0 a 24 meses - OMS 2006)`;
        xLabel = 'Edad (Meses)';
        yLabel = 'Longitud (cm)';
        minX = 0; maxX = 24; minY = 40; maxY = 100;
        curves = [
          { name: '+2 DE (A)', points: data.lengthForAge.map(p => ({ x: p.m, y: p.sd2pos })), color: '#2563eb' },
          { name: '0 (N)', points: data.lengthForAge.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (R)', points: data.lengthForAge.map(p => ({ x: p.m, y: p.sd2neg })), color: '#ea580c' },
          { name: '-3 DE (RS)', points: data.lengthForAge.map(p => ({ x: p.m, y: p.sd3neg })), color: '#b91c1c' },
        ];
        if (edadMeses != null && talla) patientPt = { x: edadMeses, y: talla, label: `${edadMeses} m · ${f1(talla)} cm` };
      } else {
        title = `Perímetro Cefálico (Niñ${sexo === 'F' ? 'as' : 'os'} 0 a 24 meses - OMS 2006)`;
        xLabel = 'Edad (Meses)';
        yLabel = 'Perímetro Cefálico (cm)';
        minX = 0; maxX = 24; minY = 30; maxY = 54;
        curves = [
          { name: '+2 DE (MAC)', points: data.hcForAge.map(p => ({ x: p.m, y: p.sd2pos })), color: '#dc2626' },
          { name: '0 (N)', points: data.hcForAge.map(p => ({ x: p.m, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (MIC)', points: data.hcForAge.map(p => ({ x: p.m, y: p.sd2neg })), color: '#b91c1c' },
        ];
        if (edadMeses != null && pc) patientPt = { x: edadMeses, y: pc, label: `${edadMeses} m · ${f1(pc)} cm` };
      }
    } else if (is2to5) {
      const data = WHO_2_5_YEARS[sexo];
      if (pediatricIndicator === 'w_h' || !pediatricIndicator) {
        title = `Peso para la Talla (Niñ${sexo === 'F' ? 'as' : 'os'} 2 a 5 años - OMS 2006)`;
        xLabel = 'Talla (cm)';
        yLabel = 'Peso (kg)';
        minX = 75; maxX = 120; minY = 6; maxY = 36;
        curves = [
          { name: '+3 DE (OB)', points: data.weightForHeight.map(p => ({ x: p.h, y: p.sd3pos })), color: '#b91c1c' },
          { name: '+2 DE (SP)', points: data.weightForHeight.map(p => ({ x: p.h, y: p.sd2pos })), color: '#ea580c' },
          { name: '0 (N)', points: data.weightForHeight.map(p => ({ x: p.h, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (D)', points: data.weightForHeight.map(p => ({ x: p.h, y: p.sd2neg })), color: '#f59e0b' },
          { name: '-3 DE (DS)', points: data.weightForHeight.map(p => ({ x: p.h, y: p.sd3neg })), color: '#7f1d1d' },
        ];
        if (talla && peso) patientPt = { x: talla, y: peso, label: `${f1(talla)} cm · ${f1(peso)} kg` };
      } else {
        title = `Talla para la Edad (Niñ${sexo === 'F' ? 'as' : 'os'} 2 a 5 años - OMS 2006)`;
        xLabel = 'Edad (Años)';
        yLabel = 'Talla (cm)';
        minX = 2; maxX = 5; minY = 75; maxY = 125;
        curves = [
          { name: '+2 DE (A)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd2pos })), color: '#2563eb' },
          { name: '0 (N)', points: data.heightForAge.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (R)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd2neg })), color: '#ea580c' },
          { name: '-3 DE (RS)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd3neg })), color: '#b91c1c' },
        ];
        if (edadAnos && talla) patientPt = { x: edadAnos, y: talla, label: `${f1(edadAnos)} a · ${f1(talla)} cm` };
      }
    } else {
      // 5 a 19 años
      const data = WHO_5_19_YEARS[sexo];
      if (pediatricIndicator === 'bmi_age' || !pediatricIndicator) {
        title = `IMC para la Edad (Niñ${sexo === 'F' ? 'as' : 'os'} y Adolescentes 5 a 19 años - OMS 2007)`;
        xLabel = 'Edad (Años)';
        yLabel = 'IMC (kg/m²)';
        minX = 5; maxX = 19; minY = 10; maxY = 36;
        curves = [
          { name: '+2 DE (Obesidad)', points: data.bmiForAge.map(p => ({ x: p.y, y: p.sd2pos })), color: '#b91c1c' },
          { name: '+1 DE (Sobrepeso)', points: data.bmiForAge.map(p => ({ x: p.y, y: p.sd1pos })), color: '#ea580c' },
          { name: '0 (Normal)', points: data.bmiForAge.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (Delgadez)', points: data.bmiForAge.map(p => ({ x: p.y, y: p.sd2neg })), color: '#f59e0b' },
          { name: '-3 DE (Delgadez Severa)', points: data.bmiForAge.map(p => ({ x: p.y, y: p.sd3neg })), color: '#7f1d1d' },
        ];
        if (edadAnos && imc) patientPt = { x: edadAnos, y: imc, label: `${f1(edadAnos)} a · IMC ${f1(imc)}` };
      } else {
        title = `Talla para la Edad (5 a 19 años - OMS 2007)`;
        xLabel = 'Edad (Años)';
        yLabel = 'Talla (cm)';
        minX = 5; maxX = 19; minY = 90; maxY = 200;
        curves = [
          { name: '+3 DE (Talla Alta)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd3pos })), color: '#2563eb' },
          { name: '0 (Normal)', points: data.heightForAge.map(p => ({ x: p.y, y: p.m0 })), color: '#16a34a' },
          { name: '-2 DE (Retardo en Talla)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd2neg })), color: '#ea580c' },
          { name: '-3 DE (Retardo Severo)', points: data.heightForAge.map(p => ({ x: p.y, y: p.sd3neg })), color: '#b91c1c' },
        ];
        if (edadAnos && talla) patientPt = { x: edadAnos, y: talla, label: `${f1(edadAnos)} a · ${f1(talla)} cm` };
      }
    }

    const scaleX = x => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
    const scaleY = y => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

    const hasPt = patientPt && patientPt.x >= minX && patientPt.x <= maxX && patientPt.y >= minY && patientPt.y <= maxY;
    const ptX = hasPt ? scaleX(patientPt.x) : null;
    const ptY = hasPt ? scaleY(patientPt.y) : null;

    return (
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-ink uppercase tracking-wider">{title}</span>
          <div className="flex gap-1">
            {isUnder2 && [
              ['w_age', 'Peso/Edad'],
              ['l_age', 'Longitud/Edad'],
              ['hc_age', 'Perímetro Cefálico']
            ].map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                className={`px-2 py-0.5 text-xs rounded border ${pediatricIndicator === k ? 'bg-brand text-white border-brand font-bold' : 'bg-surface text-ink border-line'}`}
                onClick={() => setPediatricIndicator(k)}
              >
                {lbl}
              </button>
            ))}
            {is2to5 && [
              ['w_h', 'Peso/Talla'],
              ['h_age', 'Talla/Edad']
            ].map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                className={`px-2 py-0.5 text-xs rounded border ${pediatricIndicator === k ? 'bg-brand text-white border-brand font-bold' : 'bg-surface text-ink border-line'}`}
                onClick={() => setPediatricIndicator(k)}
              >
                {lbl}
              </button>
            ))}
            {is5to19 && [
              ['bmi_age', 'IMC/Edad'],
              ['h_age', 'Talla/Edad']
            ].map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                className={`px-2 py-0.5 text-xs rounded border ${pediatricIndicator === k ? 'bg-brand text-white border-brand font-bold' : 'bg-surface text-ink border-line'}`}
                onClick={() => setPediatricIndicator(k)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto bg-surface border border-line rounded-lg shadow-2xs font-sans">
          {/* Ejes */}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />
          <line x1={padding.left} y1={padding.top + plotHeight} x2={padding.left + plotWidth} y2={padding.top + plotHeight} stroke="var(--ink)" strokeWidth="1.2" />

          {/* Grid lines X */}
          {Array.from({ length: 9 }).map((_, i) => {
            const val = minX + i * ((maxX - minX) / 8);
            const x = scaleX(val);
            return (
              <g key={`px-${val}`}>
                <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotHeight} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                <text x={x} y={padding.top + plotHeight + 15} fontSize="9" textAnchor="middle" fill="var(--muted)">{f1(val)}</text>
              </g>
            );
          })}

          {/* Grid lines Y */}
          {Array.from({ length: 9 }).map((_, i) => {
            const val = minY + i * ((maxY - minY) / 8);
            const y = scaleY(val);
            return (
              <g key={`py-${val}`}>
                <line x1={padding.left} y1={y} x2={padding.left + plotWidth} y2={y} stroke="var(--line)" strokeWidth="0.6" strokeDasharray="2,2" />
                <text x={padding.left - 8} y={y + 3} fontSize="9" textAnchor="end" fill="var(--muted)">{f0(val)}</text>
              </g>
            );
          })}

          {/* Trazado de Curvas */}
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
          {hasPt && (
            <g>
              <circle cx={ptX} cy={ptY} r="10" fill="#dc2626" opacity="0.3" className="animate-ping" />
              <circle cx={ptX} cy={ptY} r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
              <line x1={ptX} y1={ptY} x2={ptX} y2={padding.top + plotHeight} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={padding.left} y1={ptY} x2={ptX} y2={ptY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />
              <rect x={ptX - 45} y={ptY - 26} width="90" height="18" rx="4" fill="var(--ink)" opacity="0.9" />
              <text x={ptX} y={ptY - 14} fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                {patientPt.label}
              </text>
            </g>
          )}
        </svg>

        {!hasPt && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Ingrese edad, peso y talla completos del paciente pediátrico para trazar su punto sobre la curva OMS.</span>
          </div>
        )}
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
                ? 'Gráficas de Crecimiento Pediátrico y Adolescente (OMS)'
                : 'Diagnóstico Antropométrico de Adulto'}
            </h3>
          </div>
        </div>

        {/* Selector de Población / Modelo */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg shadow-2xs border border-line p-0.5 bg-sunken">
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'embarazada' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, embarazada: true } }));
              }}
            >
              Embarazada
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'pediatrico' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, embarazada: false, edad: x.gen.edad && num(x.gen.edad) < 19 ? x.gen.edad : '12' } }));
              }}
            >
              Pediatría
            </button>
            <button
              type="button"
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${evaluationModel === 'adulto' ? 'bg-brand text-white shadow-xs' : 'text-muted hover:text-ink'}`}
              onClick={() => {
                upd(x => ({ ...x, gen: { ...x.gen, embarazada: false, edad: x.gen.edad && num(x.gen.edad) >= 19 ? x.gen.edad : '35' } }));
              }}
            >
              Adulto
            </button>
          </div>
        </div>
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
            <input
              type="number"
              step="any"
              className="inp text-xs"
              placeholder="0-24m (ej. 45)"
              value={a.pc || ''}
              onChange={e => set('antro.pc', e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold text-ink block mb-1">Tipo de Medición:</label>
            <select
              className="inp text-xs"
              value={a.longitudTipo || 'de_pie'}
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
        {evaluationModel === 'adulto' && (
          <div className="p-4 bg-sunken rounded-lg border border-line text-xs">
            <h4 className="font-bold text-ink mb-1">Evaluación Antropométrica de Adulto (Estándar OMS)</h4>
            <p className="text-muted leading-relaxed">
              El paciente adulto es evaluado con los puntos de corte estándar de la OMS (IMC &lt; 18.5 Bajo peso, 18.5–24.9 Normal, 25–29.9 Sobrepeso, &ge; 30 Obesidad), circunferencia de cintura, área muscular del brazo corregida (Heymsfield) y grasa corporal (Durnin-Womersley).
            </p>
          </div>
        )}
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
          {evaluationModel === 'pediatrico' && pediatricResult && (
            <span className={`pill ${pediatricResult.level} text-xs font-bold`}>
              {pediatricResult.primaryDiagnosis}
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

        {evaluationModel === 'pediatrico' && pediatricResult && (
          <div className="text-xs text-ink space-y-1.5 leading-relaxed">
            <div>
              <strong>Diagnóstico Nutricional Pediátrico:</strong> <strong>{pediatricResult.primaryDiagnosis}</strong> (según curvas de referencia OMS 2006 / 2007 adoptadas por la Unidad de Nutrición del MINSAL).
            </div>
            {Object.entries(pediatricResult.indicators).map(([k, ind]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-muted">• {ind.name}:</span>
                <span className="font-semibold">{ind.diag}</span>
                <span className="num text-muted">({f1(ind.value)})</span>
              </div>
            ))}
            <div className="text-muted pt-1 border-t border-line">
              <strong>Impacto en Requerimientos y Prescripción:</strong> Se aplican requerimientos energéticos infantojuveniles (fórmulas Schofield / FAO-OMS pediátricas) garantizando proteína y micronutrientes para crecimiento estatural, evitando dietas hipocalóricas restrictivas.
            </div>
          </div>
        )}

        {evaluationModel === 'adulto' && (
          <div className="text-xs text-ink">
            IMC actual de <strong>{f1(c.imc)} kg/m²</strong> ({c.imcCl?.label || 'Sin datos'}), evaluado con puntos de corte convencionales para adultos.
          </div>
        )}
      </div>
    </div>
  );
}
