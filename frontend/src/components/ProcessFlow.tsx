"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { MapPin, Search, FileCheck, Handshake, Key } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "20k+ Properties Rented",
    description:
      "Successfully matched thousands of tenants with their ideal homes across top metropolitan cities.",
  },
  {
    icon: MapPin,
    title: "5k+ Homes Sold",
    description:
      "Guided families and investors to close their dream deals with complete transparency.",
  },
  {
    icon: FileCheck,
    title: "15k+ Happy Families",
    description:
      "Built a thriving community of satisfied homeowners and tenants through dedicated service.",
  },
  {
    icon: Handshake,
    title: "₹500Cr+ Sales Volume",
    description:
      "Trusted by buyers and sellers nationwide for high-value real estate transactions.",
  },
  {
    icon: Key,
    title: "100% Verified Listings",
    description:
      "Every property undergoes rigorous legal and physical verification for your absolute peace of mind.",
  },
];

export default function ProcessFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [svgPath, setSvgPath] = useState("");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const calculatePath = () => {
      if (!containerRef.current || stepRefs.current.length === 0) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const centerX = containerRect.width / 2;

      let pathBuilder = `M ${centerX} 0`;

      stepRefs.current.forEach((step, index) => {
        if (!step) return;

        const rect = step.getBoundingClientRect();
        const relativeY = rect.top - containerRect.top + rect.height / 2;

        const prevStep = stepRefs.current[index - 1];
        const prevY =
          index === 0
            ? 0
            : (prevStep?.getBoundingClientRect().top || 0) -
              containerRect.top +
              (prevStep?.clientHeight || 0) / 2;
        const currentY = relativeY;

        // Use a smaller amplitude for a tighter, more cohesive premium feel
        const amplitude = 40;
        const direction = index % 2 === 0 ? 1 : -1;

        // Control Points for organic flow
        const cp1Y = prevY + (currentY - prevY) * 0.5;
        const cp2Y = currentY - (currentY - prevY) * 0.5;

        pathBuilder += ` C ${centerX + amplitude * direction} ${cp1Y}, ${centerX + amplitude * direction} ${cp2Y}, ${centerX} ${currentY}`;
      });

      // Extend to bottom smoothly
      const lastStep = stepRefs.current[steps.length - 1];
      if (lastStep) {
        const bottomY = containerRect.height;
        pathBuilder += ` L ${centerX} ${bottomY}`;
      }

      setSvgPath(pathBuilder);
    };

    calculatePath();
    window.addEventListener("resize", calculatePath);

    const observer = new ResizeObserver(() => {
      calculatePath();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", calculatePath);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-16 md:py-32 bg-background relative overflow-hidden"
      id="process"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold font-syne text-accent-dark mb-4 md:mb-6"
          >
            India&apos;s Most Trusted{" "}
            <span className="text-gold">Real Estate Platform</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto"
          >
            Numbers that speak for our commitment to excellence, transparency,
            and customer satisfaction across every transaction.
          </motion.p>
        </div>

        <div className="relative">
          {/* Animated SVG Path Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <svg className="w-full h-full overflow-visible">
              {/* Background Track - Solid and faint for premium feel */}
              <path d={svgPath} stroke="#E5E7EB" strokeWidth="3" fill="none" />

              {/* Foreground Animated Line */}
              <motion.path
                d={svgPath}
                stroke="#FF5400"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                style={{ pathLength }}
                filter="drop-shadow(0px 0px 4px rgba(197, 160, 89, 0.4))"
              />
            </svg>
          </div>

          <div className="space-y-12 md:space-y-32 relative z-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className={`flex flex-col md:flex-row items-center relative ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Content Side */}
                  <div className="w-full md:w-5/12 px-4 mb-8 md:mb-0">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 relative group transition-all duration-300 cursor-pointer hover:shadow-gold/10 hover:border-gold/30`}
                    >
                      <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent-dark text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg z-20 group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
                        {index + 1}
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold font-syne text-accent-dark mb-2 md:mb-4 group-hover:text-gold transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Center Icon Node (Ref Target) */}
                  <div
                    className="w-full md:w-2/12 flex justify-center py-4 md:py-0"
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-white rounded-full border-4 border-gold shadow-lg flex items-center justify-center z-20 relative"
                      whileInView={{ scale: [0, 1.2, 1], rotate: [0, 360] }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    >
                      <step.icon size={24} className="text-accent-dark" />
                    </motion.div>
                  </div>

                  {/* Empty Side for Layout Balance */}
                  <div className="hidden md:block md:w-5/12"></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
