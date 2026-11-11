"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import type { FloorPlan } from "@/types";
import { accentVariables, type PropertyTheme } from "./presentation";
import PropertyImage from "./PropertyImage";
import styles from "./PropertyDetail.module.css";

export default function FloorPlans({ plans, accentColor, theme }: { plans: FloorPlan[]; accentColor?: string; theme?: PropertyTheme }) {
  const [selected, setSelected] = useState<FloorPlan | null>(null);
  const ordered = [...plans].filter((plan) => plan.imageUrl).sort((a,b) => (a.order ?? 0) - (b.order ?? 0));
  if (!ordered.length) return null;
  const details = selected ? [{ label: "Total area", value: selected.totalArea, unit: "sq ft" }, { label: "Carpet area", value: selected.carpetArea, unit: "sq ft" }, { label: "Bedrooms", value: selected.bedrooms }, { label: "Bathrooms", value: selected.bathrooms }].filter((detail) => detail.value !== undefined && detail.value !== null) : [];
  return <section id="floor-plans" className={`${styles.section} ${styles.floorSection}`}><div className={styles.container}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>ROOM TO MAKE IT YOURS</p><h2 className={styles.sectionTitle}>Considered in every detail.</h2><p className={styles.sectionIntro}>Explore the layouts, proportions and possibilities of your next home.</p></div><span className={styles.sectionAside}>THE FLOOR PLANS</span></div>
    <div className={styles.floorGrid}>{ordered.map((plan,index) => <button type="button" className={styles.floorCard} key={`${plan.imageUrl}-${index}`} onClick={() => setSelected(plan)} aria-label={`View floor plan: ${plan.title || `Plan ${index+1}`}`}><PropertyImage src={plan.imageUrl} alt={plan.title || `Floor plan ${index+1}`} contain className={styles.planPreview} /><div className={styles.floorCardLabel}><div><h3>{plan.title || `Floor plan ${index+1}`}</h3>{plan.totalArea != null && <p>{plan.totalArea.toLocaleString("en-IN")} sq ft total area</p>}</div><span><ArrowUpRight size={21} aria-hidden="true" /></span></div></button>)}</div>
    <Dialog.Root open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}><Dialog.Portal><Dialog.Overlay className={styles.modalOverlay} style={accentVariables(accentColor, theme)} /><Dialog.Content className={`${styles.modal} ${styles.planModal}`} style={accentVariables(accentColor, theme)}><div className={styles.modalHeader}><div><Dialog.Title>{selected?.title || "Floor plan"}</Dialog.Title><Dialog.Description>Explore the published layout and listed dimensions.</Dialog.Description></div><Dialog.Close aria-label="Close floor plan" className={styles.modalClose}><X size={22} /></Dialog.Close></div>{selected && <PropertyImage src={selected.imageUrl} alt={selected.title || "Floor plan"} contain className={styles.planLarge} />}{details.length > 0 && <dl className={styles.planDetails}>{details.map((detail) => <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value?.toLocaleString("en-IN")}{detail.unit && ` ${detail.unit}`}</dd></div>)}</dl>}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </div></section>;
}
