import React from "react";
import { MoneyAmount } from "./MoneyAmount";

interface RunwayCardProps {
  monthlyBurnRate: number;
  cashRunwayMonths: number;
  liquidReserves: number;
  currency?: string;
  privacyMask?: boolean;
  className?: string;
}

export function RunwayCard({
  monthlyBurnRate,
  cashRunwayMonths,
  liquidReserves,
  currency = "USD",
  privacyMask = false,
  className = "",
}: RunwayCardProps) {
  const isHealthy = cashRunwayMonths >= 12;
  const isWarning = cashRunwayMonths > 0 && cashRunwayMonths < 6;
  const isZero = monthlyBurnRate === 0 && liquidReserves === 0;

  // Percentage of a 24-month benchmark
  const runwayProgress = Math.min(Math.round((cashRunwayMonths / 24) * 100), 100);

  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-surface p-4 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Cash Runway & Solvency
          </h3>
          <p className="text-xs text-text-muted">
            Solvency projection based on liquid operating reserves
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold ${
            isZero
              ? "bg-raised text-text-muted"
              : isWarning
              ? "bg-outflow-subtle text-outflow"
              : isHealthy
              ? "bg-inflow-subtle text-inflow"
              : "bg-warning-subtle text-warning"
          }`}
        >
          {isZero
            ? "0.0 Mos"
            : cashRunwayMonths >= 99
            ? "99+ Mos (Break-even)"
            : `${cashRunwayMonths.toFixed(1)} Mos Runway`}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="rounded-xl border border-border-subtle bg-canvas p-3.5">
          <p className="text-xs text-text-muted">Monthly Net Burn</p>
          <div className="mt-1">
            <MoneyAmount
              amount={-monthlyBurnRate}
              currency={currency}
              privacyMask={privacyMask}
              size="md"
              colored
            />
          </div>
        </div>
        <div className="rounded-xl border border-border-subtle bg-canvas p-3.5">
          <p className="text-xs text-text-muted">Liquid Operating Cash</p>
          <div className="mt-1">
            <MoneyAmount
              amount={liquidReserves}
              currency={currency}
              privacyMask={privacyMask}
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-text-muted mb-1.5 font-mono">
          <span>Runway Gauge (Benchmark: 24 mos)</span>
          <span>{cashRunwayMonths.toFixed(1)} / 24.0 mos</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-raised">
          <div
            className={`h-full transition-all duration-500 ease-out ${
              isZero
                ? "bg-slate-300 dark:bg-slate-700"
                : isWarning
                ? "bg-outflow"
                : isHealthy
                ? "bg-inflow"
                : "bg-warning"
            }`}
            style={{ width: `${runwayProgress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 text-xs text-text-muted">
        {isZero ? (
          <p className="text-text-muted">
            Add business accounts and record expenses to project operational cash runway.
          </p>
        ) : isHealthy ? (
          <p className="text-inflow font-medium">
            Strong runway buffer. Business can sustain operations comfortably.
          </p>
        ) : isWarning ? (
          <p className="text-outflow font-medium">
            Runway under 6 months. Prioritize invoice collection or capital contribution.
          </p>
        ) : (
          <p className="text-warning font-medium">
            Moderate runway. Monitor monthly burn rate and impending bills.
          </p>
        )}
      </div>
    </div>
  );
}
