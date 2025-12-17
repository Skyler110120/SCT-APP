import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError, apiFetch } from "./api";
import {
  InviteCodeValidationRequest,
  InviteCodeValidationResponse,
  CompanyInfo,
  InstructorOption,
  InstructorsResponse,
  EnhancedSignupData,
  EnhancedSignupResponse,
  UserFormData,
  UserFormDataWithRegistration,
} from "@/src/types/onboarding.types";
import { CourseSummary } from "@/src/types/course.types";
import { UserRole, UserResponse } from "../types/auth.types";
import {
  isValidEnhancedSignupData,
} from "../utils/onboardingValidationUtils";

const ONBOARDING_STORAGE_KEYS = {
  INVITE_CODE: "onboarding_invite_code",
  COMPANY_INFO: "onboarding_company_info",
  SELECTED_ROLE: "onboarding_selected_role",
  SELECTED_INSTRUCTOR: "onboarding_selected_instructor",
  SELECTED_COURSE: "onboarding_selected_course",
  FORM_DATA: "onboarding_form_data",
  CURRENT_STEP: "onboarding_current_step",
};

export const onboardingService = {
  /**
   * Validates a company invite code and returns company information
   * @param code - company invite code entered by the user
   * @returns Promise with company data or error
   */
  async validateCompanyCode(
    code: string
  ): Promise<InviteCodeValidationResponse> {
    try {
      const data: CompanyInfo = await apiFetch<CompanyInfo>(`/auth/validate-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ code }),
      });

      await this.saveOnboardingData("inviteCode", code);
      await this.saveOnboardingData("companyInfo", data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Invite code validation error:", error);
      return {
        success: false,
        error: "An error occurred while validating the invite code",
      };
    }
  },

  /**
   * Returns a list of all instructors for a given company
   * @param companyId - ID of the company
   * @returns Promise with list of instructors or error
   */
  async getCompanyInstructors(companyId: number): Promise<InstructorsResponse> {
    try {
      console.log("Getching instructors for company:", companyId);

      const data = await apiFetch(`/users/instructors/company/${companyId}`);

      console.log(`Found ${data.length} instructors`);

      return {
        success: true,
        data: data as InstructorOption[],
      };
    } catch (error) {
      console.error("Get instructors error:", error);
      return {
        success: false,
        error: "An error occurred while fetching instructors",
      };
    }
  },

  /**
   * Completes the enhanced signup process
   * @param signupData - user data for enhanced signup
   * @returns Promise with user data or error
   */
  async completeEnhancedSignup(
    signupData: EnhancedSignupData
  ): Promise<EnhancedSignupResponse> {
    try {
      console.log("Attempting enhanced signup for:", signupData.email);
      console.log("Signup data:", signupData);

      if (!isValidEnhancedSignupData(signupData)) {
        return {
          success: false,
          error: "Incomplete signup data - please check all required fields",
        };
      }

      const response = await apiFetch(`/auth/signup`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(signupData),
      });

      console.log("Enhanced signup successful for:", signupData.email);
      const data = await response.json();
      await this.clearOnboardingData();

      return {
        success: true,
        data,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409){
          return {
            success: false,
            error: "An account with this email already exists",
          };
        }

        if (error.status === 400 && error.detail?.includes("invite")){
          return {
            success: false,
            error: "Invalid invite code. Please check and try again",
          };
        }
      }
      console.error("Enhanced signup error:", error);
      return {
        success: false,
        error: "Error occurred during account creation",
      };
    }
  },

  async createSignupDataFromOnboarding(
    registrationData: UserFormDataWithRegistration
  ): Promise<EnhancedSignupData | null> {
    try {
      console.log("Assembling signup data from onboarding flow");

      const [inviteCode, companyInfo, intendedRole, selectedInstructor, selectedCourse] =
        await Promise.all([
          this.getStoredInviteCode(),
          this.getStoredCompanyInfo(),
          this.getStoredSelectedRole(),
          this.getStoredSelectedInstructor(),
          this.getStoredSelectedCourse()
        ]);

      if (!inviteCode || !companyInfo || !intendedRole) {
        console.error("Missing required onboarding context:")
        return null;
      }

      const needsInstructor = intendedRole === UserRole.STUDENT;
      const needsCourse = intendedRole === UserRole.STUDENT;

      if (needsInstructor && !selectedInstructor) {
        console.error("Student role requires instructor selection");
        return null;
      }

      if (needsCourse && !selectedCourse) {
        console.error("Student role requires course selection");
        return null;
      }

      const courseId = selectedCourse?.id || registrationData.course_id || null;
      const signupData: EnhancedSignupData = {
        email: registrationData.email,
        password: registrationData.password,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        role: UserRole.STUDENT,
        company_id: companyInfo.company_id,
        instructor_id: needsInstructor ? selectedInstructor?.id || null : null,
        course_id: courseId,
        invite_code: inviteCode,
    };

      console.log("✅ Signup data assembled successfully");
      return signupData;
    } catch (error) {
      console.error("Create signup data error:", error);
      return null;
    }
  },

  /**
   * Completes the onboarding process by submitting an invite code
   * @param code - company invite code entered by the user
   * @returns Promise with onboarding data or null if submission fails
   */
  async completeOnboarding(code: string): Promise<UserResponse> {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        console.error("No authentication token found");
        return {
          success: false,
          error: "Authentication required for onboarding",
        };
      }

      const data = await apiFetch(`/onboarding/complete`, {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Complete legacy onboarding error:", error);
      return {
        success: false,
        error: "Network error occurred during onboarding",
      };
    }
  },

  /**
   * Save onboarding data to device storage
   * @param key - Type of data being saved
   * @param data - Data to persist
   */
  async saveOnboardingData(key: string, data: any): Promise<void> {
    try {
      const storageKey = `onboarding_${key}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Onboarding data saved saved:`, key);
    } catch (error) {
      console.error("Save onboarding data error:", error);
    }
  },

  /**
   * Retrieve saved onboarding data from device storage
   * @param key - Type of data to retrieve
   * @returns Parsed data or null if not found/invalid
   */
  async getOnboardingData(key: string): Promise<any | null> {
    try {
      const storageKey = `onboarding_${key}`;
      const data = await AsyncStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Get onboarding data error:", error);
      return null;
    }
  },

  /**
   * Clear all onboarding data from device storage
   */
  async clearOnboardingData(): Promise<void> {
    try {
      const keysToRemove = [
        ...Object.values(ONBOARDING_STORAGE_KEYS),
        "onboarding_invite_code",
        "onboarding_company_info",
        "onboarding_selected_role",
        "onboarding_selected_instructor",
        "onboarding_selected_course",
        "onboarding_form_data",
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      console.log("All onboarding data cleared");
    } catch (error) {
      console.error("Clear onboarding data error:", error);
    }
  },

  async getStoredInviteCode(): Promise<string | null> {
    return this.getOnboardingData('inviteCode');
  },

  async getStoredCompanyInfo(): Promise<CompanyInfo | null> {
    return this.getOnboardingData('companyInfo');
  },

  async getStoredSelectedRole(): Promise<UserRole | null> {
    return this.getOnboardingData('selectedRole');
  },

  async getStoredSelectedInstructor(): Promise<InstructorOption | null> {
    return this.getOnboardingData('selectedInstructor');
  },

  async getStoredSelectedCourse(): Promise<CourseSummary | null> {
    return this.getOnboardingData('selectedCourse');
  },

  async getStoredFormData(): Promise<UserFormData | null> {
    return this.getOnboardingData('formData');
  },

   async saveInviteCode(code: string): Promise<void> {
    return this.saveOnboardingData('inviteCode', code);
  },

  async saveCompanyInfo(info: CompanyInfo): Promise<void> {
    return this.saveOnboardingData('companyInfo', info);
  },

  async saveSelectedRole(role: UserRole): Promise<void> {
    return this.saveOnboardingData('selectedRole', role);
  },

  async saveSelectedInstructor(instructor: InstructorOption): Promise<void> {
    return this.saveOnboardingData('selectedInstructor', instructor);
  },

  async saveSelectedCourse(course: CourseSummary): Promise<void> {
    return this.saveOnboardingData('selectedCourse', course);
  },

  async saveFormData(data: UserFormData): Promise<void> {
    return this.saveOnboardingData('formData', data);
  },

  /**
   * Check if all required onboarding data is present for signup
   * @returns True if signup can proceed, false if data is missing
   */
  async isOnboardingDataComplete(): Promise<boolean> {
    try {
      const [inviteCode, companyInfo, selectedRole, formData] = await Promise.all([
        this.getStoredInviteCode(),
        this.getStoredCompanyInfo(),
        this.getStoredSelectedRole(),
        this.getStoredFormData(),
      ]);

      if (!inviteCode || !companyInfo || !selectedRole || !formData) {
        console.log('Missing basic onboarding data');
        return false;
      }

      if (selectedRole === UserRole.STUDENT) {
        const selectedInstructor = await this.getStoredSelectedInstructor();
        if (!selectedInstructor) {
          console.log('Student role requires instructor selection');
          return false
        }
      }

      console.log('Onboarding data is complete')
      return true;
    } catch (error) {
      console.error("Check onboarding data completeness error:", error);
      return false;
    }
  },

  /**
   * Get comprehensive onboarding progress summary
   * @returns detailed breakdown of what data is present vs missing
   */
  async getOnboardingProgress(): Promise<{
    hasInviteCode: boolean;
    hasCompanyInfo: boolean;
    hasSelectedRole: boolean;
    hasSelectedInstructor: boolean;
    hasFormData: boolean;
    isComplete: boolean;
    nextStepNeeded?: string;
  }> {
    try {
      const [
        inviteCode,
        companyInfo,
        selectedRole,
        selectedInstructor,
        formData
      ] = await Promise.all([
        this.getStoredInviteCode(),
        this.getStoredCompanyInfo(),
        this.getStoredSelectedRole(),
        this.getStoredSelectedInstructor(),
        this.getStoredFormData()
      ]);

      const progress = {
        hasInviteCode: !!inviteCode,
        hasCompanyInfo: !!companyInfo,
        hasSelectedRole: !!selectedRole,
        hasSelectedInstructor: !!selectedInstructor,
        hasFormData: !!formData,
        isComplete: false,
        nextStepNeeded: undefined as string | undefined
      };

      if (!progress.hasInviteCode) {
        progress.nextStepNeeded = 'Enter invite code';
      } else if (!progress.hasCompanyInfo) {
        progress.nextStepNeeded = 'Validate company information';
      } else if (!progress.hasSelectedRole) {
        progress.nextStepNeeded = 'Select your role';
      } else if (selectedRole === UserRole.STUDENT && !progress.hasSelectedInstructor) {
        progress.nextStepNeeded = 'Choose your instructor';
      } else if (!progress.hasFormData) {
        progress.nextStepNeeded = 'Complete personal information';
      }

      progress.isComplete = await this.isOnboardingDataComplete();

      return progress;
    } catch (error) {
      console.error('💥 Get onboarding progress error:', error);
      return {
        hasInviteCode: false,
        hasCompanyInfo: false,
        hasSelectedRole: false,
        hasSelectedInstructor: false,
        hasFormData: false,
        isComplete: false,
        nextStepNeeded: 'Start onboarding process'
      };
    }
  }
};
