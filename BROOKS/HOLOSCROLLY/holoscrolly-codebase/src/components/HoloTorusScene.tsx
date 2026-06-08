import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HoloTorusSceneProps {
  eyebrow: string;
  title: string;
  body: string;
  /** 0..100 coherence from the active HURL — tunes the material hue. */
  coherence: number;
}

interface SceneRefs {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  torus: THREE.Mesh<THREE.TorusKnotGeometry, THREE.MeshStandardMaterial>;
}

/**
 * SYNC_SCROLL_TO_3D_SCENE — the canonical Three.js adapter.
 *
 * Scroll progress over this pinned chamber drives camera travel, torus rotation,
 * and a coherence-tuned emissive material. The scene renders *only* on progress
 * change (it is scroll-linked, not a free-running loop), so it is cheap and calm.
 *
 * Reduced-motion sovereignty: when the visitor prefers reduced motion we render a
 * single still frame and surface a text-spine caption — the essence without the
 * vestibular cost.
 */
export function HoloTorusScene({ eyebrow, title, body, coherence }: HoloTorusSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const refs = useRef<SceneRefs | null>(null);
  const progress = useScrollProgress();
  const reducedMotion = useReducedMotion();

  // One-time scene construction.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const geometry = new THREE.TorusKnotGeometry(1.1, 0.34, 220, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x0b0c12,
      metalness: 0.9,
      roughness: 0.25,
      emissive: new THREE.Color(0xd8b45c),
      emissiveIntensity: 0.4
    });
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    const key = new THREE.PointLight(0xfff0c8, 60, 100);
    key.position.set(4, 5, 6);
    const rim = new THREE.PointLight(0xaa5eff, 30, 100);
    rim.position.set(-6, -3, 2);
    scene.add(key, rim, new THREE.AmbientLight(0x223044, 1.2));

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    refs.current = { renderer, scene, camera, torus };

    return () => {
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      refs.current = null;
    };
  }, []);

  // Scroll-linked render. Also re-renders when coherence or motion pref change.
  useEffect(() => {
    const r = refs.current;
    if (!r) return;

    // Coherence (0..100) → hue from warm-gold (low) toward cyan-violet (high).
    const hue = 0.12 + (Math.min(100, Math.max(0, coherence)) / 100) * 0.55;
    r.torus.material.emissive.setHSL(hue, 0.7, 0.55);

    if (reducedMotion) {
      // Still frame: fixed, composed pose. No travel, no spin.
      r.torus.rotation.set(0.4, 0.8, 0);
      r.camera.position.set(0, 0, 6);
      r.torus.material.emissiveIntensity = 0.5;
    } else {
      const p = progress;
      r.torus.rotation.set(p * Math.PI * 2, p * Math.PI * 3, p * 0.5);
      r.camera.position.z = 6 - p * 2.2; // travel inward
      r.camera.position.y = Math.sin(p * Math.PI) * 0.8;
      r.camera.lookAt(0, 0, 0);
      r.torus.material.emissiveIntensity = 0.35 + p * 0.55;
    }

    r.renderer.render(r.scene, r.camera);
  }, [progress, coherence, reducedMotion]);

  return (
    <section className="torus-chamber" aria-label="HOLOTORUS scene">
      <div className="torus-chamber__sticky">
        <canvas ref={canvasRef} className="torus-chamber__canvas" aria-hidden="true" />
        <div className="torus-chamber__copy">
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{body}</p>
          {reducedMotion ? (
            <p className="torus-chamber__spine">
              Reduced motion: showing a still HOLOTORUS frame. Coherence {Math.round(coherence)} →
              the lattice holds its pose; scroll advances the narrative as text, not travel.
            </p>
          ) : (
            <p className="torus-chamber__hint">Scroll to travel the torus.</p>
          )}
        </div>
      </div>
      <div className="torus-chamber__scroll-track" aria-hidden="true" />
    </section>
  );
}

export default HoloTorusScene;
