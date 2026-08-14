"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Instagram, Facebook, Heart, User } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { fetchLikedPropertyIds } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);

    fetchLikedPropertyIds().then((ids) => {
      setLikedCount(ids.length);
    });

    // Listen for custom event when a property is liked/unliked
    const handler = () => {
      fetchLikedPropertyIds().then((ids) => {
        setLikedCount(ids.length);
      });
    };
    window.addEventListener("likedPropertiesChanged", handler);
    return () => window.removeEventListener("likedPropertiesChanged", handler);
  }, []);

  const navVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 bg-white shadow-sm py-2.5 md:py-4`}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link
          href="/"
          className="relative h-14 w-56 md:h-20 md:w-80 overflow-hidden transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo_rupali.png"
            alt="Rupali Homes"
            fill
            className="-translate-x-5 object-cover object-center md:-translate-x-8"
            priority
          />
        </Link>

        <div className={`hidden md:flex items-center gap-8 text-gray-800`}>
          <Link
            href="/buy"
            className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            Buy
          </Link>
          <Link
            href="/rent"
            className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            Rent
          </Link>
          <Link
            href="/sell"
            className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            Sell
          </Link>

          <Link
            href="/finance"
            className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            Home Loans
          </Link>

          <Link
            href="/blogs"
            className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
          >
            Blogs
          </Link>

          {/* Heart icon for liked properties — badge always shows a live
              count (including "0") so it never looks broken. */}
          <Link
            href="/liked"
            aria-label={`Wishlist (${likedCount} saved)`}
            className="relative p-2 rounded-full hover:bg-red-50 transition-colors group"
          >
            <Heart
              size={22}
              className={`transition-colors ${
                likedCount > 0
                  ? "text-red-500 fill-red-500"
                  : "text-gray-500 group-hover:text-red-500"
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center transition-colors ${
                likedCount > 0
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {isClient ? likedCount : 0}
            </span>
          </Link>

          {/* Account: avatar when signed in, otherwise a login entry point */}
          {isClient && user ? (
            <Link
              href="/account"
              aria-label="My account"
              className="flex items-center gap-2 pl-1"
            >
              <span className="w-9 h-9 rounded-full bg-accent-dark text-gold flex items-center justify-center text-sm font-bold font-syne hover:opacity-90 transition-opacity">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              href="/account/login"
              className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-gold transition-colors font-medium"
            >
              <User size={18} />
              <span className="hidden lg:inline">Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden text-accent-dark`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
          {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 bg-accent-dark z-40 flex flex-col items-center justify-center space-y-5"
          >
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Home
            </Link>
            <Link
              href="/buy"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Buy
            </Link>
            <Link
              href="/rent"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Rent
            </Link>
            <Link
              href="/sell"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Sell
            </Link>
            <Link
              href="/finance"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Home Loans
            </Link>
            <Link
              href="/blogs"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold"
            >
              Blogs
            </Link>

            <Link
              href="/liked"
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold flex items-center gap-3"
            >
              <Heart size={24} className="text-red-400" />
              Liked ({isClient ? likedCount : 0})
            </Link>

            <Link
              href={isClient && user ? "/account" : "/account/login"}
              onClick={() => setIsOpen(false)}
              className="text-xl text-white font-syne hover:text-gold flex items-center gap-3"
            >
              <User size={24} className="text-gold" />
              {isClient && user ? "My Account" : "Login / Sign Up"}
            </Link>

            <div className="flex gap-5 mt-5">
              <Link
                href="https://instagram.com"
                target="_blank"
                className="p-3 bg-white/10 rounded-full hover:bg-gold transition-colors"
              >
                <Instagram className="text-white" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                className="p-3 bg-white/10 rounded-full hover:bg-gold transition-colors"
              >
                <Facebook className="text-white" />
              </Link>
              <a
                href="tel:+919876543210"
                className="p-3 bg-white/10 rounded-full hover:bg-gold transition-colors"
              >
                <Phone className="text-white" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
