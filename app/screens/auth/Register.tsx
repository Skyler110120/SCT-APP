import Images from "@/src/assets/images";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { InviteCodeModal } from "@/src/components/onboarding/InviteCodeModal";
import { RoleSelectionModal } from "@/src/components/onboarding/RoleSelectionModal";
import { InstructorSelectionModal } from "@/src/components/onboarding/InstructorSelectionModal";
import { themes } from "@/src/context/themes";
import { onboardingService } from "@/src/services/onboardingService";
import { registerScreenStyles as styles } from "@/src/styles/registerScreen";
import { CompanyInfo, UserFormData } from "@/src/types/onboarding.types";
import { UserRole } from "@/src/types/auth.types";
import { Instructor } from "@/src/types/instructor.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// UI flow types - NOT actual user roles
type OnboardingStep = 'invite-code' | 'role-selection' | 'instructor-selection' | 'registration';
type UIFlowChoice = 'student' | 'instructor-or-admin'; // What they select for UI navigation

export default function RegisterScreen() {
  const router = useRouter();

  // Onboarding flow state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('invite-code');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [uiFlowChoice, setUIFlowChoice] = useState<UIFlowChoice | null>(null);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  // Instructor selection state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler for form field changes
  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Step 1: Handle invite code validation success
  const handleInviteCodeSuccess = (company: CompanyInfo) => {
    console.log("Invite code validated for company:", company.company_name);
    setCompanyInfo(company);
    setCurrentStep('role-selection');
  };

  const handleInviteCodeCancel = () => {
    router.back();
  };

  // Step 2: Handle UI flow choice selection
  const handleRoleSelection = (role: UserRole) => {
    console.log("UI flow choice selected:", role);
    
    // Convert the UserRole to our UI flow choice
    const flowChoice: UIFlowChoice = role === UserRole.STUDENT ? 'student' : 'instructor-or-admin';
    setUIFlowChoice(flowChoice);
    
    // If student flow, they need to select an instructor
    if (flowChoice === 'student') {
      loadInstructors();
      setCurrentStep('instructor-selection');
    } else {
      // Instructor/Admin flow goes directly to registration
      setCurrentStep('registration');
    }
  };

  const handleRoleSelectionError = (error: string) => {
    Alert.alert("Error", error);
  };

  // Load instructors for student flow
  const loadInstructors = async () => {
    if (!companyInfo) return;

    setInstructorsLoading(true);
    try {
      const instructorList = await onboardingService.getCompanyInstructors(companyInfo.company_id);
      setInstructors((instructorList.data as Instructor[]) || []);
    } catch (error) {
      console.error("Error loading instructors:", error);
      Alert.alert("Error", "Failed to load instructors. Please try again.");
    } finally {
      setInstructorsLoading(false);
    }
  };

  // Step 3: Handle instructor selection (only for student flow)
  const handleInstructorSelection = (instructor: Instructor) => {
    console.log("Instructor selected:", instructor);
    setSelectedInstructor(instructor);
    setCurrentStep('registration');
  };

  const handleInstructorSelectionError = (error: string) => {
    Alert.alert("Error", error);
  };

  const handleInstructorRetry = () => {
    loadInstructors();
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'role-selection':
        setCurrentStep('invite-code');
        setCompanyInfo(null);
        break;
      case 'instructor-selection':
        setCurrentStep('role-selection');
        setSelectedInstructor(null);
        setInstructors([]);
        break;
      case 'registration':
        if (uiFlowChoice === 'student') {
          setCurrentStep('instructor-selection');
        } else {
          setCurrentStep('role-selection');
        }
        break;
    }
  };

  // Step 4: Handle final registration
  const handleRegister = async () => {
    // Validation
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

    // Ensure we have all required onboarding data
    if (!companyInfo || !uiFlowChoice) {
      Alert.alert("Error", "Missing onboarding information. Please restart the process.");
      return;
    }

    // For student flow, ensure instructor is selected
    if (uiFlowChoice === 'student' && !selectedInstructor) {
      Alert.alert("Error", "Please select an instructor.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating account...");

      // Prepare registration data
      const registrationData = {
        ...formData,
        companyInfo,
        // Include instructor only if they went through student flow
        instructorId: uiFlowChoice === 'student' ? selectedInstructor?.id : null,
        // Note: All users will be created as students initially
        // Backend will handle role assignment based on business logic
      };

      await onboardingService.saveOnboardingData("registrationData", registrationData);

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

      const signupResult = await onboardingService.completeEnhancedSignup(signupData);

      if (signupResult.success) {
        // Determine success message based on UI flow choice
        const successMessage = uiFlowChoice === 'student' 
          ? `Welcome to ${companyInfo?.company_name}! You've been assigned to ${selectedInstructor?.first_name} ${selectedInstructor?.last_name}.`
          : companyInfo?.is_first_user
            ? `Welcome to ${companyInfo?.company_name}! As the first user, you'll be promoted to Administrator.`
            : `Welcome to ${companyInfo?.company_name}! You'll start with student access and can be promoted by your administrator.`;

        Alert.alert(
          "Account Created Successfully!",
          successMessage,
          [
            {
              text: "Continue to Login",
              onPress: () => {
                // Clear onboarding data
                onboardingService.clearOnboardingData();
                // Navigate to login screen
                router.push("/screens/auth/Login");
              },
            },
          ]
        );
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

  // Render the appropriate modal based on current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'invite-code':
        return (
          <InviteCodeModal
            isVisible={true}
            onValidateSuccess={handleInviteCodeSuccess}
            onCancel={handleInviteCodeCancel}
          />
        );

      case 'role-selection':
        return (
          <RoleSelectionModal
            isVisible={true}
            companyInfo={companyInfo!}
            onRoleSelected={handleRoleSelection}
            onError={handleRoleSelectionError}
          />
        );

      case 'instructor-selection':
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

      case 'registration':
        return null; // Show the registration form
    }
  };

  // If we're not at the registration step, show the appropriate modal
  if (currentStep !== 'registration') {
    return renderCurrentStep();
  }

  // Registration form (only shown when currentStep === 'registration')
  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.container}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={handleBack}>
              <Image source={Images.buttons.backButton} />
            </TouchableOpacity>
          </View>
          <View style={styles.registerScreenContentContainer}>
            <Image source={Images.logo.sctLogo} style={styles.image} />
            
            {companyInfo && (
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>
                  Welcome to {companyInfo.company_name}!
                </Text>
                <Text style={styles.welcomeSubtext}>
                  Complete your account information below
                  {uiFlowChoice === 'student' && selectedInstructor && (
                    `\nYou'll be assigned to ${selectedInstructor.first_name} ${selectedInstructor.last_name}`
                  )}
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
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}