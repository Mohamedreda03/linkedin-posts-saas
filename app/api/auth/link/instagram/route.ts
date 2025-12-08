import { NextRequest, NextResponse } from "next/server";

// Instagram uses Facebook OAuth (Instagram Graph API)
// Documentation: https://developers.facebook.com/docs/instagram-api/getting-started

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const workspaceId = searchParams.get("workspaceId");

  if (!userId || !workspaceId) {
    return NextResponse.json(
      { error: "userId and workspaceId are required" },
      { status: 400 }
    );
  }

  const appId = process.env.FACEBOOK_APP_ID; // Instagram uses Facebook App
  if (!appId) {
    return NextResponse.json(
      { error: "Instagram is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram-link`;
  
  // State contains userId and workspaceId
  const state = Buffer.from(
    JSON.stringify({ 
      userId, 
      workspaceId, 
      timestamp: Date.now() 
    })
  ).toString("base64");

  // Instagram Business API permissions (through Facebook)
  // instagram_basic - Basic profile info
  // instagram_content_publish - Publish content
  // pages_show_list - Required for Instagram Business accounts
  // pages_read_engagement - Required for Instagram
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "business_management",
  ];

  const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes.join(","));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
