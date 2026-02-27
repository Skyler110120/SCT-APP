import React, { Component, ErrorInfo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { themes } from "@/src/context/themes";

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

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              An unexpected error occurred. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugBox}>
                <Text style={styles.debugText}>
                  {this.state.error.message}
                </Text>
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: themes.black,
    padding: 24,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: themes.white,
    marginBottom: 8,
    fontFamily: "Chakra-Bold",
  },
  message: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Chakra-Regular",
  },
  debugBox: {
    backgroundColor: themes.black,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 150,
    width: "100%",
  },
  debugText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontFamily: "Chakra-Regular",
  },
  button: {
    backgroundColor: themes.vegasGold,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: themes.black,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Chakra-Bold",
  },
});
