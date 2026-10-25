import { Dimensions, StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

const cardWidth = Math.min(300, Dimensions.get("window").width - 64);

export const courseOverviewCardStyles = StyleSheet.create({
  courseCard: {
    width: cardWidth,
    padding: 16,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: themes.backgroundElevated,
    borderWidth: 1,
    borderColor: themes.border,
  },
  selectedCourseCard: {
    borderColor: themes.vegasGold,
    borderWidth: 1,
    backgroundColor: "rgba(197,179,88,0.1)",
  },
  courseCardContent: {
    flex: 1,
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitleSection: {
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "ArchivoNarrow_600SemiBold",
    color: themes.white,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Archivo_400Regular",
    color: themes.textSecondary,
    marginBottom: 12,
  },
  courseInfo: {
    marginBottom: 12,
  },
  courseBadges: {
    flexDirection: "row",
    flexWrap:  "wrap",
    justifyContent: "center",
    gap: 6,
  },
  badge:  {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: themes.vegasGold + "20",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Archivo_600SemiBold",
    color: themes.vegasGold,
  },
  selectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  selectedText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Archivo_600SemiBold",
    color: themes.vegasGold,
  },
});