import Images from "@/src/assets/images";
import { useAuth } from "@/src/context/AuthContext";
import { Link, usePathname, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { navBarStyles as styles } from "../styles/navBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getNavItemsForRole as getNavConfig } from "../utils/navBarUtils";

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

function getIconForNavItem(name: string) {
  const key = name.toLowerCase();
  return iconMap[key] ?? iconMap.profile;
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
              style={styles.navItem}
              onPress={() => router.push(item.route as AppRouterType)}
            >
              <Image
                source={isActive ? item.activeIcon : item.icon}
                style={styles.navIcon}
              />
            </TouchableOpacity>
            {isActive && <Text style={[styles.navText]}>{item.name}</Text>}
          </View>
        );
      })}
    </View>
  );
}
