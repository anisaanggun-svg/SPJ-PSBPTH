import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load credentials
const credentialsPath = resolve(__dirname, 'src/serviceAccountKey.json');
let firebaseApp;
try {
  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId: 'sppd-psbtph',
  });
} catch (e) {
  firebaseApp = admin.initializeApp({ projectId: 'sppd-psbtph' });
}

const db = admin.firestore();

async function seed() {
  const data = [
    // Wilayah 1
    {
      role: 'ppk',
      nama: 'Muhammad Suhelmi Faruq, S.P.',
      nip: '19740601 199903 1 015',
      jabatan_lengkap: 'Pejabat Pembuat Komitmen (Hanya dapat melihat Data_Primer)',
      wilayah_kerja: 1,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      role: 'bendahara',
      nama: 'Bendahara Test Wilayah 1',
      nip: '19800101 200501 1 001',
      jabatan_lengkap: 'Bendahara Pengeluaran',
      wilayah_kerja: 1,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Wilayah 2 (for anisa@gmail.com)
    {
      role: 'kpa',
      nama: 'KPA Wilayah 2',
      nip: '19700601 199903 1 014',
      jabatan_lengkap: 'Kepala Pusat Anggaran Wilayah 2',
      wilayah_kerja: 2,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      role: 'ppk',
      nama: 'PPK Wilayah 2',
      nip: '19750601 199903 1 016',
      jabatan_lengkap: 'Pejabat Pembuat Komitmen Wilayah 2',
      wilayah_kerja: 2,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      role: 'bendahara',
      nama: 'Bendahara Wilayah 2',
      nip: '19810101 200501 1 002',
      jabatan_lengkap: 'Bendahara Pengeluaran Wilayah 2',
      wilayah_kerja: 2,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      role: 'admin',
      nama: 'Ary Danar',
      nip: '19851029 201101 2 011',
      jabatan_lengkap: 'User Admin dengan Role Paling Tinggi',
      wilayah_kerja: 2,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Wilayah 3
    {
      role: 'operator',
      nama: 'Annisa Iftitah',
      nip: '19690227 199403 2 004',
      jabatan_lengkap: 'User Mengkompulir data (Hanya dapat menginput Data_Primer)',
      wilayah_kerja: 3,
      aktif: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const batch = db.batch();
  
  for (const item of data) {
    // Basic deduplication check by nama
    const exist = await db.collection('Master_Pejabat').where('nama', '==', item.nama).get();
    if (exist.empty) {
      const docRef = db.collection('Master_Pejabat').doc();
      batch.set(docRef, item);
      console.log('Prepared to add:', item.nama);
    } else {
      console.log('Already exists:', item.nama);
    }
  }

  await batch.commit();
  console.log('Seeding Master Pejabat complete.');
}

seed().catch(console.error).finally(() => process.exit(0));
