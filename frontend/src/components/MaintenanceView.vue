<script setup lang="ts">
import { Wrench, Clock3, ShieldCheck } from 'lucide-vue-next'
</script>

<template>
  <main class="maintenance-page">
    <section class="maintenance-card">
      <div class="maintenance-logo">
        <img
          src="../assets/finstart-logo.png"
          alt="FinStart"
        />
      </div>

      <p class="maintenance-label">
        FINSTART · FINANCIAL OPERATIONS
      </p>

      <div class="maintenance-icon">
        <Wrench :size="34" />
      </div>

      <h1>Sistem Sedang Dalam Pemeliharaan</h1>

      <p class="maintenance-description">
        Kami sedang melakukan peningkatan dan penyesuaian sistem agar
        layanan FinStart dapat digunakan dengan lebih stabil.
      </p>

      <div class="maintenance-information">
        <div class="information-item">
          <Clock3 :size="20" />

          <div>
            <strong>Pemeliharaan sementara</strong>
            <span>Silakan akses kembali beberapa saat lagi.</span>
          </div>
        </div>

        <div class="information-item">
          <ShieldCheck :size="20" />

          <div>
            <strong>Data tetap aman</strong>
            <span>Seluruh data perusahaan tetap tersimpan dengan aman.</span>
          </div>
        </div>
      </div>

      <div class="maintenance-status">
        <span class="status-dot" />
        Tim sedang melakukan pemeliharaan sistem
      </div>

      <p class="maintenance-footer">
        PT Kedata Indonesia Digital © 2026
      </p>
    </section>
  </main>
</template>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(20px, 5vw, 64px);
  background:
    radial-gradient(
      circle at top right,
      rgba(50, 115, 220, 0.22),
      transparent 38%
    ),
    linear-gradient(145deg, #071b42 0%, #0d2b61 100%);
}

.maintenance-card {
  width: min(100%, 680px);
  padding: clamp(28px, 6vw, 58px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: clamp(24px, 4vw, 36px);
  background: rgba(8, 30, 70, 0.76);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  color: #ffffff;
  text-align: center;
}

.maintenance-logo {
  width: 76px;
  height: 76px;
  margin: 0 auto 18px;
  display: grid;
  place-items: center;
  border-radius: 22px;
  background: #ffffff;
}

.maintenance-logo img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.maintenance-label {
  margin: 0 0 26px;
  color: #8dbdff;
  font-size: clamp(11px, 2vw, 13px);
  font-weight: 800;
  letter-spacing: 0.16em;
}

.maintenance-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(74, 144, 255, 0.16);
  color: #85b8ff;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 6vw, 48px);
  line-height: 1.15;
}

.maintenance-description {
  max-width: 540px;
  margin: 20px auto 30px;
  color: #bed0e9;
  font-size: clamp(14px, 2.5vw, 17px);
  line-height: 1.75;
}

.maintenance-information {
  display: grid;
  gap: 12px;
  text-align: left;
}

.information-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.information-item svg {
  flex: 0 0 auto;
  margin-top: 2px;
  color: #83b8ff;
}

.information-item div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.information-item strong {
  font-size: 14px;
}

.information-item span {
  color: #aec0da;
  font-size: 13px;
  line-height: 1.5;
}

.maintenance-status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  padding: 11px 16px;
  border-radius: 999px;
  background: rgba(45, 211, 143, 0.1);
  color: #9ce7c7;
  font-size: 13px;
  font-weight: 700;
}

.status-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #2dd38f;
  box-shadow: 0 0 0 6px rgba(45, 211, 143, 0.13);
  animation: pulse 1.8s infinite;
}

.maintenance-footer {
  margin: 28px 0 0;
  color: rgba(210, 224, 243, 0.58);
  font-size: 12px;
}

@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 520px) {
  .maintenance-card {
    padding: 28px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot {
    animation: none;
  }
}
</style>