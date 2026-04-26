"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Wrench,
  Clock,
  TrendingUp,
} from "lucide-react";
import { InputSection, InputRow, NumberInput, SliderInput } from "@/app/components/InputSection";
import { SummaryCard } from "@/app/components/SummaryCard";
import { CostTable } from "@/app/components/CostTable";
import {
  calculate,
  getCostBreakdown,
  DEFAULT_INPUTS,
  type GoatInputs,
} from "@/app/lib/calculator";

export default function Page() {
  const [inputs, setInputs] = useState<GoatInputs>(DEFAULT_INPUTS);

  const result = calculate(inputs);
  const costRows = getCostBreakdown(inputs, result);

  function set<K extends keyof GoatInputs>(key: K, value: GoatInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function handleReset() {
    setInputs(DEFAULT_INPUTS);
  }

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

            {/* Revenue */}
            <InputSection title="Revenue Projections" icon={TrendingUp}>
              <InputRow label="Selling Price per Goat">
                <NumberInput
                  value={inputs.sellingPricePerGoat}
                  onChange={(v) => set("sellingPricePerGoat", v)}
                  prefix="₹"
                />
              </InputRow>
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
