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
  content: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Chakra-BoldItalic",
    color: themes.vegasGold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "rgba(0 ,0 , 0, 0.3)",
  },
  searchIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  tableSection: {
    flex: 1,
    marginTop: 8,
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
  retryButtonText: {
    fontSize: 16,
    fontFamily: "Chakra-Medium",
    color: themes.black,
  },

  // Filter styles
  filterContainer: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: themes.black,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  filterSectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#222222",
    color: themes.white,
    fontFamily: "Chakra-Regular",
  },
  filterPickerContainer: {
    backgroundColor: "#222222",
    borderRadius: 8,
    overflow: "hidden",
  },
  filterPicker: {
    color: themes.white,
  },

  // User table styles
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 8,
    backgroundColor: themes.black,
    overflow: "hidden",
  },
  tableSectionTitle: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themes.vegasGold,
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
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
  userName: {
    marginBottom: 4,
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  userEmail: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
  userActions: {
    flex: 1,
    flexDirection: "column",
  },
  actionButton: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  actionText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  removeText: {
    color: "#FF4444",
  },
  separator: {
    height: 1,
    opacity: 0.2,
    marginHorizontal: 16,
    backgroundColor: themes.vegasGold,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.5,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  modalUserInfo: {
    marginBottom: 20,
  },
  modalUserName: {
    marginBottom: 4,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalUserEmail: {
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  confirmationText: {
    marginBottom: 8,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  warningText: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  },
  currentRole: {
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  roleLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalPickerContainer: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#222222",
    overflow: "hidden",
  },
  modalPicker: {
    color: themes.white,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#222222",
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    marginLeft: 12,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: themes.vegasGold,
  },
  removalButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#FF4444",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes.black,
  },
});
