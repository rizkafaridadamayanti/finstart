<script lang="tsx">
import { Fragment, computed, defineComponent, h, ref } from "vue";
import { Search, Plus, BookOpen, ArrowLeftRight, Check, Trash2, Pencil, Filter, Calculator, AlertCircle, RefreshCw, FileCheck, Download, Calendar, Send, ShieldCheck, CircleCheck, Eye } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { AkunBukuBesar, Transaksi, TipeAkun } from '../types.ts';
import ConfirmDialog from './common/ConfirmDialog.vue';
import { TablePagination, latestFirst, pageRows, safePage } from '../utils/tablePagination.tsx';
interface BukuBesarDanTransaksiProps {
  activeSection: 'bukubesar' | 'transaksi';
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  divisions?: any[];
  onAddAkun: (newA: AkunBukuBesar) => Promise<void> | void;
  onUpdateAkun?: (account: any, data: any) => Promise<void> | void;
  onDeleteAkun?: (account: any) => Promise<void> | void;
  onAddTransaksi: (newT: any) => void;
  onApproveJournal?: (journal: any) => void;
  onPostJournal?: (journal: any) => void;
  userRole?: string;
  showToast: (msg: string) => void;
}
export default defineComponent({
  name: "BukuBesarDanTransaksi",
  props: ["activeSection", "akun", "transaksi", "divisions", "onAddAkun", "onUpdateAkun", "onDeleteAkun", "onAddTransaksi", "onApproveJournal", "onPostJournal", "userRole", "showToast"],
  setup(props) {
    const {
      activeSection,
      akun,
      transaksi,
      divisions = [],
      onAddAkun,
      onUpdateAkun,
      onDeleteAkun,
      onAddTransaksi,
      onApproveJournal,
      onPostJournal,
      userRole,
      showToast
    }: BukuBesarDanTransaksiProps = props;
    const activeTab = computed(() => props.activeSection === 'bukubesar' ? 'ledger' : 'journal');
    // Search and Filters
    const ledgerSearch = ref(''),
      setLedgerSearch = next => ledgerSearch.value = typeof next === "function" ? next(ledgerSearch.value) : next;
    const journalSearch = ref(''),
      setJournalSearch = next => journalSearch.value = typeof next === "function" ? next(journalSearch.value) : next;
    const journalDate = ref(''),
      setJournalDate = next => journalDate.value = typeof next === "function" ? next(journalDate.value) : next; // Add Account Form State
    const ledgerPage = ref(1);
    const journalPage = ref(1);
    const isAccountModalOpen = ref(false),
      setIsAccountModalOpen = next => isAccountModalOpen.value = typeof next === "function" ? next(isAccountModalOpen.value) : next;
    const deleteConfirm = ref<any>(null);
    const selectedAccountDetail = ref<any>(null);
    const newAccount = ref({
        kode: '',
        nama: '',
        tipe: 'Aset' as TipeAkun,
        saldo: 0,
        status: 'active',
        parentId: ''
      }),
      setNewAccount = next => newAccount.value = typeof next === "function" ? next(newAccount.value) : next;
    const editingAccount = ref<any>(null); // Add Journal Entry Form State
    const isJournalModalOpen = ref(false),
      setIsJournalModalOpen = next => isJournalModalOpen.value = typeof next === "function" ? next(isJournalModalOpen.value) : next;
    const voucherNo = ref(`RV-${new Date().getFullYear()}${transaksi.length + 101}`),
      setVoucherNo = next => voucherNo.value = typeof next === "function" ? next(voucherNo.value) : next;
    const journalDateInput = ref(new Date().toISOString().split('T')[0]),
      setJournalDateInput = next => journalDateInput.value = typeof next === "function" ? next(journalDateInput.value) : next;
    const journalDivisionId = ref(''),
      setJournalDivisionId = next => journalDivisionId.value = typeof next === "function" ? next(journalDivisionId.value) : next;
    const memo = ref(''),
      setMemo = next => memo.value = typeof next === "function" ? next(memo.value) : next;
    const selectedTemplate = ref('Umum'),
      setSelectedTemplate = next => selectedTemplate.value = typeof next === "function" ? next(selectedTemplate.value) : next; // Multi-row Debit & Credit lines
    const debitLines = ref([{
        kode: '1001',
        nominal: 0
      }]),
      setDebitLines = next => debitLines.value = typeof next === "function" ? next(debitLines.value) : next;
    const creditLines = ref([{
        kode: '4001',
        nominal: 0
      }]),
      setCreditLines = next => creditLines.value = typeof next === "function" ? next(creditLines.value) : next; // Handle template switch for fast entries
    const handleTemplateChange = (tmpl: string) => {
      setSelectedTemplate(tmpl);
      if (tmpl === 'Pendapatan') {
        setMemo('Penerimaan termin pembayaran proyek teknologi klien');
        setDebitLines([{
          kode: '1001',
          nominal: 150000000
        }]);
        setCreditLines([{
          kode: '4001',
          nominal: 150000000
        }]);
      } else if (tmpl === 'Bayar Gaji') {
        setMemo('Pembayaran gaji tim pengembang & operasional Kedata');
        setDebitLines([{
          kode: '5001',
          nominal: 45000000
        }]);
        setCreditLines([{
          kode: '1001',
          nominal: 45000000
        }]);
      } else if (tmpl === 'Langganan') {
        setMemo('Pembayaran rutin tagihan lisensi cloud (AWS/OpenAI)');
        setDebitLines([{
          kode: '5002',
          nominal: 12500000
        }]);
        setCreditLines([{
          kode: '1001',
          nominal: 12500000
        }]);
      } else {
        setMemo('');
        setDebitLines([{
          kode: '1001',
          nominal: 0
        }]);
        setCreditLines([{
          kode: '1001',
          nominal: 0
        }]);
      }
    };

    // Debit/Credit line modifiers
    const handleAddDebitRow = () => {
      setDebitLines([...debitLines.value, {
        kode: '1001',
        nominal: 0
      }]);
    };
    const handleRemoveDebitRow = (idx: number) => {
      setDebitLines(debitLines.value.filter((_, i) => i !== idx));
    };
    const handleDebitRowChange = (idx: number, field: 'kode' | 'nominal', value: any) => {
      const updated = [...debitLines.value];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      setDebitLines(updated);
    };
    const handleAddCreditRow = () => {
      setCreditLines([...creditLines.value, {
        kode: '1001',
        nominal: 0
      }]);
    };
    const handleRemoveCreditRow = (idx: number) => {
      setCreditLines(creditLines.value.filter((_, i) => i !== idx));
    };
    const handleCreditRowChange = (idx: number, field: 'kode' | 'nominal', value: any) => {
      const updated = [...creditLines.value];
      updated[idx] = {
        ...updated[idx],
        [field]: value
      };
      setCreditLines(updated);
    };

    // Balancing Calculation
    const totalDebit = computed(() => debitLines.value.reduce((acc, l) => acc + Number(l.nominal || 0), 0));
    const totalCredit = computed(() => creditLines.value.reduce((acc, l) => acc + Number(l.nominal || 0), 0));
    const isBalanced = computed(() => totalDebit.value === totalCredit.value && totalDebit.value > 0);

    const resetAccountForm = () => {
      editingAccount.value = null;
      setNewAccount({ kode: '', nama: '', tipe: 'Aset', saldo: 0, status: 'active', parentId: '' });
    };

    const openAccountForm = (account: any = null) => {
      if (account) {
        const raw = account._raw || account;
        editingAccount.value = account;
        setNewAccount({
          kode: account.kode,
          nama: account.nama,
          tipe: account.tipe,
          saldo: Number(raw.opening_balance ?? account.saldo ?? 0),
          status: raw.status || account.status || 'active',
          parentId: raw.parent_id ? String(raw.parent_id) : '',
        });
      } else resetAccountForm();
      setIsAccountModalOpen(true);
    };

    // Add or edit account submission
    const handleSaveAccount = async (e: Event) => {
      e.preventDefault();
      if (!newAccount.value.kode || !newAccount.value.nama) {
        showToast('Harap lengkapi kode akun dan nama akun.');
        return;
      }
      if (!editingAccount.value && akun.some(a => a.kode === newAccount.value.kode)) {
        showToast('Kode akun sudah terdaftar di database.');
        return;
      }
      const item: any = { ...newAccount.value };
      if (editingAccount.value && onUpdateAkun) await onUpdateAkun(editingAccount.value, item);
      else await onAddAkun(item);
      setIsAccountModalOpen(false);
      resetAccountForm();
    };

    const deleteAccount = async (account: any) => {
      if (!onDeleteAkun) return;
      deleteConfirm.value = account;
    };
    const confirmDeleteAccount = async () => {
      if (!onDeleteAkun || !deleteConfirm.value) return;
      const account = deleteConfirm.value;
      deleteConfirm.value = null;
      await onDeleteAkun(account);
    };

    // Add Transaction Submission
    const handleSaveJournal = () => {
      if (!memo.value) {
        showToast('Harap berikan keterangan memo jurnal.');
        return;
      }
      if (!isBalanced.value) {
        showToast('Jurnal tidak seimbang! Nilai total debit harus sama dengan total kredit.');
        return;
      }

      const firstDebit = debitLines.value[0];
      const firstCredit = creditLines.value[0];
      const transactionItem: any = {
        id: `TX-${(transaksi.length + 101).toString()}`,
        tanggal: journalDateInput.value,
        refVoucher: voucherNo.value,
        keterangan: memo.value,
        nominal: totalDebit.value,
        debitAkun: firstDebit.kode,
        kreditAkun: firstCredit.kode,
        divisionId: journalDivisionId.value || null,
        lines: [
          ...debitLines.value.filter(line => Number(line.nominal) > 0).map(line => ({ kode: line.kode, debit: Number(line.nominal), credit: 0 })),
          ...creditLines.value.filter(line => Number(line.nominal) > 0).map(line => ({ kode: line.kode, debit: 0, credit: Number(line.nominal) })),
        ],
      };
      onAddTransaksi(transactionItem);
      setIsJournalModalOpen(false);
      // Reset state
      setMemo('');
      setJournalDivisionId('');
      setDebitLines([{
        kode: '1001',
        nominal: 0
      }]);
      setCreditLines([{
        kode: '1001',
        nominal: 0
      }]);
      setVoucherNo(`RV-${new Date().getFullYear()}${transaksi.length + 102}`);
      showToast('Jurnal draft berhasil dibuat dan menunggu approval pengguna lain.');
    };

    // Filters
    const filteredLedgers = computed(() => latestFirst((props.akun || []).filter((a: any) => {
      const query = ledgerSearch.value.toLowerCase();
      return String(a.kode || '').toLowerCase().includes(query) || String(a.nama || '').toLowerCase().includes(query) || String(a.tipe || '').toLowerCase().includes(query);
    })));
    const filteredJournals = computed(() => latestFirst((props.transaksi || []).filter((t: any) => {
      const query = journalSearch.value.toLowerCase();
      const matchesSearch = String(t.keterangan || '').toLowerCase().includes(query) || String(t.refVoucher || '').toLowerCase().includes(query);
      const matchesDate = !journalDate.value || t.tanggal === journalDate.value;
      return matchesSearch && matchesDate;
    })));
    const pagedLedgers = computed(() => pageRows(filteredLedgers.value, ledgerPage.value));
    const pagedJournals = computed(() => pageRows(filteredJournals.value, journalPage.value));
    const escapeHtml = (value: any) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    const downloadTextFile = (filename: string, content: string, type = 'text/html;charset=utf-8;') => {
      const blob = new Blob([content], { type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    };
    const downloadJournalVoucher = (transaction: Transaksi) => {
      const debitAccount = akun.find(item => item.kode === transaction.debitAkun);
      const creditAccount = akun.find(item => item.kode === transaction.kreditAkun);
      const html = `<!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bukti Jurnal ${escapeHtml(transaction.refVoucher)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #102A56; }
              .voucher { border: 1px solid #DCE7F4; padding: 28px; max-width: 760px; }
              .header { border-bottom: 2px solid #0B1F4A; padding-bottom: 14px; text-align: center; }
              h1, h2, p { margin: 0; }
              .meta { color: #64748B; font-size: 12px; margin-top: 6px; }
              table { border-collapse: collapse; margin-top: 22px; width: 100%; font-size: 13px; }
              th, td { border-bottom: 1px solid #E2E8F0; padding: 11px; text-align: left; }
              th { background: #F8FBFE; color: #53658A; font-size: 10px; text-transform: uppercase; }
              td:last-child, th:last-child { text-align: right; }
              .memo { margin-top: 18px; border: 1px solid #E2E8F0; padding: 12px; font-size: 13px; }
            </style>
          </head>
          <body>
            <section class="voucher">
              <div class="header">
                <h1>PT KEDATA INDONESIA DIGITAL</h1>
                <p class="meta">Bukti Jurnal Umum</p>
              </div>
              <div class="memo">
                <p><strong>No. Voucher:</strong> ${escapeHtml(transaction.refVoucher)}</p>
                <p><strong>Tanggal:</strong> ${escapeHtml(transaction.tanggal)}</p>
                <p><strong>Keterangan:</strong> ${escapeHtml(transaction.keterangan)}</p>
              </div>
              <table>
                <thead><tr><th>Posisi</th><th>Akun</th><th>Nilai</th></tr></thead>
                <tbody>
                  <tr><td>Debit</td><td>${escapeHtml(transaction.debitAkun)} - ${escapeHtml(debitAccount?.nama || '-')}</td><td>${escapeHtml(formatRupiah(transaction.nominal))}</td></tr>
                  <tr><td>Kredit</td><td>${escapeHtml(transaction.kreditAkun)} - ${escapeHtml(creditAccount?.nama || '-')}</td><td>${escapeHtml(formatRupiah(transaction.nominal))}</td></tr>
                </tbody>
              </table>
            </section>
          </body>
        </html>`;

      downloadTextFile(`bukti-jurnal-${transaction.refVoucher || transaction.id}.html`, html);
      showToast(`Bukti jurnal ${transaction.refVoucher} berhasil diunduh.`);
    };
    return () => <div class="space-y-6">
      {/* Upper action header */}
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">Buku Besar & Entri Jurnal</h1>
          <p class="text-xs text-slate-400 font-light mt-1">Kelola Chart of Accounts (COA), buat draft jurnal, lalu lakukan approval dan posting sesuai role.</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3 py-2 text-xs font-bold text-[#0B1F4A]">
            {activeTab.value === 'ledger' ? <BookOpen class="w-3.5 h-3.5" /> : <ArrowLeftRight class="w-3.5 h-3.5" />}
            {activeTab.value === 'ledger' ? 'Chart of Accounts' : 'Jurnal Transaksi'}
          </div>

          <button id="btn-open-modal-primary" onClick={() => activeTab.value === 'ledger' ? openAccountForm() : setIsJournalModalOpen(true)} class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow shadow-blue-900 transition-all shrink-0">
            <Plus class="w-4 h-4" /> 
            {activeTab.value === 'ledger' ? 'Tambah Akun COA' : 'Entri Jurnal Baru'}
          </button>
        </div>
      </div>

      {/* 1. CHART OF ACCOUNTS view */}
      {activeTab.value === 'ledger' && <div class="space-y-4">

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="relative w-full sm:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="ledger-search-box" type="text" value={ledgerSearch.value} onInput={e => setLedgerSearch(e.target.value)} placeholder="Cari kode atau nama akun..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <span class="text-xs text-[#6B7A90]">Menampilkan {filteredLedgers.value.length} akun</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-4">Kode Akun</th>
                    <th class="p-4">Nama Akun Buku Besar</th>
                    <th class="p-4">Tipe Klasifikasi</th>
                    <th class="p-4 text-right">Saldo Berjalan</th>
                    <th class="p-4 text-center">Status</th>
                    <th class="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {pagedLedgers.value.map(item => <tr key={item.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-4 font-mono font-bold text-slate-700 text-sm">
                        {item.kode}
                      </td>
                      <td class="p-4">
                        <span class="font-bold text-[#0B1F4A] block text-sm">{item.nama}</span>
                      </td>
                      <td class="p-4">
                        <span class={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${item.tipe === 'Aset' ? 'bg-blue-50 text-blue-700' : item.tipe === 'Kewajiban' ? 'bg-rose-50 text-rose-700' : item.tipe === 'Modal' ? 'bg-purple-50 text-purple-700' : item.tipe === 'Pendapatan' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {item.tipe}
                        </span>
                      </td>
                      <td class="p-4 text-right font-mono font-bold text-slate-800 text-sm">
                        {formatRupiah(item.saldo)}
                      </td>
                      <td class="p-4 text-center">
                        <span class={`${String(item.status || item._raw?.status || 'active') === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} text-[9px] px-1.5 py-0.5 rounded font-mono font-bold`}>{String(item.status || item._raw?.status || 'active') === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                      </td>
                      <td class="p-4"><div class="flex justify-center gap-1"><button type="button" aria-label={`Detail akun ${item.nama}`} title="Detail" onClick={() => selectedAccountDetail.value = item} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] bg-white text-[#0B1F4A] transition hover:bg-[#F8FBFE]"><Eye class="h-3.5 w-3.5" /></button><button type="button" aria-label={`Ubah akun ${item.nama}`} title="Ubah" onClick={() => openAccountForm(item)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"><Pencil class="h-3.5 w-3.5" /></button><button type="button" aria-label={`Hapus akun ${item.nama}`} title="Hapus" onClick={() => deleteAccount(item)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"><Trash2 class="h-3.5 w-3.5" /></button></div></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <TablePagination page={ledgerPage.value} total={filteredLedgers.value.length} onPageChange={(page: number) => ledgerPage.value = safePage(page, filteredLedgers.value.length)} />
          </div>
        </div>}

      {/* 2. JURNAL TRANSAKSI view */}
      {activeTab.value === 'journal' && <div class="space-y-4">

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="journal-search-box" type="text" value={journalSearch.value} onInput={e => setJournalSearch(e.target.value)} placeholder="Cari keterangan memo atau voucher..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-[#6B7A90]"><Calendar class="mr-1 inline h-3.5 w-3.5" />Tanggal:</span>
                <input id="journal-date-box" type="date" value={journalDate.value} onChange={e => setJournalDate(e.target.value)} class="h-10 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]" />
                {journalDate.value && <button onClick={() => setJournalDate('')} class="h-9 rounded-lg px-2 text-xs font-medium text-[#1E5AA8]">Reset</button>}
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-4">Tanggal</th>
                    <th class="p-4">Ref. Voucher</th>
                    <th class="p-4">Keterangan Memo Transaksi</th>
                    <th class="p-4">Alokasi Debit/Kredit</th>
                    <th class="p-4 text-right">Nominal</th>
                    <th class="p-4 text-center">Status</th>
                    <th class="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {filteredJournals.value.length === 0 ? <tr>
                      <td colSpan={7} class="p-12 text-center text-slate-400 font-light">
                        Tidak ada transaksi keuangan yang sesuai dengan pencarian.
                      </td>
                    </tr> : pagedJournals.value.map(t => {
                  const dbAcc = akun.find(a => a.kode === t.debitAkun);
                  const crAcc = akun.find(a => a.kode === t.kreditAkun);
                  return <tr key={t.id} class="hover:bg-slate-50 transition-colors">
                          <td class="p-4 font-mono font-medium text-slate-600">
                            {t.tanggal}
                          </td>
                          <td class="p-4 font-mono font-bold text-[#0B1F4A]">
                            {t.refVoucher}
                          </td>
                          <td class="p-4">
                            <span class="font-bold text-slate-800 block text-sm">{t.keterangan}</span>
                            <span class="text-[10px] text-slate-400 block font-light">Ref ID: {t.id}</span>
                          </td>
                          <td class="p-4 text-[10px] space-y-1">
                            <span class="block text-emerald-600 font-bold font-mono">Dr {t.debitAkun} - {dbAcc?.nama}</span>
                            <span class="block text-slate-400 font-bold font-mono">Cr {t.kreditAkun} - {crAcc?.nama}</span>
                          </td>
                          <td class="p-4 text-right font-mono font-bold text-[#0B1F4A] text-sm">
                            {formatRupiah(t.nominal)}
                          </td>
                          <td class="p-4 text-center">
                            <span class={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${t.status === 'posted' ? 'bg-emerald-50 text-emerald-700' : t.status === 'approved' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>{t.status === 'posted' ? 'Posted' : t.status === 'approved' ? 'Approved' : 'Draft'}</span>
                            {t._raw?.created_by_name && <p class="mt-1 text-[9px] text-[#8A98AB]">Pembuat: {t._raw.created_by_name}</p>}
                          </td>
                          <td class="p-4">
                            <div class="flex items-center justify-center gap-1">
                              {t.status === 'draft' && onApproveJournal && ['admin', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase()) && <button type="button" onClick={() => onApproveJournal(t)} class="inline-flex h-8 items-center gap-1 rounded-lg bg-sky-50 px-2 text-[10px] font-bold text-sky-700 hover:bg-sky-100" title="Setujui jurnal draft"><ShieldCheck class="h-3.5 w-3.5" />Setujui</button>}
                              {t.status === 'approved' && onPostJournal && ['admin', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase()) && <button type="button" onClick={() => onPostJournal(t)} class="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100" title="Posting jurnal"><Send class="h-3.5 w-3.5" />Posting</button>}
                              <button type="button" onClick={() => downloadJournalVoucher(t)} class="p-2 text-slate-400 hover:text-[#0B1F4A] hover:bg-slate-100 rounded-xl" title="Unduh Slip Bukti">
                                <Download class="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>;
                })}
                </tbody>
              </table>
            </div>
            <TablePagination page={journalPage.value} total={filteredJournals.value.length} onPageChange={(page: number) => journalPage.value = safePage(page, filteredJournals.value.length)} />
          </div>
        </div>}

      {/* 3. COA ADD ACCOUNT MODAL */}
      {isAccountModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-[980px] overflow-hidden shadow-2xl">
            <div class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 class="font-extrabold text-sm text-[#0B1F4A]">{editingAccount.value ? 'Ubah Akun COA' : 'Tambah Akun COA Baru'}</h3>
                <span class="text-[10px] text-slate-400">{editingAccount.value ? 'Perbarui status dan struktur akun dengan aman' : 'Daftarkan akun ledger keuangan baru'}</span>
              </div>
              <button id="btn-close-account-modal" onClick={() => setIsAccountModalOpen(false)} class="text-slate-400 hover:text-slate-600 text-xs font-semibold">
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveAccount} class="p-6 space-y-4 text-xs">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Kode Akun (Kode COA)</label>
                <input id="acc-form-code" type="text" required placeholder="Contoh: 1102, 5004" value={newAccount.value.kode} onChange={e => setNewAccount({
                ...newAccount.value,
                kode: e.target.value
              })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none" />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Nama Akun Buku Besar</label>
                <input id="acc-form-name" type="text" required placeholder="Contoh: Beban Perjalanan Dinas" value={newAccount.value.nama} onChange={e => setNewAccount({
                ...newAccount.value,
                nama: e.target.value
              })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none" />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Tipe Klasifikasi Akun</label>
                <select id="acc-form-type" value={newAccount.value.tipe} onChange={e => setNewAccount({
                ...newAccount.value,
                tipe: e.target.value as TipeAkun
              })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800">
                  <option value="Aset">Aset</option>
                  <option value="Kewajiban">Kewajiban (Utang)</option>
                  <option value="Modal">Modal (Ekuitas)</option>
                  <option value="Pendapatan">Pendapatan</option>
                  <option value="Beban">Beban Operasional</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5"><label class="font-bold text-slate-700">Akun Induk</label><select value={newAccount.value.parentId} onChange={e => setNewAccount({ ...newAccount.value, parentId: e.target.value })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"><option value="">Tidak ada</option>{akun.filter(a => String(a.id) !== String(editingAccount.value?.id)).map(a => <option key={a.id} value={String(a.id)}>{a.kode} - {a.nama}</option>)}</select></div>
                <div class="space-y-1.5"><label class="font-bold text-slate-700">Status</label><select value={newAccount.value.status} onChange={e => setNewAccount({ ...newAccount.value, status: e.target.value })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-700">Saldo Awal (Rupiah)</label>
                <input id="acc-form-val" type="number" value={newAccount.value.saldo} onChange={e => setNewAccount({
                ...newAccount.value,
                saldo: Number(e.target.value)
              })} class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono" />
              </div>

              <button id="btn-account-submit" type="submit" class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow mt-2 transition-all flex items-center justify-center gap-2">
                <FileCheck class="w-4 h-4 text-[#38BDF8]" /> Simpan Akun Buku Besar
              </button>
            </form>
          </div>
        </div>}

      {/* 4. JOURNAL ENTRY FORM MODAL */}
      {isJournalModalOpen.value && <div class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4">
          <div class="journal-entry-modal bg-white border border-slate-200 rounded-3xl w-full overflow-hidden shadow-2xl flex flex-col">
            <div class="px-7 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 class="text-xl font-extrabold tracking-tight text-[#0B1F4A]">Entri Jurnal Umum Baru</h3>
                <span class="mt-1 block text-sm font-semibold text-slate-500">Pastikan saldo debit dan kredit seimbang.</span>
              </div>
              <button id="btn-close-journal-modal" onClick={() => setIsJournalModalOpen(false)} class="inline-flex h-10 min-w-[92px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900">
                Batal
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div class="px-7 py-3 bg-blue-50/50 border-b border-blue-150 flex flex-wrap items-center gap-3 shrink-0 text-sm">
              <span class="font-bold text-slate-600">Template Cepat:</span>
              {['Umum', 'Pendapatan', 'Bayar Gaji', 'Langganan'].map(tmpl => <button id={`tmpl-select-${tmpl}`} key={tmpl} type="button" onClick={() => handleTemplateChange(tmpl)} class={`inline-flex h-10 min-w-[104px] items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${selectedTemplate.value === tmpl ? 'bg-[#0B1F4A] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {tmpl}
                </button>)}
            </div>

            <div class="p-6 text-sm space-y-4 flex-1">
              {/* Core Voucher & Date */}
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Nomor Voucher Ref</label>
                  <input id="journ-form-voucher" type="text" required value={voucherNo.value} onChange={e => setVoucherNo(e.target.value)} class="h-12 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 font-mono text-sm font-bold text-slate-700 focus:outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Tanggal Transaksi</label>
                  <input id="journ-form-date" type="date" required value={journalDateInput.value} onChange={e => setJournalDateInput(e.target.value)} class="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 font-mono text-sm text-slate-700 focus:outline-none" />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700">Divisi (opsional)</label>
                  <select id="journ-form-division" value={journalDivisionId.value} onChange={e => setJournalDivisionId(e.target.value)} class="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 focus:outline-none">
                    <option value="">Operasional umum / tanpa divisi</option>
                    {divisions.filter((division: any) => String(division.status || 'active') === 'active').map((division: any) => <option key={division.id} value={String(division.id)}>{division.code ? `${division.code} · ` : ''}{division.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Memo */}
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700">Memo Keterangan Transaksi</label>
                <input id="journ-form-memo" type="text" required placeholder="Tulis alasan transaksi atau invoice..." value={memo.value} onChange={e => setMemo(e.target.value)} class="h-11 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 focus:outline-none" />
              </div>

              <div class="grid gap-4 xl:grid-cols-2">
                {/* DEBIT ENTRIES (Multi Row) */}
                <div class="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                  <div class="flex justify-between items-center">
                    <span class="block text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600">Entri Debit (Dr)</span>
                    <button id="btn-add-debit-row" type="button" onClick={handleAddDebitRow} class="inline-flex h-9 items-center rounded-xl px-3 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800">
                      + Tambah Baris
                    </button>
                  </div>
                  <div class="space-y-2">
                    {debitLines.value.map((line, idx) => <div key={idx} class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center">
                        <select id={`debit-line-acc-${idx}`} value={line.kode} onChange={e => handleDebitRowChange(idx, 'kode', e.target.value)} class="h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 focus:outline-none">
                          {akun.map(a => <option key={a.id} value={a.kode}>{a.kode} - {a.nama} ({a.tipe})</option>)}
                        </select>
                        <input id={`debit-line-val-${idx}`} type="number" placeholder="Debit Nominal" value={line.nominal} onChange={e => handleDebitRowChange(idx, 'nominal', Number(e.target.value))} class="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 font-mono text-sm text-slate-800 focus:outline-none" />
                        {debitLines.value.length > 1 && <button type="button" onClick={() => handleRemoveDebitRow(idx)} class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50">
                            <Trash2 class="w-3.5 h-3.5" />
                          </button>}
                      </div>)}
                  </div>
                </div>

                {/* CREDIT ENTRIES (Multi Row) */}
                <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div class="flex justify-between items-center">
                    <span class="block text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600">Entri Kredit (Cr)</span>
                    <button id="btn-add-credit-row" type="button" onClick={handleAddCreditRow} class="inline-flex h-9 items-center rounded-xl px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800">
                      + Tambah Baris
                    </button>
                  </div>
                  <div class="space-y-2">
                    {creditLines.value.map((line, idx) => <div key={idx} class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center">
                        <select id={`credit-line-acc-${idx}`} value={line.kode} onChange={e => handleCreditRowChange(idx, 'kode', e.target.value)} class="h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 focus:outline-none">
                          {akun.map(a => <option key={a.id} value={a.kode}>{a.kode} - {a.nama} ({a.tipe})</option>)}
                        </select>
                        <input id={`credit-line-val-${idx}`} type="number" placeholder="Kredit Nominal" value={line.nominal} onChange={e => handleCreditRowChange(idx, 'nominal', Number(e.target.value))} class="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 font-mono text-sm text-slate-800 focus:outline-none" />
                        {creditLines.value.length > 1 && <button type="button" onClick={() => handleRemoveCreditRow(idx)} class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50">
                            <Trash2 class="w-3.5 h-3.5" />
                          </button>}
                      </div>)}
                  </div>
                </div>
              </div>
            </div>

            {/* Total balance indicators */}
            <div class="p-4 bg-[#F8FAFC] border-y border-slate-200/80 shrink-0 grid grid-cols-2 gap-4 font-mono">
              <div class="space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
                <span class="block font-sans text-sm text-slate-400">Total Debit (Dr)</span>
                <span class="block text-base font-bold text-[#0B1F4A]">{formatRupiah(totalDebit.value)}</span>
              </div>
              <div class="space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
                <span class="block font-sans text-sm text-slate-400">Total Kredit (Cr)</span>
                <span class="block text-base font-bold text-[#0B1F4A]">{formatRupiah(totalCredit.value)}</span>
              </div>
            </div>

            {/* Balance check validation footer */}
            <div class="p-4 bg-slate-50 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2 text-sm font-semibold">
                {isBalanced.value ? <span class="text-emerald-600 flex items-center gap-1"><Check class="w-4 h-4" /> Balanced & siap dibuat sebagai draft</span> : <span class="text-rose-500 flex items-center gap-1"><AlertCircle class="w-4 h-4 animate-bounce" /> Unbalanced &bull; Selisih: {formatRupiah(Math.abs(totalDebit.value - totalCredit.value))}</span>}
              </div>

              <button id="btn-journal-submit" type="button" disabled={!isBalanced.value} onClick={handleSaveJournal} class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B1F4A] px-7 text-sm font-bold text-white shadow transition-all hover:bg-[#1E3A8A] disabled:cursor-not-allowed disabled:opacity-50">
                Simpan Draft Jurnal
              </button>
            </div>
          </div>
        </div>}

      {selectedAccountDetail.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm">
        <div class="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl">
          <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">Detail Akun Buku Besar</p>
              <h3 class="mt-1 text-lg font-black text-[#0B1F4A]">{selectedAccountDetail.value.kode} · {selectedAccountDetail.value.nama}</h3>
            </div>
            <button type="button" onClick={() => selectedAccountDetail.value = null} class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600">×</button>
          </div>
          <div class="grid gap-3 p-6 text-xs sm:grid-cols-2">
            {[['Tipe', selectedAccountDetail.value.tipe], ['Status', selectedAccountDetail.value.status || selectedAccountDetail.value._raw?.status || 'active'], ['Saldo Berjalan', formatRupiah(selectedAccountDetail.value.saldo || 0)], ['Saldo Awal', formatRupiah(selectedAccountDetail.value._raw?.opening_balance || 0)], ['Normal Balance', selectedAccountDetail.value._raw?.normal_balance || '-'], ['Parent ID', selectedAccountDetail.value._raw?.parent_id || '-']].map(([label, value]) => <div class="rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-4"><p class="text-[10px] font-bold uppercase text-[#94A3B8]">{label}</p><p class="mt-1 font-bold text-[#0B1F4A]">{value}</p></div>)}
          </div>
        </div>
      </div>}

      <ConfirmDialog
        open={!!deleteConfirm.value}
        eyebrow="Konfirmasi Penghapusan"
        title="Hapus akun buku besar?"
        message="Akun yang sudah dipakai pada jurnal atau transaksi tidak akan bisa dihapus dari backend."
        details={[
          { label: 'Kode', value: deleteConfirm.value?.kode || '-' },
          { label: 'Nama Akun', value: deleteConfirm.value?.nama || '-' },
          { label: 'Tipe', value: deleteConfirm.value?.tipe || '-' },
        ]}
        impactItems={[
          'Akun hilang dari daftar Chart of Accounts jika belum dipakai transaksi.',
          'Jika backend menolak penghapusan, nonaktifkan akun tersebut sebagai gantinya.',
        ]}
        confirmLabel="Hapus Akun"
        onCancel={() => deleteConfirm.value = null}
        onConfirm={confirmDeleteAccount}
      />
    </div>;
  }
});
</script>
