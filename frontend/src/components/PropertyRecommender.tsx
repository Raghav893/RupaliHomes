"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, House, Loader2, MapPin, RotateCcw, Sparkles, X } from "lucide-react";
import {
  getPropertyRecommendations,
  recommendationBudgets,
  recommendationSearchHref,
  supportsBedrooms,
  type RecommendationPreferences,
} from "@/lib/property-recommendations";
import { formatIndianPrice } from "@/lib/utils";
import type { Property } from "@/types";
import GurugramLocalitySelect from "@/components/GurugramLocalitySelect";

const propertyTypes = ["Apartment", "Villa", "Builder Floor", "Penthouse", "Plot", "Commercial"];
const priorities = [
  { value: "best-fit", label: "Best fit" },
  { value: "price", label: "Lower price" },
  { value: "space", label: "More space" },
] as const;
const fieldClass = "mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-accent-dark outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/15";
const focusClass = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2";

export default function PropertyRecommender() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<RecommendationPreferences>({
    intent: "buy", locality: "", budget: "", propertyType: "", bedrooms: "", priority: "best-fit",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [results, setResults] = useState<Property[]>([]);
  const [limited, setLimited] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);

  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    if (shouldFocus.current) contentRef.current?.focus();
  }, [step, status]);

  function update<K extends keyof RecommendationPreferences>(key: K, value: RecommendationPreferences[K]) {
    setPreferences((previous) => ({ ...previous, [key]: value }));
  }

  async function findRecommendations() {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    shouldFocus.current = true;
    setStatus("loading");
    try {
      const data = await getPropertyRecommendations(preferences, controller.signal);
      if (controller.signal.aborted) return;
      setResults(data.properties);
      setLimited(data.limited);
      setStatus("success");
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    shouldFocus.current = true;
    if (step < 2) setStep(step + 1);
    else void findRecommendations();
  }

  function editPreferences() {
    requestRef.current?.abort();
    shouldFocus.current = true;
    setStatus("idle");
    setStep(0);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      requestRef.current?.abort();
      if (status === "loading") setStatus("idle");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button type="button" className={`group flex min-h-16 w-full max-w-[320px] items-center gap-3 rounded-xl border border-orange-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-gold hover:shadow-md ${focusClass}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-gold"><Sparkles size={18} aria-hidden="true" /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-accent-dark">Property recommender</span>
            <span className="mt-0.5 block text-xs text-slate-500">Find a place that fits you</span>
          </span>
          <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-gold transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-accent-dark/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xl outline-none">
      <div className="relative border-b border-slate-100 px-5 py-5 sm:px-6">
        <Dialog.Close aria-label="Close property recommender" className={`absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-accent-dark ${focusClass}`}><X size={17} aria-hidden="true" /></Dialog.Close>
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
          <Sparkles size={14} aria-hidden="true" /> Property recommender
        </div>
        <Dialog.Title className="font-syne text-xl font-semibold tracking-tight text-accent-dark sm:text-2xl">
          Your kind of place. Let&apos;s find it.
        </Dialog.Title>
        <Dialog.Description className="mt-1.5 text-sm leading-relaxed text-slate-500">A few preferences. A shortlist that fits your life.</Dialog.Description>
      </div>

      <div ref={contentRef} tabIndex={-1} className="px-5 py-5 outline-none sm:px-6" aria-busy={status === "loading"}>
        {status === "idle" ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex items-center gap-3" aria-label={`Step ${step + 1} of 3: ${["Your plans", "Your budget", "Your priorities"][step]}`}>
              <span className="shrink-0 text-[11px] font-medium text-slate-500">0{step + 1} / 03</span>
              <div className="flex flex-1 gap-1.5" aria-hidden="true">
                {[0, 1, 2].map((index) => <span key={index} className={`h-1 flex-1 rounded-full transition-colors ${index <= step ? "bg-gold" : "bg-slate-100"}`} />)}
              </div>
              <span className="text-[11px] font-medium text-slate-500">{["Your plans", "Your budget", "Your priorities"][step]}</span>
            </div>

            <div className="min-h-44">
              {step === 0 && (
                <>
                  <fieldset>
                    <legend className="text-sm font-semibold text-accent-dark">What&apos;s your next move?</legend>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {(["buy", "rent"] as const).map((intent) => (
                        <label key={intent} className={`relative flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-4 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${preferences.intent === intent ? "border-gold bg-orange-50/70 text-accent-dark" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                          <input type="radio" name={`${id}-intent`} value={intent} checked={preferences.intent === intent} className="sr-only" onChange={() => {
                            setPreferences((previous) => ({
                              ...previous,
                              intent,
                              budget: "",
                              propertyType: intent === "rent" && !supportsBedrooms(previous.propertyType) ? "" : previous.propertyType,
                            }));
                          }} />
                          <House size={16} aria-hidden="true" /> {intent === "buy" ? "Buy a property" : "Rent a home"}
                          {preferences.intent === intent && <Check size={14} className="ml-auto shrink-0 text-gold" aria-hidden="true" />}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label htmlFor={`${id}-locality`} className="mt-5 block text-sm font-semibold text-accent-dark">Your preferred locality</label>
                  <p className="mt-1 text-xs text-slate-500">Find properties across Gurgaon / Gurugram.</p>
                  <GurugramLocalitySelect id={`${id}-locality`} className={fieldClass} value={preferences.locality} onChange={(value) => update("locality", value)} />
                </>
              )}

              {step === 1 && (
                <div className="grid gap-5">
                  <label className="block text-sm font-semibold text-accent-dark" htmlFor={`${id}-budget`}>
                    {preferences.intent === "rent" ? "Your monthly budget" : "Your comfortable budget"}
                    <select id={`${id}-budget`} required className={fieldClass} value={preferences.budget} onChange={(event) => update("budget", event.target.value)}>
                      <option value="" disabled>Choose a budget</option>
                      {recommendationBudgets[preferences.intent].map((budget) => <option key={budget.value} value={budget.value}>{budget.label}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-accent-dark" htmlFor={`${id}-type`}>
                    What kind of property?
                    <select id={`${id}-type`} className={fieldClass} value={preferences.propertyType} onChange={(event) => {
                      const propertyType = event.target.value;
                      setPreferences((previous) => ({ ...previous, propertyType, bedrooms: supportsBedrooms(propertyType) ? previous.bedrooms : "" }));
                    }}>
                      <option value="">I&apos;m open to suggestions</option>
                      {propertyTypes.filter((type) => preferences.intent === "buy" || !["Plot", "Commercial"].includes(type)).map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-5">
                  {supportsBedrooms(preferences.propertyType) && (
                    <label htmlFor={`${id}-bedrooms`} className="block text-sm font-semibold text-accent-dark">
                      How much room do you need?
                      <select id={`${id}-bedrooms`} className={fieldClass} value={preferences.bedrooms} onChange={(event) => update("bedrooms", event.target.value)}>
                        <option value="">Any configuration</option>
                        {[1, 2, 3, 4, 5].map((rooms) => <option key={rooms} value={rooms}>{rooms}+ bedrooms</option>)}
                      </select>
                    </label>
                  )}
                  <fieldset>
                    <legend className="text-sm font-semibold text-accent-dark">What matters most to you?</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {priorities.map((priority) => (
                        <label key={priority.value} className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-xs font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold ${preferences.priority === priority.value ? "border-gold bg-orange-50/70 text-accent-dark" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>
                          <input type="radio" name={`${id}-priority`} value={priority.value} checked={preferences.priority === priority.value} className="sr-only" onChange={() => update("priority", priority.value)} />
                          {priority.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4">
              {step > 0 ? <button type="button" onClick={() => { shouldFocus.current = true; setStep(step - 1); }} className={`flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-accent-dark ${focusClass}`}><ArrowLeft size={15} aria-hidden="true" /> Back</button> : <span className="text-[11px] text-slate-400">3 simple steps.<br />No sign-up needed.</span>}
              <button type="submit" className={`ml-auto flex min-h-12 items-center justify-center gap-3 rounded-xl bg-accent-dark px-5 text-sm font-semibold text-white transition hover:bg-gold ${focusClass}`}>
                {step === 2 ? "Find my matches" : "Continue"}
                {step === 2 ? <Sparkles size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
              </button>
            </div>
          </form>
        ) : status === "loading" ? (
          <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
            <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-orange-50 text-gold"><Loader2 size={25} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /></span>
            <h3 className="font-syne text-lg font-semibold text-accent-dark">Finding your kind of place…</h3>
            <p className="mt-2 text-sm text-slate-500">Checking available listings against your preferences.</p>
            <button type="button" onClick={editPreferences} className={`mt-5 rounded-lg px-2 py-2 text-xs font-medium text-slate-500 underline underline-offset-4 ${focusClass}`}>Edit preferences</button>
          </div>
        ) : status === "error" ? (
          <div role="alert" className="py-7 text-center">
            <h3 className="font-syne text-lg font-semibold text-accent-dark">We couldn&apos;t load your matches.</h3>
            <p className="mt-2 text-sm text-slate-500">Please try again. Your preferences are saved here.</p>
            <button type="button" onClick={() => void findRecommendations()} className={`mx-auto mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-accent-dark px-5 text-sm font-semibold text-white ${focusClass}`}><RotateCcw size={14} aria-hidden="true" /> Try again</button>
            <button type="button" onClick={editPreferences} className={`mt-3 rounded-lg px-2 py-2 text-xs text-slate-500 underline underline-offset-4 ${focusClass}`}>Edit preferences</button>
          </div>
        ) : (
          <div>
            <div role="status" className="mb-4">
              <h3 className="font-syne text-lg font-semibold text-accent-dark">{results.length ? "A few places you could call yours." : "Your match is still out there."}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{results.length ? `${results.length} ${results.length === 1 ? "match" : "matches"} for your preferences, ${preferences.priority === "space" ? "with larger spaces first" : preferences.priority === "price" ? "with lower prices first" : "ranked by home size and price"}.` : "No available listings match these preferences yet. Try another locality, a wider budget, or fewer bedrooms."}</p>
            </div>
            <div className="space-y-3">
              {results.map((property) => (
                <Link key={property.id} href={`/${preferences.intent}/${property.id}`} className={`group flex gap-3 rounded-xl border border-slate-100 p-2.5 transition hover:border-orange-200 hover:bg-orange-50/40 ${focusClass}`}>
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-300">
                    {property.imageUrl ? <Image src={property.imageUrl} alt={property.title} fill sizes="80px" className="object-cover" /> : <House size={26} aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="truncate text-sm font-semibold text-accent-dark">{property.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><MapPin size={11} className="shrink-0" aria-hidden="true" /><span className="truncate">{property.location || property.city}</span></p>
                    <p className="mt-1 text-[11px] text-slate-500">{[property.bedrooms ? `${property.bedrooms} BHK` : property.propertyCategory, property.sqft ? `${property.sqft.toLocaleString("en-IN")} sq ft` : null].filter(Boolean).join(" · ")}</p>
                    <p className="mt-1 text-sm font-bold text-gold">{formatIndianPrice(preferences.intent === "rent" ? property.rentAmount : property.price)}{preferences.intent === "rent" && property.rentAmount ? <span className="font-normal text-slate-500"> / mo</span> : null}</p>
                  </div>
                  <ArrowUpRight size={16} aria-hidden="true" className="mt-1 shrink-0 text-slate-400 transition group-hover:text-gold" />
                </Link>
              ))}
            </div>
            {limited && <p className="mt-3 text-[11px] text-slate-500">Shortlisted from the latest 150 matching listings. Explore the full list for more.</p>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={editPreferences} className={`flex min-h-11 items-center gap-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-accent-dark ${focusClass}`}><ArrowLeft size={14} aria-hidden="true" /> Edit preferences</button>
              <Link href={results.length ? recommendationSearchHref(preferences) : `/${preferences.intent}`} className={`flex min-h-11 items-center gap-2 rounded-xl bg-accent-dark px-4 text-xs font-semibold text-white transition hover:bg-gold ${focusClass}`}>{results.length ? "Explore all matches" : "Browse all properties"}<ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          </div>
        )}
      </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
