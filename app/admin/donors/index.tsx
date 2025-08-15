import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Search, Users, MapPin, Droplet, CheckCircle2, ShieldX, Edit, Eye } from 'lucide-react-native';
import { AdminService } from '@/services/AdminService';
import { router } from 'expo-router';

interface DonorItem {
  _id: string;
  name: string;
  email: string;
  bloodGroup: string;
  location: string;
  phoneNumber: string;
  status?: 'active' | 'suspended';
  verified?: boolean;
  createdAt?: string;
}

export default function AdminDonorsList() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended' | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<DonorItem[]>([]);

  const load = async () => {
    try {
      const res = await AdminService.listDonors({ query, bloodGroup, location, status });
      setItems(res.items ?? []);
    } catch (e) {
      console.error('Failed to load donors', e);
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
  }, [query, bloodGroup, location, status]);

  const onSearch = () => {
    setLoading(true);
    load();
  };

  const renderItem = ({ item }: { item: DonorItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/admin/donors/${item._id}`)}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Users size={18} color="#DC2626" />
          <Text style={styles.titleText}>{item.name}</Text>
        </View>
        <View style={[styles.badge, item.verified ? styles.badgeVerified : styles.badgeUnverified]}>
          <CheckCircle2 size={14} color="#FFFFFF" />
          <Text style={styles.badgeText}>{item.verified ? 'Verified' : 'Unverified'}</Text>
        </View>
      </View>
      <View style={styles.infoRow}><Droplet size={16} color="#6B7280" /><Text style={styles.infoText}>{item.bloodGroup}</Text></View>
      <View style={styles.infoRow}><MapPin size={16} color="#6B7280" /><Text style={styles.infoText}>{item.location}</Text></View>
      <View style={styles.actionsRow}>
        <View style={[styles.statusPill, item.status === 'active' ? styles.pillActive : styles.pillSuspended]}>
          <Text style={styles.pillText}>{item.status === 'suspended' ? 'Suspended' : 'Active'}</Text>
        </View>
        <View style={{ flex: 1 }} />
        <Eye size={18} color="#374151" />
        <Edit size={18} color="#374151" style={{ marginLeft: 12 }} />
        <ShieldX size={18} color="#374151" style={{ marginLeft: 12 }} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#DC2626" />
        <Text style={styles.loadingText}>Loading donors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Donors</Text>
        <Text style={styles.headerSubtitle}>Search, verify, edit, and moderate donors</Text>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchRow}>
          <Search size={18} color="#6B7280" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name, email, phone"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
        <View style={styles.filterRow}>
          <TextInput value={bloodGroup} onChangeText={setBloodGroup} placeholder="Blood Group (e.g. O+)" placeholderTextColor="#9CA3AF" style={styles.filterInput} />
          <TextInput value={location} onChangeText={setLocation} placeholder="Location" placeholderTextColor="#9CA3AF" style={styles.filterInput} />
          <TextInput
            value={status ?? ''}
            onChangeText={(t) => setStatus(t === 'active' || t === 'suspended' ? t : undefined)}
            placeholder="Status (active/suspended)"
            placeholderTextColor="#9CA3AF"
            style={styles.filterInput}
          />
          <TouchableOpacity style={styles.applyBtn} onPress={onSearch}><Text style={styles.applyBtnText}>Apply</Text></TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No donors found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  filters: { padding: 16, gap: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { marginLeft: 8, flex: 1, color: '#111827' },
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  filterInput: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, color: '#111827' },
  applyBtn: { backgroundColor: '#DC2626', paddingHorizontal: 14, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#FFFFFF', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleText: { marginLeft: 8, fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeVerified: { backgroundColor: '#10B981' },
  badgeUnverified: { backgroundColor: '#9CA3AF' },
  badgeText: { color: '#FFFFFF', marginLeft: 4, fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  infoText: { color: '#374151' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillActive: { backgroundColor: '#E5F8EF' },
  pillSuspended: { backgroundColor: '#FDE2E2' },
  pillText: { color: '#111827', fontSize: 12, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 8, color: '#6B7280' },
  empty: { textAlign: 'center', color: '#6B7280', padding: 20 }
});
