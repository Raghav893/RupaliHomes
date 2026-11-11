"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import type { Property } from "@/types";
import PropertyImage from "./PropertyImage";
import BrochureDownload from "./BrochureDownload";
import { scrollToPropertySection } from "./presentation";
import styles from "./PropertyDetail.module.css";

export default function Hero({ property, type }: { property: Property; type: "buy" | "rent" }) {
  const status = property.status === "SOLD" ? "Sold" : property.status === "RENTED" ? "Rented" : property.projectStatus || "Available";
  return <header className={styles.hero}>
    <PropertyImage src={property.coverImage || property.imageUrl || property.galleryImages?.[0]?.url} alt={property.title} className={styles.heroPhoto} priority />
    <div className={styles.heroShade} />
    <div className={styles.heroInner}>
      <div className={styles.heroTop}><nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href={`/${type}`}>Property collection</Link><span>/</span><span>{property.locality || property.city || property.location}</span></nav><span className={styles.collectionMark}>RUPALI HOMES COLLECTION</span></div>
      <div className={styles.heroCopy}>
        <div className={styles.heroBadges}>
          {(property.developerLogo || property.developerName) && <div className={styles.developerBadge}>{property.developerLogo && <PropertyImage src={property.developerLogo} alt={`${property.developerName || "Developer"} logo`} contain className={styles.developerLogo} />}{property.developerName && <span>{property.developerName}</span>}</div>}
          <span className={styles.statusPill}><span />{status}</span><span className={styles.dealLabel}>{type === "rent" ? "FOR RENT" : "FOR SALE"}</span>
        </div>
        {(property.eyebrow || property.propertyCategory || property.locality) && <p className={styles.eyebrow}>{property.eyebrow || [property.propertyCategory, property.locality].filter(Boolean).join(" · ")}</p>}
        <h1 className={styles.heroTitle}>{property.title}</h1>
        {property.tagline && <p className={styles.tagline}>{property.tagline}</p>}
        {property.location && <p className={styles.heroLocation}><MapPin size={16} aria-hidden="true" />{property.location}</p>}
        <div className={styles.heroButtons}>
          {property.brochureUrl && <BrochureDownload property={property} className={styles.primaryButton} />}
          <button type="button" className={styles.outlineButton} onClick={() => scrollToPropertySection("enquire")}>Arrange a viewing<ArrowUpRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <div className={styles.heroBottom}><p>Presented by Rupali Homes. Images are illustrative and may include renderings.</p><button type="button" onClick={() => scrollToPropertySection("overview")} aria-label="Explore property overview" className={styles.exploreButton}><span>EXPLORE THE PROPERTY</span><ArrowDown size={17} aria-hidden="true" /></button></div>
    </div>
  </header>;
}
