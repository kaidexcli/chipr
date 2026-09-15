import type { ComponentPropsWithoutRef } from "react";
import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";

export type BrandPartner = "avtica" | "nmblr" | null;
export type BrandMarkSize = "sm" | "md" | "lg";
export type BrandMarkVariant = "full" | "glyph";

export interface BrandMarkProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * An optional collaboration wordmark displayed before Chipr. Omit it to
   * retain the standalone Chipr identity.
   */
  partner?: BrandPartner;
  /** Controls the lockup scale without relying on one-off layout values. */
  size?: BrandMarkSize;
  /** Use the glyph-only variant in constrained navigation or controls. */
  variant?: BrandMarkVariant;
  /** Display the official Chipr bird mascot instead of the geometric glyph. */
  mascot?: boolean;
}

const partnerLabels: Record<Exclude<BrandPartner, null>, string> = {
  avtica: "Avtica",
  nmblr: "NMBLR",
};

const sizeClasses: Record<
  BrandMarkSize,
  { glyph: string; chipr: string; partner: string; separator: string }
> = {
  sm: {
    glyph: "h-7 w-7 rounded-lg",
    chipr: "text-sm",
    partner: "text-xs",
    separator: "text-xs",
  },
  md: {
    glyph: "h-9 w-9 rounded-xl",
    chipr: "text-base",
    partner: "text-sm",
    separator: "text-sm",
  },
  lg: {
    glyph: "h-11 w-11 rounded-xl",
    chipr: "text-xl",
    partner: "text-base",
    separator: "text-base",
  },
};

/**
 * The compact Chipr glyph. It uses `currentColor`, allowing the surrounding
 * surface to provide the visual token and making it safe in every theme.
 */
export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.7 10.3a10.5 10.5 0 1 0 .1 11.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
      <path
        d="M10.3 16h11.4M17.2 10.8l5.2 5.2-5.2 5.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
      <circle cx="9.2" cy="16" fill="currentColor" r="1.3" />
    </svg>
  );
}

/**
 * A token-driven Chipr brand lockup. By default it renders Chipr alone; pass
 * a partner to render a compact collaboration lockup such as “Avtica × Chipr”.
 */
export function BrandMark({
  "aria-label": ariaLabel,
  className = "",
  partner = null,
  size = "md",
  variant = "full",
  mascot = false,
  ...props
}: BrandMarkProps) {
  const isGlyphOnly = variant === "glyph";
  const partnerLabel = partner ? partnerLabels[partner] : null;
  const classes = sizeClasses[size];

  return (
    <div
      {...props}
      aria-label={isGlyphOnly ? ariaLabel ?? "Chipr" : ariaLabel}
      className={`inline-flex items-center gap-2 ${className}`}
      role={isGlyphOnly ? "img" : undefined}
    >
      {!isGlyphOnly && partnerLabel ? (
        <span
          className={`${classes.partner} font-semibold tracking-wide text-text-secondary`}
        >
          {partnerLabel}
        </span>
      ) : null}

      {!isGlyphOnly && partnerLabel ? (
        <span
          aria-hidden="true"
          className={`${classes.separator} font-medium text-text-muted`}
        >
          ×
        </span>
      ) : null}

      {mascot ? (
        <ChiprBirdMascot
          size={size === "lg" ? "md" : "sm"}
          animated
          className="shrink-0"
        />
      ) : (
        <span
          aria-hidden="true"
          className={`inline-flex shrink-0 items-center justify-center bg-brand p-1.5 text-text-inverse ${classes.glyph}`}
        >
          <BrandGlyph className="h-full w-full" />
        </span>
      )}

      {!isGlyphOnly ? (
        <span
          className={`${classes.chipr} font-extrabold tracking-tight text-text-primary`}
        >
          Chipr
        </span>
      ) : null}
    </div>
  );
}

export default BrandMark;
