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
              <div v-if="!isChatHistoryOpen" class="cfo-sidebar border-b p-3">
              <p
                class="cfo-section-label mb-2 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
              >
                <FileText class="h-3.5 w-3.5" /> Template
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 min-[1500px]:grid-cols-4">
                <button
                  v-for="item in quickQuestions.slice(0, 4)"
                  :id="`btn-fast-${item.id}`"
                  :key="item.id"
                  type="button"
                  class="cfo-template-button group flex min-h-9 w-full items-center justify-between gap-2 rounded-xl border px-3 text-left text-[11px] font-medium transition"
                  @click="handleFastQuestion(item.prompt)"
                >
                  <span class="min-w-0 truncate">{{ item.label }}</span
                  ><ArrowUpRight class="h-3.5 w-3.5 shrink-0 opacity-80" />
                </button>
              </div>
            </div>
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
                  <button
                    id="btn-clear-chat"
                    type="button"
                    class="cfo-clear-button shrink-0 text-[11px] font-semibold transition"
                    @click="() => clearActiveChat()"
                  >
                    Bersihkan
                  </button>
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
    title: "Prioritas kas & piutang",
    updatedAt: "Baru saja",
    messages: [
      {
        id: "welcome",
        sender: "ai",
        text: "Prioritas bulan ini adalah percepatan penagihan piutang dan penyetoran PPN. Kas operasional tetap sehat, namun terdapat dua invoice yang membutuhkan tindak lanjut sebelum pertengahan bulan.",
      },
    ],
  },
  {
    id: "chat-pajak",
    title: "Analisis kewajiban pajak",
    updatedAt: "Hari ini",
    messages: [
      {
        id: "pajak-1",
        sender: "ai",
        text: "Ringkasan sebelumnya: PPh 21 dan PPN perlu dipantau sebelum jatuh tempo agar status kepatuhan tetap patuh.",
      },
    ],
  },
  {
    id: "chat-burn",
    title: "Optimasi burn rate digital",
    updatedAt: "Kemarin",
    messages: [
      {
        id: "burn-1",
        sender: "ai",
        text: "Ringkasan sebelumnya: evaluasi langganan dengan utilisasi rendah dan tinjau pengeluaran cloud bulanan.",
      },
    ],
  },
];
const quickQuestions = [
  {
    id: "flow",
    label: "Baca alur finance end-to-end",
    prompt:
      "Baca semua alur aplikasi dari operasional sampai keuangan, lalu beri prioritas tindakan minggu ini.",
  },
  {
    id: "cash",
    label: "Prioritas kas dan piutang",
    prompt:
      "Analisis prioritas kas, piutang, dan invoice yang perlu ditagih bulan ini.",
  },
  {
    id: "tax",
    label: "Analisis kewajiban pajak",
    prompt:
      "Analisis kewajiban perpajakan dan risiko kepatuhan berdasarkan data pajak dan jurnal.",
  },
  {
    id: "burn",
    label: "Optimasi burn rate digital",
    prompt:
      "Berapa pengeluaran langganan rutin digital kita dan bagaimana cara optimasinya?",
  },
  {
    id: "project",
    label: "Status proyek ke invoice",
    prompt:
      "Cek proyek aktif, klien, nilai kontrak, dan peluang invoice yang perlu diterbitkan.",
  },
  {
    id: "payable",
    label: "Risiko utang vendor",
    prompt:
      "Analisis utang vendor, jadwal pembayaran, dan dampaknya ke kas operasional.",
  },
  {
    id: "people",
    label: "SDM dan payroll",
    prompt:
      "Ringkas kondisi SDM, payroll, dan kepatuhan karyawan yang perlu dipantau.",
  },
  {
    id: "asset",
    label: "Aset dan depresiasi",
    prompt:
      "Analisis aset, nilai buku, langganan, dan pengeluaran operasional rutin.",
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
const activeChat = computed(
  () =>
    chatSessions.value.find((session) => session.id === activeChatId.value) ||
    chatSessions.value[0],
);
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
  chatSessions.value = [newSession, ...chatSessions.value];
  updateActiveChatId(newSession.id);
  updateInputMessage("");
  closeChatHistory();
  keepFocusOnAiForm();
};
const clearActiveChat = (archiveCleared = true) => {
  const current = activeChat.value;
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
const normalizeCfoTemplate = (reply: string) => {
  if (reply.includes("**AI INSIGHT**")) return reply;
  return [
    "**AI INSIGHT**",
    reply,
    "",
    "**DATA TERBACA**",
    `- Modul aktif: ${formatCount(klien.length, "klien")}, ${formatCount(proyek.length, "proyek")}, ${formatCount(transaksi.length, "jurnal")}, ${formatCount(openInvoices.length, "invoice terbuka")}.`,
    `- Kas, piutang, utang: ${formatRupiah(totalKasBank)} / ${formatRupiah(totalReceivable)} / ${formatRupiah(totalPayable)}.`,
    "",
    "**ARAH TINDAKAN**",
    "- Buka modul terkait dari sidebar, cek data yang disebut, lalu posting atau simpan transaksi dari form resmi modul.",
  ].join("\n");
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
  window.setTimeout(() => {
    appendMessageToChat(targetChatId, {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: normalizeCfoTemplate(buildCfoReply(prompt)),
    });
    updateIsAiLoading(false);
  }, 360);
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
const activeClientsCount = klien.length;
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
function formatCount(count: number, label: string) {
  return `${count.toLocaleString("id-ID")} ${label}`;
}
function buildCfoContextIntro() {
  return [
    `- Operasional CRM: ${formatCount(klien.length, "klien")} dan ${formatCount(proyek.length, "proyek")} (${formatCount(ongoingProjectsCount, "ongoing")}).`,
    `- Buku besar dan jurnal: ${formatCount(akun.length, "akun COA")} dan ${formatCount(transaksi.length, "jurnal/transaksi")}.`,
    `- Piutang: ${formatRupiah(totalReceivable)} dari ${formatCount(openInvoices.length, "invoice terbuka")} (${formatCount(overdueInvoices.length, "overdue")}).`,
    `- Utang vendor: ${formatRupiah(totalPayable)} dari ${formatCount(openBills.length, "tagihan terbuka")}.`,
    `- Pajak: ${formatCount(unpaidTaxes.length, "kewajiban belum setor")} dengan nilai ${formatRupiah(unpaidTaxes.reduce((sum: number, item: any) => sum + Number(item.nominal || 0), 0))}.`,
    `- SDM dan operasional rutin: payroll estimasi ${formatRupiah(monthlyPayroll)} dan langganan ${formatRupiah(monthlySubscriptionBurn)}/bulan.`,
    `- Aset dan laporan: ${formatCount((assets || []).length, "aset")} bernilai buku ${formatRupiah(totalAssetsBookValue)}; data proyeksi ${projectionSummary.year || projectionData?.year || "tahun berjalan"} terhubung.`,
  ];
}
function buildCfoReply(prompt: string) {
  const text = prompt.toLowerCase();
  const netCashPosition = totalKasBank + totalReceivable - totalPayable;
  const risk =
    overdueInvoices.length || unpaidTaxes.length || totalPayable > totalKasBank
      ? "Perlu tindakan terarah minggu ini."
      : "Masih terkendali, tetapi tetap perlu monitoring rutin.";
  const baseSummary = [
    "**Ringkasan CFO Copilot**",
    `- Posisi kas: ${formatRupiah(totalKasBank)} dengan estimasi posisi setelah piutang dan utang ${formatRupiah(netCashPosition)}.`,
    `- Margin laba berjalan: ${profitMargin.toLocaleString("id-ID", { maximumFractionDigits: 1 })}% dari pendapatan ${formatRupiah(totalRevenue)}.`,
    `- Sinyal risiko: ${risk}`,
  ];
  if (/(pajak|ppn|pph|tax|setor|kepatuhan)/.test(text)) {
    return [
      "**Analisis pajak dan kepatuhan**",
      `- Kewajiban belum setor: ${formatCount(unpaidTaxes.length, "item")} senilai ${formatRupiah(unpaidTaxes.reduce((sum: number, item: any) => sum + Number(item.nominal || 0), 0))}.`,
      `- Pajak perlu dicek terhadap jurnal pendapatan dan beban terbaru: ${formatCount(transaksi.length, "transaksi")}.`,
      "- Prioritas: validasi PPN keluaran dari invoice, cek PPh terkait payroll/vendor, lalu jadwalkan setoran sebelum jatuh tempo.",
      "- Risiko: jika invoice sudah issued tetapi pajak belum disiapkan, kas bisa terlihat sehat namun kewajiban bulan berjalan tertahan.",
    ].join("\n");
  }
  if (/(piutang|invoice|tagih|receivable|kas|cash|bank)/.test(text)) {
    const largestInvoice = [...openInvoices].sort(
      (a: any, b: any) =>
        Number(b.outstandingAmount || b.nominal || 0) -
        Number(a.outstandingAmount || a.nominal || 0),
    )[0];
    return [
      "**Prioritas kas dan piutang**",
      `- Kas tersedia: ${formatRupiah(totalKasBank)}.`,
      `- Piutang terbuka: ${formatRupiah(totalReceivable)} dari ${formatCount(openInvoices.length, "invoice")}; overdue ${formatCount(overdueInvoices.length, "invoice")}.`,
      largestInvoice
        ? `- Invoice terbesar untuk follow-up: ${largestInvoice.klienNama || "-"} ${formatRupiah(largestInvoice.outstandingAmount || largestInvoice.nominal || 0)} (${largestInvoice.nomor || "-"}).`
        : "- Tidak ada invoice terbuka yang perlu ditagih.",
      "- Tindakan: urutkan follow-up dari nominal terbesar, kirim reminder H-7/H-3, dan cocokkan pembayaran dengan jurnal kas masuk.",
    ].join("\n");
  }
  if (/(utang|vendor|bill|payable|bayar)/.test(text)) {
    const largestBill = [...openBills].sort(
      (a: any, b: any) =>
        Number(b.outstandingAmount || b.nominal || 0) -
        Number(a.outstandingAmount || a.nominal || 0),
    )[0];
    return [
      "**Analisis utang vendor**",
      `- Utang terbuka: ${formatRupiah(totalPayable)} dari ${formatCount(openBills.length, "tagihan")}.`,
      largestBill
        ? `- Tagihan paling besar: ${largestBill.vendor || "-"} ${formatRupiah(largestBill.outstandingAmount || largestBill.nominal || 0)} (${largestBill.nomorTagihan || "-"}).`
        : "- Tidak ada tagihan terbuka yang terlihat.",
      `- Rasio utang terhadap kas: ${totalKasBank > 0 ? `${((totalPayable / totalKasBank) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%` : "kas belum tersedia"}.`,
      "- Tindakan: pisahkan vendor kritikal dan non-kritikal, jadwalkan pembayaran berdasarkan jatuh tempo, lalu posting pembayaran agar buku besar tetap bersih.",
    ].join("\n");
  }
  if (/(proyek|project|crm|klien|kontrak|invoice diterbitkan)/.test(text)) {
    const activeProjectValue = proyek
      .filter((project) => project.status === "Ongoing")
      .reduce((sum, project) => sum + Number(project.nilaiKontrak || 0), 0);
    return [
      "**Alur proyek sampai invoice**",
      `- Klien aktif: ${formatCount(klien.length, "klien")}; proyek ongoing: ${formatCount(ongoingProjectsCount, "proyek")}.`,
      `- Nilai kontrak proyek ongoing: ${formatRupiah(activeProjectValue)}.`,
      `- Invoice terbuka saat ini: ${formatCount(openInvoices.length, "invoice")} senilai ${formatRupiah(totalReceivable)}.`,
      "- Tindakan: cek milestone proyek yang selesai, terbitkan invoice termin, lalu pastikan jurnal pendapatan dan piutang terbentuk.",
    ].join("\n");
  }
  if (
    /(langganan|burn|operasional|aset|depresiasi|asset|saas|software)/.test(
      text,
    )
  ) {
    return [
      "**Operasional rutin, aset, dan burn rate**",
      `- Langganan bulanan: ${formatRupiah(monthlySubscriptionBurn)} dari ${formatCount(langganan.length, "layanan")}.`,
      `- Aset tercatat: ${formatCount((assets || []).length, "aset")} dengan nilai buku ${formatRupiah(totalAssetsBookValue)}.`,
      `- Beban bulan berjalan: ${formatRupiah(Number(dashboardData.monthly_expense || 0))}.`,
      "- Tindakan: matikan langganan tidak aktif, cocokkan biaya cloud/software ke proyek, dan cek depresiasi aset sebelum tutup buku.",
    ].join("\n");
  }
  if (/(sdm|pegawai|payroll|gaji|bpjs|karyawan)/.test(text)) {
    const reviewEmployees = (pegawai || []).filter(
      (item: any) => item.compliance === "Tinjauan",
    ).length;
    return [
      "**SDM dan payroll**",
      `- Pegawai tercatat: ${formatCount((pegawai || []).length, "orang")}.`,
      `- Estimasi payroll: ${formatRupiah(monthlyPayroll)}.`,
      `- Status compliance tinjauan: ${formatCount(reviewEmployees, "pegawai")}.`,
      "- Tindakan: validasi BPJS/PPh 21, posting jurnal payroll tepat waktu, dan cocokkan biaya tenaga kerja dengan proyek terkait.",
    ].join("\n");
  }
  if (
    /(laporan|proyeksi|forecast|target|neraca|laba rugi|arus kas)/.test(text)
  ) {
    return [
      "**Laporan dan proyeksi**",
      `- Pendapatan tercatat: ${formatRupiah(totalRevenue)}; laba bersih: ${formatRupiah(netProfit)}.`,
      `- Target pendapatan proyeksi: ${formatRupiah(Number(projectionSummary.revenue_target || 0))}; realisasi: ${formatRupiah(Number(projectionSummary.revenue_actual || 0))}.`,
      `- Data laporan tersedia: ${Object.keys(reportSummary).length ? "laba rugi, neraca, dan arus kas" : "menunggu ringkasan laporan dari backend"}.`,
      "- Tindakan: bandingkan realisasi vs target, cek akun beban terbesar, dan pakai laporan arus kas untuk keputusan pembayaran vendor.",
    ].join("\n");
  }
  return [
    ...baseSummary,
    "",
    "**Konteks yang saya baca**",
    ...buildCfoContextIntro(),
    "",
    "**Prioritas tindakan**",
    "- Percepat penagihan invoice terbuka sebelum jadwal pembayaran vendor besar.",
    "- Tutup gap pajak dari invoice, payroll, dan vendor sebelum akhir periode.",
    "- Cocokkan proyek ongoing dengan milestone invoice agar pendapatan tidak tertunda.",
    "- Review langganan, aset, dan payroll sebagai beban operasional rutin.",
  ].join("\n");
}
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

.cfo-chat-top p,
.cfo-clear-button {
  color: var(--cfo-navy) !important;
}

.cfo-clear-button:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
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
