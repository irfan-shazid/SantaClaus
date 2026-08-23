"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

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

export default function Banner3D() {
  const reduceMotion = useCanRender3D();
  const canRender3D = !reduceMotion;

  return (
    <div className="absolute inset-0">
      {/* Static gradient shown immediately + kept as backdrop under the canvas */}
      <div className="absolute inset-0 bg-linear-to-br from-fuchsia-300 via-sky-300 to-amber-200" />
      {canRender3D && (
        <div className="absolute inset-0">
          <Banner3DScene />
        </div>
      )}
    </div>
  );
}
