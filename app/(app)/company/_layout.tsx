import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { logger } from "@/src/utils/logger";
import { ProtectedLayout } from "@/src/components/layout/ProtectedLayout";

export default function CompanyLayout() {
  const { user, isLoading } = useAuth();
  logger.debug("Company layout guard check");

  const hasCompanyAccess = Boolean(user) &&
    [UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT].includes(user.role);

  if (user && hasCompanyAccess) {
    logger.debug(`Company layout: access granted for ${user.role}`);
  } else if (user) {
    logger.debug(`Company layout: access denied for role ${user.role}`);
  } else {
    logger.debug("Company layout: no user, redirecting to login");
  }

  return (
    <ProtectedLayout
      isLoading={isLoading}
      hasUser={Boolean(user)}
      hasAccess={hasCompanyAccess}
      loadingLabel="Checking company access..."
      noUserRedirect="/login"
      unauthorizedRedirect="/dashboard"
    />
  );
}