import Images from "@/src/assets/images";
import { themes } from "@/src/context/themes";
import { registerScreenStyles as styles } from "@/src/styles/RegisterPageStyles/registerScreen";

import { CourseSelectionModal } from "@/src/components/onboarding/CourseSelectionModal";
import { InviteCodeModal } from "@/src/components/onboarding/InviteCodeModal";

import { courseService } from "@/src/services/courseService";
import { onboardingService } from "@/src/services/onboardingService";

import { UserRole } from "@/src/types/enums";
import { CourseSummary } from "@/src/types/course.types";
import { CompanyInfo, UserFormData } from "@/src/types/onboarding.types";

import { useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { PRIVACY_POLICY_URL } from "@/src/config";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppButton, AppInput, AppText } from "@/src/components/ui";
import { AuthGridBackground } from "@/src/components/auth/AuthGridBackground";
import { AuthBrandLockup } from "@/src/components/auth/AuthBrandLockup";

// Students skip instructor selection — they book any available instructor after signup.
type OnboardingStep = "invite-code" | "course-selection" | "cadence-selection" | "registration";

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const stackNameFields = width < 390;
  const params = useLocalSearchParams<{
    company_id?: string;
    company_name?: string;
    course_id?: string;
    invite_code?: string;
  }>();
  const joinContext = useMemo(() => {
    const companyId = Number(params.company_id || "");
    const companyName = params.company_name || "";
    const courseId = Number(params.course_id || "");
    const hasCompany = Number.isFinite(companyId) && companyId > 0 && companyName.length > 0;
    return {
      linkedCompany: hasCompany ? { id: companyId, name: companyName } : null,
      courseId: Number.isFinite(courseId) && courseId > 0 ? courseId : null,
      inviteCode: (params.invite_code || "").trim(),
    };
  }, [params.company_id, params.company_name, params.course_id, params.invite_code]);

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("invite-code");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [selectedCadence, setSelectedCadence] = useState<"WEEKLY" | "BIWEEKLY" | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleInviteCodeCancel = () => {
    router.back();
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const result = await courseService.getCourseForSelection();
      if (result.success && result.data) {
        const list = Array.isArray(result.data) ? result.data : [];
        setCourses(list);
        const preferred = joinContext.courseId
          ? list.find((course) => course.id === joinContext.courseId)
          : undefined;
        if (preferred) {
          setSelectedCourse(preferred);
          await onboardingService.saveSelectedCourse(preferred);
        }
        if (!result.data.length) {
          Alert.alert(
            "No Courses",
            "No training courses are available yet. Please try again or contact your administrator."
          );
        }
      } else {
        setCourses([]);
        Alert.alert("Error", result.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
      Alert.alert("Error", "Failed to load courses. Please try again.");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInviteCodeSuccess = async (company: CompanyInfo) => {
    const resolvedRole = company.role || UserRole.STUDENT;
    setCompanyInfo(company);
    setRole(resolvedRole);
    await onboardingService.saveSelectedRole(resolvedRole);

    // Load courses immediately (same as web) — do not rely on a useEffect race.
    if (resolvedRole === UserRole.STUDENT) {
      setCurrentStep("course-selection");
      await loadCourses();
    } else {
      setCurrentStep("registration");
    }
  };

  const handleCourseSelection = async (course: CourseSummary) => {
    console.log("Course selected:", course);
    setSelectedCourse(course);
    // Save course to storage so createSignupDataFromOnboarding can access it
    await onboardingService.saveSelectedCourse(course);
    setCurrentStep("cadence-selection");
  };

  const handleCadenceSelection = async (cadence: "WEEKLY" | "BIWEEKLY") => {
    setSelectedCadence(cadence);
    await onboardingService.saveOnboardingData("selectedCadence", cadence);
    setCurrentStep("registration");
  };

  const handleCourseSelectionError = (error: string) => {
    Alert.alert("Error", error);
  };

  const handleCourseRetry = () => {
    loadCourses();
  };

  const returnToInviteCode = () => {
    setCompanyInfo(null);
    setCourses([]);
    setSelectedCourse(null);
    setCurrentStep("invite-code");
  };

  const handleBack = () => {
    if (currentStep === "course-selection") {
      returnToInviteCode();
      setSelectedCourse(null);
      setCourses([]);
    } else if (currentStep === "cadence-selection") {
      setCurrentStep("course-selection");
      setSelectedCadence(null);
    } else if (currentStep === "registration") {
      if (role === UserRole.STUDENT) {
        setCurrentStep("cadence-selection");
      } else {
        returnToInviteCode();
      }
    }
  };

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (!companyInfo) {
      Alert.alert(
        "Error",
        "Missing onboarding information. Please restart the process."
      );
      return;
    }

    if (role === UserRole.STUDENT && selectedCourse === null) {
      Alert.alert("Error", "Please select a course");
      return;
    }
    if (role === UserRole.STUDENT && selectedCadence === null) {
      Alert.alert("Error", "Please choose a weekly or bi-weekly plan");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating account...");

      const registrationData = {
        ...formData,
        companyInfo,
        courseId: role === UserRole.STUDENT ? selectedCourse?.id : null,
        program_cadence: role === UserRole.STUDENT ? selectedCadence : undefined,
      };

      const signupData = await onboardingService.createSignupDataFromOnboarding(
        registrationData
      );

      if (!signupData) {
        Alert.alert(
          "Error",
          "Missing onboarding information. Please restart the registration process"
        );
        return;
      }

      const signupResult = await onboardingService.signup(signupData);

      if (signupResult.success) {
        const pendingApproval = Boolean(
          signupResult.data &&
          (signupResult.data.role === UserRole.ADMIN || signupResult.data.role === UserRole.INSTRUCTOR) &&
          !signupResult.data.is_approved
        );
        
        Alert.alert(
          "Registration Successful!",
          pendingApproval
            ? `Welcome to ${companyInfo.company_name}. Your account is waiting for admin approval before you can log in.`
            : `Welcome to ${companyInfo.company_name}`,
          [
          {
            text: "Continue to Login",
            onPress: () => {
              onboardingService.clearOnboardingData();
              router.push("/login");
            },
          },
        ]);
      } else {
        Alert.alert(
          "Registration Failed",
          signupResult.error || "Account creation failed"
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentStep = () => {
    if (currentStep === "invite-code") {
      return (
        <InviteCodeModal
          isVisible={true}
          onValidateSuccess={handleInviteCodeSuccess}
          onCancel={handleInviteCodeCancel}
          linkedCompany={joinContext.linkedCompany}
          initialCode={joinContext.inviteCode}
        />
      );
    } else if (currentStep === "course-selection") {
      return (
        <CourseSelectionModal
          isVisible={true}
          companyInfo={companyInfo!}
          courses={courses}
          isLoading={coursesLoading}
          onCourseSelected={handleCourseSelection}
          onError={handleCourseSelectionError}
          onRetry={handleCourseRetry}
          onBack={handleBack}
          preferredCourseId={selectedCourse?.id ?? joinContext.courseId}
        />
      );
    } else if (currentStep === "cadence-selection") {
      return (
        <View style={{ flex: 1, backgroundColor: themes.background, justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: themes.backgroundElevated, borderRadius: 16, borderWidth: 1, borderColor: themes.border, padding: 16 }}>
            <TouchableOpacity onPress={handleBack} style={{ marginBottom: 12 }}>
              <AppText color={themes.vegasGold}>Back</AppText>
            </TouchableOpacity>
            <AppText variant="title" style={{ marginBottom: 8 }}>Choose Your Program Plan</AppText>
            <AppText style={{ marginBottom: 16 }}>
              This choice is final for this enrollment and cannot be changed later.
            </AppText>
            <TouchableOpacity
              onPress={() => handleCadenceSelection("WEEKLY")}
              style={{
                borderColor: selectedCadence === "WEEKLY" ? themes.vegasGold : themes.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                backgroundColor: selectedCadence === "WEEKLY" ? "rgba(197,179,88,0.12)" : themes.backgroundSoft,
              }}
            >
              <AppText variant="bodyStrong">Weekly Plan</AppText>
              <AppText>24 classes over 6 months</AppText>
              <AppText>$200/month, 1 grace month, then $50/class</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCadenceSelection("BIWEEKLY")}
              style={{
                borderColor: selectedCadence === "BIWEEKLY" ? themes.vegasGold : themes.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                backgroundColor: selectedCadence === "BIWEEKLY" ? "rgba(197,179,88,0.12)" : themes.backgroundSoft,
              }}
            >
              <AppText variant="bodyStrong">Bi-Weekly Plan</AppText>
              <AppText>24 classes over 12 months</AppText>
              <AppText>$100/month, 2 grace months, then $50/class</AppText>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  if (currentStep !== "registration") {
    return renderCurrentStep();
  }

  return (
    <AuthGridBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
          extraHeight={120}
          keyboardOpeningTime={0}
        >
          <View style={styles.card}>
            <View style={styles.backButtonContainer}>
              <TouchableOpacity onPress={handleBack}>
                <Image source={Images.buttons.backButton} />
              </TouchableOpacity>
            </View>
            <View style={styles.registerScreenContentContainer}>
              <View style={styles.brandHeader}>
                <AuthBrandLockup compact />
              </View>
              <AppText variant="title" style={styles.title}>
                Create your training account
              </AppText>
              <AppText variant="body" style={styles.subtitle}>
                Join your organization and start tracking progress with a modern training workflow.
              </AppText>

              {companyInfo && (
                <View style={styles.welcomeContainer}>
                  <AppText style={styles.welcomeText}>
                    Welcome to {companyInfo.company_name}!
                  </AppText>
                  <AppText style={styles.welcomeSubtext}>
                    Complete your account information below
                    {role === UserRole.STUDENT && selectedCourse &&
                      `\nCourse: ${selectedCourse.title}${selectedCadence ? ` • ${selectedCadence === "BIWEEKLY" ? "Bi-Weekly" : "Weekly"} plan` : ""}`}
                  </AppText>
                </View>
              )}

              <View style={styles.formContainer}>
                <View
                  style={[
                    styles.nameInputBoxContainer,
                    stackNameFields && styles.nameInputBoxContainerStacked,
                  ]}
                >
                  <View style={styles.nameInputField}>
                    <AppInput
                      label="First Name"
                      placeholder="First Name"
                      style={styles.nameInputBox}
                      value={formData.first_name}
                      onChangeText={(text) => handleChange("first_name", text)}
                      returnKeyType="next"
                    />
                  </View>
                  <View style={styles.nameInputField}>
                    <AppInput
                      label="Last Name"
                      placeholder="Last Name"
                      style={styles.nameInputBox}
                      value={formData.last_name}
                      onChangeText={(text) => handleChange("last_name", text)}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                <AppInput
                  label="Email"
                  placeholder="Email"
                  style={styles.textInputBox}
                  value={formData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />

                <AppInput
                  label="Password"
                  placeholder="Password"
                  style={styles.textInputBox}
                  secureTextEntry={true}
                  value={formData.password}
                  onChangeText={(text) => handleChange("password", text)}
                  returnKeyType="next"
                />

                <AppInput
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  style={styles.textInputBox}
                  secureTextEntry={true}
                  value={formData.confirm_password}
                  onChangeText={(text) => handleChange("confirm_password", text)}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />

                <AppButton
                  style={styles.signUpButton as any}
                  label="Create account"
                  isLoading={isLoading}
                  fullWidth
                  onPress={handleRegister}
                />

                <AppText variant="caption" style={styles.privacyNotice}>
                  By creating an account you agree to our{" "}
                  <AppText
                    variant="caption"
                    style={styles.privacyLink}
                    onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
                  >
                    Privacy Policy
                  </AppText>
                </AppText>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </AuthGridBackground>
  );
}
