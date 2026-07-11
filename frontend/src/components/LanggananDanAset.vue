<template>
  <div class="space-y-6 font-sans">
    <!-- Action Header bar -->
    <div
      class="flex flex-wrap justify-between items-start gap-4 border-b border-slate-200/80 pb-5"
    >
      <div class="min-w-0">
        <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">
          Langganan Digital &amp; Aset Teknologi
        </h1>
        <p class="text-xs text-slate-400 font-light mt-1">
          Lacak pengeluaran operational burn rate SaaS serta database penyusutan
          depresiasi hardware infrastruktur korporat.
        </p>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 ml-auto">
        <div
          class="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs font-bold text-[#0B1F4A]"
        >
          <Cloud v-if="activeTab === 'subs'" class="w-4 h-4 text-sky-500" /><Box
            v-else
            class="w-4 h-4 text-[#0B1F4A]"
          /><template v-if="activeTab === 'subs'">SaaS &amp; Langganan</template
          ><template v-else>Aset Teknologi</template>
        </div>
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
        <div
          v-if="activeTab === 'assets'"
          class="flex w-full flex-wrap items-center gap-2 xl:justify-end"
        >
          <button
            type="button"
            :class="`inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-[11px] font-bold transition ${showAssetArchive ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'border border-[#D8E5F4] bg-white text-[#0B1F4A] hover:bg-[#F8FBFE]'}`"
            @click="showAssetArchive = !showAssetArchive"
          >
            <Archive class="h-4 w-4" /> Arsip ({{ archivedAssets.length }})
          </button>
          <div
            class="flex shrink-0 items-center justify-end gap-2 rounded-xl border border-[#D8E5F4] bg-white px-2 py-1"
          >
            <input
              type="month"
              :value="depreciationPeriod"
              class="h-7 border-0 bg-transparent px-2 text-xs text-[#0B1F4A] outline-none"
              :style="{ width: '136px' }"
              @change="depreciationPeriod = eventValue($event)"
            /><button
              type="button"
              class="h-7 rounded-lg bg-[#EEF5FC] px-3 text-[10px] font-semibold text-[#0B1F4A] whitespace-nowrap"
              @click="processMonthlyDepreciation"
            >
              Proses Penyusutan
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- 1. LAYANAN LANGGANA DIGITAL view -->
    <div v-if="activeTab === 'subs'" class="space-y-6">
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
      <div class="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div
          class="rounded-[2rem] border border-[#E4EDF8] bg-white p-6 shadow-[0_24px_80px_rgba(15,43,96,0.08)]"
        >
          <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="space-y-2">
              <p
                class="text-[10px] font-extrabold uppercase tracking-[0.32em] text-[#94A3B8]"
              >
                Kurs &amp; Mata Uang
              </p>
              <p class="max-w-xl text-sm leading-6 text-[#475569]">
                Desain kalkulator modern untuk memproyeksikan nilai langganan
                secara instan dengan pilihan IDR / USD.
              </p>
            </div>
            <button
              type="button"
              class="h-11 rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] px-4 text-[11px] font-bold text-[#0B1F4A] hover:bg-white"
              @click="openExchangeRate"
            >
              Lihat Kurs Realtime di Google
            </button>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div
              class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm"
            >
              <div
                class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3"
              >
                <span>Kurs</span
                ><span
                  class="rounded-full bg-white/90 px-2 py-1 text-[10px] text-[#475569]"
                  >{{ rateLabel }}</span
                >
              </div>
              <input
                type="number"
                :min="0"
                :value="exchangeRate"
                class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]"
                @input="exchangeRate = Number(eventValue($event) || 0)"
              />
            </div>
            <div
              class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm"
            >
              <div
                class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3"
              >
                Nominal
              </div>
              <input
                type="number"
                :min="0"
                :value="calculatorAmount"
                class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]"
                @input="calculatorAmount = Number(eventValue($event) || 0)"
              />
            </div>
            <div
              class="rounded-[1.5rem] border border-[#E1E8F3] bg-[#F8FBFE] p-4 shadow-sm"
            >
              <div
                class="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#64748B] mb-3"
              >
                Konversi
              </div>
              <div class="grid gap-3">
                <select
                  :value="currencyFrom"
                  class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]"
                  @change="updateCurrencyFrom(eventValue($event))"
                >
                  <option
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option></select
                ><select
                  :value="currencyTo"
                  class="h-12 w-full rounded-2xl border border-[#D8E5F4] bg-white px-4 text-sm font-bold text-[#0B1F4A] outline-none transition focus:border-[#0B1F4A]"
                  @change="updateCurrencyTo(eventValue($event))"
                >
                  <option
                    v-for="option in currencyOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div
            class="mt-6 rounded-[2rem] bg-gradient-to-r from-slate-50 via-white to-cyan-50 border border-[#E1E8F3] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <span
                class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0B2F56]"
                >Estimasi Cepat</span
              ><span
                class="rounded-full bg-[#0B1F4A] px-3 py-1.5 text-[11px] font-semibold text-white"
                >Realtime</span
              >
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <div
                class="rounded-[1.5rem] bg-white p-4 shadow-sm border border-white"
              >
                <p
                  class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]"
                >
                  Nilai Saat Ini
                </p>
                <p class="mt-3 text-lg font-bold text-[#0B1F4A]">
                  {{ formatCurrency(convertAmount, currencyTo) }}
                </p>
              </div>
              <div
                class="rounded-[1.5rem] bg-white p-4 shadow-sm border border-white"
              >
                <p
                  class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]"
                >
                  Rincian Konversi
                </p>
                <p class="mt-3 text-sm font-semibold text-[#0B1F4A]">
                  {{ journalSummary }}
                </p>
                <p class="mt-1 text-[11px] text-[#64748B]">
                  <template v-if="currencyFrom === currencyTo"
                    >Sama mata uang, tidak perlu konversi.</template
                  ><template v-else>{{
                    `Kurs yang digunakan: 1 ${currencyFrom} = ${formatCurrency(exchangeRate, currencyTo)}`
                  }}</template>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          class="relative overflow-hidden rounded-[2rem] border border-[#DCE7F4] bg-[#F5F9FF] p-6 shadow-[0_24px_80px_rgba(15,43,96,0.06)]"
        >
          <div
            class="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#C7E7FF]/30 blur-3xl"
          ></div>
          <div
            class="absolute left-4 top-10 h-16 w-16 rounded-full bg-[#EFF8FF]/80"
          ></div>
          <p
            class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]"
          >
            Hasil Kalkulator
          </p>
          <p class="mt-4 text-4xl font-black text-[#0B1F4A]">
            {{ formatCurrency(convertAmount, currencyTo) }}
          </p>
          <p class="mt-2 text-sm text-[#64748B]">{{ journalSummary }}</p>
          <div class="mt-6 grid gap-3">
            <div
              class="rounded-[1.5rem] bg-white/90 p-4 shadow-sm border border-white"
            >
              <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">
                Nominal Jurnal
              </p>
              <p class="mt-3 text-lg font-bold text-[#0B1F4A]">
                {{ formatCurrency(convertAmount, currencyTo) }}
              </p>
              <p class="mt-1 text-[11px] text-[#64748B]">
                Gunakan angka ini untuk memasukkan biaya langganan ke jurnal
                dalam {{ currencyTo }}.
              </p>
            </div>
            <div
              class="rounded-[1.5rem] bg-white/90 p-4 shadow-sm border border-white"
            >
              <p class="text-[10px] uppercase tracking-[0.24em] text-[#94A3B8]">
                Detail Konversi
              </p>
              <p class="mt-2 text-sm text-[#0B1F4A]">{{ journalSummary }}</p>
              <p class="mt-1 text-[11px] text-[#64748B]">
                <template v-if="currencyFrom === currencyTo"
                  >Sama mata uang, tidak perlu konversi.</template
                ><template v-else>{{
                  `Kurs: 1 ${currencyFrom} = ${formatCurrency(exchangeRate, currencyTo)}`
                }}</template>
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Subs Log Table -->
      <div
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
            ><button
              id="btn-subscription-transactions"
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-lg border border-[#BFD7F5] bg-[#F4F9FF] px-3 text-[11px] font-bold text-[#0B3A78] transition hover:bg-[#EAF4FF]"
              @click="showSubscriptionTransactions = true"
            >
              <History class="h-3.5 w-3.5" /> Riwayat Transaksi</button
            ><button
              id="btn-expired-subscriptions"
              type="button"
              class="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
              @click="showExpiredSubscriptions = true"
            >
              <History class="h-3.5 w-3.5" /> Riwayat Kadaluarsa ({{
                expiredSubs.length
              }})
            </button>
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
                <th class="p-5">Est. Nominal Rupiah</th>
                <th class="p-5">Tanggal Perpanjangan</th>
                <th class="p-5">Status</th>
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
                <td class="p-5 font-mono font-bold text-slate-800 text-sm">
                  {{ formatRupiah(item.biayaIDR) }}
                </td>
                <td class="p-5 font-mono">{{ item.tanggalTagihan }}</td>
                <td class="p-5">
                  <span
                    class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                    >Aktif</span
                  >
                </td>
                <td class="p-5">
                  <div class="flex justify-center gap-2">
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
    <!-- 2. ASET TEKNOLOGI INVENTORY view -->
    <div v-if="activeTab === 'assets'" class="space-y-6">
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
              id="assets-search-box"
              type="text"
              :value="searchQuery"
              placeholder="Cari aset atau penanggung jawab..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateSearchQuery(eventValue($event))"
            />
          </div>
          <span class="text-xs text-[#6B7A90]"
            ><template v-if="showAssetArchive"
              >Menampilkan aset yang sudah dilepas/tidak digunakan</template
            ><template v-else
              >Penyusutan aset menggunakan metode garis lurus sesuai masa
              manfaat aset</template
            ></span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-5">Aset Hardware &amp; Cloud</th>
                <th class="p-5">Kategori Aset</th>
                <th class="p-5 font-mono">Tgl Perolehan</th>
                <th class="p-5 text-right">Harga Perolehan</th>
                <th class="p-5 text-right">Depresiasi / Thn</th>
                <th class="p-5 text-right">Nilai Buku Neto</th>
                <th class="p-5">Penanggung Jawab</th>
                <th class="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="asset in pagedAssets"
                :key="asset.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-5">
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    asset.nama
                  }}</span
                  ><span class="text-[10px] text-slate-400 font-mono">{{
                    asset.id
                  }}</span>
                </td>
                <td class="p-5 text-slate-700 font-semibold">
                  {{ asset.kategori }}
                </td>
                <td class="p-5 font-mono">{{ asset.tanggalBeli }}</td>
                <td class="p-5 text-right font-mono font-medium text-slate-600">
                  {{ formatRupiah(asset.hargaBeli) }}
                </td>
                <td class="p-5 text-right font-mono text-rose-600">
                  -{{ formatRupiah(asset.penyusutanTahunan) }}
                </td>
                <td
                  class="p-5 text-right font-mono font-bold text-emerald-600 text-sm"
                >
                  {{ formatRupiah(asset.nilaiBuku) }}
                </td>
                <td class="p-5 font-medium text-slate-700">
                  {{ asset.penanggungJawab }}
                </td>
                <td class="p-5">
                  <div class="flex justify-center gap-2">
                    <button
                      type="button"
                      :aria-label="`Riwayat penyusutan ${asset.nama}`"
                      title="Riwayat penyusutan"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click="showDepreciationHistory(asset)"
                    >
                      <History class="h-3.5 w-3.5" /></button
                    ><template v-if="asset._raw?.status !== 'disposed'"
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
                        <Trash2 class="h-3.5 w-3.5" /></button
                    ></template>
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
    <div
      v-if="assetHistory"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-2xl overflow-hidden rounded-[24px] bg-white shadow-2xl"
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
        <div class="max-h-[55vh] overflow-y-auto p-6">
          <table
            v-if="(assetHistory.depreciations || []).length"
            class="w-full text-left text-xs"
          >
            <thead class="border-b border-[#E8EEF7] text-[#70819B]">
              <tr>
                <th class="pb-3">Periode</th>
                <th class="pb-3 text-right">Nilai</th>
                <th class="pb-3">Voucher</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-for="item in pagedAssetHistoryRows" :key="item.id">
                <td class="py-3">{{ item.depreciation_period }}</td>
                <td class="py-3 text-right font-semibold">
                  {{ formatRupiah(Number(item.depreciation_amount || 0)) }}
                </td>
                <td class="py-3">{{ item.journal_voucher_number || "-" }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-sm text-[#8A98AB]">
            Belum ada riwayat penyusutan untuk aset ini.
          </p>
        </div>
        <TablePagination
          v-if="(assetHistory.depreciations || []).length > 0"
          :page="assetHistoryPage"
          :total="(assetHistory.depreciations || []).length"
          @page-change="assetHistoryPage = safePage(
                $event,
                (assetHistory.depreciations || []).length,
              )"
        />
        <div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4">
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
    <ConfirmDialog
      :open="!!confirmDialog"
      :eyebrow="confirmDialog?.eyebrow || 'Konfirmasi'"
      :title="confirmDialog?.title || 'Lanjutkan tindakan?'"
      :message="confirmDialog?.message || ''"
      :details="confirmDialog?.details || []"
      :impact-items="confirmDialog?.impactItems || []"
      :confirm-label="confirmDialog?.confirmLabel || 'Lanjutkan'"
      :require-reason="!!confirmDialog?.requireReason"
      :reason-label="confirmDialog?.reasonLabel || 'Alasan'"
      :reason-placeholder="
        confirmDialog?.reasonPlaceholder || 'Tulis alasan singkat...'
      "
      :default-reason="confirmDialog?.defaultReason || ''"
      :on-cancel="closeConfirmDialog"
      :on-confirm="handleConfirmDialog"
    /><!-- 3. ADD SUBSCRIPTION MODAL -->
    <div
      v-if="isSubModalOpen"
      class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-4 backdrop-blur-sm"
    >
      <div
        class="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[760px] flex-col overflow-hidden rounded-[34px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="px-9 py-8 border-b border-slate-100 flex justify-between items-center"
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
          class="min-h-0 flex-1 space-y-7 overflow-y-auto px-9 py-10 text-sm"
          @submit="handleSaveSub"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Nama Layanan</label
              ><input
                id="sub-form-name"
                type="text"
                required
                placeholder="Contoh: AWS Production"
                :value="newSub.nama"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @change="updateNewSub({ ...newSub, nama: eventValue($event) })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Provider</label
              ><input
                id="sub-form-provider"
                type="text"
                required
                placeholder="Contoh: Amazon"
                :value="newSub.provider"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @change="updateNewSub({ ...newSub, provider: eventValue($event) })"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Mata Uang</label
              >
              <div class="relative">
                <select
                  id="sub-form-currency"
                  :value="newSub.mataUang"
                  class="w-full h-11 px-5 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-sm appearance-none transition-all"
                  @change="updateNewSub({
                        ...newSub,
                        mataUang: eventValue($event),
                        biayaIDR: convertToIdr(newSub.biaya, eventValue($event)),
                        kurs: usdToIdrRate,
                      })"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="USD">USD (Dolar AS)</option></select
                ><ChevronDown
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F172A]"
                />
              </div>
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Siklus</label
              >
              <div class="relative">
                <select
                  id="sub-form-cycle"
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
                >Kategori</label
              >
              <div class="relative">
                <select
                  id="sub-form-category"
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Biaya Langganan</label
              ><input
                id="sub-form-cost"
                type="number"
                :value="newSub.biaya || ''"
                placeholder="0"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#0B1F4A] font-bold text-sm transition-all"
                @input="handleSubscriptionCostInput"
              />
              <p class="text-[10px] font-semibold text-[#64748B]">
                Estimasi rupiah:
                {{ formatRupiah(convertToIdr(newSub.biaya, newSub.mataUang)) }}
              </p>
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Tgl Tagihan Berikutnya</label
              >
              <div class="relative">
                <input
                  id="sub-form-date"
                  type="date"
                  required
                  :value="newSub.tanggalTagihan"
                  class="w-full h-12 px-5 pr-12 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-sm transition-all"
                  @change="updateNewSub({ ...newSub, tanggalTagihan: eventValue($event) })"
                /><Calendar
                  class="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                />
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 pt-2">
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
              class="h-[52px] bg-[#0B1F4A] hover:bg-[#071735] text-white font-extrabold rounded-2xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" /> Simpan Layanan
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="showExpiredSubscriptions"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-3xl overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600"
            >
              Arsip Langganan
            </p>
            <h3
              class="mt-1 text-lg font-extrabold tracking-tight text-[#111827]"
            >
              Riwayat Langganan Kadaluarsa
            </h3>
            <p class="mt-0.5 text-[11px] text-[#53658A]">
              Menampung layanan yang tanggal perpanjangannya sudah lewat atau
              statusnya dihentikan/nonaktif.
            </p>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"
            @click="showExpiredSubscriptions = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="max-h-[60vh] overflow-y-auto p-6">
          <table v-if="expiredSubs.length" class="w-full text-left text-xs">
            <thead
              class="border-b border-[#E8EEF7] text-[10px] font-extrabold uppercase tracking-wider text-[#70819B]"
            >
              <tr>
                <th class="pb-3">Layanan</th>
                <th class="pb-3">Kategori</th>
                <th class="pb-3 text-right">Nominal</th>
                <th class="pb-3">Tanggal</th>
                <th class="pb-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr v-for="item in pagedExpiredSubs" :key="`expired-${item.id}`">
                <td class="py-3">
                  <p class="font-bold text-[#0B1F4A]">{{ item.nama }}</p>
                  <p class="mt-0.5 text-[10px] text-[#8A98AB]">
                    {{ item.provider || "-" }}
                  </p>
                </td>
                <td class="py-3">{{ item.kategori || "-" }}</td>
                <td class="py-3 text-right font-mono font-bold text-[#0B1F4A]">
                  {{ formatRupiah(item.biayaIDR || item.biaya || 0) }}
                </td>
                <td class="py-3 font-mono">{{ item.tanggalTagihan || "-" }}</td>
                <td class="py-3">
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
            class="rounded-2xl border border-dashed border-[#DCE7F4] bg-[#F8FBFE] p-6 text-center text-sm text-[#6B7A90]"
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
        <div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4">
          <button
            type="button"
            class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            @click="showExpiredSubscriptions = false"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showSubscriptionTransactions"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-4xl overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Langganan
            </p>
            <h3
              class="mt-1 text-lg font-extrabold tracking-tight text-[#111827]"
            >
              Riwayat Transaksi Langganan
            </h3>
            <p class="mt-0.5 text-[11px] text-[#53658A]">
              Ringkasan status tagihan terakhir dari semua layanan.
            </p>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition-colors hover:bg-slate-50 hover:text-slate-600"
            @click="showSubscriptionTransactions = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <div class="max-h-[60vh] overflow-y-auto p-6">
          <table class="w-full text-left text-xs">
            <thead
              class="border-b border-[#E8EEF7] text-[10px] font-extrabold uppercase tracking-wider text-[#70819B]"
            >
              <tr>
                <th class="pb-3">Layanan</th>
                <th class="pb-3">Mata Uang</th>
                <th class="pb-3 text-right">Nominal</th>
                <th class="pb-3">Tagihan Berikutnya</th>
                <th class="pb-3">Status Terakhir</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#EDF2F7]">
              <tr
                v-for="item in pagedSubHistory"
                :key="`sub-history-${item.id}`"
              >
                <td class="py-3">
                  <p class="font-bold text-[#0B1F4A]">{{ item.nama }}</p>
                  <p class="mt-0.5 text-[10px] text-[#8A98AB]">
                    {{ item.provider || "-" }}
                  </p>
                </td>
                <td class="py-3 font-mono">
                  {{ item.mataUang || item._raw?.currency || "IDR" }}
                </td>
                <td class="py-3 text-right font-mono font-bold text-[#0B1F4A]">
                  {{ formatRupiah(item.biayaIDR || item.biaya || 0) }}
                </td>
                <td class="py-3 font-mono">{{ item.tanggalTagihan || "-" }}</td>
                <td class="py-3">
                  {{
                    item._raw?.latest_bill_status ||
                    subscriptionStatusLabel(item)
                  }}
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
        <div class="flex justify-end border-t border-[#E8EEF7] px-6 py-4">
          <button
            type="button"
            class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            @click="showSubscriptionTransactions = false"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="subscriptionHistory"
      class="fixed inset-0 z-[10000] flex items-center justify-center bg-[#0B1220]/60 p-4 backdrop-blur-sm"
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
    <!-- 4. ADD HARDWARE ASSET MODAL -->
    <div
      v-if="isAssetModalOpen"
      class="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-[#0B1220]/60 p-4 backdrop-blur-sm"
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
            class="w-10 h-10 flex items-center justify-center rounded-2xl text-[#94A3B8] hover:text-slate-600 hover:bg-slate-50 transition-colors"
            @click="updateIsAssetModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          class="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6 text-xs"
          @submit="handleSaveAsset"
        >
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
                  class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                  @change="updateNewAsset({ ...newAsset, nama: eventValue($event) })"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Kategori</label
                >
                <div class="relative">
                  <select
                    id="asset-form-category"
                    :value="newAsset.kategori"
                    class="w-full h-10 px-4 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-semibold text-xs appearance-none transition-all"
                    @change="updateNewAsset({ ...newAsset, kategori: eventValue($event) })"
                  >
                    <option value="Elektronik / IT">Elektronik / IT</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Gedung &amp; Kantor">
                      Gedung &amp; Kantor
                    </option></select
                  ><ChevronDown
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                  />
                </div>
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
                class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                @input="updateNewAsset({
                      ...newAsset,
                      penanggungJawab: eventValue($event),
                    })"
              />
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
                    class="w-full h-10 px-4 pr-10 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                    @change="updateNewAsset({
                          ...newAsset,
                          tanggalBeli: eventValue($event),
                        })"
                  /><Calendar
                    class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Harga Perolehan (Rp)</label
                ><input
                  id="asset-form-cost"
                  type="number"
                  required
                  :min="0"
                  :disabled="!!editingAsset"
                  :value="newAsset.hargaBeli || ''"
                  placeholder="0"
                  class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                  @change="updateNewAsset({
                        ...newAsset,
                        hargaBeli: Number(eventValue($event)),
                      })"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Masa Manfaat (Tahun)</label
                ><input
                  id="asset-form-life"
                  type="number"
                  :min="1"
                  :value="newAsset.masaManfaat"
                  class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                  @change="updateNewAsset({
                        ...newAsset,
                        masaManfaat: Number(eventValue($event)),
                      })"
                />
              </div>
              <div class="space-y-2">
                <label
                  class="text-[9px] font-extrabold text-[#94A3B8] uppercase"
                  >Nilai Sisa / Salvage (Rp)</label
                ><input
                  id="asset-form-salvage"
                  type="number"
                  :min="0"
                  :value="newAsset.nilaiSisa || ''"
                  placeholder="0"
                  class="w-full h-10 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B1F4A]/20 text-[#111827] font-bold text-xs transition-all"
                  @change="updateNewAsset({
                        ...newAsset,
                        nilaiSisa: Number(eventValue($event)),
                      })"
                />
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
            class="grid grid-cols-1 md:grid-cols-[175px_1fr] gap-3 pt-4 border-t border-slate-100"
          >
            <button
              id="btn-asset-cancel"
              type="button"
              class="h-[38px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-xl text-sm transition-all"
              @click="updateIsAssetModalOpen(false)"
            >
              Batal</button
            ><button
              id="btn-asset-submit"
              type="submit"
              class="h-[38px] bg-[#0B1F4A] hover:bg-[#071735] text-white font-extrabold rounded-xl shadow-lg shadow-[#0B1F4A]/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Save class="w-4 h-4" /><template v-if="editingAsset"
                >Simpan Perubahan</template
              ><template v-else>Daftarkan Aset</template>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, ref } from "vue";
import {
  Cloud,
  Box,
  Plus,
  Search,
  Trash2,
  Cpu,
  CreditCard,
  BarChart2,
  X,
  Save,
  Calendar,
  ChevronDown,
  Info,
  Pencil,
  History,
  Archive,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Langganan } from "../types.ts";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";
import ConfirmDialog from "./common/ConfirmDialog.vue";
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
  activeSection: "langganan" | "aset";
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
    deleteSubscription,
    addAsset,
    updateAsset,
    disposeAsset,
  },
} = useFinStartContext();
const activeTab = computed(() =>
  props.activeSection === "langganan" ? "subs" : "assets",
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
const depreciationPeriod = ref(new Date().toISOString().slice(0, 7));
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
const calculatorAmount = ref(1);
const currencyFrom = ref<CurrencyCode>("USD");
const currencyTo = ref<CurrencyCode>("IDR");
const updateCurrencyFrom = (value: string) => {
  if (currencyOptions.some((option) => option.value === value)) {
    currencyFrom.value = value as CurrencyCode;
  }
};
const updateCurrencyTo = (value: string) => {
  if (currencyOptions.some((option) => option.value === value)) {
    currencyTo.value = value as CurrencyCode;
  }
};
const exchangeRate = ref(16000);
const subscriptionHistory = ref<any>(null);
const showSubscriptionTransactions = ref(false);
const showExpiredSubscriptions = ref(false);
const showAssetArchive = ref(false);
const assetHistory = ref<any>(null);
const usdToIdrRate = ref(16000);

const convertToIdr = (amount: number, currency: string) => {
  if (currency === "IDR") return amount;
  if (currency === "USD") return amount * usdToIdrRate.value;
  return amount;
};
const formatCurrency = (amount: number, currency: CurrencyCode) => {
  if (currency === "IDR") return formatRupiah(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
};
const convertAmount = computed(
  () => Number(calculatorAmount.value || 0) * Number(exchangeRate.value || 0),
);
const rateLabel = computed(() =>
  currencyFrom.value === currencyTo.value
    ? `1 ${currencyFrom.value} = 1 ${currencyTo.value}`
    : `1 ${currencyFrom.value} = ${formatCurrency(exchangeRate.value, currencyTo.value)}`,
);
const journalSummary = computed(() => {
  if (currencyFrom.value === currencyTo.value) {
    return `${formatCurrency(calculatorAmount.value, currencyFrom.value)}`;
  }
  return `${formatCurrency(calculatorAmount.value, currencyFrom.value)} x ${formatCurrency(exchangeRate.value, currencyTo.value)} = ${formatCurrency(convertAmount.value, currencyTo.value)}`;
});
const openExchangeRate = () =>
  window.open(
    `https://www.google.com/search?q=kurs+${currencyFrom.value}+ke+${currencyTo.value}+hari+ini`,
    "_blank",
    "noopener,noreferrer",
  );
const todayDate = () => new Date().toISOString().slice(0, 10);
const isExpiredSubscription = (item: any) => {
  const status = String(
    item?.status || item?._raw?.status || "active",
  ).toLowerCase();
  const renewalDate = String(
    item?.tanggalTagihan || item?._raw?.renewal_date || "",
  );
  return (
    ["cancelled", "inactive", "expired", "stopped"].includes(status) ||
    Boolean(renewalDate && renewalDate < todayDate())
  );
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
const editingAsset = ref<any>(null);
const confirmDialog = ref<any>(null);
// Daftar aset berasal langsung dari props API backend.
const newSub = ref({
    nama: "",
    provider: "",
    mataUang: "IDR" as "IDR" | "USD",
    siklus: "Bulanan" as "Bulanan" | "Tahunan",
    kategori: "Software" as "Infrastruktur" | "Software" | "Marketing",
    biaya: 0,
    biayaIDR: 0,
    kurs: 16000,
    tanggalTagihan: new Date().toISOString().slice(0, 10),
  }),
  updateNewSub = (next) => (newSub.value = next);
const newAsset = ref({
    nama: "",
    kategori: "Elektronik / IT" as
      "Elektronik / IT" | "Furniture" | "Kendaraan" | "Gedung & Kantor",
    tanggalBeli: new Date().toISOString().slice(0, 10),
    hargaBeli: 0,
    masaManfaat: 4,
    nilaiSisa: 0,
    penanggungJawab: "",
  }),
  updateNewAsset = (next) => (newAsset.value = next); // Submit new subscription
const handleSaveSub = async (e: Event) => {
  e.preventDefault();
  if (
    !newSub.value.nama ||
    !newSub.value.tanggalTagihan ||
    !newSub.value.provider
  ) {
    notify("Harap isi nama layanan, nama provider, dan tanggal tagihan.");
    return;
  }
  const item: Langganan = {
    id: `SUB-${Date.now()}`,
    ...newSub.value,
    biayaIDR: convertToIdr(newSub.value.biaya, newSub.value.mataUang),
  };
  await addSubscription(item);
  updateIsSubModalOpen(false);
  updateNewSub({
    nama: "",
    provider: "",
    mataUang: "IDR",
    siklus: "Bulanan",
    kategori: "Software",
    biaya: 0,
    biayaIDR: 0,
    kurs: usdToIdrRate.value,
    tanggalTagihan: new Date().toISOString().slice(0, 10),
  });
};

const resetAssetForm = () => {
  editingAsset.value = null;
  updateNewAsset({
    nama: "",
    kategori: "Elektronik / IT",
    tanggalBeli: new Date().toISOString().slice(0, 10),
    hargaBeli: 0,
    masaManfaat: 4,
    nilaiSisa: 0,
    penanggungJawab: "",
  });
};

const openAssetForm = (asset: any = null) => {
  if (asset) {
    editingAsset.value = asset;
    const raw = asset._raw || asset;
    updateNewAsset({
      nama: asset.nama || raw.asset_name || "",
      kategori: asset.kategori || raw.category || "Elektronik / IT",
      tanggalBeli:
        asset.tanggalBeli ||
        raw.acquisition_date ||
        new Date().toISOString().slice(0, 10),
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

const handleSaveAsset = async (e: Event) => {
  e.preventDefault();
  if (
    !newAsset.value.nama ||
    !newAsset.value.tanggalBeli ||
    !newAsset.value.penanggungJawab
  ) {
    notify("Harap lengkapi nama aset, tanggal beli, dan penanggung jawab.");
    return;
  }
  if (editingAsset.value) {
    await updateAsset(editingAsset.value, { ...newAsset.value });
  } else {
    await addAsset({ ...newAsset.value });
  }
  updateIsAssetModalOpen(false);
  resetAssetForm();
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
  if (action.type === "subscription") {
    await deleteSubscription(action.item.id);
    notify(`Auto-renewal ${action.item.nama} dihentikan.`);
    return;
  }
  if (action.type === "dispose-asset") {
    await disposeAsset(action.item, reason || "Aset tidak lagi digunakan");
  }
};

async function processMonthlyDepreciation() {
  try {
    const result = await financeApi.post("/assets/depreciate-batch", {
      depreciation_period: depreciationPeriod.value,
      notes: "Penyusutan bulanan diproses dari workspace FinStart.",
    });
    await refreshData();
    notify(result?.message || "Penyusutan bulanan berhasil diproses.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memproses penyusutan bulanan."));
  }
}

async function showDepreciationHistory(asset: any) {
  try {
    const assetId = Number(asset?._raw?.id || asset?.id);
    if (!assetId) return notify("ID aset tidak valid.");
    assetHistory.value = await financeApi.get(
      `/assets/${assetId}/depreciations`,
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memuat riwayat penyusutan aset."));
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
const filteredAssets = computed(() =>
  latestFirst(
    (showAssetArchive.value ? archivedAssets.value : activeAssets.value).filter(
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
const pagedSubHistory = computed(() =>
  pageRows(latestFirst(props.langganan || []), subHistoryPage.value),
);
const pagedAssetHistoryRows = computed(() =>
  pageRows(
    latestFirst(assetHistory.value?.depreciations || []),
    assetHistoryPage.value,
  ),
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
  const biaya = Number(eventValue(event));
  updateNewSub({
    ...newSub.value,
    biaya,
    biayaIDR: convertToIdr(biaya, newSub.value.mataUang),
    kurs: usdToIdrRate.value,
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
  confirmDialog.value = null;
}

</script>
