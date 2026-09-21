import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import axios from 'axios';

const credentialsPath = resolve(__dirname, 'src/serviceAccountKey.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(credentials) });

const uid = '9Fu9vQjcj4aA8u1X4w7KULieZoX2';
const BASE = 'http://localhost:3001/api';
const API_KEY = 'AIzaSyD9D69Bjxji2t40YlQDSkEawBFpMl2bba4';

async function main() {
  // 1. Create custom token
  const customToken = await admin.auth().createCustomToken(uid);
  console.log('Custom token created (first 30 chars):', customToken.substring(0, 30) + '...');

  // 2. Exchange custom token for ID token via REST API
  const exchangeRes = await axios.post(
    `https://identitytoolkit.googleapis.com/v3/projects/${credentials.project_id}:signInWithCustomToken?key=${API_KEY}`,
    { customToken, returnSecureToken: true }
  );
  const idToken = exchangeRes.data.idToken;
  console.log('ID token obtained (first 30 chars):', idToken?.substring(0, 30) + '...');

  const headers = { Authorization: `Bearer ${idToken}` };

  // 3. Test GET /api/users/me
  console.log('\n=== GET /api/users/me ===');
  try {
    const res = await axios.get(`${BASE}/users/me`, { headers });
    console.log('Status:', res.status);
    console.log('User data:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }

  // 4. Test GET /api/data-primer
  console.log('\n=== GET /api/data-primer ===');
  try {
    const res = await axios.get(`${BASE}/data-primer`, {
      headers,
      params: { wilayah_kerja: 2, tahun_data: 2026 },
    });
    console.log('Status:', res.status, 'Count:', res.data.length);
    console.log('First item:', JSON.stringify(res.data[0], null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }

  // 4. Test GET /api/pejabat
  console.log('\n=== GET /api/pejabat ===');
  try {
    const res = await axios.get(`${BASE}/pejabat`, {
      headers,
      params: { wilayah_kerja: 2 },
    });
    console.log('Status:', res.status, 'Count:', res.data.length);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }

  // 5. Test GET /api/rekap
  console.log('\n=== GET /api/rekap ===');
  try {
    const res = await axios.get(`${BASE}/rekap`, {
      headers,
      params: { wilayah_kerja: 2, tahun_data: 2026 },
    });
    console.log('Status:', res.status, 'Count:', res.data.length);
    console.log('Data:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }

  // 6. Test POST /api/pejabat (create)
  console.log('\n=== POST /api/pejabat (create) ===');
  try {
    const res = await axios.post(`${BASE}/pejabat`, {
      role: 'ppk',
      nama: 'Test PPK',
      nip: '1234567890',
      jabatan_lengkap: 'Pejabat Pengadaan Barang',
      wilayah_kerja: 2,
      aktif: true,
    }, { headers });
    console.log('Status:', res.status, 'Created:', JSON.stringify(res.data, null, 2));
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }
}

main().catch(console.error);