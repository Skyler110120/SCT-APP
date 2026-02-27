import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminManageUsersStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content:  {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 34,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  tableSection: {
    flex: 1,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent:  "center",
    alignItems:  "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: themes.vegasGold,
    borderRadius: 6,
  },
  retryButtonText:  {
    fontSize: 16,
    fontFamily: "Chakra-Medium",
    color: themes.black,
  },
});