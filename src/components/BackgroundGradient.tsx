import { LinearGradient } from "expo-linear-gradient";
import {loginScreenStyles} from "@/src/styles/loginScreen";

export default function BackgroundGradient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={["#000000", "#000000", "#666666"]}
      locations={[0, 0.3, 1]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={loginScreenStyles.gradient}
    >
      {children}
    </LinearGradient>
  );
}
