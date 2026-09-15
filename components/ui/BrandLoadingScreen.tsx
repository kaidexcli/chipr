import type { ComponentPropsWithoutRef } from "react";
import { BrandMark, type BrandPartner } from "@/components/ui/BrandMark";

export interface BrandLoadingScreenProps
  extends Omit<ComponentPropsWithoutRef<"section">, "children"> {
  /** Optional partner shown in the launch lockup; null keeps it Chipr-only. */
  partner?: BrandPartner;
  /** A concise, contextual status message shown beneath the loading title. */
  message?: string;
}

/**
 * An accessible, server-safe loading experience for route streaming and the
 * FinanceProvider hydration window. It has no browser dependencies, so it can
 * be rendered from either side of the Server/Client Component boundary.
 */
export function BrandLoadingScreen({
  className = "",
  message = "Preparing your financial workspace.",
  partner = "avtica",
  ...props
}: BrandLoadingScreenProps) {
  return (
    <section
      {...props}
      aria-busy="true"
      aria-live="polite"
      className={`relative grid min-h-dvh place-items-center overflow-hidden bg-canvas px-5 py-8 sm:px-8 ${className}`}
      role="status"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-inflow/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm rounded-3xl border border-border-subtle bg-surface p-6 text-center shadow-sm sm:p-8">
        <BrandMark partner={partner} size="lg" />

        <div className="mt-8 flex justify-center" aria-hidden="true">
          <span className="relative flex h-12 w-12 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-border-subtle" />
            <span className="absolute inset-0 rounded-full border-2 border-border-subtle border-t-brand motion-safe:animate-spin" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
          </span>
        </div>

        <h1 className="mt-5 text-lg font-bold tracking-tight text-text-primary">
          Getting your workspace ready
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-text-secondary">
          {message}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Personal and business activity stay distinctly organized.
        </p>

        <div aria-hidden="true" className="mt-7 space-y-3 border-t border-border-subtle pt-5">
          <div className="flex items-center justify-between gap-4">
            <span className="h-2 w-20 rounded-full bg-raised motion-safe:animate-pulse" />
            <span className="h-2 w-12 rounded-full bg-raised motion-safe:animate-pulse" />
          </div>
          <div className="h-2 w-full rounded-full bg-raised motion-safe:animate-pulse" />
          <div className="h-2 w-3/4 rounded-full bg-raised motion-safe:animate-pulse" />
        </div>
      </div>
    </section>
  );
}

export default BrandLoadingScreen;
