import * as SecureStore from 'expo-secure-store';
import { DonorService } from '@/services/DonorService';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
const API_BASE_URL = `${API_BASE}/api`;
// DEBUG: log resolved API base once on load
// Remove after diagnosing connectivity
// eslint-disable-next-line no-console
console.log('[AuthService] API_BASE:', API_BASE, 'API_BASE_URL:', API_BASE_URL);

export class AuthService {
  static async checkEmail(email: string): Promise<{ exists: boolean }> {
    const url = `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`;
    // eslint-disable-next-line no-console
    console.log('[AuthService] GET', url);
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any));
      throw new Error(err.message || 'Failed to check email');
    }
    return res.json();
  }

  static async checkPhone(phone: string): Promise<{ exists: boolean }> {
    const url = `${API_BASE_URL}/auth/check-phone?phone=${encodeURIComponent(phone)}`;
    // eslint-disable-next-line no-console
    console.log('[AuthService] GET', url);
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({} as any));
      throw new Error(err.message || 'Failed to check phone');
    }
    return res.json();
  }
  static async signup(userData: {
    name: string;
    email: string;
    password: string;
    bloodGroup: string;
    location: string;
    phoneNumber: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  }

  static async login(email: string, password: string) {
    const url = `${API_BASE_URL}/auth/login`;
    // DEBUG: log request URL
    // eslint-disable-next-line no-console
    console.log('[AuthService] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      // DEBUG: log status
      // eslint-disable-next-line no-console
      console.log('[AuthService] Login response status:', response.status);
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    await SecureStore.setItemAsync('token', data.token);
    // Clear any cached user-specific data so next screens load fresh profile
    try { DonorService.clearCache(); } catch {}
    return data;
  }

  static async logout() {
    await SecureStore.deleteItemAsync('token');
    try { DonorService.clearCache(); } catch {}
  }

  static async getToken() {
    return await SecureStore.getItemAsync('token');
  }

  static async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    const token = await this.getToken();
    if (!token) throw new Error('Not authenticated');

    const url = `${API_BASE_URL}/auth/change-password`;
    // eslint-disable-next-line no-console
    console.log('[AuthService] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({} as any));
      throw new Error(error.message || 'Failed to change password');
    }
    return response.json();
  }
}