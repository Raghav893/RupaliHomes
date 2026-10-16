"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, Instagram, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchLandingInstagramVideos } from "@/lib/api";
import { LandingInstagramVideo } from "@/types";

const INSTAGRAM_PROFILE_URL = "https://instagram.com/rupali_homes";
const INSTAGRAM_DM_URL = "https://ig.me/m/rupali_homes";

export default function InstagramReels() {
  const [videos, setVideos] = useState<LandingInstagramVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLandingInstagramVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  const moveSlider = (distance: number) => {
    sliderRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.38fr_0.62fr] lg:gap-12">
        <div className="relative flex flex-col justify-center rounded-3xl border border-white/25 bg-white/65 p-6 shadow-[0_20px_60px_-30px_rgba(20,30,50,0.35)] backdrop-blur-xl [-webkit-backdrop-filter:blur(20px)] sm:p-7">
          <div className="absolute right-5 top-5 flex h-32 w-32 items-center justify-center rounded-3xl border border-accent-dark/10 bg-white/70 p-5 shadow-sm sm:right-7 sm:top-7 sm:h-36 sm:w-36">
            <Image src="/logo_rupali.png" alt="Rupali Homes" width={144} height={144} className="h-full w-full object-contain" />
          </div>
          <p className="mb-3 pr-28 text-xs font-semibold uppercase tracking-[0.2em] text-gold">Rupali Homes</p>
          <h2 className="max-w-[18rem] pr-20 text-3xl font-bold font-syne leading-tight text-accent-dark md:text-4xl">
            Follow Us On <span className="text-gold">Instagram</span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-gray-600">
            Browse verified properties across India&apos;s top cities — handpicked for value, location, and potential.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 border-y border-accent-dark/10 py-5">
            <div>
              <p className="text-xl font-semibold text-accent-dark">5k+</p>
              <p className="mt-1 text-xs text-gray-500">Homes Sold</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-accent-dark">20k+</p>
              <p className="mt-1 text-xs text-gray-500">Properties Rented</p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={INSTAGRAM_PROFILE_URL} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-accent-dark/15 bg-white/60 px-5 py-2.5 text-sm font-medium text-accent-dark transition-colors hover:border-gold hover:bg-gold hover:text-white">
              <Instagram size={18} /> @rupali_homes
            </Link>
            <Link href={INSTAGRAM_DM_URL} target="_blank" className="inline-flex items-center gap-2 rounded-full border border-accent-dark bg-accent-dark px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-gold hover:bg-gold">
              <MessageCircle size={18} /> DM Us
            </Link>
          </div>
        </div>

        <div className="min-w-0 self-center">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Projects, walkthroughs, and site visits</p>
              <p className="mt-1 text-xl font-semibold text-accent-dark">Latest from our feed</p>
            </div>
            {videos.length > 1 && (
              <div className="flex shrink-0 gap-2">
                <button type="button" aria-label="Previous Instagram video" onClick={() => moveSlider(-320)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-accent-dark transition-colors hover:border-gold hover:bg-gold hover:text-white"><ChevronLeft size={18} /></button>
                <button type="button" aria-label="Next Instagram video" onClick={() => moveSlider(320)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-accent-dark transition-colors hover:border-gold hover:bg-gold hover:text-white"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex aspect-[9/16] max-h-[620px] min-h-[390px] items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-500 sm:aspect-auto sm:h-[560px]">Loading Instagram videos...</div>
          ) : videos.length > 0 ? (
            <div ref={sliderRef} className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4">
              {videos.map((video, index) => (
                <article key={`${video.id}-${index}`} className="relative aspect-[9/16] w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/20 bg-white/60 shadow-[0_20px_50px_-30px_rgba(20,30,50,0.4)] backdrop-blur-xl sm:w-[250px]">
                  <iframe src={`${video.embedUrl.replace(/\/+$/, "")}/embed/`} title={`Rupali Homes Instagram video ${index + 1}`} className="absolute inset-0 h-full w-full border-0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />
                  <Link href={video.videoUrl} target="_blank" className="absolute bottom-4 left-4 right-4 z-10 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-xs font-bold text-accent-dark backdrop-blur-sm transition-colors hover:bg-gold hover:text-white"><ExternalLink size={14} /> View on Instagram</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-8 text-center text-gray-500 backdrop-blur-md">Instagram videos will appear here soon.</div>
          )}
        </div>
      </div>
    </section>
  );
}
