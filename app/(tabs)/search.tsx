import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Search, MapPin, Phone, Droplet, Send, Star } from 'lucide-react-native';
import { DonorService } from '@/services/DonorService';
import { router } from 'expo-router';

interface Donor {
  _id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phoneNumber: string;
  avgRating?: number | null;
  ratingCount?: number;
  nextAvailableAt?: string | Date | null;
}

export default function SearchDonors() {
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pickerVisible, setPickerVisible] = useState<null | 'city' | 'area'>(null);
  const bdCities = useMemo(
    () => [
      { name: 'Dhaka', areas: ['Dhanmondi', 'Mirpur', 'Uttara', 'Gulshan', 'Banani', 'Mohakhali', 'Motijheel'] },
      { name: 'Chattogram', areas: ['Agrabad', 'Pahartali', 'Panchlaish', 'Kotwali', 'Halishahar'] },
      { name: 'Khulna', areas: ['Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'] },
      { name: 'Rajshahi', areas: ['Boalia', 'Rajpara', 'Motihar', 'Shah Makhdum'] },
      { name: 'Sylhet', areas: ['Zindabazar', 'Shibganj', 'Amberkhana', 'Subid Bazar'] },
      { name: 'Barishal', areas: ['Band Road', 'Port Road', 'C&B Road'] },
      { name: 'Rangpur', areas: ['Dhap', 'Jahaj Company More', 'Lalbag'] },
      { name: 'Mymensingh', areas: ['Ganginar Par', 'Town Hall', 'Charpara'] },
    ],
    []
  );
  const cityOptions = bdCities.map((c) => c.name);
  const areaOptions = useMemo(() => (bdCities.find((c) => c.name === city)?.areas ?? []), [bdCities, city]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const searchDonors = async () => {
    const composedLocation = area && city ? `${area}, ${city}` : '';
    if (!composedLocation) {
      Alert.alert('Error', 'Please select City and Area');
      return;
    }

    setIsLoading(true);
    try {
      const results = await DonorService.searchDonors(composedLocation, bloodGroup);
      setDonors(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Error', 'Failed to search donors');
    } finally {
      setIsLoading(false);
    }
  };

  const sendBloodRequest = async (donor: Donor) => {
    // If donor is unavailable, show info and return
    const nextAt = donor.nextAvailableAt ? new Date(donor.nextAvailableAt) : null;
    if (nextAt && nextAt.getTime() > Date.now()) {
      Alert.alert('Unavailable', `This donor recently donated. Try again after ${nextAt.toLocaleDateString()}.`);
      return;
    }
    try {
      await DonorService.sendBloodRequest(donor._id);
      Alert.alert(
        'Request Sent',
        `Blood request sent to ${donor.name}. They will be notified of your request.`,
        [
          { text: 'OK', onPress: () => router.push('/(tabs)/requests') }
        ]
      );
    } catch (error: any) {
      console.error('Request failed:', error);
      Alert.alert('Error', error?.message || 'Failed to send blood request');
    }
  };

  const renderDonor = ({ item }: { item: Donor }) => {
    const nextAt = item.nextAvailableAt ? new Date(item.nextAvailableAt) : null;
    const unavailable = !!nextAt && nextAt.getTime() > Date.now();
    return (
    <View style={styles.donorCard}>
      <View style={styles.donorHeader}>
        <View style={styles.donorInfo}>
          <Text style={styles.donorName}>{item.name}</Text>
          <View style={styles.bloodGroupBadge}>
            <Droplet size={14} color="#FFFFFF" />
            <Text style={styles.bloodGroupText}>{item.bloodGroup}</Text>
          </View>
          {/* Rating row */}
          <View style={styles.ratingRow}>
            <Star size={14} color={item.avgRating ? '#F59E0B' : '#9CA3AF'} fill={item.avgRating ? '#F59E0B' : 'none'} />
            <Text style={styles.ratingText}>
              {typeof item.avgRating === 'number' ? `${item.avgRating.toFixed(1)} / 5` : 'No ratings yet'}
              {` `}
              {typeof item.ratingCount === 'number' && item.ratingCount > 0 ? `(${item.ratingCount})` : ''}
            </Text>
          </View>
          {unavailable && (
            <Text style={styles.unavailableText}>Unavailable until {nextAt?.toLocaleDateString()}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.requestButton, unavailable && { backgroundColor: '#9CA3AF' }]}
          onPress={() => sendBloodRequest(item)}
          disabled={unavailable}
        >
          <Send size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.donorDetails}>
        <View style={styles.detailRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Phone size={14} color="#6B7280" />
          <Text style={styles.detailText}>{item.phoneNumber}</Text>
        </View>
      </View>
    </View>
  ); };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Blood Donors</Text>
        <Text style={styles.headerSubtitle}>Search for donors in your area</Text>
      </View>

      <View style={styles.searchForm}>
        <Text style={styles.bloodGroupLabel}>Location</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <TouchableOpacity style={[styles.inputContainer, { flex: 1 }]} onPress={() => setPickerVisible('city')}>
            <MapPin size={20} color="#6B7280" />
            <Text style={[styles.input, { paddingVertical: 0 }]}>{city || 'Select City'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.inputContainer, { flex: 1, opacity: city ? 1 : 0.5 }]}
            disabled={!city}
            onPress={() => setPickerVisible('area')}
          >
            <MapPin size={20} color="#6B7280" />
            <Text style={[styles.input, { paddingVertical: 0 }]}>{area || 'Select Area'}</Text>
          </TouchableOpacity>
        </View>
        {!!city && !!area && (
          <Text style={styles.helperText}>Selected: {area}, {city}</Text>
        )}

        <View style={styles.bloodGroupContainer}>
          <Text style={styles.bloodGroupLabel}>Blood Group (Optional)</Text>
          <View style={styles.bloodGroupGrid}>
            {bloodGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.bloodGroupButton,
                  bloodGroup === group && styles.bloodGroupButtonActive,
                ]}
                onPress={() => setBloodGroup(bloodGroup === group ? '' : group)}
              >
                <Text
                  style={[
                    styles.bloodGroupButtonText,
                    bloodGroup === group && styles.bloodGroupButtonTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchDonors}
          disabled={isLoading}
        >
          <Search size={20} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search Donors'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={donors}
        renderItem={renderDonor}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.donorsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>
              {city && area ? 'No donors found in this location' : 'Search for donors to get started'}
            </Text>
          </View>
        }
      />
      <PickerModal
        visible={pickerVisible === 'city'}
        title="Select City"
        options={cityOptions}
        onSelect={(value) => setCity(value)}
        onClose={() => setPickerVisible(null)}
      />
      <PickerModal
        visible={pickerVisible === 'area'}
        title="Select Area"
        options={areaOptions}
        onSelect={(value) => setArea(value)}
        onClose={() => setPickerVisible(null)}
      />
    </View>
  );
}

function PickerModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, maxHeight: '70%' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 }}>{title}</Text>
          <ScrollView style={{ maxHeight: 400 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
                style={{ paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 16, color: '#111827' }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
            <Text style={{ color: '#DC2626', fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  searchForm: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  bloodGroupContainer: {
    marginBottom: 16,
  },
  bloodGroupLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodGroupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  bloodGroupButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  bloodGroupButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  bloodGroupButtonTextActive: {
    color: '#FFFFFF',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  donorsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  donorCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  donorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  requestButton: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 8,
  },
  donorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  helperText: {
    marginTop: -8,
    marginBottom: 8,
    fontSize: 12,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
  unavailableText: {
    marginTop: 6,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
});