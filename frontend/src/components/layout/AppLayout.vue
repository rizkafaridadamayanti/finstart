<script setup>
import AppSidebar from './AppSidebar.vue'
import AppNavbar from './AppNavbar.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <section class="main-area">
      <AppNavbar />

      <main class="content-area">
        <RouterView />
      </main>
    </section>
  </div>
</template>