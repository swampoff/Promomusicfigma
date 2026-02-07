import { motion } from "motion/react";
import React from "react";

/**
 * GLASS CARD - Базовый стеклянный компонент с улучшенной адаптивностью
 */
interface GlassCardProps {
  children: React.ReactNode;
  variant?: "default" | "hover" | "gradient" | "glow" | "premium" | "neon";
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
}

export function GlassCard({
  children,
  variant = "default",
  blur = "md",
  glow = false,
  className = "",
  onClick,
  hoverScale = true,
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantClasses = {
    default: "bg-white/5 border border-white/10",
    hover: "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
    gradient: "bg-gradient-to-br from-white/10 to-white/5 border border-white/10",
    glow: "bg-white/5 border border-white/10 shadow-lg shadow-[#FF577F]/20",
    premium: "bg-gradient-to-br from-[#FF577F]/10 to-purple-500/10 border border-[#FF577F]/20",
    neon: "bg-white/5 border-2 border-[#FF577F]/50 shadow-[0_0_20px_rgba(255,87,127,0.3)]",
  };

  return (
    <motion.div
      whileHover={{ scale: variant === "hover" && hoverScale ? 1.02 : 1 }}
      className={`
        ${blurClasses[blur]}
        ${variantClasses[variant]}
        ${glow ? "hover:shadow-2xl hover:shadow-[#FF577F]/30" : ""}
        rounded-xl xs:rounded-2xl
        transition-all duration-300
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * GLASS BUTTON - Стеклянная кнопка с адаптивными размерами
 */
interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "neon";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  glow = false,
  className = "",
  onClick,
  style,
}: GlassButtonProps) {
  const sizeClasses = {
    sm: "px-2.5 xs:px-3 py-1.5 text-xs xs:text-sm",
    md: "px-3 xs:px-4 py-2 text-sm xs:text-base",
    lg: "px-4 xs:px-6 py-2.5 xs:py-3 text-base xs:text-lg",
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#FF577F] to-purple-500 text-white font-bold",
    secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white",
    ghost: "bg-transparent border border-white/30 text-white hover:bg-white/10",
    neon: "bg-transparent border-2 border-[#FF577F] text-[#FF577F] hover:bg-[#FF577F]/10",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${glow ? "shadow-lg shadow-[#FF577F]/30 hover:shadow-xl hover:shadow-[#FF577F]/50" : ""}
        rounded-lg xs:rounded-xl
        transition-all duration-300
        flex items-center justify-center gap-1.5 xs:gap-2
        ${className}
      `}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.button>
  );
}

/**
 * ANIMATED BACKGROUND - Адаптивный анимированный фон
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Градиентные круги - адаптивные размеры */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-0 left-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-[#FF577F] rounded-full blur-[80px] xs:blur-[100px] md:blur-[120px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-0 right-1/4 w-64 h-64 xs:w-80 xs:h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] bg-purple-500 rounded-full blur-[80px] xs:blur-[100px] md:blur-[120px]"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 xs:w-96 xs:h-96 sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] bg-blue-500 rounded-full blur-[100px] xs:blur-[120px] md:blur-[150px]"
      />
      
      {/* Дополнительные декоративные элементы для 4K */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="hidden 2xl:block absolute top-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[150px]"
      />
    </div>
  );
}

/**
 * FLOATING PARTICLES - Адаптивные плавающие частицы
 */
export function FloatingParticles({ color }: { color?: string }) {
  // Меньше частиц на мобильных для производительности
  const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 20;
  
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1.5, // Меньше размер на мобильных
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color || '#FF577F',
            opacity: 0.2,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * PULSE GLOW - Пульсирующее свечение
 */
export function PulseGlow({ color = "#FF577F", className = "" }: { color?: string; className?: string }) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}30`,
          `0 0 40px ${color}50`,
          `0 0 20px ${color}30`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    />
  );
}