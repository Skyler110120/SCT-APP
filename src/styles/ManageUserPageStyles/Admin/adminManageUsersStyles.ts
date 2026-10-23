import { Dimensions, StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

const { height: windowHeight } = Dimensions.get("window");

/** Tall enough that several user rows are visible; page can still scroll to reveal more of the box. */
export const USERS_LIST_BOX_HEIGHT = Math.max(420, Math.round(windowHeight * 0.62));

export const adminManageUsersStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  pageScroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    // Leave room above the bottom nav so the list box isn't cramped.
    paddingBottom: 110,
  },
  pageTitle: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Oswald_600SemiBold",
    color: themes.vegasGold,
  },
  tableSection: {
    height: USERS_LIST_BOX_HEIGHT,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: themes.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: themes.danger,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: themes.vegasGold,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: "Oswald_500Medium",
    color: themes.black,
  },
});
