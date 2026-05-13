"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Wrench,
  Clock,
  TrendingUp,
  Layers,
  X,
  Plus,
} from "lucide-react";
import { InputSection, InputRow, NumberInput, SliderInput } from "@/app/components/InputSection";
import { SummaryCard } from "@/app/components/SummaryCard";
import { CostTable } from "@/app/components/CostTable";
import {
  calculate,
  getCostBreakdown,
  formatCurrency,
  DEFAULT_INPUTS,
  type GoatInputs,
  type SellingBatch,
} from "@/app/lib/calculator";

export default function Page() {
  const [inputs, setInputs] = useState<GoatInputs>(DEFAULT_INPUTS);

  const result = calculate(inputs);
  const costRows = getCostBreakdown(inputs, result);

  function set<K extends keyof GoatInputs>(key: K, value: GoatInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function addBatch() {
    const newBatch: SellingBatch = {
      id: `batch-${Date.now()}`,
      quantity: 0,
      pricePerGoat: 0,
    };
    setInputs((prev) => ({
      ...prev,
      sellingBatches: [...prev.sellingBatches, newBatch],
    }));
  }

  function removeBatch(id: string) {
    setInputs((prev) => ({
      ...prev,
      sellingBatches: prev.sellingBatches.filter((b) => b.id !== id),
    }));
  }

  function updateBatch(id: string, field: keyof Omit<SellingBatch, "id">, value: number) {
    setInputs((prev) => ({
      ...prev,
      sellingBatches: prev.sellingBatches.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    }));
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
  }

  const totalAllocated = inputs.sellingBatches.reduce((s, b) => s + b.quantity, 0);
  const allocationDiff = totalAllocated - result.survivingGoats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-100">
              Goat Farming ROI Calculator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Capital requirements, recurring costs &amp; net profit analysis
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Calculation
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left Column: Inputs */}
          <div className="grid gap-6">
            {/* Acquisition */}
            <InputSection title="Acquisition Costs" icon={ShoppingCart}>
              <InputRow label="Number of Goats">
                <NumberInput
                  value={inputs.numGoats}
                  onChange={(v) => set("numGoats", v)}
                  min={1}
                />
              </InputRow>
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Cost per Goat" hint="purchase price">
                  <NumberInput
                    value={inputs.costPerGoat}
                    onChange={(v) => set("costPerGoat", v)}
                    prefix="₹"
                  />
                </InputRow>
                <InputRow label="Transport &amp; Loading">
                  <NumberInput
                    value={inputs.transportFees}
                    onChange={(v) => set("transportFees", v)}
                    prefix="₹"
                  />
                </InputRow>
              </div>
            </InputSection>

            {/* Operational */}
            <InputSection title="Operational Costs (Recurring)" icon={Wrench}>
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Feed / Fodder" hint="per goat / day">
                  <NumberInput
                    value={inputs.feedPerGoatPerDay}
                    onChange={(v) => set("feedPerGoatPerDay", v)}
                    prefix="₹"
                    step={5}
                  />
                </InputRow>
                <InputRow label="Medical &amp; Vaccination" hint="per goat (total)">
                  <NumberInput
                    value={inputs.medicalPerGoat}
                    onChange={(v) => set("medicalPerGoat", v)}
                    prefix="₹"
                  />
                </InputRow>
                <InputRow label="Labor Cost" hint="per day">
                  <NumberInput
                    value={inputs.laborDaily}
                    onChange={(v) => set("laborDaily", v)}
                    prefix="₹"
                    suffix="/day"
                  />
                </InputRow>
                <InputRow label="Misc / Maintenance" hint="per day">
                  <NumberInput
                    value={inputs.miscDaily}
                    onChange={(v) => set("miscDaily", v)}
                    prefix="₹"
                    suffix="/day"
                  />
                </InputRow>
              </div>
            </InputSection>

            {/* Timeframe */}
            <InputSection title="Timeframe" icon={Clock}>
              <InputRow
                label="Rearing Period"
                hint="multiplies all daily recurring costs"
              >
                <NumberInput
                  value={inputs.rearingDays}
                  onChange={(v) => set("rearingDays", Math.max(1, v))}
                  min={1}
                  max={730}
                  suffix="days"
                />
              </InputRow>
            </InputSection>

            {/* Additional Costs */}
            <InputSection title="Additional Costs" icon={Layers}>
              <div className="grid grid-cols-2 gap-4">
                <InputRow label="Splitwise Cost" hint="shared expenses">
                  <NumberInput
                    value={inputs.splitwiseCost}
                    onChange={(v) => set("splitwiseCost", v)}
                    prefix="₹"
                  />
                </InputRow>
                <InputRow
                  label="Cost per Lost Goat"
                  hint={`${inputs.numGoats - result.survivingGoats} goats lost`}
                >
                  <NumberInput
                    value={inputs.costPerLostGoat}
                    onChange={(v) => set("costPerLostGoat", v)}
                    prefix="₹"
                  />
                </InputRow>
              </div>
            </InputSection>

            {/* Revenue */}
            <InputSection title="Revenue Projections" icon={TrendingUp}>
              {/* Selling Price Tiers */}
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Selling Price Tiers
                  </label>
                  {/* Allocation status badge */}
                  {allocationDiff === 0 ? (
                    <span className="text-xs font-medium text-emerald-400">
                      {totalAllocated} / {result.survivingGoats} goats allocated ✓
                    </span>
                  ) : allocationDiff < 0 ? (
                    <span className="text-xs font-medium text-amber-400">
                      {Math.abs(allocationDiff)} goats unallocated
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-red-400">
                      {allocationDiff} over surviving count
                    </span>
                  )}
                </div>

                {/* Batch rows */}
                <div className="grid gap-2">
                  {inputs.sellingBatches.map((batch, i) => {
                    const batchRevenue = batch.quantity * batch.pricePerGoat;
                    return (
                      <div
                        key={batch.id}
                        className="rounded-lg border border-slate-700 bg-slate-900 p-3 grid gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Tier {i + 1}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-emerald-400">
                              = {formatCurrency(batchRevenue)}
                            </span>
                            {inputs.sellingBatches.length > 1 && (
                              <button
                                onClick={() => removeBatch(batch.id)}
                                className="text-slate-600 hover:text-red-400 transition-colors"
                                aria-label="Remove tier"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="grid gap-1">
                            <span className="text-xs text-slate-500">Goats</span>
                            <NumberInput
                              value={batch.quantity}
                              onChange={(v) => updateBatch(batch.id, "quantity", v)}
                              min={0}
                            />
                          </div>
                          <div className="grid gap-1">
                            <span className="text-xs text-slate-500">Price / Goat</span>
                            <NumberInput
                              value={batch.pricePerGoat}
                              onChange={(v) => updateBatch(batch.id, "pricePerGoat", v)}
                              prefix="₹"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={addBatch}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-600 py-2 text-xs font-medium text-slate-500 hover:border-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Price Tier
                </button>
              </div>

              {/* Mortality Rate */}
              <InputRow
                label="Mortality Rate"
                hint={`${result.survivingGoats} of ${inputs.numGoats} expected to survive`}
              >
                <SliderInput
                  value={inputs.mortalityRate}
                  onChange={(v) => set("mortalityRate", v)}
                  min={0}
                  max={50}
                  step={0.5}
                />
              </InputRow>
            </InputSection>

            {/* Cost Breakdown Table */}
            <CostTable rows={costRows} result={result} />
          </div>

          {/* Right Column: Summary */}
          <div>
            <SummaryCard
              inputs={inputs}
              result={result}
              onReset={handleReset}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-xs text-slate-600">
        Goat Farming ROI Calculator — All figures are estimates for planning
        purposes only.
      </footer>
    </div>
  );
}
