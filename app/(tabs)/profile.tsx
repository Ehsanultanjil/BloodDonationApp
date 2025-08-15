import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { User, Save, MapPin, Phone, Mail, Droplet, KeyRound, LogOut } from 'lucide-react-native';
import { DonorService } from '@/services/DonorService';
import { AuthService } from '@/services/AuthService';
import { router } from 'expo-router';

interface DonorProfile {
  _id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phoneNumber: string;
  email: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phoneNumber: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const donorProfile = await DonorService.getProfile();
      setProfile(donorProfile);
      setFormData({
        name: donorProfile.name,
        location: donorProfile.location,
        phoneNumber: donorProfile.phoneNumber,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            router.replace('/auth/login');
          } catch (e) {
            console.error('Logout failed:', e);
            Alert.alert('Error', 'Failed to logout');
          }
        }
      }
    ]);
  };

  const saveProfile = async () => {
    if (!formData.name.trim() || !formData.location.trim() || !formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await DonorService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        location: profile.location,
        phoneNumber: profile.phoneNumber,
      });
    }
    setIsEditing(false);
  };

  const submitPasswordChange = async () => {
    if (!pwCurrent || !pwNew || !pwConfirm) {
      Alert.alert('Error', 'Please fill out all password fields');
      return;
    }
    if (pwNew.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (pwNew !== pwConfirm) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    setPwSubmitting(true);
    try {
      await AuthService.changePassword(pwCurrent, pwNew);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordForm(false);
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
    } catch (e: any) {
      console.error('Change password failed:', e);
      Alert.alert('Error', e?.message || 'Failed to change password');
    } finally {
      setPwSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <User size={48} color="#DC2626" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <User size={40} color="#DC2626" />
          </View>
          <View style={styles.bloodGroupBadge}>
            <Droplet size={16} color="#FFFFFF" />
            <Text style={styles.bloodGroupText}>{profile.bloodGroup}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
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
            ) : (
              <Text style={styles.value}>{profile.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Enter your location"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            ) : (
              <Text style={styles.value}>{profile.location}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
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
            ) : (
              <Text style={styles.value}>{profile.phoneNumber}</Text>
            )}
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveProfile}
                disabled={isSaving}
              >
                <Save size={16} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!isEditing && (
            <View style={{ marginTop: 8 }}>
              {!showPasswordForm ? (
                <TouchableOpacity
                  style={styles.changePwButton}
                  onPress={() => setShowPasswordForm(true)}
                >
                  <KeyRound size={16} color="#FFFFFF" />
                  <Text style={styles.changePwButtonText}>Change Password</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.changePwForm}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={pwCurrent}
                      onChangeText={setPwCurrent}
                      placeholder="Enter current password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 12 }]}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={pwNew}
                      onChangeText={setPwNew}
                      placeholder="Enter new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 12 }]}>Confirm New Password</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={pwConfirm}
                      onChangeText={setPwConfirm}
                      placeholder="Confirm new password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => { setShowPasswordForm(false); setPwCurrent(''); setPwNew(''); setPwConfirm(''); }}
                      disabled={pwSubmitting}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={submitPasswordChange}
                      disabled={pwSubmitting}
                    >
                      <Save size={16} color="#FFFFFF" />
                      <Text style={styles.saveButtonText}>{pwSubmitting ? 'Updating...' : 'Update Password'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <LogOut size={16} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  editButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  formContainer: {
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
  value: {
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  changePwButton: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePwButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  changePwForm: {
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 20,
  },
});