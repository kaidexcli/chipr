import React from "react";

export type BirdMascotSize = "sm" | "md" | "lg" | "xl";

export interface ChiprBirdMascotProps {
  className?: string;
  size?: BirdMascotSize;
  animated?: boolean;
  withSparkles?: boolean;
}

const sizeMap: Record<BirdMascotSize, { width: number; height: number; container: string }> = {
  sm: { width: 64, height: 64, container: "w-16 h-16" },
  md: { width: 96, height: 96, container: "w-24 h-24" },
  lg: { width: 128, height: 128, container: "w-32 h-32" },
  xl: { width: 160, height: 160, container: "w-40 h-40" },
};

/**
 * ChiprBirdMascot — The official financial companion mascot for Chipr.
 * A delightful, energetic bird symbolizing financial agility, growth, and watchful care.
 */
export function ChiprBirdMascot({
  className = "",
  size = "lg",
  animated = true,
  withSparkles = true,
}: ChiprBirdMascotProps) {
  const { container } = sizeMap[size];

  return (
    <div
      aria-label="Chipr bird mascot"
      className={`relative inline-flex flex-col items-center justify-center ${container} ${className}`}
      role="img"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-sm"
      >
        <defs>
          {/* Main Body Gradient: Deep Indigo to Royal Violet */}
          <linearGradient id="chiprBodyGrad" x1="22" y1="20" x2="98" y2="98" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="55%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>

          {/* Belly Gradient: Soft Iridescent Lilac to Sky */}
          <linearGradient id="chiprBellyGrad" x1="46" y1="46" x2="88" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5f7ff" />
            <stop offset="60%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#a5b4fc" />
          </linearGradient>

          {/* Wing Gradient: Velvet Indigo Depth */}
          <linearGradient id="chiprWingGrad" x1="28" y1="48" x2="68" y2="88" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>

          {/* Beak Gradient: Warm Golden Amber */}
          <linearGradient id="chiprBeakGrad" x1="90" y1="44" x2="110" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Financial Coin Charm Gradient */}
          <linearGradient id="chiprCoinGrad" x1="42" y1="74" x2="54" y2="86" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Subtle Ambient Shadow */}
          <filter id="chiprMascotShadow" x="-15%" y="-15%" width="130%" height="135%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4f46e5" floodOpacity="0.28" />
          </filter>

          <style>{`
            @keyframes birdFloatSmooth {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-7px) rotate(1.2deg);
              }
            }
            @keyframes birdShadowSmooth {
              0%, 100% {
                transform: scale(1);
                opacity: 0.22;
              }
              50% {
                transform: scale(0.85);
                opacity: 0.1;
              }
            }
            .chipr-bird-anim {
              animation: birdFloatSmooth 3.6s ease-in-out infinite;
              transform-origin: center;
              will-change: transform;
            }
            .chipr-bird-shadow-anim {
              animation: birdShadowSmooth 3.6s ease-in-out infinite;
              transform-origin: center;
              will-change: transform, opacity;
            }
          `}</style>
        </defs>

        {/* Ambient Ground Shadow with breathing animation */}
        <ellipse
          cx="60"
          cy="112"
          rx="32"
          ry="4.5"
          fill="#4f46e5"
          className={animated ? "chipr-bird-shadow-anim" : "opacity-20"}
        />

        {/* Floating Bird Character Group */}
        <g
          filter="url(#chiprMascotShadow)"
          className={animated ? "chipr-bird-anim" : ""}
        >
          {/* Tail Feathers */}
          <path
            d="M22 68 C12 60 5 72 9 82 C13 86 24 84 32 76 Z"
            fill="#4338ca"
          />
          <path
            d="M26 62 C16 54 9 63 13 73 C17 78 28 76 36 68 Z"
            fill="#4f46e5"
          />

          {/* Main Plump Body */}
          <path
            d="M30 64 C30 38 52 24 74 26 C94 28 102 46 98 68 C94 90 74 102 52 100 C36 98 30 82 30 64 Z"
            fill="url(#chiprBodyGrad)"
          />

          {/* Breast / Belly Patch (Warm, friendly, optimistic) */}
          <path
            d="M54 44 C66 44 86 52 86 70 C86 86 72 98 56 98 C46 98 42 90 42 80 C42 60 48 44 54 44 Z"
            fill="url(#chiprBellyGrad)"
          />

          {/* Head Tuft Feathers */}
          <path
            d="M68 26 C68 18 72 14 78 12 C78 18 76 22 72 26 Z"
            fill="#818cf8"
          />
          <path
            d="M62 27 C60 21 64 16 70 15 C68 20 67 24 64 28 Z"
            fill="#6366f1"
          />

          {/* Cheerful Beak (Open slightly in a happy chirp) */}
          <path
            d="M92 46 L109 51 C110 51.5 110 52.5 109 53 L92 58 Z"
            fill="url(#chiprBeakGrad)"
          />
          <path
            d="M92 52 L105 52.5 L92 57 Z"
            fill="#d97706"
            opacity="0.45"
          />

          {/* Wing (Layered with fintech sheen) */}
          <path
            d="M38 58 C38 58 48 52 62 56 C72 60 74 72 68 82 C60 92 42 88 34 76 C32 72 36 62 38 58 Z"
            fill="url(#chiprWingGrad)"
          />
          {/* Wing Inner Feather Highlight */}
          <path
            d="M46 64 C52 60 62 64 64 74 C60 80 48 80 42 74 Z"
            fill="#818cf8"
            fillOpacity="0.4"
          />

          {/* Coin / Emerald Growth Token on Wing */}
          <circle cx="48" cy="80" r="5" fill="url(#chiprCoinGrad)" />
          <path
            d="M48 77.2 V82.8 M45.5 80 H50.5"
            stroke="#ffffff"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          {/* Cheerful Cheek Blush */}
          <ellipse cx="84" cy="53" rx="5" ry="3.2" fill="#fb7185" fillOpacity="0.4" />

          {/* Big, Friendly Eye */}
          <circle cx="80" cy="42" r="5.8" fill="#0f172a" />
          <circle cx="82" cy="40.3" r="2.2" fill="#ffffff" />
          <circle cx="78.2" cy="43.6" r="0.9" fill="#ffffff" />

          {/* Tiny Feet Perched */}
          <path
            d="M48 100 L46 106 M50 100 L51 106 M62 99 L61 105 M65 99 L67 105"
            stroke="#f59e0b"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>

        {/* Chirping Musical & Sparkle Accents */}
        {withSparkles && (
          <g className={animated ? "motion-safe:animate-chirp-sparkle" : ""}>
            {/* Sparkle star near beak */}
            <path
              d="M107 33 L108.5 29.5 L112 28 L108.5 26.5 L107 23 L105.5 26.5 L102 28 L105.5 29.5 Z"
              fill="#fbbf24"
            />
            {/* Small financial emerald gem note */}
            <circle cx="114" cy="40" r="2" fill="#34d399" />
            {/* Floating chirp chime note */}
            <path
              d="M99 20 C101 18 105 19 105 22 C105 25 102 26 99 24 Z"
              fill="#818cf8"
              opacity="0.85"
            />
          </g>
        )}
      </svg>
    </div>
  );
}

export default ChiprBirdMascot;
