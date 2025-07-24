import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text: string;
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingAnimation({
  text,
  duration = 200,
  className,
  onComplete
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [i, setI] = useState<number>(0);

  useEffect(() => {
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        setI(i + 1);
      } else {
        clearInterval(typingEffect);
        onComplete?.();
      }
    }, duration);

    return () => {
      clearInterval(typingEffect);
    };
  }, [duration, i, text, onComplete]);

  return (
    <h1
      className={cn(
        "font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm",
        className,
      )}
    >
      {displayedText ? displayedText : text}
    </h1>
  );
}

interface CyclingTextProps {
  texts: string[];
  className?: string;
  duration?: number;
  typingSpeed?: number;
}

export function CyclingText({
  texts,
  className,
  duration = 3000,
  typingSpeed = 100
}: CyclingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTyping(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }, 500);
    }, duration);

    return () => clearInterval(timer);
  }, [texts, duration]);

  if (!isTyping) {
    return (
      <div className={cn("opacity-50 transition-opacity duration-500", className)}>
        {texts[currentIndex]}
      </div>
    );
  }

  return (
    <TypingAnimation
      text={texts[currentIndex]}
      duration={typingSpeed}
      className={className}
    />
  );
}