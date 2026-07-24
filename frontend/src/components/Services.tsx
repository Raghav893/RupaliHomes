"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Services() {
  const services = [
    {
      title: "Property Buying",
      description:
        "Find your dream home from our curated collection of premium residential and commercial properties across India.",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      link: "/buy",
    },
    {
      title: "Property Selling",
      description:
        "List and sell your property at the best price with our expert market analysis and wide buyer network.",
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      link: "/sell",
    },
    {
      title: "Home Loans & Finance",
      description:
        "Get hassle-free home loan assistance with the best interest rates from leading banks and NBFCs.",
      image:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      link: "/finance",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-7 md:gap-12 mb-10 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-6xl font-bold font-syne text-accent-dark leading-tight max-w-xl"
          >
            Buy, Sell & Finance <span className="text-gold">Your Property</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-lg"
          >
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              From handpicked luxury homes to hassle-free selling and
              financing—we handle every step so you don&apos;t have to.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Trusted by thousands of homeowners across Delhi NCR, Mumbai, Pune
              and more. Your property goals are our priority.
            </p>
            <Link href="/buy" className="bg-accent-dark text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-black transition-colors group w-fit inline-flex cursor-pointer">
              Explore Properties
              <div className="bg-white text-accent-dark rounded-full p-1 group-hover:scale-110 transition-transform">
                <ArrowUpRight size={16} />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="relative group transition-all duration-300"
            >
              <Link href={service.link} className="block h-full bg-[#FDF6F0] rounded-4xl p-4 pb-0 overflow-hidden relative group-hover:shadow-2xl flex flex-col cursor-pointer">
                {/* Card Header */}
                <div className="p-4 mb-4 flex justify-between items-start flex-grow">
                  <div>
                    <h3 className="text-2xl font-bold font-syne text-accent-dark mb-3 leading-tight">
                      {service.title}
                    </h3>
                    <div className="h-px w-12 bg-gray-300 mb-3"></div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="w-10 h-10 bg-accent-dark rounded-full flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors">
                    <ArrowUpRight size={20} className="text-white" />
                  </div>
                </div>

                {/* Card Image */}
                <div className="relative h-64 w-full rounded-t-4xl overflow-hidden mt-auto">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
