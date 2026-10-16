import { themes } from "@/src/context/themes";
import { instructorStudentFiltersStyles as styles } from "@/src/styles/ManageUserPageStyles/Instructor/instructorStudentFiltersStyles";
import React from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type StudentStatusFilter = "all" | "active" | "inactive";

interface InstructorStudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StudentStatusFilter;
  setStatusFilter: (status: StudentStatusFilter) => void;
}

const STATUS_OPTIONS: { label: string; value: StudentStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const InstructorStudentFilters: React.FC<InstructorStudentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  const dismissSearchKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterSectionTitle}>Find Students</Text>

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
              onSubmitEditing={dismissSearchKeyboard}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={dismissSearchKeyboard}
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
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.statusChipRow}>
            {STATUS_OPTIONS.map((option) => {
              const selected = statusFilter === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusChip,
                    selected && styles.statusChipSelected,
                  ]}
                  onPress={() => setStatusFilter(option.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      selected && styles.statusChipTextSelected,
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

export default InstructorStudentFilters;
