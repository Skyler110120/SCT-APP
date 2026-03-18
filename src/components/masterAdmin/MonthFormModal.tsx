import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { themes } from "@/src/context/themes";
import { CourseMonthCreate } from "@/src/types/course.drills.types";

interface MonthFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CourseMonthCreate) => Promise<void>;
  isSubmitting: boolean;
  existingMonthCount: number;
}

export default function MonthFormModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  existingMonthCount,
}: MonthFormModalProps) {
  const [monthIndex, setMonthIndex] = useState(String(existingMonthCount + 1));
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (visible) {
      setMonthIndex(String(existingMonthCount + 1));
      setTitle("");
    }
  }, [visible, existingMonthCount]);

  const handleSubmit = async () => {
    const mi = parseInt(monthIndex, 10);
    if (Number.isNaN(mi) || mi < 1 || mi > 12) {
      return;
    }
    await onSubmit({
      month_index: mi,
      title: title.trim() || undefined,
      display_order: mi,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.content}>
          <Text style={s.title}>Add month</Text>
          <Text style={s.label}>Month index (1–12)</Text>
          <TextInput
            style={s.input}
            value={monthIndex}
            onChangeText={setMonthIndex}
            keyboardType="number-pad"
            placeholder="e.g. 1"
            placeholderTextColor={themes.white + "80"}
          />
          <Text style={s.label}>Title (optional)</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Fundamentals"
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
                <Text style={s.submitBtnText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
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
    width: "85%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
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
