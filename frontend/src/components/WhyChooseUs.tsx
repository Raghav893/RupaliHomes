"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  FileCheck2,
  Handshake,
  Home,
  Scale,
  Shield,
} from "lucide-react";

export default function WhyChooseUs() {
  const metrics = [
    {
      icon: Home,
      value: "500+",
      label: "Curated Properties",
      delay: 0.1,
    },
    {
      icon: Clock,
      value: "15+",
      label: "Years of Expertise",
      delay: 0.2,
    },
    {
      icon: Handshake,
      value: "1200+",
      label: "Client Consultations",
      delay: 0.3,
    },
    {
      icon: Shield,
      value: "100%",
      label: "Document-led Review",
      delay: 0.4,
    },
  ];

  const checks = [
    {
      icon: BadgeCheck,
      title: "RERA and developer checks",
      copy: "We review project RERA registration details, developer track record, possession status, and public disclosures wherever applicable.",
    },
    {
      icon: FileCheck2,
      title: "Certificate readiness",
      copy: "Occupancy, possession, layout, demand letters, and payment schedule documents are discussed before clients advance.",
    },
    {
      icon: Scale,
      title: "Transparent advisory",
      copy: "Pricing, negotiation scope, service charges, and key risks are explained in plain terms before a site visit or offer.",
    },
  ];

  return (
    <section className="py-16 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-9 md:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block"
          >
            Why Choose Us
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold font-syne text-accent-dark mb-4 md:mb-6"
          >
            Built on trust, verification, and market discipline
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-base md:text-lg"
          >
            Rupali Homes combines curated inventory with RERA-aware checks,
            document review, and direct advisory so every client can compare
            options with confidence.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-8 mb-6 md:mb-10">
          {metrics.map((feature) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center border border-gray-100"
            >
              <div className="w-11 h-11 md:w-16 md:h-16 bg-gold/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 text-gold-hover">
                <feature.icon size={24} className="md:hidden" strokeWidth={1.5} />
                <feature.icon size={32} className="hidden md:block" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-4xl font-bold font-syne text-accent-dark mb-1 md:mb-3">
                {feature.value}
              </h3>
              <p className="text-gray-500 font-medium uppercase tracking-wide text-[10px] md:text-sm">
                {feature.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {checks.map((check, index) => (
            <motion.div
              key={check.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-white border border-gray-100 rounded-2xl p-5 md:p-7 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-dark text-gold flex items-center justify-center mb-5">
                <check.icon size={23} />
              </div>
              <h3 className="text-xl font-bold font-syne text-accent-dark mb-3">
                {check.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{check.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
