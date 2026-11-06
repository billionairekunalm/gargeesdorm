"use client";
import dynamic from "next/dynamic";
export default dynamic(() => import("./Tower"), { ssr: false, loading: () => <div className="tower-canvas" /> });
