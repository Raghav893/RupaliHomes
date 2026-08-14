import { NextResponse } from "next/server";

// Proxy for Mappls Autosuggest. Mappls' search API does not send CORS headers,
// so browsers can't call it directly (net::ERR_FAILED despite a 200). Calling it
// from this route keeps the request same-origin and hides the API key from the
// client bundle. Key is server-side only: MAPPLS_API_KEY or NEXT_PUBLIC_MAPPLS_API_KEY.
const MAPPLS_API_KEY =
  process.env.MAPPLS_API_KEY || process.env.NEXT_PUBLIC_MAPPLS_API_KEY || "";
const MAPPLS_URL = "https://search.mappls.com/search/places/autosuggest/json";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").trim();
  const location = searchParams.get("location") || "28.6139,77.2090";

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }
  if (!MAPPLS_API_KEY) {
    return NextResponse.json(
      { error: "Mappls API key is not configured" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams();
  params.set("query", query);
  params.set("location", location);
  params.set("region", "IND");
  params.set("access_token", MAPPLS_API_KEY);

  try {
    const res = await fetch(`${MAPPLS_URL}?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Mappls returned ${res.status}` },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Mappls autosuggest error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Mappls autosuggest failed";
    return NextResponse.json({ error: errorMessage }, { status: 502 });
  }
}
