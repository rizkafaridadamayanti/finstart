<script lang="tsx">
import { Fragment, computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { ArrowUpRight, Briefcase, Calendar, Clock, FileText, Landmark, PieChart, Send, TrendingUp, Users, Plus, Trash2, Bot, X, PanelRightOpen } from "lucide-vue-next";
import { formatRupiah } from '../data.ts';
import { AkunBukuBesar, Klien, Langganan, Proyek, Transaksi } from '../types.ts';
interface DashboardViewProps {
  proyek: Proyek[];
  klien: Klien[];
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  langganan: Langganan[];
  dashboard?: any;
  invoices?: any[];
  bills?: any[];
  assets?: any[];
  taxes?: any[];
  pegawai?: any[];
  projectionData?: any;
  reportData?: any;
  setActiveTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
}
type InsightMessage = {
  sender: 'ai' | 'user';
  text: string;
  id: string;
};
type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: InsightMessage[];
};
const CFO_CHAT_STORAGE_KEY = 'finstart-cfo-copilot-sessions-v1';
const defaultInsightMessage: InsightMessage = {
  id: 'welcome',
  sender: 'ai',
  text: 'Halo, saya Finstart CFO Copilot. Saya membaca alur operasional dan keuangan FinStart: CRM proyek, buku besar, jurnal, piutang, utang, pajak, SDM, aset, langganan, proyeksi, dan laporan.'
};
const initialChatSessions: ChatSession[] = [{
  id: 'chat-current',
  title: 'Prioritas kas & piutang',
  updatedAt: 'Baru saja',
  messages: [{
    id: 'welcome',
    sender: 'ai',
    text: 'Prioritas bulan ini adalah percepatan penagihan piutang dan penyetoran PPN. Kas operasional tetap sehat, namun terdapat dua invoice yang membutuhkan tindak lanjut sebelum pertengahan bulan.'
  }]
}, {
  id: 'chat-pajak',
  title: 'Analisis kewajiban pajak',
  updatedAt: 'Hari ini',
  messages: [{
    id: 'pajak-1',
    sender: 'ai',
    text: 'Ringkasan sebelumnya: PPh 21 dan PPN perlu dipantau sebelum jatuh tempo agar status kepatuhan tetap patuh.'
  }]
}, {
  id: 'chat-burn',
  title: 'Optimasi burn rate digital',
  updatedAt: 'Kemarin',
  messages: [{
    id: 'burn-1',
    sender: 'ai',
    text: 'Ringkasan sebelumnya: evaluasi langganan dengan utilisasi rendah dan tinjau pengeluaran cloud bulanan.'
  }]
}];
const quickQuestions = [{
  id: 'flow',
  label: 'Baca alur finance end-to-end',
  prompt: 'Baca semua alur aplikasi dari operasional sampai keuangan, lalu beri prioritas tindakan minggu ini.'
}, {
  id: 'cash',
  label: 'Prioritas kas dan piutang',
  prompt: 'Analisis prioritas kas, piutang, dan invoice yang perlu ditagih bulan ini.'
}, {
  id: 'tax',
  label: 'Analisis kewajiban pajak',
  prompt: 'Analisis kewajiban perpajakan dan risiko kepatuhan berdasarkan data pajak dan jurnal.'
}, {
  id: 'burn',
  label: 'Optimasi burn rate digital',
  prompt: 'Berapa pengeluaran langganan rutin digital kita dan bagaimana cara optimasinya?'
}, {
  id: 'project',
  label: 'Status proyek ke invoice',
  prompt: 'Cek proyek aktif, klien, nilai kontrak, dan peluang invoice yang perlu diterbitkan.'
}, {
  id: 'payable',
  label: 'Risiko utang vendor',
  prompt: 'Analisis utang vendor, jadwal pembayaran, dan dampaknya ke kas operasional.'
}, {
  id: 'people',
  label: 'SDM dan payroll',
  prompt: 'Ringkas kondisi SDM, payroll, dan kepatuhan karyawan yang perlu dipantau.'
}, {
  id: 'asset',
  label: 'Aset dan depresiasi',
  prompt: 'Analisis aset, nilai buku, langganan, dan pengeluaran operasional rutin.'
}];
function cloneChatSessions(sessions: ChatSession[] = initialChatSessions) {
  return sessions.map(session => ({
    ...session,
    messages: session.messages.map(message => ({ ...message }))
  }));
}
function loadStoredChatSessions() {
  if (typeof window === 'undefined') return cloneChatSessions();
  try {
    const stored = JSON.parse(window.localStorage.getItem(CFO_CHAT_STORAGE_KEY) || '[]');
    if (Array.isArray(stored) && stored.length) {
      return cloneChatSessions(stored.filter((session: any) => session?.id && Array.isArray(session.messages)).slice(0, 12));
    }
  } catch {
    return cloneChatSessions();
  }
  return cloneChatSessions();
}
const fallbackCashflow = [{
  month: 'Jan',
  income: 380,
  expense: 220
}, {
  month: 'Feb',
  income: 420,
  expense: 250
}, {
  month: 'Mar',
  income: 310,
  expense: 280
}, {
  month: 'Apr',
  income: 550,
  expense: 290
}, {
  month: 'Mei',
  income: 680,
  expense: 310
}, {
  month: 'Jun',
  income: 720,
  expense: 340
}];
function MetricCard({
  label,
  value,
  detail,
  tone,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'green' | 'amber' | 'purple';
  icon: any;
}) {
  const styleByTone = {
    blue: 'bg-[#EAF4FF] text-[#1E5AA8] ring-[#B9D9F8]',
    green: 'bg-[#EAFBF3] text-[#0E9F6E] ring-[#BCEBD5]',
    amber: 'bg-[#FFF7E8] text-[#D48A00] ring-[#F7DCA3]',
    purple: 'bg-[#F7F0FF] text-[#8B2CF5] ring-[#D8C4FA]'
  };
  return <div class="dashboard-surface dashboard-lift group overflow-hidden rounded-2xl p-5">
      <div class="flex items-start justify-between gap-3">
        <p class="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#7A8CA8]">{label}</p>
        <div class={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ${styleByTone[tone]}`}>
          <Icon class="h-[18px] w-[18px]" />
        </div>
      </div>
      <div class="mt-5">
        <p class="text-[25px] font-semibold tracking-[-0.02em] text-[#102A56]">{value}</p>
        <p class="mt-2 flex items-center gap-1.5 text-[12px] leading-5 text-[#6B7A90]">
          <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ECFBF4] text-[#0E9F6E]">
            <TrendingUp class="h-2.5 w-2.5" />
          </span>
          {detail}
        </p>
      </div>
    </div>;
}
function MiniSummary({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: 'navy' | 'blue' | 'green';
}) {
  const toneClass = {
    navy: 'border-[#DCE7F4] bg-[#F9FBFE] text-[#102A56]',
    blue: 'border-[#D7E8FA] bg-[#F4F9FF] text-[#1E5AA8]',
    green: 'border-[#D5F0E1] bg-[#F1FBF6] text-[#16885B]'
  };
  return <div class={`dashboard-row rounded-xl border px-4 py-3 ${toneClass[tone]}`}>
      <p class="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">{label}</p>
      <p class="mt-1 text-sm font-semibold">{value}</p>
    </div>;
}
export default defineComponent({
  name: "DashboardView",
  props: ["proyek", "klien", "akun", "transaksi", "langganan", "dashboard", "invoices", "bills", "assets", "taxes", "pegawai", "projectionData", "reportData", "setActiveTab", "onQuickAction"],
  setup(props) {
    const {
      proyek,
      klien,
      akun,
      transaksi,
      langganan,
      dashboard,
      invoices,
      bills,
      assets,
      taxes,
      pegawai,
      projectionData,
      reportData,
      setActiveTab,
      onQuickAction
    }: DashboardViewProps = props;
    const initialSessions = loadStoredChatSessions();
    const chatSessions = ref(initialSessions),
      setChatSessions = next => chatSessions.value = typeof next === "function" ? next(chatSessions.value) : next;
    const activeChatId = ref(initialSessions[0]?.id || initialChatSessions[0].id),
      setActiveChatId = next => activeChatId.value = typeof next === "function" ? next(activeChatId.value) : next;
    const inputMessage = ref(''),
      setInputMessage = next => inputMessage.value = typeof next === "function" ? next(inputMessage.value) : next;
    const isAiLoading = ref(false),
      setIsAiLoading = next => isAiLoading.value = typeof next === "function" ? next(isAiLoading.value) : next;
    // Riwayat adalah panel lokal di dalam kartu AI CFO, bukan drawer global halaman.
    const isChatHistoryOpen = ref(false),
      setIsChatHistoryOpen = (next: any) => isChatHistoryOpen.value = typeof next === "function" ? next(isChatHistoryOpen.value) : next;
    const aiCardRef = ref(null);
    const chatScrollRef = ref(null);
    const chatInputRef = ref(null);
    const pendingScrollMessageId = ref('');
    const activeChat = computed(() => chatSessions.value.find(session => session.id === activeChatId.value) || chatSessions.value[0]);
    const messages = computed(() => activeChat.value?.messages || []);
    const scrollChatToLatestMessage = async () => {
      await nextTick();
      const element = chatScrollRef.value as HTMLElement | null;
      if (!element) return;
      const targetId = pendingScrollMessageId.value || messages.value[messages.value.length - 1]?.id;
      const target = targetId
        ? element.querySelector(`[data-cfo-message-id="${targetId}"]`) as HTMLElement | null
        : null;
      if (!target) {
        element.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const offset = target.getBoundingClientRect().top - element.getBoundingClientRect().top + element.scrollTop - 12;
      element.scrollTo({
        top: Math.max(offset, 0),
        behavior: 'smooth'
      });
      pendingScrollMessageId.value = '';
    };
    const closeChatHistory = () => setIsChatHistoryOpen(false);
    const toggleChatHistory = () => setIsChatHistoryOpen((open: boolean) => !open);
    const handleChatHistoryEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeChatHistory();
    };
    onMounted(() => {
      scrollChatToLatestMessage();
      if (typeof window !== 'undefined') window.addEventListener('keydown', handleChatHistoryEscape);
    });
    onUnmounted(() => {
      if (typeof window !== 'undefined') window.removeEventListener('keydown', handleChatHistoryEscape);
    });
    watch(chatSessions, sessions => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CFO_CHAT_STORAGE_KEY, JSON.stringify(sessions.slice(0, 12)));
      }
    }, { deep: true });
    watch(() => messages.value.length, scrollChatToLatestMessage);
    const keepFocusOnAiForm = async () => {
      await nextTick();
      const card = aiCardRef.value as HTMLElement | null;
      const input = chatInputRef.value as HTMLInputElement | null;
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      input?.focus({ preventScroll: true });
    };
    const selectChatHistory = async (chatId: string) => {
      setActiveChatId(chatId);
      closeChatHistory();
      await keepFocusOnAiForm();
      scrollChatToLatestMessage();
    };
    const createNewChat = () => {
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: 'Chat baru',
        updatedAt: 'Baru saja',
        messages: [{
          ...defaultInsightMessage,
          id: `welcome-${Date.now()}`
        }]
      };
      setChatSessions(previous => [newSession, ...previous]);
      setActiveChatId(newSession.id);
      setInputMessage('');
      closeChatHistory();
      keepFocusOnAiForm();
    };
    const clearActiveChat = () => {
      setChatSessions(previous => previous.map(session => session.id === activeChatId.value ? {
        ...session,
        title: 'Chat baru',
        updatedAt: 'Baru saja',
        messages: [{
          ...defaultInsightMessage,
          id: `clear-${Date.now()}`
        }]
      } : session));
    };
    const deleteChat = (chatId: string) => {
      if (chatSessions.value.length === 1) {
        clearActiveChat();
        return;
      }
      const remaining = chatSessions.value.filter(session => session.id !== chatId);
      setChatSessions(remaining);
      if (activeChatId.value === chatId) {
        setActiveChatId(remaining[0].id);
      }
    };
    const appendMessageToChat = (chatId: string, message: InsightMessage, titleFromPrompt?: string) => {
      pendingScrollMessageId.value = message.id;
      setChatSessions(previous => previous.map(session => session.id === chatId ? {
        ...session,
        title: titleFromPrompt || session.title,
        updatedAt: 'Baru saja',
        messages: [...session.messages, message]
      } : session));
    };
    const handleFastQuestion = async (prompt: string) => {
      if (isAiLoading.value) return;
      const targetChatId = activeChatId.value;
      const shouldUpdateTitle = activeChat.value?.title === 'Chat baru';
      const generatedTitle = prompt.length > 34 ? `${prompt.slice(0, 34)}...` : prompt;
      appendMessageToChat(targetChatId, {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: prompt
      }, shouldUpdateTitle ? generatedTitle : undefined);
      setIsAiLoading(true);
      window.setTimeout(() => {
        appendMessageToChat(targetChatId, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: buildCfoReply(prompt)
        });
        setIsAiLoading(false);
      }, 360);
    };
    const handleSendMessage = (event: Event) => {
      event.preventDefault();
      if (!inputMessage.value.trim()) return;
      const prompt = inputMessage.value;
      setInputMessage('');
      handleFastQuestion(prompt);
    };
    const renderMessageText = (text: string, sender: InsightMessage['sender']) => {
      const textClass = sender === 'user' ? 'text-[#0B1F4A]' : 'text-[#213B61]';
      const emphasisClass = 'text-[#0B1F4A]';
      return text.split('\n').map((line, index) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          return <li key={`${line}-${index}`} class={`ml-4 list-disc pl-1 text-[12px] leading-5 ${textClass}`}>
            {parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex} class={`font-semibold ${emphasisClass}`}>
                  {part.slice(2, -2)}
                </strong> : <span key={partIndex}>{part}</span>)}
          </li>;
        }
        return <p key={`${line}-${index}`} class={`text-[12px] leading-5 ${textClass}`}>
          {parts.map((part, partIndex) => part.startsWith('**') && part.endsWith('**') ? <strong key={partIndex} class={`font-semibold ${emphasisClass}`}>
                {part.slice(2, -2)}
              </strong> : <span key={partIndex}>{part}</span>)}
        </p>;
      });
    };
    const dashboardData = dashboard || {};
    const fallbackCash = akun.filter(account => account.tipe === 'Aset' && ['1110', '1120'].includes(account.kode)).reduce((sum, account) => sum + Number(account.saldo || 0), 0);
    const totalKasBank = Number(dashboardData.cash_balance ?? fallbackCash ?? 0);
    const ongoingProjectsCount = Number(dashboardData.active_projects ?? proyek.filter(project => project.status === 'Ongoing').length);
    const activeClientsCount = klien.length;
    const monthlySubscriptionBurn = langganan.reduce((total, item) => total + Number(item.biayaIDR || 0), 0);
    const totalRevenue = Number(dashboardData.total_revenue || 0);
    const netProfit = Number(dashboardData.net_profit || 0);
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
    const normalizedCashflow = Array.isArray(dashboardData.cashflow_series) && dashboardData.cashflow_series.length
      ? dashboardData.cashflow_series.map((item: any) => ({
          month: item.short_label || item.label || item.month || '-',
          income: Number(item.income || 0) / 1000000,
          expense: Number(item.expense || 0) / 1000000,
          incomeRaw: Number(item.income || 0),
          expenseRaw: Number(item.expense || 0),
        }))
      : [];
    const monthlyCashflow = normalizedCashflow.length ? normalizedCashflow : [{ month: '-', income: 0, expense: 0, incomeRaw: 0, expenseRaw: 0 }];
    const latestTransactions = transaksi.slice(0, 3);
    const ongoingProjects = proyek.filter(project => project.status === 'Ongoing').slice(0, 3);
    const actionInvoices = (invoices || []).filter((item: any) => item.status !== 'Paid').slice(0, 2);
    const openInvoices = (invoices || []).filter((item: any) => item.status !== 'Paid');
    const overdueInvoices = openInvoices.filter((item: any) => item.status === 'Overdue');
    const openBills = (bills || []).filter((item: any) => item.status !== 'Lunas');
    const unpaidTaxes = (taxes || []).filter((item: any) => item.status !== 'Sudah Setor');
    const totalReceivable = Number(dashboardData.total_receivable || openInvoices.reduce((sum: number, item: any) => sum + Number(item.outstandingAmount || item.nominal || 0), 0));
    const totalPayable = Number(dashboardData.total_payable || openBills.reduce((sum: number, item: any) => sum + Number(item.outstandingAmount || item.nominal || 0), 0));
    const totalAssetsBookValue = (assets || []).reduce((sum: number, item: any) => sum + Number(item.nilaiBuku || item.hargaBeli || 0), 0);
    const monthlyPayroll = (pegawai || []).reduce((sum: number, item: any) => sum + Number(item.gajiBersih || 0), 0);
    const projectionSummary = projectionData?.summary || {};
    const reportSummary = reportData || {};
    function formatCount(count: number, label: string) {
      return `${count.toLocaleString('id-ID')} ${label}`;
    }
    function buildCfoContextIntro() {
      return [
        `- Operasional CRM: ${formatCount(klien.length, 'klien')} dan ${formatCount(proyek.length, 'proyek')} (${formatCount(ongoingProjectsCount, 'ongoing')}).`,
        `- Buku besar dan jurnal: ${formatCount(akun.length, 'akun COA')} dan ${formatCount(transaksi.length, 'jurnal/transaksi')}.`,
        `- Piutang: ${formatRupiah(totalReceivable)} dari ${formatCount(openInvoices.length, 'invoice terbuka')} (${formatCount(overdueInvoices.length, 'overdue')}).`,
        `- Utang vendor: ${formatRupiah(totalPayable)} dari ${formatCount(openBills.length, 'tagihan terbuka')}.`,
        `- Pajak: ${formatCount(unpaidTaxes.length, 'kewajiban belum setor')} dengan nilai ${formatRupiah(unpaidTaxes.reduce((sum: number, item: any) => sum + Number(item.nominal || 0), 0))}.`,
        `- SDM dan operasional rutin: payroll estimasi ${formatRupiah(monthlyPayroll)} dan langganan ${formatRupiah(monthlySubscriptionBurn)}/bulan.`,
        `- Aset dan laporan: ${formatCount((assets || []).length, 'aset')} bernilai buku ${formatRupiah(totalAssetsBookValue)}; data proyeksi ${projectionSummary.year || projectionData?.year || 'tahun berjalan'} terhubung.`
      ];
    }
    function buildCfoReply(prompt: string) {
      const text = prompt.toLowerCase();
      const netCashPosition = totalKasBank + totalReceivable - totalPayable;
      const risk = overdueInvoices.length || unpaidTaxes.length || totalPayable > totalKasBank
        ? 'Perlu tindakan terarah minggu ini.'
        : 'Masih terkendali, tetapi tetap perlu monitoring rutin.';
      const baseSummary = [
        '**Ringkasan CFO Copilot**',
        `- Posisi kas: ${formatRupiah(totalKasBank)} dengan estimasi posisi setelah piutang dan utang ${formatRupiah(netCashPosition)}.`,
        `- Margin laba berjalan: ${profitMargin.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% dari pendapatan ${formatRupiah(totalRevenue)}.`,
        `- Sinyal risiko: ${risk}`
      ];
      if (/(pajak|ppn|pph|tax|setor|kepatuhan)/.test(text)) {
        return [
          '**Analisis pajak dan kepatuhan**',
          `- Kewajiban belum setor: ${formatCount(unpaidTaxes.length, 'item')} senilai ${formatRupiah(unpaidTaxes.reduce((sum: number, item: any) => sum + Number(item.nominal || 0), 0))}.`,
          `- Pajak perlu dicek terhadap jurnal pendapatan dan beban terbaru: ${formatCount(transaksi.length, 'transaksi')}.`,
          '- Prioritas: validasi PPN keluaran dari invoice, cek PPh terkait payroll/vendor, lalu jadwalkan setoran sebelum jatuh tempo.',
          '- Risiko: jika invoice sudah issued tetapi pajak belum disiapkan, kas bisa terlihat sehat namun kewajiban bulan berjalan tertahan.'
        ].join('\n');
      }
      if (/(piutang|invoice|tagih|receivable|kas|cash|bank)/.test(text)) {
        const largestInvoice = [...openInvoices].sort((a: any, b: any) => Number(b.outstandingAmount || b.nominal || 0) - Number(a.outstandingAmount || a.nominal || 0))[0];
        return [
          '**Prioritas kas dan piutang**',
          `- Kas tersedia: ${formatRupiah(totalKasBank)}.`,
          `- Piutang terbuka: ${formatRupiah(totalReceivable)} dari ${formatCount(openInvoices.length, 'invoice')}; overdue ${formatCount(overdueInvoices.length, 'invoice')}.`,
          largestInvoice ? `- Invoice terbesar untuk follow-up: ${largestInvoice.klienNama || '-'} ${formatRupiah(largestInvoice.outstandingAmount || largestInvoice.nominal || 0)} (${largestInvoice.nomor || '-'}).` : '- Tidak ada invoice terbuka yang perlu ditagih.',
          '- Tindakan: urutkan follow-up dari nominal terbesar, kirim reminder H-7/H-3, dan cocokkan pembayaran dengan jurnal kas masuk.'
        ].join('\n');
      }
      if (/(utang|vendor|bill|payable|bayar)/.test(text)) {
        const largestBill = [...openBills].sort((a: any, b: any) => Number(b.outstandingAmount || b.nominal || 0) - Number(a.outstandingAmount || a.nominal || 0))[0];
        return [
          '**Analisis utang vendor**',
          `- Utang terbuka: ${formatRupiah(totalPayable)} dari ${formatCount(openBills.length, 'tagihan')}.`,
          largestBill ? `- Tagihan paling besar: ${largestBill.vendor || '-'} ${formatRupiah(largestBill.outstandingAmount || largestBill.nominal || 0)} (${largestBill.nomorTagihan || '-'}).` : '- Tidak ada tagihan terbuka yang terlihat.',
          `- Rasio utang terhadap kas: ${totalKasBank > 0 ? `${(totalPayable / totalKasBank * 100).toLocaleString('id-ID', { maximumFractionDigits: 1 })}%` : 'kas belum tersedia'}.`,
          '- Tindakan: pisahkan vendor kritikal dan non-kritikal, jadwalkan pembayaran berdasarkan jatuh tempo, lalu posting pembayaran agar buku besar tetap bersih.'
        ].join('\n');
      }
      if (/(proyek|project|crm|klien|kontrak|invoice diterbitkan)/.test(text)) {
        const activeProjectValue = proyek.filter(project => project.status === 'Ongoing').reduce((sum, project) => sum + Number(project.nilaiKontrak || 0), 0);
        return [
          '**Alur proyek sampai invoice**',
          `- Klien aktif: ${formatCount(klien.length, 'klien')}; proyek ongoing: ${formatCount(ongoingProjectsCount, 'proyek')}.`,
          `- Nilai kontrak proyek ongoing: ${formatRupiah(activeProjectValue)}.`,
          `- Invoice terbuka saat ini: ${formatCount(openInvoices.length, 'invoice')} senilai ${formatRupiah(totalReceivable)}.`,
          '- Tindakan: cek milestone proyek yang selesai, terbitkan invoice termin, lalu pastikan jurnal pendapatan dan piutang terbentuk.'
        ].join('\n');
      }
      if (/(langganan|burn|operasional|aset|depresiasi|asset|saas|software)/.test(text)) {
        return [
          '**Operasional rutin, aset, dan burn rate**',
          `- Langganan bulanan: ${formatRupiah(monthlySubscriptionBurn)} dari ${formatCount(langganan.length, 'layanan')}.`,
          `- Aset tercatat: ${formatCount((assets || []).length, 'aset')} dengan nilai buku ${formatRupiah(totalAssetsBookValue)}.`,
          `- Beban bulan berjalan: ${formatRupiah(Number(dashboardData.monthly_expense || 0))}.`,
          '- Tindakan: matikan langganan tidak aktif, cocokkan biaya cloud/software ke proyek, dan cek depresiasi aset sebelum tutup buku.'
        ].join('\n');
      }
      if (/(sdm|pegawai|payroll|gaji|bpjs|karyawan)/.test(text)) {
        const reviewEmployees = (pegawai || []).filter((item: any) => item.compliance === 'Tinjauan').length;
        return [
          '**SDM dan payroll**',
          `- Pegawai tercatat: ${formatCount((pegawai || []).length, 'orang')}.`,
          `- Estimasi payroll: ${formatRupiah(monthlyPayroll)}.`,
          `- Status compliance tinjauan: ${formatCount(reviewEmployees, 'pegawai')}.`,
          '- Tindakan: validasi BPJS/PPh 21, posting jurnal payroll tepat waktu, dan cocokkan biaya tenaga kerja dengan proyek terkait.'
        ].join('\n');
      }
      if (/(laporan|proyeksi|forecast|target|neraca|laba rugi|arus kas)/.test(text)) {
        return [
          '**Laporan dan proyeksi**',
          `- Pendapatan tercatat: ${formatRupiah(totalRevenue)}; laba bersih: ${formatRupiah(netProfit)}.`,
          `- Target pendapatan proyeksi: ${formatRupiah(Number(projectionSummary.revenue_target || 0))}; realisasi: ${formatRupiah(Number(projectionSummary.revenue_actual || 0))}.`,
          `- Data laporan tersedia: ${Object.keys(reportSummary).length ? 'laba rugi, neraca, dan arus kas' : 'menunggu ringkasan laporan dari backend'}.`,
          '- Tindakan: bandingkan realisasi vs target, cek akun beban terbesar, dan pakai laporan arus kas untuk keputusan pembayaran vendor.'
        ].join('\n');
      }
      return [
        ...baseSummary,
        '',
        '**Konteks yang saya baca**',
        ...buildCfoContextIntro(),
        '',
        '**Prioritas tindakan**',
        '- Percepat penagihan invoice terbuka sebelum jadwal pembayaran vendor besar.',
        '- Tutup gap pajak dari invoice, payroll, dan vendor sebelum akhir periode.',
        '- Cocokkan proyek ongoing dengan milestone invoice agar pendapatan tidak tertunda.',
        '- Review langganan, aset, dan payroll sebagai beban operasional rutin.'
      ].join('\n');
    }
    const maxValue = Math.max(...monthlyCashflow.flatMap((item: any) => [item.income, item.expense]), 1);
    const chartX = (index: number) => monthlyCashflow.length <= 1 ? 260 : 24 + index * (472 / (monthlyCashflow.length - 1));
    const chartY = (value: number) => 168 - value / maxValue * 126;
    const incomePoints = monthlyCashflow.map((item, index) => ({ x: chartX(index), y: chartY(item.income) }));
    const expensePoints = monthlyCashflow.map((item, index) => ({ x: chartX(index), y: chartY(item.expense) }));
    const createCurvePath = (points: { x: number; y: number; }[]) => {
      if (!points.length) return '';
      return points.slice(1).reduce((path, point, index) => {
        const previousPoint = points[index];
        const middleX = (previousPoint.x + point.x) / 2;
        return `${path} C ${middleX} ${previousPoint.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
      }, `M ${points[0].x} ${points[0].y}`);
    };
    const incomePath = createCurvePath(incomePoints);
    const expensePath = createCurvePath(expensePoints);
    return () => <Fragment><main class="dashboard-view space-y-7 pb-4 md:pb-8">
      <section class="dashboard-hero rounded-3xl px-5 py-5 xl:flex xl:items-end xl:justify-between xl:gap-5">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">Financial Overview</p>
          <h1 class="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-[#102A56]">Ringkasan Keuangan</h1>
          <p class="mt-1.5 text-sm leading-6 text-[#6B7A90]">
            Pantau posisi kas, proyek aktif, piutang, dan agenda finance PT Kedata Indonesia Digital.
          </p>
        </div>

        <div class="mt-5 flex flex-wrap gap-2.5 xl:mt-0">
          <button id="dashboard-action-journal" type="button" onClick={() => onQuickAction('entri_jurnal')} class="dashboard-action inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white/90 px-4 text-sm font-medium text-[#102A56] transition hover:border-[#BFCFE2] hover:bg-white">
            <FileText class="h-4 w-4" />
            Entri Jurnal
          </button>
          <button id="dashboard-action-invoice" type="button" onClick={() => onQuickAction('buat_invoice')} class="dashboard-action inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white/90 px-4 text-sm font-medium text-[#102A56] transition hover:border-[#BFCFE2] hover:bg-white">
            <ArrowUpRight class="h-4 w-4" />
            Buat Invoice
          </button>
          <button id="dashboard-action-project" type="button" onClick={() => onQuickAction('tambah_proyek')} class="dashboard-action inline-flex h-11 items-center gap-2 rounded-xl bg-[#0B3A78] px-4 text-sm font-medium text-white transition hover:bg-[#082E61]">
            <Briefcase class="h-4 w-4" />
            Inisiasi Proyek
          </button>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Bank & Kas Lancar" value={formatRupiah(totalKasBank)} detail="+12,4% dibanding bulan lalu" tone="blue" icon={Landmark} />
        <MetricCard label="Proyek Berjalan" value={`${ongoingProjectsCount} Proyek`} detail={`Dari ${proyek.length} total inisiasi proyek`} tone="green" icon={Briefcase} />
        <MetricCard label="Klien Aktif" value={`${activeClientsCount} Klien`} detail="Mitra korporasi dan institusi" tone="amber" icon={Users} />
        <MetricCard label="Estimasi Net Profit" value={`${profitMargin.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% Margin`} detail="+4,2% dari target operasional" tone="purple" icon={PieChart} />
      </section>

      <section class="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <div class="min-w-0 space-y-6">
          <article class="dashboard-surface overflow-hidden rounded-2xl">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]">Cash Flow Performance</p>
                <h2 class="mt-1 text-lg font-semibold text-[#102A56]">Performa Arus Kas Operasional</h2>
              </div>
              <div class="flex items-center gap-3 text-[12px] text-[#6B7A90]">
                <span class="inline-flex items-center gap-1.5">
                  <span class="finance-chart-swatch finance-chart-swatch-primary" />
                  Pemasukan
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="finance-chart-swatch finance-chart-swatch-secondary" />
                  Pengeluaran
                </span>
                <span class="ml-1 rounded-full border border-[#DCE7F4] bg-[#F8FBFE] px-3 py-1.5 text-[11px] font-medium text-[#53658A]">
                  Jan – Jun 2026
                </span>
              </div>
            </div>

            <div class="px-6 pb-5 pt-4">
              <div class="finance-chart-shell min-w-0">
                <svg viewBox="0 0 520 190" class="modern-finance-chart h-auto w-full" aria-label="Grafik arus kas">
                  <defs>
                    <linearGradient id="dashboard-income-stroke" x1="24" x2="496" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="55%" stopColor="#0EA5E9" />
                      <stop offset="100%" stopColor="#14B8A6" />
                    </linearGradient>
                    <linearGradient id="dashboard-expense-stroke" x1="24" x2="496" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F43F5E" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                    <filter id="dashboard-line-glow" x="-10%" y="-30%" width="120%" height="160%">
                      <feGaussianBlur stdDeviation="2.4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {[32, 74, 116, 158].map(y => <line key={y} x1="0" y1={y} x2="520" y2={y} class="modern-chart-grid" />)}
                  <path d={expensePath} fill="none" stroke="url(#dashboard-expense-stroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-line modern-chart-line-secondary" filter="url(#dashboard-line-glow)" />
                  <path d={incomePath} fill="none" stroke="url(#dashboard-income-stroke)" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round" class="modern-chart-line modern-chart-line-primary" filter="url(#dashboard-line-glow)" />
                  {monthlyCashflow.map((item, index) => <g key={`${item.month}-${index}`}>
                      <circle cx={chartX(index)} cy={chartY(item.income)} r="5.2" fill="white" stroke="url(#dashboard-income-stroke)" strokeWidth="3" class="modern-chart-dot" style={{ animationDelay: `${0.48 + index * 0.07}s` }} />
                      <circle cx={chartX(index)} cy={chartY(item.expense)} r="4.7" fill="white" stroke="url(#dashboard-expense-stroke)" strokeWidth="2.8" class="modern-chart-dot" style={{ animationDelay: `${0.58 + index * 0.07}s` }} />
                      <text x={chartX(index)} y="183" class="fill-[#8291A8] text-[9px] font-medium" textAnchor="middle">
                        {item.month}
                      </text>
                    </g>)}
                </svg>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-3 border-t border-[#E8EEF7] pt-4 sm:grid-cols-3">
                <MiniSummary label={`Pemasukan ${monthlyCashflow[monthlyCashflow.length - 1]?.month || '-'}`} value={formatRupiah(monthlyCashflow[monthlyCashflow.length - 1]?.incomeRaw || 0)} tone="navy" />
                <MiniSummary label={`Pengeluaran ${monthlyCashflow[monthlyCashflow.length - 1]?.month || '-'}`} value={formatRupiah(monthlyCashflow[monthlyCashflow.length - 1]?.expenseRaw || 0)} tone="blue" />
                <MiniSummary label="Kenaikan Kas Bersih" value={formatRupiah(Number(dashboardData.monthly_income || 0) - Number(dashboardData.monthly_expense || 0))} tone="green" />
              </div>
            </div>
          </article>

          <article class="dashboard-surface rounded-2xl p-5">
            <div class="flex items-center justify-between gap-3 border-b border-[#E8EEF7] pb-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF2F4] text-[#D93858]">
                  <Clock class="h-[18px] w-[18px]" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-[#102A56]">Invoice Perlu Tindakan</h3>
                  <p class="mt-0.5 text-[11px] text-[#8190A5]">Jatuh tempo dan overdue</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveTab('piutang')} class="text-[12px] font-medium text-[#1E5AA8] transition hover:text-[#102A56]">
                Lihat Piutang
              </button>
            </div>

            <div class="mt-4 space-y-3">
              {actionInvoices.length ? actionInvoices.map((invoice: any) => <div key={invoice.id} class={`dashboard-row flex items-center justify-between gap-3 rounded-xl border p-3.5 ${invoice.status === 'Overdue' ? 'border-[#F9D6DE] bg-[#FFF8F9]' : 'border-[#E5EDF6] bg-[#FBFCFE]'}`}>
                  <div class="min-w-0">
                    <p class={`truncate text-sm font-medium ${invoice.status === 'Overdue' ? 'text-[#8C2640]' : 'text-[#1E2E47]'}`}>{invoice.klienNama}</p>
                    <p class={`mt-1 text-[11px] ${invoice.status === 'Overdue' ? 'text-[#BF5A72]' : 'text-[#8492A6]'}`}>{invoice.nomor} Â· {invoice.jatuhTempo}</p>
                  </div>
                  <div class="text-right">
                    <p class={`text-sm font-semibold ${invoice.status === 'Overdue' ? 'text-[#A92A47]' : 'text-[#102A56]'}`}>{formatRupiah(invoice.outstandingAmount || invoice.nominal)}</p>
                    <span class={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${invoice.status === 'Overdue' ? 'bg-[#FFE8ED] text-[#C53D5B]' : 'bg-[#EEF4FB] text-[#1E5AA8]'}`}>
                      {invoice.status === 'Overdue' ? 'Overdue' : 'Jatuh tempo'}
                    </span>
                  </div>
                </div>) : <div class="dashboard-row rounded-xl border border-dashed border-[#DCE7F4] bg-[#FBFCFE] p-4 text-center text-sm text-[#8190A5]">Tidak ada invoice terbuka.</div>}
            </div>
          </article>
        </div>

        <aside class="min-w-0">
          <section id="ai-cfo-card" ref={aiCardRef} class="cfo-shell cfo-shell-live relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border text-[#142033]">
            <div class="cfo-bg-gradient pointer-events-none absolute inset-0" />
            <div class="cfo-bg-grid pointer-events-none absolute inset-0" />

            <div class="cfo-hero relative z-10 overflow-hidden px-5 py-4">
              <div class="relative flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="cfo-hero-icon relative flex h-11 w-11 items-center justify-center rounded-2xl">
                    <span class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#16A085]">
                      <span class="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <Bot class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="cfo-eyebrow inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em]">
                      <FileText class="h-3.5 w-3.5" />
                      AI CFO Copilot
                    </p>
                    <h2 class="mt-0.5 text-base font-semibold text-[#102A56]">Insight Keuangan CFO</h2>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <button
                    id="btn-open-cfo-history"
                    type="button"
                    onClick={toggleChatHistory}
                    class={`cfo-history-toggle inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition ${isChatHistoryOpen.value ? 'active' : ''}`}
                    aria-label="Tampilkan riwayat chat dalam panel AI CFO"
                    aria-expanded={isChatHistoryOpen.value}
                    aria-controls="cfo-chat-history-panel"
                    title="Riwayat chat"
                  >
                    <PanelRightOpen class="h-4 w-4" />
                    <span class="cfo-history-label">Riwayat</span>
                    <span class="cfo-count-badge rounded-full px-2 py-0.5 text-[10px] font-medium">{chatSessions.value.length}</span>
                  </button>
                  <button id="btn-new-cfo-chat" type="button" onClick={createNewChat} class="cfo-new-chat inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition">
                    <Plus class="h-4 w-4" />
                    <span class="cfo-new-chat-label">Chat baru</span>
                  </button>
                </div>
              </div>
              <p class="relative mt-3 text-[12px] leading-5 text-[#5E6F8A]">Analisis data finance dari ringkasan operasional terbaru.</p>
            </div>

            <div class="relative z-10 flex min-h-0 flex-1 flex-col">
              <div class="cfo-sidebar border-b p-3">
                <p class="cfo-section-label mb-2 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  <FileText class="h-3.5 w-3.5" />
                  Template
                </p>
                <div class="grid grid-cols-2 gap-1.5 min-[1500px]:grid-cols-4">
                  {quickQuestions.slice(0, 4).map(item => <button id={`btn-fast-${item.id}`} key={item.id} type="button" onClick={() => handleFastQuestion(item.prompt)} class="cfo-template-button group flex min-h-9 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-[11px] font-medium transition">
                    <span class="min-w-0 truncate">{item.label}</span>
                    <ArrowUpRight class="h-3.5 w-3.5 shrink-0 opacity-80" />
                  </button>)}
                </div>
              </div>

              <div class="cfo-ai-workspace flex min-h-0 flex-1">
                <div class="flex min-w-0 flex-1 flex-col">
                  <div class="cfo-chat-top flex items-center justify-between gap-3 border-b px-4 py-3">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-[#102A56]">{activeChat.value?.title || 'Chat baru'}</p>
                      <p class="mt-0.5 text-[10px] text-[#6B7A90]">{activeChat.value?.updatedAt || 'Baru saja'} - Data finance terhubung</p>
                    </div>
                    <button id="btn-clear-chat" type="button" onClick={clearActiveChat} class="cfo-clear-button shrink-0 text-[11px] font-semibold transition">
                      Bersihkan
                    </button>
                  </div>

                  <div ref={chatScrollRef} class="cfo-chat-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
                    {messages.value.length <= 1 && <div class="cfo-focus-card mb-4 rounded-xl border p-4">
                      <div class="flex gap-2.5">
                        <div class="cfo-focus-icon mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                          <Clock class="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p class="text-[11px] font-semibold text-[#102A56]">Fokus minggu ini</p>
                          <p class="mt-1 text-[12px] leading-5 text-[#52627A]">Cek kas, invoice, utang vendor, pajak, payroll, dan beban langganan.</p>
                        </div>
                      </div>
                    </div>}

                    <div class="space-y-3">
                      {messages.value.map(message => <div key={message.id} data-cfo-message-id={message.id} class={`cfo-message ${message.sender === 'user' ? 'user ml-7 rounded-2xl rounded-tr-sm' : 'ai mr-3 rounded-2xl rounded-tl-sm'} px-4 py-3`}>
                        {message.sender === 'ai' && <div class="cfo-message-label mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.11em]">
                          <FileText class="h-3.5 w-3.5" />
                          AI Insight
                        </div>}
                        {renderMessageText(message.text, message.sender)}
                      </div>)}
                      {isAiLoading.value && <div class="cfo-loading-message mr-8 flex items-center gap-2 rounded-2xl rounded-tl-sm px-3.5 py-3 text-[12px]">
                        <Loader2 class="h-4 w-4 animate-spin" />
                        Menganalisis alur finance...
                      </div>}
                    </div>
                  </div>

                  <form onSubmit={handleSendMessage} class="cfo-composer border-t p-3">
                    <div class="cfo-input-shell flex items-center gap-2 rounded-2xl border p-1.5">
                      <input id="ai-chat-input" ref={chatInputRef} type="text" value={inputMessage.value} onChange={event => setInputMessage(event.target.value)} placeholder="Tulis pertanyaan..." disabled={isAiLoading.value} class="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] outline-none disabled:opacity-70" />
                      <button id="btn-send-chat" type="submit" disabled={isAiLoading.value || !inputMessage.value.trim()} class="cfo-send-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-45" aria-label="Kirim pertanyaan">
                        <Send class="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {isChatHistoryOpen.value && <aside id="cfo-chat-history-panel" class="cfo-inline-history" aria-label="Riwayat percakapan AI CFO">
                  <div class="cfo-inline-history-header">
                    <div>
                      <p class="cfo-section-label text-[10px] font-semibold uppercase tracking-[0.12em]">Riwayat chat</p>
                      <p class="mt-1 text-[10px] text-[#6B7A90]">Pilih room untuk melanjutkan percakapan.</p>
                    </div>
                    <button type="button" onClick={closeChatHistory} class="cfo-inline-history-close" aria-label="Tutup riwayat chat" title="Tutup riwayat">
                      <X class="h-4 w-4" />
                    </button>
                  </div>

                  <button type="button" onClick={createNewChat} class="cfo-inline-new-chat">
                    <Plus class="h-3.5 w-3.5" />
                    Chat baru
                  </button>

                  <div class="cfo-inline-history-list" aria-label="Daftar room chat">
                    {chatSessions.value.map(session => {
                      const isActive = session.id === activeChatId.value;
                      const lastMessage = session.messages[session.messages.length - 1]?.text || 'Belum ada pesan.';
                      return <div key={session.id} class={`cfo-inline-session ${isActive ? 'active' : ''}`}>
                        <button type="button" onClick={() => selectChatHistory(session.id)} class="cfo-inline-session-open" aria-current={isActive ? 'page' : undefined} title={`Buka ${session.title}`}>
                          <span class="cfo-inline-session-title">{session.title}</span>
                          <span class="cfo-inline-session-preview">{lastMessage}</span>
                          <span class="cfo-inline-session-time">{session.updatedAt}</span>
                        </button>
                        <button type="button" onClick={(event) => { event.stopPropagation(); deleteChat(session.id); }} class="cfo-inline-delete" aria-label={`Hapus ${session.title}`} title="Hapus room">
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </div>;
                    })}
                  </div>

                  <p class="cfo-inline-history-note">Riwayat hanya tersimpan di browser perangkat ini.</p>
                </aside>}
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section class="dashboard-surface rounded-2xl p-5">
        <div class="flex items-center justify-between gap-3 border-b border-[#E8EEF7] pb-4">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#1E5AA8]">
              <Calendar class="h-[18px] w-[18px]" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-[#102A56]">Agenda Proyek Digital</h3>
              <p class="mt-0.5 text-[11px] text-[#8190A5]">Batas waktu proyek aktif</p>
            </div>
          </div>
          <button type="button" onClick={() => setActiveTab('crm')} class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56]">
            Kelola Proyek <ArrowUpRight class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {ongoingProjects.length ? ongoingProjects.map(project => <div key={project.id} class="dashboard-row flex items-center justify-between gap-3 rounded-xl border border-[#E5EDF6] bg-[#FBFCFE] p-3.5">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-[#1E2E47]">{project.nama}</p>
                  <p class="mt-1 text-[11px] text-[#8492A6]">Batas selesai: {project.tanggalSelesai}</p>
                </div>
                <span class="shrink-0 rounded-full bg-[#ECFBF4] px-2.5 py-1 text-[10px] font-medium text-[#16885B]">
                  Ongoing
                </span>
              </div>) : <div class="rounded-xl border border-dashed border-[#DCE7F4] bg-[#FBFCFE] px-4 py-8 text-center text-sm text-[#8190A5] lg:col-span-3">
              Belum ada proyek aktif pada periode ini.
            </div>}
        </div>
      </section>

      <section class="dashboard-surface rounded-2xl p-5">
        <div class="flex flex-col gap-3 border-b border-[#E8EEF7] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]">Aktivitas Terkini</p>
            <h3 class="mt-1 text-sm font-semibold text-[#102A56]">Transaksi terbaru yang telah tercatat</h3>
          </div>
          <button type="button" onClick={() => setActiveTab('transaksi')} class="inline-flex h-9 w-fit items-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56]">
            Buka Transaksi <ArrowUpRight class="h-3.5 w-3.5" />
          </button>
        </div>

        <div class="mt-2 divide-y divide-[#EDF2F8]">
          {latestTransactions.length ? latestTransactions.map(transaction => <div key={transaction.id} class="dashboard-row grid gap-3 rounded-xl px-2 py-3.5 md:grid-cols-[140px_minmax(0,1fr)_170px_auto] md:items-center">
                <p class="text-[12px] text-[#8492A6]">{transaction.tanggal}</p>
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-[#243650]">{transaction.keterangan}</p>
                  <p class="mt-1 text-[11px] text-[#8492A6]">{transaction.refVoucher}</p>
                </div>
                <p class="text-left text-sm font-semibold text-[#102A56] md:text-right">{formatRupiah(transaction.nominal)}</p>
                <button type="button" onClick={() => setActiveTab('transaksi')} class="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56] md:justify-self-end">
                  Detail <ArrowUpRight class="h-3.5 w-3.5" />
                </button>
              </div>) : <div class="py-9 text-center text-sm text-[#8190A5]">Belum ada transaksi untuk ditampilkan.</div>}
        </div>
      </section>

    </main>
    </Fragment>;
  }
});
function Loader2({
  class: className = ''
}: {
  className?: string;
}) {
  return <svg class={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>;
}
</script>

<style scoped>
.finance-chart-shell {
  background:
    radial-gradient(circle at 16% 12%, rgba(14, 165, 233, 0.12), transparent 30%),
    radial-gradient(circle at 88% 18%, rgba(20, 184, 166, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.92));
  border-radius: 18px;
}

.modern-finance-chart {
  overflow: visible;
  filter: drop-shadow(0 16px 26px rgba(16, 42, 86, 0.08));
}

.modern-chart-grid {
  stroke: #e5edf7;
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.modern-chart-axis {
  stroke: #cbd7e6;
  stroke-width: 1.35;
}

.modern-chart-line {
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: finance-chart-draw 1.18s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.modern-chart-line-secondary {
  animation-delay: 0.1s;
}

.modern-chart-target-line {
  opacity: 0;
  stroke-dasharray: 10 9;
  animation: finance-chart-fade-slide 0.7s ease-out 0.24s forwards;
}

.modern-chart-target-line-muted {
  animation-delay: 0.32s;
}

.modern-chart-dot {
  opacity: 0;
  transform: scale(0.35);
  transform-box: fill-box;
  transform-origin: center;
  animation: finance-chart-dot-pop 0.48s cubic-bezier(0.2, 1.35, 0.35, 1) forwards;
  filter: drop-shadow(0 4px 8px rgba(16, 42, 86, 0.16));
}

.finance-chart-swatch {
  display: inline-flex;
  height: 3px;
  width: 22px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(16, 42, 86, 0.12);
}

.finance-chart-swatch-primary {
  background: linear-gradient(90deg, #2563eb, #0ea5e9 55%, #14b8a6);
}

.finance-chart-swatch-secondary {
  background: linear-gradient(90deg, #f43f5e, #f59e0b);
}

.finance-chart-swatch-target {
  background: linear-gradient(90deg, #64748b, #8b5cf6);
}

.finance-chart-swatch-muted {
  background: linear-gradient(90deg, #cbd5e1, #94a3b8);
}

@keyframes finance-chart-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes finance-chart-fade-slide {
  from {
    opacity: 0;
    transform: translateY(7px);
  }

  to {
    opacity: 0.88;
    transform: translateY(0);
  }
}

@keyframes finance-chart-dot-pop {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.cfo-shell {
  border-color: rgba(196, 213, 235, 0.88);
  background: #f8fbff;
  box-shadow: 0 24px 70px rgba(16, 42, 86, 0.13);
}

.cfo-bg-gradient {
  background:
    linear-gradient(135deg, rgba(238, 247, 255, 0.98) 0%, rgba(255, 255, 255, 0.94) 36%, rgba(237, 249, 246, 0.94) 100%),
    linear-gradient(90deg, rgba(30, 90, 168, 0.14), rgba(22, 160, 133, 0.12));
}

.cfo-bg-grid {
  opacity: 0.46;
  background-image:
    linear-gradient(rgba(30, 90, 168, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 90, 168, 0.055) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, #000 0%, rgba(0, 0, 0, 0.55) 58%, transparent 100%);
}

.cfo-hero {
  border-bottom: 1px solid rgba(206, 220, 238, 0.86);
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.93), rgba(239, 247, 255, 0.88) 58%, rgba(232, 249, 244, 0.78));
}

.cfo-hero-icon {
  border: 1px solid rgba(149, 184, 226, 0.55);
  background: linear-gradient(135deg, #102a56, #1e5aa8 62%, #16a085);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(30, 90, 168, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

.cfo-eyebrow,
.cfo-section-label {
  color: #1e5aa8;
}

.cfo-new-chat {
  border: 1px solid rgba(30, 90, 168, 0.16);
  background: #ffffff;
  color: #102a56;
  box-shadow: 0 12px 26px rgba(16, 42, 86, 0.11);
}

.cfo-new-chat:hover {
  border-color: rgba(30, 90, 168, 0.34);
  background: #f3f8ff;
  transform: translateY(-1px);
}

.cfo-count-badge {
  border: 1px solid rgba(30, 90, 168, 0.15);
  background: rgba(255, 255, 255, 0.72);
  color: #1d4f8f;
}

.cfo-history-toggle {
  border-color: rgba(30, 90, 168, 0.16);
  background: rgba(255, 255, 255, 0.84);
  color: #1e5aa8;
}

.cfo-history-toggle:hover,
.cfo-history-toggle:focus {
  border-color: rgba(30, 90, 168, 0.34);
  background: #ffffff;
  color: #102a56;
  outline: none;
}

.cfo-shell-live {
  min-height: 820px;
}

.cfo-ai-workspace {
  min-height: 0;
  isolation: isolate;
}

.cfo-ai-workspace > div:first-child {
  min-height: 0;
  height: 100%;
}

.cfo-history-toggle.active {
  border-color: rgba(30, 90, 168, 0.38);
  background: #edf6ff;
  color: #102a56;
}

.cfo-inline-history {
  display: flex;
  width: 230px;
  min-width: 230px;
  flex-direction: column;
  border-left: 1px solid rgba(206, 220, 238, 0.9);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 251, 255, 0.96));
  box-shadow: -12px 0 28px rgba(11, 31, 74, 0.06);
  animation: cfo-inline-history-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.cfo-inline-history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(222, 232, 245, 0.9);
  padding: 14px;
}

.cfo-inline-history-close {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid #d7e5f4;
  border-radius: 9px;
  background: #ffffff;
  color: #5d78a0;
  cursor: pointer;
}

.cfo-inline-history-close:hover {
  border-color: #a9c9ed;
  background: #edf6ff;
  color: #102a56;
}

.cfo-inline-new-chat {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin: 12px 12px 8px;
  border: 0;
  border-radius: 10px;
  background: #102a56;
  color: #ffffff;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  transition: transform 0.18s ease, background 0.18s ease;
}

.cfo-inline-new-chat:hover {
  background: #174b8b;
  transform: translateY(-1px);
}

.cfo-inline-history-list {
  display: grid;
  min-height: 0;
  flex: 1;
  align-content: start;
  gap: 7px;
  overflow-y: auto;
  padding: 5px 10px 10px;
}

.cfo-inline-session {
  position: relative;
  border: 1px solid transparent;
  border-radius: 11px;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.cfo-inline-session:hover {
  border-color: #c7dbf2;
  background: #ffffff;
}

.cfo-inline-session.active {
  border-color: #a9c9ed;
  background: linear-gradient(135deg, #edf6ff, #f9fcff);
  box-shadow: 0 8px 18px rgba(30, 90, 168, 0.1);
}

.cfo-inline-session-open {
  display: grid;
  width: 100%;
  min-height: 68px;
  gap: 3px;
  padding: 10px 30px 10px 10px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.cfo-inline-session-title,
.cfo-inline-session-preview,
.cfo-inline-session-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cfo-inline-session-title {
  color: #102a56;
  font-size: 10.5px;
  font-weight: 700;
}

.cfo-inline-session-preview {
  color: #6b7a90;
  font-size: 9.5px;
}

.cfo-inline-session-time {
  color: #91a0b5;
  font-size: 9px;
}

.cfo-inline-delete {
  position: absolute;
  top: 50%;
  right: 6px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #8ea0b8;
  cursor: pointer;
}

.cfo-inline-delete:hover {
  background: #fff1f3;
  color: #c53046;
}

.cfo-inline-history-note {
  margin: 0;
  border-top: 1px solid #e5edf7;
  padding: 10px 12px 12px;
  color: #7a8ca8;
  font-size: 9px;
  line-height: 1.45;
}

@keyframes cfo-inline-history-in {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}

.cfo-history-menu {
  max-height: 238px;
  overflow-y: auto;
  border-color: rgba(196, 213, 235, 0.92);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(18px);
}

.cfo-history-drawer-root {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  justify-content: flex-end;
}

.cfo-history-drawer-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(11, 31, 74, 0.34);
  cursor: default;
}

.cfo-history-drawer {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(390px, 100vw);
  height: 100%;
  flex-direction: column;
  border-left: 1px solid #dce7f4;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: -22px 0 54px rgba(11, 31, 74, 0.2);
  animation: cfo-drawer-slide-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.cfo-history-drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #e5edf7;
  padding: 22px 20px 18px;
}

.cfo-history-drawer-header h2 {
  margin: 5px 0 0;
  color: #102a56;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.cfo-history-drawer-header p:last-child {
  margin: 6px 0 0;
  color: #6b7a90;
  font-size: 12px;
  line-height: 1.5;
}

.cfo-drawer-close {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8e5f4;
  border-radius: 10px;
  background: #ffffff;
  color: #53658a;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.cfo-drawer-close:hover {
  border-color: #9fbce0;
  background: #f1f7ff;
  color: #102a56;
}

.cfo-history-drawer-action {
  padding: 14px 16px 10px;
}

.cfo-drawer-new-chat {
  display: inline-flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid #0b1f4a;
  border-radius: 12px;
  background: #0b1f4a;
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(11, 31, 74, 0.15);
  transition: transform 0.18s ease, background 0.18s ease;
}

.cfo-drawer-new-chat:hover {
  background: #174b8b;
  transform: translateY(-1px);
}

.cfo-history-drawer-list {
  display: grid;
  min-height: 0;
  flex: 1;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  padding: 8px 16px 16px;
}

.cfo-drawer-session {
  position: relative;
  border: 1px solid transparent;
  border-radius: 14px;
  background: rgba(246, 250, 255, 0.88);
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.cfo-drawer-session:hover {
  border-color: #c7dbf2;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(11, 31, 74, 0.08);
}

.cfo-drawer-session.active {
  border-color: #a9c9ed;
  background: linear-gradient(135deg, #edf6ff, #f8fcff);
  box-shadow: 0 10px 22px rgba(30, 90, 168, 0.11);
}

.cfo-drawer-session-open {
  display: grid;
  width: 100%;
  min-height: 86px;
  gap: 4px;
  padding: 13px 42px 13px 13px;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}

.cfo-drawer-session-title,
.cfo-drawer-session-preview,
.cfo-drawer-session-time {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cfo-drawer-session-title {
  color: #102a56;
  font-size: 12px;
  font-weight: 700;
}

.cfo-drawer-session-preview {
  color: #6b7a90;
  font-size: 11px;
}

.cfo-drawer-session-time {
  margin-top: 2px;
  color: #91a0b5;
  font-size: 10px;
}

.cfo-drawer-delete {
  position: absolute;
  top: 50%;
  right: 9px;
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #8ea0b8;
  cursor: pointer;
  transform: translateY(-50%);
  transition: background 0.18s ease, color 0.18s ease;
}

.cfo-drawer-delete:hover {
  background: #fff1f3;
  color: #c53046;
}

.cfo-history-drawer-note {
  margin: 0;
  border-top: 1px solid #e5edf7;
  padding: 13px 18px 16px;
  color: #7a8ca8;
  font-size: 10px;
  line-height: 1.55;
}

@keyframes cfo-drawer-slide-in {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}

.cfo-sidebar {
  border-color: rgba(206, 220, 238, 0.82);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(18px);
}

.cfo-template-button,
.cfo-history-button {
  border-color: transparent;
  background: rgba(246, 250, 255, 0.82);
  color: #405775;
}

.cfo-template-button:hover,
.cfo-history-button:hover,
.cfo-history-button.active {
  border-color: rgba(30, 90, 168, 0.18);
  background: #ffffff;
  color: #102a56;
  box-shadow: 0 10px 24px rgba(16, 42, 86, 0.08);
}

.cfo-history-button p:last-child {
  color: #7a8ca8;
}

.cfo-delete-button {
  color: #8ea0b8;
}

.cfo-delete-button:hover {
  background: #fff1f3;
  color: #c53046;
}

.cfo-chat-top,
.cfo-composer {
  border-color: rgba(206, 220, 238, 0.82);
  background: rgba(255, 255, 255, 0.74);
  backdrop-filter: blur(18px);
}

.cfo-composer {
  margin-top: auto;
  flex: 0 0 auto;
}

.cfo-clear-button {
  color: #5d78a0;
}

.cfo-clear-button:hover {
  color: #102a56;
}

.cfo-chat-scroll {
  flex: 1 1 0;
  height: auto !important;
  min-height: 0;
  max-height: none !important;
  overflow-x: hidden;
  overflow-y: scroll !important;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgba(30, 90, 168, 0.42) rgba(223, 232, 244, 0.8);
  overscroll-behavior: contain;
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.72), rgba(244, 249, 252, 0.78));
}

.cfo-chat-scroll::-webkit-scrollbar {
  width: 10px;
}

.cfo-chat-scroll::-webkit-scrollbar-track {
  background: rgba(223, 232, 244, 0.8);
  border-radius: 999px;
}

.cfo-chat-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(30, 90, 168, 0.62), rgba(22, 160, 133, 0.54));
  border: 2px solid rgba(248, 251, 255, 0.94);
  border-radius: 999px;
}

.cfo-chat-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #1e5aa8, #16a085);
}

.cfo-focus-card {
  border-color: rgba(184, 206, 232, 0.76);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 14px 34px rgba(16, 42, 86, 0.08);
}

.cfo-focus-icon {
  background: linear-gradient(135deg, #eaf4ff, #e9faf5);
  color: #1e5aa8;
}

.cfo-message {
  border: 1px solid rgba(197, 214, 234, 0.9);
  background: #ffffff;
  color: #213b61;
  box-shadow: 0 14px 34px rgba(16, 42, 86, 0.08);
}

.cfo-message.user {
  border-color: rgba(30, 90, 168, 0.24);
  background: linear-gradient(135deg, #edf6ff, #ffffff);
  color: #0b1f4a;
}

.cfo-message-label {
  color: #1e5aa8;
}

.cfo-loading-message {
  border: 1px solid rgba(197, 214, 234, 0.9);
  background: rgba(255, 255, 255, 0.78);
  color: #536780;
  box-shadow: 0 12px 28px rgba(16, 42, 86, 0.06);
}

.cfo-loading-message svg {
  color: #1e5aa8;
}

.cfo-input-shell {
  border-color: rgba(182, 203, 228, 0.9);
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(16, 42, 86, 0.1);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.cfo-input-shell:focus-within {
  border-color: rgba(30, 90, 168, 0.55);
  box-shadow: 0 18px 42px rgba(30, 90, 168, 0.14), 0 0 0 4px rgba(30, 90, 168, 0.1);
}

.cfo-input-shell input {
  height: 44px !important;
  min-height: 44px !important;
  border: 0 !important;
  background: transparent !important;
  color: #1e2e47;
  box-shadow: none !important;
}

.cfo-input-shell input:focus {
  border: 0 !important;
  box-shadow: none !important;
}

.cfo-input-shell input::placeholder {
  color: #9aa9bc;
}

.cfo-send-button {
  border: 1px solid rgba(30, 90, 168, 0.28);
  background: linear-gradient(135deg, #102a56, #1e5aa8);
  color: #ffffff;
  box-shadow: 0 10px 22px rgba(30, 90, 168, 0.18);
}

.cfo-send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #0b1f4a, #176abf);
}

@media (max-width: 1023px) {
  .cfo-shell {
    height: auto;
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .cfo-history-drawer {
    width: min(100vw, 390px);
  }

  .cfo-history-label {
    display: none;
  }

  .cfo-history-toggle {
    width: 38px;
    justify-content: center;
    padding-inline: 0;
  }

  .cfo-hero {
    padding: 18px;
  }

  .cfo-hero .relative.flex.items-center.justify-between {
    align-items: flex-start;
    flex-direction: column;
  }

  .cfo-new-chat {
    width: 40px;
    justify-content: center;
    padding-inline: 0;
  }

  .cfo-new-chat-label {
    display: none;
  }

  .cfo-chat-scroll {
    flex-basis: auto;
    height: auto !important;
    max-height: none !important;
    padding-inline: 16px;
  }
}


@media (max-width: 1180px) {
  .cfo-inline-history {
    width: 214px;
    min-width: 214px;
  }
}

@media (max-width: 720px) {
  .cfo-shell-live {
    min-height: 620px;
  }

  .cfo-ai-workspace {
    flex-direction: column;
  }

  .cfo-inline-history {
    width: auto;
    min-width: 0;
    max-height: 235px;
    border-top: 1px solid rgba(206, 220, 238, 0.9);
    border-left: 0;
  }

  .cfo-inline-history-list {
    min-height: 106px;
  }

  .cfo-chat-scroll {
    min-height: 260px;
  }
}

</style>
