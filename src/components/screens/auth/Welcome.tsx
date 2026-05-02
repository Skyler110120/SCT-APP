import React from "react";
import { SafeAreaView, View } from "react-native";
import { useRouter } from "expo-router";
import { AuthGridBackground } from "@/src/components/auth/AuthGridBackground";
import { AppButton, AppText } from "@/src/components/ui";
import { welcomeScreenStyles as styles } from "@/src/styles/AuthPageStyles/welcomeScreenStyles";
import { AuthBrandLockup } from "@/src/components/auth/AuthBrandLockup";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <AuthGridBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <View style={styles.card}>
            <AuthBrandLockup />
            <AppText variant="title" style={styles.headline}>
              Train with precision. Lead with confidence.
            </AppText>
            <AppText variant="body" style={styles.subtitle}>
              Access your schedule, progress, and training standards from one secure mobile hub.
            </AppText>

            <View style={styles.valueProps}>
              <View style={styles.valuePropRow}>
                <AppText variant="caption" style={styles.valuePropText}>Trusted Coaching</AppText>
              </View>
              <View style={styles.valuePropRow}>
                <AppText variant="caption" style={styles.valuePropText}>Structured Progress</AppText>
              </View>
              <View style={styles.valuePropRow}>
                <AppText variant="caption" style={styles.valuePropText}>Results-Driven Training</AppText>
              </View>
            </View>

            <View style={styles.actionColumn}>
              <AppButton
                label="Sign in"
                fullWidth
                size="lg"
                onPress={() => router.push("/login")}
              />
              <AppButton
                label="Create account"
                variant="outline"
                fullWidth
                size="lg"
                onPress={() => router.push("/register")}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AuthGridBackground>
  );
}
