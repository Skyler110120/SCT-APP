import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isCompact = width < 420;

export const instructorStudentTableStyles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  tableSectionTitle: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor:  themes.vegasGold,
    fontSize: isCompact ? 22 : 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText:  {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.5,
  },
  listContent: {
    paddingBottom: 16,
  },
  userRow: {
    flexDirection: isCompact ? "column" : "row",
    padding: 16,
    alignItems: isCompact ? "stretch" : "center",
  },
  userInfo: {
    flex: isCompact ? 0 : 3,
  },
  userName: {
    marginBottom: 4,
    fontSize: isCompact ? 20 : 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  userEmail: {
    marginBottom: 8,
    fontSize: isCompact ? 15 : 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  userMeta: {
    flexDirection:  "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  roleBadge:  {
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: themes. vegasGold,
    backgroundColor: themes.black,
  },
  roleBadgeText: {
    fontSize: isCompact ? 14 : 18,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  userActions: {
    flex: isCompact ? 0 : 1,
    marginTop: isCompact ? 8 : 0,
    flexDirection: isCompact ? "row" : "column",
  },
  actionButton: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor:  "transparent",
  },
  actionText: {
    marginLeft: 6,
    fontSize: isCompact ? 14 : 16,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  separator: {
    height: 1,
    backgroundColor: themes.vegasGold,
  },
});