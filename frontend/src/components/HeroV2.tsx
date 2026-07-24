"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import HeroSvgAnimation from "@/components/HeroSvgAnimation";
import HeroSearch from "@/components/HeroSearch";

export default function HeroV2() {
  const [activeTab, setActiveTab] = useState("buy");
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const yText = useTransform(scrollY, [0, 500], [0, -50]);

  const headings = {
    buy: { prefix: "Find Your", highlight: "Dream", suffix: "Property Today" },
    rent: { prefix: "Rent Your", highlight: "Perfect", suffix: "Space" },
    projects: { prefix: "Discover", highlight: "New", suffix: "Projects" },
    plot: { prefix: "Land Your", highlight: "Prime", suffix: "Plot Today" },
    commercial: {
      prefix: "Secure",
      highlight: "Premium",
      suffix: "Workspaces",
    },
  };

  const currentHeading =
    headings[activeTab as keyof typeof headings] || headings.buy;

  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      // Optional: Split text or just animate the container.
      // We will do a simple smooth container pop-up with GSAP
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
    }
  }, [activeTab]);

  return (
    <div className="relative min-h-0 md:min-h-[85vh] flex flex-col justify-start px-4 pt-28 pb-8 md:pt-44 md:pb-16 overflow-hidden bg-grid">
      <HeroSvgAnimation />

      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-6 md:gap-12 items-center relative z-10">
        {/* Text Content */}
        <motion.div
          style={{ y: yText }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 md:w-12 h-px bg-gold"></div>
            <span className="text-[11px] md:text-sm font-semibold tracking-[0.18em] md:tracking-widest uppercase text-gold">
              Premium Real Estate
            </span>
          </div>

          <h1
            ref={headingRef}
            className="text-[2.35rem] md:text-[3.4rem] lg:text-[3.8rem] font-semibold leading-[1.04] text-accent-dark mb-5 md:mb-6 font-syne tracking-tight"
          >
            {currentHeading.prefix}{" "}
            <span className="relative inline-block text-gold">
              {currentHeading.highlight}
            </span>
            <br />
            <span className="relative inline-block mt-2">
              {currentHeading.suffix}
            </span>
          </h1>

          <div className="w-full relative z-20 mt-6 md:mt-12">
            <HeroSearch onTabChange={setActiveTab} />
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[140px] sm:h-[200px] md:h-[430px] flex items-center justify-center lg:justify-end pointer-events-none"
        >
          <div className="relative z-10 w-[78%] sm:w-[82%] md:w-[68%] lg:w-[76%] h-full flex justify-center lg:justify-end items-center translate-x-0">
            <motion.img
              src={
                activeTab === "commercial"
                  ? "/commercial.png"
                  : activeTab === "rent"
                    ? "/3dinteriorr.png"
                    : activeTab === "projects"
                      ? "/tousenew.png"
                      : activeTab === "plot"
                        ? "/tenniscourt.png"
                        : "/touse.png"
              }
              alt="Luxury Home"
              className="block w-auto h-auto max-w-full max-h-full object-contain drop-shadow-2xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
