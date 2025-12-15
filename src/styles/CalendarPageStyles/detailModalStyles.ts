import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const detailModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0,7)",
  },
  sessionModalContent: {
    width: "95%",
    minHeight: 300,
    maxHeight: "85%",
    flexDirection: "column",
    padding: 24,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  sessionModalTitle: {
    fontSize: 36,
    fontFamily: "Chakra-BoldItalic",
    textAlign: "center",
    marginBottom: 8,
    color: themes.vegasGold,
  },
  sessionModalSubtitle: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    textAlign: "center",
    marginBottom: 16,
    color: themes.white,
  },
  sessionButtonPrimary: {
    backgroundColor: themes.vegasGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  sessionButtonSecondary: {
    backgroundColor: themes.black,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  sessionButtonDestructive: {
    backgroundColor: "#FF4444",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    flex: 1,
  },
  sessionButtonClose: {
    backgroundColor: themes.black,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    flex: 1,
  },
  sessionButtonTextPrimary: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  sessionButtonTextSecondary: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  sessionButtonTextDestructive: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  infoCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  infoCardSecondary: {
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  infoCardTertiary: {
    padding: 20,
    backgroundColor: themes.black,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  infoLabel: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  infoValuePrimary: {
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  infoValueSecondary: {
    marginBottom: 4,
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  infoValueTertiary: {
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  infoValueSubtle: {
    fontSize: 24,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    textAlign: 'center',
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  columnLayout: {
    flexDirection: "column",
    gap: 12,
  },
  rowLayout: {
    flexDirection: "row",
    gap: 16,
  },
  spacingSmall: {
    marginBottom: 8
  },
  spacingMedium: {
    marginBottom: 16
  },
  spacingLarge: {
    marginBottom: 24
  },
  sessionModalBody: {
    marginBottom: 16,
  },
  flexEqual: {
    flex: 1
  },
  flexDouble: {
    flex: 2
  },
});
