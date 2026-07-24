"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Landmark,
  Percent,
  Calculator,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  Phone,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CONTACT, telHref, whatsappHref } from "@/lib/contact";

// ─── EMI math ────────────────────────────────────────────────────────────
// EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate, n = months.
function calcEmi(principal: number, annualRate: number, years: number) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 12 / 100;
  if (r === 0) return { emi: principal / n, totalInterest: 0, total: principal };
  const pow = Math.pow(1 + r, n);
  const emi = (principal * r * pow) / (pow - 1);
  const total = emi * n;
  return { emi, totalInterest: total - principal, total };
}

const INR = (n: number) =>
  "₹" +
  Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** Compact Indian formatting (Lac / Cr) for large amounts. */
function inrCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} Lac`;
  return INR(n);
}

const loanProducts = [
  {
    icon: Landmark,
    title: "Home Purchase Loan",
    rate: "8.35%",
    desc: "Finance ready-to-move and under-construction homes with tenures up to 30 years.",
  },
  {
    icon: FileText,
    title: "Balance Transfer",
    rate: "8.25%",
    desc: "Move your existing home loan to a lower rate and save big on total interest.",
  },
  {
    icon: Percent,
    title: "Loan Against Property",
    rate: "9.50%",
    desc: "Unlock the value of your residential or commercial property for any need.",
  },
  {
    icon: ShieldCheck,
    title: "Plot + Construction",
    rate: "8.60%",
    desc: "Buy a plot and fund construction under a single, convenient loan.",
  },
];

const partnerBanks = [
  { name: "HDFC", logo: "https://www.google.com/s2/favicons?domain=hdfcbank.com&sz=128" },
  { name: "SBI", logo: "https://www.google.com/s2/favicons?domain=sbi.co.in&sz=128" },
  { name: "ICICI", logo: "https://www.google.com/s2/favicons?domain=icicibank.com&sz=128" },
  { name: "Axis Bank", logo: "https://www.google.com/s2/favicons?domain=axisbank.com&sz=128" },
  { name: "Kotak", logo: "https://www.google.com/s2/favicons?domain=kotak.bank.in&sz=128" },
  { name: "LIC HFL", logo: "https://www.google.com/s2/favicons?domain=lichousing.com&sz=128" },
  { name: "Bajaj Finserv", logo: "https://www.google.com/s2/favicons?domain=bajajfinserv.in&sz=128" },
  { name: "PNB Housing", logo: "https://www.google.com/s2/favicons?domain=pnbhousing.com&sz=128" },
];

const eligibility = [
  { icon: Clock, label: "Age 21–65 years at loan maturity" },
  { icon: FileText, label: "Salaried or self-employed with income proof" },
  { icon: ShieldCheck, label: "Healthy credit score (700+ preferred)" },
  { icon: CheckCircle2, label: "Up to 90% of property value financed" },
];

export default function FinancePage() {
  const [amount, setAmount] = useState(7500000); // ₹75 Lac
  const [rate, setRate] = useState(8.35);
  const [years, setYears] = useState(20);

  const { emi, totalInterest, total } = useMemo(
    () => calcEmi(amount, rate, years),
    [amount, rate, years],
  );

  const principalPct = total > 0 ? (amount / total) * 100 : 0;

  return (
    <main className="bg-[#FDFCF8] min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 md:pt-40 pb-10 md:pb-20 px-4 sm:px-6 overflow-hidden bg-grid">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-8 md:w-12 h-px bg-gold"></div>
              <span className="text-[11px] md:text-sm font-semibold tracking-widest uppercase text-gold">
                Home Loans &amp; Finance
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold font-syne text-accent-dark leading-tight mb-4 md:mb-6">
              Home loans made <span className="text-gold">simple</span>.
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
              Compare rates, calculate your EMI, and get matched with the right
              lender — all with dedicated guidance from the Rupali Homes finance
              desk. No jargon, no hidden charges.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#emi-calculator"
                className="inline-flex items-center gap-2 bg-accent-dark text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-accent-dark/90 transition-colors"
              >
                <Calculator size={18} /> Calculate your EMI
              </a>
              <a
                href={whatsappHref(
                  "Hi Rupali Homes, I'd like help with a home loan.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-accent-dark/20 text-accent-dark font-semibold px-7 py-3.5 rounded-lg hover:bg-accent-dark/5 transition-colors"
              >
                Talk to a loan expert <ArrowRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EMI Calculator */}
      <section id="emi-calculator" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-syne text-accent-dark mb-4">
              EMI Calculator
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Estimate your monthly instalment instantly. Adjust the loan
              amount, interest rate, and tenure to plan your budget.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-stretch">
            {/* Controls */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8">
              <SliderRow
                label="Loan Amount"
                value={inrCompact(amount)}
                min={500000}
                max={50000000}
                step={100000}
                current={amount}
                onChange={setAmount}
              />
              <SliderRow
                label="Interest Rate (p.a.)"
                value={`${rate.toFixed(2)}%`}
                min={6}
                max={15}
                step={0.05}
                current={rate}
                onChange={setRate}
              />
              <SliderRow
                label="Tenure"
                value={`${years} ${years === 1 ? "year" : "years"}`}
                min={1}
                max={30}
                step={1}
                current={years}
                onChange={setYears}
              />
            </div>

            {/* Result */}
            <div className="bg-accent-dark text-white rounded-3xl shadow-xl p-8 flex flex-col justify-center">
              <p className="text-gray-400 uppercase tracking-widest text-xs mb-2">
                Your Monthly EMI
              </p>
              <p className="text-5xl font-bold font-syne text-gold mb-8">
                {INR(emi)}
              </p>

              {/* Principal vs interest bar */}
              <div className="h-3 w-full rounded-full overflow-hidden bg-white/10 mb-4 flex">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${principalPct}%` }}
                />
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${100 - principalPct}%` }}
                />
              </div>
              <div className="flex justify-between text-sm mb-8">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gold" /> Principal
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white/30" /> Interest
                </span>
              </div>

              <dl className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Principal amount</dt>
                  <dd className="font-semibold">{inrCompact(amount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Total interest</dt>
                  <dd className="font-semibold">{inrCompact(totalInterest)}</dd>
                </div>
                <div className="flex justify-between text-lg">
                  <dt className="text-gray-300">Total payable</dt>
                  <dd className="font-bold text-gold">{inrCompact(total)}</dd>
                </div>
              </dl>

              <a
                href={whatsappHref(
                  `Hi Rupali Homes, I used the EMI calculator (loan ${inrCompact(
                    amount,
                  )}, ${rate}% for ${years} yrs → EMI ${INR(
                    emi,
                  )}). Please help me proceed.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold-hover text-accent-dark font-bold py-3.5 rounded-lg transition-colors"
              >
                Get this loan <ArrowRight size={18} />
              </a>
              <p className="text-[11px] text-gray-500 mt-3 text-center">
                Indicative only. Final rate &amp; EMI are subject to lender
                approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loan products */}
      <section className="py-20 px-6 bg-[#FDF6F0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-syne text-accent-dark mb-4">
              Loan Products
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Whatever your goal, there&apos;s a financing option tailored for
              it. Rates start from as low as shown below.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanProducts.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-5">
                  <p.icon size={22} />
                </div>
                <h3 className="font-syne font-bold text-accent-dark text-lg mb-1">
                  {p.title}
                </h3>
                <p className="text-gold font-semibold text-sm mb-3">
                  from {p.rate} p.a.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-syne text-accent-dark mb-4">
              Am I eligible?
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Most applicants qualify. Here&apos;s what lenders typically look
              for — our team helps you put the strongest possible file forward.
            </p>
            <ul className="space-y-4">
              {eligibility.map((e) => (
                <li key={e.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-dark/5 text-accent-dark flex items-center justify-center shrink-0">
                    <e.icon size={18} />
                  </div>
                  <span className="text-gray-700">{e.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <h3 className="font-syne font-bold text-accent-dark text-xl mb-6">
              Our Lending Partners
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {partnerBanks.map((b) => (
                <div
                  key={b.name}
                  className="h-20 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-gray-600 text-center px-2"
                >
                  <img
                    src={b.logo}
                    alt={`${b.name} logo`}
                    className="h-7 max-w-[110px] object-contain"
                    loading="lazy"
                  />
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-accent-dark text-white p-6">
              <p className="font-syne font-bold mb-1">
                Free, no-obligation consultation
              </p>
              <p className="text-gray-400 text-sm mb-5">
                Speak with our finance desk and get a personalised loan plan.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 bg-gold hover:bg-gold-hover text-accent-dark font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  <Phone size={16} /> {CONTACT.phoneDisplay}
                </a>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  Enquire <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ─── Reusable labelled slider ────────────────────────────────────────────
function SliderRow({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <span className="font-syne font-bold text-accent-dark text-lg">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold cursor-pointer"
      />
    </div>
  );
}
