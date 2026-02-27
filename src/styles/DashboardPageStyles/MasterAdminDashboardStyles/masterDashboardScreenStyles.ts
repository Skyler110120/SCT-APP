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
  buttonContainer: {
    flexDirection: width < 900 ? "column" : "row",
    justifyContent: "space-between",
    marginBottom: "1%",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 8,
    borderRadius: 15,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: width * 0.03,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
});