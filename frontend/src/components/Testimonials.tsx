"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Rupali Homes helped us find our dream 3BHK in just two weeks. Their market knowledge and negotiation skills saved us lakhs!",
    name: "Aditya Khurana",
    role: "Home Buyer, Gurgaon",
    image: "/avatars/avatar1.jpg",
  },
  {
    quote:
      "Selling my property was stress-free with Rupali Homes. They handled everything from valuation to legal paperwork seamlessly.",
    name: "Meera Reddy",
    role: "Property Seller, Delhi",
    image: "/avatars/avatar2.jpg",
  },
  {
    quote:
      "Transparent dealings, verified listings, and genuine advice. They truly put the client first — not just commissions.",
    name: "Rajesh Verma",
    role: "Investor, Noida",
    image: "/avatars/avatar3.jpg",
  },
  {
    quote:
      "As a first-time buyer, I had so many questions. The team patiently guided me through every step, from loan to registration.",
    name: "Sneha Gupta",
    role: "First-Time Buyer, Gurgaon",
    image: "/avatars/avatar4.jpg",
  },
  {
    quote:
      "Found the perfect commercial space for my startup through Rupali Homes. Their portfolio of verified properties is impressive.",
    name: "Vikram Singh",
    role: "Startup Founder, Noida",
    image: "/avatars/avatar5.jpg",
  },
  {
    quote:
      "I've worked with many agents before, but Rupali Homes stands out for their honesty and deep knowledge of the local market.",
    name: "Ananya Das",
    role: "NRI Investor, Bangalore",
    image: "/avatars/avatar6.jpg",
  },
];

const TestimonialCard = ({ data }: { data: (typeof testimonials)[0] }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mx-4 w-[350px] sm:w-[400px] shrink-0">
    <p className="text-gray-600 italic mb-6 leading-relaxed">
      &quot;{data.quote}&quot;
    </p>
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden relative">
        {/* Placeholder for now if image fails */}
        <div className="absolute inset-0 bg-accent-dark/10 flex items-center justify-center text-accent-dark font-bold">
          {data.name[0]}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-accent-dark font-syne">{data.name}</h4>
        <p className="text-sm text-gold">{data.role}</p>
      </div>
    </div>
  </div>
);

export default function Testimonials() {
  const row = [...testimonials, ...testimonials]; // Duplicated for seamless loop

  return (
    <section className="py-16 md:py-32 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 md:mb-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold font-syne text-accent-dark mb-4 md:mb-6"
        >
          What People <span className="text-gold">Say About Us</span>
        </motion.h2>
      </div>

      <div className="relative w-full overflow-hidden py-10">
        {/* Horizontal Fading Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

        <div className="animate-marquee">
          {row.map((item, idx) => (
            <TestimonialCard key={`row-${idx}`} data={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
