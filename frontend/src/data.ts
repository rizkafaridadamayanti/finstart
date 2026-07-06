import { AkunBukuBesar, Klien, Proyek, Transaksi, Langganan, Piutang, Utang, Pegawai, Aset, Proyeksi } from './types';

// Format currency helper in Rupiah
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};
export const INITIAL_KLIEN: Klien[] = [{
  id: 'K-001',
  namaPerusahaan: 'Bank Mandiri Tbk',
  bidang: 'Perbankan & Finansial',
  lokasi: 'Jakarta Selatan',
  pic: 'Budi Santoso',
  email: 'budi.santoso@bankmandiri.co.id',
  telepon: '081122334455'
}, {
  id: 'K-002',
  namaPerusahaan: 'Telkomsel Indonesia',
  bidang: 'Telekomunikasi',
  lokasi: 'Jakarta Pusat',
  pic: 'Siti Aminah',
  email: 'siti.aminah@telkomsel.co.id',
  telepon: '081299887766'
}, {
  id: 'K-003',
  namaPerusahaan: 'Kementerian Keuangan RI',
  bidang: 'Pemerintahan',
  lokasi: 'Jakarta Pusat',
  pic: 'Irwan Yusuf',
  email: 'irwan.yusuf@kemenkeu.go.id',
  telepon: '081344556677'
}, {
  id: 'K-004',
  namaPerusahaan: 'Ruangguru',
  bidang: 'EdTech',
  lokasi: 'Jakarta Barat',
  pic: 'Clara Shinta',
  email: 'clara.shinta@ruangguru.com',
  telepon: '081922330044'
}];
export const INITIAL_PROYEK: Proyek[] = [{
  id: 'P-001',
  nama: 'Dashboard Data Analytics Enterprise',
  nilaiKontrak: 450000000,
  tipeTender: 'Tender Terbatas',
  status: 'Ongoing',
  tanggalMulai: '2026-04-10',
  tanggalSelesai: '2026-09-15',
  klienId: 'K-001',
  picKontak: 'Budi Santoso',
  catatan: 'Dashboard analytics untuk pelacakan transaksi nasabah real-time.',
  tim: [{
    nama: 'Ahmad Fauzi',
    jabatan: 'Senior AI Engineer',
    alokasiPersen: 50,
    estimasiBiaya: 45000000
  }, {
    nama: 'Siti Rahmawati',
    jabatan: 'Data Scientist',
    alokasiPersen: 80,
    estimasiBiaya: 58000000
  }]
}, {
  id: 'P-002',
  nama: 'Aplikasi Mobile MyTelkomsel Redesign',
  nilaiKontrak: 750000000,
  tipeTender: 'Tender Umum',
  status: 'Ongoing',
  tanggalMulai: '2026-05-15',
  tanggalSelesai: '2026-11-30',
  klienId: 'K-002',
  picKontak: 'Siti Aminah',
  catatan: 'Pengembangan frontend baru dengan optimasi performa backend.',
  tim: [{
    nama: 'Rian Hidayat',
    jabatan: 'Full-Stack Developer',
    alokasiPersen: 100,
    estimasiBiaya: 72000000
  }, {
    nama: 'Devi Lestari',
    jabatan: 'UI/UX Designer',
    alokasiPersen: 70,
    estimasiBiaya: 38500000
  }]
}, {
  id: 'P-003',
  nama: 'Sistem AI Chatbot Layanan Publik',
  nilaiKontrak: 320000000,
  tipeTender: 'Penunjukan Langsung',
  status: 'Planning',
  tanggalMulai: '2026-07-15',
  tanggalSelesai: '2026-10-15',
  klienId: 'K-003',
  picKontak: 'Irwan Yusuf',
  catatan: 'Chatbot AI respons cepat menggunakan model bahasa besar yang disesuaikan.',
  tim: [{
    nama: 'Ahmad Fauzi',
    jabatan: 'Senior AI Engineer',
    alokasiPersen: 50,
    estimasiBiaya: 45000000
  }]
}, {
  id: 'P-004',
  nama: 'Migrasi Multi-Cloud Infrastructure',
  nilaiKontrak: 600000000,
  tipeTender: 'Pengadaan Langsung',
  status: 'Completed',
  tanggalMulai: '2026-01-10',
  tanggalSelesai: '2026-06-20',
  klienId: 'K-004',
  picKontak: 'Clara Shinta',
  catatan: 'Migrasi database besar dari server lokal ke kombinasi AWS & Google Cloud.',
  tim: [{
    nama: 'Andi Wijaya',
    jabatan: 'DevOps Engineer',
    alokasiPersen: 100,
    estimasiBiaya: 81000000
  }]
}];
export const INITIAL_AKUN: AkunBukuBesar[] = [{
  id: 'A-1001',
  kode: '1001',
  nama: 'Kas & Bank Mandiri',
  tipe: 'Aset',
  saldo: 1450000000
}, {
  id: 'A-1002',
  kode: '1002',
  nama: 'Kas Kecil Kantor',
  tipe: 'Aset',
  saldo: 250000000
}, {
  id: 'A-1101',
  kode: '1101',
  nama: 'Piutang Proyek',
  tipe: 'Aset',
  saldo: 680000000
}, {
  id: 'A-1201',
  kode: '1201',
  nama: 'Lisensi Perangkat Lunak',
  tipe: 'Aset',
  saldo: 85000000
}, {
  id: 'A-1301',
  kode: '1301',
  nama: 'Aset Peralatan IT',
  tipe: 'Aset',
  saldo: 340000000
}, {
  id: 'A-2001',
  kode: '2001',
  nama: 'Utang Vendor Cloud',
  tipe: 'Kewajiban',
  saldo: 120000000
}, {
  id: 'A-2101',
  kode: '2101',
  nama: 'Utang Pajak PPN',
  tipe: 'Kewajiban',
  saldo: 45000000
}, {
  id: 'A-3001',
  kode: '3001',
  nama: 'Modal Saham Pendiri',
  tipe: 'Modal',
  saldo: 2000000000
}, {
  id: 'A-4001',
  kode: '4001',
  nama: 'Pendapatan Proyek AI',
  tipe: 'Pendapatan',
  saldo: 950000000
}, {
  id: 'A-4002',
  kode: '4002',
  nama: 'Pendapatan Lisensi & SaaS',
  tipe: 'Pendapatan',
  saldo: 350000000
}, {
  id: 'A-5001',
  kode: '5001',
  nama: 'Beban Gaji & SDM',
  tipe: 'Beban',
  saldo: 420000000
}, {
  id: 'A-5002',
  kode: '5002',
  nama: 'Beban Sewa Cloud Server',
  tipe: 'Beban',
  saldo: 135000000
}, {
  id: 'A-5003',
  kode: '5003',
  nama: 'Beban Listrik & Internet',
  tipe: 'Beban',
  saldo: 15000000
}];
export const INITIAL_TRANSAKSI: Transaksi[] = [{
  id: 'TX-001',
  tanggal: '2026-06-15',
  refVoucher: 'RV-20260601',
  keterangan: 'Penerimaan Pembayaran DP Proyek Chatbot Kemenkeu',
  nominal: 250000000,
  debitAkun: '1001',
  kreditAkun: '4001'
}, {
  id: 'TX-002',
  tanggal: '2026-06-25',
  refVoucher: 'RV-20260602',
  keterangan: 'Pembayaran Gaji Karyawan Kedata Periode Juni 2026',
  nominal: 140000000,
  debitAkun: '5001',
  kreditAkun: '1001'
}, {
  id: 'TX-003',
  tanggal: '2026-06-28',
  refVoucher: 'RV-20260603',
  keterangan: 'Pembayaran Tagihan AWS Cloud Server Bulanan',
  nominal: 45000000,
  debitAkun: '5002',
  kreditAkun: '1001'
}, {
  id: 'TX-004',
  tanggal: '2026-06-29',
  refVoucher: 'RV-20260604',
  keterangan: 'Penerimaan Pelunasan Termin 1 Proyek Bank Mandiri',
  nominal: 300000000,
  debitAkun: '1001',
  kreditAkun: '1101'
}];
export const INITIAL_LANGGANAN: Langganan[] = [{
  id: 'L-001',
  nama: 'Amazon Web Services (AWS)',
  provider: 'Amazon Web Services Inc.',
  mataUang: 'USD',
  siklus: 'Bulanan',
  kategori: 'Infrastruktur',
  biaya: 1500,
  biayaIDR: 24600000,
  tanggalTagihan: '2026-07-05'
}, {
  id: 'L-002',
  nama: 'Google Workspace Enterprise',
  provider: 'Google Cloud Indonesia',
  mataUang: 'IDR',
  siklus: 'Bulanan',
  kategori: 'Software',
  biaya: 4800000,
  biayaIDR: 4800000,
  tanggalTagihan: '2026-07-12'
}, {
  id: 'L-003',
  nama: 'GitHub Enterprise Suite',
  provider: 'GitHub Inc.',
  mataUang: 'USD',
  siklus: 'Tahunan',
  kategori: 'Software',
  biaya: 300,
  biayaIDR: 4920000,
  tanggalTagihan: '2026-11-20'
}, {
  id: 'L-004',
  nama: 'OpenAI API Premium Access',
  provider: 'OpenAI Technologies',
  mataUang: 'USD',
  siklus: 'Bulanan',
  kategori: 'Infrastruktur',
  biaya: 800,
  biayaIDR: 13120000,
  tanggalTagihan: '2026-07-08'
}, {
  id: 'L-005',
  nama: 'HubSpot CRM Professional',
  provider: 'HubSpot Software',
  mataUang: 'USD',
  siklus: 'Bulanan',
  kategori: 'Software',
  biaya: 450,
  biayaIDR: 7380000,
  tanggalTagihan: '2026-07-15'
}];
export const INITIAL_PIUTANG: Piutang[] = [{
  id: 'PT-001',
  invoiceNo: 'INV/2026/06-01',
  klien: 'Bank Mandiri Tbk',
  proyek: 'Dashboard Data Analytics Enterprise',
  nominal: 180000000,
  tanggalInvoice: '2026-06-10',
  jatuhTempo: '2026-07-10',
  status: 'Belum Bayar',
  catatan: 'Termin II (pencapaian milestone UI/UX & Mockup disetujui)'
}, {
  id: 'PT-002',
  invoiceNo: 'INV/2026/05-03',
  klien: 'Telkomsel Indonesia',
  proyek: 'Aplikasi Mobile MyTelkomsel Redesign',
  nominal: 350000000,
  tanggalInvoice: '2026-05-15',
  jatuhTempo: '2026-06-15',
  status: 'Overdue',
  catatan: 'Termin I (DP 50% setelah penandatanganan kontrak proyek)'
}, {
  id: 'PT-003',
  invoiceNo: 'INV/2026/06-02',
  klien: 'Ruangguru',
  proyek: 'Migrasi Multi-Cloud Infrastructure',
  nominal: 150000000,
  tanggalInvoice: '2026-06-20',
  jatuhTempo: '2026-07-20',
  status: 'Lunas',
  catatan: 'Pelunasan 100% setelah serah terima pekerjaan selesai.'
}];
export const INITIAL_UTANG: Utang[] = [{
  id: 'UT-001',
  vendor: 'PT Datacenter Indonesia',
  proyek: 'Migrasi Multi-Cloud Infrastructure',
  invoiceNo: 'DC-992120',
  tanggalTagihan: '2026-06-18',
  batasBayar: '2026-07-18',
  nominal: 65000000,
  status: 'Belum Bayar',
  catatan: 'Sewa colocation datacenter rack periode 6 bulan depan.',
  historiBayar: []
}, {
  id: 'UT-002',
  vendor: 'AWS Inc. Billing',
  proyek: 'Sistem AI Chatbot Layanan Publik',
  invoiceNo: 'AWS-202606',
  tanggalTagihan: '2026-06-05',
  batasBayar: '2026-07-05',
  nominal: 40000000,
  status: 'Belum Bayar',
  catatan: 'Pemakaian compute nodes GPU untuk training model lokal.',
  historiBayar: []
}, {
  id: 'UT-003',
  vendor: 'PT Synnex Metrodata',
  proyek: 'Aset Peralatan IT',
  invoiceNo: 'SM-811029',
  tanggalTagihan: '2026-06-12',
  batasBayar: '2026-07-12',
  nominal: 15000000,
  status: 'Lunas',
  catatan: 'Pembelian Router Cisco Catalyst internal kantor.',
  historiBayar: [{
    tanggal: '2026-06-20',
    buktiBayar: 'B-8801292',
    kasSumber: 'Kas & Bank Mandiri',
    nominal: 15000000,
    catatan: 'Lunas transfer bank.'
  }]
}];
export const INITIAL_PROYEKSI: Proyeksi[] = [{
  id: 'PR-001',
  akunId: '4001',
  targetNilai: 1200000000,
  bulan: 7,
  catatan: 'Target pelunasan proyek AI Chatbot'
}, {
  id: 'PR-002',
  akunId: '4001',
  targetNilai: 1500000000,
  bulan: 8,
  catatan: 'Target penandatanganan kontrak Bank baru'
}, {
  id: 'PR-003',
  akunId: '4002',
  targetNilai: 400000000,
  bulan: 9,
  catatan: 'SaaS recurring revenue expansion'
}, {
  id: 'PR-004',
  akunId: '5001',
  targetNilai: 450000000,
  bulan: 10,
  catatan: 'Penyediaan bonus tim kuartal III'
}];
export const INITIAL_PEGAWAI: Pegawai[] = [{
  id: 'E-001',
  nama: 'Ahmad Fauzi',
  jabatan: 'Senior AI Engineer',
  status: 'Tetap',
  gajiBersih: 18500000,
  compliance: 'Patuh'
}, {
  id: 'E-002',
  nama: 'Siti Rahmawati',
  jabatan: 'Data Scientist',
  status: 'Tetap',
  gajiBersih: 14500000,
  compliance: 'Patuh'
}, {
  id: 'E-003',
  nama: 'Rian Hidayat',
  jabatan: 'Full-Stack Developer',
  status: 'Kontrak',
  gajiBersih: 12000000,
  compliance: 'Patuh'
}, {
  id: 'E-004',
  nama: 'Devi Lestari',
  jabatan: 'UI/UX Designer',
  status: 'Tetap',
  gajiBersih: 11000000,
  compliance: 'Patuh'
}, {
  id: 'E-005',
  nama: 'Andi Wijaya',
  jabatan: 'DevOps Engineer',
  status: 'Kontrak',
  gajiBersih: 13500000,
  compliance: 'Tinjauan'
}];
export const INITIAL_ASET: Aset[] = [{
  id: 'AS-001',
  nama: 'Laptop ASUS ROG Zephyrus G14 (Developer Laptop)',
  kategori: 'Peralatan IT',
  tanggalPerolehan: '2025-03-10',
  hargaPerolehan: 32000000,
  akumulasiPenyusutan: 8000000,
  nilaiBuku: 24000000
}, {
  id: 'AS-002',
  nama: 'Macbook Pro M3 Max 16" (UI/UX Designer)',
  kategori: 'Peralatan IT',
  tanggalPerolehan: '2025-06-12',
  hargaPerolehan: 48000000,
  akumulasiPenyusutan: 12000000,
  nilaiBuku: 36000000
}, {
  id: 'AS-003',
  nama: 'Server Cloud AWS EC2 (Dedicated Node Instance)',
  kategori: 'Lisensi Perangkat Lunak',
  tanggalPerolehan: '2024-01-15',
  hargaPerolehan: 120000000,
  akumulasiPenyusutan: 40000000,
  nilaiBuku: 80000000
}, {
  id: 'AS-004',
  nama: 'Router Cisco Catalyst C1000 (Internal Office Network)',
  kategori: 'Peralatan Kantor',
  tanggalPerolehan: '2026-06-12',
  hargaPerolehan: 15000000,
  akumulasiPenyusutan: 0,
  nilaiBuku: 15000000
}, {
  id: 'AS-005',
  nama: 'Kamera Sony Alpha 7 IV (Corporate Media Production)',
  kategori: 'Peralatan IT',
  tanggalPerolehan: '2025-01-20',
  hargaPerolehan: 35000000,
  akumulasiPenyusutan: 7000000,
  nilaiBuku: 28000000
}, {
  id: 'AS-006',
  nama: 'Monitor Dell UltraSharp 32" Premier',
  kategori: 'Peralatan Kantor',
  tanggalPerolehan: '2025-08-05',
  hargaPerolehan: 12000000,
  akumulasiPenyusutan: 24000000,
  nilaiBuku: 9600000
}];