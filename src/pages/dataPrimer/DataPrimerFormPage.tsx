import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
// Removed: import { Timestamp } from 'firebase/firestore';
// Dates are now sent as ISO strings to avoid serialization mismatch with backend
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { toast } from '../../components/ui/Toast';
import { addDataPrimer, updateDataPrimer, getDataPrimer } from '../../services/dataPrimerService';
import { KODE_KOMODITAS, KATEGORI_DL, NAMA_PEGAWAI, KEGIATAN, TINGKAT_PERJALANAN, BULAN_ROMAWI } from '../../constants/masterData';
import { terbilang } from '../../utils/terbilang';
import { formatDateForInput } from '../../utils/dateHelpers';

export function DataPrimerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  const [form, setForm] = useState({
    No: 0,
    Tahun_Data: new Date().getFullYear(),
    Berangkat_dari: '',
    Tujuan: '',
    Pada_tanggal: '',
    Jabatan_Produsen: '',
    Nama_Produsen: '',
    NIP_Produsen: '',
    Nomor_SPT: '',
    No_Urut_SPPD: 0,
    Bulan_Kegiatan: '',
    Tahun_Kegiatan: '',
    Nama_Pegawai: '',
    Tingkat_Menurut_Peraturan: '',
    NIP_Pegawai: '',
    Pangkat_dan_Golongan: '',
    Jabatan_Pegawai: '',
    Maksud_Perjalanan_Dinas: '',
    Tanggal_Berangkat: '',
    Tanggal_Kembali: '',
    Kode_Kegiatan: '',
    Kategori_DL: '' as '' | 'Pendek' | 'Panjang',
    Jumlah_Uang: 0,
    Kegiatan: '' as '' | 'Sertifikasi' | 'Penilaian Produsen',
  });

  useEffect(() => {
    if (isEdit && userProfile) {
      fetchExistingData();
    }
  }, [id, userProfile]);

  const fetchExistingData = async () => {
    if (!userProfile || !id) return;
    try {
      const allData = await getDataPrimer(userProfile.wilayah_kerja);
      const existing = allData.find((d) => d.id === id);
      if (existing) {
        setForm({
          No: existing.No,
          Tahun_Data: existing.Tahun_Data,
          Berangkat_dari: existing.Berangkat_dari,
          Tujuan: existing.Tujuan,
          Pada_tanggal: formatDateForInput(existing.Pada_tanggal),
          Jabatan_Produsen: existing.Jabatan_Produsen,
          Nama_Produsen: existing.Nama_Produsen,
          NIP_Produsen: existing.NIP_Produsen || '',
          Nomor_SPT: existing.Nomor_SPT,
          No_Urut_SPPD: existing.No_Urut_SPPD,
          Bulan_Kegiatan: existing.Bulan_Kegiatan,
          Tahun_Kegiatan: existing.Tahun_Kegiatan,
          Nama_Pegawai: existing.Nama_Pegawai,
          Tingkat_Menurut_Peraturan: existing.Tingkat_Menurut_Peraturan,
          NIP_Pegawai: existing.NIP_Pegawai,
          Pangkat_dan_Golongan: existing.Pangkat_dan_Golongan,
          Jabatan_Pegawai: existing.Jabatan_Pegawai,
          Maksud_Perjalanan_Dinas: existing.Maksud_Perjalanan_Dinas,
          Tanggal_Berangkat: formatDateForInput(existing.Tanggal_Berangkat),
          Tanggal_Kembali: formatDateForInput(existing.Tanggal_Kembali),
          Kode_Kegiatan: existing.Kode_Kegiatan,
          Kategori_DL: existing.Kategori_DL,
          Jumlah_Uang: existing.Jumlah_Uang,
          Kegiatan: existing.Kegiatan,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast('error', 'Gagal memuat data');
    } finally {
      setFetching(false);
    }
  };

  const handlePegawaiChange = (nama: string) => {
    const pegawai = NAMA_PEGAWAI.find((p) => p.nama === nama);
    setForm((prev) => ({
      ...prev,
      Nama_Pegawai: nama,
      NIP_Pegawai: pegawai?.nip || '',
      Pangkat_dan_Golongan: pegawai?.golongan || '',
    }));
  };

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DataPrimerForm] handleSubmit, userProfile:', userProfile);
    if (!userProfile) {
      toast('error', 'Profil user belum dimuat. Silakan login ulang atau refresh halaman.');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        ...form,
        Wilayah_Kerja: userProfile.wilayah_kerja,
        NIP_Produsen: form.NIP_Produsen || null,
        Pada_tanggal: new Date(form.Pada_tanggal).toISOString(),
        Tanggal_Berangkat: new Date(form.Tanggal_Berangkat).toISOString(),
        Tanggal_Kembali: new Date(form.Tanggal_Kembali).toISOString(),
        Terbilang: terbilang(form.Jumlah_Uang),
        Kategori_DL: form.Kategori_DL as 'Pendek' | 'Panjang',
        Kegiatan: form.Kegiatan as 'Sertifikasi' | 'Penilaian Produsen',
      };

      if (isEdit && id) {
        await updateDataPrimer(id, dataToSave);
        toast('success', 'Data berhasil diperbarui');
      } else {
        await addDataPrimer(dataToSave);
        toast('success', 'Data berhasil ditambahkan');
      }
      navigate('/data-primer');
    } catch (error) {
      console.error('Error saving data:', error);
      toast('error', 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/data-primer')} icon={<ArrowLeft className="h-4 w-4" />}>
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Data Primer' : 'Tambah Data Primer'}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {isEdit ? 'Perbarui data perjalanan dinas' : 'Input data perjalanan dinas baru'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Informasi Umum */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Umum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor Urut"
              type="number"
              value={form.No}
              onChange={(e) => handleChange('No', parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="Tahun Data"
              type="number"
              value={form.Tahun_Data}
              onChange={(e) => handleChange('Tahun_Data', parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="Nomor SPT"
              type="text"
              placeholder="Masukkan Nomor SPT"
              value={form.Nomor_SPT}
              onChange={(e) => handleChange('Nomor_SPT', e.target.value)}
              required
            />
            <Input
              label="Nomor Urut SPPD"
              type="number"
              value={form.No_Urut_SPPD}
              onChange={(e) => handleChange('No_Urut_SPPD', parseInt(e.target.value) || 0)}
              required
            />
            <Select
              label="Bulan Kegiatan"
              placeholder="-- Pilih Bulan --"
              value={form.Bulan_Kegiatan}
              onChange={(e) => handleChange('Bulan_Kegiatan', e.target.value)}
              options={Object.entries(BULAN_ROMAWI).map(([num, romawi]) => ({
                value: romawi,
                label: `${romawi} (Bulan ${num})`,
              }))}
              required
            />
            <Input
              label="Tahun Kegiatan"
              type="text"
              placeholder="contoh: Perj./2026"
              value={form.Tahun_Kegiatan}
              onChange={(e) => handleChange('Tahun_Kegiatan', e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Data Pegawai */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Pegawai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Nama Pegawai"
              placeholder="-- Pilih Nama Pegawai --"
              value={form.Nama_Pegawai}
              onChange={(e) => handlePegawaiChange(e.target.value)}
              options={NAMA_PEGAWAI.map((p) => ({ value: p.nama, label: p.nama }))}
              required
            />
            <Input
              label="NIP Pegawai"
              type="text"
              value={form.NIP_Pegawai}
              readOnly
              helperText="Otomatis terisi dari pilihan pegawai"
            />
            <Input
              label="Pangkat & Golongan"
              type="text"
              value={form.Pangkat_dan_Golongan}
              readOnly
              helperText="Otomatis terisi dari pilihan pegawai"
            />
            <Input
              label="Jabatan Pegawai"
              type="text"
              placeholder="Masukkan jabatan pegawai"
              value={form.Jabatan_Pegawai}
              onChange={(e) => handleChange('Jabatan_Pegawai', e.target.value)}
              required
            />
            <Select
              label="Tingkat Menurut Peraturan"
              placeholder="-- Pilih Tingkat --"
              value={form.Tingkat_Menurut_Peraturan}
              onChange={(e) => handleChange('Tingkat_Menurut_Peraturan', e.target.value)}
              options={TINGKAT_PERJALANAN.map((t) => ({ value: t, label: `Tingkat ${t}` }))}
              required
            />
          </div>
        </Card>

        {/* Detail Perjalanan */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Perjalanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Berangkat Dari"
              type="text"
              placeholder="Kota asal keberangkatan"
              value={form.Berangkat_dari}
              onChange={(e) => handleChange('Berangkat_dari', e.target.value)}
              required
            />
            <Input
              label="Tujuan"
              type="text"
              placeholder="Instansi/produsen tujuan"
              value={form.Tujuan}
              onChange={(e) => handleChange('Tujuan', e.target.value)}
              required
            />
            <Input
              label="Pada Tanggal"
              type="date"
              value={form.Pada_tanggal}
              onChange={(e) => handleChange('Pada_tanggal', e.target.value)}
              required
            />
            <Input
              label="Maksud Perjalanan Dinas"
              type="text"
              placeholder="Uraian maksud perjalanan"
              value={form.Maksud_Perjalanan_Dinas}
              onChange={(e) => handleChange('Maksud_Perjalanan_Dinas', e.target.value)}
              required
            />
            <Input
              label="Tanggal Berangkat"
              type="date"
              value={form.Tanggal_Berangkat}
              onChange={(e) => handleChange('Tanggal_Berangkat', e.target.value)}
              required
            />
            <Input
              label="Tanggal Kembali"
              type="date"
              value={form.Tanggal_Kembali}
              onChange={(e) => handleChange('Tanggal_Kembali', e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Data Produsen */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Produsen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Produsen"
              type="text"
              placeholder="Nama penanggung jawab produsen"
              value={form.Nama_Produsen}
              onChange={(e) => handleChange('Nama_Produsen', e.target.value)}
              required
            />
            <Input
              label="Jabatan Produsen"
              type="text"
              placeholder="Jabatan penanggung jawab"
              value={form.Jabatan_Produsen}
              onChange={(e) => handleChange('Jabatan_Produsen', e.target.value)}
              required
            />
            <Input
              label="NIP Produsen"
              type="text"
              placeholder="Kosongkan jika non-PNS"
              value={form.NIP_Produsen}
              onChange={(e) => handleChange('NIP_Produsen', e.target.value)}
              helperText="Opsional, kosongkan jika non-PNS"
            />
          </div>
        </Card>

        {/* Biaya & Kegiatan */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Biaya & Kegiatan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Kode Kegiatan (Komoditas)"
              placeholder="-- Pilih Kode Komoditas --"
              value={form.Kode_Kegiatan}
              onChange={(e) => handleChange('Kode_Kegiatan', e.target.value)}
              options={KODE_KOMODITAS.map((k) => ({ value: k.kode, label: `${k.label} (${k.kode})` }))}
              required
            />
            <Select
              label="Kategori DL"
              placeholder="-- Pilih Kategori DL --"
              value={form.Kategori_DL}
              onChange={(e) => handleChange('Kategori_DL', e.target.value)}
              options={KATEGORI_DL.map((k) => ({ value: k.label, label: `${k.label} (${k.kodeAkun})` }))}
              required
            />
            <Select
              label="Kegiatan"
              placeholder="-- Pilih Kegiatan --"
              value={form.Kegiatan}
              onChange={(e) => handleChange('Kegiatan', e.target.value)}
              options={KEGIATAN.map((k) => ({ value: k, label: k }))}
              required
            />
            <Input
              label="Jumlah Uang (Rp)"
              type="number"
              placeholder="0"
              value={form.Jumlah_Uang}
              onChange={(e) => handleChange('Jumlah_Uang', parseInt(e.target.value) || 0)}
              required
            />
            <div className="md:col-span-2">
              <Input
                label="Terbilang"
                type="text"
                value={form.Jumlah_Uang > 0 ? terbilang(form.Jumlah_Uang) : ''}
                readOnly
                helperText="Otomatis digenerate dari Jumlah Uang"
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/data-primer')}>
            Batal
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon={<Save className="h-4 w-4" />}
            size="lg"
          >
            {isEdit ? 'Perbarui Data' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </div>
  );
}
