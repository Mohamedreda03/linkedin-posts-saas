import { NextRequest, NextResponse } from "next/server";

// This endpoint initiates the LinkedIn OAuth flow for linking accounts
// It stores the appwrite userId and workspaceId in the state parameter

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

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin-link`;
  
  // State contains userId and workspaceId for later association
  const state = Buffer.from(JSON.stringify({ userId, workspaceId, timestamp: Date.now() })).toString("base64");

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId!);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "openid profile email w_member_social");

  return NextResponse.redirect(authUrl.toString());
}
