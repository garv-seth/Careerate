"use client";

import { useEffect, useRef } from "react";

interface Vector2D {
  x: number;
  y: number;
}

interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  alpha: number;
  size: number;
}

export function ParticleTextEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create text particles
    const createTextParticles = () => {
      ctx.font = "bold 120px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const text = "INTRODUCING";
      const x = canvas.width / (2 * window.devicePixelRatio);
      const y = canvas.height / (2 * window.devicePixelRatio);

      // Create text path
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, x, y);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      particles.current = [];

      // Sample pixels for particles
      for (let i = 0; i < canvas.width; i += 3) {
        for (let j = 0; j < canvas.height; j += 3) {
          const index = (j * canvas.width + i) * 4;
          const alpha = data[index + 3];

          if (alpha > 128) {
            particles.current.push({
              position: {
                x: (i / window.devicePixelRatio) + (Math.random() - 0.5) * 2,
                y: (j / window.devicePixelRatio) + (Math.random() - 0.5) * 2,
              },
              velocity: {
                x: (Math.random() - 0.5) * 0.5,
                y: (Math.random() - 0.5) * 0.5,
              },
              life: Math.random() * 60 + 60,
              maxLife: Math.random() * 60 + 60,
              alpha: Math.random() * 0.8 + 0.2,
              size: Math.random() * 2 + 1,
            });
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      particles.current.forEach((particle, index) => {
        // Update particle
        particle.position.x += particle.velocity.x;
        particle.position.y += particle.velocity.y;
        particle.life--;
        particle.alpha = (particle.life / particle.maxLife) * 0.8;

        // Remove dead particles
        if (particle.life <= 0) {
          particles.current.splice(index, 1);
          return;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Recreate particles periodically
      if (particles.current.length < 50) {
        createTextParticles();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    createTextParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-40 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      <h1 className="text-6xl md:text-8xl font-bold text-white/20 backdrop-blur-sm">
        INTRODUCING
      </h1>
    </div>
  );
}