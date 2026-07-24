// ─── Central business contact details ───────────────────────────────────
// Single source of truth for phone / WhatsApp / email / socials so the
// "always-available contact" surfaces (Navbar, StickyCTA, Footer, Finance)
// never drift out of sync. Update the numbers here once.

export const CONTACT = {
  // Digits only, with country code — used for tel:/wa.me links.
  phoneRaw: "919876543210",
  // Pretty display form.
  phoneDisplay: "+91 98765 43210",
  email: "info@rupalihomes.com",
  instagramHandle: "rupali_homes",
  instagramUrl: "https://instagram.com/rupali_homes",
  facebookUrl: "https://www.instagram.com/rupali_homes/",
  addressShort: "M3M Broadway, Sector 71, Gurugram, Haryana 122101",
} as const;

export const telHref = `tel:+${CONTACT.phoneRaw}`;

/** WhatsApp deep-link that opens a chat with an optional pre-filled message. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${CONTACT.phoneRaw}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const DEFAULT_WA_MESSAGE =
  "Hi Rupali Homes, I have a business query and would like to connect.";
