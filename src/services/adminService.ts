import axios from 'axios';
import { auth } from '../lib/firebase';
import type { UserProfile, MasterPejabat, RekapModel3Item } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 15000; // 15 seconds

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

// User Management
export async function getPendingUsers(): Promise<UserProfile[]> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/users/pending`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

export async function approveUser(
  uid: string,
  role: 'admin' | 'staf' = 'staf',
  wilayah_kerja: number = 0,
): Promise<void> {
  const headers = await getAuthHeader();
  await axios.post(`${API_URL}/users/${uid}/approve`, { role, wilayah_kerja }, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/users`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

export async function updateUser(
  uid: string,
  data: { role?: 'admin' | 'staf'; wilayah_kerja?: number },
): Promise<void> {
  const headers = await getAuthHeader();
  await axios.patch(`${API_URL}/users/${uid}`, data, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function rejectUser(uid: string): Promise<void> {
  const headers = await getAuthHeader();
  await axios.post(`${API_URL}/users/${uid}/reject`, {}, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function deleteUser(uid: string): Promise<void> {
  const headers = await getAuthHeader();
  await axios.delete(`${API_URL}/users/${uid}`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

// Master Pejabat Management
export async function createPejabat(
  data: Omit<MasterPejabat, 'id'>,
): Promise<MasterPejabat> {
  const headers = await getAuthHeader();
  const response = await axios.post(`${API_URL}/pejabat`, data, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

export async function updatePejabat(
  id: string,
  data: Partial<MasterPejabat>,
): Promise<void> {
  const headers = await getAuthHeader();
  await axios.put(`${API_URL}/pejabat/${id}`, data, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function deletePejabat(id: string): Promise<void> {
  const headers = await getAuthHeader();
  await axios.delete(`${API_URL}/pejabat/${id}`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

// Get current user profile
export async function getMe(): Promise<UserProfile> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/users/me`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

// Rekap Model 3
export async function getRekapModel3(
  wilayah: number,
  tahun: number,
): Promise<RekapModel3Item[]> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/rekap`, {
    headers,
    params: { wilayah_kerja: wilayah, tahun_data: tahun },
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}
