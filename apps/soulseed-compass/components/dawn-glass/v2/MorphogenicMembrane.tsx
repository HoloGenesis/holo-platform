"use client";

import { useEffect, useRef } from "react";
import { VERTEX_SHADER } from "./shader.vert";
import { FRAGMENT_SHADER } from "./shader.frag";
import {
  DEFAULT_HOLOGLISTEN_STATE,
  HOLOGLISTEN_CONFIG,
  type HologListenState,
} from "./hologListen";

// TIER 3 — the Membrane (S91). Full-viewport fixed WebGL canvas rendering the
// golden-hour pearlescent shader. State changes update a speed ref + uniform
// WITHOUT re-creating the GL context (re-mounting would visibly flash).
// prefers-reduced-motion → single static frame, no rAF. WebGL failure → static
// CSS gradient fallback, never a throw. Mounted ONLY at /dawn2 until S96.

const FALLBACK_GRADIENT = "linear-gradient(135deg, #ffe8dc 0%, #f7f7f0 50%, #e7eef8 100%)";

interface Props {
  state?: HologListenState;
  opacity?: number; // default 0.7 per reference HTML
  className?: string;
}

export function MorphogenicMembrane({
  state = DEFAULT_HOLOGLISTEN_STATE,
  opacity = 0.7,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(HOLOGLISTEN_CONFIG[state].shaderSpeed);

  // Update speed without recreating the WebGL context.
  useEffect(() => {
    speedRef.current = HOLOGLISTEN_CONFIG[state].shaderSpeed;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect prefers-reduced-motion: single static frame, no loop.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // WebGL context with graceful fallback.
    const gl =
      canvas.getContext("webgl") ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      canvas.style.background = FALLBACK_GRADIENT;
      return;
    }
    const webgl = gl;

    const compile = (type: number, src: string): WebGLShader | null => {
      const s = webgl.createShader(type);
      if (!s) return null;
      webgl.shaderSource(s, src);
      webgl.compileShader(s);
      if (!webgl.getShaderParameter(s, webgl.COMPILE_STATUS)) {
        console.error("[membrane] shader compile:", webgl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(webgl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(webgl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      canvas.style.background = FALLBACK_GRADIENT;
      return;
    }
    const prog = webgl.createProgram();
    if (!prog) {
      canvas.style.background = FALLBACK_GRADIENT;
      return;
    }
    webgl.attachShader(prog, vs);
    webgl.attachShader(prog, fs);
    webgl.linkProgram(prog);
    webgl.useProgram(prog);

    // Fullscreen triangle pair.
    const buf = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buf);
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      webgl.STATIC_DRAW
    );
    const loc = webgl.getAttribLocation(prog, "p");
    webgl.enableVertexAttribArray(loc);
    webgl.vertexAttribPointer(loc, 2, webgl.FLOAT, false, 0, 0);

    const uTime = webgl.getUniformLocation(prog, "u_time");
    const uRes = webgl.getUniformLocation(prog, "u_resolution");
    const uSpeed = webgl.getUniformLocation(prog, "u_speed");

    let rafId = 0;
    let running = true;

    const frame = (t: number) => {
      webgl.uniform1f(uTime, t / 1000);
      webgl.uniform2f(uRes, canvas.width, canvas.height);
      webgl.uniform1f(uSpeed, speedRef.current);
      webgl.drawArrays(webgl.TRIANGLES, 0, 6);
      if (running && !prefersReduced) rafId = requestAnimationFrame(frame);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2 for perf
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      webgl.viewport(0, 0, canvas.width, canvas.height);
      // resizing clears the buffer — under reduced motion, redraw the one frame
      if (prefersReduced) frame(0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause on tab hidden (battery).
    const onVis = () => {
      running = !document.hidden;
      if (running && !prefersReduced) rafId = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);

    // Single static frame for prefers-reduced-motion; otherwise loop.
    if (prefersReduced) {
      frame(0);
    } else {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      // Release WebGL resources.
      webgl.deleteProgram(prog);
      webgl.deleteShader(vs);
      webgl.deleteShader(fs);
      webgl.deleteBuffer(buf);
    };
    // mount once; state changes update speedRef without re-init
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity,
      }}
    />
  );
}
