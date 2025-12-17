import Images from "@/src/assets/images";
import { useAuth } from "@/src/context/AuthContext";
import { UserRole } from "@/src/types/auth.types";
import { Link, usePathname, useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { navBarStyles as styles } from "../styles/navBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AppRouterType = Parameters<typeof Link>[0]["href"];

interface BottomNavBarProps {}

export default function BottomNavBar({}: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const getNavItemsForRole = () => {
    if (user?.role === UserRole.MASTER_ADMIN) {
      return [
        {
          name: "Home",
          route: "/system/dashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Courses",
          route: "/system/courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
      ];
    } else if (user?.role === UserRole.ADMIN) {
      return [
        {
          name: "Home",
          route: "/company/management/dashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/company/calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Users",
          route: "/company/management/users",
          icon: Images.navIcons.profile.profileIcon,
          activeIcon: Images.navIcons.profile.profileIconActive,
        },
        {
          name: "Courses",
          route: "/company/courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
      ];
    } else if (user?.role === UserRole.INSTRUCTOR) {
      return [
        {
          name: "Home",
          route: "/learning/dashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/company/calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Students",
          route: "/learning/students",
          icon: Images.navIcons.students.studentsIcon,
          activeIcon: Images.navIcons.students.studentsIconActive,
        },
        {
          name: "Courses",
          route: "/company/courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
        {
          name: "Profile",
          route: "/learning/profile",
          icon: Images.navIcons.profile.profileIcon,
          activeIcon: Images.navIcons.profile.profileIconActive,
        },
      ];
    }
    return [
      {
          name: "Home",
          route: "/learning/dashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/company/calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Courses",
          route: "/company/courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
        {
          name: "Profile",
          route: "/learning/profile",
          icon: Images.navIcons.profile.profileIcon,
          activeIcon: Images.navIcons.profile.profileIconActive,
        },
    ];
  };

  const navItems = getNavItemsForRole();
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
