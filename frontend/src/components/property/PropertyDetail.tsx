"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Newsreader } from "next/font/google";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Property } from "@/types";
import { fetchLikedPropertyIds, likeProperty, unlikeProperty } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyGridCard from "@/components/PropertyGridCard";
import Hero from "./Hero";
import SubNav from "./SubNav";
import Overview from "./Overview";
import Gallery from "./Gallery";
import FloorPlans from "./FloorPlans";
import Lifestyle from "./Lifestyle";
import Brochure from "./Brochure";
import Registrations from "./Registrations";
import EnquiryForm from "./EnquiryForm";
import { accentVariables, galleryForProperty } from "./presentation";
import styles from "./PropertyDetail.module.css";

const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-property-serif", display: "swap" });

export default function PropertyDetail({ property, type, related = [] }: { property: Property; type: "buy" | "rent"; related?: Property[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [navbarHeight, setNavbarHeight] = useState(112);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const gallery = useMemo(() => galleryForProperty(property), [property]);
  const plans = (property.floorPlans || []).filter((plan) => Boolean(plan.imageUrl));
  const hasLifestyle = Boolean(property.amenities?.trim() || property.furnishingDetails?.trim() || property.furnishingStatus || property.flooring || property.availableFrom);
  const sections = useMemo(() => [
    { id: "overview", label: "Overview" },
    ...(gallery.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(plans.length ? [{ id: "floor-plans", label: "Floor plans" }] : []),
    ...(hasLifestyle ? [{ id: "lifestyle", label: "Lifestyle" }] : []),
    ...(property.brochureUrl ? [{ id: "brochure", label: "Brochure" }] : []),
    { id: "enquire", label: "Enquire" },
  ], [gallery.length, plans.length, hasLifestyle, property.brochureUrl]);

  useEffect(() => {
    const navigation = wrapperRef.current?.querySelector("nav");
    if (!navigation) return;
    const update = () => setNavbarHeight(Math.ceil(navigation.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update); observer.observe(navigation);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    let cancelled = false;
    fetchLikedPropertyIds().then((ids) => { if (!cancelled && property.id !== undefined) setLiked(ids.includes(property.id)); });
    return () => { cancelled = true; };
  }, [property.id]);

  async function toggleLike() {
    if (liking || property.id === undefined) return;
    setLiking(true);
    try {
      const success = liked ? await unlikeProperty(property.id) : await likeProperty(property.id);
      if (!success) { setShareMessage("We couldn’t update your favourites. Please try again."); return; }
      setLiked(!liked); window.dispatchEvent(new Event("likedPropertiesChanged"));
    } catch { setShareMessage("We couldn’t update your favourites. Please try again."); }
    finally { setLiking(false); }
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: property.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setShareMessage("Property link copied."); }
    } catch (error) { if (!(error instanceof DOMException && error.name === "AbortError")) setShareMessage("Copy the page address to share this property."); }
  }

  return <div ref={wrapperRef} className={`${styles.detail} ${newsreader.variable}`} style={{ ...accentVariables(property.accentColor, property), "--navbar-height": `${navbarHeight}px` } as CSSProperties}>
    <Navbar />
    <main>
      <Hero property={property} type={type} />
      <SubNav sections={sections} navbarHeight={navbarHeight} />
      <Overview property={property} type={type} liked={liked} onLike={() => void toggleLike()} onShare={() => void share()} shareMessage={shareMessage} />
      <Gallery images={gallery} title={property.title} accentColor={property.accentColor} theme={property} />
      <FloorPlans plans={plans} accentColor={property.accentColor} theme={property} />
      <Lifestyle property={property} />
      <Brochure property={property} />
      <Registrations property={property} />
      <section id="enquire" className={`${styles.section} ${styles.enquireSection}`}><div className={`${styles.container} ${styles.enquireGrid}`}><div className={styles.enquireCopy}><p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2 className={styles.sectionTitle}>Some places are<br />better experienced.</h2><p>Step inside. Explore the neighbourhood. Picture your everyday life here.</p><p>Tell us a little about yourself and the Rupali Homes team will help arrange your visit.</p>{property.agentName && <div className={styles.advisor}><span>Your property advisor</span><strong>{property.agentName}</strong></div>}<div className={styles.enquireMark} aria-hidden="true"><span>R</span><p>RUPALI HOMES<br />A PLACE FOR YOUR NEXT MOVE</p></div></div><EnquiryForm property={property} type={type} /></div></section>
      {related.length > 0 && <section className={`${styles.section} ${styles.relatedSection}`}><div className={styles.container}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>CONTINUE EXPLORING</p><h2 className={styles.sectionTitle}>{type === "rent" ? "Other rentals to consider." : "Other places. New possibilities."}</h2></div><Link href={`/${type}`} className={styles.textButton}>View all properties<ArrowUpRight size={16} /></Link></div><div className={styles.relatedGrid}>{related.slice(0, 3).map((item, index) => <PropertyGridCard key={item.id} property={item} index={index} />)}</div></div></section>}
      <section className={`${styles.section} ${styles.faqSection}`}><div className={`${styles.container} ${styles.faqGrid}`}><div><p className={styles.eyebrow}>A FEW HELPFUL DETAILS</p><h2 className={styles.sectionTitle}>Before your visit.</h2></div><div><details><summary>How do I book a site visit?</summary><p>Fill in the Book a Visit form and verify your phone number with the one-time password. Our team can help you plan your visit.</p></details><details><summary>How can I contact Rupali Homes?</summary><p>Call +91 9310831272 or email support@rupalihomes.com. Our office is at M3M Broadway, Sector 71, Gurugram.</p></details><details><summary>Where can I find more property details?</summary><p>Explore the listed specifications and available property materials on this page, or contact our team with your questions.</p></details></div></div></section>
    </main>
    <Footer />
  </div>;
}

export function PropertyDetailState({ type, loading }: { type: "buy" | "rent"; loading?: boolean }) {
  return <><Navbar /><main className={styles.pageState} style={accentVariables()}>{loading ? <><span className={styles.loadingSpinner} aria-hidden="true" /><p role="status">Finding your next place…</p></> : <><h1>Property not found</h1><p>This listing is currently unavailable.</p><Link href={`/${type}`}>Back to listings<ArrowUpRight size={16} /></Link></>}</main></>;
}
