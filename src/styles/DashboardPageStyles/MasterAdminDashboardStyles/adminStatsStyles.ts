import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminStatsStyles = StyleSheet.create({
  statsContainer: {
    marginTop: 4,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: themes.border,
    backgroundColor: themes.backgroundElevated,
  },
  statsTitle: {
    marginBottom: 10,
    fontSize: 13,
    fontFamily: "Archivo_500Medium",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: themes.textMuted,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: themes.backgroundSoft,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.vegasGold,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Archivo_500Medium",
    color: themes.textSecondary,
  },
});
