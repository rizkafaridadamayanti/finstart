<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Database, Workflow } from 'lucide-vue-next'
import finstartLogo from '../assets/finstart-logo.png'

const router = useRouter()
let timer

onMounted(() => {
  timer = window.setTimeout(() => router.replace({ name: 'landing' }), 2600)
})

onUnmounted(() => window.clearTimeout(timer))
</script>

<template>
  <main class="splash-screen">
    <div class="splash-grid"></div>
    <div class="splash-orb splash-orb--one"></div>
    <div class="splash-orb splash-orb--two"></div>

    <section class="splash-card">
      <div class="splash-logo-wrap">
        <span class="splash-ripple splash-ripple--one"></span>
        <span class="splash-ripple splash-ripple--two"></span>
        <img :src="finstartLogo" alt="FinStart" class="splash-logo" />
      </div>

      <div class="splash-copy">
        <p class="splash-copy__eyebrow"><Workflow :size="14" /> FINANCIAL OPERATING SYSTEM</p>
        <h1>finstart</h1>
        <p>Menyelaraskan data, transaksi, dan keputusan finansial dalam satu workspace.</p>
      </div>

      <div class="splash-loader">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <p class="splash-status"><Database :size="15" /> Menyiapkan financial command center</p>
    </section>

    <footer class="splash-footer">
      <Workflow :size="15" />
      <span>Secure Finance Workspace · v1.0</span>
    </footer>
  </main>
</template>
