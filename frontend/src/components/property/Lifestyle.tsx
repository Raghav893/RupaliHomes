"use client";

import { useState } from "react";
import { ArrowDown, CalendarDays, Layers, Sofa } from "lucide-react";
import type { Property } from "@/types";
import { getAmenityIcon } from "@/lib/amenities";
import { getFurnishingIcon } from "@/lib/furnishings";
import styles from "./PropertyDetail.module.css";

export default function Lifestyle({ property }: { property: Property }) {
  const [all, setAll] = useState(false);
  const amenities = (property.amenities || "").split(",").map((item) => item.trim()).filter(Boolean);
  const furnishings = (property.furnishingDetails || "").split(",").map((item) => item.trim()).filter(Boolean);
  const extras = [{ text: property.furnishingStatus, Icon: Sofa }, { text: property.flooring ? `${property.flooring} flooring` : undefined, Icon: Layers }, { text: property.availableFrom ? `Available: ${property.availableFrom}` : undefined, Icon: CalendarDays }].filter((item) => item.text);
  if (!amenities.length && !furnishings.length && !extras.length) return null;
  return <section id="lifestyle" className={`${styles.section} ${styles.lifestyleSection}`}><div className={styles.container}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THE EVERYDAY, ELEVATED</p><h2 className={styles.sectionTitle}>What this property offers.</h2><p className={styles.sectionIntro}>The spaces and conveniences that make a home feel complete.</p></div><span className={styles.lifestyleSymbol} aria-hidden="true">✳</span></div><div className={styles.amenityGrid}>{extras.map(({ text, Icon }) => <div key={text}><Icon size={25} strokeWidth={1.3} aria-hidden="true" /><span>{text}</span></div>)}{amenities.slice(0, all ? undefined : 6).map((amenity) => { const Icon = getAmenityIcon(amenity); return <div key={amenity}><Icon size={25} strokeWidth={1.3} aria-hidden="true" /><span>{amenity}</span></div>; })}</div>{amenities.length > 6 && <button type="button" className={styles.outlineButton} aria-expanded={all} onClick={() => setAll(!all)}>{all ? "Show fewer amenities" : `Show all ${amenities.length} amenities`}<ArrowDown size={15} aria-hidden="true" /></button>}{furnishings.length > 0 && <div className={styles.furnishingList}><h3>Inside your home</h3><div>{furnishings.map((furnishing) => { const Icon = getFurnishingIcon(furnishing); return <span key={furnishing}><Icon size={15} aria-hidden="true" />{furnishing}</span>; })}</div></div>}</div></section>;
}
