<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '../../stores/financeStore'

const router = useRouter()
const financeStore = useFinanceStore()
const searchTerm = ref('')
const showNotification = ref(false)

const notificationItems = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const items = []

  const overdueInvoices = financeStore.receivables.filter((item) => {
    return item.status === 'Overdue' || (item.dueDate < today && item.status !== 'Draft' && item.status !== 'Paid')
  })
  if (overdueInvoices.length) items.push(`${overdueInvoices.length} invoice membutuhkan tindak lanjut`)

  const overdueBills = financeStore.payables.filter((item) => item.dueDate < today && item.status !== 'Paid')
  if (overdueBills.length) items.push(`${overdueBills.length} tagihan vendor perlu diperiksa`)

  const overdueTaxes = financeStore.taxObligations.filter((item) => item.dueDate < today && item.status !== 'Dibayar')
  if (overdueTaxes.length) items.push(`${overdueTaxes.length} kewajiban pajak perlu diperiksa`)

  if (!items.length) items.push('Tidak ada notifikasi prioritas saat ini')
  return items
})

function runSearch() {
  const text = searchTerm.value.toLowerCase().trim()
  if (!text) return

  let routeName = 'dashboard'
  if (/(invoice|piutang|tagihan klien)/.test(text)) routeName = 'receivables'
  else if (/(utang|vendor|bill|tagihan vendor)/.test(text)) routeName = 'payables'
  else if (/(proyek|project|klien|client|tender)/.test(text)) routeName = 'crm-project'
  else if (/(jurnal|transaksi|debit|kredit)/.test(text)) routeName = 'transactions'
  else if (/(akun|coa|buku besar)/.test(text)) routeName = 'general-ledger'
  else if (/(pajak|ppn|pph|ntpn|spt)/.test(text)) routeName = 'taxes'
  else if (/(langganan|subscription|saas)/.test(text)) routeName = 'subscriptions'
  else if (/(pegawai|sdm|bpjs|payroll)/.test(text)) routeName = 'employees'
  else if (/(aset|penyusutan)/.test(text)) routeName = 'assets'
  else if (/(laporan|neraca|laba rugi|arus kas)/.test(text)) routeName = 'reports'
  else if (/(target|proyeksi|roadmap)/.test(text)) routeName = 'projections'

  router.push({ name: routeName })
  searchTerm.value = ''
}
</script>

<template>
  <header class="navbar">
    <form class="search-box" @submit.prevent="runSearch">
      <span>⌕</span>
      <input v-model="searchTerm" type="text" placeholder="Cari modul: proyek, invoice, pajak, jurnal, atau laporan..." />
    </form>

    <div class="navbar-actions">
      <div class="navbar-notification-wrap">
        <button class="icon-button" type="button" title="Notifikasi" @click="showNotification = !showNotification">
          ♢
          <span v-if="notificationItems.length" class="notification-dot"></span>
        </button>

        <div v-if="showNotification" class="navbar-notification-menu">
          <strong>Notifikasi Prioritas</strong>
          <p v-for="item in notificationItems" :key="item">{{ item }}</p>
        </div>
      </div>

      <button class="profile-button" type="button" @click="router.push({ name: 'settings' })">
        <span class="profile-avatar">RF</span>
        <span class="profile-text"><strong>Rizka Farida</strong><small>Finance Manager</small></span>
        <span>⌄</span>
      </button>
    </div>
  </header>
</template>
