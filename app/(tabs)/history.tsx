import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Clock, Heart } from 'lucide-react-native';
import { DonorService } from '@/services/DonorService';

interface BloodRequestItem {
  _id: string;
  requesterId: string;
  donorId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function DonationHistory() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [items, setItems] = useState<BloodRequestItem[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrorMsg('');
        setLoading(true);
        // Fetch profile (for myId) and history in parallel
        const [profile, history] = await Promise.all([
          DonorService.getProfile().catch(() => null),
          DonorService.getDonationHistory(),
        ]);
        if (!mounted) return;
        setItems(history || []);
        setMyId(profile?._id ?? null);
      } catch (err: any) {
        if (!mounted) return;
        const msg = typeof err?.message === 'string' ? err.message : 'Failed to load donation history';
        setErrorMsg(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const renderItem = ({ item }: { item: BloodRequestItem }) => {
    const completedAt = item.updatedAt || item.createdAt;
    const date = completedAt ? new Date(completedAt) : null;
    const dateStr = date ? date.toLocaleString() : '';
    const role = myId ? (item.donorId === myId ? 'Donated to Requester' : 'Received from Donor') : 'Completed Request';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Heart size={18} color="#DC2626" />
          <Text style={styles.cardTitle}>{role}</Text>
        </View>
        <View style={styles.row}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.muted}> {dateStr}</Text>
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donation History</Text>
      </View>

      {Boolean(errorMsg) && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loading}> 
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.muted}> Loading history...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={items}
          keyExtractor={(it) => it._id}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Text style={styles.muted}>No completed donations yet.</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  loading: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  muted: { color: '#6B7280' },
  empty: { padding: 24, alignItems: 'center' },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 16,
  },
  errorText: { color: '#B91C1C' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { marginLeft: 6, fontWeight: '600', color: '#111827' },
  row: { flexDirection: 'row', alignItems: 'center' },
  note: { marginTop: 8, color: '#374151' },
});
