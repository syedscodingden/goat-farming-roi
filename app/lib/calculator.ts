// ─── Types ───────────────────────────────────────────────────────────────────

export interface SellingBatch {
  id: string;
  quantity: number;
  pricePerGoat: number;
}

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
  sellingBatches: SellingBatch[];
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
  totalGoatsSold: number;
  unsoldGoats: number;
}

export interface CostBreakdownRow {
  label: string;
  amount: number;
  category: "acquisition" | "operational";
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_INPUTS: GoatInputs = {
  numGoats: 100,
  costPerGoat: 9800,
  transportFees: 15000,
  feedPerGoatPerDay: 20,
  medicalPerGoat: 0,
  laborDaily: 800,
  miscDaily: 0,
  rearingDays: 25,
  sellingBatches: [{ id: "default", quantity: 100, pricePerGoat: 13500 }],
  mortalityRate: 0,
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

  // Distribute surviving goats across tiers in order
  let remainingGoats = survivingGoats;
  let totalRevenue = 0;
  for (const batch of inputs.sellingBatches) {
    if (remainingGoats <= 0) break;
    const sold = Math.min(batch.quantity, remainingGoats);
    totalRevenue += sold * batch.pricePerGoat;
    remainingGoats -= sold;
  }
  const totalGoatsSold = survivingGoats - remainingGoats;
  const unsoldGoats = remainingGoats;

  const netProfit = totalRevenue - totalInvestment;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const breakEven = totalGoatsSold > 0 ? totalInvestment / totalGoatsSold : 0;

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
    totalGoatsSold,
    unsoldGoats,
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
  const tierDesc =
    inputs.sellingBatches.length === 1
      ? `at ${formatCurrency(inputs.sellingBatches[0].pricePerGoat)} per goat`
      : `across ${inputs.sellingBatches.length} price tiers`;
  return (
    `You are investing ${formatCurrency(result.totalInvestment)} to rear ` +
    `${inputs.numGoats} goats over ${inputs.rearingDays} day${inputs.rearingDays !== 1 ? "s" : ""}. ` +
    `With a ${inputs.mortalityRate}% mortality rate, ${result.survivingGoats} goats are expected to survive. ` +
    `Selling ${result.totalGoatsSold} goats ${tierDesc} yields a ` +
    `net ${profit} of ${formatCurrency(result.netProfit)} (ROI: ${formatROI(result.roi)}).`
  );
}

export function buildClipboardText(
  inputs: GoatInputs,
  result: CalculationResult
): string {
  const tierLines = inputs.sellingBatches.map(
    (b, i) =>
      `  Tier ${i + 1}: ${b.quantity} goats @ ${formatCurrency(b.pricePerGoat)} = ${formatCurrency(b.quantity * b.pricePerGoat)}`
  );
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
    `Goats Sold:         ${result.totalGoatsSold}`,
    ...tierLines,
    `Total Revenue:      ${formatCurrency(result.totalRevenue)}`,
    "",
    "--- Results ---",
    `Net Profit/Loss:    ${result.netProfit >= 0 ? "+" : "-"}${formatCurrency(result.netProfit)}`,
    `ROI:                ${formatROI(result.roi)}`,
    `Break-even Price:   ${formatCurrency(result.breakEven)} / goat`,
  ].join("\n");
}
