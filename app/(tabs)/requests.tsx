import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { ArrowLeft, Send, Inbox, Clock, MapPin, Droplet, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { DonorService } from '@/services/DonorService';

interface BloodRequest {
  _id: string;
  requesterId: string;
  donorId: string;
  requesterName: string;
  donorName: string;
  bloodGroup: string;
  location: string;
  status: string;
  note?: string;
  createdAt: string;
}

export default function RequestsScreen() {
  const [type, setType] = useState<'sent' | 'received'>('sent');
  const [items, setItems] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectNote, setRejectNote] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingValue, setRatingValue] = useState<number>(5);

  const load = async (t = type) => {
    setLoading(true);
    try {
      const data = await DonorService.getMyRequests(t);
      setItems(data);
    } catch (e) {
      console.error('Failed to load requests', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('sent');
  }, []);

  useEffect(() => {
    load(type);
  }, [type]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(type);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: BloodRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.nameRow}>
          <User size={16} color="#6B7280" />
          <Text style={styles.nameText}>
            {type === 'sent' ? item.donorName : item.requesterName}
          </Text>
        </View>
        <View style={styles.badgesRight}>
          <View style={[styles.statusBadge, 
            item.status === 'pending' ? styles.statusPending :
            item.status === 'rejected' ? styles.statusRejected :
            item.status === 'completed' ? styles.statusCompleted : styles.statusDefault
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
          <View style={styles.badge}>
            <Droplet size={14} color="#FFFFFF" />
            <Text style={styles.badgeText}>{item.bloodGroup}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailRow}>
        <MapPin size={14} color="#6B7280" />
        <Text style={styles.detailText}>{item.location}</Text>
      </View>
      <View style={styles.detailRow}>
        <Clock size={14} color="#6B7280" />
        <Text style={styles.detailText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>

      {item.note ? (
        <View style={[styles.detailRow, { alignItems: 'flex-start' }]}> 
          <Text style={[styles.detailText, { fontStyle: 'italic' }]}>Note: {item.note}</Text>
        </View>
      ) : null}

      {item.status === 'pending' ? (
        <View style={[styles.actionsRow, { gap: 10 }]}> 
          {type === 'received' && (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => {
                setSelectedRequest(item);
                setRejectNote('');
                setRejectModalVisible(true);
              }}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          )}
          {type === 'sent' && (
            <>
              <TouchableOpacity
                style={styles.reqCancelBtn}
                onPress={async () => {
                  try {
                    await DonorService.cancelRequest(item._id);
                    await load('sent');
                  } catch (e: any) {
                    console.error(e);
                    Alert.alert('Error', e?.message || 'Failed to cancel request');
                  }
                }}
              >
                <Text style={styles.reqCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => {
                  setSelectedRequest(item);
                  setRatingValue(5);
                  setRatingModalVisible(true);
                }}
              >
                <Text style={styles.completeText}>Complete</Text>
              </TouchableOpacity>
            </>
          )}
          {/* No complete action for received; recipients can only reject */}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Requests</Text>
      </View>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, type === 'sent' && styles.switchActive]}
          onPress={() => setType('sent')}
        >
          <Send size={16} color={type === 'sent' ? '#FFFFFF' : '#DC2626'} />
          <Text style={[styles.switchText, type === 'sent' && styles.switchTextActive]}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, type === 'received' && styles.switchActive]}
          onPress={() => setType('received')}
        >
          <Inbox size={16} color={type === 'received' ? '#FFFFFF' : '#DC2626'} />
          <Text style={[styles.switchText, type === 'received' && styles.switchTextActive]}>Received</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}> 
            <Inbox size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No {type} requests</Text>
          </View>
        ) : null}
      />

      {/* Reject Modal */}
      <Modal
        transparent
        visible={rejectModalVisible}
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reject Request</Text>
            <Text style={styles.modalSubtitle}>
              Add an optional note for the requester
            </Text>
            <TextInput
              placeholder="Reason (optional)"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={async () => {
                  if (!selectedRequest) return;
                  try {
                    await DonorService.rejectRequest(selectedRequest._id, rejectNote.trim() || undefined);
                    setRejectModalVisible(false);
                    setSelectedRequest(null);
                    await load('received');
                  } catch (e: any) {
                    console.error(e);
                    Alert.alert('Error', e?.message || 'Failed to reject request');
                  }
                }}
              >
                <Text style={styles.confirmText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal for requester (1-5) */}
      <Modal
        transparent
        visible={ratingModalVisible}
        animationType="fade"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Donor</Text>
            <Text style={styles.modalSubtitle}>Please rate the donor (1-5) before completion</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 8 }}>
              {[1,2,3,4,5].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setRatingValue(n)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: n === ratingValue ? '#DC2626' : '#E5E7EB',
                    backgroundColor: n === ratingValue ? '#FEE2E2' : '#FFFFFF',
                    marginHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#111827', fontWeight: '700' }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={async () => {
                  if (!selectedRequest) return;
                  try {
                    await DonorService.completeRequest(selectedRequest._id, ratingValue);
                    setRatingModalVisible(false);
                    setSelectedRequest(null);
                    await load('sent');
                  } catch (e: any) {
                    console.error(e);
                    Alert.alert('Error', e?.message || 'Failed to complete with rating');
                  }
                }}
              >
                <Text style={styles.confirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  switchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  switchBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  switchActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  switchText: { color: '#DC2626', fontWeight: '700' },
  switchTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  badgesRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nameText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  badge: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  statusPending: { backgroundColor: '#F59E0B' },
  statusRejected: { backgroundColor: '#EF4444' },
  statusCompleted: { backgroundColor: '#10B981' },
  statusDefault: { backgroundColor: '#6B7280' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  detailText: { color: '#374151' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: '#6B7280', marginTop: 8 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  rejectBtn: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  rejectText: { color: '#B91C1C', fontWeight: '700' },
  reqCancelBtn: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  reqCancelText: { color: '#C2410C', fontWeight: '700' },
  completeBtn: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  completeText: { color: '#065F46', fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  modalSubtitle: { color: '#6B7280', marginTop: 4, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, minHeight: 80, textAlignVertical: 'top', color: '#111827' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  cancelText: { color: '#6B7280', fontWeight: '700' },
  confirmBtn: { backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmText: { color: '#FFFFFF', fontWeight: '700' },
});
