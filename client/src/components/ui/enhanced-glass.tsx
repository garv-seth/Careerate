import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedGlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'medium' | 'heavy';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  hover?: boolean;
  [key: string]: any;
}

export const EnhancedGlass: React.FC<EnhancedGlassProps> = ({
  children,
  className,
  variant = 'medium',
  blur = 'md',
  glow = false,
  hover = true,
  ...props
}) => {
  const variants = {
    light: 'bg-white/5 border-white/10',
    medium: 'bg-white/10 border-white/20',
    heavy: 'bg-white/20 border-white/30'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const glowClass = glow ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)]' : '';

  return (
    <motion.div
      className={cn(
        'border rounded-xl transition-all duration-300',
        variants[variant],
        blurClasses[blur],
        glowClass,
        hover && 'hover:bg-white/15 hover:border-white/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]',
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassCard: React.FC<EnhancedGlassProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <EnhancedGlass
      className={cn('p-6', className)}
      variant="medium"
      blur="lg"
      glow={true}
      {...props}
    >
      {children}
    </EnhancedGlass>
  );
};

export const GlassButton: React.FC<EnhancedGlassProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      className={cn(
        'px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition-all duration-300',
        'hover:bg-white/20 hover:border-white/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const GlassPanel: React.FC<EnhancedGlassProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <EnhancedGlass
      className={cn('p-8', className)}
      variant="heavy"
      blur="xl"
      glow={true}
      {...props}
    >
      <div className="relative">
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </EnhancedGlass>
  );
};