<template>
  <div class="loading-screen">
    <div class="loading-glow loading-glow--a" aria-hidden="true" />
    <div class="loading-glow loading-glow--b" aria-hidden="true" />

    <div class="loading-card">
      <div class="loading-logo">
        <KedataLogo :size="58" />
        <span class="loading-logo-ring" />
      </div>
      <h1 class="loading-title">FINSTART</h1>
      <p class="loading-text">Menyiapkan workspace Anda...</p>
      <div class="loading-bar-track">
        <div class="loading-bar-fill" />
      </div>
    </div>
  </div>
</template>

<script setup>
import KedataLogo from "./KedataLogo.vue";

defineProps({
  email: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #081935;
}

.loading-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(70px);
}

.loading-glow--a {
  left: -6rem;
  top: -5rem;
  height: 18rem;
  width: 18rem;
  background: rgba(30, 90, 168, 0.22);
}

.loading-glow--b {
  right: -6rem;
  bottom: -5rem;
  height: 20rem;
  width: 20rem;
  background: rgba(44, 122, 210, 0.18);
}

.loading-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: loadingCardIn 0.5s ease-out both;
}

.loading-logo {
  position: relative;
  display: flex;
  height: 7.5rem;
  width: 7.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 2rem;
  background: #ffffff;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.28);
}

.loading-logo-ring {
  position: absolute;
  inset: -10px;
  border-radius: inherit;
  border: 2px solid rgba(83, 160, 245, 0.55);
  animation: loadingRing 2s ease-in-out infinite;
}

.loading-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #ffffff;
}

.loading-text {
  margin-top: -0.75rem;
  font-size: 1.0625rem;
  color: rgba(203, 224, 250, 0.8);
}

.loading-bar-track {
  margin-top: 0.75rem;
  height: 6px;
  width: 19rem;
  overflow: hidden;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
}

.loading-bar-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #247ed4, #65a9f4, #c5dfff);
  animation: loadingBar 1.6s ease-in-out infinite;
}

@keyframes loadingCardIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingRing {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 0.15;
    transform: scale(1.12);
  }
}

@keyframes loadingBar {
  0% {
    width: 10%;
    margin-left: 0%;
  }

  50% {
    width: 60%;
    margin-left: 20%;
  }

  100% {
    width: 10%;
    margin-left: 100%;
  }
}
</style>
