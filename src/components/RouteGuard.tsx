import { themes } from "@/src/context/themes";
import { useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types/auth.types";
import { navigateByRole } from "../utils/navigationUtil";

interface RouterGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouterGuardProps) {
  const { isLoading, isAuthenticated, user, hasRole } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const firstSegment = segments.length > 0 ? (segments[0] as string) : null;
    const secondSegment = segments.length > 1 ? (segments[1] as string) : null;

    const isProtectedRoute = firstSegment === "screens";

    const isAuthRoute =
      firstSegment === "auth" ||
      (firstSegment === "screens" && secondSegment === "auth");

    if (!isAuthenticated && isProtectedRoute && !isAuthRoute) {
      router.replace("/screens/auth/Login");
      return;
    } else if (isAuthenticated && isAuthRoute) {
      if (user) {
        navigateByRole(user.role, user.hasCompletedOnboarding);
      } else {
        router.replace("/screens/auth/Dashboard")
      }
      return
    }

    if (isAuthenticated && isProtectedRoute) {
        const path = segments.join("/");

        if (path.includes("masterAdminDashboard") && !hasRole(UserRole.MASTER_ADMIN)) {
            console.log("Access denied: Master Admin role required.");
            navigateByRole(user?.role || UserRole.STUDENT, user?.hasCompletedOnboarding ?? false)
            return;
        }

        if (path.includes("adminDashboard") && !hasRole([UserRole.MASTER_ADMIN, UserRole.ADMIN])) {
        console.log("Access denied: Admin or Master Admin role required.");
        navigateByRole(user?.role || UserRole.STUDENT, user?.hasCompletedOnboarding ?? false);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: themes.white,
        }}
      >
        <ActivityIndicator size="large" color={themes.vegasGold} />
      </View>
    );
  }

  return <>{children}</>;
}
