"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  PanInfo,
} from "framer-motion";
import { Property } from "@/types";
import { formatIndianPrice } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MapPin, Bath, Bed, Square, Scale } from "lucide-react";
import { useState, MouseEvent } from "react";
import { useCompare } from "@/context/CompareContext";

interface SwipeablePropertyCardProps {
  property: Property;
  onSwipeLeft: (id: number) => void;
  onSwipeRight: (id: number) => void;
  style?: React.CSSProperties;
}

export default function SwipeablePropertyCard({
  property,
  onSwipeLeft,
  onSwipeRight,
  style,
}: SwipeablePropertyCardProps) {
  const router = useRouter();
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const { addToCompare, compareItems } = useCompare();
  
  const isCompared = compareItems.some((p) => p.id === property.id);

  // Motion values
  const x = useMotionValue(0);
  // Transform x into rotation for a realistic Tinder-card feel
  const rotateRaw = useTransform(x, [-200, 200], [-15, 15]);
  // Use a second transform to apply physics/springiness later if desired, but raw is fine.

  // Transform x into opacity values for the "LIKE" / "NOPE" stamps
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-20, -100], [0, 1]);

  // Handle Drag End to determine standard swipe action
  const handleDragEnd = async (_e: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 120; // Distance required to register a swipe
    const velocityThreshold = 400; // Speed required to register a fast swipe

    // Swiped Right (Like)
    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      await controls.start({
        x: 500,
        opacity: 0,
        transition: { duration: 0.3 },
      });
      if (property.id) onSwipeRight(property.id);
    }
    // Swiped Left (Pass)
    else if (
      info.offset.x < -threshold ||
      info.velocity.x < -velocityThreshold
    ) {
      await controls.start({
        x: -500,
        opacity: 0,
        transition: { duration: 0.3 },
      });
      if (property.id) onSwipeLeft(property.id);
    }
    // Didn't swipe far enough, snap back to center
    else {
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  // If the user clicks the card without dragging, navigate to the property page.
  const handleCardClick = (e: MouseEvent) => {
    if (!isDragging && property.id) {
      if (property.type === "RENT") {
        router.push(`/rent/${property.id}`);
      } else {
        router.push(`/buy/${property.id}`);
      }
    }
  };

  return (
    <motion.div
      style={{ ...style, x, rotate: rotateRaw, touchAction: "none" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      animate={controls}
      onClick={handleCardClick}
      className="absolute inset-0 bg-white rounded-[32px] overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing border border-gray-100 flex flex-col"
    >
      {/* LIKE / NOPE Indicators */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-12 left-8 border-4 border-green-500 text-green-500 text-4xl font-extrabold uppercase py-2 px-6 rounded-lg rotate-[-15deg] z-20 pointer-events-none tracking-widest bg-white/50 backdrop-blur-sm"
      >
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-12 right-8 border-4 border-red-500 text-red-500 text-4xl font-extrabold uppercase py-2 px-6 rounded-lg rotate-[15deg] z-20 pointer-events-none tracking-widest bg-white/50 backdrop-blur-sm"
      >
        NOPE
      </motion.div>

      {/* Main Image Viewport */}
      <div className="relative w-full h-3/5 overflow-hidden">
        {property.imageUrl ? (
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover pointer-events-none"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 pointer-events-none">
          <div className="inline-block bg-gold text-accent-dark text-sm font-bold px-4 py-1.5 rounded-full self-start mb-3 uppercase tracking-wider">
            {property.type === "RENT" ? "For Rent" : "For Sale"}
          </div>
          <h2 className="text-3xl font-black text-white font-syne leading-tight mb-2 drop-shadow-md">
            {property.title}
          </h2>
          <div className="flex items-center text-gray-200 gap-2 mb-1 drop-shadow-sm font-medium">
            <MapPin size={18} className="text-gold" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-8 flex flex-col justify-between grow bg-white">
        <div>
          <div className="flex justify-between items-baseline mb-6">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {property.type === "RENT" ? "Monthly Rent" : "Price"}
            </span>
            <p className="text-xl font-bold text-gold font-syne">
              {property.type === "RENT"
                ? formatIndianPrice(property.rentAmount)
                : formatIndianPrice(property.price)}
              {property.type === "RENT" && <span className="text-sm font-normal text-gray-500">/mo</span>}
            </p>
          </div>

          <p className="text-gray-600 line-clamp-3 text-base leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Quick Stats Base */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-4">
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 flex-1 mr-2">
            <Bed size={24} className="text-accent-light mb-1" />
            <span className="text-accent-dark font-bold">
              {property.bedrooms || "-"}
            </span>
            <span className="text-xs text-gray-500">Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 flex-1 mx-2">
            <Bath size={24} className="text-accent-light mb-1" />
            <span className="text-accent-dark font-bold">
              {property.bathrooms || "-"}
            </span>
            <span className="text-xs text-gray-500">Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-4 flex-1 ml-2">
            <Square size={24} className="text-accent-light mb-1" />
            <span className="text-accent-dark font-bold">
              {property.areaSqFt ? `${property.areaSqFt}` : "-"}
            </span>
            <span className="text-xs text-gray-500">Sq Ft</span>
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isCompared) addToCompare(property);
          }}
          className={`bg-black/40 backdrop-blur-md rounded-full p-3 text-white transition-all hover:bg-gold ${isCompared ? 'bg-gold' : ''}`}
          title={isCompared ? "Added to compare" : "Compare"}
        >
          <Scale size={18} />
        </button>
      </div>

      {/* Click hint */}
      <div className="absolute top-16 right-4 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs font-medium z-10 pointer-events-none drop-shadow-lg">
        Tap to view details
      </div>
    </motion.div>
  );
}
