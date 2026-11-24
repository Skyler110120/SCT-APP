/**
 * Remote push notifications (Expo push service).
 *
 * After a student grants notification permission, this device's Expo push
 * token is registered with the API so pre-training reminders can be pushed.
 * The token is removed on sign-out so the next person on the device doesn't
 * get them. Tapping a reminder opens that session's check-in screen.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { router } from "expo-router";
import { apiFetch } from "./api";
import { logger } from "../utils/logger";

type NotificationsModule = typeof import("expo-notifications");

const REGISTERED_TOKEN_KEY = "registered_push_token";
const PRETRAINING_REMINDER = "session_pretraining_reminder";

async function loadNotifications(): Promise<NotificationsModule | null> {
  // Expo Go on Android has no push support.
  if (Platform.OS === "android" && Constants.executionEnvironment === "storeClient") return null;
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

/** Register this device for pushes. Only runs when permission is already granted. */
export async function registerPushToken(): Promise<void> {
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Reminders",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (!token) return;

    await apiFetch("/notifications/push-tokens", {
      method: "POST",
      body: JSON.stringify({ token, platform: Platform.OS }),
      suppressGlobalError: true,
    });
    await AsyncStorage.setItem(REGISTERED_TOKEN_KEY, token);
  } catch (error) {
    // Simulators have no push token; a failed registration just means no pushes.
    logger.debug("[push] Registration skipped:", error);
  }
}

/** Remove this device's token from the signed-in account. Call before clearing auth. */
export async function unregisterPushToken(): Promise<void> {
  try {
    const token = await AsyncStorage.getItem(REGISTERED_TOKEN_KEY);
    if (!token) return;
    await AsyncStorage.removeItem(REGISTERED_TOKEN_KEY);
    await apiFetch("/notifications/push-tokens/remove", {
      method: "POST",
      body: JSON.stringify({ token }),
      suppressGlobalError: true,
    });
  } catch (error) {
    logger.debug("[push] Unregister failed:", error);
  }
}

/** Where a tapped notification should take the user, or null to stay put. */
export function routeForNotificationData(data: Record<string, unknown> | undefined | null) {
  if (!data || data.type !== PRETRAINING_REMINDER) return null;
  const sessionId = Number(data.session_id);
  if (!Number.isFinite(sessionId) || sessionId <= 0) return null;
  return { pathname: "/company/session-check-in" as const, params: { sessionId: String(sessionId) } };
}

let lastHandledResponseId: string | null = null;

function openFromResponse(response: { notification: { request: { identifier: string; content: { data?: any } } } } | null) {
  if (!response) return;
  const id = response.notification.request.identifier;
  if (id === lastHandledResponseId) return;
  lastHandledResponseId = id;
  const route = routeForNotificationData(response.notification.request.content.data);
  if (route) router.push(route);
}

/** Open the check-in screen when a reminder is tapped, including from a cold start. */
export function subscribeToNotificationTaps(): () => void {
  let subscription: { remove: () => void } | null = null;
  let cancelled = false;
  void (async () => {
    const Notifications = await loadNotifications();
    if (!Notifications || cancelled) return;
    try {
      openFromResponse(await Notifications.getLastNotificationResponseAsync());
    } catch {
      // ignore
    }
    subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse);
  })();
  return () => {
    cancelled = true;
    subscription?.remove();
  };
}
