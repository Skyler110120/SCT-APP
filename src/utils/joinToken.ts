const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const decodeBase64 = (input: string): string => {
  if (typeof globalThis.atob === "function") return globalThis.atob(input);
  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const char of input.replace(/=+$/, "")) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value < 0) throw new Error("Invalid base64");
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
};

/** Reads company_id from an onboarding JWT payload without verifying it (the API verifies). */
export function extractCompanyIdFromToken(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = JSON.parse(decodeBase64(payload));
    const companyId = Number(decoded?.company_id);
    return Number.isFinite(companyId) && companyId > 0 ? companyId : null;
  } catch {
    return null;
  }
}
