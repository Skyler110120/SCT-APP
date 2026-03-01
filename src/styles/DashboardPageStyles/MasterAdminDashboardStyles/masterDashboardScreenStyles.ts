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
    padding: "2%",
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
    padding: 8,
    marginTop: "7%",
    fontSize: width < 900 ? 34 : width * 0.08,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  selectedBanner: {
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black + "60",
  },
  selectedBannerLabel: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
    opacity: 0.9,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  selectedBannerTitle: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  selectedBannerPlaceholder: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  contextActionsLabel: {
    fontSize: 13,
    fontFamily: "Chakra-Medium",
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
    borderRadius: 15,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: width < 900 ? 20 : width * 0.03,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  createCompanyButton: {
    alignItems: "center",
    padding: 14,
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
  },
  createCompanyButtonText: {
    fontSize: width < 900 ? 20 : width * 0.03,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  logoutButton: {
    alignItems: "center",
    padding: 12,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
  },
  logoutButtonText: {
    fontSize: width < 900 ? 18 : width * 0.025,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
});