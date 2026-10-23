import InstructorDashboard from '@/src/components/screens/app/InstructorDashboard';
import StudentDashboard from '@/src/components/screens/app/StudentDashboard';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/types/enums';
import React from 'react';

export default function LearningDashboardPage() {
  const { user, needsOnboarding } = useAuth();
  if (user?.role === UserRole.STUDENT && !needsOnboarding) {
    return <StudentDashboard />;
  }
  return <InstructorDashboard />;
}
