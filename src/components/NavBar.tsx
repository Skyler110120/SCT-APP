import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { usePathname, useRouter, Link } from "expo-router";
import Images from "@/src/assets/images";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themes } from "@/src/context/themes";

type AppRouterType = Parameters<typeof Link>[0]["href"];

interface BottomNavBarProps {}

export default function BottomNavBar({}: BottomNavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navItems = [
    {
      name: "Home",
      icon: Images.navIcons.home.homeIcon,
      activeIcon: Images.navIcons.home.homeIconActive,
      route: "/screens/app/Home" as AppRouterType,
    },
    {
      name: "Calendar",
      icon: Images.navIcons.calendar.calendarIcon,
      activeIcon: Images.navIcons.calendar.calendarIconActive,
      route: "/screens/app/Calendar" as AppRouterType,
    },
    {
      name: "Students",
      icon: Images.navIcons.students.studentsIcon,
      activeIcon: Images.navIcons.students.studentsIconActive,
      route: "/screens/app/Students" as AppRouterType,
    },
    {
      name: "Profile",
      icon: Images.navIcons.profile.profileIcon,
      activeIcon: Images.navIcons.profile.profileIconActive,
      route: "/screens/app/Profile" as AppRouterType,
    },
  ];

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
          <View style={isActive ? styles.selectedIconBackground : undefined}>
            <TouchableOpacity
              key={item.name}
              style={styles.navItem}
              onPress={() => router.push(item.route)}
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
    padding: 10
  },
  navItem: {
    
  },
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
