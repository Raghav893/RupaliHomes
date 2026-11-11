"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import PhoneOtpVerifier, { type VerifiedPhone } from "@/components/PhoneOtpVerifier";
import { normalizeIndianPhoneNumber } from "@/lib/firebase";
import { API_URL } from "@/lib/api";
import type { Property } from "@/types";
import styles from "./EnquiryForm.module.css";

export default function EnquiryForm({ property, type }: { property: Property; type: "buy" | "rent" }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<VerifiedPhone | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  function verifiedPhoneE164() {
    try {
      const normalized = normalizeIndianPhoneNumber(form.phone);
      return verifiedPhone?.phoneE164 === normalized ? normalized : undefined;
    } catch { return undefined; }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const phone = form.phone.replace(/\D/g, "");
    if (!form.name.trim() || !phone) { setError("Please enter your name and phone number."); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("Please enter a valid 10-digit Indian mobile number."); return; }
    if (!verifiedPhoneE164()) { setError("Please verify your phone number with OTP before booking a visit."); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Please enter a valid email address."); return; }

    // Preserve the existing route-specific handlers and the shared Firebase OTP flow.
    // The legacy rental page clears the verified form locally; the buy page posts a site visit.
    if (type === "rent") {
      void confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      setForm({ name: "", email: "", phone: "", message: "" });
      setVerifiedPhone(null);
      return;
    }
    setStatus("submitting");
    try {
      const response = await fetch(`${API_URL}/site-visits`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id, visitorName: form.name, visitorEmail: form.email, visitorPhone: phone, message: form.message }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to book visit");
      }
      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
      setVerifiedPhone(null);
      void confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      resetTimer.current = setTimeout(() => setStatus("idle"), 5000);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return <div className={styles.card}>
    <p className={styles.eyebrow}>LET’S FIND YOUR NEXT CHAPTER</p>
    <h3 className={styles.title}>Book a visit.</h3>
    <p className={styles.intro}>Experience {property.title.trim()} in person.</p>
    {status === "success" ? <div role="status" className={styles.success}><CheckCircle size={36} /><h4>Visit requested!</h4><p>Our team will contact you shortly.</p></div> : <form className={styles.form} onSubmit={submit} aria-label="Book a Visit" aria-busy={status === "submitting"}>
      <label htmlFor={`${type}-visit-name`}>Full name <span aria-hidden="true">*</span></label>
      <input id={`${type}-visit-name`} autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" />
      <label htmlFor={`${type}-visit-email`}>Email address</label>
      <input id={`${type}-visit-email`} type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
      <label htmlFor={`${type}-visit-phone`}>Phone number <span aria-hidden="true">*</span></label>
      <input id={`${type}-visit-phone`} type="tel" autoComplete="tel-national" required value={form.phone} onChange={(event) => { setForm({ ...form, phone: event.target.value }); setVerifiedPhone(null); }} placeholder="10-digit mobile number" />
      <div className={styles.otp}><PhoneOtpVerifier phone={form.phone} verifiedPhoneE164={verifiedPhoneE164()} recaptchaContainerId={`${type}-visit-phone-recaptcha`} disabled={status === "submitting"} onVerified={setVerifiedPhone} /></div>
      <label htmlFor={`${type}-visit-message`}>Your message</label>
      <textarea id={`${type}-visit-message`} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder={type === "rent" ? "I am interested in this rental property..." : "I am interested in this property..."} rows={3} />
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <button type="submit" className={styles.submit} disabled={status === "submitting"}>{status === "submitting" ? "Submitting..." : "Book a Visit"}</button>
    </form>}
    <p className={styles.privacy}><ShieldCheck size={14} aria-hidden="true" />By submitting, you agree to our Terms of Use and Privacy Policy.</p>
  </div>;
}
