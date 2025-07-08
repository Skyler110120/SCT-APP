import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: themes.vegasGold,
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: themes.vegasGold,
    fontFamily: "Chakra-Bold",
  },
  userInfoSection: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  welcomeText: {
    marginBottom: 5,
    fontSize: 20,
    fontWeight: "bold",
    color: themes.white,
    fontFamily: "Chakra-Bold",
  },
  emailText: {
    fontSize: 16,
    color: "#cccccc",
    fontFamily: "Chakra-Regular",
  },
  contentSection: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: "white",
    fontFamily: "Chakra-Regular",
  },
  logoutButton: {
    padding: 15,
    marginTop: 20,
    alignItems: "center",
    backgroundColor: themes.black || "#FFD700",
    borderRadius: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: themes.vegasGold,
    fontFamily: "Chakra-Bold",
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
    backgroundColor: themes.black,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: themes.vegasGold,
  },
  modalTitle: {
    marginBottom: 20,
    fontSize: 28,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  labelText: {
    marginBottom: 12,
    fontSize: 18,
    fontFamily: "Chakra-Regular",
    color: themes.white,
  },
  textInput: {
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1,
    borderColor: themes.vegasGold,
    borderRadius: 10,
    color: themes.white,
    fontFamily: "Chakra-Regular",
    fontSize: 16
  },
  submitButton: {
    padding: 12,
    marginTop: 10,
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    borderRadius: 15
  },
  disabledButton: {
    opacity: 0.6
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.white,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Chakra-Regular",
    color: "#FF4444",
  }
});
