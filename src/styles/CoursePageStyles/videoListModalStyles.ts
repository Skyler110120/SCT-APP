import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const videoListModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: themes.black,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: themes. vegasGold + "30",
  },
  closeButton: {
    width: 40,
    height:  40,
    borderRadius:  20,
    backgroundColor: themes.vegasGold + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleSection:  {
    flex: 1,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.white + "70",
    marginTop: 4,
  },
  closeButtonPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateModal: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle:  {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white + "70",
    textAlign: "center",
    lineHeight: 22,
  },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 6,
    backgroundColor: themes.black + "60",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes. vegasGold + "30",
  },
  videoIcon:  {
    marginRight: 16,
  },
  videoContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes. white,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes. white + "80",
    marginBottom: 8,
    lineHeight: 18,
  },
  videoMeta: {
    flexDirection:  "row",
    gap: 12,
  },
  videoOrder: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
    fontWeight: "600",
  },
  videoWeek: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold + "80",
    fontWeight: "600",
  },
});