"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Trash2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  MessageSquare,
  Search,
  ShieldAlert,
  Download,
  Calendar,
  CheckSquare,
  Square,
  MinusSquare,
  X,
  FileText,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchInquiries, deleteInquiry } from "@/lib/api";
import { Inquiry } from "@/types";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  isBlogSubmission,
  parseBlogSubmission,
  getInquiryLocation,
  authorTelHref,
  authorWhatsAppHref,
  blogReviewMessage,
} from "@/lib/blogSubmission";

// Renders a message string, converting image URLs to inline images and other URLs to links
function MessageWithMedia({ message }: { message: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
  const pdfExtension = /\.pdf(\?.*)?$/i;
  const parts = message.split(urlRegex);

  return (
    <div className="text-sm text-gray-700 whitespace-pre-wrap break-words space-y-2">
      {parts.map((part, i) => {
        // Reset lastIndex because urlRegex is global
        urlRegex.lastIndex = 0;
        if (!urlRegex.test(part)) {
          return part ? <span key={i}>{part}</span> : null;
        }
        const isPdfLink =
          pdfExtension.test(part) || part.includes("blog_submissions");
        const isImageLink =
          !isPdfLink &&
          (imageExtensions.test(part) ||
            part.includes("firebasestorage.googleapis.com") ||
            part.includes("supabase.co"));

        // Check if the URL points to an image
        if (isImageLink) {
          return (
            <img
              key={i}
              src={part}
              alt="Attached media"
              className="max-w-full sm:max-w-xs rounded-lg border border-gray-200 shadow-sm mt-1 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(part, "_blank")}
              loading="lazy"
            />
          );
        }
        if (isPdfLink) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline font-medium"
            >
              <FileText size={14} />
              Open PDF
              <ExternalLink size={12} />
            </a>
          );
        }
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </a>
        );
      })}
    </div>
  );
}

export default function LeadsPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const { isSuperAdmin } = useAdminAuth();

  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Client-side pagination so large lead lists don't render an unwieldy DOM
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // ── Data fetching ────────────────────────────────────────────────────
  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await fetchInquiries();
      // The backend is the single source of truth. Blog submissions used to
      // be merged with a browser-local copy, which made every submission
      // appear twice because the two records had different IDs.
      setInquiries(data ?? []);
    } catch (error) {
      console.error("Failed to load inquiries:", error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Delete handler ───────────────────────────────────────────────────
  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Delete this inquiry?")) return;

    try {
      setDeletingId(id);
      const success = await deleteInquiry(id);

      // Remove from the current backend-backed list.
      setInquiries((prev) => prev.filter((i) => i.id !== id));

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete inquiry.");
    } finally {
      setDeletingId(null);
    }
  };

  const blogCount = useMemo(
    () => inquiries.filter(isBlogSubmission).length,
    [inquiries],
  );

  // ── Filtered results (search + date range + category) ───────────────
  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      // Category filter
      if (categoryFilter !== "ALL") {
        const inqType = (inq.type || "").toUpperCase();
        if (categoryFilter === "BLOG_SUBMISSION") {
          if (!isBlogSubmission(inq)) return false;
        } else if (categoryFilter === "SELL_VALUATION") {
          const isValuation =
            inqType === "SELL_VALUATION" ||
            (inq.message || "").includes("VALUATION");
          if (!isValuation) return false;
        } else if (categoryFilter === "CONTACT") {
          if (
            isBlogSubmission(inq) ||
            inqType === "SELL_VALUATION" ||
            (inq.message || "").includes("VALUATION")
          ) {
            return false;
          }
        }
      }

      // Date range
      if (dateFrom) {
        const from = new Date(dateFrom);
        const created = new Date(inq.createdAt);
        if (created < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const created = new Date(inq.createdAt);
        if (created > to) return false;
      }

      // Text search
      if (search.trim()) {
        const searchTerm = search.toLowerCase();
        const blogMeta = isBlogSubmission(inq)
          ? parseBlogSubmission(inq)
          : null;
        return (
          (inq.name ?? "").toLowerCase().includes(searchTerm) ||
          (inq.email ?? "").toLowerCase().includes(searchTerm) ||
          (inq.phone ?? "").includes(search) ||
          (inq.location ?? "").toLowerCase().includes(searchTerm) ||
          (inq.city ?? "").toLowerCase().includes(searchTerm) ||
          (blogMeta?.title ?? "").toLowerCase().includes(searchTerm) ||
          (inq.message ?? "").toLowerCase().includes(searchTerm)
        );
      }

      return true;
    });
  }, [inquiries, dateFrom, dateTo, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedInquiries = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const selectedInquiries = useMemo(
    () => filtered.filter((inq) => selectedIds.has(inq.id)),
    [filtered, selectedIds],
  );

  const selectedBlogInquiries = useMemo(
    () => selectedInquiries.filter(isBlogSubmission),
    [selectedInquiries],
  );

  /** Open WhatsApp chats for selected authors (staggered to reduce popup blocking). */
  const handleBulkWhatsApp = (): void => {
    const targets = selectedBlogInquiries.length
      ? selectedBlogInquiries
      : selectedInquiries;
    if (targets.length === 0) return;

    const MAX_TABS = 8;
    if (targets.length > MAX_TABS) {
      const proceed = confirm(
        `You selected ${targets.length} contacts. Opening more than ${MAX_TABS} WhatsApp tabs may be blocked by the browser. Open the first ${MAX_TABS} now?`,
      );
      if (!proceed) return;
    }

    targets.slice(0, MAX_TABS).forEach((inq, index) => {
      const href = authorWhatsAppHref(
        inq.phone,
        isBlogSubmission(inq)
          ? blogReviewMessage(inq)
          : `Hi ${inq.name || ""}, this is Rupali Homes.`,
      );
      if (!href) return;
      window.setTimeout(() => {
        window.open(href, "_blank", "noopener,noreferrer");
      }, index * 450);
    });
  };

  const handleBulkCopyPhones = async (): Promise<void> => {
    const targets = selectedBlogInquiries.length
      ? selectedBlogInquiries
      : selectedInquiries;
    const phones = targets
      .map((inq) => (inq.phone || "").replace(/\D/g, "").slice(-10))
      .filter((p) => p.length === 10);
    if (phones.length === 0) {
      alert("No valid phone numbers in the selection.");
      return;
    }
    try {
      await navigator.clipboard.writeText(phones.join("\n"));
      alert(`Copied ${phones.length} phone number(s) to clipboard.`);
    } catch {
      alert(phones.join("\n"));
    }
  };

  // ── Selection helpers ────────────────────────────────────────────────
  const filteredIds = useMemo(
    () => new Set(filtered.map((inq) => inq.id)),
    [filtered]
  );

  const selectedInFiltered = useMemo(
    () => [...selectedIds].filter((id) => filteredIds.has(id)).length,
    [selectedIds, filteredIds]
  );

  const allFilteredSelected =
    filtered.length > 0 && selectedInFiltered === filtered.length;
  const someFilteredSelected =
    selectedInFiltered > 0 && selectedInFiltered < filtered.length;

  const toggleSelect = (id: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = (): void => {
    if (allFilteredSelected) {
      // Deselect all in current filtered view
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((inq) => next.delete(inq.id));
        return next;
      });
    } else {
      // Select all in current filtered view
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((inq) => next.add(inq.id));
        return next;
      });
    }
  };

  const clearSelection = (): void => {
    setSelectedIds(new Set());
  };

  // ── Format date ──────────────────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // ── CSV export (selected only) ───────────────────────────────────────
  const handleExportCsv = (): void => {
    const toExport = filtered.filter((inq) => selectedIds.has(inq.id));
    if (toExport.length === 0) return;

    try {
      const escapeCsv = (value?: string | number | null): string => {
        const str = value == null ? "" : String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const header =
        "ID,Name,Phone,Email,Type,Status,City,Location,Message,Created At";
      const rows = toExport.map((inq) =>
        [
          escapeCsv(inq.id),
          escapeCsv(inq.name),
          escapeCsv(inq.phone),
          escapeCsv(inq.email),
          escapeCsv(inq.type),
          escapeCsv(inq.status),
          escapeCsv(inq.city),
          escapeCsv(inq.location),
          escapeCsv(inq.message),
          escapeCsv(inq.createdAt ? formatDate(inq.createdAt) : ""),
        ].join(",")
      );

      const csvContent = [header, ...rows].join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);

      try {
        const a = document.createElement("a");
        a.href = url;
        a.download = "leads.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("CSV export error:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-accent-dark">
            Inquiries
          </h1>
          <p className="text-gray-500 mt-1">
            {filtered.length === inquiries.length
              ? `${inquiries.length} total lead${inquiries.length !== 1 ? "s" : ""}`
              : `${filtered.length} of ${inquiries.length} lead${inquiries.length !== 1 ? "s" : ""}`}
            {" · "}
            {blogCount} blog review{blogCount !== 1 ? "s" : ""} pending review.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportCsv}
            disabled={loading || selectedIds.size === 0}
            title={
              selectedIds.size > 0
                ? `Export ${selectedInFiltered} selected lead${selectedInFiltered !== 1 ? "s" : ""} as CSV`
                : "Select leads to export"
            }
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
            {selectedInFiltered > 0 && (
              <span className="ml-1 text-[10px] bg-accent-dark text-white rounded-full px-1.5 py-0.5 font-bold">
                {selectedInFiltered}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter("ALL");
            setPage(0);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            categoryFilter === "ALL"
              ? "bg-accent-dark text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100 bg-white border border-gray-200"
          }`}
        >
          All Inquiries ({inquiries.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("BLOG_SUBMISSION");
            setPage(0);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "BLOG_SUBMISSION"
              ? "bg-gold text-white shadow-sm font-bold"
              : "text-gray-700 hover:bg-gold/10 hover:text-gold bg-white border border-gray-200"
          }`}
        >
          <span>📄 Blog Review</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 font-bold">
            {blogCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("SELL_VALUATION");
            setPage(0);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            categoryFilter === "SELL_VALUATION"
              ? "bg-blue-600 text-white shadow-sm font-bold"
              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 bg-white border border-gray-200"
          }`}
        >
          <span>🏡 Valuations</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-white/20 font-bold">
            {inquiries.filter((i) => (i.type || "").toUpperCase() === "SELL_VALUATION" || (i.message || "").includes("VALUATION")).length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCategoryFilter("CONTACT");
            setPage(0);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            categoryFilter === "CONTACT"
              ? "bg-gray-800 text-white shadow-sm font-bold"
              : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-200"
          }`}
        >
          📩 Contact Form
        </button>
      </div>

      {/* Search + Date Range */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            className="w-[140px] text-sm"
          />
          <span className="text-gray-400 text-xs">to</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            className="w-[140px] text-sm"
          />
          {(dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setPage(0);
              }}
              title="Clear date filter"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-lg bg-accent-dark/5 border border-accent-dark/10">
          <span className="text-sm font-medium text-accent-dark">
            {selectedInFiltered} selected
            {selectedBlogInquiries.length > 0 && (
              <span className="text-gray-500 font-normal">
                {" "}
                ({selectedBlogInquiries.length} blog)
              </span>
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
            onClick={handleBulkWhatsApp}
            disabled={selectedInquiries.length === 0}
            title="Open WhatsApp for each selected author"
          >
            <MessageCircle size={14} />
            Contact via WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={handleBulkCopyPhones}
            disabled={selectedInquiries.length === 0}
            title="Copy selected phone numbers"
          >
            <Phone size={14} />
            Copy phones
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700"
            onClick={clearSelection}
          >
            Clear selection
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiry List */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {/* Select All Header */}
              {!loading && filtered.length > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-accent-dark transition-colors"
                    title={
                      allFilteredSelected ? "Deselect all" : "Select all"
                    }
                  >
                    {allFilteredSelected ? (
                      <CheckSquare size={18} className="text-accent-dark" />
                    ) : someFilteredSelected ? (
                      <MinusSquare size={18} className="text-accent-dark" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                  <span className="text-xs text-gray-500">
                    {allFilteredSelected
                      ? "All selected"
                      : someFilteredSelected
                        ? `${selectedInFiltered} selected`
                        : "Select all"}
                  </span>
                </div>
              )}

              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">
                    {search || dateFrom || dateTo
                      ? "No matching inquiries."
                      : "No inquiries yet."}
                  </p>
                  <p className="text-xs mt-1">
                    {search || dateFrom || dateTo
                      ? "Try adjusting your search or date range."
                      : "Inquiries from the contact form will appear here."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedInquiries.map((inq) => {
                    const isSelected = selectedIds.has(inq.id);
                    const isBlog = isBlogSubmission(inq);
                    const blogMeta = isBlog ? parseBlogSubmission(inq) : null;
                    return (
                      <div
                        key={inq.id}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedInquiry?.id === inq.id
                            ? "bg-gray-50 border-l-2 border-accent-dark"
                            : ""
                        } ${isSelected ? "bg-accent-dark/[0.03]" : ""}`}
                      >
                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(inq.id);
                          }}
                          className="text-gray-400 hover:text-accent-dark transition-colors shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare
                              size={18}
                              className="text-accent-dark"
                            />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>

                        {/* Main row content */}
                        <div
                          className="flex items-center justify-between flex-1 min-w-0"
                          onClick={() => setSelectedInquiry(inq)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                isBlog
                                  ? "bg-gold/15 text-gold"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {isBlog ? (
                                <FileText size={16} />
                              ) : (
                                <span className="text-sm font-bold">
                                  {(inq.name ?? "")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n.charAt(0))
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2) || "NA"}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {isBlog
                                  ? blogMeta?.title || inq.name
                                  : inq.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {isBlog
                                  ? `${inq.name}${blogMeta?.location ? ` · ${blogMeta.location}` : ""} · ${inq.phone || "No phone"}`
                                  : inq.email || inq.phone || "No contact info"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isBlog && (
                              <span className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                                Blog
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 hidden md:inline">
                              {formatDate(inq.createdAt)}
                            </span>
                            {isSuperAdmin && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (inq.id) handleDelete(inq.id);
                                }}
                                disabled={deletingId === inq.id}
                              >
                                {deletingId === inq.id ? (
                                  <RefreshCw
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && filtered.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>
                    Showing {safePage * PAGE_SIZE + 1}–
                    {Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of{" "}
                    {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={safePage === 0}
                      onClick={() =>
                        setPage((p) => Math.max(0, p - 1))
                      }
                    >
                      Previous
                    </Button>
                    <span>
                      Page {safePage + 1} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={safePage >= totalPages - 1}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
              <CardDescription>
                {selectedInquiry
                  ? isBlogSubmission(selectedInquiry)
                    ? "Blog review details & contact"
                    : "Inquiry information"
                  : "Select an inquiry to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedInquiry ? (
                (() => {
                  const isBlog = isBlogSubmission(selectedInquiry);
                  const blogMeta = isBlog
                    ? parseBlogSubmission(selectedInquiry)
                    : null;
                  const location =
                    getInquiryLocation(selectedInquiry) ||
                    selectedInquiry.location ||
                    selectedInquiry.city;
                  const tel = authorTelHref(selectedInquiry.phone);
                  const wa = authorWhatsAppHref(
                    selectedInquiry.phone,
                    isBlog
                      ? blogReviewMessage(selectedInquiry)
                      : `Hi ${selectedInquiry.name || ""}, this is Rupali Homes.`,
                  );

                  return (
                    <div className="space-y-5">
                      {isBlog && (
                        <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                            Blog Review
                          </p>
                          <p className="text-sm font-semibold text-accent-dark">
                            {blogMeta?.title || "Untitled Article"}
                          </p>
                          {blogMeta?.pdfUrl && (
                            <a
                              href={blogMeta.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                            >
                              <FileText size={16} />
                              Open submitted PDF
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                          {isBlog ? "Author" : "Name"}
                        </p>
                        <p className="text-sm font-semibold">
                          {selectedInquiry.name}
                        </p>
                      </div>

                      {selectedInquiry.email &&
                        selectedInquiry.email !== "support@rupalihomes.com" && (
                          <div className="flex items-start gap-2">
                            <Mail size={14} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                                Email
                              </p>
                              <a
                                href={`mailto:${selectedInquiry.email}`}
                                className="text-sm text-accent-dark hover:underline"
                              >
                                {selectedInquiry.email}
                              </a>
                            </div>
                          </div>
                        )}

                      {selectedInquiry.phone && (
                        <div className="flex items-start gap-2">
                          <Phone size={14} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                              Phone
                            </p>
                            <a
                              href={tel || `tel:${selectedInquiry.phone}`}
                              className="text-sm text-accent-dark hover:underline"
                            >
                              {selectedInquiry.phone}
                            </a>
                          </div>
                        </div>
                      )}

                      {location && (
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                              Location
                            </p>
                            <p className="text-sm">{location}</p>
                          </div>
                        </div>
                      )}

                      {/* Contact actions */}
                      {(tel || wa) && (
                        <div className="grid grid-cols-2 gap-2">
                          {tel && (
                            <a
                              href={tel}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-accent-dark hover:bg-gray-50"
                            >
                              <Phone size={14} />
                              Call
                            </a>
                          )}
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                            >
                              <MessageCircle size={14} />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      )}

                      {selectedInquiry.message && (
                        <div className="flex items-start gap-2">
                          <MessageSquare
                            size={14}
                            className="text-gray-400 mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                              Message
                            </p>
                            <MessageWithMedia
                              message={selectedInquiry.message}
                            />
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">
                          Received: {formatDate(selectedInquiry.createdAt)}
                        </p>
                      </div>

                      {isSuperAdmin ? (
                        <Button
                          variant="outline"
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 gap-2"
                          onClick={() =>
                            selectedInquiry.id &&
                            handleDelete(selectedInquiry.id)
                          }
                          disabled={deletingId === selectedInquiry.id}
                        >
                          <Trash2 size={14} />
                          Delete Inquiry
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
                          <ShieldAlert size={14} />
                          <span>Only Super Admins can delete inquiries</span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-300">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">
                    Click on an inquiry to see details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
