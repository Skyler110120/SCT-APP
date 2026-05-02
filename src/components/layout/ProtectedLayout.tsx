import React from "react";
import { Redirect, Slot } from "expo-router";
import { View } from "react-native";
import { LoadingState } from "@/src/components/ui";

interface ProtectedLayoutProps {
  isLoading: boolean;
  hasUser: boolean;
  hasAccess: boolean;
  loadingLabel: string;
  noUserRedirect: string;
  unauthorizedRedirect: string;
}

export function ProtectedLayout({
  isLoading,
  hasUser,
  hasAccess,
  loadingLabel,
  noUserRedirect,
  unauthorizedRedirect,
}: ProtectedLayoutProps) {
  if (isLoading) return <LoadingState label={loadingLabel} />;

  if (!hasUser) {
    return <Redirect href={noUserRedirect as any} />;
  }

  if (!hasAccess) {
    return <Redirect href={unauthorizedRedirect as any} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
