import { useAuth } from "@/src/context/AuthContext";
import { Link, usePathname, useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { navBarStyles as styles } from "../styles/navBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNavItemsForRole as getNavConfig } from "../utils/navBarUtils";
import { AppText } from "./ui";
import { Feather } from "@expo/vector-icons";
import { themes } from "@/src/context/themes";

type AppRouterType = Parameters<typeof Link>[0]["href"];
type FeatherName = keyof typeof Feather.glyphMap;

// Feather is the closest match in @expo/vector-icons to the web app's Lucide icons.
const iconMap: Record<string, FeatherName> = {
  home: "home",
  calendar: "calendar",
  courses: "book-open",
  profile: "user",
  students: "users",
  users: "users",
  payments: "credit-card",
};

function formatLabel(label: string) {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface BottomNavBarProps {}

export default function BottomNavBar({}: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const navItems = getNavConfig(user?.role, user);
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => {
              if (pathname === item.route) return;
              // Replace, so the bottom bar does not pile screens onto the back stack.
              router.replace(item.route as AppRouterType);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={formatLabel(item.name)}
          >
            <View style={[styles.activeMarker, isActive ? styles.activeMarkerOn : null]} />
            <Feather
              name={iconMap[item.name.toLowerCase()] ?? "circle"}
              size={21}
              color={isActive ? themes.vegasGold : themes.textMuted}
            />
            <AppText
              style={isActive ? styles.navTextActive : styles.navText}
              numberOfLines={1}
            >
              {formatLabel(item.name)}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
