import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 20 * 1024 * 1024;

function publicAddress(address: string) {
  if (isIP(address) === 4) {
    const [a,b] = address.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0)) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)));
  }
  return isIP(address) === 6 && /^[23]/i.test(address) && !/^2001:db8:/i.test(address);
}

async function publicUrl(value: string) {
  const url = new URL(value);
  if (!["http:","https:"].includes(url.protocol) || url.username || url.password || (url.port && !["80","443"].includes(url.port))) throw new Error("Invalid document URL");
  const addresses = await lookup(url.hostname.replace(/^\[|\]$/g,""), { all: true });
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error("Invalid document host");
  return url;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return Response.json({ error: "Property not found" }, { status: 404 });
  try {
    const api = process.env.NEXT_PUBLIC_API_URL || "https://api.rupalihomes.com";
    const propertyResponse = await fetch(`${api}/properties/${id}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!propertyResponse.ok) return Response.json({ error: "Property not found" }, { status: 404 });
    const property = await propertyResponse.json();
    if (typeof property.brochureUrl !== "string" || !property.brochureUrl.trim()) return Response.json({ error: "Brochure not available" }, { status: 404 });
    let url = await publicUrl(property.brochureUrl);
    let document: Response | undefined;
    for (let redirect = 0; redirect <= 3; redirect++) {
      document = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000) });
      if (document.status >= 300 && document.status < 400) {
        const location = document.headers.get("location");
        await document.body?.cancel();
        if (!location || redirect === 3) throw new Error("Document redirect failed");
        url = await publicUrl(new URL(location, url).href);
      } else break;
    }
    if (!document?.ok || !document.body) throw new Error("Document unavailable");
    if (Number(document.headers.get("content-length")) > MAX_BYTES) { await document.body.cancel(); throw new Error("Document too large"); }
    const reader = document.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    // Validate the header, then stream instead of buffering the PDF in a Vercel function.
    while (length < 1024) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); throw new Error("Document too large"); }
      chunks.push(result.value);
    }
    const prefix = Buffer.concat(chunks);
    if (!prefix.subarray(0,1024).includes(Buffer.from("%PDF-"))) { await reader.cancel(); throw new Error("Document is not a PDF"); }
    const stream = new ReadableStream<Uint8Array>({
      start(controller) { controller.enqueue(prefix); },
      async pull(controller) {
        try {
          const result = await reader.read();
          if (result.done) { controller.close(); return; }
          length += result.value.byteLength;
          if (length > MAX_BYTES) { await reader.cancel(); controller.error(new Error("Document too large")); return; }
          controller.enqueue(result.value);
        } catch (error) { controller.error(error); }
      },
      cancel() { return reader.cancel(); },
    });
    const title = typeof property.title === "string" ? property.title : "property";
    const slug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100) || "property";
    return new Response(stream, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${slug}-developer.pdf"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return Response.json({ error: "The brochure could not be downloaded. Please try the original source or try again later." }, { status: 502 });
  }
}
