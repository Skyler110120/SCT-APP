import { themes, theme } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  card: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  backLinkText: {
    fontFamily: theme.typography.family.bodyMedium,
    fontSize: 15,
    color: themes.textSecondary,
  },
  brandMark: {
    width: 30,
    height: 32,
  },
  loginScreenContentContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: theme.typography.family.headingSemiBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -0.6,
    color: themes.textPrimary,
  },
  subtitle: { color: themes.textSecondary, fontSize: 16, lineHeight: 23 },
  form: { gap: 14, marginTop: 18 },
  loginErrorText: {
    color: themes.danger,
    fontFamily: "Archivo_500Medium",
    fontSize: 14,
    textAlign: "left",
  },
  textInputBox: {
    minHeight: 52,
    width: "100%",
    fontSize: 16,
  },
  logInButton: {
    minHeight: 52,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -4,
  },
  forgotPasswordText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 14,
    color: themes.textSecondary,
  },
  horizontalLine: {
    marginTop: 18,
    borderBottomColor: themes.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  registerPrompt: {
    marginTop: 6,
    fontFamily: "Archivo_400Regular",
    fontSize: 15,
    color: themes.textSecondary,
  },
  registerLink: {
    fontFamily: "Archivo_600SemiBold",
    color: themes.vegasGold,
  },
});
