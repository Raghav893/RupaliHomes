"use client";

import { useState } from "react";
import { Bath, Bed, Building2, Heart, Layers, MapPin, Maximize, Share2 } from "lucide-react";
import type { Property } from "@/types";
import { formatIndianPrice } from "@/lib/utils";
import styles from "./PropertyDetail.module.css";

export default function Overview({ property, type, liked, onLike, onShare, shareMessage }: { property: Property; type: "buy" | "rent"; liked: boolean; onLike: () => void; onShare: () => void; shareMessage: string }) {
  const [expanded, setExpanded] = useState(false);
  const stats = [
    { label: "Bedrooms", value: property.bedrooms, Icon: Bed },
    { label: "Bathrooms", value: property.bathrooms, Icon: Bath },
    { label: "Listed area", value: property.sqft ? `${property.sqft.toLocaleString("en-IN")} sq ft` : property.size, Icon: Maximize },
    { label: "Floor", value: property.floorNumber === 0 ? "Ground" : property.floorNumber, Icon: Layers },
    { label: "Total floors", value: property.totalFloors, Icon: Building2 },
  ].filter((stat) => stat.value !== undefined && stat.value !== null && stat.value !== "");
  return <section id="overview" className={`${styles.section} ${styles.overview}`}>
    <div className={styles.container}>
      <div className={styles.overviewTop}><div><p className={styles.eyebrow}>AT A GLANCE</p><h2 className={styles.sectionTitle}>A place to call your own.</h2></div><div className={styles.propertyActions}><button type="button" aria-label={liked ? "Remove property from favourites" : "Save property to favourites"} aria-pressed={liked} onClick={onLike}><Heart size={18} fill={liked ? "currentColor" : "none"} />{liked ? "Saved" : "Save"}</button><button type="button" onClick={onShare}><Share2 size={17} aria-hidden="true" />Share</button></div></div>
      {shareMessage && <p role="status" className={styles.shareStatus}>{shareMessage}</p>}
      <div className={styles.overviewGrid}><div className={styles.priceBlock}><p>{type === "rent" ? "MONTHLY RENT" : "TOTAL ASKING PRICE"}</p><strong>{formatIndianPrice(type === "rent" ? property.rentAmount : property.price)}{type === "rent" && <small> / month</small>}</strong>{property.location && <span><MapPin size={14} aria-hidden="true" />{property.location}</span>}<div className={styles.availability}><span />{property.status === "SOLD" ? "Sold" : property.status === "RENTED" ? "Rented" : "Available"}</div></div>
        {stats.length > 0 && <dl className={styles.stats}>{stats.map(({ label, value, Icon }) => <div key={label}><Icon size={22} strokeWidth={1.4} aria-hidden="true" /><dd>{value}</dd><dt>{label}</dt></div>)}</dl>}
      </div>
      {property.description && <div className={styles.about}><div><span className={styles.sectionIndex}>01 / THE RESIDENCE</span><h3>About this home</h3></div><div><p className={!expanded && property.description.length > 440 ? styles.descriptionClamped : undefined}>{property.description}</p>{property.description.length > 440 && <button type="button" className={styles.textButton} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "See less" : "See more"}<span aria-hidden="true">{expanded ? "−" : "+"}</span></button>}</div></div>}
    </div>
  </section>;
}
