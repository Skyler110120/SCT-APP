import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePathname } from "expo-router";
import { issueReportService } from "@/src/services/issueReportService";
import {
  GlobalErrorEvent,
  subscribeGlobalError,
} from "@/src/utils/globalErrorBus";
import { themes } from "@/src/context/themes";

export default function GlobalErrorReporter() {
  const pathname = usePathname();
  const [errorEvent, setErrorEvent] = useState<GlobalErrorEvent | null>(null);
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return subscribeGlobalError((event) => {
      setErrorEvent(event);
      setSummary(event.message.slice(0, 255));
      setDescription("");
      setSubmitted(false);
    });
  }, []);

  const canSubmit = useMemo(
    () => !!errorEvent && summary.trim().length >= 5 && !isSubmitting,
    [errorEvent, isSubmitting, summary]
  );

  const close = () => {
    setErrorEvent(null);
    setSubmitted(false);
  };

  const submit = async () => {
    if (!errorEvent || !canSubmit) return;
    setIsSubmitting(true);
    const response = await issueReportService.createIssueReport({
      summary: summary.trim(),
      description: description.trim() || undefined,
      error_message: errorEvent.message,
      page_url: pathname,
      api_path: errorEvent.path,
      http_status: errorEvent.status,
      user_agent: "sct-app-mobile",
    });
    setIsSubmitting(false);
    setSubmitted(response.success);
  };

  return (
    <Modal visible={!!errorEvent} transparent animationType="fade" onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#101010",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: themes.vegasGold,
            padding: 16,
            gap: 10,
          }}
        >
          <Text
            style={{
              color: themes.white,
              fontFamily: "Chakra-Bold",
              fontSize: 18,
            }}
          >
            Something went wrong
          </Text>

          <Text style={{ color: themes.white, fontFamily: "Chakra-Regular", fontSize: 14 }}>
            {errorEvent?.message}
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              color: themes.white,
              fontFamily: "Chakra-Regular",
            }}
            value={summary}
            onChangeText={setSummary}
            placeholder="Short summary"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={255}
          />

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              color: themes.white,
              fontFamily: "Chakra-Regular",
              minHeight: 90,
              textAlignVertical: "top",
            }}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional details"
            placeholderTextColor="rgba(255,255,255,0.4)"
            multiline
          />

          {submitted && (
            <Text
              style={{ color: "#4ade80", fontFamily: "Chakra-Regular", fontSize: 13 }}
            >
              Issue reported. Thank you.
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.35)",
                paddingVertical: 10,
              }}
              onPress={close}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: themes.white,
                  fontFamily: "Chakra-Bold",
                }}
              >
                Dismiss
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: themes.vegasGold,
                paddingVertical: 10,
                opacity: canSubmit ? 1 : 0.6,
              }}
              onPress={submit}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={themes.black} />
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: themes.black,
                    fontFamily: "Chakra-Bold",
                  }}
                >
                  Report issue
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
