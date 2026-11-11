"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { scrollToPropertySection } from "./presentation";
import styles from "./PropertyDetail.module.css";

export interface PropertySection { id: string; label: string }

export default function SubNav({ sections, navbarHeight }: { sections: PropertySection[]; navbarHeight: number }) {
  const [active, setActive] = useState("overview");
  const linksRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = linksRef.current;
    const link = container?.querySelector<HTMLElement>(`a[href="#${active}"]`);
    if (!container || !link) return;
    const box = container.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.left < box.left) container.scrollLeft -= box.left - item.left;
    else if (item.right > box.right) container.scrollLeft += item.right - box.right;
  }, [active]);
  useEffect(() => {
    let pending = false;
    function update() {
      const boundary = navbarHeight + 100;
      let next = sections[0]?.id;
      for (const section of sections) if ((document.getElementById(section.id)?.getBoundingClientRect().top ?? Infinity) <= boundary) next = section.id;
      if (next) setActive(next);
      pending = false;
    }
    function schedule() { if (!pending) { pending = true; requestAnimationFrame(update); } }
    const observer = new IntersectionObserver(schedule, { rootMargin: `-${navbarHeight + 70}px 0px -40% 0px` });
    sections.forEach((section) => { const element = document.getElementById(section.id); if (element) observer.observe(element); });
    window.addEventListener("scroll", schedule, { passive: true }); update();
    return () => { observer.disconnect(); window.removeEventListener("scroll", schedule); };
  }, [sections, navbarHeight]);
  return <nav aria-label="Property sections" className={styles.subNav}><div className={styles.subNavInner}><div ref={linksRef} className={styles.subNavLinks}>{sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? "location" : undefined} onClick={(event) => { event.preventDefault(); setActive(section.id); scrollToPropertySection(section.id); }}>{section.label}</a>)}</div><button type="button" className={styles.navEnquire} onClick={() => scrollToPropertySection("enquire")}>Book a visit<ArrowUpRight size={15} aria-hidden="true" /></button></div></nav>;
}
