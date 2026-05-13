"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Copy,
  Check,
  RotateCcw,
  Target,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  type GoatInputs,
  type CalculationResult,
  formatCurrency,
  formatROI,
  buildSummaryText,
  buildClipboardText,
} from "@/app/lib/calculator";

interface SummaryCardProps {
  inputs: GoatInputs;
  result: CalculationResult;
  onReset: () => void;
}

export function SummaryCard({ inputs, result, onReset }: SummaryCardProps) {
  const [copied, setCopied] = useState(false);
  const isProfit = result.netProfit >= 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildClipboardText(inputs, result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers that block clipboard without user gesture
    }
  };

  return (
    <div className="sticky top-6 flex flex-col gap-4">
      {/* Main Profit Card */}
      <div
        className={[
          "rounded-xl border p-6 text-center",
          isProfit
            ? "border-emerald-500/40 bg-emerald-950/30"
            : "border-red-500/40 bg-red-950/20",
        ].join(" ")}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          {isProfit ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-medium text-slate-400">
            {isProfit ? "Net Profit" : "Net Loss"}
          </span>
        </div>
        <p
          className={[
            "text-4xl font-bold tracking-tight",
            isProfit ? "text-emerald-400" : "text-red-400",
          ].join(" ")}
        >
          {isProfit ? "+" : "-"}
          {formatCurrency(result.netProfit)}
        </p>
        <p
          className={[
            "mt-1.5 text-lg font-semibold",
            isProfit ? "text-emerald-500" : "text-red-500",
          ].join(" ")}
        >
          ROI: {formatROI(result.roi)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          icon={DollarSign}
          label="Total Investment"
          value={formatCurrency(result.totalInvestment)}
          accent="text-sky-400"
        />
        <StatTile
          icon={BarChart3}
          label="Total Revenue"
          value={formatCurrency(result.totalRevenue)}
          accent="text-slate-300"
        />
        <StatTile
          icon={Target}
          label="Break-even / Goat"
          value={formatCurrency(result.breakEven)}
          accent="text-amber-400"
        />
        <StatTile
          icon={isProfit ? TrendingUp : TrendingDown}
          label="Surviving Goats"
          value={`${result.survivingGoats} of ${result.totalGoats}`}
          accent="text-slate-300"
        />
      </div>

      {/* Dynamic Summary */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Summary
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          {buildSummaryText(inputs, result)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-slate-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={handleCopy}
          className={[
            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            copied
              ? "bg-emerald-600 text-white border border-emerald-500"
              : "bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20",
          ].join(" ")}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Summary
            </>
          )}
        </button>
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}

function StatTile({ icon: Icon, label, value, accent }: StatTileProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${accent}`} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className={`text-sm font-bold font-mono tabular-nums ${accent}`}>
        {value}
      </p>
    </div>
  );
}
