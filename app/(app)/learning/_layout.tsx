import React from "react";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/enums";
import { logger } from "@/src/utils/logger";
import { ProtectedLayout } from "@/src/components/layout/ProtectedLayout";

export default function LearningLayout() {
  const { user, isLoading } = useAuth();
  logger.debug("Learning layout guard check");

  const hasLearningAccess = Boolean(user) &&
    [UserRole.INSTRUCTOR, UserRole.STUDENT].includes(user.role);
  if (user && hasLearningAccess) {
    logger.debug(`Learning layout: access granted for ${user.role}`);
  } else if (user) {
    logger.debug(`Learning layout: access denied for role ${user.role}`);
  } else {
    logger.debug("Learning layout: no user, redirecting to login");
  }

  return (
    <ProtectedLayout
      isLoading={isLoading}
      hasUser={Boolean(user)}
      hasAccess={Boolean(user) && hasLearningAccess}
      loadingLabel="Checking learning access..."
      noUserRedirect="/login"
      unauthorizedRedirect="/company/calendar"
    />
  );
}