/**
 * Tests for safeExternalUrl — Stripe-hosted URL trust gate.
 *
 * This is a SECURITY-critical helper: it prevents the mobile app from
 * opening attacker-supplied redirect URLs returned by the API. Any change to
 * the allow-list rules should break these tests.
 */
import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { openStripeHostedUrl } from "../../utils/safeExternalUrl";

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: jest.fn(),
}));

const mockOpenBrowserAsync = WebBrowser.openBrowserAsync as jest.MockedFunction<
  typeof WebBrowser.openBrowserAsync
>;

describe("openStripeHostedUrl", () => {
  let canOpenSpy: jest.SpyInstance;
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    canOpenSpy = jest.spyOn(Linking, "canOpenURL").mockResolvedValue(true);
    openSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  });

  afterEach(() => {
    canOpenSpy.mockRestore();
    openSpy.mockRestore();
  });

  it("opens trusted https://checkout.stripe.com URLs via WebBrowser", async () => {
    mockOpenBrowserAsync.mockResolvedValueOnce({ type: "opened" } as any);

    const result = await openStripeHostedUrl(
      "https://checkout.stripe.com/c/pay/cs_test_123"
    );

    expect(result).toBe(true);
    expect(mockOpenBrowserAsync).toHaveBeenCalledWith(
      "https://checkout.stripe.com/c/pay/cs_test_123"
    );
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("opens billing.stripe.com (subdomain) URLs", async () => {
    mockOpenBrowserAsync.mockResolvedValueOnce({ type: "dismiss" } as any);

    const result = await openStripeHostedUrl(
      "https://billing.stripe.com/p/session/abc"
    );

    expect(result).toBe(true);
  });

  it("accepts the bare stripe.com host", async () => {
    mockOpenBrowserAsync.mockResolvedValueOnce({ type: "opened" } as any);

    const result = await openStripeHostedUrl("https://stripe.com/connect");

    expect(result).toBe(true);
  });

  it("rejects non-https Stripe URLs (no opener invoked)", async () => {
    const result = await openStripeHostedUrl("http://checkout.stripe.com/cs_x");

    expect(result).toBe(false);
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("rejects attacker-controlled lookalike hosts ending in stripe.com.evil.com", async () => {
    const result = await openStripeHostedUrl(
      "https://checkout.stripe.com.evil.com/phish"
    );

    expect(result).toBe(false);
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
  });

  it("rejects non-stripe hosts", async () => {
    const result = await openStripeHostedUrl("https://example.com/redirect");

    expect(result).toBe(false);
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
  });

  it("rejects URLs with embedded credentials prior to the host (defense in depth)", async () => {
    // URL parser keeps the hostname as the host portion, but this verifies the
    // shape we accept does not get tricked into trusting a non-stripe host.
    const result = await openStripeHostedUrl(
      "https://evil.com#@checkout.stripe.com"
    );

    expect(result).toBe(false);
  });

  it("falls back to Linking when WebBrowser fails but URL still trusted", async () => {
    mockOpenBrowserAsync.mockRejectedValueOnce(new Error("browser unavailable"));

    const result = await openStripeHostedUrl(
      "https://checkout.stripe.com/c/pay/cs_test_999"
    );

    expect(result).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(
      "https://checkout.stripe.com/c/pay/cs_test_999"
    );
  });

  it("returns false when WebBrowser fails and device cannot open URL", async () => {
    mockOpenBrowserAsync.mockRejectedValueOnce(new Error("browser unavailable"));
    canOpenSpy.mockResolvedValueOnce(false);

    const result = await openStripeHostedUrl(
      "https://checkout.stripe.com/c/pay/cs_test_999"
    );

    expect(result).toBe(false);
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("rejects garbage / unparseable URLs", async () => {
    expect(await openStripeHostedUrl("not-a-url")).toBe(false);
    expect(await openStripeHostedUrl("")).toBe(false);
    expect(mockOpenBrowserAsync).not.toHaveBeenCalled();
  });
});
