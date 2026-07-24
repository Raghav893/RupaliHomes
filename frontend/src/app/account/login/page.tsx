"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import PhoneOtpVerifier, { VerifiedPhone } from "@/components/PhoneOtpVerifier";
import { useAuth } from "@/context/AuthContext";
import { normalizeIndianPhoneNumber } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<VerifiedPhone | null>(null);

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setVerifiedPhone(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your name.");
      if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "")))
        return setError("Please enter a valid 10-digit mobile number.");
      if (verifiedPhone?.phoneE164 !== normalizeIndianPhoneNumber(form.phone)) {
        return setError("Please verify your phone number with OTP.");
      }
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setError("Please enter a valid email address.");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setSubmitting(true);
    const result =
      mode === "signup"
        ? await signup({
            name: form.name,
            email: form.email,
            phone: verifiedPhone!.phone,
            password: form.password,
            phoneVerified: true,
            firebaseUid: verifiedPhone!.firebaseUid,
          })
        : await login(form.email, form.password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }
    router.push("/account");
  };

  return (
    <main className="bg-[#FDFCF8] min-h-screen">
      <Navbar />
      <section className="pt-40 pb-24 px-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold font-syne text-accent-dark">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {mode === "login"
                ? "Sign in to view your saved properties and enquiries."
                : "Save properties, track enquiries, and get personalised help."}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setVerifiedPhone(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-white text-accent-dark shadow-sm"
                    : "text-gray-500"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field
                icon={User}
                name="name"
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={update}
              />
            )}
            <Field
              icon={Mail}
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={update}
            />
            {mode === "signup" && (
              <div className="space-y-3">
                <Field
                  icon={Phone}
                  name="phone"
                  type="tel"
                  placeholder="Mobile number"
                  value={form.phone}
                  onChange={update}
                />
                <PhoneOtpVerifier
                  phone={form.phone}
                  verifiedPhoneE164={verifiedPhone?.phoneE164}
                  recaptchaContainerId="signup-phone-recaptcha"
                  disabled={submitting}
                  onVerified={setVerifiedPhone}
                />
              </div>
            )}
            <Field
              icon={Lock}
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={update}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-dark text-white font-semibold py-3.5 rounded-lg flex items-center justify-center gap-2 hover:bg-accent-dark/90 transition-colors disabled:opacity-60"
            >
              {mode === "login" ? "Log In" : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setVerifiedPhone(null);
                }}
                  className="text-gold font-semibold hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                onClick={() => {
                  setMode("login");
                  setError("");
                  setVerifiedPhone(null);
                }}
                  className="text-gold font-semibold hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link href="/" className="hover:text-gold">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function Field({
  icon: Icon,
  ...props
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        {...props}
        required
        className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all text-gray-800 text-sm"
      />
    </div>
  );
}
