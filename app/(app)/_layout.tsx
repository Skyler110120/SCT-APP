import React, { useEffect, useRef } from 'react';
import { Slot, Redirect } from 'expo-router';
import { View, Text, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';
import {
  setNotificationHandler,
  requestNotificationPermissions,
  checkAndNotifyWednesdayBookingReminder,
} from '@/src/services/bookingReminderNotifications';
import { logger } from '@/src/utils/logger';

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

  logger.debug('App Layout authentication check');

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themes.black,
      }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text style={{
          marginTop: 16,
          color: themes.white,
          fontSize: 16,
          fontFamily: 'Chakra-Regular',
        }}>
          Loading application...
        </Text>
      </View>
    );
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
