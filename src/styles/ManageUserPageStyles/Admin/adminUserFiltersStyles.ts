import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminUserFiltersStyles = StyleSheet.create({
  filterContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: themes.backgroundElevated,
    borderColor: themes.borderStrong,
  },
  filterSectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontFamily: "Oswald_500Medium",
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
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: themes.textSecondary,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundSoft,
    color: themes.white,
    fontFamily: "Inter_400Regular",
  },
  filterPickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundSoft,
    overflow: "hidden",
  },
  filterPicker: {
    color: themes.white,
  },
});