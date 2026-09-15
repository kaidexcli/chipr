"use client";

import { ChiprBirdMascot } from "@/components/ui/ChiprBirdMascot";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";

export interface BrandLoadingScreenProps extends ComponentPropsWithoutRef<"div"> {
  className?: string;
  partner?: unknown;
  message?: string;
  /** Duration in ms to stay visible before initiating smooth exit fade */
  minDuration?: number;
  /** Callback fired when the exit fade animation finishes */
  onComplete?: () => void;
}

/**
 * BrandLoadingScreen — High-end minimalist loading & splash screen.
 * Displays only the Chipr bird mascot and the "Chipr" wordmark in a smooth fading animation
 * on a plain canvas background.
 */
export function BrandLoadingScreen({
  className = "",
  minDuration = 2600,
  onComplete,
  partner: _partner,
  message: _message,
  ...props
}: BrandLoadingScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!onComplete && minDuration <= 0) return;

    // Display for the requested duration before starting exit fade
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onComplete?.();
      }, 450); // 450ms smooth fadeout
      return () => clearTimeout(exitTimer);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onComplete]);

  return (
    <div
      {...props}
      aria-busy="true"
      aria-live="polite"
      role="status"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      } ${className}`}
    >
      <style>{`
        @keyframes chiprBreatheFade {
          0%, 100% {
            opacity: 0.18;
            transform: scale(0.975);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .chipr-fading-wordmark {
          animation: chiprBreatheFade 2.4s ease-in-out infinite;
          will-change: opacity, transform;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center">
        {/* Bird Mascot Logo */}
        <ChiprBirdMascot size="lg" animated withSparkles={false} />

        {/* "Chipr" Wordmark with Smooth Fading Animation */}
        <h1 className="chipr-fading-wordmark mt-5 text-4xl sm:text-5xl font-black tracking-tight text-text-primary">
          Chipr
        </h1>
      </div>
    </div>
  );
}

export default BrandLoadingScreen;
