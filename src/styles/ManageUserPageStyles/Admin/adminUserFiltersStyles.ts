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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontFamily: "Inter_600SemiBold",
    color: themes.black,
  },
  roleChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
  },
  roleChipSelected: {
    backgroundColor: themes.vegasGold,
  },
  roleChipText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: themes.vegasGold,
  },
  roleChipTextSelected: {
    color: themes.black,
  },
});
