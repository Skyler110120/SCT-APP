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
    paddingVertical: 8,
    marginTop: 8,
    fontSize: width < 900 ? 32 : width * 0.06,
    fontFamily: "Oswald_500Medium",
    textAlign: "center",
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
    fontFamily: "Inter_500Medium",
    color: themes.vegasGold,
    opacity: 0.9,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  selectedBannerTitle: {
    fontSize: 18,
    fontFamily: "Oswald_500Medium",
    color: themes.white,
  },
  selectedBannerPlaceholder: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: themes.textMuted,
  },
  buttonContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  contextActionsLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
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
    fontSize: width < 900 ? 16 : width * 0.022,
    fontFamily: "Oswald_500Medium",
    color: themes.black,
    letterSpacing: 0.6,
    textTransform: "uppercase",
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
    fontSize: width < 900 ? 16 : width * 0.022,
    fontFamily: "Oswald_500Medium",
    color: themes.vegasGold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  logoutButton: {
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
  },
  logoutButtonText: {
    fontSize: width < 900 ? 15 : width * 0.02,
    fontFamily: "Inter_500Medium",
    color: themes.vegasGold,
  },
});