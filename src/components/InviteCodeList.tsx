import { themes } from "@/src/context/themes";
import { inviteCodeListStyles as styles } from "@/src/styles/DashboardPageStyles/inviteCodeListStyles";
import { Company, InviteCode } from "@/src/types/company.types";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface InviteCodeListProps {
  inviteCodes: InviteCode[];
  selectedCompany: Company | null;
  isLoading: boolean;
  onCopyCode: (code: string) => void;
  showTitle?: boolean;
}

function formatRole(role: string) {
  switch (role) {
    case "STUDENT":
      return "Student";
    case "INSTRUCTOR":
      return "Instructor";
    case "ADMIN":
      return "Admin";
    case "MASTERADMIN":
      return "Master admin";
    default:
      return role.charAt(0) + role.slice(1).toLowerCase();
  }
}

const InviteCodeList = ({
  inviteCodes,
  selectedCompany,
  isLoading,
  onCopyCode,
  showTitle = true,
}: InviteCodeListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString();
  };

  const codes = inviteCodes.filter((code) => code.is_active);

  return (
    <View style={styles.sectionContainer}>
      {showTitle && (
        <Text style={styles.sectionTitle} numberOfLines={1}>
          {selectedCompany ? selectedCompany.name : "Select a company"}
        </Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="small" color={themes.vegasGold} />
      ) : selectedCompany ? (
        <ScrollView style={styles.listContainer}>
          {codes.length > 0 ? (
            codes.map((code) => (
              <View key={code.code} style={styles.inviteCodeCard}>
                <View style={styles.codeRow}>
                  <Text
                    style={styles.codeText}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                  >
                    {code.code}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => onCopyCode(code.code)}
                    accessibilityRole="button"
                    accessibilityLabel={`Copy invite code ${code.code}`}
                  >
                    <Text style={styles.copyText} numberOfLines={1}>
                      Copy
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeDetails} numberOfLines={1}>
                  {formatRole(String(code.role))} · Expires {formatDate(code.expires_at)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyListText}>
              No active invite codes for this company
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.emptyListText}>
          Select a company to view invite codes.
        </Text>
      )}
    </View>
  );
};

export default InviteCodeList;
