import { Dimensions, StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

const { width } = Dimensions.get("window");

export const drillManagementStyles = StyleSheet.create({
    drillModalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: themes.background
    },
    drillModalContent: {
        width: "95%",
        height: "85%",
        alignSelf: "center",
        padding: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: themes.vegasGold,
        backgroundColor: themes.black,
    },
    drillModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    drillModalTitle: {
        marginBottom: 10,
        textAlign: "center",
        fontSize: width * 0.06,
        fontFamily: "Chakra-Bold",
        color: themes.vegasGold,
    },
    drillModalLabel: {
        marginBottom: 8,
        fontSize: width * 0.04,
        fontFamily: "Chakra-Regular",
        color: themes.white,
    },
    drillExitButton: {
        padding: ".5%", 
        paddingTop: "0.1%",
        marginBottom: "10%",
        borderColor: "white", 
        borderWidth: 1,
    },
    drillListContainer: {
        borderRadius: 8,
        flex: 1,
        borderWidth: 2,
        overflow: "hidden",
    },
    drillModalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    drillModalAddButton: {
        flex: 1,
        alignItems: "center",
        padding: "1%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themes.vegasGold,
        backgroundColor: themes.black,
    },
    drillModalButtonText: {
        fontSize: width * 0.04,
        fontFamily: "Chakra-BoldItalic",
        color: themes.white,
    },
    drillModalLoadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    drillModalLoadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: "Chakra-Regular",
        color: themes.white,
    },
})

