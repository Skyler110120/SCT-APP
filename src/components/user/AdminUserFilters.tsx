import { themes } from "@/src/context/themes";
import { adminUserFiltersStyles as styles } from "@/src/styles/ManageUserPageStyles/Admin/adminUserFiltersStyles";
import { UserRole } from "@/src/types/auth.types";
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, TextInput, View } from "react-native";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

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
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            placeholderTextColor={themes.white}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Role</Text>
          <View style={styles.filterPickerContainer}>
            <Picker
              selectedValue={roleFilter}
              onValueChange={(value) => setRoleFilter(value)}
              style={styles.filterPicker}
              dropdownIconColor={themes.vegasGold}
            >
              <Picker.Item label="All Roles" value="all" />
              <Picker.Item label="Student" value={UserRole.STUDENT} />
              <Picker.Item label="Instructor" value={UserRole.INSTRUCTOR} />
              <Picker.Item label="Admin" value={UserRole.ADMIN} />
            </Picker>
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserFilters;
