import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const masterAdminCourseManagementStyles = StyleSheet.create({
  container: {
    flex:  1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "transparent",
  },
  pageTitle: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 40,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  loadingContainer: {
    flex:  1,
    justifyContent: "center",
    alignItems: "center",
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
  courseSection: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
  buttonContainer: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom: 16,
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
    fontSize: 24,
    fontFamily: "Chakra-BoldItalic",
    color: themes.white,
  },
});