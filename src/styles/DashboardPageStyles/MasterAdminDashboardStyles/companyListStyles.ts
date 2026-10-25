import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const companyListStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: themes.border,
    backgroundColor: themes.backgroundElevated,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 13,
    fontFamily: "Archivo_500Medium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: themes.textMuted,
  },
  listContainer: {
    maxHeight: 320,
  },
  companyCard: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.border,
    backgroundColor: themes.backgroundSoft,
    gap: 2,
  },
  selectedCompanyCard: {
    borderColor: themes.vegasGold,
    backgroundColor: "rgba(197, 179, 88, 0.16)",
  },
  companyText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    color: themes.white,
  },
  companyMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Archivo_400Regular",
    color: themes.textMuted,
  },
  emptyListText: {
    paddingVertical: 16,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Archivo_400Regular",
    textAlign: "center",
    color: themes.textSecondary,
  },
});
