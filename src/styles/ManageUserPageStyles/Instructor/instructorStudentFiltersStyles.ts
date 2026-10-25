import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorStudentFiltersStyles = StyleSheet.create({
  filterContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "transparent",
    borderColor: themes.border,
  },
  filterSectionTitle: {
    marginBottom: 12,
    fontSize: 22,
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.textPrimary,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 15,
    fontFamily: "Archivo_400Regular",
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
    borderColor: themes.border,
    backgroundColor: "transparent",
    color: themes.white,
    fontFamily: "Archivo_400Regular",
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
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.black,
  },
  statusChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
  },
  statusChipSelected: {
    backgroundColor: themes.vegasGold,
  },
  statusChipText: {
    fontSize: 14,
    fontFamily: "ArchivoNarrow_700Bold",
    color: themes.vegasGold,
  },
  statusChipTextSelected: {
    color: themes.black,
  },
});
