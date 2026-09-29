"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";

const Banner3DScene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => null,
});

function subscribeToMotionPreference(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useCanRender3D() {
  return useSyncExternalStore(subscribeToMotionPreference, getReducedMotionSnapshot, () => false);
}

/**
 * The 3D scene is ~1MB of WebGL - over half the site's client JS. The gradient
 * backdrop below already carries the banner on its own, so the scene is held
 * back until the browser goes idle: the page paints and becomes interactive
 * first, then the toys fade in. Skipped entirely for reduced-motion users and
 * on data-saver connections.
 */
function useDeferredScene(reduceMotion: boolean) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;

    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    const start = () => setShow(true);

    // Whichever fires first: idle time if the browser offers it, otherwise a
    // hard backstop. rIC's own timeout isn't honoured consistently (background
    // or occluded tabs throttle it heavily), and this is the hero - it must not
    // sit as a flat gradient for seconds.
    const timeoutId = window.setTimeout(start, 1200);
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(start, { timeout: 1200 });
    }

    return () => {
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  return show;
}

export default function Banner3D() {
  const reduceMotion = useCanRender3D();
  const showScene = useDeferredScene(reduceMotion);
  const [sceneVisible, setSceneVisible] = useState(false);

  // Flip on the next frame so the canvas fades in rather than popping.
  useEffect(() => {
    if (!showScene) return;
    const id = requestAnimationFrame(() => setSceneVisible(true));
    return () => cancelAnimationFrame(id);
  }, [showScene]);

  return (
    <div className="absolute inset-0">
      {/* Backdrop under the (transparent) canvas, shown immediately on load:
          light red at the top washing down into a soft off-white, matching the
          site's santa palette. Two ramps because the headline is bottom-anchored
          on mobile and centred on desktop - wherever it sits, the ramp is still
          red enough for the white headline to stay >= 3:1 (it's large bold text). */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #e53e3e 0%, #ef4444 30%, #ef4444 62%, #f05555 84%, #f7a8a8 94%, #fff2f2 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage:
            "linear-gradient(180deg, #e53e3e 0%, #ef4444 20%, #ef4444 40%, #f16060 56%, #f7a8a8 70%, #fde6e6 84%, #ffffff 100%)",
        }}
      />
      {/* Faint canvas-like grain, as in the reference. */}
      <div
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {showScene && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${sceneVisible ? "opacity-100" : "opacity-0"}`}
        >
          <Banner3DScene />
        </div>
      )}
    </div>
  );
}
