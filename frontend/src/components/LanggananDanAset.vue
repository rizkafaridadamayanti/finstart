<template>
  <div class="space-y-6 font-sans">
    <!-- Action Header bar -->
    <div
      class="workspace-page-header flex flex-wrap justify-between items-start gap-4"
    >
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">
          <template v-if="isRiwayatTransaksiView">Riwayat Transaksi</template
          ><template v-else-if="isTagihanView">Tagihan Berikutnya</template
          ><template v-else-if="isRiwayatKadaluarsaView"
            >Riwayat Kadaluarsa</template
          ><template v-else-if="isAsetKategoriView">Kategori Aset</template
          ><template v-else-if="isRiwayatAsetView">Riwayat Aset</template
          ><template v-else-if="activeTab === 'assets'"
            >Aset Teknologi</template
          ><template v-else>Kelola Langganan</template>
        </h1>
        <p class="text-xs text-slate-400 font-light mt-1">
          <template v-if="isRiwayatTransaksiView"
            >Ringkasan status tagihan terakhir dari semua layanan.</template
          ><template v-else-if="isTagihanView"
            >Langganan muncul mulai H-3 dari tanggal tagihan berikutnya.
            Tagihan yang sudah paid tidak ditampilkan di tabel ini.</template
          ><template v-else-if="isRiwayatKadaluarsaView"
            >Menampung layanan yang tanggal perpanjangannya sudah lewat atau
            statusnya dihentikan/nonaktif.</template
          ><template v-else-if="isAsetKategoriView"
            >Kelola kategori aset yang dipakai untuk mengelompokkan aset
            tetap.</template
          ><template v-else-if="isRiwayatAsetView"
            >Aset yang sudah dilepas dari inventaris aset tetap.</template
          ><template v-else
            >Lacak pengeluaran operational burn rate SaaS serta database
            penyusutan depresiasi hardware infrastruktur korporat.</template
          >
        </p>
      </div>
      <div
        v-if="!isLanggananFullPageView && !isAsetKategoriView && !isRiwayatAsetView"
        class="flex flex-col sm:flex-row sm:items-center gap-3 ml-auto"
      >
        <button
          id="btn-add-subs-asset"
          class="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white shadow transition-all hover:bg-[#1E3A8A] whitespace-nowrap"
          :style="{ minWidth: activeTab === 'subs' ? '178px' : '160px' }"
          @click="activeTab === 'subs'
                ? updateIsSubModalOpen(true)
                : openAssetForm()"
        >
          <Plus class="w-4 h-4" /><template v-if="activeTab === 'subs'"
            >Tambah Layanan Baru</template
          ><template v-else>Catat Aset Fisik</template>
        </button>
      </div>
    </div>
    <!-- 1. LAYANAN LANGGANA DIGITAL view -->
    <div
      v-if="activeTab === 'subs' && !isLanggananFullPageView"
      class="space-y-6"
    >
      <!-- Burn rate calculation block card -->
      <div
        class="bg-[#102A56] text-white p-6 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div class="space-y-1 z-10">
          <span
            class="text-[10px] text-[#BFD0E6] font-bold uppercase tracking-widest block"
            >Est. SaaS Monthly Burn Rate</span
          >
          <h2 class="text-3xl font-mono font-bold">
            {{ formatRupiah(totalSubBurnRate) }} / bulan
          </h2>
          <p class="text-xs text-blue-200/80 font-light leading-relaxed">
            Pengeluaran rutin lisensi IDE, server hosting AWS, token machine
            learning, dan produktivitas tim internal.
          </p>
        </div>
        <div
          class="bg-[#0B1F42] border border-white/10 p-4 rounded-2xl shrink-0 text-xs text-blue-100 space-y-2 z-10"
        >
          <span class="font-bold text-white block"
            >Distribusi Berdasarkan Kategori:</span
          >
          <div class="space-y-1 font-mono">
            <p>
              • Infrastruktur:
              <span class="font-bold text-white">{{ formatRupiah(subscriptionTotalByCategory("Infrastruktur")) }}</span>
            </p>
            <p>
              • Software:
              <span class="font-bold text-white">{{ formatRupiah(subscriptionTotalByCategory("Software")) }}</span>
            </p>
            <p>
              • Marketing:
              <span class="font-bold text-white">{{ formatRupiah(subscriptionTotalByCategory("Marketing")) }}</span>
            </p>
          </div>
        </div>
      </div>
      <!-- Subs Log Table -->
      <div
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
      >
        <div
          class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4"
        >
          <div
            class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="relative w-full lg:w-80">
              <span
                class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"
                ><Search class="w-4 h-4" /></span
              ><input
                id="subs-search-box"
                type="text"
                :value="searchQuery"
                placeholder="Cari layanan langganan..."
                class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
                @input="updateSearchQuery(eventValue($event))"
              />
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs text-[#6B7A90]">Kategori:</span
              ><button
                v-for="cat in ['All', 'Infrastruktur', 'Software', 'Marketing']"
                :id="`sub-cat-filter-${cat}`"
                :key="cat"
                type="button"
                :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition ${subCategoryFilter === cat ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
                @click="updateSubCategoryFilter(cat)"
              >
                {{ cat }}</button
              >
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-5">Nama Layanan</th>
                <th class="p-5">Klasifikasi Kategori</th>
                <th class="p-5">Biaya Rutin (Siklus)</th>
                <th class="p-5 text-center">Est. Nominal Rupiah</th>
                <th class="p-5 text-center">Tagihan Berikutnya</th>
                <th class="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="item in pagedSubs"
                :key="item.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-5">
                  <span
                    class="font-bold text-[#0B1F4A] block text-sm flex items-center gap-1.5"
                    ><CreditCard class="w-4 h-4 text-slate-400" />{{
                      item.nama
                    }}</span
                  ><span class="text-[10px] text-slate-400 font-mono block"
                    >{{ item.id }} (by {{ item.provider }})</span
                  >
                </td>
                <td class="p-5">
                  <span
                    :class="`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${item.kategori === 'Infrastruktur' ? 'bg-sky-50 text-sky-700' : item.kategori === 'Software' ? 'bg-blue-50 text-[#0B1F4A]' : 'bg-amber-50 text-amber-700'}`"
                    >{{ item.kategori }}</span
                  >
                </td>
                <td class="p-5 font-mono font-medium">
                  {{ formatRupiah(item.biayaIDR || item.biaya) }} ({{
                    item.siklus
                  }})
                </td>
                <td class="p-5 text-center font-mono font-bold text-slate-800 text-sm">
                  {{ formatRupiah(item.biayaIDR) }}
                </td>
                <td class="p-5 text-center">
                  <span class="block font-mono">{{ item.tanggalTagihan }}</span>
                  <span
                    v-if="item.latestBillNumber"
                    class="mt-1 block text-[10px] font-semibold text-[#64748B]"
                  >
                    Bill terakhir: {{ item.latestBillNumber }}
                  </span>
                </td>
                <td class="p-5">
                  <div class="flex justify-center gap-1.5">
                    <button
                      type="button"
                      :aria-label="`Detail ${item.nama}`"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      title="Detail"
                      @click="showSubDetail(item)"
                    >
                      <Eye class="h-3.5 w-3.5" />
                    </button>
                    <button
                      :aria-label="`Hapus ${item.nama}`"
                      class="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700"
                      title="Hentikan Layanan"
                      @click="requestStopSubscription(item)"
                    >
                      <Trash2 class="w-4 h-4 text-current" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="subsPage"
          :total="filteredSubs.length"
          @page-change="subsPage = safePage($event, filteredSubs.length)"
        />
      </div>
    </div>
    <!-- 3. RIWAYAT TRANSAKSI LANGGANAN full-page view -->
    <div
      v-if="isRiwayatTransaksiView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-500">
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-5">Layanan</th>
              <th class="p-5">Mata Uang</th>
              <th class="p-5 text-center">Nominal</th>
              <th class="p-5 text-center">Tagihan Berikutnya</th>
              <th class="p-5 text-center">Status Terakhir</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr
              v-for="item in pagedSubHistory"
              :key="`sub-history-${item.id}`"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="p-5">
                <p class="font-bold text-[#0B1F4A]">{{ item.nama }}</p>
                <p class="mt-0.5 text-[10px] text-[#8A98AB]">
                  {{ item.provider || "-" }}
                </p>
              </td>
              <td class="p-5 font-mono">
                {{ item.mataUang || item._raw?.currency || "IDR" }}
              </td>
              <td
                class="whitespace-nowrap p-5 text-center font-mono font-bold text-[#0B1F4A]"
              >
                {{ formatRupiah(item.biayaIDR || item.biaya || 0) }}
              </td>
              <td class="whitespace-nowrap p-5 text-center font-mono">
                {{ subscriptionDueDisplayDate(item) || "-" }}
              </td>
              <td class="p-5 text-center">
                <span
                  :class="`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${subscriptionBillingStatusClass(item)}`"
                >
                  {{ subscriptionBillingStatusLabel(item) }}
                </span>
                <span
                  v-if="subscriptionBillingSummary(item)"
                  class="mt-1 block text-[10px] font-semibold text-[#64748B]"
                >
                  {{ subscriptionBillingSummary(item) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        :page="subHistoryPage"
        :total="(langganan || []).length"
        @page-change="subHistoryPage = safePage($event, (langganan || []).length)"
      />
    </div>
    <!-- 4. TAGIHAN BERIKUTNYA full-page view -->
    <div
      v-if="isTagihanView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table
          v-if="dueSubs.length"
          class="w-full text-left text-xs text-slate-500"
        >
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-5">Layanan</th>
              <th class="p-5">Kategori</th>
              <th class="p-5 text-center">Nominal</th>
              <th class="p-5 text-center">Tagihan Berikutnya</th>
              <th class="p-5 text-center">Status</th>
              <th class="p-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr
              v-for="item in pagedDueSubs"
              :key="`due-${item.id}`"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="p-5">
                <p class="font-bold text-[#0B1F4A]">{{ item.nama }}</p>
                <p class="mt-0.5 text-[10px] text-[#8A98AB]">
                  {{ item.provider || "-" }} · {{ item.latestBillNumber || item.id }}
                </p>
              </td>
              <td class="p-5">{{ item.kategori || "-" }}</td>
              <td
                class="whitespace-nowrap p-5 text-center font-mono font-bold text-[#0B1F4A]"
              >
                {{ formatRupiah(item.biayaIDR || item.biaya || 0) }}
              </td>
              <td class="whitespace-nowrap p-5 text-center font-mono">
                {{ subscriptionDueDisplayDate(item) || "-" }}
              </td>
              <td class="p-5 text-center">
                <span
                  :class="`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${subscriptionBillingStatusClass(item)}`"
                >
                  {{ subscriptionBillingStatusLabel(item) }}
                </span>
                <span
                  v-if="subscriptionBillingSummary(item)"
                  class="mt-1 block text-[10px] font-semibold text-[#64748B]"
                >
                  {{ subscriptionBillingSummary(item) }}
                </span>
              </td>
              <td class="p-5 text-center">
                <button
                  type="button"
                  :disabled="payingSubId === item.id"
                  class="tax-payment-action inline-flex items-center gap-1.5 text-[11px] font-bold transition-all disabled:cursor-wait disabled:opacity-60"
                  @click="handlePayBill(item)"
                >
                  <CheckCircle2 class="h-3.5 w-3.5" />
                  {{ payingSubId === item.id ? 'Memproses...' : 'Bayar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-else
          class="py-16 text-center text-xs text-slate-400"
        >
          Tidak ada tagihan yang belum dibayar.
        </p>
      </div>
      <TablePagination
        v-if="dueSubs.length > 0"
        :page="dueSubsPage"
        :total="dueSubs.length"
        @page-change="dueSubsPage = safePage($event, dueSubs.length)"
      />
    </div>
    <!-- 5. RIWAYAT KADALUARSA full-page view -->
    <div
      v-if="isRiwayatKadaluarsaView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div class="overflow-x-auto">
        <table
          v-if="expiredSubs.length"
          class="w-full text-left text-xs text-slate-500"
        >
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="p-5">Layanan</th>
              <th class="p-5">Kategori</th>
              <th class="p-5 text-center">Nominal</th>
              <th class="p-5 text-center">Tanggal</th>
              <th class="p-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr
              v-for="item in pagedExpiredSubs"
              :key="`expired-${item.id}`"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="p-5">
                <p class="font-bold text-[#0B1F4A]">{{ item.nama }}</p>
                <p class="mt-0.5 text-[10px] text-[#8A98AB]">
                  {{ item.provider || "-" }}
                </p>
              </td>
              <td class="p-5">{{ item.kategori || "-" }}</td>
              <td
                class="whitespace-nowrap p-5 text-center font-mono font-bold text-[#0B1F4A]"
              >
                {{ formatRupiah(item.biayaIDR || item.biaya || 0) }}
              </td>
              <td class="whitespace-nowrap p-5 text-center font-mono">
                {{ item.tanggalTagihan || "-" }}
              </td>
              <td class="p-5 text-center">
                <span
                  class="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700"
                  >{{ subscriptionStatusLabel(item) }}</span
                >
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-else
          class="py-16 text-center text-xs text-slate-400"
        >
          Belum ada langganan yang kadaluarsa atau dihentikan.
        </p>
      </div>
      <TablePagination
        v-if="expiredSubs.length > 0"
        :page="expiredPage"
        :total="expiredSubs.length"
        @page-change="expiredPage = safePage($event, expiredSubs.length)"
      />
    </div>
    <!-- 2. ASET TEKNOLOGI INVENTORY view -->
    <div
      v-if="
        activeTab === 'assets' &amp;&amp; !isAsetKategoriView &amp;&amp; !isRiwayatAsetView
      "
      class="space-y-6"
    >
      <!-- Asset statistics overview summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div class="p-3 bg-[#0B1F4A] text-white rounded-xl">
            <Cpu class="w-5 h-5" />
          </div>
          <div>
            <span
              class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block"
              >Total Harga Perolehan Aset</span
            ><span
              class="text-xl font-mono font-bold text-[#0B1F4A] mt-0.5 block"
              >{{ formatRupiah(totalAssetCosts) }}</span
            >
          </div>
        </div>
        <div
          class="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart2 class="w-5 h-5" />
          </div>
          <div>
            <span
              class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block"
              >Total Nilai Buku Neto (Net Book Value)</span
            ><span
              class="text-xl font-mono font-bold text-emerald-700 mt-0.5 block"
              >{{ formatRupiah(totalNetBookValue) }}</span
            >
          </div>
        </div>
      </div>
      <!-- Asset table listing -->
      <div
        class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
      >
        <div
          class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="relative w-full lg:w-80">
            <span
              class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"
              ><Search class="w-4 h-4" /></span
            ><input
              id="assets-search-box"
              type="text"
              :value="searchQuery"
              placeholder="Cari aset atau penanggung jawab..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateSearchQuery(eventValue($event))"
            />
          </div>
          <div class="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            <div
              class="flex shrink-0 items-center gap-2"
            >
              <input
                type="month"
                :value="depreciationPeriod"
                class="asset-toolbar-period h-10 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A] focus:ring-2 focus:ring-[#0B1F4A]/10"
                :style="{ width: '132px' }"
                @change="depreciationPeriod = eventValue($event)"
              /><button
                id="btn-process-depreciation"
                type="button"
                :disabled="isDepreciationProcessing"
                class="asset-toolbar-button h-10 min-w-[146px] rounded-xl bg-[#0B1F4A] px-4 text-xs font-extrabold text-white whitespace-nowrap shadow-sm shadow-[#0B1F4A]/15 transition hover:bg-[#102A56] disabled:cursor-wait disabled:opacity-60"
                @click="openDepreciationModal"
              >
                <template v-if="isDepreciationProcessing"
                  >Memproses...</template
                ><template v-else>Proses Penyusutan</template>
              </button>
            </div>
          </div>
        </div>
        <div class="asset-table-scroll overflow-x-auto">
          <table class="w-full min-w-[980px] table-fixed text-center text-xs text-slate-500">
            <colgroup>
              <col style="width: 16%" />
              <col style="width: 12%" />
              <col style="width: 12%" />
              <col style="width: 13%" />
              <col style="width: 13%" />
              <col style="width: 13%" />
              <col style="width: 13%" />
              <col style="width: 8%" />
            </colgroup>
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="px-3 py-4 text-center">Aset Hardware &amp; Cloud</th>
                <th class="px-3 py-4 text-center">Kategori Aset</th>
                <th class="px-3 py-4 text-center font-mono">Tgl Perolehan</th>
                <th class="px-3 py-4 text-center">Harga Perolehan</th>
                <th class="px-3 py-4 text-center">Depresiasi / Thn</th>
                <th class="px-3 py-4 text-center">Nilai Buku Neto</th>
                <th class="px-3 py-4 text-center">Penanggung Jawab</th>
                <th class="px-3 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="asset in pagedAssets"
                :key="asset.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="px-3 py-4 text-center">
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    asset.nama
                  }}</span
                  ><span class="text-[10px] text-slate-400 font-mono">{{
                    asset.id
                  }}</span>
                </td>
                <td class="px-3 py-4 text-center text-slate-700 font-semibold break-words">
                  {{ asset.kategori }}
                </td>
                <td class="px-3 py-4 text-center font-mono">{{ asset.tanggalBeli }}</td>
                <td class="px-3 py-4 text-center font-mono font-medium text-slate-600">
                  {{ formatRupiah(asset.hargaBeli) }}
                </td>
                <td class="px-3 py-4 text-center font-mono text-rose-600">
                  -{{ formatRupiah(asset.penyusutanTahunan) }}
                </td>
                <td
                  class="px-3 py-4 text-center font-mono font-bold text-emerald-600 text-sm"
                >
                  {{ formatRupiah(asset.nilaiBuku) }}
                </td>
                <td class="px-3 py-4 text-center font-medium text-slate-700 break-words">
                  {{ asset.penanggungJawab }}
                </td>
                <td class="px-3 py-4 text-center">
                  <div class="flex justify-center gap-1">
                    <button
                      type="button"
                      :aria-label="`Riwayat penyusutan ${asset.nama}`"
                      title="Riwayat penyusutan"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click="showDepreciationHistory(asset)"
                    >
                      <History class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Ubah aset ${asset.nama}`"
                      title="Ubah"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click="openAssetForm(asset)"
                    >
                      <Pencil class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Lepas aset ${asset.nama}`"
                      title="Lepas aset"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                      @click="requestDisposeAsset(asset)"
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
          :page="assetsPage"
          :total="filteredAssets.length"
          @page-change="assetsPage = safePage($event, filteredAssets.length)"
        />
      </div>
    </div>
    <!-- 2b. RIWAYAT ASET full-page view -->
    <div
      v-if="isRiwayatAsetView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <div
        class="flex flex-col gap-3 border-b border-[#E8EEF7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="relative w-full lg:w-80">
          <span
            class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#8A98AB]"
            ><Search class="w-4 h-4" /></span
          ><input
            id="asset-archive-search-box"
            type="text"
            :value="assetArchiveSearch"
            placeholder="Cari aset atau penanggung jawab..."
            class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
            @input="assetArchiveSearch = eventValue($event)"
          />
        </div>
      </div>
      <div class="asset-table-scroll overflow-x-auto">
        <table
          v-if="filteredArchivedAssets.length"
          class="w-full min-w-[860px] table-fixed text-center text-xs text-slate-500"
        >
          <colgroup>
            <col style="width: 18%" />
            <col style="width: 14%" />
            <col style="width: 14%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 15%" />
            <col style="width: 9%" />
          </colgroup>
          <thead
            class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
          >
            <tr>
              <th class="px-3 py-4 text-center">Aset Hardware &amp; Cloud</th>
              <th class="px-3 py-4 text-center">Kategori Aset</th>
              <th class="px-3 py-4 text-center font-mono">Tgl Perolehan</th>
              <th class="px-3 py-4 text-center">Harga Perolehan</th>
              <th class="px-3 py-4 text-center">Nilai Buku Neto</th>
              <th class="px-3 py-4 text-center">Penanggung Jawab</th>
              <th class="px-3 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-150">
            <tr
              v-for="asset in pagedArchivedAssets"
              :key="asset.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-3 py-4 text-center">
                <span class="font-bold text-[#0B1F4A] block text-sm">{{
                  asset.nama
                }}</span
                ><span class="text-[10px] text-slate-400 font-mono">{{
                  asset.id
                }}</span>
              </td>
              <td
                class="px-3 py-4 text-center text-slate-700 font-semibold break-words"
              >
                {{ asset.kategori }}
              </td>
              <td class="px-3 py-4 text-center font-mono">
                {{ asset.tanggalBeli }}
              </td>
              <td
                class="px-3 py-4 text-center font-mono font-medium text-slate-600"
              >
                {{ formatRupiah(asset.hargaBeli) }}
              </td>
              <td
                class="px-3 py-4 text-center font-mono font-bold text-emerald-600 text-sm"
              >
                {{ formatRupiah(asset.nilaiBuku) }}
              </td>
              <td
                class="px-3 py-4 text-center font-medium text-slate-700 break-words"
              >
                {{ asset.penanggungJawab }}
              </td>
              <td class="px-3 py-4 text-center">
                <div class="flex justify-center gap-1">
                  <button
                    type="button"
                    :aria-label="`Riwayat penyusutan ${asset.nama}`"
                    title="Riwayat penyusutan"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                    @click="showDepreciationHistory(asset)"
                  >
                    <History class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="py-16 text-center text-xs text-slate-400">
          Belum ada aset yang dilepas dari inventaris.
        </p>
      </div>
      <TablePagination
        v-if="filteredArchivedAssets.length > 0"
        :page="assetArchivePage"
        :total="filteredArchivedAssets.length"
        @page-change="
          assetArchivePage = safePage($event, filteredArchivedAssets.length)
        "
      />
    </div>
    <!-- 2c. KATEGORI ASET full-page view -->
    <div
      v-if="isAsetKategoriView"
      class="overflow-hidden border border-[#DCE7F4] bg-white shadow-sm"
    >
      <section class="min-w-0 p-5 lg:p-8">
        <div
          class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-[13px] font-extrabold text-[#102A56]">
              Daftar Kategori Aset
            </p>
            <p class="mt-1 text-[11px] text-[#7A8CA8]">
              Gunakan ikon untuk ubah atau hapus data.
            </p>
          </div>
          <button
            id="btn-add-asset-category"
            type="button"
            class="inline-flex h-9 w-fit items-center gap-2 rounded-xl bg-[#0B1F4A] px-3.5 text-[12px] font-semibold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56]"
            @click="openAssetCategoryForm()"
          >
            <Plus class="h-3.5 w-3.5" /> Tambah Kategori
          </button>
        </div>
        <div class="relative mb-4">
          <Search
            class="pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-y-1/2 left-3.5 text-[#0B1F4A]"
          />
          <input
            id="asset-category-search"
            :value="assetCategorySearch"
            placeholder="Cari kode, nama, atau keterangan kategori..."
            class="h-10 w-full rounded-xl border border-[#DCE7F4] bg-[#FBFDFF] pl-10 pr-3 text-[12px] font-medium text-[#243650] outline-none transition placeholder:text-[#8FA0B8] focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
            @input="assetCategorySearch = eventValue($event)"
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
                  <th class="px-5 py-3 text-center">Dipakai</th>
                  <th class="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EDF2F7] bg-white">
                <template v-if="filteredAssetCategories.length"
                  ><tr
                    v-for="item in pagedAssetCategories"
                    :key="item.id"
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
                      class="px-4 py-3 text-center font-bold text-[#53658A]"
                    >
                      {{ item.usage_count || 0 }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-center gap-1.5">
                        <button
                          type="button"
                          title="Ubah kategori"
                          aria-label="Ubah kategori"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F2D49B] bg-[#FFF9EE] text-[#B86A00] hover:bg-[#FFF1D7]"
                          @click="openAssetCategoryForm(item)"
                        >
                          <Pencil class="h-3.5 w-3.5" /></button
                        ><button
                          type="button"
                          title="Hapus kategori"
                          aria-label="Hapus kategori"
                          class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                          @click="requestDeleteAssetCategory(item)"
                        >
                          <Trash2 class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td></tr
                ></template>
                <tr v-else>
                  <td
                    colspan="4"
                    class="px-4 py-12 text-center text-xs text-[#8190A5]"
                  >
                    Belum ada kategori aset yang sesuai.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <TablePagination
          :page="assetCategoriesPage"
          :total="filteredAssetCategories.length"
          @page-change="
            assetCategoriesPage = safePage(
              $event,
              filteredAssetCategories.length,
            )
          "
        />
      </section>
    </div>
    <!-- 2c. ADD/EDIT ASET CATEGORY MODAL -->
    <Teleport to="body">
      <div
        v-if="isAssetCategoryEditorOpen"
        class="asset-modal-layer fixed inset-0 z-[10080] flex items-start md:items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div
          class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
        >
          <div
            class="px-6 py-5 border-b border-slate-100 flex justify-between items-start"
          >
            <div>
              <h3 class="font-extrabold text-lg text-[#111827] tracking-tight">
                <template v-if="assetCategoryForm.id">Ubah Kategori</template
                ><template v-else>Tambah Kategori</template>
              </h3>
              <span class="text-[11px] text-[#53658A] block mt-0.5"
                >Kategori dipakai untuk mengelompokkan aset pada tabel Kelola
                Aset.</span
              >
            </div>
            <button
              id="btn-close-asset-category-modal"
              type="button"
              class="w-10 h-10 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors"
              @click="closeAssetCategoryEditor"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <form
            class="min-h-0 flex-1 space-y-4 overflow-y-auto p-6 text-xs"
            @submit="saveAssetCategory"
          >
            <p v-if="assetCategorySaveWarning" class="form-field-warning">
              {{ assetCategorySaveWarning }}
            </p>
            <div class="space-y-2">
              <label
                class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                for="asset-category-code"
                >Kode</label
              >
              <input
                id="asset-category-code"
                :value="assetCategoryCodePreview"
                readonly
                :class="`${assetInputClass} cursor-not-allowed bg-[#F4F7FB] text-[#7A8CA8]`"
              />
              <p class="text-[10px] text-[#8A98AB]">
                Kode dibuat otomatis dari nama kategori.
              </p>
            </div>
            <div class="space-y-2">
              <label
                class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                for="asset-category-name"
                >Nama Kategori</label
              >
              <input
                id="asset-category-name"
                required
                :value="assetCategoryForm.name"
                placeholder="Contoh: Elektronik / IT"
                :class="assetInputClass"
                @input="
                  assetCategoryForm = {
                    ...assetCategoryForm,
                    name: eventValue($event),
                  }
                "
              />
              <p
                v-if="assetCategoryFormErrors.name"
                class="form-field-warning"
              >
                {{ assetCategoryFormErrors.name }}
              </p>
            </div>
            <div class="space-y-2">
              <label
                class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                for="asset-category-description"
                >Keterangan</label
              >
              <textarea
                id="asset-category-description"
                :value="assetCategoryForm.description"
                :rows="3"
                placeholder="Keterangan singkat (opsional)"
                class="w-full resize-none rounded-xl border border-[#D8E5F4] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#111827] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20"
                @input="
                  assetCategoryForm = {
                    ...assetCategoryForm,
                    description: eventValue($event),
                  }
                "
              />
            </div>
            <div class="grid gap-3 pt-1 sm:grid-cols-2">
              <button
                id="btn-cancel-asset-category"
                type="button"
                class="h-11 rounded-xl border border-[#DCE7F4] bg-white px-4 text-xs font-bold text-[#53658A] transition hover:bg-[#F4F8FD]"
                @click="closeAssetCategoryEditor"
              >
                Batal
              </button>
              <button
                id="btn-save-asset-category"
                type="submit"
                :disabled="assetCategoryBusy"
                class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-bold text-white shadow-md shadow-[#0B1F4A]/15 transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save class="h-4 w-4" />
                <template v-if="assetCategoryBusy">Menyimpan...</template>
                <template v-else>Simpan</template>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="isDepreciationModalOpen"
        class="asset-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div
          class="depreciation-modal-card flex w-full max-w-4xl flex-col overflow-hidden border border-[#D8E5F4] bg-white shadow-2xl"
        >
          <div
            class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-4"
          >
            <div class="min-w-0">
              <p
                class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#1E5AA8]"
              >
                Konfirmasi Penyusutan
              </p>
              <h3 class="mt-1 text-lg font-extrabold text-[#0B1F4A]">
                Penyusutan periode {{ depreciationPeriod }}
              </h3>
              <p class="mt-1 text-[12px] leading-5 text-[#64748B]">
                Periksa rincian dulu. Setelah diposting, jurnal masuk ke Buku
                Besar sebagai Dr Beban Penyusutan dan Cr Akumulasi Penyusutan.
              </p>
            </div>
            <button
              type="button"
              class="rounded-xl p-2 text-[#6B7A90] hover:bg-[#F8FBFE]"
              @click="closeDepreciationModal"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div
            class="depreciation-modal-body min-h-0 flex-1 overflow-hidden px-6 py-4"
          >
            <div
              v-if="depreciationResult"
              :class="`mb-4 rounded-2xl border px-4 py-3 ${depreciationResult.processedCount > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`"
            >
              <div class="flex items-start gap-3">
                <CheckCircle2
                  v-if="depreciationResult.processedCount > 0"
                  class="mt-0.5 h-5 w-5 shrink-0"
                />
                <CircleAlert v-else class="mt-0.5 h-5 w-5 shrink-0" />
                <div class="min-w-0">
                  <p class="text-sm font-extrabold">
                    <template v-if="depreciationResult.processedCount > 0">
                      Penyusutan berhasil diposting
                    </template>
                    <template v-else> Tidak ada aset yang diposting </template>
                  </p>
                  <p class="mt-1 text-xs leading-5">
                    {{ depreciationResult.processedCount }} aset masuk jurnal,
                    {{ depreciationResult.skippedCount }} aset dilewati.
                  </p>
                </div>
              </div>
            </div>

            <div class="shrink-0 grid gap-3 md:grid-cols-4">
              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4">
                <p
                  class="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#70819B]"
                >
                  Siap Diproses
                </p>
                <p class="mt-1 text-lg font-extrabold text-[#0B1F4A]">
                  {{ depreciationPreviewRows.length }}
                </p>
              </div>
              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4">
                <p
                  class="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#70819B]"
                >
                  Estimasi Beban
                </p>
                <p class="mt-1 text-lg font-extrabold text-[#0B1F4A]">
                  {{ formatRupiah(depreciationPreviewTotal) }}
                </p>
              </div>
              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4">
                <p
                  class="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#70819B]"
                >
                  Sudah Disusutkan
                </p>
                <p class="mt-1 text-lg font-extrabold text-[#0B1F4A]">
                  {{ depreciationAlreadyPostedRows.length }}
                </p>
              </div>
              <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-4">
                <p
                  class="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#70819B]"
                >
                  Jurnal
                </p>
                <p class="mt-1 text-[11.5px] font-bold leading-5 text-[#0B1F4A]">
                  Dr Beban Penyusutan<br />Cr Akumulasi Penyusutan
                </p>
              </div>
            </div>

            <div
              class="depreciation-table-panel mt-4 min-h-0 flex-1 overflow-x-auto rounded-xl border border-[#DCE7F4]"
            >
              <table class="depreciation-preview-table w-full text-left text-xs">
                <thead
                  class="bg-[#EEF5FC] text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B3A78]"
                >
                  <tr>
                    <th class="px-4 py-3">Aset</th>
                    <th class="px-4 py-3">Kategori</th>
                    <th class="px-4 py-3 text-right">Nilai Buku</th>
                    <th class="px-4 py-3 text-right">Estimasi Penyusutan</th>
                  </tr>
                </thead>
                <tbody class="depreciation-table-scroll divide-y divide-[#EDF2F7]">
                  <tr
                    v-for="row in depreciationPreviewRows"
                    :key="`depreciation-preview-${row.id}`"
                  >
                    <td class="px-4 py-3 font-bold text-[#0B1F4A]">
                      {{ row.nama }}
                    </td>
                    <td class="px-4 py-3 text-[#64748B]">
                      {{ row.kategori }}
                    </td>
                    <td
                      class="px-4 py-3 text-right font-semibold text-[#0B1F4A]"
                    >
                      {{ formatRupiah(row.nilaiBuku) }}
                    </td>
                    <td
                      class="px-4 py-3 text-right font-extrabold text-[#0B1F4A]"
                    >
                      {{ formatRupiah(row.nominal) }}
                    </td>
                  </tr>
                  <tr v-if="!depreciationPreviewRows.length">
                    <td colspan="4" class="px-4 py-8 text-center text-[#8A98AB]">
                      Tidak ada aset yang perlu diproses untuk periode ini.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="depreciationAlreadyPostedRows.length"
              class="mt-4 overflow-hidden rounded-xl border border-[#DCE7F4]"
            >
              <div class="border-b border-[#E8EEF7] bg-[#F8FBFE] px-4 py-2.5">
                <p class="text-xs font-extrabold text-[#0B1F4A]">
                  Sudah disusutkan periode {{ depreciationPeriod }}
                </p>
                <p class="mt-1 text-[11px] font-semibold text-[#64748B]">
                  Aset di daftar ini tidak ikut diposting ulang agar jurnal tidak dobel.
                </p>
              </div>
              <table class="w-full text-left text-xs">
                <thead
                  class="bg-[#EEF5FC] text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B3A78]"
                >
                  <tr>
                    <th class="px-4 py-3">Aset</th>
                    <th class="px-4 py-3">Kategori</th>
                    <th class="px-4 py-3 text-right">Nilai Buku</th>
                    <th class="px-4 py-3 text-right">Periode Terakhir</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EDF2F7] bg-white">
                  <tr
                    v-for="row in depreciationAlreadyPostedRows"
                    :key="`depreciation-posted-${row.id}`"
                  >
                    <td class="px-4 py-3 font-bold text-[#0B1F4A]">
                      {{ row.nama }}
                    </td>
                    <td class="px-4 py-3 text-[#64748B]">
                      {{ row.kategori }}
                    </td>
                    <td class="px-4 py-3 text-right font-semibold text-[#0B1F4A]">
                      {{ formatRupiah(row.nilaiBuku) }}
                    </td>
                    <td class="px-4 py-3 text-right font-bold text-[#64748B]">
                      {{ row.lastDepreciationPeriod }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-if="depreciationResult?.skippedReasons?.length"
              class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <p class="text-xs font-extrabold text-amber-800">
                Aset yang dilewati
              </p>
              <ul class="mt-2 grid gap-2 md:grid-cols-2">
                <li
                  v-for="item in depreciationResult.skippedReasons"
                  :key="`${item.asset_id}-${item.reason}`"
                  class="rounded-xl bg-white px-3 py-2 text-xs"
                >
                  <p class="font-bold text-[#0B1F4A]">{{ item.asset_name }}</p>
                  <p class="mt-1 text-[#64748B]">{{ item.reason }}</p>
                </li>
              </ul>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 border-t border-[#E8EEF7] px-6 py-3.5 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              class="h-10 min-w-[96px] rounded-xl border border-[#D8E5F4] bg-white px-5 text-sm font-semibold text-[#0B1F4A]"
              @click="closeDepreciationModal"
            >
              Tutup
            </button>
            <button
              v-if="!depreciationResult"
              type="button"
              :disabled="isDepreciationProcessing || !depreciationPreviewRows.length"
              class="h-10 min-w-[268px] rounded-xl bg-[#0B1F4A] px-5 text-sm font-bold text-white shadow-lg shadow-[#0B1F4A]/20 transition hover:bg-[#102A56] disabled:cursor-not-allowed disabled:opacity-60"
              @click="processMonthlyDepreciation"
            >
              <template v-if="isDepreciationProcessing">Memposting...</template>
              <template v-else>Posting Penyusutan ke Buku Besar</template>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
    <div
      v-if="assetHistory"
      class="asset-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-2xl overflow-hidden bg-white shadow-2xl"
      >
        <div
          class="flex items-start justify-between border-b border-[#E8EEF7] px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Riwayat Penyusutan
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              {{ assetHistory.asset?.asset_name || "Aset" }}
            </h3>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-[#6B7A90]"
            @click="assetHistory = null"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="max-h-[55vh] overflow-auto p-6">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div
              class="inline-flex rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] p-1"
            >
              <button
                type="button"
                :class="[
                  'h-8 rounded-lg px-3 text-xs font-bold transition',
                  assetHistoryViewMode === 'monthly'
                    ? 'bg-[#0B1F4A] text-white shadow-sm'
                    : 'text-[#53658A] hover:bg-white',
                ]"
                @click="setAssetHistoryViewMode('monthly')"
              >
                Bulanan
              </button>
              <button
                type="button"
                :class="[
                  'h-8 rounded-lg px-3 text-xs font-bold transition',
                  assetHistoryViewMode === 'yearly'
                    ? 'bg-[#0B1F4A] text-white shadow-sm'
                    : 'text-[#53658A] hover:bg-white',
                ]"
                @click="setAssetHistoryViewMode('yearly')"
              >
                Tahunan
              </button>
            </div>
            <div class="text-xs font-semibold text-[#70819B]">
              Periode aktif: {{ depreciationPeriod }}
            </div>
          </div>
          <table
            v-if="assetHistoryDisplayRows.length"
            class="w-full table-fixed text-left text-xs"
          >
            <colgroup>
              <col class="w-[22%]" />
              <col class="w-[28%]" />
              <col class="w-[24%]" />
              <col class="w-[26%]" />
            </colgroup>
            <thead class="border-b border-[#E8EEF7] text-[#70819B]">
              <tr>
                <th class="px-3 pb-3">
                  {{ assetHistoryViewMode === "monthly" ? "Bulan" : "Tahun" }}
                </th>
                <th class="px-3 pb-3">Status</th>
                <th class="px-3 pb-3 text-right">Nilai</th>
                <th class="px-3 pb-3">Voucher</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-for="item in pagedAssetHistoryRows" :key="item.id">
                <td class="px-3 py-3">{{ item.periodLabel }}</td>
                <td class="px-3 py-3">
                  <span
                    :class="[
                      'rounded-full px-2 py-1 text-[10px] font-bold',
                      item.isPosted
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700',
                    ]"
                    >{{ item.statusLabel }}</span
                  >
                </td>
                <td class="px-3 py-3 text-right font-semibold whitespace-nowrap">
                  {{ formatRupiah(item.amount) }}
                </td>
                <td class="px-3 py-3 text-[#8A98AB] break-words">
                  {{ item.voucher }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] p-4 text-sm text-[#8A98AB]">
            Belum ada data penyusutan untuk aset ini.
          </div>
          <p
            v-if="assetHistoryDisplayRows.some((item) => !item.isPosted)"
            class="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-[#0B1F4A]"
          >
            Baris estimasi mengikuti periode aktif yang dipilih di atas tabel.
            Agar menjadi riwayat resmi dan masuk jurnal, posting penyusutan
            periode terkait.
          </p>
        </div>
        <TablePagination
          v-if="assetHistoryDisplayRows.length > 0"
          :page="assetHistoryPage"
          :total="assetHistoryDisplayRows.length"
          @page-change="assetHistoryPage = safePage(
                $event,
                assetHistoryDisplayRows.length,
              )"
        />
        <div class="flex flex-wrap justify-end gap-3 border-t border-[#E8EEF7] px-6 py-4">
          <button
            type="button"
            :disabled="isDepreciationProcessing || !assetHistory?.asset?.id"
            class="h-10 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-semibold text-[#0B1F4A] disabled:cursor-not-allowed disabled:opacity-60"
            @click="processAssetHistoryDepreciation"
          >
            <template v-if="isDepreciationProcessing">Memposting...</template>
            <template v-else>Posting {{ depreciationPeriod }}</template>
          </button>
          <button
            type="button"
            class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            @click="assetHistory = null"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    </Teleport>
    <!-- SUBSCRIPTION DETAIL MODAL -->
    <Teleport to="body">
      <div
        v-if="viewingSub"
        class="fixed inset-0 z-[10090] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
        <div
          class="bg-white border border-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          <div class="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Detail Langganan</p>
              <h3 class="mt-1 text-lg font-extrabold text-[#102A56] tracking-tight">{{ viewingSub.nama }}</h3>
              <p class="mt-0.5 text-xs text-slate-500">{{ viewingSub.id }} &middot; {{ viewingSub.provider }}</p>
            </div>
            <button
              class="w-9 h-9 flex shrink-0 items-center justify-center rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              @click="closeSubDetail"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Kategori</p>
                <p class="mt-1 text-[13px] font-semibold text-slate-800">{{ viewingSub.kategori }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Siklus</p>
                <p class="mt-1 text-[13px] font-semibold text-slate-800">{{ viewingSub.siklus }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Mata Uang</p>
                <p class="mt-1 text-[13px] font-semibold text-slate-800">{{ viewingSub.mataUang }}</p>
              </div>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Biaya</p>
                <p class="mt-1 text-[13px] font-bold text-[#0B1F4A]">{{ formatRupiah(viewingSub.biayaIDR || viewingSub.biaya) }}</p>
              </div>
              <div class="col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tagihan Berikutnya</p>
                <p class="mt-1 text-[13px] font-semibold text-slate-800 font-mono">{{ viewingSub.tanggalTagihan }}</p>
              </div>
            </div>
            <div v-if="viewingSub.mataUang !== 'IDR'" class="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2.5">
              <p class="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Kurs & Konversi</p>
              <p class="mt-1 text-[13px] text-slate-700">Nominal asli: {{ viewingSub.mataUang }} {{ viewingSub.biaya }}</p>
              <p class="mt-0.5 text-[13px] font-semibold text-[#0B1F4A]">Estimasi IDR: {{ formatRupiah(viewingSub.biayaIDR) }}</p>
            </div>
          </div>
          <div class="flex justify-end px-5 py-3 border-t border-slate-100">
            <button
              type="button"
              class="rounded-xl border border-[#DCE7F4] bg-white px-4 py-2 text-xs font-semibold text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
              @click="closeSubDetail"
            >Tutup</button>
          </div>
        </div>
      </div>
    </Teleport>
    <ConfirmDialog
      :open="!!confirmDialog"
      :eyebrow="confirmDialog?.eyebrow || 'Konfirmasi'"
      :title="confirmDialog?.title || 'Lanjutkan tindakan?'"
      :message="confirmDialog?.message || ''"
      :details="confirmDialog?.details || []"
      :impact-items="confirmDialog?.impactItems || []"
      :confirm-label="confirmDialog?.confirmLabel || 'Lanjutkan'"
      :cancel-label="confirmDialog?.cancelLabel || 'Batalkan'"
      :variant="confirmDialog?.variant || 'danger'"
      :require-reason="!!confirmDialog?.requireReason"
      :reason-label="confirmDialog?.reasonLabel || 'Alasan'"
      :reason-placeholder="
        confirmDialog?.reasonPlaceholder || 'Tulis alasan singkat...'
      "
      :default-reason="confirmDialog?.defaultReason || ''"
      @cancel="closeConfirmDialog"
      @confirm="handleConfirmDialog"
    /><!-- 3. ADD SUBSCRIPTION MODAL -->
    <Teleport to="body">
      <div
        v-if="isSubModalOpen"
        class="fixed inset-0 z-[10000] flex items-start justify-center overflow-y-auto bg-[#0B1220]/60 p-3 backdrop-blur-sm md:items-center md:p-4"
      >
      <div
        class="subscription-modal-card my-3 flex w-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-2xl md:my-4 md:rounded-[34px]"
      >
        <div
          class="shrink-0 px-5 py-5 border-b border-slate-100 flex justify-between items-center md:px-9 md:py-7"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-[#0B1F4A] text-white flex items-center justify-center shadow-lg shadow-[#0B1F4A]/25"
            >
              <Plus class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-2xl text-[#111827] tracking-tight">
              Daftarkan Layanan
            </h3>
          </div>
          <button
            id="btn-close-sub-modal"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="updateIsSubModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          class="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 text-sm md:px-9 md:py-8"
          @submit.prevent="handleSaveSub"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Nama Layanan *</label
              ><input
                id="sub-form-name"
                type="text"
                required
                placeholder="Contoh: AWS Production"
                :value="newSub.nama"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @input="updateNewSub({ ...newSub, nama: eventValue($event) })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Provider *</label
              ><input
                id="sub-form-provider"
                type="text"
                required
                placeholder="Contoh: Amazon"
                :value="newSub.provider"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @input="updateNewSub({ ...newSub, provider: eventValue($event) })"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Mata Uang *</label
              >
              <div class="relative">
                <select
                  id="sub-form-currency"
                  required
                  :value="newSub.mataUang"
                  class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all"
                  @change="handleSubscriptionCurrencyChange"
                >
                  <option
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option></select
                ><ChevronDown
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]"
                />
              </div>
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Siklus *</label
              >
              <div class="relative">
                <select
                  id="sub-form-cycle"
                  required
                  :value="newSub.siklus"
                  class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all"
                  @change="updateNewSub({ ...newSub, siklus: eventValue($event) })"
                >
                  <option value="Bulanan">Bulanan</option>
                  <option value="Tahunan">Tahunan</option></select
                ><ChevronDown
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]"
                />
              </div>
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Kategori *</label
              >
              <div class="relative">
                <select
                  id="sub-form-category"
                  required
                  :value="newSub.kategori"
                  class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all"
                  @change="updateNewSub({ ...newSub, kategori: eventValue($event) })"
                >
                  <option value="Software">Software/SaaS</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Marketing">Marketing</option></select
                ><ChevronDown
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]"
                />
              </div>
            </div>
          </div>
          <div class="subscription-billing-grid grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="subscription-billing-column space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Biaya Langganan *</label
              ><div class="subscription-cost-input relative">
                <span
                  class="subscription-currency-prefix pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#64748B]"
                  >{{ newSub.mataUang }}</span
                >
                <input
                  :key="newSub.mataUang"
                  id="sub-form-cost"
                  type="text"
                  inputmode="numeric"
                  required
                  :value="subscriptionCostInputValue"
                  placeholder="0"
                  class="subscription-cost-field w-full h-12 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl py-0 pl-20 pr-5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#0B1F4A] font-bold text-sm transition-all"
                  @input="handleSubscriptionCostInput"
                />
              </div>
              <div
                v-if="newSub.mataUang !== 'IDR'"
                class="subscription-rate-card rounded-2xl border border-[#D8E5F4] bg-white px-4 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                      Kurs ke IDR
                    </p>
                    <p class="mt-1 text-[11px] font-semibold text-[#64748B]">
                      Masukkan kurs hari ini setelah dicek dari Google.
                    </p>
                  </div>
                  <span
                    :class="[
                      'subscription-rate-status rounded-full px-3 py-1 text-[10px] font-extrabold',
                      subscriptionRateConfirmed
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700',
                    ]"
                  >
                    {{ subscriptionRateConfirmed ? "OK" : "Belum OK" }}
                  </span>
                </div>
                <div class="subscription-rate-controls mt-3 grid grid-cols-[minmax(0,1fr)_56px] gap-2">
                  <div class="relative">
                    <span
                      class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#64748B]"
                      >Rp</span
                    >
                    <input
                      id="sub-form-rate"
                      type="text"
                      inputmode="numeric"
                      :value="subscriptionRateInputValue"
                      placeholder="Contoh: 18.000"
                      class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#F8FAFC] py-0 pl-11 pr-3 text-sm font-extrabold text-[#102A56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]/20"
                      @input="handleSubscriptionRateInput"
                    />
                  </div>
                  <button
                    type="button"
                    class="subscription-rate-ok h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-extrabold text-white transition-colors hover:bg-[#071735]"
                    @click="confirmSubscriptionRate"
                  >
                    OK
                  </button>
                </div>
                <button
                  type="button"
                  class="subscription-exchange-link mt-2 inline-flex min-h-8 items-center rounded-xl border border-[#D8E5F4] bg-[#F8FBFE] px-3 text-[11px] font-extrabold text-[#1E5AA8] transition-colors hover:bg-[#EEF5FC]"
                  @click="openSubscriptionExchangeRate"
                >
                  Lihat kurs {{ newSub.mataUang }} ke IDR di Google
                </button>
              </div>
              <div
                class="subscription-estimate-card rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 py-3 text-xs font-semibold text-[#52647E]"
              >
                <p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Estimasi rupiah
                </p>
                <p class="mt-1 text-[13px] font-extrabold text-[#102A56]">
                  {{ subscriptionEstimateLabel }}
                </p>
              </div>
            </div>
            <div class="subscription-billing-column space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Tgl Tagihan Berikutnya *</label
              >
              <div class="relative">
                <input
                  id="sub-form-date"
                  type="date"
                  required
                  :value="newSub.tanggalTagihan"
                  class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm transition-all"
                  @input="updateNewSub({ ...newSub, tanggalTagihan: eventValue($event) })"
                />
              </div>
              <div
                class="subscription-summary-card rounded-2xl border border-[#D8E5F4] bg-white px-4 py-3"
              >
                <p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Ringkasan tagihan
                </p>
                <div class="subscription-summary-grid mt-2 grid grid-cols-2 gap-3 text-[11px] font-bold text-[#52647E]">
                  <div>
                    <span class="block text-[#94A3B8]">Biaya asal</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">{{ subscriptionOriginalCostSummary }}</strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Mata uang</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">{{ newSub.mataUang }}</strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Siklus</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">{{ newSub.siklus }}</strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Kurs</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">
                      {{ subscriptionRateSummary }}
                    </strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Status kurs</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">
                      {{ newSub.mataUang === "IDR" || subscriptionRateConfirmed ? "Siap dihitung" : "Perlu OK" }}
                    </strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Kategori</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">{{ newSub.kategori }}</strong>
                  </div>
                  <div>
                    <span class="block text-[#94A3B8]">Tagihan</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">{{ newSub.tanggalTagihan || "-" }}</strong>
                  </div>
                  <div class="col-span-2 rounded-xl bg-[#F8FBFE] px-3 py-2">
                    <span class="block text-[#94A3B8]">Estimasi IDR</span>
                    <strong class="mt-0.5 block text-[13px] text-[#102A56]">
                      {{ subscriptionIdrSummary }}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="subscription-modal-actions sticky bottom-0 z-10 grid grid-cols-1 gap-3 border-t border-[#E8EEF7] bg-white pt-4 md:grid-cols-[180px_1fr] md:gap-4">
            <button
              id="btn-sub-cancel"
              type="button"
              class="h-[52px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-2xl text-sm transition-all"
              @click="updateIsSubModalOpen(false)"
            >
              Batal</button
            ><button
              id="btn-sub-submit"
              type="submit"
              :disabled="isSubscriptionSaving"
              class="h-[52px] bg-[#0B1F4A] hover:bg-[#071735] disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-2xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" />
              {{ isSubscriptionSaving ? "Menyimpan..." : "Simpan Layanan" }}
            </button>
          </div>
        </form>
        </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
        v-if="subscriptionHistory"
        class="fixed inset-0 z-[120000] flex items-start justify-center overflow-y-auto bg-[#0B1220]/60 p-4 pt-[4vh] pb-[4vh] backdrop-blur-sm"
      >
      <div
        class="w-full max-w-[540px] overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <h3 class="text-lg font-extrabold tracking-tight text-[#111827]">
              Riwayat Transaksi Langganan
            </h3>
            <p class="mt-0.5 text-[11px] text-[#53658A]">
              {{ subscriptionHistory.nama }} ·
              {{ subscriptionHistory.provider || "-" }}
            </p>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"
            @click="subscriptionHistory = null"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="space-y-3 px-6 py-5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-2xl bg-[#F8FBFE] p-4">
              <p class="text-[10px] font-bold uppercase text-[#94A3B8]">
                Nominal
              </p>
              <p class="mt-1 font-mono text-sm font-black text-[#0B1F4A]">
                {{
                  formatRupiah(
                    subscriptionHistory.biayaIDR ||
                      subscriptionHistory.biaya ||
                      0,
                  )
                }}
              </p>
            </div>
            <div class="rounded-2xl bg-[#F8FBFE] p-4">
              <p class="text-[10px] font-bold uppercase text-[#94A3B8]">
                Siklus
              </p>
              <p class="mt-1 font-bold text-[#0B1F4A]">
                {{ subscriptionHistory.siklus || "-" }}
              </p>
            </div>
          </div>
          <div class="rounded-2xl border border-[#DCE7F4] p-4">
            <p
              class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]"
            >
              Catatan Tagihan Backend
            </p>
            <ul class="mt-3 space-y-2 text-[#53658A]">
              <li>
                • Tanggal tagihan berikutnya:
                <span class="font-bold text-[#0B1F4A]">{{
                  subscriptionHistory.tanggalTagihan || "-"
                }}</span>
              </li>
              <li>
                • Jumlah tagihan dibuat:
                <span class="font-bold text-[#0B1F4A]">{{
                  subscriptionHistory._raw?.generated_bill_count ?? "-"
                }}</span>
              </li>
              <li>
                • Tagihan terakhir:
                <span class="font-bold text-[#0B1F4A]">{{
                  subscriptionHistory._raw?.latest_bill_number || "-"
                }}</span>
              </li>
              <li>
                • Status tagihan terakhir:
                <span class="font-bold text-[#0B1F4A]">{{
                  subscriptionHistory._raw?.latest_bill_status || "-"
                }}</span>
              </li>
              <li>
                • Terakhir dibuat:
                <span class="font-bold text-[#0B1F4A]">{{
                  subscriptionHistory._raw?.last_billed_date || "-"
                }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>
    </Teleport>
    <!-- 4. ADD HARDWARE ASSET MODAL -->
    <Teleport to="body">
      <div
        v-if="isAssetModalOpen"
        class="asset-modal-layer fixed inset-0 z-[10080] flex items-start md:items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
      <div
        class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="px-6 py-5 border-b border-slate-100 flex justify-between items-start"
        >
          <div>
            <h3 class="font-extrabold text-lg text-[#111827] tracking-tight">
              <template v-if="editingAsset">Ubah Data Aset</template
              ><template v-else>Registrasi Aset Baru</template>
            </h3>
            <span class="text-[11px] text-[#53658A] block mt-0.5"
              ><template v-if="editingAsset"
                >Data perolehan dan jurnal historis tetap
                dipertahankan.</template
              ><template v-else
                >Inventarisasi &amp; Kalkulasi Penyusutan.</template
              ></span
            >
          </div>
          <button
            id="btn-close-asset-modal"
            type="button"
            class="w-10 h-10 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="closeAssetModal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          novalidate
          data-manual-validation="true"
          class="h-0 min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 text-xs"
          @submit="handleSaveAsset"
        >
          <div
            v-if="assetFormErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh data aset.</strong>
            <span>Semua kolom wajib diisi sebelum aset didaftarkan.</span>
          </div>
          <section class="space-y-3">
            <div class="flex items-center gap-2 text-[#0B1F4A]">
              <Info class="w-3.5 h-3.5" />
              <h4 class="text-[10px] font-extrabold uppercase tracking-widest">
                Informasi Aset
              </h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Nama Barang / Aset</label
                ><input
                  id="asset-form-name"
                  type="text"
                  required
                  :value="newAsset.nama"
                  :class="[
                    assetInputClass,
                    { 'form-control-invalid': assetFormErrors.nama },
                  ]"
                  @input="setAssetField('nama', eventValue($event))"
                />
                <p v-if="assetFormErrors.nama" class="form-field-warning">
                  {{ assetFormErrors.nama }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Kategori</label
                >
                <div class="relative">
                  <select
                    id="asset-form-category"
                    required
                    :value="newAsset.kategori"
                    :class="[
                      assetInputClass,
                      'pr-10 appearance-none font-semibold',
                      { 'form-control-invalid': assetFormErrors.kategori },
                    ]"
                    @change="setAssetField('kategori', eventValue($event))"
                  >
                    <option
                      v-if="
                        newAsset.kategori &&
                        !assetCategoryOptions.includes(newAsset.kategori)
                      "
                      :value="newAsset.kategori"
                    >
                      {{ newAsset.kategori }}
                    </option>
                    <option
                      v-for="category in assetCategoryOptions"
                      :key="category"
                      :value="category"
                    >
                      {{ category }}
                    </option></select
                  ><ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                  />
                </div>
                <p v-if="assetFormErrors.kategori" class="form-field-warning">
                  {{ assetFormErrors.kategori }}
                </p>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                >Penanggung Jawab / PIC Aset</label
              ><input
                id="asset-form-pic"
                type="text"
                required
                :value="newAsset.penanggungJawab"
                placeholder="Contoh: Tim IT / Nama pegawai"
                :class="[
                  assetInputClass,
                  { 'form-control-invalid': assetFormErrors.penanggungJawab },
                ]"
                @input="setAssetField('penanggungJawab', eventValue($event))"
              />
              <p
                v-if="assetFormErrors.penanggungJawab"
                class="form-field-warning"
              >
                {{ assetFormErrors.penanggungJawab }}
              </p>
            </div>
          </section>
          <section class="space-y-3">
            <div class="flex items-center gap-2 text-emerald-600">
              <span class="text-[12px] font-black leading-none">Rp</span>
              <h4 class="text-[10px] font-extrabold uppercase tracking-widest">
                Nilai &amp; Perolehan
              </h4>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Tanggal Pembelian</label
                >
                <div class="relative">
                  <input
                    id="asset-form-date"
                    type="date"
                    required
                    :disabled="!!editingAsset"
                    :value="newAsset.tanggalBeli"
                    :class="[
                      assetInputClass,
                      'pr-4',
                      {
                        'form-control-invalid':
                          assetFormErrors.tanggalBeli,
                      },
                    ]"
                    @input="setAssetField('tanggalBeli', eventValue($event))"
                  />
                </div>
                <p
                  v-if="assetFormErrors.tanggalBeli"
                  class="form-field-warning"
                >
                  {{ assetFormErrors.tanggalBeli }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Harga Perolehan (Rp)</label
                >
                <div class="currency-input relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs z-[1] pointer-events-none"
                    >Rp</span
                  ><input
                    id="asset-form-cost"
                    type="text"
                    required
                    data-rupiah="true"
                    data-rupiah-external-prefix="true"
                    inputmode="numeric"
                    :disabled="!!editingAsset"
                    :value="assetCostInputValue"
                    placeholder="0"
                    :class="[
                      assetInputClass,
                      { 'form-control-invalid': assetFormErrors.hargaBeli },
                    ]"
                    @input="
                      setAssetField('hargaBeli', parseRupiahInput(eventValue($event)))
                    "
                  />
                </div>
                <p
                  v-if="assetFormErrors.hargaBeli"
                  class="form-field-warning"
                >
                  {{ assetFormErrors.hargaBeli }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Masa Manfaat (Tahun)</label
                ><input
                  id="asset-form-life"
                  type="number"
                  required
                  :min="1"
                  :value="newAsset.masaManfaat"
                  :class="[
                    assetInputClass,
                    { 'form-control-invalid': assetFormErrors.masaManfaat },
                  ]"
                  @input="
                    setAssetField('masaManfaat', Number(eventValue($event)))
                  "
                />
                <p
                  v-if="assetFormErrors.masaManfaat"
                  class="form-field-warning"
                >
                  {{ assetFormErrors.masaManfaat }}
                </p>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Nilai Sisa / Salvage (Rp)</label
                >
                <div class="currency-input relative">
                  <span
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs z-[1] pointer-events-none"
                    >Rp</span
                  ><input
                    id="asset-form-salvage"
                    type="text"
                    required
                    data-rupiah="true"
                    data-rupiah-external-prefix="true"
                    inputmode="numeric"
                    :value="assetSalvageInputValue"
                    placeholder="0"
                    :class="[
                      assetInputClass,
                      { 'form-control-invalid': assetFormErrors.nilaiSisa },
                    ]"
                    @input="
                      setAssetField('nilaiSisa', parseRupiahInput(eventValue($event)))
                    "
                  />
                </div>
                <p
                  v-if="assetFormErrors.nilaiSisa"
                  class="form-field-warning"
                >
                  {{ assetFormErrors.nilaiSisa }}
                </p>
              </div>
            </div>
          </section>
          <div
            class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-4 flex items-start gap-3 text-[#0B1F4A]"
          >
            <Info class="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p class="text-[10px] leading-relaxed">
              Sistem menggunakan metode
              <span class="font-extrabold"
                >Penyusutan Garis Lurus (Straight Line)</span
              >. Beban penyusutan akan otomatis dialokasikan ke laporan laba
              rugi bulanan berdasarkan masa manfaat yang ditentukan.
            </p>
          </div>
          <div
            class="asset-form-actions grid grid-cols-1 items-center md:grid-cols-[175px_1fr] gap-3 pt-4 border-t border-slate-100"
          >
            <button
              id="btn-asset-cancel"
              type="button"
              class="border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-xl text-sm transition-all flex items-center justify-center"
              @click="closeAssetModal"
            >
              Batal</button
            ><button
              id="btn-asset-submit"
              type="submit"
              :disabled="isAssetSaving"
              class="bg-[#0B1F4A] hover:bg-[#071735] disabled:cursor-wait disabled:opacity-60 text-white font-extrabold rounded-xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Save class="w-4 h-4" /><template v-if="isAssetSaving"
                >Menyimpan...</template
              ><template v-else-if="editingAsset"
                >Simpan Perubahan</template
              ><template v-else>Daftarkan Aset</template>
            </button>
          </div>
        </form>
      </div>
    </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { formatRupiahInput, parseRupiahInput } from "../utils/rupiahInputs.js";
import { computed, onMounted, ref } from "vue";
import {
  Plus,
  Search,
  Trash2,
  Cpu,
  CreditCard,
  BarChart2,
  X,
  Save,
  ChevronDown,
  Info,
  Pencil,
  History,
  CheckCircle2,
  CircleAlert,
  Eye,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Langganan } from "../types.ts";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";
import ConfirmDialog from "./common/ConfirmDialog.vue";
import { addDaysIso, currentMonthIso, todayIso } from "../utils/localDate";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface AsetTeknologi {
  id: string;
  nama: string;
  kategori: string;
  tanggalBeli: string;
  hargaBeli: number;
  penyusutanTahunan: number;
  nilaiBuku: number;
  penanggungJawab: string;
}
interface LanggananDanAsetProps {
  activeSection:
    | "langganan"
    | "aset"
    | "aset-kategori"
    | "aset-riwayat"
    | "langganan-riwayat-transaksi"
    | "langganan-tagihan"
    | "langganan-riwayat-kadaluarsa";
  langganan: Langganan[];
  assets: AsetTeknologi[];
}

const props = defineProps<LanggananDanAsetProps>();
const { langganan }: LanggananDanAsetProps = props;

const {
  notify,
  refreshData,
  assets: {
    addSubscription,
    paySubscriptionBill,
    deleteSubscription,
    addAsset,
    updateAsset,
    disposeAsset,
  },
} = useFinStartContext();
const activeTab = computed(() =>
  props.activeSection === "aset" ||
  props.activeSection === "aset-kategori" ||
  props.activeSection === "aset-riwayat"
    ? "assets"
    : "subs",
);
const isRiwayatTransaksiView = computed(
  () => props.activeSection === "langganan-riwayat-transaksi",
);
const isTagihanView = computed(
  () => props.activeSection === "langganan-tagihan",
);
const isRiwayatKadaluarsaView = computed(
  () => props.activeSection === "langganan-riwayat-kadaluarsa",
);
const isAsetKategoriView = computed(
  () => props.activeSection === "aset-kategori",
);
const isRiwayatAsetView = computed(
  () => props.activeSection === "aset-riwayat",
);
const isLanggananFullPageView = computed(
  () =>
    isRiwayatTransaksiView.value ||
    isTagihanView.value ||
    isRiwayatKadaluarsaView.value,
);
// Filter category state (Aligned with 'Infrastruktur' | 'Software' | 'Marketing')
const subCategoryFilter = ref("All"),
  updateSubCategoryFilter = (next) => (subCategoryFilter.value = next);
const searchQuery = ref(""),
  updateSearchQuery = (next) => (searchQuery.value = next); // Modals toggle
const subsPage = ref(1);
const assetsPage = ref(1);
const expiredPage = ref(1);
const subHistoryPage = ref(1);
const assetHistoryPage = ref(1);
const isSubModalOpen = ref(false),
  updateIsSubModalOpen = (next) => (isSubModalOpen.value = next);
const isAssetModalOpen = ref(false),
  updateIsAssetModalOpen = (next) => (isAssetModalOpen.value = next);
const depreciationPeriod = ref(currentMonthIso());
const isDepreciationModalOpen = ref(false);
const isSubscriptionSaving = ref(false);
const isAssetSaving = ref(false);
const isDepreciationProcessing = ref(false);
const depreciationResult = ref<any>(null);
type CurrencyCode = "IDR" | "USD" | "EUR" | "SGD" | "JPY" | "AUD" | "GBP";
const currencyOptions: { value: CurrencyCode; label: string }[] = [
  { value: "IDR", label: "IDR - Rupiah" },
  { value: "USD", label: "USD - Dolar AS" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "SGD", label: "SGD - Dolar Singapura" },
  { value: "JPY", label: "JPY - Yen Jepang" },
  { value: "AUD", label: "AUD - Dolar Australia" },
  { value: "GBP", label: "GBP - Pound Inggris" },
];
const subscriptionHistory = ref<any>(null);
const dueSubsPage = ref(1);
const payingSubId = ref<string | null>(null);
const assetHistory = ref<any>(null);
const assetHistoryViewMode = ref<"monthly" | "yearly">("monthly");
const subscriptionRateConfirmed = ref(true);
const viewingSub = ref<any>(null);
const showSubDetail = (item: any) => { viewingSub.value = item; };
const closeSubDetail = () => { viewingSub.value = null; };
const isCurrencyCode = (value: string): value is CurrencyCode =>
  currencyOptions.some((option) => option.value === value);

const convertToIdr = (amount: number, currency: string, rate = 1) => {
  if (currency === "IDR") return amount;
  return amount * Number(rate || 0);
};
const formatCurrency = (amount: number, currency: CurrencyCode) => {
  if (currency === "IDR") return formatRupiah(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};
const formatSubscriptionCostInput = (amount: number) => {
  const numericAmount = Number(amount || 0);
  if (!numericAmount) return "";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(numericAmount);
};
const openSubscriptionExchangeRate = () =>
  window.open(
    `https://www.google.com/search?q=kurs+${newSub.value.mataUang}+ke+IDR+hari+ini`,
    "_blank",
    "noopener,noreferrer",
  );
const todayDate = () => todayIso();
const subscriptionNoticeDate = () => addDaysIso(todayDate(), 3);
const isExpiredSubscription = (item: any) => {
  const status = String(
    item?.status || item?._raw?.status || "active",
  ).toLowerCase();
  return ["cancelled", "inactive", "expired", "stopped"].includes(status);
};
const subscriptionStatusLabel = (item: any) => {
  const status = String(
    item?.status || item?._raw?.status || "active",
  ).toLowerCase();
  if (status === "cancelled") return "Dihentikan";
  if (status === "inactive") return "Nonaktif";
  if (status === "expired") return "Kedaluwarsa";
  return isExpiredSubscription(item) ? "Kedaluwarsa" : "Aktif";
};
const subscriptionBillStatus = (item: any) =>
  String(
    item?.latestBillStatus ||
      item?._raw?.latest_bill_display_status ||
      item?._raw?.latest_bill_status ||
      "",
  ).toLowerCase();
const openSubscriptionBillStatuses = new Set([
  "draft",
  "unpaid",
  "partial",
  "overdue",
]);
const normalizeSubscriptionDate = (value: any) =>
  String(value || "").slice(0, 10);
const subscriptionRenewalDate = (item: any) =>
  normalizeSubscriptionDate(item?.tanggalTagihan || item?._raw?.renewal_date);
const subscriptionOpenBillDate = (item: any) =>
  normalizeSubscriptionDate(
    item?.latestBillDate ||
      item?._raw?.latest_bill_date ||
      item?.latestBillDueDate ||
      item?._raw?.latest_bill_due_date,
  );
const subscriptionDueDisplayDate = (item: any) => {
  const billStatus = subscriptionBillStatus(item);
  if (openSubscriptionBillStatuses.has(billStatus)) {
    return subscriptionOpenBillDate(item) || subscriptionRenewalDate(item);
  }
  return subscriptionRenewalDate(item);
};
const isSubscriptionInNoticeWindow = (item: any) => {
  const dueDate = subscriptionDueDisplayDate(item);
  return Boolean(dueDate && dueDate <= subscriptionNoticeDate());
};
const subscriptionBillingStatusLabel = (item: any) => {
  if (isExpiredSubscription(item)) return subscriptionStatusLabel(item);
  const billStatus = subscriptionBillStatus(item);
  if (billStatus === "draft") return "Draft Tagihan";
  if (billStatus === "unpaid") return "Unpaid";
  if (billStatus === "partial") return "Partial";
  if (billStatus === "overdue") return "Overdue";
  if (billStatus === "paid") return "Paid";
  if (billStatus === "cancelled") return "Cancelled";
  const renewalDate = subscriptionDueDisplayDate(item);
  if (renewalDate && renewalDate < todayDate()) return "Belum Dibuat";
  if (renewalDate === todayDate()) return "Jatuh Tempo";
  if (renewalDate && renewalDate <= subscriptionNoticeDate()) return "Akan Jatuh Tempo";
  return "Terjadwal";
};
const subscriptionBillingStatusClass = (item: any) => {
  const label = subscriptionBillingStatusLabel(item).toLowerCase();
  if (label.includes("paid")) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (label.includes("overdue")) return "border-rose-200 bg-rose-50 text-rose-700";
  if (label.includes("unpaid") || label.includes("partial")) return "border-amber-200 bg-amber-50 text-amber-700";
  if (label.includes("draft") || label.includes("jatuh tempo") || label.includes("belum")) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  if (label.includes("cancel") || label.includes("henti") || label.includes("nonaktif")) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }
  return "border-[#DCE7F4] bg-[#EEF5FC] text-[#1E5AA8]";
};
const subscriptionCountValue = (item: any, key: string, rawKey: string) =>
  Number(item?.[key] ?? item?._raw?.[rawKey] ?? 0);
const subscriptionBillingSummary = (item: any) => {
  const open = subscriptionCountValue(item, "openBillCount", "open_bill_count");
  const draft = subscriptionCountValue(item, "draftBillCount", "draft_bill_count");
  const parts = [];
  if (open > 0) parts.push(`Open: ${open}`);
  if (draft > 0) parts.push(`Draft: ${draft}`);
  return parts.join(" | ");
};
const editingAsset = ref<any>(null);
const confirmDialog = ref<any>(null);
// Daftar aset berasal langsung dari props API backend.
const newSub = ref({
    nama: "",
    provider: "",
    mataUang: "IDR" as CurrencyCode,
    siklus: "Bulanan" as "Bulanan" | "Tahunan",
    kategori: "Software" as "Infrastruktur" | "Software" | "Marketing",
    biaya: 0,
    biayaIDR: 0,
    kurs: 1,
    tanggalTagihan: todayIso(),
  }),
  updateNewSub = (next) => (newSub.value = next);
const subscriptionEstimateLabel = computed(() => {
  const amount = Number(newSub.value.biaya || 0);
  const currency = newSub.value.mataUang;
  if (!amount) return "Masukkan nominal biaya terlebih dahulu.";
  if (currency === "IDR") return formatRupiah(amount);
  const rate = Number(newSub.value.kurs || 0);
  if (!rate) return "Masukkan kurs hari ini terlebih dahulu.";
  if (!subscriptionRateConfirmed.value)
    return "Tekan OK setelah kurs dicek di Google.";
  return `1 ${currency} = ${formatRupiah(rate)}; ${formatCurrency(amount, currency)} x ${formatRupiah(rate)} = ${formatRupiah(convertToIdr(amount, currency, rate))}`;
});
const subscriptionCostInputValue = computed(() =>
  formatSubscriptionCostInput(newSub.value.biaya),
);
const subscriptionRateInputValue = computed(() =>
  newSub.value.mataUang === "IDR"
    ? ""
    : formatSubscriptionCostInput(newSub.value.kurs),
);
const subscriptionRateSummary = computed(() => {
  if (newSub.value.mataUang === "IDR") return "1:1";
  if (!newSub.value.kurs) return "Belum diisi";
  if (!subscriptionRateConfirmed.value) return "Belum OK";
  return formatRupiah(newSub.value.kurs);
});
const subscriptionOriginalCostSummary = computed(() => {
  const amount = Number(newSub.value.biaya || 0);
  if (!amount) return "-";
  return `${newSub.value.mataUang} ${formatSubscriptionCostInput(amount)}`;
});
const subscriptionIdrSummary = computed(() => {
  const amount = Number(newSub.value.biaya || 0);
  if (!amount) return "-";
  if (newSub.value.mataUang === "IDR") return formatRupiah(amount);
  const rate = Number(newSub.value.kurs || 0);
  if (!rate) return "Masukkan kurs";
  if (!subscriptionRateConfirmed.value) return "Tekan OK untuk akumulasi";
  return formatRupiah(convertToIdr(amount, newSub.value.mataUang, rate));
});
const assetCategories = ref<any[]>([]);
const assetCategorySearch = ref("");
const assetCategoriesPage = ref(1);
const isAssetCategoryEditorOpen = ref(false);
const assetCategoryBusy = ref(false);
const assetCategorySaveWarning = ref("");
const assetCategoryForm = ref({
  id: "",
  code: "",
  name: "",
  description: "",
});
const assetCategoryFormErrors = ref({ name: "" });

// Kode tidak diketik manual (dan tidak lagi diturunkan dari nama - lihat
// asset-categories.js) - untuk kategori baru, kode sebenarnya diambil dari
// backend (endpoint /next-code) supaya yang ditampilkan bukan placeholder,
// tapi kode yang benar-benar akan tersimpan; untuk data yang sudah ada,
// tampilkan kode aslinya (read-only).
const assetCategoryNextCodePreview = ref("");
const assetCategoryCodePreview = computed(() => {
  if (assetCategoryForm.value.id) {
    return assetCategoryForm.value.code || "-";
  }
  return assetCategoryNextCodePreview.value || "...";
});
async function loadAssetCategoryNextCode() {
  try {
    const response = await financeApi.get("/asset-categories/next-code");
    assetCategoryNextCodePreview.value = response?.code || "";
  } catch {
    assetCategoryNextCodePreview.value = "";
  }
}

const assetCategoryOptions = computed(() =>
  assetCategories.value.map((item: any) => item.name).filter(Boolean),
);

const filteredAssetCategories = computed(() => {
  const keyword = String(assetCategorySearch.value || "")
    .trim()
    .toLowerCase();
  const source = latestFirst(assetCategories.value);
  if (!keyword) return source;
  return source.filter((item: any) =>
    [item.code, item.name, item.description].some((value: any) =>
      String(value || "")
        .toLowerCase()
        .includes(keyword),
    ),
  );
});

const pagedAssetCategories = computed(() =>
  pageRows(filteredAssetCategories.value, assetCategoriesPage.value),
);

async function fetchAssetCategories() {
  try {
    const response = await financeApi.get("/asset-categories");
    assetCategories.value = Array.isArray(response) ? response : [];
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memuat kategori aset."));
  }
}

onMounted(() => {
  fetchAssetCategories();
});

function openAssetCategoryForm(item: any = null) {
  assetCategorySaveWarning.value = "";
  assetCategoryFormErrors.value = { name: "" };
  assetCategoryForm.value = {
    id: item ? String(item.id) : "",
    code: item ? String(item.code || "") : "",
    name: item ? String(item.name || "") : "",
    description: item ? String(item.description || "") : "",
  };
  if (!item) {
    assetCategoryNextCodePreview.value = "";
    loadAssetCategoryNextCode();
  }
  isAssetCategoryEditorOpen.value = true;
}

function closeAssetCategoryEditor() {
  if (assetCategoryBusy.value) return;
  isAssetCategoryEditorOpen.value = false;
}

async function saveAssetCategory(event?: Event) {
  event?.preventDefault();
  if (assetCategoryBusy.value) return;
  const name = assetCategoryForm.value.name.trim();
  if (!name) {
    assetCategoryFormErrors.value = { name: "Nama kategori wajib diisi." };
    return;
  }
  assetCategoryBusy.value = true;
  try {
    const payload = {
      name,
      description: assetCategoryForm.value.description,
    };
    if (assetCategoryForm.value.id) {
      await financeApi.put(
        `/asset-categories/${assetCategoryForm.value.id}`,
        payload,
      );
      notify("Kategori aset berhasil diperbarui.");
    } else {
      await financeApi.post("/asset-categories", payload);
      notify("Kategori aset berhasil ditambahkan.");
    }
    isAssetCategoryEditorOpen.value = false;
    await fetchAssetCategories();
  } catch (error) {
    assetCategorySaveWarning.value = getApiErrorMessage(
      error,
      "Gagal menyimpan kategori aset.",
    );
  } finally {
    assetCategoryBusy.value = false;
  }
}

function requestDeleteAssetCategory(item: any) {
  confirmDialog.value = {
    type: "delete-asset-category",
    item,
    eyebrow: "Konfirmasi Penghapusan",
    title: "Hapus kategori ini?",
    message: `Kategori ${item.name} akan dihapus dari master data aset.`,
    details: [
      { label: "Kategori", value: item.name },
      { label: "Kode", value: item.code || "-" },
      { label: "Dipakai", value: `${item.usage_count || 0} aset` },
    ],
    impactItems: [
      "Kategori tidak bisa dihapus jika masih dipakai aset.",
      "Pindahkan kategori aset terkait terlebih dahulu sebelum menghapus.",
    ],
    confirmLabel: "Hapus Kategori",
  };
}

async function deleteAssetCategory(item: any) {
  try {
    await financeApi.delete(`/asset-categories/${item.id}`);
    notify("Kategori aset berhasil dihapus.");
    await fetchAssetCategories();
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menghapus kategori aset."));
  }
}
const formatAssetCurrencyInput = (amount: number) =>
  formatRupiahInput(amount, false, false);

const newAsset = ref({
    nama: "",
    kategori: "Elektronik / IT",
    tanggalBeli: todayIso(),
    hargaBeli: 0,
    masaManfaat: 4,
    nilaiSisa: 0,
    penanggungJawab: "",
  }),
  updateNewAsset = (next) => (newAsset.value = next); // Submit new subscription
const assetCostInputValue = computed(() =>
  formatAssetCurrencyInput(newAsset.value.hargaBeli),
);
const assetSalvageInputValue = computed(() =>
  formatAssetCurrencyInput(newAsset.value.nilaiSisa),
);

const assetInputClass =
  "w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all";

type AssetFormFieldKey =
  | "nama"
  | "kategori"
  | "penanggungJawab"
  | "tanggalBeli"
  | "hargaBeli"
  | "masaManfaat"
  | "nilaiSisa";

const emptyAssetFormErrors = (): Record<AssetFormFieldKey, string> => ({
  nama: "",
  kategori: "",
  penanggungJawab: "",
  tanggalBeli: "",
  hargaBeli: "",
  masaManfaat: "",
  nilaiSisa: "",
});

const assetFormErrors = ref<Record<AssetFormFieldKey, string>>(
  emptyAssetFormErrors(),
);

const assetRequiredFields: Array<{
  key: AssetFormFieldKey;
  id: string;
  label: string;
  type?: "number";
  allowZero?: boolean;
}> = [
  { key: "nama", id: "asset-form-name", label: "Nama barang / aset" },
  { key: "kategori", id: "asset-form-category", label: "Kategori" },
  {
    key: "penanggungJawab",
    id: "asset-form-pic",
    label: "Penanggung jawab / PIC aset",
  },
  {
    key: "tanggalBeli",
    id: "asset-form-date",
    label: "Tanggal pembelian",
  },
  {
    key: "hargaBeli",
    id: "asset-form-cost",
    label: "Harga perolehan",
    type: "number",
  },
  {
    key: "masaManfaat",
    id: "asset-form-life",
    label: "Masa manfaat",
    type: "number",
  },
  {
    key: "nilaiSisa",
    id: "asset-form-salvage",
    label: "Nilai sisa / salvage",
    type: "number",
    allowZero: true,
  },
];

const assetFormErrorMessages = computed(() =>
  Object.values(assetFormErrors.value).filter(Boolean),
);

function resetAssetFormErrors() {
  assetFormErrors.value = emptyAssetFormErrors();
}

function clearAssetFormError(key: AssetFormFieldKey) {
  if (!assetFormErrors.value[key]) return;
  assetFormErrors.value = {
    ...assetFormErrors.value,
    [key]: "",
  };
}

function setAssetField(key: keyof typeof newAsset.value, value: any) {
  updateNewAsset({
    ...newAsset.value,
    [key]: value,
  });
  if (key in assetFormErrors.value)
    clearAssetFormError(key as AssetFormFieldKey);
}

function assetRawInputValue(id: string) {
  return (
    (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)
      ?.value ?? ""
  )
    .toString()
    .trim();
}

function validateAssetForm() {
  const nextErrors = emptyAssetFormErrors();

  for (const field of assetRequiredFields) {
    const rawValue = assetRawInputValue(field.id);
    const value = newAsset.value[field.key];

    if (!rawValue) {
      nextErrors[field.key] = `${field.label} wajib diisi.`;
      continue;
    }

    if (field.type === "number") {
      const numericValue = Number(value);
      const minimum = field.allowZero ? 0 : 1;
      if (!Number.isFinite(numericValue) || numericValue < minimum) {
        nextErrors[field.key] = field.allowZero
          ? `${field.label} harus berupa angka 0 atau lebih.`
          : `${field.label} harus lebih dari 0.`;
      }
    }
  }

  const acquisitionCost = Number(newAsset.value.hargaBeli || 0);
  const residualValue = Number(newAsset.value.nilaiSisa || 0);
  if (
    !nextErrors.hargaBeli &&
    !nextErrors.nilaiSisa &&
    acquisitionCost > 0 &&
    residualValue >= acquisitionCost
  ) {
    nextErrors.nilaiSisa =
      "Nilai sisa harus lebih kecil dari harga perolehan.";
  }

  assetFormErrors.value = nextErrors;
  const firstInvalidField = assetRequiredFields.find(
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

const handleSaveSub = async (e: Event) => {
  e.preventDefault();
  if (isSubscriptionSaving.value) return;
  if (
    !newSub.value.nama ||
    !newSub.value.tanggalTagihan ||
    !newSub.value.provider ||
    !newSub.value.mataUang ||
    !newSub.value.siklus ||
    !newSub.value.kategori ||
    Number(newSub.value.biaya) <= 0
  ) {
    notify("Seluruh data layanan wajib diisi dan biaya harus lebih dari nol.");
    return;
  }
  if (
    newSub.value.mataUang !== "IDR" &&
    (!Number(newSub.value.kurs || 0) || !subscriptionRateConfirmed.value)
  ) {
    notify("Isi kurs hari ini dan tekan OK sebelum menyimpan layanan.");
    return;
  }
  const item: Langganan = {
    id: `SUB-${Date.now()}`,
    ...newSub.value,
    biayaIDR: convertToIdr(
      newSub.value.biaya,
      newSub.value.mataUang,
      newSub.value.kurs,
    ),
  };
  isSubscriptionSaving.value = true;
  try {
    const result = await addSubscription(item);
    if (!result) return;
    updateIsSubModalOpen(false);
    updateNewSub({
      nama: "",
      provider: "",
      mataUang: "IDR",
      siklus: "Bulanan",
      kategori: "Software",
      biaya: 0,
      biayaIDR: 0,
      kurs: 1,
      tanggalTagihan: todayIso(),
    });
    subscriptionRateConfirmed.value = true;
  } finally {
    isSubscriptionSaving.value = false;
  }
};

const resetAssetForm = () => {
  editingAsset.value = null;
  resetAssetFormErrors();
  updateNewAsset({
    nama: "",
    kategori: "Elektronik / IT",
    tanggalBeli: todayIso(),
    hargaBeli: 0,
    masaManfaat: 4,
    nilaiSisa: 0,
    penanggungJawab: "",
  });
};

const openAssetForm = (asset: any = null) => {
  resetAssetFormErrors();
  if (asset) {
    editingAsset.value = asset;
    const raw = asset._raw || asset;
    updateNewAsset({
      nama: asset.nama || raw.asset_name || "",
      kategori: asset.kategori || raw.category || "Elektronik / IT",
      tanggalBeli:
        asset.tanggalBeli ||
        raw.acquisition_date ||
        todayIso(),
      hargaBeli: Number(asset.hargaBeli ?? raw.acquisition_cost ?? 0),
      masaManfaat: raw.useful_life_months
        ? Math.max(1, Math.round(Number(raw.useful_life_months) / 12))
        : Math.max(1, Number(asset.masaManfaat || 4)),
      nilaiSisa: Number(asset.nilaiSisa ?? raw.residual_value ?? 0),
      penanggungJawab: asset.penanggungJawab || raw.responsible_person || "",
    });
  } else {
    resetAssetForm();
  }
  updateIsAssetModalOpen(true);
};

const closeAssetModal = () => {
  resetAssetFormErrors();
  updateIsAssetModalOpen(false);
};

const handleSaveAsset = async (e: Event) => {
  e.preventDefault();
  if (isAssetSaving.value) return;
  if (!validateAssetForm()) {
    notify("Lengkapi seluruh data aset sebelum menyimpan.");
    return;
  }
  isAssetSaving.value = true;
  try {
    if (editingAsset.value) {
      const result = await updateAsset(editingAsset.value, { ...newAsset.value });
      if (!result) return;
    } else {
      const result = await addAsset({ ...newAsset.value });
      if (!result) return;
    }
    closeAssetModal();
    resetAssetForm();
  } finally {
    isAssetSaving.value = false;
  }
};

const requestStopSubscription = (item: any) => {
  confirmDialog.value = {
    type: "subscription",
    item,
    eyebrow: "Konfirmasi Auto-Renew",
    title: "Hentikan auto-renew?",
    message: `Layanan ${item.nama} akan dinonaktifkan dari daftar langganan aktif.`,
    details: [
      { label: "Layanan", value: item.nama },
      { label: "Provider", value: item.provider || "-" },
      {
        label: "Nominal",
        value: formatRupiah(item.biayaIDR || item.biaya || 0),
      },
    ],
    impactItems: [
      "Status layanan akan berubah menjadi cancelled di database.",
      "Layanan tidak lagi dihitung dalam burn rate langganan aktif.",
    ],
    confirmLabel: "Hentikan Layanan",
  };
};

const requestDisposeAsset = (asset: any) => {
  confirmDialog.value = {
    type: "dispose-asset",
    item: asset,
    eyebrow: "Konfirmasi Pelepasan Aset",
    title: "Lepaskan aset ini?",
    message:
      "Sistem akan membuat jurnal penghapusan berdasarkan nilai buku aset saat ini.",
    details: [
      { label: "Aset", value: asset.nama },
      { label: "Kategori", value: asset.kategori || "-" },
      { label: "Nilai Buku", value: formatRupiah(asset.nilaiBuku || 0) },
    ],
    impactItems: [
      "Status aset akan berubah menjadi dilepas.",
      "Jurnal pelepasan aset akan dibuat otomatis.",
    ],
    confirmLabel: "Lepaskan Aset",
    requireReason: true,
    reasonLabel: "Alasan Pelepasan",
    reasonPlaceholder: "Contoh: Aset tidak lagi digunakan",
    defaultReason: "Aset tidak lagi digunakan",
  };
};

const handleConfirmDialog = async (reason = "") => {
  const action = confirmDialog.value;
  if (!action) return;
  confirmDialog.value = null;
  if (action.type === "subscription-rate") {
    applyConfirmedSubscriptionRate();
    return;
  }
  if (action.type === "subscription") {
    await deleteSubscription(action.item.id);
    notify(`Auto-renewal ${action.item.nama} dihentikan.`);
    return;
  }
  if (action.type === "dispose-asset") {
    await disposeAsset(action.item, reason || "Aset tidak lagi digunakan");
    return;
  }
  if (action.type === "delete-asset-category") {
    await deleteAssetCategory(action.item);
  }
};

function openDepreciationModal() {
  if (!depreciationPeriod.value) {
    notify("Pilih periode penyusutan terlebih dahulu.");
    return;
  }
  depreciationResult.value = null;
  isDepreciationModalOpen.value = true;
}

function closeDepreciationModal() {
  if (isDepreciationProcessing.value) return;
  isDepreciationModalOpen.value = false;
  depreciationResult.value = null;
}

async function processMonthlyDepreciation() {
  if (isDepreciationProcessing.value) return;
  if (!depreciationPeriod.value) {
    notify("Pilih periode penyusutan terlebih dahulu.");
    return;
  }

  isDepreciationProcessing.value = true;
  try {
    const result = await financeApi.post("/assets/depreciate-batch", {
      depreciation_period: depreciationPeriod.value,
      asset_ids: depreciationPreviewRows.value
        .map((row: any) => Number(row.id))
        .filter((id: number) => Number.isInteger(id) && id > 0),
      notes: "Penyusutan bulanan diproses dari workspace FinStart.",
    });
    await refreshData();
    const processed = Array.isArray(result?.processed)
      ? result.processed
      : [];
    const skipped = Array.isArray(result?.skipped) ? result.skipped : [];
    const processedCount = processed.length;
    const skippedCount = skipped.length;
    depreciationResult.value = {
      depreciation_period: result?.depreciation_period || depreciationPeriod.value,
      processedCount,
      skippedCount,
      skippedReasons: skipped,
    };
    notify(
      processedCount > 0
        ? `Penyusutan ${processedCount} aset berhasil diposting.`
        : `Tidak ada aset yang diposting untuk periode ${depreciationPeriod.value}.`,
    );
  } catch (error) {
    const message = getApiErrorMessage(
      error,
      "Gagal memproses penyusutan bulanan.",
    );
    depreciationResult.value = {
      depreciation_period: depreciationPeriod.value,
      processedCount: 0,
      skippedCount: 0,
      skippedReasons: [{ asset_id: "error", asset_name: "Proses gagal", reason: message }],
    };
    notify(message);
  } finally {
    isDepreciationProcessing.value = false;
  }
}

async function showDepreciationHistory(asset: any) {
  try {
    const assetId = Number(asset?._raw?.id || asset?.id);
    if (!assetId) return notify("ID aset tidak valid.");
    const history = await financeApi.get(
      `/assets/${assetId}/depreciations`,
    );
    const raw = asset?._raw || {};
    assetHistory.value = {
      ...history,
      asset: {
        ...(history?.asset || {}),
        id: assetId,
        asset_name: history?.asset?.asset_name || asset?.nama || raw.asset_name,
        acquisition_date: raw.acquisition_date || asset?.tanggalBeli,
        acquisition_cost: raw.acquisition_cost ?? asset?.hargaBeli,
        useful_life_months: raw.useful_life_months ?? asset?.usefulLifeMonths,
        residual_value:
          raw.residual_value ?? asset?.residualValue ?? asset?.nilaiSisa,
        accumulated_depreciation:
          raw.accumulated_depreciation ??
          history?.asset?.accumulated_depreciation ??
          0,
        book_value: raw.book_value ?? asset?.nilaiBuku,
      },
    };
    assetHistoryPage.value = 1;
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memuat riwayat penyusutan aset."));
  }
}

function nextPeriodFromDate(value: string) {
  const period = String(value || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(period)) return "";
  return period;
}

function addMonthsToPeriod(period: string, offset: number) {
  if (!/^\d{4}-\d{2}$/.test(String(period || ""))) return "";
  const [year, month] = period.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + offset, 1))
    .toISOString()
    .slice(0, 7);
}

function isPeriodInAssetSchedule(asset: any, period: string) {
  const firstPeriod = nextPeriodFromDate(asset?.acquisition_date);
  const usefulLife = Math.max(1, Number(asset?.useful_life_months || 0));
  if (!firstPeriod || !/^\d{4}-\d{2}$/.test(String(period || ""))) return false;
  return period >= firstPeriod && period <= addMonthsToPeriod(firstPeriod, usefulLife - 1);
}

function monthlyProjectionAmount(asset: any, period: string) {
  if (!isPeriodInAssetSchedule(asset, period)) return 0;
  const cost = Number(asset?.acquisition_cost || 0);
  const residual = Number(asset?.residual_value || 0);
  const usefulLife = Math.max(1, Number(asset?.useful_life_months || 0));
  const depreciableAmount = Math.max(cost - residual, 0);
  if (!cost || !usefulLife || depreciableAmount <= 0) return 0;

  const firstPeriod = nextPeriodFromDate(asset?.acquisition_date);
  const [firstYear, firstMonth] = firstPeriod.split("-").map(Number);
  const [periodYear, periodMonth] = period.split("-").map(Number);
  const monthIndex = (periodYear - firstYear) * 12 + (periodMonth - firstMonth);
  const monthlyAmount = depreciableAmount / usefulLife;
  return monthIndex === usefulLife - 1
    ? Math.max(depreciableAmount - monthlyAmount * monthIndex, 0)
    : monthlyAmount;
}

function setAssetHistoryViewMode(mode: "monthly" | "yearly") {
  assetHistoryViewMode.value = mode;
  assetHistoryPage.value = 1;
}

async function processAssetHistoryDepreciation() {
  if (isDepreciationProcessing.value) return;
  const assetId = Number(assetHistory.value?.asset?.id);
  if (!assetId) return notify("ID aset tidak valid.");
  if (!depreciationPeriod.value) {
    notify("Pilih periode penyusutan terlebih dahulu.");
    return;
  }

  isDepreciationProcessing.value = true;
  try {
    await financeApi.post(`/assets/${assetId}/depreciate`, {
      depreciation_period: depreciationPeriod.value,
      notes: "Penyusutan aset diposting dari modal riwayat FinStart.",
    });
    await refreshData();
    const history = await financeApi.get(`/assets/${assetId}/depreciations`);
    assetHistory.value = {
      ...history,
      asset: {
        ...(assetHistory.value?.asset || {}),
        ...(history?.asset || {}),
        id: assetId,
      },
    };
    assetHistoryPage.value = 1;
    notify(`Penyusutan aset periode ${depreciationPeriod.value} berhasil diposting.`);
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memposting penyusutan aset."));
  } finally {
    isDepreciationProcessing.value = false;
  }
}

// Filter Subscriptions & Assets dibuat reactive agar pencarian/kategori langsung berjalan.
const expiredSubs = computed(() =>
  latestFirst(
    (props.langganan || []).filter((item: any) => isExpiredSubscription(item)),
  ),
);
const activeSubs = computed(() =>
  latestFirst(
    (props.langganan || []).filter((item: any) => !isExpiredSubscription(item)),
  ),
);
const dueSubs = computed(() =>
  latestFirst(
    (props.langganan || []).filter((item: any) => {
      if (isExpiredSubscription(item)) return false;
      const billStatus = subscriptionBillStatus(item);
      const hasBill = !!item.latestBillId || !!item._raw?.latest_bill_id;
      const isInNoticeWindow = isSubscriptionInNoticeWindow(item);
      const isUpcomingWithoutBill = !hasBill && isInNoticeWindow;
      return (
        (hasBill && openSubscriptionBillStatuses.has(billStatus) && isInNoticeWindow) ||
        isUpcomingWithoutBill
      );
    }),
  ),
);
const filteredSubs = computed(() =>
  latestFirst(
    activeSubs.value.filter((l: any) => {
      const query = searchQuery.value.toLowerCase();
      const matchesSearch =
        String(l.nama || "")
          .toLowerCase()
          .includes(query) ||
        String(l.provider || "")
          .toLowerCase()
          .includes(query);
      const matchesCategory =
        subCategoryFilter.value === "All" ||
        l.kategori === subCategoryFilter.value;
      return matchesSearch && matchesCategory;
    }),
  ),
);
const archivedAssets = computed(() =>
  latestFirst(
    (props.assets || []).filter(
      (a: any) =>
        String(a?._raw?.status || a?.status || "").toLowerCase() === "disposed",
    ),
  ),
);
const activeAssets = computed(() =>
  latestFirst(
    (props.assets || []).filter(
      (a: any) =>
        String(a?._raw?.status || a?.status || "").toLowerCase() !== "disposed",
    ),
  ),
);
const assetArchiveSearch = ref("");
const assetArchivePage = ref(1);
const filteredArchivedAssets = computed(() => {
  const query = assetArchiveSearch.value.toLowerCase();
  if (!query) return archivedAssets.value;
  return archivedAssets.value.filter(
    (a: any) =>
      String(a.nama || "")
        .toLowerCase()
        .includes(query) ||
      String(a.penanggungJawab || "")
        .toLowerCase()
        .includes(query) ||
      String(a.kategori || "")
        .toLowerCase()
        .includes(query),
  );
});
const pagedArchivedAssets = computed(() =>
  pageRows(filteredArchivedAssets.value, assetArchivePage.value),
);
const isAssetDepreciatedInActivePeriod = (asset: any) =>
  Boolean(
    depreciationPeriod.value &&
      String(
        asset?.lastDepreciationPeriod ||
          asset?._raw?.last_depreciation_period ||
          "",
      ) === depreciationPeriod.value,
  );
const buildDepreciationPreviewRow = (asset: any) => {
    const cost = Number(asset.hargaBeli || asset._raw?.acquisition_cost || 0);
    const residual = Number(asset.residualValue || asset._raw?.residual_value || 0);
    const bookValue = Number(asset.nilaiBuku || asset._raw?.book_value || 0);
    const usefulLife = Math.max(
      1,
      Number(asset.usefulLifeMonths || asset._raw?.useful_life_months || 1),
    );
    const monthlyAmount = Math.max(
      0,
      Math.min((cost - residual) / usefulLife, Math.max(bookValue - residual, 0)),
    );
    return {
      id: asset.id,
      nama: asset.nama,
      kategori: asset.kategori,
      nilaiBuku: bookValue,
      nominal: monthlyAmount,
      lastDepreciationPeriod:
        asset.lastDepreciationPeriod ||
        asset._raw?.last_depreciation_period ||
        "-",
    };
};
const depreciationPreviewRows = computed(() =>
  activeAssets.value
    .filter((asset: any) => !isAssetDepreciatedInActivePeriod(asset))
    .map(buildDepreciationPreviewRow)
    .filter((row: any) => Number(row.nominal || 0) > 0),
);
const depreciationAlreadyPostedRows = computed(() =>
  activeAssets.value
    .filter(isAssetDepreciatedInActivePeriod)
    .map(buildDepreciationPreviewRow),
);
const depreciationPreviewTotal = computed(() =>
  depreciationPreviewRows.value.reduce(
    (total: number, row: any) => total + Number(row.nominal || 0),
    0,
  ),
);
const filteredAssets = computed(() =>
  latestFirst(
    activeAssets.value.filter(
      (a: any) => {
        const query = searchQuery.value.toLowerCase();
        return (
          String(a.nama || "")
            .toLowerCase()
            .includes(query) ||
          String(a.penanggungJawab || "")
            .toLowerCase()
            .includes(query) ||
          String(a.kategori || "")
            .toLowerCase()
            .includes(query)
        );
      },
    ),
  ),
);
const pagedSubs = computed(() => pageRows(filteredSubs.value, subsPage.value));
const pagedAssets = computed(() =>
  pageRows(filteredAssets.value, assetsPage.value),
);
const pagedExpiredSubs = computed(() =>
  pageRows(expiredSubs.value, expiredPage.value),
);
const pagedDueSubs = computed(() =>
  pageRows(dueSubs.value, dueSubsPage.value),
);
const handlePayBill = async (item: any) => {
  payingSubId.value = item.id;
  try {
    await paySubscriptionBill(item);
  } finally {
    payingSubId.value = null;
  }
};
const pagedSubHistory = computed(() =>
  pageRows(latestFirst(props.langganan || []), subHistoryPage.value),
);
const assetHistoryRows = computed(() =>
  latestFirst(assetHistory.value?.depreciations || []),
);
const assetHistoryMonthlyRows = computed(() => {
  const postedRows = assetHistoryRows.value.map((item: any) => ({
    id: `posted-${item.id}`,
    period: String(item.depreciation_period || ""),
    periodLabel: String(item.depreciation_period || "-"),
    amount: Number(item.depreciation_amount || 0),
    voucher: item.journal_voucher_number || "-",
    isPosted: true,
    statusLabel: "Terposting",
  }));
  if (postedRows.length) return postedRows;

  const asset = assetHistory.value?.asset || {};
  const period = depreciationPeriod.value;
  const amount = monthlyProjectionAmount(asset, period);
  if (!amount) return [];
  return [
    {
      id: `estimate-${period}`,
      period,
      periodLabel: period,
      amount,
      voucher: "-",
      isPosted: false,
      statusLabel: "Estimasi",
    },
  ];
});
const assetHistoryYearlyRows = computed(() => {
  const groupedRows = new Map<string, any>();
  for (const item of assetHistoryRows.value) {
    const year = String(item.depreciation_period || "").slice(0, 4);
    if (!year) continue;
    const current = groupedRows.get(year) || {
      id: `posted-year-${year}`,
      period: year,
      periodLabel: year,
      amount: 0,
      voucher: [],
      isPosted: true,
      statusLabel: "Terposting",
    };
    current.amount += Number(item.depreciation_amount || 0);
    if (item.journal_voucher_number) current.voucher.push(item.journal_voucher_number);
    groupedRows.set(year, current);
  }
  if (groupedRows.size) {
    return Array.from(groupedRows.values())
      .map((item) => ({
        ...item,
        voucher: item.voucher.length ? item.voucher.join(", ") : "-",
      }))
      .sort((a, b) => String(b.period).localeCompare(String(a.period)));
  }

  const asset = assetHistory.value?.asset || {};
  const year = String(depreciationPeriod.value || "").slice(0, 4);
  if (!year) return [];
  let amount = 0;
  for (let month = 1; month <= 12; month += 1) {
    amount += monthlyProjectionAmount(asset, `${year}-${String(month).padStart(2, "0")}`);
  }
  if (!amount) return [];
  return [
    {
      id: `estimate-year-${year}`,
      period: year,
      periodLabel: year,
      amount,
      voucher: "-",
      isPosted: false,
      statusLabel: "Estimasi",
    },
  ];
});
const assetHistoryDisplayRows = computed(() =>
  assetHistoryViewMode.value === "monthly"
    ? assetHistoryMonthlyRows.value
    : assetHistoryYearlyRows.value,
);
const pagedAssetHistoryRows = computed(() =>
  pageRows(assetHistoryDisplayRows.value, assetHistoryPage.value),
);
const totalSubBurnRate = computed(() =>
  activeSubs.value.reduce(
    (acc: number, l: any) => acc + Number(l.biayaIDR || l.biaya || 0),
    0,
  ),
);
const totalAssetCosts = computed(() =>
  (props.assets || []).reduce(
    (acc: number, a: any) => acc + Number(a.hargaBeli || 0),
    0,
  ),
);
const totalNetBookValue = computed(() =>
  (props.assets || []).reduce(
    (acc: number, a: any) => acc + Number(a.nilaiBuku || 0),
    0,
  ),
);
function handleSubscriptionCostInput(event: Event) {
  const biaya = parseRupiahInput(eventValue(event));
  const rate = Number(newSub.value.kurs || 0);
  const canCalculate =
    newSub.value.mataUang === "IDR" || (rate && subscriptionRateConfirmed.value);
  updateNewSub({
    ...newSub.value,
    biaya,
    biayaIDR: canCalculate
      ? convertToIdr(biaya, newSub.value.mataUang, newSub.value.kurs)
      : 0,
  });
}
function handleSubscriptionCurrencyChange(event: Event) {
  const mataUang = eventValue(event);
  if (!isCurrencyCode(mataUang)) return;
  subscriptionRateConfirmed.value = mataUang === "IDR";
  updateNewSub({
    ...newSub.value,
    mataUang,
    biayaIDR: mataUang === "IDR" ? newSub.value.biaya : 0,
    kurs: mataUang === "IDR" ? 1 : 0,
  });
}
function handleSubscriptionRateInput(event: Event) {
  const kurs = parseRupiahInput(eventValue(event));
  updateNewSub({
    ...newSub.value,
    kurs,
    biayaIDR: 0,
  });
  subscriptionRateConfirmed.value = false;
}
function confirmSubscriptionRate() {
  const kurs = Number(newSub.value.kurs || 0);
  if (!kurs) {
    notify("Isi nominal kurs terlebih dahulu.");
    return;
  }
  confirmDialog.value = {
    type: "subscription-rate",
    eyebrow: "Konfirmasi Kurs",
    title: "Gunakan kurs ini?",
    message:
      "Pastikan kurs sudah dicek. Setelah dikonfirmasi, estimasi rupiah layanan akan dihitung dari kurs ini.",
    details: [
      { label: "Mata uang", value: newSub.value.mataUang },
      { label: "Kurs ke IDR", value: formatRupiah(kurs) },
      { label: "Biaya asal", value: subscriptionOriginalCostSummary.value },
    ],
    impactItems: [
      "Estimasi IDR layanan akan diperbarui.",
      "Status kurs berubah menjadi siap dihitung.",
    ],
    confirmLabel: "Gunakan Kurs",
    cancelLabel: "Cek Lagi",
    variant: "warning",
  };
}

function applyConfirmedSubscriptionRate() {
  const kurs = Number(newSub.value.kurs || 0);
  if (!kurs) {
    notify("Isi nominal kurs terlebih dahulu.");
    return;
  }
  subscriptionRateConfirmed.value = true;
  updateNewSub({
    ...newSub.value,
    biayaIDR: convertToIdr(
      newSub.value.biaya,
      newSub.value.mataUang,
      kurs,
    ),
  });
}

function subscriptionTotalByCategory(category: string) {
  return activeSubs.value
    .filter((subscription: any) => subscription.kategori === category)
    .reduce(
      (total: number, subscription: any) =>
        total + Number(subscription.biayaIDR || 0),
      0,
    );
}

function closeConfirmDialog() {
  if (confirmDialog.value?.type === "subscription-rate") {
    subscriptionRateConfirmed.value = false;
    notify("Cek kurs di Google terlebih dahulu sebelum akumulasi.");
  }
  confirmDialog.value = null;
}

</script>

<style scoped>
.asset-toolbar-button,
.asset-toolbar-period {
  box-sizing: border-box;
  height: 40px !important;
  min-height: 40px !important;
  line-height: 1 !important;
}

.asset-toolbar-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.asset-table-scroll {
  scrollbar-color: #9aabc2 #eef5fc;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.asset-table-scroll::-webkit-scrollbar {
  height: 10px;
}

.asset-table-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: #eef5fc;
}

.asset-table-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #eef5fc;
  border-radius: 999px;
  background: #9aabc2;
}

.asset-form-actions :deep(button) {
  height: 48px !important;
  min-height: 48px !important;
  border-radius: 14px !important;
  padding-block: 0 !important;
}

.asset-form-actions :deep(#btn-asset-submit) {
  box-shadow: 0 12px 24px rgba(11, 31, 74, 0.18) !important;
}

.subscription-modal-card {
  max-height: calc(100dvh - 1.5rem);
  max-width: 950px;
}

.subscription-modal-card :deep(form) {
  gap: 18px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.subscription-modal-card :deep(label) {
  color: #8a99ad !important;
  font-size: 10px !important;
  letter-spacing: 0.13em !important;
}

.subscription-modal-card :deep(input),
.subscription-modal-card :deep(select) {
  height: 44px !important;
  border-radius: 14px !important;
  font-size: 13px !important;
}

.subscription-billing-grid {
  align-items: stretch;
}

.subscription-billing-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.subscription-cost-input {
  min-height: 44px;
}

.subscription-currency-prefix {
  width: 42px;
  text-align: left;
  color: #52647e !important;
  font-size: 12.5px !important;
  letter-spacing: 0.02em;
}

.subscription-cost-field {
  padding-left: 74px !important;
  color: #102a56 !important;
  font-size: 13.5px !important;
  line-height: 1 !important;
}

.subscription-cost-field::placeholder {
  color: #94a3b8;
}

.subscription-rate-card,
.subscription-estimate-card,
.subscription-summary-card {
  border-radius: 16px !important;
}

.subscription-rate-card {
  min-height: 136px;
}

.subscription-rate-status {
  display: inline-flex;
  min-width: 74px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  line-height: 1 !important;
}

.subscription-rate-controls {
  grid-template-columns: minmax(0, 1fr) 56px !important;
  align-items: stretch;
}

.subscription-estimate-card {
  min-height: 92px;
}

.subscription-summary-card {
  flex: 1;
  min-height: 246px;
}

.subscription-rate-card p,
.subscription-estimate-card p,
.subscription-summary-card p {
  line-height: 1.35;
}

.subscription-rate-card input {
  height: 38px !important;
  border-radius: 12px !important;
  font-size: 13px !important;
}

.subscription-rate-card button {
  min-height: 32px;
  border-radius: 12px;
  line-height: 1.2;
}

.subscription-rate-card .subscription-rate-ok {
  height: 44px !important;
  min-height: 44px !important;
  width: 56px;
  padding-inline: 0 !important;
}

.subscription-rate-card .subscription-exchange-link {
  min-height: 34px !important;
  max-width: 100%;
  padding-inline: 14px !important;
  color: #1e5aa8 !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  line-height: 1.1 !important;
  white-space: nowrap;
}

.subscription-modal-actions {
  margin-inline: -20px;
  padding-inline: 20px;
  padding-bottom: 4px;
}

.subscription-modal-actions button {
  min-height: 52px;
}

.subscription-estimate-card button {
  border-color: #b8cbe2 !important;
  color: #1e5aa8 !important;
  line-height: 1.2;
}

.subscription-estimate-card p:last-child {
  font-size: 13px !important;
  line-height: 1.45 !important;
}

.subscription-summary-grid > div {
  min-width: 0;
  border-radius: 12px;
}

.subscription-summary-grid span {
  color: #8a99ad !important;
  font-size: 10.5px !important;
  font-weight: 800 !important;
  line-height: 1.25;
}

.subscription-summary-grid strong {
  overflow-wrap: anywhere;
  color: #102a56 !important;
  font-size: 12.5px !important;
  font-weight: 850 !important;
  line-height: 1.25;
}

.depreciation-modal-card {
  height: min(720px, calc(100dvh - 32px));
  max-height: calc(100dvh - 32px);
}

.depreciation-modal-body {
  display: flex;
  flex-direction: column;
}

.depreciation-table-panel {
  height: min(260px, 34vh);
  max-height: 34vh;
}

.depreciation-preview-table {
  table-layout: fixed;
}

.depreciation-preview-table thead,
.depreciation-preview-table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.depreciation-preview-table thead {
  width: calc(100% - 10px);
}

.depreciation-preview-table tbody {
  display: block;
}

.depreciation-table-scroll {
  max-height: calc(min(260px, 34vh) - 40px);
  overflow-y: scroll;
  scrollbar-color: #9aabc2 #eef5fc;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.depreciation-preview-table th,
.depreciation-preview-table td {
  line-height: 1.35;
}

.depreciation-table-scroll::-webkit-scrollbar {
  width: 10px;
}

.depreciation-table-scroll::-webkit-scrollbar-track {
  border-radius: 999px;
  background: #eef5fc;
}

.depreciation-table-scroll::-webkit-scrollbar-thumb {
  border: 2px solid #eef5fc;
  border-radius: 999px;
  background: #9aabc2;
}

.depreciation-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #6f8199;
}

@media (max-width: 767px) {
  .subscription-rate-card,
  .subscription-estimate-card,
  .subscription-summary-card {
    min-height: auto;
  }

  .subscription-summary-card > div {
    grid-template-columns: 1fr !important;
  }
}
</style>
