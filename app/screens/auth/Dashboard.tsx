import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import BackgroundGradient from '@/src/components/BackgroundGradient';
import { themes } from '@/src/context/themes';

export default function Dashboard() {
    const router = useRouter();
    return (
        <BackgroundGradient>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: themes.white }}>Dashboard</Text>
                    <TouchableOpacity onPress={() => {router.push('/screens/auth/Login')}} style={{ marginTop: 20, padding: 10, backgroundColor: themes.vegasGold, borderRadius: 5 }}>
                        <Text style={{ fontSize: 18, color: themes.black}}>Go to Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {router.push('/screens/auth/Register')}} style={{ marginTop: 20, padding: 10, backgroundColor: themes.vegasGold, borderRadius: 5 }}>
                        <Text style={{ fontSize: 18, color: themes.black}}>Go to Register</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </BackgroundGradient>
    );
}
