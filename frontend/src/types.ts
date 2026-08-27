export type TipeAkun = "Aset" | "Kewajiban" | "Modal" | "Pendapatan" | "Beban";
export const SUB_INDUK_AKUN_OPTIONS: Record<TipeAkun, string[]> = {
  Aset: [
    "Kas",
    "Bank",
    "Piutang",
    "Biaya Dibayar Dimuka",
    "Pajak Dibayar Dimuka",
    "Cadangan Kerugian Piutang",
    "Aset Tetap",
    "Akumulasi Penyusutan Aset Tetap",
  ],
  Kewajiban: ["Utang Lancar", "Utang Biaya", "Utang Pajak", "Utang Jangka Panjang"],
  Modal: ["Modal", "Laba Rugi Ditahan"],
  Pendapatan: ["Penjualan", "Pendapatan Lainnya", "Retur Penjualan", "Diskon Penjualan"],
  Beban: ["Biaya Operasional", "Biaya Pokok Penjualan", "Biaya Lainnya"],
};
export interface AkunBukuBesar {
  id: string;
  kode: string;
  nama: string;
  tipe: TipeAkun;
  subInduk?: string;
  saldo: number;
  status?: string;
}
export interface Klien {
  id: string;
  kode: string;
  namaPerusahaan: string;
  bidang: string;
  lokasi: string;
  pic: string;
  email: string;
  telepon: string;
  status?: "active" | "inactive" | string;
}
export interface AnggotaTim {
  employeeId?: string;
  nama: string;
  jabatan: string;
  alokasiPersen: number;
  estimasiBiaya: number;
}
interface MilestoneProyek {
  title: string;
  due_date?: string | null;
  status?: "planned" | "in_progress" | "completed" | "cancelled";
}
export interface Proyek {
  id: string;
  nama: string;
  nilaiKontrak: number;
  tipeTender:
    | "Tender Umum"
    | "Tender Terbatas"
    | "Penunjukan Langsung"
    | "Pengadaan Langsung";
  status: "Planning" | "Ongoing" | "Completed" | "Cancelled";
  statusSebelumDibatalkan?: "Planning" | "Ongoing" | "Completed" | null;
  tanggalMulai: string;
  tanggalSelesai: string;
  klienId: string;
  picKontak: string;
  catatan: string;
  tim: AnggotaTim[];
  anggaran?: number;
  milestones?: MilestoneProyek[];
  realisasiPendapatan?: number;
  realisasiBiaya?: number;
  selisihAnggaran?: number;
  labaAktual?: number;
  proyeksiLaba?: number;
}
export interface Transaksi {
  id: string;
  tanggal: string;
  refVoucher: string;
  keterangan: string;
  nominal: number;
  debitAkun: string; // Kode Akun
  kreditAkun: string; // Kode Akun
  isDraft?: boolean;
  status?: string;
  journal_id?: number | null;
  journal_status?: string | null;
  approved_at?: string | null;
  source_type?: string | null;
  source_status?: string | null;
  source_number?: string | null;
  party_name?: string | null;
}
export interface Langganan {
  id: string;
  nama: string;
  provider: string;
  mataUang: "IDR" | "USD" | "EUR" | "SGD" | "JPY" | "AUD" | "GBP";
  siklus: "Bulanan" | "Tahunan";
  kategori: "Infrastruktur" | "Software" | "Marketing";
  biaya: number; // in original currency or IDR
  biayaIDR: number;
  tanggalTagihan: string;
  status?: string;
  latestBillId?: string;
  latestBillNumber?: string;
  latestBillDate?: string;
  latestBillDueDate?: string;
  latestBillStatus?: string;
  latestBillTotalAmount?: number;
  latestBillPaidAmount?: number;
  latestBillOutstandingAmount?: number;
  generatedBillCount?: number;
  paidBillCount?: number;
  openBillCount?: number;
  draftBillCount?: number;
  overdueBillCount?: number;
  paidJournalCount?: number;
  latestJournalId?: number | null;
  _raw?: any;
}
export interface Pegawai {
  id: string;
  dbId?: number;
  nama: string;
  jabatan: string;
  status: string;
  statusAktif?: "Aktif" | "Nonaktif";
  gajiBersih: number;
  compliance: "Patuh" | "Tinjauan";
  _raw?: Record<string, any>;
}
