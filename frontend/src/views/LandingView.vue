<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRight, BarChart3, BellRing, BookOpenCheck, BrainCircuit, Check, ChevronRight,
  CircleDollarSign, CloudCog, Database, FileText, Landmark, Layers3, Menu,
  Network, ShieldCheck, Sparkles, Target, TrendingUp, UsersRound, WalletCards, X
} from 'lucide-vue-next'
import finstartLogo from '../assets/finstart-logo.png'
import kedataLogo from '../assets/kedata-logo-transparent.png'

const router = useRouter()
const mobileOpen = ref(false)
const activeFaq = ref(0)

const products = [
  { icon: CircleDollarSign, title: 'Financial Command Center', desc: 'Satu sumber kebenaran untuk kas, jurnal, piutang, utang, dan laporan eksekutif.' },
  { icon: BrainCircuit, title: 'Intelligent Finance Assistant', desc: 'Ringkasan kondisi bisnis yang membantu tim membaca prioritas finansial lebih cepat.' },
  { icon: Network, title: 'Connected Operations', desc: 'Modul yang terhubung antar proses untuk menjaga data dan keputusan tetap konsisten.' },
]

const capabilities = [
  ['Kendali kas dan arus dana', 'Pantau saldo kas, bank, kebutuhan pembayaran, dan arus dana dalam satu workspace.'],
  ['Akurasi buku besar', 'Pencatatan jurnal dan COA dibuat rapi agar laporan keuangan mudah ditelusuri.'],
  ['Kontrol piutang & utang', 'Kelola invoice, termin, jatuh tempo, dan pelunasan dengan konteks yang jelas.'],
  ['Perencanaan yang terukur', 'Susun proyeksi bisnis, anggaran, dan langkah tindak lanjut untuk setiap periode.'],
]

const cases = [
  { badge: 'HEALTH & RESEARCH', title: 'Pengambilan keputusan berbasis data', text: 'Menghubungkan operasional finansial dengan insight yang dapat dibaca tim pimpinan.' },
  { badge: 'PUBLIC SECTOR', title: 'Kolaborasi proses yang terstruktur', text: 'Menyatukan kebutuhan administrasi, akuntabilitas, dan pemantauan program.' },
  { badge: 'ENTERPRISE', title: 'Workspace untuk proses yang berkembang', text: 'Memberikan struktur kerja yang siap mengikuti organisasi dan transaksi yang terus tumbuh.' },
]

const faqs = [
  ['Apakah Finstart dapat digunakan untuk startup?', 'Ya. Finstart dirancang untuk tim yang ingin mengatur pencatatan, kontrol kas, dan analisis bisnis secara bertahap.'],
  ['Apakah data antar modul tersambung?', 'Setiap modul dirancang sebagai satu alur kerja sehingga konteks transaksi dapat diteruskan ke laporan dan insight.'],
  ['Apakah dapat dikembangkan sesuai kebutuhan perusahaan?', 'Struktur modular membantu pengembangan dilakukan tanpa perlu mengganti seluruh alur kerja finansial.'],
]

function login() {
  router.push({ name: 'login' })
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  mobileOpen.value = false
}
</script>

<template>
  <main class="landing">
    <div class="landing-noise"></div>
    <header class="landing-nav">
      <button type="button" class="landing-brand" @click="scrollTo('top')">
        <span class="landing-brand__mark"><img :src="finstartLogo" alt="FinStart" /></span>
        <span><strong>finstart</strong><small>Financial Operating System</small></span>
      </button>

      <nav class="landing-nav__links">
        <button type="button" @click="scrollTo('produk')">Produk</button>
        <button type="button" @click="scrollTo('kapabilitas')">Kapabilitas</button>
        <button type="button" @click="scrollTo('kepercayaan')">Kepercayaan</button>
        <button type="button" @click="scrollTo('faq')">FAQ</button>
      </nav>

      <div class="landing-nav__actions">
        <button type="button" class="landing-login-link" @click="login">Masuk</button>
        <button type="button" class="landing-primary-small" @click="login">Mulai Workspace <ArrowRight :size="15" /></button>
      </div>

      <button type="button" class="landing-mobile-menu" @click="mobileOpen = !mobileOpen">
        <X v-if="mobileOpen" :size="22" /><Menu v-else :size="22" />
      </button>

      <Transition name="drop">
        <nav v-if="mobileOpen" class="landing-mobile-nav">
          <button type="button" @click="scrollTo('produk')">Produk</button>
          <button type="button" @click="scrollTo('kapabilitas')">Kapabilitas</button>
          <button type="button" @click="scrollTo('kepercayaan')">Kepercayaan</button>
          <button type="button" @click="scrollTo('faq')">FAQ</button>
          <button type="button" class="landing-primary-small" @click="login">Masuk ke Workspace <ArrowRight :size="15" /></button>
        </nav>
      </Transition>
    </header>

    <section id="top" class="landing-hero">
      <div class="landing-hero__copy">
        <p class="landing-eyebrow"><Sparkles :size="15" /> FINANCIAL OPERATING SYSTEM</p>
        <h1>Keuangan yang <span>lebih jelas</span> untuk keputusan yang lebih pasti.</h1>
        <p class="landing-lead">
          Finstart menyatukan operasional finansial, kontrol bisnis, dan insight eksekutif
          dalam satu workspace yang rapi, cepat, dan siap berkembang.
        </p>
        <div class="landing-hero__actions">
          <button type="button" class="landing-cta" @click="login">Mulai kelola finansial <ArrowRight :size="18" /></button>
          <button type="button" class="landing-secondary" @click="scrollTo('produk')">Jelajahi solusi <ChevronRight :size="17" /></button>
        </div>
        <div class="landing-trust-line">
          <span><ShieldCheck :size="16" /> Struktur kerja terkontrol</span>
          <span><Database :size="16" /> Data terpusat</span>
          <span><BarChart3 :size="16" /> Insight siap dibaca</span>
        </div>
      </div>

      <div class="landing-hero__visual" aria-label="Preview dashboard Finstart">
        <div class="hero-orbit hero-orbit--one"></div>
        <div class="hero-orbit hero-orbit--two"></div>
        <article class="hero-dashboard-card">
          <header>
            <div>
              <small>FINSTART / OVERVIEW</small>
              <strong>Financial Health</strong>
            </div>
            <span class="hero-live"><i></i> Live</span>
          </header>
          <div class="hero-kpis">
            <div><small>Kas & Bank</small><b>Rp 12,48 jt</b><em>+12.8%</em></div>
            <div><small>Piutang</small><b>Rp 8,7 jt</b><em>On track</em></div>
            <div><small>Proyek aktif</small><b>12</b><em>+3 bulan ini</em></div>
          </div>
          <div class="hero-chart">
            <div class="hero-chart__labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span></div>
            <svg viewBox="0 0 520 170" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="dashboard-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="#60a5fa" stop-opacity=".48" />
                  <stop offset="100%" stop-color="#60a5fa" stop-opacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 150 C68 139,74 141,120 120 S180 132,220 102 S280 101,320 88 S389 73,420 61 S480 43,520 13 L520 170 L0 170Z" fill="url(#dashboard-area)" />
              <path d="M0 150 C68 139,74 141,120 120 S180 132,220 102 S280 101,320 88 S389 73,420 61 S480 43,520 13" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" />
              <path d="M0 160 C68 153,74 151,120 146 S180 152,220 135 S280 138,320 122 S389 110,420 95 S480 84,520 56" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-dasharray="7 7" stroke-linecap="round" />
            </svg>
          </div>
          <footer><span>Arus Kas Bersih</span><b>Rp 12.484.000</b><em>Data terbaru</em></footer>
        </article>
        <article class="hero-floating-card hero-floating-card--insight">
          <span><BrainCircuit :size="18" /></span><div><small>AI Insight</small><strong>Prioritas kas aman</strong></div>
        </article>
        <article class="hero-floating-card hero-floating-card--secure">
          <span><ShieldCheck :size="18" /></span><div><small>Security</small><strong>Workspace protected</strong></div>
        </article>
      </div>
    </section>

    <section class="landing-proof">
      <p>Dibuat untuk tim yang menuntut proses finansial lebih <b>terstruktur, terhubung, dan mudah dibaca.</b></p>
      <div>
        <span><Landmark :size="19" /> Financial Ops</span>
        <span><Layers3 :size="19" /> Modular Workspace</span>
        <span><Target :size="19" /> Executive Insight</span>
        <span><BookOpenCheck :size="19" /> Audit-ready Trail</span>
      </div>
    </section>

    <section id="produk" class="landing-section landing-section--products">
      <div class="section-heading">
        <p class="landing-eyebrow">KOMANDO FINANSIAL DALAM SATU TEMPAT</p>
        <h2>Modul yang bekerja sebagai satu sistem, bukan sekadar daftar fitur.</h2>
        <p>Bangun alur yang membantu tim melihat kondisi hari ini, menjalankan pekerjaan, dan menyiapkan langkah berikutnya.</p>
      </div>
      <div class="product-grid">
        <article v-for="product in products" :key="product.title" class="product-card">
          <span class="product-card__icon"><component :is="product.icon" :size="25" /></span>
          <h3>{{ product.title }}</h3>
          <p>{{ product.desc }}</p>
          <button type="button" @click="login">Lihat workspace <ArrowRight :size="16" /></button>
        </article>
      </div>
    </section>

    <section id="kapabilitas" class="landing-section landing-capabilities">
      <div class="capabilities-visual">
        <div class="capabilities-visual__pane">
          <span class="visual-label"><ActivityDot /> LIVE WORKSPACE</span>
          <div class="visual-flow">
            <div><CircleDollarSign :size="21" /><span>Transaksi</span></div>
            <i></i>
            <div><BookOpenCheck :size="21" /><span>Jurnal</span></div>
            <i></i>
            <div><BarChart3 :size="21" /><span>Insight</span></div>
          </div>
          <div class="visual-mini-card"><TrendingUp :size="20" /><span><small>Cashflow Forecast</small><b>Siap ditinjau</b></span></div>
        </div>
      </div>
      <div class="capabilities-copy">
        <p class="landing-eyebrow">RAPI DARI HULU KE HILIR</p>
        <h2>Data operasional menjadi dasar kerja yang lebih tenang.</h2>
        <div class="capability-list">
          <article v-for="item in capabilities" :key="item[0]">
            <span><Check :size="17" /></span>
            <div><h3>{{ item[0] }}</h3><p>{{ item[1] }}</p></div>
          </article>
        </div>
      </div>
    </section>

    <section id="kepercayaan" class="landing-section landing-section--cases">
      <div class="section-heading">
        <p class="landing-eyebrow">BUILT FOR IMPORTANT WORK</p>
        <h2>Struktur digital yang menyesuaikan konteks organisasi.</h2>
      </div>
      <div class="case-grid">
        <article v-for="item in cases" :key="item.title" class="case-card">
          <small>{{ item.badge }}</small>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
          <span>Explore case <ArrowRight :size="15" /></span>
        </article>
      </div>
    </section>

    <section class="landing-metric-band">
      <article><b>01</b><span>Workspace untuk proses keuangan yang selaras</span></article>
      <article><b>24/7</b><span>Visibilitas untuk tim yang membutuhkan kejelasan</span></article>
      <article><b>360°</b><span>Konteks operasional dari transaksi sampai keputusan</span></article>
    </section>

    <section id="faq" class="landing-section landing-faq">
      <div class="section-heading">
        <p class="landing-eyebrow">PERTANYAAN UMUM</p>
        <h2>Hal-hal yang perlu diketahui sebelum memulai.</h2>
      </div>
      <div class="faq-list">
        <article v-for="(faq, index) in faqs" :key="faq[0]" :class="{ 'faq-item--open': activeFaq === index }" class="faq-item">
          <button type="button" @click="activeFaq = activeFaq === index ? -1 : index">
            <span>{{ faq[0] }}</span><ChevronRight :size="20" />
          </button>
          <p v-if="activeFaq === index">{{ faq[1] }}</p>
        </article>
      </div>
    </section>

    <section class="landing-final-cta">
      <div>
        <p class="landing-eyebrow">READY TO MOVE WITH CLARITY</p>
        <h2>Mulai bangun fondasi finansial yang siap tumbuh.</h2>
        <p>Masuk ke workspace Finstart untuk mengatur keuangan, memantau prioritas, dan membaca bisnis dengan lebih jelas.</p>
      </div>
      <button type="button" class="landing-cta" @click="login">Masuk ke Finstart <ArrowRight :size="18" /></button>
    </section>

    <footer class="landing-footer">
      <div class="landing-footer__brand">
        <span class="landing-brand__mark"><img :src="finstartLogo" alt="FinStart" /></span>
        <span><strong>finstart</strong><small>Financial Operating System</small></span>
      </div>
      <p>© 2026 Finstart. Built for intentional finance operations.</p>
      <div class="landing-footer__partner">
        <img :src="kedataLogo" alt="Kedata" />
      </div>
    </footer>
  </main>
</template>

<script>
const ActivityDot = { template: '<span class="activity-dot"></span>' }
export default { components: { ActivityDot } }
</script>
