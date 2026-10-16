"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Instagram, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLandingInstagramVideos, saveLandingInstagramVideo, deleteLandingInstagramVideo, setLandingInstagramVideoPublished } from "@/lib/api";
import { LandingInstagramVideo } from "@/types";

export default function LandingInstagramVideosPage() {
  const [videos, setVideos] = useState<LandingInstagramVideo[]>([]);
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<number>();
  const [order, setOrder] = useState(0);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setVideos(await fetchLandingInstagramVideos(true));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setUrl(""); setOrder(0); setPublished(true); setEditingId(undefined); setError("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setSaving(true);
    const result = await saveLandingInstagramVideo({ videoUrl: url, displayOrder: order, isPublished: published }, editingId);
    setSaving(false);
    if (!result) { setError("Enter a valid public Instagram post, reel, or video URL."); return; }
    reset(); await load();
  };

  const edit = (video: LandingInstagramVideo) => {
    setEditingId(video.id); setUrl(video.videoUrl); setOrder(video.displayOrder); setPublished(video.isPublished); setError("");
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this landing-page Instagram video?")) return;
    if (await deleteLandingInstagramVideo(id)) setVideos((items) => items.filter((item) => item.id !== id));
  };

  const toggle = async (video: LandingInstagramVideo) => {
    if (await setLandingInstagramVideoPublished(video.id, !video.isPublished)) {
      setVideos((items) => items.map((item) => item.id === video.id ? { ...item, isPublished: !item.isPublished } : item));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-syne text-accent-dark">Landing Instagram Videos</h1>
        <p className="mt-2 text-gray-500">Manage the official Instagram embeds shown at the bottom of the landing page.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-accent-dark font-semibold"><Instagram size={18} /> {editingId ? "Edit video" : "Add video"}</div>
        <div className="grid gap-4 md:grid-cols-[1fr_120px_auto] md:items-end">
          <label className="space-y-1.5 text-sm font-medium text-gray-700">Instagram URL
            <Input required value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.instagram.com/reel/..." />
          </label>
          <label className="space-y-1.5 text-sm font-medium text-gray-700">Order
            <Input type="number" min={0} value={order} onChange={(event) => setOrder(Number(event.target.value) || 0)} />
          </label>
          <Button disabled={saving} type="submit"><Plus size={16} /> {saving ? "Saving..." : editingId ? "Update" : "Add video"}</Button>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} /> Publish on landing page</label>
        {editingId && <Button type="button" variant="outline" onClick={reset}>Cancel edit</Button>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {loading ? <p className="text-gray-500">Loading videos...</p> : videos.length === 0 ? <p className="text-gray-500">No landing videos configured.</p> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => <article key={video.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="relative aspect-[9/16] bg-gray-100"><iframe src={`${video.embedUrl.replace(/\/+$/, "")}/embed/`} title="Instagram preview" className="absolute inset-0 h-full w-full border-0" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" /></div>
            <div className="space-y-3 p-4"><div className="flex items-center justify-between text-xs text-gray-500"><span>Order {video.displayOrder}</span><span className={video.isPublished ? "text-green-600" : "text-gray-400"}>{video.isPublished ? "Published" : "Hidden"}</span></div>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(video)}>Edit</Button><Button size="sm" variant="outline" onClick={() => toggle(video)}>{video.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}</Button><Button size="sm" variant="outline" onClick={() => remove(video.id)}><Trash2 size={14} className="text-red-500" /></Button><a href={video.videoUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center"><ExternalLink size={15} /></a></div>
            </div>
          </article>)}
        </div>
      )}
    </div>
  );
}
