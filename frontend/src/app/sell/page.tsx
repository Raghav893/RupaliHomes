"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Camera,
  Home,
  IndianRupee,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { submitInquiry } from "../../lib/api";
import PhoneOtpVerifier, { VerifiedPhone } from "@/components/PhoneOtpVerifier";
import { normalizeIndianPhoneNumber } from "@/lib/firebase";

type Status = "idle" | "submitting" | "success";

const initialFormData = {
  name: "",
  phone: "",
  city: "",
  exactAddress: "",
  propertyType: "",
  configuration: "",
  size: "",
  expectedPrice: "",
  description: "",
};

async function uploadValuationPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "valuations");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.error || "Photo upload failed");
  }

  const data = await res.json();
  return data.url;
}

function buildValuationMessage(
  formData: typeof initialFormData,
  photoUrls: string[],
) {
  const lines = [
    "Property valuation request",
    `Exact address: ${formData.exactAddress}`,
    `Configuration: ${formData.configuration || "Not specified"}`,
    `Approx. size: ${formData.size || "Not specified"}`,
    `Expected price: ${formData.expectedPrice || "Not specified"}`,
    `Notes: ${formData.description || "Not provided"}`,
  ];

  if (photoUrls.length > 0) {
    lines.push("Uploaded photos:");
    photoUrls.forEach((url, index) => lines.push(`${index + 1}. ${url}`));
  }

  return lines.join("\n");
}

export default function SellPropertyPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [formData, setFormData] = useState(initialFormData);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<VerifiedPhone | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setVerifiedPhone(null);
    }
    setError("");
  };

  const getVerifiedPhoneE164 = () => {
    try {
      const enteredPhone = normalizeIndianPhoneNumber(formData.phone);
      return verifiedPhone?.phoneE164 === enteredPhone ? enteredPhone : undefined;
    } catch {
      return undefined;
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const oversizedFile = imageFiles.find((file) => file.size > 10 * 1024 * 1024);

    if (oversizedFile) {
      setError("Each photo must be 10 MB or smaller.");
      e.target.value = "";
      return;
    }

    if (imageFiles.length !== files.length) {
      setError("Only image files can be uploaded.");
    }

    setPhotoFiles((prev) => [...prev, ...imageFiles].slice(0, 8));
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phone = formData.phone.replace(/\D/g, "");
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!getVerifiedPhoneE164()) {
      setError("Please verify your mobile number with OTP before submitting.");
      return;
    }

    if (!formData.exactAddress.trim()) {
      setError("Please enter the full property address for an accurate valuation.");
      return;
    }

    setStatus("submitting");

    try {
      const photoUrls =
        photoFiles.length > 0
          ? await Promise.all(photoFiles.map(uploadValuationPhoto))
          : [];

      const success = await submitInquiry({
        name: formData.name.trim(),
        phone,
        type: "SELL_VALUATION",
        city: formData.city,
        propertyType: formData.propertyType,
        message: buildValuationMessage(formData, photoUrls),
      });

      if (!success) {
        throw new Error("Something went wrong. Please try again.");
      }

      setStatus("success");
      setFormData(initialFormData);
      setPhotoFiles([]);
      setVerifiedPhone(null);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 pt-24 md:pt-32 pb-12 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
          <div>
            <span className="text-gold font-bold tracking-widest uppercase text-sm mb-4 block">
              What&apos;s My Property Worth?
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-syne text-accent-dark leading-tight mb-4 md:mb-6">
              Get a sharper valuation before you{" "}
              <span className="text-gold">sell</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-7 md:mb-10 leading-relaxed">
              Share the exact address, property details, and recent photos. Our
              advisors review location, condition, demand, and comparable deals
              before recommending a practical market range.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark text-xl mb-1">
                    Market-led estimate
                  </h3>
                  <p className="text-gray-500">
                    Pricing is reviewed against active demand, locality trends,
                    unit condition, and nearby transaction benchmarks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Camera className="text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark text-xl mb-1">
                    Photo-assisted review
                  </h3>
                  <p className="text-gray-500">
                    Upload property and surroundings photos so the team can
                    assess finish, frontage, access, and maintenance quality.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-gold" />
                </div>
                <div>
                  <h3 className="font-bold text-accent-dark text-xl mb-1">
                    Verified buyer readiness
                  </h3>
                  <p className="text-gray-500">
                    Once the range is aligned, your property can be matched with
                    relevant buyers from our advisory pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full z-0" />

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 relative z-10"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-3xl font-bold font-syne text-accent-dark mb-4">
                  Valuation Request Received
                </h3>
                <p className="text-gray-600 text-lg">
                  Our property advisory team will review your details and
                  contact you with next steps within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 text-gold font-bold hover:underline"
                >
                  Submit another property
                </button>
              </motion.div>
            ) : (
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold font-syne text-accent-dark mb-2">
                    Free Property Valuation
                  </h2>
                  <p className="text-gray-500">
                    Include the exact address and photos for a better estimate.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Rahul Sharma"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          required
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                      <PhoneOtpVerifier
                        phone={formData.phone}
                        verifiedPhoneE164={getVerifiedPhoneE164()}
                        recaptchaContainerId="sell-phone-recaptcha"
                        disabled={status === "submitting"}
                        onVerified={setVerifiedPhone}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        City *
                      </label>
                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <select
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select City</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Gurgaon">Gurgaon</option>
                          <option value="Noida">Noida</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Pune">Pune</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Property Type *
                      </label>
                      <div className="relative">
                        <Building
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <select
                          required
                          name="propertyType"
                          value={formData.propertyType}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Type</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Builder Floor">Builder Floor</option>
                          <option value="Villa">Villa</option>
                          <option value="Plot">Plot</option>
                          <option value="Commercial">Commercial</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Exact Address *
                    </label>
                    <div className="relative">
                      <Home
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        required
                        type="text"
                        name="exactAddress"
                        value={formData.exactAddress}
                        onChange={handleChange}
                        placeholder="Tower, unit, street, sector, landmark"
                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Configuration
                      </label>
                      <select
                        name="configuration"
                        value={formData.configuration}
                        onChange={handleChange}
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option value="1 BHK">1 BHK</option>
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="5+ BHK">5+ BHK</option>
                        <option value="Plot">Plot</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Approx. Size
                      </label>
                      <div className="relative">
                        <Ruler
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          placeholder="1800 sq.ft"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Expected Price
                      </label>
                      <div className="relative">
                        <IndianRupee
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          name="expectedPrice"
                          value={formData.expectedPrice}
                          onChange={handleChange}
                          placeholder="2.5 Cr"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Property & Surroundings Photos
                    </label>
                    <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-colors">
                      <UploadCloud className="text-gold" size={28} />
                      <span className="font-semibold text-accent-dark">
                        Upload photos
                      </span>
                      <span className="text-xs text-gray-500">
                        Add up to 8 images, 10 MB each
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    {photoFiles.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {photoFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                          >
                            <span className="truncate text-gray-600">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="text-gray-400 hover:text-red-500"
                              aria-label={`Remove ${file.name}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Condition, upgrades, or notes
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Mention furnishing, floor, facing, recent upgrades, rental status, or anything that affects valuation."
                      rows={4}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-4 mt-4 bg-accent-dark text-white rounded-xl font-bold text-lg hover:bg-gold transition-all duration-300 shadow-xl hover:shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {status === "submitting" ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading & submitting...
                      </>
                    ) : (
                      "Get My Property Valuation"
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Photos are uploaded securely to the configured Supabase
                    storage bucket and shared with Rupali Homes for valuation.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
