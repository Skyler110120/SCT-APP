import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { masterAdminManageCourses as styles } from "@/src/styles/masterAdminManageCourses";
import {
  CourseDrill,
  CreateCourseDrillRequest,
  UpdateCourseDrillRequest,
  DrillType,
} from "@/src/types/course.drills.types";
import { themes } from "@/src/context/themes";

interface DrillFormProps {
  visible: boolean;
  courseId: number;
  drill?: CourseDrill | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateDrill?: (data: CreateCourseDrillRequest) => Promise<void>;
  onUpdateDrill?: (id: number, data: UpdateCourseDrillRequest) => Promise<void>;
}

export default function DrillForm({
  visible,
  courseId,
  drill,
  isSubmitting,
  onClose,
  onCreateDrill,
  onUpdateDrill,
}: DrillFormProps) {
  const [drillName, setDrillName] = useState("");
  const [drillType, setDrillType] = useState(DrillType.SCORE);
  const [standardValue, setStandardValue] = useState("");
  const [standardUnit, setStandardUnit] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = drill !== null && drill !== undefined;

  useEffect(() => {
    if (visible) {
      if (isEditMode && drill) {
        setDrillName(drill.drill_name);
        setDrillType(drill.drill_type);
        setStandardValue(drill.standard_value.toString());
        setStandardUnit(drill.standard_unit);
        setDisplayOrder(drill.display_order.toString());
        setDescription(drill.description || "");
        setIsActive(drill.is_active);
      } else {
        setDrillName("");
        setDrillType(DrillType.SCORE);
        setStandardValue("");
        setStandardUnit("");
        setDisplayOrder("1");
        setDescription("");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [visible, isEditMode, drill]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!drillName.trim()) {
      newErrors.drillName = "Drill name is required.";
    } else if (drillName.trim().length < 3) {
      newErrors.drillName = "Drill name must be at least 3 characters.";
    }

    const standardNum = parseFloat(standardValue);
    if (isNaN(standardNum) || standardNum < 0) {
      newErrors.standardValue = "Standard value must be a positive number.";
    }

    if (!standardUnit.trim()) {
      newErrors.standardUnit = "Standard unit is required.";
    }

    const orderNum = parseInt(displayOrder);
    if (isNaN(orderNum) || orderNum < 1) {
      newErrors.displayOrder = "Display order must be a positive integer.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getUnitPlaceHolder = () => {
    if (drillType === DrillType.TIME) {
      return "seconds";
    } else if (drillType === DrillType.SCORE) {
      return 
    } else if (drillType === DrillType.ACCURACY) {
      return "percentage";
    } else {
      return "units";
    }
  };

  const getValuePlaceHolder = () => {
    if (drillType === DrillType.TIME) {
      return "7.5";
    } else if (drillType === DrillType.SCORE) {
      return "70";
    } else if (drillType === DrillType.ACCURACY) {
      return "85";
    } else {
      return "0";
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Validation Error",
        "Please correct the errors and try again."
      );
      return;
    }

    try {
      if (isEditMode && onUpdateDrill && drill) {
        const updateData: UpdateCourseDrillRequest = {
          drill_name: drillName.trim(),
          drill_type: drillType,
          standard_value: parseFloat(standardValue),
          standard_unit: standardUnit.trim(),
          display_order: parseInt(displayOrder),
          description: description.trim(),
          is_active: isActive,
        };

        console.log("Updating drill:", updateData);
        await onUpdateDrill(drill.id, updateData);
      } else if (!isEditMode && onCreateDrill) {
        const createData: CreateCourseDrillRequest = {
          course_id: courseId,
          drill_name: drillName.trim(),
          drill_type: drillType,
          standard_value: parseFloat(standardValue),
          standard_unit: standardUnit.trim(),
          display_order: parseInt(displayOrder),
          description: description.trim(),
        };

        console.log("Creating drill:", createData);
        await onCreateDrill(createData);
      }
    } catch (error) {
      console.error("Drill form submission error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const getDrillTypeDisplayName = (type: DrillType) => {
    if (type === DrillType.TIME) return "Time-Based";
    if (type === DrillType.SCORE) return "Score-Based";
    if (type === DrillType.ACCURACY) return "Accuracy-Based";
    return type;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}></View>
        <Text style={styles.modalTitle}>
          {isEditMode ? "Edit Drill" : "Create New Drill"}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Drill Name</Text>
            <TextInput
              style={[
                styles.searchInput,
                errors.drillName && { borderColor: "#FF4444" },
              ]}
              value={drillName}
              onChangeText={setDrillName}
              placeholder="e.g., Bull Standard, Bill Drill"
              placeholderTextColor={themes.white}
              maxLength={100}
            />
            {errors.drillName && (
              <Text style={styles.warningText}>{errors.drillName}</Text>
            )}
          </View>

          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Drill Type</Text>
            <View style={styles.modalPickerContainer}>
              <Picker
                selectedValue={drillType}
                onValueChange={(itemValue) => setDrillType(itemValue)}
                style={styles.modalPicker}
                dropdownIconColor={themes.vegasGold}
              >
                {Object.values(DrillType).map((type) => (
                  <Picker.Item
                    key={type}
                    label={getDrillTypeDisplayName(type)}
                    value={type}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.inputDescription}>
              Time: Lower is better * Score: Higher is better * Accuracy: Higher
              is better
            </Text>
          </View>

          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Standard Value</Text>
            <TextInput
              style={[
                styles.searchInput,
                errors.standardValue && { borderColor: "#FF4444" },
              ]}
              value={standardValue}
              onChangeText={setStandardValue}
              placeholder={getValuePlaceHolder()}
              placeholderTextColor={themes.white}
              keyboardType="numeric"
            />
            {errors.standardValue && (
              <Text style={styles.warningText}>{errors.standardValue}</Text>
            )}
            <Text style={styles.inputDescription}>
              The benchmark value for this drill.
            </Text>
          </View>

          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Standard Unit</Text>
            <TextInput
              style={[
                styles.searchInput,
                errors.standardUnit && { borderColor: "#FF4444" },
              ]}
              value={standardUnit}
              onChangeText={setStandardUnit}
              placeholder={getUnitPlaceHolder()}
              placeholderTextColor={themes.white}
              maxLength={20}
            />
            {errors.standardUnit && (
              <Text style={styles.warningText}>{errors.standardUnit}</Text>
            )}
          </View>

          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Display Order</Text>
            <TextInput
              style={[
                styles.searchInput,
                errors.displayOrder && { borderColor: "#FF4444" },
              ]}
              value={displayOrder}
              onChangeText={setDisplayOrder}
              placeholder="1"
              placeholderTextColor={themes.white}
              keyboardType="numeric"
              maxLength={2}
            />
            {errors.displayOrder && (
              <Text style={styles.warningText}>{errors.displayOrder}</Text>
            )}
            <Text style={styles.inputDescription}>
              Order in which drills will appear during test session (1-99)
            </Text>
          </View>

          <View style={styles.createSection}>
            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={styles.searchInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description for the drill."
              placeholderTextColor={themes.white}
              multiline
              numberOfLines={3}
              maxLength={1000}
            />
          </View>

          {isEditMode && (
            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Drill Status</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={isActive}
                  onValueChange={(itemValue) => setIsActive(itemValue)}
                  style={styles.modalPicker}
                  dropdownIconColor={themes.vegasGold}
                >
                  <Picker.Item label="Active" value={true} />
                  <Picker.Item label="Inactive" value={false} />
                </Picker>
              </View>
              <Text style={styles.inputDescription}>
                Inactive drills are hidden during test sessions
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color={themes.white} />
                <Text style={styles.savingText}>
                  {isEditMode ? "Updating..." : "Creating..."}
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {isEditMode ? "Update Drill" : "Create Drill"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
