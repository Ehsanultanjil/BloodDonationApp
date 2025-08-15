import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, MapPin, Phone, Droplet } from 'lucide-react-native';
import { AuthService } from '@/services/AuthService';
import { isValidEmail } from '@/utils/validation';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodGroup: '',
    location: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
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

  const handleSignup = async () => {
    const composedLocation = area && city ? `${area}, ${city}` : '';

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() ||
        !formData.bloodGroup || !composedLocation || !formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Early server-side existence check
      const { exists } = await AuthService.checkEmail(formData.email);
      if (exists) {
        Alert.alert('Email already exists', 'Please use a different email address or login.');
        setIsLoading(false);
        return;
      }

      // Check if phone number already exists
      const phoneCheck = await AuthService.checkPhone(formData.phoneNumber);
      if (phoneCheck.exists) {
        Alert.alert('Phone number already exists', 'Please use a different phone number or login.');
        setIsLoading(false);
        return;
      }

      await AuthService.signup({ ...formData, location: `${area}, ${city}` });
      Alert.alert(
        'Success',
        'Account created successfully! You can now login.',
        [{ text: 'OK', onPress: () => router.push('/auth/login') }]
      );
    } catch (error) {
      console.error('Signup failed:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <User size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Blood Group *</Text>
          <View style={styles.bloodGroupContainer}>
            {bloodGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.bloodGroupButton,
                  formData.bloodGroup === group && styles.bloodGroupButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, bloodGroup: group })}
              >
                <Text
                  style={[
                    styles.bloodGroupButtonText,
                    formData.bloodGroup === group && styles.bloodGroupButtonTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <View style={styles.inputContainer}>
            <Phone size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              placeholder="Enter your phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
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
    </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  bloodGroupContainer: {
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
  signupButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkHighlight: {
    color: '#DC2626',
    fontWeight: '600',
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
  },
});