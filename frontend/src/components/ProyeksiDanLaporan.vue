<template>
  <div class="space-y-7 font-sans">
    <header
      class="workspace-page-header flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
    >
      <div class="flex items-start gap-4">
        <span
          class="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D7E5F5] bg-white text-[#0B1F4A] shadow-[0_8px_20px_rgba(11,31,74,0.05)]"
          ><LineChart
            v-if="isForecast && forecastView === 'roadmap'"
            class="h-5 w-5"
          /><PiggyBank
            v-else-if="isForecast && forecastView === 'anggaran'"
            class="h-5 w-5"
          /><TrendingUp v-else-if="isForecast" class="h-5 w-5" /><FileSpreadsheet
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
            class="mt-1 text-[20px] sm:text-[26px] font-semibold tracking-tight text-[#0B1F4A]"
          >
            <template v-if="isForecast && forecastView === 'roadmap'"
              >Roadmap Pertumbuhan</template
            ><template v-else-if="isForecast && forecastView === 'anggaran'"
              >Kontrol Anggaran</template
            ><template v-else-if="isForecast"
              >Skenario &amp; Target Bisnis</template
            ><template v-else>Laporan Keuangan</template>
          </h1>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-[#6B7A90]">
            <template v-if="isForecast && forecastView === 'roadmap'"
              >Grafik target dan realisasi pendapatan-beban bulanan sepanjang
              tahun berjalan.</template
            ><template v-else-if="isForecast && forecastView === 'anggaran'"
              >Bandingkan alokasi budget dengan realisasi per akun dan divisi
              dari jurnal posted.</template
            ><template v-else-if="isForecast"
              >Pantau target bisnis, realisasi performa, dan skenario
              pertumbuhan finansial secara terstruktur.</template
            ><template v-else
              >Tinjau laporan keuangan utama dalam format tabel yang siap
              digunakan untuk evaluasi manajemen.</template
            >
          </p>
        </div>
      </div>
      <div class="flex w-full flex-wrap gap-3 lg:w-auto">
        <button
          v-if="isForecast && forecastView === 'target'"
          id="btn-open-target-modal"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56]"
          @click="openTargetModal()"
        >
          <Plus class="h-4 w-4" /> Tambah Target</button
        ><template v-else-if="!isForecast"
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
        v-if="forecastView === 'target'"
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
                :disabled="isScenarioSaving"
                class="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#102A56] disabled:cursor-wait disabled:opacity-60"
                @click="saveScenario"
              >
                {{ isScenarioSaving ? "Menyimpan..." : "Simpan Parameter" }}
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
        v-if="forecastView === 'target'"
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
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
        v-if="forecastView === 'target'"
        ref="savedTargetSectionRef"
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-2 border-b border-[#E8EEF7] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Target Tersimpan
            </p>
            <h2 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Daftar Target Proyeksi
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Semua target yang disimpan dari form masuk ke tabel ini.
            </p>
          </div>
          <span class="text-xs font-semibold text-[#6B7A90]">
            {{ savedProjectionTargets.length }} target tersimpan
          </span>
        </div>
        <div class="overflow-x-auto">
          <div
            v-if="savedTargetMonth"
            class="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-xs font-semibold text-emerald-800"
          >
            Target {{ savedTargetMonthLabel }} berhasil disimpan di tabel ini.
          </div>
          <table class="w-full min-w-[860px] text-left text-sm">
            <thead
              class="border-b border-[#E8EEF7] bg-[#F8FBFE] text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
            >
              <tr>
                <th class="px-6 py-4">Bulan Target</th>
                <th class="px-6 py-4 text-right">Target Pendapatan</th>
                <th class="px-6 py-4 text-right">Target Beban</th>
                <th class="px-6 py-4 text-right">Target Laba</th>
                <th class="px-6 py-4">Catatan</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-if="savedProjectionTargets.length === 0">
                <td
                  colspan="6"
                  class="px-6 py-10 text-center text-sm text-[#8A98AB]"
                >
                  Belum ada target tersimpan. Klik Tambah Target untuk membuat target baru.
                </td>
              </tr>
              <tr
                v-for="target in savedProjectionTargets"
                v-else
                :key="`saved-target-${target.month}`"
                :class="[
                  'hover:bg-[#FBFDFF]',
                  Number(target.month) === savedTargetMonth
                    ? 'target-month-row-saved bg-emerald-50/70'
                    : '',
                ]"
              >
                <td class="px-6 py-4">
                  <p class="font-semibold text-[#0B1F4A]">{{ target.label }}</p>
                  <p class="mt-1 text-xs text-[#8A98AB]">
                    {{ projectionData?.year || new Date().getFullYear() }}
                  </p>
                </td>
                <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">
                  {{ formatRupiah(Number(target.revenue_target || 0)) }}
                </td>
                <td class="px-6 py-4 text-right font-semibold text-[#0B1F4A]">
                  {{ formatRupiah(Number(target.expense_target || 0)) }}
                </td>
                <td class="px-6 py-4 text-right font-extrabold text-[#047857]">
                  {{ formatRupiah(Number(target.profit_target || 0)) }}
                </td>
                <td class="max-w-[240px] px-6 py-4 text-xs text-[#6B7A90]">
                  {{ target.notes || "-" }}
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E5F4] bg-white text-[#1E5AA8] transition hover:bg-[#EEF5FC]"
                    title="Edit target"
                    @click="openTargetModal(target)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div
        v-if="forecastView === 'roadmap'"
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
                v-for="item in roadmapMilestones"
                :key="item.label"
                class="flex items-center justify-between px-5 py-4"
              >
                <span class="text-sm font-medium text-[#182338]">{{
                  item.label
                }}</span
                ><span class="text-sm font-semibold text-[#0B1F4A]"
                  >{{ formatRupiah(item.value) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="forecastView === 'anggaran'"
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
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
            class="grid w-full grid-cols-1 sm:grid-cols-3 gap-3 text-right lg:w-auto lg:min-w-[420px]"
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
          <button
            id="btn-open-budget-modal"
            type="button"
            class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] transition hover:bg-[#102A56] lg:w-auto"
            @click="openBudgetModal()"
          >
            <Plus class="h-4 w-4" /> Tambah Budget
          </button>
        </div>
        <Teleport to="body">
          <div
            v-if="isBudgetModalOpen"
            class="budget-modal-layer fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <form
              class="budget-modal-card w-full max-w-3xl overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-2xl"
              novalidate
              @submit="saveBudget"
            >
              <div
                class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-5 py-4"
              >
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E5AA8]"
                  >
                    Budget Control
                  </p>
                  <h3 class="mt-1 text-base font-semibold text-[#0B1F4A]">
                    {{ budgetForm.id ? "Ubah Budget Akun/Divisi" : "Tambah Budget Akun/Divisi" }}
                  </h3>
                </div>
                <button
                  type="button"
                  :disabled="isBudgetSaving"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D8E5F4] text-[#53658A] transition hover:bg-[#F8FBFE] disabled:cursor-wait disabled:opacity-60"
                  aria-label="Tutup modal budget"
                  @click="closeBudgetModal"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
              <div class="grid gap-4 bg-[#FBFDFF] p-5 md:grid-cols-2">
          <label class="space-y-1"
            ><span
              class="text-[10px] font-bold uppercase tracking-[0.12em] text-[#70819B]"
              >Akun buku besar</span
            ><select
              id="budget-account-field"
              ref="budgetAccountFieldRef"
              :value="budgetForm.account_id"
              :aria-invalid="Boolean(budgetFormErrors.account_id)"
              aria-describedby="budget-account-error"
              :class="`h-10 w-full rounded-xl border bg-white px-3 text-xs font-semibold text-[#182338] ${budgetFormErrors.account_id ? 'border-rose-400 ring-2 ring-rose-100' : 'border-[#D8E5F4]'}`"
              @change="handleBudgetAccountChange"
            >
              <option value="">Pilih akun</option>
              <option
                v-for="account in budgetAccounts"
                :key="account.id"
                :value="account.id"
              >
                {{ account.kode }} · {{ account.nama }}
              </option>
            </select
            ><p
              v-if="budgetFormErrors.account_id"
              id="budget-account-error"
              class="text-xs font-semibold text-rose-600"
            >
              {{ budgetFormErrors.account_id }}
            </p></label
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
              step="0.01"
              max="999999999999999.99"
              data-rupiah="false"
              ref="budgetAmountFieldRef"
              :value="budgetForm.budget_amount"
              :aria-invalid="Boolean(budgetFormErrors.budget_amount)"
              aria-describedby="budget-amount-error"
              :class="`h-10 w-full rounded-xl border bg-white px-3 text-xs font-semibold text-[#182338] ${budgetFormErrors.budget_amount ? 'border-rose-400 ring-2 ring-rose-100' : 'border-[#D8E5F4]'}`"
              @change="handleBudgetAmountChange" 
            /><p
              v-if="budgetFormErrors.budget_amount"
              id="budget-amount-error"
              class="text-xs font-semibold text-rose-600"
            >
              {{ budgetFormErrors.budget_amount }}
            </p></label
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
              :disabled="isBudgetSaving"
              class="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#0B1F4A] px-3 text-sm font-semibold text-white hover:bg-[#102A56] disabled:cursor-wait disabled:opacity-60"
            >
              <template v-if="isBudgetSaving">Menyimpan...</template
              ><template v-else-if="budgetForm.id">Perbarui</template
              ><template v-else>Simpan</template></button
            ><button
              type="button"
              class="inline-flex h-11 items-center justify-center rounded-xl border border-[#D8E5F4] px-5 text-sm font-semibold text-[#53658A]"
              @click="closeBudgetModal"
            >
              Batal
            </button>
          </div>
              </div>
            </form>
          </div>
        </Teleport>
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
        v-if="forecastView === 'target'"
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
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
          <div
            v-if="savedTargetMonth"
            class="border-b border-emerald-100 bg-emerald-50 px-6 py-3 text-xs font-semibold text-emerald-800"
          >
            Target {{ savedTargetMonthLabel }} tersimpan dan tampil di tabel ini.
            Klik ikon pensil pada baris tersebut untuk mengubah target.
          </div>
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
                :class="[
                  'hover:bg-[#FBFDFF]',
                  Number(month.month) === savedTargetMonth
                    ? 'target-month-row-saved bg-emerald-50/70'
                    : '',
                ]"
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
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
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
      class="target-modal-layer fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto p-4"
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
          novalidate
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
                id="target-month-field"
                ref="targetMonthFieldRef"
                type="month"
                :value="newTarget.bulanProyeksi"
                :aria-invalid="Boolean(targetFormErrors.bulanProyeksi)"
                aria-describedby="target-month-error"
                :class="`h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#182338] ${targetFormErrors.bulanProyeksi ? 'border-rose-400 ring-2 ring-rose-100' : 'border-[#D8E5F4]'}`"
                @change="handleTargetMonthChange"
              /><p
                v-if="targetFormErrors.bulanProyeksi"
                id="target-month-error"
                class="text-xs font-semibold text-rose-600"
              >
                {{ targetFormErrors.bulanProyeksi }}
              </p></label
            ><label class="space-y-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Target Pendapatan</span
              ><span class="relative block"
                ><span
                  class="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-sm font-bold text-[#8A98AB]"
                  >Rp</span
                ><input
                  ref="targetRevenueFieldRef"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="0.01"
                  :max="MAX_TARGET_AMOUNT"
                  data-rupiah="false"
                  :value="targetRevenueInputValue"
                  placeholder="0"
                  :aria-invalid="Boolean(targetFormErrors.revenueTarget)"
                  aria-describedby="target-revenue-error"
                  :class="`target-money-input h-12 w-full rounded-xl border bg-white py-0 pl-14 pr-4 text-sm font-medium text-[#182338] ${targetFormErrors.revenueTarget ? 'border-rose-400 ring-2 ring-rose-100' : 'border-[#D8E5F4]'}`"
                  @input="handleTargetRevenueInput"
                  @change="handleTargetRevenueInput" /></span
              ><p
                v-if="targetFormErrors.revenueTarget"
                id="target-revenue-error"
                class="text-xs font-semibold text-rose-600"
              >
                {{ targetFormErrors.revenueTarget }}
              </p
            ></label
            ><label class="space-y-2"
              ><span
                class="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70819B]"
                >Target Beban</span
              ><span class="relative block"
                ><span
                  class="pointer-events-none absolute inset-y-0 left-4 z-10 flex items-center text-sm font-bold text-[#8A98AB]"
                  >Rp</span
                ><input
                  ref="targetExpenseFieldRef"
                  type="number"
                  inputmode="decimal"
                  min="0"
                  step="0.01"
                  :max="MAX_TARGET_AMOUNT"
                  data-rupiah="false"
                  :value="targetExpenseInputValue"
                  placeholder="0"
                  :aria-invalid="Boolean(targetFormErrors.expenseTarget)"
                  aria-describedby="target-expense-error"
                  :class="`target-money-input h-12 w-full rounded-xl border bg-white py-0 pl-14 pr-4 text-sm font-medium text-[#182338] ${targetFormErrors.expenseTarget ? 'border-rose-400 ring-2 ring-rose-100' : 'border-[#D8E5F4]'}`"
                  @input="handleTargetExpenseInput"
                  @change="handleTargetExpenseInput" /></span
              ><p
                v-if="targetFormErrors.expenseTarget"
                id="target-expense-error"
                class="text-xs font-semibold text-rose-600"
              >
                {{ targetFormErrors.expenseTarget }}
              </p
            ></label
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
              :disabled="isTargetSaving"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] disabled:cursor-wait disabled:opacity-60"
            >
              <CheckCircle2 class="h-4 w-4" /><template v-if="isTargetSaving"
                >Menyimpan...</template
              ><template v-else-if="editingTargetId"
                >Simpan Perubahan Target</template
              ><template v-else>Simpan Target</template>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
    <Teleport to="body">
    <div
      v-if="isPrintModalOpen"
      class="fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#081936]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden bg-white shadow-[0_24px_70px_rgba(11,31,74,0.22)]"
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
        <div class="flex-1 overflow-hidden bg-[#F1F5F9] p-4">
          <iframe
            title="Pratinjau cetak laporan"
            :srcdoc="reportPrintHtml"
            class="h-[65vh] w-full rounded-lg border border-slate-200 bg-white"
          ></iframe>
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
    </Teleport>
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
import { currentMonthIso as localCurrentMonthIso, todayIso } from "../utils/localDate";
import { spreadsheetSafeText } from "../utils/spreadsheetExport.js";
import {
  buildPrintDocumentHtml,
  escapeHtml,
  openPrintPopup,
} from "../utils/printDocument.js";
import { computed, nextTick, ref, watch } from "vue";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  LineChart,
  Pencil,
  PiggyBank,
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
import {
  TABLE_PAGE_SIZE,
  latestFirst,
  pageRows,
  safePage,
} from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface ProyeksiDanLaporanProps {
  activeSection: string;
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  proyek: Proyek[];
  divisions?: any[];
  projectionData?: any;
  reportData?: any;
  reportPeriod?: string;
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
const currentMonthIso = () => localCurrentMonthIso();
const MAX_BUDGET_AMOUNT = 999999999999999.99;
const MAX_TARGET_AMOUNT = 9999999999999.99;
const currencyOrUnit = (value: number, unit: AnnualTarget["satuan"]) => {
  if (unit === "Rupiah") return formatRupiah(value);
  if (unit === "Persen") return `${value.toLocaleString("id-ID")}%`;
  return `${value.toLocaleString("id-ID")} Klien`;
};
const projectionMonthLabel = (month: number) =>
  new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(
    new Date(
      Number(props.projectionData?.year || new Date().getFullYear()),
      Math.max(0, Number(month || 1) - 1),
      1,
    ),
  );
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
  reportData,
  reportPeriod = "",
  reportError = "",
}: ProyeksiDanLaporanProps = props as ProyeksiDanLaporanProps;

const {
  notify,
  planning: {
    saveProjection,
    selectProjectionScenario,
    updateProjectionScenario,
    saveBudgetAllocation,
    deleteBudgetAllocation,
  },
} = useFinStartContext();
const isForecast =
  activeSection === "proyeksi" || activeSection.startsWith("proyeksi-");
// Sub-halaman Proyeksi Bisnis kini datang dari sidebar ("proyeksi" -> Skenario
// & Target, "proyeksi-roadmap" -> Roadmap, "proyeksi-anggaran" -> Anggaran).
const forecastView =
  activeSection === "proyeksi-roadmap"
    ? "roadmap"
    : activeSection === "proyeksi-anggaran"
      ? "anggaran"
      : "target";
// Report type now comes from which sidebar sub-item is active ("laporan" ->
// default Laba Rugi, "laporan-neraca" -> Neraca, etc.) instead of in-page state.
const activeReportType = computed<ReportType>(() => {
  const suffix = activeSection.replace(/^laporan-?/, "") || "labarugi";
  return (reportTabs.some((tab) => tab.id === suffix)
    ? suffix
    : "labarugi") as ReportType;
});
watch(activeReportType, () => {
  reportPage.value = 1;
});

const isTargetModalOpen = ref(false),
  updateIsTargetModalOpen = (next) => (isTargetModalOpen.value = next);
const isBudgetModalOpen = ref(false),
  updateIsBudgetModalOpen = (next) => (isBudgetModalOpen.value = next);
const isScenarioSaving = ref(false);
const isBudgetSaving = ref(false);
const isTargetSaving = ref(false);
const editingTargetId = ref("");
const targetFormErrors = ref({
  bulanProyeksi: "",
  revenueTarget: "",
  expenseTarget: "",
});
const targetMonthFieldRef = ref<HTMLInputElement | null>(null);
const targetRevenueFieldRef = ref<HTMLInputElement | null>(null);
const targetExpenseFieldRef = ref<HTMLInputElement | null>(null);
const isPrintModalOpen = ref(false),
  updateIsPrintModalOpen = (next) => (isPrintModalOpen.value = next);
const selectedScenarioKey = ref(
    String(props.projectionData?.scenario?.scenario_key || "normal"),
  ),
  updateSelectedScenarioKey = (next) => (selectedScenarioKey.value = next);
const scenarioForm = ref({
    scenario_key: String(props.projectionData?.scenario?.scenario_key || "normal"),
    revenue_factor: Number(props.projectionData?.scenario?.revenue_factor || 1),
    expense_factor: Number(props.projectionData?.scenario?.expense_factor || 1),
    notes: String(props.projectionData?.scenario?.notes || ""),
  }),
  updateScenarioForm = (next) => (scenarioForm.value = next);
const budgetForm = ref({
    id: "",
    budget_year: Number(props.projectionData?.year || new Date().getFullYear()),
    budget_month: "",
    scenario_key: String(props.projectionData?.scenario?.scenario_key || "normal"),
    account_id: "",
    division_id: "",
    budget_amount: "",
    notes: "",
  }),
  updateBudgetForm = (next) => (budgetForm.value = next);
const budgetFormErrors = ref({ account_id: "", budget_amount: "" });
const budgetAccountFieldRef = ref<HTMLSelectElement | null>(null);
const budgetAmountFieldRef = ref<HTMLInputElement | null>(null);
const deleteBudgetConfirm = ref<any>(null);
const targetPage = ref(1);
const budgetPage = ref(1);
const targetDetailPage = ref(1);
const savedTargetSectionRef = ref<HTMLElement | null>(null);
const savedTargetMonth = ref<number | null>(null);
const reportPage = ref(1);
const savedTargetMonthLabel = computed(() =>
  savedTargetMonth.value ? projectionMonthLabel(savedTargetMonth.value) : "",
);
const projectionSummary = computed(() => props.projectionData?.summary || {});
const targets = computed<AnnualTarget[]>(() => [
  {
    id: `TARGET-REV-${props.projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Pendapatan",
    nilaiTarget: Number(projectionSummary.value.revenue_target || 0),
    nilaiRealisasi: Number(projectionSummary.value.revenue_actual || 0),
    satuan: "Rupiah",
  },
  {
    id: `TARGET-EXP-${props.projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Beban Operasional",
    nilaiTarget: Number(projectionSummary.value.expense_target || 0),
    nilaiRealisasi: Number(projectionSummary.value.expense_actual || 0),
    satuan: "Rupiah",
  },
  {
    id: `TARGET-PROFIT-${props.projectionData?.year || new Date().getFullYear()}`,
    nama: "Target Laba Bersih",
    nilaiTarget: Number(projectionSummary.value.profit_target || 0),
    nilaiRealisasi: Number(projectionSummary.value.profit_actual || 0),
    satuan: "Rupiah",
  },
]);
const newTarget = ref({
    revenueTarget: "0",
    expenseTarget: "0",
    notes: "",
    bulanProyeksi: currentMonthIso(),
  }),
  updateNewTarget = (next) => (newTarget.value = next);
const targetRevenueInputValue = computed(() =>
  String(newTarget.value.revenueTarget ?? ""),
);
const targetExpenseInputValue = computed(() =>
  String(newTarget.value.expenseTarget ?? ""),
);
function handleTargetRevenueInput(event: Event) {
  targetFormErrors.value.revenueTarget = "";
  updateNewTarget({
    ...newTarget.value,
    revenueTarget: eventValue(event),
  });
}
function handleTargetExpenseInput(event: Event) {
  targetFormErrors.value.expenseTarget = "";
  updateNewTarget({
    ...newTarget.value,
    expenseTarget: eventValue(event),
  });
}
const focusTargetMonthField = async () => {
  await nextTick();
  targetMonthFieldRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  targetMonthFieldRef.value?.focus();
};
const focusTargetRevenueField = async () => {
  await nextTick();
  targetRevenueFieldRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  targetRevenueFieldRef.value?.focus();
};
const focusTargetExpenseField = async () => {
  await nextTick();
  targetExpenseFieldRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  targetExpenseFieldRef.value?.focus();
};
const handleTargetMonthChange = (event: Event) => {
  targetFormErrors.value.bulanProyeksi = "";
  updateNewTarget({
    ...newTarget.value,
    bulanProyeksi: eventValue(event),
  });
};
const resetTargetErrors = () => {
  targetFormErrors.value = {
    bulanProyeksi: "",
    revenueTarget: "",
    expenseTarget: "",
  };
};
const validateTargetAmount = (value: any, label: string) => {
  const rawValue = String(value ?? "").trim();
  const amount = rawValue === "" ? 0 : Number(rawValue);

  if (!Number.isFinite(amount) || amount < 0) {
    return { amount, message: `${label} harus 0 atau lebih.` };
  }

  if (amount > MAX_TARGET_AMOUNT) {
    return {
      amount,
      message: `${label} melebihi batas data sumber.`,
    };
  }

  return { amount, message: "" };
};
const validateTargetForm = async () => {
  resetTargetErrors();
  let valid = true;

  if (!newTarget.value.bulanProyeksi) {
    targetFormErrors.value.bulanProyeksi = "Bulan Proyeksi wajib diisi.";
    valid = false;
  }

  const revenue = validateTargetAmount(
    newTarget.value.revenueTarget,
    "Target Pendapatan",
  );
  const expense = validateTargetAmount(
    newTarget.value.expenseTarget,
    "Target Beban",
  );

  if (revenue.message) {
    targetFormErrors.value.revenueTarget = revenue.message;
    valid = false;
  }

  if (expense.message) {
    targetFormErrors.value.expenseTarget = expense.message;
    valid = false;
  }

  if (valid && revenue.amount <= 0 && expense.amount <= 0) {
    notify("Isi minimal salah satu target: pendapatan atau beban.");
    return { valid: false, revenueTarget: revenue.amount, expenseTarget: expense.amount };
  }

  if (!valid && targetFormErrors.value.bulanProyeksi) {
    notify(targetFormErrors.value.bulanProyeksi);
    await focusTargetMonthField();
  } else if (!valid && targetFormErrors.value.revenueTarget) {
    notify(targetFormErrors.value.revenueTarget);
    await focusTargetRevenueField();
  } else if (!valid && targetFormErrors.value.expenseTarget) {
    notify(targetFormErrors.value.expenseTarget);
    await focusTargetExpenseField();
  }

  return {
    valid,
    revenueTarget: revenue.amount,
    expenseTarget: expense.amount,
  };
};
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

const projectionMonths = computed(() => Array.isArray(props.projectionData?.months)
  ? props.projectionData.months
  : []);
const savedProjectionTargets = computed(() =>
  projectionMonths.value.filter((month: any) => Boolean(month?.has_target)),
);
const projectionScenarios = computed(() => Array.isArray(props.projectionData?.scenarios)
  ? props.projectionData.scenarios
  : []);
const budgetAllocations = computed(() => Array.isArray(props.projectionData?.budget_allocations)
  ? props.projectionData.budget_allocations
  : []);
const orderedTargets = computed(() => latestFirst(targets.value));
const orderedBudgetAllocations = computed(() => latestFirst(budgetAllocations.value));
const pagedTargets = computed(() =>
  pageRows(orderedTargets.value, targetPage.value),
);
const pagedBudgetAllocations = computed(() =>
  pageRows(orderedBudgetAllocations.value, budgetPage.value),
);
const pagedProjectionMonths = computed(() =>
  pageRows(projectionMonths.value, targetDetailPage.value),
);
const budgetSummary = computed(() => props.projectionData?.budget_summary || {});
const currentScenario = computed(() => props.projectionData?.scenario || {
  scenario_key: "normal",
  label: "Normal",
  revenue_factor: 1,
  expense_factor: 1,
});
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
  if (isScenarioSaving.value) return;
  if (
    Number(scenarioForm.value.revenue_factor) <= 0 ||
    Number(scenarioForm.value.expense_factor) <= 0
  ) {
    notify("Faktor pendapatan dan beban harus lebih dari 0.");
    return;
  }
  isScenarioSaving.value = true;
  try {
    await updateProjectionScenario({
      ...scenarioForm.value,
      scenario_key: selectedScenarioKey.value,
    });
  } finally {
    isScenarioSaving.value = false;
  }
};
const focusBudgetAccountField = async () => {
  await nextTick();
  budgetAccountFieldRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  budgetAccountFieldRef.value?.focus();
};
const focusBudgetAmountField = async () => {
  await nextTick();
  budgetAmountFieldRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  budgetAmountFieldRef.value?.focus();
};
const handleBudgetAccountChange = (event: Event) => {
  budgetFormErrors.value.account_id = "";
  updateBudgetForm({
    ...budgetForm.value,
    account_id: eventValue(event),
  });
};
const handleBudgetAmountChange = (event: Event) => {
  budgetFormErrors.value.budget_amount = "";
  updateBudgetForm({
    ...budgetForm.value,
    budget_amount: eventValue(event),
  });
};
const validateBudgetForm = async () => {
  let valid = true;
  budgetFormErrors.value = { account_id: "", budget_amount: "" };

  if (!budgetForm.value.account_id) {
    budgetFormErrors.value.account_id = "Akun buku besar wajib diisi.";
    valid = false;
  }

  const rawBudgetAmount = String(budgetForm.value.budget_amount ?? "").trim();
  const budgetAmount = Number(rawBudgetAmount);
  if (!rawBudgetAmount) {
    budgetFormErrors.value.budget_amount = "Nilai budget wajib diisi.";
    valid = false;
  } else if (!Number.isFinite(budgetAmount) || budgetAmount < 0) {
    budgetFormErrors.value.budget_amount = "Nilai budget harus 0 atau lebih.";
    valid = false;
  } else if (budgetAmount > MAX_BUDGET_AMOUNT) {
    budgetFormErrors.value.budget_amount = "Nilai budget melebihi batas data sumber.";
    valid = false;
  }

  if (!valid && budgetFormErrors.value.account_id) {
    notify(budgetFormErrors.value.account_id);
    await focusBudgetAccountField();
  } else if (!valid) {
    notify(budgetFormErrors.value.budget_amount);
    await focusBudgetAmountField();
  }

  return valid;
};
const resetBudgetForm = () => {
  budgetFormErrors.value = { account_id: "", budget_amount: "" };
  updateBudgetForm({
    id: "",
    budget_year: Number(props.projectionData?.year || new Date().getFullYear()),
    budget_month: "",
    scenario_key: selectedScenarioKey.value || "normal",
    account_id: "",
    division_id: "",
    budget_amount: "",
    notes: "",
  });
};
const openBudgetModal = (budget: any = null) => {
  if (budget) {
    editBudget(budget);
    return;
  }
  resetBudgetForm();
  updateIsBudgetModalOpen(true);
};
const closeBudgetModal = () => {
  if (isBudgetSaving.value) return;
  resetBudgetForm();
  updateIsBudgetModalOpen(false);
};
const editBudget = (budget: any) => {
  budgetFormErrors.value = { account_id: "", budget_amount: "" };
  updateBudgetForm({
    id: String(budget.id),
    budget_year: Number(
      budget.budget_year || props.projectionData?.year || new Date().getFullYear(),
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
  updateIsBudgetModalOpen(true);
};
const saveBudget = async (event: Event) => {
  event.preventDefault();
  if (isBudgetSaving.value) return;
  if (!(await validateBudgetForm())) {
    return;
  }
  isBudgetSaving.value = true;
  try {
    await saveBudgetAllocation({
      ...budgetForm.value,
      scenario_key: selectedScenarioKey.value || budgetForm.value.scenario_key,
    });
    resetBudgetForm();
    updateIsBudgetModalOpen(false);
  } finally {
    isBudgetSaving.value = false;
  }
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
const roadmapBase = computed(() =>
  projectionMonths.value.length
    ? projectionMonths.value
    : [
        {
          label: "Tahun 1",
          forecast_revenue: 0,
          revenue_target: 0,
          revenue_actual: 0,
          expense_target: 0,
          expense_actual: 0,
        },
      ],
);
const roadmapRows = computed(() =>
  roadmapBase.value.map((item: any, index: number) => {
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
      value: Math.max(
        revenueTarget,
        revenueForecast,
        revenueActual,
        expenseTarget,
        expenseForecast,
        expenseActual,
      ),
    };
  }),
);
const roadmapMilestones = computed(() => {
  const filledRows = roadmapRows.value.filter((item) =>
    [
      item.revenueTarget,
      item.revenueForecast,
      item.revenueActual,
      item.expenseTarget,
      item.expenseForecast,
      item.expenseActual,
    ].some((value) => Number(value || 0) > 0),
  );
  return filledRows.length ? filledRows : roadmapRows.value;
});
const roadmapMax = computed(() =>
  Math.max(
    ...roadmapRows.value.flatMap((item) => [
      item.revenueTarget,
      item.revenueForecast,
      item.revenueActual,
      item.expenseTarget,
      item.expenseForecast,
      item.expenseActual,
    ]),
    1,
  ),
);
const roadmapChartWidth = 1000;
const roadmapChartHeight = 300;
const roadmapChartPadding = {
  left: 56,
  right: 28,
  top: 22,
  bottom: 46,
};
const roadmapChartRows = computed(() => roadmapRows.value.map((item, index) => {
  const usableWidth =
    roadmapChartWidth - roadmapChartPadding.left - roadmapChartPadding.right;
  const usableHeight =
    roadmapChartHeight - roadmapChartPadding.top - roadmapChartPadding.bottom;
  const x =
    roadmapChartPadding.left +
    (roadmapRows.value.length <= 1
      ? usableWidth / 2
      : (index * usableWidth) / Math.max(roadmapRows.value.length - 1, 1));
  const projectY = (value: number) =>
    roadmapChartPadding.top +
    (1 - Number(value || 0) / roadmapMax.value) * usableHeight;
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
}));
const roadmapLinePoints = (
  key:
    | "revenueTargetY"
    | "revenueForecastY"
    | "revenueActualY"
    | "expenseTargetY"
    | "expenseForecastY"
    | "expenseActualY",
) =>
  roadmapChartRows.value.length
    ? roadmapChartRows.value
        .map(
          (item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item[key]}`,
        )
        .join(" ")
    : "";
const openTargetModal = (target: any = null) => {
  resetTargetErrors();
  editingTargetId.value = target?.month ? String(target.month) : "";
  const monthNumber = Number(target?.month || new Date().getMonth() + 1);
  const monthIso = `${props.projectionData?.year || new Date().getFullYear()}-${String(monthNumber).padStart(2, "0")}`;
  updateNewTarget({
    revenueTarget: String(Number(target?.revenue_target || 0)),
    expenseTarget: String(Number(target?.expense_target || 0)),
    notes: String(target?.notes || ""),
    bulanProyeksi: target?.month ? monthIso : currentMonthIso(),
  });
  updateIsTargetModalOpen(true);
};
const closeTargetModal = () => {
  resetTargetErrors();
  editingTargetId.value = "";
  updateIsTargetModalOpen(false);
};
const showSavedTargetInTable = async (month: number) => {
  savedTargetMonth.value = month;
  const targetPageForMonth = Math.ceil(Math.max(1, month) / TABLE_PAGE_SIZE);
  targetDetailPage.value = safePage(
    targetPageForMonth,
    projectionMonths.value.length,
  );
  await nextTick();
  savedTargetSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
const handleSaveTarget = async (event: Event) => {
  event.preventDefault();
  if (isTargetSaving.value) return;
  const validation = await validateTargetForm();
  if (!validation.valid) {
    return;
  }

  const targetMonth = Number(String(newTarget.value.bulanProyeksi || "").slice(-2));
  const revenueTarget = validation.revenueTarget;
  const expenseTarget = validation.expenseTarget;

  isTargetSaving.value = true;
  try {
    const isSaved = await saveProjection({
      revenueTarget,
      expenseTarget,
      catatan: String(newTarget.value.notes || ""),
      month: targetMonth,
    });
    if (!isSaved) return;
    updateNewTarget({
      revenueTarget: "0",
      expenseTarget: "0",
      notes: "",
      bulanProyeksi: currentMonthIso(),
    });
    editingTargetId.value = "";
    updateIsTargetModalOpen(false);
    await showSavedTargetInTable(targetMonth);
  } finally {
    isTargetSaving.value = false;
  }
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
const escapeSpreadsheetHtml = (value: any) =>
  escapeHtml(typeof value === "number" ? value : spreadsheetSafeText(value));
const exportCurrentReportExcel = () => {
  const report = currentReport.value;
  const tableRows = [
    report.columns,
    ...report.rows,
    ...report.totals.map((total: any) => [total[0], "", total[1] || ""]),
  ];
  const worksheet = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr><th colspan="3">PT Kedata Indonesia Digital</th></tr><tr><th colspan="3">${escapeSpreadsheetHtml(report.title)}</th></tr><tr><td colspan="3">${escapeSpreadsheetHtml(report.subtitle)}</td></tr><tr><td colspan="3"></td></tr>${tableRows.map((row: any, index: number) => `<tr>${row.map((cell: any) => (index === 0 ? `<th>${escapeSpreadsheetHtml(cell)}</th>` : `<td>${escapeSpreadsheetHtml(cell)}</td>`)).join("")}</tr>`).join("")}</table></body></html>`;
  downloadTextFile(
    `finstart-${activeReportType.value}-${todayIso()}.xls`,
    `\ufeff${worksheet}`,
    "application/vnd.ms-excel;charset=utf-8;",
  );
  notify("File Excel laporan berhasil dibuat.");
};
const reportPrintHtml = computed(() => {
  const report = currentReport.value;
  const lastIndex = report.columns.length - 1;
  const bodyHtml = `
    <table>
      <thead><tr>${report.columns.map((column: string, index: number) => `<th${index === lastIndex ? ' class="numeric"' : ""}>${escapeHtml(column)}</th>`).join("")}</tr></thead>
      <tbody>${report.rows.map((row: any[]) => `<tr>${row.map((cell, index) => `<td${index === lastIndex ? ' class="numeric"' : ""}>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;
  return buildPrintDocumentHtml({
    documentLabel: "Laporan Keuangan",
    title: report.title,
    subtitle: report.subtitle,
    bodyHtml,
    summaryItems: report.totals.map((total: any, index: number) => ({
      label: total[0],
      value: total[1],
      emphasize: index === report.totals.length - 1,
    })),
  });
});
const printCurrentReport = () => {
  if (openPrintPopup(reportPrintHtml.value, { notify })) {
    notify("Dialog cetak laporan dibuka.");
  }
};
const budgetAccounts = computed(() =>
  (props.akun || []).filter(
    (account) =>
      ["Pendapatan", "Beban"].includes(account.tipe) &&
      String(account.status || "active") === "active",
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

<style scoped>
.target-money-input {
  padding-left: 58px !important;
  padding-right: 16px !important;
}

.target-month-row-saved {
  animation: target-saved-highlight 1.6s ease-out;
}

@keyframes target-saved-highlight {
  0% {
    box-shadow: inset 4px 0 0 #10b981;
  }
  100% {
    box-shadow: inset 4px 0 0 rgba(16, 185, 129, 0);
  }
}
</style>
