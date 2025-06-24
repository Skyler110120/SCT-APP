// app/home.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';
import BottomNavBar from '@/src/components/NavBar';

export default function HomeScreen() {
  const router = useRouter();
  const { state, logout } = useAuth();
  const user = state.user;

  const handleLogout = async () => {
    await logout();
    router.replace('/screens/Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stone Cold Tactical</Text>
      </View>

      <View style={styles.userInfoSection}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.first_name} {user?.last_name}!
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.contentSection}>
        <Text style={styles.contentText}>
          You've successfully logged in to your account.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>LOG OUT</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={ styles.logoutButton }
      >
        <Text style={styles.logoutButtonText} onPress={() => router.push('/screens/Calendar')}>
          Go to Calendar
        </Text>
      </TouchableOpacity>
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.vegasGold || '#000033',
    flexDirection: 'column',
  },
  header: {
    marginTop: 50,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: themes.vegasGold || '#FFD700',
    fontFamily: 'Chakra-Bold',
  },
  userInfoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Chakra-Bold',
  },
  emailText: {
    fontSize: 16,
    color: '#cccccc',
    fontFamily: 'Chakra-Regular',
  },
  contentSection: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
    fontFamily: 'Chakra-Regular',
  },
  logoutButton: {
    backgroundColor: themes.black || '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: themes.vegasGold || '#000033',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Chakra-Bold',
  }
});