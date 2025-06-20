import { themes } from '@/src/context/themes';
import { StyleSheet } from 'react-native';

export const loginScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    
    gradient: {
        flex: 1,
        flexDirection: 'column',
    },
    backButtonContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 20,
    },
    loginScreenContentContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 56,
    },
    image: {
        width: 300,
        height: 300,
    },
    textInputBox: {
        height: 90,
        width: '75%',
        paddingHorizontal: 10,
        borderRadius: 5,
        borderColor: themes.vegasGold,
        backgroundColor: themes.black,
        borderWidth: 1,
        fontSize: 36,
        fontFamily: 'Chakra-Italic', 
    },
    logInButton:{
        height: 80,
        width: '60%',
        backgroundColor: themes.vegasGold,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logInButtonText: {
        fontFamily: 'Chakra-semiBoldItalic',
        fontSize: 32,
        color: themes.white,
    },
    forgotPasswordText: {
        fontFamily: 'Chakra-semiBoldItalic',
        fontSize: 32,
        color: themes.vegasGold,
        textDecorationLine: 'underline',
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30,
    },
    orText: {
        fontFamily: 'Chakra-semiBoldItalic',
        fontSize: 36,
        color: themes.white,
    },
    horizontalLine: {
        flex: 1,
        borderBottomColor: themes.vegasGold,
        borderBottomWidth: 2,
    }
});