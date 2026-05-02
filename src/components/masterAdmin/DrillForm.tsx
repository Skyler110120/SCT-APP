import { themes } from "@/src/context/themes";
import { drillFormStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/drillFormStyles";
import {
  Drill,
  DrillCreate,
  DrillUpdate,
  FireType,
} from "@/src/types/course.drills.types";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface DrillFormProps {
  visible: boolean;
  drill?: Drill | null;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateDrill?: (data: DrillCreate) => Promise<void>;
  onUpdateDrill?: (id: number, data: DrillUpdate) => Promise<void>;
}

export default function DrillForm({
  visible,
  drill,
  isSubmitting,
  onClose,
  onCreateDrill,
  onUpdateDrill,
}: DrillFormProps) {
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [fireType, setFireType] = useState<FireType>(FireType.LIVE_FIRE);
  const [loadout, setLoadout] = useState("");
  const [instructorNotes, setInstructorNotes] = useState("");
  const [isCte, setIsCte] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("");
  const [passingStandard, setPassingStandard] = useState("");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [distanceYards, setDistanceYards] = useState("");
  const [targetSpec, setTargetSpec] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = drill !== null && drill !== undefined;

  useEffect(() => {
    if (visible) {
      if (isEditMode && drill) {
        setName(drill.name);
        setPurpose(drill.purpose);
        setFireType(drill.fire_type);
        setLoadout(drill.loadout ?? "");
        setInstructorNotes(drill.instructor_notes || "");
        setIsCte(drill.is_cte);
        setTimeLimitSeconds(drill.time_limit_seconds?.toString() || "");
        setPassingStandard(drill.passing_standard || "");
        setDisplayOrder(drill.display_order.toString());
        setDistanceYards(drill.distance_yards?.toString() || "");
        setTargetSpec(drill.target_spec || "");
      } else {
        setName("");
        setPurpose("");
        setFireType(FireType.LIVE_FIRE);
        setLoadout("");
        setInstructorNotes("");
        setIsCte(false);
        setTimeLimitSeconds("");
        setPassingStandard("");
        setDisplayOrder("1");
        setDistanceYards("");
        setTargetSpec("");
      }
      setErrors({});
    }
  }, [visible, isEditMode, drill]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = "Name is required.";
    if (!purpose.trim()) newErrors.purpose = "Purpose is required.";
    if (!loadout.trim()) newErrors.loadout = "Loadout is required.";
    const orderNum = parseInt(displayOrder);
    if (isNaN(orderNum) || orderNum < 1) newErrors.displayOrder = "Must be a positive integer.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please correct the errors.");
      return;
    }

    try {
      if (isEditMode && onUpdateDrill && drill) {
        const updateData: DrillUpdate = {
          name: name.trim(),
          purpose: purpose.trim(),
          fire_type: fireType,
          loadout: loadout.trim(),
          instructor_notes: instructorNotes.trim() || undefined,
          is_cte: isCte,
          time_limit_seconds: timeLimitSeconds ? parseInt(timeLimitSeconds) : undefined,
          passing_standard: passingStandard.trim() || undefined,
          display_order: parseInt(displayOrder),
          distance_yards: distanceYards ? parseInt(distanceYards) : undefined,
          target_spec: targetSpec.trim() || undefined,
        };
        await onUpdateDrill(drill.id, updateData);
      } else if (!isEditMode && onCreateDrill) {
        const createData: DrillCreate = {
          name: name.trim(),
          purpose: purpose.trim(),
          fire_type: fireType,
          loadout: loadout.trim(),
          instructor_notes: instructorNotes.trim() || undefined,
          is_cte: isCte,
          time_limit_seconds: timeLimitSeconds ? parseInt(timeLimitSeconds) : undefined,
          passing_standard: passingStandard.trim() || undefined,
          display_order: parseInt(displayOrder),
          distance_yards: distanceYards ? parseInt(distanceYards) : undefined,
          target_spec: targetSpec.trim() || undefined,
        };
        await onCreateDrill(createData);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditMode ? "Edit Drill" : "Create New Drill"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Drill Name *</Text>
              <TextInput
                style={[styles.searchInput, errors.name && { borderColor: "#FF4444" }]}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Bill Drill, Wall Drill"
                placeholderTextColor={themes.white}
                maxLength={200}
              />
              {errors.name && <Text style={styles.warningText}>{errors.name}</Text>}
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Fire Type</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={fireType}
                  onValueChange={(val) => setFireType(val)}
                  style={styles.modalPicker}
                  dropdownIconColor={themes.vegasGold}
                >
                  <Picker.Item label="Live Fire" value={FireType.LIVE_FIRE} />
                  <Picker.Item label="Dry Fire" value={FireType.DRY_FIRE} />
                </Picker>
              </View>
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Purpose *</Text>
              <TextInput
                style={[styles.searchInput, errors.purpose && { borderColor: "#FF4444" }]}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="What this drill trains"
                placeholderTextColor={themes.white}
                multiline
                numberOfLines={2}
              />
              {errors.purpose && <Text style={styles.warningText}>{errors.purpose}</Text>}
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Loadout *</Text>
              <TextInput
                style={[styles.searchInput, errors.loadout && { borderColor: "#FF4444" }]}
                value={loadout}
                onChangeText={setLoadout}
                placeholder="e.g. 2×10"
                placeholderTextColor={themes.white}
                maxLength={255}
              />
              {errors.loadout && <Text style={styles.warningText}>{errors.loadout}</Text>}
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Instructor Notes</Text>
              <TextInput
                style={styles.searchInput}
                value={instructorNotes}
                onChangeText={setInstructorNotes}
                placeholder="Optional coaching notes"
                placeholderTextColor={themes.white}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Distance (yards)</Text>
              <TextInput
                style={styles.searchInput}
                value={distanceYards}
                onChangeText={setDistanceYards}
                placeholder="7"
                placeholderTextColor={themes.white}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Target Spec</Text>
              <TextInput
                style={styles.searchInput}
                value={targetSpec}
                onChangeText={setTargetSpec}
                placeholder='e.g., IPSC, 3" dot'
                placeholderTextColor={themes.white}
              />
            </View>

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>CTE (Performance Test) Drill</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={isCte}
                  onValueChange={(val) => setIsCte(val)}
                  style={styles.modalPicker}
                  dropdownIconColor={themes.vegasGold}
                >
                  <Picker.Item label="No" value={false} />
                  <Picker.Item label="Yes" value={true} />
                </Picker>
              </View>
            </View>

            {isCte && (
              <>
                <View style={styles.createSection}>
                  <Text style={styles.modalLabel}>Time Limit (seconds)</Text>
                  <TextInput
                    style={styles.searchInput}
                    value={timeLimitSeconds}
                    onChangeText={setTimeLimitSeconds}
                    placeholder="e.g., 7"
                    placeholderTextColor={themes.white}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.createSection}>
                  <Text style={styles.modalLabel}>Passing Standard</Text>
                  <TextInput
                    style={styles.searchInput}
                    value={passingStandard}
                    onChangeText={setPassingStandard}
                    placeholder="e.g., 3.5 seconds, 45 points"
                    placeholderTextColor={themes.white}
                  />
                </View>
              </>
            )}

            <View style={styles.createSection}>
              <Text style={styles.modalLabel}>Display Order</Text>
              <TextInput
                style={[styles.searchInput, errors.displayOrder && { borderColor: "#FF4444" }]}
                value={displayOrder}
                onChangeText={setDisplayOrder}
                placeholder="1"
                placeholderTextColor={themes.white}
                keyboardType="numeric"
                maxLength={2}
              />
              {errors.displayOrder && <Text style={styles.warningText}>{errors.displayOrder}</Text>}
            </View>
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
      </View>
    </Modal>
  );
}
