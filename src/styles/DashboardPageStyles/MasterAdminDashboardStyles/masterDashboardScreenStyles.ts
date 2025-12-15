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
  contentContainer: {
    flex: 1,
    padding: "2%",
  },
  columnsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1,
    marginRight: "2%",
  },
  rightColumn: {
    flex: 2,
  },
  pageTitle: {
    padding: 8,
    marginTop: "7%",
    fontSize: width * 0.08,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  buttonContainer: {
    flexDirection: "row",
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