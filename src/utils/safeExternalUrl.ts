import { Linking } from "react-native";
import * as WebBrowser from "expo-web-browser";

const STRIPE_HOST_SUFFIX = ".stripe.com";

function isAllowedStripeHost(hostname: string): boolean {
  return hostname === "stripe.com" || hostname.endsWith(STRIPE_HOST_SUFFIX);
}

function isTrustedStripeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && isAllowedStripeHost(parsed.hostname);
  } catch {
    return false;
  }
}

export async function openStripeHostedUrl(url: string): Promise<boolean> {
  if (!isTrustedStripeUrl(url)) {
    return false;
  }

  try {
    const browserResult = await WebBrowser.openBrowserAsync(url);
    if (
      browserResult.type === "opened" ||
      browserResult.type === "cancel" ||
      browserResult.type === "dismiss"
    ) {
      return true;
    }
  } catch {
    // fall through to Linking
  }

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) return false;
  await Linking.openURL(url);
  return true;
}
