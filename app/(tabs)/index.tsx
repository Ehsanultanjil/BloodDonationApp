import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, CreditCard as Edit3, MapPin, Phone, Droplet, Search, Inbox } from 'lucide-react-native';
import { AuthService } from '@/services/AuthService';
import { DonorService } from '@/services/DonorService';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface DonorProfile {
  _id: string;
  name: string;
  bloodGroup: string;
  location: string;
  phoneNumber: string;
  email: string;
}

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Redirect unauthenticated users to login instead of showing a Get Started page
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace('/auth/login');
    }
  }, [isLoading, isLoggedIn]);

  const checkAuthStatus = async () => {
    try {
      const token = await AuthService.getToken();
      if (token) {
        setIsLoggedIn(true);
        await loadProfile();
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const donorProfile = await DonorService.getProfile();
      setProfile(donorProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const navigateToAuth = () => {
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Heart size={48} color="#DC2626" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // While redirecting unauthenticated users, show a brief loading state
  if (!isLoggedIn) {
    return (
      <View style={styles.loadingContainer}>
        <Heart size={48} color="#DC2626" />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome Back</Text>
        </View>
      </View>

      {profile && (
        <View style={styles.profileCard}>
          {/* Animated liquid blood background */}
          <BloodWaveBackground />
          <View style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <View style={styles.bloodGroupBadge}>
                <Droplet size={20} color="#FFFFFF" />
                <Text style={styles.bloodGroupText}>{profile.bloodGroup}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Edit3 size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>

            <View style={styles.profileDetails}>
              <View style={styles.detailRow}>
                <MapPin size={18} color="#6B7280" />
                <Text style={styles.detailText}>{profile.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <Phone size={18} color="#6B7280" />
                <Text style={styles.detailText}>{profile.phoneNumber}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={styles.actionCards}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/search')}
        >
          <Search size={32} color="#DC2626" />
          <Text style={styles.actionCardTitle}>Find Donors</Text>
          <Text style={styles.actionCardSubtitle}>
            Search for blood donors in your area
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/history')}
        >
          <Heart size={32} color="#DC2626" />
          <Text style={styles.actionCardTitle}>Donation History</Text>
          <Text style={styles.actionCardSubtitle}>
            View your donation records
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/requests')}
        >
          <Inbox size={32} color="#DC2626" />
          <Text style={styles.actionCardTitle}>My Requests</Text>
          <Text style={styles.actionCardSubtitle}>
            See sent and received requests
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Animated liquid blood background used inside the profile card
function BloodWaveBackground() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let isMounted = true;
    const run = () => {
      if (!isMounted) return;
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 7000,
        useNativeDriver: true,
      }).start(() => run());
    };
    run();
    return () => { isMounted = false; anim.stopAnimation(); };
  }, [anim]);

  // Move a full wave width (400 units) to create a seamless loop
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -400] });

  return (
    <View style={styles.waveContainer} pointerEvents="none">
      <Animated.View style={{ width: '200%', transform: [{ translateX }] }}>
        <Svg width="100%" height="180" viewBox="0 0 800 160">
          <Defs>
            <LinearGradient id="bloodGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
              <Stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
            </LinearGradient>
          </Defs>
          {/* First wave segment (0..400) */}
          <Path d="M0 80 Q 50 60 100 80 T 200 80 T 300 80 T 400 80 V160 H0 Z" fill="url(#bloodGrad)" />
          <Path d="M0 100 Q 50 120 100 100 T 200 100 T 300 100 T 400 100 V160 H0 Z" fill="#dc2626" opacity="0.6" />
          {/* Second wave segment (400..800) */}
          <Path d="M400 80 Q 450 60 500 80 T 600 80 T 700 80 T 800 80 V160 H400 Z" fill="url(#bloodGrad)" />
          <Path d="M400 100 Q 450 120 500 100 T 600 100 T 700 100 T 800 100 V160 H400 Z" fill="#dc2626" opacity="0.6" />
        </Svg>
      </Animated.View>
    </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  waveContainer: {
    position: 'absolute',
    left: -40,
    right: -40,
    bottom: -70,
    height: 170,
  },
  profileContent: {
    transform: [{ translateY: -8 }],
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bloodGroupBadge: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
  },
  bloodGroupText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  profileDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
  },
  actionCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});