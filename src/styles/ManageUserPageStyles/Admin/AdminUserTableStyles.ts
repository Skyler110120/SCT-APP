import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isCompact = width < 420;

export const adminUserTableStyles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: themes.borderStrong,
    borderRadius: 12,
    backgroundColor: themes.backgroundElevated,
    overflow: "hidden",
  },
  tableSectionTitle: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themes.borderStrong,
    fontSize: isCompact ? 18 : 20,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.textPrimary,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText:  {
    fontSize: 16,
    fontFamily: "Archivo_400Regular",
    color: themes.textMuted,
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
  userName:  {
    marginBottom: 4,
    fontSize: isCompact ? 16 : 17,
    fontFamily: "Archivo_600SemiBold",
    color: themes.white,
  },
  userEmail: {
    marginBottom: 8,
    fontSize: isCompact ? 13 : 14,
    fontFamily: "Archivo_400Regular",
    color: themes.textSecondary,
  },
  userMeta:  {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  roleBadge:  {
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginRight: 12,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: themes.borderStrong,
    backgroundColor: themes.backgroundSoft,
  },
  roleBadgeText: {
    fontSize: isCompact ? 12 : 13,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.vegasGold,
  },
  pendingBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#E2A94E",
    backgroundColor: "rgba(226,169,78,0.12)",
  },
  pendingBadgeText: {
    fontSize: isCompact ? 12 : 13,
    fontFamily: "Archivo_600SemiBold",
    color: "#E2A94E",
  },
  userActions:  {
    flex: isCompact ? 0 : 1,
    marginTop: isCompact ? 8 : 0,
    flexDirection: isCompact ? "row" : "column",
    flexWrap: "wrap",
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
    fontSize: isCompact ? 12 : 13,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.vegasGold,
  },
  removeText:  {
    color: "#E8735F",
  },
  separator: {
    height: 1,
    backgroundColor: themes.border,
  },
});