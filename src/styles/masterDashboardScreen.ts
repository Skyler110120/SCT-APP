import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

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
    padding: "2%",
  },
  columnsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftColumn: {
    flex: 1,
    marginRight: "2%",
  },
  rightColumn: {
    flex: 2,
  },
  sectionContainer: {
    marginBottom: 16,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: themes.vegasGold,
    overflow: "hidden",
  },
  listContainer: {
    maxHeight: 400,
    borderRadius: 20,
  },
  pageTitle: {
    padding: 8,
    marginTop: "7%",
    fontSize: width * 0.08,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  sectionTitle: {
    padding: 8,
    fontSize: width * 0.05,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  companyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 15,
  },
  selectedCompanyCard: {
    borderWidth: 1,
    backgroundColor: 'rgba(201, 176, 55, 0.3)',
    borderColor: themes.vegasGold,
  },
  companyText: {
    fontSize: width * 0.04,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    flexShrink: 1,
    maxWidth: "95%",
  },
  inviteCodeCard: {
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: themes.black,
  },
  codeHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 4,
  },
  horizontalLayout: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 32,
  },
  codeSection: {
    flex: 2,  
    paddingRight: 8,
  },
  buttonSection: {
    flex: 1,  
    alignItems: "center",
  },
  detailsSection: {
    flex: 2,  
    alignItems: "flex-end",
    paddingLeft: 8,
  },
  codeText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  codeDetails: {
    fontSize: 16, 
    fontFamily: "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
    marginBottom: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "1%",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    margin: 8,
    borderRadius: 15,
    backgroundColor: themes.vegasGold,
  },
  copyButton: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: themes.black,
  },
  copyText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
  },
  buttonText: {
    fontSize: width * 0.03,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  statsContainer: {
    padding: 16,
    marginTop: 16,
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  statsTitle: {
    marginBottom: '1%',
    paddingTop: "20%",
    fontSize: width * 0.08,
    fontFamily: "Chakra-Italic",
    textAlign: 'center',
    color: themes.vegasGold,
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
    color: themes.vegasGold,
  },
  statLabel: {
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    textAlign: "center",
    color: themes.vegasGold,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: themes.black,
    borderColor: themes.vegasGold,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  errorText: {
    marginTop: 4,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  },
  emptyListText: {
    padding: 20,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white,
  },
  inviteCodeSeparator: {
    height: 1,
    width: "100%",
    marginVertical: 8,
    backgroundColor: themes.vegasGold,
  }
});