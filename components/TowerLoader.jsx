"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const Tower = dynamic(() => import("./Tower"), { ssr: false, loading: () => <div className="tower-canvas" /> });
export default function TowerLoader() {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: "600px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{near ? <Tower /> : <div className="tower-canvas" />}</div>;
}
