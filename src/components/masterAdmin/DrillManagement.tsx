import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { drillManagementStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/drillManagementStyles";
import { themes } from "@/src/context/themes";
import { CourseAdminView } from "@/src/types/course.types";
import {
  Drill,
  DrillCreate,
  DrillUpdate,
} from "@/src/types/course.drills.types";
import { drillService } from "@/src/services/courseDrillService";
import DrillList from "./DrillList";
import DrillForm from "./DrillForm";

const { width } = Dimensions.get("window");

interface DrillManagementProps {
  visible: boolean;
  course: CourseAdminView | null;
  onClose: () => void;
}

export default function DrillManagment({
  visible,
  course,
  onClose,
}: DrillManagementProps) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDrillForm, setShowDrillForm] = useState<boolean>(false);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [showModal, setShowModal] = useState<boolean>(true);

  useEffect(() => {
    if (visible && course) {
      loadDrills();
    }

    if (!visible) {
      setSelectedDrill(null);
      setEditingDrill(null);
      setShowDrillForm(false);
      setDrills([]);
    }
  }, [visible, course]);

  const loadDrills = async () => {
    setIsLoading(true);
    try {
      const result = await drillService.getDrills();
      if (result.success && result.data) {
        setDrills(result.data);
      } else {
        Alert.alert("Error", result.error || "Failed to load drills");
        setDrills([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load drills");
      setDrills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDrill = async (drillData: DrillCreate) => {
    setIsSubmitting(true);
    try {
      const result = await drillService.createDrill(drillData);
      if (result.success) {
        Alert.alert("Success", result.message || "Drill created successfully");
        setShowDrillForm(false);
        setEditingDrill(null);
        setShowModal(true);
        await loadDrills();
      } else {
        Alert.alert("Error", result.error || "Failed to create drill");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create drill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDrill = async (
    drillId: number,
    drillData: DrillUpdate
  ) => {
    setIsSubmitting(true);
    try {
      const result = await drillService.updateDrill(drillId, drillData);
      if (result.success) {
        Alert.alert("Success", result.message || "Drill updated successfully");
        setShowDrillForm(false);
        setEditingDrill(null);
        setSelectedDrill(null);
        setShowModal(true);
        await loadDrills();
      } else {
        Alert.alert("Error", result.error || "Failed to update drill");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update drill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDrill = (drill: Drill) => {
    Alert.alert(
      "Delete Drill",
      `Are you sure you want to deactivate "${drill.name}"?\n\nThis will hide it from new class assignments.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => confirmDeleteDrill(drill),
        },
      ]
    );
  };

  const confirmDeleteDrill = async (drill: Drill) => {
    setIsSubmitting(true);
    try {
      const result = await drillService.deleteDrill(drill.id);
      if (result.success) {
        Alert.alert("Success", result.message || "Drill deactivated");
        setSelectedDrill(null);
        await loadDrills();
      } else {
        Alert.alert("Error", result.error || "Failed to delete drill");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete drill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDrill = (drill: Drill) => {
    setEditingDrill(drill);
    setShowDrillForm(true);
  };

  const handleAddDrill = () => {
    setEditingDrill(null);
    setShowDrillForm(true);
    setShowModal(false);
  };

  const handleCloseDrillForm = () => {
    setShowDrillForm(false);
    setShowModal(true);
    setEditingDrill(null);
  };

  if (!course) return null;

  return (
    <>
      {showModal && (
        <Modal visible={visible} transparent={true} animationType="slide">
          <View style={styles.drillModalOverlay}>
            <View style={styles.drillModalContent}>
              <View style={styles.drillModalHeader}>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={styles.drillModalTitle}>Platform Drills</Text>
                  <Text style={styles.drillModalLabel}>
                    Manage drills for all courses
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.drillExitButton}
                >
                  <FontAwesome
                    name="times"
                    size={width * 0.06}
                    color={themes.vegasGold}
                  />
                </TouchableOpacity>
              </View>
              {isLoading ? (
                <View style={styles.drillModalLoadingContainer}>
                  <ActivityIndicator size="large" color={themes.vegasGold} />
                  <Text style={styles.drillModalLoadingText}>
                    Loading drills...
                  </Text>
                </View>
              ) : (
                <View style={styles.drillListContainer}>
                  <DrillList
                    drills={drills}
                    selectedDrill={selectedDrill}
                    onSelectDrill={setSelectedDrill}
                    onEditDrill={handleEditDrill}
                    onDeleteDrill={handleDeleteDrill}
                    isLoading={isSubmitting}
                  />
                </View>
              )}
              <View style={styles.drillModalButtonContainer}>
                <TouchableOpacity
                  style={styles.drillModalAddButton}
                  onPress={handleAddDrill}
                  activeOpacity={0.7}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.drillModalButtonText]}>
                    Add New Drill
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <DrillForm
        visible={showDrillForm}
        drill={editingDrill}
        isSubmitting={isSubmitting}
        onClose={handleCloseDrillForm}
        onCreateDrill={handleCreateDrill}
        onUpdateDrill={handleUpdateDrill}
      />
    </>
  );
}
