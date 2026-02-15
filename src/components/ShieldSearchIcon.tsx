/**
 * ShieldSearchIcon - Professional Logo Component
 * 
 * A modern, minimalist logo featuring a security shield integrated with a 
 * magnifying lens symbolizing verification, trust, and authenticity.
 * 
 * Design Features:
 * - Sharp geometric shapes with clean lines
 * - Balanced symmetry and professional appearance
 * - Flat design without gradients
 * - High contrast and scalable vector style
 * - Tech-focused color palette with Inventa brand colors (Olive/Gold)
 */

interface ShieldSearchIconProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'mono' | 'dark' | 'light';
}

export function ShieldSearchIcon({ 
  className = '', 
  size = 48,
  variant = 'default'
}: ShieldSearchIconProps) {
  
  // Color palettes for different variants - Updated to Olive/Gold theme
  const colorSchemes = {
    default: {
      shieldOuter: '#2d2d2d',      // Dark gray outer shield
      shieldInner: '#4D4D1A',      // Primary olive inner shield
      shieldAccent: '#333310',     // Dark olive accent
      lensRing: '#2d2d2d',         // Dark gray lens ring
      lensInner: '#ffffff',        // White lens interior
      checkBg: '#C9A227',          // Gold checkmark background
      checkMark: '#ffffff',        // White checkmark
      handle: '#2d2d2d',           // Dark gray handle
      handleAccent: '#333310',     // Dark olive handle accent
      highlight: '#8B8B3D'         // Light olive highlight
    },
    mono: {
      shieldOuter: '#1a1a2e',
      shieldInner: '#2d3a4f',
      shieldAccent: '#16213e',
      lensRing: '#1a1a2e',
      lensInner: '#ffffff',
      checkBg: '#1a1a2e',
      checkMark: '#ffffff',
      handle: '#1a1a2e',
      handleAccent: '#16213e',
      highlight: '#4a5568'
    },
    dark: {
      shieldOuter: '#4D4D1A',
      shieldInner: '#333310',
      shieldAccent: '#8B8B3D',
      lensRing: '#C9A227',
      lensInner: '#1a1a1a',
      checkBg: '#8B8B3D',
      checkMark: '#1a1a1a',
      handle: '#C9A227',
      handleAccent: '#4D4D1A',
      highlight: '#8B8B3D'
    },
    light: {
      shieldOuter: '#e5e5e5',
      shieldInner: '#4D4D1A',
      shieldAccent: '#333310',
      lensRing: '#2d2d2d',
      lensInner: '#ffffff',
      checkBg: '#C9A227',
      checkMark: '#ffffff',
      handle: '#2d2d2d',
      handleAccent: '#4a4a4a',
      highlight: '#8B8B3D'
    }
  };

  const c = colorSchemes[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Inventa Logo - Shield with Magnifying Glass"
    >
      {/* ========== SHIELD BASE ========== */}
      
      {/* Outer Shield - Dark Frame */}
      <path
        d="M50 6
           L84 18
           C86 19 88 21 88 24
           L88 46
           C88 66 72 80 50 94
           C28 80 12 66 12 46
           L12 24
           C12 21 14 19 16 18
           L50 6Z"
        fill={c.shieldOuter}
      />
      
      {/* Inner Shield - Primary Color */}
      <path
        d="M50 12
           L78 22
           C79 23 80 24 80 26
           L80 44
           C80 60 66 72 50 84
           C34 72 20 60 20 44
           L20 26
           C20 24 21 23 22 22
           L50 12Z"
        fill={c.shieldInner}
      />
      
      {/* Shield Top Section Highlight */}
      <path
        d="M50 12
           L78 22
           C79 23 80 24 80 26
           L80 34
           L20 34
           L20 26
           C20 24 21 23 22 22
           L50 12Z"
        fill={c.highlight}
        opacity="0.4"
      />
      
      {/* Shield Center Vertical Line */}
      <line
        x1="50"
        y1="12"
        x2="50"
        y2="84"
        stroke={c.shieldAccent}
        strokeWidth="1"
        opacity="0.3"
      />

      {/* ========== MAGNIFYING GLASS ========== */}
      
      {/* Lens Outer Ring */}
      <circle
        cx="58"
        cy="48"
        r="24"
        fill={c.lensRing}
      />
      
      {/* Lens Inner Circle - White */}
      <circle
        cx="58"
        cy="48"
        r="19"
        fill={c.lensInner}
      />
      
      {/* Lens Border Ring */}
      <circle
        cx="58"
        cy="48"
        r="16"
        fill="none"
        stroke={c.shieldAccent}
        strokeWidth="1"
        opacity="0.2"
      />
      
      {/* Handle Base */}
      <rect
        x="73"
        y="65"
        width="10"
        height="26"
        rx="5"
        fill={c.handle}
        transform="rotate(45 78 78)"
      />
      
      {/* Handle Accent Stripe */}
      <rect
        x="76"
        y="70"
        width="4"
        height="16"
        rx="2"
        fill={c.handleAccent}
        transform="rotate(45 78 78)"
        opacity="0.6"
      />

      {/* ========== VERIFICATION BADGE ========== */}
      
      {/* Checkmark Circle Background */}
      <circle
        cx="58"
        cy="48"
        r="12"
        fill={c.checkBg}
      />
      
      {/* Checkmark Icon */}
      <path
        d="M51 48
           L55 52
           L65 42"
        stroke={c.checkMark}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ========== LENS REFLECTIONS ========== */}
      
      {/* Top-left Reflection */}
      <ellipse
        cx="50"
        cy="38"
        rx="5"
        ry="2"
        fill={c.lensInner}
        opacity="0.8"
      />
      
      {/* Small Dot Reflection */}
      <circle
        cx="48"
        cy="42"
        r="1.5"
        fill={c.lensInner}
        opacity="0.6"
      />
    </svg>
  );
}

/**
 * Compact version of the logo for smaller sizes (favicons, small buttons)
 */
export function ShieldSearchIconCompact({ 
  className = '', 
  size = 32,
  variant = 'default'
}: ShieldSearchIconProps) {
  
  const colorSchemes = {
    default: {
      shield: '#4D4D1A',
      lens: '#2d2d2d',
      lensInner: '#ffffff',
      check: '#C9A227',
      checkMark: '#ffffff'
    },
    mono: {
      shield: '#2d3a4f',
      lens: '#1a1a2e',
      lensInner: '#ffffff',
      check: '#1a1a2e',
      checkMark: '#ffffff'
    },
    dark: {
      shield: '#4D4D1A',
      lens: '#C9A227',
      lensInner: '#1a1a1a',
      check: '#8B8B3D',
      checkMark: '#1a1a1a'
    },
    light: {
      shield: '#4D4D1A',
      lens: '#2d2d2d',
      lensInner: '#ffffff',
      check: '#C9A227',
      checkMark: '#ffffff'
    }
  };

  const c = colorSchemes[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Inventa Logo"
    >
      {/* Simplified Shield */}
      <path
        d="M24 4
           L42 12
           L42 24
           C42 36 34 44 24 46
           C14 44 6 36 6 24
           L6 12
           L24 4Z"
        fill={c.shield}
      />
      
      {/* Lens Ring */}
      <circle
        cx="28"
        cy="24"
        r="12"
        fill={c.lens}
      />
      
      {/* Lens Inner */}
      <circle
        cx="28"
        cy="24"
        r="9"
        fill={c.lensInner}
      />
      
      {/* Handle */}
      <rect
        x="36"
        y="32"
        width="5"
        height="12"
        rx="2.5"
        fill={c.lens}
        transform="rotate(45 38.5 38)"
      />
      
      {/* Check Circle */}
      <circle
        cx="28"
        cy="24"
        r="6"
        fill={c.check}
      />
      
      {/* Checkmark */}
      <path
        d="M24 24 L27 27 L32 21"
        stroke={c.checkMark}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Animated version with hover effects (for interactive elements)
 */
export function ShieldSearchIconAnimated({ 
  className = '', 
  size = 48 
}: Omit<ShieldSearchIconProps, 'variant'>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-300 hover:scale-110 ${className}`}
      role="img"
      aria-label="Inventa Logo"
    >
      {/* Shield */}
      <path
        d="M50 6 L84 18 C86 19 88 21 88 24 L88 46 C88 66 72 80 50 94 C28 80 12 66 12 46 L12 24 C12 21 14 19 16 18 L50 6Z"
        fill="#2d2d2d"
        className="transition-colors duration-300"
      />
      <path
        d="M50 12 L78 22 C79 23 80 24 80 26 L80 44 C80 60 66 72 50 84 C34 72 20 60 20 44 L20 26 C20 24 21 23 22 22 L50 12Z"
        fill="#4D4D1A"
        className="transition-colors duration-300"
      />
      
      {/* Lens */}
      <circle cx="58" cy="48" r="24" fill="#2d2d2d" />
      <circle cx="58" cy="48" r="19" fill="#ffffff" />
      
      {/* Handle */}
      <rect
        x="73" y="65" width="10" height="26" rx="5"
        fill="#2d2d2d"
        transform="rotate(45 78 78)"
      />
      
      {/* Check */}
      <circle cx="58" cy="48" r="12" fill="#C9A227" />
      <path
        d="M51 48 L55 52 L65 42"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Pulse Animation on Check */}
      <circle cx="58" cy="48" r="12" fill="none" stroke="#C9A227" strokeWidth="2">
        <animate
          attributeName="r"
          values="12;18;12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
