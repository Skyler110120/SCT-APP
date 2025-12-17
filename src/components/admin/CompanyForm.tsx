import { themes } from "@/src/context/themes";
import { companyFormStyles as styles } from "@/src/styles/DashboardPageStyles/MasterAdminDashboardStyles/companFormStyles";
import { CreateCompanyRequest } from "@/src/types/company.types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CompanyFormProps {
  visible: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (company: CreateCompanyRequest) => void;
}

const CompanyForm = ({
  visible,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CompanyFormProps) => {
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: "",
    website: null,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    website?: string;
  }>({});

  useEffect(() => {
    if (visible) {
      setFormData({ name: "", website: null });
      setErrors({});
    }
  }, [visible]);

  const handleChange = (field: keyof CreateCompanyRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.trim() === "" ? (field === "website" ? null : "") : value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {
      name?: string;
      website?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = "company name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "company name must be at least 2 characters";
    }

    if (formData.website) {
      try {
        const urlToCheck = formData.website.match(/^https?:\/\//)
          ? formData.website
          : `https://${formData.website}`;

        new URL(urlToCheck);
      } catch (e) {
        newErrors.website = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Company</Text>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Company Name *</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.name && { borderWidth: 1, borderColor: "#FF4444" },
              ]}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter company name"
              placeholderTextColor={themes.white}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Website (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                errors.website && { borderWidth: 1, borderColor: "#FF4444" },
              ]}
              value={formData.website || ""}
              onChangeText={(text) => handleChange("website", text)}
              placeholder="https://example.com"
              placeholderTextColor={themes.white}
              keyboardType="url"
            />
            {errors.website && (
              <Text style={styles.errorText}>{errors.website}</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text style={styles.buttonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompanyForm;
