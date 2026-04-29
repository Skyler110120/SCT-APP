import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";
import { sessionFormStyles as styles } from "@/src/styles/SessionStyles/sessionFormStyles";
import { sessionFormService } from "@/src/services/sessionFormService";
import { PreStressLevel, SleepQuality } from "@/src/types/enums";

interface DraftState {
  sleep_hours: number | null;
  sleep_quality: SleepQuality | null;
  has_eaten: boolean | null;
  has_pain: boolean | null;
  pain_description: string;
  pre_stress_level: PreStressLevel | null;
  motivation_before: number | null;
}

const EMPTY_DRAFT: DraftState = {
  sleep_hours: null,
  sleep_quality: null,
  has_eaten: null,
  has_pain: null,
  pain_description: "",
  pre_stress_level: null,
  motivation_before: null,
};

export default function StudentSessionCheckInScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Number(params.sessionId);

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyComplete, setAlreadyComplete] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!sessionId || Number.isNaN(sessionId)) {
        setError("Invalid session.");
        setIsLoading(false);
        return;
      }

      const res = await sessionFormService.getSessionWorkflow(sessionId);
      if (!res.success || !res.data || res.data.participants.length === 0) {
        setError(res.error ?? "Could not load check-in");
        setIsLoading(false);
        return;
      }

      const me = res.data.participants[0];
      setAlreadyComplete(me.pretraining_status === "COMPLETED");
      if (me.form) {
        setDraft({
          sleep_hours: me.form.sleep_hours ?? null,
          sleep_quality: me.form.sleep_quality ?? null,
          has_eaten: me.form.has_eaten ?? null,
          has_pain: me.form.has_pain ?? null,
          pain_description: me.form.pain_description ?? "",
          pre_stress_level: me.form.pre_stress_level ?? null,
          motivation_before: me.form.motivation_before ?? null,
        });
      }
      setIsLoading(false);
    };
    run();
  }, [sessionId]);

  const canSubmit = useMemo(() => !alreadyComplete, [alreadyComplete]);

  const renderScale = (
    value: number | null,
    onChange: (v: number) => void,
    min: number,
    max: number
  ) => {
    const range = [];
    for (let i = min; i <= max; i++) range.push(i);
    return (
      <View style={styles.sliderTrack}>
        {range.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.sliderSegment, value === n && styles.sliderSegmentActive]}
            onPress={() => onChange(n)}
          >
            <Text
              style={[
                styles.sliderSegmentText,
                value === n && styles.sliderSegmentTextActive,
              ]}
            >
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderBool = (value: boolean | null, onChange: (v: boolean) => void) => (
    <View style={styles.boolRow}>
      <TouchableOpacity
        style={[styles.boolButton, value === true && styles.boolButtonActive]}
        onPress={() => onChange(true)}
      >
        <Text
          style={[styles.boolButtonText, value === true && styles.boolButtonTextActive]}
        >
          Yes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.boolButton, value === false && styles.boolButtonActive]}
        onPress={() => onChange(false)}
      >
        <Text
          style={[styles.boolButtonText, value === false && styles.boolButtonTextActive]}
        >
          No
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEnum = <T extends string>(
    value: T | null,
    options: Array<{ value: T; label: string }>,
    onChange: (next: T) => void
  ) => (
    <View style={styles.toggleRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.toggleButton, value === opt.value && styles.toggleButtonActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            style={[
              styles.toggleButtonText,
              value === opt.value && styles.toggleButtonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const submit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const res = await sessionFormService.submitPretraining(sessionId, {
      sleep_hours: draft.sleep_hours ?? undefined,
      sleep_quality: draft.sleep_quality ?? undefined,
      has_eaten: draft.has_eaten ?? undefined,
      has_pain: draft.has_pain ?? undefined,
      pain_description: draft.pain_description || undefined,
      pre_stress_level: draft.pre_stress_level ?? undefined,
      motivation_before: draft.motivation_before ?? undefined,
    });
    setIsSubmitting(false);
    if (res.success) {
      setAlreadyComplete(true);
      Alert.alert("Check-in complete", "You are checked in. See you in class.");
      return;
    }
    Alert.alert("Error", res.error ?? "Failed to submit check-in");
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themes.vegasGold} />
            <Text style={styles.loadingText}>Loading check-in...</Text>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.replace("/dashboard")}
            >
              <Text style={styles.retryButtonText}>Back to dashboard</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Session Check-in</Text>
              <Text style={styles.headerSubtitle}>
                Complete pre-training questions before class starts.
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {alreadyComplete ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>
                  You are checked in. See you in class.
                </Text>
              </View>
            ) : (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Pre-Training</Text>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Hours of Sleep</Text>
                  {renderScale(
                    draft.sleep_hours,
                    (value) => setDraft((p) => ({ ...p, sleep_hours: value })),
                    0,
                    12
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Sleep Quality</Text>
                  {renderEnum(
                    draft.sleep_quality,
                    [
                      { value: SleepQuality.POOR, label: "Poor" },
                      { value: SleepQuality.AVERAGE, label: "Average" },
                      { value: SleepQuality.GREAT, label: "Great" },
                    ],
                    (value) => setDraft((p) => ({ ...p, sleep_quality: value }))
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Eaten in last 4 hours?</Text>
                  {renderBool(draft.has_eaten, (value) =>
                    setDraft((p) => ({ ...p, has_eaten: value }))
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Currently in pain?</Text>
                  {renderBool(draft.has_pain, (value) =>
                    setDraft((p) => ({ ...p, has_pain: value }))
                  )}
                </View>

                {draft.has_pain && (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Pain description</Text>
                    <TextInput
                      style={styles.textInput}
                      value={draft.pain_description}
                      onChangeText={(value) =>
                        setDraft((p) => ({ ...p, pain_description: value }))
                      }
                      placeholder="Describe the pain..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                    />
                  </View>
                )}

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Stress Level</Text>
                  {renderEnum(
                    draft.pre_stress_level,
                    [
                      { value: PreStressLevel.LOW, label: "Low" },
                      { value: PreStressLevel.MODERATE, label: "Moderate" },
                      { value: PreStressLevel.HIGH, label: "High" },
                    ],
                    (value) => setDraft((p) => ({ ...p, pre_stress_level: value }))
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Motivation Before (1-10)</Text>
                  {renderScale(
                    draft.motivation_before,
                    (value) => setDraft((p) => ({ ...p, motivation_before: value })),
                    1,
                    10
                  )}
                </View>

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={submit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={themes.black} />
                  ) : (
                    <Text style={styles.completeButtonText}>COMPLETE CHECK-IN</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
