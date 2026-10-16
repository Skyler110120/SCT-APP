import { themes } from "@/src/context/themes";
import { instructorStudentFiltersStyles as styles } from "@/src/styles/ManageUserPageStyles/Instructor/instructorStudentFiltersStyles";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface InstructorStudentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

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
              placeholder="Search by student name or email"
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
          <View style={styles.filterPickerContainer}>
            <Picker
              selectedValue={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
              style={styles.filterPicker}
              dropdownIconColor={themes.vegasGold}
            >
              <Picker.Item label="All Students" value="all" />
              <Picker.Item label="Active Students" value="active" />
              <Picker.Item label="Inactive Students" value="inactive" />
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InstructorStudentFilters;
