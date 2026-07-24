"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  MessageSquare,
  LogOut,
  Pencil,
  Check,
  X,
  ArrowUpRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhoneOtpVerifier, { VerifiedPhone } from "@/components/PhoneOtpVerifier";
import { useAuth } from "@/context/AuthContext";
import { fetchLikedProperties } from "@/lib/api";
import { normalizeIndianPhoneNumber } from "@/lib/firebase";
import { formatIndianPrice } from "@/lib/utils";
import { Property } from "@/types";

type Tab = "saved" | "enquiries" | "profile";

export default function AccountPage() {
  const router = useRouter();
  const { user, ready, logout, updateProfile, enquiries } = useAuth();
  const [tab, setTab] = useState<Tab>("saved");
  const [saved, setSaved] = useState<Property[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Redirect unauthenticated visitors to login once hydration is done.
  useEffect(() => {
    if (ready && !user) router.replace("/account/login");
  }, [ready, user, router]);

  useEffect(() => {
    fetchLikedProperties().then((data) => {
      setSaved(data);
      setLoadingSaved(false);
    });
  }, []);

  if (!ready || !user) {
    return (
      <main className="bg-[#FDFCF8] min-h-screen">
        <Navbar />
        <div className="pt-24 md:pt-40 pb-24 md:pb-40 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold" />
        </div>
      </main>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Heart; count?: number }[] =
    [
      { id: "saved", label: "Saved Properties", icon: Heart, count: saved.length },
      {
        id: "enquiries",
        label: "Enquiry History",
        icon: MessageSquare,
        count: enquiries.length,
      },
      { id: "profile", label: "Profile", icon: User },
    ];

  return (
    <main className="bg-[#FDFCF8] min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-36 pb-10 px-6 bg-accent-dark text-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center text-2xl font-bold font-syne">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-syne">
                Hi, {user.name.split(" ")[0]}
              </h1>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 border border-white/20 px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium self-start sm:self-auto"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-gold text-accent-dark"
                  : "border-transparent text-gray-500 hover:text-accent-dark"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              {typeof t.count === "number" && (
                <span className="ml-1 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-12 min-h-[40vh]">
        {tab === "saved" && (
          <SavedProperties loading={loadingSaved} properties={saved} />
        )}
        {tab === "enquiries" && <EnquiryHistory enquiries={enquiries} />}
        {tab === "profile" && (
          <ProfilePanel
            name={user.name}
            email={user.email}
            phone={user.phone}
            phoneVerified={user.phoneVerified}
            phoneVerifiedAt={user.phoneVerifiedAt}
            createdAt={user.createdAt}
            onSave={updateProfile}
          />
        )}
      </section>

      <Footer />
    </main>
  );
}

function SavedProperties({
  loading,
  properties,
}: {
  loading: boolean;
  properties: Property[];
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }
  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="text-xl font-bold font-syne text-accent-dark mb-2">
          No saved properties yet
        </h2>
        <p className="text-gray-500 mb-6">
          Tap the heart on any property to save it to your account.
        </p>
        <Link
          href="/buy"
          className="inline-block px-7 py-3 bg-accent-dark text-white rounded-full font-semibold hover:bg-gold transition-colors"
        >
          Browse properties
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
      {properties.map((property, i) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:-translate-y-1 transition-all"
        >
          <Link
            href={
              property.type === "RENT"
                ? `/rent/${property.id}`
                : `/buy/${property.id}`
            }
          >
            <div className="relative h-52 bg-gray-100">
              {property.imageUrl ? (
                <Image
                  src={property.imageUrl}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-bold font-syne text-accent-dark group-hover:text-gold transition-colors line-clamp-1">
                  {property.title}
                </h3>
                <p className="text-gold font-bold text-sm whitespace-nowrap">
                  {property.type === "RENT" && property.rentAmount
                    ? `${formatIndianPrice(property.rentAmount)}/mo`
                    : property.price
                      ? formatIndianPrice(property.price)
                      : "On Request"}
                </p>
              </div>
              <p className="text-gray-500 text-sm mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                {property.location}
              </p>
              <span className="inline-flex items-center gap-1 text-accent-dark font-semibold text-sm group-hover:text-gold transition-colors">
                View details <ArrowUpRight size={15} />
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function EnquiryHistory({
  enquiries,
}: {
  enquiries: { id: string; type: string; subject: string; createdAt: string }[];
}) {
  if (enquiries.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare size={56} className="mx-auto text-gray-300 mb-5" />
        <h2 className="text-xl font-bold font-syne text-accent-dark mb-2">
          No enquiries yet
        </h2>
        <p className="text-gray-500">
          Enquiries you send while logged in will appear here so you can track
          them.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 max-w-3xl">
      {enquiries.map((e) => (
        <div
          key={e.id}
          className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wide font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">
                {e.type}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(e.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-accent-dark font-medium">{e.subject}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfilePanel({
  name,
  email,
  phone,
  phoneVerified,
  phoneVerifiedAt,
  createdAt,
  onSave,
}: {
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  createdAt: string;
  onSave: (data: {
    name?: string;
    phone?: string;
    phoneVerified?: boolean;
    phoneVerifiedAt?: string;
    firebaseUid?: string;
  }) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name, phone });
  const [verifiedPhone, setVerifiedPhone] = useState<VerifiedPhone | null>(null);
  const [error, setError] = useState("");

  const phoneChanged = draft.phone.replace(/\D/g, "") !== phone.replace(/\D/g, "");
  const verifiedPhoneE164 =
    verifiedPhone?.phoneE164 ||
    (!phoneChanged && phoneVerified ? safeNormalizePhone(phone) : undefined);

  const handleSave = () => {
    setError("");

    const nextName = draft.name.trim();
    const nextPhone = draft.phone.replace(/\D/g, "");

    if (!nextName) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(nextPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if ((phoneChanged || !phoneVerified) && !verifiedPhone) {
      setError("Please verify your phone number with OTP before saving.");
      return;
    }

    onSave({
      name: nextName,
      ...(phoneChanged || verifiedPhone
        ? {
            phone: verifiedPhone?.phone || nextPhone,
            phoneVerified: true,
            phoneVerifiedAt: new Date().toISOString(),
            firebaseUid: verifiedPhone?.firebaseUid,
          }
        : {}),
    });
    setEditing(false);
    setVerifiedPhone(null);
  };

  return (
    <div className="max-w-xl bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold font-syne text-accent-dark">
          Profile details
        </h2>
        {!editing ? (
          <button
            onClick={() => {
              setDraft({ name, phone });
              setError("");
              setVerifiedPhone(null);
              setEditing(true);
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark hover:text-gold transition-colors"
          >
            <Pencil size={15} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700"
            >
              <Check size={15} /> Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError("");
                setVerifiedPhone(null);
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-gray-600"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <ProfileField
          label="Full name"
          value={draft.name}
          display={name}
          editing={editing}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            Email
          </p>
          <p className="text-accent-dark">{email}</p>
        </div>
        <ProfileField
          label="Phone"
          value={draft.phone}
          display={
            phoneVerified
              ? `${phone} (verified)`
              : `${phone || "Not added"} (not verified)`
          }
          editing={editing}
          onChange={(v) => {
            setDraft((d) => ({ ...d, phone: v }));
            setVerifiedPhone(null);
          }}
        />
        {editing && (
          <PhoneOtpVerifier
            phone={draft.phone}
            verifiedPhoneE164={verifiedPhoneE164}
            recaptchaContainerId="profile-phone-recaptcha"
            onVerified={setVerifiedPhone}
          />
        )}
        {phoneVerifiedAt && !editing && (
          <p className="text-xs text-gray-400">
            Verified on{" "}
            {new Date(phoneVerifiedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
            Member since
          </p>
          <p className="text-accent-dark">
            {new Date(createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function safeNormalizePhone(phone: string) {
  try {
    return normalizeIndianPhoneNumber(phone);
  } catch {
    return "";
  }
}

function ProfileField({
  label,
  value,
  display,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  display: string;
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      {editing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-gray-800"
        />
      ) : (
        <p className="text-accent-dark">{display}</p>
      )}
    </div>
  );
}
