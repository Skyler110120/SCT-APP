import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { usePathname } from "expo-router";
import { issueReportService } from "@/src/services/issueReportService";
import {
  GlobalErrorEvent,
  subscribeGlobalError,
} from "@/src/utils/globalErrorBus";
import { theme } from "@/src/context/themes";
import { AppButton, AppCard, AppInput, AppText } from "@/src/components/ui";

export default function GlobalErrorReporter() {
  const pathname = usePathname();
  const [errorEvent, setErrorEvent] = useState<GlobalErrorEvent | null>(null);
  const [reporterEmail, setReporterEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastDedupeKey, setLastDedupeKey] = useState<string | null>(null);

  useEffect(() => {
    return subscribeGlobalError((event) => {
      const currentKey = event.dedupeKey || event.message;
      if (currentKey === lastDedupeKey && errorEvent) return;

      setErrorEvent(event);
      setLastDedupeKey(currentKey);
      setSummary((event.title || event.message).slice(0, 255));
      setDescription("");
      setSubmitError(null);
      setSubmitted(false);
    });
  }, [errorEvent, lastDedupeKey]);

  const canSubmit = useMemo(
    () => !!errorEvent && summary.trim().length >= 5 && !isSubmitting,
    [errorEvent, isSubmitting, summary]
  );

  const close = () => {
    setErrorEvent(null);
    setSubmitted(false);
    setSubmitError(null);
  };

  const submit = async () => {
    if (!errorEvent || !canSubmit) return;
    setSubmitError(null);
    setIsSubmitting(true);
    const response = await issueReportService.createIssueReport({
      summary: summary.trim(),
      description: description.trim() || undefined,
      error_message: errorEvent.message,
      page_url: pathname,
      api_path: errorEvent.path,
      http_status: errorEvent.status,
      user_agent: "sct-app-mobile",
      reporter_email: reporterEmail.trim() || undefined,
    });
    setIsSubmitting(false);
    if (response.success) {
      setSubmitted(true);
      return;
    }
    setSubmitError(response.error || "Could not submit issue report. Please try again.");
  };

  const severityColor = errorEvent?.severity === "warning"
    ? theme.colors.warning
    : theme.colors.danger;

  return (
    <Modal visible={!!errorEvent} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <AppCard style={styles.card} variant="elevated">
          <View style={[styles.badge, { borderColor: severityColor }]}>
            <AppText variant="caption" color={severityColor} style={styles.badgeText}>
              {errorEvent?.severity === "warning" ? "Warning" : "Error"}
            </AppText>
          </View>

          <AppText variant="title">
            {errorEvent?.title || "Something went wrong"}
          </AppText>
          <AppText variant="body">{errorEvent?.message}</AppText>

          <AppInput
            label="Summary"
            value={summary}
            onChangeText={setSummary}
            placeholder="What were you trying to do?"
            maxLength={255}
          />
          <AppInput
            label="Additional details (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Include steps or context"
            multiline
            style={styles.detailsInput}
          />
          <AppInput
            label="Email for follow-up (optional)"
            value={reporterEmail}
            onChangeText={setReporterEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {submitted ? (
            <AppText variant="caption" color={theme.colors.success}>
              Thanks, your report was submitted successfully.
            </AppText>
          ) : null}

          {submitError ? (
            <AppText variant="caption" color={theme.colors.danger}>
              {submitError}
            </AppText>
          ) : null}

          {(errorEvent?.path || errorEvent?.status) ? (
            <AppText variant="caption">
              {errorEvent?.status ? `HTTP ${errorEvent.status}` : "Request error"}
              {errorEvent?.path ? ` • ${errorEvent.path}` : ""}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            <AppButton
              label="Dismiss"
              variant="outline"
              onPress={close}
              disabled={isSubmitting}
              style={styles.actionButton}
            />
            <AppButton
              label={isSubmitting ? "Reporting..." : "Report issue"}
              onPress={submit}
              disabled={!canSubmit}
              style={styles.actionButton}
            />
          </View>
          {isSubmitting ? <ActivityIndicator color={theme.colors.vegasGold} /> : null}
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    padding: theme.space.lg,
  },
  card: {
    gap: theme.space.md,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.space.sm,
    paddingVertical: 2,
  },
  badgeText: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailsInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: theme.space.sm,
  },
  actionButton: {
    flex: 1,
  },
});
