"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import type { Property } from "@/types";
import { brochureFilename } from "./presentation";
import styles from "./BrochureDownload.module.css";

export default function BrochureDownload({ property, className }: { property: Property; className: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <span className={styles.wrapper}>
    <a href={`/api/property-brochure/${property.id}`} download className={className} aria-disabled={busy || undefined} aria-busy={busy} onClick={async (event) => {
      event.preventDefault();
      if (busy) return;
      setBusy(true); setError("");
      try {
        const response = await fetch(`/api/property-brochure/${property.id}`);
        if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) throw new Error("Brochure unavailable");
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = brochureFilename(property);
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } catch {
        setError("Unable to download. Please try again.");
      } finally { setBusy(false); }
    }}>{busy ? <Loader2 className={styles.spinner} size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}{busy ? "Preparing brochure…" : "Download brochure"}</a>
    {error && <span role="alert" className={styles.error}>{error}</span>}
  </span>;
}
