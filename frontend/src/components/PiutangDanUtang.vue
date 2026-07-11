<template>
  <div class="space-y-6 font-sans">
    <!-- Upper header switch -->
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/80 pb-5"
    >
      <div>
        <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">
          Piutang &amp; Utang Korporasi
        </h1>
        <p class="text-xs text-slate-400 font-light mt-1">
          Kelola siklus piutang usaha (Arus Kas Masuk) dan utang vendor
          penunjang (Arus Kas Keluar) secara detail.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            id="btn-subledger-create"
            class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#102A56] px-4 text-[13px] font-medium text-white shadow-[0_8px_18px_rgba(16,42,86,0.16)] transition hover:bg-[#0B1F42]"
            @click="activeTab === 'receivables' ? openInvoiceForm() : openBillForm()"
          >
            <Plus class="h-4 w-4" /><template v-if="activeTab === 'receivables'"
              >Buat Invoice Baru</template
            ><template v-else>Input Tagihan Baru</template></button
          ><button
            id="btn-subledger-settlement"
            class="inline-flex h-10 items-center gap-2 rounded-xl border border-[#BFE8D6] bg-[#F2FBF7] px-4 text-[13px] font-medium text-[#087A52] transition hover:border-[#8AD7B8] hover:bg-[#E8F8F0]"
            @click="openPaymentModal"
          >
            <Landmark class="h-4 w-4" /><template
              v-if="activeTab === 'receivables'"
              >Catat Pelunasan</template
            ><template v-else>Catat Pembayaran</template>
          </button>
        </div>
      </div>
    </div>
    <!-- 1. PIUTANG USAHA Layout -->
    <div v-if="activeTab === 'receivables'" class="space-y-6">
      <!-- Piutang KPI metrics bar -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          class="flex min-h-[112px] items-center gap-4 rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_10px_28px_rgba(16,42,86,0.045)]"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#1E5AA8]"
          >
            <FileText class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span
              class="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A8CA8]"
              >Total Outstanding Piutang</span
            ><span class="mt-2 block text-xl font-semibold text-[#102A56]">{{
              formatRupiah(totalOutstandingPiutang)
            }}</span
            ><span class="mt-1 block text-xs text-[#6B7A90]"
              >Invoice belum tercatat sebagai pelunasan.</span
            >
          </div>
        </div>
        <div
          class="flex min-h-[112px] items-center gap-4 rounded-2xl border border-[#F7D6DE] bg-[#FFF9FA] p-5 shadow-[0_10px_28px_rgba(16,42,86,0.035)]"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF0F3] text-[#D93858]"
          >
            <AlertTriangle class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span
              class="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#AA6477]"
              >Piutang Overdue</span
            ><span class="mt-2 block text-xl font-semibold text-[#B22D4B]">{{
              formatRupiah(totalOverduePiutang)
            }}</span
            ><span class="mt-1 block text-xs text-[#B86A7C]"
              >Perlu follow-up penagihan segera.</span
            >
          </div>
        </div>
      </div>
      <!-- Invoices listings -->
      <div
        class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
      >
        <div class="p-4 bg-slate-50 border-b border-slate-150">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span class="font-bold text-xs text-[#0B1F4A]"
              >Buku Subledger Piutang Usaha</span
            ><label
              class="flex items-center gap-2 text-[11px] font-bold text-[#53658A]"
              >Filter
              <select
                :value="statusFilter"
                class="h-9 rounded-xl border border-[#D8E5F4] bg-white px-3 text-[11px] font-semibold text-[#0B1F4A] outline-none"
                @change="statusFilter = eventValue($event)"
              >
                <option
                  v-for="option in statusOptions"
                  :key="`inv-filter-${option.value}`"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select></label
            >
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-4">Nomor Invoice</th>
                <th class="p-4">Proyek &amp; Klien Partner</th>
                <th class="p-4">Tanggal Penerbitan</th>
                <th class="p-4">Jatuh Tempo</th>
                <th class="p-4 text-right">Nominal Tagihan</th>
                <th class="p-4 text-center">Status</th>
                <th class="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="inv in pagedInvoices"
                :key="inv.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4 font-mono font-bold text-slate-800 text-sm">
                  {{ inv.nomor }}
                </td>
                <td class="p-4 space-y-1">
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    inv.proyekNama
                  }}</span
                  ><span class="text-[10px] text-slate-400 block font-light">{{
                    inv.klienNama
                  }}</span>
                </td>
                <td class="p-4 font-mono">{{ inv.tanggalKirim }}</td>
                <td class="p-4 font-mono">{{ inv.jatuhTempo }}</td>
                <td
                  class="p-4 text-right font-mono font-bold text-[#0B1F4A] text-sm"
                >
                  {{ formatRupiah(inv.nominal) }}
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : inv.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border border-slate-200' : inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : inv.status === 'Draft' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`"
                    >{{ inv.status }}</span
                  >
                </td>
                <td class="p-4">
                  <div class="flex justify-center gap-1">
                    <template v-if="inv.rawStatus === 'draft'"
                      ><button
                        type="button"
                        :aria-label="`Ubah invoice ${inv.nomor}`"
                        title="Ubah"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-slate-700 transition hover:bg-slate-100"
                        @click="openInvoiceForm(inv)"
                      >
                        <Pencil class="h-3.5 w-3.5" /></button
                      ><button
                        v-if="true"
                        type="button"
                        :aria-label="`Terbitkan invoice ${inv.nomor}`"
                        title="Terbitkan"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100"
                        @click="issueInvoice(inv)"
                      >
                        <Send class="h-3.5 w-3.5" /></button></template
                    ><button
                      v-if="
                        !['paid', 'cancelled'].includes(
                          String(inv.rawStatus || ''),
                        )
                      "
                      type="button"
                      :aria-label="`Batalkan invoice ${inv.nomor}`"
                      title="Batalkan"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                      @click="requestCancelInvoice(inv)"
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
          :page="invoicePage"
          :total="filteredInvoices.length"
          @page-change="invoicePage = safePage($event, filteredInvoices.length)"
        />
      </div>
    </div>
    <!-- 2. UTANG VENDOR Layout -->
    <div v-if="activeTab === 'payables'" class="space-y-6">
      <!-- Utang KPI metrics bar -->
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          class="flex min-h-[112px] items-center gap-4 rounded-2xl border border-[#DCE7F4] bg-white p-5 shadow-[0_10px_28px_rgba(16,42,86,0.045)]"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#C47B00]"
          >
            <Clock class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span
              class="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A8CA8]"
              >Total Outstanding Utang Usaha</span
            ><span class="mt-2 block text-xl font-semibold text-[#102A56]">{{
              formatRupiah(totalOutstandingUtang)
            }}</span
            ><span class="mt-1 block text-xs text-[#6B7A90]"
              >Tagihan vendor yang masih terbuka.</span
            >
          </div>
        </div>
        <div
          class="flex min-h-[112px] items-center gap-4 rounded-2xl border border-[#D7E8FA] bg-[#F7FBFF] p-5 shadow-[0_10px_28px_rgba(16,42,86,0.035)]"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#1E5AA8]"
          >
            <Receipt class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <span
              class="block text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A8CA8]"
              >Tagihan Dalam Periode</span
            ><span class="mt-2 block text-xl font-semibold text-[#102A56]">{{
              formatRupiah(totalOutstandingUtang)
            }}</span
            ><span class="mt-1 block text-xs text-[#6B7A90]"
              >Siap diproses sesuai prioritas jatuh tempo.</span
            >
          </div>
        </div>
      </div>
      <!-- Bills Listings -->
      <div
        class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm"
      >
        <div class="p-4 bg-slate-50 border-b border-slate-150">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <span class="font-bold text-xs text-[#0B1F4A]"
              >Buku Subledger Utang Vendor</span
            ><label
              class="flex items-center gap-2 text-[11px] font-bold text-[#53658A]"
              >Filter
              <select
                :value="statusFilter"
                class="h-9 rounded-xl border border-[#D8E5F4] bg-white px-3 text-[11px] font-semibold text-[#0B1F4A] outline-none"
                @change="statusFilter = eventValue($event)"
              >
                <option
                  v-for="option in statusOptions"
                  :key="`bill-filter-${option.value}`"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select></label
            >
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-4">ID Tagihan</th>
                <th class="p-4">Nama Vendor / Penyedia Layanan</th>
                <th class="p-4">Keterangan Pengeluaran</th>
                <th class="p-4 font-mono">Tgl Tagihan</th>
                <th class="p-4 font-mono">Jatuh Tempo</th>
                <th class="p-4 text-right">Nominal Utang</th>
                <th class="p-4 text-center">Status</th>
                <th class="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="bill in pagedBills"
                :key="bill.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4 font-mono font-bold text-[#0B1F4A]">
                  {{ bill.nomorTagihan }}
                </td>
                <td class="p-4">
                  <span class="font-bold text-slate-800 block text-sm">{{
                    bill.vendor
                  }}</span
                  ><span class="text-[10px] text-slate-400 block font-light"
                    >ID Partner: {{ bill.id }}</span
                  >
                </td>
                <td class="p-4 text-slate-600">{{ bill.keterangan }}</td>
                <td class="p-4 font-mono">{{ bill.tanggalMasuk }}</td>
                <td class="p-4 font-mono">{{ bill.jatuhTempo }}</td>
                <td
                  class="p-4 text-right font-mono font-bold text-slate-800 text-sm"
                >
                  {{ formatRupiah(bill.nominal) }}
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${bill.status === 'Lunas' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : bill.status === 'Cancelled' ? 'bg-slate-100 text-slate-600 border border-slate-200' : bill.status === 'Draft' ? 'bg-sky-50 text-sky-700 border border-sky-200' : bill.status === 'Terlambat' || bill.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-amber-50 text-amber-700 border border-amber-200'}`"
                    >{{ bill.status }}</span
                  >
                </td>
                <td class="p-4">
                  <div class="flex justify-center gap-1">
                    <template v-if="bill.rawStatus === 'draft'"
                      ><button
                        type="button"
                        :aria-label="`Ubah tagihan ${bill.nomorTagihan}`"
                        title="Ubah"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-slate-700 transition hover:bg-slate-100"
                        @click="openBillForm(bill)"
                      >
                        <Pencil class="h-3.5 w-3.5" /></button
                      ><button
                        v-if="true"
                        type="button"
                        :aria-label="`Terbitkan tagihan ${bill.nomorTagihan}`"
                        title="Terbitkan"
                        class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100"
                        @click="issueBill(bill)"
                      >
                        <Send class="h-3.5 w-3.5" /></button></template
                    ><button
                      v-if="
                        !['paid', 'cancelled'].includes(
                          String(bill.rawStatus || ''),
                        )
                      "
                      type="button"
                      :aria-label="`Batalkan tagihan ${bill.nomorTagihan}`"
                      title="Batalkan"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                      @click="requestCancelBill(bill)"
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
          :page="billPage"
          :total="filteredBills.length"
          @page-change="billPage = safePage($event, filteredBills.length)"
        />
      </div>
    </div>
    <!-- 3. INVOICE CREATION MODAL -->
    <div
      v-if="isInvoiceModalOpen"
      class="fixed inset-0 bg-[#000]/50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div
          class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center"
        >
          <div>
            <h3 class="font-extrabold text-sm text-[#0B1F4A]">
              <template v-if="editingInvoice">Ubah Invoice Draft</template
              ><template v-else>Buat Invoice Piutang</template>
            </h3>
            <span class="text-[10px] text-slate-400"
              >Penerbitan tagihan termin kepada mitra klien</span
            >
          </div>
          <button
            id="btn-close-inv-modal"
            class="text-slate-400 hover:text-slate-600 text-xs font-semibold"
            @click="updateIsInvoiceModalOpen(false)"
          >
            Batal
          </button>
        </div>
        <form class="p-6 space-y-4 text-xs" @submit="handleSaveInvoice">
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Nomor Invoice</label
            ><input
              required
              :value="newInvoice.nomor"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
              @change="updateNewInvoice({ ...newInvoice, nomor: eventValue($event) })"
            />
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700"
              >Hubungkan dengan Proyek Aktif</label
            ><select
              id="inv-form-project"
              :value="newInvoice.proyekId"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-slate-800 text-xs"
              @change="updateNewInvoice({ ...newInvoice, proyekId: eventValue($event) })"
            >
              <option v-for="p in proyek" :key="p.id" :value="p.id">
                {{ p.nama }} ({{ formatRupiah(p.nilaiKontrak) }})
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700"
              >Nominal Penagihan Termin (Rupiah)</label
            ><input
              id="inv-form-val"
              type="number"
              required
              :value="newInvoice.nominal"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
              @change="updateNewInvoice({
                    ...newInvoice,
                    nominal: Number(eventValue($event)),
                  })"
            />
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Keterangan Termin</label
            ><input
              :value="newInvoice.keterangan"
              placeholder="Contoh: Termin 1 implementasi"
              class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
              @change="updateNewInvoice({ ...newInvoice, keterangan: eventValue($event) })"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">Tanggal Invoice</label
              ><input
                id="inv-form-date"
                type="date"
                :value="newInvoice.tanggalKirim"
                class="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
                @change="updateNewInvoice({
                      ...newInvoice,
                      tanggalKirim: eventValue($event),
                    })"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">Jatuh Tempo</label
              ><input
                id="inv-form-due"
                type="date"
                required
                :value="newInvoice.jatuhTempo"
                class="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
                @change="updateNewInvoice({
                      ...newInvoice,
                      jatuhTempo: eventValue($event),
                    })"
              />
            </div>
          </div>
          <button
            id="btn-inv-submit"
            type="submit"
            class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow mt-2 transition-all flex items-center justify-center gap-2"
          >
            <FilePlus class="w-4 h-4 text-[#38BDF8]" /> Posting Invoice Piutang
          </button>
        </form>
      </div>
    </div>
    <!-- 4. CLIENT PAYMENT RECEIPT RECORD MODAL -->
    <div
      v-if="isReceiptModalOpen"
      class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white border border-slate-100 rounded-[34px] w-full max-w-[630px] overflow-hidden shadow-2xl"
      >
        <div
          class="px-9 py-8 bg-emerald-50/60 border-b border-emerald-50 flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25"
            >
              <Landmark class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-2xl text-emerald-900 tracking-tight">
              Catat Pelunasan Piutang
            </h3>
          </div>
          <button
            id="btn-close-receipt-modal"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-white/70 transition-colors"
            @click="updateIsReceiptModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form
          class="px-9 py-11 space-y-9 text-sm"
          @submit="handleRecordReceipt"
        >
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Invoice yang Dilunasi</label
            ><select
              id="receipt-form-invoice"
              required
              :value="selectedInvoiceId"
              class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl text-[#111827] font-semibold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600/20"
              @change="selectInvoiceForReceipt(eventValue($event))"
            >
              <option value="">Pilih invoice outstanding</option>
              <option
                v-for="invoice in invoices.filter(isInvoiceOpen)"
                :key="invoice.id"
                :value="invoice.id"
              >
                {{ invoice.nomor }} —
                {{ invoice.klienNama || invoice.proyekNama }} ({{
                  formatRupiah(getInvoiceOutstanding(invoice))
                }})
              </option>
            </select>
          </div>
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Jumlah Diterima</label
            >
            <div class="relative">
              <span
                class="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs"
                >Rp</span
              ><input
                id="receipt-form-amount"
                type="number"
                :min="0"
                :value="receiptAmount || ''"
                class="w-full h-12 pl-14 pr-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600/20 text-[#111827] font-bold text-sm transition-all"
                @input="updateReceiptAmount(Number(eventValue($event)))"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
            <button
              id="btn-receipt-cancel"
              type="button"
              class="h-[66px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-2xl text-sm transition-all"
              @click="updateIsReceiptModalOpen(false)"
            >
              Batal</button
            ><button
              id="btn-receipt-submit"
              type="submit"
              :disabled="!selectedInvoiceId || !invoices.some(isInvoiceOpen)"
              class="h-[66px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" /> Catat Pelunasan
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- 5. VENDOR BILL CREATION MODAL -->
    <div
      v-if="isBillModalOpen"
      class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white border border-slate-100 rounded-[34px] w-full max-w-[630px] overflow-hidden shadow-2xl"
      >
        <div
          class="px-9 py-8 bg-rose-50/60 border-b border-rose-50 flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/25"
            >
              <Plus class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-2xl text-rose-900 tracking-tight">
              Input Tagihan Baru (Bill)
            </h3>
          </div>
          <button
            id="btn-close-bill-modal"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-white/70 transition-colors"
            @click="updateIsBillModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="px-9 py-10 space-y-7 text-sm" @submit="handleSaveBill">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Vendor / Supplier</label
              ><input
                id="bill-form-vendor"
                type="text"
                required
                placeholder="Nama perusahaan vendor..."
                :value="newBill.vendor"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @change="updateNewBill({ ...newBill, vendor: eventValue($event) })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Alokasi Projek</label
              ><select
                id="bill-form-project"
                :value="newBill.alokasiProyek"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-semibold text-sm transition-all"
                @change="updateNewBill({ ...newBill, alokasiProyek: eventValue($event) })"
              >
                <option value="">-- Operasional Umum --</option>
                <option v-for="p in proyek" :key="p.id" :value="p.id">
                  {{ p.nama }}
                </option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >No. Invoice Vendor</label
              ><input
                id="bill-form-number"
                type="text"
                required
                :value="newBill.nomorTagihan"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-mono font-bold text-sm transition-all"
                @change="updateNewBill({ ...newBill, nomorTagihan: eventValue($event) })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Tgl Tagihan</label
              >
              <div class="relative">
                <input
                  id="bill-form-date"
                  type="date"
                  :value="newBill.tanggalMasuk"
                  class="w-full h-12 px-5 pr-11 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-bold text-sm transition-all"
                  @change="updateNewBill({ ...newBill, tanggalMasuk: eventValue($event) })"
                /><Calendar
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                />
              </div>
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-rose-600 uppercase"
                >Batas Bayar (Alert)</label
              >
              <div class="relative">
                <input
                  id="bill-form-due"
                  type="date"
                  required
                  :value="newBill.jatuhTempo"
                  class="w-full h-12 px-5 pr-11 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-bold text-sm transition-all"
                  @change="updateNewBill({ ...newBill, jatuhTempo: eventValue($event) })"
                /><Calendar
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                />
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Nominal Hutang</label
            >
            <div class="relative">
              <span
                class="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs"
                >Rp</span
              ><input
                id="bill-form-val"
                type="number"
                required
                :min="0"
                :value="newBill.nominal || ''"
                class="w-full h-14 pl-14 pr-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-bold text-sm transition-all"
                @change="updateNewBill({
                      ...newBill,
                      nominal: Number(eventValue($event)),
                    })"
              />
            </div>
          </div>
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Keterangan Tagihan</label
            ><textarea
              id="bill-form-desc"
              required
              placeholder="Detail pengadaan barang/jasa..."
              :value="newBill.keterangan"
              class="w-full min-h-[88px] px-5 py-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-600/20 text-[#111827] font-semibold text-sm placeholder:text-[#94A3B8] transition-all resize-y"
              @change="updateNewBill({ ...newBill, keterangan: eventValue($event) })"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 pt-1">
            <button
              id="btn-bill-cancel"
              type="button"
              class="h-[52px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-2xl text-sm transition-all"
              @click="updateIsBillModalOpen(false)"
            >
              Batal</button
            ><button
              id="btn-bill-submit"
              type="submit"
              class="h-[52px] bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" /> Simpan Tagihan
            </button>
          </div>
        </form>
      </div>
    </div>
    <!-- 6. PAY VENDOR BILL MODAL -->
    <div
      v-if="isPayBillModalOpen"
      class="fixed inset-0 bg-[#0B1220]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white border border-slate-100 rounded-[34px] w-full max-w-[630px] overflow-hidden shadow-2xl"
      >
        <div
          class="px-9 py-8 bg-indigo-50/60 border-b border-indigo-50 flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-[#5146E8] text-white flex items-center justify-center shadow-lg shadow-[#5146E8]/25"
            >
              <CreditCard class="w-5 h-5" />
            </div>
            <h3 class="font-extrabold text-2xl text-indigo-900 tracking-tight">
              Catat Pembayaran Vendor
            </h3>
          </div>
          <button
            id="btn-close-pay-modal"
            class="w-10 h-10 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-slate-600 hover:bg-white/70 transition-colors"
            @click="updateIsPayBillModalOpen(false)"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <form class="px-9 py-10 space-y-7 text-sm" @submit="handlePayBill">
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Tagihan yang Dibayar</label
            ><select
              id="pay-form-bill"
              required
              :value="selectedBillId"
              class="w-full h-12 px-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl text-[#111827] font-semibold text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20"
              @change="selectBillForPayment(eventValue($event))"
            >
              <option value="">Pilih tagihan vendor outstanding</option>
              <option
                v-for="bill in bills.filter(isBillOpen)"
                :key="bill.id"
                :value="bill.id"
              >
                {{ bill.nomorTagihan }} — {{ bill.vendor }} ({{
                  formatRupiah(getBillOutstanding(bill))
                }})
              </option>
            </select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Vendor Penerima</label
              ><input
                id="pay-form-vendor"
                type="text"
                placeholder="Nama vendor..."
                :value="paymentForm.vendor"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-bold text-sm placeholder:text-[#94A3B8] transition-all"
                @change="updatePaymentForm({ ...paymentForm, vendor: eventValue($event) })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Sumber Kas / Bank</label
              ><select
                id="pay-form-bank"
                :value="paymentAccount"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-semibold text-sm transition-all"
                @change="updatePaymentAccount(eventValue($event))"
              >
                <option value="1001">Bank (1110)</option>
                <option
                  v-for="a in paymentAssetAccounts"
                  :key="a.id"
                  :value="a.kode"
                >
                  {{ a.nama }} ({{ a.kode }})
                </option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >No. Bukti Bayar</label
              ><input
                id="pay-form-proof"
                type="text"
                :value="paymentForm.buktiBayar"
                class="w-full h-12 px-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-mono font-bold text-sm transition-all"
                @change="updatePaymentForm({
                      ...paymentForm,
                      buktiBayar: eventValue($event),
                    })"
              />
            </div>
            <div class="space-y-3">
              <label
                class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
                >Tanggal Bayar</label
              >
              <div class="relative">
                <input
                  id="pay-form-date"
                  type="date"
                  :value="paymentForm.tanggalBayar"
                  class="w-full h-12 px-5 pr-11 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-bold text-sm transition-all"
                  @change="updatePaymentForm({
                        ...paymentForm,
                        tanggalBayar: eventValue($event),
                      })"
                /><Calendar
                  class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#111827]"
                />
              </div>
            </div>
          </div>
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Jumlah Dibayar (Rp)</label
            >
            <div class="relative">
              <span
                class="absolute left-5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs"
                >Rp</span
              ><input
                id="pay-form-amount"
                type="number"
                :min="0"
                :value="paymentForm.jumlah || ''"
                class="w-full h-14 pl-14 pr-5 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-bold text-sm transition-all"
                @change="updatePaymentForm({
                      ...paymentForm,
                      jumlah: Number(eventValue($event)),
                    })"
              />
            </div>
          </div>
          <div class="space-y-3">
            <label
              class="text-[10px] font-extrabold tracking-widest text-[#94A3B8] uppercase"
              >Catatan Tambahan</label
            ><textarea
              id="pay-form-note"
              placeholder="Contoh: Pembayaran invoice bulan lalu..."
              :value="paymentForm.catatan"
              class="w-full min-h-[86px] px-5 py-4 bg-[#F8FAFC] border border-[#D8E5F4] rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5146E8]/20 text-[#111827] font-semibold text-sm placeholder:text-[#94A3B8] transition-all resize-y"
              @change="updatePaymentForm({ ...paymentForm, catatan: eventValue($event) })"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 pt-1">
            <button
              id="btn-pay-cancel"
              type="button"
              class="h-[52px] border border-[#D8E5F4] hover:bg-slate-50 text-[#1F2A44] font-bold rounded-2xl text-sm transition-all"
              @click="updateIsPayBillModalOpen(false)"
            >
              Batal</button
            ><button
              id="btn-pay-submit"
              type="submit"
              :disabled="!selectedBillId"
              class="h-[52px] bg-[#5146E8] hover:bg-[#4338CA] disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-[#5146E8]/20 transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" /> Selesaikan Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
    <ConfirmDialog
      :open="!!cancelConfirm"
      eyebrow="Konfirmasi Pembatalan"
      :title="cancelConfirm?.title || 'Batalkan dokumen?'"
      :message="cancelConfirm?.message || ''"
      :details="cancelConfirm?.details || []"
      :impact-items="[
        'Status dokumen akan berubah menjadi cancelled.',
        'Dokumen tidak lagi dihitung sebagai outstanding.',
      ]"
      :confirm-label="cancelConfirm?.confirmLabel || 'Batalkan Dokumen'"
      require-reason
      :reason-label="cancelConfirm?.reasonLabel || 'Alasan Pembatalan'"
      :reason-placeholder="
        cancelConfirm?.reasonPlaceholder || 'Tulis alasan singkat...'
      "
      :on-cancel="closeCancelConfirm"
      :on-confirm="confirmCancelDocument"
    />
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, ref, watch } from "vue";
import {
  Plus,
  FileText,
  Landmark,
  Clock,
  AlertTriangle,
  Receipt,
  Trash2,
  Pencil,
  Send,
  Calendar,
  FilePlus,
  X,
  Save,
  CreditCard,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import { Proyek, Klien, AkunBukuBesar } from "../types.ts";
import ConfirmDialog from "./common/ConfirmDialog.vue";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface Invoice {
  id: string;
  nomor: string;
  proyekNama: string;
  klienNama: string;
  nominal: number;
  tanggalKirim: string;
  jatuhTempo: string;
  status: "Unpaid" | "Overdue" | "Paid";
}
interface TagihanVendor {
  id: string;
  vendor: string;
  nomorTagihan: string;
  keterangan: string;
  nominal: number;
  tanggalMasuk: string;
  jatuhTempo: string;
  status: "Belum Bayar" | "Lunas" | "Terlambat" | "Overdue";
}
interface PiutangDanUtangProps {
  activeSection: "piutang" | "utang";
  proyek: Proyek[];
  klien: Klien[];
  akun: AkunBukuBesar[];
  invoices: Invoice[];
  bills: TagihanVendor[];
}

const props = defineProps<PiutangDanUtangProps>();
const { activeSection, proyek }: PiutangDanUtangProps = props;

const {
  notify,
  receivables: {
    createInvoice,
    updateInvoice,
    issueInvoice,
    cancelInvoice,
    recordInvoicePayment,
    createBill,
    updateBill,
    issueBill,
    cancelBill,
    payBill,
  },
} = useFinStartContext();
const activeTab = activeSection === "piutang" ? "receivables" : "payables";
const todayIso = () => new Date().toISOString().slice(0, 10);
const datePlusDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const newReferenceNumber = (prefix: string, sequence = 1) =>
  `${prefix}/${new Date().getFullYear()}/${String(sequence).padStart(3, "0")}`;

// Data piutang dan utang disuplai dari backend melalui App.vue.
// Komponen ini hanya mempertahankan modal dan tata letak UI desain asli.
const invoices = ref<any[]>(props.invoices || []);
const bills = ref<any[]>(props.bills || []);
watch(
  () => props.invoices,
  (next) => {
    invoices.value = Array.isArray(next) ? next : [];
  },
  { deep: true },
);
watch(
  () => props.bills,
  (next) => {
    bills.value = Array.isArray(next) ? next : [];
  },
  { deep: true },
);
const isInvoiceModalOpen = ref(false),
  updateIsInvoiceModalOpen = (next) => (isInvoiceModalOpen.value = next);
const isReceiptModalOpen = ref(false),
  updateIsReceiptModalOpen = (next) => (isReceiptModalOpen.value = next);
const isBillModalOpen = ref(false),
  updateIsBillModalOpen = (next) => (isBillModalOpen.value = next);
const isPayBillModalOpen = ref(false),
  updateIsPayBillModalOpen = (next) => (isPayBillModalOpen.value = next);
const editingInvoice = ref<any>(null);
const editingBill = ref<any>(null);
const cancelConfirm = ref<any>(null); // New Invoice form input
const statusFilter = ref("open");
const invoicePage = ref(1);
const billPage = ref(1);
const statusOptions = [
  { value: "open", label: "Outstanding" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid / Lunas" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "Semua Status" },
];
const newInvoice = ref({
    proyekId: proyek[0]?.id || "",
    nomor: newReferenceNumber("INV"),
    keterangan: "",
    nominal: 120000000,
    tanggalKirim: new Date().toISOString().split("T")[0],
    jatuhTempo: "",
  }),
  updateNewInvoice = (next) => (newInvoice.value = next); // Record Client Receipt form input
const selectedInvoiceId = ref(""),
  updateSelectedInvoiceId = (next) => (selectedInvoiceId.value = next);
const receiptAccount = ref("1001");
const receiptAmount = ref(0),
  updateReceiptAmount = (next) => (receiptAmount.value = next); // New Vendor Bill form input
const newBill = ref({
    vendor: "",
    nomorTagihan: newReferenceNumber("BILL"),
    alokasiProyek: "",
    keterangan: "",
    nominal: 0,
    tanggalMasuk: todayIso(),
    jatuhTempo: datePlusDays(7),
  }),
  updateNewBill = (next) => (newBill.value = next); // Pay Vendor Bill form input
const requestCancelInvoice = (invoice: any) => {
  cancelConfirm.value = {
    type: "invoice",
    item: invoice,
    title: "Batalkan invoice?",
    message:
      "Invoice akan ditandai cancelled dan tidak lagi masuk daftar outstanding.",
    details: [
      { label: "Nomor", value: invoice.nomor || "-" },
      { label: "Klien", value: invoice.klienNama || "-" },
      { label: "Nominal", value: formatRupiah(invoice.nominal || 0) },
    ],
    confirmLabel: "Batalkan Invoice",
    reasonLabel: "Alasan Pembatalan",
    reasonPlaceholder: "Contoh: Invoice diganti dengan revisi terbaru",
  };
};
const requestCancelBill = (bill: any) => {
  cancelConfirm.value = {
    type: "bill",
    item: bill,
    title: "Batalkan tagihan vendor?",
    message:
      "Tagihan akan ditandai cancelled dan tidak lagi masuk daftar utang outstanding.",
    details: [
      { label: "Nomor", value: bill.nomorTagihan || "-" },
      { label: "Vendor", value: bill.vendor || "-" },
      { label: "Nominal", value: formatRupiah(bill.nominal || 0) },
    ],
    confirmLabel: "Batalkan Tagihan",
    reasonLabel: "Alasan Pembatalan",
    reasonPlaceholder: "Contoh: Tagihan dibatalkan vendor",
  };
};
const confirmCancelDocument = async (reason = "") => {
  const action = cancelConfirm.value;
  if (!action) return;
  cancelConfirm.value = null;
  if (action.type === "invoice") {
    await cancelInvoice(action.item, reason);
    return;
  }
  if (action.type === "bill") {
    await cancelBill(action.item, reason);
  }
};
const selectedBillId = ref(""),
  updateSelectedBillId = (next) => (selectedBillId.value = next);
const paymentAccount = ref("1001"),
  updatePaymentAccount = (next) => (paymentAccount.value = next);
const paymentForm = ref({
    vendor: "",
    buktiBayar: newReferenceNumber("PAY"),
    tanggalBayar: todayIso(),
    jumlah: 0,
    catatan: "",
  }),
  updatePaymentForm = (next) => (paymentForm.value = next); // Handle invoice submission
const openInvoiceForm = (invoice: any = null) => {
  editingInvoice.value = invoice;
  if (invoice) {
    newInvoice.value = {
      proyekId: invoice?._raw?.project_id
        ? String(invoice._raw.project_id)
        : "",
      nomor: invoice.nomor || "",
      keterangan: invoice?._raw?.notes || "",
      nominal: Number(invoice?._raw?.dpp_amount ?? invoice.nominal ?? 0),
      tanggalKirim: invoice.tanggalKirim || todayIso(),
      jatuhTempo: invoice.jatuhTempo || todayIso(),
    };
  } else {
    newInvoice.value = {
      proyekId: proyek[0]?.id || "",
      nomor: newReferenceNumber("INV", invoices.value.length + 1),
      keterangan: "",
      nominal: 0,
      tanggalKirim: todayIso(),
      jatuhTempo: datePlusDays(14),
    };
  }
  updateIsInvoiceModalOpen(true);
};
const handleSaveInvoice = async (e: Event) => {
  e.preventDefault();
  const projObj = proyek.find(
    (p) => String(p.id) === String(newInvoice.value.proyekId),
  );
  if (!projObj) {
    notify("Harap pilih proyek terlebih dahulu.");
    return;
  }
  if (editingInvoice.value)
    await updateInvoice(editingInvoice.value, { ...newInvoice.value });
  else await createInvoice({ ...newInvoice.value });
  editingInvoice.value = null;
  updateIsInvoiceModalOpen(false);
};

const getInvoiceOutstanding = (invoice: any) =>
  Number(invoice?.outstandingAmount ?? invoice?.nominal ?? 0);
const getBillOutstanding = (bill: any) =>
  Number(bill?.outstandingAmount ?? bill?.nominal ?? 0);
const isInvoiceOpen = (invoice: any) =>
  !["paid", "cancelled", "draft"].includes(
    String(invoice?.rawStatus || invoice?.status || "").toLowerCase(),
  ) && getInvoiceOutstanding(invoice) > 0;
const isBillOpen = (bill: any) =>
  !["paid", "cancelled", "draft"].includes(
    String(bill?.rawStatus || bill?.status || "").toLowerCase(),
  ) && getBillOutstanding(bill) > 0;
const normalizedStatus = (item: any) => {
  const status = String(item?.rawStatus || item?.status || "").toLowerCase();
  if (["paid", "lunas", "sudah bayar"].includes(status)) return "paid";
  if (["overdue", "terlambat"].includes(status)) return "overdue";
  if (status === "draft") return "draft";
  if (status === "cancelled" || status === "canceled") return "cancelled";
  return "open";
};
const matchesStatusFilter = (item: any, isOpen: (_row: any) => boolean) => {
  if (statusFilter.value === "all") return true;
  if (statusFilter.value === "open") return isOpen(item);
  return normalizedStatus(item) === statusFilter.value;
};

const selectInvoiceForReceipt = (invoiceId: string) => {
  const invoice = invoices.value.find(
    (item) => String(item.id) === String(invoiceId),
  );
  updateSelectedInvoiceId(invoice?.id || "");
  updateReceiptAmount(invoice ? getInvoiceOutstanding(invoice) : 0);
};

const selectBillForPayment = (billId: string) => {
  const bill = bills.value.find((item) => String(item.id) === String(billId));
  updateSelectedBillId(bill?.id || "");
  updatePaymentForm({
    ...paymentForm.value,
    vendor: bill?.vendor || "",
    jumlah: bill ? getBillOutstanding(bill) : 0,
  });
};

const handleRecordReceipt = async (e: Event) => {
  e.preventDefault();
  const targetInv = invoices.value.find(
    (i) => String(i.id) === String(selectedInvoiceId.value),
  );
  if (!targetInv) {
    notify("Pilih invoice yang akan dilunasi terlebih dahulu.");
    return;
  }
  await recordInvoicePayment(targetInv, {
    accountCode: receiptAccount.value,
    amount: receiptAmount.value || getInvoiceOutstanding(targetInv),
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    notes: "",
  });
  updateIsReceiptModalOpen(false);
};

const openBillForm = (bill: any = null) => {
  editingBill.value = bill;
  if (bill) {
    newBill.value = {
      vendor: bill.vendor || "",
      nomorTagihan: bill.nomorTagihan || "",
      alokasiProyek: String(bill.projectId || ""),
      keterangan: bill.keterangan === "-" ? "" : bill.keterangan,
      nominal: Number(bill?._raw?.dpp_amount ?? bill.nominal ?? 0),
      tanggalMasuk: bill.tanggalMasuk || todayIso(),
      jatuhTempo: bill.jatuhTempo || datePlusDays(7),
    };
  } else {
    newBill.value = {
      vendor: "",
      nomorTagihan: newReferenceNumber("BILL", bills.value.length + 1),
      alokasiProyek: "",
      keterangan: "",
      nominal: 0,
      tanggalMasuk: todayIso(),
      jatuhTempo: datePlusDays(7),
    };
  }
  updateIsBillModalOpen(true);
};
const handleSaveBill = async (e: Event) => {
  e.preventDefault();
  if (!newBill.value.vendor || !newBill.value.keterangan) {
    notify("Harap isi nama vendor dan rincian tagihan.");
    return;
  }
  if (editingBill.value)
    await updateBill(editingBill.value, { ...newBill.value });
  else await createBill({ ...newBill.value });
  editingBill.value = null;
  updateIsBillModalOpen(false);
};

const handlePayBill = async (e: Event) => {
  e.preventDefault();
  const targetBill = bills.value.find(
    (b) => String(b.id) === String(selectedBillId.value),
  );
  if (!targetBill) {
    notify("Pilih tagihan vendor yang akan dibayar terlebih dahulu.");
    return;
  }
  await payBill(targetBill, {
    accountCode: paymentAccount.value,
    amount: paymentForm.value.jumlah || getBillOutstanding(targetBill),
    paymentDate: paymentForm.value.tanggalBayar,
    referenceNumber: paymentForm.value.buktiBayar,
    notes: paymentForm.value.catatan,
  });
  updateIsPayBillModalOpen(false);
};

// Calculations for KPI Cards
// Gunakan saldo tersisa dari API agar invoice/tagihan yang dibayar sebagian tetap akurat.
const receivableBalance = getInvoiceOutstanding;
const payableBalance = getBillOutstanding;
const totalOutstandingPiutang = computed(() =>
  invoices.value
    .filter(isInvoiceOpen)
    .reduce((acc, i) => acc + receivableBalance(i), 0),
);
const totalOverduePiutang = computed(() =>
  invoices.value
    .filter((i) => normalizedStatus(i) === "overdue")
    .reduce((acc, i) => acc + receivableBalance(i), 0),
);
const totalOutstandingUtang = computed(() =>
  bills.value.filter(isBillOpen).reduce((acc, b) => acc + payableBalance(b), 0),
);
const filteredInvoices = computed(() =>
  latestFirst(
    invoices.value.filter((invoice) =>
      matchesStatusFilter(invoice, isInvoiceOpen),
    ),
  ),
);
const filteredBills = computed(() =>
  latestFirst(
    bills.value.filter((bill) => matchesStatusFilter(bill, isBillOpen)),
  ),
);
const pagedInvoices = computed(() =>
  pageRows(filteredInvoices.value, invoicePage.value),
);
const pagedBills = computed(() =>
  pageRows(filteredBills.value, billPage.value),
);
function openPaymentModal() {
  if (activeTab === "receivables") {
    updateSelectedInvoiceId("");
    updateReceiptAmount(0);
    updateIsReceiptModalOpen(true);
    return;
  }

  updateSelectedBillId("");
  updatePaymentForm({
    vendor: "",
    buktiBayar: `PAY/${new Date().getFullYear()}/001`,
    tanggalBayar: new Date().toISOString().slice(0, 10),
    jumlah: 0,
    catatan: "",
  });
  updateIsPayBillModalOpen(true);
}

const paymentAssetAccounts = computed(() =>
  (props.akun || []).filter(
    (account) => account.tipe === "Aset" && account.kode !== "1001",
  ),
);

function closeCancelConfirm() {
  cancelConfirm.value = null;
}

</script>
