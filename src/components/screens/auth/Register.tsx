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

import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Alert,
  Image,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppButton, AppInput, AppText } from "@/src/components/ui";
import { AuthGridBackground } from "@/src/components/auth/AuthGridBackground";
import { AuthBrandLockup } from "@/src/components/auth/AuthBrandLockup";

// Students skip instructor selection — they book any available instructor after signup.
type OnboardingStep = "invite-code" | "course-selection" | "cadence-selection" | "registration";

export default function RegisterScreen() {
  const router = useRouter();

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

  const lastProcessedCompanyRef = useRef<{ companyId: number; role: UserRole } | null>(null);

  const handleInviteCodeSuccess = async (company: CompanyInfo) => {
    const resolvedRole = company.role || UserRole.STUDENT;
    setCompanyInfo(company);
    setRole(resolvedRole);
    await onboardingService.saveSelectedRole(resolvedRole);
  };

  useEffect(() => {
    if (!role || !companyInfo) return;

    const currentKey = { companyId: companyInfo.company_id, role };
    const lastKey = lastProcessedCompanyRef.current;
    if (lastKey?.companyId === currentKey.companyId && lastKey?.role === currentKey.role) return;
    lastProcessedCompanyRef.current = currentKey;

    if (currentStep !== "invite-code") return;

    if (role === UserRole.STUDENT) {
      setCurrentStep("course-selection");
      loadCourses();
    } else {
      setCurrentStep("registration");
    }
  }, [role, companyInfo, currentStep]);

  const handleInviteCodeCancel = () => {
    router.back();
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const result = await courseService.getCourseForSelection();
      if (result.success && result.data) {
        setCourses(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load courses");
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      Alert.alert("Error", "Failed to load courses. Please try again.");
    } finally {
      setCoursesLoading(false);
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

  const handleBack = () => {
    if (currentStep === "course-selection") {
      setCurrentStep("invite-code");
      setSelectedCourse(null);
      setCourses([]);
    } else if (currentStep === "cadence-selection") {
      setCurrentStep("course-selection");
      setSelectedCadence(null);
    } else if (currentStep === "registration") {
      if (role === UserRole.STUDENT) {
        setCurrentStep("cadence-selection");
      } else {
        setCurrentStep("invite-code");
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

      await onboardingService.saveOnboardingData(
        "registrationData",
        registrationData
      );

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
        />
      );
    } else if (currentStep === "cadence-selection") {
      return (
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.82)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: themes.backgroundElevated, borderRadius: 16, padding: 16 }}>
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
                borderColor: selectedCadence === "WEEKLY" ? themes.vegasGold : "#444",
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <AppText variant="bodyStrong">Weekly Plan</AppText>
              <AppText>24 classes over 6 months</AppText>
              <AppText>$200/month, 1 grace month, then $50/class</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleCadenceSelection("BIWEEKLY")}
              style={{
                borderColor: selectedCadence === "BIWEEKLY" ? themes.vegasGold : "#444",
                borderWidth: 1,
                borderRadius: 12,
                padding: 12,
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
        <View style={styles.card}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={handleBack}>
              <Image source={Images.buttons.backButton} />
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={Platform.OS === "ios" ? 40 : 80}
            extraHeight={120}
            keyboardOpeningTime={0}
          >
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
              <View style={styles.flowBadge}>
                <AppText variant="caption" style={styles.flowBadgeText}>
                  Structured enrollment flow
                </AppText>
              </View>

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
                <View style={styles.nameInputBoxContainer}>
                  <AppInput
                    label="First Name"
                    placeholder="First Name"
                    style={styles.nameInputBox}
                    value={formData.first_name}
                    onChangeText={(text) => handleChange("first_name", text)}
                    returnKeyType="next"
                  />
                  <AppInput
                    label="Last Name"
                    placeholder="Last Name"
                    style={styles.nameInputBox}
                    value={formData.last_name}
                    onChangeText={(text) => handleChange("last_name", text)}
                    returnKeyType="next"
                  />
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
              </View>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
    </AuthGridBackground>
  );
}
