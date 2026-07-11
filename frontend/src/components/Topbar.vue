<template>
  <header
    class="sticky top-0 z-30 grid h-[88px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/70 bg-white/95 py-0 pl-9 pr-5 shadow-[0_12px_34px_rgba(16,42,86,0.07)] backdrop-blur-2xl sm:pl-10 md:pr-8 lg:pl-[104px]"
  >
    <div class="flex min-w-0 items-center">
      <div class="flex min-w-0 items-center gap-3">
        <img
          :src="FinStartLogo"
          alt="Finstart logo"
          class="h-11 w-11 shrink-0 object-contain"
        />
        <div class="min-w-0">
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="truncate text-[21px] font-extrabold tracking-[-0.02em] text-[#102A56]"
            >
              Finstart
            </div>
            <span
              class="hidden h-1.5 w-1.5 rounded-full bg-[#2BA7FF] sm:block"
            />
            <span
              class="hidden rounded-full border border-[#DCE7F4] bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#52647E] shadow-[0_8px_18px_rgba(16,42,86,0.05)] md:inline-flex"
            >
              {{ roleLabel }}
            </span>
          </div>
          <div
            class="hidden truncate text-[10px] font-bold uppercase tracking-[0.24em] text-[#7A8CA8] sm:block"
          >
            Workspace Operasional Internal
          </div>
        </div>
      </div>
    </div>

    <div class="flex min-w-0 items-center gap-3">
      <span
        class="hidden whitespace-nowrap text-[12px] font-medium text-[#8492A6] xl:block"
        >{{ formattedDate }}</span
      >

      <div class="relative">
        <button
          id="btn-profile-dropdown"
          type="button"
          class="grid h-12 min-w-[190px] grid-cols-[34px_minmax(0,1fr)_16px] items-center gap-3 rounded-2xl border border-[#D8E5F4] bg-white/92 px-2.5 shadow-[0_10px_24px_rgba(16,42,86,0.07)] transition-colors hover:bg-white max-sm:min-w-0 max-sm:grid-cols-[34px_16px]"
          aria-label="Buka menu profil"
          @click="isProfileOpen = !isProfileOpen"
        >
          <div
            class="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#0B3A78] text-xs font-extrabold text-white shadow-lg shadow-[#1E5AA8]/20"
          >
            {{ userInitials }}
          </div>
          <div class="hidden min-w-0 flex-col text-left sm:flex">
            <span class="block truncate text-xs font-bold text-slate-700">{{
              userName
            }}</span>
            <span
              class="block truncate text-[9px] font-semibold uppercase leading-3 text-slate-400"
              >{{ roleLabel }}</span
            >
          </div>
          <ChevronDown class="h-3.5 w-3.5 text-slate-400" />
        </button>

        <div
          v-if="isProfileOpen"
          class="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl"
        >
          <div class="border-b border-slate-100 bg-slate-50 p-4">
            <span class="block text-[10px] font-bold uppercase text-[#2563EB]"
              >Hak Akses</span
            >
            <span class="block truncate text-xs font-bold text-slate-800">{{
              userEmailValue
            }}</span>
            <span class="mt-0.5 block text-[10px] text-slate-500"
              >{{ roleLabel }} · PT Kedata Indonesia Digital</span
            >
          </div>
          <div class="divide-y divide-slate-100 p-2 text-xs">
            <div class="py-1">
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-slate-600 transition-colors hover:bg-slate-50"
                @click="openSettings"
              >
                Ubah Password
              </button>
              <button
                type="button"
                class="w-full rounded-lg px-3 py-2 text-left text-slate-600 transition-colors hover:bg-slate-50"
                @click="openSettings"
              >
                Profil & Keamanan
              </button>
            </div>
            <div class="py-1">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                @click="logout"
              >
                <LogOut class="h-4 w-4" />
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from "vue";
import { ChevronDown, LogOut } from "lucide-vue-next";
import FinStartLogo from "../assets/finstart-logo.png";

const props = defineProps({
  userEmail: { type: String, default: "" },
  notifications: { type: Array, default: () => [] },
  userRole: { type: String, default: "" },
});

const emit = defineEmits(["logout", "open-settings"]);

const isProfileOpen = ref(false);

const roleLabel = computed(() => {
  const labels = {
    admin: "Keuangan Internal",
    finance_manager: "Keuangan Internal",
    finance: "Keuangan Internal",
    hr: "Keuangan Internal",
    tax: "Keuangan Internal",
    project_manager: "Keuangan Internal",
    director: "Keuangan Internal",
    auditor: "Keuangan Internal",
  };

  return (
    labels[String(props.userRole || "").toLowerCase()] || "Pengguna Internal"
  );
});

const formattedDate = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const userEmailValue = computed(() =>
  String(props.userEmail || "pengguna@finstart.local"),
);
const userInitials = computed(() =>
  userEmailValue.value.slice(0, 2).toUpperCase(),
);
const userName = computed(() => userEmailValue.value.split("@")[0]);

function openSettings() {
  isProfileOpen.value = false;
  emit("open-settings");
}

function logout() {
  isProfileOpen.value = false;
  emit("logout");
}
</script>
