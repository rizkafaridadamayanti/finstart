<template>
  <header
    class="sticky top-0 z-[1000] grid h-[88px] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/70 bg-white/95 py-0 pr-5 shadow-[0_12px_34px_rgba(16,42,86,0.07)] backdrop-blur-2xl sm:pr-8"
    :style="{ paddingLeft: '2.25rem' }"
  >
    <div class="flex min-w-0 items-center">
      <div class="flex min-w-0 items-center gap-3">
        <img
          :src="FinStartLogo"
          alt="Finstart logo"
          class="h-11 w-11 shrink-0 object-contain"
        />
        <div class="min-w-0 space-y-0.5">
          <div class="flex min-w-0 items-center">
            <div
              class="truncate text-[21px] font-extrabold tracking-[-0.02em] text-[#102A56]"
            >
              Finstart
            </div>
          </div>
          <div
            class="hidden truncate text-[11px] font-semibold tracking-[0.04em] text-[#64748B] sm:block"
          >
            Workspace: {{ roleLabel }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex min-w-0 items-center gap-3">
      <span
        class="hidden whitespace-nowrap text-[12px] font-medium text-[#8492A6] xl:block"
        >{{ formattedDate }}</span
      >

      <div ref="profileDropdownRef" class="relative">
        <button
          id="btn-profile-dropdown"
          type="button"
          :class="['topbar-profile-button', { 'is-open': isProfileOpen }]"
          aria-label="Buka menu profil"
          :aria-expanded="isProfileOpen"
          @click="isProfileOpen = !isProfileOpen"
        >
          <div class="topbar-profile-avatar">
            {{ userInitials }}
          </div>
          <div class="topbar-profile-copy">
            <span class="topbar-profile-name">{{
              userName
            }}</span>
            <span class="topbar-profile-role">{{ roleLabel }}</span>
          </div>
          <ChevronDown
            :class="[
              'topbar-profile-chevron',
              isProfileOpen ? 'is-open' : '',
            ]"
          />
        </button>

        <div
          v-if="isProfileOpen"
          class="absolute right-0 z-[10080] mt-3 w-64 overflow-hidden rounded-3xl border border-[#D8E5F4] bg-white shadow-[0_26px_70px_rgba(16,42,86,0.24)] backdrop-blur-xl"
        >
          <div class="border-b border-slate-100 bg-[#F8FBFE] p-4">
            <span class="block text-[10px] font-bold uppercase text-[#2563EB]"
              >Hak Akses</span
            >
            <span class="mt-1 block truncate text-sm font-extrabold text-[#102A56]">{{
              userEmailValue
            }}</span>
            <span class="mt-0.5 block text-[11px] font-medium text-[#64748B]"
              >{{ roleLabel }} · PT Kedata Indonesia Digital</span
            >
          </div>
          <div class="divide-y divide-slate-100 p-2 text-xs">
            <div class="py-1">
              <button
                type="button"
                class="w-full rounded-xl px-3 py-2.5 text-left font-semibold text-slate-600 transition-colors hover:bg-[#EEF5FC] hover:text-[#102A56]"
                @click="openSettings"
              >
                Ubah Password
              </button>
              <button
                type="button"
                class="w-full rounded-xl px-3 py-2.5 text-left font-semibold text-slate-600 transition-colors hover:bg-[#EEF5FC] hover:text-[#102A56]"
                @click="openSettings"
              >
                Profil & Keamanan
              </button>
            </div>
            <div class="py-1">
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-600 transition-colors hover:bg-rose-50"
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ChevronDown, LogOut } from "lucide-vue-next";
import FinStartLogo from "../assets/finstart-logo.png";

const props = defineProps({
  userEmail: { type: String, default: "" },
  notifications: { type: Array, default: () => [] },
  userRole: { type: String, default: "" },
});

const emit = defineEmits(["logout", "open-settings"]);

const isProfileOpen = ref(false);
const profileDropdownRef = ref(null);
function handleProfileOutsideClick(e) {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target)) {
    isProfileOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", handleProfileOutsideClick, true));
onUnmounted(() => document.removeEventListener("click", handleProfileOutsideClick, true));

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

<style scoped>
.topbar-profile-button {
  display: inline-flex;
  height: 54px;
  min-width: 216px;
  align-items: center;
  gap: 12px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  padding: 6px 10px;
  text-align: left;
  transition: background-color 160ms ease, box-shadow 160ms ease,
    transform 160ms ease;
}

.topbar-profile-button:hover,
.topbar-profile-button.is-open {
  background: #f3f8fe;
  box-shadow: 0 12px 26px rgba(16, 42, 86, 0.08);
}

.topbar-profile-button.is-open {
  background: #eef5fc;
}

.topbar-profile-avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0b3a78;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 10px 24px rgba(30, 90, 168, 0.16);
}

.topbar-profile-copy {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  line-height: 1.15;
}

.topbar-profile-name {
  overflow: hidden;
  color: #102a56;
  font-size: 14px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-profile-role {
  margin-top: 3px;
  overflow: hidden;
  color: #8192aa;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.topbar-profile-chevron {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  color: #64748b;
  transition: color 160ms ease, transform 160ms ease;
}

.topbar-profile-button:hover .topbar-profile-chevron,
.topbar-profile-chevron.is-open {
  color: #102a56;
}

.topbar-profile-chevron.is-open {
  transform: rotate(180deg);
}

@media (max-width: 639px) {
  .topbar-profile-button {
    min-width: 0;
    gap: 9px;
    padding: 6px 8px;
  }

  .topbar-profile-copy {
    display: none;
  }
}
</style>
