import { NextResponse } from "next/server";

interface InstagramMedia {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  caption?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

function isConfiguredToken(token: string | undefined) {
  return Boolean(token && token.trim() && !token.startsWith("IGQVJV..."));
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!isConfiguredToken(token)) {
    return NextResponse.json(
      { error: "Instagram access token is not configured" },
      { status: 503 },
    );
  }

  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  url.searchParams.set("access_token", token as string);

  try {
    const response = await fetch(url, { next: { revalidate: 900 } });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Instagram API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch live Instagram media" },
        { status: response.status },
      );
    }

    const data = await response.json();

    const posts = (data.data || [])
      .filter((item: InstagramMedia) =>
        ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"].includes(item.media_type),
      )
      .map((item: InstagramMedia) => ({
        id: item.id,
        image: item.thumbnail_url || item.media_url,
        permalink: item.permalink,
        caption: item.caption || "",
        likes: item.like_count || 0,
        comments: item.comments_count || 0,
        mediaType: item.media_type,
        timestamp: item.timestamp,
      }))
      .filter((item: { image?: string; permalink?: string }) => item.image && item.permalink)
      .slice(0, 12);

    return NextResponse.json({
      data: posts,
      source: "instagram_api",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Instagram Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to load Instagram media" },
      { status: 500 },
    );
  }
}
