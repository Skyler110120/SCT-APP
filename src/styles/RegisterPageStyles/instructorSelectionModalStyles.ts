import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const instructorSelectionModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    alignSelf: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  contentContainer: {
    minHeight: 200,
  },
  emptyStateContainer:  {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize:  20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize:  16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
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
  pickerSection: {
    padding: 4,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  pickerDescription: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  filterPickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  filterPicker: {
    color: themes.white,
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  savingText: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  footerInfo: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: themes.vegasGold,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Chakra-Italic",
    color: themes.white,
    textAlign: "center",
    lineHeight: 16,
  },
});