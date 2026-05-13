"use client";

import {
  type CostBreakdownRow,
  type CalculationResult,
  formatCurrency,
} from "@/app/lib/calculator";

interface CostTableProps {
  rows: CostBreakdownRow[];
  result: CalculationResult;
}

export function CostTable({ rows, result }: CostTableProps) {
  const acquisitionRows = rows.filter((r) => r.category === "acquisition");
  const operationalRows = rows.filter((r) => r.category === "operational");
  const additionalRows = rows.filter((r) => r.category === "additional");

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700 bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Full Cost Breakdown
        </h2>
      </div>

      <div className="p-5 grid gap-4">
        <CostGroup
          label="Acquisition Costs"
          rows={acquisitionRows}
          subtotal={result.acquisitionCost}
          accent="text-sky-400"
        />
        <CostGroup
          label="Operational Costs"
          rows={operationalRows}
          subtotal={result.operationalCost}
          accent="text-amber-400"
        />
        <CostGroup
          label="Additional Costs"
          rows={additionalRows}
          subtotal={result.additionalCost}
          accent="text-rose-400"
        />

        {/* Total Row */}
        <div className="pt-3 border-t-2 border-slate-600 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-200">
            Total Investment
          </span>
          <span className="text-base font-bold text-slate-100">
            {formatCurrency(result.totalInvestment)}
          </span>
        </div>

        {/* Revenue Row */}
        <div className="flex justify-between items-center -mt-1">
          <span className="text-sm text-slate-400">
            Total Revenue ({result.totalGoatsSold} goats sold)
          </span>
          <span className="text-sm font-semibold text-emerald-400">
            {formatCurrency(result.totalRevenue)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CostGroupProps {
  label: string;
  rows: CostBreakdownRow[];
  subtotal: number;
  accent: string;
}

function CostGroup({ label, rows, subtotal, accent }: CostGroupProps) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${accent}`}>
        {label}
      </p>
      <div className="rounded-lg border border-slate-700 divide-y divide-slate-700/70 overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center px-4 py-2.5 text-sm"
          >
            <span className="text-slate-400">{row.label}</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {formatCurrency(row.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center px-4 py-2.5 bg-slate-700/40">
          <span className="text-xs font-semibold text-slate-300">Subtotal</span>
          <span className={`text-sm font-bold font-mono tabular-nums ${accent}`}>
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
