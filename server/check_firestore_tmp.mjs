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

async function checkWilayahKerja() {
  console.log('=== Querying Data_Primer for all wilayah_kerja ===\n');

  // Get all Data_Primer documents
  const dataPrimerSnap = await db.collection('Data_Primer').get();
  console.log(`Total Data_Primer documents: ${dataPrimerSnap.size}`);

  // Collect all distinct wilayah_kerja from Data_Primer
  const wilayahKerjaSet = new Set();
  dataPrimerSnap.forEach((doc) => {
    const data = doc.data();
    const wk = data.Wilayah_Kerja;
    if (wk !== undefined && wk !== null) {
      wilayahKerjaSet.add(Number(wk));
    }
  });

  const wilayahKerjaList = Array.from(wilayahKerjaSet).sort((a, b) => a - b);
  console.log(`Distinct wilayah_kerja in Data_Primer: ${wilayahKerjaList.length}`);
  console.log(`Wilayah kerja: ${wilayahKerjaList.join(', ')}\n`);

  // For each wilayah_kerja, check Master_Pejabat
  console.log('=== Checking Master_Pejabat completeness ===\n');

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
    const allPejabatSnap = await db.collection('Master_Pejabat')
      .where('wilayah_kerja', '==', wk)
      .get();

    const allPejabat = allPejabatSnap.docs.map(d => {
      const data = d.data();
      return { role: data.role, nama: data.nama, aktif: data.aktif };
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

    const status = isComplete ? 'LENGKAP' : 'BELUM LENGKAP';
    console.log(`Wilayah Kerja ${wk}: ${status}`);
    console.log(`  PPK (aktif): ${hasPPK ? ppkNama : 'BELUM ADA'}`);
    console.log(`  Bendahara (aktif): ${hasBendahara ? bendaharaNama : 'BELUM ADA'}`);
    if (allPejabat.length > 0) {
      console.log(`  Semua pejabat: ${allPejabat.map(p => `${p.role} (${p.nama}) ${p.aktif ? '[aktif]' : '[nonaktif]'}`).join(', ')}`);
    } else {
      console.log(`  Semua pejabat: TIDAK ADA SATUPUN`);
    }
    console.log();
  }

  // Summary
  console.log('=== RINGKASAN ===');
  const complete = results.filter(r => r.is_complete);
  const incomplete = results.filter(r => !r.is_complete);
  console.log(`Wilayah kerja LENGKAP (ada PPK + Bendahara aktif): ${complete.map(r => r.wilayah_kerja).join(', ')}`);
  console.log(`Wilayah kerja BELUM LENGKAP: ${incomplete.map(r => r.wilayah_kerja).join(', ')}`);
  console.log();

  // Also check if there are wilayah_kerja in Master_Pejabat that are NOT in Data_Primer
  const allMasterPejabatSnap = await db.collection('Master_Pejabat').get();
  const masterWilayahSet = new Set();
  allMasterPejabatSnap.forEach((doc) => {
    const data = doc.data();
    if (data.wilayah_kerja !== undefined && data.wilayah_kerja !== null) {
      masterWilayahSet.add(Number(data.wilayah_kerja));
    }
  });
  const masterWilayahList = Array.from(masterWilayahSet).sort((a, b) => a - b);
  console.log(`Distinct wilayah_kerja in Master_Pejabat: ${masterWilayahList.join(', ')}`);

  const onlyInMaster = masterWilayahList.filter(wk => !wilayahKerjaList.includes(wk));
  if (onlyInMaster.length > 0) {
    console.log(`Wilayah kerja hanya ada di Master_Pejabat (bukan di Data_Primer): ${onlyInMaster.join(', ')}`);
  } else {
    console.log('Semua wilayah_kerja di Master_Pejabat juga ada di Data_Primer');
  }

  process.exit(0);
}

checkWilayahKerja().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
