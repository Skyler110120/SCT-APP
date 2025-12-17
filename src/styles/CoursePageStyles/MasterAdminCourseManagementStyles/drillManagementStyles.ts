import { StyleSheet } from "react-native";
import { themes } from "@/src/context/themes";

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
        alignItems: "center",
        marginBottom: 20,
    },
    drillModalTitle: {
        marginBottom: 16,
        textAlign: "center",
        fontSize: 28,
        fontFamily: "Chakra-Bold",
        color: themes.vegasGold,
    },
    drillModalLabel: {
        marginBottom: 8,
        fontSize: 20,
        fontFamily: "Chakra-Regular",
        color: themes.white,
    },
    drillExitButton: {
        padding: 8, 
        borderColor: "white", 
        borderWidth: 1
    },
    drillListContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: themes.white
    },
    drillModalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    drillModalAddButton: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: themes.vegasGold,
        backgroundColor: themes.black,
    },
    drillModalButtonText: {
        fontSize: 24,
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

