<script lang="tsx">
import { Fragment, computed, defineComponent, h, ref } from "vue";
import { BarChart3, CalendarDays, CheckCircle2, Download, FileSpreadsheet, Plus, Printer, Target, TrendingUp, X } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { AkunBukuBesar, Proyek, Transaksi } from '../types.ts';
interface ProyeksiDanLaporanProps {
  activeSection: 'proyeksi' | 'laporan';
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  proyek: Proyek[];
  projectionData?: any;
  reportData?: any;
  onSaveProjection: (data: any) => Promise<void> | void;
  showToast: (msg: string) => void;
}
interface AnnualTarget {
  id: string;
  nama: string;
  nilaiTarget: number;
  nilaiRealisasi: number;
  satuan: 'Rupiah' | 'Persen' | 'Klien';
}
type ReportType = 'labarugi' | 'neraca' | 'aruskas';
const currencyOrUnit = (value: number, unit: AnnualTarget['satuan']) => {
  if (unit === 'Rupiah') return formatRupiah(value);
  if (unit === 'Persen') return `${value.toLocaleString('id-ID')}%`;
  return `${value.toLocaleString('id-ID')} Klien`;
};
const reportTabs: {
  id: ReportType;
  label: string;
  short: string;
}[] = [{
  id: 'labarugi',
  label: 'Laba Rugi',
  short: 'Laba Rugi'
}, {
  id: 'neraca',
  label: 'Neraca',
  short: 'Neraca'
}, {
  id: 'aruskas',
  label: 'Arus Kas',
  short: 'Arus Kas'
}];
export default defineComponent({
  name: "ProyeksiDanLaporan",
  props: ["activeSection", "akun", "transaksi", "proyek", "projectionData", "reportData", "onSaveProjection", "showToast"],
  setup(props) {
    const {
      activeSection,
      akun,
      transaksi,
      proyek,
      projectionData,
      reportData,
      onSaveProjection,
      showToast
    }: ProyeksiDanLaporanProps = props;
    const isForecast = activeSection === 'proyeksi';
    const activeReportType = ref('labarugi'),
      setActiveReportType = next => activeReportType.value = typeof next === "function" ? next(activeReportType.value) : next;
    const isTargetModalOpen = ref(false),
      setIsTargetModalOpen = next => isTargetModalOpen.value = typeof next === "function" ? next(isTargetModalOpen.value) : next;
    const isPrintModalOpen = ref(false),
      setIsPrintModalOpen = next => isPrintModalOpen.value = typeof next === "function" ? next(isPrintModalOpen.value) : next;
    const projectionSummary = projectionData?.summary || {};
    const targets = ref<AnnualTarget[]>([
      {
        id: `TARGET-REV-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Pendapatan',
        nilaiTarget: Number(projectionSummary.revenue_target || 0),
        nilaiRealisasi: Number(projectionSummary.revenue_actual || 0),
        satuan: 'Rupiah',
      },
      {
        id: `TARGET-EXP-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Beban Operasional',
        nilaiTarget: Number(projectionSummary.expense_target || 0),
        nilaiRealisasi: Number(projectionSummary.expense_actual || 0),
        satuan: 'Rupiah',
      },
      {
        id: `TARGET-PROFIT-${projectionData?.year || new Date().getFullYear()}`,
        nama: 'Target Laba Bersih',
        nilaiTarget: Number(projectionSummary.profit_target || 0),
        nilaiRealisasi: Number(projectionSummary.profit_actual || 0),
        satuan: 'Rupiah',
      },
    ]);
    const newTarget = ref({
        akunId: '',
        nilaiTarget: 0,
        nilaiRealisasi: 0,
        satuan: 'Rupiah' as AnnualTarget['satuan'],
        bulanProyeksi: '2026-07'
      }),
      setNewTarget = next => newTarget.value = typeof next === "function" ? next(newTarget.value) : next;
    const achievementAverage = computed(() => {
      if (!targets.value.length) return 0;
      return Math.round(targets.value.reduce((sum, target) => sum + Math.min(100, target.nilaiRealisasi / Math.max(target.nilaiTarget, 1) * 100), 0) / targets.value.length);
    });

    const projectionMonths = Array.isArray(projectionData?.months) ? projectionData.months : [];
    const roadmapBase = projectionMonths.length ? projectionMonths : [{ label: 'Tahun 1', forecast_revenue: 0 }];
    const maxRoadmap = Math.max(...roadmapBase.map((item: any) => Number(item.forecast_revenue || item.revenue_target || 0)), 1);
    const growthRows = roadmapBase.slice(0, 5).map((item: any, index: number, list: any[]) => {
      const amount = Number(item.forecast_revenue || item.revenue_target || 0);
      return {
        label: item.short_label || item.label || `Bulan ${index + 1}`,
        value: Number((amount / 1000000000).toFixed(1)),
        x: 8 + (list.length <= 1 ? 0 : index * 84 / (list.length - 1)),
        y: 82 - Math.min(68, (amount / maxRoadmap) * 68),
      };
    });

    const handleSaveTarget = async (event: Event) => {
      event.preventDefault();
      const selected = akun.find(item => item.id === newTarget.value.akunId);
      if (!selected) {
        showToast('Pilih akun buku besar terlebih dahulu.');
        return;
      }
      if (newTarget.value.satuan !== 'Rupiah') {
        showToast('Target API saat ini mendukung nilai Rupiah untuk pendapatan dan beban.');
        return;
      }
      await onSaveProjection({
        ...newTarget.value,
        akunType: selected.tipe,
        akunName: selected.nama,
        nilai: Number(newTarget.value.nilaiTarget),
        month: Number(String(newTarget.value.bulanProyeksi || '').slice(-2)),
      });
      setNewTarget({ akunId: '', nilaiTarget: 0, nilaiRealisasi: 0, satuan: 'Rupiah', bulanProyeksi: '2026-07' });
      setIsTargetModalOpen(false);
    };

    const reportPeriodLabel = reportData?.period_label || 'periode berjalan';
    const reportRows = () => {
      const income = reportData?.income_statement || {};
      const balance = reportData?.balance_sheet || {};
      const cashFlow = reportData?.cash_flow || {};
      if (activeReportType.value === 'labarugi') {
        const revenues = (income.revenue_items || []).map((item: any) => [
          `${item.code || ''} · ${item.name || 'Pendapatan'}`,
          'Pendapatan Operasional',
          formatRupiah(Number(item.amount || 0)),
        ]);
        const expenses = (income.expense_items || []).map((item: any) => [
          `${item.code || ''} · ${item.name || 'Beban'}`,
          'Beban Operasional',
          `(${formatRupiah(Number(item.amount || 0))})`,
        ]);
        return {
          title: 'Laporan Laba Rugi',
          subtitle: `Masa laporan ${reportPeriodLabel}`,
          columns: ['Kode / Uraian', 'Kelompok', 'Nilai'],
          rows: [...revenues, ...expenses],
          totals: [
            ['Total Pendapatan Operasional', formatRupiah(Number(income.total_revenue || 0))],
            ['Total Beban Operasional', `(${formatRupiah(Number(income.total_expense || 0))})`],
            ['Laba Bersih Berjalan', formatRupiah(Number(income.net_profit || 0))],
          ],
        };
      }
      if (activeReportType.value === 'neraca') {
        const flatten = (items: any[], group: string) => (items || []).map((item: any) => [
          `${item.code || ''} · ${item.name || '-'}`,
          group,
          formatRupiah(Number(item.balance || 0)),
        ]);
        return {
          title: 'Laporan Posisi Keuangan',
          subtitle: `Per ${reportPeriodLabel} · Mata uang Rupiah`,
          columns: ['Kode / Uraian', 'Kelompok', 'Nilai'],
          rows: [
            ...flatten(balance.assets, 'Aset'),
            ...flatten(balance.liabilities, 'Kewajiban'),
            ...flatten(balance.equity, 'Ekuitas'),
          ],
          totals: [
            ['Total Aset', formatRupiah(Number(balance.total_assets || 0))],
            ['Total Kewajiban', formatRupiah(Number(balance.total_liabilities || 0))],
            ['Total Ekuitas', formatRupiah(Number(balance.total_equity || 0))],
          ],
        };
      }
      const cashRows = [
        ...(cashFlow.operating_items || []).map((item: any) => ['Operasional', item.description || '-', formatRupiah(Number(item.amount || 0))]),
        ...(cashFlow.investing_items || []).map((item: any) => ['Investasi', item.description || '-', formatRupiah(Number(item.amount || 0))]),
        ...(cashFlow.financing_items || []).map((item: any) => ['Pendanaan', item.description || '-', formatRupiah(Number(item.amount || 0))]),
      ];
      return {
        title: 'Laporan Arus Kas',
        subtitle: `Ringkasan arus kas ${reportPeriodLabel}`,
        columns: ['Aktivitas', 'Keterangan', 'Nilai'],
        rows: cashRows,
        totals: [
          ['Kenaikan Kas Bersih', formatRupiah(Number(cashFlow.net_cash_increase || 0))],
          ['Saldo Awal Kas', formatRupiah(Number(cashFlow.beginning_cash || 0))],
          ['Saldo Akhir Kas', formatRupiah(Number(cashFlow.ending_cash || 0))],
        ],
      };
    };
    const currentReport = computed(() => reportRows());
    return () => <div class="space-y-7 font-sans">
      <header class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div class="flex items-start gap-4">
          <span class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E5F5] bg-white text-[#0B1F4A] shadow-[0_8px_20px_rgba(11,31,74,0.05)]">
            {isForecast ? <TrendingUp class="h-5 w-5" /> : <FileSpreadsheet class="h-5 w-5" />}
          </span>
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Financial Planning & Reporting</p>
            <h1 class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]">
              {isForecast ? 'Proyeksi Bisnis Tahunan' : 'Laporan Keuangan'}
            </h1>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-[#6B7A90]">
              {isForecast ? 'Pantau target bisnis, realisasi performa, dan roadmap pertumbuhan finansial secara terstruktur.' : 'Tinjau laporan keuangan utama dalam format tabel yang siap digunakan untuk evaluasi manajemen.'}
            </p>
          </div>
        </div>
        <div class="flex w-full flex-wrap gap-3 lg:w-auto">
          {isForecast ? <button id="btn-open-target-modal" onClick={() => setIsTargetModalOpen(true)} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]">
              <Plus class="h-4 w-4" /> Tambah Target
            </button> : <>
              <button onClick={() => showToast('File Excel laporan sedang disiapkan.')} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-semibold text-[#0B1F4A] transition hover:bg-[#F8FBFE]">
                <Download class="h-4 w-4" /> Unduh Excel
              </button>
              <button id="btn-print-reports" onClick={() => setIsPrintModalOpen(true)} class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]">
                <Printer class="h-4 w-4" /> Cetak / Simpan PDF
              </button>
            </>}
        </div>
      </header>

      {isForecast ? <section class="space-y-5">
          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">FY2026 Business Target</p>
                <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">KPI Performance Targets</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Realisasi kumulatif dibanding target tahunan perusahaan.</p>
              </div>
              <div class="inline-flex w-fit items-center gap-3 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-2.5">
                <Target class="h-4 w-4 text-[#1E5AA8]" />
                <span class="text-xs text-[#6B7A90]">Rata-rata capaian</span>
                <span class="text-sm font-semibold text-[#0B1F4A]">{achievementAverage.value}%</span>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[820px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr>
                    <th class="px-6 py-4">Target Bisnis</th>
                    <th class="px-6 py-4 text-right">Target Tahunan</th>
                    <th class="px-6 py-4 text-right">Realisasi</th>
                    <th class="px-6 py-4">Progress</th>
                    <th class="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {targets.value.map(target => {
                  const percent = Math.min(100, Math.round(target.nilaiRealisasi / Math.max(target.nilaiTarget, 1) * 100));
                  return <tr key={target.id} class="hover:bg-[#FBFDFF]">
                        <td class="px-6 py-5">
                          <p class="font-semibold text-[#182338]">{target.nama}</p>
                          <p class="mt-1 text-xs text-[#8A98AB]">ID Target: {target.id}</p>
                        </td>
                        <td class="px-6 py-5 text-right font-medium text-[#0B1F4A]">{currencyOrUnit(target.nilaiTarget, target.satuan)}</td>
                        <td class="px-6 py-5 text-right font-semibold text-[#1E5AA8]">{currencyOrUnit(target.nilaiRealisasi, target.satuan)}</td>
                        <td class="px-6 py-5">
                          <div class="flex min-w-[160px] items-center gap-3">
                            <div class="h-2 flex-1 overflow-hidden rounded-full bg-[#E8EEF7]">
                              <div class="h-full rounded-full bg-[#1E5AA8]" style={{
                            width: `${percent}%`
                          }} />
                            </div>
                            <span class="w-10 text-right text-xs font-semibold text-[#0B1F4A]">{percent}%</span>
                          </div>
                        </td>
                        <td class="px-6 py-5 text-right">
                          <span class="inline-flex rounded-full border border-[#CFE0F4] bg-[#EEF5FC] px-3 py-1 text-[10px] font-semibold text-[#0B1F4A]">On track</span>
                        </td>
                      </tr>;
                })}
                </tbody>
              </table>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Financial Growth Roadmap</p>
                <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Roadmap Pertumbuhan Finansial</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Proyeksi pertumbuhan bisnis lima tahun dalam miliar Rupiah.</p>
              </div>
              <div class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3.5 py-2 text-xs font-semibold text-[#0B1F4A]">
                <BarChart3 class="h-4 w-4 text-[#1E5AA8]" /> Target Tahun 5 · Rp 15B
              </div>
            </div>

            <div class="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
              <div class="rounded-2xl border border-[#E2EBF6] bg-[#FBFDFF] p-4">
                <div class="relative h-[300px] overflow-hidden rounded-xl">
                  {[20, 40, 60, 80].map(top => <span key={top} class="absolute inset-x-0 border-t border-dashed border-[#DCE7F4]" style={{
                  top: `${top}%`
                }} />)}
                  <svg viewBox="0 0 100 100" class="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
                    <path d="M8 79 C15 79, 20 74, 26 67 S43 52, 51 41 S64 35, 72 29 S86 19, 92 14 L92 92 L8 92 Z" fill="#EAF2FC" />
                    <path d="M8 79 C15 79, 20 74, 26 67 S43 52, 51 41 S64 35, 72 29 S86 19, 92 14" fill="none" stroke="#0B1F4A" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M8 68 C24 65, 37 62, 51 59 S74 55, 92 58" fill="none" stroke="#6B7A90" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
                    {growthRows.map((point, index) => <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r={index === growthRows.length - 1 ? 2.6 : 2.1} fill="#1E5AA8" stroke="white" strokeWidth="1.2" />
                        <text x={point.x} y={Math.max(8, point.y - 6)} textAnchor="middle" fontSize="3.2" fill="#50637E" fontWeight="600">{point.label}</text>
                        <text x={point.x} y={Math.min(96, point.y + 8)} textAnchor="middle" fontSize="3" fill="#1E5AA8" fontWeight="700">Rp {point.value}B</text>
                      </g>)}
                  </svg>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6B7A90]">
                  <span class="inline-flex items-center gap-2"><i class="h-2 w-2 rounded-full bg-[#0B1F4A]" /> Roadmap pertumbuhan</span>
                  <span class="inline-flex items-center gap-2"><i class="h-2 w-2 rounded-full bg-[#6B7A90]" /> Batas beban tahunan</span>
                </div>
              </div>

              <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-[#FBFDFF]">
                <div class="border-b border-[#E8EEF7] px-5 py-4">
                  <h3 class="text-sm font-semibold text-[#0B1F4A]">Milestone Tahunan</h3>
                  <p class="mt-1 text-xs text-[#6B7A90]">Ringkasan target roadmap</p>
                </div>
                <div class="divide-y divide-[#E8EEF7]">
                  {growthRows.map(item => <div key={item.label} class="flex items-center justify-between px-5 py-4">
                      <span class="text-sm font-medium text-[#182338]">{item.label}</span>
                      <span class="text-sm font-semibold text-[#0B1F4A]">Rp {item.value}B</span>
                    </div>)}
                </div>
              </div>
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-[#0B1F4A]">Catatan & Target Akun</h2>
                <p class="mt-1 text-sm text-[#6B7A90]">Daftar target yang terhubung dengan akun buku besar dan rencana periode mendatang.</p>
              </div>
              <span class="text-xs font-medium text-[#6B7A90]">{proyek.length} proyek terhubung · {transaksi.length} jurnal tersedia</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr><th class="px-6 py-4">Akun / Target</th><th class="px-6 py-4">Bulan Proyeksi</th><th class="px-6 py-4 text-right">Nilai Target</th><th class="px-6 py-4">Catatan Finansial</th></tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {targets.value.map((target, index) => <tr key={`${target.id}-detail`} class="hover:bg-[#FBFDFF]">
                      <td class="px-6 py-4"><p class="font-medium text-[#182338]">{target.nama}</p><p class="mt-1 text-xs text-[#8A98AB]">{target.id}</p></td>
                      <td class="px-6 py-4 text-[#53658A]">{index % 2 === 0 ? 'Juli 2026' : 'Agustus 2026'}</td>
                      <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">{currencyOrUnit(target.nilaiTarget, target.satuan)}</td>
                      <td class="px-6 py-4 text-[#6B7A90]">Dipantau bersama realisasi dan arus kas operasional.</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </section> : <section class="space-y-5">
          <div class="rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="flex flex-col gap-2 sm:flex-row">
              {reportTabs.map(tab => <button key={tab.id} id={`report-type-${tab.id}`} onClick={() => setActiveReportType(tab.id)} class={`flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition ${activeReportType.value === tab.id ? 'bg-[#0B1F4A] text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)]' : 'text-[#53658A] hover:bg-[#F4F8FC] hover:text-[#0B1F4A]'}`}>
                  {tab.label}
                </button>)}
            </div>
          </div>

          <div class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]">
            <div class="border-b border-[#E8EEF7] px-6 py-6 text-center">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]">Financial Statement</p>
              <h2 class="mt-2 text-xl font-semibold text-[#0B1F4A]">{currentReport.value.title}</h2>
              <p class="mt-1 text-sm text-[#6B7A90]">{currentReport.value.subtitle}</p>
              <p class="mt-2 text-xs text-[#8A98AB]">PT Kedata Indonesia Digital · Mata Uang Rupiah (Rp)</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]">
                  <tr>{currentReport.value.columns.map((column, index) => <th key={column} class={`px-6 py-4 ${index === 2 ? 'text-right' : ''}`}>{column}</th>)}</tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7]">
                  {currentReport.value.rows.map(row => <tr key={row.join('-')} class="hover:bg-[#FBFDFF]">
                      <td class="px-6 py-4 font-medium text-[#182338]">{row[0]}</td>
                      <td class="px-6 py-4 text-[#6B7A90]">{row[1]}</td>
                      <td class={`px-6 py-4 text-right font-semibold ${row[2].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`}>{row[2]}</td>
                    </tr>)}
                </tbody>
                <tfoot class="border-t border-[#DCE7F4] bg-[#EEF5FC]">
                  {currentReport.value.totals.map((total, index) => <tr key={total[0]} class={index === currentReport.value.totals.length - 1 ? 'bg-[#E4F0FF]' : ''}>
                      <td colSpan={2} class="px-6 py-4 text-sm font-semibold text-[#0B1F4A]">{total[0]}</td>
                      <td class={`px-6 py-4 text-right text-sm font-semibold ${total[1].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`}>{total[1]}</td>
                    </tr>)}
                </tfoot>
              </table>
            </div>
          </div>
        </section>}

      {isTargetModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm">
          <div class="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] border border-[#DCE7F4] bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]">
            <div class="flex items-start justify-between border-b border-[#E8EEF7] px-7 py-6">
              <div class="flex items-start gap-3">
                <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#0B1F4A]"><Target class="h-5 w-5" /></span>
                <div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Business Planning</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Tambah Target Proyeksi</h3><p class="mt-1 text-sm text-[#6B7A90]">Tetapkan target yang dapat dipantau bersama realisasi.</p></div>
              </div>
              <button onClick={() => setIsTargetModalOpen(false)} class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB] hover:bg-[#F8FBFE]"><X class="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveTarget} class="flex-1 overflow-y-auto px-7 py-6">
              <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 md:col-span-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Akun Buku Besar</span><select required value={newTarget.value.akunId} onChange={event => setNewTarget({
                  ...newTarget.value,
                  akunId: event.target.value
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"><option value="">Pilih akun buku besar</option>{akun.map(item => <option key={item.id} value={item.id}>{item.kode} · {item.nama}</option>)}</select></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Target Nilai</span><input type="number" min="0" required value={newTarget.value.nilaiTarget || ''} onChange={event => setNewTarget({
                  ...newTarget.value,
                  nilaiTarget: Number(event.target.value)
                })} placeholder="0" class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Satuan</span><select value={newTarget.value.satuan} onChange={event => setNewTarget({
                  ...newTarget.value,
                  satuan: event.target.value as AnnualTarget['satuan']
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"><option value="Rupiah">Rupiah</option><option value="Persen">Persen</option><option value="Klien">Klien</option></select></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Realisasi Saat Ini</span><input type="number" min="0" value={newTarget.value.nilaiRealisasi || ''} onChange={event => setNewTarget({
                  ...newTarget.value,
                  nilaiRealisasi: Number(event.target.value)
                })} placeholder="0" class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
                <label class="space-y-2"><span class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]">Bulan Proyeksi</span><input type="month" value={newTarget.value.bulanProyeksi} onChange={event => setNewTarget({
                  ...newTarget.value,
                  bulanProyeksi: event.target.value
                })} class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]" /></label>
              </div>
              <div class="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8EEF7] pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsTargetModalOpen(false)} class="h-11 rounded-xl border border-[#D8E5F4] bg-white px-5 text-sm font-medium text-[#53658A]">Batal</button><button type="submit" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]"><CheckCircle2 class="h-4 w-4" /> Simpan Target</button></div>
            </form>
          </div>
        </div>}

      {isPrintModalOpen.value && <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm">
          <div class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]">
            <div class="flex items-center justify-between border-b border-[#E8EEF7] px-7 py-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]">Print Preview</p><h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">Pratinjau Laporan Keuangan</h3></div><button onClick={() => setIsPrintModalOpen(false)} class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB]"><X class="h-5 w-5" /></button></div>
            <div class="flex-1 overflow-y-auto p-8"><div class="border border-slate-200 p-8"><div class="border-b-2 border-[#0B1F4A] pb-4 text-center"><h4 class="text-lg font-semibold text-[#0B1F4A]">PT KEDATA INDONESIA DIGITAL</h4><p class="mt-1 text-xs text-[#6B7A90]">Laporan {currentReport.value.title} · Juni 2026</p></div><table class="mt-6 w-full text-left text-sm"><thead class="border-b border-slate-300 text-xs uppercase text-slate-500"><tr><th class="py-3">Uraian</th><th class="py-3">Kelompok</th><th class="py-3 text-right">Nilai</th></tr></thead><tbody>{currentReport.value.rows.map(row => <tr key={row.join('-')} class="border-b border-slate-100"><td class="py-3">{row[0]}</td><td class="py-3">{row[1]}</td><td class="py-3 text-right">{row[2]}</td></tr>)}</tbody></table><div class="mt-6 space-y-2 border-t border-slate-300 pt-4">{currentReport.value.totals.map(total => <div key={total[0]} class="flex justify-between font-semibold"><span>{total[0]}</span><span>{total[1]}</span></div>)}</div></div></div>
            <div class="flex justify-end gap-3 border-t border-[#E8EEF7] px-7 py-5"><button onClick={() => setIsPrintModalOpen(false)} class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-sm font-medium text-[#53658A]">Tutup</button><button onClick={() => showToast('Laporan siap disimpan sebagai PDF.')} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-sm font-semibold text-white"><Printer class="h-4 w-4" /> Simpan PDF</button></div>
          </div>
        </div>}
    </div>;
  }
});
</script>
