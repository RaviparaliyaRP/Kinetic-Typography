
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EngineConfig } from '../types';
import { Particle } from '../services/Particle';

interface CanvasEngineProps {
  config: EngineConfig;
  onFpsUpdate: (fps: number) => void;
}

const CanvasEngine: React.FC<CanvasEngineProps> = ({ config, onFpsUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const lastTimeRef = useRef<number>(performance.now());
  const fpsIntervalRef = useRef<number>(0);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      
      // Re-scan text on resize to center it
      initParticles();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pixel Scanning Logic
  const initParticles = useCallback(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }

    const offCtx = offscreenCanvasRef.current.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    offscreenCanvasRef.current.width = w;
    offscreenCanvasRef.current.height = h;

    // Draw text to offscreen canvas
    offCtx.fillStyle = 'white';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    
    // Dynamic Font Sizing based on string length
    const fontSize = Math.min(250, (w * 1.8) / (config.text.length + 1));
    offCtx.font = `bold ${fontSize}px Arial Black, sans-serif`;
    offCtx.fillText(config.text, w / 2, h / 2);

    // Scan Pixels
    const imageData = offCtx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const newParticles: Particle[] = [];
    
    let id = 0;
    for (let y = 0; y < h; y += config.density) {
      for (let x = 0; x < w; x += config.density) {
        const index = (y * w + x) * 4;
        const alpha = data[index + 3];

        if (alpha > 128) {
          const color = config.palette[Math.floor(Math.random() * config.palette.length)];
          newParticles.push(
            new Particle(
              x, 
              y, 
              Math.random() * 1.5 + 1.2, 
              color, 
              id++,
              config.friction,
              config.ease
            )
          );
        }
      }
    }

    particlesRef.current = newParticles;
  }, [config.text, config.density, config.palette, config.friction, config.ease]);

  // Re-init on significant config changes
  useEffect(() => {
    initParticles();
  }, [initParticles]);

  // Main Animation Loop
  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // FPS Counter
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    fpsIntervalRef.current++;
    if (delta > 0 && fpsIntervalRef.current > 30) {
      onFpsUpdate(1000 / delta);
      fpsIntervalRef.current = 0;
    }

    // Clear Screen (with trail support)
    if (config.trailAlpha < 1) {
      ctx.fillStyle = `rgba(0, 0, 0, ${config.trailAlpha})`;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    const particles = particlesRef.current;
    const count = particles.length;

    // Batch Rendering Step 1: Particles
    if (config.useGlow) {
        // Only apply glow if enabled - expensive!
        ctx.shadowBlur = 10;
    } else {
        ctx.shadowBlur = 0;
    }

    // Optimization: Draw by color groups to minimize strokeStyle/fillStyle switches
    const colorGroups: Record<string, Particle[]> = {};
    for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.update(
          mouseRef.current.x, 
          mouseRef.current.y, 
          config.repulsionRadius, 
          config.repulsionStrength,
          time
        );
        
        if (!colorGroups[p.color]) colorGroups[p.color] = [];
        colorGroups[p.color].push(p);
    }

    Object.entries(colorGroups).forEach(([color, group]) => {
        ctx.fillStyle = color;
        if (config.useGlow) ctx.shadowColor = color;
        
        ctx.beginPath();
        for (const p of group) {
            ctx.moveTo(p.x, p.y);
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    });

    // Optional: Draw Connection Lines (Network Effect)
    // Warning: Complexity is O(N^2) without spatial partitioning.
    // We only enable for reasonable particle counts or skip if distance is too far.
    if (config.showLines && count < 2500) {
        ctx.lineWidth = 0.4;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        const maxDist = 45;
        for (let i = 0; i < count; i += 4) { // Sample to maintain performance
            const p1 = particles[i];
            for (let j = i + 1; j < count; j += 4) {
                const p2 = particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < maxDist * maxDist) {
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                }
            }
        }
        ctx.stroke();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [config, onFpsUpdate]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Mouse Handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-crosshair" />;
};

export default CanvasEngine;
