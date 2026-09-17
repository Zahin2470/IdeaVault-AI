"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const PARTICLE_COUNT = 46;
const CONNECT_DISTANCE = 130;

interface IdeaNetworkBackgroundProps {
  /** CSS custom property names to read colors from — defaults match the
   * app shell's tokens; auth pages pass their own (--auth-cyan, etc.)
   * since that route group defines a separate token set. */
  accentVar?: string;
  accent2Var?: string;
}

// The signature ambient background: a slowly drifting network of nodes
// that connect when they pass near each other — canvas-based (not CSS
// keyframes) so the connections are computed live between real moving
// points, not a fixed pre-baked pattern. Deliberately themed as a
// network of ideas forming connections rather than a generic particle
// effect — it's meant to look like this product's own concept (loose
// ideas → structured connections), not decoration borrowed from
// somewhere else.
//
// Reads the given color variables fresh every frame (cheap) so it
// re-colors itself instantly on a light/dark toggle. Pauses when the tab
// isn't visible, and renders a single static frame under
// prefers-reduced-motion instead of animating at all.
export function IdeaNetworkBackground({
  accentVar = "--accent",
  accent2Var = "--accent-2",
}: IdeaNetworkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
    }));

    function readColor(varName: string, fallback: string) {
      const raw = getComputedStyle(canvas!).getPropertyValue(varName).trim();
      return raw ? `hsl(${raw})` : fallback;
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      const accent = readColor(accentVar, "hsl(191 70% 32%)");
      const accent2 = readColor(accent2Var, "hsl(35 78% 42%)");

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECT_DISTANCE) {
            ctx!.strokeStyle = accent;
            ctx!.globalAlpha = (1 - dist / CONNECT_DISTANCE) * 0.16;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      particles.forEach((p, i) => {
        ctx!.globalAlpha = 0.55;
        ctx!.fillStyle = i % 4 === 0 ? accent2 : accent;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      });

      ctx!.globalAlpha = 1;
    }

    let animationFrame: number;
    let running = false;

    function loop() {
      if (!running) return;
      drawFrame();
      animationFrame = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      loop();
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animationFrame);
    }

    function handleVisibility() {
      if (document.visibilityState === "visible" && !prefersReducedMotion) start();
      else stop();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      start();
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [accentVar, accent2Var]);

  return <canvas ref={canvasRef} aria-hidden="true" className="idea-network-canvas" />;
}
