import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const studentScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
