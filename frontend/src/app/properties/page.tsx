"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyGridCard from "@/components/PropertyGridCard";
import { fetchProperties } from "@/lib/api";
import { Property, PropertyStatus } from "@/types";

const PAGE_SIZE = 12;

function PropertiesPageContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status")?.toUpperCase();
  const status = statusParam === "SOLD" || statusParam === "RENTED"
    ? statusParam as PropertyStatus
    : undefined;
  const [properties, setProperties] = useState<Property[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(0);
  }, [status]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProperties(page, PAGE_SIZE, { status })
      .then((data) => {
        if (!active) return;
        setProperties(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, status]);

  const heading = status === PropertyStatus.SOLD ? "Homes Sold" : status === PropertyStatus.RENTED ? "Properties Rented" : "All Properties";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <section className="pt-28 pb-10 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl md:text-5xl font-bold font-syne text-accent-dark">{heading}</h1>
        <p className="mt-3 text-gray-600">{totalElements} {totalElements === 1 ? "property" : "properties"} found</p>
      </section>
      <section className="px-4 sm:px-6 max-w-7xl mx-auto w-full grow pb-12">
        {loading ? (
          <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold" /></div>
        ) : properties.length === 0 ? (
          <p className="text-center text-gray-500 py-24">No properties found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {properties.map((property, index) => <PropertyGridCard key={property.id} property={property} index={index} />)}
          </div>
        )}
      </section>
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3 pb-12" aria-label="Property pages">
          <button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="px-4 py-2 rounded-full border disabled:opacity-40">Previous</button>
          <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((current) => current + 1)} className="px-4 py-2 rounded-full border disabled:opacity-40">Next</button>
        </nav>
      )}
      <Footer />
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <PropertiesPageContent />
    </Suspense>
  );
}
