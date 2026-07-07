<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="placeholder-page">
    <p class="eyebrow">FINSTART MODULE</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>

    <div class="placeholder-content">
      <h3>Halaman sedang disiapkan</h3>
      <p>
        Struktur route dan layout sudah tersedia. Berikutnya halaman ini akan
        diisi tabel, pencarian, filter, form, modal, serta integrasi API.
      </p>
    </div>
  </section>
</template>