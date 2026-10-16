import { themes } from "@/src/context/themes";
import { adminUserFiltersStyles as styles } from "@/src/styles/ManageUserPageStyles/Admin/adminUserFiltersStyles";
import { UserRole } from "@/src/types/auth.types";
import React from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Student", value: UserRole.STUDENT },
  { label: "Instructor", value: UserRole.INSTRUCTOR },
  { label: "Admin", value: UserRole.ADMIN },
];

const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
}) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterSectionTitle}>Filters</Text>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Search</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, styles.searchInputFlex]}
              placeholder="Search by name or email"
              placeholderTextColor={themes.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => Keyboard.dismiss()}
              accessibilityRole="button"
              accessibilityLabel="Apply search"
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Role</Text>
          <View style={styles.roleChipRow}>
            {ROLE_OPTIONS.map((option) => {
              const selected = roleFilter === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.roleChip, selected && styles.roleChipSelected]}
                  onPress={() => setRoleFilter(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.roleChipText,
                      selected && styles.roleChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserFilters;
