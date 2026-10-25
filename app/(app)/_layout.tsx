import React, { useEffect, useRef } from 'react';
import { router, Slot, Redirect, usePathname } from 'expo-router';
import { View, AppState, AppStateStatus, BackHandler, Platform } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { decideAndroidBack, getHomeRouteForRole } from '@/src/utils/navBarUtils';
import {
  setNotificationHandler,
  requestNotificationPermissions,
  checkAndNotifyWednesdayBookingReminder,
} from '@/src/services/bookingReminderNotifications';
import { logger } from '@/src/utils/logger';
import { LoadingState } from '@/src/components/ui';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  const permissionsRequested = useRef(false);

  useEffect(() => {
    setNotificationHandler();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState !== 'active') return;
        (async () => {
          if (!permissionsRequested.current) {
            permissionsRequested.current = true;
            await requestNotificationPermissions();
          }
          await checkAndNotifyWednesdayBookingReminder(user);
        })();
      }
    );
    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') return;
    (async () => {
      if (!permissionsRequested.current) {
        permissionsRequested.current = true;
        await requestNotificationPermissions();
      }
      await checkAndNotifyWednesdayBookingReminder(user);
    })();
  }, [user]);

  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!user) return false;
      const decision = decideAndroidBack(pathname, user.role, user);
      if (decision === 'system') return false;
      if (decision === 'home') {
        router.replace(getHomeRouteForRole(user.role, user) as never);
        return true;
      }
      BackHandler.exitApp();
      return true;
    });
    return () => subscription.remove();
  }, [pathname, user]);

  logger.debug('App Layout authentication check');

  if (isLoading) {
    return <LoadingState label="Loading application..." />;
  }

  if (!user) {
    logger.debug('App Layout: no authenticated user, redirecting to login');
    return <Redirect href="/login" />;
  }

  logger.debug('App Layout: authenticated user, allowing access to app');

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
