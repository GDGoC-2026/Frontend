export type TokenPayload = {
  exp?: number;
  [key: string]: unknown;
};

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return atob(padded);
}

export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string) {
  return decodeTokenPayload(token)?.exp ?? null;
}

export function isTokenExpired(token: string) {
  const expiration = getTokenExpiration(token);

  if (!expiration) {
    return false;
  }

  return expiration <= Math.floor(Date.now() / 1000);
}
