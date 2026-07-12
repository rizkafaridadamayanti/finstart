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
        <div
          class="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3 py-2 text-xs font-bold text-[#0B1F4A]"
        >
          <BookOpen
            v-if="activeTab === 'ledger'"
            class="w-3.5 h-3.5"
          /><ArrowLeftRight v-else class="w-3.5 h-3.5" /><template
            v-if="activeTab === 'ledger'"
            >Chart of Accounts</template
          ><template v-else>Jurnal Transaksi</template>
        </div>
        <button
          id="btn-open-modal-primary"
          class="bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 shadow shadow-blue-900 transition-all shrink-0"
          @click="activeTab === 'ledger'
                ? openAccountForm()
                : updateIsJournalModalOpen(true)"
        >
          <Plus class="w-4 h-4" /><template v-if="activeTab === 'ledger'"
            >Tambah Akun COA</template
          ><template v-else>Entri Jurnal Baru</template>
        </button>
      </div>
    </div>
    <!-- 1. CHART OF ACCOUNTS view -->
    <div v-if="activeTab === 'ledger'" class="space-y-4">
      <div
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
              id="ledger-search-box"
              type="text"
              :value="ledgerSearch"
              placeholder="Cari kode atau nama akun..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateLedgerSearch(eventValue($event))"
            />
          </div>
          <span class="text-xs text-[#6B7A90]"
            >Menampilkan {{ filteredLedgers.length }} akun</span
          >
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-500">
            <thead
              class="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold tracking-wider border-b border-slate-200"
            >
              <tr>
                <th class="p-4">Kode Akun</th>
                <th class="p-4">Nama Akun Buku Besar</th>
                <th class="p-4">Tipe Klasifikasi</th>
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
                  <span class="font-bold text-[#0B1F4A] block text-sm">{{
                    item.nama
                  }}</span>
                </td>
                <td class="p-4">
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
                      @click="selectedAccountDetail = item"
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
              id="journal-search-box"
              type="text"
              :value="journalSearch"
              placeholder="Cari keterangan memo atau voucher..."
              class="h-10 w-full rounded-xl border border-[#D8E5F4] bg-[#FBFCFE] pl-9 pr-4 text-xs text-[#182338] outline-none placeholder:text-[#9AA9BC] focus:border-[#1E5AA8] focus:bg-white"
              @input="updateJournalSearch(eventValue($event))"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-[#6B7A90]"
              ><Calendar class="mr-1 inline h-3.5 w-3.5" />Tanggal:</span
            ><input
              id="journal-date-box"
              type="date"
              :value="journalDate"
              class="h-10 rounded-xl border border-[#D8E5F4] bg-white px-3 text-xs text-[#182338]"
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
                  <td class="p-4 font-mono font-medium text-slate-600">
                    {{ t.tanggal }}
                  </td>
                  <td class="p-4 font-mono font-bold text-[#0B1F4A]">
                    {{ t.refVoucher }}
                  </td>
                  <td class="p-4">
                    <span class="font-bold text-slate-800 block text-sm">{{
                      t.keterangan
                    }}</span
                    ><span class="text-[10px] text-slate-400 block font-light"
                      >Ref ID: {{ t.id }}</span
                    >
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
                    class="p-4 text-right font-mono font-bold text-[#0B1F4A] text-sm"
                  >
                    {{ formatRupiah(t.nominal) }}
                  </td>
                  <td class="p-4 text-center">
                    <span
                      :class="`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${t.status === 'posted' ? 'bg-emerald-50 text-emerald-700' : t.status === 'approved' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`"
                      ><template v-if="t.status === 'posted'">Posted</template
                      ><template v-else
                        ><template v-if="t.status === 'approved'"
                          >Approved</template
                        ><template v-else>Draft</template></template
                      ></span
                    >
                  </td>
                  <td class="p-4">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        v-if="t.status === 'draft' &amp;&amp; ['admin', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase())"
                        type="button"
                        class="inline-flex h-8 items-center gap-1 rounded-lg bg-sky-50 px-2 text-[10px] font-bold text-sky-700 hover:bg-sky-100"
                        title="Setujui jurnal draft"
                        @click="approveJournal(t)"
                      >
                        <ShieldCheck class="h-3.5 w-3.5" />Setujui</button
                      ><button
                        v-if="t.status === 'approved' &amp;&amp; ['admin', 'finance_manager', 'director'].includes(String(userRole || '').toLowerCase())"
                        type="button"
                        class="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                        title="Posting jurnal"
                        @click="postJournal(t)"
                      >
                        <Send class="h-3.5 w-3.5" />Posting</button
                      ><button
                        type="button"
                        class="p-2 text-slate-400 hover:text-[#0B1F4A] hover:bg-slate-100 rounded-xl"
                        title="Unduh Slip Bukti"
                        @click="downloadJournalVoucher(t)"
                      >
                        <Download class="w-4 h-4" />
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
              placeholder="Contoh: 1102, 5004"
              :value="newAccount.kode"
              :class="[
                accountInputClass,
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
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-700">Akun Induk</label
              ><select
                id="acc-form-parent"
                :value="newAccount.parentId"
                :class="accountInputClass"
                @change="setAccountField('parentId', eventValue($event))"
              >
                <option value="">Tidak ada</option>
                <option
                  v-for="a in availableParentAccounts"
                  :key="a.id"
                  :value="String(a.id)"
                >
                  {{ a.kode }} - {{ a.nama }}
                </option>
              </select>
            </div>
            <div class="space-y-1.5">
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
          </div>
          <div class="space-y-1.5">
            <label class="font-bold text-slate-700">Saldo Awal (Rupiah)</label
            ><input
              id="acc-form-val"
              type="number"
              required
              :value="newAccount.saldo"
              :class="[
                accountInputClass,
                'font-mono',
                { 'form-control-invalid': accountFormErrors.saldo },
              ]"
              @input="setAccountField('saldo', Number(eventValue($event)))"
            />
            <p v-if="accountFormErrors.saldo" class="form-field-warning">
              {{ accountFormErrors.saldo }}
            </p>
          </div>
          <button
            id="btn-account-submit"
            type="submit"
            class="w-full bg-[#0B1F4A] hover:bg-[#1E3A8A] text-white font-semibold py-2.5 rounded-xl shadow mt-2 transition-all flex items-center justify-center gap-2"
          >
            <FileCheck class="w-4 h-4 text-[#38BDF8]" /> Simpan Akun Buku Besar
          </button>
        </form>
      </div>
    </div>
    </Teleport>
    <!-- 4. JOURNAL ENTRY FORM MODAL -->
    <Teleport to="body">
      <div
        v-if="isJournalModalOpen"
        class="journal-modal-layer fixed inset-0 z-[10080] flex items-center justify-center overflow-y-auto bg-[#111827]/55 p-4 backdrop-blur-sm"
      >
      <div
        class="journal-entry-modal bg-white border border-slate-200 rounded-3xl w-full overflow-hidden shadow-2xl flex flex-col"
      >
        <div
          class="px-7 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0"
        >
          <div>
            <h3 class="text-xl font-extrabold tracking-tight text-[#0B1F4A]">
              Entri Jurnal Umum Baru
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
        <!-- Quick Templates Selector -->
        <div
          class="px-7 py-3 bg-blue-50/50 border-b border-blue-150 flex flex-wrap items-center gap-3 shrink-0 text-sm"
        >
          <span class="font-bold text-slate-600">Template Cepat:</span
          ><button
            v-for="tmpl in ['Umum', 'Pendapatan', 'Bayar Gaji', 'Langganan']"
            :id="`tmpl-select-${tmpl}`"
            :key="tmpl"
            type="button"
            :class="`inline-flex h-10 min-w-[104px] items-center justify-center rounded-xl px-4 text-sm font-bold transition-all ${selectedTemplate === tmpl ? 'bg-[#0B1F4A] text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`"
            @click="handleTemplateChange(tmpl)"
          >
            {{ tmpl }}
          </button>
        </div>
        <div class="p-6 text-sm space-y-4 flex-1">
          <div
            v-if="journalErrorCount > 0"
            class="form-validation-summary"
          >
            <strong>Form belum dapat disimpan.</strong>
            <span>Lengkapi {{ journalErrorCount }} kolom yang ditandai di bawah ini.</span>
          </div>
          <!-- Core Voucher & Date -->
          <div class="grid grid-cols-2 gap-4">
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
          <div class="grid gap-4 xl:grid-cols-2">
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
                    <option v-for="a in akun" :key="a.id" :value="a.kode">
                      {{ a.kode }} - {{ a.nama }} ({{ a.tipe }})
                    </option></select
                  ><input
                    :id="`debit-line-val-${idx}`"
                    type="number"
                    placeholder="Debit Nominal"
                    :value="line.nominal"
                    :class="[
                      'h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 font-mono text-sm text-slate-800 focus:outline-none',
                      {
                        'form-control-invalid':
                          journalFormErrors[`debitNominal-${idx}`],
                      },
                    ]"
                    @change="handleDebitRowChange(
                          idx,
                          'nominal',
                          Number(eventValue($event)),
                        )"
                  /><button
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
                    <option v-for="a in akun" :key="a.id" :value="a.kode">
                      {{ a.kode }} - {{ a.nama }} ({{ a.tipe }})
                    </option></select
                  ><input
                    :id="`credit-line-val-${idx}`"
                    type="number"
                    placeholder="Kredit Nominal"
                    :value="line.nominal"
                    :class="[
                      'h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 font-mono text-sm text-slate-800 focus:outline-none',
                      {
                        'form-control-invalid':
                          journalFormErrors[`creditNominal-${idx}`],
                      },
                    ]"
                    @change="handleCreditRowChange(
                          idx,
                          'nominal',
                          Number(eventValue($event)),
                        )"
                  /><button
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
          class="p-4 bg-[#F8FAFC] border-y border-slate-200/80 shrink-0 grid grid-cols-2 gap-4 font-mono"
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
            class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B1F4A] px-7 text-sm font-bold text-white shadow transition-all hover:bg-[#1E3A8A]"
            @click="handleSaveJournal"
          >
            Simpan Draft Jurnal
          </button>
        </div>
      </div>
      </div>
    </Teleport>
    <Teleport to="body">
      <div
      v-if="selectedAccountDetail"
      class="account-modal-layer fixed inset-0 z-[10080] flex items-center justify-center bg-[#111827]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl"
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
            @click="selectedAccountDetail = null"
          >
            ×
          </button>
        </div>
        <div class="grid gap-3 p-6 text-xs sm:grid-cols-2">
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
            class="rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-4"
          >
            <p class="text-[10px] font-bold uppercase text-[#94A3B8]">
              {{ label }}
            </p>
            <p class="mt-1 font-bold text-[#0B1F4A]">{{ value }}</p>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { computed, ref } from "vue";
import {
  Search,
  Plus,
  BookOpen,
  ArrowLeftRight,
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
} from "lucide-vue-next";
import { formatRupiah } from "../data.ts";
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
  },
} = useFinStartContext();
const activeTab = computed(() =>
  props.activeSection === "bukubesar" ? "ledger" : "journal",
);
// Search and Filters
const ledgerSearch = ref(""),
  updateLedgerSearch = (next) => (ledgerSearch.value = next);
const journalSearch = ref(""),
  updateJournalSearch = (next) => (journalSearch.value = next);
const journalDate = ref(""),
  updateJournalDate = (next) => (journalDate.value = next); // Add Account Form State
const ledgerPage = ref(1);
const journalPage = ref(1);
const isAccountModalOpen = ref(false),
  updateIsAccountModalOpen = (next) => (isAccountModalOpen.value = next);
const deleteConfirm = ref<any>(null);
const selectedAccountDetail = ref<any>(null);
const newAccount = ref({
    kode: "",
    nama: "",
    tipe: "Aset" as TipeAkun,
    saldo: 0,
    status: "active",
    parentId: "",
  }),
  updateNewAccount = (next) => (newAccount.value = next);

const accountInputClass =
  "w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none";

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
  { key: "status", id: "acc-form-status", label: "Status" },
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
  };
const selectedTemplate = ref("Umum"),
  updateSelectedTemplate = (next) => (selectedTemplate.value = next); // Multi-row Debit & Credit lines
const debitLines = ref([
    {
      kode: "1001",
      nominal: 0,
    },
  ]),
  updateDebitLines = (next) => (debitLines.value = next);
const creditLines = ref([
    {
      kode: "4001",
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
  updateSelectedTemplate("Umum");
  updateVoucherNo(`RV-${new Date().getFullYear()}${transaksi.length + 102}`);
};

// Handle template switch for fast entries
const handleTemplateChange = (tmpl: string) => {
  resetJournalFormErrors();
  updateSelectedTemplate(tmpl);
  if (tmpl === "Pendapatan") {
    updateMemo("Penerimaan termin pembayaran proyek teknologi klien");
    updateDebitLines([
      {
        kode: "1001",
        nominal: 150000000,
      },
    ]);
    updateCreditLines([
      {
        kode: "4001",
        nominal: 150000000,
      },
    ]);
  } else if (tmpl === "Bayar Gaji") {
    updateMemo("Pembayaran gaji tim pengembang & operasional Kedata");
    updateDebitLines([
      {
        kode: "5001",
        nominal: 45000000,
      },
    ]);
    updateCreditLines([
      {
        kode: "1001",
        nominal: 45000000,
      },
    ]);
  } else if (tmpl === "Langganan") {
    updateMemo("Pembayaran rutin tagihan lisensi cloud (AWS/OpenAI)");
    updateDebitLines([
      {
        kode: "5002",
        nominal: 12500000,
      },
    ]);
    updateCreditLines([
      {
        kode: "1001",
        nominal: 12500000,
      },
    ]);
  } else {
    updateMemo("");
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
  }
};

// Debit/Credit line modifiers
const handleAddDebitRow = () => {
  updateDebitLines([
    ...debitLines.value,
    {
      kode: "1001",
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
      kode: "1001",
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
  updateNewAccount({
    kode: "",
    nama: "",
    tipe: "Aset",
    saldo: 0,
    status: "active",
    parentId: "",
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
      parentId: raw.parent_id ? String(raw.parent_id) : "",
    });
  } else resetAccountForm();
  updateIsAccountModalOpen(true);
};

const closeAccountModal = () => {
  resetAccountFormErrors();
  updateIsAccountModalOpen(false);
};

// Add or edit account submission
const handleSaveAccount = async (e: Event) => {
  e.preventDefault();
  if (!validateAccountForm()) {
    notify("Lengkapi seluruh data akun sebelum menyimpan.");
    return;
  }
  if (
    !editingAccount.value &&
    akun.some((a) => a.kode === newAccount.value.kode)
  ) {
    notify("Kode akun sudah terdaftar di database.");
    return;
  }
  const item: any = { ...newAccount.value };
  if (editingAccount.value) await updateAccount(editingAccount.value, item);
  else await addAccount(item);
  closeAccountModal();
  resetAccountForm();
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
const handleSaveJournal = () => {
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
  addTransaction(transactionItem);
  updateIsJournalModalOpen(false);
  resetJournalForm();
  notify("Jurnal draft berhasil dibuat dan menunggu approval pengguna lain.");
};

// Filters
const filteredLedgers = computed(() =>
  latestFirst(
    (props.akun || []).filter((a: any) => {
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
    }),
  ),
);
const filteredJournals = computed(() =>
  latestFirst(
    (props.transaksi || []).filter((t: any) => {
      const query = journalSearch.value.toLowerCase();
      const matchesSearch =
        String(t.keterangan || "")
          .toLowerCase()
          .includes(query) ||
        String(t.refVoucher || "")
          .toLowerCase()
          .includes(query);
      const matchesDate = !journalDate.value || t.tanggal === journalDate.value;
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
const downloadBlobFile = (filename: string, blob: Blob) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const pdfEscape = (value: any) =>
  String(value ?? "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapPdfText = (value: any, maxLength = 78) => {
  const words = String(value ?? "-").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length ? lines : ["-"];
};

const buildJournalVoucherPdf = (transaction: Transaksi) => {
  const debitAccount = akun.find((item) => item.kode === transaction.debitAkun);
  const creditAccount = akun.find(
    (item) => item.kode === transaction.kreditAkun,
  );
  const content: string[] = [];
  const drawText = (
    text: any,
    x: number,
    y: number,
    size = 11,
    font = "F1",
  ) => {
    content.push(
      `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${pdfEscape(text)}) Tj ET`,
    );
  };
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    content.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  content.push("0.05 w");
  drawText("PT KEDATA INDONESIA DIGITAL", 52, 790, 16, "F2");
  drawText("Bukti Jurnal Umum", 52, 768, 11);
  drawLine(52, 752, 543, 752);
  drawText(`No. Voucher: ${transaction.refVoucher || transaction.id}`, 52, 724, 11, "F2");
  drawText(`Tanggal: ${transaction.tanggal || "-"}`, 52, 704, 11);
  let memoY = 684;
  wrapPdfText(`Keterangan: ${transaction.keterangan || "-"}`, 82).forEach(
    (line) => {
      drawText(line, 52, memoY, 11);
      memoY -= 16;
    },
  );

  const tableTop = memoY - 18;
  drawLine(52, tableTop, 543, tableTop);
  drawText("POSISI", 62, tableTop - 20, 9, "F2");
  drawText("AKUN", 170, tableTop - 20, 9, "F2");
  drawText("NILAI", 468, tableTop - 20, 9, "F2");
  drawLine(52, tableTop - 32, 543, tableTop - 32);

  const rows = [
    {
      posisi: "Debit",
      akun: `${transaction.debitAkun || "-"} - ${debitAccount?.nama || "-"}`,
      nilai: formatRupiah(transaction.nominal || 0),
    },
    {
      posisi: "Kredit",
      akun: `${transaction.kreditAkun || "-"} - ${creditAccount?.nama || "-"}`,
      nilai: formatRupiah(transaction.nominal || 0),
    },
  ];
  let rowY = tableTop - 54;
  rows.forEach((row) => {
    drawText(row.posisi, 62, rowY, 10);
    drawText(row.akun, 170, rowY, 10);
    drawText(row.nilai, 444, rowY, 10, "F2");
    drawLine(52, rowY - 14, 543, rowY - 14);
    rowY -= 34;
  });

  drawText(`Status: ${transaction.status || "-"}`, 52, rowY - 12, 10);
  drawText(`Diunduh: ${new Date().toLocaleDateString("id-ID")}`, 52, rowY - 30, 10);

  const stream = content.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += object;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const downloadJournalVoucher = (transaction: Transaksi) => {
  downloadBlobFile(
    `bukti-jurnal-${transaction.refVoucher || transaction.id}.pdf`,
    buildJournalVoucherPdf(transaction),
  );
  notify(`PDF bukti jurnal ${transaction.refVoucher} berhasil diunduh.`);
};
const availableParentAccounts = computed(() =>
  (props.akun || []).filter(
    (account) => String(account.id) !== String(editingAccount.value?.id),
  ),
);

const activeDivisions = computed(() =>
  (props.divisions || []).filter(
    (division) => String(division.status || "active") === "active",
  ),
);

function accountNameByCode(code: string) {
  return (props.akun || []).find((account) => account.kode === code)?.nama || "-";
}

function closeDeleteConfirm() {
  deleteConfirm.value = null;
}

</script>
