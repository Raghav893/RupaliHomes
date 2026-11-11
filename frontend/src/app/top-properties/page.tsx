"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyGridCard from "@/components/PropertyGridCard";
import GurugramLocalitySelect from "@/components/GurugramLocalitySelect";
import { fetchProperties } from "@/lib/api";
import { PropertyType, type Property } from "@/types";

export default function TopPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [locality, setLocality] = useState("");
  const [intent, setIntent] = useState("");
  const [newOnly, setNewOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    fetchProperties(page, 12, { topProperty: true, city: "Gurugram", location: locality || undefined, type: intent ? intent as PropertyType : undefined, tag: newOnly ? "Newly added" : undefined }, { signal: controller.signal, throwOnError: true })
      .then((data) => { if (!controller.signal.aborted) { setProperties(data.content.filter((property) => property.topProperty)); setTotalPages(data.totalPages); } })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, locality, intent, newOnly, retry]);

  return <><Navbar /><main className="min-h-screen pt-24 md:pt-36">
    <header className="border-b border-orange-100 bg-[#faf7f2]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 md:py-16">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-gold"><Star size={15} />The Rupali shortlist</p>
        <h1 className="text-4xl font-semibold tracking-tight text-accent-dark md:text-6xl">Top properties<span className="text-gold">.</span></h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500 md:text-base">Explore our selected homes and spaces across Gurgaon / Gurugram. Compare your favourites and find a property that fits your next move.</p>
      </div>
    </header>
    <section aria-label="Top property listings" className="mx-auto max-w-7xl px-5 py-8 sm:px-6 md:py-10">
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <GurugramLocalitySelect value={locality} onChange={(value) => { setLocality(value); setPage(0); }} className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm sm:w-60" />
        <select aria-label="Listing type" value={intent} onChange={(event) => { setIntent(event.target.value); setPage(0); }} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm"><option value="">Buy & rent</option><option value="SALE">For sale</option><option value="RENT">For rent</option></select>
        <label className="flex min-h-11 items-center gap-2 px-2 text-sm text-slate-600"><input type="checkbox" checked={newOnly} onChange={(event) => { setNewOnly(event.target.checked); setPage(0); }} className="size-4 accent-orange-600" />Newly added only</label>
        {(locality || intent || newOnly) && <button type="button" onClick={() => { setLocality(""); setIntent(""); setNewOnly(false); setPage(0); }} className="min-h-11 px-3 text-sm text-gold">Reset filters</button>}
      </div>
      {loading ? <div role="status" className="flex min-h-64 items-center justify-center gap-3 text-slate-500"><Loader2 className="animate-spin" size={20} />Loading top properties…</div> : error ? <div role="alert" className="rounded-2xl bg-white p-10 text-center"><p>We couldn’t load the properties.</p><button type="button" className="mt-4 min-h-11 rounded-lg bg-accent-dark px-5 text-sm text-white" onClick={() => setRetry(retry + 1)}>Try again</button></div> : properties.length ? <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{properties.map((property, index) => <PropertyGridCard key={property.id} property={property} index={index} />)}</div>
        {totalPages > 1 && <div className="mt-10 flex items-center justify-center gap-5"><button disabled={page === 0} onClick={() => setPage(page - 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Previous</button><span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span><button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Next</button></div>}
      </> : <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center"><Star className="mx-auto mb-4 text-orange-300" size={30} /><h2 className="text-xl font-semibold text-accent-dark">No top properties to show yet</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">Try another locality or explore all our available properties.</p><Link href="/buy" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-dark px-5 text-sm text-white">Explore properties<ArrowRight size={15} /></Link></div>}
    </section>
  </main><Footer /></>;
}
