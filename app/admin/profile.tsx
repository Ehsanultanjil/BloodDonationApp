import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';
import { router } from 'expo-router';

export default function AdminProfile() {
  const onLogout = () => {
    router.replace('/auth/admin-login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <Text style={styles.headerSubtitle}>Your administrator information</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileWrap}>
          <View style={styles.avatar}>
            <User size={48} color="#DC2626" />
          </View>
          <Text style={styles.name}>Administrator</Text>
          <Text style={styles.role}>Admin</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
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
  profileCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  profileWrap: {
    alignItems: 'center',
    paddingTop: 40,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  role: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  logoutBtn: {
    marginTop: 24,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
