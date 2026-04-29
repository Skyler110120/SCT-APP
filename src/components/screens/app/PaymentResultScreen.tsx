import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { router, useLocalSearchParams, usePathname } from "expo-router";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import { themes } from "@/src/context/themes";
import { paymentService } from "@/src/services/paymentService";

export default function PaymentResultScreen() {
  const pathname = usePathname();
  const params = useLocalSearchParams<{ session_id?: string }>();
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const isSuccess = useMemo(() => pathname.includes("success"), [pathname]);
  const isMakeup = useMemo(() => pathname.includes("makeup"), [pathname]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const sessionId = params.session_id;
      if (!isSuccess || isMakeup || !sessionId) return;
      setSyncing(true);
      try {
        await paymentService.syncCheckoutSession(sessionId);
      } catch (error) {
        if (!cancelled) {
          setSyncError(
            error instanceof Error
              ? error.message
              : "Could not confirm subscription with the server."
          );
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [isSuccess, isMakeup, params.session_id]);

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 5000);
    return () => clearTimeout(timer);
  }, [isSuccess]);

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient>
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: themes.vegasGold,
              padding: 20,
              gap: 14,
            }}
          >
            <Text
              style={{
                fontFamily: "Chakra-Bold",
                fontSize: 24,
                color: isSuccess ? "#4ade80" : "#f87171",
                textAlign: "center",
              }}
            >
              {isSuccess ? "Payment Successful" : "Payment Cancelled"}
            </Text>

            <Text
              style={{
                fontFamily: "Chakra-Regular",
                fontSize: 16,
                color: themes.white,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {isSuccess
                ? isMakeup
                  ? "Your make-up session payment is confirmed. You can now book your session."
                  : "Your subscription is active. You can now book training sessions."
                : "Your payment was not completed. No charges were made."}
            </Text>

            {syncing && (
              <View style={{ alignItems: "center", gap: 8 }}>
                <ActivityIndicator color={themes.vegasGold} />
                <Text style={{ color: themes.white, fontFamily: "Chakra-Regular" }}>
                  Confirming payment...
                </Text>
              </View>
            )}

            {syncError && (
              <Text
                style={{
                  color: "#fbbf24",
                  fontFamily: "Chakra-Regular",
                  textAlign: "center",
                }}
              >
                {syncError}
              </Text>
            )}

            <TouchableOpacity
              style={{
                marginTop: 8,
                backgroundColor: themes.vegasGold,
                borderRadius: 8,
                paddingVertical: 12,
              }}
              onPress={() => router.replace("/dashboard")}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themes.black,
                  fontFamily: "Chakra-Bold",
                  fontSize: 16,
                }}
              >
                Go to Dashboard
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
