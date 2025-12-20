import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorStudentFiltersStyles = StyleSheet. create({
  filterContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: themes.vegasGold,
  },
  filterSectionTitle: {
    marginBottom: 16,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
    color: themes.white,
    fontFamily: "Chakra-Regular",
  },
  filterPickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  filterPicker: {
    color: themes.white,
  },
});