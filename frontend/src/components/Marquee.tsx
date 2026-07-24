"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Users,
  Key,
  Building2,
  TrendingUp,
} from "lucide-react";

const Marquee = () => {
  const items = [
    { text: "500+ Verified Listings", Icon: ShieldCheck },
    { text: "15+ Years of Expertise", Icon: Award },
    { text: "1200+ Happy Clients", Icon: Users },
    { text: "Buy • Sell • Rent", Icon: Key },
    { text: "Premium Properties Across India", Icon: Building2 },
    { text: "Expert Property Advisory", Icon: TrendingUp },
  ];

  return (
    <section className="bg-accent-dark/95 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative py-4 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-accent-dark/95 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-accent-dark/95 to-transparent" />

          <div className="flex whitespace-nowrap">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{
                repeat: Infinity,
                duration: 80,
                ease: "linear",
              }}
              className="flex gap-12 items-center"
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-12 items-center">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-xs md:text-sm tracking-[0.25em] uppercase text-white/80"
                    >
                      <item.Icon className="text-gold w-4 h-4 md:w-5 md:h-5 shrink-0" />
                      <span className="font-syne font-light">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Marquee;
