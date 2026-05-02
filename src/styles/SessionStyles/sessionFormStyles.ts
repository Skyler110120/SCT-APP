import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const sessionFormStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: themes.textSecondary,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  backButtonText: {
    color: themes.vegasGold,
    fontSize: 18,
    fontFamily: "Chakra-Bold",
  },
  headerTitle: {
    flex: 1,
    color: themes.vegasGold,
    fontSize: 20,
    fontFamily: "Oswald_500Medium",
  },
  headerSubtitle: {
    color: themes.white,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    opacity: 0.7,
  },

  // Student Switcher
  studentSwitcherContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  studentSwitcherScroll: {
    flexDirection: "row",
    gap: 8,
  },
  studentChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginRight: 8,
  },
  studentChipActive: {
    backgroundColor: themes.vegasGold,
    borderColor: themes.vegasGold,
  },
  studentChipText: {
    color: themes.white,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
  },
  studentChipTextActive: {
    color: themes.black,
    fontFamily: "Chakra-Bold",
  },
  studentChipStatus: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "Chakra-Regular",
    marginTop: 2,
  },
  studentChipStatusActive: {
    color: "rgba(0,0,0,0.5)",
  },

  // Section
  sectionContainer: {
    marginTop: 16,
    backgroundColor: themes.backgroundElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.15)",
  },
  sectionTitle: {
    color: themes.vegasGold,
    fontSize: 18,
    fontFamily: "Oswald_500Medium",
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "rgba(197, 179, 88, 0.2)",
    marginVertical: 16,
  },

  // Form Fields
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: themes.white,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  fieldHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    marginTop: 4,
  },

  // Slider
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sliderTrack: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  sliderSegment: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  sliderSegmentActive: {
    backgroundColor: themes.vegasGold,
    borderColor: themes.vegasGold,
  },
  sliderSegmentText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: "Chakra-Bold",
  },
  sliderSegmentTextActive: {
    color: themes.black,
  },
  sliderValue: {
    color: themes.vegasGold,
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    minWidth: 28,
    textAlign: "center",
  },

  // Toggle buttons (enum selectors)
  toggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.3)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: themes.vegasGold,
    borderColor: themes.vegasGold,
  },
  toggleButtonText: {
    color: themes.white,
    fontSize: 13,
    fontFamily: "Chakra-Regular",
  },
  toggleButtonTextActive: {
    color: themes.black,
    fontFamily: "Chakra-Bold",
  },

  // Bool toggle (Yes/No)
  boolRow: {
    flexDirection: "row",
    gap: 12,
  },
  boolButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.3)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  boolButtonActive: {
    backgroundColor: themes.vegasGold,
    borderColor: themes.vegasGold,
  },
  boolButtonText: {
    color: themes.white,
    fontSize: 16,
    fontFamily: "Chakra-Bold",
  },
  boolButtonTextActive: {
    color: themes.black,
  },

  // Text input
  textInput: {
    backgroundColor: themes.backgroundSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(197, 179, 88, 0.2)",
    color: themes.white,
    padding: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    minHeight: 44,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Progress button
  progressButton: {
    marginTop: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressButtonActive: {
    backgroundColor: themes.vegasGold,
    shadowColor: themes.vegasGold,
  },
  progressButtonText: {
    color: themes.white,
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    letterSpacing: 1,
  },
  progressButtonTextActive: {
    color: themes.black,
  },
  progressButtonSubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    marginTop: 4,
  },

  // Complete / Submit
  completeButton: {
    marginTop: 12,
    backgroundColor: themes.vegasGold,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: themes.black,
    fontSize: 18,
    fontFamily: "Oswald_500Medium",
    letterSpacing: 1,
  },

  // Save draft
  saveButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: themes.vegasGold,
    fontSize: 16,
    fontFamily: "Chakra-Bold",
  },

  // Completed badge
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  completedBadgeText: {
    color: "#4CAF50",
    fontSize: 14,
    fontFamily: "Chakra-Bold",
    marginLeft: 8,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: themes.vegasGold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: themes.black,
    fontSize: 16,
    fontFamily: "Chakra-Bold",
  },

  // Week info
  weekInfoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(197, 179, 88, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 8,
  },
  weekInfoText: {
    color: themes.vegasGold,
    fontSize: 14,
    fontFamily: "Chakra-Bold",
  },
  weekInfoSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "Chakra-Regular",
  },
});
