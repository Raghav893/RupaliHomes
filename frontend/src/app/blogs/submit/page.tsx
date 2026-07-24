"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Upload, CheckCircle2, AlertCircle, Phone, User, MapPin, Sparkles, X } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitInquiry } from "@/lib/api";
import { buildBlogSubmissionMessage } from "@/lib/blogSubmission";

export default function SubmitBlogPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    title: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF document (.pdf)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("PDF file size must be 20 MB or smaller");
      return;
    }

    setPdfFile(file);
    setError("");
    setUploadingPdf(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "blog_submissions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to upload PDF");
      }

      const result = await res.json();
      setPdfUrl(result.url);
    } catch (err: unknown) {
      console.error("PDF upload error:", err);
      setError(err instanceof Error ? err.message : "PDF upload failed. Please try again.");
      setPdfFile(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter your city/location");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter the title of your blog article");
      return;
    }

    if (!pdfUrl && !uploadingPdf) {
      setError("Please upload your blog article in PDF format");
      return;
    }

    if (uploadingPdf) {
      setError("Please wait for the PDF upload to finish");
      return;
    }

    setSubmitting(true);

    try {
      const messageBody = buildBlogSubmissionMessage({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        title: formData.title,
        pdfUrl,
      });

      const inquiryData = {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: "blog@rupalihomes.com",
        message: messageBody,
        type: "BLOG_SUBMISSION",
        city: formData.location.trim(),
      };

      // Persist to backend so admins see it under Inquiries → Blog Review
      await submitInquiry(inquiryData);

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit your article. Please check your network connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <Navbar />

      <section className="pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto w-full grow">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gold mb-8 transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} /> Back to Journal
        </Link>

        {submitted ? (
          <div className="bg-white p-8 sm:p-14 rounded-3xl border border-gray-100 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-syne text-accent-dark">
              Article Submitted Successfully!
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-accent-dark">{formData.name}</span>. Our editorial team at Rupali Homes will review your blog article <span className="font-semibold text-gold">&quot;{formData.title}&quot;</span> and get in touch with you at <span className="font-semibold text-accent-dark">{formData.phone}</span>.
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 max-w-md mx-auto text-left text-sm space-y-2">
              <p><span className="text-gray-500 font-medium">Author:</span> {formData.name}</p>
              <p><span className="text-gray-500 font-medium">Phone:</span> {formData.phone}</p>
              <p><span className="text-gray-500 font-medium">Location:</span> {formData.location}</p>
              <p><span className="text-gray-500 font-medium">Article Title:</span> {formData.title}</p>
              {pdfUrl && (
                <p className="truncate">
                  <span className="text-gray-500 font-medium">PDF File:</span>{" "}
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    View Uploaded PDF
                  </a>
                </p>
              )}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", phone: "", location: "", title: "" });
                  setPdfFile(null);
                  setPdfUrl("");
                }}
                className="px-6 py-3 border border-gray-300 rounded-full text-accent-dark hover:bg-gray-100 font-semibold transition-colors"
              >
                Submit Another Article
              </button>
              <Link
                href="/blogs"
                className="px-8 py-3 bg-accent-dark text-white rounded-full hover:bg-gold transition-colors font-bold shadow-md"
              >
                Explore Journal
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={14} /> Contribute To Rupali Journal
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-syne text-accent-dark tracking-tight mb-3">
                Submit Your Article
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">
                Share your real estate insights, architectural trends, market analysis, or interior design stories with the Rupali Homes community.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-xl space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Author Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-accent-dark mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ananya Sharma"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-accent-dark text-sm focus:outline-none focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-accent-dark mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-accent-dark text-sm focus:outline-none focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-accent-dark mb-2">
                  City / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Gurgaon, Haryana"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-accent-dark text-sm focus:outline-none focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>

              {/* Blog Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-accent-dark mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Top 10 Luxury Real Estate Trends in 2026"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-accent-dark text-sm focus:outline-none focus:bg-white focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                  />
                </div>
              </div>

              {/* PDF Document Upload */}
              <div>
                <label className="block text-sm font-semibold text-accent-dark mb-2">
                  Upload Blog Article PDF <span className="text-red-500">*</span>
                </label>

                {pdfFile ? (
                  <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-accent-dark truncate">{pdfFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadingPdf ? "Uploading to cloud..." : pdfUrl ? "Ready for submission" : "Processing..."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        setPdfUrl("");
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pdf-upload"
                    className="border-2 border-dashed border-gray-200 hover:border-gold rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-gold/5 transition-all text-center group"
                  >
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-14 h-14 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-gold group-hover:scale-110 transition-transform mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-semibold text-accent-dark group-hover:text-gold transition-colors">
                      Click to upload your Blog PDF document
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF format up to 20 MB
                    </p>
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || uploadingPdf || !pdfUrl}
                className="w-full bg-accent-dark hover:bg-gold text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base uppercase tracking-wider"
              >
                {submitting ? (
                  <>Submitting Article...</>
                ) : uploadingPdf ? (
                  <>Uploading PDF Document...</>
                ) : (
                  <>Submit Blog Article</>
                )}
              </button>
            </form>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
