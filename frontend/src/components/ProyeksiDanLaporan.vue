<template>
  <div class="space-y-7 font-sans">
    <header
      class="workspace-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="flex items-start gap-4">
        <span
          class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E5F5] bg-white text-[#0B1F4A] shadow-[0_8px_20px_rgba(11,31,74,0.05)]"
          ><TrendingUp v-if="isForecast" class="h-5 w-5" /><FileSpreadsheet
            v-else
            class="h-5 w-5"
        /></span>
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]"
          >
            Financial Planning &amp; Reporting
          </p>
          <h1
            class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]"
          >
            <template v-if="isForecast">Proyeksi Bisnis Tahunan</template
            ><template v-else>Laporan Keuangan</template>
          </h1>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-[#6B7A90]">
            <template v-if="isForecast"
              >Pantau target bisnis, realisasi performa, dan roadmap pertumbuhan
              finansial secara terstruktur.</template
            ><template v-else
              >Tinjau laporan keuangan utama dalam format tabel yang siap
              digunakan untuk evaluasi manajemen.</template
            >
          </p>
        </div>
      </div>
      <div class="flex w-full flex-wrap gap-3 lg:w-auto">
        <button
          v-if="isForecast"
          id="btn-open-target-modal"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]"
          @click="openTargetModal()"
        >
          <Plus class="h-4 w-4" /> Tambah Target</button
        ><template v-else
          ><button
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-semibold text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
            @click="exportCurrentReportExcel"
          >
            <FileSpreadsheet class="h-4 w-4" /> Unduh Excel</button
          ><button
            id="btn-print-reports"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]"
            @click="updateIsPrintModalOpen(true)"
          >
            <Printer class="h-4 w-4" /> Cetak / Simpan PDF
          </button></template
        >
      </div>
    </header>
    <section v-if="!isForecast" class="space-y-4">
      <div
        class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-white px-5 py-4 shadow-[0_12px_30px_rgba(11,31,74,0.04)] sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5AA8]"
          >
            Sumber Data API
          </p>
          <p class="mt-1 text-sm text-[#53658A]">
            Pilih periode dari jurnal yang sudah berstatus
            <strong>posted</strong>. Laporan tidak lagi memakai angka Rp0 saat
            API gagal.
          </p>
        </div>
        <label class="flex w-full flex-col gap-1 sm:w-[220px]"
          ><span
            class="text-[10px] font-bold uppercase tracking-[0.13em] text-[#70819B]"
            >Periode laporan</span
          ><select
            :value="reportPeriod"
            class="h-10 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
            @change="selectReportPeriod(eventValue($event))"
          >
            <option
              v-if="reportPeriods.length === 0"
              :value="reportPeriod || ''"
            >
              {{ reportPeriod || "Tidak ada periode posted" }}
            </option>
            <option
              v-for="item in reportPeriods"
              :key="item.period"
              :value="item.period"
            >
              {{ item.label || item.period }}
            </option>
          </select></label
        >
      </div>
      <div
        v-if="reportError"
        class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700"
      >
        <AlertCircle class="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p class="font-semibold">Laporan belum dapat dimuat dari API.</p>
          <p class="mt-1 text-xs leading-5">{{ reportError }}</p>
        </div>
      </div>
    </section>
    <section v-if="isForecast" class="space-y-5">
      <div
        class="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]"
      >
        <div
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div
            class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
              >
                Scenario Planning
              </p>
              <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
                Skenario Optimistis, Normal, dan Pesimistis
              </h2>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Pilih skenario untuk melihat target tersesuaikan tanpa mengubah
                realisasi jurnal.
              </p>
            </div>
            <span
              class="inline-flex w-fit rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-2 text-xs font-semibold text-[#0B1F4A]"
              >Aktif: {{ currentScenario.label || "Normal" }}</span
            >
          </div>
          <div class="grid gap-3 p-5 md:grid-cols-3">
            <button
              v-for="scenario in projectionScenarios"
              :key="scenario.scenario_key"
              type="button"
              :class="`rounded-2xl border p-4 text-left transition ${String(currentScenario.scenario_key) === String(scenario.scenario_key) ? 'border-[#1E5AA8] bg-[#EEF5FC] shadow-sm' : 'border-[#E2EAF4] bg-white hover:border-[#BFD6F1] hover:bg-[#FBFDFF]'}`"
              @click="selectScenario(scenario)"
            >
              <p
                class="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1E5AA8]"
              >
                {{ scenario.label || scenario.scenario_key }}
              </p>
              <p class="mt-3 text-sm font-semibold text-[#182338]">
                Pendapatan ×
                {{ Number(scenario.revenue_factor || 1).toFixed(2) }}
              </p>
              <p class="mt-1 text-sm font-semibold text-[#53658A]">
                Beban × {{ Number(scenario.expense_factor || 1).toFixed(2) }}
              </p>
              <p class="mt-3 text-[11px] leading-4 text-[#6B7A90]">
                {{ scenario.notes || "Parameter target tahunan." }}
              </p>
            </button>
          </div>
          <div class="border-t border-[#E8EEF7] bg-[#FBFDFF] px-5 py-4">
            <div
              class="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_150px_auto]"
            >
              <label class="space-y-1"
                ><span
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
                  >Catatan skenario aktif</span
                ><input
                  :value="scenarioForm.notes"
                  placeholder="Catatan asumsi"
                  class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]"
                  @change="updateScenarioForm({
                        ...scenarioForm,
                        notes: eventValue($event),
                      })" /></label
              ><label class="space-y-1"
                ><span
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
                  >Faktor pendapatan</span
                ><input
                  type="number"
                  min="0.01"
                  step="0.01"
                  :value="scenarioForm.revenue_factor"
                  class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
                  @change="updateScenarioForm({
                        ...scenarioForm,
                        revenue_factor: Number(eventValue($event)),
                      })" /></label
              ><label class="space-y-1"
                ><span
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
                  >Faktor beban</span
                ><input
                  type="number"
                  min="0.01"
                  step="0.01"
                  :value="scenarioForm.expense_factor"
                  class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
                  @change="updateScenarioForm({
                        ...scenarioForm,
                        expense_factor: Number(eventValue($event)),
                      })" /></label
              ><button
                type="button"
                class="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#102A56]"
                @click="saveScenario"
              >
                Simpan Parameter
              </button>
            </div>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div
            class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]"
            >
              Kas &amp; Bank
            </p>
            <p class="mt-2 text-lg font-extrabold text-[#0B1F4A]">
              {{ formatRupiah(Number(projectionSummary.cash_balance || 0)) }}
            </p>
            <p class="mt-1 text-[11px] text-[#6B7A90]">
              Saldo akun kas/bank aktif.
            </p>
          </div>
          <div
            class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]"
            >
              Burn Rate Bulanan
            </p>
            <p class="mt-2 text-lg font-extrabold text-[#B45309]">
              {{
                formatRupiah(Number(projectionSummary.monthly_burn_rate || 0))
              }}
            </p>
            <p class="mt-1 text-[11px] text-[#6B7A90]">
              Rata-rata beban posted atau forecast.
            </p>
          </div>
          <div
            class="rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
          >
            <p
              class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#70819B]"
            >
              Runway
            </p>
            <p class="mt-2 text-lg font-extrabold text-[#047857]">
              <template
                v-if="
                  projectionSummary.runway_months === null ||
                  projectionSummary.runway_months === undefined
                "
                >Belum dapat dihitung</template
              ><template v-else>{{
                `${Number(projectionSummary.runway_months).toLocaleString("id-ID", { maximumFractionDigits: 1 })} bulan`
              }}</template>
            </p>
            <p class="mt-1 text-[11px] text-[#6B7A90]">
              Kas dibagi burn rate bulanan.
            </p>
          </div>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              FY2026 Business Target
            </p>
            <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              KPI Performance Targets
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Realisasi kumulatif dibanding target tahunan perusahaan.
            </p>
          </div>
          <div
            class="inline-flex w-fit items-center gap-3 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-2.5"
          >
            <Target class="h-4 w-4 text-[#1E5AA8]" /><span
              class="text-xs text-[#6B7A90]"
              >Rata-rata capaian</span
            ><span class="text-sm font-semibold text-[#0B1F4A]"
              >{{ achievementAverage }}%</span
            >
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead
              class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
            >
              <tr>
                <th class="px-6 py-4">Target Bisnis</th>
                <th class="px-6 py-4 text-right">Target Tahunan</th>
                <th class="px-6 py-4 text-right">Realisasi</th>
                <th class="px-6 py-4">Progress</th>
                <th class="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-if="orderedTargets.length === 0">
                <td
                  colspan="5"
                  class="px-6 py-10 text-center text-sm text-[#8A98AB]"
                >
                  Target tahunan belum tersedia.
                </td>
              </tr>
              <template v-else>
              <tr
                v-for="target in pagedTargets"
                :key="target.id"
                class="hover:bg-[#FBFDFF]"
              >
                <td class="px-6 py-5">
                  <p class="font-semibold text-[#182338]">{{ target.nama }}</p>
                  <p class="mt-1 text-xs text-[#8A98AB]">
                    ID Target: {{ target.id }}
                  </p>
                </td>
                <td class="px-6 py-5 text-right font-medium text-[#0B1F4A]">
                  {{ currencyOrUnit(target.nilaiTarget, target.satuan) }}
                </td>
                <td class="px-6 py-5 text-right font-semibold text-[#1E5AA8]">
                  {{ currencyOrUnit(target.nilaiRealisasi, target.satuan) }}
                </td>
                <td class="px-6 py-5">
                  <div class="flex min-w-[160px] items-center gap-3">
                    <div
                      class="h-2 flex-1 overflow-hidden rounded-full bg-[#E8EEF7]"
                    >
                      <div
                        class="h-full rounded-full bg-[#1E5AA8]"
                        :style="{
                          width: `${targetAchievementPercent(target)}%`,
                        }"
                      />
                    </div>
                    <span
                      class="w-10 text-right text-xs font-semibold text-[#0B1F4A]"
                      >{{
                        targetAchievementPercent(target)
                      }}%</span
                    >
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span
                    :class="targetStatusBadgeClass(target)"
                    >{{ targetStatusLabel(target) }}</span
                  >
                </td>
              </tr>
              </template>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="targetPage"
          :total="orderedTargets.length"
          @page-change="targetPage = safePage($event, orderedTargets.length)"
        />
      </div>
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Financial Growth Roadmap
            </p>
            <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Roadmap Pertumbuhan Finansial
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Grafik target dan realisasi bulanan yang diambil dari data
              proyeksi API.
            </p>
          </div>
          <div
            class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3.5 py-2 text-xs font-semibold text-[#0B1F4A]"
          >
            <BarChart3 class="h-4 w-4 text-[#1E5AA8]" /> Tahun
            {{ projectionData?.year || new Date().getFullYear() }} ·
            {{
              formatRupiah(
                Number(
                  projectionSummary.forecast_revenue ||
                    projectionSummary.revenue_target ||
                    0,
                ),
              )
            }}
          </div>
        </div>
        <div
          class="grid gap-5 p-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]"
        >
          <div
            class="finance-chart-shell rounded-2xl border border-[#E2EBF6] p-4"
          >
            <div class="overflow-x-auto">
              <svg
                :viewBox="`0 0 ${roadmapChartWidth} ${roadmapChartHeight}`"
                class="modern-finance-chart h-auto w-full min-w-[760px]"
                role="img"
                aria-label="Grafik roadmap pendapatan dan beban bulanan"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="roadmap-income-stroke"
                    :x1="roadmapChartPadding.left"
                    :x2="roadmapChartWidth - roadmapChartPadding.right"
                    y1="0"
                    y2="0"
                    gradient-units="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#2563EB" />
                    <stop offset="55%" stop-color="#0EA5E9" />
                    <stop offset="100%" stop-color="#14B8A6" />
                  </linearGradient>
                  <linearGradient
                    id="roadmap-expense-stroke"
                    :x1="roadmapChartPadding.left"
                    :x2="roadmapChartWidth - roadmapChartPadding.right"
                    y1="0"
                    y2="0"
                    gradient-units="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#F43F5E" />
                    <stop offset="100%" stop-color="#F59E0B" />
                  </linearGradient>
                  <linearGradient
                    id="roadmap-target-stroke"
                    :x1="roadmapChartPadding.left"
                    :x2="roadmapChartWidth - roadmapChartPadding.right"
                    y1="0"
                    y2="0"
                    gradient-units="userSpaceOnUse"
                  >
                    <stop offset="0%" stop-color="#64748B" />
                    <stop offset="100%" stop-color="#8B5CF6" />
                  </linearGradient>
                  <filter
                    id="roadmap-line-glow"
                    x="-10%"
                    y="-30%"
                    width="120%"
                    height="160%"
                  >
                    <feGaussianBlur std-deviation="2.8" result="blur" />
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
                  :x2="roadmapChartWidth"
                  :y2="y"
                  class="modern-chart-grid"
                />
                <line
                  :x1="roadmapChartPadding.left"
                  :x2="roadmapChartWidth - roadmapChartPadding.right"
                  :y1="roadmapChartHeight - roadmapChartPadding.bottom"
                  :y2="roadmapChartHeight - roadmapChartPadding.bottom"
                  class="modern-chart-axis"
                />
                <line
                  :x1="roadmapChartPadding.left"
                  :x2="roadmapChartPadding.left"
                  :y1="roadmapChartPadding.top"
                  :y2="roadmapChartHeight - roadmapChartPadding.bottom"
                  class="modern-chart-axis"
                />
                <path
                  v-if="roadmapChartRows.length > 0"
                  :d="roadmapLinePoints('revenueTargetY')"
                  fill="none"
                  stroke="url(#roadmap-target-stroke)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-target-line"
                />
                <path
                  v-if="roadmapChartRows.length > 0"
                  :d="roadmapLinePoints('expenseTargetY')"
                  fill="none"
                  stroke="#CBD5E1"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-target-line modern-chart-target-line-muted"
                />
                <path
                  v-if="roadmapChartRows.length > 0"
                  :d="roadmapLinePoints('expenseForecastY')"
                  fill="none"
                  stroke="url(#roadmap-expense-stroke)"
                  stroke-width="4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-line modern-chart-line-secondary"
                  filter="url(#roadmap-line-glow)"
                />
                <path
                  v-if="roadmapChartRows.length > 0"
                  :d="roadmapLinePoints('revenueForecastY')"
                  fill="none"
                  stroke="url(#roadmap-income-stroke)"
                  stroke-width="4.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="modern-chart-line modern-chart-line-primary"
                  filter="url(#roadmap-line-glow)"
                />
                <g v-for="(item, index) in roadmapChartRows" :key="item.label">
                  <circle
                    :cx="item.x"
                    :cy="item.revenueForecastY"
                    r="5.2"
                    fill="white"
                    stroke="url(#roadmap-income-stroke)"
                    stroke-width="3"
                    class="modern-chart-dot"
                    :style="{ animationDelay: `${0.48 + Number(index) * 0.07}s` }"
                  />
                  <circle
                    :cx="item.x"
                    :cy="item.expenseForecastY"
                    r="4.7"
                    fill="white"
                    stroke="url(#roadmap-expense-stroke)"
                    stroke-width="2.8"
                    class="modern-chart-dot"
                    :style="{ animationDelay: `${0.58 + Number(index) * 0.07}s` }"
                  />
                  <text
                    :x="item.x"
                    :y="roadmapChartHeight - 18"
                    text-anchor="middle"
                    fill="#8291A8"
                    font-size="9"
                    font-weight="500"
                  >
                    {{ item.label }}
                  </text>
                </g>
              </svg>
            </div>
            <div
              class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#6B7A90]"
            >
              <span class="inline-flex items-center gap-2"
                ><i class="finance-chart-swatch finance-chart-swatch-primary" />
                Realisasi pendapatan</span
              ><span class="inline-flex items-center gap-2"
                ><i class="finance-chart-swatch finance-chart-swatch-target" />
                Target pendapatan</span
              ><span class="inline-flex items-center gap-2"
                ><i
                  class="finance-chart-swatch finance-chart-swatch-secondary"
                />
                Realisasi beban</span
              ><span class="inline-flex items-center gap-2"
                ><i class="finance-chart-swatch finance-chart-swatch-muted" />
                Target beban</span
              >
            </div>
          </div>
          <div
            class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-[#FBFDFF]"
          >
            <div class="border-b border-[#E8EEF7] px-5 py-4">
              <h3 class="text-sm font-semibold text-[#0B1F4A]">
                Milestone Tahunan
              </h3>
              <p class="mt-1 text-xs text-[#6B7A90]">
                Ringkasan target roadmap
              </p>
            </div>
            <div class="divide-y divide-[#E8EEF7]">
              <div
                v-for="item in roadmapRows"
                :key="item.label"
                class="flex items-center justify-between px-5 py-4"
              >
                <span class="text-sm font-medium text-[#182338]">{{
                  item.label
                }}</span
                ><span class="text-sm font-semibold text-[#0B1F4A]"
                  >Rp {{ item.value }}B</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Budget Control
            </p>
            <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Budget per Akun dan Divisi
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Bandingkan budget dengan realisasi dari jurnal posted pada akun
              dan divisi yang sama.
            </p>
          </div>
          <div
            class="grid w-full grid-cols-3 gap-3 text-right lg:w-auto lg:min-w-[420px]"
          >
            <div
              class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"
            >
              <p class="text-[10px] font-bold uppercase text-[#70819B]">
                Budget
              </p>
              <p class="mt-1 text-sm font-extrabold text-[#0B1F4A]">
                {{ formatRupiah(Number(budgetSummary.total_budget || 0)) }}
              </p>
            </div>
            <div
              class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"
            >
              <p class="text-[10px] font-bold uppercase text-[#70819B]">
                Realisasi
              </p>
              <p class="mt-1 text-sm font-extrabold text-[#0B1F4A]">
                {{ formatRupiah(Number(budgetSummary.total_actual || 0)) }}
              </p>
            </div>
            <div
              class="rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"
            >
              <p class="text-[10px] font-bold uppercase text-[#70819B]">
                Selisih
              </p>
              <p
                :class="`mt-1 text-sm font-extrabold ${Number(budgetSummary.total_variance || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`"
              >
                {{ formatRupiah(Number(budgetSummary.total_variance || 0)) }}
              </p>
            </div>
          </div>
        </div>
        <form
          class="grid gap-4 border-b border-[#E8EEF7] bg-[#FBFDFF] p-5 md:grid-cols-2 lg:grid-cols-3"
          @submit="saveBudget"
        >
          <label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Akun</span
            ><select
              required
              :value="budgetForm.account_id"
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
              @change="updateBudgetForm({
                    ...budgetForm,
                    account_id: eventValue($event),
                  })"
            >
              <option value="">Pilih akun</option>
              <option
                v-for="account in budgetAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.kode }} · {{ account.nama }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Divisi</span
            ><select
              :value="budgetForm.division_id"
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
              @change="updateBudgetForm({
                    ...budgetForm,
                    division_id: eventValue($event),
                  })"
            >
              <option value="">Semua / operasional umum</option>
              <option
                v-for="division in activeDivisions"
                :key="division.id"
                :value="division.id"
              >
                <template v-if="division.code">{{
                  `${division.code} · `
                }}</template
                ><template v-else></template>{{ division.name }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Bulan</span
            ><select
              :value="budgetForm.budget_month"
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
              @change="updateBudgetForm({
                    ...budgetForm,
                    budget_month: eventValue($event),
                  })"
            >
              <option value="">Tahunan</option>
              <option
                v-for="(_, index) in Array.from({ length: 12 })"
                :key="index + 1"
                :value="index + 1"
              >
                {{ String(index + 1).padStart(2, "0") }}
              </option>
            </select></label
          ><label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Nilai budget</span
            ><input
              required
              type="number"
              min="0"
              :value="budgetForm.budget_amount || ''"
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#182338]"
              @change="updateBudgetForm({
                    ...budgetForm,
                    budget_amount: Number(eventValue($event)),
                  })" /></label
          ><label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Catatan budget</span
            ><input
              :value="budgetForm.notes"
              placeholder="Contoh: Anggaran biaya cloud divisi engineering"
              class="h-11 w-full rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]"
              @change="updateBudgetForm({ ...budgetForm, notes: eventValue($event) })"
          /></label>
          <div class="flex items-end gap-2">
            <button
              type="submit"
              class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#0B1F4A] px-3 text-sm font-semibold text-white hover:bg-[#102A56]"
            >
              <template v-if="budgetForm.id">Perbarui</template
              ><template v-else>Simpan</template></button
            ><button
              v-if="budgetForm.id"
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-xl border border-[#D8E5F4] px-5 text-sm font-semibold text-[#53658A]"
              @click="resetBudgetForm"
            >
              Batal
            </button>
          </div>
        </form>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[900px] text-left text-sm">
            <thead
              class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
            >
              <tr>
                <th class="px-5 py-3">Akun / Divisi</th>
                <th class="px-5 py-3">Periode</th>
                <th class="px-5 py-3 text-right">Budget</th>
                <th class="px-5 py-3 text-right">Realisasi</th>
                <th class="px-5 py-3 text-right">Selisih</th>
                <th class="px-5 py-3">Catatan</th>
                <th class="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-if="orderedBudgetAllocations.length === 0">
                <td
                  :colspan="7"
                  class="px-5 py-7 text-center text-sm text-[#8A98AB]"
                >
                  Belum ada budget untuk skenario
                  {{ currentScenario.label || "Normal" }}.
                </td>
              </tr>
              <template v-else
                ><tr
                  v-for="budget in pagedBudgetAllocations"
                  :key="budget.id"
                  class="hover:bg-[#FBFDFF]"
                >
                  <td class="px-5 py-3">
                    <p class="font-semibold text-[#182338]">
                      {{ budget.account_code }} · {{ budget.account_name }}
                    </p>
                    <p class="mt-1 text-[10px] text-[#6B7A90]">
                      {{ budget.division_name || "Operasional umum" }}
                    </p>
                  </td>
                  <td class="px-5 py-3 text-xs text-[#53658A]">
                    <template v-if="budget.budget_month">{{
                      `Bulan ${String(budget.budget_month).padStart(2, "0")}`
                    }}</template
                    ><template v-else>Tahunan</template>
                  </td>
                  <td class="px-5 py-3 text-right font-semibold text-[#0B1F4A]">
                    {{ formatRupiah(Number(budget.budget_amount || 0)) }}
                  </td>
                  <td class="px-5 py-3 text-right font-semibold text-[#1E5AA8]">
                    {{ formatRupiah(Number(budget.actual_amount || 0)) }}
                  </td>
                  <td
                    :class="`px-5 py-3 text-right font-semibold ${Number(budget.variance_amount || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`"
                  >
                    {{ formatRupiah(Number(budget.variance_amount || 0)) }}
                  </td>
                  <td class="px-5 py-3 text-xs text-[#6B7A90]">
                    {{ budget.notes || "-" }}
                  </td>
                  <td class="px-5 py-3 text-right">
                    <div class="flex justify-end gap-1">
                      <button
                        type="button"
                        :aria-label="`Ubah budget ${budget.account_name || ''}`"
                        title="Ubah"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                        @click="editBudget(budget)"
                      >
                        <Pencil class="h-3.5 w-3.5" /></button
                      ><button
                        type="button"
                        :aria-label="`Hapus budget ${budget.account_name || ''}`"
                        title="Hapus"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        @click="deleteBudget(budget)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td></tr
              ></template>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="budgetPage"
          :total="orderedBudgetAllocations.length"
          @page-change="budgetPage = safePage($event, orderedBudgetAllocations.length)"
        />
      </div>
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-lg font-semibold text-[#0B1F4A]">
              Target Bulanan
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Target pendapatan dan beban per bulan. Realisasi otomatis berasal
              dari jurnal posted.
            </p>
          </div>
          <span class="text-xs font-medium text-[#6B7A90]"
            >{{ projectionMonths.length }} bulan proyeksi ·
            {{ transaksi.length }} jurnal tersedia</span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[980px] text-left text-sm">
            <thead
              class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
            >
              <tr>
                <th class="px-6 py-4">Bulan</th>
                <th class="px-6 py-4 text-right">Target Pendapatan</th>
                <th class="px-6 py-4 text-right">Target Beban</th>
                <th class="px-6 py-4 text-right">Realisasi Pendapatan</th>
                <th class="px-6 py-4 text-right">Realisasi Beban</th>
                <th class="px-6 py-4 text-right">Forecast Laba</th>
                <th class="px-6 py-4">Catatan</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-if="pagedProjectionMonths.length === 0">
                <td
                  colspan="8"
                  class="px-6 py-10 text-center text-sm text-[#8A98AB]"
                >
                  Belum ada data bulan proyeksi.
                </td>
              </tr>
              <tr
                v-for="month in pagedProjectionMonths"
                v-else
                :key="`projection-month-${month.month}`"
                class="hover:bg-[#FBFDFF]"
              >
                <td class="px-6 py-4">
                  <p class="font-medium text-[#182338]">{{ month.label }}</p>
                  <p class="mt-1 text-xs text-[#8A98AB]">
                    {{ projectionData?.year || new Date().getFullYear() }}
                  </p>
                </td>
                <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">
                  {{ formatRupiah(Number(month.revenue_target || 0)) }}
                </td>
                <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">
                  {{ formatRupiah(Number(month.expense_target || 0)) }}
                </td>
                <td class="px-6 py-4 text-right text-[#1E5AA8]">
                  {{ formatRupiah(Number(month.revenue_actual || 0)) }}
                </td>
                <td class="px-6 py-4 text-right text-[#B45309]">
                  {{ formatRupiah(Number(month.expense_actual || 0)) }}
                </td>
                <td class="px-6 py-4 text-right font-semibold text-[#047857]">
                  {{ formatRupiah(Number(month.forecast_profit || 0)) }}
                </td>
                <td class="max-w-[220px] px-6 py-4 text-xs text-[#6B7A90]">
                  {{ month.notes || "—" }}
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E5F4] bg-white text-[#1E5AA8] transition hover:bg-[#EEF5FC]"
                    title="Edit target"
                    @click="openTargetModal(month)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="targetDetailPage"
          :total="projectionMonths.length"
          @page-change="targetDetailPage = safePage($event, projectionMonths.length)"
        />
      </div>
    </section>
    <section v-else class="space-y-5">
      <div
        class="rounded-2xl border border-[#DCE7F4] bg-white px-4 py-3 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
            >
              Jenis Laporan
            </p>
            <p class="mt-1 text-sm font-semibold text-[#0B1F4A]">
              {{ activeReportTab.label }}
            </p>
          </div>
          <div class="relative w-full md:w-[360px]">
            <button
              id="report-type-dropdown"
              type="button"
              aria-haspopup="listbox"
              :aria-expanded="isReportTypeMenuOpen ? 'true' : 'false'"
              class="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 text-left text-sm font-semibold text-[#0B1F4A] transition hover:border-[#BFD4EC] hover:bg-white"
              @click="isReportTypeMenuOpen = !isReportTypeMenuOpen"
            >
              <span class="truncate">{{ activeReportTab.label }}</span
              ><ChevronDown
                :class="`h-4 w-4 shrink-0 text-[#53658A] transition ${isReportTypeMenuOpen ? 'rotate-180' : ''}`"
              />
            </button>
            <div
              v-if="isReportTypeMenuOpen"
              class="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_18px_44px_rgba(11,31,74,0.16)]"
              role="listbox"
              aria-labelledby="report-type-dropdown"
            >
              <div class="grid gap-1 sm:grid-cols-2">
                <button
                  v-for="tab in reportTabs"
                  :id="`report-type-${tab.id}`"
                  :key="tab.id"
                  type="button"
                  role="option"
                  :aria-selected="
                    activeReportType === tab.id ? 'true' : 'false'
                  "
                  :class="`flex min-h-[40px] items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition ${activeReportType === tab.id ? 'bg-[#0B1F4A] text-white' : 'text-[#53658A] hover:bg-[#F4F8FC] hover:text-[#0B1F4A]'}`"
                  @click="selectReportType(tab.id)"
                >
                  <span class="leading-tight">{{ tab.label }}</span
                  ><CheckCircle2
                    v-if="activeReportType === tab.id"
                    class="h-4 w-4 shrink-0"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div class="border-b border-[#E8EEF7] px-6 py-6 text-center">
          <p
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]"
          >
            Financial Statement
          </p>
          <h2 class="mt-2 text-xl font-semibold text-[#0B1F4A]">
            {{ currentReport.title }}
          </h2>
          <p class="mt-1 text-sm text-[#6B7A90]">
            {{ currentReport.subtitle }}
          </p>
          <p class="mt-2 text-xs text-[#8A98AB]">
            PT Kedata Indonesia Digital · Mata Uang Rupiah (Rp)
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead
              class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
            >
              <tr>
                <th
                  v-for="(column, index) in currentReport.columns"
                  :key="column"
                  :class="`px-6 py-4 ${index === 2 ? 'text-right' : ''}`"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr
                v-if="!reportError &amp;&amp; currentReport.rows.length === 0"
              >
                <td
                  :colspan="3"
                  class="px-6 py-9 text-center text-sm text-[#7A8CA8]"
                >
                  <template v-if="hasReportData()">{{
                    `Belum ada data untuk ${reportPeriodLabel}.`
                  }}</template
                  ><template v-else>Menunggu data laporan dari API.</template>
                </td>
              </tr>
              <tr
                v-for="row in pagedReportRows"
                :key="row.join('-')"
                class="hover:bg-[#FBFDFF]"
              >
                <td class="px-6 py-4 font-medium text-[#182338]">
                  {{ row[0] }}
                </td>
                <td class="px-6 py-4 text-[#6B7A90]">{{ row[1] }}</td>
                <td
                  :class="`px-6 py-4 text-right font-semibold ${row[2].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`"
                >
                  {{ row[2] }}
                </td>
              </tr>
            </tbody>
            <tfoot class="border-t border-[#DCE7F4] bg-[#EEF5FC]">
              <tr
                v-for="(total, index) in currentReport.totals"
                :key="total[0]"
                :class="
                  index === currentReport.totals.length - 1
                    ? 'bg-[#E4F0FF]'
                    : ''
                "
              >
                <td
                  :colspan="2"
                  class="px-6 py-4 text-sm font-semibold text-[#0B1F4A]"
                >
                  {{ total[0] }}
                </td>
                <td
                  :class="`px-6 py-4 text-right text-sm font-semibold ${total[1].startsWith('(') ? 'text-[#B74B62]' : 'text-[#0B1F4A]'}`"
                >
                  {{ total[1] }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <TablePagination
          :page="reportPage"
          :total="currentReport.rows.length"
          @page-change="reportPage = safePage($event, currentReport.rows.length)"
        />
      </div>
    </section>
    <Teleport to="body">
    <div
      v-if="isTargetModalOpen"
      class="target-modal-layer fixed inset-0 z-[10090] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[28px] border border-[#D8E5F4] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
      >
        <div
          class="flex items-start justify-between border-b border-[#E8EEF7] px-7 py-6"
        >
          <div class="flex items-start gap-3">
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F4A] text-white shadow-[0_10px_22px_rgba(11,31,74,0.18)]"
              ><Target class="h-5 w-5"
            /></span>
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
              >
                Business Planning
              </p>
              <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
                <template v-if="editingTargetId">Edit Target Proyeksi</template
                ><template v-else>Tambah Target Proyeksi</template>
              </h3>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Tetapkan target yang dapat dipantau bersama realisasi.
              </p>
            </div>
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB] hover:bg-[#F8FBFE]"
            @click="closeTargetModal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form
          class="flex-1 overflow-y-auto px-7 py-6"
          @submit="handleSaveTarget"
        >
          <div
            class="mb-5 rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3 text-xs font-semibold text-[#0B1F4A]"
            role="alert"
            aria-live="polite"
          >
            Isi target pendapatan dan/atau target beban. Realisasi dihitung
            otomatis dari jurnal posted.
          </div>
          <div class="grid gap-5 md:grid-cols-2">
            <label class="space-y-2 md:col-span-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Bulan Proyeksi</span
              ><input
                type="month"
                required
                :value="newTarget.bulanProyeksi"
                class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"
                @change="updateNewTarget({
                      ...newTarget,
                      bulanProyeksi: eventValue($event),
                    })"
            /></label
            ><label class="space-y-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Target Pendapatan</span
              ><input
                type="number"
                min="0"
                :value="newTarget.revenueTarget || ''"
                placeholder="0"
                class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"
                @change="updateNewTarget({
                      ...newTarget,
                      revenueTarget: Number(eventValue($event)),
                    })" /></label
            ><label class="space-y-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Target Beban</span
              ><input
                type="number"
                min="0"
                :value="newTarget.expenseTarget || ''"
                placeholder="0"
                class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"
                @change="updateNewTarget({
                      ...newTarget,
                      expenseTarget: Number(eventValue($event)),
                    })" /></label
            ><label class="space-y-2 md:col-span-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Catatan</span
              ><input
                type="text"
                :value="newTarget.notes"
                placeholder="Contoh: target setelah campaign Q3"
                class="h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338]"
                @change="updateNewTarget({
                      ...newTarget,
                      notes: eventValue($event),
                    })"
            /></label>
          </div>
          <div
            class="mt-7 flex flex-col-reverse gap-3 border-t border-[#E8EEF7] pt-5 sm:flex-row sm:justify-end"
          >
            <button
              type="submit"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]"
            >
              <CheckCircle2 class="h-4 w-4" /><template v-if="editingTargetId"
                >Simpan Perubahan Target</template
              ><template v-else>Simpan Target</template>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
    <div
      v-if="isPrintModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]"
      >
        <div
          class="flex items-center justify-between border-b border-[#E8EEF7] px-7 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Print Preview
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Pratinjau Laporan Keuangan
            </h3>
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2EAF4] text-[#8A98AB]"
            @click="updateIsPrintModalOpen(false)"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-8">
          <div class="border border-slate-200 p-8">
            <div class="border-b-2 border-[#0B1F4A] pb-4 text-center">
              <h4 class="text-lg font-semibold text-[#0B1F4A]">
                PT KEDATA INDONESIA DIGITAL
              </h4>
              <p class="mt-1 text-xs text-[#6B7A90]">
                Laporan {{ currentReport.title }} · {{ currentReport.subtitle }}
              </p>
            </div>
            <table class="mt-6 w-full text-left text-sm">
              <thead
                class="border-b border-slate-300 text-xs uppercase text-slate-500"
              >
                <tr>
                  <th class="py-3">Uraian</th>
                  <th class="py-3">Kelompok</th>
                  <th class="py-3 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in currentReport.rows"
                  :key="row.join('-')"
                  class="border-b border-slate-100"
                >
                  <td class="py-3">{{ row[0] }}</td>
                  <td class="py-3">{{ row[1] }}</td>
                  <td class="py-3 text-right">{{ row[2] }}</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-6 space-y-2 border-t border-slate-300 pt-4">
              <div
                v-for="total in currentReport.totals"
                :key="total[0]"
                class="flex justify-between font-semibold"
              >
                <span>{{ total[0] }}</span
                ><span>{{ total[1] }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 border-t border-[#E8EEF7] px-7 py-5">
          <button
            class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-sm font-medium text-[#53658A]"
            @click="updateIsPrintModalOpen(false)"
          >
            Tutup</button
          ><button
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-sm font-semibold text-white"
            @click="printCurrentReport"
          >
            <Printer class="h-4 w-4" /> Simpan PDF
          </button>
        </div>
      </div>
    </div>
    <ConfirmDialog
      :open="!!deleteBudgetConfirm"
      eyebrow="Konfirmasi Penghapusan"
      title="Hapus budget akun/divisi?"
      message="Budget yang dihapus tidak lagi dipakai dalam perbandingan target, realisasi, dan selisih skenario."
      :details="[
        {
          label: 'Akun',
          value:
            `${deleteBudgetConfirm?.account_code || ''} ${deleteBudgetConfirm?.account_name || ''}`.trim() ||
            '-',
        },
        {
          label: 'Divisi',
          value: deleteBudgetConfirm?.division_name || 'Operasional umum',
        },
        {
          label: 'Budget',
          value: formatRupiah(Number(deleteBudgetConfirm?.budget_amount || 0)),
        },
      ]"
      :impact-items="[
        'Budget hilang dari daftar skenario aktif.',
        'Catatan budget terkait juga ikut dihapus.',
      ]"
      confirm-label="Hapus Budget"
      @cancel="closeDeleteBudgetConfirm"
      @confirm="confirmDeleteBudget"
    />
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, ref } from "vue";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Pencil,
  Plus,
  Printer,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { AkunBukuBesar, Proyek, Transaksi } from "../types.ts";
import ConfirmDialog from "./common/ConfirmDialog.vue";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface ProyeksiDanLaporanProps {
  activeSection: "proyeksi" | "laporan";
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  proyek: Proyek[];
  divisions?: any[];
  projectionData?: any;
  reportData?: any;
  reportPeriod?: string;
  reportPeriods?: any[];
  reportError?: string;
}
interface AnnualTarget {
  id: string;
  nama: string;
  nilaiTarget: number;
  nilaiRealisasi: number;
  satuan: "Rupiah" | "Persen" | "Klien";
}
type ReportType =
  | "labarugi"
  | "neraca"
  | "aruskas"
  | "trialbalance"
  | "bukubesar"
  | "umurtagih"
  | "umurutang"
  | "pajak"
  | "payroll"
  | "aset"
  | "profitproyek";
const currentMonthIso = () => new Date().toISOString().slice(0, 7);
const currencyOrUnit = (value: number, unit: AnnualTarget["satuan"]) => {
  if (unit === "Rupiah") return formatRupiah(value);
  if (unit === "Persen") return `${value.toLocaleString("id-ID")}%`;
  return `${value.toLocaleString("id-ID")} Klien`;
};
const reportTabs: {
  id: ReportType;
  label: string;
  short: string;
}[] = [
  { id: "labarugi", label: "Laba Rugi", short: "Laba Rugi" },
  { id: "neraca", label: "Neraca", short: "Neraca" },
  { id: "aruskas", label: "Arus Kas", short: "Arus Kas" },
  { id: "trialbalance", label: "Trial Balance", short: "Trial Balance" },
  { id: "bukubesar", label: "Buku Besar", short: "Buku Besar" },
  { id: "umurtagih", label: "Umur Piutang", short: "Umur Piutang" },
  { id: "umurutang", label: "Umur Utang", short: "Umur Utang" },
  { id: "pajak", label: "Laporan Pajak", short: "Pajak" },
  { id: "payroll", label: "Biaya Payroll", short: "Payroll" },
  { id: "aset", label: "Aset & Penyusutan", short: "Aset" },
  { id: "profitproyek", label: "Profit Proyek", short: "Profit Proyek" },
];

const props = defineProps<ProyeksiDanLaporanProps>();
const {
  activeSection,
  transaksi,
  projectionData,
  reportData,
  reportPeriod = "",
  reportPeriods = [],
  reportError = "",
}: ProyeksiDanLaporanProps = props as ProyeksiDanLaporanProps;

const {
  notify,
  planning: {
    selectReportPeriod: requestReportPeriod,
    saveProjection,
    selectProjectionScenario,
    updateProjectionScenario,
    saveBudgetAllocation,
    deleteBudgetAllocation,
  },
} = useFinStartContext();
const isForecast = activeSection === "proyeksi";
const activeReportType = ref<ReportType>("labarugi"),
  updateActiveReportType = (next) => (activeReportType.value = next);
const isReportTypeMenuOpen = ref(false);
const activeReportTab = computed(
  () =>
    reportTabs.find((tab) => tab.id === activeReportType.value) ||
    reportTabs[0],
);
const selectReportType = (reportType: ReportType) => {
  updateActiveReportType(reportType);
  isReportTypeMenuOpen.value = false;
  reportPage.value = 1;
};
const isTargetModalOpen = ref(false),
  updateIsTargetModalOpen = (next) => (isTargetModalOpen.value = next);
const editingTargetId = ref("");
const isPrintModalOpen = ref(false),
  updateIsPrintModalOpen = (next) => (isPrintModalOpen.value = next);
const selectedScenarioKey = ref(
    String(projectionData?.scenario?.scenario_key || "normal"),
  ),
  updateSelectedScenarioKey = (next) => (selectedScenarioKey.value = next);
const scenarioForm = ref({
    scenario_key: String(projectionData?.scenario?.scenario_key || "normal"),
    revenue_factor: Number(projectionData?.scenario?.revenue_factor || 1),
    expense_factor: Number(projectionData?.scenario?.expense_factor || 1),
    notes: String(projectionData?.scenario?.notes || ""),
  }),
  updateScenarioForm = (next) => (scenarioForm.value = next);
const budgetForm = ref({
    id: "",
    budget_year: Number(projectionData?.year || new Date().getFullYear()),
    budget_month: "",
    scenario_key: String(projectionData?.scenario?.scenario_key || "normal"),
    account_id: "",
    division_id: "",
    budget_amount: 0,
    notes: "",
  }),
  updateBudgetForm = (next) => (budgetForm.value = next);
const deleteBudgetConfirm = ref<any>(null);
const targetPage = ref(1);
const budgetPage = ref(1);
const targetDetailPage = ref(1);
const reportPage = ref(1);
const projectionSummary = projectionData?.summary || {};
const targets = ref<AnnualTarget[]>([
  {
    id: `TARGET-REV-${projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Pendapatan",
    nilaiTarget: Number(projectionSummary.revenue_target || 0),
    nilaiRealisasi: Number(projectionSummary.revenue_actual || 0),
    satuan: "Rupiah",
  },
  {
    id: `TARGET-EXP-${projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Beban Operasional",
    nilaiTarget: Number(projectionSummary.expense_target || 0),
    nilaiRealisasi: Number(projectionSummary.expense_actual || 0),
    satuan: "Rupiah",
  },
  {
    id: `TARGET-PROFIT-${projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Laba Bersih",
    nilaiTarget: Number(projectionSummary.profit_target || 0),
    nilaiRealisasi: Number(projectionSummary.profit_actual || 0),
    satuan: "Rupiah",
  },
]);
const newTarget = ref({
    revenueTarget: 0,
    expenseTarget: 0,
    notes: "",
    bulanProyeksi: currentMonthIso(),
  }),
  updateNewTarget = (next) => (newTarget.value = next);
const achievementAverage = computed(() => {
  if (!targets.value.length) return 0;
  return Math.round(
    targets.value.reduce(
      (sum, target) =>
        sum +
        Math.min(
          100,
          (target.nilaiRealisasi / Math.max(target.nilaiTarget, 1)) * 100,
        ),
      0,
    ) / targets.value.length,
  );
});
const targetAchievementRawPercent = (target: AnnualTarget) =>
  Math.round(
    (Number(target.nilaiRealisasi || 0) /
      Math.max(Number(target.nilaiTarget || 0), 1)) *
      100,
  );
const targetAchievementPercent = (target: AnnualTarget) =>
  Math.min(100, Math.max(0, targetAchievementRawPercent(target)));
const targetStatusLabel = (target: AnnualTarget) => {
  const progress = targetAchievementRawPercent(target);
  if (progress >= 100) return "Tercapai";
  if (progress >= 75) return "On track";
  return "Di bawah target";
};
const targetStatusBadgeClass = (target: AnnualTarget) => {
  const progress = targetAchievementRawPercent(target);
  if (progress >= 100) {
    return "inline-flex rounded-full border border-[#CFE0F4] bg-[#EEF5FC] px-3 py-1 text-[10px] font-semibold text-[#0B1F4A]";
  }
  if (progress >= 75) {
    return "inline-flex rounded-full border border-[#CFE0F4] bg-white px-3 py-1 text-[10px] font-semibold text-[#1E5AA8]";
  }
  return "inline-flex rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-semibold text-[#53658A]";
};

const projectionMonths = Array.isArray(projectionData?.months)
  ? projectionData.months
  : [];
const projectionScenarios = Array.isArray(projectionData?.scenarios)
  ? projectionData.scenarios
  : [];
const budgetAllocations = Array.isArray(projectionData?.budget_allocations)
  ? projectionData.budget_allocations
  : [];
const orderedTargets = computed(() => latestFirst(targets.value));
const orderedBudgetAllocations = computed(() => latestFirst(budgetAllocations));
const pagedTargets = computed(() =>
  pageRows(orderedTargets.value, targetPage.value),
);
const pagedBudgetAllocations = computed(() =>
  pageRows(orderedBudgetAllocations.value, budgetPage.value),
);
const pagedProjectionMonths = computed(() =>
  pageRows(projectionMonths, targetDetailPage.value),
);
const budgetSummary = projectionData?.budget_summary || {};
const currentScenario = projectionData?.scenario || {
  scenario_key: "normal",
  label: "Normal",
  revenue_factor: 1,
  expense_factor: 1,
};
const selectScenario = async (scenario: any) => {
  const key = String(scenario?.scenario_key || scenario || "normal");
  updateSelectedScenarioKey(key);
  updateScenarioForm({
    scenario_key: key,
    revenue_factor: Number(scenario?.revenue_factor || 1),
    expense_factor: Number(scenario?.expense_factor || 1),
    notes: String(scenario?.notes || ""),
  });
  updateBudgetForm({ ...budgetForm.value, scenario_key: key });
  await selectProjectionScenario(key);
};
const saveScenario = async () => {
  if (
    Number(scenarioForm.value.revenue_factor) <= 0 ||
    Number(scenarioForm.value.expense_factor) <= 0
  ) {
    notify("Faktor pendapatan dan beban harus lebih dari 0.");
    return;
  }
  await updateProjectionScenario({
    ...scenarioForm.value,
    scenario_key: selectedScenarioKey.value,
  });
};
const resetBudgetForm = () =>
  updateBudgetForm({
    id: "",
    budget_year: Number(projectionData?.year || new Date().getFullYear()),
    budget_month: "",
    scenario_key: selectedScenarioKey.value || "normal",
    account_id: "",
    division_id: "",
    budget_amount: 0,
    notes: "",
  });
const editBudget = (budget: any) =>
  updateBudgetForm({
    id: String(budget.id),
    budget_year: Number(
      budget.budget_year || projectionData?.year || new Date().getFullYear(),
    ),
    budget_month: budget.budget_month ? String(budget.budget_month) : "",
    scenario_key: String(
      budget.scenario_key || selectedScenarioKey.value || "normal",
    ),
    account_id: String(budget.account_id || ""),
    division_id: budget.division_id ? String(budget.division_id) : "",
    budget_amount: Number(budget.budget_amount || 0),
    notes: String(budget.notes || ""),
  });
const saveBudget = async (event: Event) => {
  event.preventDefault();
  if (!budgetForm.value.account_id) {
    notify("Pilih akun buku besar untuk budget.");
    return;
  }
  if (Number(budgetForm.value.budget_amount) < 0) {
    notify("Nilai budget tidak boleh negatif.");
    return;
  }
  await saveBudgetAllocation({
    ...budgetForm.value,
    scenario_key: selectedScenarioKey.value || budgetForm.value.scenario_key,
  });
  resetBudgetForm();
};
const deleteBudget = async (budget: any) => {
  deleteBudgetConfirm.value = budget;
};
const confirmDeleteBudget = async () => {
  if (!deleteBudgetConfirm.value) return;
  const budget = deleteBudgetConfirm.value;
  deleteBudgetConfirm.value = null;
  await deleteBudgetAllocation(budget);
  if (String(budgetForm.value.id) === String(budget.id)) resetBudgetForm();
};
const roadmapBase = projectionMonths.length
  ? projectionMonths
  : [
      {
        label: "Tahun 1",
        forecast_revenue: 0,
        revenue_target: 0,
        revenue_actual: 0,
        expense_target: 0,
        expense_actual: 0,
      },
    ];
const roadmapRows = roadmapBase.slice(0, 6).map((item: any, index: number) => {
  const revenueTarget = Number(
    item.revenue_target || item.forecast_revenue || 0,
  );
  const revenueForecast = Number(
    item.forecast_revenue || item.revenue_actual || revenueTarget || 0,
  );
  const revenueActual = Number(item.revenue_actual || revenueForecast || 0);
  const expenseTarget = Number(item.expense_target || 0);
  const expenseForecast = Number(
    item.forecast_expense || item.expense_actual || expenseTarget || 0,
  );
  const expenseActual = Number(item.expense_actual || expenseForecast || 0);
  return {
    label: item.short_label || item.label || `Bulan ${index + 1}`,
    revenueTarget,
    revenueForecast,
    revenueActual,
    expenseTarget,
    expenseForecast,
    expenseActual,
    value: Number(
      (
        Math.max(
          revenueTarget,
          revenueForecast,
          revenueActual,
          expenseTarget,
          expenseForecast,
          expenseActual,
        ) / 1000000000
      ).toFixed(1),
    ),
  };
});
const roadmapMax = Math.max(
  ...roadmapRows.flatMap((item) => [
    item.revenueTarget,
    item.revenueForecast,
    item.revenueActual,
    item.expenseTarget,
    item.expenseForecast,
    item.expenseActual,
  ]),
  1,
);
const roadmapChartWidth = 1000;
const roadmapChartHeight = 300;
const roadmapChartPadding = {
  left: 56,
  right: 28,
  top: 22,
  bottom: 46,
};
const roadmapChartRows = roadmapRows.map((item, index) => {
  const usableWidth =
    roadmapChartWidth - roadmapChartPadding.left - roadmapChartPadding.right;
  const usableHeight =
    roadmapChartHeight - roadmapChartPadding.top - roadmapChartPadding.bottom;
  const x =
    roadmapChartPadding.left +
    (roadmapRows.length <= 1
      ? usableWidth / 2
      : (index * usableWidth) / Math.max(roadmapRows.length - 1, 1));
  const projectY = (value: number) =>
    roadmapChartPadding.top +
    (1 - Number(value || 0) / roadmapMax) * usableHeight;
  return {
    ...item,
    x,
    revenueTargetY: projectY(item.revenueTarget),
    revenueForecastY: projectY(item.revenueForecast),
    revenueActualY: projectY(item.revenueActual),
    expenseTargetY: projectY(item.expenseTarget),
    expenseForecastY: projectY(item.expenseForecast),
    expenseActualY: projectY(item.expenseActual),
  };
});
const roadmapLinePoints = (
  key:
    | "revenueTargetY"
    | "revenueForecastY"
    | "revenueActualY"
    | "expenseTargetY"
    | "expenseForecastY"
    | "expenseActualY",
) =>
  roadmapChartRows.length
    ? roadmapChartRows
        .map(
          (item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item[key]}`,
        )
        .join(" ")
    : "";
const openTargetModal = (target: any = null) => {
  editingTargetId.value = target?.month ? String(target.month) : "";
  const monthNumber = Number(target?.month || new Date().getMonth() + 1);
  const monthIso = `${projectionData?.year || new Date().getFullYear()}-${String(monthNumber).padStart(2, "0")}`;
  updateNewTarget({
    revenueTarget: Number(target?.revenue_target || 0),
    expenseTarget: Number(target?.expense_target || 0),
    notes: String(target?.notes || ""),
    bulanProyeksi: target?.month ? monthIso : currentMonthIso(),
  });
  updateIsTargetModalOpen(true);
};
const closeTargetModal = () => {
  editingTargetId.value = "";
  updateIsTargetModalOpen(false);
};
const handleSaveTarget = async (event: Event) => {
  event.preventDefault();
  const revenueTarget = Number(newTarget.value.revenueTarget || 0);
  const expenseTarget = Number(newTarget.value.expenseTarget || 0);

  if (!newTarget.value.bulanProyeksi) {
    notify("Pilih bulan proyeksi terlebih dahulu.");
    return;
  }

  if (revenueTarget < 0 || expenseTarget < 0) {
    notify("Target pendapatan dan beban tidak boleh negatif.");
    return;
  }

  if (revenueTarget <= 0 && expenseTarget <= 0) {
    notify("Isi minimal salah satu target: pendapatan atau beban.");
    return;
  }

  await saveProjection({
    revenueTarget,
    expenseTarget,
    catatan: String(newTarget.value.notes || ""),
    month: Number(String(newTarget.value.bulanProyeksi || "").slice(-2)),
  });
  updateNewTarget({
    revenueTarget: 0,
    expenseTarget: 0,
    notes: "",
    bulanProyeksi: currentMonthIso(),
  });
  editingTargetId.value = "";
  updateIsTargetModalOpen(false);
};

const reportPeriodLabel =
  reportData?.period_label ||
  (reportPeriod
    ? new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format(new Date(`${reportPeriod}-01T00:00:00`))
    : "periode berjalan");
const hasReportData = () => Boolean(reportData?.period && !reportError);
const selectReportPeriod = async (period: string) => {
  if (!/^\d{4}-\d{2}$/.test(String(period || ""))) return;
  await requestReportPeriod(period);
};
const reportRows = () => {
  const income = reportData?.income_statement || {};
  const balance = reportData?.balance_sheet || {};
  const cashFlow = reportData?.cash_flow || {};
  const trialBalance = reportData?.trial_balance || {};
  const ledger = reportData?.general_ledger || {};
  const receivableAging = reportData?.receivable_aging || {};
  const payableAging = reportData?.payable_aging || {};
  const taxReport = reportData?.tax_report || {};
  const payrollReport = reportData?.payroll_report || {};
  const assetReport = reportData?.asset_report || {};
  const projectProfitability = reportData?.project_profitability || {};
  const money = (value: any) => formatRupiah(Number(value || 0));

  if (activeReportType.value === "labarugi") {
    const revenues = (income.revenue_items || []).map((item: any) => [
      `${item.code || ""} · ${item.name || "Pendapatan"}`,
      "Pendapatan Operasional",
      money(item.amount),
    ]);
    const expenses = (income.expense_items || []).map((item: any) => [
      `${item.code || ""} · ${item.name || "Beban"}`,
      "Beban Operasional",
      `(${money(item.amount)})`,
    ]);
    return {
      title: "Laporan Laba Rugi",
      subtitle: `Masa laporan ${reportPeriodLabel}`,
      columns: ["Kode / Uraian", "Kelompok", "Nilai"],
      rows: [...revenues, ...expenses],
      totals: [
        ["Total Pendapatan Operasional", money(income.total_revenue)],
        ["Total Beban Operasional", `(${money(income.total_expense)})`],
        ["Laba Bersih Berjalan", money(income.net_profit)],
      ],
    };
  }
  if (activeReportType.value === "neraca") {
    const flatten = (items: any[], group: string) =>
      (items || []).map((item: any) => [
        `${item.code || ""} · ${item.name || "-"}`,
        group,
        money(item.balance),
      ]);
    return {
      title: "Laporan Posisi Keuangan",
      subtitle: `Per ${reportPeriodLabel} · Mata uang Rupiah`,
      columns: ["Kode / Uraian", "Kelompok", "Nilai"],
      rows: [
        ...flatten(balance.assets, "Aset"),
        ...flatten(balance.liabilities, "Kewajiban"),
        ...flatten(balance.equity, "Ekuitas"),
      ],
      totals: [
        ["Total Aset", money(balance.total_assets)],
        ["Total Kewajiban", money(balance.total_liabilities)],
        ["Total Ekuitas", money(balance.total_equity)],
      ],
    };
  }
  if (activeReportType.value === "aruskas") {
    const cashRows = [
      ...(cashFlow.operating_items || []).map((item: any) => [
        "Operasional",
        item.description || "-",
        money(item.amount),
      ]),
      ...(cashFlow.investing_items || []).map((item: any) => [
        "Investasi",
        item.description || "-",
        money(item.amount),
      ]),
      ...(cashFlow.financing_items || []).map((item: any) => [
        "Pendanaan",
        item.description || "-",
        money(item.amount),
      ]),
    ];
    return {
      title: "Laporan Arus Kas",
      subtitle: `Ringkasan arus kas ${reportPeriodLabel}`,
      columns: ["Aktivitas", "Keterangan", "Nilai"],
      rows: cashRows,
      totals: [
        ["Kenaikan Kas Bersih", money(cashFlow.net_cash_increase)],
        ["Saldo Awal Kas", money(cashFlow.beginning_cash)],
        ["Saldo Akhir Kas", money(cashFlow.ending_cash)],
      ],
    };
  }
  if (activeReportType.value === "trialbalance") {
    return {
      title: "Trial Balance",
      subtitle: `Saldo akun per ${reportPeriodLabel}`,
      columns: ["Kode / Akun", "Debit", "Kredit"],
      rows: (trialBalance.items || []).map((item: any) => [
        `${item.code || ""} · ${item.name || "-"}`,
        money(item.debit),
        money(item.credit),
      ]),
      totals: [
        ["Total Debit", money(trialBalance.total_debit)],
        ["Total Kredit", money(trialBalance.total_credit)],
        ["Selisih", money(trialBalance.difference)],
      ],
    };
  }
  if (activeReportType.value === "bukubesar") {
    return {
      title: "Buku Besar",
      subtitle: `Periode ${reportPeriodLabel}`,
      columns: ["Tanggal / Referensi", "Akun & Uraian", "Mutasi"],
      rows: (ledger.items || []).map((item: any) => [
        `${item.transaction_date || "-"} · ${item.voucher_number || "-"}`,
        `${item.account_code || item.code || "-"} · ${item.account_name || item.name || item.description || "-"}`,
        `D ${money(item.debit)} / K ${money(item.credit)}`,
      ]),
      totals: [
        ["Jumlah baris", String((ledger.items || []).length)],
        ["Periode", reportPeriodLabel],
      ],
    };
  }
  if (activeReportType.value === "umurtagih") {
    return {
      title: "Laporan Umur Piutang",
      subtitle: `Piutang outstanding per ${reportPeriodLabel}`,
      columns: ["Invoice / Klien", "Kelompok Umur", "Outstanding"],
      rows: (receivableAging.items || []).map((item: any) => [
        `${item.invoice_number || "-"} · ${item.client_name || "-"}`,
        item.aging_bucket || "Belum dikelompokkan",
        money(item.outstanding_amount),
      ]),
      totals: [
        ["Total Piutang Outstanding", money(receivableAging.total_outstanding)],
      ],
    };
  }
  if (activeReportType.value === "umurutang") {
    return {
      title: "Laporan Umur Utang",
      subtitle: `Utang outstanding per ${reportPeriodLabel}`,
      columns: ["Tagihan / Vendor", "Kelompok Umur", "Outstanding"],
      rows: (payableAging.items || []).map((item: any) => [
        `${item.bill_number || "-"} · ${item.vendor_name || "-"}`,
        item.aging_bucket || "Belum dikelompokkan",
        money(item.outstanding_amount),
      ]),
      totals: [
        ["Total Utang Outstanding", money(payableAging.total_outstanding)],
      ],
    };
  }
  if (activeReportType.value === "pajak") {
    return {
      title: "Laporan Pajak Internal",
      subtitle: `Pencatatan pajak periode ${reportPeriodLabel}; bukan bukti pelaporan DJP/e-Faktur.`,
      columns: ["Jenis Pajak", "Periode / Status", "Nilai"],
      rows: (taxReport.items || []).map((item: any) => [
        item.tax_type || item.name || "-",
        `${item.period || item.tax_period || "-"} · ${item.status || "-"}`,
        money(item.amount),
      ]),
      totals: [["Total Kewajiban Pajak Tercatat", money(taxReport.total)]],
    };
  }
  if (activeReportType.value === "payroll") {
    const summary = payrollReport.summary || {};
    return {
      title: "Laporan Biaya Payroll",
      subtitle: `Payroll periode ${reportPeriodLabel}`,
      columns: ["Pegawai", "Periode / Status", "Gaji Bersih"],
      rows: (payrollReport.items || []).map((item: any) => [
        item.employee_name || item.full_name || "-",
        `${item.payroll_period || item.period || "-"} · ${item.status || "-"}`,
        money(item.net_salary || item.net_pay || item.total_net_salary),
      ]),
      totals: [
        [
          "Total Gaji Bersih",
          money(summary.total_net_salary || summary.net_salary),
        ],
        [
          "Jumlah Payroll",
          String(summary.total_records || (payrollReport.items || []).length),
        ],
      ],
    };
  }
  if (activeReportType.value === "aset") {
    return {
      title: "Laporan Aset & Penyusutan",
      subtitle: `Aset aktif dan penyusutan periode ${reportPeriodLabel}`,
      columns: ["Kode / Aset", "Penyusutan Periode", "Nilai Buku"],
      rows: (assetReport.items || []).map((item: any) => [
        `${item.asset_code || "-"} · ${item.asset_name || item.name || "-"}`,
        money(item.period_depreciation),
        money(item.book_value),
      ]),
      totals: [
        ["Total Nilai Buku", money(assetReport.total_book_value)],
        [
          "Total Penyusutan Periode",
          money(assetReport.total_period_depreciation),
        ],
      ],
    };
  }
  return {
    title: "Laporan Profitabilitas Proyek",
    subtitle: `${reportPeriodLabel}. ${projectProfitability.note || "Biaya aktual mengikuti alokasi tagihan vendor."}`,
    columns: ["Proyek", "Pendapatan / Biaya", "Laba"],
    rows: (projectProfitability.items || []).map((item: any) => [
      item.project_name || item.name || "-",
      `Pendapatan ${money(item.billed_amount)} · Biaya ${money(item.actual_cost)}`,
      money(item.profit),
    ]),
    totals: [["Total Laba Proyek", money(projectProfitability.total_profit)]],
  };
};
const currentReport = computed(() => reportRows());
const pagedReportRows = computed(() =>
  pageRows(currentReport.value.rows, reportPage.value),
);
const downloadTextFile = (
  filename: string,
  content: string,
  type = "text/plain;charset=utf-8;",
) => {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
const escapeHtml = (value: any) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const exportCurrentReportExcel = () => {
  const report = currentReport.value;
  const tableRows = [
    report.columns,
    ...report.rows,
    ...report.totals.map((total: any) => [total[0], "", total[1] || ""]),
  ];
  const worksheet = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr><th colspan="3">PT Kedata Indonesia Digital</th></tr><tr><th colspan="3">${escapeHtml(report.title)}</th></tr><tr><td colspan="3">${escapeHtml(report.subtitle)}</td></tr><tr><td colspan="3"></td></tr>${tableRows.map((row: any, index: number) => `<tr>${row.map((cell: any) => (index === 0 ? `<th>${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`)).join("")}</tr>`).join("")}</table></body></html>`;
  downloadTextFile(
    `finstart-${activeReportType.value}-${new Date().toISOString().slice(0, 10)}.xls`,
    `\ufeff${worksheet}`,
    "application/vnd.ms-excel;charset=utf-8;",
  );
  notify("File Excel laporan berhasil dibuat.");
};
const printCurrentReport = () => {
  const report = currentReport.value;
  const popup = window.open("", "_blank", "width=960,height=720");

  if (!popup) {
    notify(
      "Popup print diblokir browser. Izinkan popup untuk mencetak laporan.",
    );
    return;
  }

  popup.document.write(`<!doctype html>
        <html>
          <head>
            <title>${escapeHtml(report.title)} - FinStart</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #102A56; }
              h1, h2, p { margin: 0; }
              .header { border-bottom: 2px solid #0B1F4A; padding-bottom: 14px; text-align: center; }
              .meta { margin-top: 6px; color: #64748B; font-size: 12px; }
              table { border-collapse: collapse; margin-top: 24px; width: 100%; font-size: 12px; }
              th, td { border-bottom: 1px solid #E2E8F0; padding: 10px; text-align: left; }
              th { background: #F8FBFE; color: #53658A; text-transform: uppercase; font-size: 10px; }
              td:last-child, th:last-child { text-align: right; }
              .totals { margin-top: 18px; border-top: 1px solid #CBD5E1; padding-top: 12px; }
              .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-weight: 700; }
              @media print { body { margin: 18mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PT KEDATA INDONESIA DIGITAL</h1>
              <p class="meta">${escapeHtml(report.title)} - ${escapeHtml(report.subtitle)}</p>
              <p class="meta">Dicetak ${escapeHtml(new Date().toLocaleDateString("id-ID"))}</p>
            </div>
            <table>
              <thead><tr>${report.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
              <tbody>${report.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
            <div class="totals">${report.totals.map((total) => `<div class="total-row"><span>${escapeHtml(total[0])}</span><span>${escapeHtml(total[1])}</span></div>`).join("")}</div>
          </body>
        </html>`);
  popup.document.close();
  popup.focus();
  popup.print();
  notify("Dialog cetak laporan dibuka.");
};
const budgetAccounts = computed(() =>
  (props.akun || []).filter((account) =>
    ["Pendapatan", "Beban"].includes(account.tipe),
  ),
);

const activeDivisions = computed(() =>
  (props.divisions || []).filter(
    (division) => String(division.status || "active") === "active",
  ),
);

function closeDeleteBudgetConfirm() {
  deleteBudgetConfirm.value = null;
}

</script>
