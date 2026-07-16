<template>
  <div class="fixed inset-0 z-50 overflow-hidden bg-[#081935] text-white">
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute left-[-8rem] top-[-5rem] h-72 w-72 rounded-full bg-[#1E5AA8]/20 blur-3xl"
      />
      <div
        class="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[#2C7AD2]/18 blur-3xl"
      />
      <div class="absolute inset-x-0 top-[22%] h-px bg-white/8" />
      <div class="absolute inset-x-0 bottom-[16%] h-px bg-white/6" />
      <div class="absolute left-[14%] top-0 h-full w-px bg-white/6" />
      <div class="absolute right-[12%] top-0 h-full w-px bg-white/5" />
    </div>

    <div
      class="relative z-10 flex min-h-screen items-center justify-center px-6 py-10"
    >
      <div class="loading-shell w-full max-w-6xl">
        <div class="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div class="space-y-8">
            <div
              class="inline-flex items-center gap-4 rounded-[28px] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm"
            >
              <div
                class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_30px_rgba(255,255,255,0.12)]"
              >
                <KedataLogo :size="40" />
              </div>
              <div>
                <p
                  class="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8AB8F1]"
                >
                  PT. Kedata Indonesia Digital
                </p>
                <h1
                  class="mt-1 text-xl font-extrabold tracking-[0.16em] text-white sm:text-3xl"
                >
                  FINSTART
                </h1>
                <p
                  class="mt-1 text-xs uppercase tracking-[0.16em] text-slate-300/80"
                >
                  Financial Operations Workspace
                </p>
              </div>
            </div>

            <div class="max-w-xl space-y-4">
              <p
                class="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8AB8F1]"
              >
                Login berhasil
              </p>
              <h2
                class="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl sm:text-[3.25rem]"
              >
                Menyiapkan ruang kerja Finstart Anda
              </h2>
              <p
                class="max-w-lg text-sm leading-7 text-slate-300/85 sm:text-base"
              >
                Sistem sedang memuat lingkungan kerja finansial, preferensi
                akses, dan data operasional untuk
                <span class="font-semibold text-white">{{ email }}</span> agar
                pengalaman masuk terasa aman, profesional, dan konsisten.
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <div
                v-for="[title, subtitle] in summaryCards"
                :key="title"
                class="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 backdrop-blur-sm"
              >
                <p class="text-sm font-semibold text-white">{{ title }}</p>
                <p class="mt-1 text-xs leading-6 text-slate-300/75">
                  {{ subtitle }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="rounded-[30px] border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-sm"
          >
            <div
              class="rounded-[26px] border border-white/8 bg-[#0D2146]/88 p-6"
            >
              <div
                class="flex items-center justify-between gap-3 border-b border-white/8 pb-4"
              >
                <div>
                  <p
                    class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#89B9F4]"
                  >
                    Loading sequence
                  </p>
                  <h3 class="mt-1 text-lg font-bold text-white">
                    Workspace Initialization
                  </h3>
                </div>
                <div
                  class="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300"
                >
                  <span class="h-2 w-2 rounded-full bg-emerald-400" />
                  Initializing
                </div>
              </div>

              <div
                class="mt-5 flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-4"
              >
                <div
                  class="relative flex h-16 w-16 items-center justify-center rounded-[22px] bg-white shadow-[0_16px_32px_rgba(255,255,255,0.12)]"
                >
                  <KedataLogo :size="40" />
                  <span
                    class="loading-logo-ring absolute inset-0 rounded-[22px] border border-[#53A0F5]/50"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-white">
                    Environment verified
                  </p>
                  <p class="mt-1 text-xs leading-6 text-slate-300/75">
                    Finstart sedang menghubungkan dashboard dan kontrol
                    operasional.
                  </p>
                </div>
              </div>

              <div class="mt-5 space-y-3">
                <div
                  v-for="(item, index) in loadingSteps"
                  :key="item.title"
                  class="loading-step flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4"
                  :style="{
                    '--step-delay': `${item.delay}s`,
                    '--pulse-delay': `${index * 0.18}s`,
                  }"
                >
                  <div
                    class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0B1F4A] shadow-[0_10px_24px_rgba(255,255,255,0.14)]"
                  >
                    <component :is="item.icon" class="h-5 w-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-3">
                      <p class="text-sm font-semibold text-white">
                        {{ item.title }}
                      </p>
                      <div
                        class="loading-live flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300"
                      >
                        <CheckCircle2 class="h-3.5 w-3.5" />
                        Live
                      </div>
                    </div>
                    <p class="mt-1 text-xs leading-6 text-slate-300/75">
                      {{ item.subtitle }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-5 overflow-hidden rounded-full bg-white/8">
                <div
                  class="loading-progress h-2 rounded-full bg-gradient-to-r from-[#247ED4] via-[#65A9F4] to-[#C5DFFF]"
                />
              </div>
              <div
                class="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
              >
                <span>Loading Finstart Environment</span>
                <span>Almost ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircle2, ShieldCheck, Workflow } from "lucide-vue-next";
import KedataLogo from "./KedataLogo.vue";

defineProps({
  email: {
    type: String,
    default: "",
  },
});

const summaryCards = [
  ["Secure Workspace", "Kontrol role & sesi aktif"],
  ["Data Ready", "Proyek, kas, dan laporan"],
  ["Consistent Experience", "UI operasional terselaraskan"],
];

const loadingSteps = [
  {
    title: "Memvalidasi akses workspace",
    subtitle: "Hak akses dan role pengguna diverifikasi",
    icon: ShieldCheck,
    delay: 0.08,
  },
  {
    title: "Menyiapkan modul operasional",
    subtitle: "Dashboard, proyek, transaksi, dan laporan dimuat",
    icon: Workflow,
    delay: 0.22,
  },
  {
    title: "Menyelaraskan preferensi pengguna",
    subtitle: "Notifikasi, sesi aktif, dan preferensi tampilan diterapkan",
    icon: CheckCircle2,
    delay: 0.36,
  },
];
</script>

<style scoped>
.loading-shell {
  animation: loadingShellIn 0.6s ease-out both;
}

.loading-logo-ring {
  animation: loadingLogoRing 2.3s ease-in-out infinite;
}

.loading-step {
  animation: loadingStepIn 0.48s ease-out both;
  animation-delay: var(--step-delay);
}

.loading-live {
  animation: loadingLivePulse 1.8s ease-in-out infinite;
  animation-delay: var(--pulse-delay);
}

.loading-progress {
  animation: loadingProgress 2.35s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes loadingShellIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loadingLogoRing {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(1);
  }

  50% {
    opacity: 0.2;
    transform: scale(1.12);
  }
}

@keyframes loadingStepIn {
  from {
    opacity: 0;
    transform: translateX(18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes loadingLivePulse {
  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }
}

@keyframes loadingProgress {
  0% {
    width: 12%;
  }

  25% {
    width: 32%;
  }

  50% {
    width: 58%;
  }

  75% {
    width: 81%;
  }

  100% {
    width: 96%;
  }
}
</style>
