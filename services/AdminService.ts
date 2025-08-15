const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000';
const API_BASE_URL = `${API_BASE}/api`;

// Simple fetch timeout helper to avoid hanging UI when server is unreachable
async function fetchWithTimeout(resource: RequestInfo | URL, options: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs = 10000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // @ts-ignore - RN's fetch supports signal
    const res = await fetch(resource as any, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export class AdminService {
  static async login(username: string, password: string) {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      timeoutMs: 10000,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Admin login failed');
    }

    return response.json();
  }

  static async getStats(): Promise<{ activeRequests: number; totalDonors: number; donorsByBloodGroup: Record<string, number> }> {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  }

  static async getBloodRequests() {
    const response = await fetch(`${API_BASE_URL}/admin/requests`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blood requests');
    }

    return response.json();
  }

  // Donor management
  static async listDonors(params: {
    query?: string;
    bloodGroup?: string;
    status?: 'active' | 'suspended';
    location?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const url = `${API_BASE_URL}/admin/donors${qs.toString() ? `?${qs.toString()}` : ''}`;
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to fetch donors');
    return res.json();
  }

  static async getDonor(id: string) {
    const res = await fetch(`${API_BASE_URL}/admin/donors/${id}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to fetch donor');
    return res.json();
  }

  static async updateDonor(
    id: string,
    data: Partial<{ name: string; email: string; bloodGroup: string; location: string; phoneNumber: string }>
  ) {
    const res = await fetch(`${API_BASE_URL}/admin/donors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update donor');
    return res.json();
  }

  static async updateDonorStatus(id: string, status: 'active' | 'suspended', reason?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/donors/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason }),
    });
    if (!res.ok) throw new Error('Failed to update donor status');
    return res.json();
  }

  static async verifyDonor(id: string, verified: boolean, note?: string) {
    const res = await fetch(`${API_BASE_URL}/admin/donors/${id}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified, note }),
    });
    if (!res.ok) throw new Error('Failed to verify donor');
    return res.json();
  }

  static async deleteDonor(id: string) {
    const res = await fetch(`${API_BASE_URL}/admin/donors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete donor');
    return res.json();
  }
}