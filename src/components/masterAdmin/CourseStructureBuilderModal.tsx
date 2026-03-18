import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { drillService } from "@/src/services/courseDrillService";
import { courseStructureBuilderStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/courseStructureBuilderStyles";
import {
  CourseStructure,
  CourseMonthWithClasses,
  ClassWithDrills,
  ClassDrill,
  CourseMonthCreate,
  ClassCreate,
  ClassUpdate,
  ClassDrillCreate,
} from "@/src/types/course.drills.types";
import { CourseAdminView } from "@/src/types/course.types";
import { themes } from "@/src/context/themes";
import DrillPickerModal from "./DrillPickerModal";
import ClassFormModal from "./ClassFormModal";
import MonthFormModal from "./MonthFormModal";

export type BuilderViewLevel = "timeline" | "month" | "class";

interface CourseStructureBuilderModalProps {
  visible: boolean;
  course: CourseAdminView | null;
  onClose: () => void;
  onOpenPlatformDrills: () => void;
}

export default function CourseStructureBuilderModal({
  visible,
  course,
  onClose,
  onOpenPlatformDrills,
}: CourseStructureBuilderModalProps) {
  const [structure, setStructure] = useState<CourseStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewLevel, setViewLevel] = useState<BuilderViewLevel>("timeline");
  const [selectedMonth, setSelectedMonth] = useState<CourseMonthWithClasses | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassWithDrills | null>(null);

  const [showMonthForm, setShowMonthForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithDrills | null>(null);
  const [showDrillPicker, setShowDrillPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStructure = useCallback(async (): Promise<CourseStructure | null> => {
    if (!course?.id) return null;
    setLoading(true);
    try {
      const res = await drillService.getCourseStructure(course.id);
      if (res.success && res.data) {
        setStructure(res.data);
        return res.data;
      }
      Alert.alert("Error", res.error ?? "Failed to load course structure");
      return null;
    } catch (e) {
      Alert.alert("Error", "Failed to load course structure");
      return null;
    } finally {
      setLoading(false);
    }
  }, [course?.id]);

  useEffect(() => {
    if (visible && course?.id) {
      fetchStructure();
      setViewLevel("timeline");
      setSelectedMonth(null);
      setSelectedClass(null);
    }
  }, [visible, course?.id, fetchStructure]);

  const handleBack = () => {
    if (viewLevel === "class") {
      setViewLevel("month");
      setSelectedClass(null);
    } else if (viewLevel === "month") {
      setViewLevel("timeline");
      setSelectedMonth(null);
    }
  };

  const handleAddMonth = () => setShowMonthForm(true);
  const handleCreateMonth = async (data: CourseMonthCreate) => {
    if (!course?.id) return;
    setSubmitting(true);
    try {
      const res = await drillService.createCourseMonth(course.id, data);
      if (res.success) {
        setShowMonthForm(false);
        await fetchStructure();
      } else {
        Alert.alert("Error", res.error ?? "Failed to create month");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setShowClassForm(true);
  };
  const handleEditClass = (cls: ClassWithDrills) => {
    setEditingClass(cls);
    setShowClassForm(true);
  };
  const handleSaveClass = async (data: ClassCreate | ClassUpdate) => {
    if (!course?.id || !selectedMonth) return;
    setSubmitting(true);
    try {
      if (editingClass) {
        const res = await drillService.updateClass(course.id, editingClass.id, data as ClassUpdate);
        if (res.success) {
          setShowClassForm(false);
          setEditingClass(null);
          const updated = await fetchStructure();
          const cls = updated?.months
            .flatMap((m) => m.classes)
            .find((c) => c.id === editingClass.id);
          if (cls) setSelectedClass(cls);
        } else {
          Alert.alert("Error", res.error ?? "Failed to update class");
        }
      } else {
        const res = await drillService.createClass(course.id, selectedMonth.id, data as ClassCreate);
        if (res.success) {
          setShowClassForm(false);
          const updated = await fetchStructure();
          if (res.data && updated) {
            const month = updated.months.find((m) => m.id === selectedMonth.id);
            const newClass = month?.classes?.find((c) => c.id === res.data!.id);
            if (newClass) {
              setSelectedClass(newClass);
              setSelectedMonth(month ?? null);
            }
          }
        } else {
          Alert.alert("Error", res.error ?? "Failed to create class");
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = (cls: ClassWithDrills) => {
    if (!course?.id) return;
    Alert.alert(
      "Delete class",
      `Remove "${cls.title || `Week ${cls.week_index}`}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              const res = await drillService.deleteClass(course.id, cls.id);
              if (res.success) {
                await fetchStructure();
                if (selectedClass?.id === cls.id) {
                  setViewLevel("month");
                  setSelectedClass(null);
                }
              } else {
                Alert.alert("Error", res.error ?? "Failed to delete class");
              }
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleAddDrillToClass = () => setShowDrillPicker(true);
  const handleDrillPicked = async (drillId: number, isHomework: boolean, durationMinutes?: number) => {
    if (!course?.id || !selectedClass) return;
    setSubmitting(true);
    try {
      const nextOrder =
        (selectedClass.class_drills?.length ?? 0) + 1;
      const res = await drillService.addDrillToClass(course.id, selectedClass.id, {
        drill_id: drillId,
        is_homework: isHomework,
        duration_minutes: durationMinutes ?? undefined,
        display_order: nextOrder,
      });
      if (res.success) {
        setShowDrillPicker(false);
        const updated = await fetchStructure();
        const month = updated?.months.find((m) =>
          m.classes.some((c) => c.id === selectedClass.id)
        );
        const updatedClass = month?.classes.find((c) => c.id === selectedClass.id);
        if (updatedClass) setSelectedClass(updatedClass);
      } else {
        Alert.alert("Error", res.error ?? "Failed to add drill");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDrillFromClass = (cd: ClassDrill) => {
    if (!course?.id || !selectedClass) return;
    Alert.alert(
      "Remove drill",
      `Remove "${cd.drill.name}" from this class?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              const res = await drillService.removeDrillFromClass(
                course.id,
                selectedClass.id,
                cd.drill_id
              );
              if (res.success) {
                const updated = await fetchStructure();
                const month = updated?.months.find((m) =>
                  m.classes.some((c) => c.id === selectedClass.id)
                );
                const updatedClass = month?.classes.find((c) => c.id === selectedClass.id);
                if (updatedClass) setSelectedClass(updatedClass);
              } else {
                Alert.alert("Error", res.error ?? "Failed to remove drill");
              }
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteMonth = (month: CourseMonthWithClasses) => {
    if (!course?.id) return;
    Alert.alert(
      "Delete month",
      `Remove "Month ${month.month_index}" and all its classes? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              const res = await drillService.deleteCourseMonth(course.id, month.id);
              if (res.success) {
                await fetchStructure();
                if (selectedMonth?.id === month.id) {
                  setViewLevel("timeline");
                  setSelectedMonth(null);
                  setSelectedClass(null);
                }
              } else {
                Alert.alert("Error", res.error ?? "Failed to delete month");
              }
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  if (!course) return null;

  const getHeaderTitle = () => {
    if (viewLevel === "timeline") return "Course timeline";
    if (viewLevel === "month" && selectedMonth)
      return `Month ${selectedMonth.month_index}${selectedMonth.title ? `: ${selectedMonth.title}` : ""}`;
    if (viewLevel === "class" && selectedClass)
      return selectedClass.title || `Week ${selectedClass.week_index}`;
    return "Course structure";
  };

  const canGoBack = viewLevel !== "timeline";

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            {canGoBack ? (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}
            <Text style={styles.title} numberOfLines={1}>
              {getHeaderTitle()}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={themes.vegasGold} />
              <Text style={styles.loadingText}>Loading structure...</Text>
            </View>
          ) : viewLevel === "timeline" ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.classDetailLabel, { marginBottom: 12 }]}>
                {course.title} — tap a month to edit classes
              </Text>
              <View style={styles.timelineRow}>
                {(structure?.months ?? []).map((month) => (
                  <TouchableOpacity
                    key={month.id}
                    style={styles.monthCard}
                    onPress={() => {
                      setSelectedMonth(month);
                      setViewLevel("month");
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.monthCardTitle}>
                      Month {month.month_index}
                      {month.title ? `: ${month.title}` : ""}
                    </Text>
                    <Text style={styles.monthCardSubtitle}>
                      {month.classes?.length ?? 0} class
                      {(month.classes?.length ?? 0) !== 1 ? "es" : ""}
                    </Text>
                    <TouchableOpacity
                      style={{ marginTop: 8 }}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteMonth(month);
                      }}
                      disabled={submitting}
                    >
                      <Text style={[styles.platformDrillsLinkText, { fontSize: 12, color: "#FF6666" }]}>
                        Delete month
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addMonthButton}
                  onPress={handleAddMonth}
                  disabled={submitting}
                >
                  <FontAwesome name="plus" size={20} color={themes.vegasGold} />
                  <Text style={[styles.addMonthButtonText, { marginTop: 6 }]}>Add month</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : viewLevel === "month" && selectedMonth ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.classDetailSection}>
                {(selectedMonth.classes ?? [])
                  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  .map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={styles.classRow}
                      onPress={() => {
                        setSelectedClass(cls);
                        setViewLevel("class");
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.classRowInfo}>
                        <Text style={styles.classRowTitle}>
                          {cls.title || `Week ${cls.week_index}`}
                        </Text>
                        <Text style={styles.classRowMeta}>
                          {cls.class_drills?.length ?? 0} drill
                          {(cls.class_drills?.length ?? 0) !== 1 ? "s" : ""}
                          {cls.global_week_number != null
                            ? ` · Global week ${cls.global_week_number}`
                            : ""}
                        </Text>
                      </View>
                      <View style={styles.classRowActions}>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEditClass(cls);
                          }}
                          disabled={submitting}
                        >
                          <FontAwesome name="edit" size={18} color={themes.vegasGold} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleDeleteClass(cls);
                          }}
                          disabled={submitting}
                        >
                          <FontAwesome name="trash" size={18} color="#FF6666" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
              <TouchableOpacity
                style={styles.addClassButton}
                onPress={handleAddClass}
                disabled={submitting}
              >
                <FontAwesome name="plus" size={18} color={themes.vegasGold} />
                <Text style={styles.addClassButtonText}>Add class</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : viewLevel === "class" && selectedClass ? (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.classDetailSection}>
                <Text style={styles.classDetailLabel}>Title</Text>
                <Text style={styles.classDetailValue}>
                  {selectedClass.title || `Week ${selectedClass.week_index}`}
                </Text>
              </View>
              {selectedClass.endstate != null && selectedClass.endstate !== "" && (
                <View style={styles.classDetailSection}>
                  <Text style={styles.classDetailLabel}>End state</Text>
                  <Text style={styles.classDetailValueMultiline}>{selectedClass.endstate}</Text>
                </View>
              )}
              {selectedClass.round_count != null && (
                <View style={styles.classDetailSection}>
                  <Text style={styles.classDetailLabel}>Round count</Text>
                  <Text style={styles.classDetailValue}>{selectedClass.round_count}</Text>
                </View>
              )}

              <View style={[styles.classDetailSection, { marginTop: 8 }]}>
                <Text style={styles.classDetailLabel}>Drills in this class</Text>
                {(selectedClass.class_drills ?? [])
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((cd) => (
                    <View key={cd.id} style={styles.drillCard}>
                      <Text style={styles.drillCardName}>{cd.drill.name}</Text>
                      <Text style={styles.drillCardMeta}>
                        {cd.is_homework ? "Homework" : "In-session"}
                        {cd.duration_minutes != null ? ` · ${cd.duration_minutes} min` : ""}
                      </Text>
                      <TouchableOpacity
                        style={styles.drillCardActions}
                        onPress={() => handleRemoveDrillFromClass(cd)}
                        disabled={submitting}
                      >
                        <FontAwesome name="times" size={14} color="#FF6666" />
                        <Text style={[styles.platformDrillsLinkText, { marginLeft: 6, fontSize: 12, color: "#FF6666" }]}>
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                <TouchableOpacity
                  style={styles.addDrillButton}
                  onPress={handleAddDrillToClass}
                  disabled={submitting}
                >
                  <FontAwesome name="plus" size={16} color={themes.vegasGold} />
                  <Text style={styles.addDrillButtonText}>Add drill from platform</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.platformDrillsLink}
                onPress={onOpenPlatformDrills}
              >
                <Text style={styles.platformDrillsLinkText}>
                  Manage platform drills (create / edit)
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No content to display.</Text>
            </View>
          )}
        </View>

        <MonthFormModal
          visible={showMonthForm}
          onClose={() => setShowMonthForm(false)}
          onSubmit={handleCreateMonth}
          isSubmitting={submitting}
          existingMonthCount={structure?.months?.length ?? 0}
        />
        <ClassFormModal
          visible={showClassForm}
          class={editingClass}
          onClose={() => {
            setShowClassForm(false);
            setEditingClass(null);
          }}
          onSubmit={handleSaveClass}
          isSubmitting={submitting}
          existingClassCount={selectedMonth?.classes?.length ?? 0}
        />
        <DrillPickerModal
          visible={showDrillPicker}
          onClose={() => setShowDrillPicker(false)}
          onSelect={handleDrillPicked}
          alreadyInClassIds={(selectedClass?.class_drills ?? []).map((cd) => cd.drill_id)}
        />
      </View>
    </Modal>
  );
}
