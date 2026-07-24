"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, Instagram, Phone, Mail, X } from "lucide-react";
import { useState } from "react";
import {
  CONTACT,
  telHref,
  whatsappHref,
  DEFAULT_WA_MESSAGE,
} from "@/lib/contact";

// Simple custom WhatsApp Icon SVG since lucide-react doesn't have a specific WhatsApp one
const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function StickyCTA() {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 overflow-hidden relative"
          >
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close contact menu"
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <h4 className="font-syne font-bold text-accent-dark mb-1 text-center">
              Talk to an Expert
            </h4>
            <p className="text-[11px] text-gray-500 text-center mb-4">
              We usually reply within minutes.
            </p>
            <div className="flex flex-col gap-2.5">
              {/* WhatsApp — one tap into a chat for business queries */}
              <a
                href={whatsappHref(DEFAULT_WA_MESSAGE)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-green-50 hover:bg-green-100 text-green-700 p-3 rounded-xl transition-colors font-medium"
              >
                <WhatsAppIcon size={20} />
                <span>
                  WhatsApp Chat
                  <span className="block text-[11px] font-normal text-green-600/80">
                    Instant business queries
                  </span>
                </span>
              </a>

              {/* Call */}
              <a
                href={telHref}
                className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-xl transition-colors font-medium"
              >
                <Phone size={20} />
                <span>
                  Call Us
                  <span className="block text-[11px] font-normal text-blue-600/80">
                    {CONTACT.phoneDisplay}
                  </span>
                </span>
              </a>

              {/* Enquire — routes to the site-wide contact section */}
              <Link
                href="/#contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 text-amber-700 p-3 rounded-xl transition-colors font-medium"
              >
                <Mail size={20} />
                <span>
                  Send an Enquiry
                  <span className="block text-[11px] font-normal text-amber-600/80">
                    Tell us your requirement
                  </span>
                </span>
              </Link>

              {/* Instagram */}
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-pink-50 hover:bg-pink-100 text-pink-600 p-3 rounded-xl transition-colors font-medium"
              >
                <Instagram size={20} />
                <span>
                  Instagram
                  <span className="block text-[11px] font-normal text-pink-500/80">
                    @{CONTACT.instagramHandle}
                  </span>
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Contact Rupali Homes"
        aria-expanded={isOpen}
        className="flex items-center gap-3 bg-accent-dark text-white p-4 rounded-full shadow-2xl border border-gold/20 backdrop-blur-sm group"
      >
        <div className="relative">
          {isOpen ? (
            <X size={24} className="text-gold" />
          ) : (
            <>
              <MessageSquareText size={24} className="text-gold" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-accent-dark animate-pulse"></span>
            </>
          )}
        </div>

        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: isHovered && !isOpen ? "auto" : 0,
            opacity: isHovered && !isOpen ? 1 : 0,
            paddingRight: isHovered && !isOpen ? "0.5rem" : 0,
          }}
          className="overflow-hidden whitespace-nowrap font-medium text-sm"
        >
          Consult an Expert
        </motion.span>
      </motion.button>
    </div>
  );
}
