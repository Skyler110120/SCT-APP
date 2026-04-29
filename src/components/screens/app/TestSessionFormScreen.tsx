import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";
import { sessionFormStyles as styles } from "@/src/styles/SessionStyles/sessionFormStyles";
import { sessionService } from "@/src/services/sessionService";
import { testSessionFormService } from "@/src/services/testSessionFormService";
import { SessionDetailed } from "@/src/types/sessions.types";
import {
  TestSessionForm,
  UpdateTestSessionFormRequest,
  CompleteTestSessionFormRequest,
} from "@/src/types/test.session.form.types";
import { PostStressLevel, PreStressLevel, SleepQuality } from "@/src/types/enums";
import { isTestSessionRequired } from "@/src/utils/sessionRules";

interface FormState {
  sleep_hours: number | null;
  sleep_quality: SleepQuality | null;
  has_eaten: boolean | null;
  has_pain: boolean | null;
  pain_description: string;
  pre_stress_level: PreStressLevel | null;
  motivation_before: number | null;
  post_stress_level: PostStressLevel | null;
  motivation_after: number | null;
  confidence_level: number | null;
  highlight: string;
  advance_student: boolean;
  instructor_notes: string;
}

const DEFAULT_FORM_STATE: FormState = {
  sleep_hours: null,
  sleep_quality: null,
  has_eaten: null,
  has_pain: null,
  pain_description: "",
  pre_stress_level: null,
  motivation_before: null,
  post_stress_level: null,
  motivation_after: null,
  confidence_level: null,
  highlight: "",
  advance_student: false,
  instructor_notes: "",
};

function formStateFromApi(form: TestSessionForm): FormState {
  return {
    sleep_hours: form.sleep_hours ?? null,
    sleep_quality: form.sleep_quality ?? null,
    has_eaten: form.has_eaten ?? null,
    has_pain: form.has_pain ?? null,
    pain_description: form.pain_description ?? "",
    pre_stress_level: form.pre_stress_level ?? null,
    motivation_before: form.motivation_before ?? null,
    post_stress_level: form.post_stress_level ?? null,
    motivation_after: form.motivation_after ?? null,
    confidence_level: form.confidence_level ?? null,
    highlight: form.highlight ?? "",
    advance_student: form.advance_student ?? false,
    instructor_notes: form.instructor_notes ?? "",
  };
}

export default function TestSessionFormScreen() {
  const params = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Number(params.sessionId);

  const [session, setSession] = useState<SessionDetailed | null>(null);
  const [form, setForm] = useState<TestSessionForm | null>(null);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!sessionId || Number.isNaN(sessionId)) {
      setError("Invalid session");
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const sessionRes = await sessionService.getSessionById(sessionId);
      if (!sessionRes.success || !sessionRes.data) {
        setError("Could not load session");
        return;
      }

      setSession(sessionRes.data);
      const effectiveWeek =
        sessionRes.data.week_number ?? sessionRes.data.enrollment_current_week;
      const requiresTestSession =
        sessionRes.data.is_test_session_required ??
        isTestSessionRequired(
          effectiveWeek,
          sessionRes.data.course_total_weeks,
          sessionRes.data.final_month_initial_test_passed
        );

      if (!requiresTestSession) {
        router.replace({
          pathname: "/company/session-form",
          params: { sessionId: String(sessionId) },
        });
        return;
      }

      const formsRes = await testSessionFormService.getMyTestSessionForms();
      const existing = (formsRes.data ?? []).find((entry) => entry.session_id === sessionId);
      if (existing) {
        setForm(existing);
        setFormState(formStateFromApi(existing));
      } else {
        setForm(null);
        setFormState(DEFAULT_FORM_STATE);
      }
    } catch {
      setError("Failed to load session data");
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const buildPayload = (): UpdateTestSessionFormRequest => ({
    sleep_hours: formState.sleep_hours ?? undefined,
    sleep_quality: formState.sleep_quality ?? undefined,
    has_eaten: formState.has_eaten ?? undefined,
    has_pain: formState.has_pain ?? undefined,
    pain_description: formState.pain_description || undefined,
    pre_stress_level: formState.pre_stress_level ?? undefined,
    motivation_before: formState.motivation_before ?? undefined,
    post_stress_level: formState.post_stress_level ?? undefined,
    motivation_after: formState.motivation_after ?? undefined,
    confidence_level: formState.confidence_level ?? undefined,
    highlight: formState.highlight || undefined,
    instructor_notes: formState.instructor_notes || undefined,
    advance_student: formState.advance_student,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = buildPayload();
      if (!form) {
        const created = await testSessionFormService.createTestSessionForm({ session_id: sessionId });
        if (!created.success || !created.data) {
          Alert.alert("Error", created.error || "Could not start test session");
          return;
        }
        const updated = await testSessionFormService.updateTestSessionForm(created.data.id, payload);
        if (updated.success && updated.data) {
          setForm(updated.data);
          setFormState(formStateFromApi(updated.data));
        } else {
          setForm(created.data);
          Alert.alert("Warning", updated.error || "Form started but save failed");
        }
        return;
      }

      const updated = await testSessionFormService.updateTestSessionForm(form.id, payload);
      if (updated.success && updated.data) {
        setForm(updated.data);
        setFormState(formStateFromApi(updated.data));
      } else {
        Alert.alert("Error", updated.error || "Failed to save");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!form) {
      Alert.alert("Start first", "Start the test session first.");
      return;
    }
    if (formState.confidence_level === null) {
      Alert.alert("Required", "Set confidence level before completing.");
      return;
    }

    Alert.alert(
      "Complete test form",
      formState.advance_student
        ? "Complete and advance this student to next week?"
        : "Complete test form and keep student on current week?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            setIsCompleting(true);
            try {
              const completeData: CompleteTestSessionFormRequest = {
                sleep_hours: formState.sleep_hours ?? undefined,
                sleep_quality: formState.sleep_quality ?? undefined,
                has_eaten: formState.has_eaten ?? undefined,
                has_pain: formState.has_pain ?? undefined,
                pain_description: formState.pain_description || undefined,
                pre_stress_level: formState.pre_stress_level ?? undefined,
                motivation_before: formState.motivation_before ?? undefined,
                post_stress_level: formState.post_stress_level ?? PostStressLevel.SAME,
                motivation_after: formState.motivation_after ?? undefined,
                confidence_level: formState.confidence_level ?? undefined,
                highlight: formState.highlight || undefined,
                advance_student: formState.advance_student,
                instructor_notes: formState.instructor_notes || undefined,
              };

              const completed = await testSessionFormService.completeTestSessionForm(
                form.id,
                completeData
              );
              if (completed.success) {
                Alert.alert(
                  "Completed",
                  completed.student_advanced
                    ? "Student advanced to next week."
                    : "Test session completed."
                );
                router.replace("/dashboard");
              } else {
                Alert.alert("Error", completed.error || "Failed to complete");
              }
            } catch {
              Alert.alert("Error", "Something went wrong");
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const renderScale = (
    value: number | null,
    onChange: (v: number) => void,
    min: number,
    max: number
  ) => {
    const range = [];
    for (let index = min; index <= max; index++) range.push(index);
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

  const renderEnum = <T extends string>(
    value: T | null,
    options: Array<{ value: T; label: string }>,
    onChange: (v: T) => void
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

  const isFormCompleted = form?.is_completed === true;
  const formExists = !!form;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themes.vegasGold} />
            <Text style={styles.loadingText}>Loading test session...</Text>
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
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryButtonText}>Retry</Text>
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
              <Text style={styles.headerTitle}>
                {session?.course_title || session?.title || "Test Session"}
              </Text>
              <Text style={styles.headerSubtitle}>
                {session?.student_name || "Student"}
                {session?.week_number ? ` · Week ${session.week_number}` : ""}
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {isFormCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ Test session form completed</Text>
              </View>
            )}

            {!isFormCompleted && (
              <>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Pre-Training</Text>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Hours of Sleep</Text>
                    {renderScale(
                      formState.sleep_hours,
                      (value) => updateField("sleep_hours", value),
                      0,
                      12
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Sleep Quality</Text>
                    {renderEnum(
                      formState.sleep_quality,
                      [
                        { value: SleepQuality.POOR, label: "Poor" },
                        { value: SleepQuality.AVERAGE, label: "Average" },
                        { value: SleepQuality.GREAT, label: "Great" },
                      ],
                      (value) => updateField("sleep_quality", value)
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Eaten in last 4 hours?</Text>
                    {renderBool(formState.has_eaten, (value) => updateField("has_eaten", value))}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Currently in pain?</Text>
                    {renderBool(formState.has_pain, (value) => updateField("has_pain", value))}
                  </View>

                  {formState.has_pain && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Pain Description</Text>
                      <TextInput
                        style={styles.textInput}
                        value={formState.pain_description}
                        onChangeText={(value) => updateField("pain_description", value)}
                        placeholder="Describe the pain..."
                        placeholderTextColor="rgba(255,255,255,0.3)"
                      />
                    </View>
                  )}

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Stress Level</Text>
                    {renderEnum(
                      formState.pre_stress_level,
                      [
                        { value: PreStressLevel.LOW, label: "Low" },
                        { value: PreStressLevel.MODERATE, label: "Moderate" },
                        { value: PreStressLevel.HIGH, label: "High" },
                      ],
                      (value) => updateField("pre_stress_level", value)
                    )}
                  </View>
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Post-Training</Text>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Post-session stress</Text>
                    {renderEnum(
                      formState.post_stress_level,
                      [
                        { value: PostStressLevel.LESS_STRESSED, label: "Less stressed" },
                        { value: PostStressLevel.SAME, label: "Same" },
                        { value: PostStressLevel.MORE_STRESSED, label: "More stressed" },
                      ],
                      (value) => updateField("post_stress_level", value)
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Confidence Level (1-10) *</Text>
                    {renderScale(
                      formState.confidence_level,
                      (value) => updateField("confidence_level", value),
                      1,
                      10
                    )}
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Instructor notes</Text>
                    <TextInput
                      style={[styles.textInput, styles.textInputMultiline]}
                      value={formState.instructor_notes}
                      onChangeText={(value) => updateField("instructor_notes", value)}
                      placeholder="Notes about this test session..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Assessment</Text>
                  <TouchableOpacity
                    style={[
                      styles.progressButton,
                      formState.advance_student && styles.progressButtonActive,
                    ]}
                    onPress={() =>
                      updateField("advance_student", !formState.advance_student)
                    }
                  >
                    <Text
                      style={[
                        styles.progressButtonText,
                        formState.advance_student && styles.progressButtonTextActive,
                      ]}
                    >
                      {formState.advance_student
                        ? "✓ WILL PROGRESS TO NEXT WEEK"
                        : "PROGRESS TO NEXT WEEK"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color={themes.vegasGold} />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {formExists ? "SAVE DRAFT" : "START FORM"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {formExists && (
                    <TouchableOpacity
                      style={styles.completeButton}
                      onPress={handleComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? (
                        <ActivityIndicator size="small" color={themes.black} />
                      ) : (
                        <Text style={styles.completeButtonText}>COMPLETE TEST FORM</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
