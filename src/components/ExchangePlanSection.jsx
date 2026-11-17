import React, { useState, useMemo } from 'react';
import {
  Calculator, Utensils, BookOpen, Sparkles, RefreshCw, Check, Search, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import {
  EXCHANGE_GROUPS, MEAL_TIMES, FOOD_EXCHANGE_CATALOG, generateMealMenuFromExchanges
} from '../data/exchangeDatabase.js';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);

// Reparte un total de intercambios en los 5 tiempos según pesos (permite medios intercambios 0.5 o enteros)
function splitExchanges(total, weights, allowHalf = false) {
  const factor = allowHalf ? 2 : 1;
  const units = Math.round(total * factor);
  const sw = weights.reduce((a, b) => a + b, 0);
  if (!units || !sw) return weights.map(() => 0);
  const raw = weights.map(x => (x / sw) * units);
  const fl = raw.map(Math.floor);
  const rest = units - fl.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - fl[i], i]).sort((a, b) => b[0] - a[0]);
  for (let j = 0; j < rest; j++) {
    fl[order[j % order.length][1]]++;
  }
  return fl.map(u => u / factor);
}

export default function ExchangePlanSection({ p, c, set, upd, Pill }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalogGroup, setActiveCatalogGroup] = useState('all');

  const m = c.macros;
  const vctMeta = c.vct || 0;
  const choMetaG = m ? m.c.g : 0;
  const chonMetaG = m ? m.p.g : 0;
  const coohMetaG = m ? m.l.g : 0;

  const choMetaKcal = m ? m.c.kcal : 0;
  const chonMetaKcal = m ? m.p.kcal : 0;
  const coohMetaKcal = m ? m.l.kcal : 0;

  const choMetaPct = m ? m.c.pct : 0;
  const chonMetaPct = m ? m.p.pct : 0;
  const coohMetaPct = m ? m.l.pct : 0;

  // Obtiene el N° de intercambios de la Tabla 1 (o la suma de los tiempos si no se ha fijado aparte)
  const getGroupTotal = (gk) => {
    const tMap = p.plan.totals || {};
    if (tMap[gk] !== undefined && tMap[gk] !== '') {
      return num(tMap[gk]) || 0;
    }
    const eqRow = (p.plan.eq && p.plan.eq[gk]) || [];
    return eqRow.reduce((acc, v) => acc + (num(v) || 0), 0);
  };

  const getGroupTotalRaw = (gk) => {
    const tMap = p.plan.totals || {};
    if (tMap[gk] !== undefined) return tMap[gk];
    const eqRow = (p.plan.eq && p.plan.eq[gk]) || [];
    const sum = eqRow.reduce((acc, v) => acc + (num(v) || 0), 0);
    return sum > 0 ? String(sum) : '';
  };

  const setGroupTotal = (gk, val) => {
    set('plan.totals.' + gk, val);
  };

  // Cálculos paso a paso idénticos a la tabla de Excel
  const excelCalc = useMemo(() => {
    const byGroup = {};
    EXCHANGE_GROUPS.forEach(g => {
      const nInt = getGroupTotal(g.k);
      byGroup[g.k] = {
        ...g,
        nInt,
        cho: nInt * g.cho,
        p: nInt * g.p,
        l: nInt * g.l,
        kcal: nInt * g.kcal
      };
    });

    const sumStep = (stepNums) => {
      const res = { nInt: 0, cho: 0, p: 0, l: 0, kcal: 0 };
      EXCHANGE_GROUPS.filter(g => stepNums.includes(g.step)).forEach(g => {
        const item = byGroup[g.k];
        res.nInt += item.nInt;
        res.cho += item.cho;
        res.p += item.p;
        res.l += item.l;
        res.kcal += item.kcal;
      });
      return res;
    };

    // Bloque 1: Incaparina, Leches, Vegetales S/A, Frutas
    const step1 = sumStep([1]);
    const choRestante = choMetaG - step1.cho;
    const almidonesSugeridos = choRestante / 15;

    // Bloque 2: Almidones y Otros CHO
    const step2Only = sumStep([2]);
    const cumStep2 = {
      nInt: step2Only.nInt,
      cho: step1.cho + step2Only.cho,
      p: step1.p + step2Only.p,
      l: step1.l + step2Only.l,
      kcal: step1.kcal + step2Only.kcal
    };
    const chonRestante = chonMetaG - cumStep2.p;
    const protSugeridas = chonRestante / 7;

    // Bloque 3: Proteínas
    const step3Only = sumStep([3]);
    const cumStep3 = {
      nInt: step3Only.nInt,
      cho: cumStep2.cho + step3Only.cho,
      p: cumStep2.p + step3Only.p,
      l: cumStep2.l + step3Only.l,
      kcal: cumStep2.kcal + step3Only.kcal
    };
    const coohRestante = coohMetaG - cumStep3.l;
    const grasasSugeridas = coohRestante / 5;

    // Bloque 4: Grasas y Alcohol
    const step4Only = sumStep([4]);
    const totalGeneral = {
      nInt: step1.nInt + step2Only.nInt + step3Only.nInt + step4Only.nInt,
      cho: cumStep3.cho + step4Only.cho,
      p: cumStep3.p + step4Only.p,
      l: cumStep3.l + step4Only.l,
      kcal: cumStep3.kcal + step4Only.kcal
    };

    // % de Adecuación y margen de error (95 - 105%)
    const adecCho = choMetaG > 0 ? (totalGeneral.cho / choMetaG) * 100 : null;
    const adecChon = chonMetaG > 0 ? (totalGeneral.p / chonMetaG) * 100 : null;
    const adecCooh = coohMetaG > 0 ? (totalGeneral.l / coohMetaG) * 100 : null;
    const adecKcal = vctMeta > 0 ? (totalGeneral.kcal / vctMeta) * 100 : null;
    const diffKcal = vctMeta > 0 ? vctMeta - totalGeneral.kcal : null;

    return {
      byGroup,
      step1,
      choRestante,
      almidonesSugeridos,
      step2Only,
      cumStep2,
      chonRestante,
      protSugeridas,
      step3Only,
      cumStep3,
      coohRestante,
      grasasSugeridas,
      step4Only,
      totalGeneral,
      adecCho,
      adecChon,
      adecCooh,
      adecKcal,
      diffKcal
    };
  }, [p.plan.totals, p.plan.eq, choMetaG, chonMetaG, coohMetaG, vctMeta]);

  // Cálculos de la Tabla 2: Distribución por Tiempos de Comida
  const distCalc = useMemo(() => {
    const eqs = p.plan.eq || {};
    const rows = EXCHANGE_GROUPS.map(g => {
      const targetInt = excelCalc.byGroup[g.k].nInt;
      const mealInts = MEAL_TIMES.map((_, i) => num((eqs[g.k] || [])[i]) || 0);
      const mealKcals = mealInts.map(val => val * g.kcal);
      const sumMealInt = mealInts.reduce((a, b) => a + b, 0);
      const remainingInt = targetInt - sumMealInt;
      return {
        g,
        targetInt,
        mealInts,
        mealKcals,
        sumMealInt,
        remainingInt,
        totalKcal: sumMealInt * g.kcal
      };
    });

    const mealTotals = MEAL_TIMES.map((mt, i) => {
      let inter = 0;
      let kcal = 0;
      let cho = 0;
      let p = 0;
      let l = 0;
      rows.forEach(r => {
        const count = r.mealInts[i];
        inter += count;
        kcal += r.mealKcals[i];
        cho += count * r.g.cho;
        p += count * r.g.p;
        l += count * r.g.l;
      });
      // % de distribución respecto al VCT meta (como en el Excel) o respecto al total del plan
      const baseKcal = vctMeta > 0 ? vctMeta : (excelCalc.totalGeneral.kcal || 1);
      const pctVct = baseKcal > 0 ? (kcal / baseKcal) * 100 : 0;
      const pctPlan = excelCalc.totalGeneral.kcal > 0 ? (kcal / excelCalc.totalGeneral.kcal) * 100 : 0;
      const inRange = pctVct >= mt.minPct - 0.5 && pctVct <= mt.maxPct + 0.5;
      return {
        ...mt,
        inter,
        kcal,
        cho,
        p,
        l,
        pctVct,
        pctPlan,
        inRange
      };
    });

    const totalRemainingInt = rows.reduce((a, r) => a + r.remainingInt, 0);
    const totalDistributedInt = rows.reduce((a, r) => a + r.sumMealInt, 0);
    const totalDistributedKcal = mealTotals.reduce((a, m) => a + m.kcal, 0);

    return {
      rows,
      mealTotals,
      totalRemainingInt,
      totalDistributedInt,
      totalDistributedKcal
    };
  }, [p.plan.eq, excelCalc, vctMeta]);

  // Sugerencias automáticas de menú por tiempo de comida basadas en el PDF
  const suggestedMenus = useMemo(() => {
    return generateMealMenuFromExchanges(p.plan.eq || {}, variantIdx);
  }, [p.plan.eq, variantIdx]);

  // Acción 1: Calcular intercambios automáticamente para cuadrar metas (95-105%)
  const handleAutoCalculateExchanges = () => {
    if (!m || !vctMeta) return;
    const kc = vctMeta;

    // Paso 1: Lácteos, Vegetales S/A y Frutas
    const leche_sd = kc >= 1800 ? 2 : 1;
    const veg_sa = kc >= 2000 ? 4 : 3;
    const frutas = kc >= 1800 ? 3 : 2;

    const choStep1 = leche_sd * 12 + veg_sa * 5 + frutas * 15;
    const pStep1 = leche_sd * 8 + veg_sa * 2;
    const lStep1 = leche_sd * 5;

    // Paso 2: Almidones por diferencia de CHO
    const choRest = Math.max(0, choMetaG - choStep1);
    const almidones = Math.max(1, Math.round(choRest / 15));

    // Paso 3: Proteínas por diferencia de CHON
    const pCum2 = pStep1 + almidones * 3;
    const lCum2 = lStep1 + almidones * 1;
    const pRest = Math.max(0, chonMetaG - pCum2);
    const totalProtInt = Math.max(1, Math.round(pRest / 7));

    // Dividir proteína entre magra y semimagra cuidando las grasas
    const prot_sm = Math.min(totalProtInt, Math.max(1, Math.floor(totalProtInt * 0.5)));
    const prot_magra = Math.max(0, totalProtInt - prot_sm);

    // Paso 4: Grasas por diferencia de COOH
    const lCum3 = lCum2 + prot_magra * 2 + prot_sm * 5;
    const lRest = Math.max(0, coohMetaG - lCum3);
    const grasas = Math.max(0, Math.round(lRest / 5));

    const newTotals = {
      incaparina: '',
      leche_dc: '',
      leche_sd: String(leche_sd),
      leche_entera: '',
      veg_sa: String(veg_sa),
      frutas: String(frutas),
      almidones: String(almidones),
      otros_cho: '',
      prot_magra: prot_magra ? String(prot_magra) : '',
      prot_sm: prot_sm ? String(prot_sm) : '',
      prot_grasa: '',
      grasas: grasas ? String(grasas) : '',
      alcohol: ''
    };

    // También distribuir automáticamente en los 5 tiempos respetando los rangos (30-35%, 5-10%, 25-30%, 5-10%, 20-25%)
    const newEq = buildMealDistributionFromTotals(newTotals);

    upd(x => {
      let y = { ...x, plan: { ...x.plan, totals: newTotals, eq: newEq } };
      return y;
    });
  };

  // Construye distribución en los 5 tiempos de comida respetando rangos %
  const buildMealDistributionFromTotals = (totalsMap) => {
    // Pesos por tiempo: [Desayuno (32%), Merienda AM (8%), Almuerzo (28%), Merienda PM (8%), Cena (24%)]
    const W = {
      incaparina: [0.5, 0.25, 0, 0, 0.25],
      leche_dc: [0.45, 0.15, 0, 0.15, 0.25],
      leche_sd: [0.45, 0.15, 0, 0.15, 0.25],
      leche_entera: [0.5, 0.2, 0, 0, 0.3],
      veg_sa: [0.25, 0, 0.45, 0, 0.30],
      frutas: [0.30, 0.35, 0, 0.35, 0],
      almidones: [0.32, 0.07, 0.31, 0.07, 0.23],
      otros_cho: [0.3, 0.3, 0.2, 0.2, 0],
      prot_magra: [0.25, 0, 0.45, 0, 0.30],
      prot_sm: [0.35, 0, 0.35, 0, 0.30],
      prot_grasa: [0.4, 0, 0.3, 0, 0.3],
      grasas: [0.35, 0.05, 0.32, 0.05, 0.23],
      alcohol: [0, 0, 0.5, 0, 0.5]
    };

    const newEq = {};
    EXCHANGE_GROUPS.forEach(g => {
      const tot = num(totalsMap[g.k]) || 0;
      if (tot > 0) {
        const hasHalf = (tot % 1) !== 0;
        const dist = splitExchanges(tot, W[g.k] || [0.3, 0.1, 0.3, 0.1, 0.2], hasHalf);
        newEq[g.k] = dist.map(v => v > 0 ? String(v) : '');
      } else {
        newEq[g.k] = ['', '', '', '', ''];
      }
    });
    return newEq;
  };

  // Botón para distribuir los intercambios actuales de la Tabla 1 hacia la Tabla 2
  const handleDistributeCurrentTotals = () => {
    const currentTotals = {};
    EXCHANGE_GROUPS.forEach(g => {
      const val = excelCalc.byGroup[g.k].nInt;
      currentTotals[g.k] = val > 0 ? String(val) : '';
    });
    const newEq = buildMealDistributionFromTotals(currentTotals);
    upd(x => ({
      ...x,
      plan: { ...x.plan, totals: currentTotals, eq: newEq }
    }));
  };

  // Copiar sugerencias generadas al menú editable del paciente
  const handleApplySuggestedMenuToPatient = () => {
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        menu: {
          ...x.plan.menu,
          ...suggestedMenus
        }
      }
    }));
  };

  const handleClearAll = () => {
    upd(x => ({
      ...x,
      plan: { ...x.plan, totals: {}, eq: {} }
    }));
  };

  // Filtrado del catálogo de alimentos del PDF
  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return FOOD_EXCHANGE_CATALOG
      .filter(cat => activeCatalogGroup === 'all' || cat.groupKey === activeCatalogGroup)
      .map(cat => {
        if (!q) return cat;
        const matchingSubs = cat.subcategories
          .map(sub => ({
            ...sub,
            items: sub.items.filter(it =>
              it.food.toLowerCase().includes(q) || it.portion.toLowerCase().includes(q)
            )
          }))
          .filter(sub => sub.items.length > 0);
        return matchingSubs.length > 0 ? { ...cat, subcategories: matchingSubs } : null;
      })
      .filter(Boolean);
  }, [catalogSearch, activeCatalogGroup]);

  const adequacyBadge = (pct) => {
    if (pct == null || !Number.isFinite(pct)) return <span className="pill na">Sin meta</span>;
    if (pct >= 95 && pct <= 105) return <span className="pill ok">✓ {f1(pct)}% (En rango 95-105%)</span>;
    if (pct >= 90 && pct <= 110) return <span className="pill warn">{pct > 100 ? '↑' : '↓'} {f1(pct)}% (Cercano)</span>;
    return <span className="pill crit">{pct > 100 ? '↑' : '↓'} {f1(pct)}% (Fuera de 95-105%)</span>;
  };

  return (
    <div className="grid gap-5">
      {/* 1. ENCABEZADO Y METAS DE MACRONUTRIENTES (MODELO EXCEL) */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand" />
              <h2 className="h2 mb-0">1. Cálculo de Intercambios de Alimentos (Modelo Clínico)</h2>
            </div>
            <p className="hint mt-1">
              Basado en las <strong>Listas de Intercambio para la Diabetes</strong> (CHO, CHON, Grasas y Kcal) y cuadre progresivo por pasos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              disabled={!m}
              style={{ opacity: m ? 1 : 0.5 }}
              onClick={handleAutoCalculateExchanges}
            >
              <Sparkles className="w-4 h-4" /> Calcular y Distribuir Automáticamente
            </button>
            <button className="btn" onClick={handleClearAll}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Resumen de Metas de Macronutrientes (Tabla derecha superior del Excel) */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] mb-5">
          <div className="p-3.5 rounded-lg border border-line bg-sunken">
            <div className="eyebrow mb-2">Fórmula de Cuadre Progresivo (Pasos 1 → 4)</div>
            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <div className="p-2.5 rounded bg-surface border border-line">
                <div className="text-muted font-medium">1. Cuadre de Almidones (CHO)</div>
                <div className="num text-sm font-semibold mt-1">
                  CHO restante: {f1(excelCalc.choRestante)} g
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted">÷ 15 g = <strong>{f1(excelCalc.almidonesSugeridos)} int.</strong></span>
                  {excelCalc.almidonesSugeridos > 0 && (
                    <button
                      className="chipbtn py-0.5 px-2 text-[11px]"
                      onClick={() => setGroupTotal('almidones', String(Math.round(excelCalc.almidonesSugeridos)))}
                    >
                      Usar {Math.round(excelCalc.almidonesSugeridos)}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface border border-line">
                <div className="text-muted font-medium">2. Cuadre de Proteínas (CHON)</div>
                <div className="num text-sm font-semibold mt-1">
                  CHON restante: {f1(excelCalc.chonRestante)} g
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted">÷ 7 g = <strong>{f1(excelCalc.protSugeridas)} int.</strong></span>
                  {excelCalc.protSugeridas > 0 && (
                    <button
                      className="chipbtn py-0.5 px-2 text-[11px]"
                      onClick={() => setGroupTotal('prot_sm', String(Math.round(excelCalc.protSugeridas)))}
                    >
                      Usar {Math.round(excelCalc.protSugeridas)} SM
                    </button>
                  )}
                </div>
              </div>

              <div className="p-2.5 rounded bg-surface border border-line">
                <div className="text-muted font-medium">3. Cuadre de Grasas (COOH)</div>
                <div className="num text-sm font-semibold mt-1">
                  COOH restante: {f1(excelCalc.coohRestante)} g
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted">÷ 5 g = <strong>{f1(excelCalc.grasasSugeridas)} int.</strong></span>
                  {excelCalc.grasasSugeridas > 0 && (
                    <button
                      className="chipbtn py-0.5 px-2 text-[11px]"
                      onClick={() => setGroupTotal('grasas', String(Math.round(excelCalc.grasasSugeridas)))}
                    >
                      Usar {Math.round(excelCalc.grasasSugeridas)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Cuadro de Macronutrientes Meta como en el Excel */}
          <div className="border border-line rounded-lg overflow-hidden">
            <table className="tbl text-xs">
              <thead>
                <tr className="bg-sunken">
                  <th>Macronutrientes (Meta)</th>
                  <th className="r">%</th>
                  <th className="r">Kcal</th>
                  <th className="r">gr</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">CHO (Carbohidratos)</td>
                  <td className="r num">{m ? f0(choMetaPct) + '%' : '—'}</td>
                  <td className="r num">{m ? f0(choMetaKcal) : '—'}</td>
                  <td className="r num font-semibold">{m ? f2(choMetaG) : '—'}</td>
                </tr>
                <tr>
                  <td className="font-medium">CHON (Proteínas)</td>
                  <td className="r num">{m ? f0(chonMetaPct) + '%' : '—'}</td>
                  <td className="r num">{m ? f0(chonMetaKcal) : '—'}</td>
                  <td className="r num font-semibold">{m ? f2(chonMetaG) : '—'}</td>
                </tr>
                <tr>
                  <td className="font-medium">COOH (Grasas)</td>
                  <td className="r num">{m ? f0(coohMetaPct) + '%' : '—'}</td>
                  <td className="r num">{m ? f0(coohMetaKcal) : '—'}</td>
                  <td className="r num font-semibold">{m ? f2(coohMetaG) : '—'}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Total Meta</td>
                  <td className="r num">{m ? f0(m.totalPct) + '%' : '—'}</td>
                  <td className="r num">{vctMeta ? f0(vctMeta) : '—'}</td>
                  <td className="r num">{m ? f1(choMetaG + chonMetaG + coohMetaG) : '—'}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* TABLA 1: CÁLCULO DE INTERCAMBIOS PASO A PASO (IDÉNTICA AL EXCEL) */}
        <div className="overflow-x-auto border border-line rounded-lg">
          <table className="tbl" style={{ minWidth: '48rem' }}>
            <thead>
              <tr className="bg-sunken">
                <th>Lista de alimentos</th>
                <th style={{ width: '9rem', textAlign: 'center' }}>N° de intercambios</th>
                <th className="r">CHO gr</th>
                <th className="r">CHON gr</th>
                <th className="r">Grasas gr</th>
                <th className="r">kcal</th>
                <th className="r text-muted">Aporte unitario (1 op.)</th>
              </tr>
            </thead>
            <tbody>
              {/* PASO 1 */}
              {EXCHANGE_GROUPS.filter(g => g.step === 1).map(g => {
                const row = excelCalc.byGroup[g.k];
                return (
                  <tr key={g.k}>
                    <td className="font-medium">{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onChange={e => setGroupTotal(g.k, e.target.value)}
                        aria-label={`Intercambios de ${g.n}`}
                      />
                    </td>
                    <td className="r num">{row.nInt ? f1(row.cho) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.p) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.l) : '0'}</td>
                    <td className="r num font-medium">{row.nInt ? f0(row.kcal) : '0'}</td>
                    <td className="r num text-xs text-muted">{g.cho}C · {g.p}P · {g.l}G · {g.kcal} kcal</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'var(--sunken)', fontWeight: 600 }}>
                <td>TOTAL (Lácteos, Vegetales y Frutas)</td>
                <td style={{ textAlign: 'center' }} className="num">{f1(excelCalc.step1.nInt)}</td>
                <td className="r num">{f1(excelCalc.step1.cho)}</td>
                <td className="r num">{f1(excelCalc.step1.p)}</td>
                <td className="r num">{f1(excelCalc.step1.l)}</td>
                <td className="r num">{f0(excelCalc.step1.kcal)}</td>
                <td className="r text-xs text-brand">
                  CHO rest: {f1(excelCalc.choRestante)} g → {f1(excelCalc.almidonesSugeridos)} int.
                </td>
              </tr>

              {/* PASO 2 */}
              {EXCHANGE_GROUPS.filter(g => g.step === 2).map(g => {
                const row = excelCalc.byGroup[g.k];
                return (
                  <tr key={g.k}>
                    <td className="font-medium">{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onChange={e => setGroupTotal(g.k, e.target.value)}
                        aria-label={`Intercambios de ${g.n}`}
                      />
                    </td>
                    <td className="r num">{row.nInt ? f1(row.cho) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.p) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.l) : '0'}</td>
                    <td className="r num font-medium">{row.nInt ? f0(row.kcal) : '0'}</td>
                    <td className="r num text-xs text-muted">{g.cho}C · {g.p}P · {g.l}G · {g.kcal} kcal</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'var(--sunken)', fontWeight: 600 }}>
                <td>TOTAL Acumulado (con Almidones)</td>
                <td style={{ textAlign: 'center' }} className="num">{f1(excelCalc.step2Only.nInt)}</td>
                <td className="r num">{f1(excelCalc.cumStep2.cho)}</td>
                <td className="r num">{f1(excelCalc.cumStep2.p)}</td>
                <td className="r num">{f1(excelCalc.cumStep2.l)}</td>
                <td className="r num">{f0(excelCalc.cumStep2.kcal)}</td>
                <td className="r text-xs text-brand">
                  CHON rest: {f1(excelCalc.chonRestante)} g → {f1(excelCalc.protSugeridas)} int.
                </td>
              </tr>

              {/* PASO 3 */}
              {EXCHANGE_GROUPS.filter(g => g.step === 3).map(g => {
                const row = excelCalc.byGroup[g.k];
                return (
                  <tr key={g.k}>
                    <td className="font-medium">{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onChange={e => setGroupTotal(g.k, e.target.value)}
                        aria-label={`Intercambios de ${g.n}`}
                      />
                    </td>
                    <td className="r num">{row.nInt ? f1(row.cho) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.p) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.l) : '0'}</td>
                    <td className="r num font-medium">{row.nInt ? f0(row.kcal) : '0'}</td>
                    <td className="r num text-xs text-muted">{g.cho}C · {g.p}P · {g.l}G · {g.kcal} kcal</td>
                  </tr>
                );
              })}
              <tr style={{ background: 'var(--sunken)', fontWeight: 600 }}>
                <td>TOTAL Acumulado (con Proteínas)</td>
                <td style={{ textAlign: 'center' }} className="num">{f1(excelCalc.step3Only.nInt)}</td>
                <td className="r num">{f1(excelCalc.cumStep3.cho)}</td>
                <td className="r num">{f1(excelCalc.cumStep3.p)}</td>
                <td className="r num">{f1(excelCalc.cumStep3.l)}</td>
                <td className="r num">{f0(excelCalc.cumStep3.kcal)}</td>
                <td className="r text-xs text-brand">
                  COOH rest: {f1(excelCalc.coohRestante)} g → {f1(excelCalc.grasasSugeridas)} int.
                </td>
              </tr>

              {/* PASO 4 */}
              {EXCHANGE_GROUPS.filter(g => g.step === 4).map(g => {
                const row = excelCalc.byGroup[g.k];
                return (
                  <tr key={g.k}>
                    <td className="font-medium">{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onChange={e => setGroupTotal(g.k, e.target.value)}
                        aria-label={`Intercambios de ${g.n}`}
                      />
                    </td>
                    <td className="r num">{row.nInt ? f1(row.cho) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.p) : '0'}</td>
                    <td className="r num">{row.nInt ? f1(row.l) : '0'}</td>
                    <td className="r num font-medium">{row.nInt ? f0(row.kcal) : '0'}</td>
                    <td className="r num text-xs text-muted">{g.cho}C · {g.p}P · {g.l}G · {g.kcal} kcal</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--brand-soft)' }}>
                <td className="font-bold">TOTAL GENERAL DEL PLAN</td>
                <td style={{ textAlign: 'center' }} className="num font-bold">{f1(excelCalc.totalGeneral.nInt)}</td>
                <td className="r num font-bold">{f1(excelCalc.totalGeneral.cho)} g</td>
                <td className="r num font-bold">{f1(excelCalc.totalGeneral.p)} g</td>
                <td className="r num font-bold">{f1(excelCalc.totalGeneral.l)} g</td>
                <td className="r num font-bold">{f0(excelCalc.totalGeneral.kcal)} kcal</td>
                <td className="r text-xs">
                  {excelCalc.diffKcal != null ? `Dif: ${excelCalc.diffKcal > 0 ? '-' : '+'}${f0(Math.abs(excelCalc.diffKcal))} kcal` : ''}
                </td>
              </tr>
              <tr>
                <td>% de adecuación</td>
                <td style={{ textAlign: 'center' }} className="text-xs text-muted">Meta: 100%</td>
                <td className="r">{adequacyBadge(excelCalc.adecCho)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecChon)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecCooh)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecKcal)}</td>
                <td className="r text-xs text-muted">Rango clínico</td>
              </tr>
              <tr>
                <td className="text-xs text-muted">Rango de margen de error</td>
                <td />
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">± 100 kcal</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 2. DISTRIBUCIÓN DE INTERCAMBIOS POR TIEMPOS DE COMIDA (TABLA DERECHA DEL EXCEL) */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand" />
              <h2 className="h2 mb-0">2. Distribución por Tiempos de Comida y Calorías</h2>
            </div>
            <p className="hint mt-1">
              Distribuya los intercambios en los 5 tiempos de comida verificando que la columna <strong>Por distribuir</strong> quede en 0 y el <strong>% de distribución</strong> cumpla la meta de cada tiempo.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleDistributeCurrentTotals}
            disabled={excelCalc.totalGeneral.nInt === 0}
            style={{ opacity: excelCalc.totalGeneral.nInt > 0 ? 1 : 0.5 }}
          >
            <ArrowRight className="w-4 h-4" /> Auto-distribuir intercambios en los 5 tiempos
          </button>
        </div>

        <div className="overflow-x-auto border border-line rounded-lg">
          <table className="tbl" style={{ minWidth: '64rem' }}>
            <thead>
              <tr className="bg-sunken">
                <th className="stick" rowSpan={2}>Alimentos</th>
                <th className="r" rowSpan={2} title="Intercambios de la Tabla 1 pendientes de asignar a un tiempo de comida">
                  Por distribuir
                </th>
                {MEAL_TIMES.map(mt => (
                  <th key={mt.k} colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                    <div>{mt.n}</div>
                    <div className="text-[10px] font-normal text-muted">Meta: {mt.rangeLabel}</div>
                  </th>
                ))}
              </tr>
              <tr className="bg-sunken">
                {MEAL_TIMES.map(mt => (
                  <React.Fragment key={mt.k}>
                    <th style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }}>Inter</th>
                    <th className="r">Kcal</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {distCalc.rows.map(r => {
                const isPending = Math.abs(r.remainingInt) > 0.01;
                return (
                  <tr key={r.g.k}>
                    <td className="stick font-medium" style={{ minWidth: '12rem' }}>
                      {r.g.n}
                      {r.targetInt > 0 && (
                        <span className="ml-1.5 text-xs text-muted num">({r.targetInt})</span>
                      )}
                    </td>
                    <td className="r num">
                      {r.targetInt > 0 || r.sumMealInt > 0 ? (
                        <span className={`pill ${!isPending ? 'ok' : r.remainingInt > 0 ? 'warn' : 'crit'}`}>
                          {r.remainingInt === 0 ? '0 ✓' : r.remainingInt > 0 ? `Faltan ${f1(r.remainingInt)}` : `Excede ${f1(Math.abs(r.remainingInt))}`}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">0</span>
                      )}
                    </td>
                    {MEAL_TIMES.map((mt, mIdx) => {
                      const valStr = ((p.plan.eq && p.plan.eq[r.g.k]) || [])[mIdx] ?? '';
                      const kcalVal = r.mealKcals[mIdx];
                      return (
                        <React.Fragment key={mt.k}>
                          <td style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                            <input
                              className="inp inp-sm"
                              inputMode="decimal"
                              placeholder="0"
                              value={valStr}
                              onChange={e => set(`plan.eq.${r.g.k}.${mIdx}`, e.target.value)}
                              aria-label={`${r.g.n} en ${mt.n}`}
                            />
                          </td>
                          <td className="r num text-muted">
                            {kcalVal > 0 ? f0(kcalVal) : '0'}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="stick font-bold" style={{ background: 'var(--sunken)' }}>TOTAL</td>
                <td className="r num font-bold">
                  {distCalc.totalRemainingInt === 0 ? '0 ✓' : f1(distCalc.totalRemainingInt)}
                </td>
                {distCalc.mealTotals.map(mt => (
                  <React.Fragment key={mt.k}>
                    <td style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }} className="num font-bold">
                      {f1(mt.inter)}
                    </td>
                    <td className="r num font-bold text-brand">
                      {f0(mt.kcal)} kcal
                    </td>
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <td className="stick text-xs text-muted" style={{ background: 'var(--sunken)' }}>Rango recomendado</td>
                <td className="r text-xs text-muted">100%</td>
                {MEAL_TIMES.map(mt => (
                  <td key={mt.k} colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }} className="text-xs text-muted num">
                    {mt.rangeLabel}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="stick text-xs font-semibold" style={{ background: 'var(--sunken)' }}>% de distribución real</td>
                <td className="r num text-xs">
                  {f0(distCalc.totalDistributedKcal)} kcal
                </td>
                {distCalc.mealTotals.map(mt => (
                  <td key={mt.k} colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid var(--line)' }}>
                    {mt.kcal > 0 ? (
                      <span className={`pill ${mt.inRange ? 'ok' : 'warn'}`}>
                        {mt.inRange ? '✓ ' : ''}{f1(mt.pctVct)}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted">0.0%</span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 3. SUGERENCIAS AUTOMÁTICAS DE TIEMPOS DE COMIDA RESPETANDO LA LISTA DE INTERCAMBIOS DEL DOCUMENTO */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand" />
              <h2 className="h2 mb-0">3. Sugerencias de Menú por Tiempo de Comida (Listas de Intercambio)</h2>
            </div>
            <p className="hint mt-1">
              Generadas automáticamente respetando el número exacto de intercambios asignados en cada tiempo y las porciones oficiales del documento <em>Listas de Alimentos para la Diabetes</em>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-sm"
              onClick={() => setVariantIdx(v => v + 1)}
              title="Generar otra combinación equivalente de alimentos del documento"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Variar opciones de alimentos
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleApplySuggestedMenuToPatient}
            >
              <Check className="w-3.5 h-3.5" /> Aplicar sugerencias al menú del reporte
            </button>
          </div>
        </div>

        {/* Tarjetas de sugerencia en vivo + edición */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {distCalc.mealTotals.map((mt) => {
            const sugText = suggestedMenus[mt.k];
            const currentMenu = (p.plan.menu && p.plan.menu[mt.k]) || '';
            return (
              <div key={mt.k} className="rounded-lg border border-line p-4 flex flex-col justify-between bg-surface">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-line">
                    <span className="font-semibold text-sm text-brand">{mt.n}</span>
                    <span className="num text-xs text-muted">
                      {f0(mt.kcal)} kcal ({f1(mt.pctVct)}%)
                    </span>
                  </div>

                  {/* Resumen de intercambios del tiempo */}
                  <div className="mb-3">
                    <div className="eyebrow text-[10px] mb-1">Sugerencia según intercambios asignados:</div>
                    {sugText ? (
                      <div className="p-2.5 rounded bg-sunken text-xs whitespace-pre-line leading-relaxed border border-line">
                        {sugText}
                      </div>
                    ) : (
                      <p className="text-xs text-muted italic">
                        Asigne intercambios en {mt.n} arriba para ver las opciones de alimentos sugeridas.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="lbl mb-0">Menú final para el paciente ({mt.n})</span>
                    {sugText && currentMenu !== sugText && (
                      <button
                        className="text-[11px] text-brand hover:underline"
                        onClick={() => set('plan.menu.' + mt.k, sugText)}
                      >
                        Usar sugerencia
                      </button>
                    )}
                  </div>
                  <textarea
                    className="inp text-xs"
                    rows={4}
                    placeholder={`Escriba o aplique la sugerencia para ${mt.n}...`}
                    value={currentMenu}
                    onChange={e => set('plan.menu.' + mt.k, e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BUSCADOR Y CATÁLOGO OFICIAL DE LISTAS DE INTERCAMBIO DEL DOCUMENTO PDF */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" />
            <div>
              <h3 className="h3 mb-0">Guía de Intercambios y Tamaños de Porción (Documento Oficial)</h3>
              <p className="hint mt-0.5">
                Consulte las porciones exactas de panes, cereales, granos, frutas, lácteos, vegetales sin almidón, proteínas y grasas.
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm"
            onClick={() => setShowCatalog(!showCatalog)}
          >
            {showCatalog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showCatalog ? 'Ocultar catálogo de alimentos' : 'Ver catálogo completo de alimentos'}
          </button>
        </div>

        {showCatalog && (
          <div className="mt-4 pt-4 border-t border-line">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="relative flex-1 min-w-[15rem]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="inp pl-9 text-sm"
                  placeholder="Buscar alimento o porción (ej. tortilla, avena, manzana, aguacate, pollo)..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                />
              </div>
              <select
                className="inp w-auto text-sm"
                value={activeCatalogGroup}
                onChange={e => setActiveCatalogGroup(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {FOOD_EXCHANGE_CATALOG.map(cat => (
                  <option key={cat.groupKey} value={cat.groupKey}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 max-h-[34rem] overflow-y-auto pr-1">
              {filteredCatalog.map(cat => (
                <div key={cat.groupKey} className="border border-line rounded-lg overflow-hidden">
                  <div className="p-3 bg-sunken border-b border-line flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-brand">{cat.title}</span>
                    <span className="text-xs text-muted">{cat.nutrientNote}</span>
                  </div>
                  <div className="p-3 grid gap-4">
                    {cat.subcategories.map(sub => (
                      <div key={sub.name}>
                        <div className="eyebrow mb-2 text-ink">{sub.name}</div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {sub.items.map((item, idx) => (
                            <div key={idx} className="p-2 rounded border border-line bg-surface flex flex-col justify-between text-xs">
                              <span className="font-medium text-ink">{item.food}</span>
                              <span className="num text-brand mt-1">{item.portion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredCatalog.length === 0 && (
                <p className="text-sm text-muted text-center py-4">
                  No se encontraron alimentos que coincidan con "{catalogSearch}".
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
