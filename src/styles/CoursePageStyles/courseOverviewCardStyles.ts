import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const courseOverviewCardStyles = StyleSheet.create({
  courseCard: {
    width: 320,
    padding: 16,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: themes. vegasGold,
  },
  selectedCourseCard: {
    borderColor: themes.vegasGold,
    borderWidth: 2,
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
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  courseDescription: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Chakra-Regular",
    color: themes.white,
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
    fontSize: 16,
    fontFamily: "Chakra-Bold",
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
    fontSize: 20,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
});