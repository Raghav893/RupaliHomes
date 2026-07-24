"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ExternalLink,
  Heart,
  Instagram,
  MessageCircle,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";

interface InstagramPost {
  id: string;
  image: string;
  permalink: string;
  likes?: number;
  comments?: number;
  caption?: string;
  mediaType?: string;
}

const INSTAGRAM_PROFILE_URL = "https://instagram.com/rupali_homes";
const INSTAGRAM_DM_URL = "https://ig.me/m/rupali_homes";

const InstagramReels = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/instagram", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Unable to load Instagram posts");
        }

        if (!Array.isArray(data.data) || data.data.length === 0) {
          throw new Error("No live Instagram posts were returned.");
        }

        setPosts(data.data);
      } catch (err) {
        setPosts([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Instagram posts",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const copiesCount = posts.length > 0 && posts.length < 4 ? 4 : 2;
  const displayPosts = posts.length > 0 ? Array(copiesCount).fill(posts).flat() : [];
  const shiftPercent = `-${100 / copiesCount}%`;

  return (
    <section className="py-14 md:py-24 bg-background overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-end gap-5 md:gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold font-syne mb-3 md:mb-4">
            Follow Us On <span className="text-gold">Instagram</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl">
            Live updates from Rupali Homes projects, walkthroughs, site visits,
            and property advisory conversations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            className="px-6 py-3 bg-white border border-gray-200 rounded-full text-accent-dark font-medium hover:bg-gold hover:text-white hover:border-gold transition-all flex items-center gap-2"
          >
            <Instagram size={20} />
            @rupali_homes
          </Link>
          <Link
            href={INSTAGRAM_DM_URL}
            target="_blank"
            className="px-6 py-3 bg-accent-dark border border-accent-dark rounded-full text-white font-medium hover:bg-gold hover:border-gold transition-all flex items-center gap-2"
          >
            <MessageCircle size={20} />
            DM Us
          </Link>
        </div>
      </div>

      {loading && (
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-[320px] rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-500">
            Loading live Instagram posts...
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 flex gap-4">
            <AlertCircle className="shrink-0 mt-1" size={22} />
            <div>
              <p className="font-bold text-accent-dark">
                Live Instagram feed unavailable
              </p>
              <p className="text-sm mt-1">{error}</p>
              <div className="flex flex-wrap gap-3 mt-4">
                <Link
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  className="text-sm font-semibold underline"
                >
                  Open Instagram profile
                </Link>
                <Link
                  href={INSTAGRAM_DM_URL}
                  target="_blank"
                  className="text-sm font-semibold underline"
                >
                  Send Instagram DM
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && displayPosts.length > 0 && (
        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none hidden md:block" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none hidden md:block" />

          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-6 px-6"
              animate={{
                x: ["0%", shiftPercent],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
            >
              {displayPosts.map((post, index) => (
                <article
                  key={`${post.id}-${index}`}
                  className="relative group shrink-0 w-[220px] sm:w-[280px] h-[390px] sm:h-[500px] rounded-2xl overflow-hidden bg-gray-100"
                >
                  <Image
                    src={post.image}
                    alt={post.caption || `Rupali Homes Instagram post ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

                  {post.mediaType === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50">
                        <Play fill="white" className="text-white ml-1" size={32} />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {post.caption && (
                      <p className="text-sm line-clamp-2 mb-4 text-white/90">
                        {post.caption}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 text-sm">
                        {typeof post.likes === "number" && post.likes > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Heart size={15} />
                            {post.likes}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Instagram size={16} />
                          Live post
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={post.permalink}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-accent-dark px-3 py-2 text-xs font-bold hover:bg-gold hover:text-white transition-colors"
                      >
                        <ExternalLink size={14} />
                        View Post
                      </Link>
                      <Link
                        href={INSTAGRAM_DM_URL}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-dark text-white px-3 py-2 text-xs font-bold hover:bg-gold transition-colors"
                      >
                        <MessageCircle size={14} />
                        DM Query
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InstagramReels;
