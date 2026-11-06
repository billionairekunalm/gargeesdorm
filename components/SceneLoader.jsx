"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const Scene = dynamic(() => import("./Scene"), { ssr: false });
export default function SceneLoader() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    // let the intro and the page text paint first; start downloading the 3D code right after
    const start = () => setGo(true);
    const ric = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const id = ric(start, { timeout: 1200 });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);
  return go ? <Scene /> : null;
}
