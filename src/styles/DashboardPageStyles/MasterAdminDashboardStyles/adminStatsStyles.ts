import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const adminStatsStyles = StyleSheet.create({
  statsContainer: {
    padding: 16,
    marginTop: 16,
    borderRadius: 100,
    backgroundColor: "transparent",
  },
  statsTitle:  {
    marginBottom: '1%',
    paddingTop: "20%",
    fontSize: width * 0.08,
    fontFamily: "Chakra-Italic",
    textAlign: 'center',
    color: themes.vegasGold,
  },
  statRow: {
    flexDirection: "row",
    justifyContent:  "space-around",
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
});