import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { masterAdminDashboardStyles as companyForm } from "@/src/styles/masterDashboardScreen";
import { CreateCompanyRequest} from "@/src/types/company.types";
import { themes } from "@/src/context/themes";

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
      <View style={companyForm.modalOverlay}>
        <View style={companyForm.modalContent}>
          <Text style={companyForm.modalTitle}>Create New Company</Text>
          <View style={companyForm.formGroup}>
            <Text style={companyForm.inputLabel}>Company Name *</Text>
            <TextInput
              style={[
                companyForm.textInput,
                errors.name && { borderWidth: 1, borderColor: "#FF4444" },
              ]}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="Enter company name"
              placeholderTextColor={themes.white}
            />
            {errors.name && (
              <Text style={companyForm.errorText}>{errors.name}</Text>
            )}
          </View>
          <View style={companyForm.formGroup}>
            <Text style={companyForm.inputLabel}>Website (Optional)</Text>
            <TextInput
              style={[
                companyForm.textInput,
                errors.website && { borderWidth: 1, borderColor: "#FF4444" },
              ]}
              value={formData.website || ""}
              onChangeText={(text) => handleChange("website", text)}
              placeholder="https://example.com"
              placeholderTextColor={themes.white}
              keyboardType="url"
            />
            {errors.website && (
              <Text style={companyForm.errorText}>{errors.website}</Text>
            )}
          </View>
          <View style={companyForm.buttonContainer}>
            <TouchableOpacity
              style={companyForm.actionButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={companyForm.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                companyForm.actionButton,
                isSubmitting && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text style={companyForm.buttonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompanyForm;
