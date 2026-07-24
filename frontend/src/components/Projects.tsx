"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchProperties } from "../lib/api";
import { Property } from "../types";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { AnimateSvg } from "./AnimateSvg";
import gsap from "gsap";

export default function Projects() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        // The public properties endpoint caps page size at 50.
        const data = await fetchProperties(0, 50);
        if (data && data.content) {
          const featured = data.content.filter((p: Property) => p.featured);
          setProperties(featured);
        }
      } catch (error) {
        console.error("Failed to load properties", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperties();
  }, []);

  if (loading) {
    return (
      <section
        id="projects"
        className="py-24 bg-accent-dark flex justify-center items-center min-h-[500px]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="py-14 md:py-32 bg-accent-dark text-white overflow-hidden relative"
    >
      {/* Background Grid Pattern for Dark Section */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[50px_50px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-end mb-10 md:mb-20">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold font-syne leading-tight">
              Find Your{" "}
              <span className="relative inline-block">
                <span className="text-gold">Dream</span>
                <AnimateSvg
                  width="100%"
                  height="12"
                  viewBox="0 0 200 12"
                  className="absolute -bottom-2 left-0 w-full"
                  path="M2 8 C50 2, 100 2, 198 8"
                  strokeColor="#FF5400"
                  strokeWidth={3}
                  animationDuration={1.5}
                  animationDelay={0.5}
                  enableHoverAnimation={true}
                  hoverAnimationType="redraw"
                />
              </span>
              <br />
              <span className="text-gold">Property</span>
            </h2>
          </div>

          <div className="lg:pl-12">
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Browse verified properties across India&apos;s top cities —
              handpicked for value, location, and potential.
              <span className="text-gold font-semibold">
                {" "}
                Whether you&apos;re buying your first home, investing in
                commercial real estate, or finding the perfect rental — we make
                it seamless.
              </span>
            </p>
            <Link
              href="/buy"
              className="inline-flex items-center gap-2 bg-white text-accent-dark px-6 py-3 rounded-full font-bold hover:shadow-xl transition-shadow group"
              onMouseEnter={(e) => {
                const arrow = e.currentTarget.querySelector(".gsap-arrow");
                if (arrow) {
                  gsap
                    .timeline()
                    .to(arrow, {
                      x: 4,
                      y: -4,
                      duration: 0.2,
                      ease: "power2.out",
                    })
                    .to(arrow, {
                      x: 0,
                      y: 0,
                      duration: 0.3,
                      ease: "bounce.out",
                    });
                }
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center overflow-hidden">
                <ArrowUpRight size={16} className="gsap-arrow" />
              </div>
              View All Properties
            </Link>
          </div>
        </div>

        {/* Dynamic Project Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-8">
          {properties.length > 0 ? (
            properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative h-[250px] sm:h-[320px] md:h-[400px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer"
              >
                {property.imageUrl ? (
                  <Image
                    src={property.imageUrl}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                <div className="absolute bottom-0 left-0 p-3 sm:p-5 md:p-8 w-full translate-y-1 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-gold text-[9px] sm:text-xs font-bold uppercase tracking-widest mb-1 md:mb-2 block">
                    {property.type}
                  </span>
                  <h3 className="text-sm sm:text-lg md:text-2xl font-bold font-syne mb-1 md:mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300">
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {property.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500">No properties to display.</p>
          )}
        </div>
      </div>
    </section>
  );
}
