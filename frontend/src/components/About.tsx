"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-16 md:py-32 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="lg:grid lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 lg:mb-0 relative"
          >
            {/* Abstract Shapes */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Luxury Property"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Floating Experience Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-4 right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-8 rounded-tr-3xl shadow-xl z-20 max-w-[150px] md:max-w-[200px]"
            >
              <p className="text-3xl md:text-4xl font-bold font-syne text-accent-dark">
                15+
              </p>
              <p className="text-sm text-gray-500 mt-2 font-medium uppercase tracking-wider">
                Years of Excellence
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">
              Our Story
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-accent-dark font-syne mb-5 md:mb-8 leading-tight">
              Your Property Journey <br /> Starts{" "}
              <span className="text-gold italic">Here</span>
            </h2>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-5 md:mb-6 font-light">
              Rupali Homes is more than a real estate platform — it&apos;s your
              trusted partner in finding the perfect property. From first-time
              home buyers to seasoned investors, we simplify every step of
              buying, selling, and renting.
            </p>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-7 md:mb-10 font-light">
              With verified listings, expert market insights, and dedicated
              property advisors, we help you make informed decisions in
              India&apos;s most sought-after locations.
            </p>

            <Link
              href="#contact"
              className="group inline-flex items-center gap-2 text-accent-dark font-bold hover:text-gold transition-colors text-lg border-b-2 border-accent-dark hover:border-gold pb-1"
            >
              Start Your Journey
              <span className="group-hover:translate-x-2 transition-transform duration-300">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
