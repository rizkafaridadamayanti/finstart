<script lang="tsx">
import { Fragment, defineComponent, h, ref } from "vue";
import { Cloud, Box, Plus, Search, Filter, Trash2, Cpu, CreditCard, BarChart2, X, Save, Calendar, ChevronDown, Info, DollarSign } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { Langganan } from '../types.ts';
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
  showToast: (msg: string) => void;
}
export default defineComponent({
  name: "LanggananDanAset",
  props: ["activeSection", "langganan", "assets", "onAddLangganan", "onDeleteLangganan", "onAddAsset", "showToast"],
  setup(props) {
    const {
      activeSection,
      langganan,
      onAddLangganan,
      onDeleteLangganan,
      onAddAsset,
      showToast
    }: LanggananDanAsetProps = props;
    const activeTab = ref(activeSection === 'langganan' ? 'subs' : 'assets'),
      setActiveTab = next => activeTab.value = typeof next === "function" ? next(activeTab.value) : next; // Filter category state (Aligned with 'Infrastruktur' | 'Software' | 'Marketing')
    const subCategoryFilter = ref('All'),
      setSubCategoryFilter = next => subCategoryFilter.value = typeof next === "function" ? next(subCategoryFilter.value) : next;
    const searchQuery = ref(''),
      setSearchQuery = next => searchQuery.value = typeof next === "function" ? next(searchQuery.value) : next; // Modals toggle
    const isSubModalOpen = ref(false),
      setIsSubModalOpen = next => isSubModalOpen.value = typeof next === "function" ? next(isSubModalOpen.value) : next;
    const isAssetModalOpen = ref(false),
      setIsAssetModalOpen = next => isAssetModalOpen.value = typeof next === "function" ? next(isAssetModalOpen.value) : next; // Aset state log (Simulating physical tech assets)
    // Daftar aset berasal dari API backend; modal/UI tetap sama.
    const assets = ref<any[]>(props.assets || []);
    const newSub = ref({
        nama: '',
        provider: '',
        mataUang: 'IDR' as 'USD' | 'IDR' | 'EUR',
        siklus: 'Bulanan' as 'Bulanan' | 'Tahunan',
        kategori: 'Software' as 'Infrastruktur' | 'Software' | 'Marketing',
        biaya: 0,
        biayaIDR: 0,
        tanggalTagihan: '2026-07-01'
      }),
      setNewSub = next => newSub.value = typeof next === "function" ? next(newSub.value) : next;
    const newAsset = ref({
        nama: '',
        kategori: 'Elektronik / IT' as 'Elektronik / IT' | 'Furniture' | 'Kendaraan' | 'Gedung & Kantor',
        tanggalBeli: '2026-07-01',
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
      const item: Langganan = { id: `SUB-${Date.now()}`, ...newSub.value };
      await onAddLangganan(item);
      setIsSubModalOpen(false);
      setNewSub({
        nama: '', provider: '', mataUang: 'IDR', siklus: 'Bulanan',
        kategori: 'Software', biaya: 0, biayaIDR: 0, tanggalTagihan: '2026-07-01'
      });
    };

    const handleSaveAsset = async (e: Event) => {
      e.preventDefault();
      if (!newAsset.value.nama || !newAsset.value.tanggalBeli || !newAsset.value.penanggungJawab) {
        showToast('Harap lengkapi nama aset, tanggal beli, dan penanggung jawab.');
        return;
      }
      await onAddAsset({ ...newAsset.value });
      setIsAssetModalOpen(false);
      setNewAsset({
        nama: '', kategori: 'Elektronik / IT', tanggalBeli: '2026-07-01',
        hargaBeli: 0, masaManfaat: 4, nilaiSisa: 0, penanggungJawab: ''
      });
    };

    // Filter Subscriptions
    const filteredSubs = langganan.filter(l => {
      const matchesSearch = l.nama.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesCategory = subCategoryFilter.value === 'All' || l.kategori === subCategoryFilter.value;
      return matchesSearch && matchesCategory;
    });
    const filteredAssets = assets.value.filter(a => {
      return a.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) || a.penanggungJawab.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
    const totalSubBurnRate = langganan.reduce((acc, l) => acc + l.biayaIDR, 0);
    const totalAssetCosts = assets.value.reduce((acc, a) => acc + a.hargaBeli, 0);
    const totalNetBookValue = assets.value.reduce((acc, a) => acc + a.nilaiBuku, 0);
    return () => <div class="space-y-6 font-sans">
      {/* Action Header bar */}
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">Langganan Digital & Aset Teknologi</h1>
          <p class="text-xs text-slate-400 font-light mt-1">Lacak pengeluaran operational burn rate SaaS serta database penyusutan depresiasi hardware infrastruktur korporat.</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-slate-100 border border-slate-200 rounded-xl p-1 flex shrink-0">
            <button id="tab-subs" onClick={() => {
              setActiveTab('subs');
              setSearchQuery('');
            }} class={`text-xs px-4 py-2 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab.value === 'subs' ? 'bg-white text-[#0B1F4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Cloud class="w-4 h-4 text-sky-500" /> SaaS & Langganan
            </button>
            <button id="tab-assets" onClick={() => {
              setActiveTab('assets');
              setSearchQuery('');
            }} class={`text-xs px-4 py-2 font-semibold rounded-lg transition-all flex items-center gap-1.5 ${activeTab.value === 'assets' ? 'bg-white text-[#0B1F4A] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              <Box class="w-4 h-4 text-[#0B1F4A]" /> Aset Teknologi
            </button>
          </div>

          <button id="btn-add-subs-asset" onClick={() => activeTab.value === 'subs' ? setIsSubModalOpen(true) : setIsAssetModalOpen(true)} class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow transition-all shrink-0">
            <Plus class="w-4 h-4" /> 
            {activeTab.value === 'subs' ? 'Tambah Layanan Baru' : 'Catat Aset Fisik'}
          </button>
        </div>
      </div>

      {/* 1. LAYANAN LANGGANA DIGITAL view */}
      {activeTab.value === 'subs' && <div class="space-y-6">
          {/* Burn rate calculation block card */}
          <div class="bg-[#102A56] text-white p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            <div class="space-y-1 z-10">
              <span class="text-[10px] text-[#BFD0E6] font-bold uppercase tracking-widest block">Est. SaaS Monthly Burn Rate</span>
              <h2 class="text-3xl font-mono font-bold">{formatRupiah(totalSubBurnRate)} / bulan</h2>
              <p class="text-xs text-blue-200/80 font-light leading-relaxed">Pengeluaran rutin lisensi IDE, server hosting AWS, token machine learning, dan produktivitas tim internal.</p>
            </div>

            <div class="bg-[#0B1F42] border border-white/10 p-4 rounded-2xl shrink-0 text-xs text-blue-100 space-y-2 z-10">
              <span class="font-bold text-white block">Distribusi Berdasarkan Kategori:</span>
              <div class="space-y-1 font-mono">
                <p>&bull; Infrastruktur: <span class="font-bold text-white">{formatRupiah(langganan.filter(l => l.kategori === 'Infrastruktur').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
                <p>&bull; Software: <span class="font-bold text-white">{formatRupiah(langganan.filter(l => l.kategori === 'Software').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
                <p>&bull; Marketing: <span class="font-bold text-white">{formatRupiah(langganan.filter(l => l.kategori === 'Marketing').reduce((acc, l) => acc + l.biayaIDR, 0))}</span></p>
              </div>
            </div>
          </div>

          {/* Subs Log Table */}
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="subs-search-box" type="text" value={searchQuery.value} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari layanan langganan..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs text-[#6B7A90]">Kategori:</span>
                {(['All', 'Infrastruktur', 'Software', 'Marketing'] as const).map(cat => <button id={`sub-cat-filter-${cat}`} key={cat} onClick={() => setSubCategoryFilter(cat)} class={`h-9 rounded-lg px-3 text-[11px] font-medium transition ${subCategoryFilter.value === cat ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`}>
                    {cat}
                  </button>)}
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-4">Nama Layanan</th>
                    <th class="p-4">Klasifikasi Kategori</th>
                    <th class="p-4">Biaya Rutin (Siklus)</th>
                    <th class="p-4">Est. Nominal Rupiah</th>
                    <th class="p-4">Tanggal Perpanjangan</th>
                    <th class="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {filteredSubs.map(item => <tr key={item.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-4">
                        <span class="font-bold text-[#0B1F4A] block text-sm flex items-center gap-1.5"><CreditCard class="w-4 h-4 text-slate-400" /> {item.nama}</span>
                        <span class="text-[10px] text-slate-400 font-mono block">{item.id} (by {item.provider})</span>
                      </td>
                      <td class="p-4">
                        <span class={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${item.kategori === 'Infrastruktur' ? 'bg-sky-50 text-sky-700' : item.kategori === 'Software' ? 'bg-blue-50 text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td class="p-4 font-mono font-medium">
                        {item.mataUang === 'USD' ? `$${item.biaya}` : `${item.biaya} ${item.mataUang}`} ({item.siklus})
                      </td>
                      <td class="p-4 font-mono font-bold text-slate-800 text-sm">
                        {formatRupiah(item.biayaIDR)}
                      </td>
                      <td class="p-4 font-mono">{item.tanggalTagihan}</td>
                      <td class="p-4">
                        <div class="flex justify-center">
                          <button onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin mematikan auto-renew ${item.nama}?`)) {
                          onDeleteLangganan(item.id);
                          showToast(`Auto-renewal ${item.nama} dihentikan.`);
                        }
                      }} aria-label={`Hapus ${item.nama}`} class="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700" title="Hentikan Layanan">
                            <Trash2 class="w-4 h-4 text-current" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
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
                <span class="text-xl font-mono font-bold text-[#0B1F4A] mt-0.5 block">{formatRupiah(totalAssetCosts)}</span>
              </div>
            </div>

            <div class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <BarChart2 class="w-5 h-5" />
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Nilai Buku Neto (Net Book Value)</span>
                <span class="text-xl font-mono font-bold text-emerald-700 mt-0.5 block">{formatRupiah(totalNetBookValue)}</span>
              </div>
            </div>
          </div>

          {/* Asset table listing */}
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="relative w-full lg:w-80">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"><Search class="w-4 h-4" /></span>
                <input id="assets-search-box" type="text" value={searchQuery.value} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari aset atau penanggung jawab..." class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white" />
              </div>
              <span class="text-xs text-[#6B7A90]">Penyusutan aset menggunakan metode garis lurus · 5 tahun</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-500">
                <thead class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th class="p-4">Aset Hardware & Cloud</th>
                    <th class="p-4">Kategori Aset</th>
                    <th class="p-4 font-mono">Tgl Perolehan</th>
                    <th class="p-4 text-right">Harga Perolehan</th>
                    <th class="p-4 text-right">Depresiasi / Thn</th>
                    <th class="p-4 text-right">Nilai Buku Neto</th>
                    <th class="p-4">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-150">
                  {filteredAssets.map(asset => <tr key={asset.id} class="hover:bg-slate-50 transition-colors">
                      <td class="p-4">
                        <span class="font-bold text-[#0B1F4A] block text-sm">{asset.nama}</span>
                        <span class="text-[10px] text-slate-400 font-mono">{asset.id}</span>
                      </td>
                      <td class="p-4 text-slate-700 font-semibold">{asset.kategori}</td>
                      <td class="p-4 font-mono">{asset.tanggalBeli}</td>
                      <td class="p-4 text-right font-mono font-medium text-slate-600">{formatRupiah(asset.hargaBeli)}</td>
                      <td class="p-4 text-right font-mono text-rose-600">-{formatRupiah(asset.penyusutanTahunan)}</td>
                      <td class="p-4 text-right font-mono font-bold text-emerald-600 text-sm">{formatRupiah(asset.nilaiBuku)}</td>
                      <td class="p-4 font-medium text-slate-700">{asset.penanggungJawab}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>}

      {/* 3. ADD SUBSCRIPTION MODAL */}
      {isSubModalOpen.value && <div class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-100 rounded-[34px] w-full max-w-[630px] overflow-hidden shadow-2xl">
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

            <form onSubmit={handleSaveSub} class="px-9 py-10 space-y-7 text-sm">
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
                    mataUang: e.target.value as any
                  })} class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all">
                      <option value="IDR">IDR (Rupiah)</option>
                      <option value="USD">USD (Dollar)</option>
                      <option value="EUR">EUR (Euro)</option>
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
                  <input id="sub-form-cost" type="number" value={newSub.value.biaya || ''} placeholder="0" onChange={e => {
                  const biaya = Number(e.target.value);
                  setNewSub({
                    ...newSub.value,
                    biaya,
                    biayaIDR: newSub.value.mataUang === 'IDR' ? biaya : newSub.value.biayaIDR
                  });
                }} class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#0B1F4A] font-bold text-sm transition-all" />
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

      {/* 4. ADD HARDWARE ASSET MODAL */}
      {isAssetModalOpen.value && <div class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white border border-slate-100 rounded-[24px] w-full max-w-[560px] overflow-hidden shadow-2xl">
            <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 class="font-extrabold text-lg text-[#111827] tracking-tight">Registrasi Aset Baru</h3>
                <span class="text-[11px] text-[#53658A] block mt-0.5">Inventarisasi & Kalkulasi Penyusutan.</span>
              </div>
              <button id="btn-close-asset-modal" onClick={() => setIsAssetModalOpen(false)} class="w-10 h-10 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAsset} class="px-6 py-6 space-y-5 text-xs">
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
              </section>

              <section class="space-y-3">
                <div class="flex items-center gap-2 text-emerald-600">
                  <DollarSign class="w-3.5 h-3.5" />
                  <h4 class="text-[10px] font-extrabold uppercase tracking-widest">Nilai & Perolehan</h4>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Tanggal Pembelian</label>
                    <div class="relative">
                      <input id="asset-form-date" type="date" required value={newAsset.value.tanggalBeli} onChange={e => setNewAsset({
                      ...newAsset.value,
                      tanggalBeli: e.target.value
                    })} class="w-full h-10 px-4 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all" />
                      <Calendar class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase">Harga Perolehan (Rp)</label>
                    <input id="asset-form-cost" type="number" required min={0} value={newAsset.value.hargaBeli || ''} placeholder="0" onChange={e => setNewAsset({
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
                  <Save class="w-4 h-4" /> Daftarkan Aset
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
  }
});
</script>
