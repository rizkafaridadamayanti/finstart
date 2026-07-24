<template>
  <main class="dashboard-view space-y-7 pb-4 md:pb-8">
    <section
      class="workspace-page-header dashboard-card-enter dashboard-card-delay-0 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"
    >
      <div>
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]"
        >
          Financial Overview
        </p>
        <h1
          class="mt-2 text-xl font-extrabold tracking-tight text-[#0B1F4A]"
        >
          Ringkasan Keuangan
        </h1>
        <p class="mt-1 text-sm leading-6 text-[#6B7A90]">
          Pantau posisi kas, proyek aktif, piutang, dan agenda finance PT Kedata
          Indonesia Digital.
        </p>
      </div>
    </section>
    <section
      class="dashboard-metric-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <DashboardMetricCard
        label="Bank &amp; Kas Lancar"
        :value="formatRupiah(totalKasBank)"
        detail="+12,4% dibanding bulan lalu"
        tone="blue"
        :icon="Landmark"
      /><DashboardMetricCard
        label="Proyek Berjalan"
        :value="`${ongoingProjectsCount} Proyek`"
        :detail="`Dari ${proyek.length} total inisiasi proyek`"
        tone="green"
        :icon="Briefcase"
      /><DashboardMetricCard
        label="Klien Aktif"
        :value="`${activeClientsCount} Klien`"
        detail="Mitra korporasi dan institusi"
        tone="amber"
        :icon="Users"
      /><DashboardMetricCard
        label="Estimasi Net Profit"
        :value="`${profitMargin.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% Margin`"
        detail="+4,2% dari target operasional"
        tone="purple"
        :icon="PieChart"
      />
    </section>
    <section class="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
      <div class="min-w-0 space-y-6">
        <article
          class="dashboard-card-enter dashboard-card-delay-5 dashboard-surface overflow-hidden rounded-2xl"
        >
          <div
            class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]"
              >
                Cash Flow Performance
              </p>
              <h2 class="mt-1 text-lg font-semibold text-[#102A56]">
                Performa Arus Kas Operasional
              </h2>
            </div>
            <div class="flex flex-nowrap items-center gap-3 text-[12px] text-[#6B7A90]">
              <span class="inline-flex items-center gap-1.5">
                <span class="finance-chart-swatch finance-chart-swatch-primary" />
                Pemasukan
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="finance-chart-swatch finance-chart-swatch-secondary" />
                Pengeluaran
              </span>
              <span class="ml-1 shrink-0 rounded-full border border-[#DCE7F4] bg-[#F8FBFE] px-2 py-1 text-[10px] font-medium text-[#53658A] whitespace-nowrap" title="Jan – Jun 2026">Jan – Jun 2026</span>
            </div>
          </div>
          <div class="px-6 pb-5 pt-4">
            <div class="finance-chart-shell min-w-0">
              <svg
                viewBox="0 0 520 190"
                class="modern-finance-chart h-auto w-full"
                aria-label="Grafik arus kas"
              >
                <defs>
                  <linearGradient
                    id="dashboard-income-stroke"
                    x1="24"
                    x2="496"
                    y1="0"
                    y2="0"
                    gradient-units="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#2563EB" />
                    <stop offset="55%" stop-color="#0EA5E9" />
                    <stop offset="100%" stop-color="#14B8A6" />
                  </linearGradient>
                  <linearGradient
                    id="dashboard-expense-stroke"
                    x1="24"
                    x2="496"
                    y1="0"
                    y2="0"
                    gradient-units="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#F43F5E" />
                    <stop offset="100%" stop-color="#F59E0B" />
                  </linearGradient>
                  <filter
                    id="dashboard-line-glow"
                    x="-10%"
                    y="-30%"
                    width="120%"
                    height="160%"
                  >
                    <feGaussianBlur std-deviation="2.4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <line
                  v-for="y in [32, 74, 116, 158]"
                  :key="y"
                  x1="0"
                  :y1="y"
                  x2="520"
                  :y2="y"
                  class="modern-chart-grid"
                />
                <path
                  :d="expensePath"
                  fill="none"
                  stroke="url(#dashboard-expense-stroke)"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-line modern-chart-line-secondary"
                  filter="url(#dashboard-line-glow)"
                />
                <path
                  :d="incomePath"
                  fill="none"
                  stroke="url(#dashboard-income-stroke)"
                  stroke-width="4.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-line modern-chart-line-primary"
                  filter="url(#dashboard-line-glow)"
                />
                <g
                  v-for="(item, index) in monthlyCashflow"
                  :key="`${item.month}-${index}`"
                >
                  <circle
                    :cx="chartX(Number(index))"
                    :cy="chartY(item.income)"
                    r="3.6"
                    fill="white"
                    stroke="url(#dashboard-income-stroke)"
                    stroke-width="2.4"
                    class="modern-chart-dot"
                    :style="{ animationDelay: `${0.48 + Number(index) * 0.07}s` }"
                  />
                  <circle
                    :cx="chartX(Number(index))"
                    :cy="chartY(item.expense)"
                    r="3.2"
                    fill="white"
                    stroke="url(#dashboard-expense-stroke)"
                    stroke-width="2"
                    class="modern-chart-dot"
                    :style="{ animationDelay: `${0.58 + Number(index) * 0.07}s` }"
                  />
                  <text
                    :x="chartX(Number(index))"
                    y="183"
                    class="fill-[#8291A8] text-[8px] font-medium"
                    text-anchor="middle"
                    style="font-feature-settings: 'tnum' 1;"
                  >
                    {{ item.month }}
                  </text>
                </g>
              </svg>
            </div>
            <div
              class="mt-4 grid grid-cols-1 gap-3 border-t border-[#E8EEF7] pt-4 sm:grid-cols-3"
            >
              <DashboardMiniSummary
                :label="`Pemasukan ${monthlyCashflow[monthlyCashflow.length - 1]?.month || '-'}`"
                :value="
                  formatRupiah(
                    monthlyCashflow[monthlyCashflow.length - 1]?.incomeRaw || 0,
                  )
                "
                tone="navy"
              /><DashboardMiniSummary
                :label="`Pengeluaran ${monthlyCashflow[monthlyCashflow.length - 1]?.month || '-'}`"
                :value="
                  formatRupiah(
                    monthlyCashflow[monthlyCashflow.length - 1]?.expenseRaw ||
                      0,
                  )
                "
                tone="blue"
              /><DashboardMiniSummary
                label="Kenaikan Kas Bersih"
                :value="
                  formatRupiah(
                    Number(dashboardData.monthly_income || 0) -
                      Number(dashboardData.monthly_expense || 0),
                  )
                "
                tone="green"
              />
            </div>
          </div>
        </article>
        <article
          class="dashboard-card-enter dashboard-card-delay-6 dashboard-surface rounded-2xl p-5"
        >
          <div
            class="flex items-center justify-between gap-3 border-b border-[#E8EEF7] pb-4"
          >
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF2F4] text-[#D93858]"
              >
                <Clock class="h-[18px] w-[18px]" />
              </div>
              <div>
                <h3 class="text-sm font-semibold text-[#102A56]">
                  Invoice Perlu Tindakan
                </h3>
                <p class="mt-0.5 text-[11px] text-[#8190A5]">
                  Jatuh tempo dan overdue
                </p>
              </div>
            </div>
            <button
              type="button"
              class="text-[12px] font-medium text-[#1E5AA8] transition hover:text-[#102A56]"
              @click="selectWorkspace('piutang')"
            >
              Lihat Piutang
            </button>
          </div>
          <div class="mt-4 space-y-3">
            <template v-if="actionInvoices.length"
              ><div
                v-for="invoice in actionInvoices"
                :key="invoice.id"
                :class="`dashboard-row flex items-center justify-between gap-3 rounded-xl border p-3.5 ${invoice.status === 'Overdue' ? 'border-[#F9D6DE] bg-[#FFF8F9]' : 'border-[#E5EDF6] bg-[#FBFCFE]'}`"
              >
                <div class="min-w-0">
                  <p
                    :class="`truncate text-sm font-medium ${invoice.status === 'Overdue' ? 'text-[#8C2640]' : 'text-[#1E2E47]'}`"
                  >
                    {{ invoice.klienNama }}
                  </p>
                  <p
                    :class="`mt-1 text-[11px] ${invoice.status === 'Overdue' ? 'text-[#BF5A72]' : 'text-[#8492A6]'}`"
                  >
                    {{ invoice.nomor }} Â· {{ invoice.jatuhTempo }}
                  </p>
                </div>
                <div class="text-right">
                  <p
                    :class="`text-sm font-semibold ${invoice.status === 'Overdue' ? 'text-[#A92A47]' : 'text-[#102A56]'}`"
                  >
                    {{
                      formatRupiah(invoice.outstandingAmount || invoice.nominal)
                    }}
                  </p>
                  <span
                    :class="`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${invoice.status === 'Overdue' ? 'bg-[#FFE8ED] text-[#C53D5B]' : 'bg-[#EEF4FB] text-[#1E5AA8]'}`"
                    ><template v-if="invoice.status === 'Overdue'"
                      >Overdue</template
                    ><template v-else>Jatuh tempo</template></span
                  >
                </div>
              </div></template
            >
            <div
              v-else
              class="dashboard-row rounded-xl border border-dashed border-[#DCE7F4] bg-[#FBFCFE] p-4 text-center text-sm text-[#8190A5]"
            >
              Tidak ada invoice terbuka.
            </div>
          </div>
        </article>
      </div>
      <aside class="cfo-column min-h-0 min-w-0">
        <section
          id="ai-cfo-card"
          ref="aiCardRef"
          class="dashboard-card-enter dashboard-card-delay-7 cfo-shell cfo-shell-live relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border text-[#142033]"
        >
          <div class="cfo-bg-gradient pointer-events-none absolute inset-0" />
          <div class="cfo-bg-grid pointer-events-none absolute inset-0" />
          <div class="cfo-hero relative z-10 overflow-hidden px-5 py-4">
            <div class="relative flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div
                  class="cfo-hero-icon relative flex h-11 w-11 items-center justify-center rounded-2xl"
                >
                  <span
                    class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-[#0B1F4A]"
                    ><span class="h-1.5 w-1.5 rounded-full bg-white" /></span
                  ><Bot class="h-5 w-5" />
                </div>
                <div>
                  <p
                    class="cfo-eyebrow inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em]"
                  >
                    <FileText class="h-3.5 w-3.5" /> AI CFO Copilot
                  </p>
                  <h2 class="mt-0.5 text-base font-semibold text-[#102A56]">
                    Insight Keuangan CFO
                  </h2>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  id="btn-open-cfo-history"
                  type="button"
                  :class="`cfo-history-toggle inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-[11px] font-semibold transition ${isChatHistoryOpen ? 'active' : ''}`"
                  aria-label="Tampilkan riwayat chat dalam panel AI CFO"
                  :aria-expanded="isChatHistoryOpen"
                  aria-controls="cfo-chat-history-panel"
                  title="Riwayat chat"
                  @click="toggleChatHistory"
                >
                  <PanelRightOpen class="h-4 w-4" /><span
                    class="cfo-history-label"
                    >Riwayat</span
                  ><span
                    class="cfo-count-badge rounded-full px-2 py-0.5 text-[10px] font-medium"
                    >{{ chatSessions.length }}</span
                  ></button
                ><button
                  id="btn-new-cfo-chat"
                  type="button"
                  class="cfo-new-chat inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold transition"
                  @click="createNewChat"
                >
                  <Plus class="h-4 w-4" /><span class="cfo-new-chat-label"
                    >Chat baru</span
                  >
                </button>
              </div>
            </div>
            <p class="relative mt-3 text-[12px] leading-5 text-[#5E6F8A]">
              Analisis data finance dari ringkasan operasional terbaru.
            </p>
          </div>
            <div class="relative z-10 flex min-h-0 flex-1 flex-col">
            <div class="cfo-ai-workspace flex min-h-0 flex-1">
              <div v-if="!isChatHistoryOpen" class="flex min-w-0 flex-1 flex-col">
                <div
                  class="cfo-chat-top flex items-center justify-between gap-3 border-b px-4 py-3"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-[#102A56]">
                      {{ activeChat?.title || "Chat baru" }}
                    </p>
                    <p class="mt-0.5 text-[10px] text-[#6B7A90]">
                      {{ activeChat?.updatedAt || "Baru saja" }} - Data finance
                      terhubung
                    </p>
                  </div>
                </div>
                <div
                  ref="chatScrollRef"
                  class="cfo-chat-scroll min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4"
                >
                  <div
                    v-if="messages.length <= 1"
                    class="cfo-focus-card mb-4 rounded-xl border p-4"
                  >
                    <div class="flex gap-2.5">
                      <div
                        class="cfo-focus-icon mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      >
                        <Clock class="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p class="text-[11px] font-semibold text-[#102A56]">
                          Fokus minggu ini
                        </p>
                        <p class="mt-1 text-[12px] leading-5 text-[#52627A]">
                          Cek kas, invoice, utang vendor, pajak, payroll, dan
                          beban langganan.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div
                      v-for="message in messages"
                      :key="message.id"
                      :data-cfo-message-id="message.id"
                      :class="`cfo-message ${message.sender === 'user' ? 'user ml-7 rounded-2xl rounded-tr-sm' : 'ai mr-3 rounded-2xl rounded-tl-sm'} px-4 py-3`"
                    >
                      <div
                        v-if="message.sender === 'ai'"
                        class="cfo-message-label mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.11em]"
                      >
                        <FileText class="h-3.5 w-3.5" /> AI Insight
                      </div>
                      <DashboardMessageText
                        :text="message.text"
                        :sender="message.sender"
                      />
                    </div>
                    <div
                      v-if="isAiLoading"
                      class="cfo-loading-message mr-8 flex items-center gap-2 rounded-2xl rounded-tl-sm px-3.5 py-3 text-[12px]"
                    >
                      <DashboardLoaderSpinner class="h-4 w-4 animate-spin" />
                      Menganalisis alur finance...
                    </div>
                  </div>
                </div>
                <form
                  class="cfo-composer border-t p-3"
                  @submit="handleSendMessage"
                >
                  <div
                    class="cfo-input-shell flex items-center gap-2 rounded-2xl border p-1.5"
                  >
                    <input
                      id="ai-chat-input"
                      ref="chatInputRef"
                      type="text"
                      :value="inputMessage"
                      placeholder="Tulis pertanyaan..."
                      :disabled="isAiLoading"
                      class="h-10 min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] outline-none disabled:opacity-70"
                      @change="updateInputMessage(eventValue($event))"
                    /><button
                      id="btn-send-chat"
                      type="submit"
                      :disabled="isAiLoading || !inputMessage.trim()"
                      class="cfo-send-button flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-45"
                      :aria-label="
                        isAiLoading
                          ? 'AI sedang menyiapkan jawaban'
                          : 'Kirim pertanyaan'
                      "
                    >
                      <DashboardLoaderSpinner
                        v-if="isAiLoading"
                        class="h-4 w-4 animate-spin"
                      />
                      <Send v-else class="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
              <aside
                v-else
                id="cfo-chat-history-panel"
                class="cfo-inline-history cfo-history-page"
                aria-label="Riwayat percakapan AI CFO"
              >
                <div class="cfo-inline-history-header">
                  <div>
                    <p
                      class="cfo-section-label text-[10px] font-semibold uppercase tracking-[0.12em]"
                    >
                      Riwayat chat
                    </p>
                    <p class="mt-1 text-[10px] text-[#6B7A90]">
                      Pilih room untuk melanjutkan percakapan.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="cfo-inline-history-close"
                    aria-label="Tutup riwayat chat"
                    title="Tutup riwayat"
                    @click="closeChatHistory"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  class="cfo-inline-new-chat"
                  @click="createNewChat"
                >
                  <Plus class="h-3.5 w-3.5" /> Chat baru
                </button>
                <div
                  class="cfo-inline-history-list"
                  aria-label="Daftar room chat"
                >
                  <div
                    v-for="session in chatSessions"
                    :key="session.id"
                    :class="`cfo-inline-session ${session.id === activeChatId ? 'active' : ''}`"
                  >
                    <button
                      type="button"
                      class="cfo-inline-session-open"
                      :aria-current="session.id === activeChatId ? 'page' : undefined"
                      :title="`Buka ${session.title}`"
                      @click="selectChatHistory(session.id)"
                    >
                      <span class="cfo-inline-session-title">{{ cleanHistoryText(session.title) }}</span>
                      <span class="cfo-inline-session-time">{{ session.updatedAt }}</span>
                    </button>
                    <button
                      type="button"
                      class="cfo-inline-delete"
                      :aria-label="`Hapus ${session.title}`"
                      title="Hapus room"
                      @click="handleDeleteChatClick(session.id, $event)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p class="cfo-inline-history-note">
                  Riwayat hanya tersimpan di browser perangkat ini.
                </p>
              </aside>
            </div>
          </div>
        </section>
      </aside>
    </section>
    <section
      class="dashboard-card-enter dashboard-card-delay-8 dashboard-surface rounded-2xl p-5"
    >
      <div
        class="flex items-center justify-between gap-3 border-b border-[#E8EEF7] pb-4"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#1E5AA8]"
          >
            <Calendar class="h-[18px] w-[18px]" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-[#102A56]">
              Agenda Proyek Digital
            </h3>
            <p class="mt-0.5 text-[11px] text-[#8190A5]">
              Batas waktu proyek aktif
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56]"
          @click="selectWorkspace('crm')"
        >
          Kelola Proyek <ArrowUpRight class="h-3.5 w-3.5" />
        </button>
      </div>
      <div class="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <template v-if="ongoingProjects.length"
          ><div
            v-for="project in ongoingProjects"
            :key="project.id"
            class="dashboard-row flex items-center justify-between gap-3 rounded-xl border border-[#E5EDF6] bg-[#FBFCFE] p-3.5"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[#1E2E47]">
                {{ project.nama }}
              </p>
              <p class="mt-1 text-[11px] text-[#8492A6]">
                Batas selesai: {{ project.tanggalSelesai }}
              </p>
            </div>
            <span
              class="shrink-0 rounded-full bg-[#ECFBF4] px-2.5 py-1 text-[10px] font-medium text-[#16885B]"
            >
              Ongoing
            </span>
          </div></template
        >
        <div
          v-else
          class="rounded-xl border border-dashed border-[#DCE7F4] bg-[#FBFCFE] px-4 py-8 text-center text-sm text-[#8190A5] lg:col-span-3"
        >
          Belum ada proyek aktif pada periode ini.
        </div>
      </div>
    </section>
    <section
      class="dashboard-card-enter dashboard-card-delay-9 dashboard-surface rounded-2xl p-5"
    >
      <div
        class="flex flex-col gap-3 border-b border-[#E8EEF7] pb-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1E5AA8]"
          >
            Aktivitas Terkini
          </p>
          <h3 class="mt-1 text-sm font-semibold text-[#102A56]">
            Transaksi terbaru yang telah tercatat
          </h3>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-fit items-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56]"
          @click="selectWorkspace('transaksi')"
        >
          Buka Transaksi <ArrowUpRight class="h-3.5 w-3.5" />
        </button>
      </div>
      <div class="mt-2 divide-y divide-[#EDF2F8]">
        <template v-if="latestTransactions.length"
          ><div
            v-for="transaction in latestTransactions"
            :key="transaction.id"
            class="dashboard-row grid gap-3 rounded-xl px-2 py-3.5 md:grid-cols-[140px_minmax(0,1fr)_170px_auto] md:items-center"
          >
            <p class="text-[12px] text-[#8492A6]">{{ transaction.tanggal }}</p>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-[#243650]">
                {{ transaction.keterangan }}
              </p>
              <p class="mt-1 text-[11px] text-[#8492A6]">
                {{ transaction.refVoucher }}
              </p>
            </div>
            <p
              class="text-left text-sm font-semibold text-[#102A56] md:text-right"
            >
              {{ formatRupiah(transaction.nominal) }}
            </p>
            <button
              type="button"
              class="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#1E5AA8] transition hover:border-[#BFCFE2] hover:text-[#102A56] md:justify-self-end"
              @click="selectWorkspace('transaksi')"
            >
              Detail <ArrowUpRight class="h-3.5 w-3.5" />
            </button></div
        ></template>
        <div v-else class="py-9 text-center text-sm text-[#8190A5]">
          Belum ada transaksi untuk ditampilkan.
        </div>
      </div>
    </section>
    <ConfirmDialog
      :open="!!chatDeleteConfirmId"
      eyebrow="Konfirmasi Penghapusan"
      title="Hapus room chat?"
      message="Room chat yang dihapus tidak bisa dipulihkan dari riwayat lokal perangkat ini."
      :details="[
        { label: 'Room', value: chatDeleteTarget?.title || 'Chat baru' },
        { label: 'Update', value: chatDeleteTarget?.updatedAt || '-' },
      ]"
      :impact-items="[
        'Riwayat percakapan room ini hilang dari daftar chat.',
        'Jika hanya tersisa satu room, isinya akan dikosongkan dan diganti chat baru.',
      ]"
      confirm-label="Hapus Room"
      cancel-label="Batal"
      variant="danger"
      @cancel="closeChatDeleteConfirm"
      @confirm="confirmDeleteChat"
    />
  </main>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Landmark,
  PieChart,
  Send,
  Users,
  Plus,
  Trash2,
  Bot,
  X,
  PanelRightOpen,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";
import { useFinStartContext } from "../composables/useFinStartContext";
import {
  AkunBukuBesar,
  Klien,
  Langganan,
  Proyek,
  Transaksi,
} from "../types.ts";
import DashboardMetricCard from "./dashboard/DashboardMetricCard.vue";
import DashboardMiniSummary from "./dashboard/DashboardMiniSummary.vue";
import DashboardMessageText from "./dashboard/DashboardMessageText.vue";
import DashboardLoaderSpinner from "./dashboard/DashboardLoaderSpinner.vue";
import ConfirmDialog from "./common/ConfirmDialog.vue";

const { selectWorkspace } = useFinStartContext();
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
}
type InsightMessage = {
  sender: "ai" | "user";
  text: string;
  id: string;
};
type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: InsightMessage[];
};
const CFO_CHAT_STORAGE_KEY = "finstart-cfo-copilot-sessions-v1";
const defaultInsightMessage: InsightMessage = {
  id: "welcome",
  sender: "ai",
  text: "Halo, saya Finstart CFO Copilot. Saya membaca alur operasional dan keuangan FinStart: CRM proyek, buku besar, jurnal, piutang, utang, pajak, SDM, aset, langganan, proyeksi, dan laporan.",
};
const initialChatSessions: ChatSession[] = [
  {
    id: "chat-current",
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [{ ...defaultInsightMessage }],
  },
];
function cloneChatSessions(sessions: ChatSession[] = initialChatSessions) {
  return sessions.map((session) => ({
    ...session,
    messages: session.messages.map((message) => ({ ...message })),
  }));
}
function cleanHistoryText(value = "") {
  return String(value)
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function loadStoredChatSessions() {
  if (typeof window === "undefined") return cloneChatSessions();
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(CFO_CHAT_STORAGE_KEY) || "[]",
    );
    if (Array.isArray(stored) && stored.length) {
      return cloneChatSessions(
        stored
          .filter(
            (session: any) => session?.id && Array.isArray(session.messages),
          )
          .slice(0, 12),
      );
    }
  } catch {
    return cloneChatSessions();
  }
  return cloneChatSessions();
}
const props = defineProps<DashboardViewProps>();
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
}: DashboardViewProps = props;
const initialSessions = loadStoredChatSessions();
const chatSessions = ref(initialSessions),
  updateChatSessions = (next) => (chatSessions.value = next);
const activeChatId = ref(initialSessions[0]?.id || initialChatSessions[0].id),
  updateActiveChatId = (next) => (activeChatId.value = next);
const inputMessage = ref(""),
  updateInputMessage = (next) => (inputMessage.value = next);
const isAiLoading = ref(false),
  updateIsAiLoading = (next) => (isAiLoading.value = next);
// Riwayat adalah panel lokal di dalam kartu AI CFO, bukan drawer global halaman.
const isChatHistoryOpen = ref(false),
  updateIsChatHistoryOpen = (next: any) => (isChatHistoryOpen.value = next);
const aiCardRef = ref(null);
const chatScrollRef = ref(null);
const chatInputRef = ref(null);
const pendingScrollMessageId = ref("");
const chatDeleteConfirmId = ref("");
// A chat created via "Chat baru" lives here - NOT in chatSessions - until the
// user actually sends a first message. That keeps unused new-chat clicks out
// of the history list/count instead of cluttering it with empty "Chat baru"
// entries the moment the button is pressed.
const draftChat = ref<ChatSession | null>(null);
const activeChat = computed(() => {
  if (draftChat.value && draftChat.value.id === activeChatId.value) {
    return draftChat.value;
  }
  return (
    chatSessions.value.find((session) => session.id === activeChatId.value) ||
    chatSessions.value[0]
  );
});
const chatDeleteTarget = computed(
  () =>
    chatSessions.value.find(
      (session) => session.id === chatDeleteConfirmId.value,
    ) || null,
);
const messages = computed(() => activeChat.value?.messages || []);
const scrollChatToLatestMessage = async () => {
  await nextTick();
  const element = chatScrollRef.value as HTMLElement | null;
  if (!element) return;
  const targetId =
    pendingScrollMessageId.value ||
    messages.value[messages.value.length - 1]?.id;
  const target = targetId
    ? (element.querySelector(
        `[data-cfo-message-id="${targetId}"]`,
      ) as HTMLElement | null)
    : null;
  if (!target) {
    element.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const offset =
    target.getBoundingClientRect().top -
    element.getBoundingClientRect().top +
    element.scrollTop -
    12;
  element.scrollTo({
    top: Math.max(offset, 0),
    behavior: "smooth",
  });
  pendingScrollMessageId.value = "";
};
const closeChatHistory = () => updateIsChatHistoryOpen(false);
const toggleChatHistory = () =>
  updateIsChatHistoryOpen((open: boolean) => !open);
const handleChatHistoryEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") closeChatHistory();
};
onMounted(() => {
  scrollChatToLatestMessage();
  if (typeof window !== "undefined")
    window.addEventListener("keydown", handleChatHistoryEscape);
});
onUnmounted(() => {
  if (typeof window !== "undefined")
    window.removeEventListener("keydown", handleChatHistoryEscape);
});
watch(
  chatSessions,
  (sessions) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CFO_CHAT_STORAGE_KEY,
        JSON.stringify(sessions.slice(0, 12)),
      );
    }
  },
  { deep: true },
);
watch(() => messages.value.length, scrollChatToLatestMessage);
const keepFocusOnAiForm = async () => {
  await nextTick();
  const card = aiCardRef.value as HTMLElement | null;
  const input = chatInputRef.value as HTMLInputElement | null;
  card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  input?.focus({ preventScroll: true });
};
const selectChatHistory = async (chatId: string) => {
  // Switching to a saved chat abandons whatever draft was sitting unused -
  // it was never persisted anywhere, so there's nothing to clean up.
  draftChat.value = null;
  updateActiveChatId(chatId);
  closeChatHistory();
  await keepFocusOnAiForm();
  scrollChatToLatestMessage();
};
const createNewChat = () => {
  const newSession: ChatSession = {
    id: `chat-${Date.now()}`,
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [
      {
        ...defaultInsightMessage,
        id: `welcome-${Date.now()}`,
      },
    ],
  };
  draftChat.value = newSession;
  updateActiveChatId(newSession.id);
  updateInputMessage("");
  closeChatHistory();
  keepFocusOnAiForm();
};
const clearActiveChat = (archiveCleared = true) => {
  const current = activeChat.value;
  // Clearing an unused draft is a no-op: it has no conversation to archive
  // and it isn't in chatSessions yet, so there's nothing to reset there.
  if (draftChat.value && current?.id === draftChat.value.id) {
    updateInputMessage("");
    return;
  }
  const archive =
    archiveCleared && current ? createClearedChatArchive(current) : null;
  const clearedSession: ChatSession = {
    id: current?.id || activeChatId.value || `chat-${Date.now()}`,
    title: "Chat baru",
    updatedAt: "Baru saja",
    messages: [
      {
        ...defaultInsightMessage,
        id: `clear-${Date.now()}`,
      },
    ],
  };

  chatSessions.value = [
    clearedSession,
    ...(archive ? [archive] : []),
    ...chatSessions.value.filter((session) => session.id !== clearedSession.id),
  ].slice(0, 12);
  updateActiveChatId(clearedSession.id);
  updateInputMessage("");
};
const deleteChat = (chatId: string) => {
  if (chatSessions.value.length === 1) {
    clearActiveChat(false);
    return;
  }
  const remaining = chatSessions.value.filter(
    (session) => session.id !== chatId,
  );
  updateChatSessions(remaining);
  if (activeChatId.value === chatId) {
    updateActiveChatId(remaining[0].id);
  }
};
const appendMessageToChat = (
  chatId: string,
  message: InsightMessage,
  titleFromPrompt?: string,
) => {
  pendingScrollMessageId.value = message.id;
  chatSessions.value = chatSessions.value.map((session) =>
    session.id === chatId
      ? {
          ...session,
          title: titleFromPrompt || session.title,
          updatedAt: "Baru saja",
          messages: [...session.messages, message],
        }
      : session,
  );
};
const createChatTitle = (prompt: string) => {
  const title = prompt.replace(/\s+/g, " ").trim();
  return title.length > 88 ? `${title.slice(0, 85)}...` : title;
};
const createClearedChatArchive = (session: ChatSession): ChatSession | null => {
  const hasConversation =
    session.title !== "Chat baru" ||
    session.messages.length > 1 ||
    session.messages.some(
      (message) => message.id !== defaultInsightMessage.id && message.id !== "welcome",
    );

  if (!hasConversation) return null;

  const timestamp = Date.now();
  return {
    id: `cleared-${timestamp}`,
    title:
      session.title === "Chat baru"
        ? "Percakapan yang dibersihkan"
        : `${session.title} (dibersihkan)`,
    updatedAt: "Dibersihkan",
    messages: session.messages.map((message, index) => ({
      ...message,
      id: `cleared-${timestamp}-${index}`,
    })),
  };
};
const handleFastQuestion = async (prompt: string) => {
  if (isAiLoading.value) return;
  const targetChatId = activeChatId.value;
  const shouldUpdateTitle = activeChat.value?.title === "Chat baru";
  const generatedTitle = createChatTitle(prompt);
  const historyForRequest = (activeChat.value?.messages || []).map(
    (message) => ({ sender: message.sender, text: message.text }),
  );
  // First real message in this chat - it's actually being used now, so move
  // it out of the draft slot and into history for good.
  if (draftChat.value && draftChat.value.id === targetChatId) {
    chatSessions.value = [draftChat.value, ...chatSessions.value];
    draftChat.value = null;
  }
  appendMessageToChat(
    targetChatId,
    {
      id: `user-${Date.now()}`,
      sender: "user",
      text: prompt,
    },
    shouldUpdateTitle ? generatedTitle : undefined,
  );
  updateIsAiLoading(true);
  try {
    const result = await financeApi.post("/ai-copilot/copilot", {
      message: prompt,
      history: historyForRequest,
      context: aiContext,
    });
    appendMessageToChat(targetChatId, {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: result?.reply || "AI tidak memberikan jawaban.",
    });
  } catch (error) {
    appendMessageToChat(targetChatId, {
      id: `ai-error-${Date.now()}`,
      sender: "ai",
      text: getApiErrorMessage(
        error,
        "Gagal menghubungi AI Copilot. Coba lagi sebentar lagi.",
      ),
    });
  } finally {
    updateIsAiLoading(false);
  }
};
const handleSendMessage = (event: Event) => {
  event.preventDefault();
  if (!inputMessage.value.trim()) return;
  const prompt = inputMessage.value;
  updateInputMessage("");
  handleFastQuestion(prompt);
};

const dashboardData = dashboard || {};
const fallbackCash = akun
  .filter(
    (account) =>
      account.tipe === "Aset" &&
      ["1001", "1002", "1110", "1120", "1130"].includes(account.kode),
  )
  .reduce((sum, account) => sum + Number(account.saldo || 0), 0);
const totalKasBank = Number(dashboardData.cash_balance || fallbackCash || 0);
const ongoingProjectsCount = Number(
  dashboardData.active_projects ??
    proyek.filter((project) => project.status === "Ongoing").length,
);
// Sama seperti KPI "Klien Aktif" di kartu ringkasan - jangan hitung ulang
// dengan cara berbeda di tempat lain (mis. AI context), supaya angkanya
// selalu konsisten dengan yang ditampilkan di layar.
const activeClientsCount = klien.filter(
  (item) => (item.status || "active") === "active",
).length;
const monthlySubscriptionBurn = langganan.reduce(
  (total, item) => total + Number(item.biayaIDR || 0),
  0,
);
const fallbackRevenue = akun
  .filter((account) => account.tipe === "Pendapatan")
  .reduce((sum, account) => sum + Number(account.saldo || 0), 0);
const fallbackExpense = akun
  .filter((account) => account.tipe === "Beban")
  .reduce((sum, account) => sum + Number(account.saldo || 0), 0);
const totalRevenue = Number(dashboardData.total_revenue || fallbackRevenue || 0);
const netProfit = Number(dashboardData.net_profit || (fallbackRevenue - fallbackExpense) || 0);
const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
const normalizedCashflow =
  Array.isArray(dashboardData.cashflow_series) &&
  dashboardData.cashflow_series.length
    ? dashboardData.cashflow_series.map((item: any) => ({
        month: item.short_label || item.label || item.month || "-",
        income: Number(item.income || 0) / 1000000,
        expense: Number(item.expense || 0) / 1000000,
        incomeRaw: Number(item.income || 0),
        expenseRaw: Number(item.expense || 0),
      }))
    : [];
const monthlyCashflow = normalizedCashflow.length
  ? normalizedCashflow
  : [{ month: "-", income: 0, expense: 0, incomeRaw: 0, expenseRaw: 0 }];
const latestTransactions = computed(() => {
  const dashboardTransactions = Array.isArray(dashboardData.recent_transactions)
    ? dashboardData.recent_transactions
    : [];

  if (dashboardTransactions.length) {
    return dashboardTransactions.slice(0, 3).map((transaction: any) => ({
      id: String(transaction.id ?? transaction.voucher_number ?? ""),
      tanggal: transaction.transaction_date || transaction.tanggal || "-",
      refVoucher:
        transaction.voucher_number || transaction.refVoucher || "-",
      keterangan:
        transaction.description || transaction.keterangan || "-",
      nominal: Number(
        transaction.total_amount ??
          transaction.total_debit ??
          transaction.nominal ??
          0,
      ),
    }));
  }

  return transaksi.slice(0, 3);
});
const ongoingProjects = proyek
  .filter((project) => project.status === "Ongoing")
  .slice(0, 3);
const actionInvoices = (invoices || [])
  .filter((item: any) => {
    const s = String(item.status || "").toLowerCase();
    return ["unpaid", "overdue"].includes(s) && Number(item.outstandingAmount || item.nominal || 0) > 0;
  })
  .slice(0, 2);
const openInvoices = (invoices || []).filter(
  (item: any) => {
    const s = String(item.status || "").toLowerCase();
    return ["unpaid", "overdue"].includes(s) && Number(item.outstandingAmount || item.nominal || 0) > 0;
  },
);
const overdueInvoices = openInvoices.filter(
  (item: any) => item.status === "Overdue",
);
const openBills = (bills || []).filter((item: any) => item.status !== "Lunas");
const unpaidTaxes = (taxes || []).filter(
  (item: any) => item.status !== "Sudah Setor",
);
const totalReceivable = Number(
  dashboardData.total_receivable ||
    openInvoices.reduce(
      (sum: number, item: any) =>
        sum + Number(item.outstandingAmount || item.nominal || 0),
      0,
    ),
);
const totalPayable = Number(
  dashboardData.total_payable ||
    openBills.reduce(
      (sum: number, item: any) =>
        sum + Number(item.outstandingAmount || item.nominal || 0),
      0,
    ),
);
const totalAssetsBookValue = (assets || []).reduce(
  (sum: number, item: any) =>
    sum + Number(item.nilaiBuku || item.hargaBeli || 0),
  0,
);
const monthlyPayroll = (pegawai || []).reduce(
  (sum: number, item: any) => sum + Number(item.gajiBersih || 0),
  0,
);
const projectionSummary = projectionData?.summary || {};
const reportSummary = reportData || {};
function resolveKlienName(klienId: string) {
  return klien.find((item) => item.id === klienId)?.namaPerusahaan || "-";
}
// Model AI lokal (kecil) tidak bisa diandalkan untuk hitung tanggal/selisih sendiri,
// jadi semua perbandingan tanggal dan pengurangan dihitung di kode di sini, bukan
// diserahkan ke AI - AI cuma perlu membacakan angka yang sudah pasti benar.
const TODAY_MS = new Date(new Date().toDateString()).getTime();
function daysFromToday(dateString: string | undefined | null) {
  if (!dateString) return null;
  const target = new Date(String(dateString).slice(0, 10));
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - TODAY_MS) / 86400000);
}
const upcomingDeadlines: Array<{
  jenis: string;
  proyek: string;
  klien: string;
  keterangan: string;
  tanggal: string;
  hariLagi: number;
}> = [];
proyek
  .filter((item) => !["Cancelled", "Completed"].includes(item.status))
  .forEach((item) => {
    const projectDays = daysFromToday(item.tanggalSelesai);
    if (projectDays !== null && projectDays >= -3 && projectDays <= 14) {
      upcomingDeadlines.push({
        jenis: "Selesai proyek",
        proyek: item.nama,
        klien: resolveKlienName(item.klienId),
        keterangan: "Tanggal target selesai proyek",
        tanggal: item.tanggalSelesai,
        hariLagi: projectDays,
      });
    }
    (item.milestones || []).forEach((milestone) => {
      const milestoneDays = daysFromToday(milestone.due_date);
      if (
        milestoneDays !== null &&
        milestoneDays >= -3 &&
        milestoneDays <= 14 &&
        milestone.status !== "completed"
      ) {
        upcomingDeadlines.push({
          jenis: "Milestone",
          proyek: item.nama,
          klien: resolveKlienName(item.klienId),
          keterangan: milestone.title,
          tanggal: milestone.due_date || "-",
          hariLagi: milestoneDays,
        });
      }
    });
  });
upcomingDeadlines.sort((a, b) => a.hariLagi - b.hariLagi);
// Snapshot data FinStart yang dikirim ke backend sebagai konteks nyata untuk AI Copilot.
// Backend menyuntikkan ini ke system prompt AI lokal (Ollama) agar jawaban dihitung dari
// data asli, bukan template yang dicocokkan dari kata kunci.
const aiContext = {
  klien: {
    totalKlienAktif: activeClientsCount,
    daftar: klien.slice(0, 40).map((item) => ({
      nama: item.namaPerusahaan,
      bidang: item.bidang,
      lokasi: item.lokasi,
      pic: item.pic,
      status: item.status || "active",
    })),
  },
  ringkasanKeuangan: {
    kasBank: totalKasBank,
    pendapatanTercatat: totalRevenue,
    labaBersih: netProfit,
    marginLabaPersen: Number(profitMargin.toFixed(1)),
    piutangTerbuka: totalReceivable,
    invoiceOverdueCount: overdueInvoices.length,
    utangTerbuka: totalPayable,
    nilaiBukuAset: totalAssetsBookValue,
    payrollBulanan: monthlyPayroll,
    langgananBulanan: monthlySubscriptionBurn,
  },
  proyeksiTarget: {
    tahun: projectionData?.year || new Date().getFullYear(),
    targetPendapatan: Number(projectionSummary.revenue_target || 0),
    realisasiPendapatan: Number(projectionSummary.revenue_actual || 0),
    selisihMenujuTargetPendapatan:
      Number(projectionSummary.revenue_target || 0) -
      Number(projectionSummary.revenue_actual || 0),
    targetBeban: Number(projectionSummary.expense_target || 0),
    realisasiBeban: Number(projectionSummary.expense_actual || 0),
    targetLaba: Number(projectionSummary.profit_target || 0),
    realisasiLaba: Number(projectionSummary.profit_actual || 0),
    selisihMenujuTargetLaba:
      Number(projectionSummary.profit_target || 0) -
      Number(projectionSummary.profit_actual || 0),
    statusPerencanaan: projectionSummary.planning_status?.label || "-",
    saldoKas: Number(projectionSummary.cash_balance || 0),
    burnRateBulanan: Number(projectionSummary.monthly_burn_rate || 0),
    runwayBulan: projectionSummary.runway_months ?? null,
  },
  agendaJatuhTempoDekat: {
    catatan:
      "Daftar ini sudah diurutkan dari yang paling dekat waktunya. hariLagi negatif berarti sudah lewat jatuh tempo (terlambat), 0 berarti hari ini, positif berarti berapa hari lagi.",
    daftar: upcomingDeadlines,
  },
  laporanKeuangan: {
    tersedia: Object.keys(reportSummary).length > 0,
    pendapatanLaporan: Number(reportSummary.income_statement?.total_revenue || 0),
    bebanLaporan: Number(reportSummary.income_statement?.total_expense || 0),
    labaBersihLaporan: Number(reportSummary.income_statement?.net_profit || 0),
  },
  proyek: proyek
    .filter((item) => item.status !== "Cancelled")
    .slice(0, 40)
    .map((item) => ({
      nama: item.nama,
      klien: resolveKlienName(item.klienId),
      status: item.status,
      nilaiKontrak: item.nilaiKontrak,
      tanggalMulai: item.tanggalMulai,
      tanggalSelesai: item.tanggalSelesai,
      picKontak: item.picKontak,
      milestones: (item.milestones || []).map((milestone) => ({
        judul: milestone.title,
        jatuhTempo: milestone.due_date,
        status: milestone.status,
      })),
    })),
  invoiceTerbuka: openInvoices.slice(0, 30).map((item: any) => ({
    klien: item.klienNama,
    proyek: item.proyekNama,
    nomor: item.nomor,
    nominal: Number(item.outstandingAmount || item.nominal || 0),
    jatuhTempo: item.jatuhTempo,
    status: item.status,
  })),
  tagihanVendorTerbuka: openBills.slice(0, 30).map((item: any) => ({
    vendor: item.vendor,
    nomor: item.nomorTagihan,
    nominal: Number(item.outstandingAmount || item.nominal || 0),
    jatuhTempo: item.jatuhTempo,
    status: item.status,
  })),
  pajakBelumSetor: {
    catatan:
      "Field total sudah dijumlahkan duluan dari seluruh pajak yang belum disetor - pakai ini langsung untuk pertanyaan total, jangan jumlahkan ulang dari daftar.",
    total: unpaidTaxes.reduce(
      (sum: number, item: any) => sum + Number(item.nominal || 0),
      0,
    ),
    daftar: unpaidTaxes.slice(0, 30).map((item: any) => ({
      jenis: item.jenis,
      masaPajak: item.masaPajak,
      nominal: Number(item.nominal || 0),
      jatuhTempo: item.jatuhTempo,
    })),
  },
  sdm: {
    totalPegawai: (pegawai || []).length,
    payrollBulanan: monthlyPayroll,
    pegawaiPerluTinjauan: (pegawai || [])
      .filter((item: any) => item.compliance === "Tinjauan")
      .map((item: any) => item.nama),
  },
  aset: {
    totalAset: (assets || []).length,
    nilaiBuku: totalAssetsBookValue,
  },
  langganan: {
    totalLayanan: langganan.length,
    biayaBulanan: monthlySubscriptionBurn,
  },
};
const maxValue = Math.max(
  ...monthlyCashflow.flatMap((item: any) => [item.income, item.expense]),
  1,
);
const chartX = (index: number) =>
  monthlyCashflow.length <= 1
    ? 260
    : 24 + index * (472 / (monthlyCashflow.length - 1));
const chartY = (value: number) => 168 - (value / maxValue) * 126;
const incomePoints = monthlyCashflow.map((item, index) => ({
  x: chartX(Number(index)),
  y: chartY(item.income),
}));
const expensePoints = monthlyCashflow.map((item, index) => ({
  x: chartX(Number(index)),
  y: chartY(item.expense),
}));
const createCurvePath = (points: { x: number; y: number }[]) => {
  if (!points.length) return "";
  return points.slice(1).reduce((path, point, index) => {
    const previousPoint = points[index];
    const middleX = (previousPoint.x + point.x) / 2;
    return `${path} C ${middleX} ${previousPoint.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
};
const incomePath = createCurvePath(incomePoints);
const expensePath = createCurvePath(expensePoints);
function handleDeleteChatClick(chatId: string, event: MouseEvent) {
  event.stopPropagation();
  chatDeleteConfirmId.value = chatId;
}

function closeChatDeleteConfirm() {
  chatDeleteConfirmId.value = "";
}

function confirmDeleteChat() {
  if (!chatDeleteConfirmId.value) return;
  deleteChat(chatDeleteConfirmId.value);
  closeChatDeleteConfirm();
}

</script>

<style scoped>
#ai-cfo-card {
  --cfo-navy: #0b1f4a;
  --cfo-white: #ffffff;
  border-color: var(--cfo-navy);
  background: var(--cfo-white);
  box-shadow: 0 24px 64px rgba(11, 31, 74, 0.22);
  color: var(--cfo-navy);
  isolation: isolate;
}

@media (min-width: 1280px) {
  .cfo-column {
    position: relative;
    height: 100%;
  }

  #ai-cfo-card {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    max-height: none;
  }
}

.cfo-bg-gradient {
  background: linear-gradient(145deg, rgba(11, 31, 74, 0.08), transparent 42%);
}

.cfo-bg-grid {
  opacity: 0.28;
  background-image:
    linear-gradient(rgba(11, 31, 74, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(11, 31, 74, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: linear-gradient(to bottom, black, transparent 42%);
}

.cfo-hero {
  color: var(--cfo-white);
  background: var(--cfo-navy);
  border-bottom: 1px solid var(--cfo-navy);
}

.cfo-hero::after {
  content: "";
  position: absolute;
  inset: auto 20px 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.35);
}

.cfo-hero-icon {
  color: var(--cfo-navy);
  background: var(--cfo-white);
  box-shadow: 0 10px 24px rgba(255, 255, 255, 0.16);
}

.cfo-hero .cfo-eyebrow,
.cfo-hero h2,
.cfo-hero p {
  color: var(--cfo-white) !important;
}

.cfo-history-toggle,
.cfo-new-chat {
  border: 1px solid rgba(255, 255, 255, 0.52);
  color: var(--cfo-white);
  background: transparent;
}

.cfo-history-toggle:hover,
.cfo-history-toggle.active,
.cfo-new-chat:hover {
  color: var(--cfo-navy);
  background: var(--cfo-white);
  border-color: var(--cfo-white);
}

.cfo-count-badge {
  color: var(--cfo-navy);
  background: var(--cfo-white);
}

.cfo-history-toggle:hover .cfo-count-badge,
.cfo-history-toggle.active .cfo-count-badge {
  color: var(--cfo-white);
  background: var(--cfo-navy);
}

.cfo-sidebar,
.cfo-chat-top,
.cfo-composer {
  border-color: rgba(11, 31, 74, 0.22);
}

.cfo-sidebar {
  background: rgba(11, 31, 74, 0.045);
  padding: 18px 20px;
}

.cfo-sidebar > div {
  gap: 10px;
}

.cfo-section-label,
.cfo-message-label {
  color: var(--cfo-navy);
  font-weight: 800;
}

.cfo-template-button {
  min-height: 46px;
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--cfo-navy);
  border-color: rgba(11, 31, 74, 0.38);
  background: var(--cfo-white);
  line-height: 1.35;
  box-shadow: 0 5px 14px rgba(11, 31, 74, 0.06);
}

.cfo-template-button span {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.cfo-template-button:hover {
  color: var(--cfo-white);
  border-color: var(--cfo-navy);
  background: var(--cfo-navy);
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(11, 31, 74, 0.15);
}

.cfo-ai-workspace,
.cfo-chat-scroll {
  overscroll-behavior: contain;
  scrollbar-color: rgba(11, 31, 74, 0.45) transparent;
  scrollbar-width: thin;
  background: var(--cfo-white);
}

.cfo-chat-scroll::-webkit-scrollbar {
  width: 7px;
}

.cfo-chat-scroll::-webkit-scrollbar-thumb {
  border: 2px solid var(--cfo-white);
  border-radius: 999px;
  background: rgba(11, 31, 74, 0.45);
}

.cfo-chat-top {
  background: var(--cfo-white);
  min-height: 76px;
  padding: 16px 20px;
}

.cfo-chat-top p {
  color: var(--cfo-navy) !important;
}

.cfo-focus-card {
  padding: 18px 20px;
  border-radius: 16px;
  color: var(--cfo-white);
  border-color: var(--cfo-navy);
  background: var(--cfo-navy);
  box-shadow: 0 14px 30px rgba(11, 31, 74, 0.16);
}

.cfo-focus-card p,
.cfo-focus-icon {
  color: var(--cfo-white) !important;
}

.cfo-focus-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.cfo-message.ai {
  margin-right: 0;
  padding: 18px 20px;
  border-radius: 16px;
  color: var(--cfo-navy);
  border: 1px solid rgba(11, 31, 74, 0.24);
  background: rgba(11, 31, 74, 0.05);
}

.cfo-message.user {
  padding: 14px 16px;
  color: var(--cfo-white);
  background: var(--cfo-navy);
  box-shadow: 0 10px 22px rgba(11, 31, 74, 0.14);
}

.cfo-message.user :deep(*) {
  color: var(--cfo-white) !important;
}

.cfo-loading-message {
  color: var(--cfo-navy);
  border: 1px solid rgba(11, 31, 74, 0.22);
  background: rgba(11, 31, 74, 0.05);
}

.cfo-composer {
  background: var(--cfo-white);
  padding: 16px 18px;
}

.cfo-input-shell {
  min-height: 58px;
  padding: 6px;
  border-radius: 16px;
  border-color: var(--cfo-navy);
  background: var(--cfo-white);
  box-shadow: 0 10px 28px rgba(11, 31, 74, 0.1);
}

#ai-chat-input {
  color: var(--cfo-navy) !important;
  background: var(--cfo-white) !important;
}

#ai-chat-input::placeholder {
  color: rgba(11, 31, 74, 0.48) !important;
}

.cfo-send-button {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  color: var(--cfo-white);
  background: #1e5aa8;
}

.cfo-send-button:not(:disabled):hover {
  background: var(--cfo-navy);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(11, 31, 74, 0.24);
}

.cfo-send-button:disabled {
  color: var(--cfo-white);
  background: rgba(30, 90, 168, 0.68);
  opacity: 1;
}

.cfo-send-button:disabled:has(.animate-spin) {
  background: #1e5aa8;
}

.cfo-inline-history {
  display: flex;
  flex: 0 0 320px;
  width: 320px;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  flex-direction: column;
  gap: 12px;
  color: var(--cfo-navy);
  border-left: 1px solid rgba(11, 31, 74, 0.1);
  background: #f7f9fc;
  box-shadow: none;
  overflow-y: auto;
}

.cfo-history-page {
  flex: 1 1 auto;
  width: 100%;
  border-left: 0;
  background: var(--cfo-white);
}

.cfo-inline-history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cfo-inline-history-close {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(11, 31, 74, 0.2);
  border-radius: 9px;
  transition: 160ms ease;
}

.cfo-inline-history-close:hover {
  color: var(--cfo-white);
  border-color: var(--cfo-navy);
  background: var(--cfo-navy);
}

.cfo-inline-new-chat {
  display: flex;
  min-height: 40px;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(11, 31, 74, 0.25);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  transition: 160ms ease;
}

.cfo-inline-history-list {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 3px;
  overscroll-behavior: contain;
  scrollbar-color: rgba(11, 31, 74, 0.35) transparent;
  scrollbar-width: thin;
}

.cfo-history-page .cfo-inline-history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cfo-inline-session {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 0 0 auto;
  align-items: stretch;
  overflow: visible;
  border: 1px solid rgba(11, 31, 74, 0.18);
  border-radius: 12px;
  transition: 160ms ease;
}

.cfo-inline-session:hover {
  border-color: rgba(11, 31, 74, 0.5);
  box-shadow: 0 7px 18px rgba(11, 31, 74, 0.08);
}

.cfo-inline-session-open {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 14px;
  text-align: left;
}

.cfo-inline-session-title,
.cfo-inline-session-preview {
  display: block;
  width: 100%;
  overflow: visible;
  text-overflow: initial;
  white-space: normal;
  overflow-wrap: anywhere;
}

.cfo-inline-session-title {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.4;
}

.cfo-inline-session-preview {
  color: #6b7a90;
  font-size: 11px;
  line-height: 1.5;
}

.cfo-inline-session-time {
  color: #7a889d;
  font-size: 9px;
  line-height: 1.4;
}

.cfo-inline-delete {
  display: inline-flex;
  width: 44px;
  min-height: 100%;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  color: #7a889d;
  border-left: 1px solid rgba(11, 31, 74, 0.12);
  border-radius: 0 12px 12px 0;
  transition: 160ms ease;
}

.cfo-inline-delete:hover {
  color: #b42318;
  background: #fff1f0;
}

.cfo-inline-session.active .cfo-inline-session-preview,
.cfo-inline-session.active .cfo-inline-session-time,
.cfo-inline-session.active .cfo-inline-delete {
  color: rgba(255, 255, 255, 0.76);
}

.cfo-inline-session.active .cfo-inline-delete {
  border-left-color: rgba(255, 255, 255, 0.2);
}

.cfo-inline-session.active .cfo-inline-delete:hover {
  color: var(--cfo-white);
  background: rgba(255, 255, 255, 0.14);
}

.cfo-inline-history-note {
  flex: 0 0 auto;
  margin: 0;
  color: #6b7a90;
  font-size: 9px;
  line-height: 1.5;
}

.cfo-inline-history-close,
.cfo-inline-new-chat,
.cfo-inline-session {
  color: var(--cfo-navy);
  border-color: rgba(11, 31, 74, 0.25);
  background: var(--cfo-white);
}

.cfo-inline-new-chat:hover,
.cfo-inline-session.active {
  color: var(--cfo-white);
  background: var(--cfo-navy);
}

@media (max-width: 640px) {
  .cfo-hero {
    padding: 1rem;
  }

  .cfo-new-chat-label,
  .cfo-history-label {
    display: none;
  }

  .cfo-sidebar > div {
    grid-template-columns: 1fr;
  }

  .cfo-sidebar,
  .cfo-chat-top,
  .cfo-composer {
    padding-left: 14px;
    padding-right: 14px;
  }

  .cfo-focus-card,
  .cfo-message.ai {
    padding: 14px;
  }

  .cfo-ai-workspace {
    position: relative;
  }

  .cfo-inline-history {
    position: absolute;
    inset: 0;
    z-index: 20;
    width: 100%;
    max-width: none;
    border-left: 0;
    box-shadow: none;
  }

  .cfo-inline-history-list {
    display: flex;
  }
}
</style>
