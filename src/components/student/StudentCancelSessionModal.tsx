import { themes } from "@/src/context/themes";
import { sessionService } from "@/src/services/sessionService";
import { SessionDetailed } from "@/src/types/sessions.types";
import { formatDateForAPI, formatDateString, formatTimeString } from "@/src/utils/dateTimeUtils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Mode = "loading" | "simple" | "has_future";

type Props = {
  session: SessionDetailed | null;
  onClose: () => void;
  /** Called after any successful cancellation so the caller can reload. */
  onCancelled: () => void;
  /** Called after "Reschedule this week" with the cancelled session's date (YYYY-MM-DD). */
  onReschedule: (date: string) => void;
};

const isScheduled = (s: SessionDetailed) => (s.status ?? "").toLowerCase() === "scheduled";

/** Matches the API's `can_be_cancelled` rule: scheduled sessions can be cancelled up to 1 hour before start. */
const CANCEL_CUTOFF_MINUTES = 60;
export const CANCEL_CUTOFF_NOTE = "Can't cancel within 1 hour of start";

/** null = not a booked/scheduled session (no cancel action at all); false = inside the cutoff (show disabled). */
export function studentCancelState(session: SessionDetailed): boolean | null {
  if (!isScheduled(session)) return null;
  if (session.can_be_cancelled === false) return false;
  return new Date(session.start_time).getTime() - Date.now() > CANCEL_CUTOFF_MINUTES * 60 * 1000;
}

/** Student cancel flow (mirrors web StudentDashboard). The API cancels later bookings after a gap. */
export default function StudentCancelSessionModal({ session, onClose, onCancelled, onReschedule }: Props) {
  const [mode, setMode] = useState<Mode>("loading");
  const [futureSessions, setFutureSessions] = useState<SessionDetailed[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setError(null);
    setMode("loading");
    (async () => {
      const today = new Date();
      const end = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
      const res = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(today),
        end_date: formatDateForAPI(end),
      });
      const cancelledStart = new Date(session.start_time).getTime();
      const later = (res.success && res.data ? res.data : []).filter(
        (s) =>
          s.id !== session.id &&
          isScheduled(s) &&
          new Date(s.start_time).getTime() > cancelledStart
      );
      setFutureSessions(later);
      setMode(later.length > 0 ? "has_future" : "simple");
    })();
  }, [session]);

  if (!session) return null;

  const cancelPrimary = async (): Promise<boolean> => {
    const result = await sessionService.cancelSession(session.id);
    if (!result.success) {
      setError(result.error || "Failed to cancel session");
      return false;
    }
    return true;
  };

  const run = async (action: () => Promise<void>) => {
    setIsCancelling(true);
    setError(null);
    try {
      await action();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelOnly = () =>
    run(async () => {
      if (!(await cancelPrimary())) return;
      onCancelled();
      onClose();
    });

  const handleReschedule = () =>
    run(async () => {
      if (!(await cancelPrimary())) return;
      onCancelled();
      onClose();
      onReschedule(formatDateForAPI(new Date(session.start_time)));
    });

  const handleCancelAll = () =>
    run(async () => {
      if (!(await cancelPrimary())) return;
      // The server usually cancels these already; cancel any that are still scheduled.
      const today = new Date();
      const end = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
      const res = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(today),
        end_date: formatDateForAPI(end),
      });
      const futureIds = new Set(futureSessions.map((s) => s.id));
      const stillScheduled = (res.success && res.data ? res.data : []).filter(
        (s) => futureIds.has(s.id) && isScheduled(s)
      );
      for (const s of stillScheduled) {
        const result = await sessionService.cancelSession(s.id);
        if (!result.success) {
          setError(result.error || "Failed to cancel session");
          onCancelled();
          return;
        }
      }
      onCancelled();
      onClose();
    });

  const count = futureSessions.length;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Cancel session</Text>

          {mode === "loading" ? (
            <ActivityIndicator color={themes.vegasGold} style={{ marginVertical: 24 }} />
          ) : mode === "simple" ? (
            <Text style={styles.body}>
              Are you sure you want to cancel this session on{" "}
              <Text style={styles.bold}>{formatDateString(session.start_time)}</Text> at{" "}
              <Text style={styles.bold}>{formatTimeString(session.start_time)}</Text>?
            </Text>
          ) : (
            <>
              <Text style={styles.body}>
                You have <Text style={styles.bold}>{count}</Text> session{count !== 1 ? "s" : ""}{" "}
                scheduled after this one. Cancelling this session leaves a gap in your program, so
                those later sessions will be cancelled too.
              </Text>
              <Text style={styles.body}>
                Choose <Text style={styles.bold}>Reschedule this week</Text> to pick a new time for
                this week right away, then rebook your later weeks.
              </Text>
            </>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {mode !== "loading" && (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondary} onPress={onClose} disabled={isCancelling}>
                <Text style={styles.secondaryText}>Keep session</Text>
              </TouchableOpacity>
              {mode === "simple" ? (
                <TouchableOpacity style={styles.primary} onPress={handleCancelOnly} disabled={isCancelling}>
                  <Text style={styles.primaryText}>{isCancelling ? "Cancelling…" : "Yes, cancel session"}</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.primary} onPress={handleReschedule} disabled={isCancelling}>
                    <Text style={styles.primaryText}>
                      {isCancelling ? "Cancelling…" : "Reschedule this week"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondary} onPress={handleCancelAll} disabled={isCancelling}>
                    <Text style={styles.secondaryText}>
                      {isCancelling ? "Cancelling…" : "Cancel all (including future)"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: themes.black,
    borderColor: themes.border,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: themes.textPrimary,
    fontSize: 22,
    fontFamily: "ArchivoNarrow_600SemiBold",
    textAlign: "center",
    marginBottom: 14,
  },
  body: { color: themes.white, fontSize: 15, lineHeight: 21, marginBottom: 10 },
  bold: { fontFamily: "Archivo_700Bold" },
  error: { color: themes.danger, marginVertical: 8, textAlign: "center" },
  actions: { gap: 10, marginTop: 8 },
  primary: {
    backgroundColor: themes.vegasGold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { color: themes.black, fontFamily: "ArchivoNarrow_600SemiBold", fontSize: 16 },
  secondary: {
    borderColor: themes.vegasGold,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: themes.vegasGold, fontFamily: "ArchivoNarrow_600SemiBold", fontSize: 16 },
});
