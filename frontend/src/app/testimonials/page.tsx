"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  Play,
  Youtube,
  Instagram,
  Building2,
  Users,
  ExternalLink,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle,
  MessageSquareHeart,
  Home,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { fetchPublicTestimonials } from "@/lib/api";
import { Testimonial } from "@/types";

// Global script loader helper for Instagram embed.js to ensure it is loaded only once
let instagramScriptLoading = false;
let instagramScriptLoaded = false;

function loadInstagramScript(callback?: () => void) {
  if (typeof window === "undefined") return;

  if (window.instgrm) {
    if (callback) callback();
    return;
  }

  if (instagramScriptLoaded) {
    if (callback) callback();
    return;
  }

  if (instagramScriptLoading) {
    const checkInterval = setInterval(() => {
      if (window.instgrm) {
        clearInterval(checkInterval);
        if (callback) callback();
      }
    }, 100);
    return;
  }

  instagramScriptLoading = true;
  const script = document.createElement("script");
  // Always load Instagram's embed script over HTTPS. A protocol-relative URL
  // resolves to HTTP on the local development page and can prevent the cover
  // iframe from initializing correctly.
  script.src = "https://www.instagram.com/embed.js";
  script.async = true;
  script.defer = true;
  script.onload = () => {
    instagramScriptLoaded = true;
    instagramScriptLoading = false;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
    if (callback) callback();
  };
  script.onerror = () => {
    instagramScriptLoading = false;
  };
  document.body.appendChild(script);
}

// Declaring global interface for window.instgrm
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

// ─── Lazy-Loaded YouTube Embed Component ─────────────────────────────────────
function YouTubeVideoCard({ testimonial }: { testimonial: Testimonial }) {
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const embedId = testimonial.embedId;
  const thumbnailUrl =
    testimonial.thumbnailUrl ||
    (embedId ? `https://img.youtube.com/vi/${embedId}/hqdefault.jpg` : "");

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gray-900"
      style={{ aspectRatio: "9 / 16" }}
    >
      {!isPlaying ? (
        <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
          {thumbnailUrl && !hasError ? (
            <Image
              src={thumbnailUrl}
              alt={testimonial.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setHasError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
              <Youtube size={36} className="text-red-500 mb-2" />
              <span className="text-xs text-gray-400">Watch Video Walkthrough</span>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:bg-black/30 transition-colors" />

          {/* YouTube Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg shadow-red-900/40 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
              <Play size={24} className="fill-white translate-x-0.5" />
            </div>
          </div>

          {/* YouTube Brand Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10">
            <Youtube size={14} className="text-red-500" />
            <span>YouTube Walkthrough</span>
          </div>
        </div>
      ) : embedId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${embedId}?autoplay=1&rel=0`}
          title={testimonial.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-300 p-6 text-center">
          <AlertCircle size={28} className="text-amber-400 mb-2" />
          <p className="text-sm font-medium">Video player could not load</p>
          <a
            href={testimonial.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 text-xs text-gold underline flex items-center gap-1 hover:text-white"
          >
            Watch directly on YouTube <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Lazy-Loaded Instagram Embed Component ────────────────────────────────────
function InstagramPostCard({ testimonial }: { testimonial: Testimonial }) {
  const [isInView, setIsInView] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadFallback, setLoadFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;

    loadInstagramScript(() => {
      setScriptLoaded(true);
    });

    // If Instagram embed takes too long to render (e.g. adblocker or slow connection), enable fallback card
    const timer = setTimeout(() => {
      setLoadFallback(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isInView]);

  // The script can load before React has committed the blockquote. Process on
  // the next frame after the embed is mounted so Instagram can size its iframe
  // from the actual DOM instead of the placeholder dimensions.
  useEffect(() => {
    if (!isInView || !scriptLoaded || !containerRef.current || !window.instgrm) return;

    const frame = window.requestAnimationFrame(() => {
      try {
        window.instgrm?.Embeds.process();
      } catch {
        // Instagram may not be ready on the first frame; the script's own
        // loader will retry when it finishes initializing.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isInView, scriptLoaded, testimonial.videoUrl]);

  const cleanUrl = testimonial.videoUrl.split("?")[0].replace(/\/+$/, "") + "/";

  return (
    <div
      ref={containerRef}
      className="relative flex w-full justify-center overflow-visible rounded-2xl border border-white/20 bg-white/60 p-2 sm:p-3 backdrop-blur-lg [-webkit-backdrop-filter:blur(16px)]"
      style={{ aspectRatio: "9 / 16", minHeight: 0 }}
    >
      {isInView ? (
        <div className="w-full max-w-[380px] flex flex-col items-center">
          <iframe
            src={`${cleanUrl}embed/`}
            title={testimonial.title}
            className="w-full max-w-[380px] self-stretch rounded-xl border-0 bg-white"
            style={{ aspectRatio: "9 / 16", minHeight: 0 }}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />

          {loadFallback && (
            <div className="mt-3 text-center">
              <a
                href={testimonial.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-accent-dark/15 bg-white/50 px-3 py-1.5 text-xs font-medium text-accent-dark transition-colors hover:bg-white/80"
              >
                <Instagram size={13} /> Open in Instagram App <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-white/15 bg-accent-dark/80 p-6 text-center text-gray-300 backdrop-blur-lg">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-gray-200 animate-pulse">
            <Instagram size={24} />
          </div>
          <span className="text-xs">Loading Instagram story...</span>
        </div>
      )}
    </div>
  );
}

// ─── Testimonial Item Card ───────────────────────────────────────────────────
function TestimonialCard({ item }: { item: Testimonial }) {
  const isYouTube = item.videoPlatform?.toUpperCase() === "YOUTUBE";

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="group flex h-full flex-col overflow-visible rounded-3xl border border-white/25 bg-white/70 shadow-[0_20px_60px_-30px_rgba(20,30,50,0.35)] backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)] transition-all duration-300 hover:border-white/40 hover:bg-white/80"
    >
      {/* Video Container */}
      <div className="relative">
        {isYouTube ? (
          <YouTubeVideoCard testimonial={item} />
        ) : (
          <InstagramPostCard testimonial={item} />
        )}
      </div>

      {/* Testimonial Information */}
      <div className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
        <div className="space-y-3">
          {/* Header Row: Family Name & Platform Badge */}
          <div className="flex items-center justify-between gap-2">
            {item.familyName ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-dark/10 bg-accent-dark/5 px-3 py-1 text-xs font-medium text-accent-dark">
                <Heart size={12} className="text-gold" />
                {item.familyName}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-dark/10 bg-accent-dark/5 px-3 py-1 text-xs font-medium text-accent-dark">
                <Users size={12} className="text-gray-500" /> Verified Family
              </div>
            )}

            {isYouTube ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <Youtube size={14} /> YouTube
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                <Instagram size={14} /> Instagram
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-accent-dark group-hover:text-gold transition-colors leading-snug sm:text-xl">
            {item.title}
          </h3>

          {/* Description / Quote */}
          {item.description && (
            <p className="text-sm leading-relaxed italic text-gray-600 relative">
              &quot;{item.description}&quot;
            </p>
          )}
        </div>

        {/* Footer info: Property reference & verified label */}
        <div className="flex items-center justify-between gap-2 border-t border-accent-dark/10 pt-4 text-xs text-gray-500">
          {item.propertyReference ? (
            <div className="flex items-center gap-1.5 font-medium text-accent-dark truncate">
              <Building2 size={14} className="text-gold shrink-0" />
              <span className="truncate">{item.propertyReference}</span>
            </div>
          ) : (
              <span className="flex items-center gap-1 text-gray-400">
              <CheckCircle2 size={13} className="text-gold" /> Verified Homeowner
            </span>
          )}

          <a
            href={item.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent-dark/15 bg-white/40 px-3 py-1.5 font-medium text-accent-dark transition-colors hover:bg-white/80"
          >
            Original Link <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// ─── Main Testimonials Page ───────────────────────────────────────────────────
export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "YOUTUBE" | "INSTAGRAM">("ALL");

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await fetchPublicTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTestimonials();
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "ALL") return testimonials;
    return testimonials.filter((t) => t.videoPlatform?.toUpperCase() === selectedFilter);
  }, [testimonials, selectedFilter]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 md:pt-48 pb-12 md:pb-20 px-4 sm:px-6 bg-accent-dark text-white relative overflow-hidden">
        {/* Background Subtle Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Trust Counter Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gold text-xs sm:text-sm font-semibold mb-6 shadow-inner"
          >
            <Sparkles size={15} />
            <span>15,000+ Happy Families & Homeowners</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold font-syne mb-4 md:mb-6"
          >
            Family <span className="text-gold">Stories & Reviews</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto font-outfit mb-8 leading-relaxed"
          >
            Watch real video walkthroughs, client celebrations, and heartfelt feedback from families
            who discovered their dream home with Rupali Homes.
          </motion.p>

          {/* Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                selectedFilter === "ALL"
                  ? "bg-gold text-accent-dark shadow-lg shadow-gold/20"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
              }`}
            >
              All Stories ({testimonials.length})
            </button>
            <button
              onClick={() => setSelectedFilter("YOUTUBE")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedFilter === "YOUTUBE"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
              }`}
            >
              <Youtube size={16} /> YouTube Walkthroughs
            </button>
            <button
              onClick={() => setSelectedFilter("INSTAGRAM")}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedFilter === "INSTAGRAM"
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
              }`}
            >
              <Instagram size={16} /> Instagram Reels
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Showcase Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1">
        {loading ? (
          <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="w-full aspect-video bg-gray-200 rounded-2xl" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4" />
                <div className="h-4 bg-gray-100 rounded-md w-full" />
                <div className="h-4 bg-gray-100 rounded-md w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center mx-auto mb-4">
              <MessageSquareHeart size={32} />
            </div>
            <h3 className="text-2xl font-bold font-syne text-accent-dark mb-2">
              Stories Coming Soon!
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              We are currently curating and recording new video experiences and walkthroughs with our
              delighted homeowners. Check back soon or browse our curated properties.
            </p>
            <Link
              href="/buy"
              className="inline-flex items-center gap-2 bg-accent-dark text-white font-bold py-3 px-6 rounded-full hover:bg-gold transition-colors text-sm shadow-md"
            >
              <Home size={16} /> Explore Verified Homes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((testimonial) => (
              <TestimonialCard key={testimonial.id} item={testimonial} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action Banner */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-accent-dark via-gray-900 to-accent-dark text-white text-center px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold font-syne">
            Ready to Begin Your <span className="text-gold">Home Journey?</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto">
            Join over 15,000 happy families who trusted Rupali Homes for verified properties and
            transparent guidance.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/buy"
              className="px-7 py-3 rounded-full bg-gold text-accent-dark font-bold hover:bg-yellow-500 transition-all text-sm shadow-lg shadow-gold/20"
            >
              Browse Properties
            </Link>
            <Link
              href="/#contact"
              className="px-7 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all text-sm"
            >
              Contact Our Advisors
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
