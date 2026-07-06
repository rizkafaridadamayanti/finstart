<script lang="tsx">
import { Fragment, defineComponent, h, onMounted, ref } from "vue";
import { Activity, ArrowUpRight, Briefcase, Calendar, CheckCircle2, CircleAlert, Clock, FileText, Landmark, PieChart, Send, TrendingUp, Users, Plus, MessageSquare, Trash2 } from "lucide-vue-next";
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
const defaultInsightMessage: InsightMessage = {
  id: 'welcome',
  sender: 'ai',
  text: 'Halo, saya Finstart CFO Copilot. Saya dapat membantu menganalisis arus kas, piutang, pajak, pengeluaran rutin, dan prioritas keuangan perusahaan.'
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
  props: ["proyek", "klien", "akun", "transaksi", "langganan", "dashboard", "invoices", "setActiveTab", "onQuickAction"],
  setup(props) {
    const {
      proyek,
      klien,
      akun,
      transaksi,
      langganan,
      dashboard,
      invoices,
      setActiveTab,
      onQuickAction
    }: DashboardViewProps = props;
    const chatSessions = ref(initialChatSessions),
      setChatSessions = next => chatSessions.value = typeof next === "function" ? next(chatSessions.value) : next;
    const activeChatId = ref(initialChatSessions[0].id),
      setActiveChatId = next => activeChatId.value = typeof next === "function" ? next(activeChatId.value) : next;
    const inputMessage = ref(''),
      setInputMessage = next => inputMessage.value = typeof next === "function" ? next(inputMessage.value) : next;
    const isAiLoading = ref(false),
      setIsAiLoading = next => isAiLoading.value = typeof next === "function" ? next(isAiLoading.value) : next;
    const chatBottomRef = ref(null);
    const activeChat = chatSessions.value.find(session => session.id === activeChatId.value) || chatSessions.value[0];
    const messages = activeChat?.messages || [];
    onMounted(() => {
      chatBottomRef.value?.scrollIntoView({
        behavior: 'smooth'
      });
    });
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
      const shouldUpdateTitle = activeChat?.title === 'Chat baru';
      const generatedTitle = prompt.length > 30 ? `${prompt.slice(0, 30)}…` : prompt;
      appendMessageToChat(targetChatId, {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: prompt
      }, shouldUpdateTitle ? generatedTitle : undefined);
      setIsAiLoading(true);
      try {
        const cashBank = totalKasBank;
        const activeProjects = proyek.filter(project => project.status === 'Ongoing').length;
        const activeClients = klien.length;
        const subscriptionBurn = langganan.reduce((total, item) => total + item.biayaIDR, 0);
        const response = await fetch('/api/ai-cfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: prompt,
            context: {
              cashBank,
              activeProjects,
              activeClients,
              piutangTotal: Number(dashboardData.total_receivable || 0),
              utangTotal: Number(dashboardData.total_payable || 0),
              subscriptionBurn,
              netProfit: `${profitMargin.toFixed(1)}%`
            }
          })
        });
        const data = await response.json();
        appendMessageToChat(targetChatId, {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.text || 'Rekomendasi belum tersedia. Silakan ulangi analisis.'
        });
      } catch (error) {
        console.error(error);
        appendMessageToChat(targetChatId, {
          id: `offline-${Date.now()}`,
          sender: 'ai',
          text: 'Koneksi analisis belum tersedia. Gunakan ringkasan offline untuk tindak lanjut piutang, pajak, dan pengeluaran rutin.'
        });
      } finally {
        setIsAiLoading(false);
      }
    };
    const handleSendMessage = (event: Event) => {
      event.preventDefault();
      if (!inputMessage.value.trim()) return;
      const prompt = inputMessage.value;
      setInputMessage('');
      handleFastQuestion(prompt);
    };
    const renderMessageText = (text: string, sender: InsightMessage['sender']) => {
      const textClass = sender === 'user' ? 'text-white' : 'text-[#42526B]';
      const emphasisClass = sender === 'user' ? 'text-white' : 'text-[#102A56]';
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
    const incomeAreaPath = incomePoints.length ? `${incomePath} L ${incomePoints[incomePoints.length - 1].x} 168 L ${incomePoints[0].x} 168 Z` : '';
    return () => <main class="dashboard-view space-y-7">
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

      <section class="grid grid-cols-1 gap-6 2xl:grid-cols-12">
        <div class="space-y-6 2xl:col-span-8">
          <article class="dashboard-surface overflow-hidden rounded-2xl">
            <div class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]">Cash Flow Performance</p>
                <h2 class="mt-1 text-lg font-semibold text-[#102A56]">Performa Arus Kas Operasional</h2>
              </div>
              <div class="flex items-center gap-3 text-[12px] text-[#6B7A90]">
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#102A56]" />
                  Pemasukan
                </span>
                <span class="inline-flex items-center gap-1.5">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#EF4565]" />
                  Pengeluaran
                </span>
                <span class="ml-1 rounded-full border border-[#DCE7F4] bg-[#F8FBFE] px-3 py-1.5 text-[11px] font-medium text-[#53658A]">
                  Jan – Jun 2026
                </span>
              </div>
            </div>

            <div class="px-6 pb-5 pt-4">
              <div class="min-w-0">
                <svg viewBox="0 0 520 190" class="h-auto w-full drop-shadow-[0_12px_22px_rgba(16,42,86,0.06)]" aria-label="Grafik arus kas">
                  {[32, 74, 116, 158].map(y => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#E6EEF7" strokeWidth="1" strokeDasharray="4 5" />)}
                  <defs>
                    <linearGradient id="cashflow-income-area" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#102A56" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#102A56" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={incomeAreaPath} fill="url(#cashflow-income-area)" class="cashflow-area" />
                  <path d={expensePath} fill="none" stroke="#EF4565" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 6" class="cashflow-line-expense" />
                  <path d={incomePath} fill="none" stroke="#102A56" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" class="cashflow-line-income" />
                  {monthlyCashflow.map((item, index) => <g key={`${item.month}-${index}`}>
                      <circle cx={chartX(index)} cy={chartY(item.income)} r="4" fill="#102A56" stroke="white" strokeWidth="2" />
                      <circle cx={chartX(index)} cy={chartY(item.expense)} r="3.3" fill="#EF4565" stroke="white" strokeWidth="1.8" />
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




        </div>

        <aside class="2xl:col-span-4">
          <article class="dashboard-surface h-full min-h-[390px] rounded-2xl p-5">
            <div class="flex flex-col gap-3 border-b border-[#E8EEF7] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]">Aktivitas Terkini</p>
                <h3 class="mt-1 text-sm font-semibold text-[#102A56]">Transaksi terbaru yang telah tercatat</h3>
              </div>
              <button type="button" onClick={() => setActiveTab('transaksi')} class="inline-flex w-fit items-center gap-1.5 text-[12px] font-medium text-[#1E5AA8] transition hover:text-[#102A56]">
                Buka Transaksi <ArrowUpRight class="h-3.5 w-3.5" />
              </button>
            </div>

            <div class="mt-2 divide-y divide-[#EDF2F8]">
              {latestTransactions.length ? latestTransactions.map(transaction => <div key={transaction.id} class="dashboard-row grid gap-2 rounded-xl px-2 py-3.5 sm:grid-cols-[120px_minmax(0,1fr)_150px] sm:items-center">
                    <p class="text-[12px] text-[#8492A6]">{transaction.tanggal}</p>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-[#243650]">{transaction.keterangan}</p>
                      <p class="mt-1 text-[11px] text-[#8492A6]">{transaction.refVoucher}</p>
                    </div>
                    <p class="text-left text-sm font-semibold text-[#102A56] sm:text-right">{formatRupiah(transaction.nominal)}</p>
                  </div>) : <div class="py-9 text-center text-sm text-[#8190A5]">Belum ada transaksi untuk ditampilkan.</div>}
            </div>
          </article>
        </aside>
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                      <p class={`mt-1 text-[11px] ${invoice.status === 'Overdue' ? 'text-[#BF5A72]' : 'text-[#8492A6]'}`}>{invoice.nomor} · {invoice.jatuhTempo}</p>
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

            <article class="dashboard-surface rounded-2xl p-5">
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
                <button type="button" onClick={() => setActiveTab('crm')} class="text-[12px] font-medium text-[#1E5AA8] transition hover:text-[#102A56]">
                  Kelola Proyek
                </button>
              </div>

              <div class="mt-4 space-y-3">
                {ongoingProjects.length ? ongoingProjects.map(project => <div key={project.id} class="dashboard-row flex items-center justify-between gap-3 rounded-xl border border-[#E5EDF6] bg-[#FBFCFE] p-3.5">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-[#1E2E47]">{project.nama}</p>
                        <p class="mt-1 text-[11px] text-[#8492A6]">Batas selesai: {project.tanggalSelesai}</p>
                      </div>
                      <span class="shrink-0 rounded-full bg-[#ECFBF4] px-2.5 py-1 text-[10px] font-medium text-[#16885B]">
                        Ongoing
                      </span>
                    </div>) : <div class="rounded-xl border border-dashed border-[#DCE7F4] bg-[#FBFCFE] px-4 py-8 text-center text-sm text-[#8190A5]">
                    Belum ada proyek aktif pada periode ini.
                  </div>}
              </div>
            </article>
      </section>

      <section class="w-full">
        <section id="ai-cfo-card" class="dashboard-surface flex min-h-[640px] flex-col overflow-hidden rounded-2xl">
            <div class="border-b border-[#E8EEF7] px-6 py-5">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#DCE7F4] bg-[#EEF5FF] text-[#1E5AA8]">
                    <MessageSquare class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#1E5AA8]">CFO Copilot</p>
                    <h2 class="mt-0.5 text-base font-semibold text-[#102A56]">Insight Keuangan CFO</h2>
                  </div>
                </div>
                <button id="btn-new-cfo-chat" type="button" onClick={createNewChat} class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#102A56] px-3 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(16,42,86,0.14)] transition hover:bg-[#0B1F42]">
                  <Plus class="h-4 w-4" />
                  New chat
                </button>
              </div>
              <p class="mt-3 text-[12px] leading-5 text-[#718198]">Analisis data keuangan dalam percakapan terpisah agar setiap pembahasan tetap terorganisasi.</p>
            </div>

            <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)]">
              <div class="border-b border-[#E8EEF7] bg-[#FBFCFE] p-4 lg:border-b-0 lg:border-r">
                <div class="mb-2 flex items-center justify-between px-1">
                  <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Riwayat chat</p>
                  <span class="rounded-full bg-[#EEF5FF] px-2 py-0.5 text-[10px] font-medium text-[#1E5AA8]">{chatSessions.value.length}</span>
                </div>
                <div class="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-y-auto lg:pb-0">
                  {chatSessions.value.map(session => {
                  const isActive = session.id === activeChatId.value;
                  return <div key={session.id} class="group relative min-w-[168px] lg:min-w-0">
                        <button type="button" onClick={() => setActiveChatId(session.id)} class={`w-full rounded-xl border px-3 py-2.5 pr-8 text-left transition ${isActive ? 'border-[#C8DCF3] bg-white shadow-[0_6px_14px_rgba(16,42,86,0.06)]' : 'border-transparent hover:border-[#DCE7F4] hover:bg-white'}`}>
                          <p class={`truncate text-[11px] font-medium ${isActive ? 'text-[#102A56]' : 'text-[#52647E]'}`}>{session.title}</p>
                          <p class="mt-1 text-[10px] text-[#94A3B8]">{session.updatedAt}</p>
                        </button>
                        <button type="button" onClick={() => deleteChat(session.id)} class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9AA9BC] opacity-0 transition hover:bg-[#FFF2F4] hover:text-[#D93858] group-hover:opacity-100 focus:opacity-100" aria-label={`Hapus ${session.title}`}>
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </div>;
                })}
                </div>
              </div>

              <div class="flex min-h-0 flex-col">
                <div class="flex items-center justify-between gap-3 border-b border-[#E8EEF7] px-4 py-3.5">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-[#102A56]">{activeChat?.title || 'Chat baru'}</p>
                    <p class="mt-0.5 text-[10px] text-[#8A99AD]">{activeChat?.updatedAt || 'Baru saja'} · Data buku besar terhubung</p>
                  </div>
                  <button id="btn-clear-chat" type="button" onClick={clearActiveChat} class="shrink-0 text-[11px] font-medium text-[#6B7A90] transition hover:text-[#102A56]">
                    Bersihkan
                  </button>
                </div>

                <div class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {messages.length <= 1 && <div class="mb-4 rounded-xl border border-[#F7DEB1] bg-[#FFF9EE] p-3">
                      <div class="flex gap-2.5">
                        <CircleAlert class="mt-0.5 h-4 w-4 shrink-0 text-[#D48A00]" />
                        <div>
                          <p class="text-[11px] font-semibold text-[#8A5C00]">Fokus minggu ini</p>
                          <p class="mt-1 text-[12px] leading-5 text-[#8D6C31]">Tindak lanjut piutang Telkomsel dan konfirmasi penyetoran PPN sebelum tanggal 15.</p>
                        </div>
                      </div>
                    </div>}

                  <div class="space-y-3">
                    {messages.map(message => <div key={message.id} class={message.sender === 'user' ? 'ml-7 rounded-2xl rounded-tr-sm bg-[#102A56] px-3.5 py-3 text-white shadow-[0_8px_16px_rgba(16,42,86,0.12)]' : 'mr-3 rounded-2xl rounded-tl-sm border border-[#E0EAF5] bg-[#FBFCFE] px-3.5 py-3'}>
                        {renderMessageText(message.text, message.sender)}
                      </div>)}
                    {isAiLoading.value && <div class="mr-8 flex items-center gap-2 rounded-2xl rounded-tl-sm border border-[#E0EAF5] bg-[#FBFCFE] px-3.5 py-3 text-[12px] text-[#60708A]">
                        <Loader2 class="h-4 w-4 animate-spin text-[#1E5AA8]" />
                        Menganalisis data finansial...
                      </div>}
                    <div ref={chatBottomRef} />
                  </div>

                  {messages.length <= 1 && <div class="mt-5">
                      <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Mulai dengan pertanyaan</p>
                      <div class="space-y-2">
                        <button id="btn-fast-pajak" type="button" onClick={() => handleFastQuestion('Analisis kewajiban perpajakan PT Kedata Indonesia Digital bulan ini.')} class="flex min-h-10 w-full items-center justify-between rounded-xl border border-[#DCE7F4] bg-white px-3 text-left text-[12px] font-medium text-[#243650] transition hover:border-[#BFD4EB] hover:bg-[#F8FBFE]">
                          Analisis kewajiban pajak <ArrowUpRight class="h-3.5 w-3.5 text-[#1E5AA8]" />
                        </button>
                        <button id="btn-fast-burn" type="button" onClick={() => handleFastQuestion('Berapa pengeluaran langganan rutin digital kita dan bagaimana cara optimasinya?')} class="flex min-h-10 w-full items-center justify-between rounded-xl border border-[#DCE7F4] bg-white px-3 text-left text-[12px] font-medium text-[#243650] transition hover:border-[#BFD4EB] hover:bg-[#F8FBFE]">
                          Optimasi burn rate digital <ArrowUpRight class="h-3.5 w-3.5 text-[#1E5AA8]" />
                        </button>
                        <button id="btn-fast-piutang" type="button" onClick={() => handleFastQuestion('Berikan solusi taktis penagihan piutang Telkomsel Rp 350 Juta yang terlambat.')} class="flex min-h-10 w-full items-center justify-between rounded-xl border border-[#DCE7F4] bg-white px-3 text-left text-[12px] font-medium text-[#243650] transition hover:border-[#BFD4EB] hover:bg-[#F8FBFE]">
                          Strategi penagihan piutang <ArrowUpRight class="h-3.5 w-3.5 text-[#1E5AA8]" />
                        </button>
                      </div>
                    </div>}
                </div>

                <form onSubmit={handleSendMessage} class="border-t border-[#E8EEF7] bg-white p-4">
                  <div class="flex items-center gap-2 rounded-2xl border border-[#DCE7F4] bg-[#FBFCFE] p-1.5 focus-within:border-[#1E5AA8] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1E5AA8]/10">
                    <input id="ai-chat-input" type="text" value={inputMessage.value} onChange={event => setInputMessage(event.target.value)} placeholder="Tulis pertanyaan analisis keuangan..." disabled={isAiLoading.value} class="h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] text-[#243650] outline-none placeholder:text-[#9AA9BC] disabled:opacity-70" />
                    <button id="btn-send-chat" type="submit" disabled={isAiLoading.value || !inputMessage.value.trim()} class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102A56] text-white shadow-[0_6px_14px_rgba(16,42,86,0.16)] transition hover:bg-[#0B1F42] disabled:cursor-not-allowed disabled:opacity-45" aria-label="Kirim pertanyaan">
                      <Send class="h-4 w-4" />
                    </button>
                  </div>
                  <p class="mt-2 px-1 text-[10px] text-[#94A3B8]">Finstart CFO Copilot menggunakan ringkasan data operasional yang tersedia di workspace.</p>
                </form>
              </div>
            </div>
          </section>
      </section>
    </main>;
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
