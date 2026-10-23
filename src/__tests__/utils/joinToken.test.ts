import { extractCompanyIdFromToken } from "../../utils/joinToken";

const base64Url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const jwtWith = (payload: object) => `${base64Url({ alg: "HS256" })}.${base64Url(payload)}.signature`;

describe("extractCompanyIdFromToken", () => {
  it("reads company_id from an onboarding JWT payload", () => {
    expect(extractCompanyIdFromToken(jwtWith({ type: "onboarding", company_id: 42 }))).toBe(42);
  });

  it("returns null for tokens without a usable company_id", () => {
    expect(extractCompanyIdFromToken(jwtWith({ type: "onboarding" }))).toBeNull();
    expect(extractCompanyIdFromToken(jwtWith({ company_id: "abc" }))).toBeNull();
  });

  it("returns null for malformed tokens", () => {
    expect(extractCompanyIdFromToken("not-a-jwt")).toBeNull();
    expect(extractCompanyIdFromToken("a.%%%.c")).toBeNull();
  });
});
