/**
 * In-app viewer for PDF / document URLs (e.g. course materials, instructor script).
 * Uses WebView so the document opens inside the app instead of downloading or leaving the app.
 */
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { themes } from "@/src/context/themes";

interface DocumentViewerModalProps {
  visible: boolean;
  url: string | null;
  title: string;
  onClose: () => void;
}

export default function DocumentViewerModal({
  visible,
  url,
  title,
  onClose,
}: DocumentViewerModalProps) {
  const handleOpenInOtherApp = async () => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Cannot Open",
          "Unable to open this document in another app."
        );
      }
    } catch {
      Alert.alert("Error", "Failed to open document in another app.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerActions}>
            {url ? (
              <TouchableOpacity onPress={handleOpenInOtherApp} style={styles.headerButton}>
                <Text style={styles.closeText}>Open in another app</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
        {url ? (
          <WebView
            source={{ uri: url }}
            style={styles.webview}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themes.vegasGold} />
                <Text style={styles.loadingText}>Loading…</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>No document URL</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themes.black,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: themes.vegasGold,
    backgroundColor: themes.black,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Chakra-Bold",
    color: themes.vegasGold,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 16,
    fontFamily: "Chakra-Regular",
    color: themes.vegasGold,
  },
  webview: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: themes.black,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: themes.white,
  },
});
