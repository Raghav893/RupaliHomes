import type { jsPDF as PdfDocument } from "jspdf";
import type { RowInput, Styles } from "jspdf-autotable";
import type { Property } from "@/types";
import {
  buildComparisonSections,
  comparisonHighlights,
  MAX_COMPARE_PROPERTIES,
  propertyPath,
  propertyPriceLabel,
} from "@/lib/property-comparison";

const NAVY = "#0B2240";
const ORANGE = "#FF5400";
const MUTED = "#64748B";
let fontsPromise: Promise<string[]> | undefined;

async function fetchAsset(url: string, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: "force-cache" });
    if (!response.ok) throw new Error(`Could not load PDF asset (${response.status}).`);
    return await response.blob();
  } finally {
    clearTimeout(timer);
  }
}

async function fontData(path: string) {
  const bytes = new Uint8Array(await (await fetchAsset(path)).arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([fontData("/fonts/Lato-Regular.ttf"), fontData("/fonts/Lato-Bold.ttf")])
      .catch((error) => { fontsPromise = undefined; throw error; });
  }
  return fontsPromise;
}

async function propertyPhoto(property: Property): Promise<string | null> {
  if (!property.imageUrl) return null;
  let objectUrl: string | undefined;
  try {
    // Use the site's existing image proxy so cross-origin photos cannot taint the canvas.
    const query = new URLSearchParams({ url: property.imageUrl, w: "640", q: "75" });
    const blob = await fetchAsset(`/_next/image?${query}`, 12000);
    objectUrl = URL.createObjectURL(blob);
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Property photo is unavailable."));
      element.src = objectUrl!;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 300;
    const context = canvas.getContext("2d");
    if (!context || !image.naturalWidth || !image.naturalHeight) return null;
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    context.fillStyle = "#f1f5f9";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    // Missing photos should not prevent the visitor from downloading their comparison.
    return null;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

/** Use plain text, preserving paragraphs, rather than HTML in the PDF generator. */
function pdfText(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[\u2010-\u2015]/g, "-");
}

function brandHeader(doc: PdfDocument, width: number) {
  doc.setFillColor(ORANGE);
  doc.rect(0, 0, width, 2, "F");
  doc.setFont("Lato", "bold");
  doc.setFontSize(15);
  doc.setTextColor(NAVY);
  doc.text("Rupali", 14, 14);
  const offset = doc.getTextWidth("Rupali") + 1.5;
  doc.setTextColor(ORANGE);
  doc.text("Homes", 14 + offset, 14);
  doc.setFontSize(8);
  doc.setTextColor(MUTED);
  doc.text("PROPERTY COMPARISON", width - 14, 13, { align: "right" });
}

export async function downloadComparisonPdf(
  properties: Property[],
  options: { differencesOnly?: boolean } = {},
) {
  if (properties.length < 2 || properties.length > MAX_COMPARE_PROPERTIES) throw new Error("Select two or three properties to export.");
  const [{ jsPDF }, { autoTable }, fonts, photos] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    loadFonts(),
    Promise.all(properties.map(propertyPhoto)),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true, putOnlyUsedFonts: true });
  doc.addFileToVFS("Lato-Regular.ttf", fonts[0]);
  doc.addFont("Lato-Regular.ttf", "Lato", "normal");
  doc.addFileToVFS("Lato-Bold.ttf", fonts[1]);
  doc.addFont("Lato-Bold.ttf", "Lato", "bold");
  doc.setFont("Lato", "normal");
  doc.setProperties({ title: "Rupali Homes - Property comparison", subject: properties.map((property) => property.title).join(" | "), author: "Rupali Homes", creator: "Rupali Homes property comparison" });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 14;
  const labelWidth = 48;
  const columnWidth = (width - margin * 2 - labelWidth) / properties.length;
  const generated = new Date();
  const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(generated);
  const mode = options.differencesOnly ? "Differences only" : "Full comparison";
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "https://rupalihomes.com";

  brandHeader(doc, width);
  doc.setFont("Lato", "bold");
  doc.setFontSize(21);
  doc.setTextColor(NAVY);
  doc.text("A closer look at your shortlist.", margin, 29);
  doc.setFont("Lato", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(`${properties.length} properties | ${mode} | Generated ${date}`, margin, 36);

  doc.setFont("Lato", "bold");
  doc.setFontSize(8);
  doc.setTextColor(ORANGE);
  doc.text("YOUR SHORTLIST", margin, 49);
  const insights = comparisonHighlights(properties);
  let insightY = 57;
  for (const insight of insights) {
    doc.setFont("Lato", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED);
    doc.text(insight.label, margin, insightY);
    doc.setFont("Lato", "bold");
    doc.setTextColor(NAVY);
    doc.setFontSize(9);
    doc.text(pdfText(insight.value), margin, insightY + 5);
    insightY += 15;
  }
  if (!insights.length) {
    doc.setFont("Lato", "normal");
    doc.setFontSize(9);
    doc.setTextColor(MUTED);
    doc.text(doc.splitTextToSize("Compare the details that matter to you, then explore each property.", labelWidth - 8), margin, 57);
  }

  properties.forEach((property, index) => {
    const x = margin + labelWidth + index * columnWidth + 3;
    const cardWidth = columnWidth - 6;
    if (photos[index]) {
      doc.addImage(photos[index]!, "JPEG", x, 44, cardWidth, 28);
    } else {
      doc.setFillColor("#F1F5F9");
      doc.roundedRect(x, 44, cardWidth, 28, 2, 2, "F");
      doc.setFontSize(8);
      doc.setTextColor(MUTED);
      doc.text("Property photo not available", x + cardWidth / 2, 59, { align: "center" });
    }
    doc.setFont("Lato", "bold");
    doc.setFontSize(10);
    doc.setTextColor(NAVY);
    const title: string[] = doc.splitTextToSize(pdfText(`${index + 1}. ${property.title}`), cardWidth);
    doc.text(title.slice(0, 2), x, 79);
    doc.setFontSize(10);
    doc.setTextColor(ORANGE);
    doc.text(pdfText(propertyPriceLabel(property)), x, 92);
    doc.setFont("Lato", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.textWithLink(`View property RH-${property.id} >`, x, 99, { url: new URL(propertyPath(property), siteOrigin).href });
  });

  const sections = buildComparisonSections(properties, options.differencesOnly);
  const columnStyles: Record<number, Partial<Styles>> = { 0: { cellWidth: labelWidth, fillColor: "#F8FAFC", textColor: MUTED, fontStyle: "bold" } };
  properties.forEach((_, index) => { columnStyles[index + 1] = { cellWidth: columnWidth }; });
  let cursor = 103;

  for (const section of sections) {
    const body: RowInput[] = section.rows.map((row) => [
      pdfText(row.label),
      ...row.values.map((value) => ({
        content: pdfText(`${value.text}${value.highlight ? `\n${value.highlight}` : ""}`),
        styles: {
          textColor: value.href ? ORANGE : value.missing ? "#94A3B8" : NAVY,
          ...(value.highlight ? { fillColor: "#F0FDF4", fontStyle: "bold" as const } : {}),
        },
      })),
    ]);
    autoTable(doc, {
      startY: cursor,
      margin: { left: margin, right: margin, top: 27, bottom: 22 },
      head: [[section.title, ...properties.map((property, index) => pdfText(`${index + 1}. ${property.title}`))]],
      body,
      theme: "grid",
      pageBreak: "avoid",
      rowPageBreak: "avoid",
      showHead: "everyPage",
      styles: { font: "Lato", fontStyle: "normal", fontSize: 8.5, cellPadding: 2.5, lineColor: "#E2E8F0", lineWidth: 0.15, valign: "top", overflow: "linebreak", minCellHeight: 8.5 },
      headStyles: { fillColor: NAVY, textColor: "#FFFFFF", fontStyle: "bold", fontSize: 9, minCellHeight: 10 },
      columnStyles,
      didDrawCell(data) {
        if (data.section !== "body" || data.column.index === 0) return;
        const href = section.rows[data.row.index]?.values[data.column.index - 1]?.href;
        if (href) doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: href });
      },
    });
    cursor = ((doc as PdfDocument & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 27) + 4;
  }

  if (!sections.length) {
    doc.setFontSize(10);
    doc.setTextColor(MUTED);
    doc.text("No differences in the listed property details.", margin, cursor + 5);
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    if (page > 1) {
      brandHeader(doc, width);
      doc.setDrawColor("#E2E8F0");
      doc.line(margin, 20, width - margin, 20);
    }
    doc.setDrawColor("#E2E8F0");
    doc.line(margin, height - 17, width - margin, height - 17);
    doc.setFont("Lato", "normal");
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text('Rates use the listed area. "Not listed" means information has not been provided.', margin, height - 11);
    doc.text(`Rupali Homes | ${mode} | ${page} / ${totalPages}`, width - margin, height - 11, { align: "right" });
  }
  const stamp = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Kolkata" }).format(generated);
  await doc.save(`Rupali-Homes-Comparison-${stamp}${options.differencesOnly ? "-Differences" : ""}.pdf`, { returnPromise: true });
}
