import { LinearGradient } from "expo-linear-gradient";
import { themes } from "@/src/context/themes";
import { StyleSheet } from "react-native";

export default function BackgroundGradient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[
        themes.gradientTop,
        themes.background,
        themes.gradientBottom,
      ]}
      locations={[0, 0.3, 1]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
