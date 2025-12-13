import { masterAdminDashboardStyles as adminStats } from '@/src/styles/DashboardPageStyles/masterDashboardScreen';
import React from 'react';
import { Text, View } from 'react-native';

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
        <View style={adminStats.statsContainer}>
            <Text style={adminStats.statsTitle}>Company Stats</Text>
            <View style={adminStats.statRow}>
                <View style={adminStats.statCard}>
                    <Text style={adminStats.statValue}>{stats.totalUsers}</Text>
                    <Text style={adminStats.statLabel}>Total Users</Text>
                </View>

                <View style={adminStats.statCard}>
                    <Text style={adminStats.statValue}>{stats.pendingInvites}</Text>
                    <Text style={adminStats.statLabel}>Pending Invites</Text>
                </View>
            </View>
        </View>
    );
};

export default AdminStats