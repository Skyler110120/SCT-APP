import { themes } from "@/src/context/themes";
import { courseFormStyles as styles } from "@/src/styles/CoursePageStyles/MasterAdminCourseManagementStyles/courseFormStyles";
import type { CourseDocument } from "@/src/types/course.types";
import { materialService } from "@/src/services/materialService";
import { MAX_PDF_SCRIPT_SIZE_BYTES, formatBytes } from "@/src/constants/uploadLimits";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CourseDocumentsEditorProps {
  courseId: number;
  initialDocuments: CourseDocument[];
  /** Called with the new list after any add / edit / remove so the parent can refresh. */
  onChange?: (documents: CourseDocument[]) => void;
}

const sortDocs = (docs: CourseDocument[]) =>
  [...docs].sort((a, b) => a.order_index - b.order_index || a.id - b.id);

const titleFromFilename = (name: string) => name.replace(/\.pdf$/i, "").trim() || name;

/**
 * Master Admin: manage any number of PDFs on a course. Each change is saved
 * right away (like videos), so it doesn't depend on the course form's Save.
 */
export default function CourseDocumentsEditor({
  courseId,
  initialDocuments,
  onChange,
}: CourseDocumentsEditorProps) {
  const [documents, setDocuments] = useState<CourseDocument[]>(sortDocs(initialDocuments));
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Reset only when switching courses; afterwards this component owns the list.
  useEffect(() => {
    setDocuments(sortDocs(initialDocuments));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const commit = (next: CourseDocument[]) => {
    const sorted = sortDocs(next);
    setDocuments(sorted);
    onChange?.(sorted);
  };

  const handleAdd = async () => {
    let pick: DocumentPicker.DocumentPickerResult;
    try {
      pick = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: true,
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not open the file picker.");
      return;
    }
    if (pick.canceled || pick.assets.length === 0) return;

    let current = documents;
    const failures: string[] = [];
    for (const file of pick.assets) {
      setUploadingName(file.name);
      try {
        const info = await FileSystem.getInfoAsync(file.uri);
        const size = (info as { size?: number }).size ?? file.size;
        if (typeof size === "number" && size > MAX_PDF_SCRIPT_SIZE_BYTES) {
          failures.push(`${file.name} is ${formatBytes(size)} (limit ${formatBytes(MAX_PDF_SCRIPT_SIZE_BYTES)})`);
          continue;
        }
        const urlRes = await materialService.requestUploadUrl({
          course_id: courseId,
          material_type: "course_pdf",
          filename: file.name,
          content_type: "application/pdf",
        });
        if (!urlRes.success) {
          failures.push(`${file.name}: ${urlRes.error}`);
          continue;
        }
        const uploadRes = await materialService.uploadFileToPresignedUrl(
          urlRes.data.upload_url,
          file.uri,
          "application/pdf"
        );
        if (!uploadRes.success) {
          failures.push(`${file.name}: ${uploadRes.error}`);
          continue;
        }
        const addRes = await materialService.addCourseDocument(courseId, {
          title: titleFromFilename(file.name),
          s3_key: urlRes.data.s3_key,
          filename: file.name,
          content_type: "application/pdf",
          is_public: false,
        });
        if (!addRes.success) {
          failures.push(`${file.name}: ${addRes.error}`);
          continue;
        }
        current = [...current, addRes.data];
        commit(current);
      } catch (e) {
        console.error(e);
        failures.push(`${file.name}: upload failed`);
      }
    }
    setUploadingName(null);
    if (failures.length > 0) {
      Alert.alert("Some PDFs were not added", failures.join("\n"));
    }
  };

  const update = async (
    doc: CourseDocument,
    patch: { title?: string; is_public?: boolean; order_index?: number }
  ) => {
    setBusyId(doc.id);
    const res = await materialService.updateCourseDocument(courseId, doc.id, patch);
    setBusyId(null);
    if (!res.success) {
      Alert.alert("Error", res.error);
      return null;
    }
    return res.data;
  };

  const handleToggleVisible = async (doc: CourseDocument, value: boolean) => {
    const updated = await update(doc, { is_public: value });
    if (updated) commit(documents.map((d) => (d.id === doc.id ? updated : d)));
  };

  const handleSaveTitle = async (doc: CourseDocument) => {
    const title = editTitle.trim();
    if (!title || title === doc.title) {
      setEditingId(null);
      return;
    }
    const updated = await update(doc, { title });
    if (updated) {
      commit(documents.map((d) => (d.id === doc.id ? updated : d)));
      setEditingId(null);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const doc = documents[index];
    const other = documents[index + direction];
    if (!doc || !other) return;
    // Renumber 1..n with the two swapped so equal order_index values can't stall a move.
    const reordered = [...documents];
    reordered[index] = other;
    reordered[index + direction] = doc;
    const renumbered = reordered.map((d, i) => ({ ...d, order_index: i + 1 }));
    const changed = renumbered.filter(
      (d) => documents.find((o) => o.id === d.id)?.order_index !== d.order_index
    );
    setBusyId(doc.id);
    // Keep only the moves the server accepted, so the list matches what is saved.
    const saved = new Map<number, number>();
    for (const d of changed) {
      const res = await materialService.updateCourseDocument(courseId, d.id, { order_index: d.order_index });
      if (!res.success) {
        Alert.alert("Error", res.error);
        break;
      }
      saved.set(d.id, d.order_index);
    }
    setBusyId(null);
    commit(
      documents
        .map((d) => (saved.has(d.id) ? { ...d, order_index: saved.get(d.id)! } : d))
        .sort((a, b) => a.order_index - b.order_index)
    );
  };

  const handleRemove = (doc: CourseDocument) => {
    Alert.alert("Remove PDF", `Remove "${doc.title}" from this course?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setBusyId(doc.id);
          const res = await materialService.deleteCourseDocument(courseId, doc.id);
          setBusyId(null);
          if (!res.success) {
            Alert.alert("Error", res.error);
            return;
          }
          commit(documents.filter((d) => d.id !== doc.id));
        },
      },
    ]);
  };

  const uploading = uploadingName !== null;

  return (
    <View>
      <Text style={styles.inputDescription}>
        {documents.length === 0
          ? "No PDFs yet. Add as many as you need."
          : `${documents.length} PDF${documents.length !== 1 ? "s" : ""}. New PDFs start hidden from students.`}
      </Text>

      {documents.map((doc, i) => {
        const busy = busyId === doc.id;
        return (
          <View key={doc.id} style={local.row}>
            <View style={local.rowHeader}>
              <FontAwesome name="file-pdf-o" size={18} color={themes.vegasGold} />
              {editingId === doc.id ? (
                <TextInput
                  style={[styles.searchInput, local.titleInput]}
                  value={editTitle}
                  onChangeText={setEditTitle}
                  autoFocus
                  maxLength={200}
                  onSubmitEditing={() => handleSaveTitle(doc)}
                  returnKeyType="done"
                  accessibilityLabel="PDF title"
                  placeholderTextColor={themes.textMuted}
                />
              ) : (
                <Text style={local.title} numberOfLines={2}>
                  {doc.title}
                </Text>
              )}
              {busy && <ActivityIndicator size="small" color={themes.vegasGold} />}
            </View>

            <View style={local.visibleRow}>
              <Text style={[styles.inputDescription, { marginBottom: 0 }]}>Visible to students</Text>
              <Switch
                value={doc.is_public}
                onValueChange={(v) => handleToggleVisible(doc, v)}
                disabled={busy}
                trackColor={{ false: "#555", true: themes.vegasGold }}
                thumbColor={themes.white}
              />
            </View>

            <View style={local.actions}>
              {editingId === doc.id ? (
                <>
                  <ActionButton label="Save" onPress={() => handleSaveTitle(doc)} disabled={busy} />
                  <ActionButton label="Cancel" onPress={() => setEditingId(null)} />
                </>
              ) : (
                <ActionButton
                  label="Rename"
                  onPress={() => {
                    setEditingId(doc.id);
                    setEditTitle(doc.title);
                  }}
                  disabled={busy}
                />
              )}
              <ActionButton icon="arrow-up" label="Move up" onPress={() => handleMove(i, -1)} disabled={busy || i === 0} />
              <ActionButton
                icon="arrow-down"
                label="Move down"
                onPress={() => handleMove(i, 1)}
                disabled={busy || i === documents.length - 1}
              />
              <ActionButton label="Remove" danger onPress={() => handleRemove(doc)} disabled={busy} />
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.confirmButton, { marginTop: 8 }]}
        onPress={handleAdd}
        disabled={uploading}
        accessibilityLabel="Add PDFs"
      >
        {uploading ? (
          <View style={local.uploadingRow}>
            <ActivityIndicator size="small" color={themes.white} />
            <Text style={styles.buttonText} numberOfLines={1}>
              {" "}Uploading {uploadingName}...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Add PDFs</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  icon?: "arrow-up" | "arrow-down";
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[local.actionButton, disabled && { opacity: 0.4 }]}
      accessibilityLabel={label}
      hitSlop={6}
    >
      {icon ? (
        <FontAwesome name={icon} size={14} color={themes.white} />
      ) : (
        <Text style={[local.actionText, danger && { color: "#ff6b6b" }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const local = StyleSheet.create({
  row: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    flex: 1,
    color: themes.white,
    fontSize: 15,
    fontWeight: "600",
  },
  titleInput: {
    flex: 1,
    marginBottom: 0,
  },
  visibleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    minWidth: 36,
    alignItems: "center",
  },
  actionText: {
    color: themes.white,
    fontSize: 13,
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
