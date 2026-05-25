import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import { themes } from "@/src/context/themes";
import { paymentService } from "@/src/services/paymentService";
import { CompanyLedgerData } from "@/src/types/payment.types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminPaymentsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [companyLedger, setCompanyLedger] = useState<CompanyLedgerData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [refundingPaymentId, setRefundingPaymentId] = useState<number | null>(null);

  const loadLedger = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const ledger = await paymentService.getCompanyLedger();
      setCompanyLedger(ledger);
    } catch {
      setCompanyLedger(null);
      setMessage("Failed to load company payments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleRefundPayment = (paymentId: number) => {
    Alert.alert(
      "Issue Refund",
      "Issue a full refund for this payment? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refund",
          style: "destructive",
          onPress: async () => {
            setRefundingPaymentId(paymentId);
            setMessage(null);
            try {
              await paymentService.refundPayment(paymentId);
              // Reload the ledger first so its internal setMessage(null) doesn't
              // wipe the success banner before the user can read it.
              await loadLedger();
              setMessage(`Payment #${paymentId} refunded successfully.`);
            } catch {
              setMessage("An error occurred while issuing the refund.");
            } finally {
              setRefundingPaymentId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themes.black }}>
      <BackgroundGradient>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 26,
                fontFamily: "Chakra-Bold",
                color: themes.vegasGold,
                marginBottom: 12,
              }}
            >
              Payments
            </Text>

            <TouchableOpacity
              style={{
                alignSelf: "flex-start",
                borderWidth: 1,
                borderColor: themes.vegasGold,
                borderRadius: 8,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 12,
              }}
              onPress={loadLedger}
              disabled={isLoading}
            >
              <Text style={{ color: themes.vegasGold, fontFamily: "Chakra-Regular" }}>
                Refresh
              </Text>
            </TouchableOpacity>

            {isLoading ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="small" color={themes.vegasGold} />
                <Text
                  style={{
                    marginTop: 12,
                    color: themes.white,
                    fontFamily: "Chakra-Regular",
                  }}
                >
                  Loading payments...
                </Text>
              </View>
            ) : !companyLedger || companyLedger.payments.length === 0 ? (
              <Text style={{ color: themes.white, fontFamily: "Chakra-Regular" }}>
                No payments yet for this company.
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontFamily: "Chakra-Regular",
                    marginBottom: 12,
                  }}
                >
                  {companyLedger.summary.payment_count} payments · Gross $
                  {(companyLedger.summary.gross_amount_cents / 100).toFixed(2)} · Company payout $
                  {(companyLedger.summary.company_payout_cents / 100).toFixed(2)}
                </Text>

                {companyLedger.payments.map((payment) => (
                  <View
                    key={payment.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(212,175,55,0.35)",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: themes.vegasGold,
                        fontFamily: "Chakra-Bold",
                        marginBottom: 4,
                      }}
                    >
                      ${(payment.amount_cents / 100).toFixed(2)} - {payment.student_name}
                    </Text>
                    <Text
                      style={{
                        color: themes.white,
                        fontFamily: "Chakra-Regular",
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      {payment.status} -{" "}
                      {payment.paid_at
                        ? new Date(payment.paid_at).toLocaleString()
                        : "No payment date"}
                    </Text>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: payment.refund_eligible ? themes.vegasGold : "rgba(255,255,255,0.3)",
                        borderRadius: 8,
                        paddingVertical: 8,
                        alignItems: "center",
                        opacity: !payment.refund_eligible || refundingPaymentId === payment.id ? 0.6 : 1,
                      }}
                      onPress={() => handleRefundPayment(payment.id)}
                      disabled={!payment.refund_eligible || refundingPaymentId === payment.id}
                    >
                      <Text style={{ color: themes.vegasGold, fontFamily: "Chakra-Regular" }}>
                        {refundingPaymentId === payment.id
                          ? "Refunding..."
                          : payment.status === "REFUNDED"
                            ? "Refunded"
                            : "Refund"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {message && (
              <Text
                style={{
                  marginTop: 8,
                  color: "#fbbf24",
                  fontFamily: "Chakra-Regular",
                }}
              >
                {message}
              </Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
      <BottomNavBar />
    </View>
  );
}
