<script setup>
import { useRouter } from 'vue-router'
import FinStartLogo from '../assets/finstart-logo.png'

const router = useRouter()

function loginDemo() {
  router.push('/')
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <img :src="FinStartLogo" alt="FinStart logo" class="login-logo" />

      <h1>Selamat Datang</h1>
      <p>Masuk ke sistem FinStart Digital Accounting.</p>

      <form @submit.prevent="loginDemo">
        <label>Email</label>
        <input type="email" placeholder="nama@perusahaan.com" required />

        <label>Password</label>
        <input type="password" placeholder="Masukkan password" required />

        <button type="submit" class="primary-button">
          Masuk ke Sistem
        </button>
      </form>

      <small>Versi demo untuk pengembangan sistem.</small>
    </section>
  </main>
</template>