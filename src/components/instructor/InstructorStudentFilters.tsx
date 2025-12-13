import { themes } from "@/src/context/themes";
import { manageUsersStyles as styles } from "@/src/styles/UserPageStyles/manageUsers";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, TextInput, View } from "react-native";

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
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterSectionTitle}>Find Students</Text>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student name or email"
            placeholderTextColor={themes.white}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
