import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export const calendarScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  calendarContainer: {
    borderRadius: 20,
    overflow: "hidden",
    margin: 16,
    borderWidth: 2,
    borderColor: themes.white,
  },
  scheduleContainer: {
    flex: 1,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    marginTop: 70,
    paddingRight: 16,
    paddingLeft: 16,
    backgroundColor: themes.vegasGold,
  },
  scheduleText: {
    fontSize: 48,
    fontFamily: "Chakra-Italic",
    marginBottom: 16,
    textAlign: 'center',
    color: themes.white,
  },
  sessionCard: {
    flexDirection: "row",
    borderRadius: 15,
    padding: 16,  
    marginBottom: 12,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: themes.black,
  },
  sessionText: {
    fontSize: 28,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white
  }
});
