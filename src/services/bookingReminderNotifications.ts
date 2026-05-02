/* eslint-disable import/no-unresolved */
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { sessionService } from "./sessionService";
import { getWeekBounds, isWednesday } from "@/src/utils/dateTimeUtils";
import { UserRole } from "@/src/types/enums";

const REMINDER_STORAGE_KEY_PREFIX = "booking_reminder_sent_week_";
type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let didLogExpoGoNotice = false;

function isUnsupportedNotificationEnvironment(): boolean {
  // Expo Go on Android does not support the push APIs used by expo-notifications.
  return (
    Platform.OS === "android" && Constants.executionEnvironment === "storeClient"
  );
}

function logUnsupportedEnvironmentOnce(): void {
  if (didLogExpoGoNotice) return;
  didLogExpoGoNotice = true;
  console.info(
    "[notifications] Skipping notification setup in Expo Go on Android. Use a development build to test notifications."
  );
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (isUnsupportedNotificationEnvironment()) {
    logUnsupportedEnvironmentOnce();
    return null;
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications").catch((error) => {
      console.warn("Failed to load expo-notifications:", error);
      return null;
    });
  }

  return notificationsModulePromise;
}

/** Configure how notifications appear when app is in foreground */
export function setNotificationHandler(): void {
  void (async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
      }),
    });
  })();
}

/** Request notification permissions. Call when user is a student (e.g. on app open). */
export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Storage key for "we already sent a reminder this week" (week = Sunday date YYYY-MM-DD). */
function reminderSentKeyForWeek(startDate: string): string {
  return `${REMINDER_STORAGE_KEY_PREFIX}${startDate}`;
}

/** Check if today is Wednesday, user is student, and they haven't booked this week; if so, send a local reminder (at most once per week). */
export async function checkAndNotifyWednesdayBookingReminder(
  user: { role: string } | null
): Promise<void> {
  if (!user || user.role !== UserRole.STUDENT) return;

  const today = new Date();
  if (!isWednesday(today)) return;

  const { startDate, endDate } = getWeekBounds(today);
  const key = reminderSentKeyForWeek(startDate);
  const alreadySent = await AsyncStorage.getItem(key);
  if (alreadySent === "1") return;

  try {
    const res = await sessionService.getMyCalendarSessions({
      start_date: startDate,
      end_date: endDate,
    });
    if (!res.success || !res.data) return;

    const scheduled = (res.data || []).filter(
      (s) =>
        s.status?.toLowerCase() === "scheduled" ||
        s.status?.toLowerCase() === "in_progress"
    );
    if (scheduled.length > 0) return;

    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Book your session",
        body: "You haven't booked a session for this week yet. Tap to open the Calendar and pick a time.",
        sound: true,
      },
      trigger: null,
    });
    await AsyncStorage.setItem(key, "1");
  } catch (e) {
    console.warn("Wednesday booking reminder check failed:", e);
  }
}
