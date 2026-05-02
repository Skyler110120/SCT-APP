import React, { Component, ErrorInfo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { theme } from "@/src/context/themes";
import { AppButton, AppCard, AppText } from "@/src/components/ui";
import { emitGlobalError } from "@/src/utils/globalErrorBus";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReport = () => {
    if (!this.state.error) return;
    emitGlobalError({
      title: "App crash detected",
      message: this.state.error.message || "Unexpected rendering failure.",
      kind: "unknown",
      severity: "error",
      canRetry: true,
      dedupeKey: `boundary:${this.state.error.message}`,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <AppCard style={styles.card} variant="elevated">
            <AppText variant="title" style={styles.title}>
              Something went wrong
            </AppText>
            <AppText variant="body" style={styles.message}>
              An unexpected error occurred. Please try again.
            </AppText>
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugBox}>
                <AppText style={styles.debugText}>
                  {this.state.error.message}
                </AppText>
              </ScrollView>
            )}
            <View style={styles.actions}>
              <AppButton
                label="Try again"
                variant="secondary"
                onPress={this.handleReset}
                style={styles.actionButton}
              />
              <AppButton
                label="Report issue"
                variant="outline"
                onPress={this.handleReport}
                style={styles.actionButton}
              />
            </View>
          </AppCard>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    alignItems: "stretch",
  },
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    color: theme.colors.textSecondary,
  },
  debugBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 150,
    width: "100%",
  },
  debugText: {
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: "row",
    gap: theme.space.sm,
  },
  actionButton: {
    flex: 1,
  },
});
