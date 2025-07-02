export const PATREON_AUTH_URL = "https://www.patreon.com/oauth2/authorize";
export const PATREON_TOKEN_URL = "https://www.patreon.com/api/oauth2/token";
export const PATREON_IDENTITY_URL =
  "https://www.patreon.com/api/oauth2/v2/identity?include=email";

/**
 * Generate the Patreon OAuth authorization URL for the user to approve access.
 */
export function getPatreonAuthUrl(state: string = "state") {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.PATREON_CLIENT_ID || "",
    redirect_uri: process.env.PATREON_REDIRECT_URI || "",
    scope: "identity identity[email]",
    state,
  });
  return `${PATREON_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange the OAuth authorization code for an access token.
 */
export async function getPatreonAccessToken(code: string) {
  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", process.env.PATREON_CLIENT_ID || "");
  params.append("client_secret", process.env.PATREON_CLIENT_SECRET || "");
  params.append("redirect_uri", process.env.PATREON_REDIRECT_URI || "");
  params.append("grant_type", "authorization_code");

  const res = await fetch(PATREON_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Failed to get token: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshPatreonAccessToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append("refresh_token", refreshToken);
  params.append("client_id", process.env.PATREON_CLIENT_ID || "");
  params.append("client_secret", process.env.PATREON_CLIENT_SECRET || "");
  params.append("grant_type", "refresh_token");

  const res = await fetch(PATREON_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!res.ok) {
    throw new Error(`Failed to refresh token: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
  };
}

/**
 * Retrieve the user's Patreon profile information using the access token.
 */
export async function getPatreonUserInfo(token: string) {
  const res = await fetch(PATREON_IDENTITY_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
