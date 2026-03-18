import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import { themes } from "@/src/context/themes";
import {
  ClassCreate,
  ClassUpdate,
  ClassWithDrills,
} from "@/src/types/course.drills.types";

interface ClassFormModalProps {
  visible: boolean;
  class: ClassWithDrills | null;
  onClose: () => void;
  onSubmit: (data: ClassCreate | ClassUpdate) => Promise<void>;
  isSubmitting: boolean;
  existingClassCount: number;
}

export default function ClassFormModal({
  visible,
  class: editingClass,
  onClose,
  onSubmit,
  isSubmitting,
  existingClassCount,
}: ClassFormModalProps) {
  const [weekIndex, setWeekIndex] = useState("1");
  const [title, setTitle] = useState("");
  const [endstate, setEndstate] = useState("");
  const [roundCount, setRoundCount] = useState("");

  const isEdit = !!editingClass;

  useEffect(() => {
    if (visible) {
      if (editingClass) {
        setWeekIndex(String(editingClass.week_index));
        setTitle(editingClass.title ?? "");
        setEndstate(editingClass.endstate ?? "");
        setRoundCount(editingClass.round_count?.toString() ?? "");
      } else {
        setWeekIndex(String(Math.min(existingClassCount + 1, 4)));
        setTitle("");
        setEndstate("");
        setRoundCount("");
      }
    }
  }, [visible, editingClass, existingClassCount]);

  const handleSubmit = async () => {
    const wi = parseInt(weekIndex, 10);
    if (Number.isNaN(wi) || wi < 1 || wi > 4) return;
    const payload: ClassCreate | ClassUpdate = isEdit
      ? {
          week_index: wi,
          title: title.trim() || undefined,
          endstate: endstate.trim() || undefined,
          round_count: roundCount.trim() ? parseInt(roundCount, 10) : undefined,
        }
      : {
          week_index: wi,
          title: title.trim() || undefined,
          endstate: endstate.trim() || undefined,
          round_count: roundCount.trim() ? parseInt(roundCount, 10) : undefined,
          display_order: wi,
        };
    await onSubmit(payload);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.content}>
          <ScrollView
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.title}>{isEdit ? "Edit class" : "Add class"}</Text>
            <Text style={s.label}>Week index in month (1–4)</Text>
            <TextInput
              style={s.input}
              value={weekIndex}
              onChangeText={setWeekIndex}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={themes.white + "80"}
            />
            <Text style={s.label}>Title (optional)</Text>
            <TextInput
              style={s.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Introduction to grip"
              placeholderTextColor={themes.white + "80"}
            />
            <Text style={s.label}>End state (optional)</Text>
            <TextInput
              style={[s.input, s.textArea]}
              value={endstate}
              onChangeText={setEndstate}
              placeholder="What the student should achieve by end of class"
              placeholderTextColor={themes.white + "80"}
              multiline
              numberOfLines={3}
            />
            <Text style={s.label}>Round count (optional)</Text>
            <TextInput
              style={s.input}
              value={roundCount}
              onChangeText={setRoundCount}
              keyboardType="number-pad"
              placeholder="e.g. 50"
              placeholderTextColor={themes.white + "80"}
            />
            <View style={s.buttons}>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.submitBtn}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={themes.black} />
                ) : (
                  <Text style={s.submitBtnText}>{isEdit ? "Save" : "Add"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  content: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontFamily: "Chakra-Medium",
    color: themes.white,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  cancelBtnText: {
    fontSize: 16,
    fontFamily: "Chakra-Medium",
    color: themes.vegasGold,
  },
  submitBtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
});
