import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { themes } from '@/src/context/themes'

interface RouterGuardProps {
    children: React.ReactNode;
}

export function RouteGuard ({ children}: RouterGuardProps) {
    const { state } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (state.isLoading) {
            return;
        }

        const firstSegment = segments.length > 0 ? segments[0] as string : null;

        const isProtectedRoute = firstSegment === 'screens' 

        const isAuthRoute = firstSegment === 'auth' || (firstSegment === 'screens' && segments.length > 1 && segments[1] === 'auth')

        if (!state.isAuthenticated && isProtectedRoute && !isAuthRoute) {
            router.replace('/screens/auth/Login')
        } else if (state.isAuthenticated && isAuthRoute) {
            router.replace('/screens/app/Home')
        }
    }, [state.isAuthenticated, state.isLoading, segments, router]);

    if (state.isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.white }}>
                <ActivityIndicator size="large" color={themes.vegasGold} />
            </View>
        );
    }

    return <>{children}</>;
}