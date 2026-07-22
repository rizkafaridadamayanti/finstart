<template>
  <div class="space-y-6">
    <!-- Upper action header -->
    <div
      class="workspace-page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
    >
      <div>
        <h1 class="text-xl font-extrabold text-[#0B1F4A] tracking-tight">
          Buku Besar &amp; Entri Jurnal
        </h1>
        <p class="text-xs text-slate-400 font-light mt-1">
          Kelola Chart of Accounts (COA), buat draft jurnal, lalu lakukan
          approval dan posting sesuai role.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button
          id="btn-open-modal-primary"
          class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow shadow-blue-900 transition-all shrink-0"
          @click="activeTab === 'ledger'
                ? openAccountForm()
                : openJournalModal()"
        >
          <Plus class="w-4 h-4" /><template v-if="activeTab === 'ledger'"
            >Tambah Akun COA</template
          ><template v-else>Jurnal Umum</template>
        </button>
      </div>
    </div>
    <!-- 1. CHART OF ACCOUNTS view -->
    <div v-if="activeTab === 'ledger'" class="space-y-4">
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
              id="ledger-search-box"
              type="text"
              :value="ledgerSearch"
              placeholder="Cari kode atau nama akun..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateLedgerSearch(eventValue($event))"
            />
          </div>
          <div class="flex flex-col items-start gap-1.5 lg:items-end">
            <span class="text-xs text-[#6B7A90]"
              >Menampilkan {{ filteredLedgers.length }} akun</span
            >
            <div class="flex flex-wrap items-center justify-end gap-2">
              <span class="text-xs text-[#6B7A90]"
                ><Filter class="mr-1 inline h-3.5 w-3.5" />Tipe:</span
              ><button
                v-for="type in LEDGER_TYPE_FILTERS"
                :id="`ledger-type-filter-${type}`"
                :key="type"
                :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition ${ledgerTypeFilter === type ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
                @click="setLedgerTypeFilter(type)"
              >
                {{ type }}
              </button>
            </div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table
            class="w-full text-left text-xs text-slate-500"
            style="table-layout: fixed"
          >
            <colgroup>
              <col style="width: 11%" />
              <col style="width: 29%" />
              <col style="width: 14%" />
              <col style="width: 18%" />
              <col style="width: 12%" />
              <col style="width: 16%" />
            </colgroup>
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-4">Kode Akun</th>
                <th class="p-4">Nama Akun Buku Besar</th>
                <th class="p-4 text-center">Tipe Klasifikasi</th>
                <th class="p-4 text-right">Saldo Berjalan</th>
                <th class="p-4 text-center">Status</th>
                <th class="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr
                v-for="item in pagedLedgers"
                :key="item.id"
                class="hover:bg-slate-50 transition-colors"
              >
                <td class="p-4 font-mono font-bold text-slate-700 text-sm">
                  {{ item.kode }}
                </td>
                <td class="p-4">
                  <span
                    class="block truncate font-bold text-[#0B1F4A] text-sm"
                    :title="item.nama"
                    >{{ item.nama }}</span
                  >
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${item.tipe === 'Aset' ? 'bg-blue-50 text-blue-700' : item.tipe === 'Kewajiban' ? 'bg-rose-50 text-rose-700' : item.tipe === 'Modal' ? 'bg-purple-50 text-purple-700' : item.tipe === 'Pendapatan' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`"
                    >{{ item.tipe }}</span
                  >
                </td>
                <td
                  class="p-4 text-right font-mono font-bold text-slate-800 text-sm"
                >
                  {{ formatRupiah(item.saldo) }}
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="`${String(item.status || item._raw?.status || 'active') === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'} text-[9px] px-1.5 py-0.5 rounded font-mono font-bold`"
                    ><template
                      v-if="
                        String(item.status || item._raw?.status || 'active') ===
                        'active'
                      "
                      >Aktif</template
                    ><template v-else>Nonaktif</template></span
                  >
                </td>
                <td class="p-4">
                  <div class="flex justify-center gap-1">
                    <button
                      type="button"
                      :aria-label="`Detail akun ${item.nama}`"
                      title="Detail"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] bg-white text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click.stop="openAccountDetail(item)"
                    >
                      <Eye class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Ubah akun ${item.nama}`"
                      title="Ubah"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#D8E5F4] text-[#0B1F4A] transition hover:bg-[#F8FBFE]"
                      @click="openAccountForm(item)"
                    >
                      <Pencil class="h-3.5 w-3.5" /></button
                    ><button
                      type="button"
                      :aria-label="`Hapus akun ${item.nama}`"
                      title="Hapus"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                      @click="deleteAccount(item)"
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
          :page="ledgerPage"
          :total="filteredLedgers.length"
          @page-change="ledgerPage = safePage($event, filteredLedgers.length)"
        />
      </div>
    </div>
    <!-- 2. JURNAL TRANSAKSI view -->
    <div v-if="activeTab === 'journal'" class="space-y-4">
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
              id="journal-search-box"
              type="text"
              :value="journalSearch"
              placeholder="Cari keterangan memo atau voucher..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateJournalSearch(eventValue($event))"
            />
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2">
            <span class="text-xs text-[#6B7A90]"
              ><Filter class="mr-1 inline h-3.5 w-3.5" />Status:</span
            ><button
              v-for="statusOption in JOURNAL_STATUS_FILTERS"
              :id="`journal-status-filter-${statusOption}`"
              :key="statusOption"
              :class="`h-9 rounded-lg px-3 text-[11px] font-medium transition ${journalStatusFilter === statusOption ? 'bg-[#0B1F4A] text-white' : 'border border-[#DCE7F4] bg-white text-[#64748B] hover:bg-[#F8FBFE]'}`"
              @click="setJournalStatusFilter(statusOption)"
            >
              {{ statusOption }}
            </button>
            <span class="text-xs text-[#6B7A90]"
              ><Calendar class="mr-1 inline h-3.5 w-3.5" />Tanggal:</span
            ><input
              id="journal-date-box"
              ref="journalDatePickerRef"
              type="date"
              :value="journalDate"
              class="h-10 cursor-pointer rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]"
              @click="openJournalDatePicker"
              @focus="openJournalDatePicker"
              @input="updateJournalDate(eventValue($event))"
              @change="updateJournalDate(eventValue($event))"
            /><button
              v-if="journalDate"
              class="h-9 rounded-lg px-2 text-xs font-medium text-[#1E5AA8]"
              @click="updateJournalDate('')"
            >
              Reset
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-4">Tanggal</th>
                <th class="p-4">Ref. Voucher</th>
                <th class="p-4">Keterangan Memo Transaksi</th>
                <th class="p-4">Alokasi Debit/Kredit</th>
                <th class="p-4 text-right">Nominal</th>
                <th class="p-4 text-center">Status</th>
                <th class="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-150">
              <tr v-if="filteredJournals.length === 0">
                <td
                  :colspan="7"
                  class="p-12 text-center text-slate-400 font-light"
                >
                  Tidak ada transaksi keuangan yang sesuai dengan pencarian.
                </td>
              </tr>
              <template v-else
                ><tr
                  v-for="t in pagedJournals"
                  :key="t.id"
                  class="hover:bg-slate-50 transition-colors"
                >
                  <td class="p-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                    {{ t.tanggal }}
                  </td>
                  <td class="p-4 font-mono font-bold text-[#0B1F4A] whitespace-nowrap">
                    {{ t.refVoucher }}
                  </td>
                  <td class="p-4">
                    <span class="font-bold text-slate-800 block text-sm">
                      {{ t.keterangan }}
                    </span>
                    <span
                      v-if="t.source_label"
                      :class="`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${t.source_badge_class || 'bg-slate-50 text-slate-600 border-slate-100'}`"
                    >
                      {{ t.source_label }}
                    </span>
                    <span
                      v-if="t.party_name"
                      class="text-[10px] text-slate-400 block font-light"
                    >
                      {{ t.party_name }}
                    </span>
                    <span class="text-[10px] text-slate-400 block font-light">
                      Ref ID: {{ t.id }}
                    </span>
                  </td>
                  <td class="p-4 text-[10px] space-y-1">
                    <span class="block text-emerald-600 font-bold font-mono"
                      >Dr {{ t.debitAkun }} -
                      {{ accountNameByCode(t.debitAkun) }}</span
                    ><span class="block text-slate-400 font-bold font-mono"
                      >Cr {{ t.kreditAkun }} -
                      {{ accountNameByCode(t.kreditAkun) }}</span
                    >
                  </td>
                  <td
                    class="p-4 text-right font-mono font-bold text-[#0B1F4A] text-sm whitespace-nowrap"
                  >
                    {{ formatRupiah(t.nominal) }}
                  </td>
                  <td class="p-4 text-center">
                    <span
                      :class="`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${getJournalStatusColor(t.status)}`"
                      >{{ getJournalStatusDisplay(t.status) }}</span
                    >
                  </td>
                  <td class="p-4">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <template v-if="!t.source_type || t.source_type === 'manual'">
                        <button
                          v-if="t.journal_status === 'draft' && ['admin', 'administrator', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase())"
                          type="button"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-sky-100 bg-sky-50 text-sky-700 transition hover:bg-sky-100"
                          title="Setujui jurnal draft"
                          @click="approveJournal(t)"
                        >
                          <ShieldCheck class="w-3.5 h-3.5" />
                        </button>
                        <button
                          v-if="t.journal_status !== null && t.journal_status !== 'posted' && !['cancelled', 'canceled', 'rejected'].includes(String(t.journal_status || '')) && ['admin', 'administrator', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase())"
                          type="button"
                          class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                          title="Posting jurnal"
                          @click="postJournal(t)"
                        >
                          <Send class="w-3.5 h-3.5" />
                        </button>
                      </template>
                      <button
                        v-if="t.journal_status !== null && !['cancelled', 'canceled', 'rejected'].includes(String(t.journal_status || '').toLowerCase()) && ['admin', 'administrator', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase()) && (!t.source_type || t.source_type === 'manual')"
                        type="button"
                        class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                        title="Hapus jurnal"
                        @click="requestCancelJournal(t)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#0B1F4A] hover:bg-slate-100 transition-colors"
                        title="Cetak Bukti Jurnal"
                        @click="downloadJournalVoucher(t)"
                      >
                        <Download class="w-3 h-3" />
                      </button>
                    </div>
                  </td></tr
              ></template>
            </tbody>
          </table>
        </div>
        <TablePagination
          :page="journalPage"
          :total="filteredJournals.length"
          @page-change="journalPage = safePage($event, filteredJournals.length)"
        />
      </div>
    </div>
    <!-- 3. COA ADD ACCOUNT MODAL -->
    <Teleport to="body">
    <div
      v-if="isAccountModalOpen"
      class="account-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="account-form-modal-card bg-white border border-slate-200 rounded-3xl w-full max-w-[720px] overflow-hidden shadow-2xl"
      >
        <div
          class="p-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center"
        >
          <div>
            <h3 class="font-extrabold text-sm text-[#0B1F4A]">
              <template v-if="editingAccount">Ubah Akun COA</template
              ><template v-else>Tambah Akun COA Baru</template>
            </h3>
            <span class="text-[10px] text-slate-400"
              ><template v-if="editingAccount"
                >Perbarui status dan struktur akun dengan aman</template
              ><template v-else
                >Daftarkan akun ledger keuangan baru</template
              ></span
            >
          </div>
          <button
            id="btn-close-account-modal"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-600"
            aria-label="Tutup form akun"
            @click="closeAccountModal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form
          novalidate
          data-manual-validation="true"
          class="p-6 space-y-4 text-xs"
          @submit="handleSaveAccount"
        >
          <div
            v-if="accountFormErrorMessages.length"
            class="form-validation-summary"
            role="alert"
          >
            <strong>Lengkapi seluruh data akun.</strong>
            <span>Semua kolom wajib diisi sebelum akun buku besar disimpan.</span>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Kode Akun (Kode COA)</label
            ><input
              id="acc-form-code"
              type="text"
              required
              :readonly="!editingAccount"
              :disabled="!editingAccount"
              placeholder="Contoh: 1102, 5004"
              :value="
                editingAccount
                  ? newAccount.kode
                  : nextAccountCodePreview || 'Memuat kode...'
              "
              :class="[
                accountInputClass,
                !editingAccount && 'cursor-not-allowed bg-slate-100 text-slate-500',
                { 'form-control-invalid': accountFormErrors.kode },
              ]"
              @input="setAccountField('kode', eventValue($event))"
            />
            <p v-if="accountFormErrors.kode" class="form-field-warning">
              {{ accountFormErrors.kode }}
            </p>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Nama Akun Buku Besar</label
            ><input
              id="acc-form-name"
              type="text"
              required
              placeholder="Contoh: Beban Perjalanan Dinas"
              :value="newAccount.nama"
              :class="[
                accountInputClass,
                { 'form-control-invalid': accountFormErrors.nama },
              ]"
              @input="setAccountField('nama', eventValue($event))"
            />
            <p v-if="accountFormErrors.nama" class="form-field-warning">
              {{ accountFormErrors.nama }}
            </p>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Tipe Klasifikasi Akun</label
            ><select
              id="acc-form-type"
              required
              :value="newAccount.tipe"
              :class="[
                accountInputClass,
                'text-slate-800',
                { 'form-control-invalid': accountFormErrors.tipe },
              ]"
              @change="setAccountField('tipe', eventValue($event))"
            >
              <option value="Aset">Aset</option>
              <option value="Kewajiban">Kewajiban (Utang)</option>
              <option value="Modal">Modal (Ekuitas)</option>
              <option value="Pendapatan">Pendapatan</option>
              <option value="Beban">Beban Operasional</option>
            </select>
            <p v-if="accountFormErrors.tipe" class="form-field-warning">
              {{ accountFormErrors.tipe }}
            </p>
          </div>
          <div v-if="editingAccount" class="space-y-1.5">
            <label class="font-bold text-slate-700">Status</label
            ><select
              id="acc-form-status"
              required
              :value="newAccount.status"
              :class="[
                accountInputClass,
                { 'form-control-invalid': accountFormErrors.status },
              ]"
              @change="setAccountField('status', eventValue($event))"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <p v-if="accountFormErrors.status" class="form-field-warning">
              {{ accountFormErrors.status }}
            </p>
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Saldo Awal (Rupiah)</label>
            <div class="currency-input relative">
              <span
                class="pointer-events-none absolute left-5 top-1/2 z-[2] w-8 -translate-y-1/2 text-left text-[#94A3B8] font-extrabold text-xs"
                >Rp</span
              ><input
                id="acc-form-val"
                type="text"
                inputmode="numeric"
                required
                :value="accountOpeningBalanceInputValue"
                style="padding-left: 3.75rem !important"
                :class="[
                  accountInputClass,
                  'font-mono',
                  { 'form-control-invalid': accountFormErrors.saldo },
                ]"
                @input="handleAccountOpeningBalanceInput"
              />
            </div>
            <p v-if="accountFormErrors.saldo" class="form-field-warning">
              {{ accountFormErrors.saldo }}
            </p>
          </div>
          <button
            id="btn-account-submit"
            type="submit"
            :disabled="isAccountSaving"
            class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] disabled:cursor-wait disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl shadow mt-2 transition-all flex items-center justify-center gap-2"
          >
            <FileCheck class="w-4 h-4 text-[#38BDF8]" />
            {{ isAccountSaving ? "Menyimpan..." : "Simpan Akun Buku Besar" }}
          </button>
        </form>
      </div>
    </div>
    </Teleport>
    <!-- 4. JOURNAL ENTRY FORM MODAL -->
    <Teleport to="body">
      <div
        v-if="isJournalModalOpen"
        class="journal-modal-layer fixed inset-0 z-[10080] flex items-start md:items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
      <div
        class="journal-entry-modal bg-white border border-slate-200 rounded-3xl w-full max-w-[920px] max-h-[calc(100dvh-2rem)] overflow-hidden shadow-2xl flex flex-col my-4"
      >
        <div
          class="px-7 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0"
        >
          <div>
            <h3 class="text-xl font-extrabold tracking-tight text-[#0B1F4A]">
              Jurnal Umum
            </h3>
            <span class="mt-1 block text-sm font-semibold text-slate-500"
              >Pastikan saldo debit dan kredit seimbang.</span
            >
          </div>
          <button
            id="btn-close-journal-modal"
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCE7F4] bg-white text-[#8A98AB] shadow-sm transition-colors hover:border-[#C8D6EA] hover:bg-slate-50 hover:text-[#0B1F4A]"
            aria-label="Tutup form jurnal"
            @click="closeJournalModal"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 text-sm space-y-4 h-0 min-h-0 flex-1 overflow-y-auto">
          <div
            v-if="journalErrorCount > 0"
            class="form-validation-summary"
          >
            <strong>Form belum dapat disimpan.</strong>
            <span>Lengkapi {{ journalErrorCount }} kolom yang ditandai di bawah ini.</span>
          </div>
          <!-- Core Voucher & Date -->
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700"
                >Nomor Voucher Ref</label
              ><input
                id="journ-form-voucher"
                type="text"
                required
                :value="voucherNo"
                :class="[
                  'h-12 w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 font-mono text-sm font-bold text-slate-700 focus:outline-none',
                  { 'form-control-invalid': journalFormErrors.voucherNo },
                ]"
                @change="updateVoucherNo(eventValue($event))"
              />
              <p v-if="journalFormErrors.voucherNo" class="form-field-warning">
                {{ journalFormErrors.voucherNo }}
              </p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700"
                >Tanggal Transaksi</label
              ><input
                id="journ-form-date"
                type="date"
                required
                :value="journalDateInput"
                :class="[
                  'h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 font-mono text-sm text-slate-700 focus:outline-none',
                  { 'form-control-invalid': journalFormErrors.journalDate },
                ]"
                @change="updateJournalDateInput(eventValue($event))"
              />
              <p v-if="journalFormErrors.journalDate" class="form-field-warning">
                {{ journalFormErrors.journalDate }}
              </p>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-bold text-slate-700"
                >Divisi</label
              ><select
                id="journ-form-division"
                :value="journalDivisionId"
                :class="[
                  'h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-700 focus:outline-none',
                  { 'form-control-invalid': journalFormErrors.division },
                ]"
                @change="updateJournalDivisionId(eventValue($event))"
              >
                <option value="">Pilih divisi transaksi</option>
                <option
                  v-for="division in activeDivisions"
                  :key="division.id"
                  :value="String(division.id)"
                >
                  <template v-if="division.code">{{
                    `${division.code} · `
                  }}</template
                  ><template v-else></template>{{ division.name }}
                </option>
              </select>
              <p v-if="journalFormErrors.division" class="form-field-warning">
                {{ journalFormErrors.division }}
              </p>
            </div>
          </div>
          <!-- Memo -->
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-700"
              >Memo Keterangan Transaksi</label
            ><input
              id="journ-form-memo"
              type="text"
              required
              placeholder="Tulis alasan transaksi atau invoice..."
              :value="memo"
              :class="[
                'h-11 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-sm font-semibold text-slate-800 focus:outline-none',
                { 'form-control-invalid': journalFormErrors.memo },
              ]"
              @change="updateMemo(eventValue($event))"
            />
            <p v-if="journalFormErrors.memo" class="form-field-warning">
              {{ journalFormErrors.memo }}
            </p>
          </div>
          <div class="space-y-4">
            <!-- DEBIT ENTRIES (Multi Row) -->
            <div
              class="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4"
            >
              <div class="flex justify-between items-center">
                <span
                  class="block text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600"
                  >Entri Debit (Dr)</span
                ><button
                  id="btn-add-debit-row"
                  type="button"
                  class="inline-flex h-9 items-center rounded-xl px-3 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-800"
                  @click="handleAddDebitRow"
                >
                  + Tambah Baris
                </button>
              </div>
              <div class="space-y-2">
                <div class="hidden md:grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center px-1 mb-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Akun</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400">Nominal</span>
                  <span></span>
                </div>
                <div
                  v-for="(line, idx) in debitLines"
                  :key="idx"
                  class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
                >
                  <select
                    :id="`debit-line-acc-${idx}`"
                    :value="line.kode"
                    :class="[
                      'h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 focus:outline-none',
                      {
                        'form-control-invalid':
                          journalFormErrors[`debitKode-${idx}`],
                      },
                    ]"
                    @change="handleDebitRowChange(idx, 'kode', eventValue($event))"
                  >
                    <option value="">Pilih akun debit...</option>
                    <option v-for="a in akun" :key="a.id" :value="a.kode">
                      {{ a.kode }} - {{ a.nama }} ({{ a.tipe }})
                    </option                   ></select
                  ><div class="currency-input relative">
                    <span
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs z-[1] pointer-events-none"
                      >Rp</span
                    ><input
                      :id="`debit-line-val-${idx}`"
                      type="number"
                      placeholder="0"
                      :value="line.nominal || ''"
                      :class="[
                        'h-11 w-full rounded-2xl border border-slate-300 bg-white pl-9 pr-4 font-mono text-sm text-slate-800 focus:outline-none',
                        {
                          'form-control-invalid':
                            journalFormErrors[`debitNominal-${idx}`],
                        },
                      ]"
                      @change="handleDebitRowChange(
                            idx,
                            'nominal',
                            parseRupiahInput(eventValue($event)),
                          )"
                    /></div><button
                    v-if="debitLines.length > 1"
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                    @click="handleRemoveDebitRow(idx)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <p
                    v-if="
                      journalFormErrors[`debitKode-${idx}`] ||
                      journalFormErrors[`debitNominal-${idx}`]
                    "
                    class="form-field-warning md:col-span-3"
                  >
                    {{
                      journalFormErrors[`debitKode-${idx}`] ||
                      journalFormErrors[`debitNominal-${idx}`]
                    }}
                  </p>
                </div>
              </div>
            </div>
            <!-- CREDIT ENTRIES (Multi Row) -->
            <div
              class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div class="flex justify-between items-center">
                <span
                  class="block text-sm font-extrabold uppercase tracking-[0.12em] text-slate-600"
                  >Entri Kredit (Cr)</span
                ><button
                  id="btn-add-credit-row"
                  type="button"
                  class="inline-flex h-9 items-center rounded-xl px-3 text-sm font-bold text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                  @click="handleAddCreditRow"
                >
                  + Tambah Baris
                </button>
              </div>
              <div class="space-y-2">
                <div class="hidden md:grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center px-1 mb-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Akun</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nominal</span>
                  <span></span>
                </div>
                <div
                  v-for="(line, idx) in creditLines"
                  :key="idx"
                  class="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto] md:items-center"
                >
                  <select
                    :id="`credit-line-acc-${idx}`"
                    :value="line.kode"
                    :class="[
                      'h-11 min-w-0 rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 focus:outline-none',
                      {
                        'form-control-invalid':
                          journalFormErrors[`creditKode-${idx}`],
                      },
                    ]"
                    @change="handleCreditRowChange(idx, 'kode', eventValue($event))"
                  >
                    <option value="">Pilih akun kredit...</option>
                    <option v-for="a in akun" :key="a.id" :value="a.kode">
                      {{ a.kode }} - {{ a.nama }} ({{ a.tipe }})
                    </option></select
                  ><div class="currency-input relative">
                    <span
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] font-extrabold text-xs z-[1] pointer-events-none"
                      >Rp</span
                    ><input
                      :id="`credit-line-val-${idx}`"
                      type="number"
                      placeholder="0"
                      :value="line.nominal || ''"
                      :class="[
                        'h-11 w-full rounded-2xl border border-slate-300 bg-white pl-9 pr-4 font-mono text-sm text-slate-800 focus:outline-none',
                        {
                          'form-control-invalid':
                            journalFormErrors[`creditNominal-${idx}`],
                        },
                      ]"
                      @change="handleCreditRowChange(
                            idx,
                            'nominal',
                            parseRupiahInput(eventValue($event)),
                          )"
                    /></div><button
                    v-if="creditLines.length > 1"
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                    @click="handleRemoveCreditRow(idx)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <p
                    v-if="
                      journalFormErrors[`creditKode-${idx}`] ||
                      journalFormErrors[`creditNominal-${idx}`]
                    "
                    class="form-field-warning md:col-span-3"
                  >
                    {{
                      journalFormErrors[`creditKode-${idx}`] ||
                      journalFormErrors[`creditNominal-${idx}`]
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Total balance indicators -->
        <div
          class="p-4 bg-[#F8FAFC] border-y border-slate-200/80 shrink-0 space-y-3 font-mono"
        >
          <div
            class="space-y-1 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <span class="block font-sans text-sm text-slate-400"
              >Total Debit (Dr)</span
            ><span class="block text-base font-bold text-[#0B1F4A]">{{
              formatRupiah(totalDebit)
            }}</span>
          </div>
          <div
            class="space-y-1 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <span class="block font-sans text-sm text-slate-400"
              >Total Kredit (Cr)</span
            ><span class="block text-base font-bold text-[#0B1F4A]">{{
              formatRupiah(totalCredit)
            }}</span>
          </div>
        </div>
        <!-- Balance check validation footer -->
        <div class="p-4 bg-slate-50 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 text-sm font-semibold">
            <span
              v-if="isBalanced"
              class="text-emerald-600 flex items-center gap-1"
              ><Check class="w-4 h-4" /> Balanced &amp; siap dibuat sebagai
              draft</span
            ><span v-else class="text-rose-500 flex items-center gap-1"
              ><AlertCircle class="w-4 h-4 animate-bounce" /> Unbalanced •
              Selisih:
              {{ formatRupiah(Math.abs(totalDebit - totalCredit)) }}</span
            >
          </div>
          <button
            id="btn-journal-submit"
            type="button"
            :disabled="isJournalSaving"
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B1F4A] px-7 text-sm font-bold text-white shadow transition-all hover:bg-[#1E3A8A] disabled:cursor-wait disabled:opacity-60"
            @click="handleSaveJournal"
          >
            {{ isJournalSaving ? "Menyimpan..." : "Simpan Draft Jurnal" }}
          </button>
        </div>
      </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
      v-if="selectedAccountDetail"
      class="account-detail-modal-layer fixed inset-0 z-[120000] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      @click.self="closeAccountDetail"
    >
      <div
        class="flex w-full max-w-[760px] flex-col overflow-hidden border border-slate-100 bg-white shadow-2xl"
        :style="{ maxHeight: 'calc(100dvh - 32px)' }"
      >
        <div
          class="flex items-start justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-extrabold uppercase tracking-widest text-[#94A3B8]"
            >
              Detail Akun Buku Besar
            </p>
            <h3 class="mt-1 text-lg font-black text-[#0B1F4A]">
              {{ selectedAccountDetail.kode }} ·
              {{ selectedAccountDetail.nama }}
            </h3>
          </div>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-2xl text-[#94A3B8] transition hover:bg-slate-50 hover:text-slate-600"
            @click="closeAccountDetail"
          >
            ×
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="grid gap-3 p-5 text-xs sm:grid-cols-3">
            <div
              v-for="([label, value], detailIndex) in [
                ['Tipe', selectedAccountDetail.tipe],
                [
                  'Status',
                  selectedAccountDetail.status ||
                    selectedAccountDetail._raw?.status ||
                    'active',
                ],
                [
                  'Saldo Berjalan',
                  formatRupiah(selectedAccountDetail.saldo || 0),
                ],
                [
                  'Saldo Awal',
                  formatRupiah(selectedAccountDetail._raw?.opening_balance || 0),
                ],
                [
                  'Normal Balance',
                  selectedAccountDetail._raw?.normal_balance || '-',
                ],
                ['Parent ID', selectedAccountDetail._raw?.parent_id || '-'],
              ]"
              :key="`${label}-${detailIndex}`"
              class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-3"
            >
              <p class="text-[10px] font-bold uppercase text-[#94A3B8]">
                {{ label }}
              </p>
              <p class="mt-1 font-bold text-[#0B1F4A]">{{ value }}</p>
            </div>
          </div>
          <section class="border-t border-[#E8EEF7] px-5 pb-5">
            <div class="flex items-start justify-between gap-3 py-4">
              <div>
                <p class="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#1E5AA8]">
                  Sumber Dana / Asal Nilai
                </p>
                <p class="mt-1 text-[11px] font-medium text-[#64748B]">
                  Transaksi yang menambah saldo akun ini, berdasarkan lawan akun jurnal.
                </p>
              </div>
              <span class="rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-extrabold text-[#0B1F4A]">
                {{ selectedAccountFundingRows().length }} sumber
              </span>
            </div>
            <div class="overflow-hidden rounded-xl border border-[#DCE7F4]">
              <div class="max-h-[260px] overflow-auto">
                <table class="w-full min-w-[680px] text-left text-xs">
                  <thead class="bg-[#EAF2FB] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#243650]">
                    <tr>
                      <th class="px-3 py-2.5">Tanggal</th>
                      <th class="px-3 py-2.5">Sumber / Pihak</th>
                      <th class="px-3 py-2.5">Lawan Akun</th>
                      <th class="px-3 py-2.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8EEF7] bg-white">
                    <tr v-if="!selectedAccountFundingRows().length">
                      <td colspan="4" class="px-3 py-6 text-center font-semibold text-[#64748B]">
                        Belum ada transaksi yang menambah saldo akun ini.
                      </td>
                    </tr>
                    <tr
                      v-for="row in selectedAccountFundingRows()"
                      :key="row.id"
                    >
                      <td class="px-3 py-3 font-mono font-bold text-[#0B1F4A]">
                        {{ row.tanggal || '-' }}
                      </td>
                      <td class="px-3 py-3">
                        <p class="font-bold text-[#0B1F4A]">{{ row.source }}</p>
                        <p class="mt-0.5 line-clamp-2 text-[10px] font-medium text-[#64748B]">
                          {{ row.memo }}
                        </p>
                      </td>
                      <td class="px-3 py-3">
                        <p class="font-semibold text-[#243650]">{{ row.counterpart }}</p>
                        <p class="mt-0.5 text-[10px] font-medium text-[#7A8CA8]">
                          {{ row.status }}
                        </p>
                      </td>
                      <td class="px-3 py-3 text-right font-mono font-extrabold text-[#0B1F4A]">
                        {{ formatRupiah(row.nominal) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </Teleport>
    <ConfirmDialog
      :open="!!deleteConfirm"
      eyebrow="Konfirmasi Penghapusan"
      title="Hapus akun buku besar?"
      message="Akun yang sudah dipakai pada jurnal atau transaksi tidak akan bisa dihapus dari backend."
      :details="[
        { label: 'Kode', value: deleteConfirm?.kode || '-' },
        { label: 'Nama Akun', value: deleteConfirm?.nama || '-' },
        { label: 'Tipe', value: deleteConfirm?.tipe || '-' },
      ]"
      :impact-items="[
        'Akun hilang dari daftar Chart of Accounts jika belum dipakai transaksi.',
        'Jika backend menolak penghapusan, nonaktifkan akun tersebut sebagai gantinya.',
      ]"
      confirm-label="Hapus Akun"
      @cancel="closeDeleteConfirm"
      @confirm="confirmDeleteAccount"
    />
    <ConfirmDialog
      :open="!!cancelConfirm"
      eyebrow="Konfirmasi Pembatalan"
      :title="cancelConfirm?.title || 'Batalkan transaksi?'"
      :message="cancelConfirm?.message || 'Transaksi akan dibatalkan dan status berubah menjadi canceled.'"
      :details="cancelConfirm?.details || []"
      :impact-items="[
        'Status transaksi akan berubah menjadi canceled.',
        'Jurnal terkait akan dibatalkan atau dibalik.',
      ]"
      :confirm-label="cancelConfirm?.confirmLabel || 'Batalkan'"
      require-reason
      reason-label="Alasan Pembatalan"
      reason-placeholder="Tulis alasan pembatalan..."
      @cancel="closeCancelConfirm"
      @confirm="confirmCancelDocument"
    />
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { formatRupiahInput, parseRupiahInput } from "../utils/rupiahInputs.js";
import { financeApi } from "../services/financeApi.js";
import { computed, ref } from "vue";
import {
  Search,
  Plus,
  Check,
  Trash2,
  Pencil,
  AlertCircle,
  FileCheck,
  Download,
  Calendar,
  Send,
  ShieldCheck,
  Eye,
  X,
  Filter,
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
import {
  buildPrintDocumentHtml,
  escapeHtml,
  openPrintPopup,
} from "../utils/printDocument.js";
import {
  getJournalStatusDisplay,
  getJournalStatusColor,
} from "../services/financeMappers.js";
import { AkunBukuBesar, Transaksi, TipeAkun } from "../types.ts";
import ConfirmDialog from "./common/ConfirmDialog.vue";
import { latestFirst, pageRows, safePage } from "../utils/tablePagination.js";
import TablePagination from "./common/TablePagination.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
interface BukuBesarDanTransaksiProps {
  activeSection: "bukubesar" | "transaksi";
  akun: AkunBukuBesar[];
  transaksi: Transaksi[];
  divisions?: any[];
  userRole?: string;
}

const props = defineProps<BukuBesarDanTransaksiProps>();
const {
  akun,
  transaksi,
  userRole,
}: BukuBesarDanTransaksiProps = props;

const {
  notify,
  ledger: {
    addAccount,
    updateAccount,
    deleteAccount: deleteAccountAction,
    addTransaction,
    approveJournal,
    postJournal,
    cancelJournal,
  },
} = useFinStartContext();
const activeTab = computed(() =>
  props.activeSection === "bukubesar" ? "ledger" : "journal",
);
// Search and Filters
const ledgerSearch = ref(""),
  updateLedgerSearch = (next) => (ledgerSearch.value = next);
const LEDGER_TYPE_FILTERS = ["Semua", "Aset", "Kewajiban", "Modal", "Pendapatan", "Beban"] as const;
const ledgerTypeFilter = ref<(typeof LEDGER_TYPE_FILTERS)[number]>("Semua"),
  setLedgerTypeFilter = (next: (typeof LEDGER_TYPE_FILTERS)[number]) => {
    ledgerTypeFilter.value = next;
    ledgerPage.value = 1;
  };
const journalSearch = ref(""),
  updateJournalSearch = (next) => (journalSearch.value = next);
const JOURNAL_STATUS_FILTERS = [
  "Semua",
  "Unposted",
  "Posted",
  "Posted-Unpaid",
  "Posted-Paid",
  "Canceled",
] as const;
const journalStatusFilter = ref<(typeof JOURNAL_STATUS_FILTERS)[number]>("Semua"),
  setJournalStatusFilter = (next: (typeof JOURNAL_STATUS_FILTERS)[number]) => {
    journalStatusFilter.value = next;
    journalPage.value = 1;
  };
function normalizeJournalDate(value: any) {
  const text = String(value || "").trim();
  if (!text) return "";
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const localMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (localMatch) {
    return `${localMatch[3]}-${localMatch[2].padStart(2, "0")}-${localMatch[1].padStart(2, "0")}`;
  }
  return text.slice(0, 10);
}
const journalDate = ref(""),
  updateJournalDate = (next) => {
    journalDate.value = normalizeJournalDate(next);
    journalPage.value = 1;
  }; // Add Account Form State
const journalDatePickerRef = ref<HTMLInputElement | null>(null);
function openJournalDatePicker() {
  const picker = journalDatePickerRef.value as
    | (HTMLInputElement & { showPicker?: () => void })
    | null;

  if (!picker?.showPicker) return;

  try {
    picker.showPicker();
  } catch {
    // Browser dapat menolak showPicker saat event bukan user gesture.
  }
}
const ledgerPage = ref(1);
const journalPage = ref(1);
const isAccountModalOpen = ref(false),
  updateIsAccountModalOpen = (next) => (isAccountModalOpen.value = next);
const isAccountSaving = ref(false);
const isJournalSaving = ref(false);
const deleteConfirm = ref<any>(null);
const selectedAccountDetail = ref<any>(null);
const nextAccountCodePreview = ref("");
const newAccount = ref({
    kode: "",
    nama: "",
    tipe: "Aset" as TipeAkun,
    saldo: 0,
    status: "active",
  }),
  updateNewAccount = (next) => (newAccount.value = next);

const accountInputClass =
  "w-full h-12 px-5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none";

type AccountFormFieldKey = "kode" | "nama" | "tipe" | "status" | "saldo";

const emptyAccountFormErrors = (): Record<AccountFormFieldKey, string> => ({
  kode: "",
  nama: "",
  tipe: "",
  status: "",
  saldo: "",
});

const accountFormErrors = ref<Record<AccountFormFieldKey, string>>(
  emptyAccountFormErrors(),
);

const accountRequiredFields: Array<{
  key: AccountFormFieldKey;
  id: string;
  label: string;
  type?: "number";
  allowZero?: boolean;
}> = [
  { key: "kode", id: "acc-form-code", label: "Kode akun" },
  { key: "nama", id: "acc-form-name", label: "Nama akun buku besar" },
  { key: "tipe", id: "acc-form-type", label: "Tipe klasifikasi akun" },
  // Status isn't shown while adding a new account (it always defaults to
  // "active" in newAccount's initial state) - only editable once editing an
  // existing account, so it's never required-checked against the DOM here.
  {
    key: "saldo",
    id: "acc-form-val",
    label: "Saldo awal",
    type: "number",
    allowZero: true,
  },
];

const accountFormErrorMessages = computed(() =>
  Object.values(accountFormErrors.value).filter(Boolean),
);

const accountOpeningBalanceInputValue = computed(() =>
  formatRupiahInput(newAccount.value.saldo, false, false),
);

function resetAccountFormErrors() {
  accountFormErrors.value = emptyAccountFormErrors();
}

function clearAccountFormError(key: AccountFormFieldKey) {
  if (!accountFormErrors.value[key]) return;
  accountFormErrors.value = {
    ...accountFormErrors.value,
    [key]: "",
  };
}

function setAccountField(key: keyof typeof newAccount.value, value: any) {
  updateNewAccount({
    ...newAccount.value,
    [key]: value,
  });
  if (key in accountFormErrors.value)
    clearAccountFormError(key as AccountFormFieldKey);
  if (key === "tipe" && !editingAccount.value) {
    fetchNextAccountCode(value as TipeAkun);
  }
}

function handleAccountOpeningBalanceInput(event: Event) {
  const rawValue = eventValue(event);
  setAccountField("saldo", parseRupiahInput(rawValue));
}

const ACCOUNT_TYPE_TO_API: Record<TipeAkun, string> = {
  Aset: "asset",
  Kewajiban: "liability",
  Modal: "equity",
  Pendapatan: "revenue",
  Beban: "expense",
};

async function fetchNextAccountCode(tipe: TipeAkun) {
  try {
    const result = await financeApi.get("/accounts/next-code", {
      type: ACCOUNT_TYPE_TO_API[tipe] || "asset",
    });
    nextAccountCodePreview.value = result?.code || "";
  } catch {
    nextAccountCodePreview.value = "";
  }
}

function accountRawInputValue(id: string) {
  return (
    (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)
      ?.value ?? ""
  )
    .toString()
    .trim();
}

function validateAccountForm() {
  const nextErrors = emptyAccountFormErrors();

  for (const field of accountRequiredFields) {
    const rawValue = accountRawInputValue(field.id);
    const value = newAccount.value[field.key];

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

  accountFormErrors.value = nextErrors;
  const firstInvalidField = accountRequiredFields.find(
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

function accountCodeExists(code: string) {
  const normalizedCode = String(code || "").trim().toLowerCase();
  if (!normalizedCode) return false;

  const editingId = editingAccount.value
    ? String(editingAccount.value.id || editingAccount.value._raw?.id || "")
    : "";

  return akun.some((account: any) => {
    const accountId = String(account.id || account._raw?.id || "");
    return (
      String(account.kode || "").trim().toLowerCase() === normalizedCode &&
      (!editingId || accountId !== editingId)
    );
  });
}

const editingAccount = ref<any>(null); // Add Journal Entry Form State
const isJournalModalOpen = ref(false),
  updateIsJournalModalOpen = (next) => (isJournalModalOpen.value = next);
const voucherNo = ref(
    `RV-${new Date().getFullYear()}${transaksi.length + 101}`,
  ),
  updateVoucherNo = (next) => {
    voucherNo.value = next;
    clearJournalError("voucherNo");
  };
const journalDateInput = ref(new Date().toISOString().split("T")[0]),
  updateJournalDateInput = (next) => {
    journalDateInput.value = next;
    clearJournalError("journalDate");
  };
const journalDivisionId = ref(""),
  updateJournalDivisionId = (next) => {
    journalDivisionId.value = next;
    clearJournalError("division");
  };
const memo = ref(""),
  updateMemo = (next) => {
    memo.value = next;
    clearJournalError("memo");
  }; // Multi-row Debit & Credit lines
const debitLines = ref([
    {
      kode: "",
      nominal: 0,
    },
  ]),
  updateDebitLines = (next) => (debitLines.value = next);
const creditLines = ref([
    {
      kode: "",
      nominal: 0,
    },
  ]),
  updateCreditLines = (next) => (creditLines.value = next);

const journalFormErrors = ref<Record<string, string>>({});
const journalErrorCount = computed(
  () => Object.keys(journalFormErrors.value).length,
);
const clearJournalError = (...keys: string[]) => {
  if (!keys.some((key) => journalFormErrors.value[key])) return;
  const nextErrors = { ...journalFormErrors.value };
  keys.forEach((key) => delete nextErrors[key]);
  journalFormErrors.value = nextErrors;
};
const resetJournalFormErrors = () => {
  journalFormErrors.value = {};
};

const openJournalModal = () => {
  const year = new Date().getFullYear();
  const prefix = `RV-${year}`;
  
  // Find all vouchers with the current year prefix
  const existingVouchers = props.transaksi
    .map(t => t.refVoucher)
    .filter(v => v && v.startsWith(prefix))
    .map(v => {
      const numberPart = v.replace(prefix, '');
      return Number(numberPart);
    })
    .filter(n => !isNaN(n));
  
  const maxNumber = existingVouchers.length > 0 ? Math.max(...existingVouchers) : 100;
  const nextNumber = maxNumber + 1;
  
  voucherNo.value = `${prefix}${nextNumber}`;
  resetJournalFormErrors();
  updateIsJournalModalOpen(true);
};

const closeJournalModal = () => {
  resetJournalFormErrors();
  updateIsJournalModalOpen(false);
};

const validateJournalForm = () => {
  const nextErrors: Record<string, string> = {};
  let firstInvalidId = "";

  const mark = (key: string, message: string, id: string) => {
    nextErrors[key] = message;
    if (!firstInvalidId) firstInvalidId = id;
  };

  if (!String(voucherNo.value || "").trim()) {
    mark("voucherNo", "Nomor voucher wajib diisi.", "journ-form-voucher");
  }
  if (!String(journalDateInput.value || "").trim()) {
    mark("journalDate", "Tanggal transaksi wajib diisi.", "journ-form-date");
  }
  if (activeDivisions.value.length > 0 && !String(journalDivisionId.value).trim()) {
    mark("division", "Divisi transaksi wajib dipilih.", "journ-form-division");
  }
  if (!String(memo.value || "").trim()) {
    mark("memo", "Memo keterangan transaksi wajib diisi.", "journ-form-memo");
  }

  debitLines.value.forEach((line, idx) => {
    if (!String(line.kode || "").trim()) {
      mark(
        `debitKode-${idx}`,
        `Akun debit baris ${idx + 1} wajib dipilih.`,
        `debit-line-acc-${idx}`,
      );
    }
    if (!Number.isFinite(Number(line.nominal)) || Number(line.nominal) <= 0) {
      mark(
        `debitNominal-${idx}`,
        `Nominal debit baris ${idx + 1} harus lebih dari 0.`,
        `debit-line-val-${idx}`,
      );
    }
  });

  creditLines.value.forEach((line, idx) => {
    if (!String(line.kode || "").trim()) {
      mark(
        `creditKode-${idx}`,
        `Akun kredit baris ${idx + 1} wajib dipilih.`,
        `credit-line-acc-${idx}`,
      );
    }
    if (!Number.isFinite(Number(line.nominal)) || Number(line.nominal) <= 0) {
      mark(
        `creditNominal-${idx}`,
        `Nominal kredit baris ${idx + 1} harus lebih dari 0.`,
        `credit-line-val-${idx}`,
      );
    }
  });

  if (Object.keys(nextErrors).length === 0 && !isBalanced.value) {
    mark(
      "balance",
      "Total debit dan kredit harus seimbang serta lebih dari 0.",
      "btn-journal-submit",
    );
  }

  journalFormErrors.value = nextErrors;

  if (firstInvalidId) {
    requestAnimationFrame(() => {
      const target = document.getElementById(firstInvalidId);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.focus();
    });
    return false;
  }

  return true;
};

const resetJournalForm = () => {
  resetJournalFormErrors();
  updateMemo("");
  updateJournalDivisionId("");
  updateDebitLines([
    {
      kode: "1001",
      nominal: 0,
    },
  ]);
  updateCreditLines([
    {
      kode: "1001",
      nominal: 0,
    },
  ]);
  updateVoucherNo(`RV-${new Date().getFullYear()}${transaksi.length + 102}`);
};

// Debit/Credit line modifiers
const handleAddDebitRow = () => {
  updateDebitLines([
    ...debitLines.value,
    {
      kode: "",
      nominal: 0,
    },
  ]);
};
const handleRemoveDebitRow = (idx: number) => {
  updateDebitLines(debitLines.value.filter((_, i) => i !== idx));
};
const handleDebitRowChange = (
  idx: number,
  field: "kode" | "nominal",
  value: any,
) => {
  const updated = [...debitLines.value];
  updated[idx] = {
    ...updated[idx],
    [field]: value,
  };
  updateDebitLines(updated);
  clearJournalError(
    field === "kode" ? `debitKode-${idx}` : `debitNominal-${idx}`,
    "balance",
  );
};
const handleAddCreditRow = () => {
  updateCreditLines([
    ...creditLines.value,
    {
      kode: "",
      nominal: 0,
    },
  ]);
};
const handleRemoveCreditRow = (idx: number) => {
  updateCreditLines(creditLines.value.filter((_, i) => i !== idx));
};
const handleCreditRowChange = (
  idx: number,
  field: "kode" | "nominal",
  value: any,
) => {
  const updated = [...creditLines.value];
  updated[idx] = {
    ...updated[idx],
    [field]: value,
  };
  updateCreditLines(updated);
  clearJournalError(
    field === "kode" ? `creditKode-${idx}` : `creditNominal-${idx}`,
    "balance",
  );
};

// Balancing Calculation
const totalDebit = computed(() =>
  debitLines.value.reduce((acc, l) => acc + Number(l.nominal || 0), 0),
);
const totalCredit = computed(() =>
  creditLines.value.reduce((acc, l) => acc + Number(l.nominal || 0), 0),
);
const isBalanced = computed(
  () => totalDebit.value === totalCredit.value && totalDebit.value > 0,
);

const resetAccountForm = () => {
  editingAccount.value = null;
  resetAccountFormErrors();
  nextAccountCodePreview.value = "";
  updateNewAccount({
    kode: "",
    nama: "",
    tipe: "Aset",
    saldo: 0,
    status: "active",
  });
};

const openAccountForm = (account: any = null) => {
  resetAccountFormErrors();
  if (account) {
    const raw = account._raw || account;
    editingAccount.value = account;
    updateNewAccount({
      kode: account.kode,
      nama: account.nama,
      tipe: account.tipe,
      saldo: Number(raw.opening_balance ?? account.saldo ?? 0),
      status: raw.status || account.status || "active",
    });
  } else {
    resetAccountForm();
    fetchNextAccountCode("Aset");
  }
  updateIsAccountModalOpen(true);
};

const openAccountDetail = (account: any) => {
  selectedAccountDetail.value = account ? { ...account } : null;
};

const closeAccountDetail = () => {
  selectedAccountDetail.value = null;
};

const closeAccountModal = () => {
  resetAccountFormErrors();
  updateIsAccountModalOpen(false);
};

// Add or edit account submission
const handleSaveAccount = async (e: Event) => {
  e.preventDefault();
  if (isAccountSaving.value) return;
  if (!editingAccount.value) {
    // Kode is auto-generated and read-only for new accounts; pull in
    // whatever the preview last resolved to right before submitting.
    setAccountField("kode", nextAccountCodePreview.value);
  }
  if (!validateAccountForm()) {
    notify("Lengkapi seluruh data akun sebelum menyimpan.");
    return;
  }
  if (accountCodeExists(newAccount.value.kode)) {
    accountFormErrors.value = {
      ...accountFormErrors.value,
      kode: "Kode sudah digunakan.",
    };
    notify("Kode sudah digunakan.");
    return;
  }
  const item: any = { ...newAccount.value };
  isAccountSaving.value = true;
  try {
    if (editingAccount.value) await updateAccount(editingAccount.value, item);
    else await addAccount(item);
    closeAccountModal();
    resetAccountForm();
  } finally {
    isAccountSaving.value = false;
  }
};

const deleteAccount = async (account: any) => {
  deleteConfirm.value = account;
};
const confirmDeleteAccount = async () => {
  if (!deleteConfirm.value) return;
  const account = deleteConfirm.value;
  deleteConfirm.value = null;
  await deleteAccountAction(account);
};

// Add Transaction Submission
const handleSaveJournal = async () => {
  if (isJournalSaving.value) return;
  if (!validateJournalForm()) {
    notify("Lengkapi seluruh kolom jurnal sebelum menyimpan.");
    return;
  }

  const firstDebit = debitLines.value[0];
  const firstCredit = creditLines.value[0];
  const transactionItem: any = {
    id: `TX-${(transaksi.length + 101).toString()}`,
    tanggal: journalDateInput.value,
    refVoucher: voucherNo.value,
    keterangan: memo.value,
    nominal: totalDebit.value,
    debitAkun: firstDebit.kode,
    kreditAkun: firstCredit.kode,
    divisionId: journalDivisionId.value || null,
    lines: [
      ...debitLines.value
        .filter((line) => Number(line.nominal) > 0)
        .map((line) => ({
          kode: line.kode,
          debit: Number(line.nominal),
          credit: 0,
        })),
      ...creditLines.value
        .filter((line) => Number(line.nominal) > 0)
        .map((line) => ({
          kode: line.kode,
          debit: 0,
          credit: Number(line.nominal),
        })),
    ],
  };
  isJournalSaving.value = true;
  try {
    await addTransaction(transactionItem);
    updateIsJournalModalOpen(false);
    resetJournalForm();
    notify("Jurnal draft berhasil dibuat dan menunggu approval pengguna lain.");
  } finally {
    isJournalSaving.value = false;
  }
};

// Filters
const filteredLedgers = computed(() =>
  [...(props.akun || [])]
    .filter((a: any) => {
      if (ledgerTypeFilter.value !== "Semua" && a.tipe !== ledgerTypeFilter.value) {
        return false;
      }
      const query = ledgerSearch.value.toLowerCase();
      return (
        String(a.kode || "")
          .toLowerCase()
          .includes(query) ||
        String(a.nama || "")
          .toLowerCase()
          .includes(query) ||
        String(a.tipe || "")
          .toLowerCase()
          .includes(query)
      );
    })
    .sort((a: any, b: any) => {
      const ka = String(a.kode || "");
      const kb = String(b.kode || "");
      return ka.localeCompare(kb, undefined, { numeric: true, sensitivity: "base" });
    }),
);
const filteredJournals = computed(() =>
  latestFirst(
    (props.transaksi || []).filter((t: any) => {
      if (
        journalStatusFilter.value !== "Semua" &&
        getJournalStatusDisplay(t.status) !== journalStatusFilter.value
      ) {
        return false;
      }
      const query = journalSearch.value.toLowerCase();
      const matchesSearch =
        String(t.keterangan || "")
          .toLowerCase()
          .includes(query) ||
        String(t.refVoucher || "")
          .toLowerCase()
          .includes(query) ||
        String(t.party_name || "")
          .toLowerCase()
          .includes(query) ||
        String(t.source_number || "")
          .toLowerCase()
          .includes(query) ||
        String(t.source_label || "")
          .toLowerCase()
          .includes(query);
      const transactionDate = normalizeJournalDate(
        t.tanggal || t.transaction_date || t._raw?.transaction_date,
      );
      const matchesDate = !journalDate.value || transactionDate === journalDate.value;
      return matchesSearch && matchesDate;
    }),
  ),
);
const pagedLedgers = computed(() =>
  pageRows(filteredLedgers.value, ledgerPage.value),
);
const pagedJournals = computed(() =>
  pageRows(filteredJournals.value, journalPage.value),
);
const downloadJournalVoucher = (transaction: Transaksi) => {
  if (!transaction.journal_id || !transaction.refVoucher || transaction.refVoucher === '-') {
    notify("Tidak ada bukti jurnal untuk transaksi draft.");
    return;
  }
  const debitAccount = akun.find((item) => item.kode === transaction.debitAkun);
  const creditAccount = akun.find((item) => item.kode === transaction.kreditAkun);
  const nominal = formatRupiah(transaction.nominal || 0);
  const bodyHtml = `
    <p class="doc-note">Keterangan: ${escapeHtml(transaction.keterangan || "-")}</p>
    <table>
      <thead><tr><th>Posisi</th><th>Akun</th><th class="numeric">Nilai</th></tr></thead>
      <tbody>
        <tr>
          <td>Debit</td>
          <td>${escapeHtml(transaction.debitAkun || "-")} - ${escapeHtml(debitAccount?.nama || "-")}</td>
          <td class="numeric">${escapeHtml(nominal)}</td>
        </tr>
        <tr>
          <td>Kredit</td>
          <td>${escapeHtml(transaction.kreditAkun || "-")} - ${escapeHtml(creditAccount?.nama || "-")}</td>
          <td class="numeric">${escapeHtml(nominal)}</td>
        </tr>
      </tbody>
    </table>`;
  const html = buildPrintDocumentHtml({
    documentLabel: "Bukti Jurnal",
    title: "Bukti Jurnal Umum",
    subtitle: `Voucher ${transaction.refVoucher || transaction.id}`,
    metaItems: [
      { label: "No. Voucher", value: transaction.refVoucher || String(transaction.id) },
      { label: "Tanggal", value: transaction.tanggal || "-" },
      { label: "Status", value: transaction.status || "-" },
    ],
    bodyHtml,
  });
  if (openPrintPopup(html, { notify, blockedMessage: "Popup print diblokir browser. Izinkan popup untuk mencetak bukti jurnal." })) {
    notify(`Dialog cetak bukti jurnal ${transaction.refVoucher} dibuka.`);
  }
};
const activeDivisions = computed(() =>
  (props.divisions || []).filter(
    (division) => String(division.status || "active") === "active",
  ),
);

function accountNameByCode(code: string) {
  return (props.akun || []).find((account) => account.kode === code)?.nama || "-";
}

function accountNormalSide(account: any): "debit" | "credit" {
  const rawSide = String(account?._raw?.normal_balance || "").toLowerCase();
  if (rawSide === "debit" || rawSide === "credit") return rawSide;
  return ["Kewajiban", "Modal", "Pendapatan"].includes(String(account?.tipe || ""))
    ? "credit"
    : "debit";
}

function allocationAccountCode(allocation: any) {
  return String(allocation || "")
    .replace(/^(Dr|Cr)\s+/i, "")
    .split(" - ")[0]
    .trim();
}

function allocationAccountLabel(allocation: any) {
  const text = String(allocation || "").trim();
  return text || "-";
}

function transactionAllocations(transaction: any, side: "debit" | "credit") {
  const key = side === "debit" ? "debit_allocations" : "credit_allocations";
  const allocations = Array.isArray(transaction?.[key]) ? transaction[key] : [];
  if (allocations.length) return allocations;

  const code = side === "debit" ? transaction?.debitAkun : transaction?.kreditAkun;
  return code ? [`${side === "debit" ? "Dr" : "Cr"} ${code} - ${accountNameByCode(code)}`] : [];
}

function selectedAccountFundingRows() {
  const account = selectedAccountDetail.value;
  if (!account) return [];

  const accountCode = String(account.kode || "");
  const increaseSide = accountNormalSide(account);
  const counterpartSide = increaseSide === "debit" ? "credit" : "debit";

  return latestFirst(
    (props.transaksi || [])
      .filter((transaction: any) =>
        transactionAllocations(transaction, increaseSide).some(
          (allocation) => allocationAccountCode(allocation) === accountCode,
        ),
      )
      .map((transaction: any) => {
        const counterparts = transactionAllocations(transaction, counterpartSide)
          .filter((allocation) => allocationAccountCode(allocation) !== accountCode)
          .map(allocationAccountLabel);
        const source =
          transaction.party_name ||
          transaction.source_number ||
          transaction.source_label ||
          transaction.refVoucher ||
          "Jurnal manual";

        return {
          id: `${transaction.id}-${accountCode}`,
          tanggal: transaction.tanggal,
          source,
          memo: transaction.keterangan || "-",
          counterpart: counterparts.length ? counterparts.join(", ") : "-",
          nominal: Number(transaction.nominal || transaction.total_debit || transaction.total_credit || 0),
          status: transaction.status || transaction.journal_status || "-",
        };
      }),
  ).slice(0, 12);
}

function closeDeleteConfirm() {
  deleteConfirm.value = null;
}

const cancelConfirm = ref<any>(null);

function closeCancelConfirm() {
  cancelConfirm.value = null;
}

const requestCancelJournal = (transaction: any) => {
  cancelConfirm.value = {
    type: "journal",
    item: transaction,
    title: "Batalkan jurnal?",
    message:
      "Jurnal akan dibatalkan dan status berubah menjadi canceled. Jika sudah diposting, saldo akun akan dibalik.",
    details: [
      { label: "Voucher", value: transaction.refVoucher || "-" },
      { label: "Keterangan", value: transaction.keterangan || "-" },
      { label: "Nominal", value: formatRupiah(transaction.nominal || 0) },
    ],
    confirmLabel: "Batalkan Jurnal",
    reasonLabel: "Alasan Pembatalan",
    reasonPlaceholder: "Contoh: Jurnal salah dibuat",
  };
};

const confirmCancelDocument = async (reason = "") => {
  const action = cancelConfirm.value;
  if (!action) return;
  cancelConfirm.value = null;
  await cancelJournal(action.item, reason);
};

</script>
