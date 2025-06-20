import { Text, View, Button } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Stone Cold Tactical Home Screen</Text>
      <Link href="/screens/Login" asChild>
        <Button title="Go to Login" />
      </Link>
      <Link href="/screens/Register" asChild>
        <Button title="Go to Register" />
      </Link>
    </View>
  );
}
