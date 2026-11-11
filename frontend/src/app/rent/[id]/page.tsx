"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchProperties, fetchPropertyById } from "@/lib/api";
import { PropertyType, type Property } from "@/types";
import PropertyDetail, { PropertyDetailState } from "@/components/property/PropertyDetail";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [related, setRelated] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([fetchPropertyById(id), fetchProperties(0, 12, { type: PropertyType.RENT })]).then(([detail, other]) => {
      if (cancelled) return;
      setProperty(detail.status === "fulfilled" ? detail.value : null);
      setRelated(other.status === "fulfilled" ? other.value.content.filter((item) => String(item.id) !== id) : []);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);
  if (loading || !property) return <PropertyDetailState type="rent" loading={loading} />;
  return <PropertyDetail key={property.id} property={property} type="rent" related={related} />;
}