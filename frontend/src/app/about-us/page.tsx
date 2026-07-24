"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhyChooseUs from "@/components/WhyChooseUs";
import Image from "next/image";
import { Building2, FileCheck2, Landmark, ShieldCheck } from "lucide-react";

const credentials = [
  {
    icon: FileCheck2,
    title: "RERA documentation checks",
    copy: "Project recommendations are reviewed for RERA registration details, developer disclosures, and current project status.",
  },
  {
    icon: ShieldCheck,
    title: "Verified inventory process",
    copy: "Listings are checked for location, ownership context, pricing signals, and basic document readiness before advisory.",
  },
  {
    icon: Landmark,
    title: "Bankable deal guidance",
    copy: "Loan, registry, payment schedule, and possession checkpoints are explained before clients make a commitment.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-24 md:pt-32 pb-10 md:pb-20 px-4 sm:px-6 flex-grow">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 md:gap-12 items-center mb-10 md:mb-20">
            <div>
              <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">
                About Rupali Homes
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-syne text-accent-dark mb-4 md:mb-6 leading-tight">
                A trusted real estate advisory brand for serious property
                decisions
              </h1>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-5 md:mb-6">
                Rupali Homes helps buyers, sellers, investors, and tenants make
                clearer property decisions across high-demand micro-markets. The
                work is advisory-led: understand the client, verify the property
                context, compare the market, and then move with transparent next
                steps.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our team focuses on curated inventory, developer credibility,
                location fundamentals, RERA and document checks, and practical
                deal guidance so clients are not left navigating the market
                alone.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mt-10">
                {[
                  ["15+", "Years of market experience"],
                  ["500+", "Curated property options"],
                  ["1200+", "Client conversations handled"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
                  >
                    <p className="text-3xl font-bold font-syne text-accent-dark">
                      {value}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[320px] sm:h-[420px] md:h-[520px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Premium residential property represented by Rupali Homes"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-accent-dark">
                      Advisory before transaction
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Location, pricing, paperwork, and negotiation are reviewed
                      as one decision, not separate steps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {credentials.map((credential) => (
              <div
                key={credential.title}
                className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-5">
                  <credential.icon size={24} />
                </div>
                <h2 className="text-xl font-bold font-syne text-accent-dark mb-3">
                  {credential.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {credential.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
      <Footer />
    </main>
  );
}
