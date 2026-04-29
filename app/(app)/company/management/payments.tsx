import { Redirect } from "expo-router";
import React from "react";
import AdminPaymentsScreen from "@/src/components/screens/app/AdminPaymentsScreen";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";

export default function AdminPaymentsPage() {
  const { user } = useAuth();

  if (!user || user.role !== UserRole.ADMIN) {
    return <Redirect href="/company/management/dashboard" />;
  }

  return <AdminPaymentsScreen />;
}
