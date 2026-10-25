import React from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AuthGridBackground } from "@/src/components/auth/AuthGridBackground";
import { AppButton, AppText, WeekTrack } from "@/src/components/ui";
import { welcomeScreenStyles as styles } from "@/src/styles/AuthPageStyles/welcomeScreenStyles";
import Images from "@/src/assets/images";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <AuthGridBackground>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <Image
              source={Images.logo.sctMark}
              style={styles.brandMark}
              resizeMode="contain"
              accessible
              accessibilityLabel="SCT logo"
            />
            <View>
              <AppText style={styles.brandName}>SCT</AppText>
              <AppText style={styles.brandSub}>Skills and Capabilities Training</AppText>
            </View>
          </View>

          <View style={styles.hero}>
            <AppText style={styles.headline} accessibilityRole="header">
              Train with precision. Lead with confidence.
            </AppText>
            <AppText variant="body" style={styles.subtitle}>
              Your schedule, progress and training program, week by week, in one place.
            </AppText>
            <WeekTrack totalWeeks={24} currentWeek={10} style={styles.track} />
            <AppText style={styles.trackCaption}>
              24 classes per program, on a weekly or bi-weekly plan
            </AppText>
          </View>

          <View style={styles.block}>
            <AppText style={styles.blockTitle}>Already training with SCT</AppText>
            <AppText style={styles.blockText}>
              Sign in to see your schedule, progress and program updates.
            </AppText>
            <AppButton label="Sign in" fullWidth size="lg" onPress={() => router.push("/login")} />
          </View>

          <View style={[styles.block, styles.blockDivided]}>
            <AppText style={styles.blockTitle}>New here</AppText>
            <AppText style={styles.blockText}>
              Create an account with the invite code from your training company.
            </AppText>
            <AppButton
              label="Create account"
              variant="outline"
              fullWidth
              size="lg"
              onPress={() => router.push("/register")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthGridBackground>
  );
}
