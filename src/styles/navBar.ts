import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

export const navBarStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    backgroundColor: themes.surfaceSunken,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: themes.borderStrong,
    paddingHorizontal: 4,
  },
  navItem: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  activeMarker: {
    position: "absolute",
    top: 0,
    width: 28,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: "transparent",
  },
  activeMarkerOn: {
    backgroundColor: themes.vegasGold,
  },
  navText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Archivo_500Medium",
    color: themes.textMuted,
  },
  navTextActive: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Archivo_600SemiBold",
    color: themes.textPrimary,
  },
});
