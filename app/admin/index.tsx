import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Shield, Users, Calendar, MapPin, Droplet } from 'lucide-react-native';
import { AdminService } from '@/services/AdminService';

interface BloodRequest {
  _id: string;
  requesterId: string;
  donorId: string;
  requesterName: string;
  donorName: string;
  bloodGroup: string;
  location: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<{ activeRequests: number; totalDonors: number; donorsByBloodGroup: Record<string, number> } | null>(null);

  const load = async () => {
    try {
      const [reqs, s] = await Promise.all([
        AdminService.getBloodRequests(),
        AdminService.getStats().catch(() => null),
      ]);
      setRequests(reqs);
      if (s) setStats(s);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      Alert.alert('Error', 'Failed to fetch blood requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, []);

  const renderItem = ({ item }: { item: BloodRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Users size={18} color="#DC2626" />
          <Text style={styles.titleText}>
            {item.requesterName} <Text style={styles.mutedText}>→</Text> {item.donorName}
          </Text>
        </View>
        <View style={styles.badge}>
          <Droplet size={16} color="#FFFFFF" />
          <Text style={styles.badgeText}>{item.bloodGroup}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={16} color="#6B7280" />
        <Text style={styles.infoText}>{item.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Calendar size={16} color="#6B7280" />
        <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Shield size={48} color="#DC2626" />
        <ActivityIndicator style={{ marginTop: 12 }} color="#DC2626" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Overview and recent blood requests</Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Active Requests</Text>
                <Text style={styles.statValue}>{stats?.activeRequests ?? '—'}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Donors</Text>
                <Text style={styles.statValue}>{stats?.totalDonors ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.groupCard}>
              <Text style={styles.groupTitle}>Donors by Blood Group</Text>
              <View style={styles.chipsWrap}>
                {stats && Object.keys(stats.donorsByBloodGroup).length > 0 ? (
                  Object.entries(stats.donorsByBloodGroup).map(([bg, count]) => (
                    <View key={bg} style={styles.chip}>
                      <Droplet size={14} color="#DC2626" />
                      <Text style={styles.chipText}>{bg}: {count}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No donors yet</Text>
                )}
              </View>
            </View>
            <Text style={[styles.headerSubtitle, { marginTop: 12 }]}>Recent blood requests</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Shield size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No requests yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  statValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    marginLeft: 6,
    color: '#991B1B',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  mutedText: {
    color: '#6B7280',
  },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});
