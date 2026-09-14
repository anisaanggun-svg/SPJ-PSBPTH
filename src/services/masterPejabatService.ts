import axios from 'axios';
import { auth } from '../lib/firebase';
import type { MasterPejabat } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 15000; // 15 seconds

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getActivePejabat(
  wilayahKerja: number,
): Promise<MasterPejabat[]> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/pejabat`, {
    headers,
    params: { wilayah_kerja: wilayahKerja },
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

export function getPejabatByRole(
  pejabatList: MasterPejabat[],
  role: string,
): MasterPejabat | undefined {
  return pejabatList.find((p) => p.role === role);
}
