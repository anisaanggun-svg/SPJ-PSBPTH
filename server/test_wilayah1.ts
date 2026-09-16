import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import axios from 'axios';

const credentialsPath = resolve(__dirname, 'src/serviceAccountKey.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
admin.initializeApp({ credential: admin.credential.cert(credentials) });

const BASE = 'http://localhost:3001/api';
const API_KEY = 'AIzaSyD9D69Bjxji2t40YlQDSkEawBFpMl2bba4';

// Use the legacy Firebase Auth endpoint (not Identity Platform)
const VERIFY_CUSTOM_TOKEN_URL = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyCustomToken?key=${API_KEY}`;

// Use the known working UID from test_endpoints.ts (anisa@gmail.com, wilayah 2)
// But we want to test wilayah 1, so let's find a user with wilayah 1
async function findUserWilayah1() {
  const usersSnap = await admin.firestore().collection('users').where('wilayah_kerja', '==', 1).get();
  if (usersSnap.empty) {
    console.log('No users found with wilayah_kerja 1');
    return null;
  }
  const userDoc = usersSnap.docs[0];
  console.log('Found user:', userDoc.id, userDoc.data());
  return userDoc.id;
}

async function getIdToken(uid: string) {
  const customToken = await admin.auth().createCustomToken(uid);
  console.log('Custom token created for UID:', uid);

  try {
    const exchangeRes = await axios.post(
      VERIFY_CUSTOM_TOKEN_URL,
      { customToken, returnSecureToken: true }
    );
    const idToken = exchangeRes.data.idToken;
    console.log('ID token obtained');
    return idToken;
  } catch (e: any) {
    console.log('ERROR exchanging custom token:', e.response?.status, e.response?.data);
    throw e;
  }
}

async function testWilayah(wilayah: number, label: string) {
  const uid = wilayah === 2
    ? '9Fu9vQjcj4aA8u1X4w7KULieZoX2'  // anisa@gmail.com
    : await findUserWilayah1();
  
  if (!uid) {
    console.log(`No user found for wilayah ${wilayah}`);
    return;
  }

  console.log(`\n=== TESTING ${label} (wilayah ${wilayah}) ===`);
  const idToken = await getIdToken(uid);
  const headers = { Authorization: `Bearer ${idToken}` };

  // Test GET /api/data-primer
  console.log(`\n=== GET /api/data-primer (wilayah ${wilayah}) ===`);
  try {
    const res = await axios.get(`${BASE}/data-primer`, {
      headers,
      params: { wilayah_kerja: wilayah, tahun_data: 2026 },
    });
    console.log('Status:', res.status, 'Count:', res.data.length);
    if (res.data.length > 0) {
      console.log('First item:', JSON.stringify(res.data[0], null, 2));
      
      // Test GET /api/data-primer/:id/kwitansi
      const firstId = res.data[0].id;
      console.log(`\n=== GET /api/data-primer/:id/kwitansi (wilayah ${wilayah}) ===`);
      console.log('Testing with id:', firstId);
      const kwitansiRes = await axios.get(`${BASE}/data-primer/${firstId}/kwitansi`, {
        headers,
        responseType: 'arraybuffer',
      });
      console.log('Status:', kwitansiRes.status);
      console.log('Content-Type:', kwitansiRes.headers['content-type']);
      console.log('Content-Length:', kwitansiRes.headers['content-length']);
      console.log('Content-Disposition:', kwitansiRes.headers['content-disposition']);
      console.log(`SUCCESS: Kwitansi generated for wilayah ${wilayah}!`);
    }
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
  }
}

async function main() {
  await testWilayah(2, 'WILAYAH 2 (known working)');
  await testWilayah(1, 'WILAYAH 1 (sabrina@gmail.com)');
}

main().catch(console.error);