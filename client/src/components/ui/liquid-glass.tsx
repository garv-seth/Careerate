import { ReactNode, useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

// CSS-based liquid glass simulation using advanced backdrop filters and animations
function createRippleEffect(x: number, y: number, intensity: number = 1) {
  const ripple = document.createElement('div');
  ripple.className = 'liquid-ripple';
  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 1000;
    animation: liquid-ripple-expand 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  `;
  
  // Add ripple animation keyframes if not already added
  if (!document.querySelector('#liquid-ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'liquid-ripple-styles';
    style.textContent = `
      @keyframes liquid-ripple-expand {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(${20 * intensity});
          opacity: 0;
        }
      }
      
      @keyframes liquid-wave {
        0%, 100% { transform: translateY(0) scale(1, 1); }
        25% { transform: translateY(-2px) scale(1.02, 0.98); }
        50% { transform: translateY(0) scale(0.98, 1.02); }
        75% { transform: translateY(2px) scale(1.02, 0.98); }
      }
      
      @keyframes liquid-surface {
        0%, 100% { 
          backdrop-filter: blur(20px) saturate(1.2) hue-rotate(0deg);
          background-position: 0% 50%;
        }
        25% { 
          backdrop-filter: blur(25px) saturate(1.4) hue-rotate(10deg);
          background-position: 25% 40%;
        }
        50% { 
          backdrop-filter: blur(30px) saturate(1.6) hue-rotate(20deg);
          background-position: 50% 60%;
        }
        75% { 
          backdrop-filter: blur(25px) saturate(1.4) hue-rotate(10deg);
          background-position: 75% 40%;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  return ripple;
}

interface LiquidGlassPanelProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  intensity?: number;
}

export function LiquidGlassPanel({ 
  children, 
  className, 
  interactive = true, 
  intensity = 1.0 
}: LiquidGlassPanelProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const liquidLayerRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 100, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !interactive) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = (e.clientX - rect.left) / rect.width;
      const mouseY = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x: mouseX, y: mouseY });
      
      // 3D tilt effect with liquid physics
      const rotX = ((e.clientY - centerY) / rect.height) * -8 * intensity;
      const rotY = ((e.clientX - centerX) / rect.width) * 8 * intensity;
      
      x.set((e.clientX - centerX) * 0.1);
      y.set((e.clientY - centerY) * 0.1);
      rotateX.set(rotX);
      rotateY.set(rotY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!containerRef.current || !interactive) return;
      setIsPressed(true);
      
      // Create ripple effect at click position
      const rect = containerRef.current.getBoundingClientRect();
      const ripple = createRippleEffect(
        e.clientX - rect.left, 
        e.clientY - rect.top, 
        intensity
      );
      containerRef.current.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 1500);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsPressed(false);
      rotateX.set(0);
      rotateY.set(0);
      x.set(0);
      y.set(0);
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [interactive, intensity, rotateX, rotateY, x, y]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "liquid-glass-container",
        className
      )}
      style={{
        rotateX,
        rotateY,
        x,
        y,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: interactive ? 1.01 : 1 }}
      whileTap={{ scale: interactive ? 0.98 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Animated Liquid Background Layer */}
      <motion.div
        ref={liquidLayerRef}
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              rgba(147, 197, 253, 0.3) 0%, 
              rgba(59, 130, 246, 0.2) 30%, 
              rgba(37, 99, 235, 0.1) 60%,
              transparent 80%),
            linear-gradient(${mousePosition.x * 180}deg, 
              rgba(255, 255, 255, 0.15) 0%, 
              rgba(255, 255, 255, 0.05) 50%, 
              rgba(255, 255, 255, 0.02) 100%)
          `,
          backdropFilter: `blur(${isHovered ? 25 : 20}px) saturate(${isHovered ? 1.5 : 1.2}) brightness(${isHovered ? 1.1 : 1.0})`,
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
        animate={{
          backgroundSize: isHovered ? '120% 120%' : '100% 100%',
          filter: isPressed ? 'brightness(1.2) contrast(1.1)' : 'brightness(1.0) contrast(1.0)',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 40,
          backgroundSize: { duration: 0.6 }
        }}
      />
      
      {/* Liquid Surface Animation Layer */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              ${45 + mousePosition.x * 30}deg,
              transparent 0px,
              rgba(147, 197, 253, 0.1) 1px,
              transparent 2px,
              transparent 20px
            )
          `,
        }}
        animate={{
          backgroundPosition: isHovered ? '20px 20px' : '0px 0px',
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ 
          backgroundPosition: { 
            repeat: Infinity, 
            duration: 3, 
            ease: "linear" 
          } 
        }}
      />

      {/* Refraction and Light Effects */}
      <motion.div
        className="absolute inset-0 opacity-40 pointer-events-none rounded-2xl"
        style={{
          background: `
            conic-gradient(from ${mousePosition.x * 360}deg at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              rgba(147, 197, 253, 0.4), 
              rgba(59, 130, 246, 0.3), 
              rgba(37, 99, 235, 0.2), 
              rgba(147, 197, 253, 0.4))
          `,
          maskImage: 'radial-gradient(circle at center, transparent 20%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 20%, black 40%, transparent 80%)',
        }}
        animate={{
          rotate: isHovered ? 180 : 0,
          scale: isHovered ? 1.1 : 1,
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      
      {/* Content Layer with Glass Physics */}
      <motion.div 
        className={cn(
          "relative z-10 p-6",
          "backdrop-blur-md",
          isHovered && "backdrop-blur-lg"
        )}
        animate={{
          y: isPressed ? 2 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 50 }}
      >
        {children}
      </motion.div>
      
      {/* Edge Highlight Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(147, 197, 253, 0.4) 50%, transparent 70%)',
          filter: 'blur(1px)',
        }}
        animate={{
          opacity: isHovered ? 0.8 : 0.3,
          rotate: mousePosition.x * 10,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Interactive Glass Button with Physics
interface LiquidGlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

export function LiquidGlassButton({ 
  children, 
  onClick, 
  variant = "primary", 
  className 
}: LiquidGlassButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <LiquidGlassPanel 
      interactive 
      intensity={1.5}
      className={cn(
        "cursor-pointer select-none transition-all duration-200",
        "hover:shadow-xl hover:shadow-blue-500/30",
        variant === "primary" && "bg-gradient-to-r from-blue-500/20 to-purple-500/20",
        variant === "secondary" && "bg-gradient-to-r from-gray-500/20 to-gray-400/20",
        variant === "ghost" && "bg-white/5",
        className
      )}
    >
      <motion.div
        className="text-center font-medium"
        whileTap={{ scale: 0.95 }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onClick={onClick}
        animate={{
          y: isPressed ? 2 : 0,
        }}
      >
        {children}
      </motion.div>
    </LiquidGlassPanel>
  );
}