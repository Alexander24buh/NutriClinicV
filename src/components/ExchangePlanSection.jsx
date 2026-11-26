import React, { useState, useMemo } from 'react';
import {
  Calculator, Utensils, BookOpen, Sparkles, RefreshCw, Check, Search, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, DollarSign, AlertCircle, Clock, Pill as PillIcon, Calendar, Download, ShoppingCart, Shuffle, FileText, CheckCircle2, ListOrdered, X
} from 'lucide-react';
import {
  EXCHANGE_GROUPS, MEAL_TIMES, FOOD_EXCHANGE_CATALOG, generateMealMenuFromExchanges
} from '../data/exchangeDatabase.js';
import {
  COST_LEVELS, generateSalvadoranMenu, getRiissAdaptationNotes, generate7DaySalvadoranMenu, calculateWeeklyGroceryList, getQuickSubstitutionGuide
} from '../data/salvadoranMenuEngine.js';
import { autoSolveExchangesToAdequacy, diagnoseExchangeConflict } from '../data/exchangeAdequacySolver.js';
import { SALVADORAN_DISHES, DAYS_OF_WEEK } from '../data/salvadoranDishes.js';
import { downloadSalvadoranMenuDocx } from '../lib/salvadoranDocxExport.js';
import RissDietCard from './RissDietCard.jsx';

const num = v => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const f0 = n => n == null || !Number.isFinite(n) ? '—' : Math.round(n).toLocaleString('en-US');
const f1 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(1);
const f2 = n => n == null || !Number.isFinite(n) ? '—' : n.toFixed(2);

// Sanitiza entradas numéricas positivas (evita letras, signos negativos y caracteres inválidos)
const sanitizePositiveDecimal = (raw) => {
  if (raw === null || raw === undefined || raw === '') return '';
  const str = String(raw).replace(',', '.');
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  const normalized = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;
  const n = parseFloat(normalized);
  if (Number.isFinite(n) && n < 0) return '0';
  return normalized;
};

const preventInvalidNumKeys = (e) => {
  if (['-', '+', 'e', 'E'].includes(e.key)) {
    e.preventDefault();
  }
};

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
  const [costLevel, setCostLevel] = useState(p.plan?.costLevel || 'regular');
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalogGroup, setActiveCatalogGroup] = useState('all');

  // Estado del Planificador Semanal de 7 Días y Exportación
  const [menuViewMode, setMenuViewMode] = useState('weekly'); // 'weekly' | 'single'
  const [selectedDayKey, setSelectedDayKey] = useState('lunes');
  const [swapModal, setSwapModal] = useState(null); // { dayKey, mealKey, currentDishId }
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showSubGuide, setShowSubGuide] = useState(false);
  const [customOverrides, setCustomOverrides] = useState(p.plan?.weeklyOverrides || {});

  // Diagnóstico y resolución de adecuación clínica (95% - 105%)
  const [adequacyDiagnostic, setAdequacyDiagnostic] = useState(null);
  const [showConflictExplainer, setShowConflictExplainer] = useState(false);

  const snackConfig = p.plan?.snackConfig || 'both';

  const isMealActive = (mk) => {
    if (mk === 'c1') return snackConfig === 'both' || snackConfig === 'am_only';
    if (mk === 'c2') return snackConfig === 'both' || snackConfig === 'pm_only';
    return true;
  };

  const getMealTimeMeta = (mt) => {
    const active = isMealActive(mt.k);
    if (!active) {
      return { ...mt, active: false, rangeLabel: 'Inactiva (0%)', minPct: 0, maxPct: 0 };
    }
    if (snackConfig === 'both') {
      return { ...mt, active: true, rangeLabel: mt.rangeLabel, minPct: mt.minPct, maxPct: mt.maxPct };
    }
    if (snackConfig === 'pm_only') {
      if (mt.k === 'des') return { ...mt, active: true, rangeLabel: '30 - 35%', minPct: 30, maxPct: 35 };
      if (mt.k === 'alm') return { ...mt, active: true, rangeLabel: '30 - 35%', minPct: 30, maxPct: 35 };
      if (mt.k === 'c2') return { ...mt, active: true, rangeLabel: '10 - 15%', minPct: 10, maxPct: 15 };
      if (mt.k === 'cen') return { ...mt, active: true, rangeLabel: '20 - 25%', minPct: 20, maxPct: 25 };
    }
    if (snackConfig === 'am_only') {
      if (mt.k === 'des') return { ...mt, active: true, rangeLabel: '30 - 35%', minPct: 30, maxPct: 35 };
      if (mt.k === 'c1') return { ...mt, active: true, rangeLabel: '10 - 15%', minPct: 10, maxPct: 15 };
      if (mt.k === 'alm') return { ...mt, active: true, rangeLabel: '30 - 35%', minPct: 30, maxPct: 35 };
      if (mt.k === 'cen') return { ...mt, active: true, rangeLabel: '20 - 25%', minPct: 20, maxPct: 25 };
    }
    if (snackConfig === 'none') {
      if (mt.k === 'des') return { ...mt, active: true, rangeLabel: '30 - 35%', minPct: 30, maxPct: 35 };
      if (mt.k === 'alm') return { ...mt, active: true, rangeLabel: '35 - 40%', minPct: 35, maxPct: 40 };
      if (mt.k === 'cen') return { ...mt, active: true, rangeLabel: '25 - 30%', minPct: 25, maxPct: 30 };
    }
    return { ...mt, active: true, rangeLabel: mt.rangeLabel, minPct: mt.minPct, maxPct: mt.maxPct };
  };

  const handleSetSnackConfig = (newConfig) => {
    upd(x => {
      const oldEq = x.plan?.eq || {};
      const newEq = { ...oldEq };
      const c1Inactive = newConfig === 'pm_only' || newConfig === 'none';
      const c2Inactive = newConfig === 'am_only' || newConfig === 'none';

      EXCHANGE_GROUPS.forEach(g => {
        const row = [...(newEq[g.k] || ['', '', '', '', ''])];
        if (c1Inactive) row[1] = '';
        if (c2Inactive) row[3] = '';
        newEq[g.k] = row;
      });

      return {
        ...x,
        plan: {
          ...x.plan,
          snackConfig: newConfig,
          eq: newEq
        }
      };
    });
  };

  const handleToggleMeal = (mk) => {
    if (mk === 'c1') {
      if (snackConfig === 'both') handleSetSnackConfig('pm_only');
      else if (snackConfig === 'am_only') handleSetSnackConfig('none');
      else if (snackConfig === 'pm_only') handleSetSnackConfig('both');
      else if (snackConfig === 'none') handleSetSnackConfig('am_only');
    } else if (mk === 'c2') {
      if (snackConfig === 'both') handleSetSnackConfig('am_only');
      else if (snackConfig === 'pm_only') handleSetSnackConfig('none');
      else if (snackConfig === 'am_only') handleSetSnackConfig('both');
      else if (snackConfig === 'none') handleSetSnackConfig('pm_only');
    }
  };

  const handleSetCostLevel = (lvl) => {
    setCostLevel(lvl);
    set('plan.costLevel', lvl);
  };

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
    set('plan.totals.' + gk, sanitizePositiveDecimal(val));
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
      const meta = getMealTimeMeta(mt);
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
      const inRange = meta.active ? (pctVct >= meta.minPct - 0.5 && pctVct <= meta.maxPct + 0.5) : (kcal === 0);
      return {
        ...meta,
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
  }, [p.plan.eq, excelCalc, vctMeta, snackConfig]);

  const rissData = p.plan?.riss || {};
  const riissAdaptationNotes = useMemo(() => {
    return getRiissAdaptationNotes(rissData);
  }, [rissData]);

  // Sugerencias automáticas de menú típico salvadoreño según intercambios, nivel de costo y reglas RIISS
  const suggestedMenus = useMemo(() => {
    return generateSalvadoranMenu({
      eqMap: p.plan.eq || {},
      costLevel,
      rissData,
      variantIndex: variantIdx,
      snackConfig
    });
  }, [p.plan.eq, costLevel, rissData, variantIdx, snackConfig]);

  // Plan Semanal Completo de 7 Días (Lunes a Domingo)
  const weeklyPlan = useMemo(() => {
    return generate7DaySalvadoranMenu({
      eqMap: p.plan.eq || {},
      costLevel,
      rissData,
      snackConfig,
      customOverrides
    });
  }, [p.plan.eq, costLevel, rissData, snackConfig, customOverrides]);

  // Lista de compras consolidada semanal
  const groceryList = useMemo(() => {
    return calculateWeeklyGroceryList(weeklyPlan);
  }, [weeklyPlan]);

  // Guía práctica de sustitución en casa
  const subGuide = useMemo(() => {
    return getQuickSubstitutionGuide();
  }, []);

  // Detección automática de adecuación clínica en tiempo real (95% - 105%)
  const isAnyMacroOutOfRange = useMemo(() => {
    if (!excelCalc) return false;
    const { adecCho, adecChon, adecCooh, adecKcal } = excelCalc;
    const isOut = (v) => v != null && (v < 95.0 || v > 105.0);
    return isOut(adecCho) || isOut(adecChon) || isOut(adecCooh) || isOut(adecKcal);
  }, [excelCalc]);

  const dynamicConflictDiagnosis = useMemo(() => {
    if (adequacyDiagnostic) return adequacyDiagnostic;
    if (isAnyMacroOutOfRange && vctMeta) {
      const diag = diagnoseExchangeConflict({ kcal: vctMeta, cho: choMetaG, p: chonMetaG, l: coohMetaG }, rissData);
      return {
        success: false,
        diagnostic: diag
      };
    }
    return null;
  }, [adequacyDiagnostic, isAnyMacroOutOfRange, vctMeta, choMetaG, chonMetaG, coohMetaG, rissData]);

  // Acción: Recalcular y cuadrar estrictamente al rango de adecuación (95% - 105%)
  const handleRecalculateAndBalanceAdequacy = () => {
    if (!vctMeta) return;

    const targets = {
      kcal: vctMeta,
      cho: choMetaG,
      p: chonMetaG,
      l: coohMetaG
    };

    const solverResult = autoSolveExchangesToAdequacy(targets, {
      rissData,
      allowHalf: true,
      preferredMilk: 'leche_sd'
    });

    setAdequacyDiagnostic(solverResult);

    if (solverResult.totals && Object.keys(solverResult.totals).length > 0) {
      const newEq = buildMealDistributionFromTotals(solverResult.totals);
      upd(x => ({
        ...x,
        plan: {
          ...x.plan,
          totals: solverResult.totals,
          eq: newEq
        }
      }));
    }
  };

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

  // Construye distribución en los tiempos de comida activos respetando rangos %
  const buildMealDistributionFromTotals = (totalsMap, config = snackConfig) => {
    // Pesos base por tiempo: [Desayuno (32%), Merienda AM (8%), Almuerzo (28%), Merienda PM (8%), Cena (24%)]
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
        let baseW = [...(W[g.k] || [0.3, 0.1, 0.3, 0.1, 0.2])];
        if (config === 'pm_only') {
          const c1W = baseW[1];
          baseW[1] = 0;
          baseW[0] += c1W * 0.4;
          baseW[2] += c1W * 0.4;
          baseW[3] += c1W * 0.2;
        } else if (config === 'am_only') {
          const c2W = baseW[3];
          baseW[3] = 0;
          baseW[2] += c2W * 0.4;
          baseW[4] += c2W * 0.4;
          baseW[1] += c2W * 0.2;
        } else if (config === 'none') {
          const snW = baseW[1] + baseW[3];
          baseW[1] = 0;
          baseW[3] = 0;
          baseW[0] += snW * 0.35;
          baseW[2] += snW * 0.35;
          baseW[4] += snW * 0.30;
        }
        const dist = splitExchanges(tot, baseW, hasHalf);
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

  // Copiar el día seleccionado del plan semanal al menú del paciente
  const handleApplyDayToPatient = (dayKey = selectedDayKey) => {
    const day = weeklyPlan[dayKey];
    if (!day) return;
    const dayMenuMap = {};
    MEAL_TIMES.forEach(mt => {
      const m = day.meals[mt.k];
      if (m) {
        const lines = [
          `🍲 ${m.dishName}`,
          m.description ? `  ${m.description}` : '',
          `  • Ingredientes medidos:`,
          ...m.ingredients.map(ing => `    - ${ing.name}: ${ing.measure}`),
          m.prepNotes ? `  • Preparación: ${m.prepNotes}` : '',
          m.clinicalNotes ? `  • Aviso clínico: ${m.clinicalNotes}` : ''
        ].filter(Boolean);
        dayMenuMap[mt.k] = lines.join('\n');
      }
    });

    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        menu: {
          ...x.plan.menu,
          ...dayMenuMap
        }
      }
    }));
  };

  const handleExportGoogleDocs = async () => {
    try {
      setIsExportingDocx(true);
      await downloadSalvadoranMenuDocx(p, c, weeklyPlan);
    } catch (err) {
      console.error('Error al exportar a Google Docs:', err);
      alert('Hubo un error al generar el archivo Word/Google Docs. Verifique los datos ingresados.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleSwapDish = (dayKey, mealKey, newDishId) => {
    const updated = { ...customOverrides, [`${dayKey}_${mealKey}`]: newDishId };
    setCustomOverrides(updated);
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        weeklyOverrides: updated
      }
    }));
    setSwapModal(null);
  };

  const handleRegenerateWeeklyPlan = () => {
    setCustomOverrides({});
    upd(x => ({
      ...x,
      plan: {
        ...x.plan,
        weeklyOverrides: {}
      }
    }));
    setVariantIdx(v => v + 1);
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
      {/* 0. PROTOCOLO OBLIGATORIO RISS: DIAGNÓSTICO, CLASIFICACIÓN Y REGLAS DE DIETAS HOSPITALARIAS */}
      <RissDietCard p={p} c={c} set={set} upd={upd} />

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
              type="button"
              className="btn btn-primary shadow-xs flex items-center gap-1.5"
              disabled={!m}
              style={{ opacity: m ? 1 : 0.5 }}
              onClick={handleRecalculateAndBalanceAdequacy}
              title="Ajusta automáticamente las porciones para que CHO, Proteína, Lípidos y Kcal se ubiquen estrictamente dentro del rango del 95% al 105%"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Recalcular y cuadrar al rango de adecuación (95% - 105%)
            </button>
            <button
              type="button"
              className="btn btn-outline text-xs"
              disabled={!m}
              onClick={handleAutoCalculateExchanges}
              title="Cuadre secuencial paso a paso"
            >
              Cuadre secuencial
            </button>
            <button type="button" className="btn btn-ghost text-xs" onClick={handleClearAll}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Panel Clínico de Diagnóstico de Adecuación y Explicación de Choques RIISS */}
        {dynamicConflictDiagnosis && (
          <div className={`mb-4 p-3.5 rounded-xl border text-xs ${
            dynamicConflictDiagnosis.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
              : dynamicConflictDiagnosis.diagnostic?.conflict
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
              : 'bg-surface-alt border-line text-ink'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                {dynamicConflictDiagnosis.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                <span>{dynamicConflictDiagnosis.diagnostic?.title || 'Adecuación de Intercambios Nutricionales'}</span>
              </div>
              <div className="flex items-center gap-2">
                {!dynamicConflictDiagnosis.success && (
                  <button
                    type="button"
                    className="btn btn-2xs btn-primary text-xs"
                    onClick={handleRecalculateAndBalanceAdequacy}
                  >
                    ⚡ Forzar recálculo
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-2xs btn-outline text-xs"
                  onClick={() => setShowConflictExplainer(!showConflictExplainer)}
                >
                  {showConflictExplainer ? 'Ocultar explicación clínica' : '¿Por qué no cuadran o cómo cuadran?'}
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed mb-2">
              {dynamicConflictDiagnosis.diagnostic?.description || dynamicConflictDiagnosis.diagnostic?.message}
            </p>

            {dynamicConflictDiagnosis.diagnostic?.impact && (
              <p className="text-xs font-semibold mb-2 text-amber-800 dark:text-amber-300">
                ⚠️ Impacto en la prescripción: {dynamicConflictDiagnosis.diagnostic.impact}
              </p>
            )}

            {showConflictExplainer && dynamicConflictDiagnosis.diagnostic?.recommendations?.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-line text-xs space-y-1.5">
                <div className="font-bold text-ink mb-1">Recomendaciones clínicas del PAN / RIISS para cuadrar:</div>
                <ul className="list-disc pl-4 space-y-1 text-ink">
                  {dynamicConflictDiagnosis.diagnostic.recommendations.map((rec, rIdx) => (
                    <li key={rIdx} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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
        <div className="table-responsive">
          <table className="tbl" style={{ minWidth: '50rem' }}>
            <thead>
              <tr className="bg-sunken">
                <th className="stick">Lista de alimentos</th>
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
                    <td className="stick font-medium" style={{ minWidth: '12rem' }}>{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onKeyDown={preventInvalidNumKeys}
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
                <td className="stick" style={{ background: 'var(--sunken)' }}>TOTAL (Lácteos, Vegetales y Frutas)</td>
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
                    <td className="stick font-medium" style={{ minWidth: '12rem' }}>{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onKeyDown={preventInvalidNumKeys}
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
                <td className="stick" style={{ background: 'var(--sunken)' }}>TOTAL Acumulado (con Almidones)</td>
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
                    <td className="stick font-medium" style={{ minWidth: '12rem' }}>{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onKeyDown={preventInvalidNumKeys}
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
                <td className="stick" style={{ background: 'var(--sunken)' }}>TOTAL Acumulado (con Proteínas)</td>
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
                    <td className="stick font-medium" style={{ minWidth: '12rem' }}>{g.n}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        className="inp inp-sm"
                        inputMode="decimal"
                        placeholder="0"
                        value={getGroupTotalRaw(g.k)}
                        onKeyDown={preventInvalidNumKeys}
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
                <td className="stick font-bold" style={{ background: 'var(--brand-soft)' }}>TOTAL GENERAL DEL PLAN</td>
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
                <td className="stick">Porcentaje de adecuación</td>
                <td style={{ textAlign: 'center' }} className="text-xs text-muted">Meta: 100%</td>
                <td className="r">{adequacyBadge(excelCalc.adecCho)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecChon)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecCooh)}</td>
                <td className="r">{adequacyBadge(excelCalc.adecKcal)}</td>
                <td className="r text-xs text-muted">Rango clínico</td>
              </tr>
              <tr>
                <td className="stick text-xs text-muted">Rango de margen de error</td>
                <td />
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">95 – 105%</td>
                <td className="r text-xs text-muted num">± 100 kcal</td>
                <td />
              </tr>
              {isAnyMacroOutOfRange && (
                <tr className="bg-amber-500/10 border-t border-amber-500/20">
                  <td colSpan={7} className="p-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Uno o más macronutrientes se salen del rango de adecuación estricto (95% – 105%).
                      </span>
                      <button
                        type="button"
                        className="btn btn-2xs btn-primary shadow-xs flex items-center gap-1"
                        onClick={handleRecalculateAndBalanceAdequacy}
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" /> Cuadrar automáticamente al 95-105%
                      </button>
                    </div>
                  </td>
                </tr>
              )}
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
              Distribuya los intercambios en los tiempos de comida activos verificando que la columna <strong>Por distribuir</strong> quede en 0 y el <strong>% de distribución</strong> cumpla la meta. Puede eliminar una merienda o ajustar el esquema según los hábitos del paciente.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleDistributeCurrentTotals}
            disabled={excelCalc.totalGeneral.nInt === 0}
            style={{ opacity: excelCalc.totalGeneral.nInt > 0 ? 1 : 0.5 }}
          >
            <ArrowRight className="w-4 h-4" /> Auto-distribuir en tiempos activos
          </button>
        </div>

        {/* Selector de esquema de tiempos y meriendas */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-sunken rounded-lg border border-line mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand" />
            <div>
              <span className="text-xs font-bold text-ink">Esquema de Tiempos de Comida:</span>
              <div className="text-[11px] text-muted">
                {snackConfig === 'both' ? '5 tiempos (Desayuno, Merienda AM, Almuerzo, Merienda PM y Cena)' :
                 snackConfig === 'pm_only' ? '4 tiempos (Desayuno, Almuerzo, Merienda PM y Cena — Sin Merienda AM)' :
                 snackConfig === 'am_only' ? '4 tiempos (Desayuno, Merienda AM, Almuerzo y Cena — Sin Merienda PM)' :
                 '3 tiempos (Solo comidas principales: Desayuno, Almuerzo y Cena)'}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              ['both', '5 tiempos (2 meriendas)'],
              ['pm_only', '4 tiempos (Solo Merienda PM)'],
              ['am_only', '4 tiempos (Solo Merienda AM)'],
              ['none', '3 tiempos (Sin meriendas)']
            ].map(([k, lbl]) => (
              <button
                key={k}
                type="button"
                className={`btn btn-xs ${snackConfig === k ? 'btn-primary font-bold shadow-xs' : 'border-line text-muted bg-surface'}`}
                onClick={() => handleSetSnackConfig(k)}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="tbl" style={{ minWidth: '64rem' }}>
            <thead>
              <tr className="bg-sunken">
                <th className="stick" rowSpan={2}>Alimentos</th>
                <th className="r" rowSpan={2} title="Intercambios de la Tabla 1 pendientes de asignar a un tiempo de comida">
                  Por distribuir
                </th>
                {MEAL_TIMES.map(mt => {
                  const meta = getMealTimeMeta(mt);
                  const isSnack = mt.k === 'c1' || mt.k === 'c2';
                  return (
                    <th
                      key={mt.k}
                      colSpan={2}
                      style={{
                        textAlign: 'center',
                        borderLeft: '1px solid var(--line)',
                        opacity: meta.active ? 1 : 0.6,
                        background: meta.active ? 'transparent' : 'var(--sunken)'
                      }}
                    >
                      <div className="font-bold">{mt.n}</div>
                      <div className="text-[10px] font-normal text-muted">Meta: {meta.rangeLabel}</div>
                      {isSnack && (
                        <button
                          type="button"
                          className={`text-[10px] inline-block mt-1 px-1.5 py-0.5 rounded border transition-colors ${
                            meta.active
                              ? 'text-danger border-danger/30 hover:bg-danger/10'
                              : 'text-brand border-brand/30 hover:bg-brand/10 bg-brand-soft/40 font-semibold'
                          }`}
                          onClick={() => handleToggleMeal(mt.k)}
                          title={meta.active ? 'Eliminar esta merienda para este paciente' : 'Activar esta merienda'}
                        >
                          {meta.active ? '✕ Eliminar merienda' : '+ Activar merienda'}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
              <tr className="bg-sunken">
                {MEAL_TIMES.map(mt => {
                  const active = isMealActive(mt.k);
                  return (
                    <React.Fragment key={mt.k}>
                      <th style={{ textAlign: 'center', borderLeft: '1px solid var(--line)', opacity: active ? 1 : 0.6 }}>Inter</th>
                      <th className="r" style={{ opacity: active ? 1 : 0.6 }}>Kcal</th>
                    </React.Fragment>
                  );
                })}
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
                      const active = isMealActive(mt.k);
                      const valStr = ((p.plan.eq && p.plan.eq[r.g.k]) || [])[mIdx] ?? '';
                      const kcalVal = r.mealKcals[mIdx];
                      return (
                        <React.Fragment key={mt.k}>
                          <td
                            style={{
                              textAlign: 'center',
                              borderLeft: '1px solid var(--line)',
                              opacity: active ? 1 : 0.45,
                              background: active ? 'transparent' : 'var(--sunken)'
                            }}
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              className="inp inp-sm"
                              inputMode="decimal"
                              placeholder={active ? "0" : "—"}
                              disabled={!active}
                              value={active ? valStr : ''}
                              onKeyDown={preventInvalidNumKeys}
                              onChange={e => set(`plan.eq.${r.g.k}.${mIdx}`, sanitizePositiveDecimal(e.target.value))}
                              aria-label={`${r.g.n} en ${mt.n}`}
                            />
                          </td>
                          <td
                            className="r num text-muted"
                            style={{
                              opacity: active ? 1 : 0.45,
                              background: active ? 'transparent' : 'var(--sunken)'
                            }}
                          >
                            {active && kcalVal > 0 ? f0(kcalVal) : '0'}
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
                    <td style={{ textAlign: 'center', borderLeft: '1px solid var(--line)', opacity: mt.active ? 1 : 0.5 }} className="num font-bold">
                      {f1(mt.inter)}
                    </td>
                    <td className="r num font-bold text-brand" style={{ opacity: mt.active ? 1 : 0.5 }}>
                      {f0(mt.kcal)} kcal
                    </td>
                  </React.Fragment>
                ))}
              </tr>
              <tr>
                <td className="stick text-xs text-muted" style={{ background: 'var(--sunken)' }}>Rango recomendado</td>
                <td className="r text-xs text-muted">100%</td>
                {MEAL_TIMES.map(mt => {
                  const meta = getMealTimeMeta(mt);
                  return (
                    <td key={mt.k} colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid var(--line)', opacity: meta.active ? 1 : 0.5 }} className="text-xs text-muted num">
                      {meta.rangeLabel}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="stick text-xs font-semibold" style={{ background: 'var(--sunken)' }}>% de distribución real</td>
                <td className="r num text-xs">
                  {f0(distCalc.totalDistributedKcal)} kcal
                </td>
                {distCalc.mealTotals.map(mt => (
                  <td key={mt.k} colSpan={2} style={{ textAlign: 'center', borderLeft: '1px solid var(--line)', opacity: mt.active ? 1 : 0.5 }}>
                    {mt.active ? (
                      mt.kcal > 0 ? (
                        <span className={`pill ${mt.inRange ? 'ok' : 'warn'}`}>
                          {mt.inRange ? '✓ ' : ''}{f1(mt.pctVct)}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted">0.0%</span>
                      )
                    ) : (
                      <span className="text-xs text-muted italic">Inactiva</span>
                    )}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 3. PLANIFICADOR DE MENÚ: PLATOS TÍPICOS SALVADOREÑOS Y GENERADOR DE 7 DÍAS */}
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-3 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand" />
              <h2 className="h2 mb-0">3. Menú Salvadoreño: {menuViewMode === 'weekly' ? 'Plan Semanal de 7 Días (Lunes a Domingo)' : `Menú Diario (${snackConfig === 'both' ? '5 Tiempos' : snackConfig === 'none' ? '3 Tiempos' : '4 Tiempos'})`}</h2>
            </div>
            <p className="hint mt-1">
              Platos típicos salvadoreños adaptados estrictamente a la prescripción RIISS 2014, cuadro de intercambios con medidas caseras exactas y rotación balanceada de fuentes de proteína.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle de Modalidad: Plan Semanal vs Menú Diario */}
            <div className="inline-flex rounded-lg shadow-2xs border border-line p-0.5 bg-surface">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  menuViewMode === 'weekly' ? 'bg-brand text-white shadow-xs' : 'text-ink hover:bg-surface-alt'
                }`}
                onClick={() => setMenuViewMode('weekly')}
              >
                <Calendar className="w-3.5 h-3.5 inline mr-1" /> Plan 7 Días
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  menuViewMode === 'single' ? 'bg-brand text-white shadow-xs' : 'text-ink hover:bg-surface-alt'
                }`}
                onClick={() => setMenuViewMode('single')}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" /> Menú Base Único
              </button>
            </div>

            {/* Botón de Exportación a Google Docs (.docx) */}
            <button
              type="button"
              className="btn btn-primary btn-sm shadow-xs flex items-center gap-1.5"
              onClick={handleExportGoogleDocs}
              disabled={isExportingDocx}
              title="Descargar documento .docx completamente editable y compatible con Google Docs"
            >
              <Download className={`w-4 h-4 ${isExportingDocx ? 'animate-spin' : ''}`} />
              {isExportingDocx ? 'Generando documento...' : 'Exportar Menú de 7 Días a Google Docs'}
            </button>
          </div>
        </div>

        {/* 1. Selector de Nivel de Costo (Económico, Regular, Más Costoso) y Regenerar */}
        <div className="mb-4 p-3.5 bg-surface-alt rounded-lg border border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-ink uppercase tracking-wider">Nivel de Costo del Menú:</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg shadow-2xs">
                {COST_LEVELS.map(lvl => {
                  const isActive = costLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`px-3 py-1.5 text-xs font-bold transition-all border first:rounded-l-lg last:rounded-r-lg ${
                        isActive
                          ? 'bg-brand text-white border-brand shadow-xs'
                          : 'bg-surface hover:bg-surface-alt border-line text-ink'
                      }`}
                      onClick={() => handleSetCostLevel(lvl.id)}
                    >
                      {lvl.badge}
                    </button>
                  );
                })}
              </div>
              {menuViewMode === 'weekly' && (
                <button
                  type="button"
                  className="btn btn-xs btn-outline flex items-center gap-1 text-xs"
                  onClick={handleRegenerateWeeklyPlan}
                  title="Genera una nueva combinación semanal rotando las fuentes de proteína"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerar Semana
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted mb-0">
            {COST_LEVELS.find(l => l.id === costLevel)?.desc}
          </p>
        </div>

        {/* 2. Banner de Reglas y Adaptaciones Seguras RIISS 2014 */}
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400 mb-1">
            <ShieldCheck className="w-4 h-4" /> Adaptación Clínica Segura de Platos Típicos Salvadoreños (RIISS):
          </div>
          <ul className="list-disc pl-4 space-y-1 text-ink">
            {riissAdaptationNotes.map((note, idx) => (
              <li key={idx} className="leading-relaxed">{note}</li>
            ))}
          </ul>
        </div>

        {/* ============================================================== */}
        {/* VISTA A: PLANIFICADOR SEMANAL DE 7 DÍAS (LUNES A DOMINGO)       */}
        {/* ============================================================== */}
        {menuViewMode === 'weekly' ? (
          <div>
            {/* Barra de Navegación por Días de la Semana */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 p-2 bg-sunken rounded-xl border border-line">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDayKey === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isSelected
                          ? 'bg-brand text-white shadow-xs'
                          : 'bg-surface hover:bg-surface-alt border border-line text-ink'
                      }`}
                      onClick={() => setSelectedDayKey(d.key)}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{d.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="btn btn-xs btn-primary shadow-2xs whitespace-nowrap"
                onClick={() => handleApplyDayToPatient(selectedDayKey)}
                title="Copia las preparaciones del día seleccionado al menú del reporte"
              >
                <Check className="w-3 h-3" /> Aplicar {DAYS_OF_WEEK.find(d => d.key === selectedDayKey)?.name} al reporte
              </button>
            </div>

            {/* Tarjetas de los Tiempos de Comida del Día Seleccionado */}
            {(() => {
              const currentDayData = weeklyPlan[selectedDayKey] || { meals: {} };
              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                  {distCalc.mealTotals.filter(mt => isMealActive(mt.k)).map((mt) => {
                    const meal = currentDayData.meals[mt.k];
                    const mealMeds = (Array.isArray(p.gen?.medList) ? p.gen.medList : []).filter(
                      m => Array.isArray(m.tiemposComida) && m.tiemposComida.includes(mt.k)
                    );

                    if (!meal) {
                      return (
                        <div key={mt.k} className="rounded-xl border border-line p-4 bg-surface text-center text-xs text-muted">
                          Sin intercambios asignados en {mt.n}.
                        </div>
                      );
                    }

                    return (
                      <div key={mt.k} className="rounded-xl border border-line p-4 flex flex-col justify-between bg-surface shadow-2xs">
                        <div>
                          {/* Cabecera del Tiempo */}
                          <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-line">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-brand">{mt.n}</span>
                              {meal.proteinType && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-alt border border-line text-muted uppercase font-medium">
                                  {meal.proteinType.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <span className="num text-xs font-semibold text-ink">
                              {f0(meal.totals?.kcal || mt.kcal)} kcal ({f1(mt.pctVct)}%)
                            </span>
                          </div>

                          {/* Fármacos en este tiempo */}
                          {mealMeds.length > 0 && (
                            <div className="mb-2.5 p-2 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                              <div className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 text-[11px] mb-1">
                                <Clock className="w-3 h-3" /> Fármacos en {mt.n}:
                              </div>
                              <div className="space-y-0.5">
                                {mealMeds.map(med => (
                                  <div key={med.id || med.nombre} className="text-[11px] text-ink flex items-center justify-between">
                                    <span>• <strong>{med.nombre}</strong> {med.dosisFrecuencia ? `(${med.dosisFrecuencia})` : ''}</span>
                                    <span className="text-[10px] text-muted italic">
                                      {med.relacionComidas === 'con_comidas' ? 'Con comida' : med.relacionComidas === 'en_ayunas' ? 'En ayunas' : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Platillo Típico Asignado y Botón Intercambiar */}
                          <div className="mb-2.5 p-2.5 rounded-lg bg-brand-soft/20 border border-brand/20">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-bold text-xs text-brand-dark dark:text-brand flex items-center gap-1">
                                  🍲 {meal.dishName}
                                </div>
                                {meal.description && (
                                  <p className="text-[11px] text-muted mt-0.5 leading-snug">
                                    {meal.description}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                className="btn btn-2xs btn-outline shrink-0 text-brand border-brand/30 hover:bg-brand-soft flex items-center gap-1"
                                onClick={() => setSwapModal({
                                  dayKey: selectedDayKey,
                                  mealKey: mt.k,
                                  currentDishId: meal.dishId
                                })}
                                title="Cambiar por otro platillo salvadoreño equivalente"
                              >
                                <Shuffle className="w-3 h-3" /> Intercambiar
                              </button>
                            </div>
                          </div>

                          {/* Lista de Ingredientes con Medidas Caseras Exactas */}
                          <div className="mb-3 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-muted tracking-wider">
                              Ingredientes y medidas caseras:
                            </div>
                            <div className="p-2 rounded bg-sunken text-xs space-y-1 border border-line">
                              {meal.ingredients.map((ing, iIdx) => (
                                <div key={iIdx} className="flex items-start justify-between gap-1 leading-snug text-ink text-[11px]">
                                  <span>• {ing.name}</span>
                                  <span className="font-semibold text-brand shrink-0">{ing.measure}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notas de Preparación y Clínicas */}
                          {meal.prepNotes && (
                            <div className="text-[11px] text-muted italic mb-2 leading-relaxed">
                              <span className="font-semibold text-ink not-italic">Cocción: </span>
                              {meal.prepNotes}
                            </div>
                          )}
                          {meal.clinicalNotes && (
                            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-400 mb-2">
                              ⚠️ {meal.clinicalNotes}
                            </div>
                          )}
                        </div>

                        {/* Totales de Macros del Tiempo de Comida */}
                        <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-muted">
                          <span>CHO: <strong>{f0(meal.totals?.cho)}g</strong></span>
                          <span>PROT: <strong>{f0(meal.totals?.p)}g</strong></span>
                          <span>LIP: <strong>{f0(meal.totals?.l)}g</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Paneles de Apoyo: Lista de Compras y Guía de Sustitución */}
            <div className="grid gap-4 md:grid-cols-2 pt-3 border-t border-line">
              {/* Acordeón: Lista de Compras Semanal */}
              <div className="border border-line rounded-xl overflow-hidden bg-surface">
                <button
                  type="button"
                  className="w-full p-3 bg-surface-alt flex items-center justify-between gap-2 text-left hover:bg-sunken transition"
                  onClick={() => setShowGroceryList(!showGroceryList)}
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-ink">Lista de Compras Semanal (Calculada de los 7 Días)</span>
                  </div>
                  {showGroceryList ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>

                {showGroceryList && (
                  <div className="p-3.5 space-y-3 max-h-80 overflow-y-auto text-xs">
                    {Object.values(groceryList).map((cat, cIdx) => (
                      <div key={cIdx} className="space-y-1">
                        <div className="font-bold text-[11px] uppercase tracking-wide text-brand">
                          {cat.title}
                        </div>
                        <div className="space-y-0.5 pl-2 border-l-2 border-brand/20">
                          {cat.items.map((it, itIdx) => (
                            <div key={itIdx} className="flex items-center justify-between text-ink text-[11px]">
                              <span>• {it.name}</span>
                              <span className="text-muted text-[10px] italic">{it.summary}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acordeón: Guía de Sustitución Rápida */}
              <div className="border border-line rounded-xl overflow-hidden bg-surface">
                <button
                  type="button"
                  className="w-full p-3 bg-surface-alt flex items-center justify-between gap-2 text-left hover:bg-sunken transition"
                  onClick={() => setShowSubGuide(!showSubGuide)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-ink">Guía de Sustitución Rápida para el Paciente</span>
                  </div>
                  {showSubGuide ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>

                {showSubGuide && (
                  <div className="p-3.5 space-y-2.5 max-h-80 overflow-y-auto text-xs">
                    {subGuide.map((g, gIdx) => (
                      <div key={gIdx} className="p-2 rounded bg-sunken border border-line">
                        <div className="font-bold text-[11px] text-brand">{g.group}</div>
                        <div className="text-[11px] text-ink mt-0.5 leading-relaxed">{g.examples}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VISTA B: MENÚ BASE ÚNICO (VISTA TRADICIONAL CON EDICIÓN LIBRE) */
          /* ============================================================== */
          <div>
            <div className="mb-4 p-2.5 bg-sunken rounded-lg border border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink">Rotación de Preparaciones:</span>
                <div className="inline-flex rounded-md shadow-2xs">
                  {[
                    { idx: 0, label: 'Opción A (Casera Tradicional)' },
                    { idx: 1, label: 'Opción B (Rotación de Proteínas)' },
                    { idx: 2, label: 'Opción C (Vegetales Criollos & Horno)' }
                  ].map(v => (
                    <button
                      key={v.idx}
                      type="button"
                      className={`px-2.5 py-1 text-xs font-medium transition-all border first:rounded-l-md last:rounded-r-md ${
                        (variantIdx % 3) === v.idx
                          ? 'bg-brand text-white border-brand'
                          : 'bg-surface hover:bg-surface-alt border-line text-ink'
                      }`}
                      onClick={() => setVariantIdx(v.idx)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost text-xs text-brand flex items-center gap-1"
                onClick={() => setVariantIdx(v => v + 1)}
                title="Alternar a la siguiente combinación típica"
              >
                <RefreshCw className="w-3 h-3" /> Rotar plato
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {distCalc.mealTotals.filter(mt => isMealActive(mt.k)).map((mt) => {
                const sugText = suggestedMenus[mt.k];
                const currentMenu = (p.plan.menu && p.plan.menu[mt.k]) || '';
                const mealMeds = (Array.isArray(p.gen?.medList) ? p.gen.medList : []).filter(
                  m => Array.isArray(m.tiemposComida) && m.tiemposComida.includes(mt.k)
                );

                return (
                  <div key={mt.k} className="rounded-lg border border-line p-4 flex flex-col justify-between bg-surface">
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-line">
                        <span className="font-semibold text-sm text-brand">{mt.n}</span>
                        <span className="num text-xs text-muted">
                          {f0(mt.kcal)} kcal ({f1(mt.pctVct)}%)
                        </span>
                      </div>

                      {mealMeds.length > 0 && (
                        <div className="mb-2.5 p-2 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                          <div className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 text-[11px] mb-1">
                            <Clock className="w-3 h-3" /> Fármacos en {mt.n}:
                          </div>
                          <div className="space-y-0.5">
                            {mealMeds.map(med => (
                              <div key={med.id || med.nombre} className="text-[11px] text-ink flex items-center justify-between">
                                <span>• <strong>{med.nombre}</strong> {med.dosisFrecuencia ? `(${med.dosisFrecuencia})` : ''}</span>
                                <span className="text-[10px] text-muted italic">
                                  {med.relacionComidas === 'con_comidas' ? 'Con comida' : med.relacionComidas === 'en_ayunas' ? 'En ayunas' : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

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
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL / DIÁLOGO DE INTERCAMBIO RÁPIDO DE PLATILLO SALVADOREÑO   */}
        {/* ============================================================== */}
        {swapModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface border border-line rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 bg-surface-alt border-b border-line flex items-center justify-between">
                <div>
                  <h3 className="h3 mb-0 text-brand">Intercambiar Platillo Salvadoreño</h3>
                  <p className="text-xs text-muted mt-0.5">
                    Seleccione una opción típica compatible para <strong>{MEAL_TIMES.find(m => m.k === swapModal.mealKey)?.n}</strong> del día <strong>{DAYS_OF_WEEK.find(d => d.key === swapModal.dayKey)?.name}</strong>:
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost p-1"
                  onClick={() => setSwapModal(null)}
                >
                  <X className="w-5 h-5 text-muted hover:text-ink" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3">
                {(() => {
                  const targetMealType = swapModal.mealKey === 'c1' || swapModal.mealKey === 'c2' ? 'snack' : swapModal.mealKey;
                  const availableDishes = SALVADORAN_DISHES.filter(d => d.mealType === targetMealType);

                  if (availableDishes.length === 0) {
                    return (
                      <p className="text-xs text-muted text-center py-6">
                        No hay platillos específicos registrados para este tiempo.
                      </p>
                    );
                  }

                  return availableDishes.map((dish) => {
                    const isCurrent = dish.id === swapModal.currentDishId;
                    return (
                      <div
                        key={dish.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-brand bg-brand-soft/20 ring-1 ring-brand'
                            : 'border-line bg-surface hover:bg-surface-alt'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="font-bold text-sm text-ink flex items-center gap-1.5">
                              <span>🍲 {dish.name}</span>
                              {dish.costLevel && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-line text-muted">
                                  {dish.costLevel}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-0.5 leading-snug">
                              {dish.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`btn btn-xs ${isCurrent ? 'btn-outline border-brand text-brand' : 'btn-primary'}`}
                            onClick={() => handleSwapDish(swapModal.dayKey, swapModal.mealKey, dish.id)}
                            disabled={isCurrent}
                          >
                            {isCurrent ? 'Platillo actual' : 'Seleccionar este platillo'}
                          </button>
                        </div>

                        {/* Preparación y notas clínicas */}
                        {dish.prepNotes && (
                          <div className="text-[11px] text-muted italic mt-1">
                            <span className="font-semibold text-ink not-italic">Preparación: </span>
                            {dish.prepNotes}
                          </div>
                        )}
                        {dish.renalNote && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                            ⚠️ {dish.renalNote}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="p-3 bg-surface-alt border-t border-line flex justify-end">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost text-xs"
                  onClick={() => setSwapModal(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
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
