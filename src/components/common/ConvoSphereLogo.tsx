import React from 'react';

interface ConvoSphereLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
  withRings?: boolean;
}

const sizeMap = {
  xs: { width: 24, height: 24, fontSize: 8 },
  sm: { width: 32, height: 32, fontSize: 11 },
  md: { width: 44, height: 44, fontSize: 14 },
  lg: { width: 64, height: 64, fontSize: 18 },
  xl: { width: 88, height: 88, fontSize: 24 },
};

/**
 * ConvoSphere Public Logo & Icon:
 * A futuristic glowing 3D translucent sphere surrounded by dynamic chat rings with an inner
 * gradient blending Electric Blue (#007AFF), Vibrant Pink (#FF007F), Light Blue (#00F0FF),
 * and Royal Purple (#8A2BE2) with a Gold (#FFD700) core highlight.
 */
export const ConvoSphereLogo: React.FC<ConvoSphereLogoProps> = ({
  size = 'md',
  className = '',
  withGlow = true,
  withRings = true,
}) => {
  const { width, height } = sizeMap[size];
  const filterId = `cs-glow-${size}`;
  const sphereGradId = `cs-sphere-${size}`;
  const ringGradId = `cs-ring-${size}`;
  const goldCoreId = `cs-gold-${size}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width, height }}
      aria-label="ConvoSphere Logo"
    >
      <svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Neon Sphere Blend Gradient */}
          <radialGradient id={sphereGradId} cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#007AFF" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#8A2BE2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF007F" stopOpacity="0.95" />
          </radialGradient>

          {/* Core Gold Highlight Gradient */}
          <radialGradient id={goldCoreId} cx="38%" cy="36%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#FFF2A3" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#FFD700" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0" />
          </radialGradient>

          {/* Orbital Ring Gradient */}
          <linearGradient id={ringGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="30%" stopColor="#FF007F" />
            <stop offset="70%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#8A2BE2" />
          </linearGradient>

          {/* Dynamic Filter Glow */}
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Glow Halo if enabled */}
        {withGlow && (
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="url(#"
            stroke="none"
            className="opacity-40 animate-pulse"
            style={{
              fill: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, rgba(255,0,127,0.3) 50%, rgba(138,43,226,0) 80%)',
            }}
          />
        )}

        {/* Dynamic Orbital Chat Rings */}
        {withRings && (
          <g filter={withGlow ? `url(#${filterId})` : undefined}>
            {/* Elliptical Ring 1 */}
            <ellipse
              cx="50"
              cy="50"
              rx="44"
              ry="18"
              transform="rotate(-28 50 50)"
              stroke={`url(#${ringGradId})`}
              strokeWidth="2.8"
              strokeDasharray="90 18"
              strokeLinecap="round"
              className="opacity-90"
            />
            {/* Small Orbital Message Pip on Ring 1 */}
            <circle
              cx="16"
              cy="34"
              r="3.5"
              fill="#FFD700"
              stroke="#FFFFFF"
              strokeWidth="1"
              className="drop-shadow-[0_0_6px_#FFD700]"
            />

            {/* Elliptical Ring 2 (Cross Angle) */}
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="16"
              transform="rotate(38 50 50)"
              stroke={`url(#${ringGradId})`}
              strokeWidth="2"
              strokeDasharray="65 24"
              strokeLinecap="round"
              className="opacity-75"
            />
            {/* Second Orbital Pip */}
            <circle
              cx="82"
              cy="62"
              r="3"
              fill="#00F0FF"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              className="drop-shadow-[0_0_5px_#00F0FF]"
            />
          </g>
        )}

        {/* 3D Translucent Glowing Sphere */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill={`url(#${sphereGradId})`}
          filter={withGlow ? `url(#${filterId})` : undefined}
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.5"
          className="shadow-2xl"
        />

        {/* Gold Core Energy Highlight */}
        <circle
          cx="44"
          cy="42"
          r="16"
          fill={`url(#${goldCoreId})`}
          className="mix-blend-screen"
        />

        {/* Glass Specular Crescent Reflection (Top Left 3D Curvature) */}
        <path
          d="M 30 38 A 24 24 0 0 1 65 26 A 21 21 0 0 0 35 44 Z"
          fill="#FFFFFF"
          opacity="0.65"
        />

        {/* Secondary Glass Ambient Rim */}
        <ellipse
          cx="50"
          cy="66"
          rx="18"
          ry="6"
          fill="#00F0FF"
          opacity="0.35"
        />
      </svg>
    </div>
  );
};
