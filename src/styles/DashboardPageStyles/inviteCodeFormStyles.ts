import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const inviteCodeFormStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themes.overlay,
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: themes.backgroundElevated,
    borderColor: themes.borderStrong,
  },
  modalTitle: {
    marginBottom: 16,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "Oswald_500Medium",
    textAlign: "center",
    color: themes.textPrimary,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
    color: themes.textSecondary,
  },
  buttonContainer: {
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold",
    color: themes.black,
  },
});
