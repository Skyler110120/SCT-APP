import Images from "@/src/assets/images";
import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { UserRole } from "@/src/types/auth.types";
import { Link, usePathname, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
          route: "/screens/app/MasterAdminDashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Courses",
          route: "/screens/app/MasterAdminCourseManagement",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
      ];
    } else if (user?.role === UserRole.ADMIN) {
      return [
        {
          name: "Home",
          route: "/screens/app/AdminDashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/screens/app/Calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Users",
          route: "/screens/app/AdminManageUsers",
          icon: Images.navIcons.profile.profileIcon,
          activeIcon: Images.navIcons.profile.profileIconActive,
        },
        {
          name: "Courses",
          route: "/screens/app/Courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
      ];
    } else if (user?.role === UserRole.INSTRUCTOR) {
      return [
        {
          name: "Home",
          route: "/screens/app/InstructorDashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/screens/app/Calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Students",
          route: "/screens/app/InstructorStudents",
          icon: Images.navIcons.students.studentsIcon,
          activeIcon: Images.navIcons.students.studentsIconActive,
        },
        {
          name: "Courses",
          route: "/screens/app/Courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
        {
          name: "Profile",
          route: "/screens/app/UserProfile",
          icon: Images.navIcons.profile.profileIcon,
          activeIcon: Images.navIcons.profile.profileIconActive,
        },
      ];
    }
    return [
      {
          name: "Home",
          route: "/screens/app/InstructorDashboard",
          icon: Images.navIcons.home.homeIcon,
          activeIcon: Images.navIcons.home.homeIconActive,
        },
        {
          name: "Calendar",
          route: "/screens/app/Calendar",
          icon: Images.navIcons.calendar.calendarIcon,
          activeIcon: Images.navIcons.calendar.calendarIconActive,
        },
        {
          name: "Courses",
          route: "/screens/app/Courses",
          icon: Images.navIcons.courses.courseIcon,
          activeIcon: Images.navIcons.courses.courseIconActive,
        },
        {
          name: "Profile",
          route: "/screens/app/UserProfile",
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
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: themes.vegasGold,
    padding: 10,
  },
  navItem: {},
  navIcon: {
    width: 64,
    height: 50,
  },
  selectedIconBackground: {
    backgroundColor: themes.black,
    borderRadius: 20,
    width: 140,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 24,
    fontFamily: "Chakra-Italic",
    color: themes.vegasGold,
  },
});
