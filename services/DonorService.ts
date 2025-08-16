import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
const API_BASE_URL = `${API_BASE}/api`;
// DEBUG: log resolved API base once on load
// Remove after diagnosing connectivity
// eslint-disable-next-line no-console
console.log('[DonorService] API_BASE:', API_BASE, 'API_BASE_URL:', API_BASE_URL);

// Simple in-memory cache and in-flight guard to avoid duplicate fetches
let profileCache: any | null = null;
let profileInFlight: Promise<any> | null = null;

export class DonorService {
  static clearCache() {
    profileCache = null;
    profileInFlight = null;
    // eslint-disable-next-line no-console
    console.log('[DonorService] cache cleared');
  }
  static async getAuthHeaders() {
    const token = await SecureStore.getItemAsync('token');
    // DEBUG: indicate whether token is present
    // eslint-disable-next-line no-console
    console.log('[DonorService] Token present?', Boolean(token));
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  static async getProfile() {
    // Return cached result if available
    if (profileCache) {
      return profileCache;
    }
    // If a request is in-flight, return the same promise
    if (profileInFlight) {
      return profileInFlight;
    }
    const headers = await this.getAuthHeaders();
    const url = `${API_BASE_URL}/donor/profile`;
    // DEBUG: log request URL
    // eslint-disable-next-line no-console
    console.log('[DonorService] GET', url);
    profileInFlight = (async () => {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        // DEBUG: log status for diagnostics
        // eslint-disable-next-line no-console
        console.log('[DonorService] Profile response status:', response.status);
        profileInFlight = null;
        throw new Error(`Failed to fetch profile (status ${response.status})`);
      }
      const data = await response.json();
      profileCache = data;
      profileInFlight = null;
      return data;
    })();
    return profileInFlight;
  }

  static async updateProfile(profileData: {
    name: string;
    location: string;
    phoneNumber: string;
  }) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/donor/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    const updated = await response.json();
    // Update cache with latest server state
    profileCache = updated;
    return updated;
  }

  static async searchDonors(location: string, bloodGroup?: string) {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({ location });
    if (bloodGroup) {
      params.append('bloodGroup', bloodGroup);
    }

    const response = await fetch(`${API_BASE_URL}/donor/search?${params}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to search donors');
    }

    return response.json();
  }

  static async sendBloodRequest(donorId: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/donor/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ donorId }),
    });

    if (!response.ok) {
      let message = 'Failed to send blood request';
      try {
        const err = await response.json();
        if (err && err.message) message = err.message;
      } catch {}
      throw new Error(message);
    }

    return response.json();
  }

  static async getMyRequests(type?: 'sent' | 'received') {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    const response = await fetch(`${API_BASE_URL}/donor/requests?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }

    return response.json();
  }

  static async rejectRequest(requestId: string, note?: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/donor/requests/${requestId}/reject`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      throw new Error('Failed to reject request');
    }

    return response.json();
  }

  static async cancelRequest(requestId: string, note?: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/donor/requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel request');
    }

    return response.json();
  }

  static async completeRequest(requestId: string, rating?: number) {
    const headers = await this.getAuthHeaders();
    const init: RequestInit = {
      method: 'PATCH',
      headers,
    };
    if (typeof rating === 'number') {
      (init as any).body = JSON.stringify({ rating });
    }
    const response = await fetch(`${API_BASE_URL}/donor/requests/${requestId}/complete`, init);

    if (!response.ok) {
      throw new Error('Failed to complete request');
    }

    return response.json();
  }

  static async getDonationHistory() {
    const headers = await this.getAuthHeaders();
    const url = `${API_BASE_URL}/donor/history`;
    // eslint-disable-next-line no-console
    console.log('[DonorService] GET', url);
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error('Failed to fetch donation history');
    }
    return response.json();
  }
}