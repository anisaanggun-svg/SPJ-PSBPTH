import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { formatRupiah } from '../utils/formatCurrency';
import type { DataPrimer } from '../types';
import type { RincianBiayaGenerationOptions, RincianBiayaItem } from '../services/documentService';

interface DraftItem {
  no: number;
  uraian: string;
  jumlah: string;
  keterangan: string;
}

interface RincianBiayaGenerationModalProps {
  isOpen: boolean;
  data: DataPrimer | null;
  onClose: () => void;
  onGenerate: (options: RincianBiayaGenerationOptions) => Promise<void>;
  loading: boolean;
}

const createDraftItems = (jumlah: number): DraftItem[] => [
  {
    no: 1,
    uraian: 'Biaya Perjalanan Dinas',
    jumlah: String(jumlah),
    keterangan: '',
  },
];

const toNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function RincianBiayaGenerationModal({
  isOpen,
  data,
  onClose,
  onGenerate,
  loading,
}: RincianBiayaGenerationModalProps) {
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [yangTelahDibayarSemula, setYangTelahDibayarSemula] = useState('');
  const [sisaTelahDibayarSemula, setSisaTelahDibayarSemula] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setDraftItems(createDraftItems(data?.Jumlah_Uang ?? 0));
    setYangTelahDibayarSemula('');
    setSisaTelahDibayarSemula('');
  }, [isOpen, data?.Jumlah_Uang]);

  const total = draftItems.reduce((sum, item) => sum + toNumber(item.jumlah), 0);
  const yangDibayar = toNumber(yangTelahDibayarSemula);
  const sisaDibayar = toNumber(sisaTelahDibayarSemula);
  const sisaKurangLebih = total - (yangDibayar + sisaDibayar);
  const canSubmit = Boolean(data)
    && draftItems.length > 0
    && draftItems.every((item) => item.uraian.trim().length > 0 && toNumber(item.jumlah) >= 0)
    && !loading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!data || !canSubmit) return;

    const items: RincianBiayaItem[] = draftItems.map((item) => ({
      no: item.no,
      uraian: item.uraian.trim(),
      jumlah: toNumber(item.jumlah),
      keterangan: item.keterangan.trim(),
    }));

    await onGenerate({
      items,
      yangTelahDibayarSemula: yangDibayar,
      sisaTelahDibayarSemula: sisaDibayar,
    });
  };

  const addDraftItem = () => {
    setDraftItems((currentItems) => [
      ...currentItems,
      {
        no: currentItems.length + 1,
        uraian: '',
        jumlah: '0',
        keterangan: '',
      },
    ]);
  };

  const removeDraftItem = (index: number) => {
    setDraftItems((currentItems) => currentItems
      .filter((_, currentIndex) => currentIndex !== index)
      .map((item, currentIndex) => ({ ...item, no: currentIndex + 1 })));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Rincian Biaya Perjalanan Dinas"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Pembayaran</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Yang Telah Dibayar Semula"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={yangTelahDibayarSemula}
              onChange={(event) => setYangTelahDibayarSemula(event.target.value)}
            />
            <Input
              label="Sisa Telah Dibayar Semula"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={sisaTelahDibayarSemula}
              onChange={(event) => setSisaTelahDibayarSemula(event.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Rincian Biaya</h4>
            <Button type="button" variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={addDraftItem}>
              Tambah
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
              <thead className="bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">NO</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">RINCIAN BIAYA</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">JUMLAH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">KETERANGAN</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {draftItems.map((item, index) => (
                  <tr key={item.no}>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{item.no}</td>
                    <td className="px-3 py-2">
                      <Input
                        aria-label={`Rincian biaya baris ${item.no}`}
                        value={item.uraian}
                        onChange={(event) => setDraftItems((currentItems) => currentItems.map((currentItem, currentIndex) => (
                          currentIndex === index ? { ...currentItem, uraian: event.target.value } : currentItem
                        )))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        aria-label={`Jumlah baris ${item.no}`}
                        type="number"
                        min="0"
                        step="1"
                        value={item.jumlah}
                        onChange={(event) => setDraftItems((currentItems) => currentItems.map((currentItem, currentIndex) => (
                          currentIndex === index ? { ...currentItem, jumlah: event.target.value } : currentItem
                        )))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        aria-label={`Keterangan baris ${item.no}`}
                        value={item.keterangan}
                        onChange={(event) => setDraftItems((currentItems) => currentItems.map((currentItem, currentIndex) => (
                          currentIndex === index ? { ...currentItem, keterangan: event.target.value } : currentItem
                        )))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeDraftItem(index)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label={`Hapus baris ${item.no}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-gray-50 dark:bg-white/5 p-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Jumlah Total</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatRupiah(total)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Sisa Kurang/Lebih</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatRupiah(sisaKurangLebih)}</div>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Nilai yang dimasukkan akan dikirim tanpa prefix <span className="font-mono">Rp</span> ke template.
          </div>
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
