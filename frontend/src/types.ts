export type TipeAkun = "Aset" | "Kewajiban" | "Modal" | "Pendapatan" | "Beban";
export interface AkunBukuBesar {
  id: string;
  kode: string;
  nama: string;
  tipe: TipeAkun;
  saldo: number;
}
export interface Klien {
  id: string;
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
export interface Piutang {
  id: string;
  invoiceNo: string;
  klien: string;
  proyek: string;
  nominal: number;
  tanggalInvoice: string;
  jatuhTempo: string;
  status: "Belum Bayar" | "Lunas" | "Overdue";
  catatan?: string;
}
export interface Utang {
  id: string;
  vendor: string;
  proyek: string;
  invoiceNo: string;
  tanggalTagihan: string;
  batasBayar: string;
  nominal: number;
  status: "Belum Bayar" | "Lunas" | "Overdue";
  catatan?: string;
  historiBayar?: {
    tanggal: string;
    buktiBayar: string;
    kasSumber: string;
    nominal: number;
    catatan?: string;
  }[];
}
export interface Proyeksi {
  id: string;
  akunId: string; // Kode Akun
  targetNilai: number;
  bulan: number; // 1 - 12 (Jan - Dec)
  catatan?: string;
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
export interface Aset {
  id: string;
  nama: string;
  kategori: string;
  tanggalPerolehan: string;
  hargaPerolehan: number;
  akumulasiPenyusutan: number;
  nilaiBuku: number;
}
