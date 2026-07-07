<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, ChevronDown, LogOut, Menu, Search, ShieldAlert, CheckCircle2, CircleDollarSign } from 'lucide-vue-next'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-sidebar', 'open-mobile'])
const router = useRouter()
const notificationOpen = ref(false)
const profileOpen = ref(false)
const query = ref('')

const userEmail = computed(() => localStorage.getItem('finstart-ui-user') || 'finance@kedata.id')
const displayName = computed(() => userEmail.value.split('@')[0].replace(/[._-]/g, ' '))
const initials = computed(() => userEmail.value.slice(0, 2).toUpperCase())
const today = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date())

const notifications = [
  { id: 'n1', tone: 'warning', time: 'Baru saja', text: 'Tagihan langganan server jatuh tempo dalam 3 hari.' },
  { id: 'n2', tone: 'info', time: '3 jam lalu', text: 'Termin invoice Bank Mandiri akan jatuh tempo 10 Juli.' },
  { id: 'n3', tone: 'success', time: 'Kemarin', text: 'Penyetoran PPh 21 Masa Mei berhasil diposting.' },
]

function logout() {
  localStorage.removeItem('finstart-ui-session')
  router.push({ name: 'landing' })
}

function doSearch() {
  const term = query.value.toLowerCase()
  if (term.includes('invoice') || term.includes('piutang')) router.push({ name: 'receivables' })
  else if (term.includes('utang') || term.includes('bill')) router.push({ name: 'payables' })
  else if (term.includes('jurnal') || term.includes('akun')) router.push({ name: 'transactions' })
  else if (term.includes('proyek') || term.includes('klien')) router.push({ name: 'crm-project' })
  else if (term.includes('pajak')) router.push({ name: 'taxes' })
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button v-if="props.collapsed" type="button" class="topbar-menu-show topbar-desktop" @click="emit('toggle-sidebar')">
        <Menu :size="20" />
      </button>
      <button type="button" class="topbar-menu-show topbar-mobile" @click="emit('open-mobile')">
        <Menu :size="20" />
      </button>

      <div class="topbar-title">
        <div>
          <strong>Finstart</strong>
          <span class="topbar-title__dot"></span>
          <em>CFO Workspace</em>
        </div>
        <small>Finance Command Center</small>
      </div>
    </div>

    <form class="global-search" @submit.prevent="doSearch">
      <Search :size="17" />
      <input v-model="query" type="search" placeholder="Cari modul, proyek, invoice, pajak, atau jurnal..." />
      <kbd>⌘ K</kbd>
    </form>

    <div class="topbar__right">
      <span class="topbar-date">{{ today }}</span>

      <div class="topbar-popover">
        <button class="topbar-action" type="button" aria-label="Notifikasi" @click="notificationOpen = !notificationOpen; profileOpen = false">
          <Bell :size="18" />
          <i></i>
        </button>
        <Transition name="popover">
          <section v-if="notificationOpen" class="notification-menu">
            <header>
              <div>
                <small>NOTIFIKASI</small>
                <strong>Aktivitas finansial</strong>
              </div>
              <span>{{ notifications.length }} baru</span>
            </header>
            <article v-for="notice in notifications" :key="notice.id" class="notification-item">
              <ShieldAlert v-if="notice.tone === 'warning'" class="notification-item__warning" :size="18" />
              <CircleDollarSign v-else-if="notice.tone === 'info'" class="notification-item__info" :size="18" />
              <CheckCircle2 v-else class="notification-item__success" :size="18" />
              <div>
                <p>{{ notice.text }}</p>
                <small>{{ notice.time }}</small>
              </div>
            </article>
          </section>
        </Transition>
      </div>

      <div class="topbar-popover">
        <button type="button" class="profile-trigger" @click="profileOpen = !profileOpen; notificationOpen = false">
          <span class="profile-trigger__avatar">{{ initials }}</span>
          <span class="profile-trigger__copy">
            <strong>{{ displayName }}</strong>
            <small>Finance Manager</small>
          </span>
          <ChevronDown :size="16" />
        </button>
        <Transition name="popover">
          <section v-if="profileOpen" class="profile-menu">
            <header>
              <small>HAK AKSES</small>
              <strong>{{ userEmail }}</strong>
              <span>PT Kedata Indonesia Digital</span>
            </header>
            <button type="button">Profil Saya</button>
            <button type="button">Ubah Password</button>
            <button type="button" class="profile-menu__logout" @click="logout">
              <LogOut :size="16" /> Keluar Sesi
            </button>
          </section>
        </Transition>
      </div>
    </div>
  </header>
</template>
