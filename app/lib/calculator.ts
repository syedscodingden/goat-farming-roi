// ─── Types ───────────────────────────────────────────────────────────────────

export interface BuyingBatch {
  id: string;
  quantity: number;
  pricePerGoat: number;
}

export interface SellingBatch {
  id: string;
  quantity: number;
  pricePerGoat: number;
}

export interface GoatInputs {
  // Acquisition
  buyingBatches: BuyingBatch[];
  transportFees: number;

  // Operational (all daily rates)
  feedPerGoatPerDay: number;
  medicalPerGoat: number;
  laborDaily: number;
  miscDaily: number;

  // Timeframe
  rearingDays: number;

  // Additional
  splitwiseCost: number;
  costPerLostGoat: number;

  // Revenue
  sellingBatches: SellingBatch[];
  mortalityRate: number;
}

export interface CalculationResult {
  totalGoats: number;
  survivingGoats: number;
  acquisitionCost: number;
  feedCost: number;
  medicalCost: number;
  laborCost: number;
  miscCost: number;
  operationalCost: number;
  lostGoats: number;
  lostGoatsCost: number;
  additionalCost: number;
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
  category: "acquisition" | "operational" | "additional";
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_INPUTS: GoatInputs = {
  buyingBatches: [{ id: "default-buy", quantity: 100, pricePerGoat: 9800 }],
  transportFees: 15000,
  feedPerGoatPerDay: 20,
  medicalPerGoat: 0,
  laborDaily: 800,
  miscDaily: 0,
  rearingDays: 25,
  splitwiseCost: 0,
  costPerLostGoat: 0,
  sellingBatches: [{ id: "default-sell", quantity: 100, pricePerGoat: 13500 }],
  mortalityRate: 0,
};

// ─── Core Calculation Logic ───────────────────────────────────────────────────

export function calculate(inputs: GoatInputs): CalculationResult {
  const totalGoats = inputs.buyingBatches.reduce((s, b) => s + b.quantity, 0);
  const survivingGoats = Math.floor(totalGoats * (1 - inputs.mortalityRate / 100));

  const goatPurchaseCost = inputs.buyingBatches.reduce(
    (s, b) => s + b.quantity * b.pricePerGoat,
    0
  );
  const acquisitionCost = goatPurchaseCost + inputs.transportFees;

  const feedCost = inputs.feedPerGoatPerDay * totalGoats * inputs.rearingDays;
  const medicalCost = inputs.medicalPerGoat * totalGoats;
  const laborCost = inputs.laborDaily * inputs.rearingDays;
  const miscCost = inputs.miscDaily * inputs.rearingDays;
  const operationalCost = feedCost + medicalCost + laborCost + miscCost;

  const lostGoats = totalGoats - survivingGoats;
  const lostGoatsCost = lostGoats * inputs.costPerLostGoat;
  const additionalCost = inputs.splitwiseCost + lostGoatsCost;

  const totalInvestment = acquisitionCost + operationalCost + additionalCost;

  // Distribute surviving goats across selling tiers in order
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
    totalGoats,
    survivingGoats,
    acquisitionCost,
    feedCost,
    medicalCost,
    laborCost,
    miscCost,
    operationalCost,
    lostGoats,
    lostGoatsCost,
    additionalCost,
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
  const buyingRows: CostBreakdownRow[] = inputs.buyingBatches.map((b, i) => ({
    label: `Goat Purchase Tier ${i + 1} (${b.quantity} × ₹${b.pricePerGoat.toLocaleString()})`,
    amount: b.quantity * b.pricePerGoat,
    category: "acquisition",
  }));

  return [
    ...buyingRows,
    {
      label: "Transport & Loading",
      amount: inputs.transportFees,
      category: "acquisition",
    },
    {
      label: `Feed/Fodder (${inputs.rearingDays} days × ${result.totalGoats} goats)`,
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
    {
      label: "Splitwise Cost",
      amount: inputs.splitwiseCost,
      category: "additional",
    },
    {
      label: `Goats Lost Cost (${result.lostGoats} goats × ₹${inputs.costPerLostGoat.toLocaleString()})`,
      amount: result.lostGoatsCost,
      category: "additional",
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
    `${result.totalGoats} goats over ${inputs.rearingDays} day${inputs.rearingDays !== 1 ? "s" : ""}. ` +
    `With a ${inputs.mortalityRate}% mortality rate, ${result.survivingGoats} goats are expected to survive. ` +
    `Selling ${result.totalGoatsSold} goats ${tierDesc} yields a ` +
    `net ${profit} of ${formatCurrency(result.netProfit)} (ROI: ${formatROI(result.roi)}).`
  );
}

export function buildClipboardText(
  inputs: GoatInputs,
  result: CalculationResult
): string {
  const buyingLines = inputs.buyingBatches.map(
    (b, i) =>
      `  Tier ${i + 1}: ${b.quantity} goats @ ${formatCurrency(b.pricePerGoat)} = ${formatCurrency(b.quantity * b.pricePerGoat)}`
  );
  const sellingLines = inputs.sellingBatches.map(
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
    ...buyingLines,
    `Operational Cost:   ${formatCurrency(result.operationalCost)}`,
    `Additional Cost:    ${formatCurrency(result.additionalCost)}`,
    `Total Investment:   ${formatCurrency(result.totalInvestment)}`,
    "",
    "--- Revenue ---",
    `Total Goats:        ${result.totalGoats}`,
    `Surviving Goats:    ${result.survivingGoats}`,
    `Goats Sold:         ${result.totalGoatsSold}`,
    ...sellingLines,
    `Total Revenue:      ${formatCurrency(result.totalRevenue)}`,
    "",
    "--- Results ---",
    `Net Profit/Loss:    ${result.netProfit >= 0 ? "+" : "-"}${formatCurrency(result.netProfit)}`,
    `ROI:                ${formatROI(result.roi)}`,
    `Break-even Price:   ${formatCurrency(result.breakEven)} / goat`,
  ].join("\n");
}
