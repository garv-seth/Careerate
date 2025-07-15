import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  staggerDelay?: number;
}

// Kinetic typography component inspired by 21st.dev
const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  staggerDelay = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const words = text.split(" ");

  return (
    <motion.div
      className={`inline-block overflow-hidden ${className}`}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={{
            hidden: { y: 50, opacity: 0 },
            visible: { y: 0, opacity: 1 },
          }}
          transition={{
            duration,
            delay: index * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Glitch text effect component
const GlitchText: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <span
        className={`transition-all duration-200 ${
          isGlitching ? "animate-pulse" : ""
        }`}
        style={{
          textShadow: isGlitching
            ? "0.05em 0 0 #ff0000, -0.05em -0.025em 0 #00ff00, 0.025em 0.05em 0 #0000ff"
            : "none",
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Typewriter effect component
const TypewriterText: React.FC<{
  text: string;
  className?: string;
  speed?: number;
}> = ({ text, className = "", speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={`${className}`}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Gradient text with animation
const GradientText: React.FC<{
  text: string;
  className?: string;
  gradient?: string;
}> = ({
  text,
  className = "",
  gradient = "from-blue-400 via-purple-500 to-pink-500",
}) => {
  return (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent animate-pulse ${className}`}
    >
      {text}
    </span>
  );
};

// Floating text effect
const FloatingText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = "" }) => {
  return (
    <motion.div
      className={`${className}`}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.02, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.div>
  );
};

export {
  AnimatedText,
  GlitchText,
  TypewriterText,
  GradientText,
  FloatingText,
};