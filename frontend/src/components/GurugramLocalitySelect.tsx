"use client";

import { gurugramLocalityGroups } from "@/lib/gurugram-localities";

export default function GurugramLocalitySelect({ value, onChange, id, className, label = "Preferred locality in Gurgaon / Gurugram" }: { value: string; onChange: (value: string) => void; id?: string; className?: string; label?: string }) {
  return <select id={id} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={className}>
    <option value="">All Gurgaon / Gurugram</option>
    {gurugramLocalityGroups.map((group) => <optgroup key={group.label} label={group.label}>{group.locations.map((location) => <option key={location} value={location}>{location}</option>)}</optgroup>)}
  </select>;
}
