import Images from "@/src/assets/images";
import { useAuth } from "@/src/context/AuthContext";
import { Link, usePathname, useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import { navBarStyles as styles } from "../styles/navBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNavItemsForRole as getNavConfig } from "../utils/navBarUtils";
import { AppText } from "./ui";
import { FontAwesome } from "@expo/vector-icons";
import { themes } from "@/src/context/themes";

type AppRouterType = Parameters<typeof Link>[0]["href"];

const iconMap: Record<string, { icon: number; activeIcon: number }> = {
  home: {
    icon: Images.navIcons.home.homeIcon,
    activeIcon: Images.navIcons.home.homeIconActive,
  },
  calendar: {
    icon: Images.navIcons.calendar.calendarIcon,
    activeIcon: Images.navIcons.calendar.calendarIconActive,
  },
  courses: {
    icon: Images.navIcons.courses.courseIcon,
    activeIcon: Images.navIcons.courses.courseIconActive,
  },
  profile: {
    icon: Images.navIcons.profile.profileIcon,
    activeIcon: Images.navIcons.profile.profileIconActive,
  },
  students: {
    icon: Images.navIcons.students.studentsIcon,
    activeIcon: Images.navIcons.students.studentsIconActive,
  },
  users: {
    icon: Images.navIcons.profile.profileIcon,
    activeIcon: Images.navIcons.profile.profileIconActive,
  },
  payments: {
    icon: Images.navIcons.courses.courseIcon,
    activeIcon: Images.navIcons.courses.courseIconActive,
  },
};

const fontIconMap: Record<string, { name: keyof typeof FontAwesome.glyphMap }> = {
  payments: { name: "credit-card" },
};

function getIconForNavItem(name: string) {
  const key = name.toLowerCase();
  return iconMap[key] ?? iconMap.profile;
}

function renderNavIcon(name: string, isActive: boolean, icon: number, activeIcon: number) {
  const key = name.toLowerCase();
  const fontIcon = fontIconMap[key];

  if (fontIcon) {
    return (
      <FontAwesome
        name={fontIcon.name}
        size={20}
        color={isActive ? themes.vegasGold : themes.textMuted}
      />
    );
  }

  return (
    <Image
      source={isActive ? activeIcon : icon}
      style={styles.navIcon}
      resizeMode="contain"
    />
  );
}

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

  const navConfig = getNavConfig(user?.role, user);
  const navItems = navConfig.map((item) => ({
    ...item,
    ...getIconForNavItem(item.name),
  }));
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
          <View
            key={item.name}
            style={isActive ? styles.selectedIconBackground : undefined}
          >
            <TouchableOpacity
              style={isActive ? styles.navItemActive : styles.navItem}
              onPress={() => router.push(item.route as AppRouterType)}
            >
              {renderNavIcon(item.name, isActive, item.icon, item.activeIcon)}
            </TouchableOpacity>
            {isActive && (
              <AppText style={styles.navText}>{formatLabel(item.name)}</AppText>
            )}
          </View>
        );
      })}
    </View>
  );
}
