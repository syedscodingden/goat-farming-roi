"use client";

import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

interface InputSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

export function InputSection({ title, icon: Icon, children }: InputSectionProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      <div className="p-5 grid gap-4">{children}</div>
    </div>
  );
}

interface InputRowProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function InputRow({ label, hint, children }: InputRowProps) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
}: NumberInputProps) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value === 0 ? "" : value}
        placeholder="0"
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const raw = parseFloat(e.target.value);
          onChange(isNaN(raw) ? 0 : Math.max(min, raw));
        }}
        className={[
          "w-full rounded-lg border border-slate-600 bg-slate-900 text-slate-100",
          "text-sm py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500",
          "transition-colors placeholder:text-slate-600",
          prefix ? "pl-7" : "pl-3",
          suffix ? "pr-12" : "pr-3",
        ].join(" ")}
      />
      {suffix && (
        <span className="absolute right-3 text-xs text-slate-500 pointer-events-none select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
}

export function SliderInput({
  value,
  onChange,
  min,
  max,
  step = 0.5,
}: SliderInputProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none bg-slate-700 accent-emerald-500 cursor-pointer"
      />
      <span className="w-14 text-right text-sm font-mono font-semibold text-emerald-400">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}
