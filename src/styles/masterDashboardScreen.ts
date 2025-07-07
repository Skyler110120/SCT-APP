import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const masterAdminDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  columnsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  rightColumn: {
    flex: 2,
    marginLeft: 8,
  },
  sectionContainer: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: themes.vegasGold,
  },
  listContainer: {
    maxHeight: 400,
    borderRadius: 20,
  },
  pageTitle: {
    fontSize: 48,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
    padding: 8
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
    padding: 8,
  },
  companyCard: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedCompanyCard: {
    backgroundColor: 'rgba(201, 176, 55, 0.3)', // Semi-transparent vegas gold
    borderWidth: 1,
    borderColor: themes.vegasGold,
  },
  companyText: {
    fontSize: 22,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  inviteCodeCard: {
    flexDirection: "column",
    borderRadius: 15,
    padding: 16,  
    marginBottom: 12,
    marginHorizontal: 8,
    backgroundColor: themes.black,
  },
  inviteCodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeText: {
    fontSize: 22,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  codeDetails: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,  
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    padding: 12,
    alignItems: "center",
    margin: 8,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  statsContainer: {
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: 16,
    padding: 16,
    backgroundColor: themes.vegasGold,
  },
  statsTitle: {
    fontSize: 32,
    fontFamily: "Chakra-Italic",
    marginBottom: 16,
    textAlign: 'center',
    color: themes.white,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statCard: {
    alignItems: "center",
    padding: 8,
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  statLabel: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: themes.vegasGold,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: themes.white,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.white,
    textAlign: "center",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: themes.black,
    borderRadius: 10,
    padding: 12,
    color: themes.white,
    fontFamily: "Chakra-Regular",
    fontSize: 16,
  },
  errorText: {
    color: "#FF4444",
    fontFamily: "Chakra-Regular",
    marginTop: 4,
  },
  emptyListText: {
    textAlign: "center",
    color: themes.white,
    fontFamily: "Chakra-Regular",
    fontSize: 16,
    padding: 20,
  },
});

