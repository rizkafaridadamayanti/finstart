<template>
  <div class="space-y-6 font-sans">
    <!-- Header switches -->
    <div
      v-if="activeTab === 'sdm' &amp;&amp; !isSdmFullPageView"
      class="workspace-page-header flex flex-col justify-between gap-4 md:flex-row md:items-center"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Kelola Pegawai
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Integrasi HR Compliance, BPJS, dan Manajemen Dokumen Digital.
        </p>
      </div>
      <div class="flex items-center">
        <button
          id="btn-register-employee"
          type="button"
          class="flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0B1F4A] px-4 text-xs font-extrabold text-white shadow-lg shadow-[#0B1F4A]/20 transition-all hover:bg-[#102A56]"
          @click="openEmployeeForm()"
        >
          <Plus class="w-4 h-4" /> Tambah Pegawai
        </button>
      </div>
    </div>
    <div
      v-else-if="isBpjsView"
      class="workspace-page-header flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Pengaturan Tarif BPJS
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Diatur sekali oleh admin dan dipakai untuk payroll berikutnya.
        </p>
      </div>
    </div>
    <div
      v-else-if="isDivisiJabatanView"
      class="workspace-page-header flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Kelola Divisi &amp; Jabatan
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Tambahkan, ubah, atau hapus master data. Data yang masih digunakan
          pegawai tidak dapat dihapus secara langsung.
        </p>
      </div>
    </div>
    <div
      v-else-if="isRiwayatPenggajianView"
      class="workspace-page-header flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Riwayat Penggajian
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Payroll yang sudah diproses dan diposting ke jurnal.
        </p>
      </div>
    </div>
    <div
      v-else-if="isProsesPayrollView"
      class="workspace-page-header flex flex-col justify-between gap-4 2xl:flex-row 2xl:items-end"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-[#020B2D] tracking-tight">
          Proses Payroll
        </h1>
        <p class="text-sm text-[#53658A] mt-1">
          Pilih pegawai, periode, dan akun pembayaran.
        </p>
      </div>
    </div>
    <!-- 1. DIRECTORI SDM & BPJS SETTING view -->
    <div v-if="activeTab === 'sdm' &amp;&amp; !isSdmFullPageView" class="space-y-6">
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
        class="bg-white border border-slate-100 overflow-hidden shadow-sm"
      >
        <div class="border-b border-slate-100 p-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <div
              class="inline-flex w-fit rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] p-1"
              aria-label="Filter status pegawai"
            >
              <button
                v-for="option in employeeStatusFilterOptions"
                :key="option.value"
                type="button"
                :class="[
                  'h-8 rounded-xl px-3 text-[11px] font-extrabold transition',
                  employeeStatusFilterButtonClass(option.value),
                ]"
                @click="updateEmployeeStatusFilter(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
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
                <th class="px-7 py-5 text-center">Status Aktif</th>
                <th class="px-7 py-5 text-center">Compliance</th>
                <th class="px-7 py-5 text-center text-[#0B1F4A]">Gaji Bersih (Net)</th>
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
                <td class="px-7 py-4 text-center">
                  <span
                    :class="[
                      'inline-flex min-w-[78px] items-center justify-center rounded-full border px-3 py-1.5 text-[10px] font-extrabold shadow-sm',
                      employeeStatusKey(staff) === 'active'
                        ? 'employee-status-pill-active'
                        : 'employee-status-pill-inactive',
                    ]"
                    ><template
                      v-if="employeeStatusKey(staff) === 'active'"
                      >Aktif</template
                    ><template v-else>Nonaktif</template></span
                  >
                </td>
                <td class="px-7 py-4 text-center">
                  <div class="flex justify-center">
                    <span
                      :class="`inline-flex min-w-[66px] items-center justify-center rounded-full px-2.5 py-1 text-[10px] font-bold ${staff.compliance === 'Patuh' ? 'bg-[#EEF5FC] text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`"
                      >{{ staff.compliance }}</span
                    >
                  </div>
                </td>
                <td class="px-7 py-4 text-center font-mono font-bold text-[#0B1F4A]">
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
    </div>
      <Teleport v-if="masterDeleteConfirm" to="body">
          <div
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
      </Teleport>
      <Teleport v-if="isMasterEditorOpen" to="body">
          <div
            class="master-editor-layer"
            :style="{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100vw',
              height: '100dvh',
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
                <p v-if="masterSaveWarning" class="form-field-warning">
                  {{ masterSaveWarning }}
                </p>
                <div class="master-editor-field">
                  <label class="master-editor-label" for="master-data-code"
                    >Kode</label
                  ><input
                    id="master-data-code"
                    :value="masterDataCodePreview"
                    readonly
                    class="master-editor-control cursor-not-allowed bg-[#F4F7FB] text-[#7A8CA8]"
                  />
                  <p class="master-editor-help">
                    Kode dibuat otomatis dari nama {{ masterLabel(masterDataForm.type).toLowerCase() }}.
                  </p>
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
      </Teleport>
      <Teleport v-if="employeeDeleteConfirm" to="body">
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
                  <template v-if="employeeDeleteUsageLoading">
                    Memeriksa riwayat payroll dan proyek pegawai.
                  </template>
                  <template v-else-if="!employeeCanBeDeleted()">
                    Penghapusan diblokir karena pegawai masih dipakai data
                    operasional.
                  </template>
                  <template v-else>
                    Penghapusan hanya tersedia untuk pegawai tanpa riwayat
                    payroll dan proyek.
                  </template>
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
                <ul v-if="employeeDeleteUsageLoading">
                  <li>Sistem sedang mengecek pemakaian pegawai.</li>
                </ul>
                <ul v-else-if="!employeeCanBeDeleted()">
                  <li>
                    Record terpakai oleh
                    {{ employeeDeleteBlockReasons().join(" dan ") }}.
                  </li>
                  <li v-if="employeeDeleteUsage?.project_names?.length">
                    Proyek terkait:
                    {{ employeeDeleteUsage.project_names.join(", ") }}.
                  </li>
                  <li>
                    Penghapusan tidak diperbolehkan agar riwayat payroll,
                    jurnal, dan proyek tetap aman.
                  </li>
                  <li>
                    Gunakan status Nonaktif agar pegawai tidak dipakai untuk
                    data baru.
                  </li>
                </ul>
                <ul v-else>
                  <li>Pegawai hilang dari master data SDM.</li>
                  <li>Riwayat ini tidak bisa dipulihkan dari aplikasi.</li>
                  <li>
                    Jika data sudah berubah saat proses berjalan, backend tetap
                    akan memblokir penghapusan.
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
              <button
                type="button"
                class="danger"
                :disabled="employeeDeleteUsageLoading || !employeeCanBeDeleted()"
                @click="confirmEmployeeDelete"
              >
                <template v-if="employeeDeleteUsageLoading">Memeriksa...</template>
                <template v-else-if="!employeeCanBeDeleted()"
                  >Tidak Bisa Dihapus</template
                >
                <template v-else>Hapus Pegawai</template>
              </button>
            </footer>
          </section>
        </div>
      </Teleport><Teleport
        v-if="isEmployeeDetailOpen &amp;&amp; selectedEmployeeDetail"
        to="body"
        ><div
          class="sdm-form-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
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
    <!-- 3. RIWAYAT PENGGAJIAN full-page view -->
    <div
      v-if="isRiwayatPenggajianView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-500">
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-5">Periode</th>
              <th class="p-5 text-center">Pegawai</th>
              <th class="p-5 text-center">Tanggal Bayar</th>
              <th class="p-5 text-center">Gaji Bersih</th>
              <th class="p-5 text-center">Voucher</th>
              <th class="p-5 text-center">Status</th>
              <th class="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr
              v-for="record in pagedPayrollHistory"
              :key="record.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="p-5 font-semibold text-[#102A56]">
                {{ formatPeriodLabel(record.payroll_period) }}
              </td>
              <td class="p-5 text-center">
                <span class="block font-semibold text-[#182338]">{{
                  record.employee_name
                }}</span
                ><span class="text-[10px] text-slate-400">{{
                  record.employee_code || "—"
                }}</span>
              </td>
              <td class="p-5 text-center text-[#64748B]">
                {{ record.payment_date || "—" }}
              </td>
              <td class="p-5 text-center font-mono font-bold text-[#0B1F4A]">
                {{ formatRupiah(asNumber(record.net_pay)) }}
              </td>
              <td class="p-5 text-center text-[#64748B]">
                {{ record.voucher_number || "—" }}
              </td>
              <td class="p-5 text-center">
                <span
                  class="inline-flex rounded-full bg-[#EEF5FC] px-3 py-1 text-[10px] font-bold text-[#1E5AA8]"
                  >{{
                    record.status === "posted" ? "Diposting" : record.status
                  }}</span
                >
              </td>
              <td class="p-5 text-center">
                <button
                  type="button"
                  class="table-outline-action inline-flex items-center justify-center gap-2 text-xs font-semibold"
                  @click="printPayslip(record)"
                >
                  <FileText class="h-4 w-4" /> PDF
                </button>
              </td>
            </tr>
            <tr v-if="payrollHistory.length === 0">
              <td colspan="7" class="p-10 text-center text-sm text-[#7A8CA8]">
                Belum ada riwayat penggajian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        v-if="payrollHistory.length > 0"
        :page="payrollHistoryPage"
        :total="payrollHistory.length"
        @page-change="
          payrollHistoryPage = safePage($event, payrollHistory.length)
        "
      />
    </div>
    <!-- 4. KELOLA DIVISI & JABATAN full-page view -->
    <div
      v-if="isDivisiJabatanView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div
        class="shrink-0 flex flex-wrap gap-2 border-b border-[#E8EEF7] bg-[#FAFCFF] px-5 py-3"
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
      <section class="min-w-0 p-5 lg:p-8">
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
        <div class="overflow-hidden border border-[#DCE7F4]">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead
                class="bg-[#EEF5FC] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#28518A]"
              >
                <tr>
                  <th class="px-5 py-3 text-left">Kode</th>
                  <th class="px-5 py-3 text-left">Nama</th>
                  <th
                    v-if="masterDataTab === 'position'"
                    class="px-5 py-3 text-center"
                  >
                    Divisi
                  </th>
                  <th
                    v-if="masterDataTab === 'position'"
                    class="px-5 py-3 text-center"
                  >
                    Status
                  </th>
                  <th class="px-5 py-3 text-center">Dipakai</th>
                  <th class="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EDF2F7] bg-white">
                <template v-if="masterRows().length"
                  ><tr
                    v-for="item in pagedMasterRows()"
                    :key="`${masterDataTab}-${item.id}`"
                    class="hover:bg-[#FAFCFF]"
                  >
                    <td class="px-4 py-3 font-mono text-[10px] text-[#7A8CA8]">
                      {{ item.code || "-" }}
                    </td>
                    <td class="px-4 py-3">
                      <p class="font-extrabold text-[#102A56]">
                        {{ item.name }}
                      </p>
                      <p v-if="item.description" class="mt-1 text-[10px] text-[#7A8CA8]">
                        {{ item.description }}
                      </p>
                    </td>
                    <td
                      v-if="masterDataTab === 'position'"
                      class="px-4 py-3 text-center text-[#53658A]"
                    >
                      {{ item.division_name || "Semua divisi" }}
                    </td>
                    <td
                      v-if="masterDataTab === 'position'"
                      class="px-4 py-3 text-center"
                    >
                      <span
                        :class="`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${String(item.status || 'active').toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`"
                        ><template
                          v-if="
                            String(item.status || 'active').toLowerCase() ===
                            'active'
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
                      <div class="flex justify-center gap-1.5">
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
                            String(item.status || 'active').toLowerCase() ===
                            'active'
                              ? 'Nonaktifkan'
                              : 'Aktifkan'
                          "
                          :aria-label="
                            String(item.status || 'active').toLowerCase() ===
                            'active'
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
                    :colspan="masterDataTab === 'position' ? 6 : 4"
                    class="px-4 py-12 text-center text-xs text-[#8190A5]"
                  >
                    Belum ada data {{ masterLabel().toLowerCase() }} yang
                    sesuai.
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
            class="mt-1.5 text-[22px] sm:text-[28px] font-semibold tracking-[-0.025em] text-[#102A56]"
          >
            Perpajakan
          </h1>
          <p class="mt-1 text-sm leading-6 text-[#6B7A90]">
            Hitung estimasi pajak dari jurnal posted, buat kewajiban pajak, lalu
            catat setoran dari Kas atau Bank.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <button
            id="btn-tax-manual"
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
            @click="openManualTaxModal"
          >
            <Plus class="h-4 w-4" /> Buat Kewajiban Pajak
          </button>
          <div class="flex items-center gap-2">
            <button
              id="btn-export-efaktur"
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]"
              @click="exportTaxCsv"
            >
              <FileText class="h-4 w-4 text-[#1E5AA8]" /> Export CSV
            </button>
            <button
              id="btn-draft-spt"
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE7F4] bg-white px-3.5 text-[12px] font-medium text-[#40516A] transition hover:bg-[#F8FBFE]"
              @click="printTaxReport"
            >
              <FileText class="h-4 w-4 text-[#1E5AA8]" /> Cetak PDF
            </button>
          </div>
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
            class="inline-flex h-9 items-center gap-2 rounded-lg border border-[#DCE7F4] bg-[#F8FBFE] px-3.5 text-[11px] font-semibold text-[#1E5AA8] transition hover:bg-[#EEF5FF]"
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
                {{ hasCalculatedDraft ? formatRupiah(taxCalculationBase) : "–" }}
              </p>
            </div>
            <div
              class="rounded-xl border border-[#E6EEF7] bg-[#FBFCFE] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#8A99AD]">
                Tarif Dipilih
              </p>
              <p class="mt-1 text-sm font-semibold text-[#102A56]">
                {{ hasCalculatedDraft ? `${taxCalculation.rate}%` : "–" }}
              </p>
            </div>
            <div
              class="rounded-xl border border-[#D7E8FA] bg-[#F7FBFF] px-3.5 py-3"
            >
              <p class="text-[10px] font-medium text-[#6983A4]">
                Estimasi {{ taxCalculation.jenis }}
              </p>
              <p class="mt-1 text-sm font-semibold text-[#1E5AA8]">
                {{ hasCalculatedDraft ? formatRupiah(calculatedTax) : "–" }}
              </p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
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
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-[0_10px_28px_rgba(16,42,86,0.045)]"
      >
        <div
          class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-3 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              :class="`inline-flex h-10 min-w-[122px] items-center justify-center rounded-lg px-3.5 text-[11px] font-semibold transition-all ${taxTableTab === 'unpaid' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
              @click="updateTaxTableTab('unpaid')"
            >
              Belum Dibayar
            </button>
            <button
              type="button"
              :class="`inline-flex h-10 min-w-[122px] items-center justify-center rounded-lg px-3.5 text-[11px] font-semibold transition-all ${taxTableTab === 'history' ? 'bg-[#0B1F4A] text-white shadow-sm' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
              @click="updateTaxTableTab('history')"
            >
              Riwayat Setoran
            </button>
            <select
              :value="taxTypeFilter"
              class="h-10 min-w-[176px] rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-semibold text-[#0B1F4A] outline-none focus:border-[#1E5AA8]"
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
                class="h-10 w-full rounded-lg border border-[#DCE7F4] bg-[#FBFCFE] pl-9 pr-3 text-[11px] font-semibold text-[#243650] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
                @change="updateTaxSearchQuery(eventValue($event))"
              />
            </div>
            <button
              type="button"
              class="inline-flex h-10 min-w-[92px] items-center justify-center gap-1.5 rounded-lg border border-[#DCE7F4] bg-white px-3 text-[11px] font-semibold text-[#1E5AA8] transition hover:bg-[#F8FBFE]"
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
            <table class="min-w-[1120px] w-full text-left">
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
                  <th class="px-3 py-3 text-center">NTPN</th>
                  <th class="px-3 py-3 text-center">Aksi</th>
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
                        :class="taxStatusBadgeClass(tax)"
                        ><template v-if="tax.status === 'Belum Setor'"
                          >Belum Dibayar</template
                        ><template v-else>Sudah Disetor</template></span
                      >
                    </td>
                    <td
                      class="px-3 py-3.5 text-center text-[10px] text-[#64748B]"
                    >
                      {{ tax.ntpn || "—" }}
                    </td>
                    <td class="px-3 py-3.5 text-center">
                      <div class="inline-flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          class="tax-action-button border-[#DCE7F4] bg-white text-[#1E5AA8] hover:bg-[#F8FBFE]"
                          title="Lihat detail pajak"
                          aria-label="Lihat detail pajak"
                          @click="openTaxDetail(tax)"
                        >
                          <Eye class="h-3.5 w-3.5" />
                        </button>
                        <button
                          v-if="taxTableTab === 'unpaid'"
                          type="button"
                          class="tax-action-button border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          title="Edit pajak"
                          aria-label="Edit pajak"
                          @click="openTaxEdit(tax)"
                        >
                          <Pencil class="h-3.5 w-3.5" />
                        </button>
                        <button
                          v-if="taxTableTab === 'unpaid' && tax.rawStatus === 'draft'"
                          type="button"
                          class="tax-action-button border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Hapus pajak"
                          aria-label="Hapus pajak"
                          @click="requestDeleteTax(tax)"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                        <button
                          v-if="taxTableTab === 'unpaid'"
                          type="button"
                          :disabled="tax.status !== 'Belum Setor'"
                          class="tax-action-button border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:border-[#E2E8F0] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                          title="Setor pajak"
                          aria-label="Setor pajak"
                          @click="openTaxPaymentForTax(tax)"
                        >
                          <Banknote class="h-3.5 w-3.5" />
                        </button>
                      </div>
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
    <Teleport v-if="selectedTaxDetail" to="body">
      <div
        class="fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div class="w-full max-w-[520px] overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-5 py-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">
                Detail Pajak
              </p>
              <h3 class="mt-1 text-base font-semibold text-[#102A56]">
                {{ selectedTaxDetail.jenis }} - {{ selectedTaxDetail.masaPajak }}
              </h3>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]"
              aria-label="Tutup detail pajak"
              @click="closeTaxDetail"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="space-y-3 px-5 py-4 text-[12px] text-[#40516A]">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-[#E8EEF7] bg-[#FBFCFE] p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Nominal</p>
                <p class="mt-1 font-semibold text-[#102A56]">{{ formatRupiah(selectedTaxDetail.nominal) }}</p>
              </div>
              <div class="rounded-xl border border-[#E8EEF7] bg-[#FBFCFE] p-3">
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Status</p>
                <p class="mt-1 font-semibold text-[#102A56]">{{ selectedTaxDetail.status }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Jatuh tempo</p>
                <p class="mt-1 font-medium">{{ formatTaxDate(selectedTaxDetail.jatuhTempo) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">NTPN</p>
                <p class="mt-1 font-medium">{{ selectedTaxDetail.ntpn || "-" }}</p>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">Keterangan</p>
              <p class="mt-1 leading-5">
                {{ selectedTaxDetail._raw?.notes || taxDescription(selectedTaxDetail.jenis, selectedTaxDetail.masaPajak) }}
              </p>
            </div>
            <div class="rounded-xl border border-[#E8EEF7] bg-[#FBFCFE] p-3">
              <p class="font-semibold text-[#102A56]">Jurnal</p>
              <p class="mt-1 text-[11px] text-[#64748B]">
                Kewajiban: {{ selectedTaxDetail._raw?.obligation_voucher_number || "-" }}
              </p>
              <p class="mt-1 text-[11px] text-[#64748B]">
                Setoran: {{ selectedTaxDetail._raw?.payment_voucher_number || "-" }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport v-if="editingTax" to="body">
      <div
        class="fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div class="w-full max-w-[620px] overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-2xl">
          <div class="flex items-start justify-between gap-4 border-b border-[#E8EEF7] px-5 py-4">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1E5AA8]">
                Edit Pajak
              </p>
              <h3 class="mt-1 text-base font-semibold text-[#102A56]">
                Ubah Kewajiban Pajak
              </h3>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]"
              aria-label="Tutup edit pajak"
              @click="closeTaxEdit"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          <form class="space-y-3 px-5 py-4" @submit.prevent="handleUpdateTax">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
                Jenis Pajak
                <select
                  :value="taxEditForm.jenis"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                  @change="updateTaxEditForm({ ...taxEditForm, jenis: eventValue($event) })"
                >
                  <option v-for="option in manualTaxOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </label>
              <label class="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
                Masa Pajak
                <input
                  type="month"
                  :value="taxEditForm.period"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                  required
                  @change="updateTaxEditForm({ ...taxEditForm, period: eventValue($event) })"
                />
              </label>
              <label class="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
                Nominal
                <input
                  type="number"
                  min="1"
                  :value="taxEditForm.nominal"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                  required
                  @change="updateTaxEditForm({ ...taxEditForm, nominal: parseRupiahInput(eventValue($event)) })"
                />
              </label>
              <label class="space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
                Jatuh Tempo
                <input
                  type="date"
                  :value="taxEditForm.dueDate"
                  class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                  required
                  @change="updateTaxEditForm({ ...taxEditForm, dueDate: eventValue($event) })"
                />
              </label>
            </div>
            <label class="block space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
              NTPN / Referensi
              <input
                type="text"
                :value="taxEditForm.taxNumber"
                class="h-11 w-full rounded-lg border border-[#DCE7F4] bg-white px-3 text-[12px] font-semibold normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                @change="updateTaxEditForm({ ...taxEditForm, taxNumber: eventValue($event) })"
              />
            </label>
            <label class="block space-y-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7A8CA8]">
              Catatan
              <textarea
                :value="taxEditForm.notes"
                rows="3"
                class="w-full rounded-lg border border-[#DCE7F4] bg-white px-3 py-2.5 text-[12px] font-medium normal-case tracking-normal text-[#243650] outline-none focus:border-[#1E5AA8]"
                @change="updateTaxEditForm({ ...taxEditForm, notes: eventValue($event) })"
              ></textarea>
            </label>
            <p v-if="taxEditError" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              {{ taxEditError }}
            </p>
            <div class="flex justify-end gap-2 border-t border-[#E8EEF7] pt-4">
              <button
                type="button"
                class="h-10 rounded-lg border border-[#DCE7F4] bg-white px-4 text-[12px] font-semibold text-[#64748B] hover:bg-[#F8FBFE]"
                @click="closeTaxEdit"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="isTaxEditSubmitting"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B1F4A] px-4 text-[12px] font-semibold text-white disabled:opacity-60"
              >
                <Save class="h-4 w-4" />
                {{ isTaxEditSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    <Teleport v-if="taxDeleteConfirm" to="body">
      <div
        class="fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div class="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-2xl">
          <div class="px-5 py-5">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600">
              Hapus Pajak
            </p>
            <h3 class="mt-1 text-base font-semibold text-[#102A56]">
              Hapus {{ taxDeleteConfirm.jenis }} periode {{ taxDeleteConfirm.masaPajak }}?
            </h3>
            <p class="mt-2 text-[12px] leading-5 text-[#64748B]">
              Data pajak yang belum disetor akan dihapus. Jika sudah memiliki jurnal kewajiban, sistem akan membuat jurnal balik agar saldo buku besar tetap rapi.
            </p>
            <p v-if="taxDeleteError" class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
              {{ taxDeleteError }}
            </p>
            <div class="mt-5 flex justify-end gap-2">
              <button
                type="button"
                class="h-10 rounded-lg border border-[#DCE7F4] bg-white px-4 text-[12px] font-semibold text-[#64748B] hover:bg-[#F8FBFE]"
                @click="closeTaxDelete"
              >
                Batal
              </button>
              <button
                type="button"
                :disabled="isTaxDeleting"
                class="h-10 rounded-lg bg-rose-600 px-4 text-[12px] font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                @click="handleDeleteTax"
              >
                {{ isTaxDeleting ? "Menghapus..." : "Hapus" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- 5. ATUR BPJS full-page view -->
    <div
      v-if="isBpjsView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
        <form
          class="w-full space-y-6 p-6 text-xs lg:p-8"
          novalidate
          @submit="handleSaveBpjs"
        >
          <div
            v-if="bpjsRateErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh tarif BPJS.</strong>
            <span>Isi persentase iuran sebenarnya dengan angka 0 sampai 20.</span>
          </div>
          <div class="rounded-2xl border border-[#BFD7F5] bg-[#F4F9FF] p-4 text-[#36577F]">
            <div class="flex items-start gap-3">
              <FileText class="mt-0.5 h-4 w-4 shrink-0 text-[#1E5AA8]" />
              <div>
                <p class="font-extrabold text-[#102A56]">Cara mengisi tarif</p>
                <ul class="mt-2 grid grid-cols-1 gap-y-2 list-disc pl-4 text-[11px] leading-5">
                  <li>Masukkan angka persen langsung: <strong>4</strong> berarti 4%, bukan 0,04 atau 90.</li>
                  <li><strong>Porsi perusahaan</strong> adalah kontribusi perusahaan dan tidak mengurangi gaji bersih pegawai.</li>
                  <li><strong>Porsi pegawai</strong> adalah potongan yang mengurangi gaji bersih saat payroll diproses.</li>
                  <li>JHT berarti Jaminan Hari Tua, sedangkan JP berarti Jaminan Pensiun.</li>
                  <li>Gunakan tarif yang berlaku di perusahaan dan verifikasi kembali dengan ketentuan BPJS terbaru sebelum menyimpan.</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-6">
          <div class="space-y-5 rounded-2xl border border-[#DCE7F4] p-5">
            <h4
              class="text-[10px] text-[#1E5AA8] font-extrabold uppercase tracking-widest flex items-center gap-2"
            >
              <HeartPulse class="w-3.5 h-3.5" /> BPJS Kesehatan (%)
            </h4>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Tarif Perusahaan</label
                ><input
                  id="bpjs-kes-employer"
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
                  >Tarif Pegawai</label
                ><input
                  id="bpjs-kes-employee"
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
          <div class="space-y-5 rounded-2xl border border-[#DCE7F4] p-5">
            <h4
              class="text-[10px] text-[#0B1F4A] font-extrabold uppercase tracking-widest flex items-center gap-2"
            >
              <ShieldCheck class="w-3.5 h-3.5" /> BPJS Ketenagakerjaan (%)
            </h4>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >JHT Perus.</label
                ><input
                  id="bpjs-jht-employer"
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
                  type="text"
                  inputmode="decimal"
                  data-rupiah="false"
                  required
                  min="0"
                  max="20"
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
          </div>
          <div class="flex flex-col gap-3">
            <button
              id="btn-save-bpjs-rates"
              type="submit"
              :disabled="isBpjsSaving || isBpjsResetting"
              class="h-12 w-full rounded-2xl bg-[#10182C] text-xs font-extrabold uppercase tracking-widest text-white transition-all hover:bg-[#0B1120]"
            >
              {{ isBpjsSaving ? "Menyimpan..." : "Simpan Tarif BPJS" }}
            </button>
            <button
              id="btn-reset-bpjs-rates"
              type="button"
              :disabled="isBpjsSaving || isBpjsResetting"
              class="h-12 w-full rounded-2xl border border-[#0B1F4A] bg-white text-xs font-extrabold text-[#0B1F4A] transition-all"
              @click="handleResetBpjs"
            >
              {{ isBpjsResetting ? "Mereset..." : "Reset ke Tarif Resmi" }}
            </button>
          </div>
        </form>
    </div>
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
                      type="text"
                      inputmode="numeric"
                      data-rupiah="true"
                      data-rupiah-external-prefix="true"
                      :value="employeeBaseSalaryInputValue"
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
                          parseRupiahInput(eventValue($event)),
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
    <!-- 6. PROSES PAYROLL full-page view -->
    <div
      v-if="isProsesPayrollView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
        <form
          novalidate
          data-manual-validation="true"
          class="grid w-full grid-cols-1 gap-4 p-6 text-xs lg:p-8"
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
          <div
            v-if="payrollProcessError"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700"
            role="alert"
          >
            <p>{{ payrollProcessError }}</p>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B1F4A]">Pegawai yang Diproses</label
            ><select
              id="payroll-employee"
              required
              :value="payrollForm.employeeId"
              :class="[
                'h-12 w-full rounded-[18px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none focus:ring-2 focus:ring-[#1E5AA8]/20',
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
          <div class="grid grid-cols-1 gap-3">
            <div class="space-y-1.5">
              <label class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B1F4A]">Periode Payroll</label
              ><input
                id="payroll-period"
                type="month"
                required
                :value="payrollForm.payrollPeriod"
                :class="[
                  'h-12 w-full rounded-[18px] border border-[#0B1F4A] bg-white px-3 text-[13px] font-semibold text-[#0B1F4A] outline-none focus:ring-2 focus:ring-[#1E5AA8]/20',
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
              <label class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B1F4A]">Tanggal Bayar</label
              ><input
                id="payroll-payment-date"
                type="date"
                required
                :value="payrollForm.paymentDate"
                :class="[
                  'h-12 w-full rounded-[18px] border border-[#0B1F4A] bg-white px-3 text-[13px] font-semibold text-[#0B1F4A] outline-none focus:ring-2 focus:ring-[#1E5AA8]/20',
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
            class="space-y-2 rounded-xl border border-[#BFD7F5] bg-blue-50 p-4 text-[12px] leading-5 text-blue-900"
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
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4">
            <p
              class="mb-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1E5AA8]"
            >
              Komponen Payroll &amp; Potongan
            </p>
            <div class="grid grid-cols-1 gap-3">
              <label class="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#0B1F4A]"
                >Lembur<input
                  id="payroll-overtime"
                  type="text"
                  inputmode="numeric"
                  data-rupiah="true"
                  min="0"
                  required
                  :value="formatRupiah(asNumber(payrollForm.overtimeAmount))"
                  :class="[
                    'mt-1 h-11 w-full rounded-[16px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none',
                    { 'form-control-invalid': payrollFormErrors.overtimeAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'overtimeAmount',
                      parseRupiahInput(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.overtimeAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.overtimeAmount }}
                </p></label
              ><label class="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#0B1F4A]"
                >Tunjangan<input
                  id="payroll-allowance"
                  type="text"
                  inputmode="numeric"
                  data-rupiah="true"
                  min="0"
                  required
                  :value="formatRupiah(asNumber(payrollForm.allowanceAmount))"
                  :class="[
                    'mt-1 h-11 w-full rounded-[16px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none',
                    { 'form-control-invalid': payrollFormErrors.allowanceAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'allowanceAmount',
                      parseRupiahInput(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.allowanceAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.allowanceAmount }}
                </p></label
              ><label class="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#0B1F4A]"
                >Bonus<input
                  id="payroll-bonus"
                  type="text"
                  inputmode="numeric"
                  data-rupiah="true"
                  min="0"
                  required
                  :value="formatRupiah(asNumber(payrollForm.bonusAmount))"
                  :class="[
                    'mt-1 h-11 w-full rounded-[16px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none',
                    { 'form-control-invalid': payrollFormErrors.bonusAmount },
                  ]"
                  @input="
                    setPayrollField(
                      'bonusAmount',
                      parseRupiahInput(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.bonusAmount"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.bonusAmount }}
                </p></label
              ><label class="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#0B1F4A]"
                >Kasbon<input
                  id="payroll-loan-deduction"
                  type="text"
                  inputmode="numeric"
                  data-rupiah="true"
                  min="0"
                  required
                  :value="formatRupiah(asNumber(payrollForm.loanDeduction))"
                  :class="[
                    'mt-1 h-11 w-full rounded-[16px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none',
                    { 'form-control-invalid': payrollFormErrors.loanDeduction },
                  ]"
                  @input="
                    setPayrollField(
                      'loanDeduction',
                      parseRupiahInput(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.loanDeduction"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.loanDeduction }}
                </p></label
              ><label class="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#0B1F4A]"
                >Potongan lain<input
                  id="payroll-other-deduction"
                  type="text"
                  inputmode="numeric"
                  data-rupiah="true"
                  min="0"
                  required
                  :value="formatRupiah(asNumber(payrollForm.otherDeduction))"
                  :class="[
                    'mt-1 h-11 w-full rounded-[16px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none',
                    { 'form-control-invalid': payrollFormErrors.otherDeduction },
                  ]"
                  @input="
                    setPayrollField(
                      'otherDeduction',
                      parseRupiahInput(eventValue($event)),
                    )
                  " />
                <p
                  v-if="payrollFormErrors.otherDeduction"
                  class="form-field-warning"
                >
                  {{ payrollFormErrors.otherDeduction }}
                </p></label
              >
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B1F4A]"
              >Sumber Rekening Dana Payout</label
            ><select
              id="payroll-source-bank"
              required
              :value="payrollForm.cashAccountId"
              :class="[
                'h-12 w-full rounded-[18px] border border-[#0B1F4A] bg-white px-4 text-[13px] font-semibold text-[#0B1F4A] outline-none focus:ring-2 focus:ring-[#1E5AA8]/20',
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
            class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4 text-[11px] font-medium leading-5 text-[#53658A]"
          >
            BPJS dan PPh 21 dihitung otomatis saat payroll diproses. Untuk masa
            terakhir, sistem merekonsiliasi penghasilan dan pajak tahun berjalan,
            lalu mencatat hasilnya sebagai potongan payroll dan utang terkait.
          </div>
          <div class="flex flex-col gap-3">
            <button
              id="btn-confirm-payout"
              type="button"
              :disabled="isPayrollProcessing"
              class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] text-[13px] font-extrabold text-white shadow transition-all hover:bg-[#1E3A8A] disabled:cursor-wait disabled:opacity-70"
              @click="handleProcessPayroll"
            >
              <CheckCircle2 class="w-4 h-4 text-[#38BDF8]" />
              {{ isPayrollProcessing ? "Memproses Payroll..." : "Proses Payroll Pegawai Ini" }}
            </button
            ><button
              type="button"
              class="h-12 w-full rounded-xl border border-[#0B1F4A] bg-white text-[13px] font-semibold text-[#0B1F4A] transition-all"
              :disabled="isPayrollProcessing"
              @click="handleProcessPayrollBulk"
            >
              {{ isPayrollProcessing ? "Menyiapkan Konfirmasi..." : "Proses Semua Pegawai" }}</button
            ><button
              type="button"
              class="h-12 w-full rounded-xl border border-[#1E5AA8] bg-[#EEF5FC] text-[13px] font-extrabold text-[#1E5AA8] shadow-sm transition-all hover:shadow-md"
              @click="downloadPayrollBankTransfer"
            >
              Unduh File Transfer Bank Periode Ini
            </button>
          </div>
        </form>
    </div>
    <Teleport to="body">
      <div
        v-if="payrollConfirmation"
        class="sdm-form-modal-layer fixed inset-0 z-[10095] flex items-center justify-center overflow-y-auto bg-[#111827]/70 p-4 backdrop-blur-sm"
      >
        <div class="my-4 w-full max-w-[560px] overflow-hidden rounded-3xl border border-[#DCE7F4] bg-white shadow-2xl">
          <div class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-5">
            <div>
              <p class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1E5AA8]">Konfirmasi Payroll</p>
              <h3 class="mt-1 text-xl font-extrabold text-[#0B1F4A]">Rincian {{ payrollConfirmation.employee_name }}</h3>
              <p class="mt-1 text-xs text-[#64748B]">Periksa seluruh nominal sebelum payroll diposting ke jurnal.</p>
            </div>
            <button type="button" class="rounded-xl p-2 text-[#64748B]" @click="payrollConfirmation = null">
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-3 px-6 py-5 text-sm text-[#334155]">
            <div class="flex justify-between gap-4"><span>Gaji pokok</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.base_salary)) }}</strong></div>
            <div class="flex justify-between gap-4"><span>Lembur</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.overtime_amount)) }}</strong></div>
            <div class="flex justify-between gap-4"><span>Tunjangan</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.allowance_amount)) }}</strong></div>
            <div class="flex justify-between gap-4"><span>Bonus</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.bonus_amount)) }}</strong></div>
            <div class="flex justify-between gap-4 border-t border-[#E8EEF7] pt-3"><span>Penghasilan bruto</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.gross_salary)) }}</strong></div>
            <div class="flex justify-between gap-4 text-red-700"><span>BPJS pegawai</span><strong>- {{ formatRupiah(asNumber(payrollConfirmation.employee_bpjs_deduction)) }}</strong></div>
            <div class="flex justify-between gap-4 text-red-700"><span>PPh 21 otomatis</span><strong>- {{ formatRupiah(asNumber(payrollConfirmation.pph21_amount)) }}</strong></div>
            <div class="flex justify-between gap-4 text-red-700"><span>Kasbon</span><strong>- {{ formatRupiah(asNumber(payrollConfirmation.loan_deduction)) }}</strong></div>
            <div class="flex justify-between gap-4 text-red-700"><span>Potongan lain</span><strong>- {{ formatRupiah(asNumber(payrollConfirmation.other_deduction)) }}</strong></div>
            <div class="flex justify-between gap-4 border-t-2 border-[#0B1F4A] pt-4 text-base text-[#0B1F4A]"><span class="font-extrabold">Gaji bersih diterima</span><strong>{{ formatRupiah(asNumber(payrollConfirmation.net_pay)) }}</strong></div>
          </div>
          <div class="grid gap-3 border-t border-[#E8EEF7] px-6 py-5 sm:grid-cols-2">
            <button type="button" class="h-11 rounded-xl border border-[#0B1F4A] font-bold text-[#0B1F4A]" :disabled="isPayrollProcessing" @click="payrollConfirmation = null">Kembali</button>
            <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] font-bold text-white disabled:cursor-wait disabled:opacity-70" :disabled="isPayrollProcessing" @click="printAndPostPayroll">
              <FileText class="h-4 w-4" />
              {{ isPayrollProcessing ? "Memposting..." : "Cetak & Posting" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="payrollBulkConfirmation"
        class="sdm-form-modal-layer fixed inset-0 z-[10096] flex items-center justify-center overflow-y-auto bg-[#111827]/70 p-4 backdrop-blur-sm"
      >
        <div class="payroll-bulk-modal-card my-4 flex flex-col overflow-hidden border border-[#DCE7F4] bg-white shadow-2xl">
          <div class="flex shrink-0 items-start justify-between border-b border-[#E8EEF7] px-5 py-4">
            <div>
              <p class="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#1E5AA8]">Konfirmasi Payroll Massal</p>
              <h3 class="mt-1 text-lg font-extrabold text-[#0B1F4A]">
                Periode {{ payrollBulkConfirmation.payroll_period }}
              </h3>
              <p class="mt-1 text-[11px] text-[#64748B]">
                Cek siapa yang akan digaji dan siapa yang dilewati sebelum jurnal payroll diposting.
              </p>
            </div>
            <button type="button" class="rounded-xl p-2 text-[#64748B]" :disabled="isPayrollProcessing" @click="closePayrollBulkConfirmation">
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4 text-xs">
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="rounded-xl border border-[#C7D8EE] bg-[#F8FBFE] p-3">
                <p class="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#40516A]">Total Pegawai</p>
                <p class="mt-1.5 text-xl font-extrabold text-[#061A40]">{{ asNumber(payrollBulkConfirmation.totals?.employee_count) }}</p>
              </div>
              <div class="rounded-xl border border-[#0B1F4A] bg-[#0B1F4A] p-3">
                <p class="text-[9px] font-extrabold uppercase tracking-[0.12em] text-white">Akan Digaji</p>
                <p class="mt-1.5 text-xl font-extrabold text-white">{{ payrollBulkReadyRows().length }}</p>
              </div>
              <div class="rounded-xl border border-amber-300 bg-amber-50 p-3">
                <p class="text-[9px] font-extrabold uppercase tracking-[0.12em] text-amber-900">Diskip</p>
                <p class="mt-1.5 text-xl font-extrabold text-amber-950">{{ payrollBulkSkippedRows().length }}</p>
              </div>
              <div class="rounded-xl border border-[#C7D8EE] bg-white p-3">
                <p class="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#40516A]">Total Netto</p>
                <p class="mt-1.5 text-sm font-extrabold text-[#061A40]">{{ formatRupiah(asNumber(payrollBulkConfirmation.totals?.net_pay)) }}</p>
              </div>
            </div>

            <section class="overflow-hidden rounded-xl border border-[#DCE7F4]">
              <div class="flex items-center justify-between border-b border-[#0B1F4A] bg-[#0B1F4A] px-4 py-2.5">
                <div>
                  <h4 class="text-[12px] font-extrabold text-white">Pegawai yang akan digaji</h4>
                  <p class="mt-0.5 text-[10px] font-semibold text-[#D9E8FF]">Data ini akan diposting ke payroll dan jurnal saat dikonfirmasi.</p>
                </div>
                <span class="payroll-bulk-count-badge">{{ payrollBulkReadyRows().length }} pegawai</span>
              </div>
              <div class="max-h-[170px] overflow-auto">
                <table class="min-w-[720px] w-full text-left">
                  <thead class="bg-[#EAF2FB] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#243650]">
                    <tr>
                      <th class="px-4 py-2.5">Pegawai</th>
                      <th class="px-4 py-2.5 text-right">Gaji Pokok</th>
                      <th class="px-4 py-2.5 text-right">Bruto</th>
                      <th class="px-4 py-2.5 text-right">BPJS + PPh 21</th>
                      <th class="px-4 py-2.5 text-right">Take Home Pay</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8EEF7]">
                    <tr v-if="!payrollBulkReadyRows().length">
                      <td colspan="5" class="px-4 py-5 text-center font-semibold text-[#40516A]">Tidak ada pegawai yang siap digaji untuk periode ini.</td>
                    </tr>
                    <tr v-for="row in payrollBulkReadyRows()" :key="`ready-${row.employee_id}`">
                      <td class="px-4 py-2.5 font-bold text-[#0B1F4A]">
                        {{ row.employee_name }}
                        <p class="mt-0.5 text-[10px] font-medium text-[#7A8CA8]">{{ row.employee_code || `ID ${row.employee_id}` }}</p>
                      </td>
                      <td class="px-4 py-2.5 text-right font-semibold">{{ formatRupiah(asNumber(row.base_salary)) }}</td>
                      <td class="px-4 py-2.5 text-right font-semibold">{{ formatRupiah(asNumber(row.gross_salary)) }}</td>
                      <td class="px-4 py-2.5 text-right font-semibold text-rose-700">{{ formatRupiah(asNumber(row.employee_bpjs_deduction) + asNumber(row.pph21_amount)) }}</td>
                      <td class="px-4 py-2.5 text-right font-extrabold text-[#0B1F4A]">{{ formatRupiah(asNumber(row.net_pay)) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="overflow-hidden rounded-xl border border-[#DCE7F4]">
              <div class="flex items-center justify-between border-b border-amber-200 bg-amber-50 px-4 py-2.5">
                <div>
                  <h4 class="text-[12px] font-extrabold text-[#061A40]">Pegawai yang diskip</h4>
                  <p class="mt-0.5 text-[10px] font-semibold text-[#40516A]">Pegawai ini tidak akan dibuatkan payroll pada proses ini.</p>
                </div>
                <span class="rounded-full border border-amber-300 bg-white px-3 py-1 text-[10px] font-extrabold text-amber-950">{{ payrollBulkSkippedRows().length }} pegawai</span>
              </div>
              <div class="max-h-[150px] overflow-auto">
                <table class="min-w-[620px] w-full text-left">
                  <thead class="bg-[#FFF7E6] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#78350F]">
                    <tr>
                      <th class="px-4 py-2.5">Pegawai</th>
                      <th class="px-4 py-2.5">Alasan</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8EEF7]">
                    <tr v-if="!payrollBulkSkippedRows().length">
                      <td colspan="2" class="px-4 py-5 text-center font-semibold text-[#40516A]">Tidak ada pegawai yang diskip.</td>
                    </tr>
                    <tr v-for="row in payrollBulkSkippedRows()" :key="`skip-${row.employee_id}`">
                      <td class="px-4 py-2.5 font-bold text-[#0B1F4A]">{{ row.employee_name || `Pegawai #${row.employee_id}` }}</td>
                      <td class="px-4 py-2.5 text-[#92400E]">{{ row.reason || "Tidak dapat diproses." }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
          <div class="flex shrink-0 flex-col-reverse gap-2 border-t border-[#E8EEF7] px-5 py-4 sm:flex-row sm:justify-end">
            <button type="button" class="h-10 min-w-[130px] rounded-xl border border-[#0B1F4A] px-5 text-sm font-bold text-[#0B1F4A]" :disabled="isPayrollProcessing" @click="closePayrollBulkConfirmation">Kembali</button>
            <button
              type="button"
              class="inline-flex h-10 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isPayrollProcessing || !payrollBulkReadyRows().length"
              @click="confirmProcessPayrollBulk"
            >
              <CheckCircle2 class="h-4 w-4 text-[#38BDF8]" />
              {{ isPayrollProcessing ? "Memposting..." : "Posting Payroll" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <div
      v-if="payslipPreview"
      class="fixed inset-0 z-[10100] flex items-center justify-center overflow-y-auto bg-[#000]/60 p-4 backdrop-blur-sm"
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
            @click="closePayrollResult"
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
            @click="closePayrollResult"
          >
            Tutup</button
          ><button
            type="button"
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            @click="openPayslipPrint"
          >
            <FileText class="h-4 w-4" /> Cetak PDF
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
                            taxBase: parseRupiahInput(eventValue($event)),
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
                  max="20"
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
                            nominal: parseRupiahInput(eventValue($event)),
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
                :disabled="isManualTaxSubmitting"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0B1F4A] px-4 text-[12px] font-medium text-white shadow-[0_8px_18px_rgba(11,31,74,0.16)] transition hover:bg-[#102A56]"
              >
                <Save class="h-4 w-4" /><template v-if="isManualTaxSubmitting"
                  >Menyimpan...</template
                ><template
                  v-else-if="isExistingTaxSourceSelected()"
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
      class="tax-payment-modal-layer fixed inset-0 flex items-center justify-center overflow-y-auto bg-[#000]/50 p-4"
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
                v-for="a in taxPaymentCashAccounts"
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
import { formatRupiahInput, parseRupiahInput } from "../utils/rupiahInputs.js";
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
  Banknote,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Pegawai, AkunBukuBesar } from "../types.ts";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";
import { currentMonthIso, todayIso } from "../utils/localDate";
import { csvEscape } from "../utils/spreadsheetExport.js";
import {
  buildPrintDocumentHtml,
  escapeHtml,
  openPrintPopup,
} from "../utils/printDocument.js";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import SdmField from "./sdm/SdmField.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface SdmDanPajakProps {
  activeSection:
    | "sdm"
    | "sdm-bpjs"
    | "sdm-divisi-jabatan"
    | "sdm-riwayat-penggajian"
    | "sdm-proses-payroll"
    | "perpajakan";
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

function currentPayrollPeriod() {
  return currentMonthIso();
}

function currentTaxDueDate() {
  const period = currentPayrollPeriod();
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month, 10)).toISOString().slice(0, 10);
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
const activeTab = ref(activeSection === "perpajakan" ? "pajak" : "sdm");
const isBpjsView = computed(() => activeSection === "sdm-bpjs");
const isDivisiJabatanView = computed(
  () => activeSection === "sdm-divisi-jabatan",
);
const isRiwayatPenggajianView = computed(
  () => activeSection === "sdm-riwayat-penggajian",
);
const isProsesPayrollView = computed(
  () => activeSection === "sdm-proses-payroll",
);
const isSdmFullPageView = computed(
  () =>
    isBpjsView.value ||
    isDivisiJabatanView.value ||
    isRiwayatPenggajianView.value ||
    isProsesPayrollView.value,
);
type EmployeeStatusFilter = "all" | "active" | "inactive";
const searchQuery = ref("");
const employeeStatusFilter = ref<EmployeeStatusFilter>("all");
const employeeStatusFilterOptions: Array<{
  value: EmployeeStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];
const taxTableTab = ref("unpaid"),
  updateTaxTableTab = (next) => (taxTableTab.value = next);
const taxTypeFilter = ref("Semua"),
  updateTaxTypeFilter = (next) => (taxTypeFilter.value = next);
const taxSearchQuery = ref(""),
  updateTaxSearchQuery = (next) => (taxSearchQuery.value = next); // Modals toggle
const employeePage = ref(1);
const updateSearchQuery = (next) => {
  searchQuery.value = next;
  employeePage.value = 1;
};
const updateEmployeeStatusFilter = (next: EmployeeStatusFilter) => {
  employeeStatusFilter.value = next;
  employeePage.value = 1;
};
const employeeStatusFilterButtonClass = (value: EmployeeStatusFilter) => {
  if (employeeStatusFilter.value !== value)
    return "employee-status-filter-idle";
  if (value === "active") return "employee-status-filter-active";
  if (value === "inactive") return "employee-status-filter-inactive";
  return "employee-status-filter-all";
};
const masterPage = ref(1);
const taxPage = ref(1);
const payrollHistoryPage = ref(1);
const pagedPayrollHistory = computed(() =>
  pageRows(payrollHistory.value, payrollHistoryPage.value),
);
const isBpjsModalOpen = ref(false);
const isBpjsSaving = ref(false);
const isBpjsResetting = ref(false);
function updateIsBpjsModalOpen(next: boolean) {
  if (next) {
    syncBpjsRateSnapshot();
    resetBpjsRateErrors();
  } else {
    restoreBpjsRateSnapshot();
  }
  isBpjsModalOpen.value = next;
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
const employeeDeleteUsage = ref<any>(null);
const employeeDeleteUsageLoading = ref(false);
const isMasterDataModalOpen = ref(false);
const isMasterEditorOpen = ref(false);
const masterDataTab = ref<"division" | "position">("division");
const masterSearch = ref("");
const masterBusy = ref(false);
const masterSaveWarning = ref("");
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
const payrollBulkConfirmation = ref<any>(null);
const isTaxPayModalOpen = ref(false),
  updateIsTaxPayModalOpen = (next) => (isTaxPayModalOpen.value = next);
const isTaxManualModalOpen = ref(false),
  updateIsTaxManualModalOpen = (next) => (isTaxManualModalOpen.value = next);
const selectedTaxDetail = ref<any>(null);
const editingTax = ref<any>(null);
const taxEditForm = ref({
  jenis: "PPh 21",
  period: "",
  nominal: 0,
  dueDate: "",
  taxNumber: "",
  notes: "",
});
const updateTaxEditForm = (next: any) => {
  taxEditForm.value = next;
};
const isTaxEditSubmitting = ref(false);
const isManualTaxSubmitting = ref(false);
const taxEditError = ref("");
const taxDeleteConfirm = ref<any>(null);
const isTaxDeleting = ref(false);
const taxDeleteError = ref("");
const payslipPreview = ref<any>(null);

const isAnySdmModalOpen = computed(
  () =>
    isBpjsModalOpen.value ||
    isEmployeeModalOpen.value ||
    isMasterDataModalOpen.value ||
    isPayrollModalOpen.value ||
    isPayrollHistoryOpen.value ||
    Boolean(payrollBulkConfirmation.value) ||
    isTaxPayModalOpen.value ||
    isTaxManualModalOpen.value ||
    Boolean(selectedTaxDetail.value) ||
    Boolean(editingTax.value) ||
    Boolean(taxDeleteConfirm.value) ||
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
  hasCalculatedDraft = ref(false),
  updateTaxCalculation = (next) => {
    taxCalculation.value = next;
    hasCalculatedDraft.value = false;
  };
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

type BpjsRateValues = {
  healthCompany: number;
  healthEmployee: number;
  jhtCompany: number;
  jhtEmployee: number;
  jpCompany: number;
  jpEmployee: number;
};

function currentBpjsRateValues(): BpjsRateValues {
  return {
    healthCompany: asNumber(bpjsKesEmployer.value),
    healthEmployee: asNumber(bpjsKesEmployee.value),
    jhtCompany: asNumber(bpjsJhtEmployer.value),
    jhtEmployee: asNumber(bpjsJhtEmployee.value),
    jpCompany: asNumber(bpjsJpEmployer.value),
    jpEmployee: asNumber(bpjsJpEmployee.value),
  };
}

const bpjsRateSnapshot = ref<BpjsRateValues>(currentBpjsRateValues());

function applyBpjsRateValues(values: BpjsRateValues) {
  updateBpjsKesEmployer(asNumber(values.healthCompany));
  updateBpjsKesEmployee(asNumber(values.healthEmployee));
  updateBpjsJhtEmployer(asNumber(values.jhtCompany));
  updateBpjsJhtEmployee(asNumber(values.jhtEmployee));
  updateBpjsJpEmployer(asNumber(values.jpCompany));
  updateBpjsJpEmployee(asNumber(values.jpEmployee));
}

function syncBpjsRateSnapshot() {
  bpjsRateSnapshot.value = currentBpjsRateValues();
}

function restoreBpjsRateSnapshot() {
  applyBpjsRateValues(bpjsRateSnapshot.value);
  resetBpjsRateErrors();
}

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
    tanggalBergabung: todayIso(),
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
const employeeBaseSalaryInputValue = computed(() =>
  formatRupiahInput(employeeForm.value.gajiPokok, false, false),
);

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
  { key: "email", id: "employee-email", label: "Email", type: "email" },
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
});
const isPayrollProcessing = ref(false);
const payrollProcessError = ref("");
const payrollConfirmation = ref<any>(null);

type PayrollFormFieldKey =
  | "employeeId"
  | "payrollPeriod"
  | "paymentDate"
  | "cashAccountId"
  | "overtimeAmount"
  | "allowanceAmount"
  | "bonusAmount"
  | "loanDeduction"
  | "otherDeduction";

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
    key: "cashAccountId",
    id: "payroll-source-bank",
    label: "Sumber rekening dana payout",
  },
];

const payrollFormErrorMessages = computed(() =>
  Object.values(payrollFormErrors.value).filter(Boolean),
);

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
const openTaxPaymentForTax = (tax: any) => {
  updateSelectedTaxId(tax.id);
  updateTaxPaymentAccount(taxPaymentCashAccounts.value[0]?.kode || "1001");
  updateIsTaxPayModalOpen(true);
};
const taxInputPeriod = (tax: any) => {
  const rawPeriod = tax?._raw?.tax_period || tax?.rawPeriod || "";
  if (/^\d{4}-\d{2}$/.test(String(rawPeriod))) return rawPeriod;
  const dueDate = tax?.jatuhTempo || tax?._raw?.due_date || "";
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dueDate))
    ? String(dueDate).slice(0, 7)
    : currentPayrollPeriod();
};
const openTaxDetail = (tax: any) => {
  selectedTaxDetail.value = tax;
};
const closeTaxDetail = () => {
  selectedTaxDetail.value = null;
};
const openTaxEdit = (tax: any) => {
  editingTax.value = tax;
  taxEditError.value = "";
  updateTaxEditForm({
    jenis: tax.jenis || "PPh 21",
    period: taxInputPeriod(tax),
    nominal: asNumber(tax.nominal),
    dueDate: tax.jatuhTempo || tax?._raw?.due_date || "",
    taxNumber: tax.ntpn || tax?._raw?.tax_number || "",
    notes: tax?._raw?.notes || "",
  });
};
const closeTaxEdit = () => {
  editingTax.value = null;
  taxEditError.value = "";
  isTaxEditSubmitting.value = false;
};
const handleUpdateTax = async () => {
  if (isTaxEditSubmitting.value || !editingTax.value) return;

  const nominal = asNumber(taxEditForm.value.nominal);
  if (!taxEditForm.value.period || !taxEditForm.value.dueDate || nominal <= 0) {
    taxEditError.value = "Lengkapi jenis pajak, periode, nominal, dan jatuh tempo.";
    return;
  }

  isTaxEditSubmitting.value = true;
  taxEditError.value = "";
  try {
    await financeApi.put(`/taxes/${editingTax.value.id}`, {
      tax_type: taxEditForm.value.jenis,
      tax_period: taxEditForm.value.period,
      tax_number: taxEditForm.value.taxNumber,
      amount: nominal,
      due_date: taxEditForm.value.dueDate,
      notes: taxEditForm.value.notes,
    });
    await refreshData();
    notify("Data pajak berhasil diperbarui.");
    closeTaxEdit();
  } catch (error) {
    taxEditError.value = getApiErrorMessage(error, "Gagal memperbarui data pajak.");
  } finally {
    isTaxEditSubmitting.value = false;
  }
};
const requestDeleteTax = (tax: any) => {
  taxDeleteConfirm.value = tax;
  taxDeleteError.value = "";
};
const closeTaxDelete = () => {
  taxDeleteConfirm.value = null;
  taxDeleteError.value = "";
  isTaxDeleting.value = false;
};
const handleDeleteTax = async () => {
  if (isTaxDeleting.value || !taxDeleteConfirm.value) return;
  isTaxDeleting.value = true;
  taxDeleteError.value = "";
  try {
    await financeApi.delete(`/taxes/${taxDeleteConfirm.value.id}`);
    await refreshData();
    notify("Data pajak berhasil dihapus.");
    closeTaxDelete();
  } catch (error) {
    taxDeleteError.value = getApiErrorMessage(error, "Gagal menghapus data pajak.");
  } finally {
    isTaxDeleting.value = false;
  }
};
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
  if (isManualTaxSubmitting.value) return;

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

  isManualTaxSubmitting.value = true;
  try {
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
  } finally {
    isManualTaxSubmitting.value = false;
  }
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
  syncBpjsRateSnapshot();

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

// Kode tidak diketik manual (dan tidak lagi diturunkan dari nama - lihat
// divisions.js / positions.js) - untuk data baru, kode sebenarnya diambil
// dari backend (endpoint /next-code) supaya yang ditampilkan bukan
// placeholder, tapi kode yang benar-benar akan tersimpan; untuk data yang
// sudah ada, tampilkan kode aslinya (read-only).
const masterDataNextCodePreview = ref("");
const masterDataCodePreview = computed(() => {
  if (masterDataForm.value.id) {
    return masterDataForm.value.code || "-";
  }
  return masterDataNextCodePreview.value || "...";
});
async function loadMasterDataNextCode(type: "division" | "position") {
  try {
    const response = await financeApi.get(`${masterEndpoint(type)}/next-code`);
    masterDataNextCodePreview.value = response?.code || "";
  } catch {
    masterDataNextCodePreview.value = "";
  }
}


function resetMasterDataForm(
  type: "division" | "position" = masterDataTab.value,
  openEditor = true,
) {
  editingMasterData.value = null;
  masterSaveWarning.value = "";
  masterDataForm.value = {
    id: "",
    type,
    code: "",
    name: "",
    description: "",
    status: "active",
    divisionId: "",
  };
  masterDataNextCodePreview.value = "";
  loadMasterDataNextCode(type);
  isMasterEditorOpen.value = openEditor;
}

function changeMasterTab(type: "division" | "position") {
  masterDataTab.value = type;
  masterSearch.value = "";
  resetMasterDataForm(type, false);
}

function closeMasterEditor() {
  isMasterEditorOpen.value = false;
  editingMasterData.value = null;
  masterSaveWarning.value = "";
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

 
async function saveMasterData(event: Event) {
  event.preventDefault();
  if (masterBusy.value) return;
  masterSaveWarning.value = "";
  const form = masterDataForm.value;
  const name = String(form.name || "").trim();
  if (!name) {
    notify(`Nama ${masterLabel(form.type).toLowerCase()} wajib diisi.`);
    return;
  }
  masterBusy.value = true;
  try {
    const payload: any = {
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
      numericValue > 20
    ) {
      nextErrors[field.key] = `${field.label} harus berupa persentase iuran 0 sampai 20, bukan pembagian porsi.`;
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
  if (isBpjsSaving.value || isBpjsResetting.value) return;
  if (!validateBpjsRates()) {
    notify("Lengkapi seluruh tarif BPJS sebelum menyimpan.");
    return;
  }

  isBpjsSaving.value = true;
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
  } finally {
    isBpjsSaving.value = false;
  }
}

async function handleResetBpjs() {
  if (isBpjsSaving.value || isBpjsResetting.value) return;
  isBpjsResetting.value = true;
  try {
    await financeApi.post("/bpjs-config/reset", {});
    await refreshMasterData();
    resetBpjsRateErrors();
    notify("Tarif BPJS berhasil direset ke nilai resmi.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal mereset tarif BPJS."));
  } finally {
    isBpjsResetting.value = false;
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
  updateEmployeeForm({
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

function employeeStatusKey(employee: any): "active" | "inactive" {
  const raw = employee?._raw || {};
  const status = String(
    raw.employment_status || raw.status || employee?.status || "active",
  ).toLowerCase();
  return status === "inactive" || status === "nonaktif" ? "inactive" : "active";
}

function employeeCanBeDeleted() {
  if (employeeDeleteUsageLoading.value) return false;
  if (!employeeDeleteUsage.value) return true;
  return Boolean(employeeDeleteUsage.value.can_delete);
}

function employeeDeleteBlockReasons() {
  const usage = employeeDeleteUsage.value || {};
  const reasons = [];
  if (asNumber(usage.payroll_count) > 0) {
    reasons.push(`${asNumber(usage.payroll_count)} riwayat payroll`);
  }
  if (asNumber(usage.project_count) > 0) {
    reasons.push(`${asNumber(usage.project_count)} proyek CRM`);
  }
  return reasons;
}

async function handleDeleteEmployee(employee: any) {
  const employeeId = employeeDatabaseId(employee);
  if (!employeeId) {
    notify("ID pegawai tidak valid. Muat ulang halaman lalu coba lagi.");
    return;
  }
  employeeDeleteConfirm.value = employee;
  employeeDeleteUsage.value = null;
  employeeDeleteUsageLoading.value = true;
  try {
    employeeDeleteUsage.value = await financeApi.get(
      `/employees/${employeeId}/usage`,
    );
  } catch (error) {
    employeeDeleteUsage.value = null;
    notify(
      getApiErrorMessage(
        error,
        "Pemakaian pegawai belum dapat diperiksa. Sistem tetap akan memvalidasi saat aksi dijalankan.",
      ),
    );
  } finally {
    employeeDeleteUsageLoading.value = false;
  }
}

function closeEmployeeDeleteConfirm() {
  employeeDeleteConfirm.value = null;
  employeeDeleteUsage.value = null;
  employeeDeleteUsageLoading.value = false;
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
    if (!employeeCanBeDeleted()) {
      notify("Pegawai tidak bisa dihapus karena masih dipakai data operasional. Gunakan status Nonaktif lewat form Ubah.");
      return;
    }

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
        "Pegawai tidak dapat dihapus. Nonaktifkan pegawai yang sudah memiliki riwayat payroll atau proyek.",
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

function printPayslip(detail: any) {
  const gross =
    asNumber(detail.gross_salary) ||
    asNumber(detail.base_salary) +
      asNumber(detail.overtime_amount) +
      asNumber(detail.allowance_amount) +
      asNumber(detail.bonus_amount);
  const rows = [
    ["Gaji pokok", formatRupiah(asNumber(detail.base_salary))],
    ["Lembur", formatRupiah(asNumber(detail.overtime_amount))],
    ["Tunjangan", formatRupiah(asNumber(detail.allowance_amount))],
    ["Bonus", formatRupiah(asNumber(detail.bonus_amount))],
    ["Penghasilan bruto", formatRupiah(gross)],
    ["BPJS pegawai", `- ${formatRupiah(asNumber(detail.employee_bpjs_deduction))}`],
    ["PPh 21 otomatis", `- ${formatRupiah(asNumber(detail.pph21_amount))}`],
    ["Kasbon", `- ${formatRupiah(asNumber(detail.loan_deduction))}`],
    ["Potongan lain", `- ${formatRupiah(asNumber(detail.other_deduction))}`],
  ];
  const bodyHtml = `
    <table>
      <thead><tr><th>Komponen</th><th class="numeric">Nominal</th></tr></thead>
      <tbody>
        ${rows
          .map(
            (row) => `<tr>
          <td>${escapeHtml(row[0])}</td>
          <td class="numeric">${escapeHtml(row[1])}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
  const html = buildPrintDocumentHtml({
    documentLabel: "Slip Gaji",
    title: "Rincian Payroll - Sudah Diposting",
    subtitle: `${detail.employee_name || "-"} - ${detail.payroll_period || "-"}`,
    metaItems: [
      { label: "Pegawai", value: detail.employee_name || "-" },
      { label: "Periode", value: detail.payroll_period || "-" },
      { label: "Tanggal Bayar", value: detail.payment_date || "-" },
      { label: "Voucher", value: detail.voucher_number || "-" },
    ],
    bodyHtml,
    summaryItems: [
      {
        label: "Gaji Bersih Diterima",
        value: formatRupiah(asNumber(detail.net_pay)),
        emphasize: true,
      },
    ],
  });
  if (openPrintPopup(html, { notify, blockedMessage: "Popup print diblokir browser. Izinkan popup untuk mencetak slip gaji." })) {
    notify(`Dialog cetak slip gaji ${detail.employee_name || ""} dibuka.`);
  }
}

function openPayslipPrint() {
  const slip = payslipPreview.value;
  if (!slip) return;
  printPayslip(slip);
}

function closePayrollResult() {
  payslipPreview.value = null;
  updateIsPayrollModalOpen(false);
}

function payrollBulkReadyRows() {
  return Array.isArray(payrollBulkConfirmation.value?.ready)
    ? payrollBulkConfirmation.value.ready
    : [];
}

function payrollBulkSkippedRows() {
  return Array.isArray(payrollBulkConfirmation.value?.skipped)
    ? payrollBulkConfirmation.value.skipped
    : [];
}

function closePayrollBulkConfirmation() {
  payrollBulkConfirmation.value = null;
}

function validatePayrollFields(includeEmployee = true) {
  return validatePayrollForm(includeEmployee);
}

function payrollRequestPayload() {
  return {
    employee_id: Number(payrollForm.value.employeeId),
    payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
    payment_date: payrollForm.value.paymentDate || todayIso(),
    cash_account_id: Number(payrollForm.value.cashAccountId),
    overtime_amount: asNumber(payrollForm.value.overtimeAmount),
    allowance_amount: asNumber(payrollForm.value.allowanceAmount),
    bonus_amount: asNumber(payrollForm.value.bonusAmount),
    loan_deduction: asNumber(payrollForm.value.loanDeduction),
    other_deduction: asNumber(payrollForm.value.otherDeduction),
    notes: "Payroll diproses dari workspace FinStart.",
  };
}

async function handleProcessPayroll() {
  if (isPayrollProcessing.value) return;
  payrollProcessError.value = "";
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
  isPayrollProcessing.value = true;
  try {
    payrollConfirmation.value = await financeApi.post(
      "/payroll/preview",
      payrollRequestPayload(),
    );
  } catch (error) {
    payrollProcessError.value = getApiErrorMessage(
      error,
      "Gagal menyiapkan rincian payroll.",
    );
    notify(payrollProcessError.value);
  } finally {
    isPayrollProcessing.value = false;
  }
}

async function printAndPostPayroll() {
  await confirmProcessPayroll(true);
}

async function confirmProcessPayroll(downloadAfterPosting = false) {
  if (isPayrollProcessing.value) return;
  payrollProcessError.value = "";
  isPayrollProcessing.value = true;
  try {
    const result = await financeApi.post(
      "/payroll/process",
      payrollRequestPayload(),
    );
    payrollConfirmation.value = null;
    try {
      payslipPreview.value = await financeApi.get(
        `/payroll/${result.id}/payslip`,
      );
    } catch {
      payslipPreview.value = result;
    }
    if (downloadAfterPosting) printPayslip(payslipPreview.value);
    await refreshAllData();
    notify(
      `Payroll ${result.employee_name || "pegawai"} berhasil diposting. Payslip tersedia untuk dicetak.`,
    );
  } catch (error) {
    console.error(error);
    payrollConfirmation.value = null;
    payrollProcessError.value = getApiErrorMessage(
      error,
      "Gagal memproses payroll.",
    );
    notify(payrollProcessError.value);
  } finally {
    isPayrollProcessing.value = false;
  }
}

async function handleProcessPayrollBulk() {
  if (isPayrollProcessing.value) return;
  payrollProcessError.value = "";
  if (!validatePayrollFields(false)) {
    notify("Lengkapi seluruh data payroll sebelum memproses massal.");
    return;
  }
  const cashAccountId = Number(payrollForm.value.cashAccountId);
  if (!cashAccountId)
    return notify("Pilih akun Kas/Bank sebelum memproses payroll massal.");
  isPayrollProcessing.value = true;
  try {
    payrollBulkConfirmation.value = await financeApi.post("/payroll/preview-bulk", {
      payroll_period: payrollForm.value.payrollPeriod || currentPayrollPeriod(),
      payment_date: payrollForm.value.paymentDate || todayIso(),
      cash_account_id: cashAccountId,
      notes: "Payroll massal diproses dari workspace FinStart.",
    });
    if (!payrollBulkReadyRows().length) {
      notify("Tidak ada pegawai yang siap digaji untuk periode ini. Cek tabel pegawai yang diskip.");
    }
  } catch (error) {
    payrollProcessError.value = getApiErrorMessage(
      error,
      "Gagal menyiapkan konfirmasi payroll massal.",
    );
    notify(payrollProcessError.value);
  } finally {
    isPayrollProcessing.value = false;
  }
}

async function confirmProcessPayrollBulk() {
  if (isPayrollProcessing.value || !payrollBulkReadyRows().length) return;
  const cashAccountId = Number(payrollForm.value.cashAccountId);
  if (!cashAccountId)
    return notify("Pilih akun Kas/Bank sebelum memproses payroll massal.");
  isPayrollProcessing.value = true;
  try {
    const result = await financeApi.post("/payroll/process-bulk", {
      payroll_period:
        payrollBulkConfirmation.value?.payroll_period ||
        payrollForm.value.payrollPeriod ||
        currentPayrollPeriod(),
      payment_date:
        payrollBulkConfirmation.value?.payment_date ||
        payrollForm.value.paymentDate ||
        todayIso(),
      cash_account_id: cashAccountId,
      notes: "Payroll massal diproses dari workspace FinStart.",
    });
    payrollBulkConfirmation.value = null;
    updateIsPayrollModalOpen(false);
    await refreshAllData();
    notify(
      `Payroll massal selesai: ${(result.processed || []).length} pegawai diproses, ${(result.skipped || []).length} dilewati.`,
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memproses payroll massal."));
  } finally {
    isPayrollProcessing.value = false;
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
          .map(csvEscape)
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
      const matchesSearch = haystack.includes(searchQuery.value.toLowerCase());
      const matchesStatus =
        employeeStatusFilter.value === "all" ||
        employeeStatusKey(p) === employeeStatusFilter.value;
      return matchesSearch && matchesStatus;
    }),
  ),
);
const pagedEmployees = computed(() =>
  pageRows(filteredEmployees.value, employeePage.value),
);
const totalTaxesOwed = computed(() =>
  taxes.value
    .filter((t) => t.status === "Belum Setor")
    .reduce((acc, t) => acc + t.nominal, 0),
);
const overdueTaxCount = computed(
  () =>
    taxes.value.filter(
      (t) => t.status === "Belum Setor" && new Date(t.jatuhTempo) < new Date(),
    ).length,
);
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
const taxStatusBadgeClass = (tax: any) => {
  const base =
    "mx-auto inline-flex min-w-[104px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-center text-[10px] font-semibold leading-none";
  return tax.status === "Belum Setor"
    ? `${base} border border-amber-200 bg-amber-50 text-amber-700`
    : `${base} border border-emerald-200 bg-emerald-50 text-emerald-700`;
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
    `finstart-pajak-${todayIso()}.csv`,
    csvRows.map((row) => row.map(csvEscape).join(",")).join("\n"),
  );
  notify(`CSV pajak berhasil dibuat (${rows.length} data).`);
};
const printTaxReport = () => {
  const rows = currentTaxDocumentRows();
  const bodyHtml = `
    <table>
      <thead>
        <tr><th>Jenis</th><th>Periode</th><th>Keterangan</th><th class="numeric">Nominal</th><th>Jatuh Tempo</th><th>Status</th><th>NTPN</th></tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (tax: any) => `<tr>
          <td>${escapeHtml(tax.jenis)}</td>
          <td>${escapeHtml(tax.masaPajak)}</td>
          <td>${escapeHtml(taxDescription(tax.jenis, tax.masaPajak))}</td>
          <td class="numeric">${escapeHtml(formatRupiah(tax.nominal))}</td>
          <td>${escapeHtml(formatTaxDate(tax.jatuhTempo))}</td>
          <td>${escapeHtml(tax.status)}</td>
          <td>${escapeHtml(tax.ntpn || "-")}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`;
  const html = buildPrintDocumentHtml({
    documentLabel: "Laporan Pajak",
    title: "Laporan Kewajiban Pajak",
    subtitle: `${rows.length} kewajiban pajak tercatat`,
    bodyHtml,
    summaryItems: [
      {
        label: "Total Belum Dibayar",
        value: formatRupiah(totalTaxesOwed.value),
        emphasize: true,
      },
    ],
  });
  if (openPrintPopup(html, { notify, blockedMessage: "Popup print diblokir browser. Izinkan popup untuk mencetak laporan pajak." })) {
    notify("Dialog cetak laporan pajak dibuka.");
  }
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
const taxCalculationBase = computed(() =>
  taxCalculation.value.base === "Pendapatan"
    ? Number(taxCalculationData?.revenue || 0)
    : taxCalculation.value.base === "Laba Bersih"
      ? Math.max(Number(taxCalculationData?.net_profit || 0), 0)
      : Number(taxCalculationData?.expense || taxSummary?.total_unpaid || 0),
);
const calculatedTax = computed(() =>
  Math.round(
    (taxCalculationBase.value * (Number(taxCalculation.value.rate) || 0)) /
      100,
  ),
);
const handleCreateTaxDraft = async () => {
  if (!calculatedTax.value || !taxCalculation.value.dueDate) {
    notify("Nominal hasil kalkulasi dan jatuh tempo harus tersedia.");
    return;
  }
  hasCalculatedDraft.value = true;
  await createTax({
    jenis: taxCalculation.value.jenis,
    masaPajak: taxCalculation.value.period,
    nominal: calculatedTax.value,
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
const taxCards = computed(() => [
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
]);
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
      asNumber(payrollForm.value.loanDeduction) -
      asNumber(payrollForm.value.otherDeduction),
  );

onMounted(() => {
  refreshMasterData();
});
function openManualTaxModal() {
  resetManualTaxForm();
  updateIsTaxManualModalOpen(true);
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

const taxPaymentCashAccounts = computed(() =>
  (props.akun || []).filter(
    (account) =>
      account.tipe === "Aset" &&
      String(account.status || "active") === "active" &&
      /\b(kas|bank)\b/i.test(account.nama || ""),
  ),
);

</script>

<style>
.tax-action-button {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-radius: 0.625rem;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease,
    opacity 160ms ease;
}

.payroll-bulk-count-badge {
  display: inline-flex;
  min-width: 76px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  background: #ffffff;
  padding: 0 12px;
  color: #061a40 !important;
  font-size: 10px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.payroll-bulk-modal-card {
  width: min(820px, calc(100vw - 48px)) !important;
  max-width: min(820px, calc(100vw - 48px)) !important;
  max-height: min(86vh, 720px) !important;
  font-size: 12px;
}

@media (max-width: 767px) {
  .payroll-bulk-modal-card {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px) !important;
    max-height: calc(100dvh - 24px) !important;
  }
}

.employee-status-filter-idle {
  background: transparent !important;
  color: #53658a !important;
}

.employee-status-filter-idle:hover {
  background: #ffffff !important;
}

.employee-status-filter-all {
  background: #0b1f4a !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(11, 31, 74, 0.16) !important;
}

.employee-status-filter-active {
  background: #1d4ed8 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.2) !important;
}

.employee-status-filter-inactive {
  background: #e11d48 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.2) !important;
}

.employee-status-pill-active {
  border-color: #93c5fd !important;
  background: #dbeafe !important;
  color: #1d4ed8 !important;
}

.employee-status-pill-inactive {
  border-color: #fda4af !important;
  background: #ffe4e6 !important;
  color: #be123c !important;
}

.tax-filter-control {
  font-family: inherit !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  line-height: 1 !important;
}

.tax-filter-control::placeholder {
  font: inherit !important;
  color: #9aa9bc !important;
}

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

.payroll-history-card h2 {
  font-size: 18px !important;
  line-height: 1.25 !important;
}

.payroll-history-card p {
  font-size: 12px !important;
  line-height: 1.35 !important;
}

.payroll-history-card > div:last-child button {
  min-width: 86px;
  height: 44px !important;
  border-radius: 13px !important;
  font-size: 14px !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
}

.payroll-history-table {
  font-size: 13px !important;
  line-height: 1.35 !important;
}

.payroll-history-table thead th {
  padding: 13px 22px !important;
  color: #102a56 !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  line-height: 1.25 !important;
}

.payroll-history-table tbody td {
  padding: 14px 22px !important;
  font-size: 13px !important;
  line-height: 1.35 !important;
}

.payroll-history-table tbody td,
.payroll-history-table tbody td span,
.payroll-history-table tbody td strong {
  font-size: 13px !important;
}

.payroll-history-table tbody td span.text-\[10px\] {
  font-size: 11px !important;
}

.payroll-history-table tbody td .rounded-full {
  min-height: 26px;
  align-items: center;
  font-size: 11px !important;
  line-height: 1 !important;
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
