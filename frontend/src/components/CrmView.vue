<template>
  <div class="crm-workspace space-y-6">
    <!-- Upper header action controls -->
    <div
      class="workspace-page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">
          <template v-if="isClientMasterView">Master Data Klien Partner</template>
          <template v-else>Manajemen CRM &amp; Proyek</template>
        </h1>
        <p class="text-xs text-slate-400 font-light mt-1">
          <template v-if="isClientMasterView">
            Kelola data perusahaan klien yang digunakan dalam proyek, invoice,
            dan laporan operasional.
          </template>
          <template v-else>
            Inisiasi proyek digital baru, alokasi pegawai SDM, dan lifecycle
            pekerjaan klien.
          </template>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          id="btn-tambah-crm"
          class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-md transition-all"
          @click="openCreateModal"
        >
          <Plus class="w-4 h-4" /><template v-if="!isClientMasterView && activeSubTab === 'proyek'"
            >Inisiasi Proyek Baru</template
          ><template v-else>Registrasi Klien Baru</template>
        </button>
      </div>
    </div>
    <!-- 1. Proyek Sub-Tab layout -->
    <div
      v-if="activeSubTab === 'proyek'"
      class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div
        class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="relative w-full lg:w-80">
          <span
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"
            ><Search class="w-4 h-4" /></span
          ><input
            id="crm-search-box"
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama proyek atau klien..."
            class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
          />
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-[#6B7A90]"
            ><Filter class="mr-1 inline h-3.5 w-3.5" />Status:</span
          ><button
            v-for="status in ['All', 'Planning', 'Ongoing', 'Completed']"
            :id="`status-filter-${status}`"
            :key="status"
            :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition ${statusFilter === status ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
            @click="setStatusFilter(status)"
          >
            {{ status }}
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="crm-client-table w-full text-left text-xs text-slate-500">
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-4">Info Proyek</th>
              <th class="p-4">Klien &amp; Tim Alokasi</th>
              <th class="p-4">Nilai Kontrak</th>
              <th class="p-4 text-center">Status</th>
              <th class="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr v-if="renderContext.filteredProjects.length === 0">
              <td
                :colspan="5"
                class="p-12 text-center text-slate-400 font-light"
              >
                Tidak ada proyek yang sesuai dengan kriteria pencarian.
              </td>
            </tr>
            <template v-else
              ><tr
                v-for="proj in renderContext.filteredProjects"
                :key="proj.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4 space-y-1">
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    proj.nama
                  }}</span>
                  <div
                    class="flex items-center gap-3 text-[10px] text-slate-400"
                  >
                    <span class="font-semibold">{{ proj.tipeTender }}</span
                    ><span>•</span
                    ><span class="font-mono"
                      >{{ proj.tanggalMulai }} s/d
                      {{ proj.tanggalSelesai }}</span
                    >
                  </div>
                </td>
                <td class="p-4 space-y-1.5">
                  <span class="font-bold text-slate-700 block">{{
                    getProjectClientName(proj.klienId)
                  }}</span>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-if="proj.tim.length === 0"
                      class="text-[10px] text-slate-400 italic"
                      >Belum ada alokasi tim</span
                    ><template v-else
                      ><span
                        v-for="(t, i) in proj.tim"
                        :key="i"
                        class="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-md"
                        :title="`${t.jabatan} - ${t.alokasiPersen}% Alokasi`"
                        >{{ t.nama }}</span
                      ></template
                    >
                  </div>
                </td>
                <td class="p-4 font-mono font-bold text-slate-800 text-sm">
                  {{ formatRupiah(proj.nilaiKontrak) }}
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : proj.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`"
                    >{{ proj.status }}</span
                  >
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      :aria-label="`Lihat detail ${proj.nama}`"
                      class="crm-action-button detail"
                      title="Detail"
                      @click="showProjectDetails(proj)"
                    >
                      <Eye class="w-4 h-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Edit ${proj.nama}`"
                      class="crm-action-button edit"
                      title="Edit"
                      @click="openEditProjectModal(proj)"
                    >
                      <Edit3 class="w-4 h-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Hapus ${proj.nama}`"
                      class="crm-action-button danger"
                      title="Hapus"
                      @click="openProjectDeleteConfirm(proj)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td></tr
            ></template>
          </tbody>
        </table>
      </div>
      <TablePagination
        :page="projectPage"
        :total="filteredProjectsList.length"
        @page-change="handleProjectPageChange"
      />
    </div>
    <!-- 2. Klien Sub-Tab layout -->
    <div
      v-if="activeSubTab === 'klien'"
      class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div
        class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="relative w-full sm:w-80">
          <span
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"
            ><Search class="w-4 h-4" /></span
          ><input
            id="crm-search-box"
            type="text"
            v-model="searchQuery"
            placeholder="Cari perusahaan klien atau PIC..."
            class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
          />
        </div>
        <span class="text-xs text-[#6B7A90]"
          >{{ renderContext.filteredClients.length }} klien ditampilkan</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-500">
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-4">Nama Perusahaan</th>
              <th class="p-4">Kategori Industri</th>
              <th class="p-4">Lokasi Kantor</th>
              <th class="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr v-if="renderContext.filteredClients.length === 0">
              <td
                :colspan="4"
                class="p-12 text-center text-slate-400 font-light"
              >
                Belum ada klien yang terdaftar.
              </td>
            </tr>
            <template v-else
              ><tr
                v-for="c in renderContext.filteredClients"
                :key="c.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4">
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    c.namaPerusahaan
                  }}</span
                  ><span class="text-[10px] text-slate-400 font-mono">{{
                    c.id
                  }}</span>
                </td>
                <td class="p-4 text-slate-600 font-semibold">{{ c.bidang }}</td>
                <td class="p-4 text-slate-500">
                  <span class="flex items-center gap-1"
                    ><MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />{{
                      c.lokasi
                    }}</span
                  >
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      :aria-label="`Lihat detail ${c.namaPerusahaan}`"
                      class="crm-action-button detail"
                      title="Detail"
                      @click="showClientDetails(c)"
                    >
                      <Eye class="w-4 h-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Edit ${c.namaPerusahaan}`"
                      class="crm-action-button edit"
                      title="Edit"
                      @click="openEditClientModal(c)"
                    >
                      <Edit3 class="w-4 h-4" /></button
                    ><button
                      type="button"
                      :aria-label="`Hapus ${c.namaPerusahaan}`"
                      class="crm-action-button danger"
                      title="Hapus"
                      @click="openClientDeleteConfirm(c)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td></tr
            ></template>
          </tbody>
        </table>
      </div>
      <TablePagination
        :page="clientPage"
        :total="filteredClientsList.length"
        @page-change="handleClientPageChange"
      />
    </div>
    <Teleport to="body"
      ><div
        v-if="renderContext.selectedProject || renderContext.selectedClient"
        class="crm-modal-layer fixed inset-0 bg-[#111827]/55 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 overflow-y-auto"
      >
        <div
          class="crm-detail-modal bg-white border border-slate-100 rounded-3xl w-full overflow-hidden shadow-2xl"
          style="width: min(1080px, calc(100vw - 40px)) !important; max-width: min(1080px, calc(100vw - 40px)) !important; height: auto !important; max-height: min(82vh, 680px) !important"
        >
          <div
            class="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100"
          >
            <div>
              <p
                class="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400"
              >
                Detail CRM
              </p>
              <h3
                class="mt-2 text-xl font-extrabold text-[#102A56] tracking-tight"
              >
                <template v-if="renderContext.selectedProject">{{
                  renderContext.selectedProject.nama
                }}</template
                ><template v-else>{{
                  renderContext.selectedClient?.namaPerusahaan
                }}</template>
              </h3>
              <p class="mt-2 text-xs text-slate-500 max-w-2xl">
                <template v-if="renderContext.selectedProject"
                  >Detail lengkap proyek dan alokasi tim dalam CRM.</template
                ><template v-else
                  >Detail profil klien, kontak PIC, dan proyek
                  terkait.</template
                >
              </p>
            </div>
            <button
              class="w-11 h-11 flex shrink-0 items-center justify-center rounded-2xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              @click="closeDetailModal"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div
            class="crm-detail-body overflow-y-auto p-5"
            style="max-height: calc(min(82vh, 680px) - 112px)"
          >
            <div class="space-y-5">
              <div
                v-if="renderContext.selectedProject"
                class="crm-project-detail-grid grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]"
              >
                <div class="crm-project-detail-main space-y-3">
                  <div
                    class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div
                      class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                    >
                      <div class="space-y-1.5">
                        <span
                          :class="`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${renderContext.selectedProject.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : renderContext.selectedProject.status === 'Ongoing' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`"
                          >{{ renderContext.selectedProject.status }}</span
                        >
                        <p
                          class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                        >
                          Tender
                        </p>
                        <p class="text-[13px] font-semibold text-slate-800">
                          {{ renderContext.selectedProject.tipeTender }}
                        </p>
                      </div>
                      <div class="md:text-right">
                        <p
                          class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                        >
                          Nilai Kontrak
                        </p>
                        <p
                          class="mt-1 text-xl font-extrabold leading-tight text-slate-900"
                        >
                          {{
                            formatRupiah(
                              renderContext.selectedProject.nilaiKontrak,
                            )
                          }}
                        </p>
                      </div>
                    </div>
                    <div class="mt-4 grid gap-3 md:grid-cols-2">
                      <div
                        class="rounded-2xl border border-slate-200 bg-white p-3"
                      >
                        <p
                          class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                        >
                          Periode
                        </p>
                        <p
                          class="mt-2 text-[13px] font-semibold text-slate-700"
                        >
                          {{ renderContext.selectedProject.tanggalMulai }} s/d
                          {{ renderContext.selectedProject.tanggalSelesai }}
                        </p>
                      </div>
                      <div
                        class="rounded-2xl border border-slate-200 bg-white p-3"
                      >
                        <p
                          class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                        >
                          PIC Proyek
                        </p>
                        <p
                          class="mt-2 text-[13px] font-semibold text-slate-700"
                        >
                          {{ renderContext.selectedProject.picKontak }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="grid gap-3 md:grid-cols-2">
                    <div
                      class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                    >
                      <p
                        class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600"
                      >
                        Kontrol Biaya
                      </p>
                      <div class="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <p class="text-[10px] text-slate-500">Anggaran</p>
                          <p class="mt-1 text-sm font-extrabold text-slate-900">
                            {{
                              formatRupiah(
                                renderContext.selectedProject.anggaran || 0,
                              )
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="text-[10px] text-slate-500">
                            Realisasi bill
                          </p>
                          <p class="mt-1 text-sm font-extrabold text-slate-900">
                            {{
                              formatRupiah(
                                renderContext.selectedProject.realisasiBiaya ||
                                  0,
                              )
                            }}
                          </p>
                        </div>
                        <div class="col-span-2 border-t border-blue-100 pt-2">
                          <p class="text-[10px] text-slate-500">
                            Sisa anggaran
                          </p>
                          <p
                            :class="`mt-1 text-sm font-extrabold ${(renderContext.selectedProject.selisihAnggaran || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`"
                          >
                            {{
                              formatRupiah(
                                renderContext.selectedProject.selisihAnggaran ||
                                  0,
                              )
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="crm-project-profit-card rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4"
                    >
                      <p
                        class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700"
                      >
                        Profitabilitas Proyek
                      </p>
                      <div class="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <p class="text-[10px] text-slate-500">
                            Invoice terbit
                          </p>
                          <p class="mt-1 text-sm font-extrabold text-slate-900">
                            {{
                              formatRupiah(
                                renderContext.selectedProject
                                  .realisasiPendapatan || 0,
                              )
                            }}
                          </p>
                        </div>
                        <div>
                          <p class="text-[10px] text-slate-500">Laba aktual</p>
                          <p
                            :class="`mt-1 text-sm font-extrabold ${(renderContext.selectedProject.labaAktual || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`"
                          >
                            {{
                              formatRupiah(
                                renderContext.selectedProject.labaAktual || 0,
                              )
                            }}
                          </p>
                        </div>
                        <div
                          class="col-span-2 border-t border-emerald-100 pt-2"
                        >
                          <p class="text-[10px] text-slate-500">
                            Proyeksi laba kontrak
                          </p>
                          <p
                            :class="`mt-1 text-sm font-extrabold ${(renderContext.selectedProject.proyeksiLaba || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`"
                          >
                            {{
                              formatRupiah(
                                renderContext.selectedProject.proyeksiLaba || 0,
                              )
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="crm-project-milestone-card rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <p
                        class="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700"
                      >
                        Milestone &amp; Deadline
                      </p>
                      <span class="text-[10px] font-semibold text-slate-500"
                        >{{
                          (renderContext.selectedProject.milestones || [])
                            .length
                        }}
                        tahapan</span
                      >
                    </div>
                    <p
                      v-if="
                        (renderContext.selectedProject.milestones || [])
                          .length === 0
                      "
                      class="mt-3 text-[12px] italic text-slate-500"
                    >
                      Belum ada milestone yang dicatat untuk proyek ini.
                    </p>
                    <div v-else class="mt-3 space-y-2">
                      <div
                        v-for="(milestone, index) in renderContext
                          .selectedProject.milestones || []"
                        :key="`${milestone.title}-${index}`"
                        class="crm-detail-milestone-row flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2"
                      >
                        <div>
                          <p class="text-xs font-bold text-slate-800">
                            {{ milestone.title }}
                          </p>
                          <p class="mt-0.5 text-[10px] text-slate-500">
                            Target: {{ milestone.due_date || "-" }}
                          </p>
                        </div>
                        <span
                          :class="`crm-detail-milestone-status rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${milestone.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : milestone.status === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`"
                          ><template v-if="milestone.status === 'completed'"
                            >Selesai</template
                          ><template v-else
                            ><template v-if="milestone.status === 'in_progress'"
                              >Berjalan</template
                            ><template v-else>Direncanakan</template></template
                          ></span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="grid gap-3">
                    <div
                      class="grid rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[170px_minmax(0,1fr)] md:items-center md:gap-5"
                    >
                      <p
                        class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                      >
                        Klien Partner
                      </p>
                      <div class="mt-2 md:mt-0">
                        <p class="text-[15px] font-bold text-slate-900">
                          {{
                            renderContext.selectedProjectClient
                              ?.namaPerusahaan || "Klien tidak ditemukan"
                          }}
                        </p>
                        <p class="mt-1 text-[13px] text-slate-500">
                          PIC:
                          {{
                            renderContext.selectedProjectClient?.pic ||
                            renderContext.selectedProject.picKontak
                          }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="grid rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[170px_minmax(0,1fr)] md:items-start md:gap-5"
                    >
                      <p
                        class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                      >
                        Catatan Proyek
                      </p>
                      <p
                        class="mt-2 text-[13px] text-slate-600 leading-relaxed md:mt-0"
                      >
                        {{
                          renderContext.selectedProject.catatan ||
                          "Tidak ada catatan tambahan saat ini."
                        }}
                      </p>
                    </div>
                  </div>
                  <div
                    class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p
                      class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"
                    >
                      Tim Terlibat
                    </p>
                    <p class="mt-1 text-[12px] leading-5 text-slate-500">
                      Bagian ini untuk mencatat anggota internal yang
                      dialokasikan ke proyek, termasuk role, persentase alokasi,
                      dan estimasi biaya tim.
                    </p>
                    <p
                      v-if="renderContext.selectedProject.tim.length === 0"
                      class="mt-3 text-[13px] text-slate-500 italic"
                    >
                      Belum ada anggota tim yang dialokasikan.
                    </p>
                    <div v-else class="mt-3 grid gap-2.5 2xl:grid-cols-2">
                      <div
                        v-for="(member, index) in renderContext.selectedProject
                          .tim"
                        :key="`${member.nama}-${index}`"
                        class="grid rounded-2xl border border-slate-100 bg-white p-3 md:grid-cols-[minmax(0,1fr)_150px] md:items-center md:gap-3"
                      >
                        <div>
                          <p class="text-sm font-semibold text-slate-900">
                            {{ member.nama }}
                          </p>
                          <p
                            class="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-400"
                          >
                            {{ member.jabatan }}
                          </p>
                        </div>
                        <p
                          class="mt-2 text-[10px] leading-4 text-slate-500 md:mt-0 md:text-right"
                        >
                          Alokasi {{ member.alokasiPersen }}%<br />Est. biaya
                          {{ formatRupiah(member.estimasiBiaya) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="crm-detail-sidebar space-y-3">
                  <div class="crm-detail-side-card">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="crm-detail-side-eyebrow">Ringkasan</p>
                        <h4 class="crm-detail-side-title">Snapshot Proyek</h4>
                      </div>
                      <span
                        :class="`crm-detail-status-pill ${renderContext.selectedProject.status === 'Completed' ? 'done' : renderContext.selectedProject.status === 'Ongoing' ? 'live' : 'plan'}`"
                        >{{ renderContext.selectedProject.status }}</span
                      >
                    </div>
                    <dl class="crm-detail-side-list">
                      <div>
                        <dt>Nilai kontrak</dt>
                        <dd>
                          {{ formatRupiah(renderContext.selectedProject.nilaiKontrak) }}
                        </dd>
                      </div>
                      <div>
                        <dt>Klien</dt>
                        <dd>
                          {{
                            renderContext.selectedProjectClient
                              ?.namaPerusahaan || "Klien tidak ditemukan"
                          }}
                        </dd>
                      </div>
                      <div>
                        <dt>Periode</dt>
                        <dd>
                          {{ renderContext.selectedProject.tanggalMulai }} s/d
                          {{ renderContext.selectedProject.tanggalSelesai }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div class="crm-detail-side-card">
                    <p class="crm-detail-side-eyebrow">Kapasitas</p>
                    <div class="crm-detail-side-stats">
                      <div>
                        <span>{{
                          (renderContext.selectedProject.milestones || [])
                            .length
                        }}</span>
                        <p>Milestone</p>
                      </div>
                      <div>
                        <span>{{ renderContext.selectedProject.tim.length }}</span>
                        <p>Anggota tim</p>
                      </div>
                    </div>
                    <dl class="crm-detail-side-list compact">
                      <div>
                        <dt>Tender</dt>
                        <dd>{{ renderContext.selectedProject.tipeTender }}</dd>
                      </div>
                      <div>
                        <dt>Anggaran</dt>
                        <dd>
                          {{ formatRupiah(renderContext.selectedProject.anggaran || 0) }}
                        </dd>
                      </div>
                      <div>
                        <dt>Sisa anggaran</dt>
                        <dd>
                          {{
                            formatRupiah(
                              renderContext.selectedProject.selisihAnggaran || 0,
                            )
                          }}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div
                    v-if="renderContext.selectedProjectClient"
                    class="crm-detail-side-card muted"
                  >
                    <p class="crm-detail-side-eyebrow">Klien terkait</p>
                    <button
                      type="button"
                      class="crm-detail-side-action secondary"
                      @click="showClientDetails(renderContext.selectedProjectClient)"
                    >
                      <Building class="h-4 w-4" /> Lihat klien partner
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="crm-client-detail-grid grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"
              >
                <div class="grid gap-4">
                  <div
                    class="rounded-[22px] border border-[#D8E5F4] bg-[#F8FBFE] p-5"
                  >
                    <p
                      class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7C8BA3]"
                    >
                      Bidang Industri
                    </p>
                    <h4 class="mt-3 text-xl font-extrabold text-[#0B1F4A]">
                      {{ renderContext.selectedClient?.bidang }}
                    </h4>
                    <p class="mt-3 text-sm font-medium text-[#52647E]">
                      {{ renderContext.selectedClient?.lokasi }}
                    </p>
                  </div>
                  <div class="rounded-[22px] border border-[#D8E5F4] bg-white p-5">
                    <p
                      class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7C8BA3]"
                    >
                      Detail Kontak PIC
                    </p>
                    <p class="mt-3 text-base font-extrabold text-[#0B1F4A]">
                      {{ renderContext.selectedClient?.pic }}
                    </p>
                    <p class="mt-3 flex items-center gap-2 text-sm font-medium text-[#52647E]">
                      <Mail class="h-4 w-4 shrink-0 text-[#0B1F4A]" />{{
                        renderContext.selectedClient?.email || "-"
                      }}
                    </p>
                    <p class="mt-1.5 flex items-center gap-2 text-sm font-medium text-[#52647E]">
                      <Phone class="h-4 w-4 shrink-0 text-[#0B1F4A]" />{{
                        renderContext.selectedClient?.telepon || "-"
                      }}
                    </p>
                  </div>
                </div>
                <div class="grid gap-4">
                  <div class="rounded-[22px] border border-[#D8E5F4] bg-white p-5">
                    <p
                      class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7C8BA3]"
                    >
                      Proyek Terhubung
                    </p>
                    <p
                      v-if="selectedClientProjects.length === 0"
                      class="mt-4 rounded-2xl border border-dashed border-[#D8E5F4] bg-[#F8FBFE] px-4 py-5 text-sm italic leading-6 text-[#52647E]"
                    >
                      Belum ada proyek yang terkait dengan klien ini.
                    </p>
                    <div v-else class="mt-4 space-y-3">
                      <div
                        v-for="project in selectedClientProjects"
                        :key="project.id"
                        class="rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] p-4"
                      >
                        <p class="font-bold text-[#0B1F4A]">
                          {{ project.nama }}
                        </p>
                        <p class="mt-2 text-[11px] font-medium text-[#52647E]">
                          {{ project.status }} · {{ project.tanggalMulai }} s/d
                          {{ project.tanggalSelesai }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 3. CRM PROJECT INITIATION MODAL -->
      <div
        v-if="isFormOpen"
        class="crm-modal-layer fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-3 backdrop-blur-sm sm:p-6"
        @click.self="closeProjectModal"
      >
        <div
          class="crm-project-modal flex w-full flex-col overflow-hidden rounded-[30px] border border-[#DCE7F4] bg-white shadow-2xl"
          style="width: min(880px, calc(100vw - 32px)) !important; max-width: min(880px, calc(100vw - 32px)) !important; max-height: min(86vh, 680px) !important"
        >
          <!-- Modal Header -->
          <div
            class="flex shrink-0 items-start justify-between border-b border-[#E8EEF7] px-6 py-5 sm:px-8 sm:py-6"
          >
            <div>
              <h3
                class="text-xl font-extrabold tracking-tight text-[#102A56] sm:text-2xl"
              >
                INISIASI PROJEK &amp; KLIEN
              </h3>
              <span
                class="mt-1 block text-[10px] font-bold tracking-[0.16em] text-[#637083]"
                >CRM &amp; LIFECYCLE MANAGEMENT SYSTEM</span
              >
            </div>
            <button
              id="btn-close-project-modal"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE7F4] text-[#94A3B8] transition-colors hover:bg-[#F8FBFE] hover:text-slate-600"
              @click="closeProjectModal"
            >
              <X class="w-6 h-6" />
            </button>
          </div>
          <!-- Form body -->
          <form class="flex min-h-0 flex-1 flex-col" @submit="handleSaveProject">
            <nav class="crm-project-steps shrink-0 border-b border-[#E8EEF7]" aria-label="Tahapan inisiasi proyek">
              <ol class="grid grid-cols-5 gap-2">
                <li v-for="(label, index) in projectFormSteps" :key="label" :class="['crm-project-step', { active: projectFormStep === index + 1, complete: projectFormStep > index + 1 }]">
                  <span>{{ index + 1 }}</span><strong>{{ label }}</strong>
                </li>
              </ol>
            </nav>
            <div
              class="crm-project-body flex-1 overflow-y-auto p-6 sm:p-8"
            >
            <div v-if="projectStepWarning" class="crm-project-step-warning" role="alert">
              <CircleAlert class="h-4 w-4 shrink-0" />
              <span>{{ projectStepWarning }}</span>
            </div>
            <!-- SECTION 1: DETAIL IDENTITAS PROJEK -->
            <div
              v-show="projectFormStep === 1"
              class="crm-project-detail-step min-w-0 space-y-5 rounded-[24px] border border-[#D8E5F4] bg-[#F8FBFF] p-5 shadow-sm"
            >
              <div
                class="flex items-center gap-3 border-b border-[#D8E5F4] pb-3"
              >
                <div
                  class="p-2 bg-[#EEF4FB] rounded-xl text-[#1E5AA8] ring-1 ring-[#D8E5F4]"
                >
                  <Briefcase class="w-5 h-5" />
                </div>
                <h4
                  class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase"
                >
                  DETAIL IDENTITAS PROJEK
                </h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >NAMA PROJEK / KEGIATAN</label
                  ><input
                    id="proj-form-name"
                    type="text"
                    required
                    placeholder="Contoh: Pengembangan App E-Procurement"
                    v-model.trim="newProj.nama"
                    :aria-invalid="Boolean(projectStepErrors.nama)"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                  <p v-if="projectStepErrors.nama" class="form-field-warning">{{ projectStepErrors.nama }}</p>
                </div>
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >NILAI KONTRAK</label
                  >
                  <div class="currency-input relative flex items-center">
                    <span
                      class="absolute left-4 text-[#637083] font-bold text-xs select-none"
                      >Rp</span
                    ><input
                      id="proj-form-val"
                      type="number"
                      required
                      min="1"
                      placeholder="0"
                      :value="newProj.nilaiKontrak || ''"
                      :aria-invalid="Boolean(projectStepErrors.nilaiKontrak)"
                      style="padding-left: 2.75rem !important"
                      class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white py-0 pl-12 pr-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                      @change="handleContractValueChange"
                    />
                  </div>
                  <p v-if="projectStepErrors.nilaiKontrak" class="form-field-warning">{{ projectStepErrors.nilaiKontrak }}</p>
                </div>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                  >ANGGARAN BIAYA PROYEK</label
                >
                <div class="currency-input relative flex items-center">
                  <span
                    class="absolute left-4 text-[#637083] font-bold text-xs select-none"
                    >Rp</span
                  ><input
                    id="proj-form-budget"
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    :value="newProj.anggaran || ''"
                    style="padding-left: 2.75rem !important"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white py-0 pl-12 pr-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                    @change="handleBudgetValueChange"
                  />
                </div>
                <p class="text-[10px] leading-4 text-slate-500">
                  Realisasi biaya otomatis dihitung dari bill yang dipilihkan ke
                  proyek ini.
                </p>
              </div>
              <div
                class="grid grid-cols-1 gap-y-4 gap-x-5 sm:grid-cols-2 xl:grid-cols-[minmax(190px,1.35fr)_minmax(150px,0.95fr)_minmax(150px,0.9fr)_minmax(150px,0.9fr)]"
              >
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >TIPE TENDER</label
                  >
                  <div class="relative">
                    <select
                      id="proj-form-tender"
                      required
                      :title="newProj.tipeTender"
                      v-model="newProj.tipeTender"
                      class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-3 pr-8 text-[12px] font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                    >
                      <option value="Tender Umum">Tender Umum</option>
                      <option value="Tender Terbatas">Tender Terbatas</option>
                      <option value="Penunjukan Langsung">
                        Penunjukan Langsung
                      </option>
                      <option value="Pengadaan Langsung">
                        Pengadaan Langsung
                      </option>
                    </select>
                    <div
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]"
                    >
                      <ChevronDown class="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#5B62D6] uppercase"
                    >STATUS PROJEK</label
                  >
                  <div class="relative">
                    <select
                      id="proj-form-status"
                      required
                      :title="newProj.status"
                      v-model="newProj.status"
                      class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-3 pr-8 text-[12px] font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                    >
                      <option value="Planning">Planning</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <div
                      class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#94A3B8]"
                    >
                      <ChevronDown class="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >TANGGAL MULAI</label
                  ><input
                    id="proj-form-start"
                    type="date"
                    required
                    v-model="newProj.tanggalMulai"
                    :aria-invalid="Boolean(projectStepErrors.tanggalMulai)"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-[12px] font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                  <p v-if="projectStepErrors.tanggalMulai" class="form-field-warning">{{ projectStepErrors.tanggalMulai }}</p>
                </div>
                <div class="min-w-0 space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#E25463] uppercase"
                    >EST. SELESAI</label
                  ><input
                    id="proj-form-end"
                    type="date"
                    required
                    :min="newProj.tanggalMulai || undefined"
                    v-model="newProj.tanggalSelesai"
                    :aria-invalid="Boolean(projectStepErrors.tanggalSelesai)"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-[12px] font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                  <p v-if="projectStepErrors.tanggalSelesai" class="form-field-warning">{{ projectStepErrors.tanggalSelesai }}</p>
                </div>
              </div>
            </div>
            <!-- SECTION: MILESTONE & DEADLINE -->
            <div
              v-show="projectFormStep === 2"
              class="min-w-0 space-y-4 rounded-[24px] border border-indigo-200 bg-indigo-50/30 p-5 shadow-sm"
            >
              <div
                class="flex items-center gap-3 border-b border-indigo-200/70 pb-3"
              >
                <div
                  class="p-2 bg-indigo-100 rounded-xl text-indigo-700 ring-1 ring-indigo-200"
                >
                  <CheckCircle2 class="w-5 h-5" />
                </div>
                <div>
                  <h4
                    class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase"
                  >
                    MILESTONE &amp; DEADLINE
                  </h4>
                  <p class="mt-0.5 text-[10px] text-slate-500">
                    Pantau tahapan kerja proyek dan tanggal targetnya.
                  </p>
                </div>
              </div>
              <div
                class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_170px]"
              >
                <input
                  id="proj-milestone-title"
                  type="text"
                  v-model.trim="milestoneTitle"
                  placeholder="Contoh: UAT dan serah terima"
                  class="h-11 min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#152238] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                /><input
                  id="proj-milestone-date"
                  type="date"
                  v-model="milestoneDate"
                  class="h-11 min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-semibold text-[#152238] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                /><button
                  type="button"
                  class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#102A56] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0B1F42] md:col-span-2"
                  @click="handleAddMilestone"
                >
                  <Plus class="h-4 w-4" /> Simpan Milestone
                </button>
              </div>
              <div
                class="space-y-2 rounded-2xl border border-dashed border-indigo-200 bg-white/60 p-3"
              >
                <p
                  v-if="(newProj.milestones || []).length === 0"
                  class="text-[11px] font-semibold text-slate-400"
                >
                  Belum ada milestone. Tambahkan tahapan utama proyek agar
                  deadline dapat dipantau.
                </p>
                <template v-else
                  ><div
                    v-for="(milestone, index) in newProj.milestones || []"
                    :key="`${milestone.title}-${index}`"
                    class="crm-milestone-form-item rounded-xl border border-indigo-100 bg-white p-2.5"
                  >
                    <p
                      class="crm-milestone-item-title truncate text-xs font-bold"
                      :title="milestone.title"
                    >
                      {{ milestone.title }}
                    </p>
                    <input
                      type="date"
                      v-model="milestone.due_date"
                      class="h-9 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    /><select
                      v-model="milestone.status"
                      class="h-9 rounded-lg border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="planned">Direncanakan</option>
                      <option value="in_progress">Berjalan</option>
                      <option value="completed">Selesai</option></select
                    ><button
                      type="button"
                      class="flex h-9 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Hapus milestone"
                      @click="handleRemoveMilestone(index)"
                    >
                      <Trash2 class="h-3.5 w-3.5" />
                    </button></div
                ></template>
              </div>
            </div>
            <!-- SECTION: ALOKASI TIM SDM TERLIBAT -->
            <div
              v-show="projectFormStep === 3"
              class="min-w-0 space-y-5 rounded-[24px] border border-amber-200 bg-amber-50/35 p-5 shadow-sm"
            >
              <div
                class="flex items-center gap-3 border-b border-amber-200/70 pb-3"
              >
                <div
                  class="p-2 bg-amber-100 rounded-xl text-amber-700 ring-1 ring-amber-200"
                >
                  <Users class="w-5 h-5" />
                </div>
                <div>
                  <h4
                    class="text-[13px] font-extrabold tracking-[0.08em] text-[#102A56] uppercase"
                  >
                    ALOKASI TIM SDM TERLIBAT
                  </h4>
                  <p
                    class="mt-1 text-[11px] font-medium leading-relaxed text-amber-700/80"
                  >
                    Wajib diisi minimal satu anggota tim beserta posisi atau
                    perannya dalam proyek.
                  </p>
                </div>
              </div>
              <div
                class="crm-project-team-inputs grid grid-cols-1 gap-4 md:grid-cols-2"
              >
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >NAMA ANGGOTA TIM</label
                  ><select
                    id="proj-team-name"
                    v-model="selectedStaffId"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                    @change="handleStaffSelectionChange"
                  >
                    <option value="">-- Pilih karyawan dari master SDM --</option>
                    <option v-for="staff in availableProjectStaff" :key="staff.id" :value="staff.id">
                      {{ staff.nama }}
                    </option>
                  </select>
                </div>
                <div class="space-y-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >POSISI / ROLE</label
                  ><input
                    id="proj-team-position"
                    type="text"
                    :value="manualStaffPosition"
                    readonly
                    placeholder="Terisi otomatis dari data karyawan"
                    class="h-12 w-full min-w-0 cursor-not-allowed rounded-xl border border-[#D8E5F4] bg-slate-100 px-4 text-sm font-semibold text-[#52647E]"
                  />
                </div>
                <button
                  id="btn-add-project-team"
                  type="button"
                  class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-lg shadow-amber-500/15 transition-colors hover:bg-amber-600 md:col-span-2"
                  @click="handleAddManualStaff"
                >
                  <Plus class="w-4 h-4" /> Tambah Anggota
                </button>
              </div>
              <div
                class="min-h-[54px] rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-3"
              >
                <p
                  v-if="projectTeamError"
                  class="form-field-warning mb-2"
                  role="alert"
                >
                  {{ projectTeamError }}
                </p>
                <span
                  v-if="newProj.tim.length === 0"
                  class="text-[11px] text-slate-400 font-semibold"
                  >Belum ada anggota tim yang dialokasikan.</span
                >
                <div v-else class="space-y-2">
                  <div
                    class="crm-project-team-list-head grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_34px] gap-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#102A56]"
                  >
                    <span>Nama Anggota</span>
                    <span>Posisi / Role</span>
                    <span></span>
                  </div>
                  <div
                    v-for="member in newProj.tim"
                    :key="member.nama"
                    class="crm-project-team-chip grid min-w-0 grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_34px] items-center gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3 shadow-sm"
                  >
                    <div class="min-w-0 flex-1">
                      <span
                        class="block break-words text-sm font-extrabold leading-snug text-[#102A56]"
                        >{{ member.nama }}</span
                      >
                    </div>
                    <div class="min-w-0">
                      <span
                        class="block break-words text-[11px] font-bold uppercase tracking-wide text-amber-600"
                        >{{ member.jabatan }}</span
                      >
                    </div>
                    <button
                      type="button"
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus anggota tim"
                      @click="handleRemoveStaff(member.nama)"
                    >
                      <X class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- SECTION 2: INFORMASI KLIEN PARTNER -->
            <div
              v-show="projectFormStep === 4"
              class="min-w-0 space-y-6 rounded-[22px] border border-[#D8E5F4] bg-[#FBFDFF] p-5 shadow-sm sm:p-6 lg:col-span-2 2xl:col-span-1"
            >
              <!-- Section header inside the box -->
              <div
                class="flex flex-col gap-3 border-b border-[#D8E5F4] pb-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex items-center gap-2.5">
                  <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <Building class="w-4 h-4" />
                  </div>
                  <h4
                    class="font-extrabold text-[11px] tracking-wider text-[#102A56] uppercase"
                  >
                    INFORMASI KLIEN PARTNER
                  </h4>
                </div>
                <div
                  class="rounded-xl border border-[#D8E5F4] bg-white px-3 py-2 text-[11px] font-bold text-[#102A56]"
                >
                  Pilih dari Klien Partner
                </div>
              </div>
              <!-- Conditionally render database selection or new client registration form -->
              <div class="space-y-2">
                <label
                  class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                  >PILIH KLIEN DARI DATABASE</label
                >
                <div class="relative">
                  <select
                    id="proj-form-klien"
                    required
                    v-model="newProj.klienId"
                    :aria-invalid="Boolean(projectStepErrors.klienId)"
                    class="h-12 w-full min-w-0 appearance-none rounded-xl border border-[#D8E5F4] bg-white px-4 pr-12 text-sm font-semibold text-[#152238] transition-all focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  >
                    <option value="">-- Pilih Perusahaan Klien --</option>
                    <option v-for="k in klien" :key="k.id" :value="k.id">
                      {{ k.namaPerusahaan }} ({{ k.pic }})
                    </option>
                  </select>
                  <div
                    class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#94A3B8]"
                  >
                    <ChevronDown class="w-4 h-4" />
                  </div>
                  <p v-if="projectStepErrors.klienId" class="form-field-warning">{{ projectStepErrors.klienId }}</p>
                </div>
                <div
                  class="flex flex-col gap-3 rounded-2xl border border-dashed border-[#BBD3EE] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p class="text-sm font-bold text-[#102A56]">
                      Klien belum ada di database?
                    </p>
                    <p class="mt-1 text-xs leading-5 text-[#637083]">
                      Tambahkan klien baru dari sini, lalu otomatis dipilih
                      untuk proyek ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#102A56] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0B1F42]"
                    @click="openCreateClientFromProject"
                  >
                    <Plus class="h-4 w-4" />
                    Tambah Klien Baru
                  </button>
                </div>
              </div>
            </div>
            <section v-show="projectFormStep === 5" class="rounded-[24px] border border-[#D8E5F4] bg-[#F8FBFF] p-5 shadow-sm sm:p-7">
              <div class="border-b border-[#D8E5F4] pb-4">
                <p class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1E5AA8]">Konfirmasi data</p>
                <h4 class="mt-1 text-lg font-extrabold text-[#102A56]">Periksa sebelum proyek disimpan</h4>
              </div>
              <dl class="mt-5 grid gap-4 sm:grid-cols-2">
                <div class="crm-project-review-item"><dt>Nama proyek</dt><dd>{{ newProj.nama || '-' }}</dd></div>
                <div class="crm-project-review-item"><dt>Klien</dt><dd>{{ selectedProjectFormClient?.namaPerusahaan || '-' }}</dd></div>
                <div class="crm-project-review-item"><dt>Nilai kontrak</dt><dd>{{ formatRupiah(newProj.nilaiKontrak) }}</dd></div>
                <div class="crm-project-review-item"><dt>Anggaran biaya</dt><dd>{{ formatRupiah(newProj.anggaran) }}</dd></div>
                <div class="crm-project-review-item"><dt>Tender dan status</dt><dd>{{ newProj.tipeTender }} · {{ newProj.status }}</dd></div>
                <div class="crm-project-review-item"><dt>Periode</dt><dd>{{ newProj.tanggalMulai }} s/d {{ newProj.tanggalSelesai }}</dd></div>
                <div class="crm-project-review-item"><dt>Tim</dt><dd>{{ newProj.tim.length }} anggota</dd></div>
                <div class="crm-project-review-item"><dt>Milestone</dt><dd>{{ (newProj.milestones || []).length }} tahapan</dd></div>
              </dl>
            </section>
            </div>
            <!-- Modal footer controls -->
            <div
              class="flex shrink-0 flex-col-reverse gap-3 border-t border-[#E8EEF7] bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5"
            >
            <div class="flex w-full gap-3 sm:w-auto"><button
              id="btn-project-cancel"
              type="button"
              class="h-12 w-full rounded-xl border border-[#D8E5F4] px-8 text-sm font-bold tracking-wide text-[#637083] transition-all hover:bg-slate-50 sm:w-auto"
              @click="goToPreviousProjectStep"
            >
              {{ projectFormStep === 1 ? 'BATAL' : 'KEMBALI' }}
            </button></div
            ><button
              v-if="projectFormStep < projectFormSteps.length"
              type="button"
              class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102A56] px-8 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:bg-[#0B1F42] sm:w-auto"
              @click="goToNextProjectStep"
            >LANJUTKAN <ChevronRight class="h-4 w-4" /></button
            ><button
              v-else
              id="btn-project-save"
              type="submit"
              class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102A56] px-8 text-sm font-bold tracking-wide text-white shadow-lg transition-all hover:bg-[#0B1F42] sm:w-auto"
            >
              <CheckCircle2 class="w-4 h-4" /> SELESAIKAN INISIASI PROJEK
            </button>
            </div>
          </form>
        </div>
      </div>
      <!-- 4. REGISTRASI KLIEN BARU STANDALONE MODAL -->
      <Teleport to="body">
        <div
          v-if="isClientFormOpen"
          class="crm-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
          @click.self="closeClientModal"
        >
          <div
            class="crm-client-modal bg-white border border-slate-100 rounded-[36px] w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div
              class="px-8 py-6 border-b border-slate-100 flex justify-between items-start"
            >
              <div>
                <h3
                  class="font-extrabold text-xl text-[#102A56] tracking-tight uppercase"
                >
                  <template v-if="editingClientId">Edit Mitra Klien</template
                  ><template v-else>Registrasi Mitra Klien Baru</template>
                </h3>
                <span
                  class="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest block mt-1"
                  >CRM &amp; Lifecycle Management System</span
                >
              </div>
              <button
                id="btn-close-client-modal"
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DCE7F4] text-[#94A3B8] transition-colors hover:bg-[#F8FBFE] hover:text-slate-600"
                @click="closeClientModal"
              >
                <X class="w-6 h-6" />
              </button>
            </div>
            <form class="p-8 space-y-6 text-xs" @submit="handleSaveClient">
              <div
                class="flex items-center gap-2.5 pb-3 border-b border-[#D8E5F4]"
              >
                <div class="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <Building class="w-4 h-4" />
                </div>
                <h4
                  class="font-extrabold text-[11px] tracking-wider text-[#102A56] uppercase"
                >
                  Informasi Klien Partner
                </h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5 md:col-span-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Nama Perusahaan / Kementerian *</label
                  ><input
                    id="client-form-company"
                    type="text"
                    required
                    placeholder="Contoh: PT Kereta Api Indonesia (Persero)"
                    v-model.trim="newClient.namaPerusahaan"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Bidang &amp; Kategori *</label
                  ><input
                    id="client-form-category"
                    type="text"
                    required
                    placeholder="Contoh: BUMN / Transportasi"
                    v-model.trim="newClient.bidang"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Lokasi Kantor Cabang *</label
                  ><input
                    id="client-form-location"
                    type="text"
                    required
                    placeholder="Contoh: Bandung, Jawa Barat"
                    v-model.trim="newClient.lokasi"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Nama PIC Utama *</label
                  ><input
                    id="client-form-pic"
                    type="text"
                    required
                    placeholder="Contoh: Dr. Ir. Heru Wibowo, M.T."
                    v-model.trim="newClient.pic"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
                <div class="space-y-1.5">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Email Kerja PIC *</label
                  ><input
                    id="client-form-email"
                    type="email"
                    required
                    placeholder="Contoh: pic.proyek@kai.id"
                    v-model.trim="newClient.email"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
                <div class="space-y-1.5 md:col-span-2">
                  <label
                    class="text-[10px] font-bold tracking-[0.08em] text-[#8192AA] uppercase"
                    >Nomor Telepon PIC *</label
                  ><input
                    id="client-form-phone"
                    type="tel"
                    required
                    placeholder="Contoh: +62 811-2345-678"
                    v-model.trim="newClient.telepon"
                    class="h-12 w-full min-w-0 rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-semibold text-[#152238] transition-all placeholder:font-medium placeholder:text-[#9AA9BE] focus:outline-none focus:ring-2 focus:ring-[#1E5AA8]/20"
                  />
                </div>
              </div>
              <button
                id="btn-client-submit"
                type="submit"
                class="w-full bg-[#102A56] hover:bg-[#0B1F42] text-white font-extrabold py-4 rounded-2xl shadow-lg mt-2 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle2 class="w-4 h-4" /><template v-if="editingClientId"
                  >Simpan Perubahan Klien</template
                ><template v-else>Daftarkan Klien Baru</template>
              </button>
            </form>
          </div>
        </div>
      </Teleport>
      <div
        v-if="deleteConfirm"
        class="crm-modal-layer fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
        @click.self="closeDeleteConfirm"
      >
        <div
          class="crm-delete-modal w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <div class="crm-delete-header border-b border-slate-200 px-6 py-5">
            <div>
              <p
                class="crm-delete-eyebrow text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500"
              >
                Konfirmasi Penghapusan
              </p>
              <h3
                class="crm-delete-title mt-1 text-lg font-extrabold leading-tight text-[#102A56]"
              >
                Hapus
                <template v-if="deleteConfirm.type === 'proyek'"
                  >Proyek</template
                ><template v-else>Klien</template>?
              </h3>
            </div>
          </div>
          <div class="crm-delete-body space-y-4 p-6">
            <p class="crm-delete-message text-sm leading-6 text-slate-600">
              Periksa kembali data di bawah ini sebelum melanjutkan. Penghapusan
              bersifat permanen dan tidak dapat dibatalkan dari aplikasi.
            </p>
            <div
              class="crm-delete-summary grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 grid-cols-1"
            >
              <div>
                <p
                  class="crm-delete-label text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                >
                  Jenis Data
                </p>
                <p class="crm-delete-value mt-1 text-sm font-bold text-slate-900">
                  <template v-if="deleteConfirm.type === 'proyek'"
                    >Proyek CRM</template
                  ><template v-else>Klien Partner</template>
                </p>
              </div>
              <div>
                <p
                  class="crm-delete-label text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                >
                  Nama
                </p>
                <p class="crm-delete-value mt-1 text-sm font-bold leading-6 text-slate-900">
                  {{ deleteConfirm.name }}
                </p>
              </div>
              <div>
                <p
                  class="crm-delete-label text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                >
                  ID
                </p>
                <p class="crm-delete-value mt-1 font-mono text-sm font-semibold text-slate-700">
                  {{ deleteConfirm.id }}
                </p>
              </div>
            </div>
            <div
              class="crm-delete-impact rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950"
            >
              <p class="crm-delete-impact-title font-bold text-rose-700">Yang akan terdampak</p>
              <ul
                v-if="deleteConfirm.type === 'proyek'"
                class="crm-delete-impact-list mt-2 list-disc space-y-1 pl-5"
              >
                <li>Proyek hilang dari daftar CRM.</li>
                <li>
                  Detail kontrak, status, periode, catatan, dan alokasi tim ikut
                  terhapus.
                </li>
                <li>Riwayat ini tidak bisa dipulihkan melalui aplikasi.</li>
              </ul>
              <ul v-else class="crm-delete-impact-list mt-2 list-disc space-y-1 pl-5">
                <li>Klien hilang dari database CRM.</li>
                <li>
                  Klien tidak lagi tersedia di pilihan proyek baru atau edit
                  proyek.
                </li>
                <li>Riwayat ini tidak bisa dipulihkan melalui aplikasi.</li>
              </ul>
            </div>
            <div class="crm-delete-actions grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                class="crm-delete-cancel w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                @click="closeDeleteConfirm"
              >
                Batalkan</button
              ><button
                type="button"
                class="crm-delete-submit w-full rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-700"
                @click="handleConfirmDelete"
              >
                Hapus
                <template v-if="deleteConfirm.type === 'proyek'"
                  >Proyek</template
                ><template v-else>Klien</template>
              </button>
            </div>
          </div>
        </div>
      </div></Teleport
    >
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { parseRupiahInput } from "../utils/rupiahInputs.js";
import { computed, ref } from "vue";
import {
  Search,
  Plus,
  Filter,
  Users,
  MapPin,
  Mail,
  Phone,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  X,
  Building,
  Briefcase,
  ChevronDown,
  ChevronRight,
  CircleAlert,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Proyek, Klien, Pegawai, AnggotaTim } from "../types.ts";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
import { financeApi } from "../services/financeApi.js";
import { mapClient, mapProject } from "../services/financeMappers.js";
import { toNumber, withApiFeedback } from "../composables/financeActionUtils";
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
const CRM_SUBTAB_KEY = "finstart-crm-active-subtab";

interface CrmViewProps {
  proyek: Proyek[];
  klien: Klien[];
  pegawai: Pegawai[];
  viewMode?: "crm" | "client-master";
}

const props = withDefaults(defineProps<CrmViewProps>(), {
  viewMode: "crm",
});
const { proyek, klien, pegawai } = props;
const isClientMasterView = computed(() => props.viewMode === "client-master");

const { notify, refreshData } = useFinStartContext();

const PROJECT_STATUS_TO_API: Record<string, string> = {
  Planning: "planning",
  Ongoing: "ongoing",
  Completed: "completed",
};

function clientPayload(item: Klien) {
  return {
    company_name: item.namaPerusahaan,
    pic_name: item.pic,
    email: item.email || "",
    phone: item.telepon || "",
    industry: item.bidang || "",
    category: item.bidang || "",
    location: item.lokasi || "",
    address: item.lokasi || "",
    status: (item as any)._raw?.status || "active",
  };
}

function projectPayload(item: Proyek) {
  return {
    client_id: Number(item.klienId),
    project_name: item.nama,
    project_code:
      (item as any)._raw?.project_code || `PRJ-${String(Date.now()).slice(-8)}`,
    contract_value: toNumber(item.nilaiKontrak),
    status: PROJECT_STATUS_TO_API[item.status] || "planning",
    start_date: item.tanggalMulai || null,
    end_date: item.tanggalSelesai || null,
    description: item.catatan || "",
    budget_amount: toNumber((item as any).anggaran ?? (item as any).budgetAmount),
    milestones: Array.isArray((item as any).milestones)
      ? (item as any).milestones
      : [],
    members: Array.isArray(item.tim)
      ? item.tim.map((member: any) => ({
          employee_id:
            Number(member.employeeId || member.employee_id || 0) || null,
          name: member.nama || member.name || "",
          role_name: member.jabatan || member.role_name || "",
          allocation_percent: toNumber(
            member.alokasiPersen ?? member.allocation_percent ?? 100,
          ),
          estimated_cost: toNumber(
            member.estimasiBiaya ?? member.estimated_cost,
          ),
        }))
      : [],
  };
}

// Handler CRM berada di komponen yang menggunakannya, bukan lagi di App/composable global.
const addClient = async (item: Klien) =>
  withApiFeedback(
    async () => {
      const created = await financeApi.post("/clients", clientPayload(item));
      await refreshData();
      return mapClient(created);
    },
    "Gagal menyimpan klien.",
    notify,
  );

const updateClient = async (item: Klien) =>
  withApiFeedback(
    async () => {
      const updated = await financeApi.put(
        `/clients/${item.id}`,
        clientPayload(item),
      );
      await refreshData();
      return mapClient(updated);
    },
    "Gagal memperbarui klien.",
    notify,
  );

const deleteClient = async (id: string) =>
  withApiFeedback(
    async () => {
      await financeApi.delete(`/clients/${id}`);
      await refreshData();
      notify("Klien berhasil dihapus dari database.");
    },
    "Gagal menghapus klien.",
    notify,
  );

const addProject = async (item: Proyek) =>
  withApiFeedback(
    async () => {
      const created = await financeApi.post("/projects", projectPayload(item));
      await refreshData();
      return mapProject(created);
    },
    "Gagal menyimpan proyek.",
    notify,
  );

const updateProject = async (item: Proyek) =>
  withApiFeedback(
    async () => {
      const updated = await financeApi.put(
        `/projects/${item.id}`,
        projectPayload(item),
      );
      await refreshData();
      return mapProject(updated);
    },
    "Gagal memperbarui proyek.",
    notify,
  );

const deleteProject = async (id: string) =>
  withApiFeedback(
    async () => {
      await financeApi.delete(`/projects/${id}`);
      await refreshData();
      notify("Proyek berhasil dihapus dari database.");
    },
    "Gagal menghapus proyek.",
    notify,
  );
type CrmSubTab = "proyek" | "klien";
type ProjectStatusFilter = "All" | "Planning" | "Ongoing" | "Completed";
type DeleteTarget = {
  type: "proyek" | "klien";
  id: string;
  name: string;
};

function createEmptyProjectForm() {
  return {
    nama: "",
    nilaiKontrak: 0,
    anggaran: 0,
    milestones: [] as Array<{
      title: string;
      due_date: string | null;
      status: "planned" | "in_progress" | "completed";
    }>,
    tipeTender: "Tender Umum" as
      | "Tender Umum"
      | "Tender Terbatas"
      | "Penunjukan Langsung"
      | "Pengadaan Langsung",
    status: "Ongoing" as "Planning" | "Ongoing" | "Completed",
    tanggalMulai: todayIso(),
    tanggalSelesai: "",
    klienId: "",
    picKontak: "",
    catatan: "",
    tim: [] as AnggotaTim[],
  };
}

function createEmptyClientForm() {
  return {
    namaPerusahaan: "",
    bidang: "",
    lokasi: "",
    pic: "",
    email: "",
    telepon: "",
  };
}

const activeSubTab = ref<CrmSubTab>(
  props.viewMode === "client-master" ? "klien" : "proyek",
);
const searchQuery = ref("");
const statusFilter = ref<ProjectStatusFilter>("All");
const selectedProjectDetailId = ref<string | null>(null);
const selectedClientDetailId = ref<string | null>(null);
const projectPage = ref(1);
const clientPage = ref(1);
const editingProjectId = ref<string | null>(null);
const editingClientId = ref<string | null>(null);
const deleteConfirm = ref<DeleteTarget | null>(null);
const isFormOpen = ref(false);
const isClientFormOpen = ref(false);
const shouldAttachNewClientToProject = ref(false);
const newProj = ref(createEmptyProjectForm());
const newClient = ref(createEmptyClientForm());
const manualStaffName = ref("");
const manualStaffPosition = ref("");
const selectedStaffId = ref("");
const availableProjectStaff = computed(() =>
  pegawai.filter(
    (staff) => !newProj.value.tim.some((member) => member.nama === staff.nama),
  ),
);
const milestoneTitle = ref("");
const milestoneDate = ref("");
const milestoneStatus = ref<"planned" | "in_progress" | "completed">("planned");
const projectTeamError = ref("");
const projectFormStep = ref(1);
const projectStepWarning = ref("");
const projectStepErrors = ref<Record<string, string>>({});
const projectFormSteps = ["Detail", "Milestone", "Tim", "Klien", "Konfirmasi"];
const selectedProjectFormClient = computed(() =>
  klien.find((client) => client.id === newProj.value.klienId),
);

function goToPreviousProjectStep() {
  projectStepWarning.value = "";
  projectStepErrors.value = {};
  if (projectFormStep.value === 1) {
    closeProjectModal();
    return;
  }
  projectFormStep.value -= 1;
}

function goToNextProjectStep() {
  projectStepWarning.value = "";
  projectStepErrors.value = {};
  if (projectFormStep.value === 1) {
    const errors: Record<string, string> = {};
    if (!newProj.value.nama) errors.nama = "Nama proyek wajib diisi.";
    if (Number(newProj.value.nilaiKontrak) <= 0) {
      errors.nilaiKontrak = "Nilai kontrak harus lebih dari Rp 0.";
    }
    if (!newProj.value.tanggalMulai) {
      errors.tanggalMulai = "Tanggal mulai wajib dipilih.";
    }
    if (!newProj.value.tanggalSelesai) {
      errors.tanggalSelesai = "Estimasi selesai wajib dipilih.";
    }
    if (Object.keys(errors).length) {
      projectStepErrors.value = errors;
      projectStepWarning.value =
        "Periksa kembali field yang ditandai sebelum melanjutkan.";
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    if (newProj.value.tanggalSelesai < newProj.value.tanggalMulai) {
      projectStepErrors.value = {
        tanggalSelesai: "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      };
      projectStepWarning.value = "Periode proyek belum valid.";
      return;
    }
  }
  if (projectFormStep.value === 3 && newProj.value.tim.length === 0) {
    projectTeamError.value =
      "Tambahkan minimal satu anggota tim beserta posisi atau perannya.";
    projectStepWarning.value = "Alokasi tim SDM wajib diisi sebelum melanjutkan.";
    return;
  }
  if (projectFormStep.value === 4 && !newProj.value.klienId) {
    projectStepErrors.value = {
      klienId: "Perusahaan klien wajib dipilih.",
    };
    projectStepWarning.value = "Pilih perusahaan klien sebelum melanjutkan.";
    return;
  }
  projectFormStep.value = Math.min(
    projectFormStep.value + 1,
    projectFormSteps.length,
  );
  projectStepWarning.value = "";
}

function setActiveSubTab(next: CrmSubTab) {
  activeSubTab.value = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CRM_SUBTAB_KEY, next);
  }
}

function resetProjectForm() {
  editingProjectId.value = null;
  newProj.value = createEmptyProjectForm();
  manualStaffName.value = "";
  manualStaffPosition.value = "";
  selectedStaffId.value = "";
  milestoneTitle.value = "";
  milestoneDate.value = "";
  milestoneStatus.value = "planned";
  projectTeamError.value = "";
  projectStepWarning.value = "";
  projectStepErrors.value = {};
  projectFormStep.value = 1;
}

function resetClientForm() {
  editingClientId.value = null;
  newClient.value = createEmptyClientForm();
}

function openCreateClientFromProject() {
  resetClientForm();
  shouldAttachNewClientToProject.value = true;
  isClientFormOpen.value = true;
}

function handleRemoveStaff(name: string) {
  newProj.value = {
    ...newProj.value,
    tim: newProj.value.tim.filter((member) => member.nama !== name),
  };
}
function handleStaffSelectionChange() {
  const staff = pegawai.find((item) => item.id === selectedStaffId.value);
  manualStaffName.value = staff?.nama || "";
  manualStaffPosition.value = staff?.jabatan || "";
}
function handleAddManualStaff() {
  const name = manualStaffName.value.trim();
  const position = manualStaffPosition.value.trim();
  if (!name || !position) {
    notify("Harap isi nama dan posisi anggota tim.");
    return;
  }
  if (
    newProj.value.tim.some((t) => t.nama.toLowerCase() === name.toLowerCase())
  ) {
    notify("Anggota tim sudah masuk dalam alokasi proyek ini.");
    return;
  }
  newProj.value = {
    ...newProj.value,
    tim: [
      ...newProj.value.tim,
      {
        nama: name,
        jabatan: position,
        alokasiPersen: 100,
        estimasiBiaya: 0,
      },
    ],
  };
  projectTeamError.value = "";
  manualStaffName.value = "";
  manualStaffPosition.value = "";
  selectedStaffId.value = "";
}
function handleAddMilestone() {
  const title = milestoneTitle.value.trim();
  if (!title) {
    notify("Harap isi nama milestone.");
    return;
  }
  newProj.value = {
    ...newProj.value,
    milestones: [
      ...(newProj.value.milestones || []),
      {
        title,
        due_date: milestoneDate.value || null,
        status: milestoneStatus.value || "planned",
      },
    ],
  };
  milestoneTitle.value = "";
  milestoneDate.value = "";
  milestoneStatus.value = "planned";
}
function handleRemoveMilestone(index: number) {
  newProj.value = {
    ...newProj.value,
    milestones: (newProj.value.milestones || []).filter(
      (_item, itemIndex) => itemIndex !== index,
    ),
  };
}

// Submit complete single-page project form
async function handleSaveProject(event?: Event) {
  event?.preventDefault();
  if (
    !newProj.value.nama ||
    !newProj.value.tanggalMulai ||
    !newProj.value.tanggalSelesai
  ) {
    notify("Harap lengkapi nama proyek dan tanggal pelaksanaan.");
    return;
  }
  if (!newProj.value.klienId) {
    notify("Harap pilih perusahaan klien dari database Klien Partner.");
    return;
  }
  if (newProj.value.tim.length === 0) {
    projectTeamError.value =
      "Tambahkan minimal satu anggota tim beserta posisi atau perannya.";
    notify("Alokasi tim SDM wajib diisi sebelum proyek disimpan.");
    requestAnimationFrame(() => {
      document
        .getElementById("proj-team-name")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("proj-team-name")?.focus();
    });
    return;
  }
  const selectedClient = klien.find((k) => k.id === newProj.value.klienId);
  const finalKlienId = newProj.value.klienId;
  const finalPicKontak = selectedClient ? selectedClient.pic : "";
  const projectItem: Proyek = {
    id: editingProjectId.value ? editingProjectId.value : "",
    ...newProj.value,
    klienId: finalKlienId,
    picKontak: finalPicKontak,
  };
  if (editingProjectId.value) {
    const updatedProject = await updateProject(projectItem);
    if (!updatedProject) return;
    notify("Proyek berhasil diperbarui.");
  } else {
    const createdProject = await addProject(projectItem);
    if (!createdProject) return;
    notify("Proyek baru berhasil diinisiasi & disimpan.");
  }
  isFormOpen.value = false;
  resetProjectForm();
}

// Submit client form
async function handleSaveClient(e: Event) {
  e.preventDefault();
  if (
    !newClient.value.namaPerusahaan ||
    !newClient.value.bidang ||
    !newClient.value.lokasi ||
    !newClient.value.pic ||
    !newClient.value.email ||
    !newClient.value.telepon
  ) {
    notify("Seluruh informasi mitra klien wajib diisi.");
    return;
  }
  const clientItem: Klien = {
    id: "",
    ...newClient.value,
  };
  const attachToProject =
    shouldAttachNewClientToProject.value &&
    !editingClientId.value &&
    isFormOpen.value;
  if (!attachToProject) {
    setActiveSubTab("klien");
  }
  if (editingClientId.value) {
    clientItem.id = editingClientId.value;
    const updatedClient = await updateClient(clientItem);
    if (!updatedClient) return;
    notify("Data klien berhasil diperbarui.");
    resetClientForm();
  } else {
    const createdClient = await addClient(clientItem);
    if (!createdClient) return;
    if (attachToProject) {
      newProj.value = {
        ...newProj.value,
        klienId: createdClient.id,
      };
      projectStepErrors.value = {
        ...projectStepErrors.value,
        klienId: "",
      };
      projectStepWarning.value = "";
      notify("Klien baru berhasil dibuat dan dipilih untuk proyek ini.");
    } else {
      notify("Klien korporasi baru berhasil didaftarkan.");
    }
    resetClientForm();
  }
  isClientFormOpen.value = false;
  shouldAttachNewClientToProject.value = false;
}

function openCreateProjectModal() {
  closeDetailModal();
  resetProjectForm();
  isFormOpen.value = true;
}
function openCreateClientModal() {
  closeDetailModal();
  setActiveSubTab("klien");
  resetClientForm();
  shouldAttachNewClientToProject.value = false;
  isClientFormOpen.value = true;
}
function openEditProjectModal(project: Proyek) {
  closeDetailModal();
  editingProjectId.value = project.id;
  newProj.value = {
    ...project,
    anggaran: Number((project as any).anggaran ?? 0),
    milestones: Array.isArray((project as any).milestones)
      ? (project as any).milestones.map((milestone: any) => ({ ...milestone }))
      : [],
    tim: [...(project.tim || [])],
  };
  isFormOpen.value = true;
}
function openEditClientModal(client: Klien) {
  closeDetailModal();
  editingClientId.value = client.id;
  newClient.value = { ...client };
  shouldAttachNewClientToProject.value = false;
  isClientFormOpen.value = true;
}
function closeProjectModal() {
  isFormOpen.value = false;
  resetProjectForm();
}
function closeClientModal() {
  isClientFormOpen.value = false;
  shouldAttachNewClientToProject.value = false;
  resetClientForm();
}

function openCreateModal() {
  if (activeSubTab.value === "proyek") {
    openCreateProjectModal();
    return;
  }
  openCreateClientModal();
}

function setStatusFilter(status: ProjectStatusFilter) {
  statusFilter.value = status;
  projectPage.value = 1;
}

function getProjectClientName(clientId: string) {
  return (
    klien.find((client) => client.id === clientId)?.namaPerusahaan ||
    "Klien Tidak Terdaftar"
  );
}

function showProjectDetails(project: Proyek) {
  selectedProjectDetailId.value = project.id;
  selectedClientDetailId.value = null;
}

function showClientDetails(client: Klien) {
  selectedClientDetailId.value = client.id;
  selectedProjectDetailId.value = null;
}

function closeDetailModal() {
  selectedProjectDetailId.value = null;
  selectedClientDetailId.value = null;
}

function openProjectDeleteConfirm(project: Proyek) {
  deleteConfirm.value = {
    type: "proyek",
    id: project.id,
    name: project.nama,
  };
}

function openClientDeleteConfirm(client: Klien) {
  deleteConfirm.value = {
    type: "klien",
    id: client.id,
    name: client.namaPerusahaan,
  };
}

function handleProjectPageChange(page: number) {
  projectPage.value = safePage(page, filteredProjectsList.value.length);
}

function handleClientPageChange(page: number) {
  clientPage.value = safePage(page, filteredClientsList.value.length);
}

function handleContractValueChange(event: Event) {
  newProj.value.nilaiKontrak = parseRupiahInput(eventValue(event));
  if (newProj.value.nilaiKontrak > 0) {
    const remainingErrors = { ...projectStepErrors.value };
    delete remainingErrors.nilaiKontrak;
    projectStepErrors.value = remainingErrors;
  }
}

function handleBudgetValueChange(event: Event) {
  newProj.value.anggaran = parseRupiahInput(eventValue(event));
}

function closeDeleteConfirm() {
  deleteConfirm.value = null;
}

async function handleConfirmDelete() {
  const target = deleteConfirm.value;
  if (!target) return;

  if (target.type === "proyek") {
    await deleteProject(target.id);
  } else {
    await deleteClient(target.id);
  }

  closeDetailModal();
  closeDeleteConfirm();
}

// Filtering lists
const filteredProjectsList = computed(() =>
  latestFirst(
    proyek.filter((p) => {
      const targetClient = klien.find((k) => k.id === p.klienId);
      const matchesSearch =
        p.nama.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (targetClient?.namaPerusahaan || "")
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase());
      const matchesStatus =
        statusFilter.value === "All" || p.status === statusFilter.value;
      return matchesSearch && matchesStatus;
    }),
  ),
);
const filteredClientsList = computed(() =>
  latestFirst(
    klien.filter((k) => {
      return (
        k.namaPerusahaan
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        k.pic.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }),
  ),
);
const pagedProjectsList = computed(() =>
  pageRows(filteredProjectsList.value, projectPage.value),
);
const pagedClientsList = computed(() =>
  pageRows(filteredClientsList.value, clientPage.value),
);
const renderContext = computed(() => {
  const filteredProjects = pagedProjectsList.value;
  const filteredClients = pagedClientsList.value;
  const selectedProject = selectedProjectDetailId.value
    ? (proyek.find((p) => p.id === selectedProjectDetailId.value) ?? null)
    : null;
  const selectedClient = selectedClientDetailId.value
    ? (klien.find((k) => k.id === selectedClientDetailId.value) ?? null)
    : null;
  const selectedProjectClient = selectedProject
    ? klien.find((k) => k.id === selectedProject.klienId)
    : undefined;
  return {
    filteredProjects,
    filteredClients,
    selectedProject,
    selectedClient,
    selectedProjectClient,
  };
});
const selectedClientProjects = computed(() => {
  const selectedClientId = renderContext.value.selectedClient?.id;
  if (!selectedClientId) return [];
  return proyek.filter((project) => project.klienId === selectedClientId);
});

</script>

<style>
.crm-delete-modal {
  max-width: min(560px, calc(100vw - 28px)) !important;
  border-color: #d8e5f4 !important;
  border-radius: 24px !important;
}

.crm-delete-modal .crm-delete-header {
  padding: 20px 24px 18px !important;
  background: #ffffff !important;
}

.crm-delete-modal .crm-delete-eyebrow {
  color: #e11d48 !important;
  font-size: 11px !important;
  font-weight: 850 !important;
  letter-spacing: 0.18em !important;
}

.crm-delete-modal .crm-delete-title {
  margin-top: 7px !important;
  color: #102a56 !important;
  font-size: 24px !important;
  font-weight: 900 !important;
  line-height: 1.12 !important;
}

.crm-delete-modal .crm-delete-body {
  padding: 22px 24px 24px !important;
  row-gap: 14px !important;
}

.crm-delete-modal .crm-delete-message {
  margin: 0 !important;
  color: #52647e !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.65 !important;
}

.crm-delete-modal .crm-delete-summary {
  grid-template-columns: 0.85fr minmax(0, 1.35fr) 64px !important;
  gap: 14px !important;
  padding: 15px 16px !important;
  border-color: #d8e5f4 !important;
  border-radius: 18px !important;
  background: #f8fbfe !important;
}

.crm-delete-modal .crm-delete-label {
  color: #8a99ad !important;
  font-size: 10px !important;
  font-weight: 850 !important;
  letter-spacing: 0.15em !important;
}

.crm-delete-modal .crm-delete-value {
  margin-top: 6px !important;
  overflow-wrap: anywhere;
  color: #152238 !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
}

.crm-delete-modal .crm-delete-impact {
  min-height: 0 !important;
  padding: 16px !important;
  border: 1px solid #fecdd3 !important;
  border-radius: 18px !important;
  background: #fff1f2 !important;
  color: #7f1d1d !important;
}

.crm-delete-modal .crm-delete-impact-title {
  color: #be123c !important;
  font-size: 14px !important;
  font-weight: 850 !important;
  line-height: 1.35 !important;
}

.crm-delete-modal .crm-delete-impact-list {
  display: grid !important;
  gap: 7px !important;
  margin-top: 10px !important;
  padding-left: 18px !important;
  color: #7f1d1d !important;
  font-size: 12.5px !important;
  font-weight: 650 !important;
  line-height: 1.45 !important;
}

.crm-delete-modal .crm-delete-impact-list li::marker {
  color: #e11d48;
}

.crm-delete-modal .crm-delete-actions {
  grid-template-columns: 1fr 1fr !important;
  gap: 12px !important;
  padding-top: 4px !important;
}

.crm-delete-modal .crm-delete-cancel,
.crm-delete-modal .crm-delete-submit {
  min-height: 44px !important;
  border-radius: 14px !important;
  padding: 10px 16px !important;
  font-size: 13px !important;
  font-weight: 850 !important;
}

.crm-delete-modal .crm-delete-cancel {
  color: #52647e !important;
  border-color: #d8e5f4 !important;
  background: #ffffff !important;
}

.crm-delete-modal .crm-delete-submit {
  background: #be123c !important;
  color: #ffffff !important;
  box-shadow: 0 12px 24px rgba(190, 18, 60, 0.18);
}

.crm-delete-modal .crm-delete-submit:hover {
  background: #9f1239 !important;
}

@media (max-width: 560px) {
  .crm-delete-modal .crm-delete-summary,
  .crm-delete-modal .crm-delete-actions {
    grid-template-columns: 1fr !important;
  }

  .crm-delete-modal .crm-delete-title {
    font-size: 21px !important;
  }
}

.crm-detail-modal .crm-client-detail-grid {
  display: grid !important;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: 14px;
}

.crm-detail-modal .crm-client-detail-grid > div {
  display: contents;
}

.crm-detail-modal .crm-client-detail-grid > div > div {
  min-width: 0;
  border-radius: 16px !important;
  padding: 16px !important;
  box-shadow: 0 10px 24px rgba(11, 31, 74, 0.04);
}

.crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div {
  grid-column: 1 / -1;
}

.crm-detail-modal .crm-client-detail-grid > div > div > p:first-child {
  color: #8a99ad !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 0.16em !important;
}

.crm-detail-modal .crm-client-detail-grid h4,
.crm-detail-modal .crm-client-detail-grid > div > div > p:nth-child(2) {
  margin-top: 10px !important;
  color: #102a56 !important;
  font-size: 17px !important;
  font-weight: 850 !important;
  line-height: 1.25 !important;
}

.crm-detail-modal .crm-client-detail-grid > div > div > p:nth-child(n + 3) {
  margin-top: 9px !important;
  color: #52647e !important;
  font-size: 13px !important;
  font-weight: 650 !important;
  line-height: 1.45 !important;
}

.crm-detail-modal .crm-client-detail-grid svg {
  width: 15px !important;
  height: 15px !important;
}

.crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div > div {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px !important;
  margin-top: 14px !important;
}

.crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div > div > div {
  border-radius: 14px !important;
  padding: 13px 14px !important;
}

.crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div > div p:first-child {
  overflow: hidden;
  color: #102a56 !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  line-height: 1.3 !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div > div p:nth-child(2) {
  margin-top: 7px !important;
  color: #64748b !important;
  font-size: 11px !important;
  font-weight: 700 !important;
}

@media (max-width: 900px) {
  .crm-detail-modal .crm-client-detail-grid {
    grid-template-columns: 1fr;
  }

  .crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div {
    grid-column: auto;
  }

  .crm-detail-modal .crm-client-detail-grid > div:nth-child(2) > div > div {
    grid-template-columns: 1fr;
  }
}

.crm-detail-modal .crm-project-detail-grid {
  align-items: start;
}

.crm-detail-modal .crm-project-detail-main > div {
  box-shadow: 0 10px 24px rgba(16, 42, 86, 0.045);
}

.crm-detail-modal :where(.crm-project-detail-main, .crm-detail-sidebar) p {
  line-height: 1.45;
}

.crm-detail-modal .crm-detail-sidebar {
  align-self: stretch;
}

.crm-detail-modal .crm-detail-side-card {
  overflow: hidden;
  border: 1px solid #d8e5f4;
  border-radius: 16px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(16, 42, 86, 0.045);
}

.crm-detail-modal .crm-detail-side-card.muted {
  background: #f8fbfe;
}

.crm-detail-modal .crm-detail-side-eyebrow {
  color: #8a99ad;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.crm-detail-modal .crm-detail-side-title {
  margin-top: 5px;
  color: #102a56;
  font-size: 15px;
  font-weight: 850;
  line-height: 1.25;
}

.crm-detail-modal .crm-detail-status-pill {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: 999px;
  padding: 4px 9px;
  background: #eef5fc;
  color: #1e5aa8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.crm-detail-modal .crm-detail-status-pill.done {
  background: #ecfdf5;
  color: #047857;
}

.crm-detail-modal .crm-detail-status-pill.plan {
  background: #fff7ed;
  color: #b45309;
}

.crm-detail-modal .crm-detail-side-list {
  display: grid;
  gap: 11px;
  margin-top: 15px;
}

.crm-detail-modal .crm-detail-side-list.compact {
  margin-top: 13px;
  gap: 9px;
}

.crm-detail-modal .crm-detail-side-list > div {
  min-width: 0;
  padding-top: 10px;
  border-top: 1px solid #edf2f8;
}

.crm-detail-modal .crm-detail-side-list dt {
  color: #8a99ad;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.crm-detail-modal .crm-detail-side-list dd {
  margin-top: 4px;
  overflow-wrap: anywhere;
  color: #152238;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.35;
}

.crm-detail-modal .crm-detail-side-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 13px;
}

.crm-detail-modal .crm-detail-side-stats > div {
  min-height: 72px;
  border: 1px solid #e3edf8;
  border-radius: 14px;
  background: #f8fbfe;
  padding: 11px;
}

.crm-detail-modal .crm-detail-side-stats span {
  display: block;
  color: #102a56;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.crm-detail-modal .crm-detail-side-stats p {
  margin-top: 7px;
  color: #6b7a90;
  font-size: 11px;
  font-weight: 700;
}

.crm-detail-modal .crm-detail-side-action {
  display: flex;
  width: 100%;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid #d8e5f4;
  background: #ffffff;
  color: #102a56;
  font-size: 12px;
  font-weight: 800;
  transition: background-color 160ms ease, transform 160ms ease;
}

.crm-detail-modal .crm-detail-side-action:hover {
  background: #eef5fc;
  transform: translateY(-1px);
}

.crm-detail-modal .crm-project-profit-card,
.crm-detail-modal .crm-project-milestone-card {
  background: #0b1f4a !important;
  border-color: #0b1f4a !important;
}

.crm-detail-modal .crm-project-profit-card :where(p, span, h4, strong),
.crm-detail-modal .crm-project-milestone-card :where(p, span, h4, strong) {
  color: #ffffff !important;
  opacity: 1 !important;
}

.crm-detail-modal .crm-project-profit-card :where(.text-slate-500, .text-slate-400),
.crm-detail-modal .crm-project-milestone-card :where(.text-slate-500, .text-slate-400) {
  color: #cbd5e1 !important;
}

.crm-detail-modal .crm-project-profit-card :where([class*="text-emerald"], [class*="text-rose"]) {
  color: #ffffff !important;
}

.crm-detail-modal .crm-project-milestone-card .crm-detail-milestone-row {
  min-height: 52px;
}

.crm-detail-modal .crm-project-milestone-card .crm-detail-milestone-row p:first-child {
  color: #102a56 !important;
  font-size: 12px !important;
  line-height: 1.35 !important;
}

.crm-detail-modal .crm-project-milestone-card .crm-detail-milestone-row p:nth-child(2) {
  color: #64748b !important;
  font-size: 10.5px !important;
}

.crm-detail-modal .crm-project-milestone-card .crm-detail-milestone-row .crm-detail-milestone-status {
  color: #102a56 !important;
  font-size: 9.5px !important;
  line-height: 1 !important;
  background: #fff7ed !important;
}

.crm-project-modal {
  font-size: 13px;
}

.crm-project-modal > div:first-child {
  padding: 11px 20px !important;
}

.crm-project-modal > div:first-child h3 {
  font-size: 16px !important;
  line-height: 1.2 !important;
}

.crm-project-modal > div:first-child span {
  margin-top: 4px !important;
  color: #64748b !important;
  font-size: 9.5px !important;
  letter-spacing: 0.14em !important;
}

.crm-project-modal #btn-close-project-modal {
  width: 34px !important;
  height: 34px !important;
}

.crm-project-modal .crm-project-body {
  gap: 12px !important;
  padding: 8px 18px 12px !important;
}

.crm-project-modal .crm-project-body > div:not(.crm-project-step-warning),
.crm-project-modal .crm-project-body > section {
  width: min(100%, 760px);
  margin-right: auto;
  margin-left: auto;
}

.crm-project-modal .crm-project-body > .crm-project-detail-step {
  width: min(100%, 720px);
  padding: 16px !important;
  border-radius: 18px !important;
  background: #fbfdff !important;
}

.crm-project-step-warning {
  display: flex;
  width: min(100%, 760px);
  min-height: 42px;
  margin: 0 auto 14px;
  align-items: center;
  gap: 10px;
  padding: 10px 13px;
  color: #9f1239;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  background: #fff1f2;
  font-size: 11px;
  font-weight: 700;
}

.crm-project-modal input[aria-invalid="true"],
.crm-project-modal select[aria-invalid="true"] {
  border-color: #e11d48 !important;
  background: #fff7f8 !important;
  box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1) !important;
}

.crm-project-modal .form-field-warning {
  margin-top: 6px;
  color: #be123c !important;
  font-size: 10px !important;
  font-weight: 700;
  line-height: 1.45;
}

.crm-project-modal .crm-project-body > div {
  border-radius: 16px !important;
  padding: 14px !important;
}

.crm-project-modal .crm-project-body > div[class*="space-y-5"],
.crm-project-modal .crm-project-body > div[class*="space-y-6"] {
  row-gap: 12px !important;
}

.crm-project-modal .crm-project-detail-step > div:first-child {
  gap: 10px !important;
  padding-bottom: 11px !important;
}

.crm-project-modal .crm-project-detail-step > div:first-child > div {
  width: 34px !important;
  height: 34px !important;
  padding: 0 !important;
  border-radius: 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.crm-project-modal .crm-project-detail-step > div:first-child svg {
  width: 15px !important;
  height: 15px !important;
}

.crm-project-modal .crm-project-detail-step > div:not(:first-child) {
  gap: 14px 16px !important;
}

.crm-project-modal .crm-project-body h4 {
  color: #102a56 !important;
  font-size: 12.5px !important;
  line-height: 1.3 !important;
}

.crm-project-modal .crm-project-detail-step h4 {
  font-size: 12px !important;
  letter-spacing: 0.08em !important;
}

.crm-project-modal .crm-project-body label {
  color: #52647e !important;
  font-size: 10.5px !important;
}

.crm-project-modal .crm-project-detail-step label {
  color: #64748b !important;
  font-size: 10px !important;
  letter-spacing: 0.08em !important;
}

.crm-project-modal .crm-project-body input,
.crm-project-modal .crm-project-body select {
  height: 42px !important;
  min-height: 42px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
}

.crm-project-modal .crm-project-detail-step input,
.crm-project-modal .crm-project-detail-step select {
  height: 40px !important;
  min-height: 40px !important;
  border-radius: 10px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 12.5px !important;
  font-weight: 700 !important;
}

.crm-project-modal .crm-project-detail-step .currency-input > span {
  left: 14px !important;
  color: #64748b !important;
  font-size: 11px !important;
}

.crm-project-modal .crm-project-detail-step .currency-input > input {
  padding-left: 2.55rem !important;
}

.crm-project-modal .crm-project-detail-step > .space-y-2 > p {
  margin-top: 8px !important;
  color: #64748b !important;
  font-size: 11px !important;
}

.crm-project-modal .crm-project-body button {
  min-height: 40px !important;
  height: 40px !important;
  border-radius: 10px !important;
  font-size: 12px !important;
}

.crm-milestone-form-item {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 116px 116px 34px;
  align-items: center;
  gap: 8px;
  min-height: 46px;
}

.crm-project-modal .crm-milestone-item-title {
  display: block;
  min-width: 0;
  color: #102a56 !important;
  font-size: 12.5px !important;
  line-height: 1.35;
}

.crm-project-modal #proj-team-position:read-only {
  color: #52647e !important;
  border-color: #d8e5f4 !important;
  background: #f1f5f9 !important;
  box-shadow: none !important;
}

.crm-project-modal .crm-project-body p,
.crm-project-modal .crm-project-body span {
  font-size: 11px !important;
  line-height: 1.45 !important;
}

.crm-project-modal .crm-project-body .crm-milestone-form-item {
  padding: 8px 10px !important;
}

.crm-project-modal .crm-project-body .crm-milestone-item-title {
  color: #102a56 !important;
  font-size: 13.5px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
}

.crm-project-modal .crm-project-body .crm-milestone-form-item input,
.crm-project-modal .crm-project-body .crm-milestone-form-item select {
  height: 34px !important;
  min-height: 34px !important;
  border-radius: 9px !important;
  padding: 0 9px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

.crm-project-modal .crm-project-body .crm-milestone-form-item select {
  padding-right: 24px !important;
}

.crm-project-modal .crm-project-body .crm-milestone-form-item button {
  width: 34px !important;
  height: 34px !important;
  min-height: 34px !important;
}

.crm-project-modal .crm-project-team-inputs {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
}

.crm-project-modal .crm-project-team-inputs input {
  height: 46px !important;
  min-height: 46px !important;
  font-size: 13px !important;
}

.crm-project-modal #btn-add-project-team {
  grid-column: 1 / -1 !important;
  height: 46px !important;
  min-height: 46px !important;
  width: 100% !important;
  font-size: 13px !important;
}

.crm-project-modal .crm-project-team-list-head {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 34px !important;
}

.crm-project-modal .crm-project-team-chip {
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) 34px !important;
  min-height: 64px !important;
  width: 100% !important;
}

.crm-project-modal .crm-project-team-chip span:first-child {
  font-size: 13px !important;
  line-height: 1.35 !important;
}

.crm-project-modal .crm-project-team-chip span:nth-child(2) {
  font-size: 11px !important;
  line-height: 1.3 !important;
}

.crm-project-modal .crm-project-team-chip button {
  width: 34px !important;
  height: 34px !important;
  min-height: 34px !important;
  flex-shrink: 0;
}

.crm-project-modal .crm-project-body svg {
  width: 16px !important;
  height: 16px !important;
}

.crm-project-modal form > div:last-child {
  padding: 9px 20px !important;
}

.crm-project-modal form > div:last-child button {
  min-height: 40px !important;
  height: 40px !important;
  padding: 8px 18px !important;
  font-size: 12px !important;
}

.crm-project-step {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  color: #8192aa;
}

.crm-project-steps {
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.crm-project-modal .crm-project-steps {
  display: flex !important;
  height: 32px !important;
  min-height: 32px !important;
  align-items: center !important;
  padding: 3px 20px !important;
}

.crm-project-steps ol {
  display: grid !important;
  width: 100%;
  min-width: 560px;
  grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.crm-project-step span {
  display: inline-flex;
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  align-items: center;
  justify-content: center;
  border: 1px solid #d8e5f4;
  border-radius: 7px;
  background: #fff;
  font-size: 10.5px;
  font-weight: 800;
}

.crm-project-step strong {
  overflow: hidden;
  color: #52647e;
  font-size: 11.5px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.crm-project-step.active,
.crm-project-step.complete {
  color: #102a56;
}

.crm-project-step.active span {
  color: #fff;
  border-color: #102a56;
  background: #102a56;
  box-shadow: 0 5px 12px rgba(16, 42, 86, 0.18);
}

.crm-project-step.complete span {
  color: #fff;
  border-color: #1e5aa8;
  background: #1e5aa8;
}

.crm-project-review-item {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #d8e5f4;
  border-radius: 12px;
  background: #fff;
}

.crm-project-review-item dt {
  color: #8192aa;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
}

.crm-project-review-item dd {
  margin-top: 5px;
  overflow-wrap: anywhere;
  color: #102a56;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 639px) {
  .crm-project-modal .crm-project-body {
    padding: 14px !important;
  }

  .crm-project-steps {
    padding: 10px 14px;
  }

  .crm-project-step {
    justify-content: center;
  }

  .crm-project-step strong {
    display: none;
  }
}

@media (max-width: 767px) {
  .crm-project-modal .crm-project-team-inputs {
    grid-template-columns: 1fr !important;
  }

  .crm-milestone-form-item {
    grid-template-columns: minmax(0, 1fr) 36px;
  }

  .crm-milestone-form-item input,
  .crm-milestone-form-item select {
    grid-column: 1 / -1;
  }

  .crm-milestone-form-item button {
    grid-column: 2;
  }
}

@media (max-width: 640px) {
  .crm-project-modal .crm-project-team-list-head {
    display: none !important;
  }

  .crm-project-modal .crm-project-team-chip {
    grid-template-columns: minmax(0, 1fr) 34px !important;
  }

  .crm-project-modal .crm-project-team-chip > div:nth-child(2) {
    grid-column: 1 / 2;
  }

  .crm-project-modal .crm-project-team-chip > button {
    grid-column: 2 / 3;
    grid-row: 1 / span 2;
  }
}
</style>
