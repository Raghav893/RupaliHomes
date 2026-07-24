import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import "./globals.css";
import { CompareProvider } from "@/context/CompareContext";
import { AuthProvider } from "@/context/AuthContext";
import CompareDrawer from "@/components/CompareDrawer";
import StickyCTA from "@/components/StickyCTA";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rupali Homes",
  description: "Premium Real Estate Consultancy",
  icons: {
    icon: "/logo_rupali.png",
    apple: "/logo_rupali.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${outfit.variable} antialiased bg-[#FDFCF8] text-[#1A1A1A] font-sans`}
      >
        <AuthProvider>
          <CompareProvider>
            {children}
            <CompareDrawer />
            {/* Always-available contact hub on every page (call / WhatsApp / enquire) */}
            <StickyCTA />
          </CompareProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
