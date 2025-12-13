import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const adminDashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    padding: 8,
    fontSize: 48,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  companyHeader: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
    backgroundColor: "rgba(201, 176, 55, .03)",
  },
  companyName: {
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: themes.vegasGold,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 36,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
    marginBottom: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  actionButton: {
    alignItems: "center",
    padding: 12,
    margin: 8,
    borderRadius: 25,
    backgroundColor: themes.vegasGold,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  listContainer: {
    maxHeight: 400,
    borderRadius: 20,
  },
  inviteCodeCard: {
    flexDirection: "column",
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    borderRadius: 15,
    backgroundColor:themes.black
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
  copyButton: {
    alignItems: "center",
    padding: 12,
    margin: 8,
    borderRadius: 15,
    backgroundColor: themes.black,
  },
  copyText: {
    fontSize: 22,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
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
    marginVertical: 4,
    backgroundColor: themes.vegasGold,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: themes.vegasGold,
    backgroundColor: themes.black,
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  errorText: {
    marginTop: 4,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
});
