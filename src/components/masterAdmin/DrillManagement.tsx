/**
 * Drill Management Component for Master Admins
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { drillManagementStyles as styles } from "@/src/styles/CoursePageStyles/drillManagement";
import { themes } from "@/src/context/themes";
import { CourseAdminView } from "@/src/types/course.types";
import {
  CourseDrill,
  CreateCourseDrillRequest,
  UpdateCourseDrillRequest,
} from "@/src/types/course.drills.types";
import { courseDrillService } from "@/src/services/courseDrillService";
import DrillList from "./DrillList";
import DrillForm from "./DrillForm";

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
  const [drills, setDrills] = useState<CourseDrill[]>([]);
  const [selectedDrill, setSelectedDrill] = useState<CourseDrill | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDrillForm, setShowDrillForm] = useState<boolean>(false);
  const [editingDrill, setEditingDrill] = useState<CourseDrill | null>(null);
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
    if (!course) return;

    setIsLoading(true);
    try {
      console.log(`Loading drills for course:" ${course.title}`);
      const result = await courseDrillService.getCourseDrills(course.id);

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

  const handleCreateDrill = async (drillData: CreateCourseDrillRequest) => {
    setIsSubmitting(true);
    try {
      console.log("Creating drill:", drillData);
      const result = await courseDrillService.createCourseDrill(drillData);

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
    drillData: UpdateCourseDrillRequest
  ) => {
    setIsSubmitting(true);
    try {
      console.log("Updating drill:", { drillId, drillData });
      const result = await courseDrillService.updateCourseDrill(
        drillId,
        drillData
      );

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

  const handleDeleteDrill = (drill: CourseDrill) => {
    Alert.alert(
      "Delete Drill",
      `Are you sure you want to delete "${drill.drill_name}"?\n\n` +
        `This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Drill",
          style: "destructive",
          onPress: () => confirmDeleteDrill(drill),
        },
      ]
    );
  };

  const confirmDeleteDrill = async (drill: CourseDrill) => {
    setIsSubmitting(true);
    try {
      console.log("Deleting drill:", drill.drill_name);

      const result = await courseDrillService.deleteCourseDrill(drill.id);

      if (result.success) {
        Alert.alert("Success", result.message || "Drill deleted successfully");
        setSelectedDrill(null);
        await loadDrills();
      } else {
        console.error("Failed to delete drill:", result.error);
        Alert.alert("Error", result.error || "Failed to delete drill");
      }
    } catch (error) {
      console.error("Error deleting drill:", error);
      Alert.alert("Error", "Failed to delete drill");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDrill = (drill: CourseDrill) => {
    console.log("Editing drill:", drill.drill_name);
    setEditingDrill(drill);
    setShowDrillForm(true);
  };

  const handleAddDrill = () => {
    console.log("Adding new drill");
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
                <Text style={styles.drillModalTitle}>Manage Drills</Text>
                <Text style={styles.drillModalLabel}>{course.title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.drillExitButton}
                >
                  <FontAwesome
                    name="times"
                    size={32}
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
        courseId={course.id}
        drill={editingDrill}
        isSubmitting={isSubmitting}
        onClose={handleCloseDrillForm}
        onCreateDrill={handleCreateDrill}
        onUpdateDrill={handleUpdateDrill}
      />
    </>
  );
}
