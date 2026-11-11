"use client";

import { useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadImage } from "@/lib/api";
import { getThemeFromImage, getThemeFromImageUrl } from "@/lib/accent-from-image";
import { DEFAULT_PROPERTY_THEME, isPropertyAccent, type PropertyPresentation } from "@/lib/property-presentation";

interface Props {
  value: PropertyPresentation;
  onChange: Dispatch<SetStateAction<PropertyPresentation>>;
  brochureUrl: string;
  onBrochureUrlChange: (value: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

const inputClass = "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-50";
const themeColors = [
  { key: "accentColor", label: "Accent color" },
  { key: "themeDark", label: "Dark theme color" },
  { key: "themeDarker", label: "Darker theme color" },
  { key: "themeLight", label: "Light theme color" },
] as const;

function Field({ label, value, onChange, type = "text", disabled = false, placeholder }: { label: string; value?: string | number; onChange: (value: string) => void; type?: string; disabled?: boolean; placeholder?: string }) {
  return <label className="block space-y-1.5 text-xs font-medium text-gray-600"><span>{label}</span><input type={type} min={type === "number" ? 0 : undefined} value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder={placeholder} className={inputClass} /></label>;
}

function UploadField({ label, accept = "image/*", multiple = false, disabled, onFiles }: { label: string; accept?: string; multiple?: boolean; disabled: boolean; onFiles: (files: File[]) => void }) {
  const id = useId();
  return <div><label htmlFor={id} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 focus-within:ring-2 focus-within:ring-orange-400 ${disabled ? "cursor-wait opacity-50" : "cursor-pointer hover:border-orange-300"}`}><Upload size={14} aria-hidden="true" />{label}<input id={id} aria-label={label} type="file" accept={accept} multiple={multiple} disabled={disabled} className="sr-only" onChange={(event) => { const files = Array.from(event.target.files || []); event.target.value = ""; if (files.length) onFiles(files); }} /></label></div>;
}

function Preview({ url, label }: { url: string; label: string }) {
  if (!url) return null;
  // Admin-entered and uploaded media can use any configured storage origin.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={label} className="h-24 max-w-full rounded-lg border border-gray-100 bg-white object-contain" />;
}

export default function PropertyPresentationFields({ value, onChange, brochureUrl, onBrochureUrlChange, onUploadingChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const mounted = useRef(true);
  const busy = useRef(false);
  const [picking, setPicking] = useState(false);
  const pickingRef = useRef(false);
  const accentRequest = useRef(0);
  const coverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverFile = useRef<{ url: string; file: File } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; accentRequest.current++; if (coverTimer.current) clearTimeout(coverTimer.current); }; }, []);

  function cancelAccentPick() {
    accentRequest.current++;
    if (coverTimer.current) clearTimeout(coverTimer.current);
    pickingRef.current = false; setPicking(false); onUploadingChange(busy.current);
  }

  function setManualTheme(key: typeof themeColors[number]["key"] | "themeName", next: string) {
    cancelAccentPick();
    update(key, next);
  }

  async function pickAccent(source: File | string, request = ++accentRequest.current) {
    if (request !== accentRequest.current || !mounted.current) return;
    pickingRef.current = true; setPicking(true); onUploadingChange(true);
    try {
      const theme = typeof source === "string" ? await getThemeFromImageUrl(source) : await getThemeFromImage(source);
      if (mounted.current && request === accentRequest.current) onChange((previous) => ({ ...previous, ...theme }));
    } finally {
      if (mounted.current && request === accentRequest.current) { pickingRef.current = false; setPicking(false); onUploadingChange(busy.current); }
    }
  }

  function changeCover(next: string) {
    cancelAccentPick(); coverFile.current = null;
    update("coverImage", next);
    if (!next.trim()) { onChange((previous) => ({ ...previous, ...DEFAULT_PROPERTY_THEME })); return; }
    const request = accentRequest.current;
    // Wait for a pasted/typed URL to settle. Loading an existing listing never replaces its saved theme.
    pickingRef.current = true; setPicking(true); onUploadingChange(true);
    coverTimer.current = setTimeout(() => { void pickAccent(next.trim(), request); }, 500);
  }

  function update<K extends keyof PropertyPresentation>(key: K, next: PropertyPresentation[K]) {
    onChange((previous) => ({ ...previous, [key]: next }));
  }

  async function upload(files: File[], apply: (url: string, file: File) => void | Promise<void>, pdf = false) {
    if (busy.current) return;
    busy.current = true; setUploading(true); onUploadingChange(true); setErrors([]);
    for (const file of files) {
      if (!mounted.current) break;
      try {
        const valid = pdf ? (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) : (file.type.startsWith("image/") || (!file.type && /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(file.name)));
        if (!valid) throw new Error(pdf ? "Choose a PDF document." : "Choose an image file.");
        const url = await uploadImage(file);
        if (!url) throw new Error("The upload did not return a file URL.");
        if (mounted.current) await apply(url, file);
      } catch (error) {
        if (mounted.current) setErrors((previous) => [...previous, `${file.name}: ${error instanceof Error ? error.message : "Upload failed. Please try again."}`]);
      }
    }
    busy.current = false;
    if (mounted.current) { setUploading(false); onUploadingChange(pickingRef.current); }
  }

  function move(key: "galleryImages" | "floorPlans", index: number, direction: -1 | 1) {
    onChange((previous) => {
      const rows = [...previous[key]];
      const target = index + direction;
      if (target < 0 || target >= rows.length) return previous;
      [rows[index], rows[target]] = [rows[target], rows[index]];
      return { ...previous, [key]: rows.map((row, order) => ({ ...row, order })) };
    });
  }

  function remove(key: "galleryImages" | "floorPlans", index: number) {
    onChange((previous) => ({ ...previous, [key]: previous[key].filter((_, itemIndex) => itemIndex !== index).map((item, order) => ({ ...item, order })) }));
  }

  const statusOptions = ["Launching Soon", "Under Construction", "Ready to Move", "Completed"];

  return <section aria-labelledby="property-presentation-heading" className="my-7 space-y-7 rounded-2xl border border-gray-200 bg-stone-50/60 p-4 sm:p-5">
    <div><h3 id="property-presentation-heading" className="text-lg font-semibold text-accent-dark">Property page presentation</h3><p className="mt-1 text-xs leading-6 text-gray-500">Set the hero, developer details, ordered gallery, floor plans, and brochure for this property. Existing listing images remain available as fallbacks.</p></div>
    {uploading && <p role="status" className="flex items-center gap-2 text-xs text-orange-700"><Loader2 className="animate-spin" size={15} />Uploading media. Saving will be available when uploads finish.</p>}
    {!!errors.length && <div role="alert" className="rounded-lg bg-red-50 p-3 text-xs leading-6 text-red-700"><p className="font-medium">Some files could not be uploaded. Successful uploads have been kept.</p><ul className="list-inside list-disc">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul></div>}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Eyebrow" value={value.eyebrow} onChange={(next) => update("eyebrow", next)} placeholder="A new perspective on luxury" />
      <Field label="Tagline" value={value.tagline} onChange={(next) => update("tagline", next)} placeholder="A place to call your own" />
      <Field label="Developer name" value={value.developerName} onChange={(next) => update("developerName", next)} />
      <label className="block space-y-1.5 text-xs font-medium text-gray-600"><span>Project status</span><select value={value.projectStatus} onChange={(event) => update("projectStatus", event.target.value)} className={inputClass}><option value="">Not specified</option>{value.projectStatus && !statusOptions.includes(value.projectStatus) && <option value={value.projectStatus}>{value.projectStatus}</option>}{statusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
    </div>

    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-accent-dark">Property color theme</h4><p className="mt-1 text-xs text-gray-500">Generated from the cover photo. Edit any color or the theme name to make it your own.</p></div><button type="button" disabled={uploading || picking || !value.coverImage.trim()} onClick={() => void pickAccent(coverFile.current?.url === value.coverImage ? coverFile.current.file : value.coverImage)} className="min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-600 hover:border-orange-300 disabled:cursor-not-allowed disabled:opacity-50">{picking ? "Generating theme…" : "Re-generate theme from photo"}</button></div>
      {picking && <p role="status" className="text-xs text-gray-500">Reading the cover photo colors…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{themeColors.map(({ key, label }) => <div key={key}><label className="mb-1.5 block text-xs font-medium text-gray-600" htmlFor={`property-theme-${key}`}>{label}</label><div className="flex items-center gap-2"><input type="color" aria-label={key === "accentColor" ? "Pick property accent color" : `Pick ${label.toLowerCase()}`} value={isPropertyAccent(value[key]) ? value[key] : DEFAULT_PROPERTY_THEME[key]} onChange={(event) => setManualTheme(key, event.target.value)} className="h-11 w-12 shrink-0 cursor-pointer rounded border border-gray-200 bg-white p-1" /><input id={`property-theme-${key}`} aria-label={key === "accentColor" ? "Accent color hex" : `${label} hex`} aria-invalid={!isPropertyAccent(value[key])} value={value[key]} onChange={(event) => setManualTheme(key, event.target.value)} placeholder={DEFAULT_PROPERTY_THEME[key]} className={inputClass} maxLength={7} /></div>{!isPropertyAccent(value[key]) && <p className="mt-1 text-xs text-red-600">Use six hexadecimal digits, for example {DEFAULT_PROPERTY_THEME[key]}.</p>}</div>)}</div>
      <Field label="Theme name" value={value.themeName} onChange={(next) => setManualTheme("themeName", next)} placeholder="Default" />
      <div aria-label="Property theme preview" className="overflow-hidden rounded-xl border border-black/10"><div className="grid h-9 grid-cols-4">{themeColors.map(({ key, label }) => <span key={key} role="img" aria-label={`${label} preview: ${value[key]}`} title={`${label}: ${value[key]}`} style={{ backgroundColor: isPropertyAccent(value[key]) ? value[key] : DEFAULT_PROPERTY_THEME[key] }} />)}</div><div className="p-5" style={{ backgroundColor: isPropertyAccent(value.themeDark) ? value.themeDark : DEFAULT_PROPERTY_THEME.themeDark, color: isPropertyAccent(value.themeLight) ? value.themeLight : DEFAULT_PROPERTY_THEME.themeLight }}><p className="text-[10px] uppercase tracking-[.2em]" style={{ color: isPropertyAccent(value.accentColor) ? value.accentColor : DEFAULT_PROPERTY_THEME.accentColor }}>{value.themeName || "Default theme"}</p><p className="mt-2 text-xl font-semibold">Your next chapter starts here.</p><p className="mt-2 text-xs opacity-75">A quick preview of the property hero and its accents.</p><span className="mt-4 inline-block rounded-lg px-4 py-2 text-xs font-medium" style={{ backgroundColor: isPropertyAccent(value.accentColor) ? value.accentColor : DEFAULT_PROPERTY_THEME.accentColor, color: isPropertyAccent(value.themeDarker) ? value.themeDarker : DEFAULT_PROPERTY_THEME.themeDarker }}>Explore property</span></div></div>
    </div>

    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-2"><Field label="Cover image URL" value={value.coverImage} onChange={changeCover} disabled={uploading} /><UploadField label="Upload cover image" disabled={uploading} onFiles={(files) => { cancelAccentPick(); const request = accentRequest.current; void upload(files, async (url, file) => { coverFile.current = { url, file }; update("coverImage", url); await pickAccent(file, request); }); }} /><Preview url={value.coverImage} label="Cover image preview" /></div>
      <div className="space-y-2"><Field label="Developer logo URL" value={value.developerLogo} onChange={(next) => update("developerLogo", next)} disabled={uploading} /><UploadField label="Upload developer logo" disabled={uploading} onFiles={(files) => void upload(files, (url) => update("developerLogo", url))} /><Preview url={value.developerLogo} label="Developer logo preview" /></div>
    </div>

    <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="text-sm font-semibold text-accent-dark">Ordered photo gallery</h4><p className="mt-1 text-xs text-gray-500">Add photos with captions. Use the arrows to choose their display order.</p></div><div className="flex flex-wrap gap-2"><UploadField label="Upload gallery images" multiple disabled={uploading} onFiles={(files) => void upload(files, (url) => onChange((previous) => ({ ...previous, galleryImages: [...previous.galleryImages, { url, caption: "", order: previous.galleryImages.length }] })))} /><button type="button" disabled={uploading} className="inline-flex min-h-11 items-center gap-1 rounded-lg border bg-white px-3 text-xs disabled:opacity-40" onClick={() => onChange((previous) => ({ ...previous, galleryImages: [...previous.galleryImages, { url: "", caption: "", order: previous.galleryImages.length }] }))}><Plus size={14} />Add image URL</button></div></div>
      {value.galleryImages.map((image, index) => <div key={index} className="grid items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:grid-cols-[100px_1fr_auto]"><Preview url={image.url} label={`Gallery image ${index + 1} preview`} /><div className="grid gap-3 sm:grid-cols-2"><Field label={`Gallery image ${index + 1} URL`} value={image.url} disabled={uploading} onChange={(url) => onChange((previous) => ({ ...previous, galleryImages: previous.galleryImages.map((row, rowIndex) => rowIndex === index ? { ...row, url } : row) }))} /><Field label={`Gallery image ${index + 1} caption`} value={image.caption} onChange={(caption) => onChange((previous) => ({ ...previous, galleryImages: previous.galleryImages.map((row, rowIndex) => rowIndex === index ? { ...row, caption } : row) }))} /></div><div className="flex"><button type="button" disabled={uploading || index === 0} aria-label={`Move gallery image ${index + 1} up`} className="grid size-11 place-items-center disabled:opacity-30" onClick={() => move("galleryImages", index, -1)}><ArrowUp size={16} /></button><button type="button" disabled={uploading || index === value.galleryImages.length - 1} aria-label={`Move gallery image ${index + 1} down`} className="grid size-11 place-items-center disabled:opacity-30" onClick={() => move("galleryImages", index, 1)}><ArrowDown size={16} /></button><button type="button" disabled={uploading} aria-label={`Remove gallery image ${index + 1}`} className="grid size-11 place-items-center text-red-500 disabled:opacity-30" onClick={() => remove("galleryImages", index)}><Trash2 size={16} /></button></div></div>)}
      {!value.galleryImages.length && <p className="rounded-lg border border-dashed p-4 text-xs text-gray-500">No presentation gallery images added. The existing listing gallery will be used.</p>}
    </div>

    <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h4 className="text-sm font-semibold text-accent-dark">Floor plans</h4><button type="button" disabled={uploading} onClick={() => onChange((previous) => ({ ...previous, floorPlans: [...previous.floorPlans, { title: "", imageUrl: "", order: previous.floorPlans.length }] }))} className="inline-flex min-h-11 items-center gap-1 rounded-lg border bg-white px-3 text-xs disabled:opacity-40"><Plus size={14} />Add floor plan</button></div>
      {value.floorPlans.map((plan, index) => <div key={index} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-gray-600">Floor plan {index + 1}</p><div className="flex"><button type="button" disabled={uploading || index === 0} aria-label={`Move floor plan ${index + 1} up`} className="grid size-11 place-items-center disabled:opacity-30" onClick={() => move("floorPlans", index, -1)}><ArrowUp size={16} /></button><button type="button" disabled={uploading || index === value.floorPlans.length - 1} aria-label={`Move floor plan ${index + 1} down`} className="grid size-11 place-items-center disabled:opacity-30" onClick={() => move("floorPlans", index, 1)}><ArrowDown size={16} /></button><button type="button" disabled={uploading} aria-label={`Remove floor plan ${index + 1}`} className="grid size-11 place-items-center text-red-500 disabled:opacity-30" onClick={() => remove("floorPlans", index)}><Trash2 size={16} /></button></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {([['title','Title'],['imageUrl','Image URL'],['totalArea','Total area (sq ft)'],['carpetArea','Carpet area (sq ft)'],['bedrooms','Bedrooms'],['bathrooms','Bathrooms']] as const).map(([key, label]) => <Field key={key} label={`Floor plan ${index + 1} ${label}`} value={plan[key]} type={key === "title" || key === "imageUrl" ? "text" : "number"} disabled={uploading && key === "imageUrl"} onChange={(next) => onChange((previous) => ({ ...previous, floorPlans: previous.floorPlans.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === "title" || key === "imageUrl" ? next : next === "" ? undefined : Number(next) } : row) }))} />)}
      </div><UploadField label={`Upload floor plan ${index + 1} image`} disabled={uploading} onFiles={(files) => void upload(files, (imageUrl) => onChange((previous) => ({ ...previous, floorPlans: previous.floorPlans.map((row, rowIndex) => rowIndex === index ? { ...row, imageUrl } : row) })))} /><Preview url={plan.imageUrl} label={`Floor plan ${index + 1} preview`} /></div>)}
    </div>

    <div className="space-y-4"><div><h4 className="text-sm font-semibold text-accent-dark">Brochure</h4><p className="mt-1 text-xs text-gray-500">Upload the PDF or provide its URL. PDF upload records the file size automatically.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Brochure PDF URL" value={brochureUrl} disabled={uploading} onChange={(next) => { onBrochureUrlChange(next); update("brochureFileSize", undefined); }} /><Field label="Brochure source URL" value={value.brochureSourceUrl} disabled={uploading} onChange={(next) => update("brochureSourceUrl", next)} /><Field label="Brochure file size (bytes)" type="number" value={value.brochureFileSize} onChange={(next) => update("brochureFileSize", next === "" ? undefined : Number(next))} /><Field label="Brochure preview image URL" value={value.brochurePreviewImage} disabled={uploading} onChange={(next) => update("brochurePreviewImage", next)} /></div><div className="flex flex-wrap gap-3"><UploadField label="Upload brochure PDF" accept="application/pdf,.pdf" disabled={uploading} onFiles={(files) => void upload(files, (url, file) => { onBrochureUrlChange(url); update("brochureFileSize", file.size); }, true)} /><UploadField label="Upload brochure preview image" disabled={uploading} onFiles={(files) => void upload(files, (url) => update("brochurePreviewImage", url))} /><button type="button" disabled={uploading} onClick={() => { onBrochureUrlChange(""); update("brochureFileSize", undefined); update("brochureSourceUrl", ""); update("brochurePreviewImage", ""); }} className="min-h-11 px-3 text-xs text-red-600 disabled:opacity-40">Clear brochure</button></div><Preview url={value.brochurePreviewImage} label="Brochure preview" /></div>

    <div className="grid gap-4 sm:grid-cols-2"><Field label="RERA number" value={value.reraNumber} onChange={(next) => update("reraNumber", next)} /><label className="block space-y-1.5 text-xs font-medium text-gray-600"><span>Registrations / legal information</span><textarea rows={3} value={value.registrationsText} onChange={(event) => update("registrationsText", event.target.value)} className={inputClass} /></label></div>
  </section>;
}
