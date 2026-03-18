import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Switch,
  TextInput,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { drillService } from "@/src/services/courseDrillService";
import { Drill } from "@/src/types/course.drills.types";
import { themes } from "@/src/context/themes";

interface DrillPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (drillId: number, isHomework: boolean, durationMinutes?: number) => Promise<void>;
  alreadyInClassIds: number[];
}

export default function DrillPickerModal({
  visible,
  onClose,
  onSelect,
  alreadyInClassIds,
}: DrillPickerModalProps) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [isHomework, setIsHomework] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedDrill(null);
      setIsHomework(false);
      setDurationMinutes("");
      setLoading(true);
      drillService
        .getDrills(true)
        .then((res) => {
          if (res.success && res.data) {
            setDrills(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const available = drills.filter((d) => !alreadyInClassIds.includes(d.id));

  const handleConfirmAdd = async () => {
    if (!selectedDrill) return;
    setSubmitting(true);
    try {
      const dur = durationMinutes.trim()
        ? parseInt(durationMinutes, 10)
        : undefined;
      await onSelect(
        selectedDrill.id,
        isHomework,
        dur && !Number.isNaN(dur) ? dur : undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.content}>
          <View style={s.header}>
            <Text style={s.title}>Add drill to class</Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <FontAwesome name="times" size={22} color={themes.vegasGold} />
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={s.loading}>
              <ActivityIndicator size="large" color={themes.vegasGold} />
              <Text style={s.loadingText}>Loading drills...</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={available}
                keyExtractor={(item) => item.id.toString()}
                style={s.list}
                renderItem={({ item }) => {
                  const isSelected = selectedDrill?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[s.drillRow, isSelected && s.drillRowSelected]}
                      onPress={() => setSelectedDrill(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.drillName}>{item.name}</Text>
                      {item.purpose ? (
                        <Text style={s.drillPurpose} numberOfLines={1}>
                          {item.purpose}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={s.emptyText}>
                    {drills.length === 0
                      ? "No platform drills. Create some first."
                      : "All drills are already in this class."}
                  </Text>
                }
              />
              {selectedDrill && (
                <View style={s.options}>
                  <View style={s.switchRow}>
                    <Text style={s.optionLabel}>Homework</Text>
                    <Switch
                      value={isHomework}
                      onValueChange={setIsHomework}
                      trackColor={{ false: "#444", true: themes.vegasGold }}
                      thumbColor={themes.white}
                    />
                  </View>
                  <Text style={s.optionLabel}>Duration (minutes, optional)</Text>
                  <TextInput
                    style={s.input}
                    value={durationMinutes}
                    onChangeText={setDurationMinutes}
                    keyboardType="number-pad"
                    placeholder="e.g. 15"
                    placeholderTextColor={themes.white + "80"}
                  />
                  <TouchableOpacity
                    style={s.confirmBtn}
                    onPress={handleConfirmAdd}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={themes.black} />
                    ) : (
                      <Text style={s.confirmBtnText}>Add to class</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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
    width: "92%",
    maxHeight: "85%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  closeBtn: {
    padding: 8,
  },
  loading: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  list: {
    maxHeight: 220,
  },
  drillRow: {
    padding: 12,
    marginBottom: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black + "80",
  },
  drillRowSelected: {
    borderWidth: 2,
    backgroundColor: themes.vegasGold + "20",
  },
  drillName: {
    fontSize: 15,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  drillPurpose: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
    textAlign: "center",
    padding: 16,
  },
  options: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: themes.vegasGold,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: "Chakra-Medium",
    color: themes.white,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 12,
  },
  confirmBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
    alignItems: "center",
    marginTop: 8,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
});
