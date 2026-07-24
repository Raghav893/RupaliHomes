"use client";

import { motion } from "framer-motion";

export default function HeroUnderline() {
  return (
    <svg
      width="200"
      height="20"
      viewBox="0 0 200 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -bottom-2 right-0 w-full h-auto"
    >
      <motion.path
        d="M5 12C40 5 100 15 195 5"
        stroke="#FF5400" // Brand Orange color
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
      />
    </svg>
  );
}
