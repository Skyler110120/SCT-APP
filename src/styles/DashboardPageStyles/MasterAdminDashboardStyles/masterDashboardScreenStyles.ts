import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const masterAdminDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentContainer: {
    padding: 16,
  },
  columnsContainer: {
    flexDirection: width < 900 ? "column" : "row",
  },
  leftColumn: {
    flex: 1,
    marginRight: width < 900 ? 0 : "2%",
    marginBottom: width < 900 ? 12 : 0,
  },
  rightColumn: {
    flex: width < 900 ? 1 : 2,
  },
  pageTitle: {
    paddingVertical: 4,
    marginTop: 4,
    marginBottom: 8,
    fontSize: width < 900 ? 24 : 32,
    lineHeight: width < 900 ? 30 : 40,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.textPrimary,
  },
  selectedBanner: {
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundElevated,
  },
  selectedBannerLabel: {
    fontSize: 12,
    fontFamily: "Archivo_500Medium",
    color: themes.vegasGold,
    opacity: 0.9,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  selectedBannerTitle: {
    fontSize: 18,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.white,
  },
  selectedBannerPlaceholder: {
    fontSize: 14,
    fontFamily: "Archivo_400Regular",
    color: themes.textMuted,
  },
  buttonContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  contextActionsLabel: {
    fontSize: 13,
    fontFamily: "Archivo_500Medium",
    color: themes.vegasGold,
    opacity: 0.95,
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  contextButtonRow: {
    flexDirection: "column",
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    color: themes.black,
  },
  createCompanyButton: {
    alignItems: "center",
    padding: 14,
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundElevated,
  },
  createCompanyButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    color: themes.vegasGold,
  },
  logoutButton: {
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    backgroundColor: "transparent",
  },
  logoutButtonText: {
    fontSize: width < 900 ? 15 : width * 0.02,
    fontFamily: "Archivo_500Medium",
    color: themes.vegasGold,
  },
});