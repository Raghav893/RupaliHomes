"use client";

import Image from "next/image";
import { useState } from "react";
import { House } from "lucide-react";
import styles from "./PropertyDetail.module.css";

export default function PropertyImage({ src, alt, className = "", contain = false, priority = false }: { src?: string; alt: string; className?: string; contain?: boolean; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState<string>();
  return <div className={`${styles.imageFrame} ${className}`}>
    {src && failedSource !== src ? <Image src={src} alt={alt} fill unoptimized priority={priority} className={contain ? styles.containImage : styles.coverImage} onError={() => setFailedSource(src)} /> : <div className={styles.imageFallback}><House size={38} strokeWidth={1} aria-hidden="true" /><span>Rupali Homes</span></div>}
  </div>;
}
