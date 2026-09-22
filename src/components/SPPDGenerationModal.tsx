import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import type { DataPrimer } from '../types';
import type { SPPDGenerationOptions, PengikutItem } from '../services/documentService';

interface SPPDGenerationModalProps {
  isOpen: boolean;
  data: DataPrimer | null;
  onClose: () => void;
  onGenerate: (options: SPPDGenerationOptions) => Promise<void>;
  loading: boolean;
}

export function SPPDGenerationModal({
  isOpen,
  data,
  onClose,
  onGenerate,
  loading,
}: SPPDGenerationModalProps) {
  const [instansi, setInstansi] = useState('');
  const [mataAnggaran, setMataAnggaran] = useState('');
  const [keteranganLain, setKeteranganLain] = useState('');
  const [pengikut, setPengikut] = useState<PengikutItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setInstansi('');
    setMataAnggaran('');
    setKeteranganLain('');
    setPengikut([]);
  }, [isOpen]);

  const canSubmit = Boolean(data) && !loading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!data || !canSubmit) return;

    await onGenerate({
      Instansi: instansi.trim(),
      Mata_Anggaran: mataAnggaran.trim(),
      Keterangan_Lain: keteranganLain.trim(),
      Pengikut: pengikut.map(p => ({
        Nama: p.Nama.trim(),
        Tanggal_Lahir: p.Tanggal_Lahir.trim(),
        Hubungan_Keluarga: p.Hubungan_Keluarga.trim(),
      })),
    });
  };

  const addPengikut = () => {
    setPengikut((current) => [
      ...current,
      { Nama: '', Tanggal_Lahir: '', Hubungan_Keluarga: '' },
    ]);
  };

  const removePengikut = (index: number) => {
    setPengikut((current) => current.filter((_, i) => i !== index));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Data Tambahan SPPD"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Informasi Tambahan (Opsional)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instansi"
              placeholder="Contoh: Dinas Pertanian"
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
            />
            <Input
              label="Mata Anggaran"
              placeholder="Mata Anggaran"
              value={mataAnggaran}
              onChange={(e) => setMataAnggaran(e.target.value)}
            />
            <Input
              label="Keterangan Lain-lain"
              placeholder="Keterangan tambahan"
              value={keteranganLain}
              onChange={(e) => setKeteranganLain(e.target.value)}
              className="sm:col-span-2"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Daftar Pengikut (Opsional)</h4>
            <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={addPengikut}>
              Tambah Pengikut
            </Button>
          </div>

          {pengikut.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                <thead className="bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Nama</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Tanggal Lahir/Umur</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Hubungan Keluarga/Keterangan</th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {pengikut.map((p, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Nama pengikut ${index + 1}`}
                          value={p.Nama}
                          onChange={(e) => setPengikut((curr) => curr.map((item, i) => (
                            i === index ? { ...item, Nama: e.target.value } : item
                          )))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Tanggal lahir pengikut ${index + 1}`}
                          value={p.Tanggal_Lahir}
                          onChange={(e) => setPengikut((curr) => curr.map((item, i) => (
                            i === index ? { ...item, Tanggal_Lahir: e.target.value } : item
                          )))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          aria-label={`Hubungan pengikut ${index + 1}`}
                          value={p.Hubungan_Keluarga}
                          onChange={(e) => setPengikut((curr) => curr.map((item, i) => (
                            i === index ? { ...item, Hubungan_Keluarga: e.target.value } : item
                          )))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removePengikut(index)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={`Hapus pengikut ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">Tidak ada pengikut.</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={loading} disabled={!canSubmit}>
            Generate dan Unduh
          </Button>
        </div>
      </form>
    </Modal>
  );
}
