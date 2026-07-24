"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchLikedProperties, unlikeProperty } from "@/lib/api";
import { Property } from "@/types";
import { formatIndianPrice } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, ArrowUpRight, HeartOff } from "lucide-react";

export default function LikedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedProperties().then((data) => {
      setProperties(data);
      setLoading(false);
    });
  }, []);

  const handleUnlike = async (propertyId: number, index: number) => {
    const newProps = [...properties];
    newProps.splice(index, 1);
    setProperties(newProps);
    await unlikeProperty(propertyId);
    window.dispatchEvent(new Event("likedPropertiesChanged"));
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 px-4 sm:px-6 bg-gradient-to-b from-red-50 to-background">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-red-100 text-red-600 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
              <Heart size={18} className="fill-red-500" />
              Your Favorites
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold font-syne text-accent-dark mb-3 md:mb-4">
              Liked Properties
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Properties you&apos;ve saved. Come back anytime to revisit your
              top picks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full grow">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
            {properties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.08 }}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100 transition-all hover:-translate-y-1"
              >
                <Link
                  href={
                    property.type === "RENT"
                      ? `/rent/${property.id}`
                      : `/buy/${property.id}`
                  }
                  className="block h-full"
                >
                  <div className="relative h-72 overflow-hidden">
                    {property.imageUrl ? (
                      <Image
                        src={property.imageUrl}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-accent-dark">
                      {property.type === "RENT" ? "FOR RENT" : "FOR SALE"}
                    </div>

                    {/* Unlike Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (property.id) handleUnlike(property.id, index);
                      }}
                      className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full cursor-pointer hover:bg-red-50 text-red-500 transition-colors z-10 flex items-center gap-1.5 shadow-sm"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                      <span className="text-xs font-bold text-red-500">
                        {property.reactionsCount || 0}
                      </span>
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold font-syne text-accent-dark group-hover:text-gold transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-gold font-bold whitespace-nowrap ml-2">
                        {property.type === "RENT" && property.rentAmount
                          ? `${formatIndianPrice(property.rentAmount)}/mo`
                          : property.price
                          ? formatIndianPrice(property.price)
                          : "Price on Request"}
                      </p>
                    </div>

                    <p className="text-gray-500 mb-4 flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-gold"></span>
                      {property.location}
                    </p>

                    <p className="text-gray-600 line-clamp-2 mb-4 text-sm">
                      {property.description}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-accent-dark font-bold text-sm group-hover:text-gold transition-colors">
                        View Details
                        <ArrowUpRight size={16} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (property.id) handleUnlike(property.id, index);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors text-xs flex items-center gap-1"
                      >
                        <HeartOff size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold font-syne text-accent-dark mb-3">
              No liked properties yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Browse properties and tap the heart icon to save your favorites
              here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/buy"
                className="px-8 py-3 bg-accent-dark text-white rounded-full font-bold hover:bg-gold transition-colors"
              >
                Browse Buy
              </Link>
              <Link
                href="/rent"
                className="px-8 py-3 border-2 border-accent-dark text-accent-dark rounded-full font-bold hover:bg-accent-dark hover:text-white transition-colors"
              >
                Browse Rent
              </Link>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
