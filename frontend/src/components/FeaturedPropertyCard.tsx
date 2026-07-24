"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Scale } from "lucide-react";
import { Property } from "@/types";
import confetti from "canvas-confetti";
import { likeProperty, unlikeProperty, fetchLikedPropertyIds } from "@/lib/api";
import { useCompare } from "@/context/CompareContext";
import { formatIndianPrice } from "@/lib/utils";

interface FeaturedPropertyCardProps {
  property: Property;
}

export default function FeaturedPropertyCard({
  property: initialProperty,
}: FeaturedPropertyCardProps) {
  const [property, setProperty] = useState(initialProperty);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
  const { addToCompare, compareItems } = useCompare();
  
  const isCompared = compareItems.some((p) => p.id === property.id);

  useEffect(() => {
    if (initialProperty.id) {
      fetchLikedPropertyIds().then((ids) => {
        setHasLiked(ids.includes(initialProperty.id!));
      });
    }
  }, [initialProperty.id]);

  // Use a fallback price if property.price is missing or 0, to avoid displaying "0"
  const price = property.price ? formatIndianPrice(property.price) : "Price on Request";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto items-center"
    >
      {/* Property Image */}
      <div className="relative w-full md:w-3/5 h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
        <Image
          src={
            property.imageUrl ||
            "https://images.unsplash.com/photo-1600596542815-27b5c0b8aa5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          }
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!hasLiked) {
              if (!hasFiredConfetti) {
                const duration = 3 * 1000;
                const end = Date.now() + duration;
                const frame = () => {
                  confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: [
                      "#26ccff",
                      "#a25afd",
                      "#ff5e7e",
                      "#88ff5a",
                      "#fcff42",
                      "#ffa62d",
                      "#ff36ff",
                    ],
                  });
                  confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: [
                      "#26ccff",
                      "#a25afd",
                      "#ff5e7e",
                      "#88ff5a",
                      "#fcff42",
                      "#ffa62d",
                      "#ff36ff",
                    ],
                  });
                  if (Date.now() < end) requestAnimationFrame(frame);
                };
                frame();
                setHasFiredConfetti(true);
              }

              setHasLiked(true);
              setProperty((prev) => ({
                ...prev,
                reactionsCount: (prev.reactionsCount || 0) + 1,
              }));
              if (property.id) {
                await likeProperty(property.id);
                window.dispatchEvent(new Event("likedPropertiesChanged"));
              }
            } else {
              setHasLiked(false);
              setProperty((prev) => ({
                ...prev,
                reactionsCount: Math.max(0, (prev.reactionsCount || 0) - 1),
              }));
              if (property.id) {
                await unlikeProperty(property.id);
                window.dispatchEvent(new Event("likedPropertiesChanged"));
              }
            }
          }}
          className="absolute top-4 right-4 bg-white/30 backdrop-blur-md px-3 py-2 rounded-full cursor-pointer hover:bg-white text-white hover:text-red-500 transition-colors z-10 flex items-center gap-2"
        >
          <Heart
            size={20}
            className={hasLiked ? "fill-red-500 text-red-500" : ""}
          />
          <span
            className={`text-sm font-bold ${hasLiked ? "text-red-500" : "text-white group-hover:text-red-500 text-shadow-sm"}`}
          >
            {property.reactionsCount || 0}
          </span>
        </div>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isCompared) addToCompare(property);
          }}
          className={`absolute top-4 right-20 backdrop-blur-md px-3 py-2 rounded-full cursor-pointer transition-colors z-10 flex items-center gap-2 ${
            isCompared ? "bg-gold text-white" : "bg-white/30 hover:bg-gold hover:text-white text-white"
          }`}
          title={isCompared ? "Added to compare" : "Compare Property"}
        >
          <Scale size={20} />
        </div>
      </div>

      {/* Property Details */}
      <div className="w-full md:w-2/5 flex flex-col justify-center space-y-6">
        <div>
          <h2 className="text-3xl font-bold font-syne text-accent-dark mb-1">
            {property.title}
          </h2>
          <p className="text-gray-500 text-lg">{property.location}</p>
        </div>

        <div className="flex justify-between items-center border-b border-gray-100 pb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gold mb-1">
              <span className="text-2xl font-bold text-accent-dark">
                {property.bedrooms || 4}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              beds
            </p>
          </div>
          <div className="text-center border-l border-gray-100 pl-6">
            <div className="flex items-center justify-center gap-2 text-gold mb-1">
              <span className="text-2xl font-bold text-accent-dark">
                {property.bathrooms || 3}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              baths
            </p>
          </div>
          <div className="text-center border-l border-gray-100 pl-6">
            <div className="flex items-center justify-center gap-2 text-gold mb-1">
              <span className="text-2xl font-bold text-accent-dark">
                {property.sqft || 1868}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              sqft
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-accent-dark font-syne">
              {price}
            </p>
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1">
            Split options <span className="text-gray-400">›</span>
          </button>
        </div>

        {/* Agent Info */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                alt="Agent"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Agent
              </p>
              <p className="font-bold text-accent-dark text-sm">
                Rupali Sharma
              </p>
            </div>
          </div>
          <button className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-gold hover:text-gold transition-colors shadow-sm">
            Contact
          </button>
        </div>

        <button className="w-full bg-accent-dark text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl group">
          <span className="text-lg">Request a tour</span>
          <span className="text-gray-400 text-xs font-normal group-hover:text-gray-300 transition-colors">
            Earliest at 11:00 tomorrow
          </span>
        </button>
      </div>
    </motion.div>
  );
}
