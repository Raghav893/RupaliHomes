"use client";

import { useCompare } from "@/context/CompareContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Scale } from "lucide-react";
import Image from "next/image";
import { PropertyType } from "@/types";

export default function CompareDrawer() {
  const { compareItems, removeFromCompare, clearCompare, isCompareOpen, setIsCompareOpen } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isCompareOpen ? 0 : "calc(100% - 64px)" }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl"
      >
        {/* Header / Toggle Handle */}
        <div 
          className="h-16 px-6 flex items-center justify-between cursor-pointer border-b border-gray-100"
          onClick={() => setIsCompareOpen(!isCompareOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-dark/10 flex items-center justify-center">
              <Scale size={16} className="text-accent-dark" />
            </div>
            <h3 className="font-syne font-bold text-accent-dark">
              Compare Properties ({compareItems.length}/3)
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {isCompareOpen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearCompare();
                }}
                className="text-sm text-gray-500 hover:text-red-500 font-medium px-2"
              >
                Clear All
              </button>
            )}
            <div className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
              {isCompareOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {compareItems.map((property) => (
              <div key={property.id} className="relative bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <button 
                  onClick={() => property.id && removeFromCompare(property.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-red-500 shadow-sm"
                >
                  <X size={14} />
                </button>
                
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                  {property.imageUrl ? (
                    <Image 
                      src={property.imageUrl} 
                      alt={property.title || "Property"} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded text-xs font-bold text-accent-dark">
                    {property.type === PropertyType.SALE ? "SALE" : "RENT"}
                  </div>
                </div>

                <h4 className="font-bold text-accent-dark line-clamp-1 mb-1">{property.title}</h4>
                <p className="text-sm text-gray-500 mb-4 line-clamp-1">{property.location}</p>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Price</span>
                    <span className="font-semibold text-accent-dark">
                      {property.type === PropertyType.SALE 
                        ? (property.price ? `₹${property.price.toLocaleString("en-IN")}` : "N/A")
                        : (property.rentAmount ? `₹${property.rentAmount.toLocaleString("en-IN")}/mo` : "N/A")
                      }
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Bedrooms</span>
                    <span className="font-medium">{property.bedrooms || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Bathrooms</span>
                    <span className="font-medium">{property.bathrooms || "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Area</span>
                    <span className="font-medium">{property.sqft ? `${property.sqft} sqft` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">{property.status}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty slots placeholders */}
            {Array.from({ length: 3 - compareItems.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center h-[400px]">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-xl text-gray-400">+</span>
                </div>
                <p className="text-sm text-gray-400">Add property to compare</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
