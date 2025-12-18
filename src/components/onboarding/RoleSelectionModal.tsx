import { themes } from "@/src/context/themes";
import { onboardingService } from "@/src/services/onboardingService";
import { roleSelectionModalStyles as styles } from "@/src/styles/RegisterPageStyles/roleSelectionModalStyles";
import { UserRole } from "@/src/types/auth.types";
import { CompanyInfo } from "@/src/types/onboarding.types";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RoleSelectionModalProps {
  isVisible: boolean;
  companyInfo: CompanyInfo;
  onRoleSelected: (role: UserRole) => void;
  onError: (error: string) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isVisible,
  companyInfo,
  onRoleSelected,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRoleSelection = async (role: UserRole) => {
    setIsLoading(true);
    setSelectedRole(role);

    try {
      console.log("User selected role:", role);

      await onboardingService.saveSelectedRole(role);

      onRoleSelected(role);
    } catch (error) {
      console.error("Error saving role selection:", error);
      onError("Failed to save role selection. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelecomeMessage = () => {
    if (companyInfo.is_first_user) {
      return (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome, Company Founder!</Text>
          <Text style={styles.welcomeText}>
            You're setting up{" "}
            <Text style={styles.companyName}>{companyInfo.company_name}</Text>{" "}
            on our platform.
          </Text>
          <Text style={styles.welcomeSubtext}>
            You'll be promoted to Administrator automatically to manage your
            organization.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>
          Welcome to {companyInfo.company_name}!
        </Text>
        <Text style={styles.welcomeText}>
          What role will you have at your organization?
        </Text>
        <Text style={styles.welcomeSubtext}>
          You will start with student access and your admin can adjust your
          permissions later.
        </Text>
      </View>
    );
  };

  const renderRoleButtons = () => {
    const roles = [
      {
        role: UserRole.ADMIN,
        title: "Administrator",
        description: "Manage events, instructors, and students",
      },
      {
        role: UserRole.INSTRUCTOR,
        title: "Instructor",
        description: "Teach and manage your students",
      },
      {
        role: UserRole.STUDENT,
        title: "Student",
        description: "Take courses and track progress",
      },
    ];

    return roles.map((roleOption) => (
      <TouchableOpacity
        key={roleOption.role}
        style={[
          styles.roleButton,
          companyInfo.is_first_user &&
            roleOption.role === UserRole.ADMIN &&
            styles.recommendedButton,
          isLoading && styles.disabledButton,
        ]}
        onPress={() => handleRoleSelection(roleOption.role)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <View style={styles.buttonContent}>
          <View style={styles.buttonHeader}>
            <Text style={styles.buttonTitle}>{roleOption.title}</Text>
          </View>
          <Text style={styles.buttonDescription}>{roleOption.description}</Text>

          {roleOption.role === UserRole.ADMIN && companyInfo.is_first_user && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>Recommended</Text>
            </View>
          )}

          {isLoading && selectedRole === roleOption.role && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={themes.vegasGold} />
              <Text style={styles.loadingText}>Saving...</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Choose Your Role</Text>
          {renderWelecomeMessage()}

          <View style={styles.buttonContainer}>{renderRoleButtons()}</View>

          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              All accounts start with secure student access
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
