/**
 * Careerate Theme Configuration
 * Central source of truth for all colors, animations, and styling
 */

export const theme = {
  colors: {
    brand: {
      primary: {
        from: '#F97316', // orange-500
        to: '#F59E0B',   // amber-500
      },
      secondary: {
        from: '#F97316',
        to: '#FBBF24',   // amber-400
      },
      hover: {
        from: '#EA580C', // orange-600
        to: '#D97706',   // amber-600
      }
    },
    gradient: {
      // Main brand gradient
      primary: 'from-orange-500 to-amber-500',
      primaryHover: 'from-orange-600 to-amber-600',

      // Soft gradients for backgrounds
      softOrange: 'from-orange-500/20 via-amber-500/10 to-black/20',

      // Badge/Status colors
      success: 'from-green-500 to-emerald-500',
      info: 'from-blue-500 to-cyan-500',
      warning: 'from-orange-500 to-red-500',
      purple: 'from-indigo-500 to-purple-500',
      pink: 'from-pink-500 to-rose-500',
    },
    shadows: {
      // Brand-colored shadows
      primary: 'shadow-orange-500/25',
      primaryLg: 'shadow-lg shadow-orange-500/25',
      primaryXl: 'shadow-xl shadow-orange-500/30',
      primary2xl: 'shadow-2xl shadow-orange-500/40',

      // Hover shadows
      hoverXl: 'hover:shadow-xl hover:shadow-orange-500/30',
      hover2xl: 'hover:shadow-2xl hover:shadow-orange-500/40',
    }
  },

  animations: {
    // Duration presets
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },

    // Framer Motion variants
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5 }
    },

    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.3 }
    },

    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.4 }
    },

    slideInFromRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: 0.3 }
    },

    // Stagger children animations
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1
        }
      }
    }
  },

  components: {
    // Reusable component styles
    button: {
      primary: 'rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105',
      secondary: 'rounded-full border-border text-foreground hover:bg-primary/10',
      ghost: 'rounded-full text-foreground/70 hover:text-foreground hover:bg-primary/10',
    },

    card: {
      glass: 'glass-pane rounded-3xl',
      interactive: 'glass-pane rounded-2xl hover:-translate-y-1 transition-all duration-200',
    },

    input: {
      default: 'glass-pane rounded-lg text-foreground placeholder:text-foreground/50',
      focus: 'focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40',
      textareaHero: 'resize-none rounded-2xl bg-[rgba(15,15,20,0.55)] border border-white/10 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 backdrop-blur-md',
    },

    badge: {
      primary: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    }
  }
} as const;

// Helper functions
export const getBrandGradient = (hover = false) =>
  hover ? theme.colors.gradient.primaryHover : theme.colors.gradient.primary;

export const getBrandShadow = (size: 'primary' | 'lg' | 'xl' | '2xl' = 'lg') =>
  theme.colors.shadows[size === 'primary' ? 'primary' : `primary${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof theme.colors.shadows];
