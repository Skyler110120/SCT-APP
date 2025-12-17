import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const companyListStyles = StyleSheet.create({
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
    fontSize:  width * 0.04,
    fontFamily: "Chakra-Regular",
    color: themes. white,
  },
  emptyListText: {
    padding: 20,
    fontSize: 20,
    fontFamily: "Chakra-Regular",
    textAlign: "center",
    color: themes.white,
  },
});