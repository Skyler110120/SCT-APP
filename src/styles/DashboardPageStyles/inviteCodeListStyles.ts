import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const inviteCodeListStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 4,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 13,
    fontFamily: "Archivo_500Medium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: themes.textMuted,
  },
  listContainer: {
    maxHeight: 360,
  },
  inviteCodeCard: {
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.border,
    backgroundColor: themes.backgroundSoft,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  codeText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Archivo_600SemiBold",
    letterSpacing: 0.4,
    color: themes.textPrimary,
  },
  copyButton: {
    flexShrink: 0,
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: themes.vegasGold,
    alignItems: "center",
    justifyContent: "center",
  },
  copyText: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: "Archivo_600SemiBold",
    color: themes.black,
  },
  codeDetails: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Archivo_400Regular",
    color: themes.textMuted,
  },
  emptyListText: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Archivo_400Regular",
    textAlign: "center",
    color: themes.textSecondary,
  },
});
