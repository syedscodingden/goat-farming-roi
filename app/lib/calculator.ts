// ─── Types ───────────────────────────────────────────────────────────────────

export interface GoatInputs {
  // Acquisition
  numGoats: number;
  costPerGoat: number;
  transportFees: number;

  // Operational (all daily rates)
  feedPerGoatPerDay: number;
  medicalPerGoat: number;
  laborDaily: number;
  miscDaily: number;

  // Timeframe
  rearingDays: number;

  // Revenue
  sellingPricePerGoat: number;
  mortalityRate: number;
}

export interface CalculationResult {
  survivingGoats: number;
  acquisitionCost: number;
  feedCost: number;
  medicalCost: number;
  laborCost: number;
  miscCost: number;
  operationalCost: number;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  breakEven: number;
}

export interface CostBreakdownRow {
  label: string;
  amount: number;
  category: "acquisition" | "operational";
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_INPUTS: GoatInputs = {
  numGoats: 10,
  costPerGoat: 15000,
  transportFees: 5000,
  feedPerGoatPerDay: 50,
  medicalPerGoat: 500,
  laborDaily: 300,
  miscDaily: 100,
  rearingDays: 90,
  sellingPricePerGoat: 25000,
  mortalityRate: 5,
};

// ─── Core Calculation Logic ───────────────────────────────────────────────────

export function calculate(inputs: GoatInputs): CalculationResult {
  const survivingGoats = Math.floor(
    inputs.numGoats * (1 - inputs.mortalityRate / 100)
  );

  const acquisitionCost =
    inputs.numGoats * inputs.costPerGoat + inputs.transportFees;

  const feedCost = inputs.feedPerGoatPerDay * inputs.numGoats * inputs.rearingDays;
  const medicalCost = inputs.medicalPerGoat * inputs.numGoats;
  const laborCost = inputs.laborDaily * inputs.rearingDays;
  const miscCost = inputs.miscDaily * inputs.rearingDays;
  const operationalCost = feedCost + medicalCost + laborCost + miscCost;

  const totalInvestment = acquisitionCost + operationalCost;
  const totalRevenue = survivingGoats * inputs.sellingPricePerGoat;
  const netProfit = totalRevenue - totalInvestment;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const breakEven = survivingGoats > 0 ? totalInvestment / survivingGoats : 0;

  return {
    survivingGoats,
    acquisitionCost,
    feedCost,
    medicalCost,
    laborCost,
    miscCost,
    operationalCost,
    totalInvestment,
    totalRevenue,
    netProfit,
    roi,
    breakEven,
  };
}

export function getCostBreakdown(
  inputs: GoatInputs,
  result: CalculationResult
): CostBreakdownRow[] {
  return [
    {
      label: `Goat Purchase (${inputs.numGoats} × ₹${inputs.costPerGoat.toLocaleString()})`,
      amount: inputs.numGoats * inputs.costPerGoat,
      category: "acquisition",
    },
    {
      label: "Transport & Loading",
      amount: inputs.transportFees,
      category: "acquisition",
    },
    {
      label: `Feed/Fodder (${inputs.rearingDays} days × ${inputs.numGoats} goats)`,
      amount: result.feedCost,
      category: "operational",
    },
    {
      label: "Medical & Vaccination",
      amount: result.medicalCost,
      category: "operational",
    },
    {
      label: `Labor (${inputs.rearingDays} days × ₹${inputs.laborDaily}/day)`,
      amount: result.laborCost,
      category: "operational",
    },
    {
      label: `Miscellaneous (${inputs.rearingDays} days × ₹${inputs.miscDaily}/day)`,
      amount: result.miscCost,
      category: "operational",
    },
  ];
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return `₹${Math.abs(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatROI(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function buildSummaryText(
  inputs: GoatInputs,
  result: CalculationResult
): string {
  const profit = result.netProfit >= 0 ? "profit" : "loss";
  return (
    `You are investing ${formatCurrency(result.totalInvestment)} to rear ` +
    `${inputs.numGoats} goats over ${inputs.rearingDays} day${inputs.rearingDays !== 1 ? "s" : ""}. ` +
    `With a ${inputs.mortalityRate}% mortality rate, ${result.survivingGoats} goats are expected to survive. ` +
    `Selling at ${formatCurrency(inputs.sellingPricePerGoat)} per goat yields a ` +
    `net ${profit} of ${formatCurrency(result.netProfit)} (ROI: ${formatROI(result.roi)}).`
  );
}

export function buildClipboardText(
  inputs: GoatInputs,
  result: CalculationResult
): string {
  return [
    "=== Goat Farming ROI Summary ===",
    "",
    buildSummaryText(inputs, result),
    "",
    "--- Cost Breakdown ---",
    `Acquisition Cost:   ${formatCurrency(result.acquisitionCost)}`,
    `Operational Cost:   ${formatCurrency(result.operationalCost)}`,
    `Total Investment:   ${formatCurrency(result.totalInvestment)}`,
    "",
    "--- Revenue ---",
    `Surviving Goats:    ${result.survivingGoats}`,
    `Total Revenue:      ${formatCurrency(result.totalRevenue)}`,
    "",
    "--- Results ---",
    `Net Profit/Loss:    ${result.netProfit >= 0 ? "+" : "-"}${formatCurrency(result.netProfit)}`,
    `ROI:                ${formatROI(result.roi)}`,
    `Break-even Price:   ${formatCurrency(result.breakEven)} / goat`,
  ].join("\n");
}
