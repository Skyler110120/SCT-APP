import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { masterAdminDashboardStyles as inviteCodeList } from "@/src/styles/masterDashboardScreen";
import { InviteCode, Company } from "@/src/types/company.types";
import { themes } from "@/src/context/themes";
import * as Clipboard from "expo-clipboard";

interface InviteCodeListProps {
  inviteCodes: InviteCode[];
  selectedCompany: Company | null;
  isLoading: boolean;
  onCopyCode: (code: string) => void;
}

const InviteCodeList = ({
  inviteCodes,
  selectedCompany,
  isLoading,
  onCopyCode,
}: InviteCodeListProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={inviteCodeList.sectionContainer}>
      <Text style={inviteCodeList.sectionTitle}>
        {selectedCompany
          ? `Invite Codes: ${selectedCompany.name}`
          : "Select a company"}
      </Text>
      {isLoading ? (
        <ActivityIndicator size="large" color={themes.vegasGold} />
      ) : selectedCompany ? (
        <ScrollView style={inviteCodeList.listContainer}>
          {inviteCodes.length > 0 ? (
            inviteCodes.map((code) => (
              <View key={code.id} style={inviteCodeList.inviteCodeCard}>
                <View style={inviteCodeList.inviteCodeHeader}>
                  <Text style={inviteCodeList.codeText}>{code.code}</Text>
                  <TouchableOpacity
                    style={inviteCodeList.actionButton}
                    onPress={() => onCopyCode(code.code)}
                  >
                    <Text style={inviteCodeList.codeText}>Copy</Text>
                  </TouchableOpacity>
                  <View>
                    <Text style={inviteCodeList.codeDetails}>
                      Uses: {code.uses}/{code.max_uses}
                    </Text>
                    <Text style={inviteCodeList.codeDetails}>
                      Expires: {formatDate(code.expires_at)}
                    </Text>
                    <Text style={inviteCodeList.codeDetails}>
                      Status: {code.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={inviteCodeList.emptyListText}>
              No invite codes for this company
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text style={inviteCodeList.emptyListText}>
          Please select a company to view invite codes.
        </Text>
      )}
    </View>
  );
};

export default InviteCodeList;
