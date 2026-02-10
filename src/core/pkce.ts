const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
const CODE_VERIFIER_MIN_LENGTH = 43;
const CODE_VERIFIER_MAX_LENGTH = 128;
const DEFAULT_CODE_VERIFIER_LENGTH = 64;

export function generateCodeVerifier(
  length = DEFAULT_CODE_VERIFIER_LENGTH,
): string {
  if (length < CODE_VERIFIER_MIN_LENGTH || length > CODE_VERIFIER_MAX_LENGTH) {
    throw new Error(
      `Code verifier length must be between ${CODE_VERIFIER_MIN_LENGTH} and ${CODE_VERIFIER_MAX_LENGTH}`,
    );
  }
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (byte) => CHARSET[byte % CHARSET.length]).join("");
}

export async function generateCodeChallenge(
  codeVerifier: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function generateState(): string {
  return generateCodeVerifier(43);
}
