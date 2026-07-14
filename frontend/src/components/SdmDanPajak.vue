<template>
  <div class="space-y-6 font-sans">
    <!-- Header switches -->
    <div
      v-if="activeTab === 'sdm'"
      class="workspace-page-header flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Database SDM &amp; Payroll
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Integrasi HR Compliance, BPJS, dan Manajemen Dokumen Digital.
        </p>
      </div>
      <div class="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 2xl:w-auto">
        <button
          id="btn-open-bpjs-rates"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-extrabold text-[#1F2A44] shadow-sm transition-all hover:bg-slate-50"
          @click="updateIsBpjsModalOpen(true)"
        >
          <Calculator class="w-4 h-4" /> Atur BPJS</button
        ><button
          id="btn-manage-master-data"
          type="button"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#BFD7F5] bg-[#F4F9FF] px-4 text-xs font-extrabold text-[#0B3A78] shadow-sm transition-all hover:bg-[#EAF4FF]"
          @click="openMasterData('division')"
        >
          <Building2 class="w-4 h-4" /> Kelola Divisi &amp; Jabatan</button
        ><button
          id="btn-register-employee"
          type="button"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0B1F4A] px-4 text-xs font-extrabold text-white shadow-lg shadow-[#0B1F4A]/20 transition-all hover:bg-[#102A56]"
          @click="openEmployeeForm()"
        >
          <Plus class="w-4 h-4" /> Tambah Pegawai</button
        ><button
          id="btn-open-payroll-history"
          type="button"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#BFD7F5] bg-[#F4F9FF] px-4 text-xs font-extrabold text-[#0B3A78] shadow-sm transition-all hover:bg-[#EAF4FF]"
          @click="isPayrollHistoryOpen = true"
        >
          <History class="w-4 h-4" /> Riwayat Penggajian</button
        ><button
          id="btn-open-payroll"
          type="button"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#10182C] px-4 text-xs font-extrabold text-white shadow-lg shadow-[#10182C]/20 transition-all hover:bg-[#0B1120]"
          @click="openPayrollModal"
        >
          <DollarSign class="w-4 h-4" /> Proses Payroll
        </button>
      </div>
    </div>
    <!-- 1. DIRECTORI SDM & BPJS SETTING view -->
    <div v-if="activeTab === 'sdm'" class="space-y-6">
      <div
        class="rounded-2xl border border-[#D8E5F4] bg-white px-5 py-4 shadow-sm"
      >
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Alur cepat
            </p>
            <p class="mt-1 text-sm font-semibold text-[#0B1F4A]">
              Atur tarif BPJS sekali, tambah pegawai, lalu proses payroll setiap
              bulan.
            </p>
          </div>
          <p class="text-[11px] leading-5 text-[#6B7A90]">
            Tarif BPJS hanya berlaku untuk payroll baru; payroll yang sudah
            diposting tidak berubah.
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-50 text-[#0B1F4A] flex items-center justify-center"
          >
            <Users class="w-6 h-6" />
          </div>
          <div>
            <span
              class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase"
              >Total Pegawai</span
            >
            <p class="text-2xl font-extrabold text-[#020B2D] leading-tight">
              {{ employeeCount() }} Orang
            </p>
          </div>
        </div>
        <div
          class="bg-white border border-slate-100 rounded-[26px] p-6 shadow-sm flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-[#EEF5FC] text-[#1E5AA8] flex items-center justify-center"
          >
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <span
              class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase"
              >Kepatuhan BPJS</span
            >
            <p class="text-2xl font-extrabold text-[#1E5AA8] leading-tight">
              {{ bpjsCompliancePercent() }}% Aktif
            </p>
          </div>
        </div>
        <div
          class="bg-[#10182C] border border-[#10182C] rounded-[26px] p-6 shadow-sm flex items-center gap-4"
        >
          <div
            class="w-12 h-12 rounded-2xl bg-indigo-900/70 text-[#7C83FF] flex items-center justify-center"
          >
            <DollarSign class="w-7 h-7" />
          </div>
          <div>
            <span
              class="text-[10px] text-[#94A3B8] font-extrabold tracking-widest uppercase"
              >Net Payroll MTD</span
            >
            <p class="text-2xl font-extrabold text-[#7C83FF] leading-tight">
              {{ formatRupiah(asNumber(payrollSummary.total_net_pay)) }}
            </p>
          </div>
        </div>
      </div>
      <div
        class="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm"
      >
        <div class="p-5 border-b border-slate-100">
          <div class="relative w-full max-w-[374px]">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#94A3B8]"
              ><Search class="w-4 h-4" /></span
            ><input
              id="staff-search-box"
              type="text"
              :value="searchQuery"
              placeholder="Cari pegawai berdasarkan nama atau NIP..."
              class="w-full h-10 pl-10 pr-4 bg-white border border-[#D8E5F4] rounded-2xl text-sm text-[#1F2A44] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20"
              @input="updateSearchQuery(eventValue($event))"
            />
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-white text-[10px] text-[#94A3B8] uppercase font-extrabold tracking-[0.22em]"
            >
              <tr>
                <th class="px-7 py-5">Identitas Pegawai</th>
                <th class="px-7 py-5">Jabatan</th>
                <th class="px-7 py-5">Status Aktif</th>
                <th class="px-7 py-5">Compliance</th>
                <th class="px-7 py-5 text-[#0B1F4A]">Gaji Bersih (Net)</th>
                <th class="px-7 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="staff in pagedEmployees"
                :key="staff.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-7 py-4">
                  <span class="font-bold text-[#020B2D] block text-sm">{{
                    staff.nama
                  }}</span
                  ><span class="text-[10px] text-slate-400 font-mono">{{
                    staff.id
                  }}</span>
                </td>
                <td class="px-7 py-4 text-slate-700 font-semibold">
                  {{ staff.jabatan
                  }}<span class="text-[10px] text-slate-400 block">{{
                    staff.status
                  }}</span>
                </td>
                <td class="px-7 py-4">
                  <span
                    :class="`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${String(staff?._raw?.employment_status || 'active').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`"
                    ><template
                      v-if="
                        String(
                          staff?._raw?.employment_status || 'active',
                        ).toLowerCase() === 'active'
                      "
                      >Aktif</template
                    ><template v-else>Nonaktif</template></span
                  >
                </td>
                <td class="px-7 py-4">
                  <span
                    :class="`text-[10px] px-2.5 py-1 rounded-full font-bold ${staff.compliance === 'Patuh' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`"
                    >{{ staff.compliance }}</span
                  >
                </td>
                <td class="px-7 py-4 font-mono font-bold text-[#0B1F4A]">
                  {{ formatRupiah(staff.gajiBersih) }}
                </td>
                <td class="px-7 py-4 text-center">
                  <div class="flex justify-center gap-1.5">
                    <button
                      type="button"
                      :aria-label="`Detail ${staff.nama || staff.name || 'pegawai'}`"
                      title="Detail"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click="openEmployeeDetail(staff)"
                    >
                      <Eye class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Ubah ${staff.nama || staff.name || 'pegawai'}`"
                      title="Ubah"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2D49B] bg-[#FFF9EE] text-[#B86A00] transition hover:bg-[#FFF1D7]"
                      @click="openEmployeeForm(staff)"
                    >
                      <Pencil class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Hapus ${staff.nama || staff.name || 'pegawai'}`"
                      title="Hapus"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                      @click="handleDeleteEmployee(staff)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="employeePage"
          :total="filteredEmployees.length"
          @page-change="employeePage = safePage($event, filteredEmployees.length)"
        />
      </div>
      <Teleport to="body">
      <div
        v-if="isPayrollHistoryOpen"
        class="sdm-form-modal-layer fixed inset-0 z-[120000] flex items-center justify-center overflow-hidden bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
      <div
        class="flex w-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl"
        :style="{
          width: 'min(1180px, calc(100vw - 32px))',
          height: 'min(820px, calc(100dvh - 32px))',
          maxHeight: 'calc(100dvh - 32px)',
        }"
      >
        <div class="shrink-0 border-b border-slate-100 px-6 py-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-base font-extrabold text-[#102A56]">Riwayat Penggajian</h2>
              <p class="mt-1 text-[11px] text-[#6B7A90]">Payroll yang sudah diproses dan diposting ke jurnal.</p>
            </div>
            <button type="button" aria-label="Tutup riwayat penggajian" class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] hover:bg-slate-50 hover:text-slate-600" @click="isPayrollHistoryOpen = false">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
        <div
          class="payroll-history-scroll min-h-0 flex-1"
          tabindex="0"
          :style="{
            flex: '1 1 0%',
            minHeight: 0,
            overflowX: 'auto',
            overflowY: 'scroll',
            overscrollBehavior: 'contain',
            touchAction: 'pan-x pan-y',
            scrollbarGutter: 'stable',
          }"
        >
          <table class="w-full min-w-[900px] text-left">
            <thead class="sticky top-0 z-10 bg-[#EEF5FC] shadow-[0_1px_0_#D8E5F4]">
              <tr>
                <th class="px-6 py-4">Periode</th>
                <th class="px-6 py-4">Pegawai</th>
                <th class="px-6 py-4">Tanggal Bayar</th>
                <th class="px-6 py-4 text-right">Gaji Bersih</th>
                <th class="px-6 py-4">Voucher</th>
                <th class="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="record in payrollHistory" :key="record.id">
                <td class="px-6 py-4 font-semibold text-[#102A56]">{{ formatPeriodLabel(record.payroll_period) }}</td>
                <td class="px-6 py-4"><span class="block font-semibold text-[#182338]">{{ record.employee_name }}</span><span class="text-[10px] text-slate-400">{{ record.employee_code || '—' }}</span></td>
                <td class="px-6 py-4 text-[#64748B]">{{ record.payment_date || '—' }}</td>
                <td class="px-6 py-4 text-right font-mono font-bold text-[#0B1F4A]">{{ formatRupiah(asNumber(record.net_pay)) }}</td>
                <td class="px-6 py-4 text-[#64748B]">{{ record.voucher_number || '—' }}</td>
                <td class="px-6 py-4 text-center"><span class="inline-flex rounded-full bg-[#EEF5FC] px-3 py-1 text-[10px] font-bold text-[#1E5AA8]">{{ record.status === 'posted' ? 'Diposting' : record.status }}</span></td>
              </tr>
              <tr v-if="payrollHistory.length === 0"><td colspan="6" class="px-6 py-10 text-center text-sm text-[#7A8CA8]">Belum ada riwayat penggajian.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4">
          <p class="text-[11px] font-medium text-[#6B7A90]">{{ payrollHistory.length }} riwayat payroll</p>
          <button type="button" class="h-10 rounded-xl bg-[#0B1F4A] px-5 text-xs font-semibold text-white hover:bg-[#102A56]" @click="isPayrollHistoryOpen = false">Tutup</button>
        </div>
      </div>
      </div>
      </Teleport>
      <Teleport v-if="isMasterDataModalOpen" to="body"
        ><div
          class="master-data-modal-layer bg-[#0B1220]/60 backdrop-blur-sm"
          :style="{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100dvh',
            padding: '24px',
            overflowY: 'auto',
          }"
        >
          <div
            class="relative flex flex-col overflow-hidden rounded-[28px] border border-[#DCE7F4] bg-white shadow-[0_28px_90px_rgba(8,25,60,0.38)]"
            :style="{
              width: 'min(92vw, 1180px)',
              maxHeight: 'calc(100dvh - 48px)',
            }"
          >
            <div
              class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-5 py-4 sm:px-7 sm:py-5"
            >
              <div>
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
                >
                  Master Data SDM
                </p>
                <h3
                  class="mt-1 text-lg font-extrabold tracking-tight text-[#102A56]"
                >
                  Kelola Divisi &amp; Jabatan
                </h3>
                <p class="mt-1 max-w-2xl text-[12px] leading-5 text-[#6B7A90]">
                  Tambahkan, ubah, atau hapus master data. Data yang masih
                  digunakan pegawai tidak dapat dihapus secara langsung.
                </p>
              </div>
              <button
                id="btn-close-master-data"
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-[#102A56]"
                aria-label="Tutup kelola divisi dan jabatan"
                @click="closeMasterDataModal"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
            <div
              class="flex flex-wrap gap-2 border-b border-[#E8EEF7] bg-[#FAFCFF] px-5 py-3 sm:px-7"
            >
              <button
                type="button"
                :class="`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-semibold transition ${masterDataTab === 'division' ? 'bg-[#0B1F4A] text-white shadow-lg shadow-[#0B1F4A]/15' : 'border border-[#DCE7F4] bg-white text-[#53658A] hover:bg-[#F4F8FD]'}`"
                @click="changeMasterTab('division')"
              >
                <Building2 class="h-3.5 w-3.5" /> Divisi
                <span
                  :class="`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${masterDataTab === 'division' ? 'bg-white/15 text-white' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`"
                  >{{ divisions.length }}</span
                ></button
              ><button
                type="button"
                :class="`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-[12px] font-semibold transition ${masterDataTab === 'position' ? 'bg-[#0B1F4A] text-white shadow-lg shadow-[#0B1F4A]/15' : 'border border-[#DCE7F4] bg-white text-[#53658A] hover:bg-[#F4F8FD]'}`"
                @click="changeMasterTab('position')"
              >
                <BriefcaseBusiness class="h-3.5 w-3.5" /> Jabatan
                <span
                  :class="`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${masterDataTab === 'position' ? 'bg-white/15 text-white' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`"
                  >{{ positions.length }}</span
                >
              </button>
            </div>
            <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <section class="min-w-0 p-5 lg:p-6">
                <div
                  class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p class="text-[13px] font-extrabold text-[#102A56]">
                      Daftar {{ masterLabel() }}
                    </p>
                    <p class="mt-1 text-[11px] text-[#7A8CA8]">
                      Gunakan ikon untuk ubah atau hapus data.
                    </p>
                  </div>
                  <button
                    id="btn-add-master-data"
                    type="button"
                    class="inline-flex h-9 w-fit items-center gap-2 rounded-xl bg-[#0B1F4A] px-3.5 text-[12px] font-semibold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56]"
                    @click="resetMasterDataForm(masterDataTab, true)"
                  >
                    <Plus class="h-3.5 w-3.5" /> Tambah {{ masterLabel() }}
                  </button>
                </div>
                <div class="master-search-field relative mb-4">
                  <Search
                    class="master-search-icon pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#0B1F4A]"
                  />
                  <input
                    id="master-data-search"
                    :value="masterSearch"
                    :placeholder="`Cari kode, nama, atau keterangan ${masterLabel().toLowerCase()}...`"
                    class="master-search-input h-10 w-full rounded-xl border border-[#DCE7F4] bg-[#FBFDFF] pr-3 text-[12px] font-medium text-[#243650] outline-none transition placeholder:text-[#8FA0B8] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                    @input="masterSearch = eventValue($event)"
                  />
                </div>
                <div
                  class="overflow-hidden rounded-2xl border border-[#E1EAF5]"
                >
                  <div
                    class="max-h-[min(48dvh,420px)] overflow-y-auto overflow-x-auto"
                  >
                    <table
                      class="master-data-table w-full min-w-[720px] table-fixed text-left text-xs"
                      :style="{ width: '100%' }"
                    >
                      <colgroup v-if="masterDataTab === 'position'">
                        <col :style="{ width: '42%' }" />
                        <col :style="{ width: '24%' }" />
                        <col :style="{ width: '13%' }" />
                        <col :style="{ width: '9%' }" />
                        <col :style="{ width: '12%' }" />
                      </colgroup>
                      <colgroup v-else>
                        <col :style="{ width: '62%' }" />
                        <col :style="{ width: '16%' }" />
                        <col :style="{ width: '22%' }" />
                      </colgroup>
                      <thead
                        class="sticky top-0 z-10 bg-[#EEF5FC] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#28518A]"
                      >
                        <tr>
                          <th class="px-5 py-3 text-left">Kode / Nama</th>
                          <th
                            v-if="masterDataTab === 'position'"
                            class="px-5 py-3 text-left"
                          >
                            Divisi
                          </th>
                          <th
                            v-if="masterDataTab === 'position'"
                            class="px-5 py-3 text-left"
                          >
                            Status
                          </th>
                          <th class="px-5 py-3 text-center">Dipakai</th>
                          <th class="px-5 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#EDF2F7] bg-white">
                        <template v-if="masterRows().length"
                          ><tr
                            v-for="item in pagedMasterRows()"
                            :key="`${masterDataTab}-${item.id}`"
                            class="hover:bg-[#FAFCFF]"
                          >
                            <td class="px-4 py-3">
                              <p class="font-extrabold text-[#102A56]">
                                {{ item.name }}
                              </p>
                              <p class="mt-1 text-[10px] text-[#7A8CA8]">
                                {{ item.code || "Kode otomatis"
                                }}<template v-if="item.description">{{
                                  ` · ${item.description}`
                                }}</template
                                ><template v-else></template>
                              </p>
                            </td>
                            <td
                              v-if="masterDataTab === 'position'"
                              class="px-4 py-3 text-[#53658A]"
                            >
                              {{ item.division_name || "Semua divisi" }}
                            </td>
                            <td
                              v-if="masterDataTab === 'position'"
                              class="px-4 py-3"
                            >
                              <span
                                :class="`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${String(item.status || 'active').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`"
                                ><template
                                  v-if="
                                    String(
                                      item.status || 'active',
                                    ).toLowerCase() === 'active'
                                  "
                                  >Aktif</template
                                ><template v-else>Nonaktif</template></span
                              >
                            </td>
                            <td
                              class="px-4 py-3 text-center font-bold text-[#53658A]"
                            >
                              {{ masterUsageCount(item) }}
                            </td>
                            <td class="px-4 py-3">
                              <div class="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  :title="`Ubah ${masterLabel().toLowerCase()}`"
                                  :aria-label="`Ubah ${masterLabel().toLowerCase()}`"
                                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2D49B] bg-[#FFF9EE] text-[#B86A00] hover:bg-[#FFF1D7]"
                                  @click="editMasterData(item)"
                                >
                                  <Pencil class="h-3.5 w-3.5" /></button
                                ><button
                                  v-if="masterDataTab === 'position'"
                                  type="button"
                                  :title="
                                    String(
                                      item.status || 'active',
                                    ).toLowerCase() === 'active'
                                      ? 'Nonaktifkan'
                                      : 'Aktifkan'
                                  "
                                  :aria-label="
                                    String(
                                      item.status || 'active',
                                    ).toLowerCase() === 'active'
                                      ? 'Nonaktifkan'
                                      : 'Aktifkan'
                                  "
                                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#C9DBF4] bg-[#F4F9FF] text-[#1E5AA8] hover:bg-[#EAF4FF]"
                                  @click="toggleMasterStatus(item)"
                                >
                                  <Power class="h-3.5 w-3.5" /></button
                                ><button
                                  type="button"
                                  :title="`Hapus ${masterLabel().toLowerCase()}`"
                                  :aria-label="`Hapus ${masterLabel().toLowerCase()}`"
                                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                  @click="deleteMasterData(item)"
                                >
                                  <Trash2 class="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td></tr
                        ></template>
                        <tr v-else>
                          <td
                            :colspan="masterDataTab === 'position' ? 5 : 3"
                            class="px-4 py-12 text-center text-xs text-[#8190A5]"
                          >
                            Belum ada data
                            {{ masterLabel().toLowerCase() }} yang sesuai.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <TablePagination
                  :page="masterPage"
                  :total="masterRows().length"
                  @page-change="masterPage = safePage($event, masterRows().length)"
                />
              </section>
            </div>
          <div
            v-if="masterDeleteConfirm"
            class="master-confirm-layer"
            role="dialog"
            aria-modal="true"
            @click.self="closeMasterDeleteConfirm"
          >
            <section class="master-confirm-card">
              <header class="master-confirm-header">
                <div>
                  <p class="master-confirm-eyebrow">Konfirmasi Penghapusan</p>
                  <h3>Hapus {{ masterLabel(masterDeleteConfirm.type) }}?</h3>
                  <p>{{ masterDeleteWarningMessage(masterDeleteConfirm) }}</p>
                </div>
                <button
                  type="button"
                  aria-label="Tutup konfirmasi hapus"
                  class="master-confirm-close"
                  @click="closeMasterDeleteConfirm"
                >
                  <X class="h-4 w-4" />
                </button>
              </header>
              <div class="master-confirm-body">
                <dl>
                  <div>
                    <dt>Nama</dt>
                    <dd>{{ masterDeleteConfirm.item.name }}</dd>
                  </div>
                  <div>
                    <dt>Kode</dt>
                    <dd>{{ masterDeleteConfirm.item.code || "Kode otomatis" }}</dd>
                  </div>
                  <div v-if="masterDeleteConfirm.type === 'division'">
                    <dt>Jabatan</dt>
                    <dd>{{ masterDeletePositionCount(masterDeleteConfirm.item) }} jabatan</dd>
                  </div>
                  <div>
                    <dt>Pegawai</dt>
                    <dd>{{ masterDeleteEmployeeCount(masterDeleteConfirm) }} pegawai</dd>
                  </div>
                </dl>
                <div class="master-confirm-impact">
                  <p>Yang akan terdampak</p>
                  <ul v-if="masterDeleteConfirm.type === 'division'">
                    <li>Divisi tidak bisa dihapus selama masih memiliki jabatan.</li>
                    <li>Pegawai yang memakai jabatan di divisi ini harus dipindahkan atau dinonaktifkan lebih dulu.</li>
                    <li>Hapus atau pindahkan semua jabatan dari divisi ini sebelum menghapus divisi.</li>
                  </ul>
                  <ul v-else>
                    <li>Jabatan tidak bisa dihapus jika masih dipakai pegawai.</li>
                    <li>Pegawai terkait harus dipindahkan ke jabatan lain atau dinonaktifkan lebih dulu.</li>
                    <li>Jika masih dipakai, backend akan menolak penghapusan.</li>
                  </ul>
                </div>
              </div>
              <footer class="master-confirm-actions">
                <button type="button" class="secondary" @click="closeMasterDeleteConfirm">
                  Batal
                </button>
                <button
                  type="button"
                  class="danger"
                  :disabled="masterDeleteHasBlocker(masterDeleteConfirm)"
                  @click="confirmMasterDelete"
                >
                  <template v-if="masterDeleteHasBlocker(masterDeleteConfirm)">
                    Tidak Bisa Dihapus
                  </template>
                  <template v-else>
                    Hapus {{ masterLabel(masterDeleteConfirm.type) }}
                  </template>
                </button>
              </footer>
            </section>
          </div>
          <div
            v-if="isMasterEditorOpen"
            class="master-editor-layer"
            :style="{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '20px',
              overflowY: 'auto',
              pointerEvents: 'auto',
              backgroundColor: 'rgba(11, 18, 32, 0.48)',
              backdropFilter: 'blur(6px)',
            }"
          >
            <div
              class="master-editor-card flex flex-col overflow-hidden rounded-[24px] border border-[#DCE7F4] bg-white shadow-[0_30px_100px_rgba(8,25,60,0.48)]"
              :style="{
                width: 'min(92vw, 680px)',
                maxHeight: 'calc(100dvh - 48px)',
              }"
            >
              <div
                class="master-editor-header flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-6 py-5"
              >
                <div class="min-w-0">
                  <p
                    class="master-editor-eyebrow text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
                  >
                    Form Master Data
                  </p>
                  <h3 class="master-editor-title mt-1 text-lg font-extrabold text-[#102A56]">
                    <template v-if="masterDataForm.id">{{
                      `Ubah ${masterLabel(masterDataForm.type)}`
                    }}</template
                    ><template v-else>{{
                      `Tambah ${masterLabel(masterDataForm.type)}`
                    }}</template>
                  </h3>
                  <p class="master-editor-subtitle mt-1 text-xs text-[#7A8CA8]">
                    Perbarui kode, nama, dan keterangan master data agar pilihan
                    di form SDM tetap rapi.
                  </p>
                </div>
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-[#102A56]"
                  aria-label="Tutup form master data"
                  @click="closeMasterEditor"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>
              <form
                class="master-editor-form min-h-0 flex-1 space-y-4 overflow-y-auto p-6"
                @submit="saveMasterData"
              >
                <div class="master-editor-field">
                  <label class="master-editor-label" for="master-data-code"
                    >Kode</label
                  ><input
                    id="master-data-code"
                    :value="masterDataForm.code"
                    :placeholder="
                      masterDataForm.type === 'division'
                        ? 'Contoh: FIN'
                        : 'Contoh: FIN-MGR'
                    "
                    class="master-editor-control"
                    @input="masterDataForm = {
                          ...masterDataForm,
                          code: eventValue($event),
                        }" />
                  <p class="master-editor-help">Gunakan kode pendek yang mudah dikenali.</p>
                </div>
                <div class="master-editor-field">
                  <label class="master-editor-label" for="master-data-name"
                    >Nama {{ masterLabel(masterDataForm.type) }}</label
                  ><input
                    id="master-data-name"
                    required
                    :value="masterDataForm.name"
                    :placeholder="
                      masterDataForm.type === 'division'
                        ? 'Contoh: Keuangan'
                        : 'Contoh: Finance Manager'
                    "
                    class="master-editor-control"
                    @input="masterDataForm = {
                          ...masterDataForm,
                          name: eventValue($event),
                        }" />
                </div>
                <div
                  v-if="masterDataForm.type === 'position'"
                  class="master-editor-field"
                >
                  <label class="master-editor-label" for="master-data-division"
                    >Divisi Induk</label
                  ><select
                    id="master-data-division"
                    :value="masterDataForm.divisionId"
                    class="master-editor-control"
                    @change="masterDataForm = {
                          ...masterDataForm,
                          divisionId: eventValue($event),
                        }"
                  >
                    <option value="">Berlaku untuk semua divisi</option>
                    <option
                      v-for="item in divisions"
                      :key="item.id"
                      :value="String(item.id)"
                    >
                      {{ item.name }}
                    </option>
                  </select>
                </div>
                <div class="master-editor-field">
                  <label class="master-editor-label" for="master-data-description"
                    >Keterangan</label
                  ><textarea
                    id="master-data-description"
                    :value="masterDataForm.description"
                    :rows="3"
                    placeholder="Keterangan singkat (opsional)"
                    class="master-editor-control min-h-[92px] resize-none py-3"
                    @input="masterDataForm = {
                          ...masterDataForm,
                          description: eventValue($event),
                        }"
                  />
                </div>
                <div
                  v-if="masterDataForm.type === 'position'"
                  class="master-editor-field"
                >
                  <label class="master-editor-label" for="master-data-status"
                    >Status</label
                  ><select
                    id="master-data-status"
                    :value="masterDataForm.status"
                    class="master-editor-control"
                    @change="masterDataForm = {
                          ...masterDataForm,
                          status: eventValue($event),
                        }"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
                <div class="master-editor-summary rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] px-4 py-3">
                  <p class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8A99AD]">
                    Ringkasan
                  </p>
                  <div class="mt-2 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span class="block text-[10px] font-bold text-[#8A99AD]">Tipe</span>
                      <strong class="text-[#102A56]">{{ masterLabel(masterDataForm.type) }}</strong>
                    </div>
                    <div>
                      <span class="block text-[10px] font-bold text-[#8A99AD]">Status</span>
                      <strong class="text-[#102A56]">{{ masterDataForm.status === "inactive" ? "Nonaktif" : "Aktif" }}</strong>
                    </div>
                  </div>
                </div>
                <div class="master-editor-actions grid gap-3 pt-1 sm:grid-cols-2">
                  <button
                    id="btn-cancel-master-data"
                    type="button"
                    class="h-11 rounded-xl border border-[#DCE7F4] bg-white px-4 text-xs font-bold text-[#53658A] transition hover:bg-[#F4F8FD]"
                    @click="closeMasterEditor"
                  >
                    Batal</button
                  ><button
                    id="btn-save-master-data"
                    type="submit"
                    :disabled="masterBusy"
                    class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-bold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save class="h-4 w-4" /><template v-if="masterBusy"
                      >Menyimpan...</template
                    ><template v-else>Simpan</template>
                  </button>
                </div>
              </form>
            </div>
          </div>
          </div>
        </div></Teleport
      ><Teleport v-if="employeeDeleteConfirm" to="body">
        <div
          class="employee-confirm-layer"
          role="dialog"
          aria-modal="true"
          @click.self="closeEmployeeDeleteConfirm"
        >
          <section class="master-confirm-card">
            <header class="master-confirm-header">
              <div>
                <p class="master-confirm-eyebrow">Konfirmasi Penghapusan</p>
                <h3>Hapus Pegawai?</h3>
                <p>
                  Penghapusan hanya tersedia untuk pegawai tanpa riwayat
                  payroll.
                </p>
              </div>
              <button
                type="button"
                class="master-confirm-close"
                aria-label="Tutup konfirmasi hapus pegawai"
                @click="closeEmployeeDeleteConfirm"
              >
                <X class="h-4 w-4" />
              </button>
            </header>
            <div class="master-confirm-body">
              <dl>
                <div>
                  <dt>Nama</dt>
                  <dd>{{ employeeDisplayName(employeeDeleteConfirm) }}</dd>
                </div>
                <div>
                  <dt>Kode</dt>
                  <dd>{{ employeeDisplayCode(employeeDeleteConfirm) }}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{{ employeeDisplayStatus(employeeDeleteConfirm) }}</dd>
                </div>
              </dl>
              <div class="master-confirm-impact">
                <p>Yang akan terdampak</p>
                <ul>
                  <li>Pegawai hilang dari master data SDM.</li>
                  <li>
                    Jika sudah memiliki riwayat payroll, backend akan menolak
                    penghapusan.
                  </li>
                  <li>
                    Untuk pegawai dengan riwayat, gunakan status Nonaktif pada
                    form Ubah.
                  </li>
                </ul>
              </div>
            </div>
            <footer class="master-confirm-actions">
              <button
                type="button"
                class="secondary"
                @click="closeEmployeeDeleteConfirm"
              >
                Batal
              </button>
              <button type="button" class="danger" @click="confirmEmployeeDelete">
                Hapus Pegawai
              </button>
            </footer>
          </section>
        </div>
      </Teleport><Teleport
        v-if="isEmployeeDetailOpen &amp;&amp; selectedEmployeeDetail"
        to="body"
        ><div
          class="sdm-form-modal-layer fixed inset-0 z-[10080] flex items-center justify-center bg-[#111827]/55 p-4 backdrop-blur-sm"
        >
          <div
            class="w-full max-w-2xl rounded-[28px] border border-slate-100 bg-white shadow-2xl overflow-hidden"
          >
            <div
              class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5"
            >
              <div>
                <p
                  class="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1E5AA8]"
                >
                  Detail Pegawai
                </p>
                <h3 class="mt-1 text-xl font-bold text-[#111827]">
                  {{ selectedEmployeeDetail.nama }}
                </h3>
                <p class="mt-1 text-xs text-[#64748B]">
                  Informasi profil pegawai dan ringkasan estimasi gaji bersih.
                </p>
              </div>
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600"
                aria-label="Tutup detail"
                @click="closeEmployeeDetail"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="px-6 py-5">
              <div
                class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] px-4 py-3 text-xs leading-5 text-[#53658A]"
              >
                Ringkasan ini tidak mengulang kolom tabel. Detail dipakai untuk
                data kontak, identitas, BPJS, dan rekening yang diperlukan
                SDM/payroll.
              </div>
            </div>
            <div class="grid gap-4 px-6 pb-6 sm:grid-cols-2">
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  Email
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ employeeDetailSource().email || "—" }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  WhatsApp
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ employeeDetailSource().phone || "—" }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  NIK
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ maskValue(employeeDetailSource().nik) }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  NPWP
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ maskValue(employeeDetailSource().npwp) }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  BPJS Kesehatan
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ maskValue(employeeDetailSource().bpjs_health_number) }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  BPJS Ketenagakerjaan
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ maskValue(employeeDetailSource().bpjs_employment_number) }}
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  Bank / Atas Nama
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  <template v-if="employeeDetailSource().bank_name">{{
                    `${employeeDetailSource().bank_name} · ${employeeDetailSource().bank_account_holder || selectedEmployeeDetail.nama}`
                  }}</template
                  ><template v-else>—</template>
                </p>
              </div>
              <div class="space-y-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  Nomor Rekening
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ maskValue(employeeDetailSource().bank_account_number) }}
                </p>
              </div>
              <div class="space-y-2 sm:col-span-2">
                <p
                  class="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8]"
                >
                  Alamat
                </p>
                <p class="text-sm font-semibold text-[#102A56]">
                  {{ employeeDetailSource().address || "Belum diisi" }}
                </p>
              </div>
            </div>
            <div class="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-[#10182C] px-6 text-sm font-semibold text-white shadow-lg shadow-[#10182C]/20 transition hover:bg-[#0B1120]"
                @click="closeEmployeeDetail"
              >
                Tutup
              </button>
            </div>
          </div>
        </div></Teleport
      >
    </div>
    <!-- 2. KEPATUHAN PERPAJAKAN view -->
    <div v-if="activeTab === 'pajak'" class="space-y-5">
      <header
        class="workspace-page-header flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"
      >
        <div>
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]"
          >
            Tax Compliance
          </p>
          <h1
            class="mt-1.5 text-[28px] font-semibold tracking-[-0.025em] text-[#102A56]"
          >
            Perpajakan
          </h1>
          <p class="mt-1 text-sm leading-6 text-[#6B7A90]">
            Hitung estimasi pajak dari jurnal posted, buat kewajiban pajak, lalu
            catat setoran dari Kas atau Bank.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-efaktur"
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]"
            @click="exportTaxCsv"
          >
            <FileText class="h-4 w-4 text-[#1E5AA8]" /> Export CSV</button
          ><button
            id="btn-draft-spt"
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]"
            @click="printTaxReport"
          >
            <FileText class="h-4 w-4 text-[#1E5AA8]" /> Cetak / Simpan PDF</button
          ><button
            id="btn-tax-manual"
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
            @click="openManualTaxModal"
          >
            <Plus class="h-4 w-4" /> Buat Kewajiban Pajak
          </button>
        </div>
      </header>
      <section
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_10px_28px_rgba(16,42,86,0.045)]"
      >
        <div
          class="flex flex-col gap-3 border-b border-[#E8EEF7] px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A8CA8]"
            >
              Kalkulasi Otomatis
            </p>
            <h2 class="mt-1 text-base font-semibold text-[#102A56]">
              Estimasi Pajak dari Kinerja Perusahaan
            </h2>
            <p class="mt-1 text-[12px] leading-5 text-[#6B7A90]">
              Sistem membaca jurnal posted. Tarif tidak dipaksa oleh sistem;
              pilih sesuai keputusan finance atau aturan yang berlaku.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#EEF5FF]"
            @click="resetTaxCalculation"
          >
            <RefreshCw class="h-3.5 w-3.5" /> Perbarui Dasar
          </button>
        </div>
        <div class="space-y-4 p-5">
          <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div
              v-for="([label, value], cardIndex) in taxPerformanceCards()"
              :key="`${label}-${cardIndex}`"
              class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#8A99AD]">
                {{ label }}
              </p>
              <p class="mt-1 text-sm font-semibold text-[#102A56]">
                {{ value }}
              </p>
            </div>
          </div>
          <div
            class="grid grid-cols-1 gap-3 xl:grid-cols-[1.1fr_1.1fr_1.15fr_0.9fr_1.1fr]"
          >
            <div class="space-y-1.5">
              <label class="text-[10px] font-medium text-[#7A8CA8]"
                >Periode</label
              ><select
                :value="taxCalculation.period"
                class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                @change="updateTaxCalculation({
                      ...taxCalculation,
                      period: eventValue($event),
                    })"
              >
                <option
                  v-for="period in taxPeriodOptions()"
                  :key="period"
                  :value="period"
                >
                  {{ formatPeriodLabel(period) }}
                </option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-medium text-[#7A8CA8]"
                >Jenis Pajak</label
              ><select
                :value="taxCalculation.jenis"
                class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                @change="updateTaxCalculation({
                      ...taxCalculation,
                      jenis: eventValue($event),
                    })"
              >
                <option>PPN</option>
                <option>PPh 21</option>
                <option>PPh 23</option>
                <option>PPh 25</option>
                <option>PPh Final</option>
                <option>PPh Badan</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-medium text-[#7A8CA8]"
                >Dasar Perhitungan</label
              ><select
                :value="taxCalculation.base"
                class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                @change="updateTaxCalculation({
                      ...taxCalculation,
                      base: eventValue($event),
                    })"
              >
                <option>Pendapatan</option>
                <option>Laba Bersih</option>
                <option>Beban</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-medium text-[#7A8CA8]"
                >Tarif Pajak (%)</label
              ><input
                type="number"
                min="0"
                :value="taxCalculation.rate"
                class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                @change="updateTaxCalculation({
                      ...taxCalculation,
                      rate: Number(eventValue($event)),
                    })"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-medium text-[#7A8CA8]"
                >Jatuh Tempo
                <span class="font-normal text-[#A5B3C6]"
                  >(opsional)</span
                ></label
              ><input
                type="date"
                :value="taxCalculation.dueDate"
                class="h-11 w-full rounded-xl border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                @change="updateTaxCalculation({
                      ...taxCalculation,
                      dueDate: eventValue($event),
                    })"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_1.15fr]">
            <div
              class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#8A99AD]">
                Dasar {{ taxCalculation.base }}
              </p>
              <p class="mt-1 text-sm font-semibold text-[#102A56]">
                {{ formatRupiah(taxCalculationBase) }}
              </p>
            </div>
            <div
              class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#8A99AD]">
                Tarif Dipilih
              </p>
              <p class="mt-1 text-sm font-semibold text-[#102A56]">
                {{ taxCalculation.rate }}%
              </p>
            </div>
            <div
              class="rounded-xl border border-[#D7E8FA] bg-[#F7FBFF] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#6983A4]">
                Estimasi {{ taxCalculation.jenis }}
              </p>
              <p class="mt-1 text-sm font-semibold text-[#1E5AA8]">
                {{ formatRupiah(calculatedTax) }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-full min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
              @click="handleCreateTaxDraft"
            >
              <Calculator class="h-4 w-4" /> Buat Draft dari Kalkulasi
            </button>
          </div>
        </div>
      </section>
      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in taxCards"
          :key="card.code"
          class="min-h-[126px] rounded-2xl border border-[#DCE7F4] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,86,0.04)]"
        >
          <p class="text-[11px] font-medium text-[#7A8CA8]">{{ card.title }}</p>
          <p class="mt-2 text-xl font-semibold text-[#102A56]">
            {{ formatRupiah(card.amount) }}
          </p>
          <p class="mt-2 text-[11px] leading-5 text-[#8A99AD]">
            <template v-if="card.title === 'PPN Kurang Bayar'"
              >PPN yang belum disetor</template
            ><template v-else
              ><template v-if="card.title === 'PPh Pasal 21'"
                >Kewajiban PPh 21 belum disetor</template
              ><template v-else
                >Kewajiban PPh 23 belum disetor</template
              ></template
            >
          </p>
        </article>
        <article
          class="min-h-[126px] rounded-2xl border border-[#DCE7F4] bg-white p-4 shadow-[0_10px_28px_rgba(16,42,86,0.04)]"
        >
          <p class="text-[11px] font-medium text-[#7A8CA8]">Status Kepatuhan</p>
          <p class="mt-2 text-xl font-semibold text-[#1E5AA8]">
            <template v-if="overdueTaxCount === 0">Patuh</template
            ><template v-else>Perlu Setor</template>
          </p>
          <p class="mt-2 text-[11px] leading-5 text-[#8A99AD]">
            <template v-if="overdueTaxCount === 0"
              >Tidak ada kewajiban melewati jatuh tempo</template
            ><template v-else>{{
              `${overdueTaxCount} kewajiban melewati jatuh tempo`
            }}</template>
          </p>
        </article>
      </section>
      <section
        class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-[#F7FBFF] px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p class="text-[11px] font-medium text-[#7A8CA8]">
            Total Pajak Belum Dibayar
          </p>
          <p class="mt-1 text-lg font-semibold text-[#102A56]">
            {{ formatRupiah(totalTaxesOwed) }}
          </p>
        </div>
        <p class="max-w-xl text-[11px] leading-5 text-[#7A8CA8]">
          Draft dari kalkulasi belum memengaruhi laporan. Jurnal dibuat saat
          Finance menerbitkan kewajiban pajak atau mencatat setoran.
        </p>
      </section>
      <section
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_10px_28px_rgba(16,42,86,0.045)]"
      >
        <div
          class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition-all ${taxTableTab === 'unpaid' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
              @click="updateTaxTableTab('unpaid')"
            >
              Belum Dibayar</button
            ><button
              type="button"
              :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition-all ${taxTableTab === 'history' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
              @click="updateTaxTableTab('history')"
            >
              Riwayat Setoran</button
            ><select
              :value="taxTypeFilter"
              class="h-9 rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-medium text-[#64748B] outline-none focus:border-[#1E5AA8]"
              @change="updateTaxTypeFilter(eventValue($event))"
            >
              <option value="Semua">Semua Jenis Pajak</option>
              <option>PPN</option>
              <option>PPh 21</option>
              <option>PPh 23</option>
              <option>PPh 25</option>
              <option>PPh Final</option>
              <option>PPh Badan</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div class="flex w-full items-center gap-2 lg:w-auto">
            <div class="relative min-w-0 flex-1 lg:w-72">
              <Search
                class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]"
              /><input
                type="text"
                :value="taxSearchQuery"
                placeholder="Cari jenis pajak, periode, NTPN..."
                class="h-9 w-full rounded-lg border border-[#DCE7F4] bg-[#FBFCFE] pl-9 pr-3 text-[11px] text-[#243650] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
                @change="updateTaxSearchQuery(eventValue($event))"
              />
            </div>
            <button
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#F8FBFE]"
              @click="notify('Data kewajiban pajak telah diperbarui.')"
            >
              <RefreshCw class="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>
        <div class="p-4">
          <div class="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-sm font-semibold text-[#102A56]">
                Kewajiban Pajak
              </h2>
              <p class="mt-1 text-[11px] leading-5 text-[#7A8CA8]">
                Alur: kalkulasi atau input manual → draft → terbitkan kewajiban
                → setor pajak → jurnal dan laporan diperbarui.
              </p>
            </div>
            <span class="shrink-0 text-[11px] text-[#7A8CA8]"
              >{{ filteredTaxRows.length }} data</span
            >
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-[930px] w-full text-left">
              <thead
                class="border-b border-[#E8EEF7] text-[10px] font-medium text-[#7A8CA8]"
              >
                <tr>
                  <th class="px-3 py-3">Jenis Pajak</th>
                  <th class="px-3 py-3">Periode</th>
                  <th class="px-3 py-3">Keterangan</th>
                  <th class="px-3 py-3 text-right">Nominal</th>
                  <th class="px-3 py-3">Jatuh Tempo</th>
                  <th class="px-3 py-3 text-center">Status</th>
                  <th class="px-3 py-3">NTPN</th>
                  <th class="w-[120px] px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EDF2F8]">
                <tr v-if="filteredTaxRows.length === 0">
                  <td
                    :colspan="8"
                    class="px-3 py-12 text-center text-sm text-[#8A99AD]"
                  >
                    Tidak ada data pajak yang sesuai.
                  </td>
                </tr>
                <template v-else
                  ><tr
                    v-for="tax in pagedTaxRows"
                    :key="tax.id"
                    class="transition hover:bg-[#FAFCFE]"
                  >
                    <td class="px-3 py-3.5">
                      <span
                        class="inline-flex rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[10px] font-medium text-[#1E5AA8]"
                        >{{ tax.jenis }}</span
                      >
                    </td>
                    <td
                      class="px-3 py-3.5 text-[11px] font-medium text-[#40516A]"
                    >
                      {{ tax.masaPajak }}
                    </td>
                    <td class="min-w-[280px] px-3 py-3.5">
                      <p class="text-[11px] leading-4 text-[#40516A]">
                        {{ taxDescription(tax.jenis, tax.masaPajak) }}
                      </p>
                      <p class="mt-1 text-[10px] text-[#8A99AD]">
                        Jurnal: TAX-{{ tax.id.replace("T-", "0") }}
                      </p>
                    </td>
                    <td
                      class="px-3 py-3.5 text-right text-[11px] font-semibold text-[#102A56]"
                    >
                      {{ formatRupiah(tax.nominal) }}
                    </td>
                    <td class="px-3 py-3.5 text-[11px] text-[#64748B]">
                      {{ formatTaxDate(tax.jatuhTempo) }}
                    </td>
                    <td class="px-3 py-3.5 text-center">
                      <span
                        :class="`mx-auto inline-flex min-w-[104px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-center text-[10px] font-semibold leading-none ${tax.status === 'Belum Setor' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-[#EEF5FC] text-[#0B1F4A]'}`"
                        ><template v-if="tax.status === 'Belum Setor'"
                          >Belum Dibayar</template
                        ><template v-else>Sudah Disetor</template></span
                      >
                    </td>
                    <td class="px-3 py-3.5 text-[10px] text-[#64748B]">
                      {{ tax.ntpn || "—" }}
                    </td>
                    <td class="w-[120px] px-3 py-3.5 text-center">
                      <button
                        v-if="tax.status === 'Belum Setor'"
                        type="button"
                        class="tax-payment-action inline-flex h-8 min-w-[92px] items-center justify-center whitespace-nowrap rounded-lg border border-[#C9DCF3] bg-[#EEF5FF] px-3 text-[11px] font-semibold text-[#1E5AA8] transition hover:border-[#1E5AA8] hover:bg-[#102A56] hover:text-white"
                        @click="openTaxPaymentModal(tax.id)"
                      >
                        Setor Pajak</button
                      ><span
                        v-else
                        class="inline-flex min-h-8 min-w-[96px] items-center justify-center whitespace-nowrap rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[10px] font-semibold text-[#7A8CA8]"
                        >Sudah disetor</span
                      >
                    </td>
                  </tr></template
                >
              </tbody>
            </table>
          </div>
          <TablePagination
            :page="taxPage"
            :total="filteredTaxRows.length"
            @page-change="taxPage = safePage($event, filteredTaxRows.length)"
          />
        </div>
      </section>
    </div>
    <!-- 3. SET RATE BPJS MODAL -->
    <Teleport to="body">
      <div
        v-if="isBpjsModalOpen"
        class="sdm-form-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div
          class="my-4 max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl"
        >
        <div
          class="px-8 py-7 border-b border-slate-100 flex justify-between items-center"
        >
          <div>
            <p
              class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Langkah 1 dari 3
            </p>
            <h3
              class="mt-1 font-extrabold text-lg text-[#111827] tracking-tight"
            >
              Pengaturan Tarif BPJS
            </h3>
            <p class="mt-1 text-xs text-[#64748B]">
              Diatur sekali oleh admin dan dipakai untuk payroll berikutnya.
            </p>
          </div>
          <button
            id="btn-close-bpjs"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="updateIsBpjsModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          class="space-y-7 px-8 py-8 text-xs"
          novalidate
          @submit="handleSaveBpjs"
        >
          <div
            v-if="bpjsRateErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh tarif BPJS.</strong>
            <span>Semua kolom wajib diisi dengan angka 0 sampai 100.</span>
          </div>
          <div class="space-y-5">
            <h4
              class="text-[10px] text-[#1E5AA8] font-extrabold uppercase tracking-widest flex items-center gap-2"
            >
              <HeartPulse class="w-3.5 h-3.5" /> BPJS Kesehatan (%)
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Porsi Perusahaan</label
                ><input
                  id="bpjs-kes-employer"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsKesEmployer)"
                  class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid':
                      bpjsRateErrors.healthCompany,
                  }"
                  @input="clearBpjsRateError('healthCompany')"
                  @change="updateBpjsKesEmployer(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.healthCompany"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.healthCompany }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Porsi Pegawai</label
                ><input
                  id="bpjs-kes-employee"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsKesEmployee)"
                  class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid':
                      bpjsRateErrors.healthEmployee,
                  }"
                  @input="clearBpjsRateError('healthEmployee')"
                  @change="updateBpjsKesEmployee(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.healthEmployee"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.healthEmployee }}
                </p>
              </div>
            </div>
          </div>
          <div class="space-y-5">
            <h4
              class="text-[10px] text-[#0B1F4A] font-extrabold uppercase tracking-widest flex items-center gap-2"
            >
              <ShieldCheck class="w-3.5 h-3.5" /> BPJS Ketenagakerjaan (%)
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >JHT Perus.</label
                ><input
                  id="bpjs-jht-employer"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsJhtEmployer)"
                  class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid': bpjsRateErrors.jhtCompany,
                  }"
                  @input="clearBpjsRateError('jhtCompany')"
                  @change="updateBpjsJhtEmployer(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.jhtCompany"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.jhtCompany }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >JHT Pegawai</label
                ><input
                  id="bpjs-jht-employee"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsJhtEmployee)"
                  class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid': bpjsRateErrors.jhtEmployee,
                  }"
                  @input="clearBpjsRateError('jhtEmployee')"
                  @change="updateBpjsJhtEmployee(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.jhtEmployee"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.jhtEmployee }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >JP Perus.</label
                ><input
                  id="bpjs-jp-employer"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsJpEmployer)"
                  class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid': bpjsRateErrors.jpCompany,
                  }"
                  @input="clearBpjsRateError('jpCompany')"
                  @change="updateBpjsJpEmployer(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.jpCompany"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.jpCompany }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >JP Pegawai</label
                ><input
                  id="bpjs-jp-employee"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.01"
                  input-mode="decimal"
                  :value="formatPercentInput(bpjsJpEmployee)"
                  class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20 font-bold text-[#111827]"
                  :class="{
                    'form-control-invalid': bpjsRateErrors.jpEmployee,
                  }"
                  @input="clearBpjsRateError('jpEmployee')"
                  @change="updateBpjsJpEmployee(parsePercentInput(eventValue($event)))"
                />
                <p
                  v-if="bpjsRateErrors.jpEmployee"
                  class="form-field-warning"
                >
                  {{ bpjsRateErrors.jpEmployee }}
                </p>
              </div>
            </div>
          </div>
          <button
            id="btn-save-bpjs-rates"
            type="submit"
            class="w-full h-12 bg-[#10182C] hover:bg-[#0B1120] text-white font-extrabold rounded-2xl transition-all uppercase tracking-widest text-xs"
          >
            Simpan Tarif BPJS
          </button>
        </form>
        </div>
      </div>
    </Teleport>
    <!-- 4. EMPLOYEE REGISTRATION MODAL -->
    <Teleport to="body">
    <div
      v-if="isEmployeeModalOpen"
      class="sdm-form-modal-layer fixed inset-0 z-[10080] flex items-start justify-center overflow-y-auto bg-[#111827]/55 px-4 py-6 backdrop-blur-sm"
    >
      <div
        class="employee-form-modal-card flex w-full max-w-[980px] flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="sticky top-0 z-20 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#1E5AA8]"
            >
              Langkah 2 dari 3
            </p>
            <h3
              class="mt-1 text-xl font-extrabold tracking-tight text-[#111827]"
            >
              <template v-if="editingEmployee">Ubah Pegawai</template
              ><template v-else>Tambah Pegawai</template>
            </h3>
            <p class="mt-1 text-xs leading-5 text-[#64748B]">
              Lengkapi seluruh kolom sebelum menyimpan data pegawai.
            </p>
          </div>
          <button
            id="btn-close-employee-modal"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600"
            @click="closeEmployeeModal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          novalidate
          data-manual-validation="true"
          class="space-y-5 px-6 py-5 text-xs"
          @submit.prevent
        >
          <div
            v-if="employeeFormErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh data pegawai.</strong>
            <span>Semua kolom wajib diisi sebelum pegawai disimpan.</span>
          </div>
          <section class="space-y-4">
            <div class="flex items-center gap-2 border-b border-[#D8E5F4] pb-3">
              <UserCircle class="w-4 h-4 text-[#0B1F4A]" />
              <h4
                class="font-extrabold uppercase tracking-wider text-[#1F2A44]"
              >
                Data Wajib Pegawai
              </h4>
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SdmField label="Nama Lengkap"
                ><input
                  id="employee-name"
                  required
                  :value="employeeForm.nama"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.nama },
                  ]"
                  placeholder="Contoh: Rizka Farida Damayanti"
                  @input="setEmployeeField('nama', eventValue($event))" />
                <p v-if="employeeFormErrors.nama" class="form-field-warning">
                  {{ employeeFormErrors.nama }}
                </p></SdmField
              ><SdmField label="NIK"
                ><input
                  id="employee-nik"
                  required
                  :value="employeeForm.nik"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.nik },
                  ]"
                  placeholder="Nomor identitas pegawai"
                  @input="setEmployeeField('nik', eventValue($event))" />
                <p v-if="employeeFormErrors.nik" class="form-field-warning">
                  {{ employeeFormErrors.nik }}
                </p></SdmField
              ><SdmField label="Email"
                ><input
                  id="employee-email"
                  required
                  type="email"
                  :value="employeeForm.email"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.email },
                  ]"
                  placeholder="nama@perusahaan.com"
                  @input="setEmployeeField('email', eventValue($event))" />
                <p v-if="employeeFormErrors.email" class="form-field-warning">
                  {{ employeeFormErrors.email }}
                </p></SdmField
              ><SdmField label="No. WhatsApp"
                ><input
                  id="employee-whatsapp"
                  required
                  :value="employeeForm.whatsapp"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.whatsapp },
                  ]"
                  placeholder="08xxxxxxxxxx"
                  @input="setEmployeeField('whatsapp', eventValue($event))" />
                <p
                  v-if="employeeFormErrors.whatsapp"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.whatsapp }}
                </p></SdmField
              ><SdmField label="Divisi"
                ><select
                  id="employee-division"
                  required
                  :value="employeeForm.divisionId"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.divisionId },
                  ]"
                  @change="setEmployeeDivision(eventValue($event))"
                >
                  <option value="">Pilih divisi</option>
                  <option
                    v-for="division in activeDivisions()"
                    :key="division.id"
                    :value="String(division.id)"
                  >
                    {{ division.name }}
                  </option>
                </select>
                <p
                  v-if="employeeFormErrors.divisionId"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.divisionId }}
                </p></SdmField
              ><SdmField label="Jabatan"
                ><select
                  id="employee-position"
                  required
                  :value="employeeForm.positionId"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.positionId },
                  ]"
                  @change="setEmployeeField('positionId', eventValue($event))"
                >
                  <option value="">Pilih jabatan</option>
                  <option
                    v-for="position in filteredPositions()"
                    :key="position.id"
                    :value="String(position.id)"
                  >
                    {{ position.name }}
                  </option>
                </select>
                <p
                  v-if="employeeFormErrors.positionId"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.positionId }}
                </p></SdmField
              ><SdmField label="Status Kerja"
                ><select
                  id="employee-contract-status"
                  required
                  :value="employeeForm.statusKontrak"
                  :class="[
                    inputClass,
                    {
                      'form-control-invalid':
                        employeeFormErrors.statusKontrak,
                    },
                  ]"
                  @change="setEmployeeField('statusKontrak', eventValue($event))"
                >
                  <option>Karyawan Tetap</option>
                  <option>Kontrak</option>
                  <option>Probation</option>
                </select>
                <p
                  v-if="employeeFormErrors.statusKontrak"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.statusKontrak }}
                </p></SdmField
              >
              <div
                v-if="editingEmployee"
                class="md:col-span-2 rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3"
              >
                <div
                  class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center"
                >
                  <div>
                    <p class="font-extrabold text-[#0B1F4A]">Status Pegawai</p>
                    <p class="mt-1 text-[11px] leading-5 text-[#6B7A90]">
                      Pilih Nonaktif bila pegawai sudah tidak bekerja. Riwayat
                      payroll tetap tersimpan.
                    </p>
                  </div>
                  <select
                    id="employee-employment-status"
                    required
                    :value="employeeForm.employmentStatus"
                    :class="[
                      inputClass,
                      {
                        'form-control-invalid':
                          employeeFormErrors.employmentStatus,
                      },
                    ]"
                    @change="
                      setEmployeeField('employmentStatus', eventValue($event))
                    "
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                  <p
                    v-if="employeeFormErrors.employmentStatus"
                    class="form-field-warning"
                  >
                    {{ employeeFormErrors.employmentStatus }}
                  </p>
                </div>
              </div>
              <SdmField label="Status PTKP"
                ><select
                  id="employee-ptkp-status"
                  required
                  :value="employeeForm.ptkpStatus"
                  :class="[
                    inputClass,
                    { 'form-control-invalid': employeeFormErrors.ptkpStatus },
                  ]"
                  @change="setEmployeeField('ptkpStatus', eventValue($event))"
                >
                  <option>TK/0</option>
                  <option>TK/1</option>
                  <option>TK/2</option>
                  <option>TK/3</option>
                  <option>K/0</option>
                  <option>K/1</option>
                  <option>K/2</option>
                  <option>K/3</option>
                </select>
                <p
                  v-if="employeeFormErrors.ptkpStatus"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.ptkpStatus }}
                </p></SdmField
              ><SdmField label="Tanggal Bergabung"
                ><input
                  id="employee-join-date"
                  required
                  type="date"
                  :value="employeeForm.tanggalBergabung"
                  :class="[
                    inputClass,
                    {
                      'form-control-invalid':
                        employeeFormErrors.tanggalBergabung,
                    },
                  ]"
                  @change="
                    setEmployeeField('tanggalBergabung', eventValue($event))
                  "
              />
                <p
                  v-if="employeeFormErrors.tanggalBergabung"
                  class="form-field-warning"
                >
                  {{ employeeFormErrors.tanggalBergabung }}
                </p></SdmField>
              <div class="md:col-span-2">
                <SdmField label="Gaji Pokok"
                  ><div class="currency-input relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#1E5AA8]"
                      >Rp</span
                    ><input
                      id="employee-base-salary"
                      required
                      type="number"
                      min="1"
                      :value="employeeForm.gajiPokok || ''"
                      style="padding-left: 2.75rem !important"
                      :class="[
                        inputClass,
                        'pl-12',
                        {
                          'form-control-invalid':
                            employeeFormErrors.gajiPokok,
                        },
                      ]"
                      placeholder="0"
                      @input="
                        setEmployeeField(
                          'gajiPokok',
                          Number(eventValue($event)),
                        )
                      "
                    /></div
                  ><p
                    v-if="employeeFormErrors.gajiPokok"
                    class="form-field-warning"
                  >
                    {{ employeeFormErrors.gajiPokok }}
                  </p></SdmField
                >
              </div>
            </div>
          </section>
          <details
            id="employee-extra-details"
            class="rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-5 py-4"
          >
            <summary
              class="cursor-pointer list-none font-extrabold text-[#0B1F4A]"
            >
              + Data administrasi pegawai
            </summary>
            <p class="mt-2 text-[11px] leading-5 text-[#6B7A90]">
              NIP, nomor BPJS, bank, dan NPWP bersifat opsional dan dapat
              dilengkapi kemudian.
            </p>
            <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <SdmField label="NIP Sistem"
                ><input
                  id="employee-code"
                  :value="employeeForm.nip"
                  :class="inputClass"
                  @input="setEmployeeField('nip', eventValue($event))" /></SdmField
              ><SdmField label="Nomor BPJS Kesehatan"
                ><input
                  id="employee-bpjs-health"
                  :value="employeeForm.bpjsKesehatanNo"
                  :class="inputClass"
                  @input="
                    setEmployeeField('bpjsKesehatanNo', eventValue($event))
                  " /></SdmField
              ><SdmField label="Nomor KPJ"
                ><input
                  id="employee-bpjs-employment"
                  :value="employeeForm.bpjsKetenagakerjaanNo"
                  :class="inputClass"
                  @input="
                    setEmployeeField(
                      'bpjsKetenagakerjaanNo',
                      eventValue($event),
                    )
                  " /></SdmField
              ><SdmField label="Nama Bank"
                ><input
                  id="employee-bank-name"
                  :value="employeeForm.bankNama"
                  :class="inputClass"
                  @input="setEmployeeField('bankNama', eventValue($event))" /></SdmField
              ><SdmField label="Nomor Rekening"
                ><input
                  id="employee-bank-account"
                  :value="employeeForm.noRekening"
                  :class="inputClass"
                  @input="setEmployeeField('noRekening', eventValue($event))" /></SdmField
              ><SdmField label="NPWP"
                ><input
                  id="employee-npwp"
                  :value="employeeForm.npwp"
                  :class="inputClass"
                  @input="setEmployeeField('npwp', eventValue($event))"
              /></SdmField>
            </div>
          </details>
          <p
            v-if="employeeSaveError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-700"
          >
            {{ employeeSaveError }}
          </p>
          <div
            class="flex flex-col-reverse gap-3 border-t border-[#E8EEF7] pt-5 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              class="h-11 rounded-xl border border-[#D8E5F4] px-5 font-extrabold text-[#64748B]"
              @click="closeEmployeeModal"
            >
              Batal</button
            ><button
              id="btn-submit-employee"
              type="button"
              :disabled="isEmployeeSaving"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#10182C] px-6 font-extrabold text-white shadow-lg shadow-[#10182C]/20"
              @click="handleCreateEmployee"
            >
              <CheckCircle2 class="w-4 h-4" /><template v-if="isEmployeeSaving"
                >Menyimpan...</template
              ><template v-else-if="editingEmployee"
                >Simpan Perubahan</template
              ><template v-else>Simpan Pegawai</template>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
    <!-- 5. PROCESS PAYROLL MODAL -->
    <Teleport to="body">
    <div
      v-if="isPayrollModalOpen"
      class="sdm-form-modal-layer fixed inset-0 z-[10080] flex items-start justify-center overflow-y-auto bg-[#111827]/55 px-4 py-6 backdrop-blur-sm"
    >
      <div
        class="payroll-form-modal-card w-full max-w-[560px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
      >
        <div
          class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center"
        >
          <div>
            <p
              class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Langkah 3 dari 3
            </p>
            <h3 class="mt-1 font-extrabold text-sm text-[#0B1F4A]">
              Proses Payroll
            </h3>
            <span class="text-[10px] text-slate-400"
              >Pilih pegawai, periode, dan akun pembayaran.</span
            >
          </div>
          <button
            id="btn-close-payroll"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
            @click="closePayrollModal"
            aria-label="Tutup modal payroll"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form
          novalidate
          data-manual-validation="true"
          class="space-y-4 p-6 text-xs"
          @submit.prevent="handleProcessPayroll"
        >
          <div
            v-if="payrollFormErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh data payroll.</strong>
            <span>Semua kolom wajib diisi sebelum payroll diproses.</span>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Pegawai yang Diproses</label
            ><select
              id="payroll-employee"
              required
              :value="payrollForm.employeeId"
              :class="[
                'w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs',
                { 'form-control-invalid': payrollFormErrors.employeeId },
              ]"
              @change="setPayrollField('employeeId', eventValue($event))"
            >
              <option value="">-- Pilih pegawai --</option>
              <option
                v-for="employee in activePayrollEmployees"
                :key="employee?._raw?.id || employee.id"
                :value="String(employee?._raw?.id || '')"
              >
                {{ employee.nama }} · {{ employee.id }}
              </option>
            </select>
            <p
              v-if="payrollFormErrors.employeeId"
              class="form-field-warning"
            >
              {{ payrollFormErrors.employeeId }}
            </p>
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">Periode Payroll</label
              ><input
                id="payroll-period"
                type="month"
                required
                :value="payrollForm.payrollPeriod"
                :class="[
                  'w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs',
                  { 'form-control-invalid': payrollFormErrors.payrollPeriod },
                ]"
                @change="setPayrollField('payrollPeriod', eventValue($event))"
              />
              <p
                v-if="payrollFormErrors.payrollPeriod"
                class="form-field-warning"
              >
                {{ payrollFormErrors.payrollPeriod }}
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">Tanggal Bayar</label
              ><input
                id="payroll-payment-date"
                type="date"
                required
                :value="payrollForm.paymentDate"
                :class="[
                  'w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs',
                  { 'form-control-invalid': payrollFormErrors.paymentDate },
                ]"
                @change="setPayrollField('paymentDate', eventValue($event))"
              />
              <p
                v-if="payrollFormErrors.paymentDate"
                class="form-field-warning"
              >
                {{ payrollFormErrors.paymentDate }}
              </p>
            </div>
          </div>
          <div
            class="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-2 text-blue-900"
          >
            <p class="font-bold">Estimasi Payroll Terpilih:</p>
            <div class="font-mono space-y-1 text-xs">
              <p>
                • Pegawai:
                <span class="font-bold">{{
                  currentPayrollEmployee()?.nama || "—"
                }}</span>
              </p>
              <p>
                • Penghasilan bruto:
                <span class="font-bold">{{
                  formatRupiah(currentPayrollAmount())
                }}</span>
              </p>
              <p>
                • Estimasi take-home pay:
                <span class="font-bold">{{
                  formatRupiah(currentPayrollEstimatedNet())
                }}</span>
              </p>
              <p>
                • Net Payroll MTD:
                <span class="font-bold">{{
                  formatRupiah(asNumber(payrollSummary.total_net_pay))
                }}</span>
              </p>
              <p
                class="border-t border-blue-200 pt-1.5 font-sans font-extrabold text-[#0B1F4A] text-sm"
              >
                Nilai payroll bruto: {{ formatRupiah(currentPayrollAmount()) }}
              </p>
            </div>
          </div>
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-3">
            <p
              class="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1E5AA8]"
            >
              Komponen Payroll &amp; Potongan
            </p>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label class="text-[10px] text-[#53658A]"
                >Lembur<input
                  id="payroll-overtime"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.overtimeAmount"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    { 'form-control-invalid': payrollFormErrors.overtimeAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'overtimeAmount',
                      asNumber(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.overtimeAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.overtimeAmount }}
                </p></label
              ><label class="text-[10px] text-[#53658A]"
                >Tunjangan<input
                  id="payroll-allowance"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.allowanceAmount"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    { 'form-control-invalid': payrollFormErrors.allowanceAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'allowanceAmount',
                      asNumber(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.allowanceAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.allowanceAmount }}
                </p></label
              ><label class="text-[10px] text-[#53658A]"
                >Bonus<input
                  id="payroll-bonus"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.bonusAmount"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    { 'form-control-invalid': payrollFormErrors.bonusAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'bonusAmount',
                      asNumber(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.bonusAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.bonusAmount }}
                </p></label
              ><label class="text-[10px] text-[#53658A]"
                >Kasbon<input
                  id="payroll-loan-deduction"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.loanDeduction"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    { 'form-control-invalid': payrollFormErrors.loanDeduction },
                  ]"
                  @input="
                    setPayrollField(
                      'loanDeduction',
                      asNumber(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.loanDeduction"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.loanDeduction }}
                </p></label
              ><label class="text-[10px] text-[#53658A]"
                >Potongan lain<input
                  id="payroll-other-deduction"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.otherDeduction"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    { 'form-control-invalid': payrollFormErrors.otherDeduction },
                  ]"
                  @input="
                    setPayrollField(
                      'otherDeduction',
                      asNumber(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.otherDeduction"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.otherDeduction }}
                </p></label
              ><label class="text-[10px] text-[#53658A]"
                >PPh 21 manual (Desember)<input
                  id="payroll-pph21-manual"
                  type="number"
                  min="0"
                  required
                  :value="payrollForm.pph21ManualAmount"
                  :class="[
                    'mt-1 h-9 w-full rounded-lg border border-[#D8E5F4] bg-white px-2 text-xs',
                    {
                      'form-control-invalid':
                        payrollFormErrors.pph21ManualAmount,
                    },
                  ]"
                  @input="
                    setPayrollField(
                      'pph21ManualAmount',
                      asNumber(eventValue($event)),
                    )
                  "
              />
                <p
                  v-if="payrollFormErrors.pph21ManualAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.pph21ManualAmount }}
                </p></label>
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700"
              >Sumber Rekening Dana Payout</label
            ><select
              id="payroll-source-bank"
              required
              :value="payrollForm.cashAccountId"
              :class="[
                'w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs',
                { 'form-control-invalid': payrollFormErrors.cashAccountId },
              ]"
              @change="setPayrollField('cashAccountId', eventValue($event))"
            >
              <option value="">-- Pilih Kas/Bank --</option>
              <option
                v-for="account in payrollAccounts"
                :key="account.id"
                :value="String(account.id)"
              >
                {{ account.code }} - {{ account.name }}
              </option>
            </select>
            <p
              v-if="payrollFormErrors.cashAccountId"
              class="form-field-warning"
            >
              {{ payrollFormErrors.cashAccountId }}
            </p>
          </div>
          <div
            class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-3 text-[10px] text-[#53658A]"
          >
            PPh 21 yang dihitung akan otomatis menjadi potongan payroll dan
            Utang Pajak pada jurnal. Untuk Desember, isi nominal final setelah
            rekonsiliasi tahunan resmi.
          </div>
          <div
            v-if="pph21Estimate"
            class="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-[#0B1F4A]"
          >
            <p class="font-semibold">
              Estimasi PPh 21:
              <template v-if="pph21Estimate.needs_final_reconciliation"
                >Perlu rekonsiliasi tahunan</template
              ><template v-else>{{
                formatRupiah(asNumber(pph21Estimate.pph21_amount))
              }}</template>
            </p>
            <p class="mt-1 text-[10px]">
              {{
                pph21Estimate.message ||
                `TER ${(asNumber(pph21Estimate.ter_rate) * 100).toFixed(2)}% · Take home pay ${formatRupiah(asNumber(pph21Estimate.take_home_pay))}`
              }}
            </p>
          </div>
          <div class="grid gap-3">
            <button
              type="button"
              class="w-full border border-[#BFD5EE] bg-white text-[#0B1F4A] font-semibold py-2.5 rounded-xl transition-all"
              @click="calculatePayrollPph21"
            >
              Hitung Estimasi PPh 21 Pegawai</button
            ><button
              id="btn-confirm-payout"
              type="submit"
              class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" /> Proses Payroll
              Pegawai Ini</button
            ><button
              type="button"
              class="w-full border border-[#0B1F4A] bg-white text-[#0B1F4A] font-semibold py-2.5 rounded-xl transition-all"
              @click="handleProcessPayrollBulk"
            >
              Proses Semua Pegawai Aktif</button
            ><button
              type="button"
              class="w-full text-[#1E5AA8] font-semibold py-2.5 text-xs"
              @click="downloadPayrollBankTransfer"
            >
              Unduh File Transfer Bank Periode Ini
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
    <div
      v-if="payslipPreview"
      class="fixed inset-0 z-[9998] flex items-center justify-center bg-[#000]/60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div
          class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Payslip Payroll
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              {{ payslipPreview.employee_name || "Pegawai" }}
            </h3>
            <p class="mt-1 text-xs text-[#6B7A90]">
              Periode {{ payslipPreview.payroll_period || "-" }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-[#6B7A90]"
            @click="payslipPreview = null"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="space-y-3 px-6 py-5 text-sm">
          <div class="flex justify-between">
            <span>Gaji pokok</span
            ><strong>{{
              formatRupiah(asNumber(payslipPreview.base_salary))
            }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Lembur + tunjangan + bonus</span
            ><strong>{{
              formatRupiah(
                asNumber(payslipPreview.overtime_amount) +
                  asNumber(payslipPreview.allowance_amount) +
                  asNumber(payslipPreview.bonus_amount),
              )
            }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Potongan BPJS pegawai</span
            ><strong>{{
              formatRupiah(asNumber(payslipPreview.employee_bpjs_deduction))
            }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Potongan PPh 21</span
            ><strong>{{
              formatRupiah(asNumber(payslipPreview.pph21_amount))
            }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Kasbon &amp; potongan lain</span
            ><strong>{{
              formatRupiah(
                asNumber(payslipPreview.loan_deduction) +
                  asNumber(payslipPreview.other_deduction),
              )
            }}</strong>
          </div>
          <div
            class="flex justify-between border-t border-[#E8EEF7] pt-3 text-[#0B1F4A]"
          >
            <span class="font-semibold">Gaji bersih</span
            ><strong>{{
              formatRupiah(asNumber(payslipPreview.net_pay))
            }}</strong>
          </div>
        </div>
        <div class="flex justify-end gap-3 border-t border-[#E8EEF7] px-6 py-4">
          <button
            type="button"
            class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium"
            @click="payslipPreview = null"
          >
            Tutup</button
          ><button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            @click="openPayslipPrint"
          >
            <FileText class="h-4 w-4" /> Cetak / Simpan PDF
          </button>
        </div>
      </div>
    </div>
    <!-- 5. FORM KEWAJIBAN PAJAK: PPh 21, PPh 23, DAN JENIS LAIN --><Teleport
      v-if="isTaxManualModalOpen"
      to="body"
      ><div
        class="tax-manual-modal-layer fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#111827]/70 p-3 backdrop-blur-sm sm:p-6"
      >
        <div
          class="tax-manual-card my-3 flex w-full max-w-[840px] flex-col overflow-hidden rounded-[24px] border border-[#DCE7F4] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.38)] sm:my-4"
          style="width: min(760px, calc(100vw - 48px)) !important; max-width: min(760px, calc(100vw - 48px)) !important; max-height: min(88vh, 760px) !important"
        >
          <div
            class="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-4 border-b border-[#E8EEF7] bg-white px-5 py-4 sm:px-6"
          >
            <div>
              <p
                class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]"
              >
                Form Pajak
              </p>
              <h3 class="mt-1 text-base font-semibold text-[#102A56]">
                Buat Kewajiban PPh / Pajak Lainnya
              </h3>
              <p class="mt-1 text-[11px] leading-5 text-[#6B7A90]">
                Pilih jenis pajak, isi data inti, lalu simpan kewajiban. Tarif
                dan nominal tetap dikendalikan oleh Finance.
              </p>
            </div>
            <button
              id="btn-close-tax-manual"
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] text-[#8091A8] transition hover:bg-white hover:text-[#102A56]"
              aria-label="Tutup form pajak"
              @click="closeManualTaxModal"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <form
            class="tax-manual-form min-h-0 flex-1 overflow-y-auto space-y-4 px-5 py-4 sm:px-6"
            @submit="handleSaveManualTax"
          >
            <section>
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p class="text-[12px] font-semibold text-[#102A56]">
                    1. Template Jenis Pajak
                  </p>
                  <p class="mt-0.5 text-[11px] text-[#7A8CA8]">
                    Pilih template agar field objek dan keterangan awal terisi
                    rapi.
                  </p>
                </div>
                <span
                  class="hidden rounded-full bg-[#EEF5FF] px-2.5 py-1 text-[10px] font-semibold text-[#1E5AA8] sm:inline-flex"
                >
                  Data dicatat sebagai kewajiban pajak
                </span>
              </div>
              <div
                class="rounded-2xl border border-[#DCE7F4] bg-[#FBFCFE] p-3.5"
              >
                <div
                  class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.75fr)] md:items-end"
                >
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-medium text-[#7A8CA8]"
                      >Dropdown Template Pajak</label
                    ><select
                      :value="manualTaxForm.jenis"
                      class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                      @change="selectManualTaxTypeValue(eventValue($event))"
                    >
                      <option
                        v-for="option in manualTaxOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>
                  </div>
                  <div
                    class="rounded-xl border border-[#E6EEF7] bg-white px-3.5 py-3"
                  >
                    <p class="text-[10px] font-medium text-[#7A8CA8]">
                      Template Aktif
                    </p>
                    <p class="mt-1 text-[12px] font-semibold text-[#102A56]">
                      {{ selectedManualTaxOption()?.label }}
                    </p>
                  </div>
                </div>
                <p class="mt-3 text-[11px] leading-5 text-[#6B7A90]">
                  {{ selectedManualTaxOption()?.hint }}
                </p>
              </div>
            </section>
            <section
              class="rounded-2xl border border-[#E6EEF7] bg-[#FBFCFE] p-3.5"
            >
              <div class="mb-3">
                <p class="text-[12px] font-semibold text-[#102A56]">
                  2. Rincian Kewajiban {{ manualTaxForm.jenis }}
                </p>
                <p class="mt-1 text-[11px] text-[#7A8CA8]">
                  Untuk PPh 21 dan PPh 23, isi pihak penerima penghasilan agar
                  pencatatan lebih mudah ditelusuri.
                </p>
              </div>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Masa Pajak</label
                  ><input
                    type="month"
                    :value="manualTaxForm.period"
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                    required
                    @change="updateManualTaxForm({
                          ...manualTaxForm,
                          period: eventValue($event),
                        })"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Jatuh Tempo</label
                  ><input
                    type="date"
                    :value="manualTaxForm.dueDate"
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                    required
                    @change="updateManualTaxForm({
                          ...manualTaxForm,
                          dueDate: eventValue($event),
                        })"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">{{
                    manualTaxSourceLabel()
                  }}</label
                  ><select
                    :value="manualTaxForm.sourceId"
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold text-[#243650] outline-none focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                    required
                    @change="applyManualTaxSource(eventValue($event))"
                  >
                    <option value="">Pilih dari data yang sudah ada</option>
                    <option
                      v-for="option in manualTaxSourceOptions()"
                      :key="option.id"
                      :value="option.id"
                    >
                      {{ option.label }} - {{ option.description }}
                    </option>
                  </select>
                  <p
                    v-if="manualTaxSourceOptions().length === 0"
                    class="text-[10px] leading-4 text-rose-600"
                  >
                    Belum ada data sumber untuk {{ manualTaxForm.jenis }}.
                    Buat/posting transaksi terkait terlebih dahulu.
                  </p>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">{{
                    manualTaxIdentityLabel()
                  }}</label
                  ><input
                    type="text"
                    :value="manualTaxForm.subjectIdentity || '-'"
                    readonly
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[12px] font-medium text-[#64748B] outline-none"
                  />
                </div>
                <div class="space-y-1.5 md:col-span-2">
                  <label class="text-[10px] font-medium text-[#7A8CA8]">{{
                    manualTaxSubjectLabel()
                  }}</label
                  ><input
                    type="text"
                    :value="manualTaxForm.subjectName || '-'"
                    readonly
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[12px] font-semibold text-[#243650] outline-none"
                  />
                </div>
                <div class="space-y-1.5 md:col-span-2">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Objek / Keterangan Pajak</label
                  ><input
                    type="text"
                    :value="manualTaxForm.taxObject"
                    readonly
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[12px] font-medium text-[#243650] outline-none"
                  />
                </div>
              </div>
            </section>
            <section class="rounded-2xl border border-[#E6EEF7] bg-white p-3.5">
              <div
                class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p class="text-[12px] font-semibold text-[#102A56]">
                    3. Nominal Pajak
                  </p>
                  <p class="mt-1 text-[11px] text-[#7A8CA8]">
                    Bisa isi nominal langsung atau gunakan kalkulasi sederhana
                    dari dasar pengenaan dan tarif.
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex h-9 items-center justify-center rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3 text-[11px] font-medium text-[#1E5AA8] transition hover:bg-[#EEF5FF]"
                  @click="applySuggestedManualTaxAmount"
                >
                  Gunakan Hasil Hitung
                </button>
              </div>
              <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Dasar Pengenaan (opsional)</label
                  ><div class="currency-input relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#64748B]"
                      >Rp</span
                    ><input
                      type="number"
                      min="0"
                      :value="manualTaxForm.taxBase || ''"
                      :readonly="Boolean(manualTaxForm.sourceId)"
                      placeholder="0"
                      style="padding-left: 2.75rem !important"
                      :class="`h-11 w-full rounded-lg border border-[#DCE7F4] px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10 ${manualTaxForm.sourceId ? 'bg-[#F8FBFE]' : 'bg-white'}`"
                      @change="updateManualTaxForm({
                            ...manualTaxForm,
                            taxBase: Number(eventValue($event)),
                          })"
                    />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Tarif (%) (opsional)</label
                  ><input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    :value="manualTaxForm.rate || ''"
                    placeholder="0"
                    class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                    @change="updateManualTaxForm({
                          ...manualTaxForm,
                          rate: Number(eventValue($event)),
                        })"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-medium text-[#7A8CA8]"
                    >Nominal Pajak</label
                  ><div class="currency-input relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1E5AA8]"
                      >Rp</span
                    ><input
                      type="number"
                      min="1"
                      :value="manualTaxForm.nominal || ''"
                      :readonly="isExistingTaxSourceSelected()"
                      placeholder="Wajib diisi"
                      style="padding-left: 2.75rem !important"
                      class="h-11 w-full rounded-lg border border-[#1E5AA8] bg-[#F7FBFF] px-3 text-[12px] font-semibold text-[#102A56] outline-none placeholder:text-[#8EA7C3] focus:ring-4 focus:ring-[#1E5AA8]/10"
                      required
                      @change="updateManualTaxForm({
                            ...manualTaxForm,
                            nominal: Number(eventValue($event)),
                          })"
                    />
                  </div>
                </div>
              </div>
              <div
                class="mt-3 flex flex-col gap-1 rounded-xl bg-[#F7FBFF] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span class="text-[11px] text-[#6B7A90]"
                  >Saran dari dasar × tarif</span
                ><strong class="text-sm text-[#1E5AA8]">{{
                  formatRupiah(suggestedManualTaxAmount())
                }}</strong>
              </div>
            </section>
            <section class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="space-y-1.5">
                <label class="text-[10px] font-medium text-[#7A8CA8]"
                  >Nomor Referensi (opsional)</label
                ><input
                  type="text"
                  :value="manualTaxForm.reference"
                  placeholder="e-Billing, nomor bukti potong, atau referensi internal"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                  @change="updateManualTaxForm({
                        ...manualTaxForm,
                        reference: eventValue($event),
                      })"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-medium text-[#7A8CA8]"
                  >Catatan Tambahan (opsional)</label
                ><input
                  type="text"
                  :value="manualTaxForm.notes"
                  placeholder="Contoh: Dokumen pendukung tersimpan pada folder pajak"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-medium text-[#243650] outline-none placeholder:text-[#A5B3C6] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
                  @change="updateManualTaxForm({
                        ...manualTaxForm,
                        notes: eventValue($event),
                      })"
                />
              </div>
            </section>
            <div
              class="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-800"
            >
              Tarif tidak dipaksakan oleh sistem. Pastikan objek pajak, tarif,
              dan dokumen pendukung sudah direview oleh Finance sebelum
              kewajiban diterbitkan.
            </div>
            <div
              class="sticky bottom-0 z-20 -mx-5 flex flex-col-reverse gap-2 border-t border-[#E8EEF7] bg-white px-5 pb-1 pt-3 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6"
            >
              <button
                type="button"
                class="h-10 rounded-lg border border-[#DCE7F4] bg-white px-4 text-[12px] font-medium text-[#64748B] transition hover:bg-[#F8FBFE]"
                @click="closeManualTaxModal"
              >
                Batal</button
              ><button
                id="btn-save-tax-manual"
                type="submit"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
              >
                <Save class="h-4 w-4" /><template
                  v-if="isExistingTaxSourceSelected()"
                  >Gunakan Kewajiban Terpilih</template
                ><template v-else>Simpan &amp; Terbitkan Kewajiban</template>
              </button>
            </div>
          </form>
        </div>
      </div></Teleport
    ><!-- 5. TAX SSP SETTLEMENT MODAL -->
    <Teleport v-if="isTaxPayModalOpen" to="body">
    <div
      class="tax-payment-modal-layer fixed inset-0 flex items-center justify-center bg-[#000]/50 p-4"
      :style="{ zIndex: 2147483000 }"
    >
      <div
        class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div
          class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center"
        >
          <div>
            <h3 class="font-extrabold text-sm text-[#0B1F4A]">
              Catat Setoran Pajak Internal
            </h3>
            <span class="text-[10px] text-slate-400"
              >Simpan bukti setoran dari kanal resmi secara internal</span
            >
          </div>
          <button
            id="btn-close-tax"
            class="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            @click="updateIsTaxPayModalOpen(false)"
          >
            Batal
          </button>
        </div>
        <form class="p-6 space-y-4 text-xs" @submit.prevent>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700"
              >Pilih Kewajiban Pajak Outstanding</label
            ><select
              id="tax-form-select"
              :value="selectedTaxId"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs"
              @change="updateSelectedTaxId(eventValue($event))"
            >
              <option value="">-- Pilih Masa Pajak --</option>
              <option
                v-for="t in outstandingTaxes"
                :key="t.id"
                :value="t.id"
              >
                {{ t.jenis }} - Masa {{ t.masaPajak }} ({{
                  formatRupiah(t.nominal)
                }})
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700"
              >Sumber Dana Rekening Kas &amp; Bank</label
            ><select
              id="tax-form-bank"
              :value="taxPaymentAccount"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs"
              @change="updateTaxPaymentAccount(eventValue($event))"
            >
              <option
                v-for="a in assetAccounts"
                :key="a.id"
                :value="a.kode"
              >
                {{ a.kode }} - {{ a.nama }}
              </option>
            </select>
          </div>
          <div
            class="bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-500 text-[10px] space-y-1 leading-relaxed"
          >
            <p class="font-bold text-slate-700">Catatan Integrasi DJP:</p>
            <p>
              FinStart belum terintegrasi langsung ke Bank Persepsi/DJP. Lakukan
              pembayaran melalui kanal resmi, lalu masukkan NTPN atau nomor
              bukti setoran pada data pajak bila tersedia.
            </p>
          </div>
          <p
            v-if="taxPaymentError"
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] font-semibold text-rose-700"
          >
            {{ taxPaymentError }}
          </p>
          <button
            id="btn-tax-submit"
            type="button"
            :disabled="!selectedTaxId || isTaxPaymentSubmitting"
            class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2"
            @click="handlePayTax"
          >
            <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" />
            {{ isTaxPaymentSubmitting ? "Mencatat Pembayaran..." : "Catat Pembayaran Pajak" }}
          </button>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  Users,
  ShieldCheck,
  HeartPulse,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Calculator,
  FileText,
  RefreshCw,
  X,
  Save,
  UserCircle,
  Eye,
  Pencil,
  Trash2,
  Building2,
  BriefcaseBusiness,
  Power,
  History,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Pegawai, AkunBukuBesar } from "../types.ts";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import SdmField from "./sdm/SdmField.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface SdmDanPajakProps {
  activeSection: "sdm" | "perpajakan";
  pegawai: Pegawai[];
  akun: AkunBukuBesar[];
  taxes: PajakKewajiban[];
  taxSummary?: any;
  taxCalculationData?: any;
}
interface PajakKewajiban {
  id: string;
  jenis:
    | "PPN"
    | "PPh 21"
    | "PPh 23"
    | "PPh 25"
    | "PPh Final"
    | "PPh Badan"
    | "Lainnya";
  masaPajak: string;
  nominal: number;
  jatuhTempo: string;
  status: "Belum Setor" | "Sudah Setor";
  ntpn?: string;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentPayrollPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function currentTaxDueDate() {
  const period = currentPayrollPeriod();
  const [year, month] = period.split("-").map(Number);
  const due = new Date(year, month, 10);
  return due.toISOString().slice(0, 10);
}

function formatPeriodLabel(period: string) {
  const [year, month] = String(period || "")
    .split("-")
    .map(Number);
  if (!year || !month) return period || "—";
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function recentTaxPeriods(count = 12) {
  const result: string[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let index = 0; index < count; index += 1) {
    result.push(
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
    );
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return result;
}

function asNumber(value: any) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function maskValue(value: any, visible = 4) {
  const text = String(value || "").trim();
  if (!text) return "—";
  if (text.length <= visible) return text;
  return `${"•".repeat(Math.max(4, text.length - visible))}${text.slice(-visible)}`;
}

const props = defineProps<SdmDanPajakProps>();
const {
  activeSection,
  pegawai,
  taxSummary,
  taxCalculationData,
}: SdmDanPajakProps = props;

const {
  notify,
  refreshData,
  tax: { createTax, payTax },
} = useFinStartContext();
const activeTab = ref(activeSection === "sdm" ? "sdm" : "pajak");
const searchQuery = ref(""),
  updateSearchQuery = (next) => (searchQuery.value = next);
const taxTableTab = ref("unpaid"),
  updateTaxTableTab = (next) => (taxTableTab.value = next);
const taxTypeFilter = ref("Semua"),
  updateTaxTypeFilter = (next) => (taxTypeFilter.value = next);
const taxSearchQuery = ref(""),
  updateTaxSearchQuery = (next) => (taxSearchQuery.value = next); // Modals toggle
const employeePage = ref(1);
const masterPage = ref(1);
const taxPage = ref(1);
const isBpjsModalOpen = ref(false);
function updateIsBpjsModalOpen(next: boolean) {
  isBpjsModalOpen.value = next;
  if (!next) resetBpjsRateErrors();
}
const isEmployeeModalOpen = ref(false),
  updateIsEmployeeModalOpen = (next) => (isEmployeeModalOpen.value = next);
const isEmployeeSaving = ref(false);
const employeeSaveError = ref("");
const isEmployeeDetailOpen = ref(false),
  updateIsEmployeeDetailOpen = (next) => (isEmployeeDetailOpen.value = next);
const selectedEmployeeDetail = ref<any>(null);
const editingEmployee = ref<any>(null);
const employeeDeleteConfirm = ref<any>(null);
const isMasterDataModalOpen = ref(false);
const isMasterEditorOpen = ref(false);
const masterDataTab = ref<"division" | "position">("division");
const masterSearch = ref("");
const masterBusy = ref(false);
const editingMasterData = ref<any>(null);
const masterDeleteConfirm = ref<{
  item: any;
  type: "division" | "position";
} | null>(null);
const masterDataForm = ref({
  id: "",
  type: "division" as "division" | "position",
  code: "",
  name: "",
  description: "",
  status: "active",
  divisionId: "",
});
const isPayrollModalOpen = ref(false),
  updateIsPayrollModalOpen = (next) => (isPayrollModalOpen.value = next);
const isPayrollHistoryOpen = ref(false);
const isTaxPayModalOpen = ref(false),
  updateIsTaxPayModalOpen = (next) => (isTaxPayModalOpen.value = next);
const isTaxManualModalOpen = ref(false),
  updateIsTaxManualModalOpen = (next) => (isTaxManualModalOpen.value = next);
const payslipPreview = ref<any>(null);

const isAnySdmModalOpen = computed(
  () =>
    isBpjsModalOpen.value ||
    isEmployeeModalOpen.value ||
    isMasterDataModalOpen.value ||
    isPayrollModalOpen.value ||
    isPayrollHistoryOpen.value ||
    isTaxPayModalOpen.value ||
    isTaxManualModalOpen.value ||
    Boolean(payslipPreview.value),
);

watch(
  isAnySdmModalOpen,
  (isOpen) => {
    document.documentElement.classList.toggle("sdm-modal-open", isOpen);
  },
  { flush: "sync" },
);

onUnmounted(() => {
  document.documentElement.classList.remove("sdm-modal-open");
});
const pph21Estimate = ref<any>(null);

function openEmployeeDetail(employee: any) {
  selectedEmployeeDetail.value = employee;
  updateIsEmployeeDetailOpen(true);
}

function closeEmployeeDetail() {
  selectedEmployeeDetail.value = null;
  updateIsEmployeeDetailOpen(false);
}

function employeeDetailSource() {
  return (
    selectedEmployeeDetail.value?._raw || selectedEmployeeDetail.value || {}
  );
}
const taxCalculation = ref({
    period: currentPayrollPeriod(),
    jenis: "PPh 21" as PajakKewajiban["jenis"],
    base: "Pendapatan",
    rate: 2,
    dueDate: currentTaxDueDate(),
  }),
  updateTaxCalculation = (next) => (taxCalculation.value = next);
const manualTaxForm = ref({
  jenis: "PPh 21" as PajakKewajiban["jenis"],
  period: currentPayrollPeriod(),
  sourceId: "",
  subjectName: "",
  subjectIdentity: "",
  taxObject: "Gaji, upah, honorarium, atau imbalan",
  taxBase: 0,
  rate: 0,
  nominal: 0,
  dueDate: "",
  reference: "",
  notes: "",
});
const updateManualTaxForm = (next: any) => {
  manualTaxForm.value = next;
};

const manualTaxOptions: Array<{
  value: PajakKewajiban["jenis"];
  label: string;
  hint: string;
  defaultObject: string;
}> = [
  {
    value: "PPh 21",
    label: "PPh 21",
    hint: "Pemotongan atas gaji, upah, honorarium, atau imbalan orang pribadi.",
    defaultObject: "Gaji, upah, honorarium, atau imbalan",
  },
  {
    value: "PPh 23",
    label: "PPh 23",
    hint: "Pemotongan atas jasa, sewa selain tanah/bangunan, atau penghasilan tertentu.",
    defaultObject: "Jasa / sewa / penghasilan pihak ketiga",
  },
  {
    value: "PPh 25",
    label: "PPh 25",
    hint: "Angsuran PPh badan pada masa pajak berjalan.",
    defaultObject: "Angsuran PPh badan",
  },
  {
    value: "PPh Final",
    label: "PPh Final",
    hint: "Pajak penghasilan final sesuai objek penghasilan.",
    defaultObject: "Objek penghasilan final",
  },
  {
    value: "PPh Badan",
    label: "PPh Badan",
    hint: "Kewajiban pajak penghasilan badan.",
    defaultObject: "Penghasilan kena pajak badan",
  },
  {
    value: "PPN",
    label: "PPN",
    hint: "Koreksi atau kewajiban PPN manual bila diperlukan.",
    defaultObject: "Koreksi PPN masa",
  },
  {
    value: "Lainnya",
    label: "Pajak Lainnya",
    hint: "Gunakan untuk jenis pajak lain yang belum tersedia.",
    defaultObject: "Objek pajak lainnya",
  },
];

const manualTaxSubjectLabel = () => {
  if (manualTaxForm.value.jenis === "PPh 21")
    return "Nama Pegawai / Penerima Penghasilan";
  if (manualTaxForm.value.jenis === "PPh 23")
    return "Nama Vendor / Penerima Penghasilan";
  return "Pihak Terkait (opsional)";
};

const manualTaxIdentityLabel = () => {
  if (manualTaxForm.value.jenis === "PPh 21")
    return "NIK / NPWP Pegawai (opsional)";
  if (manualTaxForm.value.jenis === "PPh 23")
    return "NPWP / NIK Vendor (opsional)";
  return "NPWP / Referensi Pihak Terkait (opsional)";
};

const suggestedManualTaxAmount = () => {
  const taxBase = asNumber(manualTaxForm.value.taxBase);
  const rate = asNumber(manualTaxForm.value.rate);

  return Math.round((taxBase * rate) / 100);
};

const applySuggestedManualTaxAmount = () => {
  const amount = suggestedManualTaxAmount();

  if (amount <= 0) {
    notify("Isi dasar pengenaan dan tarif terlebih dahulu.");
    return;
  }

  updateManualTaxForm({
    ...manualTaxForm.value,
    nominal: amount,
  });
};

const selectManualTaxTypeValue = (value: string) => {
  selectManualTaxType(value as PajakKewajiban["jenis"]);
};

const selectManualTaxType = (type: PajakKewajiban["jenis"]) => {
  const selected = manualTaxOptions.find((item) => item.value === type);

  updateManualTaxForm({
    ...manualTaxForm.value,
    jenis: type,
    sourceId: "",
    subjectName: "",
    subjectIdentity: "",
    taxObject: selected?.defaultObject || "",
    taxBase: 0,
    rate: 0,
    nominal: 0,
    reference: "",
    notes: "",
  });
};

const selectedManualTaxOption = () =>
  manualTaxOptions.find((item) => item.value === manualTaxForm.value.jenis);

const employeeIdentity = (employee: any) => {
  const raw = employee?._raw || {};
  return raw.npwp || raw.nik || "";
};

const employeeTaxBase = (employee: any) => {
  const raw = employee?._raw || {};
  return asNumber(raw.base_salary ?? employee?.gajiBersih);
};

const employeeCode = (employee: any) => {
  const raw = employee?._raw || {};
  return raw.employee_code || employee?.id || "";
};

const employeeTaxOptions = () =>
  pegawai
    .filter(
      (employee: any) =>
        String(
          employee?._raw?.employment_status ||
            employee?._raw?.status ||
            "active",
        ).toLowerCase() !== "inactive",
    )
    .map((employee: any) => ({
      id: `employee:${employee.id}`,
      label: `${employee.nama || "-"}${employee.jabatan ? ` - ${employee.jabatan}` : ""}`,
      description: `${employeeCode(employee) || "Tanpa kode"} · ${formatRupiah(employeeTaxBase(employee))}`,
      employee,
    }));

const existingTaxOptions = () =>
  taxes.value
    .filter((tax: any) => {
      const sameType = tax.jenis === manualTaxForm.value.jenis;
      const openStatus =
        String(tax.status || "").toLowerCase() !== "sudah setor";
      return sameType && openStatus;
    })
    .map((tax: any) => ({
      id: `tax:${tax.id}`,
      label: `${tax.jenis} masa ${tax.masaPajak}`,
      description: `${formatRupiah(asNumber(tax.nominal))} · jatuh tempo ${tax.jatuhTempo || "-"}`,
      tax,
    }));

const financialTaxOptions = () =>
  [
    {
      id: "financial:revenue",
      label: "Pendapatan posted",
      description: formatRupiah(asNumber(taxCalculationData?.revenue)),
      taxObject: "Dasar dari pendapatan posted",
      taxBase: asNumber(taxCalculationData?.revenue),
    },
    {
      id: "financial:expense",
      label: "Beban posted",
      description: formatRupiah(asNumber(taxCalculationData?.expense)),
      taxObject: "Dasar dari beban posted",
      taxBase: asNumber(taxCalculationData?.expense),
    },
    {
      id: "financial:net_profit",
      label: "Laba bersih posted",
      description: formatRupiah(
        Math.max(asNumber(taxCalculationData?.net_profit), 0),
      ),
      taxObject: "Dasar dari laba bersih posted",
      taxBase: Math.max(asNumber(taxCalculationData?.net_profit), 0),
    },
  ].filter((item) => item.taxBase > 0);

const manualTaxSourceOptions = () => {
  if (manualTaxForm.value.jenis === "PPh 21") return employeeTaxOptions();
  if (["PPN", "PPh 23"].includes(manualTaxForm.value.jenis))
    return existingTaxOptions();
  return financialTaxOptions();
};

const manualTaxSourceLabel = () => {
  if (manualTaxForm.value.jenis === "PPh 21") return "Pegawai dari Master Data";
  if (manualTaxForm.value.jenis === "PPh 23")
    return "Kewajiban PPh 23 dari Bill Vendor";
  if (manualTaxForm.value.jenis === "PPN")
    return "Kewajiban PPN dari Penutupan Masa";
  return "Dasar Pajak dari Data Posted";
};

const isExistingTaxSourceSelected = () =>
  String(manualTaxForm.value.sourceId || "").startsWith("tax:");

const applyManualTaxSource = (sourceId: string) => {
  const options = manualTaxSourceOptions();
  const selected: any = options.find((item: any) => item.id === sourceId);

  if (!selected) {
    updateManualTaxForm({
      ...manualTaxForm.value,
      sourceId: "",
      subjectName: "",
      subjectIdentity: "",
      taxBase: 0,
      nominal: 0,
      reference: "",
    });
    return;
  }

  if (selected.employee) {
    const employee = selected.employee;
    updateManualTaxForm({
      ...manualTaxForm.value,
      sourceId,
      subjectName: employee.nama || "",
      subjectIdentity: employeeIdentity(employee),
      taxObject: "Gaji, upah, honorarium, atau imbalan",
      taxBase: employeeTaxBase(employee),
      reference: employeeCode(employee),
    });
    return;
  }

  if (selected.tax) {
    const tax = selected.tax;
    updateManualTaxForm({
      ...manualTaxForm.value,
      sourceId,
      period: tax.masaPajak || manualTaxForm.value.period,
      subjectName: tax._raw?.payroll_employee_name || tax.jenis || "",
      subjectIdentity: tax.ntpn || tax._raw?.tax_number || "",
      taxObject: taxDescription(tax.jenis, tax.masaPajak),
      taxBase: asNumber(tax.nominal),
      nominal: asNumber(tax.nominal),
      dueDate: tax.jatuhTempo || manualTaxForm.value.dueDate,
      reference: `TAX-${tax.id}`,
      notes: tax._raw?.notes || "",
    });
    return;
  }

  updateManualTaxForm({
    ...manualTaxForm.value,
    sourceId,
    subjectName: selected.label,
    subjectIdentity: "",
    taxObject: selected.taxObject,
    taxBase: selected.taxBase,
    nominal:
      manualTaxForm.value.rate > 0
        ? Math.round(
            (selected.taxBase * asNumber(manualTaxForm.value.rate)) / 100,
          )
        : manualTaxForm.value.nominal,
    reference: selected.id,
  });
};

const resetManualTaxForm = () => {
  updateManualTaxForm({
    jenis: "PPh 21",
    period: currentPayrollPeriod(),
    sourceId: "",
    subjectName: "",
    subjectIdentity: "",
    taxObject: "Gaji, upah, honorarium, atau imbalan",
    taxBase: 0,
    rate: 0,
    nominal: 0,
    dueDate: "",
    reference: "",
    notes: "",
  });
};

// BPJS Rate settings in local state
const bpjsKesEmployer = ref(0),
  updateBpjsKesEmployer = (next) => (bpjsKesEmployer.value = next);
const bpjsKesEmployee = ref(0),
  updateBpjsKesEmployee = (next) => (bpjsKesEmployee.value = next);
const bpjsJhtEmployer = ref(0),
  updateBpjsJhtEmployer = (next) => (bpjsJhtEmployer.value = next);
const bpjsJhtEmployee = ref(0),
  updateBpjsJhtEmployee = (next) => (bpjsJhtEmployee.value = next);
const bpjsJpEmployer = ref(0),
  updateBpjsJpEmployer = (next) => (bpjsJpEmployer.value = next);
const bpjsJpEmployee = ref(0),
  updateBpjsJpEmployee = (next) => (bpjsJpEmployee.value = next);

type BpjsRateFieldKey =
  | "healthCompany"
  | "healthEmployee"
  | "jhtCompany"
  | "jhtEmployee"
  | "jpCompany"
  | "jpEmployee";

const emptyBpjsRateErrors = (): Record<BpjsRateFieldKey, string> => ({
  healthCompany: "",
  healthEmployee: "",
  jhtCompany: "",
  jhtEmployee: "",
  jpCompany: "",
  jpEmployee: "",
});

const bpjsRateErrors = ref<Record<BpjsRateFieldKey, string>>(
  emptyBpjsRateErrors(),
);

const bpjsRateFields: Array<{
  key: BpjsRateFieldKey;
  id: string;
  label: string;
}> = [
  {
    key: "healthCompany",
    id: "bpjs-kes-employer",
    label: "Porsi perusahaan BPJS Kesehatan",
  },
  {
    key: "healthEmployee",
    id: "bpjs-kes-employee",
    label: "Porsi pegawai BPJS Kesehatan",
  },
  {
    key: "jhtCompany",
    id: "bpjs-jht-employer",
    label: "JHT perusahaan",
  },
  {
    key: "jhtEmployee",
    id: "bpjs-jht-employee",
    label: "JHT pegawai",
  },
  {
    key: "jpCompany",
    id: "bpjs-jp-employer",
    label: "JP perusahaan",
  },
  {
    key: "jpEmployee",
    id: "bpjs-jp-employee",
    label: "JP pegawai",
  },
];

const bpjsRateErrorMessages = computed(() =>
  Object.values(bpjsRateErrors.value).filter(Boolean),
);

const divisions = ref<any[]>([]);
const positions = ref<any[]>([]);
const payrollAccounts = ref<any[]>([]);
const payrollSummary = ref<any>({
  payroll_count: 0,
  total_base_salary: 0,
  total_employee_bpjs_deduction: 0,
  total_employer_bpjs_contribution: 0,
  total_net_pay: 0,
});
const payrollHistory = ref<any[]>([]);
const employeeForm = ref({
    nama: "",
    nip: "",
    nik: "",
    email: "",
    whatsapp: "",
    npwp: "",
    jabatan: "",
    departemen: "",
    divisionId: "",
    positionId: "",
    statusKontrak: "Karyawan Tetap",
    employmentStatus: "active",
    tanggalBergabung: new Date().toISOString().slice(0, 10),
    bpjsKesehatanNo: "",
    bpjsKesehatanTipe: "PPU (Penerima Upah)",
    bpjsKesehatanKelas: "Kelas 1",
    bpjsKetenagakerjaanNo: "",
    ptkpStatus: "TK/0",
    gajiPokok: 0,
    bankNama: "",
    noRekening: "",
  }),
  updateEmployeeForm = (next) => (employeeForm.value = next);

type EmployeeFormFieldKey =
  | "nama"
  | "nip"
  | "nik"
  | "email"
  | "whatsapp"
  | "npwp"
  | "divisionId"
  | "positionId"
  | "statusKontrak"
  | "employmentStatus"
  | "tanggalBergabung"
  | "bpjsKesehatanNo"
  | "bpjsKetenagakerjaanNo"
  | "ptkpStatus"
  | "gajiPokok"
  | "bankNama"
  | "noRekening";

const emptyEmployeeFormErrors = (): Record<EmployeeFormFieldKey, string> => ({
  nama: "",
  nip: "",
  nik: "",
  email: "",
  whatsapp: "",
  npwp: "",
  divisionId: "",
  positionId: "",
  statusKontrak: "",
  employmentStatus: "",
  tanggalBergabung: "",
  bpjsKesehatanNo: "",
  bpjsKetenagakerjaanNo: "",
  ptkpStatus: "",
  gajiPokok: "",
  bankNama: "",
  noRekening: "",
});

const employeeFormErrors = ref<Record<EmployeeFormFieldKey, string>>(
  emptyEmployeeFormErrors(),
);

const employeeRequiredFields: Array<{
  key: EmployeeFormFieldKey;
  id: string;
  label: string;
  type?: "text" | "number" | "email";
  inDetails?: boolean;
}> = [
  { key: "nama", id: "employee-name", label: "Nama lengkap" },
  { key: "nik", id: "employee-nik", label: "NIK" },
  { key: "divisionId", id: "employee-division", label: "Divisi" },
  { key: "positionId", id: "employee-position", label: "Jabatan" },
  {
    key: "statusKontrak",
    id: "employee-contract-status",
    label: "Status kerja",
  },
  {
    key: "employmentStatus",
    id: "employee-employment-status",
    label: "Status pegawai",
  },
  { key: "ptkpStatus", id: "employee-ptkp-status", label: "Status PTKP" },
  {
    key: "tanggalBergabung",
    id: "employee-join-date",
    label: "Tanggal bergabung",
  },
  {
    key: "gajiPokok",
    id: "employee-base-salary",
    label: "Gaji pokok",
    type: "number",
  },
];

const employeeFormErrorMessages = computed(() =>
  Object.values(employeeFormErrors.value).filter(Boolean),
);

function resetEmployeeFormErrors() {
  employeeFormErrors.value = emptyEmployeeFormErrors();
}

function clearEmployeeFormError(key: EmployeeFormFieldKey) {
  if (!employeeFormErrors.value[key]) return;
  employeeFormErrors.value = {
    ...employeeFormErrors.value,
    [key]: "",
  };
}

function setEmployeeField(
  key: keyof typeof employeeForm.value,
  value: string | number,
) {
  updateEmployeeForm({
    ...employeeForm.value,
    [key]: value,
  });
  if (key in employeeFormErrors.value)
    clearEmployeeFormError(key as EmployeeFormFieldKey);
}

function setEmployeeDivision(value: string) {
  updateEmployeeForm({
    ...employeeForm.value,
    divisionId: value,
    positionId: "",
  });
  clearEmployeeFormError("divisionId");
}

function employeeFormValue(key: EmployeeFormFieldKey) {
  return employeeForm.value[key];
}

function validateEmployeeForm() {
  const nextErrors = emptyEmployeeFormErrors();

  for (const field of employeeRequiredFields) {
    if (field.key === "employmentStatus" && !editingEmployee.value) continue;

    const value = employeeFormValue(field.key);
    const normalizedValue = String(value ?? "").trim();

    if (!normalizedValue) {
      nextErrors[field.key] = `${field.label} wajib diisi.`;
      continue;
    }

    if (
      field.type === "number" &&
      (!Number.isFinite(Number(value)) || Number(value) <= 0)
    ) {
      nextErrors[field.key] = `${field.label} harus lebih dari 0.`;
    }

    if (
      field.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)
    ) {
      nextErrors[field.key] = `${field.label} harus valid.`;
    }
  }

  employeeFormErrors.value = nextErrors;
  const firstInvalidField = employeeRequiredFields.find(
    (field) => nextErrors[field.key],
  );

  if (firstInvalidField) {
    if (firstInvalidField.inDetails) {
      const details = document.getElementById(
        "employee-extra-details",
      ) as HTMLDetailsElement | null;
      if (details) details.open = true;
    }
    requestAnimationFrame(() => {
      const target = document.getElementById(firstInvalidField.id);
      target?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      target?.focus();
    });
    return false;
  }

  return true;
}

const payrollForm = ref({
  employeeId: "",
  payrollPeriod: currentPayrollPeriod(),
  paymentDate: todayIso(),
  cashAccountId: "",
  overtimeAmount: 0,
  allowanceAmount: 0,
  bonusAmount: 0,
  loanDeduction: 0,
  otherDeduction: 0,
  pph21ManualAmount: 0,
});

type PayrollFormFieldKey =
  | "employeeId"
  | "payrollPeriod"
  | "paymentDate"
  | "cashAccountId"
  | "overtimeAmount"
  | "allowanceAmount"
  | "bonusAmount"
  | "loanDeduction"
  | "otherDeduction"
  | "pph21ManualAmount";

const emptyPayrollFormErrors = (): Record<PayrollFormFieldKey, string> => ({
  employeeId: "",
  payrollPeriod: "",
  paymentDate: "",
  cashAccountId: "",
  overtimeAmount: "",
  allowanceAmount: "",
  bonusAmount: "",
  loanDeduction: "",
  otherDeduction: "",
  pph21ManualAmount: "",
});

const payrollFormErrors = ref<Record<PayrollFormFieldKey, string>>(
  emptyPayrollFormErrors(),
);

const payrollRequiredFields: Array<{
  key: PayrollFormFieldKey;
  id: string;
  label: string;
  type?: "number";
}> = [
  { key: "employeeId", id: "payroll-employee", label: "Pegawai" },
  { key: "payrollPeriod", id: "payroll-period", label: "Periode payroll" },
  {
    key: "paymentDate",
    id: "payroll-payment-date",
    label: "Tanggal bayar",
  },
  { key: "overtimeAmount", id: "payroll-overtime", label: "Lembur", type: "number" },
  {
    key: "allowanceAmount",
    id: "payroll-allowance",
    label: "Tunjangan",
    type: "number",
  },
  { key: "bonusAmount", id: "payroll-bonus", label: "Bonus", type: "number" },
  {
    key: "loanDeduction",
    id: "payroll-loan-deduction",
    label: "Kasbon",
    type: "number",
  },
  {
    key: "otherDeduction",
    id: "payroll-other-deduction",
    label: "Potongan lain",
    type: "number",
  },
  {
    key: "pph21ManualAmount",
    id: "payroll-pph21-manual",
    label: "PPh 21 manual",
    type: "number",
  },
  {
    key: "cashAccountId",
    id: "payroll-source-bank",
    label: "Sumber rekening dana payout",
  },
];

const payrollFormErrorMessages = computed(() =>
  Object.values(payrollFormErrors.value).filter(Boolean),
);

function resetPayrollFormErrors() {
  payrollFormErrors.value = emptyPayrollFormErrors();
}

function clearPayrollFormError(key: PayrollFormFieldKey) {
  if (!payrollFormErrors.value[key]) return;
  payrollFormErrors.value = {
    ...payrollFormErrors.value,
    [key]: "",
  };
}

function setPayrollField(
  key: keyof typeof payrollForm.value,
  value: string | number,
) {
  payrollForm.value = {
    ...payrollForm.value,
    [key]: value,
  };
  if (key in payrollFormErrors.value)
    clearPayrollFormError(key as PayrollFormFieldKey);
}

function validatePayrollForm(includeEmployee = true) {
  const nextErrors = emptyPayrollFormErrors();

  for (const field of payrollRequiredFields) {
    if (field.key === "employeeId" && !includeEmployee) continue;

    const value = payrollForm.value[field.key];
    const normalizedValue = String(value ?? "").trim();

    if (!normalizedValue) {
      nextErrors[field.key] = `${field.label} wajib diisi.`;
      continue;
    }

    if (
      field.type === "number" &&
      (!Number.isFinite(Number(value)) || Number(value) < 0)
    ) {
      nextErrors[field.key] = `${field.label} harus berupa angka 0 atau lebih.`;
    }
  }

  payrollFormErrors.value = nextErrors;
  const firstInvalidField = payrollRequiredFields.find(
    (field) => nextErrors[field.key],
  );

  if (firstInvalidField) {
    requestAnimationFrame(() => {
      const target = document.getElementById(firstInvalidField.id);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
    });
    return false;
  }

  return true;
}

// Kewajiban pajak berasal dari database melalui API.
const taxes = ref<any[]>(props.taxes || []);
watch(
  () => props.taxes,
  (next) => {
    taxes.value = Array.isArray(next) ? next : [];
  },
  { deep: true },
);
const selectedTaxId = ref(""),
  updateSelectedTaxId = (next) => (selectedTaxId.value = next);
const taxPaymentAccount = ref("1001"),
  updateTaxPaymentAccount = (next) => (taxPaymentAccount.value = next); // Submit tax settlement
const isTaxPaymentSubmitting = ref(false);
const taxPaymentError = ref("");
const handlePayTax = async () => {
  if (isTaxPaymentSubmitting.value) return;
  const targetTax = taxes.value.find((t) => t.id === selectedTaxId.value);
  if (!targetTax) {
    taxPaymentError.value = "Kewajiban pajak yang dipilih tidak ditemukan.";
    return;
  }
  taxPaymentError.value = "";
  isTaxPaymentSubmitting.value = true;
  try {
    const paid = await payTax(targetTax, {
      accountCode: taxPaymentAccount.value,
      paymentDate: new Date().toISOString().split("T")[0],
      taxNumber: targetTax.ntpn || "",
      notes: "",
    });
    if (paid) {
      updateSelectedTaxId("");
      updateIsTaxPayModalOpen(false);
    } else {
      taxPaymentError.value =
        "Setoran belum tersimpan. Periksa pesan sistem, akun bank, dan jurnal kewajiban pajak.";
    }
  } finally {
    isTaxPaymentSubmitting.value = false;
  }
};

const handleSaveManualTax = async (event: Event) => {
  event.preventDefault();

  const nominal =
    asNumber(manualTaxForm.value.nominal) || suggestedManualTaxAmount();
  const jenis = manualTaxForm.value.jenis;
  const subjectName = String(manualTaxForm.value.subjectName || "").trim();
  const sourceId = String(manualTaxForm.value.sourceId || "");

  if (!manualTaxForm.value.dueDate || nominal <= 0) {
    notify("Isi nominal pajak dan tanggal jatuh tempo terlebih dahulu.");
    return;
  }

  if (jenis === "PPh 21" && !sourceId.startsWith("employee:")) {
    notify("Pilih pegawai dari master data terlebih dahulu.");
    return;
  }

  if (["PPN", "PPh 23"].includes(jenis)) {
    if (!sourceId.startsWith("tax:")) {
      notify(
        jenis === "PPN"
          ? "Pilih kewajiban PPN hasil penutupan masa yang sudah tersedia."
          : "Pilih kewajiban PPh 23 dari tagihan vendor yang sudah tersedia.",
      );
      return;
    }

    updateTaxTableTab("unpaid");
    updateIsTaxManualModalOpen(false);
    resetManualTaxForm();
    notify(
      `${jenis} yang dipilih sudah tersedia di daftar kewajiban pajak. Lanjutkan dari tombol Setor/Bayar pajak.`,
    );
    return;
  }

  const detailNotes = [
    manualTaxForm.value.taxObject
      ? `Objek: ${manualTaxForm.value.taxObject}.`
      : "",
    subjectName ? `Pihak: ${subjectName}.` : "",
    manualTaxForm.value.subjectIdentity
      ? `Identitas: ${manualTaxForm.value.subjectIdentity}.`
      : "",
    asNumber(manualTaxForm.value.taxBase) > 0
      ? `Dasar: ${asNumber(manualTaxForm.value.taxBase)}.`
      : "",
    asNumber(manualTaxForm.value.rate) > 0
      ? `Tarif input: ${asNumber(manualTaxForm.value.rate)}%.`
      : "",
    manualTaxForm.value.reference
      ? `Referensi: ${manualTaxForm.value.reference}.`
      : "",
    manualTaxForm.value.notes || "",
  ]
    .filter(Boolean)
    .join(" ");

  await createTax({
    jenis,
    masaPajak: manualTaxForm.value.period,
    nominal,
    jatuhTempo: manualTaxForm.value.dueDate,
    catatan: detailNotes,
  });

  updateTaxTableTab("unpaid");
  updateIsTaxManualModalOpen(false);
  resetManualTaxForm();
};

async function refreshMasterData() {
  const period = payrollForm.value.payrollPeriod || currentPayrollPeriod();
  const jobs = await Promise.allSettled([
    financeApi.get("/divisions"),
    financeApi.get("/positions"),
    financeApi.get("/bpjs-config"),
    financeApi.get("/payroll/summary", { period }),
    financeApi.get("/payroll/accounts"),
    financeApi.get("/payroll"),
  ]);

  const value = (index: number, fallback: any) =>
    jobs[index].status === "fulfilled"
      ? (jobs[index] as PromiseFulfilledResult<any>).value
      : fallback;

  divisions.value = Array.isArray(value(0, [])) ? value(0, []) : [];
  positions.value = Array.isArray(value(1, [])) ? value(1, []) : [];

  const bpjs = value(2, {});
  updateBpjsKesEmployer(asNumber(bpjs.health_company_rate));
  updateBpjsKesEmployee(asNumber(bpjs.health_employee_rate));
  updateBpjsJhtEmployer(asNumber(bpjs.jht_company_rate));
  updateBpjsJhtEmployee(asNumber(bpjs.jht_employee_rate));
  updateBpjsJpEmployer(asNumber(bpjs.jp_company_rate));
  updateBpjsJpEmployee(asNumber(bpjs.jp_employee_rate));

  Object.assign(payrollSummary.value, value(3, {}));
  payrollAccounts.value = Array.isArray(value(4, [])) ? value(4, []) : [];
  payrollHistory.value = Array.isArray(value(5, [])) ? value(5, []) : [];

  if (!payrollForm.value.employeeId && pegawai.length) {
    payrollForm.value.employeeId = String(pegawai[0]?._raw?.id || "");
  }
  if (!payrollForm.value.cashAccountId && payrollAccounts.value.length) {
    payrollForm.value.cashAccountId = String(payrollAccounts.value[0].id);
  }

  const failed = jobs.find((job) => job.status === "rejected") as
    PromiseRejectedResult | undefined;
  if (failed) {
    console.error(failed.reason);
    notify(
      getApiErrorMessage(
        failed.reason,
        "Sebagian data SDM belum dapat dimuat.",
      ),
    );
  }
}

async function refreshAllData() {
  await refreshMasterData();
  await refreshData();
}

function masterEndpoint(type: "division" | "position") {
  return type === "division" ? "/divisions" : "/positions";
}

function masterLabel(type = masterDataTab.value) {
  return type === "division" ? "Divisi" : "Jabatan";
}

function resetMasterDataForm(
  type: "division" | "position" = masterDataTab.value,
  openEditor = true,
) {
  editingMasterData.value = null;
  masterDataForm.value = {
    id: "",
    type,
    code: "",
    name: "",
    description: "",
    status: "active",
    divisionId: "",
  };
  isMasterEditorOpen.value = openEditor;
}

async function openMasterData(type: "division" | "position" = "division") {
  masterDataTab.value = type;
  masterSearch.value = "";
  resetMasterDataForm(type, false);
  isMasterDataModalOpen.value = true;
  try {
    await refreshMasterData();
  } catch (error) {
    notify(getApiErrorMessage(error, "Data master SDM belum dapat dimuat."));
  }
}

function changeMasterTab(type: "division" | "position") {
  masterDataTab.value = type;
  masterSearch.value = "";
  resetMasterDataForm(type, false);
}

function closeMasterEditor() {
  isMasterEditorOpen.value = false;
  editingMasterData.value = null;
}

function masterRows() {
  const source =
    masterDataTab.value === "division" ? divisions.value : positions.value;
  const keyword = String(masterSearch.value || "")
    .trim()
    .toLowerCase();
  if (!keyword) return latestFirst(source);
  return latestFirst(
    source.filter((item: any) =>
      [
        item.code,
        item.name,
        item.description,
        item.division_name,
        item.status,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    ),
  );
}

function pagedMasterRows() {
  return pageRows(masterRows(), masterPage.value);
}

function masterUsageCount(item: any) {
  if (masterDataTab.value === "position") {
    return Number(item?.employee_count || 0);
  }

  const linkedPositions = positions.value.filter(
    (position: any) => String(position?.division_id || "") === String(item?.id || ""),
  ).length;
  const positionCount = Math.max(
    Number(item?.position_count || 0),
    linkedPositions,
  );
  const employeeCount = Number(item?.employee_count || 0);

  return Number.isFinite(Number(item?.usage_count))
    ? Math.max(Number(item.usage_count), positionCount + employeeCount)
    : positionCount + employeeCount;
}

function editMasterData(
  item: any,
  type: "division" | "position" = masterDataTab.value,
) {
  editingMasterData.value = item;
  masterDataForm.value = {
    id: String(item.id || ""),
    type,
    code: String(item.code || ""),
    name: String(item.name || ""),
    description: String(item.description || ""),
    status:
      String(item.status || "active").toLowerCase() === "inactive"
        ? "inactive"
        : "active",
    divisionId: type === "position" ? String(item.division_id || "") : "",
  };
  isMasterEditorOpen.value = true;
}

async function saveMasterData(event: Event) {
  event.preventDefault();
  const form = masterDataForm.value;
  const name = String(form.name || "").trim();
  if (!name) {
    notify(`Nama ${masterLabel(form.type).toLowerCase()} wajib diisi.`);
    return;
  }
  masterBusy.value = true;
  try {
    const payload: any = {
      code: String(form.code || "").trim() || undefined,
      name,
      description: String(form.description || "").trim(),
      status: form.status,
    };
    if (form.type === "position")
      payload.division_id = form.divisionId ? Number(form.divisionId) : null;
    if (form.id)
      await financeApi.put(`${masterEndpoint(form.type)}/${form.id}`, payload);
    else await financeApi.post(masterEndpoint(form.type), payload);
    await refreshMasterData();
    notify(
      `${masterLabel(form.type)} berhasil ${form.id ? "diperbarui" : "ditambahkan"}.`,
    );
    resetMasterDataForm(form.type, false);
    isMasterEditorOpen.value = false;
  } catch (error) {
    console.error(error);
    notify(
      getApiErrorMessage(
        error,
        `Gagal menyimpan ${masterLabel(form.type).toLowerCase()}.`,
      ),
    );
  } finally {
    masterBusy.value = false;
  }
}

async function toggleMasterStatus(
  item: any,
  type: "division" | "position" = masterDataTab.value,
) {
  const nextStatus =
    String(item.status || "active").toLowerCase() === "active"
      ? "inactive"
      : "active";
  const name = String(item.name || masterLabel(type));
  const action = nextStatus === "inactive" ? "menonaktifkan" : "mengaktifkan";
  if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} ${name}?`))
    return;
  try {
    await financeApi.patch(`${masterEndpoint(type)}/${item.id}/status`, {
      status: nextStatus,
    });
    await refreshMasterData();
    notify(
      `${masterLabel(type)} berhasil ${nextStatus === "inactive" ? "dinonaktifkan" : "diaktifkan"}.`,
    );
  } catch (error) {
    notify(
      getApiErrorMessage(
        error,
        `Gagal mengubah status ${masterLabel(type).toLowerCase()}.`,
      ),
    );
  }
}

async function deleteMasterData(
  item: any,
  type: "division" | "position" = masterDataTab.value,
) {
  masterDeleteConfirm.value = { item, type };
}

function masterDeleteDivisionPositions(item: any) {
  const divisionId = String(item?.id || "");
  if (!divisionId) return [];
  return positions.value.filter(
    (position: any) => String(position?.division_id || "") === divisionId,
  );
}

function masterDeletePositionCount(item: any) {
  return masterDeleteDivisionPositions(item).length;
}

function masterDeleteEmployeeCount(target: {
  item: any;
  type: "division" | "position";
} | null) {
  if (!target) return 0;
  if (target.type === "position") {
    return Number(target.item?.employee_count || 0);
  }
  return masterDeleteDivisionPositions(target.item).reduce(
    (total: number, position: any) =>
      total + Number(position?.employee_count || 0),
    0,
  );
}

function masterDeleteHasBlocker(target: {
  item: any;
  type: "division" | "position";
} | null) {
  if (!target) return true;
  if (target.type === "division") {
    return (
      masterDeletePositionCount(target.item) > 0 ||
      masterDeleteEmployeeCount(target) > 0
    );
  }
  return masterDeleteEmployeeCount(target) > 0;
}

function masterDeleteWarningMessage(target: {
  item: any;
  type: "division" | "position";
} | null) {
  if (!target) return "";
  if (target.type === "division") {
    return "Divisi tidak bisa dihapus jika masih memiliki jabatan atau ada pegawai yang memakai jabatan di divisi tersebut.";
  }
  return "Jabatan tidak bisa dihapus jika masih dipakai pegawai.";
}

function closeMasterDeleteConfirm() {
  masterDeleteConfirm.value = null;
}

async function confirmMasterDelete() {
  const target = masterDeleteConfirm.value;
  if (!target) return;
  const { item, type } = target;
  try {
    await financeApi.delete(`${masterEndpoint(type)}/${item.id}`);
    await refreshMasterData();
    if (String(editingMasterData.value?.id || "") === String(item.id))
      resetMasterDataForm(type, false);
    closeMasterDeleteConfirm();
    notify(`${masterLabel(type)} berhasil dihapus.`);
  } catch (error) {
    notify(
      getApiErrorMessage(
        error,
        `${masterLabel(type)} tidak dapat dihapus karena masih digunakan.`,
      ),
    );
  }
}

function resetBpjsRateErrors() {
  bpjsRateErrors.value = emptyBpjsRateErrors();
}

function clearBpjsRateError(key: BpjsRateFieldKey) {
  if (!bpjsRateErrors.value[key]) return;
  bpjsRateErrors.value = {
    ...bpjsRateErrors.value,
    [key]: "",
  };
}

function getBpjsRateInputValue(id: string) {
  return (
    (document.getElementById(id) as HTMLInputElement | null)?.value.trim() || ""
  );
}

function validateBpjsRates() {
  const nextErrors = emptyBpjsRateErrors();

  for (const field of bpjsRateFields) {
    const rawValue = getBpjsRateInputValue(field.id);
    const numericValue = Number(rawValue.replace(",", "."));

    if (!rawValue) {
      nextErrors[field.key] = `${field.label} wajib diisi.`;
    } else if (
      !Number.isFinite(numericValue) ||
      numericValue < 0 ||
      numericValue > 100
    ) {
      nextErrors[field.key] = `${field.label} harus berupa angka 0 sampai 100.`;
    }
  }

  bpjsRateErrors.value = nextErrors;
  const firstInvalidField = bpjsRateFields.find(
    (field) => nextErrors[field.key],
  );

  if (firstInvalidField) {
    requestAnimationFrame(() => {
      const target = document.getElementById(firstInvalidField.id);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
    });
    return false;
  }

  return true;
}

async function handleSaveBpjs(event?: Event) {
  event?.preventDefault();
  if (!validateBpjsRates()) {
    notify("Lengkapi seluruh tarif BPJS sebelum menyimpan.");
    return;
  }

  try {
    await financeApi.put("/bpjs-config", {
      health_company_rate: asNumber(bpjsKesEmployer.value),
      health_employee_rate: asNumber(bpjsKesEmployee.value),
      jht_company_rate: asNumber(bpjsJhtEmployer.value),
      jht_employee_rate: asNumber(bpjsJhtEmployee.value),
      jp_company_rate: asNumber(bpjsJpEmployer.value),
      jp_employee_rate: asNumber(bpjsJpEmployee.value),
      effective_date: todayIso(),
      notes: "Konfigurasi BPJS diperbarui dari workspace FinStart.",
    });
    await refreshMasterData();
    updateIsBpjsModalOpen(false);
    notify("Tarif iuran BPJS berhasil disimpan ke database.");
  } catch (error) {
    console.error(error);
    notify(getApiErrorMessage(error, "Gagal menyimpan konfigurasi BPJS."));
  }
}

function employeeDatabaseId(employee: any) {
  const raw = employee?._raw || employee || {};
  const id = Number(raw.id ?? employee?.dbId ?? employee?.id);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

function resetEmployeeForm() {
  editingEmployee.value = null;
  resetEmployeeFormErrors();
  const defaultDivision =
    divisions.value.find(
      (item: any) => String(item.status || "active").toLowerCase() === "active",
    ) ||
    divisions.value[0] ||
    {};
  const defaultPosition =
    positions.value.find(
      (item: any) =>
        String(item.status || "active").toLowerCase() === "active" &&
        (!item.division_id ||
          String(item.division_id) === String(defaultDivision.id || "")),
    ) ||
    positions.value[0] ||
    {};
  updateEmployeeForm({
    nama: "",
    nip: "",
    nik: "",
    email: "",
    whatsapp: "",
    npwp: "",
    jabatan: "",
    departemen: "",
    divisionId: String(defaultDivision.id || ""),
    positionId: String(defaultPosition.id || ""),
    statusKontrak: "Karyawan Tetap",
    employmentStatus: "active",
    tanggalBergabung: todayIso(),
    bpjsKesehatanNo: "",
    bpjsKesehatanTipe: "PPU (Penerima Upah)",
    bpjsKesehatanKelas: "Kelas 1",
    bpjsKetenagakerjaanNo: "",
    ptkpStatus: "TK/0",
    gajiPokok: 0,
    bankNama: "",
    noRekening: "",
  });
}

async function openEmployeeForm(employee: any = null) {
  employeeSaveError.value = "";
  if (!divisions.value.length || !positions.value.length)
    await refreshMasterData();
  resetEmployeeFormErrors();
  if (!employee) {
    resetEmployeeForm();
    updateIsEmployeeModalOpen(true);
    return;
  }
  const raw = employee._raw || employee;
  editingEmployee.value = employee;
  updateEmployeeForm({
    nama: employee.nama || raw.full_name || raw.name || "",
    nip: raw.employee_code || "",
    nik: raw.nik || "",
    email: raw.email || "",
    whatsapp: raw.phone || "",
    npwp: raw.npwp || "",
    jabatan: employee.jabatan || raw.position_name || "",
    departemen: raw.division_name || "",
    divisionId: String(raw.division_id || ""),
    positionId: String(raw.position_id || ""),
    statusKontrak:
      raw.employment_type === "contract"
        ? "Kontrak"
        : raw.employment_type === "intern"
          ? "Probation"
          : "Karyawan Tetap",
    employmentStatus:
      String(raw.employment_status || raw.status || "active").toLowerCase() ===
      "inactive"
        ? "inactive"
        : "active",
    tanggalBergabung: String(raw.join_date || todayIso()).slice(0, 10),
    bpjsKesehatanNo: raw.bpjs_health_number || "",
    bpjsKesehatanTipe: "PPU (Penerima Upah)",
    bpjsKesehatanKelas: "Kelas 1",
    bpjsKetenagakerjaanNo: raw.bpjs_employment_number || "",
    ptkpStatus: raw.ptkp_status || "TK/0",
    gajiPokok: asNumber(raw.base_salary ?? employee.gajiBersih),
    bankNama: raw.bank_name || "",
    noRekening: raw.bank_account_number || "",
  });
  updateIsEmployeeModalOpen(true);
}

async function handleCreateEmployee() {
  if (isEmployeeSaving.value) return;
  employeeSaveError.value = "";

  if (!validateEmployeeForm()) {
    employeeSaveError.value = "Lengkapi kolom wajib yang masih ditandai.";
    return;
  }

  const divisionId = Number(employeeForm.value.divisionId);
  const positionId = Number(employeeForm.value.positionId);
  if (!divisionId || !positionId) {
    employeeSaveError.value = "Divisi dan jabatan wajib dipilih.";
    return;
  }

  const employmentType =
    employeeForm.value.statusKontrak === "Karyawan Tetap"
      ? "permanent"
      : employeeForm.value.statusKontrak === "Kontrak"
        ? "contract"
        : "intern";

  isEmployeeSaving.value = true;
  try {
    const payload = {
      employee_code: employeeForm.value.nip || undefined,
      full_name: employeeForm.value.nama,
      nik: employeeForm.value.nik,
      email: employeeForm.value.email || "",
      phone: employeeForm.value.whatsapp || "",
      division_id: divisionId,
      position_id: positionId,
      employment_type: employmentType,
      ptkp_status: employeeForm.value.ptkpStatus || "TK/0",
      bpjs_status: "active",
      employment_status: employeeForm.value.employmentStatus || "active",
      join_date: employeeForm.value.tanggalBergabung || todayIso(),
      npwp: employeeForm.value.npwp || "",
      bpjs_health_number: employeeForm.value.bpjsKesehatanNo || "",
      bpjs_employment_number: employeeForm.value.bpjsKetenagakerjaanNo || "",
      bank_name: employeeForm.value.bankNama || "",
      bank_account_number: employeeForm.value.noRekening || "",
      bank_account_holder: employeeForm.value.nama || "",
      base_salary: asNumber(employeeForm.value.gajiPokok),
    };
    const isEditing = Boolean(editingEmployee.value);
    const employeeId = employeeDatabaseId(editingEmployee.value);
    if (isEditing && !employeeId) {
      throw new Error(
        "ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.",
      );
    }
    if (isEditing) await financeApi.put(`/employees/${employeeId}`, payload);
    else await financeApi.post("/employees", payload);

    resetEmployeeForm();
    updateIsEmployeeModalOpen(false);
    await refreshAllData();
    notify(
      isEditing
        ? "Data pegawai berhasil diperbarui."
        : "Pegawai berhasil disimpan ke database.",
    );
  } catch (error) {
    console.error(error);
    employeeSaveError.value = getApiErrorMessage(
      error,
      "Gagal menyimpan pegawai.",
    );
    notify(employeeSaveError.value);
  } finally {
    isEmployeeSaving.value = false;
  }
}

function employeeDisplayName(employee: any = employeeDeleteConfirm.value) {
  return String(
    employee?.nama ||
      employee?._raw?.full_name ||
      employee?._raw?.name ||
      "Pegawai",
  );
}

function employeeDisplayCode(employee: any = employeeDeleteConfirm.value) {
  return String(
    employee?.id ||
      employee?._raw?.employee_code ||
      employee?._raw?.nik ||
      "Kode tidak tersedia",
  );
}

function employeeDisplayStatus(employee: any = employeeDeleteConfirm.value) {
  const status = String(
    employee?.status ||
      employee?._raw?.employment_status ||
      employee?._raw?.status ||
      "active",
  ).toLowerCase();
  return status === "active" || status === "aktif" ? "Aktif" : "Nonaktif";
}

function handleDeleteEmployee(employee: any) {
  const employeeId = employeeDatabaseId(employee);
  if (!employeeId) {
    notify("ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.");
    return;
  }
  employeeDeleteConfirm.value = employee;
}

function closeEmployeeDeleteConfirm() {
  employeeDeleteConfirm.value = null;
}

async function confirmEmployeeDelete() {
  const employee = employeeDeleteConfirm.value;
  const employeeId = employeeDatabaseId(employee);
  if (!employeeId) {
    notify("ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.");
    closeEmployeeDeleteConfirm();
    return;
  }
  try {
    await financeApi.delete(`/employees/${employeeId}`);
    const selectedId = employeeDatabaseId(selectedEmployeeDetail.value);
    if (selectedId === employeeId) closeEmployeeDetail();
    closeEmployeeDeleteConfirm();
    await refreshAllData();
    notify("Pegawai berhasil dihapus dari master data.");
  } catch (error) {
    notify(
      getApiErrorMessage(
        error,
        "Pegawai tidak dapat dihapus. Nonaktifkan pegawai yang sudah memiliki riwayat payroll.",
      ),
    );
  }
}

function selectedPayrollEmployee() {
  return pegawai.find(
    (item: any) =>
      String(item?._raw?.id || "") ===
      String(payrollForm.value.employeeId || ""),
  );
}

async function calculatePayrollPph21() {
  const employee = selectedPayrollEmployee();
  if (!employee)
    return notify(
      "Pilih pegawai terlebih dahulu untuk menghitung estimasi PPh 21.",
    );
  const raw = employee._raw || {};
  try {
    const result = await financeApi.post("/taxes/employee-pph21/calculate", {
      employee_name: employee.nama,
      employee_nik: raw.nik || "",
      employee_position: employee.jabatan || "",
      tax_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
      ptkp_status: raw.ptkp_status || "TK/0",
      base_salary:
        asNumber(raw.base_salary ?? employee.gajiBersih) +
        asNumber(payrollForm.value.overtimeAmount) +
        asNumber(payrollForm.value.bonusAmount),
      allowance_amount: asNumber(payrollForm.value.allowanceAmount),
    });
    pph21Estimate.value = result;
    notify(
      result.needs_final_reconciliation
        ? result.message
        : "Estimasi PPh 21 pegawai berhasil dihitung.",
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menghitung estimasi PPh 21."));
  }
}

function openPayslipPrint() {
  const slip = payslipPreview.value;
  if (!slip) return;
  const popup = window.open("", "_blank", "width=760,height=700");
  if (!popup)
    return notify(
      "Popup diblokir browser. Izinkan popup untuk mencetak payslip.",
    );
  const rows = [
    ["Pegawai", slip.employee_name || "-"],
    ["Periode", slip.payroll_period || "-"],
    ["Tanggal Bayar", slip.payment_date || "-"],
    ["Gaji Pokok", formatRupiah(asNumber(slip.base_salary))],
    ["Lembur", formatRupiah(asNumber(slip.overtime_amount))],
    ["Tunjangan", formatRupiah(asNumber(slip.allowance_amount))],
    ["Bonus", formatRupiah(asNumber(slip.bonus_amount))],
    [
      "Potongan BPJS Pegawai",
      formatRupiah(asNumber(slip.employee_bpjs_deduction)),
    ],
    ["Potongan PPh 21", formatRupiah(asNumber(slip.pph21_amount))],
    ["Potongan Kasbon", formatRupiah(asNumber(slip.loan_deduction))],
    ["Potongan Lain", formatRupiah(asNumber(slip.other_deduction))],
    ["Gaji Bersih", formatRupiah(asNumber(slip.net_pay))],
    ["Voucher", slip.voucher_number || "-"],
  ];
  popup.document.write(
    `<!doctype html><html><head><title>Payslip ${String(slip.employee_name || "").replace(/</g, "")}</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#102A56}table{border-collapse:collapse;width:100%;margin-top:22px}td{padding:10px;border-bottom:1px solid #dce7f4}td:last-child{text-align:right;font-weight:700}.head{border-bottom:2px solid #0b1f4a;padding-bottom:12px}</style></head><body><div class="head"><h2>PT KEDATA INDONESIA DIGITAL</h2><p>Payslip Payroll FinStart</p></div><table>${rows.map((row) => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join("")}</table></body></html>`,
  );
  popup.document.close();
  popup.focus();
  popup.print();
}

function validatePayrollFields(includeEmployee = true) {
  return validatePayrollForm(includeEmployee);
}

async function handleProcessPayroll() {
  if (!validatePayrollFields(true)) {
    notify("Lengkapi seluruh data payroll sebelum memproses.");
    return;
  }
  const employeeId = Number(payrollForm.value.employeeId);
  const cashAccountId = Number(payrollForm.value.cashAccountId);
  if (!employeeId || !cashAccountId) {
    notify("Pilih pegawai dan akun Kas/Bank terlebih dahulu.");
    return;
  }
  try {
    const result = await financeApi.post("/payroll/process", {
      employee_id: employeeId,
      payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
      payment_date: payrollForm.value.paymentDate || todayIso(),
      cash_account_id: cashAccountId,
      overtime_amount: asNumber(payrollForm.value.overtimeAmount),
      allowance_amount: asNumber(payrollForm.value.allowanceAmount),
      bonus_amount: asNumber(payrollForm.value.bonusAmount),
      loan_deduction: asNumber(payrollForm.value.loanDeduction),
      other_deduction: asNumber(payrollForm.value.otherDeduction),
      pph21_amount:
        asNumber(payrollForm.value.pph21ManualAmount) ||
        asNumber(pph21Estimate.value?.pph21_amount),
      notes: "Payroll diproses dari workspace FinStart.",
    });
    try {
      payslipPreview.value = await financeApi.get(
        `/payroll/${result.id}/payslip`,
      );
    } catch {
      payslipPreview.value = result;
    }
    updateIsPayrollModalOpen(false);
    await refreshAllData();
    notify(
      `Payroll ${result.employee_name || "pegawai"} berhasil diposting. Payslip tersedia untuk dicetak.`,
    );
  } catch (error) {
    console.error(error);
    notify(getApiErrorMessage(error, "Gagal memproses payroll."));
  }
}

async function handleProcessPayrollBulk() {
  if (!validatePayrollFields(false)) {
    notify("Lengkapi seluruh data payroll sebelum memproses massal.");
    return;
  }
  const cashAccountId = Number(payrollForm.value.cashAccountId);
  if (!cashAccountId)
    return notify("Pilih akun Kas/Bank sebelum memproses payroll massal.");
  try {
    const result = await financeApi.post("/payroll/process-bulk", {
      payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
      payment_date: payrollForm.value.paymentDate || todayIso(),
      cash_account_id: cashAccountId,
      notes: "Payroll massal diproses dari workspace FinStart.",
    });
    updateIsPayrollModalOpen(false);
    await refreshAllData();
    notify(
      `Payroll massal selesai: ${(result.processed || []).length} pegawai diproses, ${(result.skipped || []).length} dilewati.`,
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memproses payroll massal."));
  }
}

async function downloadPayrollBankTransfer() {
  try {
    const rows = await financeApi.get("/payroll/export/bank-transfer", {
      period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
    });
    const header = [
      "Periode",
      "Tanggal Bayar",
      "Kode Pegawai",
      "Nama Pegawai",
      "Bank",
      "Nomor Rekening",
      "Atas Nama",
      "Nominal",
    ];
    const csv = [
      header,
      ...(rows || []).map((row: any) => [
        row.payroll_period,
        row.payment_date,
        row.employee_code,
        row.employee_name,
        row.bank_name || "",
        row.bank_account_number || "",
        row.bank_account_holder || "",
        asNumber(row.net_pay),
      ]),
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    downloadTextFile(
      `transfer-payroll-${payrollForm.value.payrollPeriod || currentPayrollPeriod()}.csv`,
      csv,
    );
    notify("File transfer bank payroll berhasil dibuat.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal membuat file transfer bank."));
  }
}
const filteredEmployees = computed(() =>
  latestFirst(
    (pegawai || []).filter((p: any) => {
      const raw = p?._raw || {};
      const haystack =
        `${p.nama || raw.full_name || ""} ${p.id || raw.employee_code || ""} ${p.jabatan || raw.position_name || ""} ${raw.division_name || ""} ${raw.employment_status || ""}`.toLowerCase();
      return haystack.includes(searchQuery.value.toLowerCase());
    }),
  ),
);
const pagedEmployees = computed(() =>
  pageRows(filteredEmployees.value, employeePage.value),
);
const totalTaxesOwed = taxes.value
  .filter((t) => t.status === "Belum Setor")
  .reduce((acc, t) => acc + t.nominal, 0);
const overdueTaxCount = taxes.value.filter(
  (t) => t.status === "Belum Setor" && new Date(t.jatuhTempo) < new Date(),
).length;
const getOutstandingTax = (jenis: PajakKewajiban["jenis"]) =>
  taxes.value.find((t) => t.jenis === jenis && t.status === "Belum Setor");
const getOutstandingTaxAmount = (jenis: PajakKewajiban["jenis"]) =>
  taxes.value
    .filter((t) => t.jenis === jenis && t.status === "Belum Setor")
    .reduce((acc, t) => acc + t.nominal, 0);
const formatTaxDate = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const taxDescription = (jenis: PajakKewajiban["jenis"], masaPajak: string) => {
  if (jenis === "PPN") return `Kewajiban atau koreksi PPN masa ${masaPajak}.`;
  if (jenis === "PPh 21")
    return `PPh 21 atas pegawai atau penerima penghasilan periode ${masaPajak}.`;
  if (jenis === "PPh 23")
    return `PPh 23 atas jasa, sewa, atau penghasilan pihak ketiga periode ${masaPajak}.`;
  if (jenis === "PPh 25") return `Angsuran PPh 25 periode ${masaPajak}.`;
  if (jenis === "PPh Final")
    return `PPh Final atas objek penghasilan periode ${masaPajak}.`;
  if (jenis === "PPh Badan") return `Kewajiban PPh Badan periode ${masaPajak}.`;
  return `Kewajiban pajak lainnya periode ${masaPajak}.`;
};
const filteredTaxRows = computed(() =>
  latestFirst(
    taxes.value.filter((tax) => {
      const matchesTab =
        taxTableTab.value === "unpaid"
          ? tax.status === "Belum Setor"
          : tax.status === "Sudah Setor";
      const matchesType =
        taxTypeFilter.value === "Semua" || tax.jenis === taxTypeFilter.value;
      const haystack =
        `${tax.jenis} ${tax.masaPajak} ${tax.status} ${tax.ntpn || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(
        taxSearchQuery.value.toLowerCase(),
      );
      return matchesTab && matchesType && matchesSearch;
    }),
  ),
);
const pagedTaxRows = computed(() =>
  pageRows(filteredTaxRows.value, taxPage.value),
);
const csvEscape = (value: any) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;
const downloadTextFile = (
  filename: string,
  content: string,
  type = "text/csv;charset=utf-8;",
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
const currentTaxDocumentRows = () =>
  filteredTaxRows.value.length ? filteredTaxRows.value : taxes.value;
const exportTaxCsv = () => {
  const rows = currentTaxDocumentRows();
  const csvRows = [
    [
      "Jenis Pajak",
      "Masa Pajak",
      "Nominal",
      "Jatuh Tempo",
      "Status",
      "NTPN",
      "Keterangan",
    ],
    ...rows.map((tax: any) => [
      tax.jenis,
      tax.masaPajak,
      tax.nominal,
      tax.jatuhTempo,
      tax.status,
      tax.ntpn || "",
      taxDescription(tax.jenis, tax.masaPajak),
    ]),
  ];

  downloadTextFile(
    `finstart-pajak-${new Date().toISOString().slice(0, 10)}.csv`,
    csvRows.map((row) => row.map(csvEscape).join(",")).join("\n"),
  );
  notify(`CSV pajak berhasil dibuat (${rows.length} data).`);
};
const printTaxReport = () => {
  const rows = currentTaxDocumentRows();
  const popup = window.open("", "_blank", "width=960,height=720");

  if (!popup) {
    notify(
      "Popup print diblokir browser. Izinkan popup untuk mencetak laporan pajak.",
    );
    return;
  }

  popup.document.write(`<!doctype html>
        <html>
          <head>
            <title>Laporan Pajak - FinStart</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #102A56; }
              h1, p { margin: 0; }
              .header { border-bottom: 2px solid #0B1F4A; padding-bottom: 14px; text-align: center; }
              .meta { margin-top: 6px; color: #64748B; font-size: 12px; }
              .summary { display: flex; justify-content: space-between; margin-top: 18px; border: 1px solid #DCE7F4; padding: 12px; }
              table { border-collapse: collapse; margin-top: 20px; width: 100%; font-size: 12px; }
              th, td { border-bottom: 1px solid #E2E8F0; padding: 10px; text-align: left; vertical-align: top; }
              th { background: #F8FBFE; color: #53658A; text-transform: uppercase; font-size: 10px; }
              td:nth-child(4), th:nth-child(4) { text-align: right; }
              @media print { body { margin: 18mm; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PT KEDATA INDONESIA DIGITAL</h1>
              <p class="meta">Laporan Kewajiban Pajak - ${escapeHtml(new Date().toLocaleDateString("id-ID"))}</p>
            </div>
            <div class="summary">
              <strong>Total Belum Dibayar</strong>
              <strong>${escapeHtml(formatRupiah(totalTaxesOwed))}</strong>
            </div>
            <table>
              <thead>
                <tr><th>Jenis</th><th>Periode</th><th>Keterangan</th><th>Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>NTPN</th></tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (tax: any) => `<tr>
                  <td>${escapeHtml(tax.jenis)}</td>
                  <td>${escapeHtml(tax.masaPajak)}</td>
                  <td>${escapeHtml(taxDescription(tax.jenis, tax.masaPajak))}</td>
                  <td>${escapeHtml(formatRupiah(tax.nominal))}</td>
                  <td>${escapeHtml(formatTaxDate(tax.jatuhTempo))}</td>
                  <td>${escapeHtml(tax.status)}</td>
                  <td>${escapeHtml(tax.ntpn || "-")}</td>
                </tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>`);
  popup.document.close();
  popup.focus();
  popup.print();
  notify("Dialog cetak laporan pajak dibuka.");
};
const taxPerformanceCards = () => [
  ["Pendapatan Posted", formatRupiah(Number(taxCalculationData?.revenue || 0))],
  ["Beban Posted", formatRupiah(Number(taxCalculationData?.expense || 0))],
  ["Laba Bersih", formatRupiah(Number(taxCalculationData?.net_profit || 0))],
  [
    "Kewajiban Belum Setor",
    formatRupiah(Number(taxSummary?.total_unpaid || 0)),
  ],
];
const taxPeriodOptions = () => recentTaxPeriods();
const taxCalculationBase =
  taxCalculation.value.base === "Pendapatan"
    ? Number(taxCalculationData?.revenue || 0)
    : taxCalculation.value.base === "Laba Bersih"
      ? Math.max(Number(taxCalculationData?.net_profit || 0), 0)
      : Number(taxCalculationData?.expense || taxSummary?.total_unpaid || 0);
const calculatedTax = Math.round(
  (taxCalculationBase * (Number(taxCalculation.value.rate) || 0)) / 100,
);
const handleCreateTaxDraft = async () => {
  if (!calculatedTax || !taxCalculation.value.dueDate) {
    notify("Nominal hasil kalkulasi dan jatuh tempo harus tersedia.");
    return;
  }
  await createTax({
    jenis: taxCalculation.value.jenis,
    masaPajak: taxCalculation.value.period,
    nominal: calculatedTax,
    jatuhTempo: taxCalculation.value.dueDate,
    catatan: `Dibuat dari kalkulasi dengan dasar ${taxCalculation.value.base}.`,
  });
  updateTaxTableTab("unpaid");
};
const resetTaxCalculation = () => {
  updateTaxCalculation({
    period: currentPayrollPeriod(),
    jenis: "PPh 21",
    base: "Pendapatan",
    rate: 2,
    dueDate: currentTaxDueDate(),
  });
  notify("Dasar kalkulasi pajak telah diperbarui.");
};
const taxCards = [
  {
    code: "GL-2200",
    title: "PPN Kurang Bayar",
    amount: getOutstandingTaxAmount("PPN"),
    taxId: getOutstandingTax("PPN")?.id,
    desc: "Pajak Keluaran (11%) dari Invoice yang belum disetorkan.",
    accent: "indigo",
  },
  {
    code: "GL-2210",
    title: "PPh Pasal 21",
    amount: getOutstandingTaxAmount("PPh 21"),
    taxId: getOutstandingTax("PPh 21")?.id,
    desc: "Pemotongan pajak atas gaji/upah karyawan bulan berjalan.",
    accent: "emerald",
  },
  {
    code: "GL-2220",
    title: "PPh Pasal 23",
    amount: getOutstandingTaxAmount("PPh 23"),
    taxId: getOutstandingTax("PPh 23")?.id,
    desc: "Pajak atas jasa vendor/pihak ketiga yang dipotong perusahaan.",
    accent: "rose",
  },
];
const inputClass =
  "w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all";
// Konten field disusun melalui slot bawaan Vue.
// Karena itu gunakan slots.default() agar semua input/select di form tampil.

const formatPercentInput = (value: number) => String(value).replace(".", ",");
const parsePercentInput = (value: string) =>
  Number(value.replace(",", ".")) || 0;

const employeeCount = () => pegawai.length;
const activeBpjsCount = () =>
  pegawai.filter(
    (item: any) =>
      String(item?._raw?.bpjs_status || "").toLowerCase() === "active",
  ).length;
const bpjsCompliancePercent = () =>
  employeeCount() ? Math.round((activeBpjsCount() / employeeCount()) * 100) : 0;
const activeDivisions = () => divisions.value;
const filteredPositions = () =>
  positions.value.filter((position: any) => {
    if (!employeeForm.value.divisionId) return true;
    return (
      !position.division_id ||
      String(position.division_id) === String(employeeForm.value.divisionId)
    );
  });
const currentPayrollEmployee = () => selectedPayrollEmployee();
const currentPayrollAmount = () => {
  const employee = currentPayrollEmployee();
  const raw = employee?._raw || {};
  return (
    asNumber(raw.base_salary ?? employee?.gajiBersih) +
    asNumber(payrollForm.value.overtimeAmount) +
    asNumber(payrollForm.value.allowanceAmount) +
    asNumber(payrollForm.value.bonusAmount)
  );
};
const currentPayrollEstimatedNet = () =>
  Math.max(
    0,
    currentPayrollAmount() -
      asNumber(
        pph21Estimate.value?.pph21_amount ||
          payrollForm.value.pph21ManualAmount,
      ) -
      asNumber(payrollForm.value.loanDeduction) -
      asNumber(payrollForm.value.otherDeduction),
  );

onMounted(() => {
  refreshMasterData();
});
function openPayrollModal() {
  const activeEmployees = pegawai.filter(
    (item) =>
      String(item?._raw?.employment_status || "active").toLowerCase() ===
      "active",
  );
  if (!activeEmployees.length) {
    notify("Tambahkan pegawai aktif terlebih dahulu.");
    return;
  }
  refreshMasterData();
  resetPayrollFormErrors();
  updateIsPayrollModalOpen(true);
}

function closePayrollModal() {
  resetPayrollFormErrors();
  updateIsPayrollModalOpen(false);
}

function closeMasterDataModal() {
  isMasterDataModalOpen.value = false;
  resetMasterDataForm(masterDataTab.value, false);
}

function openManualTaxModal() {
  resetManualTaxForm();
  updateIsTaxManualModalOpen(true);
}

function openTaxPaymentModal(taxId: string) {
  taxPaymentError.value = "";
  updateSelectedTaxId(taxId);
  updateIsTaxPayModalOpen(true);
}

function closeEmployeeModal() {
  employeeSaveError.value = "";
  updateIsEmployeeModalOpen(false);
  resetEmployeeForm();
}

function closeManualTaxModal() {
  updateIsTaxManualModalOpen(false);
  resetManualTaxForm();
}

const activePayrollEmployees = computed(() =>
  (props.pegawai || []).filter(
    (employee) =>
      String(employee?._raw?.employment_status || "active").toLowerCase() ===
      "active",
  ),
);

const outstandingTaxes = computed(() =>
  (props.taxes || []).filter((tax) => tax.status !== "Sudah Setor"),
);

const assetAccounts = computed(() =>
  (props.akun || []).filter((account) => account.tipe === "Aset"),
);

</script>

<style>
.master-search-field {
  isolation: isolate;
}

.master-search-icon {
  left: 18px !important;
  width: 16px !important;
  height: 16px !important;
}

.master-search-input {
  padding-left: 52px !important;
  color: #243650 !important;
  font-size: 12.5px !important;
  font-weight: 650 !important;
}

.master-search-input::placeholder {
  color: #8a99ad !important;
  opacity: 1 !important;
}

.master-editor-layer {
  color: #102a56;
}

.master-editor-card {
  font-size: 12px;
  background: #ffffff !important;
}

.master-editor-header {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
  padding: 18px 22px !important;
}

.master-editor-eyebrow {
  color: #1e5aa8 !important;
  font-size: 10px !important;
  font-weight: 850 !important;
  letter-spacing: 0.16em !important;
}

.master-editor-title {
  color: #102a56 !important;
  font-size: 17px !important;
  line-height: 1.2 !important;
}

.master-editor-subtitle {
  max-width: 440px;
  color: #64748b !important;
  font-size: 11px !important;
  line-height: 1.45 !important;
}

.master-editor-form {
  padding: 18px 22px 20px !important;
}

.master-editor-field {
  min-width: 0;
}

.master-editor-label {
  display: block;
  margin-bottom: 7px;
  color: #52647e;
  font-size: 10.5px;
  font-weight: 850;
  letter-spacing: 0.12em;
  line-height: 1.25;
  text-transform: uppercase;
}

.master-editor-control {
  width: 100%;
  min-height: 42px;
  border: 1px solid #dce7f4;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 14px;
  color: #243650;
  font-size: 12.5px;
  font-weight: 700;
  outline: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.master-editor-control::placeholder {
  color: #91a0b6;
  font-weight: 600;
}

.master-editor-control:focus {
  border-color: #1e5aa8;
  background: #fbfdff;
  box-shadow: 0 0 0 4px rgba(30, 90, 168, 0.1);
}

.master-editor-help {
  margin-top: 6px;
  color: #7a8ca8;
  font-size: 10.5px;
  line-height: 1.35;
}

.master-editor-summary strong {
  display: block;
  margin-top: 3px;
  color: #102a56 !important;
  font-size: 12.5px;
  font-weight: 850;
}

.master-editor-summary p,
.master-editor-summary span {
  color: #64748b !important;
  opacity: 1 !important;
}

.master-editor-actions button {
  height: 42px !important;
  border-radius: 12px !important;
  font-size: 12px !important;
}

@media (max-width: 639px) {
  .master-editor-header,
  .master-editor-form {
    padding-inline: 16px !important;
  }
}

.master-confirm-layer {
  position: absolute;
  inset: 0;
  z-index: 35;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px;
  background: rgba(11, 18, 32, 0.5);
  backdrop-filter: blur(6px);
}

.employee-confirm-layer {
  position: fixed;
  inset: 0;
  z-index: 10095;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(11, 18, 32, 0.55);
  backdrop-filter: blur(8px);
}

.master-confirm-card {
  width: min(520px, 100%);
  overflow: hidden;
  border: 1px solid #dce7f4;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 26px 80px rgba(8, 25, 60, 0.34);
}

.master-confirm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #e8eef7;
  padding: 20px 22px 16px;
}

.master-confirm-eyebrow {
  margin: 0 0 6px;
  color: #be123c;
  font-size: 10.5px;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.master-confirm-header h3 {
  margin: 0;
  color: #102a56;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
}

.master-confirm-header p:last-child {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.5;
}

.master-confirm-close {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: #94a3b8;
  transition: background-color 160ms ease, color 160ms ease;
}

.master-confirm-close:hover {
  background: #f4f8fd;
  color: #102a56;
}

.master-confirm-body {
  display: grid;
  gap: 14px;
  padding: 18px 22px;
}

.master-confirm-body dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 0;
}

.master-confirm-body dl > div {
  min-width: 0;
  border: 1px solid #dce7f4;
  border-radius: 14px;
  background: #f8fbfe;
  padding: 11px 12px;
}

.master-confirm-body dt {
  color: #8a99ad;
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.master-confirm-body dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  color: #102a56;
  font-size: 13px;
  font-weight: 850;
  line-height: 1.3;
}

.master-confirm-impact {
  border: 1px solid #fecdd3;
  border-radius: 16px;
  background: #fff1f2;
  padding: 14px 15px;
}

.master-confirm-impact p {
  margin: 0;
  color: #be123c;
  font-size: 12.5px;
  font-weight: 850;
}

.master-confirm-impact ul {
  display: grid;
  gap: 6px;
  margin: 9px 0 0;
  padding-left: 18px;
  color: #7f1d1d;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.45;
}

.master-confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  border-top: 1px solid #e8eef7;
  padding: 16px 22px 20px;
}

.master-confirm-actions button {
  min-height: 42px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 850;
}

.master-confirm-actions .secondary {
  border: 1px solid #dce7f4;
  background: #ffffff;
  color: #53658a;
}

.master-confirm-actions .danger {
  background: #be123c;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(190, 18, 60, 0.18);
}

.master-confirm-actions .danger:disabled {
  cursor: not-allowed;
  background: #cbd5e1;
  color: #64748b;
  box-shadow: none;
}

@media (max-width: 639px) {
  .master-confirm-body dl,
  .master-confirm-actions {
    grid-template-columns: 1fr;
  }
}

.tax-manual-card {
  font-size: 12px;
}

.tax-manual-card > div:first-child {
  padding: 14px 18px !important;
}

.tax-manual-card > div:first-child h3 {
  font-size: 15px !important;
  line-height: 1.3 !important;
}

.tax-manual-card > div:first-child p:first-child {
  font-size: 9px !important;
}

.tax-manual-card > div:first-child p:last-child {
  font-size: 10px !important;
  line-height: 1.5 !important;
}

.tax-manual-form {
  padding: 14px 18px !important;
}

.tax-manual-form > section {
  border-radius: 14px !important;
}

.tax-manual-form > section[class*="rounded"] {
  padding: 12px !important;
}

.tax-manual-form section > div:first-child p:first-child {
  font-size: 11px !important;
  line-height: 1.35 !important;
}

.tax-manual-form p {
  font-size: 10px !important;
  line-height: 1.45 !important;
}

.tax-manual-form label {
  font-size: 9px !important;
  line-height: 1.3 !important;
}

.tax-manual-form input,
.tax-manual-form select {
  height: 38px !important;
  min-height: 38px !important;
  border-radius: 9px !important;
  padding-inline: 10px !important;
  font-size: 11px !important;
}

.tax-manual-form button {
  min-height: 36px !important;
  height: 36px !important;
  font-size: 10px !important;
}

.tax-manual-form .grid {
  gap: 10px !important;
}

@media (max-width: 639px) {
  .tax-manual-card > div:first-child,
  .tax-manual-form {
    padding-inline: 14px !important;
  }
}

.payroll-history-scroll {
  scrollbar-width: thin;
  scrollbar-color: #9fb3cc #eef5fc;
}

.payroll-history-scroll::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.payroll-history-scroll::-webkit-scrollbar-track {
  background: #eef5fc;
}

.payroll-history-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #eef5fc;
  border-radius: 999px;
  background: #9fb3cc;
}
</style>
