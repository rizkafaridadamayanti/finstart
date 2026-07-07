<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircle2, Database, ShieldCheck } from 'lucide-vue-next'
import finstartLogo from '../assets/finstart-logo.png'

const router = useRouter()
const email = computed(() => localStorage.getItem('finstart-ui-user') || 'finance@kedata.id')
let timer

onMounted(() => {
  timer = window.setTimeout(() => router.replace({ name: 'dashboard' }), 2400)
})
onUnmounted(() => window.clearTimeout(timer))
</script>

<template>
  <main class="auth-loading">
    <div class="auth-loading__orb auth-loading__orb--one"></div>
    <div class="auth-loading__orb auth-loading__orb--two"></div>
    <section class="auth-loading__card">
      <div class="auth-loading__logo"><img :src="finstartLogo" alt="FinStart" /></div>
      <p class="landing-eyebrow"><ShieldCheck :size="14" /> AUTHENTICATED WORKSPACE</p>
      <h1>Menyiapkan command center Anda.</h1>
      <p>Halo {{ email.split('@')[0] }}, kami sedang menyelaraskan informasi finansial terbaru.</p>

      <div class="auth-loading__progress"><span></span></div>
      <div class="auth-loading__steps">
        <p><CheckCircle2 :size="16" /> Memverifikasi akses workspace</p>
        <p><CheckCircle2 :size="16" /> Menyiapkan preferensi pengguna</p>
        <p class="auth-loading__steps--active"><Database :size="16" /> Menyelaraskan ringkasan finansial</p>
      </div>
      <footer><ShieldCheck :size="15" /> Workspace secure · Mengalihkan ke dashboard</footer>
    </section>
  </main>
</template>
