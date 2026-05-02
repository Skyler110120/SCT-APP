import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { logger } from "@/src/utils/logger";
import { ProtectedLayout } from "@/src/components/layout/ProtectedLayout";

export default function CompanyManagementLayout() {
  const { user, isLoading } = useAuth();
  logger.debug("Company management layout guard check");

  const isCompanyAdmin = user?.role === UserRole.ADMIN;
  const instructorCanManageUsers = user?.role === UserRole.INSTRUCTOR &&
    !!(user.can_manage_others_permissions || user.can_set_others_session_capacity);
  const hasManagementAccess = isCompanyAdmin || instructorCanManageUsers;
  if (user && hasManagementAccess) {
    logger.debug(`Management layout: admin access granted for ${user.role}`);
  } else if (user) {
    logger.debug(`Management layout: access denied for role ${user.role}`);
  } else {
    logger.debug("Management layout: no user, redirecting to login");
  }

  return (
    <ProtectedLayout
      isLoading={isLoading}
      hasUser={Boolean(user)}
      hasAccess={Boolean(hasManagementAccess)}
      loadingLabel="Checking management permissions..."
      noUserRedirect="/login"
      unauthorizedRedirect="/company/calendar"
    />
  );
}