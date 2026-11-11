"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Expand, Grid2X2, X } from "lucide-react";
import type { GalleryImage } from "@/types";
import PropertyImage from "./PropertyImage";
import { accentVariables, type PropertyTheme } from "./presentation";
import styles from "./PropertyDetail.module.css";

export default function Gallery({ images, title, accentColor, theme }: { images: GalleryImage[]; title: string; accentColor?: string; theme?: PropertyTheme }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const move = (direction: number) => setCurrent((index) => (index + direction + images.length) % images.length);
  if (!images.length) return null;
  const image = images[current] || images[0];
  return <section id="gallery" className={`${styles.section} ${styles.gallerySection}`}><div className={styles.container}>
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>THE PROPERTY IN PICTURES</p><h2 className={styles.sectionTitle}>A closer look at life here.</h2></div><span className={styles.sectionAside}>{String(images.length).padStart(2, "0")} IMAGES</span></div>
    <div className={styles.galleryMain}><button type="button" className={styles.galleryOpen} onClick={() => setOpen(true)} aria-label="Open gallery fullscreen"><PropertyImage src={image.url} alt={image.caption || `${title}, image ${current + 1}`} /></button><span className={styles.imageCounter}>{current + 1}<span> / {images.length}</span></span><button type="button" className={styles.fullscreenButton} onClick={() => setOpen(true)} aria-label="View fullscreen"><Expand size={18} aria-hidden="true" /></button>{images.length > 1 && <div className={styles.galleryControls}><button type="button" aria-label="Previous image" onClick={() => move(-1)}><ArrowLeft size={20} /></button><button type="button" aria-label="Next image" onClick={() => move(1)}><ArrowRight size={20} /></button></div>}</div>
    {image.caption && <p className={styles.imageCaption}>{image.caption}</p>}
    <div className={styles.thumbnails}>{images.slice(0, 6).map((thumbnail, index) => <button key={`${thumbnail.url}-${index}`} type="button" aria-label={`Show image ${index + 1}`} aria-pressed={index === current} onClick={() => setCurrent(index)}><PropertyImage src={thumbnail.url} alt={thumbnail.caption || `${title} thumbnail ${index + 1}`} /></button>)}</div>
    <div className={styles.galleryFooter}><p>Official developer imagery – may include renderings.</p><button type="button" className={styles.darkOutlineButton} onClick={() => setOpen(true)}><Grid2X2 size={15} aria-hidden="true" />Show all {images.length} images</button></div>
    <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className={styles.modalOverlay} style={accentVariables(accentColor, theme)} /><Dialog.Content style={accentVariables(accentColor, theme)} className={`${styles.modal} ${styles.galleryModal}`} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}><div className={styles.modalHeader}><div><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{image.caption || `Image ${current + 1} of ${images.length}`}</Dialog.Description></div><Dialog.Close aria-label="Close gallery" className={styles.modalClose}><X size={22} /></Dialog.Close></div><div className={styles.lightboxImage}><PropertyImage src={image.url} alt={image.caption || `${title}, image ${current + 1}`} contain /></div><div className={styles.lightboxFooter}><button type="button" aria-label="Previous gallery image" onClick={() => move(-1)} disabled={images.length < 2}><ArrowLeft size={20} /></button><span>{current + 1} / {images.length}</span><button type="button" aria-label="Next gallery image" onClick={() => move(1)} disabled={images.length < 2}><ArrowRight size={20} /></button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div></section>;
}
