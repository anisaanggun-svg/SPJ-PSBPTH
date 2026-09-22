import axios from 'axios';
import { saveAs } from 'file-saver';
import { auth } from '../lib/firebase';
import type { DataPrimer } from '../types';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT = 15000; // 15 seconds

async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getDataPrimer(
  wilayahKerja: number,
  tahunData?: number,
  page?: number,
  limit?: number,
): Promise<{ data: DataPrimer[]; total: number; page: number; limit: number; totalPages: number }> {
  const headers = await getAuthHeader();
  const params: Record<string, any> = { wilayah_kerja: wilayahKerja };
  if (tahunData) {
    params.tahun_data = tahunData;
  }
  if (page) {
    params.page = page;
  }
  if (limit) {
    params.limit = limit;
  }
  const response = await axios.get(`${API_URL}/data-primer`, {
    headers,
    params,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data;
}

export async function addDataPrimer(
  data: Omit<DataPrimer, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const headers = await getAuthHeader();
  const response = await axios.post(`${API_URL}/data-primer`, data, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
  return response.data.id;
}

export async function updateDataPrimer(
  id: string,
  data: Partial<DataPrimer>,
): Promise<void> {
  const headers = await getAuthHeader();
  await axios.put(`${API_URL}/data-primer/${id}`, data, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function deleteDataPrimer(id: string): Promise<void> {
  const headers = await getAuthHeader();
  await axios.delete(`${API_URL}/data-primer/${id}`, {
    headers,
    timeout: REQUEST_TIMEOUT,
  });
}

export async function downloadKwitansi(
  id: string,
  namaPegawai: string,
  noUrutSPPD: number | string,
): Promise<void> {
  const headers = await getAuthHeader();
  const response = await axios.get(`${API_URL}/data-primer/${id}/kwitansi`, {
    headers,
    timeout: REQUEST_TIMEOUT,
    responseType: 'blob',
  });

  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const filename = `Kwitansi_${namaPegawai}_${noUrutSPPD}.docx`;
  saveAs(blob, filename);
}
