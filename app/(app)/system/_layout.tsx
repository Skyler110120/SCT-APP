import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { logger } from "@/src/utils/logger";
import { ProtectedLayout } from "@/src/components/layout/ProtectedLayout";

export default function SystemLayout() {
  const { user, isLoading } = useAuth();

  logger.debug("System layout guard check");

  const isMasterAdmin = user?.role === UserRole.MASTER_ADMIN;

  if (user && isMasterAdmin) {
    logger.debug(`System layout: platform access granted for ${user.role}`);
  } else if (user) {
    logger.debug(`System layout: access denied for role ${user.role}`);
  } else {
    logger.debug("System layout: no user, redirecting to login");
  }

  return (
    <ProtectedLayout
      isLoading={isLoading}
      hasUser={Boolean(user)}
      hasAccess={Boolean(isMasterAdmin)}
      loadingLabel="Checking system permissions..."
      noUserRedirect="/login"
      unauthorizedRedirect="/dashboard"
    />
  );
}
