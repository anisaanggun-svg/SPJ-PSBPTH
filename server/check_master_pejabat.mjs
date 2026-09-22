import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin with the server's service account key
const credentialsPath = resolve('/Users/macintoshhd/.gemini/antigravity/scratch/PSBTPH-SPPF/server/src/serviceAccountKey.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(credentials),
  projectId: 'sppd-psbtph',
});

const db = admin.firestore();

async function main() {
  console.log('========================================');
  console.log('  MASTER PEJABAT - FIRESTORE DATA CHECK');
  console.log('========================================\n');

  // ============================================================
  // 1. Show structure of a complete Master_Pejabat document
  // ============================================================
  console.log('=== 1. STRUKTUR DOKUMEN Master_Pejabat (contoh data lengkap) ===\n');

  const allPejabatSnap = await db.collection('Master_Pejabat').get();
  console.log(`Total dokumen di Master_Pejabat: ${allPejabatSnap.size}\n`);

  // Find a document with the most complete fields
  let mostCompleteDoc = null;
  let mostCompleteFields = 0;

  allPejabatSnap.forEach((doc) => {
    const data = doc.data();
    const fieldCount = Object.keys(data).length;
    if (fieldCount > mostCompleteFields) {
      mostCompleteFields = fieldCount;
      mostCompleteDoc = { id: doc.id, ...data };
    }
  });

  if (mostCompleteDoc) {
    console.log('Contoh dokumen Master_Pejabat yang paling lengkap:');
    console.log(`  Document ID: ${mostCompleteDoc.id}`);
    console.log('  Fields:');
    for (const [key, value] of Object.entries(mostCompleteDoc)) {
      if (key === 'id') continue;
      let displayValue = value;
      if (value instanceof admin.firestore.Timestamp) {
        displayValue = value.toDate().toISOString();
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      }
      console.log(`    ${key}: ${displayValue}`);
    }
    console.log();

    // Also show all distinct field names across all documents
    const allFields = new Set();
    allPejabatSnap.forEach((doc) => {
      Object.keys(doc.data()).forEach((f) => allFields.add(f));
    });
    console.log('Semua field yang pernah muncul di koleksi Master_Pejabat:');
    console.log(`  ${Array.from(allFields).sort().join(', ')}\n`);
  } else {
    console.log('Tidak ada dokumen di Master_Pejabat.\n');
  }

  // ============================================================
  // 2. List all wilayah_kerja from Data_Primer
  // ============================================================
  console.log('=== 2. DAFTAR WILAYAH KERJA dari Data_Primer ===\n');

  const dataPrimerSnap = await db.collection('Data_Primer').get();
  console.log(`Total dokumen di Data_Primer: ${dataPrimerSnap.size}`);

  const wilayahKerjaSet = new Set();
  dataPrimerSnap.forEach((doc) => {
    const data = doc.data();
    const wk = data.Wilayah_Kerja;
    if (wk !== undefined && wk !== null) {
      wilayahKerjaSet.add(Number(wk));
    }
  });

  const wilayahKerjaList = Array.from(wilayahKerjaSet).sort((a, b) => a - b);
  console.log(`Distinct wilayah_kerja: ${wilayahKerjaList.length}`);
  console.log(`Daftar: ${wilayahKerjaList.join(', ')}\n`);

  // ============================================================
  // 3. For each wilayah_kerja, check PPK and Bendahara
  // ============================================================
  console.log('=== 3. CEK KOMPLETENSI PPK & BENDAHARA PER WILAYAH KERJA ===\n');

  const results = [];

  for (const wk of wilayahKerjaList) {
    // Check for PPK (active)
    const ppkSnap = await db.collection('Master_Pejabat')
      .where('role', '==', 'ppk')
      .where('wilayah_kerja', '==', wk)
      .where('aktif', '==', true)
      .get();

    // Check for Bendahara (active)
    const bendaharaSnap = await db.collection('Master_Pejabat')
      .where('role', '==', 'bendahara')
      .where('wilayah_kerja', '==', wk)
      .where('aktif', '==', true)
      .get();

    // Also check all pejabat (including inactive) for this wilayah
    const allPejabatForWkSnap = await db.collection('Master_Pejabat')
      .where('wilayah_kerja', '==', wk)
      .get();

    const allPejabat = allPejabatForWkSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        role: data.role,
        nama: data.nama,
        nip: data.nip,
        jabatan_lengkap: data.jabatan_lengkap,
        aktif: data.aktif,
      };
    });

    const hasPPK = !ppkSnap.empty;
    const hasBendahara = !bendaharaSnap.empty;
    const isComplete = hasPPK && hasBendahara;

    const ppkNama = ppkSnap.empty ? '-' : ppkSnap.docs[0].data().nama;
    const bendaharaNama = bendaharaSnap.empty ? '-' : bendaharaSnap.docs[0].data().nama;

    results.push({
      wilayah_kerja: wk,
      has_ppk: hasPPK,
      has_bendahara: hasBendahara,
      is_complete: isComplete,
      ppk_nama: ppkNama,
      bendahara_nama: bendaharaNama,
      all_pejabat: allPejabat,
    });

    console.log(`Wilayah Kerja ${wk}:`);
    console.log(`  PPK (aktif): ${hasPPK ? ppkNama : 'BELUM ADA'}`);
    console.log(`  Bendahara (aktif): ${hasBendahara ? bendaharaNama : 'BELUM ADA'}`);
    if (allPejabat.length > 0) {
      console.log(`  Semua pejabat:`);
      allPejabat.forEach(p => {
        console.log(`    - [${p.role}] ${p.nama} (NIP: ${p.nip || '-'}) - ${p.aktif ? 'AKTIF' : 'NONAKTIF'}`);
      });
    } else {
      console.log(`  Semua pejabat: TIDAK ADA SATUPUN`);
    }
    console.log();
  }

  // ============================================================
  // 4. Summary table
  // ============================================================
  console.log('=== 4. RINGKASAN (TABEL) ===\n');

  console.log('| Wilayah Kerja | Status PPK | Status Bendahara | Keterangan |');
  console.log('|---------------|------------|------------------|------------|');

  results.forEach(r => {
    const ppkStatus = r.has_ppk ? 'ADA' : 'BELUM ADA';
    const bendaharaStatus = r.has_bendahara ? 'ADA' : 'BELUM ADA';
    const keterangan = r.is_complete ? 'LENGKAP' : 'BELUM LENGKAP';
    console.log(`| ${r.wilayah_kerja} | ${ppkStatus} | ${bendaharaStatus} | ${keterangan} |`);
  });

  console.log();

  // Also check wilayah_kerja in Master_Pejabat that are NOT in Data_Primer
  const masterWilayahSet = new Set();
  allPejabatSnap.forEach((doc) => {
    const data = doc.data();
    if (data.wilayah_kerja !== undefined && data.wilayah_kerja !== null) {
      masterWilayahSet.add(Number(data.wilayah_kerja));
    }
  });
  const masterWilayahList = Array.from(masterWilayahSet).sort((a, b) => a - b);
  console.log(`Distinct wilayah_kerja di Master_Pejabat: ${masterWilayahList.join(', ')}`);

  const onlyInMaster = masterWilayahList.filter(wk => !wilayahKerjaList.includes(wk));
  if (onlyInMaster.length > 0) {
    console.log(`Wilayah kerja hanya ada di Master_Pejabat (bukan di Data_Primer): ${onlyInMaster.join(', ')}`);
  } else {
    console.log('Semua wilayah_kerja di Master_Pejabat juga ada di Data_Primer');
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
