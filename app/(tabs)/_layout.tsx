import { Tabs } from 'expo-router';
import { Heart, Search, User, Shield } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      {/** Hidden Requests screen: accessible via button, not visible in tab bar */}
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
        }}
      />
      {/** Hidden Donation History screen */}
      <Tabs.Screen
        name="history"
        options={{
          href: null,
        }}
      />
      {/** Profile tab (restored) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }: { size: number; color: string }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      {/** Admin screens are top-level under /admin; no admin screen in donor tabs. */}
    </Tabs>
  );
}