import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { AppScreen, AppText, LoadingState } from "@/src/components/ui";

export default function DashboardRouter() {
  const { user, isLoading } = useAuth();

  console.log(
    `Dashboard Router - User: ${user?.email}, Role: ${user?.role}, Loading: ${isLoading}`
  );

  if (isLoading) {
    console.log("Dashboard Router: Loading user data...");
    return <LoadingState label="Loading dashboard..." />;
  }

  if (!user) {
    console.log(
      "Dashboard Router: No authenticated user, redirecting to login"
    );
    return <Redirect href="/login" />;
  }

  if (!user.role) {
    console.error("Dashboard Router: User has no role assigned");
    return (
      <AppScreen style={{ justifyContent: "center", alignItems: "center" }}>
        <AppText variant="subtitle" style={{ textAlign: "center" }}>
          Account setup incomplete.{"\n"}Please contact support.
        </AppText>
      </AppScreen>
    );
  }

  if (user.role === UserRole.MASTER_ADMIN) {
    console.log(
      "Dashboard Router: Routing master admin to system dashboard"
    );
    return <Redirect href="/system/dashboard" />;
  } else if (user.role === UserRole.ADMIN) {
    console.log(
      "Dashboard Router: Routing company admin to management dashboard"
    );
    return <Redirect href="/company/management/dashboard" />;
  } else if (user.role === UserRole.INSTRUCTOR) {
    console.log(
      "Dashboard Router: Routing instructor to learning dashboard"
    );
    return <Redirect href="/learning/dashboard" />;
  } else if (user.role === UserRole.STUDENT) {
    console.log("Dashboard Router: Routing student to learning dashboard");
    return <Redirect href="/learning/dashboard" />;
  } else {
    console.error(`Dashboard Router: Unknown role: ${user.role}`);
    return (
      <AppScreen style={{ justifyContent: "center", alignItems: "center" }}>
        <AppText variant="subtitle" style={{ textAlign: "center" }}>
          Invalid user role.{"\n"}Please contact support.
        </AppText>
      </AppScreen>
    );
  }
}
