import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const studentProgressModalStyles = StyleSheet.create({
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
    borderBottomColor: themes.vegasGold + "30",
  },
  closeButton: {
    width: 40,
    height:  40,
    borderRadius: 20,
    backgroundColor: themes.vegasGold + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPlaceholder: {
    width: 40,
  },
  modalTitleSection: {
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize:  16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  emptyStateModal: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateTitle: {
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
  filterSection: {
    paddingVertical:  16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: themes.vegasGold + '20',
  },
  filterTitle: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color: themes. vegasGold,
    marginBottom:  8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius:  8,
    borderWidth: 1,
    borderColor: themes.vegasGold + '40',
    backgroundColor:  'transparent',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: themes.vegasGold + '30',
    borderColor: themes.vegasGold,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white + '80',
  },
  filterButtonTextActive: {
    color: themes.vegasGold,
    fontFamily: "Chakra-Bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal:  20,
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 6,
    backgroundColor: themes. black + "60",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themes.vegasGold + "30",
  },
  studentInfo: {
    flex: 1,
  },
  studentHeaderRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontFamily: "Chakra-Bold",
    color:  themes.white,
    marginBottom: 4,
  },
  studentCourse: {
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
    marginBottom: 8,
  },
  progressInfo: {
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: themes.white + "20",
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: themes.vegasGold,
    borderRadius: 3,
  },
  progressStatusRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white + "80",
  },
  studentNotes: {
    fontSize: 12,
    fontFamily: "Chakra-Regular",
    color: themes.white + "70",
    fontStyle: "italic",
  },
  updateButton: {
    width: 36,
    height:  36,
    borderRadius: 18,
    backgroundColor: themes.vegasGold,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  updateButtonDisabled: {
    backgroundColor: themes.white + '30',
    opacity: 0.5,
  },
});