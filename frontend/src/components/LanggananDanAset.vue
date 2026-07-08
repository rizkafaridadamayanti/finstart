<script lang="tsx">
import { Fragment, computed, defineComponent, h, onMounted, ref, watch } from "vue";
import { Cloud, Box, Plus, Search, Filter, Trash2, Cpu, CreditCard, BarChart2, X, Save, Calendar, ChevronDown, Info, Pencil, History, Archive } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Langganan } from '../types.ts';
import { financeApi, getApiErrorMessage } from '../services/financeApi.js';
import ConfirmDialog from './common/ConfirmDialog.vue';
import { TablePagination, latestFirst, pageRows, safePage } from '../utils/tablePagination.tsx';
export interface AsetTeknologi {
  id: string;
  nama: string;
  kategori: string;
  tanggalBeli: string;
  hargaBeli: number;
  penyusutanTahunan: number;
  nilaiBuku: number;
  penanggungJawab: string;
}
interface LanggananDanAsetProps {
  activeSection: 'langganan' | 'aset';
  langganan: Langganan[];
  assets: AsetTeknologi[];
  onAddLangganan: (newL: Langganan) => Promise<void> | void;
  onDeleteLangganan: (id: string) => Promise<void> | void;
  onAddAsset: (asset: any) => Promise<void> | void;
  onUpdateAsset?: (asset: any, data: any) => Promise<void> | void;
  onDisposeAsset?: (asset: any, reason?: string) => Promise<void> | void;
  onRefreshData?: () => Promise<any> | void;
  onSwitchSection?: (section: 'langganan' | 'aset') => void;
  showToast: (msg: string) => void;
}
export default defineComponent({
  name: "LanggananDanAset",
  props: ["activeSection", "langganan", "assets", "onAddLangganan", "onDeleteLangganan", "onAddAsset", "onUpdateAsset", "onDisposeAsset", "onRefreshData", "onSwitchSection", "showToast"],
  setup(props) {
    const {
      activeSection,
      langganan,
      onAddLangganan,
      onDeleteLangganan,
      onAddAsset,
      onUpdateAsset,
      onDisposeAsset,
      onRefreshData,
      onSwitchSection,
      showToast
    }: LanggananDanAsetProps = props;
    const activeTab = computed(() => props.activeSection === 'langganan' ? 'subs' : 'assets');
    // Filter category state (Aligned with 'Infrastruktur' | 'Software' | 'Marketing')
    const subCategoryFilter = ref('All'),
      setSubCategoryFilter = next => subCategoryFilter.value = typeof next === "function" ? next(subCategoryFilter.value) : next;
    const searchQuery = ref(''),
      setSearchQuery = next => searchQuery.value = typeof next === "function" ? next(searchQuery.value) : next; // Modals toggle
    const subsPage = ref(1);
    const assetsPage = ref(1);
    const expiredPage = ref(1);
    const subHistoryPage = ref(1);
    const assetHistoryPage = ref(1);
    const isSubModalOpen = ref(false),
      setIsSubModalOpen = next => isSubModalOpen.value = typeof next === "function" ? next(isSubModalOpen.value) : next;
    const isAssetModalOpen = ref(false),
      setIsAssetModalOpen = next => isAssetModalOpen.value = typeof next === "function" ? next(isAssetModalOpen.value) : next;
    const depreciationPeriod = ref(new Date().toISOString().slice(0, 7));
    type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'SGD' | 'JPY' | 'AUD' | 'GBP';
    const currencyOptions: { value: CurrencyCode; label: string }[] = [
      { value: 'IDR', label: 'IDR - Rupiah' },
      { value: 'USD', label: 'USD - Dolar AS' },
      { value: 'EUR', label: 'EUR - Euro' },
      { value: 'SGD', label: 'SGD - Dolar Singapura' },
      { value: 'JPY', label: 'JPY - Yen Jepang' },
      { value: 'AUD', label: 'AUD - Dolar Australia' },
      { value: 'GBP', label: 'GBP - Pound Inggris' }
    ];
    const calculatorAmount = ref(1);
    const currencyFrom = ref<CurrencyCode>('USD');
    const currencyTo = ref<CurrencyCode>('IDR');
    const exchangeRate = ref(16000);
    const subscriptionHistory = ref<any>(null);
    const showSubscriptionTransactions = ref(false);
    const showExpiredSubscriptions = ref(false);
    const showAssetArchive = ref(false);
    const assetHistory = ref<any>(null);
    const usdToIdrRate = ref(16000);
    
    const fetchExchangeRate = async () => {
      if (currencyFrom.value === currencyTo.value) {
        exchangeRate.value = 1;
        if (currencyFrom.value === 'USD') {
          usdToIdrRate.value = 1;
        } else if (currencyTo.value === 'USD') {
          usdToIdrRate.value = 1;
        }
        return;
      }
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currencyFrom.value}`);
        const data = await response.json();
        const rate = data.rates[currencyTo.value];
        if (rate) {
          exchangeRate.value = rate;
          if (currencyFrom.value === 'USD' && currencyTo.value === 'IDR') {
            usdToIdrRate.value = rate;
          } else if (currencyTo.value === 'USD' && currencyFrom.value === 'IDR') {
            usdToIdrRate.value = 1 / rate;
          } else if (currencyFrom.value === 'USD') {
            const idrRate = data.rates['IDR'];
            if (idrRate) usdToIdrRate.value = idrRate;
          } else {
            try {
              const usdResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
              const usdData = await usdResponse.json();
              usdToIdrRate.value = usdData.rates['IDR'] || 16000;
            } catch {
              usdToIdrRate.value = 16000;
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      }
    };

    const convertToIdr = (amount: number, currency: string) => {
      if (currency === 'IDR') return amount;
      if (currency === 'USD') return amount * usdToIdrRate.value;
      return amount;
    };
    const formatCurrency = (amount: number, currency: CurrencyCode) => {
      if (currency === 'IDR') return formatRupiah(amount);
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
    };
    const convertAmount = computed(() => Number(calculatorAmount.value || 0) * Number(exchangeRate.value || 0));
    const rateLabel = computed(() => currencyFrom.value === currencyTo.value ? `1 ${currencyFrom.value} = 1 ${currencyTo.value}` : `1 ${currencyFrom.value} = ${formatCurrency(exchangeRate.value, currencyTo.value)}`);
    const journalSummary = computed(() => {
      if (currencyFrom.value === currencyTo.value) {
        return `${formatCurrency(calculatorAmount.value, currencyFrom.value)}`;
      }
      return `${formatCurrency(calculatorAmount.value, currencyFrom.value)} x ${formatCurrency(exchangeRate.value, currencyTo.value)} = ${formatCurrency(convertAmount.value, currencyTo.value)}`;
    });
    const openExchangeRate = () => window.open(`https://www.google.com/search?q=kurs+${currencyFrom.value}+ke+${currencyTo.value}+hari+ini`, '_blank', 'noopener,noreferrer');
    const openSubscriptionHistory = (item: any) => subscriptionHistory.value = item;
    const todayDate = () => new Date().toISOString().slice(0, 10);
    const isExpiredSubscription = (item: any) => {
      const status = String(item?.status || item?._raw?.status || 'active').toLowerCase();
      const renewalDate = String(item?.tanggalTagihan || item?._raw?.renewal_date || '');
      return ['cancelled', 'inactive', 'expired', 'stopped'].includes(status) || Boolean(renewalDate && renewalDate < todayDate());
    };
    const subscriptionStatusLabel = (item: any) => {
      const status = String(item?.status || item?._raw?.status || 'active').toLowerCase();
      if (status === 'cancelled') return 'Dihentikan';
      if (status === 'inactive') return 'Nonaktif';
      if (status === 'expired') return 'Kedaluwarsa';
      return isExpiredSubscription(item) ? 'Kedaluwarsa' : 'Aktif';
    };
    const editingAsset = ref<any>(null);
    const confirmDialog = ref<any>(null);
    // Daftar aset berasal dari API backend; modal/UI tetap sama.
    const assets = ref<any[]>(props.assets || []);
    const newSub = ref({
        nama: '',
        provider: '',
        mataUang: 'IDR' as 'IDR' | 'USD',
        siklus: 'Bulanan' as 'Bulanan' | 'Tahunan',
        kategori: 'Software' as 'Infrastruktur' | 'Software' | 'Marketing',
        biaya: 0,
        biayaIDR: 0,
        kurs: 16000,
        tanggalTagihan: new Date().toISOString().slice(0, 10)
      }),
      setNewSub = next => newSub.value = typeof next === "function" ? next(newSub.value) : next;
    const newAsset = ref({
        nama: '',
        kategori: 'Elektronik / IT' as 'Elektronik / IT' | 'Furniture' | 'Kendaraan' | 'Gedung & Kantor',
        tanggalBeli: new Date().toISOString().slice(0, 10),
        hargaBeli: 0,
        masaManfaat: 4,
        nilaiSisa: 0,
        penanggungJawab: ''
      }),
      setNewAsset = next => newAsset.value = typeof next === "function" ? next(newAsset.value) : next; // Submit new subscription
    const handleSaveSub = async (e: Event) => {
      e.preventDefault();
      if (!newSub.value.nama || !newSub.value.tanggalTagihan || !newSub.value.provider) {
        showToast('Harap isi nama layanan, nama provider, dan tanggal tagihan.');
        return;
      }
      const item: Langganan = { id: `SUB-${Date.now()}`, ...newSub.value, biayaIDR: convertToIdr(newSub.value.biaya, newSub.value.mataUang) };
      await onAddLangganan(item);
      setIsSubModalOpen(false);
      setNewSub({
        nama: '', provider: '', mataUang: 'IDR', siklus: 'Bulanan',
        kategori: 'Software', biaya: 0, biayaIDR: 0, kurs: usdToIdrRate.value, tanggalTagihan: new Date().toISOString().slice(0, 10)
      });
    };

    const resetAssetForm = () => {
      editingAsset.value = null;
      setNewAsset({
        nama: '', kategori: 'Elektronik / IT', tanggalBeli: new Date().toISOString().slice(0, 10),
        hargaBeli: 0, masaManfaat: 4, nilaiSisa: 0, penanggungJawab: ''
      });
    };

    const openAssetForm = (asset: any = null) => {
      if (asset) {
        editingAsset.value = asset;
        const raw = asset._raw || asset;
        setNewAsset({
          nama: asset.nama || raw.asset_name || '',
          kategori: asset.kategori || raw.category || 'Elektronik / IT',
          tanggalBeli: asset.tanggalBeli || raw.acquisition_date || new Date().toISOString().slice(0, 10),
          hargaBeli: Number(asset.hargaBeli ?? raw.acquisition_cost ?? 0),
          masaManfaat: raw.useful_life_months ? Math.max(1, Math.round(Number(raw.useful_life_months) / 12)) : Math.max(1, Number(asset.masaManfaat || 4)),
          nilaiSisa: Number(asset.nilaiSisa ?? raw.residual_value ?? 0),
          penanggungJawab: asset.penanggungJawab || raw.responsible_person || ''
        });
      } else {
        resetAssetForm();
      }
      setIsAssetModalOpen(true);
    };

    const handleSaveAsset = async (e: Event) => {
      e.preventDefault();
      if (!newAsset.value.nama || !newAsset.value.tanggalBeli || !newAsset.value.penanggungJawab) {
        showToast('Harap lengkapi nama aset, tanggal beli, dan penanggung jawab.');
        return;
      }
      if (editingAsset.value && onUpdateAsset) {
        await onUpdateAsset(editingAsset.value, { ...newAsset.value });
      } else {
        await onAddAsset({ ...newAsset.value });
      }
      setIsAssetModalOpen(false);
      resetAssetForm();
    };

    const requestStopSubscription = (item: any) => {
      confirmDialog.value = {
        type: 'subscription',
        item,
        eyebrow: 'Konfirmasi Auto-Renew',
        title: 'Hentikan auto-renew?',
        message: `Layanan ${item.nama} akan dinonaktifkan dari daftar langganan aktif.`,
        details: [
          { label: 'Layanan', value: item.nama },
          { label: 'Provider', value: item.provider || '-' },
          { label: 'Nominal', value: formatRupiah(item.biayaIDR || item.biaya || 0) },
        ],
        impactItems: [
          'Status layanan akan berubah menjadi cancelled di database.',
          'Layanan tidak lagi dihitung dalam burn rate langganan aktif.',
        ],
        confirmLabel: 'Hentikan Layanan',
      };
    };

    const requestDisposeAsset = (asset: any) => {
      if (!onDisposeAsset) return;
      confirmDialog.value = {
        type: 'dispose-asset',
        item: asset,
        eyebrow: 'Konfirmasi Pelepasan Aset',
        title: 'Lepaskan aset ini?',
        message: 'Sistem akan membuat jurnal penghapusan berdasarkan nilai buku aset saat ini.',
        details: [
          { label: 'Aset', value: asset.nama },
          { label: 'Kategori', value: asset.kategori || '-' },
          { label: 'Nilai Buku', value: formatRupiah(asset.nilaiBuku || 0) },
        ],
        impactItems: [
          'Status aset akan berubah menjadi dilepas.',
          'Jurnal pelepasan aset akan dibuat otomatis.',
        ],
        confirmLabel: 'Lepaskan Aset',
        requireReason: true,
        reasonLabel: 'Alasan Pelepasan',
        reasonPlaceholder: 'Contoh: Aset tidak lagi digunakan',
        defaultReason: 'Aset tidak lagi digunakan',
      };
    };

    const handleConfirmDialog = async (reason = '') => {
      const action = confirmDialog.value;
      if (!action) return;
      confirmDialog.value = null;
      if (action.type === 'subscription') {
        await onDeleteLangganan(action.item.id);
        showToast(`Auto-renewal ${action.item.nama} dihentikan.`);
        return;
      }
      if (action.type === 'dispose-asset' && onDisposeAsset) {
        await onDisposeAsset(action.item, reason || 'Aset tidak lagi digunakan');
      }
    };

    async function processMonthlyDepreciation() {
      try {
        const result = await financeApi.post('/assets/depreciate-batch', {
          depreciation_period: depreciationPeriod.value,
          notes: 'Penyusutan bulanan diproses dari workspace FinStart.',
        });
        if (onRefreshData) await onRefreshData();
        showToast(result?.message || 'Penyusutan bulanan berhasil diproses.');
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal memproses penyusutan bulanan.'));
      }
    }

    async function showDepreciationHistory(asset: any) {
      try {
        const assetId = Number(asset?._raw?.id || asset?.id);
        if (!assetId) return showToast('ID aset tidak valid.');
        assetHistory.value = await financeApi.get(`/assets/${assetId}/depreciations`);
      } catch (error) {
        showToast(getApiErrorMessage(error, 'Gagal memuat riwayat penyusutan aset.'));
      }
    }

    // Filter Subscriptions & Assets dibuat reactive agar pencarian/kategori langsung berjalan.
    const expiredSubs = computed(() => latestFirst((props.langganan || []).filter((item: any) => isExpiredSubscription(item))));
    const activeSubs = computed(() => latestFirst((props.langganan || []).filter((item: any) => !isExpiredSubscription(item))));
    const filteredSubs = computed(() => latestFirst(activeSubs.value.filter((l: any) => {
      const query = searchQuery.value.toLowerCase();
      const matchesSearch = String(l.nama || '').toLowerCase().includes(query) || String(l.provider || '').toLowerCase().includes(query);
      const matchesCategory = subCategoryFilter.value === 'All' || l.kategori === subCategoryFilter.value;
      return matchesSearch && matchesCategory;
    })));
    const archivedAssets = computed(() => latestFirst((props.assets || []).filter((a: any) => String(a?._raw?.status || a?.status || '').toLowerCase() === 'disposed')));
    const activeAssets = computed(() => latestFirst((props.assets || []).filter((a: any) => String(a?._raw?.status || a?.status || '').toLowerCase() !== 'disposed')));
    const filteredAssets = computed(() => latestFirst((showAssetArchive.value ? archivedAssets.value : activeAssets.value).filter((a: any) => {
      const query = searchQuery.value.toLowerCase();
      return String(a.nama || '').toLowerCase().includes(query) || String(a.penanggungJawab || '').toLowerCase().includes(query) || String(a.kategori || '').toLowerCase().includes(query);
    })));
    const pagedSubs = computed(() => pageRows(filteredSubs.value, subsPage.value));
    const pagedAssets = computed(() => pageRows(filteredAssets.value, assetsPage.value));
    const pagedExpiredSubs = computed(() => pageRows(expiredSubs.value, expiredPage.value));
    const pagedSubHistory = computed(() => pageRows(latestFirst(props.langganan || []), subHistoryPage.value));
    const pagedAssetHistoryRows = computed(() => pageRows(latestFirst(assetHistory.value?.depreciations || []), assetHistoryPage.value));
    const totalSubBurnRate = computed(() => activeSubs.value.reduce((acc: number, l: any) => acc + Number(l.biayaIDR || l.biaya || 0), 0));
    const totalAssetCosts = computed(() => (props.assets || []).reduce((acc: number, a: any) => acc + Number(a.hargaBeli || 0), 0));
    const totalNetBookValue = computed(() => (props.assets || []).reduce((acc: number, a: any) => acc + Number(a.nilaiBuku || 0), 0));
    return () => <div class="space-y-6 font-sans">
      {/* Action Header bar */}
      <div class="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200/80 pb-5">
        <div class="min-w-0">
          <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">Langganan Digital & Aset Teknologi</h1>
          <p class="text-xs text-slate-400 font-light mt-1">Lacak pengeluaran operational burn rate SaaS serta database penyusutan depresiasi hardware infrastruktur korporat.</p>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-3 ml-auto">
            <div class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-bold text-[#0B1F4A]">
              {activeTab.value === 'subs' ? <Cloud class="w-4 h-4 text-sky-500" /> : <Box class="w-4 h-4 text-[#0B1F4A]" />}
              {activeTab.value === 'subs' ? 'SaaS & Langganan' : 'Aset Teknologi'}
            </div>
            <button id="btn-add-subs-asset" onClick={() => activeTab.value === 'subs' ? setIsSubModalOpen(true) : openAssetForm()} class="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow transition-all hover:bg-[#1E3A8A] whitespace-nowrap" style={{ minWidth: activeTab.value === 'subs' ? '178px' : '160px' }}>
              <Plus class="w-4 h-4" /> 
              {activeTab.value === 'subs' ? 'Tambah Layanan Baru' : 'Catat Aset Fisik'}
            </button>

          {activeTab.value === 'assets' && <div class="flex w-full flex-wrap items-center gap-2 xl:justify-end">
            <button type="button" onClick={() => showAssetArchive.value = !showAssetArchive.value} class={`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-bold transition ${showAssetArchive.value ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border border-[#D8E5F4] bg-white text-[#0B1F4A] hover:bg-[#F8FBFE]'}`}><Archive class="h-4 w-4" /> Arsip ({archivedAssets.value.length})</button>
            <div class="flex shrink-0 items-center justify-end gap-2 rounded-xl border border-[#D8E5F4] bg-white px-2 py-1"><input type="month" value={depreciationPeriod.value} onChange={event => depreciationPeriod.value = event.target.value} class="h-7 border-0 bg-transparent px-2 text-xs text-[#0B1F4A] outline-none" style={{ width: '136px' }} /><button type="button" onClick={processMonthlyDepreciation} class="h-7 rounded-lg bg-[#EEF5FC] px-3 text-[10px] font-semibold text-[#0B1F4A] whitespace-nowrap">Proses Penyusutan</button></div>
          </div>}
        </div>
      </div>

      {/* 1. LAYANAN LANGGANA DIGITAL view */}
      {activeTab.value === 'subs' && <div class="space-y-6">
          {/* Burn rate calculation block card */}
          <div class="bg-[#102A56] text-white p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div class="space-y-1 z-10">
              <span class="text-[10px] text-[#BFD0E6] font-bold uppercase tracking-widest block">Est. SaaS Monthly Burn Rate</span>
              <h2 class="text-3xl font-mono font-bold">{formatRupiah(totalSubBurnRate.value)} / bulan</h2>
              <p class="text-xs text-blue-200/80 font-light leading-relaxed">Pengeluaran rutin lisensi IDE, server hosting AWS, token machine learning, dan produktivitas tim internal.</p>
            </div>

            <div class="bg-[#0B1F42] border border-white/10 p-4 rounded-2xl shrink-0 text-xs text-blue-100 space-y-2 z-10">
              <span class="font-bold text-white block">Distribusi Berdasarkan Kategori:</span>
              <div class="space-y-1 font-mono">
                <p>&bull; Infrastruktur: <span class="font-bold text-white">{formatRupiah(activeSubs.value.filter(l => l.kategori === 'Infrastruktur').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
                <p>&bull; Software: <span class="font-bold text-white">{formatRupiah(activeSubs.value.filter(l => l.kategori === 'Software').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
                <p>&bull; Marketing: <span class="font-bold text-white">{formatRupiah(activeSubs.value.filter(l => l.kategori === 'Marketing').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
              </div>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div class="rounded-[2rem] border border-[#E4EDF8] bg-white p-6 shadow-[0_24px_80px_rgba(15,43,96,0.08)]">
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-2">
                  <p class="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#94A3B8]">Kurs & Mata Uang</p>
                  <p class="max-w-xl text-sm leading-6 text-[#475569]">Desain kalkulator modern untuk memproyeksikan nilai langganan secara instan dengan pilihan IDR / USD.</p>
                </div>
                <button type="button" onClick={openExchangeRate} class="h-11 rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 text-[11px] font-bold text-[#0B1F4A] hover:bg-white">Lihat Kurs Realtime di Google</button>
              </div>

              <div class="mt-6 grid gap-4 md:grid-cols-3">
                <div class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm">
                  <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3">
                    <span>Kurs</span>
                    <span class="rounded-full bg-white/90 px-2 py-1 text-[10px] text-[#475569]">{rateLabel.value}</span>
                  </div>
                  <input type="number" min={0} value={exchangeRate.value} onInput={e => exchangeRate.value = Number(e.target.value || 0)} class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]" />
                </div>
                <div class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3">Nominal</div>
                  <input type="number" min={0} value={calculatorAmount.value} onInput={e => calculatorAmount.value = Number(e.target.value || 0)} class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]" />
                </div>
                <div class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm">
                  <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3">Konversi</div>
                  <div class="grid gap-3">
                    <select value={currencyFrom.value} onChange={e => currencyFrom.value = e.target.value as CurrencyCode} class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]">
                      {currencyOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <select value={currencyTo.value} onChange={e => currencyTo.value = e.target.value as CurrencyCode} class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]">
                      {currencyOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div class="mt-6 rounded-[2rem] bg-gradient-to-r from-slate-50 via-white to-cyan-50 border border-[#E1E8F3] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B2F56]">Estimasi Cepat</span>
                  <span class="rounded-full bg-[#0B1F4A] px-3 py-1.5 text-[11px] font-semibold text-white">Realtime</span>
                </div>
                <div class="mt-5 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-[1.5rem] bg-white p-4 shadow-sm border border-white">
                    <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">Nilai Saat Ini</p>
                    <p class="mt-3 text-lg font-bold text-[#0B1F4A]">{formatCurrency(convertAmount.value, currencyTo.value)}</p>
                  </div>
                  <div class="rounded-[1.5rem] bg-white p-4 shadow-sm border border-white">
                    <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">Rincian Konversi</p>
                    <p class="mt-3 text-sm font-semibold text-[#0B1F4A]">{journalSummary.value}</p>
                    <p class="mt-1 text-[11px] text-[#64748B]">{currencyFrom.value === currencyTo.value ? 'Sama mata uang, tidak perlu konversi.' : `Kurs yang digunakan: 1 ${currencyFrom.value} = ${formatCurrency(exchangeRate.value, currencyTo.value)}`}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden rounded-[2rem] border border-[#DCE7F4] bg-[#F5F9FF] p-6 shadow-[0_24px_80px_rgba(15,43,96,0.06)]">
              <div class="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#C7E7FF]/30 blur-3xl"></div>
              <div class="absolute left-4 top-10 h-16 w-16 rounded-full bg-[#EFF8FF]/80"></div>
              <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">Hasil Kalkulator</p>
              <p class="mt-4 text-4xl font-black text-[#0B1F4A]">{formatCurrency(convertAmount.value, currencyTo.value)}</p>
              <p class="mt-2 text-sm text-[#64748B]">{journalSummary.value}</p>
              <div class="mt-6 grid gap-3">
                <div class="rounded-[1.5rem] bg-white/90 p-4 shadow-sm border border-white">
                  <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">Nominal Jurnal</p>
                  <p class="mt-3 text-lg font-bold text-[#0B1F4A]">{formatCurrency(convertAmount.value, currencyTo.value)}</p>
                  <p class="mt-1 text-[11px] text-[#64748B]">Gunakan angka ini untuk memasukkan biaya langganan ke jurnal dalam {currencyTo.value}.</p>
                </div>
                <div class="rounded-[1.5rem] bg-white/90 p-4 shadow-sm border border-white">
                  <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">Detail Konversi</p>
                  <p class="mt-2 text-sm text-[#0B1F4A]">{journalSummary.value}</p>
                  <p class="mt-1 text-[11px] text-[#64748B]">{currencyFrom.value === currencyTo.value ? 'Sama mata uang, tidak perlu konversi.' : `Kurs: 1 ${currencyFrom.value} = ${formatCurrency(exchangeRate.value, currencyTo.value)}`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subs Log Table */}
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="subs-search-box" type="text" value={searchQuery.value} onInput={e => setSearchQuery(e.target.value)} placeholder="Cari layanan langganan..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs text-[#6B7A90]">Kategori:</span>
                {(['All', 'Infrastruktur', 'Software', 'Marketing'] as const).map(cat => <button id={`sub-cat-filter-${cat}`} key={cat} type="button" onClick={() => setSubCategoryFilter(cat)} class={`h-9 rounded-lg px-3 text-[11px] font-medium transition ${subCategoryFilter.value === cat ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`}>
                    {cat}
                  </button>)}
                  <button type="button" id="btn-subscription-transactions" onClick={() => showSubscriptionTransactions.value = true} class="inline-flex h-9 items-center gap-2 rounded-lg border border-[#BFD7F5] bg-[#F4F9FF] px-3 text-[11px] font-bold text-[#0B3A78] transition hover:bg-[#EAF4FF]"><History class="h-3.5 w-3.5" /> Riwayat Transaksi</button>
                  <button type="button" id="btn-expired-subscriptions" onClick={() => showExpiredSubscriptions.value = true} class="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"><History class="h-3.5 w-3.5" /> Riwayat Kadaluarsa ({expiredSubs.value.length})</button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-5">Nama Layanan</th>
                    <th class="p-5">Klasifikasi Kategori</th>
                    <th class="p-5">Biaya Rutin (Siklus)</th>
                    <th class="p-5">Est. Nominal Rupiah</th>
                    <th class="p-5">Tanggal Perpanjangan</th>
                    <th class="p-5">Status</th>
                    <th class="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {pagedSubs.value.map(item => <tr key={item.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-5">
                        <span class="font-bold text-[#0B1F4A] block text-sm flex items-center gap-1.5"><CreditCard class="w-4 h-4 text-slate-400" /> {item.nama}</span>
                        <span class="text-[10px] text-slate-400 font-mono block">{item.id} (by {item.provider})</span>
                      </td>
                      <td class="p-5">
                        <span class={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${item.kategori === 'Infrastruktur' ? 'bg-sky-50 text-sky-700' : item.kategori === 'Software' ? 'bg-blue-50 text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td class="p-5 font-mono font-medium">
                        {formatRupiah(item.biayaIDR || item.biaya)} ({item.siklus})
                      </td>
                      <td class="p-5 font-mono font-bold text-slate-800 text-sm">
                        {formatRupiah(item.biayaIDR)}
                      </td>
                      <td class="p-5 font-mono">{item.tanggalTagihan}</td>
                      <td class="p-5"><span class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Aktif</span></td>
                      <td class="p-5">
                        <div class="flex justify-center gap-2">
                          <button onClick={() => requestStopSubscription(item)} aria-label={`Hapus ${item.nama}`} class="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700" title="Hentikan Layanan">
                            <Trash2 class="w-4 h-4 text-current" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <TablePagination page={subsPage.value} total={filteredSubs.value.length} onPageChange={(page: number) => subsPage.value = safePage(page, filteredSubs.value.length)} />
          </div>
        </div>}

      {/* 2. ASET TEKNOLOGI INVENTORY view */}
      {activeTab.value === 'assets' && <div class="space-y-6">
          {/* Asset statistics overview summary */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div class="p-3 bg-[#0B1F4A] text-white rounded-xl">
                <Cpu class="w-5 h-5" />
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Harga Perolehan Aset</span>
                <span class="text-xl font-mono font-bold text-[#0B1F4A] mt-0.5 block">{formatRupiah(totalAssetCosts.value)}</span>
              </div>
            </div>

            <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart2 class="w-5 h-5" />
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Nilai Buku Neto (Net Book Value)</span>
                <span class="text-xl font-mono font-bold text-emerald-700 mt-0.5 block">{formatRupiah(totalNetBookValue.value)}</span>
              </div>
            </div>
          </div>

          {/* Asset table listing */}
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="assets-search-box" type="text" value={searchQuery.value} onInput={e => setSearchQuery(e.target.value)} placeholder="Cari aset atau penanggung jawab..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <span class="text-xs text-[#6B7A90]">{showAssetArchive.value ? 'Menampilkan aset yang sudah dilepas/tidak digunakan' : 'Penyusutan aset menggunakan metode garis lurus sesuai masa manfaat aset'}</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-5">Aset Hardware & Cloud</th>
                    <th class="p-5">Kategori Aset</th>
                    <th class="p-5 font-mono">Tgl Perolehan</th>
                    <th class="p-5 text-right">Harga Perolehan</th>
                    <th class="p-5 text-right">Depresiasi / Thn</th>
                    <th class="p-5 text-right">Nilai Buku Neto</th>
                    <th class="p-5">Penanggung Jawab</th>
                    <th class="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {pagedAssets.value.map(asset => <tr key={asset.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-5">
                        <span class="font-bold text-[#0B1F4A] block text-sm">{asset.nama}</span>
                        <span class="text-[10px] text-slate-400 font-mono">{asset.id}</span>
                      </td>
                      <td class="p-5 text-slate-700 font-semibold">{asset.kategori}</td>
                      <td class="p-5 font-mono">{asset.tanggalBeli}</td>
                      <td class="p-5 text-right font-mono font-medium text-slate-600">{formatRupiah(asset.hargaBeli)}</td>
                      <td class="p-5 text-right font-mono text-rose-600">-{formatRupiah(asset.penyusutanTahunan)}</td>
                      <td class="p-5 text-right font-mono font-bold text-emerald-600 text-sm">{formatRupiah(asset.nilaiBuku)}</td>
                      <td class="p-5 font-medium text-slate-700">{asset.penanggungJawab}</td>
                      <td class="p-5"><div class="flex justify-center gap-2"><button type="button" aria-label={`Riwayat penyusutan ${asset.nama}`} title="Riwayat penyusutan" onClick={() => showDepreciationHistory(asset)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"><History class="h-3.5 w-3.5" /></button>{asset._raw?.status !== 'disposed' && <><button type="button" aria-label={`Ubah aset ${asset.nama}`} title="Ubah" onClick={() => openAssetForm(asset)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"><Pencil class="h-3.5 w-3.5" /></button><button type="button" aria-label={`Lepas aset ${asset.nama}`} title="Lepas aset" onClick={() => requestDisposeAsset(asset)} class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"><Trash2 class="h-3.5 w-3.5" /></button></>}</div></td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            <TablePagination page={assetsPage.value} total={filteredAssets.value.length} onPageChange={(page: number) => assetsPage.value = safePage(page, filteredAssets.value.length)} />
          </div>
        </div>}

      {assetHistory.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm"><div class="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl"><div class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Riwayat Penyusutan</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">{assetHistory.value.asset?.asset_name || 'Aset'}</h3></div><button type="button" onClick={() => assetHistory.value = null} class="rounded-xl p-2 text-[#6B7A90]"><X class="h-5 w-5" /></button></div><div class="max-h-[55vh] overflow-y-auto p-6">{(assetHistory.value.depreciations || []).length ? <table class="w-full text-left text-xs"><thead class="border-b border-[#E8EEF7] text-[#70819B]"><tr><th class="pb-3">Periode</th><th class="pb-3 text-right">Nilai</th><th class="pb-3">Voucher</th></tr></thead><tbody class="divide-y divide-[#EDF2F7]">{pagedAssetHistoryRows.value.map((item: any) => <tr key={item.id}><td class="py-3">{item.depreciation_period}</td><td class="py-3 text-right font-semibold">{formatRupiah(Number(item.depreciation_amount || 0))}</td><td class="py-3">{item.journal_voucher_number || '-'}</td></tr>)}</tbody></table> : <p class="text-sm text-[#8A98AB]">Belum ada riwayat penyusutan untuk aset ini.</p>}</div>{(assetHistory.value.depreciations || []).length > 0 && <TablePagination page={assetHistoryPage.value} total={(assetHistory.value.depreciations || []).length} onPageChange={(page: number) => assetHistoryPage.value = safePage(page, (assetHistory.value.depreciations || []).length)} />}<div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4"><button type="button" onClick={() => assetHistory.value = null} class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white">Tutup</button></div></div></div>}

      <ConfirmDialog
        open={!!confirmDialog.value}
        eyebrow={confirmDialog.value?.eyebrow || 'Konfirmasi'}
        title={confirmDialog.value?.title || 'Lanjutkan tindakan?'}
        message={confirmDialog.value?.message || ''}
        details={confirmDialog.value?.details || []}
        impactItems={confirmDialog.value?.impactItems || []}
        confirmLabel={confirmDialog.value?.confirmLabel || 'Lanjutkan'}
        requireReason={!!confirmDialog.value?.requireReason}
        reasonLabel={confirmDialog.value?.reasonLabel || 'Alasan'}
        reasonPlaceholder={confirmDialog.value?.reasonPlaceholder || 'Tulis alasan singkat...'}
        defaultReason={confirmDialog.value?.defaultReason || ''}
        onCancel={() => confirmDialog.value = null}
        onConfirm={handleConfirmDialog}
      />

      {/* 3. ADD SUBSCRIPTION MODAL */}
      {isSubModalOpen.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-4 backdrop-blur-sm">
          <div class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl">
            <div class="px-9 py-8 border-b border-slate-100 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-[#0B1F4A] text-white flex items-center justify-center shadow-lg shadow-[#0B1F4A]/25">
                  <Plus class="w-5 h-5" />
                </div>
                <h3 class="font-extrabold text-2xl text-[#111827] tracking-tight">Daftarkan Layanan</h3>
              </div>
              <button id="btn-close-sub-modal" onClick={() => setIsSubModalOpen(false)} class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSub} class="min-h-0 flex-1 space-y-7 overflow-y-auto px-9 py-10 text-sm">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Nama Layanan</label>
                  <input id="sub-form-name" type="text" required placeholder="Contoh: AWS Production" value={newSub.value.nama} onChange={e => setNewSub({
                  ...newSub.value,
                  nama: e.target.value
                })} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all" />
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Provider</label>
                  <input id="sub-form-provider" type="text" required placeholder="Contoh: Amazon" value={newSub.value.provider} onChange={e => setNewSub({
                  ...newSub.value,
                  provider: e.target.value
                })} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Mata Uang</label>
                  <div class="relative">
                    <select id="sub-form-currency" value={newSub.value.mataUang} onChange={e => setNewSub({
                    ...newSub.value,
                    mataUang: e.target.value as any,
                    biayaIDR: convertToIdr(newSub.value.biaya, e.target.value as any),
                    kurs: usdToIdrRate.value
                  })} class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all">
                      <option value="IDR">IDR (Rupiah)</option>
                      <option value="USD">USD (Dolar AS)</option>
                    </select>
                    <ChevronDown class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]" />
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Siklus</label>
                  <div class="relative">
                    <select id="sub-form-cycle" value={newSub.value.siklus} onChange={e => setNewSub({
                    ...newSub.value,
                    siklus: e.target.value as any
                  })} class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all">
                      <option value="Bulanan">Bulanan</option>
                      <option value="Tahunan">Tahunan</option>
                    </select>
                    <ChevronDown class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]" />
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Kategori</label>
                  <div class="relative">
                    <select id="sub-form-category" value={newSub.value.kategori} onChange={e => setNewSub({
                    ...newSub.value,
                    kategori: e.target.value as any
                  })} class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all">
                      <option value="Software">Software/SaaS</option>
                      <option value="Infrastruktur">Infrastruktur</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                    <ChevronDown class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Biaya Langganan</label>
                  <input id="sub-form-cost" type="number" value={newSub.value.biaya || ''} placeholder="0" onInput={e => {
                  const biaya = Number(e.target.value);
                  setNewSub({
                    ...newSub.value,
                    biaya,
                    biayaIDR: convertToIdr(biaya, newSub.value.mataUang),
                    kurs: usdToIdrRate.value
                  });
                }} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#0B1F4A] font-bold text-sm transition-all" />
                  <p class="text-[10px] font-semibold text-[#64748B]">Estimasi rupiah: {formatRupiah(convertToIdr(newSub.value.biaya, newSub.value.mataUang))}</p>
                </div>

                <div class="space-y-3">
                  <label class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase">Tgl Tagihan Berikutnya</label>
                  <div class="relative">
                    <input id="sub-form-date" type="date" required value={newSub.value.tanggalTagihan} onChange={e => setNewSub({
                    ...newSub.value,
                    tanggalTagihan: e.target.value
                  })} class="w-full h-12 px-5 pr-12 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm transition-all" />
                    <Calendar class="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]" />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 pt-2">
                <button id="btn-sub-cancel" type="button" onClick={() => setIsSubModalOpen(false)} class="h-[52px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-2xl text-sm transition-all">
                  Batal
                </button>
                <button id="btn-sub-submit" type="submit" class="h-[52px] bg-[#0B1F4A] hover:bg-[#071735] text-white font-extrabold rounded-2xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2">
                  <Save class="w-4 h-4" /> Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>}

      {showExpiredSubscriptions.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm">
        <div class="w-full max-w-3xl overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl">
          <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">Arsip Langganan</p>
              <h3 class="mt-1 text-lg font-extrabold tracking-tight text-[#111827]">Riwayat Langganan Kadaluarsa</h3>
              <p class="mt-0.5 text-[11px] text-[#53658A]">Menampung layanan yang tanggal perpanjangannya sudah lewat atau statusnya dihentikan/nonaktif.</p>
            </div>
            <button type="button" onClick={() => showExpiredSubscriptions.value = false} class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"><X class="h-5 w-5" /></button>
          </div>
          <div class="max-h-[60vh] overflow-y-auto p-6">
            {expiredSubs.value.length ? <table class="w-full text-left text-xs"><thead class="border-b border-[#E8EEF7] text-[10px] font-extrabold uppercase tracking-wider text-[#70819B]"><tr><th class="pb-3">Layanan</th><th class="pb-3">Kategori</th><th class="pb-3 text-right">Nominal</th><th class="pb-3">Tanggal</th><th class="pb-3">Status</th></tr></thead><tbody class="divide-y divide-[#EDF2F7]">{pagedExpiredSubs.value.map((item: any) => <tr key={`expired-${item.id}`}><td class="py-3"><p class="font-bold text-[#0B1F4A]">{item.nama}</p><p class="mt-0.5 text-[10px] text-[#8A98AB]">{item.provider || '-'}</p></td><td class="py-3">{item.kategori || '-'}</td><td class="py-3 text-right font-mono font-bold text-[#0B1F4A]">{formatRupiah(item.biayaIDR || item.biaya || 0)}</td><td class="py-3 font-mono">{item.tanggalTagihan || '-'}</td><td class="py-3"><span class="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">{subscriptionStatusLabel(item)}</span></td></tr>)}</tbody></table> : <p class="rounded-2xl border border-dashed border-[#DCE7F4] bg-[#F8FBFE] p-6 text-center text-sm text-[#6B7A90]">Belum ada langganan yang kadaluarsa atau dihentikan.</p>}
          </div>
          {expiredSubs.value.length > 0 && <TablePagination page={expiredPage.value} total={expiredSubs.value.length} onPageChange={(page: number) => expiredPage.value = safePage(page, expiredSubs.value.length)} />}
          <div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4"><button type="button" onClick={() => showExpiredSubscriptions.value = false} class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white">Tutup</button></div>
        </div>
      </div>}

      {showSubscriptionTransactions.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm">
        <div class="w-full max-w-4xl overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl">
          <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Langganan</p>
              <h3 class="mt-1 text-lg font-extrabold tracking-tight text-[#111827]">Riwayat Transaksi Langganan</h3>
              <p class="mt-0.5 text-[11px] text-[#53658A]">Ringkasan status tagihan terakhir dari semua layanan.</p>
            </div>
            <button type="button" onClick={() => showSubscriptionTransactions.value = false} class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"><X class="h-5 w-5" /></button>
          </div>
          <div class="max-h-[60vh] overflow-y-auto p-6">
            <table class="w-full text-left text-xs">
              <thead class="border-b border-[#E8EEF7] text-[10px] font-extrabold uppercase tracking-wider text-[#70819B]"><tr><th class="pb-3">Layanan</th><th class="pb-3">Mata Uang</th><th class="pb-3 text-right">Nominal</th><th class="pb-3">Tagihan Berikutnya</th><th class="pb-3">Status Terakhir</th></tr></thead>
              <tbody class="divide-y divide-[#EDF2F7]">{pagedSubHistory.value.map((item: any) => <tr key={`sub-history-${item.id}`}><td class="py-3"><p class="font-bold text-[#0B1F4A]">{item.nama}</p><p class="mt-0.5 text-[10px] text-[#8A98AB]">{item.provider || '-'}</p></td><td class="py-3 font-mono">{item.mataUang || item._raw?.currency || 'IDR'}</td><td class="py-3 text-right font-mono font-bold text-[#0B1F4A]">{formatRupiah(item.biayaIDR || item.biaya || 0)}</td><td class="py-3 font-mono">{item.tanggalTagihan || '-'}</td><td class="py-3">{item._raw?.latest_bill_status || subscriptionStatusLabel(item)}</td></tr>)}</tbody>
            </table>
          </div>
          <TablePagination page={subHistoryPage.value} total={(props.langganan || []).length} onPageChange={(page: number) => subHistoryPage.value = safePage(page, (props.langganan || []).length)} />
          <div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4"><button type="button" onClick={() => showSubscriptionTransactions.value = false} class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white">Tutup</button></div>
        </div>
      </div>}

      {subscriptionHistory.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm">
        <div class="w-full max-w-[540px] overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl">
          <div class="flex items-start justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h3 class="text-lg font-extrabold tracking-tight text-[#111827]">Riwayat Transaksi Langganan</h3>
              <p class="mt-0.5 text-[11px] text-[#53658A]">{subscriptionHistory.value.nama} · {subscriptionHistory.value.provider || '-'}</p>
            </div>
            <button type="button" onClick={() => subscriptionHistory.value = null} class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"><X class="h-5 w-5" /></button>
          </div>
          <div class="space-y-3 px-6 py-5 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-2xl bg-[#F8FBFE] p-4"><p class="text-[10px] font-bold uppercase text-[#94A3B8]">Nominal</p><p class="mt-1 font-mono text-sm font-black text-[#0B1F4A]">{formatRupiah(subscriptionHistory.value.biayaIDR || subscriptionHistory.value.biaya || 0)}</p></div>
              <div class="rounded-2xl bg-[#F8FBFE] p-4"><p class="text-[10px] font-bold uppercase text-[#94A3B8]">Siklus</p><p class="mt-1 font-bold text-[#0B1F4A]">{subscriptionHistory.value.siklus || '-'}</p></div>
            </div>
            <div class="rounded-2xl border border-[#DCE7F4] p-4">
              <p class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]">Catatan Tagihan Backend</p>
              <ul class="mt-3 space-y-2 text-[#53658A]">
                <li>• Tanggal tagihan berikutnya: <span class="font-bold text-[#0B1F4A]">{subscriptionHistory.value.tanggalTagihan || '-'}</span></li>
                <li>• Jumlah tagihan dibuat: <span class="font-bold text-[#0B1F4A]">{subscriptionHistory.value._raw?.generated_bill_count ?? '-'}</span></li>
                <li>• Tagihan terakhir: <span class="font-bold text-[#0B1F4A]">{subscriptionHistory.value._raw?.latest_bill_number || '-'}</span></li>
                <li>• Status tagihan terakhir: <span class="font-bold text-[#0B1F4A]">{subscriptionHistory.value._raw?.latest_bill_status || '-'}</span></li>
                <li>• Terakhir dibuat: <span class="font-bold text-[#0B1F4A]">{subscriptionHistory.value._raw?.last_billed_date || '-'}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>}

      {/* 4. ADD HARDWARE ASSET MODAL */}
      {isAssetModalOpen.value && <div class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-4 backdrop-blur-sm">
          <div class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl">
            <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 class="font-extrabold text-lg text-[#111827] tracking-tight">{editingAsset.value ? 'Ubah Data Aset' : 'Registrasi Aset Baru'}</h3>
                <span class="text-[11px] text-[#53658A] block mt-0.5">{editingAsset.value ? 'Data perolehan dan jurnal historis tetap dipertahankan.' : 'Inventarisasi & Kalkulasi Penyusutan.'}</span>
              </div>
              <button id="btn-close-asset-modal" onClick={() => setIsAssetModalOpen(false)} class="w-10 h-10 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} class="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 text-xs">
              <section class="space-y-3">
                <div class="flex items-center gap-2 text-[#0B1F4A]">
                  <Info class="w-3.5 h-3.5" />
                  <h4 class="text-[10px] font-extrabold uppercase tracking-widest">Informasi Aset</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Nama Barang / Aset</label>
                    <input id="asset-form-name" type="text" required value={newAsset.value.nama} onChange={e => setNewAsset({
                    ...newAsset.value,
                    nama: e.target.value
                  })} class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Kategori</label>
                    <div class="relative">
                      <select id="asset-form-category" value={newAsset.value.kategori} onChange={e => setNewAsset({
                      ...newAsset.value,
                      kategori: e.target.value as any
                    })} class="w-full h-10 px-4 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-xs appearance-none transition-all">
                        <option value="Elektronik / IT">Elektronik / IT</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Kendaraan">Kendaraan</option>
                        <option value="Gedung & Kantor">Gedung & Kantor</option>
                      </select>
                      <ChevronDown class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]" />
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Penanggung Jawab / PIC Aset</label>
                  <input id="asset-form-pic" type="text" required value={newAsset.value.penanggungJawab} placeholder="Contoh: Tim IT / Nama pegawai" onInput={e => setNewAsset({
                    ...newAsset.value,
                    penanggungJawab: e.target.value
                  })} class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                </div>
              </section>

              <section class="space-y-3">
                <div class="flex items-center gap-2 text-emerald-600">
                  <span class="text-[12px] font-black leading-none">Rp</span>
                  <h4 class="text-[10px] font-extrabold uppercase tracking-widest">Nilai & Perolehan</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Tanggal Pembelian</label>
                    <div class="relative">
                      <input id="asset-form-date" type="date" required disabled={!!editingAsset.value} value={newAsset.value.tanggalBeli} onChange={e => setNewAsset({
                      ...newAsset.value,
                      tanggalBeli: e.target.value
                    })} class="w-full h-10 px-4 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                      <Calendar class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Harga Perolehan (Rp)</label>
                    <input id="asset-form-cost" type="number" required min={0} disabled={!!editingAsset.value} value={newAsset.value.hargaBeli || ''} placeholder="0" onChange={e => setNewAsset({
                    ...newAsset.value,
                    hargaBeli: Number(e.target.value)
                  })} class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Masa Manfaat (Tahun)</label>
                    <input id="asset-form-life" type="number" min={1} value={newAsset.value.masaManfaat} onChange={e => setNewAsset({
                    ...newAsset.value,
                    masaManfaat: Number(e.target.value)
                  })} class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Nilai Sisa / Salvage (Rp)</label>
                    <input id="asset-form-salvage" type="number" min={0} value={newAsset.value.nilaiSisa || ''} placeholder="0" onChange={e => setNewAsset({
                    ...newAsset.value,
                    nilaiSisa: Number(e.target.value)
                  })} class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                  </div>
                </div>
              </section>

              <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4 flex items-start gap-3 text-[#0B1F4A]">
                <Info class="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <p class="text-[10px] leading-relaxed">
                  Sistem menggunakan metode <span class="font-extrabold">Penyusutan Garis Lurus (Straight Line)</span>. Beban penyusutan akan otomatis dialokasikan ke laporan laba rugi bulanan berdasarkan masa manfaat yang ditentukan.
                </p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-[175px_1fr] gap-3 pt-4 border-t border-slate-100">
                <button id="btn-asset-cancel" type="button" onClick={() => setIsAssetModalOpen(false)} class="h-[38px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-xl text-sm transition-all">
                  Batal
                </button>
                <button id="btn-asset-submit" type="submit" class="h-[38px] bg-[#0B1F4A] hover:bg-[#071735] text-white font-extrabold rounded-xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2 text-sm">
                  <Save class="w-4 h-4" /> {editingAsset.value ? 'Simpan Perubahan' : 'Daftarkan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
  }
});
</script>
