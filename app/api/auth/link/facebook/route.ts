import { NextRequest, NextResponse } from "next/server";

// Facebook OAuth 2.0
// Documentation: https://developers.facebook.com/docs/facebook-login/guides/advanced/manual-flow

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

  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) {
    return NextResponse.json(
      { error: "Facebook is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook-link`;
  
  // State contains userId and workspaceId
  const state = Buffer.from(
    JSON.stringify({ 
      userId, 
      workspaceId, 
      timestamp: Date.now() 
    })
  ).toString("base64");

  // Facebook permissions for posting to pages
  // pages_show_list - List pages user manages
  // pages_read_engagement - Read page engagement
  // pages_manage_posts - Create and manage page posts
  // public_profile - Basic profile info
  const scopes = [
    "public_profile",
    "email",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
  ];

  const authUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes.join(","));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");

  return NextResponse.redirect(authUrl.toString());
}
