"use client";

import { useEffect, useRef } from "react";
import { useChamberStore } from "../lib/chamberStore";

/**
 * The HOLOTORUS — a Sacred-Heart coherence field rendered to canvas. It breathes
 * with the session's coherence (brightness / ring count) and emergence pressure
 * (cardiac pulse rate). Pure presentation: reads Core state per frame, never
 * writes. Sits behind everything, ignores pointer events.
 */
export function HolotorusVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Smoothed values so changes ease in rather than snap.
    let coherence = 0;
    let pressure = 0;

    // Cardiac double-thump in [0,1) phase space.
    const cardiac = (phase: number): number => {
      const thump = (centre: number, w: number) => Math.exp(-(((phase - centre) * w) ** 2));
      return Math.min(1, thump(0.12, 9) + 0.55 * thump(0.32, 9));
    };

    const draw = (now: number) => {
      const state = useChamberStore.getState().sessionState;
      const targetCoherence = state ? Math.max(0, Math.min(1, state.coherence)) : 0;
      const targetPressure = state ? Math.max(0, Math.min(1, state.emergencePressure)) : 0;
      coherence += (targetCoherence - coherence) * 0.04;
      pressure += (targetPressure - pressure) * 0.04;

      const cx = width / 2;
      const cy = height * 0.46;
      const period = 2.4 - pressure * 1.1; // faster heartbeat as pressure rises
      const phase = ((now / 1000) % period) / period;
      const beat = cardiac(phase);
      const intensity = 0.35 + coherence * 0.65;
      const baseRadius = Math.min(width, height) * (0.16 + 0.04 * beat);

      ctx.clearRect(0, 0, width, height);

      // Central heart glow.
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseRadius * 3.2);
      glow.addColorStop(0, `rgba(232,193,106,${0.18 * intensity + 0.05 * beat})`);
      glow.addColorStop(0.5, `rgba(99,102,241,${0.06 * intensity})`);
      glow.addColorStop(1, "rgba(8,8,12,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Concentric torus rings — count grows with coherence.
      const rings = 3 + Math.round(coherence * 7);
      for (let i = 0; i < rings; i++) {
        const t = i / rings;
        const r = baseRadius * (0.6 + i * 0.42) + beat * 10 * (1 - t);
        const alpha = (1 - t) * 0.5 * intensity;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(232,193,106,${alpha})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
