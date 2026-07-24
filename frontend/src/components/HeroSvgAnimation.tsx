"use client";

import { motion } from "framer-motion";

export default function HeroSvgAnimation() {
  const drawAndFill = {
    hidden: { pathLength: 0, opacity: 0, fillOpacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      fillOpacity: 0,
      transition: {
        pathLength: { duration: 2.5, ease: "easeInOut" as const },
        opacity: { duration: 0.1 },
      },
    },
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 opacity-10 md:opacity-20 flex items-center justify-center md:justify-end md:pr-0">
      <motion.svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gold w-[120%] h-[120%] md:w-full md:h-full translate-x-[20%] md:translate-x-[25%] translate-y-[5%] md:translate-y-[10%]"
      >
        {/* Simple Modern House Outline */}
        <motion.path
          d="M100,500 L100,250 L300,50 L500,250 L500,500 L100,500 Z M150,500 L150,300 L250,500 M350,500 L350,300 L450,500 M200,250 L200,150 L400,150 L400,250"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial="hidden"
          animate="visible"
          variants={drawAndFill}
          // fill="currentColor" removed to ensure no fill
        />
        {/* Roof Detail */}
        <motion.path
          d="M80,270 L300,30 L520,270"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          initial="hidden"
          animate={{
            pathLength: 1,
            opacity: 1,
            transition: { duration: 2, ease: "easeInOut" },
          }}
        />
        {/* Sun / Moon */}
        <motion.circle
          cx="450"
          cy="120"
          r="40"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: 1,
            opacity: 1,
            transition: { duration: 3, delay: 0.5 },
          }}
        />
      </motion.svg>
    </div>
  );
}
