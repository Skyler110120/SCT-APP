import Images from "@/src/assets/images";
import { themes } from "@/src/context/themes";
import { registerScreenStyles as styles } from "@/src/styles/RegisterPageStyles/registerScreen";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { CourseSelectionModal } from "@/src/components/onboarding/CourseSelectionModal";
import { InstructorSelectionModal } from "@/src/components/onboarding/InstructorSelectionModal";
import { InviteCodeModal } from "@/src/components/onboarding/InviteCodeModal";

import { courseService } from "@/src/services/courseService";
import { onboardingService } from "@/src/services/onboardingService";

import { UserRole } from "@/src/types/enums";
import { CourseSummary } from "@/src/types/course.types";
import { Instructor } from "@/src/types/instructor.types";
import { CompanyInfo, UserFormData } from "@/src/types/onboarding.types";

import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OnboardingStep =
  | "invite-code"
  | "instructor-selection"
  | "course-selection"
  | "registration";

export default function RegisterScreen() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>("invite-code");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(
    null
  );
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInviteCodeSuccess = async (company: CompanyInfo) => {
    console.log("Invite code validated for company:", company.company_name);
    setCompanyInfo(company);
    setRole(company.role);
  };

  useEffect(() => {
    if (role && companyInfo) {
      if (role === UserRole.STUDENT) {
        loadInstructors();
        setCurrentStep("instructor-selection");
      } else {
        setCurrentStep("registration");
      }
    }
  }, [role, companyInfo]);

  const handleInviteCodeCancel = () => {
    router.back();
  };

  const loadInstructors = async () => {
    if (!companyInfo) return;

    setInstructorsLoading(true);
    try {
      const instructorList = await onboardingService.getCompanyInstructors(
        companyInfo.company_id
      );
      setInstructors((instructorList.data as Instructor[]) || []);
    } catch (error) {
      console.error("Error loading instructors:", error);
      Alert.alert("Error", "Failed to load instructors. Please try again.");
    } finally {
      setInstructorsLoading(false);
    }
  };

  const handleInstructorSelection = (instructor: Instructor) => {
    console.log("Instructor selected:", instructor);
    setSelectedInstructor(instructor);
    loadCourses();
    setCurrentStep("course-selection");
  };

  const handleInstructorSelectionError = (error: string) => {
    Alert.alert("Error", error);
  };

  const handleInstructorRetry = () => {
    loadInstructors();
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
    setCurrentStep("registration");
  };

  const handleCourseSelectionError = (error: string) => {
    Alert.alert("Error", error);
  };

  const handleCourseRetry = () => {
    loadCourses();
  };

  const handleBack = () => {
    if (currentStep === "instructor-selection") {
      setCurrentStep("invite-code");
      setSelectedInstructor(null);
      setInstructors([]);
    } else if (currentStep === "course-selection") {
      setCurrentStep("instructor-selection");
      setSelectedCourse(null);
      setCourses([]);
    } else if (currentStep === "registration") {
      if (role === UserRole.STUDENT) {
        setCurrentStep("course-selection");
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

    if (role === UserRole.STUDENT) {
      if (selectedInstructor === null) {
        Alert.alert("Error", "Please select an instructor");
        return;
      }
      if (selectedCourse === null) {
        Alert.alert("Error", "Please select a course");
        return;
      }
    }

    setIsLoading(true);
    try {
      console.log("Creating account...");

      const registrationData = {
        ...formData,
        companyInfo,
        instructorId: role === UserRole.STUDENT ? selectedInstructor?.id : null,
        courseId: role === UserRole.STUDENT ? selectedCourse?.id : null,
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

      const signupResult = await onboardingService.completeEnhancedSignup(
        signupData
      );

      if (signupResult.success) {
        
        Alert.alert("Registration Successful!", `Welcome to ${companyInfo.company_name}`,[
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
    } else if (currentStep === "instructor-selection") {
      return (
        <InstructorSelectionModal
          isVisible={true}
          companyInfo={companyInfo!}
          instructors={instructors}
          isLoading={instructorsLoading}
          onInstructorSelected={handleInstructorSelection}
          onError={handleInstructorSelectionError}
          onRetry={handleInstructorRetry}
        />
      );
    } else if (currentStep === "course-selection") {
      return (
        <CourseSelectionModal
          isVisible={true}
          companyInfo={companyInfo!}
          courses={courses}
          isLoading={coursesLoading}
          selectedInstructor={selectedInstructor!}
          onCourseSelected={handleCourseSelection}
          onError={handleCourseSelectionError}
          onRetry={handleCourseRetry}
          onBack={handleBack}
        />
      );
    } else {
      return null;
    }
  };

  if (currentStep !== "registration") {
    return renderCurrentStep();
  }

  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={handleBack}>
              <Image source={Images.buttons.backButton} />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.registerScreenContentContainer}>
              <Image source={Images.logo.sctLogo} style={styles.image} />

              {companyInfo && (
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>
                    Welcome to {companyInfo.company_name}!
                  </Text>
                  <Text style={styles.welcomeSubtext}>
                    Complete your account information below
                    {role === UserRole.STUDENT &&
                      selectedInstructor &&
                      selectedCourse &&
                      `\nYou'll be assigned to ${selectedInstructor.first_name} ${selectedInstructor.last_name}\nCourse: ${selectedCourse.title}`}
                  </Text>
                </View>
              )}

              <View style={styles.nameInputBoxContainer}>
                <TextInput
                  multiline={false}
                  scrollEnabled={false}
                  placeholder="First Name"
                  placeholderTextColor={themes.vegasGold}
                  style={styles.nameInputBox}
                  value={formData.first_name}
                  onChangeText={(text) => handleChange("first_name", text)}
                />
                <TextInput
                  multiline={false}
                  scrollEnabled={false}
                  placeholder="Last Name"
                  placeholderTextColor={themes.vegasGold}
                  style={styles.nameInputBox}
                  value={formData.last_name}
                  onChangeText={(text) => handleChange("last_name", text)}
                />
              </View>

              <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="Email"
                placeholderTextColor={themes.vegasGold}
                style={styles.textInputBox}
                value={formData.email}
                onChangeText={(text) => handleChange("email", text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="Password"
                placeholderTextColor={themes.vegasGold}
                style={styles.textInputBox}
                secureTextEntry={true}
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
              />

              <TextInput
                multiline={false}
                scrollEnabled={false}
                placeholder="Confirm Password"
                placeholderTextColor={themes.vegasGold}
                style={styles.textInputBox}
                secureTextEntry={true}
                value={formData.confirm_password}
                onChangeText={(text) => handleChange("confirm_password", text)}
              />

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signUpButtonText}>CREATE ACCOUNT</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
