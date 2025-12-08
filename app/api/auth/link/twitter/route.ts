import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Twitter OAuth 2.0 with PKCE
// Documentation: https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code

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

  const clientId = process.env.TWITTER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Twitter is not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter-link`;
  
  // Generate PKCE code verifier and challenge
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // State contains userId, workspaceId, and codeVerifier for PKCE
  const state = Buffer.from(
    JSON.stringify({ 
      userId, 
      workspaceId, 
      codeVerifier,
      timestamp: Date.now() 
    })
  ).toString("base64");

  // Twitter OAuth 2.0 scopes
  // tweet.read - Read tweets
  // tweet.write - Post tweets
  // users.read - Read user profile
  // offline.access - Get refresh token
  const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"];

  const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scopes.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authUrl.toString());
}
