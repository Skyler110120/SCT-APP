import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorStudentFiltersStyles = StyleSheet.create({
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
    fontSize: 24,
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
    fontSize: 17,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  searchInputFlex: {
    flex: 1,
  },
  searchButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  searchButtonText: {
    fontSize: 14,
    fontFamily: "Chakra-Bold",
    color: themes.black,
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
