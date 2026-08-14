"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Share2,
  ArrowLeft,
  Flame,
  Layers,
  Building,
  Sofa,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { getAmenityIcon } from "@/lib/amenities";
import { getPropertyStatusStyles } from "@/lib/propertyStatus";
import confetti from "canvas-confetti";
import {
  fetchPropertyById,
  fetchProperties,
  likeProperty,
  unlikeProperty,
  fetchLikedPropertyIds,
} from "@/lib/api";
import { Property, PropertyType } from "@/types";
import { formatIndianPrice } from "@/lib/utils";
import PhoneOtpVerifier, { VerifiedPhone } from "@/components/PhoneOtpVerifier";
import { normalizeIndianPhoneNumber } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

const faqs = [
  {
    q: "Who is Rupali Homes?",
    a: "Rupali Homes is India's premier luxury real estate consultancy. We help discerning buyers and renters find the finest residential and commercial properties across Gurugram and the wider Delhi NCR region.",
  },
  {
    q: "How do I book a site visit for this property?",
    a: "Simply fill in the 'Book a Visit' form on this page with your name and phone number, and verify your number with the one-time password (OTP). Our team will contact you shortly to schedule the visit at your convenience.",
  },
  {
    q: "What types of properties does Rupali Homes offer?",
    a: "We offer a wide range of properties including residential apartments, independent villas, premium builder floors, plots & land, and commercial spaces across prime locations in Delhi NCR.",
  },
  {
    q: "Are the listings on Rupali Homes verified?",
    a: "Yes, our team carefully verifies every listing, including the documentation, location, and property details, so you can search and compare with confidence.",
  },
  {
    q: "How can I contact Rupali Homes for more information?",
    a: "You can reach us at +91 9310831272 or email support@rupalihomes.com. Our office is located at the 3rd & 4th Floor, Knowledge Center, M3M Broadway, Sector 71, Gurugram, Haryana 122101.",
  },
];

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [hasFiredHeartConfetti, setHasFiredHeartConfetti] = useState(false);
  const [fireCount, setFireCount] = useState(0);
  const [fired, setFired] = useState(false);
  const [showFireAnimation, setShowFireAnimation] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [otherProperties, setOtherProperties] = useState<Property[]>([]);
  const [visitForm, setVisitForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [visitStatus, setVisitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [verifiedVisitPhone, setVerifiedVisitPhone] = useState<VerifiedPhone | null>(null);

  const getVerifiedVisitPhoneE164 = () => {
    try {
      const enteredPhone = normalizeIndianPhoneNumber(visitForm.phone);
      return verifiedVisitPhone?.phoneE164 === enteredPhone
        ? enteredPhone
        : undefined;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      try {
        const data = await fetchPropertyById(id.toString());
        if (data) {
          setProperty(data);
        }
        // Load other properties for the carousel
        const allProps = await fetchProperties(0, 20, {
          type: PropertyType.SALE,
        });
        if (allProps?.content) {
          setOtherProperties(
            allProps.content.filter(
              (p: Property) => String(p.id) !== String(id),
            ),
          );
        }
      } catch (error) {
        console.error("Failed to load property", error);
      } finally {
        setLoading(false);
      }
    }
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (property?.id) {
      fetchLikedPropertyIds().then((ids) => {
        setLiked(ids.includes(property.id!));
      });
    }
  }, [property?.id]);

  const handleConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const triggerFireReaction = () => {
    if (!fired) {
      setFired(true);
      setFireCount(1);
      setShowFireAnimation(true);
      setTimeout(() => setShowFireAnimation(false), 1000);
    } else {
      setFired(false);
      setFireCount(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-2xl font-syne text-accent-dark mb-4">
          Property Not Found
        </h2>
        <Link
          href="/buy"
          className="px-6 py-2 bg-accent-dark text-white rounded-full hover:bg-gold transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const statusStyles = getPropertyStatusStyles(property.status);

  const allImages = [
    property.imageUrl,
    ...(property.imageGallery ? property.imageGallery.split(",") : []),
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-28 md:pt-36 pb-12">
      <Navbar />
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Link
          href="/buy"
          className="inline-flex items-center text-gray-500 hover:text-gold transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Search
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image Gallery (Airbnb Style Grid) */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gray-100 group h-[50vh] min-h-[400px]">
            {allImages.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            ) : allImages.length === 1 ? (
              <div className="w-full h-full relative cursor-pointer" onClick={() => setShowGallery(true)}>
                <Image src={allImages[0]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ) : allImages.length === 2 ? (
              <div className="grid grid-cols-2 h-full gap-2 cursor-pointer" onClick={() => setShowGallery(true)}>
                <div className="relative overflow-hidden"><Image src={allImages[0]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="relative overflow-hidden"><Image src={allImages[1]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
              </div>
            ) : allImages.length === 3 || allImages.length === 4 ? (
              <div className="grid grid-cols-2 h-full gap-2 cursor-pointer" onClick={() => setShowGallery(true)}>
                <div className="relative overflow-hidden"><Image src={allImages[0]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="grid grid-rows-2 gap-2">
                  <div className="relative overflow-hidden"><Image src={allImages[1]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                  <div className="relative overflow-hidden"><Image src={allImages[2]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                </div>
              </div>
            ) : (
              // 5 or more images
              <div className="grid grid-cols-4 grid-rows-2 h-full gap-2 cursor-pointer" onClick={() => setShowGallery(true)}>
                <div className="col-span-2 row-span-2 relative overflow-hidden">
                  <Image src={allImages[0]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="relative overflow-hidden"><Image src={allImages[1]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="relative overflow-hidden"><Image src={allImages[2]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="relative overflow-hidden"><Image src={allImages[3]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
                <div className="relative overflow-hidden"><Image src={allImages[4]} alt={property.title} fill className="object-cover hover:scale-105 transition-transform duration-700" /></div>
              </div>
            )}

            {allImages.length > 0 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => setShowGallery(true)}
                  className="bg-white/90 backdrop-blur text-accent-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg border border-gray-200"
                >
                  <Maximize size={16} /> Show all {allImages.length} photos
                </button>
              </div>
            )}
          </div>

          {/* Key Info Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></span>
                <span className={`text-sm font-bold uppercase tracking-widest ${statusStyles.text}`}>
                  {property.status}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-medium text-gray-500 capitalize">
                  {property.type.toLowerCase()}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-syne text-accent-dark mb-2">
                {property.price
                  ? formatIndianPrice(property.price)
                  : `${formatIndianPrice(property.rentAmount)}/mo`}
              </h1>
              <div className="flex items-center text-gray-500 text-lg">
                <MapPin size={18} className="mr-2 text-gold" />
                {property.location}
              </div>
            </div>

            {/* Reactions Bar */}
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={async () => {
                  if (!liked) {
                    setLiked(true);
                    setProperty((prev) =>
                      prev
                        ? {
                            ...prev,
                            reactionsCount: (prev.reactionsCount || 0) + 1,
                          }
                        : prev,
                    );
                    handleConfetti();
                    if (property.id) {
                      await likeProperty(property.id);
                      window.dispatchEvent(new Event("likedPropertiesChanged"));
                    }
                  } else {
                    setLiked(false);
                    setProperty((prev) =>
                      prev
                        ? {
                            ...prev,
                            reactionsCount: Math.max(
                              0,
                              (prev.reactionsCount || 0) - 1,
                            ),
                          }
                        : prev,
                    );
                    if (property.id) {
                      await unlikeProperty(property.id);
                      window.dispatchEvent(new Event("likedPropertiesChanged"));
                    }
                  }
                }}
                className={`px-6 py-3 rounded-full border-2 transition-colors relative flex items-center gap-3 ${liked ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-200"}`}
              >
                <Heart
                  size={24}
                  className={
                    liked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }
                />
                <span
                  className={`text-lg font-bold ${liked ? "text-red-500" : "text-gray-500"}`}
                >
                  {property.reactionsCount || 0}
                </span>
              </motion.button>

              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={triggerFireReaction}
                  className={`p-4 rounded-full border-2 transition-colors group ${fired ? "border-orange-400 bg-orange-100" : "border-gray-200 hover:border-orange-300 bg-orange-50"}`}
                >
                  <Flame
                    size={24}
                    className={`transition-colors ${fired ? "fill-orange-500 text-orange-500" : "text-orange-500 group-hover:fill-orange-500"}`}
                  />
                  {fireCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {fireCount}
                    </span>
                  )}
                </motion.button>

                {/* Fire Animation Popup */}
                <AnimatePresence>
                  {showFireAnimation && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 1, y: 0, scale: 0.5, x: 0 }}
                          animate={{
                            opacity: 0,
                            y: -100 - i * 12,
                            x: (i - 2) * 18,
                            scale: 1.5,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="absolute text-2xl"
                        >
                          🔥
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              <button
                disabled={isSharing}
                onClick={async () => {
                  if (isSharing) return;
                  if (navigator.share) {
                    try {
                      setIsSharing(true);
                      await navigator.share({
                        title: property.title,
                        url: window.location.href,
                      });
                    } catch (err: unknown) {
                      const errorName =
                        err instanceof DOMException ? err.name : "";
                      if (errorName !== "AbortError") {
                        console.error("Share failed:", err);
                      }
                    } finally {
                      setIsSharing(false);
                    }
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                }}
                className={`p-4 rounded-full border-2 border-gray-200 hover:border-gold hover:text-gold text-gray-400 transition-colors ${isSharing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col items-center justify-center border-r border-gray-100">
              <Bed className="size-6 sm:size-7 text-gray-400 mb-2" />
              <span className="text-lg sm:text-2xl font-bold text-accent-dark">
                {property.bedrooms || 3}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                Beds
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-gray-100">
              <Bath className="size-6 sm:size-7 text-gray-400 mb-2" />
              <span className="text-lg sm:text-2xl font-bold text-accent-dark">
                {property.bathrooms || 2}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                Baths
              </span>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-gray-100">
              <Maximize className="size-6 sm:size-7 text-gray-400 mb-2" />
              <span className="text-lg sm:text-2xl font-bold text-accent-dark">
                {property.sqft || "-"}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                Sqft
              </span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Building className="size-6 sm:size-7 text-gray-400 mb-2" />
              <span className="text-lg sm:text-2xl font-bold text-accent-dark">
                {property.floorNumber ?? property.totalFloors ?? "-"}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest">
                Floors
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold font-syne text-accent-dark mb-4">
              About this home
            </h2>
            <div className={showFullDescription ? "" : "line-clamp-5"}>
              <p className="text-gray-600 leading-relaxed text-lg">
                {property.description}
              </p>
              <p className="text-gray-600 leading-relaxed text-lg mt-4">
                Experience the pinnacle of luxury living with this exquisite
                property. Featuring state-of-the-art amenities, premium
                finishes, and a location that offers both privacy and
                connectivity. Every corner is designed with meticulous
                attention to detail to ensure a lifestyle of comfort and
                grandeur.
              </p>
            </div>
            <button
              onClick={() => setShowFullDescription((prev) => !prev)}
              className="mt-3 text-gold font-semibold hover:underline transition-colors"
            >
              {showFullDescription ? "See less" : "See more"}
            </button>
          </div>

          {/* What this property offers — Airbnb-style */}
          <div>
            <h2 className="text-2xl font-bold font-syne text-accent-dark mb-6">
              What this property offers
            </h2>
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              {/* Built-in property details */}
              {property.sqft && (
                <div className="flex items-center gap-4">
                  <Maximize size={24} className="text-gray-500" />
                  <span className="text-gray-700">
                    Carpet Area: {property.sqft} sq.ft
                  </span>
                </div>
              )}
              {property.flooring && (
                <div className="flex items-center gap-4">
                  <Layers size={24} className="text-gray-500" />
                  <span className="text-gray-700">
                    {property.flooring} Flooring
                  </span>
                </div>
              )}
              {property.floorNumber !== undefined && (
                <div className="flex items-center gap-4">
                  <Building size={24} className="text-gray-500" />
                  <span className="text-gray-700">
                    Floor {property.floorNumber}
                    {property.totalFloors ? ` of ${property.totalFloors}` : ""}
                  </span>
                </div>
              )}
              {property.furnishingStatus && (
                <div className="flex items-center gap-4">
                  <Sofa size={24} className="text-gray-500" />
                  <span className="text-gray-700">
                    {property.furnishingStatus}
                  </span>
                </div>
              )}
              {property.availableFrom && (
                <div className="flex items-center gap-4">
                  <CalendarDays size={24} className="text-gray-500" />
                  <span className="text-gray-700">
                    Available: {property.availableFrom}
                  </span>
                </div>
              )}

              {/* Dynamic amenities from DB */}
              {property.amenities
                ?.split(",")
                .filter(Boolean)
                .slice(0, showAllAmenities ? undefined : 5)
                .map((amenity, i) => {
                  const trimmed = amenity.trim();
                  const Icon = getAmenityIcon(trimmed);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <Icon size={24} className="text-gray-500" />
                      <span className="text-gray-700">{trimmed}</span>
                    </div>
                  );
                })}
            </div>

            {/* Show all amenities button */}
            {property.amenities &&
              property.amenities.split(",").filter(Boolean).length > 5 &&
              !showAllAmenities && (
                <button
                  onClick={() => setShowAllAmenities(true)}
                  className="mt-6 px-6 py-3 border-2 border-accent-dark text-accent-dark rounded-lg font-semibold text-sm hover:bg-accent-dark hover:text-white transition-colors"
                >
                  Show all{" "}
                  {property.amenities.split(",").filter(Boolean).length}{" "}
                  amenities
                </button>
              )}
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <div className="mb-6">
              <h3 className="text-2xl font-bold font-syne text-accent-dark mb-2">
                {property.title}
              </h3>
            </div>

            {visitStatus === "success" ? (
              <div className="py-8 text-center text-green-600">
                <CheckCircle size={48} className="mx-auto mb-4 text-gold" />
                <h4 className="text-xl font-bold font-syne mb-2 text-accent-dark">Visit Requested!</h4>
                <p className="text-gray-500">Our team will contact you shortly.</p>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!visitForm.name.trim() || !visitForm.phone.trim()) return;
                  
                  const phone = visitForm.phone.replace(/\D/g, "");
                  const phoneRegex = /^[6-9]\d{9}$/;
                  if (!phoneRegex.test(phone)) {
                    alert("Please enter a valid 10-digit Indian mobile number.");
                    return;
                  }
                  if (!getVerifiedVisitPhoneE164()) {
                    alert("Please verify your phone number with OTP before booking a visit.");
                    return;
                  }
                  
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (visitForm.email && !emailRegex.test(visitForm.email)) {
                    alert("Please enter a valid email address.");
                    return;
                  }

                  setVisitStatus("submitting");
                  try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api.rupalihomes.com"}/site-visits`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        propertyId: property.id,
                        visitorName: visitForm.name,
                        visitorEmail: visitForm.email,
                        visitorPhone: phone,
                        message: visitForm.message
                      })
                    });
                    
                    if (res.ok) {
                      setVisitStatus("success");
                      setVisitForm({ name: "", email: "", phone: "", message: "" });
                      setVerifiedVisitPhone(null);
                      handleConfetti();
                      setTimeout(() => setVisitStatus("idle"), 5000);
                    } else {
                      const errData = await res.json();
                      alert(errData.message || "Failed to book visit");
                      setVisitStatus("error");
                    }
                  } catch {
                    alert("Something went wrong. Please try again.");
                    setVisitStatus("error");
                  }
                }}
              >
                <input
                  type="text"
                  required
                  value={visitForm.name}
                  onChange={(e) => setVisitForm({ ...visitForm, name: e.target.value })}
                  placeholder="Full Name *"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                />
                <input
                  type="email"
                  value={visitForm.email}
                  onChange={(e) => setVisitForm({ ...visitForm, email: e.target.value })}
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                />
                <input
                  type="tel"
                  required
                  value={visitForm.phone}
                  onChange={(e) => {
                    setVisitForm({ ...visitForm, phone: e.target.value });
                    setVerifiedVisitPhone(null);
                  }}
                  placeholder="Phone Number *"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                />
                <PhoneOtpVerifier
                  phone={visitForm.phone}
                  verifiedPhoneE164={getVerifiedVisitPhoneE164()}
                  recaptchaContainerId="buy-visit-phone-recaptcha"
                  disabled={visitStatus === "submitting"}
                  onVerified={setVerifiedVisitPhone}
                />
                <textarea
                  value={visitForm.message}
                  onChange={(e) => setVisitForm({ ...visitForm, message: e.target.value })}
                  placeholder="I am interested in this property..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-gold transition-colors h-32"
                ></textarea>

                <button
                  type="submit"
                  disabled={visitStatus === "submitting"}
                  className="w-full py-4 bg-accent-dark text-white rounded-xl font-bold text-lg hover:bg-gold transition-all duration-300 shadow-lg hover:shadow-gold/20 transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:-translate-y-0"
                >
                  {visitStatus === "submitting" ? "Submitting..." : "Book a Visit"}
                </button>
              </form>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              By submitting, you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Other Properties Carousel */}
      {otherProperties.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold font-syne text-accent-dark mb-8">
            Other Properties
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {otherProperties.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/buy/${p.id}`}
                className="min-w-[300px] max-w-[300px] snap-start group rounded-2xl overflow-hidden bg-white shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex-shrink-0"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold font-syne text-accent-dark group-hover:text-gold transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {p.location}
                  </p>
                  <p className="text-gold font-bold mt-2">
                    {p.price ? formatIndianPrice(p.price) : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold font-syne text-accent-dark mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className="text-lg font-semibold font-syne text-accent-dark">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showGallery && property && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
          >
            <X size={32} />
          </button>

          {(() => {
            const allImages = [
              property.imageUrl,
              ...(property.imageGallery
                ? property.imageGallery.split(",")
                : []),
            ].filter(Boolean) as string[];

            if (allImages.length === 0) return null;

            return (
              <div className="relative w-full max-w-5xl aspect-video flex items-center justify-center">
                {allImages.length > 1 && (
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? allImages.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 md:left-8 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <ChevronLeft size={32} />
                  </button>
                )}

                <Image
                  src={allImages[currentImageIndex]}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />

                {allImages.length > 1 && (
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === allImages.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 md:right-8 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={32} />
                  </button>
                )}

                <div className="absolute bottom-[-40px] left-0 right-0 text-center text-white/50 text-sm">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
