"use client";

import { useState } from "react";
import { ShoppingCart, TrendingUp, Layers, X, Plus } from "lucide-react";
import { InputSection, InputRow, NumberInput, SliderInput } from "@/app/components/InputSection";
import { SummaryCard } from "@/app/components/SummaryCard";
import { CostTable } from "@/app/components/CostTable";
import {
  calculate,
  getCostBreakdown,
  formatCurrency,
  batchQuantity,
  DEFAULT_INPUTS,
  type GoatInputs,
  type BuyingBatch,
  type BuyingTier,
  type SellingBatch,
} from "@/app/lib/calculator";

export default function Page() {
  const [inputs, setInputs] = useState<GoatInputs>(DEFAULT_INPUTS);

  const result = calculate(inputs);
  const costRows = getCostBreakdown(inputs, result);

  function set<K extends keyof GoatInputs>(key: K, value: GoatInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  // ── Buying batch handlers ──────────────────────────────────────────────────
  function addBuyingBatch() {
    const batch: BuyingBatch = {
      id: `buy-${Date.now()}`,
      tiers: [{ id: `tier-${Date.now()}`, quantity: 0, pricePerGoat: 0 }],
      rearingDays: 25,
      feedPerGoatPerDay: 20,
      medicalPerGoat: 0,
      laborDaily: 800,
      miscDaily: 0,
    };
    setInputs((prev) => ({ ...prev, buyingBatches: [...prev.buyingBatches, batch] }));
  }
  function removeBuyingBatch(id: string) {
    setInputs((prev) => ({ ...prev, buyingBatches: prev.buyingBatches.filter((b) => b.id !== id) }));
  }
  function updateBuyingBatch(batchId: string, field: keyof Omit<BuyingBatch, "id" | "tiers">, value: number) {
    setInputs((prev) => ({
      ...prev,
      buyingBatches: prev.buyingBatches.map((b) => (b.id === batchId ? { ...b, [field]: value } : b)),
    }));
  }

  // ── Buying tier handlers (nested within a batch) ───────────────────────────
  function addBuyingTier(batchId: string) {
    const tier: BuyingTier = { id: `tier-${Date.now()}`, quantity: 0, pricePerGoat: 0 };
    setInputs((prev) => ({
      ...prev,
      buyingBatches: prev.buyingBatches.map((b) =>
        b.id === batchId ? { ...b, tiers: [...b.tiers, tier] } : b
      ),
    }));
  }
  function removeBuyingTier(batchId: string, tierId: string) {
    setInputs((prev) => ({
      ...prev,
      buyingBatches: prev.buyingBatches.map((b) =>
        b.id === batchId ? { ...b, tiers: b.tiers.filter((t) => t.id !== tierId) } : b
      ),
    }));
  }
  function updateBuyingTier(batchId: string, tierId: string, field: keyof Omit<BuyingTier, "id">, value: number) {
    setInputs((prev) => ({
      ...prev,
      buyingBatches: prev.buyingBatches.map((b) =>
        b.id === batchId
          ? { ...b, tiers: b.tiers.map((t) => (t.id === tierId ? { ...t, [field]: value } : t)) }
          : b
      ),
    }));
  }

  // ── Selling batch handlers ─────────────────────────────────────────────────
  function addSellingBatch() {
    const batch: SellingBatch = { id: `sell-${Date.now()}`, quantity: 0, pricePerGoat: 0 };
    setInputs((prev) => ({ ...prev, sellingBatches: [...prev.sellingBatches, batch] }));
  }
  function removeSellingBatch(id: string) {
    setInputs((prev) => ({ ...prev, sellingBatches: prev.sellingBatches.filter((b) => b.id !== id) }));
  }
  function updateSellingBatch(id: string, field: keyof Omit<SellingBatch, "id">, value: number) {
    setInputs((prev) => ({
      ...prev,
      sellingBatches: prev.sellingBatches.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    }));
  }

  function handleReset() { setInputs(DEFAULT_INPUTS); }

  const totalBuyingGoats = inputs.buyingBatches.reduce((s, b) => s + batchQuantity(b), 0);
  const totalSellingAllocated = inputs.sellingBatches.reduce((s, b) => s + b.quantity, 0);
  const sellingDiff = totalSellingAllocated - result.survivingGoats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-100">Goat Farming ROI Calculator</h1>
            <p className="text-xs text-slate-500 mt-0.5">Capital requirements, recurring costs &amp; net profit analysis</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Calculation
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="grid gap-6">

            {/* ── Acquisition + Operational per batch ── */}
            <InputSection title="Acquisition & Operational Costs" icon={ShoppingCart}>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Buying Batches</label>
                  <span className="text-xs font-medium text-sky-400">{totalBuyingGoats} goats total</span>
                </div>

                {inputs.buyingBatches.map((batch, bi) => {
                  const qty = batchQuantity(batch);
                  const batchCost =
                    batch.tiers.reduce((s, t) => s + t.quantity * t.pricePerGoat, 0) +
                    batch.feedPerGoatPerDay * qty * batch.rearingDays +
                    batch.medicalPerGoat * qty +
                    batch.laborDaily * batch.rearingDays +
                    batch.miscDaily * batch.rearingDays;

                  return (
                    <div key={batch.id} className="rounded-lg border border-slate-700 bg-slate-900 overflow-hidden">
                      {/* Batch header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Batch {bi + 1} · {qty} goats
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-sky-400">= {formatCurrency(batchCost)}</span>
                          {inputs.buyingBatches.length > 1 && (
                            <button onClick={() => removeBuyingBatch(batch.id)} className="text-slate-600 hover:text-red-400 transition-colors" aria-label="Remove batch">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 grid gap-4">
                        {/* Acquisition tiers */}
                        <div>
                          <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">Acquisition</p>
                          <div className="grid gap-2">
                            {/* Column headers */}
                            <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center px-0.5">
                              <span className="text-xs text-slate-500">Goats</span>
                              <span className="text-xs text-slate-500">Price / Goat</span>
                              <span className="text-xs text-slate-500 text-right w-20">Cost</span>
                              <span className="w-4" />
                            </div>

                            {batch.tiers.map((tier) => (
                              <div key={tier.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                                <NumberInput
                                  value={tier.quantity}
                                  onChange={(v) => updateBuyingTier(batch.id, tier.id, "quantity", v)}
                                  min={0}
                                />
                                <NumberInput
                                  value={tier.pricePerGoat}
                                  onChange={(v) => updateBuyingTier(batch.id, tier.id, "pricePerGoat", v)}
                                  prefix="₹"
                                />
                                <span className="text-xs font-mono text-sky-400 text-right w-20 tabular-nums">
                                  {formatCurrency(tier.quantity * tier.pricePerGoat)}
                                </span>
                                {batch.tiers.length > 1 ? (
                                  <button onClick={() => removeBuyingTier(batch.id, tier.id)} className="text-slate-600 hover:text-red-400 transition-colors w-4" aria-label="Remove tier">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="w-4" />
                                )}
                              </div>
                            ))}

                            <button
                              onClick={() => addBuyingTier(batch.id)}
                              className="flex items-center justify-center gap-1 rounded-md border border-dashed border-slate-700 py-1.5 text-xs text-slate-600 hover:border-slate-500 hover:text-slate-400 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Price Tier
                            </button>
                          </div>
                        </div>

                        {/* Rearing period */}
                        <div>
                          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Timeframe</p>
                          <div className="grid gap-1">
                            <span className="text-xs text-slate-500">Rearing Period</span>
                            <NumberInput value={batch.rearingDays} onChange={(v) => updateBuyingBatch(batch.id, "rearingDays", Math.max(1, v))} min={1} max={730} suffix="days" />
                          </div>
                        </div>

                        {/* Operational costs */}
                        <div>
                          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Operational Costs</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                              <span className="text-xs text-slate-500">Feed / Goat / Day</span>
                              <NumberInput value={batch.feedPerGoatPerDay} onChange={(v) => updateBuyingBatch(batch.id, "feedPerGoatPerDay", v)} prefix="₹" />
                            </div>
                            <div className="grid gap-1">
                              <span className="text-xs text-slate-500">Medical / Goat</span>
                              <NumberInput value={batch.medicalPerGoat} onChange={(v) => updateBuyingBatch(batch.id, "medicalPerGoat", v)} prefix="₹" />
                            </div>
                            <div className="grid gap-1">
                              <span className="text-xs text-slate-500">Labor / Day</span>
                              <NumberInput value={batch.laborDaily} onChange={(v) => updateBuyingBatch(batch.id, "laborDaily", v)} prefix="₹" suffix="/day" />
                            </div>
                            <div className="grid gap-1">
                              <span className="text-xs text-slate-500">Misc / Day</span>
                              <NumberInput value={batch.miscDaily} onChange={(v) => updateBuyingBatch(batch.id, "miscDaily", v)} prefix="₹" suffix="/day" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addBuyingBatch}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-600 py-2.5 text-xs font-medium text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Batch
                </button>
              </div>

              <InputRow label="Transport &amp; Loading" hint="shared across all batches">
                <NumberInput value={inputs.transportFees} onChange={(v) => set("transportFees", v)} prefix="₹" />
              </InputRow>
            </InputSection>

            {/* ── Additional Costs ── */}
            <InputSection title="Additional Costs" icon={Layers}>
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Splitwise Cost" hint="shared expenses">
                  <NumberInput value={inputs.splitwiseCost} onChange={(v) => set("splitwiseCost", v)} prefix="₹" />
                </InputRow>
                <InputRow label="Cost per Lost Goat" hint={`${result.lostGoats} goats lost`}>
                  <NumberInput value={inputs.costPerLostGoat} onChange={(v) => set("costPerLostGoat", v)} prefix="₹" />
                </InputRow>
              </div>
            </InputSection>

            {/* ── Revenue ── */}
            <InputSection title="Revenue Projections" icon={TrendingUp}>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">Selling Price Tiers</label>
                  {sellingDiff === 0 ? (
                    <span className="text-xs font-medium text-emerald-400">{totalSellingAllocated} / {result.survivingGoats} goats allocated ✓</span>
                  ) : sellingDiff < 0 ? (
                    <span className="text-xs font-medium text-amber-400">{Math.abs(sellingDiff)} goats unallocated</span>
                  ) : (
                    <span className="text-xs font-medium text-red-400">{sellingDiff} over surviving count</span>
                  )}
                </div>

                <div className="grid gap-2">
                  {inputs.sellingBatches.map((batch, i) => (
                    <div key={batch.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3 grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tier {i + 1}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-emerald-400">= {formatCurrency(batch.quantity * batch.pricePerGoat)}</span>
                          {inputs.sellingBatches.length > 1 && (
                            <button onClick={() => removeSellingBatch(batch.id)} className="text-slate-600 hover:text-red-400 transition-colors" aria-label="Remove tier">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid gap-1">
                          <span className="text-xs text-slate-500">Goats</span>
                          <NumberInput value={batch.quantity} onChange={(v) => updateSellingBatch(batch.id, "quantity", v)} min={0} />
                        </div>
                        <div className="grid gap-1">
                          <span className="text-xs text-slate-500">Price / Goat</span>
                          <NumberInput value={batch.pricePerGoat} onChange={(v) => updateSellingBatch(batch.id, "pricePerGoat", v)} prefix="₹" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addSellingBatch}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-600 py-2 text-xs font-medium text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Selling Tier
                </button>
              </div>

              <InputRow label="Mortality Rate" hint={`${result.survivingGoats} of ${result.totalGoats} expected to survive`}>
                <SliderInput value={inputs.mortalityRate} onChange={(v) => set("mortalityRate", v)} min={0} max={50} step={0.5} />
              </InputRow>
            </InputSection>

            <CostTable rows={costRows} result={result} />
          </div>

          <div>
            <SummaryCard inputs={inputs} result={result} onReset={handleReset} />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-xs text-slate-600">
        Goat Farming ROI Calculator — All figures are estimates for planning purposes only.
      </footer>
    </div>
  );
}
