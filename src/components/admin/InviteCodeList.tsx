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

const InviteCodeList = ({
  inviteCodes,
  selectedCompany,
  isLoading,
  onCopyCode,
  showTitle = true
}: InviteCodeListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString();
  };

  const activeCodes = inviteCodes.filter(code => code.is_active);

  return (
    <View style={styles.sectionContainer}>
      {showTitle && (
        <Text style={styles.sectionTitle}>
          {selectedCompany
            ? `Invite Codes: ${selectedCompany.name}`
            : "Select a company"}
        </Text>
      )}
      
      {isLoading ? (
        <ActivityIndicator size="large" color={themes.vegasGold} />
      ) : selectedCompany ? (
        <ScrollView style={styles.listContainer}>
          {activeCodes.length > 0 ? (
            activeCodes.map((code, index) => (
              <React.Fragment key={code.id}>
                <View style={styles.inviteCodeCard}>
                  <View style={styles.horizontalLayout}>
                    <View style={styles.codeSection}>
                      <Text style={styles.codeText} numberOfLines={1} ellipsizeMode="middle">
                        {code.code}
                      </Text>
                    </View>
                    <View style={styles.buttonSection}>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => onCopyCode(code.code)}
                      >
                        <Text style={styles.copyText}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.detailsSection}>
                      <Text style={styles.codeDetails}>
                        Uses: {code.uses}/{code.max_uses}
                      </Text>
                      <Text style={styles.codeDetails}>
                        Expires: {formatDate(code.expires_at)}
                      </Text>
                    </View>
                  </View>
                </View>
                {index < activeCodes.length - 1 && (
                  <View style={styles.inviteCodeSeparator} />
                )}
              </React.Fragment>
            ))
          ) : (
            <Text style={styles.emptyListText}>
              No active invite codes for this company
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text style={styles.emptyListText}>
          Please select a company to view invite codes.
        </Text>
      )}
    </View>
  );
};

export default InviteCodeList;
