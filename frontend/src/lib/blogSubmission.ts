import { Inquiry } from "@/types";

export interface ParsedBlogSubmission {
  title: string;
  pdfUrl?: string;
  location?: string;
}

type BlogInquiry = Inquiry & { title?: string; pdfUrl?: string };

export function isBlogSubmission(inq: Inquiry): boolean {
  const inqType = (inq.type || "").toUpperCase();
  return (
    inqType === "BLOG_SUBMISSION" ||
    (inq.message || "").includes("BLOG ARTICLE SUBMISSION")
  );
}

export function parseBlogSubmission(inq: BlogInquiry): ParsedBlogSubmission {
  const message = inq.message || "";

  const titleMatch = message.match(/Title:\s*(.+)/i);
  const pdfMatch = message.match(/PDF Document URL:\s*(https?:\/\/\S+)/i);
  const locationMatch = message.match(/Location:\s*(.+)/i);

  return {
    title:
      inq.title?.trim() ||
      titleMatch?.[1]?.trim() ||
      "Untitled Article",
    pdfUrl: inq.pdfUrl?.trim() || pdfMatch?.[1]?.trim(),
    location:
      inq.location?.trim() ||
      inq.city?.trim() ||
      locationMatch?.[1]?.trim(),
  };
}

export function getInquiryLocation(inq: Inquiry): string | undefined {
  if (isBlogSubmission(inq)) {
    return parseBlogSubmission(inq).location;
  }
  return inq.location?.trim() || inq.city?.trim();
}

export function buildBlogSubmissionMessage(data: {
  name: string;
  phone: string;
  location: string;
  title: string;
  pdfUrl: string;
}): string {
  return `📄 BLOG ARTICLE SUBMISSION
Title: ${data.title.trim()}
Author Name: ${data.name.trim()}
Author Phone: ${data.phone.trim()}
Location: ${data.location.trim()}
PDF Document URL: ${data.pdfUrl}`;
}

/** Normalize Indian mobile numbers for tel:/wa.me links. */
export function authorTelHref(phone?: string): string | null {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const national = digits.slice(-10);
  return `tel:+91${national}`;
}

export function authorWhatsAppHref(
  phone?: string,
  message?: string,
): string | null {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  const national = digits.slice(-10);
  const base = `https://wa.me/91${national}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function blogReviewMessage(inq: Inquiry): string {
  const { title } = parseBlogSubmission(inq);
  return `Hi ${inq.name || "there"}, this is Rupali Homes regarding your blog article submission "${title}". We would like to connect with you.`;
}
