import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const inviteCodeListStyles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 16,
    borderWidth: 2,
    borderRadius: 20,
    borderColor: themes. vegasGold,
    overflow: "hidden",
  },
  sectionTitle: {
    padding: 8,
    fontSize: width * 0.05,
    fontFamily: "Chakra-Italic",
    textAlign: "center",
    color: themes.vegasGold,
  },
  listContainer:  {
    maxHeight: 400,
    borderRadius: 20,
  },
  inviteCodeCard:  {
    padding: 10,
    marginBottom: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: themes.black,
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
  copyButton:  {
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
  codeDetails: {
    fontSize:  16,
    fontFamily:  "Chakra-Regular",
    color: themes.white,
    opacity: 0.8,
    marginBottom: 1,
  },
  inviteCodeSeparator: {
    height: 1,
    width: "100%",
    marginVertical: 8,
    backgroundColor: themes.vegasGold,
  },
  emptyListText: {
    padding: 20,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes. white,
  },
});