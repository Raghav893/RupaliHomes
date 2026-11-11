import { FileText } from "lucide-react";
import type { Property } from "@/types";
import PropertyImage from "./PropertyImage";
import BrochureDownload from "./BrochureDownload";
import { formatFileSize } from "./presentation";
import styles from "./PropertyDetail.module.css";

export default function Brochure({ property }: { property: Property }) {
  if (!property.brochureUrl) return null;
  return <section id="brochure" className={`${styles.section} ${styles.brochureSection}`}>
    <div className={`${styles.container} ${styles.brochureGrid}`}>
      <div className={styles.brochurePreview}>
        {property.brochurePreviewImage ? <PropertyImage src={property.brochurePreviewImage} alt={`${property.title} brochure cover`} contain /> : <div className={styles.brochurePlaceholder}><span className={styles.eyebrow}>{property.developerName || "RUPALI HOMES COLLECTION"}</span><FileText size={56} strokeWidth={.8} aria-hidden="true" /><h3>{property.title}</h3><p>THE PROPERTY BROCHURE</p></div>}
        <span className={styles.brochureCorner}>PDF</span>
      </div>
      <div className={styles.brochureCopy}>
        <p className={styles.eyebrow}>THE ORIGINAL MATERIAL</p>
        <h2 className={styles.sectionTitle}>Take a closer look.</h2>
        <p>Discover the details in the property brochure. Explore the plans, specifications and features at your own pace.</p>
        <BrochureDownload property={property} className={styles.primaryButton} />
        <div className={styles.brochureSource}><span>{formatFileSize(property.brochureFileSize)}</span></div>
        {property.themeName?.trim() && <p className={styles.paletteNote}>Design palette informed by the project: {property.themeName.trim()}.</p>}
      </div>
    </div>
  </section>;
}
