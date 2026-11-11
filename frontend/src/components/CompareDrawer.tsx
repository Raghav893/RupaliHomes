"use client";

import { useRef, useState, type CSSProperties } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Download, House, Loader2, MapPin, Plus, Scale, X } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { PropertyType, type Property } from "@/types";
import { buildComparisonSections, MAX_COMPARE_PROPERTIES, propertyPath, propertyPriceLabel, type ComparisonValue } from "@/lib/property-comparison";
import styles from "./CompareDrawer.module.css";

const sectionLabels: Record<string, string> = {
  overview: "Overview", pricing: "Pricing", layout: "Space", location: "Location",
  interiors: "Interiors", amenities: "Amenities", details: "Listing details",
};

function PropertyPhoto({ property, small = false }: { property: Property; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={small ? styles.thumbnail : styles.photo}>
      {property.imageUrl && !failed ? (
        <Image src={property.imageUrl} alt={property.title} fill sizes={small ? "40px" : "(max-width: 640px) 160px, 400px"} className={styles.image} onError={() => setFailed(true)} />
      ) : <div className={styles.photoPlaceholder}><House size={small ? 18 : 36} strokeWidth={1.2} aria-hidden="true" />{!small && <span>Photo coming soon</span>}</div>}
    </div>
  );
}

function ValueCell({ value, amenity }: { value: ComparisonValue; amenity?: boolean }) {
  return (
    <div className={styles.value}>
      {value.items ? (
        <ul className={styles.valueList}>{value.items.map((item) => <li key={item}>{item}</li>)}</ul>
      ) : value.href ? (
        <a href={value.href} target="_blank" rel="noopener noreferrer" className={styles.valueLink}>{value.text}<ArrowUpRight size={13} aria-hidden="true" /></a>
      ) : (
        <span className={value.missing ? styles.missing : amenity ? styles.included : undefined}>
          {amenity && !value.missing && <Check size={14} aria-hidden="true" />}{value.text}
        </span>
      )}
      {value.highlight && <span className={styles.valueBadge}>{value.highlight}</span>}
    </div>
  );
}

export default function CompareDrawer() {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen, compareNotice, dismissCompareNotice } = useCompare();
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [fullDescriptions, setFullDescriptions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableRowElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLTableSectionElement>());
  const sections = buildComparisonSections(compareItems, differencesOnly);
  const selectedSection = sections.some((section) => section.id === activeSection) ? activeSection : sections[0]?.id;
  const browsePath = compareItems.length && compareItems.every((property) => property.type === PropertyType.RENT) ? "/rent" : "/buy";
  const mixedTypes = new Set(compareItems.map((property) => property.type)).size > 1;

  function jumpToSection(id: string) {
    const container = scrollRef.current;
    const section = sectionRefs.current.get(id);
    if (!container || !section) return;
    const top = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - (headerRef.current?.getBoundingClientRect().height ?? 0);
    container.scrollTo({ top, behavior: "instant" });
    setActiveSection(id);
  }

  function trackSection() {
    const container = scrollRef.current;
    if (!container) return;
    const boundary = container.getBoundingClientRect().top + (headerRef.current?.getBoundingClientRect().height ?? 0) + 60;
    let current = sections[0]?.id;
    for (const section of sections) {
      const element = sectionRefs.current.get(section.id);
      if (element && element.getBoundingClientRect().top <= boundary) current = section.id;
    }
    if (current) setActiveSection(current);
  }

  async function downloadPdf() {
    if (exporting || compareItems.length < 2) return;
    setExporting(true);
    setExportError("");
    setExportMessage("");
    try {
      const { downloadComparisonPdf } = await import("@/lib/comparison-pdf");
      await downloadComparisonPdf([...compareItems], { differencesOnly });
      setExportMessage("Your comparison PDF is ready.");
    } catch (error) {
      console.error("Comparison PDF export failed", error);
      setExportError("The PDF could not be downloaded. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const pdfButton = (
    <button type="button" onClick={() => void downloadPdf()} disabled={exporting || compareItems.length < 2} className={styles.download}>
      {exporting ? <Loader2 size={17} className={styles.spinner} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
      {exporting ? "Preparing PDF…" : "Download PDF"}
    </button>
  );

  if (!compareItems.length) return null;

  return (
    <Dialog.Root open={isCompareOpen} onOpenChange={setIsCompareOpen}>
      {!isCompareOpen && (
        <div className={styles.trayPosition}>
          <aside aria-label="Property comparison shortlist" className={styles.tray}>
            {compareNotice && <div role="status" className={styles.notice}>{compareNotice}<button type="button" aria-label="Dismiss comparison message" onClick={dismissCompareNotice} className={styles.iconButton}><X size={16} aria-hidden="true" /></button></div>}
            <div className={styles.trayTop}>
              <div className={styles.trayHeading}><span className={styles.trayIcon}><Scale size={20} aria-hidden="true" /></span><div><p>Your shortlist <span className={styles.count}>{compareItems.length}/{MAX_COMPARE_PROPERTIES}</span></p><span className={styles.trayHint}>{compareItems.length < 2 ? "Choose one more to compare" : "Find the one that fits"}</span></div></div>
              <button type="button" onClick={clearCompare} className={styles.textButton}>Clear all</button>
              <Dialog.Trigger asChild><button type="button" disabled={compareItems.length < 2} className={styles.compareButton} aria-label="Compare properties">Compare <ArrowRight size={16} aria-hidden="true" /></button></Dialog.Trigger>
            </div>
            <div className={styles.trayProperties}>
              {compareItems.map((property) => <div key={property.id} className={styles.trayProperty}><PropertyPhoto property={property} small /><span>{property.title}</span><button type="button" onClick={() => removeFromCompare(property.id!)} aria-label={`Remove ${property.title} from comparison`} className={styles.removeSmall}><X size={14} aria-hidden="true" /></button></div>)}
              {compareItems.length < MAX_COMPARE_PROPERTIES && <span className={styles.trayEmpty}><Plus size={15} aria-hidden="true" />{MAX_COMPARE_PROPERTIES - compareItems.length} more {compareItems.length === 1 ? "spots" : "spot"}</span>}
            </div>
          </aside>
        </div>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.panel} style={{ "--property-count": compareItems.length } as CSSProperties}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}><span />PROPERTY COMPARISON <span className={styles.headerCount}>{compareItems.length} selected</span></p>
              <Dialog.Title className={styles.title}>Compare your shortlist<span>.</span></Dialog.Title>
              <Dialog.Description className={styles.subtitle}>A little clarity for your next big move.</Dialog.Description>
            </div>
            <div className={styles.headerActions}><div className={styles.desktopDownload}>{pdfButton}</div><Dialog.Close aria-label="Close property comparison" className={styles.close}><X size={21} aria-hidden="true" /></Dialog.Close></div>
          </header>

          <div className={styles.toolbar}>
            <label className={styles.differenceControl}><input type="checkbox" checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} disabled={compareItems.length < 2} /><span className={styles.switch} aria-hidden="true" /><span>Show differences only</span></label>
            <div className={styles.toolbarActions}>
              {compareItems.length < MAX_COMPARE_PROPERTIES && <Link href={browsePath} onClick={() => setIsCompareOpen(false)} className={styles.addButton}><Plus size={15} aria-hidden="true" />Add property</Link>}
              <button type="button" disabled={exporting} onClick={clearCompare} aria-label="Clear comparison" className={styles.textButton}>Clear all</button>
            </div>
          </div>

          {exportError && <p role="alert" className={styles.exportError}>{exportError}</p>}
          <p role="status" className={styles.srOnly}>{exportMessage}</p>
          {mixedTypes && <p className={styles.info}>Sale prices and monthly rent are compared separately.</p>}
          {compareItems.length < 2 && <p role="status" className={styles.info}>Add another property to continue comparing and download a PDF.</p>}

          <nav aria-label="Comparison sections" className={styles.sectionNav}>
            {sections.map((section) => <button key={section.id} type="button" aria-current={selectedSection === section.id ? "location" : undefined} onClick={() => jumpToSection(section.id)}>{sectionLabels[section.id]}</button>)}
          </nav>

          <div ref={scrollRef} onScroll={trackSection} role="region" aria-label="Detailed property comparison" tabIndex={0} className={styles.scrollArea}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Detailed comparison of {compareItems.map((property) => property.title).join(", ")}{differencesOnly ? ", showing differences only" : ""}</caption>
              <colgroup><col className={styles.labelColumn} />{compareItems.map((property) => <col key={property.id} />)}</colgroup>
              <thead>
                <tr className={styles.photoRow}>
                  <td className={styles.introCell}><span className={styles.introIcon}><Scale size={24} strokeWidth={1.4} aria-hidden="true" /></span><p>Your next home,<br />in perspective.</p><span>Compare what matters<br />to you, side by side.</span></td>
                  {compareItems.map((property, index) => <td key={property.id} className={styles.photoCell}><div className={styles.photoWrap}><PropertyPhoto property={property} /><span className={styles.listingBadge}>{property.type === PropertyType.RENT ? "For rent" : "For sale"}</span><span className={styles.propertyNumber}>0{index + 1}</span><button type="button" disabled={exporting} onClick={() => removeFromCompare(property.id!)} aria-label={`Remove ${property.title} from comparison`} className={styles.removePhoto}><X size={15} aria-hidden="true" /></button></div></td>)}
                </tr>
                <tr ref={headerRef} className={styles.propertyHeaders}>
                  <th scope="col" className={styles.labelHeader}><span>THE DETAILS</span><p>{compareItems.length} properties<br />One clear view.</p></th>
                  {compareItems.map((property) => <th scope="col" key={property.id} className={styles.propertyHeader}>
                    <Link href={propertyPath(property)} onClick={() => setIsCompareOpen(false)} className={styles.propertyTitle}>{property.title}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                    <p className={styles.propertyLocation}><MapPin size={12} aria-hidden="true" /><span>{property.locality || property.city || property.location || "Location not listed"}</span></p>
                    <p className={styles.price}>{propertyPriceLabel(property)}</p>
                  </th>)}
                </tr>
              </thead>
              {sections.map((section, sectionIndex) => <tbody key={section.id} ref={(element) => { if (element) sectionRefs.current.set(section.id, element); else sectionRefs.current.delete(section.id); }}>
                <tr className={styles.sectionRow}><th scope="rowgroup" colSpan={compareItems.length + 1}><span className={styles.sectionNumber}>{String(sectionIndex + 1).padStart(2, "0")}</span>{section.title}<span className={styles.sectionLine} /></th></tr>
                {section.rows.map((row) => <tr key={row.id} className={styles.detailRow}>
                  <th scope="row" className={styles.rowLabel}>{row.label}{row.id === "description" && row.values.some((value) => value.text.length > 180) && <button type="button" className={styles.expandDescription} aria-expanded={fullDescriptions} onClick={() => setFullDescriptions(!fullDescriptions)}>{fullDescriptions ? "Show less" : "Read full descriptions"}</button>}</th>
                  {row.values.map((value, index) => <td key={compareItems[index].id} className={`${styles.valueCell} ${value.highlight ? styles.highlightCell : ""} ${row.id === "description" && !fullDescriptions ? styles.clamped : ""}`}><ValueCell value={value} amenity={row.amenity} /></td>)}
                </tr>)}
              </tbody>)}
              {!sections.length && <tbody><tr><td colSpan={compareItems.length + 1} className={styles.empty}>These properties have the same listed details.<br />Turn off the filter to see the full comparison.</td></tr></tbody>}
            </table>
          </div>
          <footer className={styles.footer}><p><span className={styles.footerDesktop}>Rates use the listed area. </span>“Not listed” means details haven’t been provided.</p><span className={styles.footerDesktop}>RUPALI<span className={styles.brandOrange}>HOMES</span></span><div className={styles.mobileDownload}>{pdfButton}</div></footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
