import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminUserTableStyles = StyleSheet. create({
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
    borderBottomColor: themes. vegasGold,
    fontSize: 28,
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
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  userInfo: {
    flex: 3,
  },
  userName:  {
    marginBottom: 4,
    fontSize:  24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  userEmail: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  userMeta:  {
    flexDirection: "row",
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
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  userActions:  {
    flex: 1,
    flexDirection: "column",
  },
  actionButton: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "transparent",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 16,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  removeText:  {
    color: "#FF4444",
  },
  separator: {
    height: 1,
    backgroundColor: themes.vegasGold,
  },
});