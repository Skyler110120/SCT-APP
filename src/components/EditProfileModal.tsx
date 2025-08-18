import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ProfileDetailed } from "@/src/types/profile.types";
import { profileService } from "@/src/services/profileService";
import { profileScreenStyles as styles } from "../styles/profileScreen";
import { formatDateForAPI, createLocalDate } from "@/src/utils/dateTimeUtils";
import { themes } from "@/src/context/themes";

interface EditProfileModalProps {
  visible: boolean;
  isSubmitting?: boolean;
  profile: ProfileDetailed;
  onSave: (updatedProfile: ProfileDetailed) => void;
  onClose: () => void;
}

interface ProfileFormData {
  email: string;
  bio: string;
  phone_number: string;
  date_of_birth: Date | null;
}

export default function EditProfileModal({ visible, isSubmitting = false, profile, onSave, onClose }: EditProfileModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    email: "",
    bio: "",
    phone_number: "",
    date_of_birth: null,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    bio?: string;
    phone_number?: string;
    date_of_birth?: string;
  }>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof ProfileFormData | null>(null);

  useEffect(() => {
    if (visible && profile) {
      console.log("Initializing form with profile:", profile);

      let birthDate: Date | null = null;
      if (profile.date_of_birth) {
        try {
          birthDate = profile.date_of_birth.includes('-')
            ? createLocalDate(profile.date_of_birth)
            : new Date(profile.date_of_birth);

          if (isNaN(birthDate.getTime())) {
            birthDate = null;
          }
        } catch (error) {
          console.error("Error parsing date_of_birth:", error);
          birthDate = null;
        }
      }

      setFormData({
        email: profile.user.email || "",
        bio: profile.bio || "",
        phone_number: profile.phone_number || "",
        date_of_birth: birthDate,
      });

      setErrors({});
      setFocusedField(null);
    }
  }, [visible, profile]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    console.log(`Updating field ${field} to:`, value);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({...prev, [field]: undefined }))
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    console.log("Selected date:", selectedDate);

    setFormData((prev) => ({
      ...prev,
      date_of_birth: selectedDate,
    }));

    setShowDatePicker(false);

    if (errors.date_of_birth) {
      setErrors((prev) => ({ ...prev, date_of_birth: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      bio?: string;
      phone_number?: string;
      date_of_birth?: string;
    } = {};

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a vaild email address";
      }
    }

    if (formData.phone_number && formData.phone_number.trim()) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(formData.phone_number.trim())) {
        newErrors.phone_number = "Please enter a valid phone number";
      }
    }

    if (formData.bio && formData.bio.trim().length > 500) {
      newErrors.bio = "Bio must be 500 characters or less";
    }

    if (formData.date_of_birth) {
      const birthDate = formData.date_of_birth;
      const today = new Date();

      if (birthDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18) {
          newErrors.date_of_birth = "You must be at least 18 years old";
        } else if (age > 100) {
          newErrors.date_of_birth = "Please enter a realistic date of birth";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async () => {
    console.log("Attempting to submit form")

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    try {
      const updateData: any = {};

      const originalEmail = profile.user.email || "";
      const originalBio = profile.bio || "";
      const originalPhone = profile.phone_number || "";

      if (formData.email.trim() !== originalEmail.trim()) {
        updateData.email = formData.email.trim();
      }
      if (formData.bio.trim() !== originalBio.trim()) {
        updateData.bio = formData.bio.trim();
      }
      if (formData.phone_number.trim() !== originalPhone.trim()) {
        updateData.phone_number = formData.phone_number.trim();
      }

      if (formData.date_of_birth) {
        const newDateString = formatDateForAPI(formData.date_of_birth);
        if (newDateString !== profile.date_of_birth) {
          updateData.date_of_birth = newDateString;
        }
      }
      console.log("Changes detected:", updateData);

      if (Object.keys(updateData).length === 0) {
        Alert.alert("No changes", "No changes were made to your profile");
        return;
      }

      const result = await profileService.updateMyProfile(updateData);

      if (result.success && result.data) {
        console.log("Profile updated successfully:", result.data);
        onSave(result.data);
      } else {
        console.error("Failed to update profile:", result.error);
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An unexpected error occurred while updating your profile");
    }
  }

  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "Select Date of Birth";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInputStyle = (field: keyof ProfileFormData) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    errors[field] && styles.inputError
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>Edit Profile</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>EmailAdress</Text>
                <TextInput
                  style={getInputStyle('email')}
                  value={formData.email}
                  onChangeText={(text) => handleChange('email', text)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your email"
                  placeholderTextColor={themes.white}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={getInputStyle('phone_number')}
                  value={formData.phone_number}
                  onChangeText={(text) => handleChange('phone_number', text)}
                  onFocus={() => setFocusedField('phone_number')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your phone number"
                  placeholderTextColor={themes.white}
                  keyboardType="phone-pad"
                />
                {errors.phone_number && (
                  <Text style={styles.errorText}>{errors.phone_number}</Text>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity
                  style={getInputStyle('date_of_birth')}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[
                    styles.datePickerText,
                  ]}>
                    {formatDateForDisplay(formData.date_of_birth)}
                  </Text>
                </TouchableOpacity>
                {errors.date_of_birth && (
                  <Text style={styles.errorText}>{errors.date_of_birth}</Text>
                )}
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[getInputStyle('bio'), styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => handleChange('bio', text)}
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={themes.white}
                  multiline={true}
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {formData.bio.length}/500
                </Text>
                {errors.bio && (
                  <Text style={styles.errorText}>{errors.bio}</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.editModalButtonContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.editModalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSubmitting && { opacity: 0.7 }
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.editModalButtonText}>Save Change</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={handleDateChange}
          onCancel={() => setShowDatePicker(false)}
          date={formData.date_of_birth || new Date(1990, 0, 1)}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          title="Select Date of Birth"
          confirmTextIOS="Confirm"
          cancelTextIOS="Cancel"
          isDarkModeEnabled={true}
        />
      </KeyboardAvoidingView>
    </Modal>
  )
}