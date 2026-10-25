import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { companyService } from "@/src/services/companyService";
import { onboardingInviteService } from "@/src/services/onboardingInviteService";
import { userService } from "@/src/services/userService";
import { instructorDashboardStyles as dashboardStyles } from "@/src/styles/DashboardPageStyles/InstructorDashboardStyles/instructorDashboardStyles";
import { InviteCode } from "@/src/types/company.types";
import { UserRole } from "@/src/types/enums";
import { OnboardingInviteListItem } from "@/src/types/onboardingInvite.types";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type InviteRole = UserRole.STUDENT | UserRole.INSTRUCTOR;
type Message = { type: "success" | "error"; text: string } | null;

/** Instructor dashboard cards gated by permission flags (mirrors web InstructorDashboard). */
export default function InstructorTools() {
  const { user, updateUser } = useAuth();
  const canInviteStudents = Boolean(user?.can_create_student_invite_codes);
  const canInviteInstructors = Boolean(user?.can_create_instructor_invite_codes);
  const canUseInviteTools = canInviteStudents || canInviteInstructors;
  const canSetOwnCapacity = Boolean(user?.can_set_own_session_capacity);
  const companyId = user?.company_id ?? null;

  const [capacity, setCapacity] = useState(user?.max_students_per_session_self ?? 4);
  const [isSavingCapacity, setIsSavingCapacity] = useState(false);
  const [capacityMessage, setCapacityMessage] = useState<Message>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>(
    canInviteStudents ? UserRole.STUDENT : UserRole.INSTRUCTOR
  );
  const [backupCodes, setBackupCodes] = useState<InviteCode[]>([]);
  const [emailInvites, setEmailInvites] = useState<OnboardingInviteListItem[]>([]);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isCreatingCode, setIsCreatingCode] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<Message>(null);

  useEffect(() => {
    setCapacity(user?.max_students_per_session_self ?? 4);
  }, [user?.max_students_per_session_self]);

  useEffect(() => {
    if (!companyId || !canUseInviteTools) return;
    (async () => {
      const [codesRes, invitesRes] = await Promise.all([
        companyService.getInviteCodes(companyId),
        onboardingInviteService.listInvites(companyId),
      ]);
      if (codesRes.success && codesRes.data) setBackupCodes(codesRes.data);
      if (invitesRes.success && invitesRes.data) setEmailInvites(invitesRes.data);
    })();
  }, [companyId, canUseInviteTools]);

  if (user?.role !== UserRole.INSTRUCTOR || (!canSetOwnCapacity && !canUseInviteTools)) {
    return null;
  }

  const roleAllowed = (role: InviteRole) =>
    role === UserRole.STUDENT ? canInviteStudents : canInviteInstructors;

  const handleSaveCapacity = async () => {
    if (!user?.id) return;
    setIsSavingCapacity(true);
    setCapacityMessage(null);
    try {
      const response = await userService.updateInstructorPermissions(user.id, {
        max_students_per_session_self: capacity,
      });
      if (response.success && response.data) {
        const saved = response.data.max_students_per_session_self ?? capacity;
        updateUser({ max_students_per_session_self: saved });
        setCapacity(saved);
        setCapacityMessage({ type: "success", text: "Session capacity updated." });
      } else {
        setCapacityMessage({
          type: "error",
          text: response.error || "Failed to update session capacity.",
        });
      }
    } finally {
      setIsSavingCapacity(false);
    }
  };

  const handleSendEmailInvite = async () => {
    if (!companyId || !inviteEmail.trim()) return;
    if (!roleAllowed(inviteRole)) {
      setInviteMessage({ type: "error", text: "You do not have permission to invite that role." });
      return;
    }
    setIsSendingInvite(true);
    setInviteMessage(null);
    try {
      const result = await onboardingInviteService.createInvite(companyId, {
        email: inviteEmail.trim(),
        role: inviteRole,
        course_id: null,
      });
      if (result.success) {
        setInviteMessage({ type: "success", text: `Invite sent to ${inviteEmail.trim()}` });
        setInviteEmail("");
        const refreshed = await onboardingInviteService.listInvites(companyId);
        if (refreshed.success && refreshed.data) setEmailInvites(refreshed.data);
      } else {
        setInviteMessage({ type: "error", text: result.error || "Failed to send invite" });
      }
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCreateBackupCode = async () => {
    if (!companyId) return;
    if (!roleAllowed(inviteRole)) {
      setInviteMessage({
        type: "error",
        text: "You do not have permission to create invite codes for that role.",
      });
      return;
    }
    setIsCreatingCode(true);
    setInviteMessage(null);
    try {
      const result = await companyService.createInviteCode({
        company_id: companyId,
        role: inviteRole,
      });
      if (result.success && result.data) {
        const code = result.data.code;
        setBackupCodes((prev) => [result.data!, ...prev]);
        Alert.alert("Invite Code Created", `New code: ${code}`, [
          { text: "Copy Code", onPress: () => void copyCode(code) },
          { text: "OK" },
        ]);
      } else {
        setInviteMessage({ type: "error", text: result.error || "Failed to create invite code" });
      }
    } finally {
      setIsCreatingCode(false);
    }
  };

  const copyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Invite code copied to clipboard");
  };

  const renderMessage = (message: Message) =>
    message ? (
      <Text style={message.type === "error" ? styles.errorText : styles.successText}>
        {message.text}
      </Text>
    ) : null;

  return (
    <>
      {canSetOwnCapacity && (
        <View style={dashboardStyles.sectionContainer}>
          <Text style={dashboardStyles.sectionTitle}>Session Capacity</Text>
          <Text style={styles.bodyText}>
            Set how many students are allowed in sessions you run.
          </Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setCapacity((v) => Math.max(1, v - 1))}
              accessibilityLabel="Decrease capacity"
            >
              <Text style={styles.stepperText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{capacity}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setCapacity((v) => Math.min(50, v + 1))}
              accessibilityLabel="Increase capacity"
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
          {renderMessage(capacityMessage)}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSaveCapacity}
            disabled={isSavingCapacity}
          >
            {isSavingCapacity ? (
              <ActivityIndicator size="small" color={themes.black} />
            ) : (
              <Text style={styles.primaryButtonText}>Save Capacity</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {canUseInviteTools && companyId != null && (
        <View style={dashboardStyles.sectionContainer}>
          <Text style={dashboardStyles.sectionTitle}>Invite Management</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#888"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.chipRow}>
            {([UserRole.STUDENT, UserRole.INSTRUCTOR] as InviteRole[])
              .filter(roleAllowed)
              .map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[styles.chip, inviteRole === role && styles.chipSelected]}
                  onPress={() => setInviteRole(role)}
                >
                  <Text style={[styles.chipText, inviteRole === role && styles.chipTextSelected]}>
                    {role === UserRole.STUDENT ? "Student" : "Instructor"}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
          {renderMessage(inviteMessage)}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryButton, styles.flexButton]}
              onPress={handleSendEmailInvite}
              disabled={isSendingInvite || !inviteEmail.trim()}
            >
              <Text style={styles.primaryButtonText} numberOfLines={1}>
                {isSendingInvite ? "Sending..." : "Send Email Invite"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineButton, styles.flexButton]}
              onPress={handleCreateBackupCode}
              disabled={isCreatingCode}
            >
              <Text style={styles.outlineButtonText} numberOfLines={1}>
                {isCreatingCode ? "Creating..." : "Create Backup Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {backupCodes.filter((c) => c.is_active).slice(0, 5).map((code) => (
            <View key={code.code} style={styles.listRow}>
              <View style={styles.listCopy}>
                <Text style={styles.listPrimary} numberOfLines={1} ellipsizeMode="middle">
                  {code.code}
                </Text>
                <Text style={styles.listSecondary} numberOfLines={1}>
                  {code.role}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => void copyCode(code.code)}
                accessibilityRole="button"
                accessibilityLabel={`Copy invite code ${code.code}`}
              >
                <Text style={styles.copyText} numberOfLines={1}>
                  Copy
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {emailInvites.slice(0, 5).map((invite) => (
            <View key={invite.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listPrimary}>{invite.target_email || "—"}</Text>
                <Text style={styles.listSecondary}>
                  {invite.target_role} · {invite.invite_status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bodyText: { color: themes.white, marginBottom: 10 },
  errorText: { color: "#E8735F", marginVertical: 6 },
  successText: { color: themes.vegasGold, marginVertical: 6 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 10 },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperText: { color: themes.vegasGold, fontSize: 20, fontFamily: "Archivo_700Bold" },
  stepperValue: { color: themes.white, fontSize: 20, fontFamily: "Archivo_700Bold", minWidth: 32, textAlign: "center" },
  primaryButton: {
    backgroundColor: themes.vegasGold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: themes.black,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  outlineButton: {
    borderColor: themes.borderStrong,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 6,
  },
  outlineButtonText: {
    color: themes.textPrimary,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 15,
    lineHeight: 20,
  },
  buttonRow: { gap: 8, marginBottom: 8 },
  flexButton: { width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 12,
    color: themes.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipSelected: { backgroundColor: themes.vegasGold },
  chipText: { color: themes.textPrimary, fontFamily: "Archivo_600SemiBold", fontSize: 13 },
  chipTextSelected: { color: themes.black },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(197,179,88,0.4)",
  },
  listCopy: { flex: 1, minWidth: 0, marginRight: 10 },
  listPrimary: { color: themes.white, fontFamily: "Archivo_600SemiBold", fontSize: 15 },
  listSecondary: { color: themes.textMuted, fontSize: 12, marginTop: 2 },
  copyButton: {
    flexShrink: 0,
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: themes.vegasGold,
    alignItems: "center",
    justifyContent: "center",
  },
  copyText: {
    color: themes.black,
    fontFamily: "Archivo_600SemiBold",
    fontSize: 13,
    lineHeight: 16,
  },
});
