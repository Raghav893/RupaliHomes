"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Video,
  Youtube,
  Instagram,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  User,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublish,
  fetchAdminProperties,
} from "@/lib/api";
import { Testimonial, TestimonialInput, Property } from "@/types";
import Image from "next/image";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<"ALL" | "YOUTUBE" | "INSTAGRAM">("ALL");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestimonialInput>({
    title: "",
    description: "",
    videoUrl: "",
    familyName: "",
    propertyReference: "",
    displayOrder: 0,
    isPublished: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load testimonials and properties
  const loadData = async () => {
    setLoading(true);
    try {
      const [items, propsRes] = await Promise.all([
        fetchAdminTestimonials(),
        fetchAdminProperties(0, 100).catch(() => ({ content: [] })),
      ]);
      setTestimonials(items);
      setProperties(propsRes.content || []);
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Detect video platform for preview
  const detectedPlatform = useMemo(() => {
    const url = formData.videoUrl.trim();
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YOUTUBE";
    if (url.includes("instagram.com")) return "INSTAGRAM";
    return "UNKNOWN";
  }, [formData.videoUrl]);

  // Extract YouTube ID for preview if applicable
  const previewYouTubeId = useMemo(() => {
    if (detectedPlatform !== "YOUTUBE") return null;
    const match = formData.videoUrl.match(/(?:youtube\.com\/(?:watch\?.*?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : null;
  }, [formData.videoUrl, detectedPlatform]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      videoUrl: "",
      familyName: "",
      propertyReference: "",
      displayOrder: testimonials.length,
      isPublished: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingId(t.id);
    setFormData({
      title: t.title,
      description: t.description || "",
      videoUrl: t.videoUrl,
      thumbnailUrl: t.thumbnailUrl || "",
      familyName: t.familyName || "",
      propertyReference: t.propertyReference || "",
      displayOrder: t.displayOrder ?? 0,
      isPublished: t.isPublished,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Please enter a title for the testimonial.");
      return;
    }

    if (!formData.videoUrl.trim()) {
      setFormError("Please enter a valid YouTube or Instagram URL.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateTestimonial(editingId, formData);
        if (!res.ok) {
          setFormError(res.error || "Failed to update testimonial.");
          return;
        }
      } else {
        const res = await createTestimonial(formData);
        if (!res.ok) {
          setFormError(res.error || "Failed to create testimonial.");
          return;
        }
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const success = await deleteTestimonial(id);
    if (success) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } else {
      alert("Failed to delete testimonial.");
    }
  };

  const handleTogglePublish = async (id: number, current: boolean) => {
    const res = await toggleTestimonialPublish(id, !current);
    if (res.ok && res.data) {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isPublished: res.data!.isPublished } : t))
      );
    } else {
      alert(res.error || "Failed to toggle status.");
    }
  };

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (filterPlatform !== "ALL" && t.videoPlatform?.toUpperCase() !== filterPlatform) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const searchTarget = `${t.title} ${t.familyName || ""} ${t.propertyReference || ""} ${t.description || ""}`.toLowerCase();
        if (!searchTarget.includes(q)) return false;
      }
      return true;
    });
  }, [testimonials, filterPlatform, searchQuery]);

  // Statistics
  const totalCount = testimonials.length;
  const publishedCount = testimonials.filter((t) => t.isPublished).length;
  const youtubeCount = testimonials.filter((t) => t.videoPlatform?.toUpperCase() === "YOUTUBE").length;
  const instaCount = testimonials.filter((t) => t.videoPlatform?.toUpperCase() === "INSTAGRAM").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-syne text-accent-dark">Testimonials</h1>
          <p className="text-gray-500 mt-1">
            Manage customer stories, family reviews, and video walkthroughs (YouTube & Instagram).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="gap-2 border-gray-200"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            onClick={openCreateModal}
            className="gap-2 bg-accent-dark hover:bg-accent-dark/90 text-white shadow-sm"
          >
            <Plus size={16} /> Add Testimonial
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stories</p>
          <p className="text-2xl font-bold font-syne text-accent-dark mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Published</p>
          <p className="text-2xl font-bold font-syne text-green-700 mt-1">{publishedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider flex items-center gap-1">
            <Youtube size={14} /> YouTube
          </p>
          <p className="text-2xl font-bold font-syne text-accent-dark mt-1">{youtubeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider flex items-center gap-1">
            <Instagram size={14} /> Instagram
          </p>
          <p className="text-2xl font-bold font-syne text-accent-dark mt-1">{instaCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title, family, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant={filterPlatform === "ALL" ? "default" : "outline"}
            onClick={() => setFilterPlatform("ALL")}
            className={filterPlatform === "ALL" ? "bg-accent-dark text-white" : ""}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterPlatform === "YOUTUBE" ? "default" : "outline"}
            onClick={() => setFilterPlatform("YOUTUBE")}
            className={filterPlatform === "YOUTUBE" ? "bg-red-600 text-white hover:bg-red-700" : ""}
          >
            <Youtube size={14} className="mr-1.5" /> YouTube
          </Button>
          <Button
            size="sm"
            variant={filterPlatform === "INSTAGRAM" ? "default" : "outline"}
            onClick={() => setFilterPlatform("INSTAGRAM")}
            className={filterPlatform === "INSTAGRAM" ? "bg-pink-600 text-white hover:bg-pink-700" : ""}
          >
            <Instagram size={14} className="mr-1.5" /> Instagram
          </Button>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Title & Family</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Property Ref</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-accent-dark" size={24} />
                    <span>Loading testimonials...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Video size={24} />
                    </div>
                    <p className="font-medium text-accent-dark">No testimonials found</p>
                    <p className="text-xs text-gray-400">Click &quot;Add Testimonial&quot; to publish your first video story.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Display Order */}
                  <TableCell className="font-semibold text-gray-700">
                    <span className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-accent-dark">
                      {item.displayOrder}
                    </span>
                  </TableCell>

                  {/* Thumbnail / Video Preview */}
                  <TableCell>
                    <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-gray-900 border border-gray-200 shrink-0 group">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                          {item.videoPlatform?.toUpperCase() === "YOUTUBE" ? (
                            <Youtube size={24} className="text-red-500" />
                          ) : (
                            <Instagram size={24} className="text-pink-400" />
                          )}
                        </div>
                      )}
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                        title="Open Video URL"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </TableCell>

                  {/* Title & Family Name */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-bold text-accent-dark font-syne line-clamp-1">{item.title}</p>
                      {item.familyName && (
                        <div className="flex items-center gap-1.5 text-xs text-gold font-medium">
                          <User size={12} /> {item.familyName}
                        </div>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-sm">{item.description}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* Platform Badge */}
                  <TableCell>
                    {item.videoPlatform?.toUpperCase() === "YOUTUBE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                        <Youtube size={12} /> YouTube
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-600 border border-pink-200">
                        <Instagram size={12} /> Instagram
                      </span>
                    )}
                  </TableCell>

                  {/* Property Reference */}
                  <TableCell>
                    {item.propertyReference ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        <Building2 size={12} className="text-gold" />
                        {item.propertyReference}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">None</span>
                    )}
                  </TableCell>

                  {/* Status Toggle */}
                  <TableCell>
                    <button
                      onClick={() => handleTogglePublish(item.id, item.isPublished)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        item.isPublished
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title={item.isPublished ? "Click to unpublish" : "Click to publish"}
                    >
                      {item.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.isPublished ? "Published" : "Draft"}
                    </button>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(item)}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal / Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-dark text-white flex items-center justify-center">
                  <Video size={16} />
                </div>
                <h3 className="text-lg font-bold font-syne text-accent-dark">
                  {editingId ? "Edit Testimonial" : "Add New Testimonial"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Video URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-accent-dark flex items-center gap-1.5">
                    <Video size={14} /> Video URL (YouTube or Instagram) *
                  </Label>
                  {detectedPlatform === "YOUTUBE" && (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <Youtube size={14} /> YouTube Detected
                    </span>
                  )}
                  {detectedPlatform === "INSTAGRAM" && (
                    <span className="text-xs font-bold text-pink-600 flex items-center gap-1">
                      <Instagram size={14} /> Instagram Detected
                    </span>
                  )}
                </div>
                <Input
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="h-10 text-sm"
                />
                <p className="text-xs text-gray-400">
                  Accepts YouTube videos/shorts or Instagram reels/posts.
                </p>
              </div>

              {/* Live Preview Box */}
              {previewYouTubeId && (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-black aspect-video relative max-h-52 mx-auto">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${previewYouTubeId}`}
                    title="Live YouTube Preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Title & Family Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-accent-dark">Testimonial Title *</Label>
                  <Input
                    required
                    placeholder="e.g. Dream Villa Tour & Experience"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-accent-dark">Family / Customer Name</Label>
                  <Input
                    placeholder="e.g. The Sharma Family"
                    value={formData.familyName || ""}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Description / Quote */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-accent-dark">Customer Quote / Description</Label>
                <textarea
                  rows={3}
                  placeholder="Share a short testimonial quote or summary of their experience..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold"
                />
              </div>

              {/* Property Reference & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-accent-dark flex items-center gap-1">
                    <Building2 size={13} /> Property Reference (Optional)
                  </Label>
                  <div className="space-y-2">
                    {properties.length > 0 && (
                      <select
                        value={formData.propertyReference || ""}
                        onChange={(e) => setFormData({ ...formData, propertyReference: e.target.value })}
                        className="w-full h-10 px-3 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-gold"
                      >
                        <option value="">-- Select linked property or type custom --</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.title}>
                            {p.title} ({p.location})
                          </option>
                        ))}
                      </select>
                    )}
                    <Input
                      placeholder="Or type custom property name"
                      value={formData.propertyReference || ""}
                      onChange={(e) => setFormData({ ...formData, propertyReference: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-accent-dark flex items-center gap-1">
                    <Layers size={13} /> Display Order
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.displayOrder ?? 0}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    className="h-10 text-sm"
                  />
                  <p className="text-xs text-gray-400">Lower numbers appear first on the public page.</p>
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished ?? true}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-accent-dark rounded focus:ring-gold"
                />
                <Label htmlFor="isPublished" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Publish immediately to public /testimonials page
                </Label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent-dark hover:bg-accent-dark/90 text-white min-w-28"
                >
                  {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Testimonial"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
