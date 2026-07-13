<template>
  <div
    class="finstart-splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden text-white"
  >
    <div
      class="fs-stage relative z-10 flex w-full max-w-4xl flex-col items-center text-center"
    >
      <div class="fs-logo-cluster">
        <span class="fs-burst-ring" />
        <span class="fs-burst-ring" />

        <span
          v-for="item in menuIconItems"
          :key="item.label"
          class="fs-menu-orbit"
          :style="{
            left: `calc(50% + ${(item.x / 780) * 100}%)`,
            top: `calc(50% + ${(item.y / 610) * 100}%)`,
            '--fs-delay': item.delay,
          }"
          :title="item.label"
          :aria-label="item.label"
        >
          <component :is="item.icon" />
        </span>

        <div
          class="fs-logo-shell flex items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_28px_78px_rgba(0,0,0,.28)]"
        >
          <img
            :src="FinStartSplashLogo"
            class="fs-logo h-full w-full rounded-full object-contain"
            alt="Logo FinStart"
          />
        </div>
      </div>

      <div class="fs-word-wrap overflow-hidden">
        <p class="fs-word font-black">
          FINSTART
        </p>
      </div>

      <div class="fs-company">
        <p
          class="mt-2 text-[12px] font-bold uppercase tracking-[.24em] text-[#BFD8F7]"
        >
          PT Kedata Indonesia Digital
        </p>
        <p
          class="mt-1 text-[11px] font-semibold uppercase tracking-[.18em] text-[#8FB2DD]"
        >
          Financial Operations Workspace
        </p>
      </div>

      <div class="fs-loader-wrap overflow-hidden rounded-full border border-white/18 bg-white/12 p-[4px] shadow-[0_18px_44px_rgba(0,0,0,.22)] backdrop-blur-xl">
        <span
          class="fs-loader relative block h-2 overflow-hidden rounded-full bg-gradient-to-r from-[#ffffff] via-[#2BA7FF] to-[#16A085]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Briefcase,
  Cloud,
  FileText,
  LayoutDashboard,
  Percent,
  Settings,
  TrendingUp,
  Users,
} from "lucide-vue-next";
import FinStartSplashLogo from "../assets/finstart-splash-logo.png";

const emit = defineEmits(["complete"]);

const menuIconItems = [
  { label: "Proyeksi", icon: TrendingUp, x: 0, y: -230, delay: "1.23s" },
  { label: "Langganan", icon: Cloud, x: 126, y: -196, delay: "1.32s" },
  { label: "SDM", icon: Users, x: 224, y: -126, delay: "1.41s" },
  { label: "Aset", icon: Box, x: 270, y: -25, delay: "1.5s" },
  {
    label: "Pengaturan",
    icon: Settings,
    x: 238,
    y: 101,
    delay: "1.59s",
  },
  {
    label: "Buku Besar",
    icon: BookOpen,
    x: 151,
    y: 184,
    delay: "1.68s",
  },
  { label: "Laporan", icon: FileText, x: 32, y: 218, delay: "1.77s" },
  {
    label: "Transaksi",
    icon: ArrowLeftRight,
    x: -96,
    y: 205,
    delay: "1.86s",
  },
  {
    label: "Piutang",
    icon: ArrowDownLeft,
    x: -203,
    y: 146,
    delay: "1.95s",
  },
  {
    label: "Utang",
    icon: ArrowUpRight,
    x: -263,
    y: 51,
    delay: "2.04s",
  },
  { label: "Pajak", icon: Percent, x: -263, y: -51, delay: "2.13s" },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    x: -203,
    y: -146,
    delay: "2.22s",
  },
  { label: "CRM", icon: Briefcase, x: -96, y: -205, delay: "2.31s" },
];

let completeTimer;

onMounted(() => {
  completeTimer = window.setTimeout(() => emit("complete"), 5000);
});

onUnmounted(() => {
  window.clearTimeout(completeTimer);
});
</script>

<style scoped>
.finstart-splash {
  min-height: 100vh;
  min-height: 100dvh;
  padding:
    max(16px, env(safe-area-inset-top))
    max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom))
    max(16px, env(safe-area-inset-left));
  background:
    radial-gradient(
      circle at 50% 42%,
      rgba(43, 167, 255, 0.32),
      transparent 32%
    ),
    radial-gradient(
      circle at 50% 18%,
      rgba(22, 160, 133, 0.16),
      transparent 24%
    ),
    linear-gradient(145deg, #0b1f4a 0%, #102a56 48%, #071735 100%);
}

.finstart-splash::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(circle at center, black 18%, transparent 82%);
  animation: fsGridDrift 4s linear infinite;
}

.finstart-splash::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: -20%;
  opacity: 0.34;
  background:
    linear-gradient(
      115deg,
      transparent 35%,
      rgba(43, 167, 255, 0.18) 49%,
      transparent 63%
    ),
    linear-gradient(
      65deg,
      transparent 42%,
      rgba(22, 160, 133, 0.14) 54%,
      transparent 68%
    );
  animation: fsBeamSweep 3.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.fs-stage {
  --fs-size: min(620px, calc(100vw - 56px), calc((100dvh - 230px) * 1.1));
  animation: fsStageIn 0.52s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fs-logo-cluster {
  position: relative;
  width: var(--fs-size);
  height: calc(var(--fs-size) * 0.782);
  max-width: 100%;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fs-logo-shell {
  position: relative;
  z-index: 3;
  isolation: isolate;
  width: clamp(88px, calc(var(--fs-size) * 0.225), 176px);
  height: clamp(88px, calc(var(--fs-size) * 0.225), 176px);
  padding: clamp(7px, calc(var(--fs-size) * 0.015), 12px);
  animation:
    fsLogoFirst 0.78s cubic-bezier(0.16, 1, 0.3, 1) both,
    fsLogoShake 0.62s cubic-bezier(0.2, 0.9, 0.18, 1) 1s both,
    fsLogoFloat 2.8s ease-in-out 1.72s infinite;
}

.fs-logo-shell::before {
  content: none;
}

.fs-logo-shell::after {
  content: none;
}

.fs-logo {
  animation: fsLogoImage 0.78s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fs-burst-ring {
  position: absolute;
  z-index: 1;
  width: 188px;
  height: 188px;
  border: 1px solid rgba(107, 193, 255, 0.32);
  border-radius: 999px;
  opacity: 0;
  animation: fsBurstRing 1.24s cubic-bezier(0.16, 1, 0.3, 1) 1.08s both;
}

.fs-burst-ring:nth-child(2) {
  animation-delay: 1.26s;
}

.fs-menu-orbit {
  position: absolute;
  z-index: 2;
  display: flex;
  width: clamp(34px, calc(var(--fs-size) * 0.069), 54px);
  height: clamp(34px, calc(var(--fs-size) * 0.069), 54px);
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(199, 226, 255, 0.96);
  border-radius: clamp(12px, calc(var(--fs-size) * 0.023), 18px);
  background: rgba(255, 255, 255, 0.96);
  color: #1e5aa8;
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.12);
  opacity: 0;
  transform: translate(-50%, -50%) translate(0, 0) scale(0.34);
  animation:
    fsIconBurst 0.78s cubic-bezier(0.16, 1, 0.3, 1) var(--fs-delay) both,
    fsIconFloat 2.9s ease-in-out calc(var(--fs-delay) + 0.78s) infinite;
}

.fs-menu-orbit svg {
  width: clamp(15px, calc(var(--fs-size) * 0.028), 22px);
  height: clamp(15px, calc(var(--fs-size) * 0.028), 22px);
  stroke-width: 2.2;
}

.fs-word-wrap {
  margin-top: clamp(2px, 1vh, 8px);
  opacity: 0;
  transform: translateY(16px);
  animation: fsTextRise 0.83s cubic-bezier(0.16, 1, 0.3, 1) 2.58s both;
}

.fs-word {
  font-size: clamp(1.8rem, calc(var(--fs-size) * 0.067), 3.25rem);
  letter-spacing: 0.23em;
  color: #ffffff;
  text-shadow: 0 10px 32px rgba(0, 0, 0, 0.28);
}

.fs-company {
  opacity: 0;
  transform: translateY(10px);
  animation: fsTextRise 0.72s cubic-bezier(0.16, 1, 0.3, 1) 2.85s both;
}

.fs-company p {
  max-width: calc(100vw - 32px);
  overflow-wrap: anywhere;
}

.fs-loader-wrap {
  width: min(320px, calc(100vw - 48px));
  margin-top: clamp(12px, 2.5vh, 24px);
  opacity: 0;
  transform: translateY(10px);
  animation: fsTextRise 0.63s cubic-bezier(0.16, 1, 0.3, 1) 3.06s both;
}

.fs-loader {
  transform-origin: left;
  animation: fsLoad 1.08s cubic-bezier(0.22, 1, 0.36, 1) 3.12s both;
}

.fs-loader::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.76),
    transparent
  );
  transform: translateX(-100%);
  animation: fsGlint 1.23s ease-in-out 3.3s infinite;
}

@keyframes fsStageIn {
  from {
    opacity: 0;
    transform: translateY(48px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fsGridDrift {
  from {
    background-position:
      0 0,
      0 0;
  }
  to {
    background-position:
      54px 54px,
      54px 54px;
  }
}

@keyframes fsBeamSweep {
  from {
    transform: translateX(-16%);
  }
  to {
    transform: translateX(16%);
  }
}

@keyframes fsLogoFirst {
  from {
    opacity: 0;
    transform: scale(0.62) rotate(-7deg);
    filter: blur(10px);
  }
  68% {
    opacity: 1;
    transform: scale(1.06) rotate(1deg);
    filter: blur(0);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
    filter: blur(0);
  }
}

@keyframes fsLogoImage {
  from {
    opacity: 0;
    transform: scale(0.82);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fsLogoShake {
  0%,
  100% {
    transform: translateX(0) rotate(0deg) scale(1);
  }
  15% {
    transform: translateX(-7px) rotate(-3deg) scale(1.015);
  }
  30% {
    transform: translateX(7px) rotate(3deg) scale(1.025);
  }
  45% {
    transform: translateX(-5px) rotate(-2deg) scale(1.02);
  }
  60% {
    transform: translateX(5px) rotate(2deg) scale(1.012);
  }
  78% {
    transform: translateX(-2px) rotate(-1deg) scale(1.006);
  }
}

@keyframes fsLogoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fsRingPop {
  from {
    opacity: 0;
    transform: scale(0.76);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fsRingSpin {
  to {
    rotate: 360deg;
  }
}

@keyframes fsLogoScan {
  0% {
    opacity: 0;
    transform: translateY(-115%);
  }
  28% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: translateY(115%);
  }
}

@keyframes fsBurstRing {
  from {
    opacity: 0.72;
    transform: scale(0.2);
  }
  to {
    opacity: 0;
    transform: scale(2.24);
  }
}

@keyframes fsIconBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) translate(0, 0) scale(0.28);
    filter: blur(7px);
  }
  72% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.1);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
    filter: blur(0);
  }
}

@keyframes fsIconFloat {
  0%,
  100% {
    margin-top: 0;
  }
  50% {
    margin-top: -5px;
  }
}

@keyframes fsTextRise {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fsLoad {
  from {
    transform: scaleX(0.08);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes fsGlint {
  from {
    transform: translateX(-110%);
  }
  to {
    transform: translateX(110%);
  }
}

@media (max-height: 540px) {
  .fs-stage {
    --fs-size: min(440px, calc(100vw - 56px), calc((100dvh - 124px) * 1.1));
  }

  .fs-company {
    display: none;
  }

  .fs-loader-wrap {
    margin-top: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .finstart-splash::before,
  .finstart-splash::after,
  .fs-stage,
  .fs-logo-shell,
  .fs-logo-shell::before,
  .fs-logo-shell::after,
  .fs-logo,
  .fs-burst-ring,
  .fs-menu-orbit,
  .fs-word-wrap,
  .fs-company,
  .fs-loader-wrap,
  .fs-loader,
  .fs-loader::after {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>
