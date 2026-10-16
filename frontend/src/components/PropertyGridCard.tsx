"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatIndianPrice } from "@/lib/utils";
import { Heart, MapPin, Bed, Bath, Square, Scale, ArrowUpRight } from "lucide-react";
import { Property } from "@/types";
import confetti from "canvas-confetti";
import { likeProperty, unlikeProperty, fetchLikedPropertyIds } from "@/lib/api";
import { useCompare } from "@/context/CompareContext";

interface PropertyGridCardProps {
  property: Property;
  index?: number;
  liked?: boolean;
  onLikeChange?: (id: number, liked: boolean) => void;
}

export default function PropertyGridCard({ property, index = 0, liked, onLikeChange }: PropertyGridCardProps) {
  const [localHasLiked, setLocalHasLiked] = useState(false);
  const hasLiked = liked ?? localHasLiked;
  const [reactionsCount, setReactionsCount] = useState(property.reactionsCount || 0);
  const { addToCompare, compareItems } = useCompare();
  const isCompared = compareItems.some((p) => p.id === property.id);

  useEffect(() => {
    if (liked === undefined && property.id) {
      fetchLikedPropertyIds().then((ids) => setLocalHasLiked(ids.includes(property.id!)));
    }
  }, [liked, property.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasLiked) {
      setLocalHasLiked(true);
      if (property.id) onLikeChange?.(property.id, true);
      setReactionsCount((prev) => prev + 1);

      // Confetti burst
      const duration = 1.5 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#ff0000", "#ff69b4", "#FF5400"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#ff0000", "#ff69b4", "#FF5400"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      if (property.id) {
        await likeProperty(property.id);
        window.dispatchEvent(new Event("likedPropertiesChanged"));
      }
    } else {
      setLocalHasLiked(false);
      if (property.id) onLikeChange?.(property.id, false);
      setReactionsCount((prev) => Math.max(0, prev - 1));
      if (property.id) {
        await unlikeProperty(property.id);
        window.dispatchEvent(new Event("likedPropertiesChanged"));
      }
    }
  };

  const formattedPrice =
    property.type === "RENT"
    ? `${formatIndianPrice(property.rentAmount)}`
    : formatIndianPrice(property.price);

  const detailPath = property.type === "RENT"
    ? `/rent/${property.id}`
    : `/buy/${property.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
    >
      <Link href={detailPath} className="block group">
        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-500 hover:-translate-y-1">
          {/* Image */}
          <div className="relative h-36 sm:h-56 md:h-64 overflow-hidden">
            {property.imageUrl ? (
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-medium">
                No Image
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Type badge */}
            <div className="absolute top-3 left-3 bg-gold text-accent-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              {property.type === "RENT" ? "For Rent" : "For Sale"}
            </div>

            {property.status === "SOLD" && (
              <div className="absolute top-12 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Sold Out
              </div>
            )}
            {property.status === "RENTED" && (
              <div className="absolute top-12 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                Rented Out
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isCompared) addToCompare(property);
                }}
                className={`backdrop-blur-md rounded-full p-2.5 transition-all duration-300 shadow-md ${
                  isCompared
                    ? "bg-gold text-white"
                    : "bg-white/30 text-white hover:bg-gold hover:text-white"
                }`}
                title={isCompared ? "Added to compare" : "Compare"}
              >
                <Scale size={16} />
              </button>
              <button
                onClick={handleLike}
                className="bg-white/30 backdrop-blur-md rounded-full p-2.5 text-white hover:bg-white hover:text-red-500 transition-all duration-300 shadow-md flex items-center gap-1.5"
              >
                <Heart
                  size={16}
                  className={hasLiked ? "fill-red-500 text-red-500" : ""}
                />
                <span className={`text-xs font-bold ${hasLiked ? "text-red-500" : ""}`}>
                  {reactionsCount}
                </span>
              </button>
            </div>

            {/* View details hover hint */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-md">
              <ArrowUpRight size={18} className="text-accent-dark" />
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-5">
            {/* Price */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-base sm:text-xl font-bold font-syne text-accent-dark group-hover:text-gold transition-colors truncate">
                {formattedPrice}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {property.type === "RENT" ? "/month" : ""}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-lg font-bold text-accent-dark font-syne mb-1.5 line-clamp-2 sm:line-clamp-1 group-hover:text-gold transition-colors duration-300">
              {property.title}
            </h3>

            {/* Location */}
            <div className="flex items-center text-gray-500 gap-1.5 mb-4">
              <MapPin size={14} className="text-gold shrink-0" />
              <span className="text-sm truncate">{property.location}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                <Bed size={16} className="text-accent-light" />
                <span className="text-sm font-semibold">{property.bedrooms || "—"}</span>
                <span className="hidden sm:inline text-xs text-gray-400">Beds</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                <Bath size={16} className="text-accent-light" />
                <span className="text-sm font-semibold">{property.bathrooms || "—"}</span>
                <span className="hidden sm:inline text-xs text-gray-400">Baths</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                <Square size={16} className="text-accent-light" />
                <span className="text-sm font-semibold">{(property.areaSqFt as number) || property.sqft || "—"}</span>
                <span className="hidden sm:inline text-xs text-gray-400">sqft</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
