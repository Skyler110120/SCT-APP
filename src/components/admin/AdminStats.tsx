import { adminStatsStyles as styles } from "@/src/styles/DashboardPageStyles/MasterAdminDashboardStyles/adminStatsStyles";
import React from "react";
import { Text, View } from "react-native";

interface StatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    pendingInvites: number;
  };
  selectedCompany: {
    name: string;
  } | null;
}

const AdminStats = ({ stats, selectedCompany }: StatsProps) => {
  if (!selectedCompany) return null;

  return (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Company Stats</Text>
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingInvites}</Text>
          <Text style={styles.statLabel}>Pending Invites</Text>
        </View>
      </View>
    </View>
  );
};

export default AdminStats;
