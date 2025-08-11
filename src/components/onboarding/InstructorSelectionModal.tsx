import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Instructor,
  getInstructorDisplayName,
} from "@/src/types/instructor.types";
import { CompanyInfo } from "@/src/types/onboarding.types";
import { onboardingService } from "@/src/services/onboardingService";
import { themes } from "@/src/context/themes";
import { adminManageUsersStyles as styles } from "@/src/styles/adminManageUsers";

interface InstructorSelectionModalProps {
  isVisible: boolean;
  companyInfo: CompanyInfo;
  instructors: Instructor[];
  isLoading: boolean;
  onInstructorSelected: (instructor: Instructor) => void;
  onError: (error: string) => void;
  onRetry: () => void;
}

export const InstructorSelectionModal: React.FC<
  InstructorSelectionModalProps
> = ({
  isVisible,
  companyInfo,
  instructors,
  isLoading: instructorsLoading,
  onInstructorSelected,
  onError,
  onRetry,
}) => {
  const [selectedInstructorId, setSelectedInstructorId] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleInstructorChange = async (instructorId: number) => {
    console.log("User selected instructor ID:", instructorId);

    if (instructorId === 0) {
      setSelectedInstructorId(0);
      return;
    }

    setSelectedInstructorId(instructorId);
    setIsSaving(true);

    try {
      const selectedInstructor = instructors.find(
        (instructor) => instructor.id === instructorId
      );

      if (!selectedInstructor) {
        throw new Error("Instructor not found");
      }

      await onboardingService.saveSelectedInstructor(selectedInstructor);
      onInstructorSelected(selectedInstructor);
    } catch (error) {
      onError("Failed to save instructor selection. Please try again.");
      setSelectedInstructorId(0);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPickerItems = () => {
    const items = [
      <Picker.Item key="placeholder" label="Select an instructor..." value={0} />
    ];

    instructors.forEach(instructor => {
      items.push(
        <Picker.Item
          key={instructor.id}
          label={getInstructorDisplayName(instructor)}
          value={instructor.id}
        />
      );
    });

    return items;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No Instructors Available</Text>
      <Text style={styles.emptyStateDescription}>
        {companyInfo.company_name} doesn't have any instructors yet. 
        Contact your administrator to set up instructors before continuing.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={themes.vegasGold} />
      <Text style={styles.loadingText}>Loading instructors...</Text>
    </View>
  );

  const renderInstructorPicker = () => (
    <View style={styles.pickerSection}>
      <Text style={styles.filterLabel}>Choose Your Instructor</Text>
      
      <Text style={styles.pickerDescription}>
        Select the instructor assigned to you.
      </Text>

      <View style={styles.filterPickerContainer}>
        <Picker
          selectedValue={selectedInstructorId}
          onValueChange={handleInstructorChange}
          style={styles.filterPicker}
          dropdownIconColor={themes.vegasGold}
          enabled={!isSaving}
        >
          {renderPickerItems()}
        </Picker>
      </View>

      {isSaving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator size="small" color={themes.vegasGold} />
          <Text style={styles.savingText}>Saving selection...</Text>
        </View>
      )}

      <View style={styles.footerInfo}>
        <Text style={styles.footerText}>
          Your instructor will help you develop your skills
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Your Instructor</Text>
          
          <View style={styles.contentContainer}>
            {instructorsLoading ? (
              renderLoadingState()
            ) : instructors.length === 0 ? (
              renderEmptyState()
            ) : (
              renderInstructorPicker()
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

