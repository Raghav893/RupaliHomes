"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import HeroSvgAnimation from "@/components/HeroSvgAnimation";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]); // Image moves down slower
  const yText = useTransform(scrollY, [0, 500], [0, -50]); // Text moves up slightly faster

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center px-4 pt-20 overflow-hidden bg-grid">
      <HeroSvgAnimation />
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          style={{ y: yText }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-gold"></div>
            <span className="text-sm font-semibold tracking-widest uppercase text-gold">
              Real Estate & Design
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-accent-dark mb-8 font-syne">
            Find Your Home,
            <br />
            Design Your Space
          </h1>

          <p className="text-xl text-gray-600 max-w-md mb-10 font-light leading-relaxed">
            From finding the perfect property to securing the best deal, we
            guide you through every step of your home journey.
          </p>

          <div className="flex flex-wrap gap-6 items-center">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#projects"
              className="flex items-center gap-3 px-8 py-4 bg-accent-dark text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-accent-dark">
                <ArrowUpRight size={18} />
              </div>
              Explore Projects
            </motion.a>
            <div className="flex -space-x-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                >
                  {/* Placeholder for avatars */}
                  <div className="w-full h-full bg-slate-300"></div>
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gold flex items-center justify-center text-xs font-bold text-accent-dark">
                +
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          style={{ y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[600px] flex items-center justify-center"
        >
          {/* Main Hero Image */}
          <div className="relative z-10 w-[150%] h-full flex justify-center items-center translate-x-[10%]">
            <img
              src="/touse.png"
              alt="Luxury Home"
              className="object-contain w-full h-full scale-135"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
