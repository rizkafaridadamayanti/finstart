<template>
  <div class="space-y-7 font-sans">
    <header
      class="flex flex-col gap-4 border-b border-[#DCE7F4] pb-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p
          class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1E5AA8]"
        >
          Konfigurasi Finstart
        </p>
        <h1
          class="mt-1 text-[26px] font-semibold tracking-tight text-[#0B1F4A]"
        >
          Pengaturan Sistem
        </h1>
        <p class="mt-1 text-sm text-[#6B7A90]">
          Kelola identitas perusahaan, keamanan akses, dan aktivitas yang
          benar-benar tersimpan di server.
        </p>
      </div>
      <div
        class="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-3.5 py-2.5 text-xs font-medium text-[#0B1F4A]"
      >
        <Shield class="h-4 w-4 text-[#1E5AA8]" />{{ roleLabel(userRole || "") }}
      </div>
    </header>
    <div
      class="rounded-2xl border border-[#DCE7F4] bg-white p-2 shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
    >
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          :class="`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab === 'profile' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`"
          @click="activeTab = 'profile'"
        >
          <span
            :class="`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'profile' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`"
            ><Building2 class="h-5 w-5" /></span
          ><span
            ><span class="block text-sm font-medium">Profil Perusahaan</span
            ><span
              :class="`mt-0.5 block text-xs ${activeTab === 'profile' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`"
              >Identitas legal dan mata uang operasional</span
            ></span
          ><ChevronRight class="ml-auto h-4 w-4" /></button
        ><button
          type="button"
          :class="`flex min-h-[64px] items-center gap-3 rounded-xl px-4 text-left transition ${activeTab === 'security' ? 'bg-[#0B1F4A] text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)]' : 'text-[#53658A] hover:bg-[#F4F8FC]'}`"
          @click="activeTab = 'security'"
        >
          <span
            :class="`flex h-10 w-10 items-center justify-center rounded-xl ${activeTab === 'security' ? 'bg-white/10' : 'bg-[#EEF5FC] text-[#1E5AA8]'}`"
            ><Shield class="h-5 w-5" /></span
          ><span
            ><span class="block text-sm font-medium">Keamanan &amp; Akses</span
            ><span
              :class="`mt-0.5 block text-xs ${activeTab === 'security' ? 'text-blue-100/80' : 'text-[#8A98AB]'}`"
              >Role, sesi aktif, dan audit trail</span
            ></span
          ><ChevronRight class="ml-auto h-4 w-4" />
        </button>
      </div>
    </div>
    <form
      v-if="activeTab === 'profile'"
      class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      @submit="handleSaveProfile"
    >
      <div
        class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"
      >
        <div class="flex items-center gap-3.5">
          <span
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"
            ><Building2 class="h-6 w-6"
          /></span>
          <div>
            <h2 class="text-lg font-semibold text-[#0B1F4A]">
              Profil Perusahaan
            </h2>
            <p class="mt-1 text-sm text-[#6B7A90]">
              FinStart internal menggunakan Rupiah (IDR); kurs dan
              multi-currency belum diaktifkan.
            </p>
          </div>
        </div>
        <span
          class="w-fit rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#53658A]"
          >Business profile</span
        >
      </div>
      <div class="grid gap-5 px-6 py-7 md:grid-cols-2">
        <label class="space-y-2"
          ><span :class="labelClass">Nama Entitas Bisnis</span
          ><input
            :value="profile.namaEntitas"
            :class="inputClass"
            @change="profile = { ...profile, namaEntitas: eventValue($event) }" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">NPWP Badan</span
          ><input
            :value="profile.npwp"
            :class="inputClass"
            @change="profile = { ...profile, npwp: eventValue($event) }" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">Mata Uang Dasar</span
          ><input
            value="IDR - Indonesian Rupiah"
            disabled
            :class="`${inputClass} cursor-not-allowed bg-[#F8FBFE] text-[#70819B]`" /></label
        ><label class="space-y-2"
          ><span :class="labelClass">Tahun Fiskal Dimulai</span
          ><select
            :value="profile.tahunFiskal"
            :class="inputClass"
            @change="profile = { ...profile, tahunFiskal: eventValue($event) }"
          >
            <option
              v-for="item in ['Januari', 'April', 'Juli', 'Oktober']"
              :key="item"
            >
              {{ item }}
            </option>
          </select></label
        ><label class="space-y-2 md:col-span-2"
          ><span :class="labelClass">Alamat Kantor Pusat</span
          ><textarea
            :rows="4"
            :value="profile.alamat"
            class="min-h-[128px] w-full resize-y rounded-xl border border-[#D8E5F4] bg-white px-4 py-3 text-sm font-medium leading-6 text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10"
            @change="profile = { ...profile, alamat: eventValue($event) }"
          />
        </label>
      </div>
      <footer
        class="flex flex-col gap-3 border-t border-[#E8EEF7] bg-[#FBFDFF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p class="text-sm text-[#6B7A90]">
          Perubahan tersimpan pada konfigurasi workspace ini.
        </p>
        <button
          type="submit"
          :disabled="isSavingProfile"
          class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F4A] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(11,31,74,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save class="h-4 w-4" /><template v-if="isSavingProfile"
            >Menyimpan...</template
          ><template v-else>Simpan Perubahan</template>
        </button>
      </footer>
    </form>
    <div v-else class="space-y-5">
      <div
        class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
      >
        <div
          class="flex flex-col gap-4 border-b border-[#E8EEF7] px-6 py-6 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3.5">
            <span
              class="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D5E5F6] bg-[#EEF5FC] text-[#1E5AA8]"
              ><Shield class="h-6 w-6"
            /></span>
            <div>
              <h2 class="text-lg font-semibold text-[#0B1F4A]">
                Keamanan &amp; Akses
              </h2>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Data role, sesi, dan aktivitas di bawah ini diambil dari API
                server.
              </p>
            </div>
          </div>
          <button
            v-if="isAdmin()"
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D8E5F4] bg-white px-4 text-xs font-medium text-[#0B1F4A] hover:bg-[#F8FBFE]"
            @click="isUserModalOpen = true"
          >
            <UserPlus class="h-4 w-4" /> Tambah Pengguna</button
          ><span v-else class="text-xs text-[#8A98AB]"
            >Manajemen pengguna hanya untuk Administrator</span
          >
        </div>
        <div class="grid gap-4 px-6 py-6 md:grid-cols-3">
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"
              ><Users class="h-4 w-4"
            /></span>
            <p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">
              {{ users.length || "-" }}
            </p>
            <p class="mt-1 text-sm font-medium text-[#53658A]">
              Pengguna terdaftar
            </p>
            <p class="mt-1 text-xs leading-5 text-[#8A98AB]">
              Daftar aktual dari database pengguna.
            </p>
          </div>
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"
              ><BadgeCheck class="h-4 w-4"
            /></span>
            <p class="mt-4 text-lg font-semibold text-[#0B1F4A]">
              <template v-if="securitySettings.mfa_status === 'enabled'"
                >Aktif</template
              ><template v-else
                ><template v-if="securitySettings.mfa_status === 'pending'"
                  >Menunggu konfirmasi</template
                ><template v-else>Belum aktif</template></template
              >
            </p>
            <p class="mt-1 text-sm font-medium text-[#53658A]">
              Autentikasi dua langkah
            </p>
            <p class="mt-1 text-xs leading-5 text-[#8A98AB]">
              MFA TOTP dapat diaktifkan dari Kontrol Keamanan di bawah.
            </p>
          </div>
          <div class="rounded-xl border border-[#DCE7F4] bg-[#F8FBFE] p-5">
            <span
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1E5AA8] shadow-sm"
              ><Clock3 class="h-4 w-4"
            /></span>
            <p class="mt-4 text-2xl font-semibold text-[#0B1F4A]">
              {{ sessions.length }}
            </p>
            <p class="mt-1 text-sm font-medium text-[#53658A]">
              Sesi server aktif
            </p>
            <p class="mt-1 text-xs leading-5 text-[#8A98AB]">
              Sesi dapat ditutup dari daftar perangkat di bawah.
            </p>
          </div>
        </div>
      </div>
      <div
        class="grid gap-5 2xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]"
      >
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div
            class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"
          >
            <div>
              <h3 class="text-base font-semibold text-[#0B1F4A]">
                Hak Akses Internal
              </h3>
              <p class="mt-1 text-sm text-[#6B7A90]">
                Satu jenis role: Keuangan Internal. Jumlah akun login tetap bisa
                lebih dari satu orang.
              </p>
            </div>
            <span
              class="inline-flex rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-3 py-1 text-[10px] font-bold text-[#0B1F4A]"
              >1 akses</span
            >
          </div>
          <div class="px-6 py-5">
            <div
              class="flex flex-col gap-3 rounded-2xl border border-[#DCE7F4] bg-[#F8FBFE] p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex min-w-0 items-center gap-3">
                <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-semibold text-[#0B1F4A] shadow-sm"
                  >FI</span
                >
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-[#182338]">
                    Akses Internal FinStart
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Digunakan oleh tim keuangan/internal. Banyak pengguna bisa
                    dibuat, semuanya memakai akses yang sama.
                  </p>
                </div>
              </div>
              <span
                class="w-fit rounded-full border border-[#D8E5F4] bg-white px-3 py-1 text-[10px] font-medium text-[#53658A]"
                >{{
                  Number(internalFinanceRole().user_count || users.length || 0)
                }}
                pengguna</span
              >
            </div>
          </div>
        </section>
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">
              Kontrol Keamanan
            </h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Pengaturan yang tersedia benar-benar disimpan di server.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <div class="flex items-center justify-between gap-4 py-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><KeyRound class="h-4 w-4"
                /></span>
                <div>
                  <p class="text-sm font-medium text-[#182338]">
                    Autentikasi dua langkah
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Gunakan aplikasi authenticator berbasis TOTP untuk
                    melindungi login akun Anda.
                  </p>
                </div>
              </div>
              <button
                v-if="securitySettings.mfa_status === 'enabled'"
                type="button"
                class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700"
                @click="mfaDisable = { open: true, code: '', password: '' }"
              >
                Nonaktifkan</button
              ><button
                v-else
                type="button"
                class="rounded-xl bg-[#0B1F4A] px-3 py-2 text-[10px] font-semibold text-white"
                @click="beginMfaSetup"
              >
                <template v-if="securitySettings.mfa_status === 'pending'"
                  >Atur ulang</template
                ><template v-else>Aktifkan MFA</template>
              </button>
            </div>
            <div class="flex items-center justify-between gap-4 py-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><CircleAlert class="h-4 w-4"
                /></span>
                <div>
                  <p class="text-sm font-medium text-[#182338]">
                    Peringatan login baru
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Notifikasi saat sesi login baru dibuat.
                  </p>
                </div>
              </div>
              <SettingsToggle
                :checked="Boolean(securitySettings.login_alerts)"
                :disabled="isSavingSecurity"
                label="Peringatan login baru"
                @update:checked="saveSecurity({
                      ...securitySettings,
                      login_alerts: $event,
                    })"
              />
            </div>
            <div class="flex items-center justify-between gap-4 py-5">
              <div class="flex gap-3">
                <span
                  class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><Monitor class="h-4 w-4"
                /></span>
                <div>
                  <p class="text-sm font-medium text-[#182338]">
                    Peringatan sesi
                  </p>
                  <p class="mt-1 text-xs leading-5 text-[#6B7A90]">
                    Notifikasi ketika sesi perangkat ditutup atau berubah.
                  </p>
                </div>
              </div>
              <SettingsToggle
                :checked="Boolean(securitySettings.session_alerts)"
                :disabled="isSavingSecurity"
                label="Peringatan sesi"
                @update:checked="saveSecurity({
                      ...securitySettings,
                      session_alerts: $event,
                    })"
              />
            </div>
            <div class="flex justify-end py-4">
              <button
                type="button"
                class="inline-flex items-center gap-2 text-xs font-semibold text-[#1E5AA8]"
                @click="isPasswordOpen = !isPasswordOpen"
              >
                <LockKeyhole class="h-4 w-4" /> Ubah kata sandi
              </button>
            </div>
            <form
              v-if="isPasswordOpen"
              class="space-y-3 border-t border-[#EDF2F7] py-4"
              @submit="changePassword"
            >
              <input
                required
                type="password"
                :value="passwordForm.current_password"
                placeholder="Password saat ini"
                :class="inputClass"
                @change="passwordForm = {
                      ...passwordForm,
                      current_password: eventValue($event),
                    }"
              /><input
                required
                type="password"
                :value="passwordForm.new_password"
                placeholder="Password baru (minimal 8 karakter)"
                :class="inputClass"
                @change="passwordForm = {
                      ...passwordForm,
                      new_password: eventValue($event),
                    }"
              /><input
                required
                type="password"
                :value="passwordForm.confirm_password"
                placeholder="Konfirmasi password baru"
                :class="inputClass"
                @change="passwordForm = {
                      ...passwordForm,
                      confirm_password: eventValue($event),
                    }"
              /><button
                type="submit"
                class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
              >
                Simpan Password
              </button>
            </form>
          </div>
        </section>
      </div>
      <div class="grid gap-5 xl:grid-cols-2">
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">Sesi Aktif</h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Perangkat yang sedang menggunakan akun Anda atau dapat Anda
              kelola.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <template v-if="sessions.length"
              ><div
                v-for="session in sessions"
                :key="session.id"
                class="flex items-center gap-3 py-4"
              >
                <span
                  class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#1E5AA8]"
                  ><Smartphone
                    v-if="
                      String(session.user_agent || '')
                        .toLowerCase()
                        .includes('mobile')
                    "
                    class="h-5 w-5" /><Monitor v-else class="h-5 w-5"
                /></span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-[#182338]">
                    {{ session.user_name || userEmail }}
                  </p>
                  <p class="mt-1 truncate text-xs text-[#6B7A90]">
                    {{ session.ip_address || "IP tidak tersedia" }} ·
                    {{ formatTime(session.created_at) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="rounded-full border border-[#D8E5F4] bg-[#F8FBFE] px-2.5 py-1 text-[10px] font-medium text-[#0B1F4A]"
                    ><template v-if="session.current_session">Saat ini</template
                    ><template v-else>Aktif</template></span
                  ><button
                    type="button"
                    class="text-[10px] font-semibold text-rose-600"
                    @click="closeSession(session)"
                  >
                    Tutup
                  </button>
                </div>
              </div></template
            >
            <p v-else class="py-6 text-sm text-[#8A98AB]">
              Tidak ada sesi yang dapat ditampilkan.
            </p>
          </div>
        </section>
        <section
          class="overflow-hidden rounded-2xl border border-[#DCE7F4] bg-white shadow-[0_12px_30px_rgba(11,31,74,0.04)]"
        >
          <div class="border-b border-[#E8EEF7] px-6 py-5">
            <h3 class="text-base font-semibold text-[#0B1F4A]">
              Aktivitas Keamanan &amp; Audit
            </h3>
            <p class="mt-1 text-sm text-[#6B7A90]">
              Jejak aktivitas dari tabel activity_logs.
            </p>
          </div>
          <div class="divide-y divide-[#EDF2F7] px-6">
            <template v-if="activity.length"
              ><div
                v-for="item in activity.slice(0, 10)"
                :key="item.id"
                class="flex items-start gap-3 py-4"
              >
                <span
                  class="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#1E5AA8]"
                  ><CheckCircle2 class="h-4 w-4"
                /></span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-[#182338]">
                    {{
                      item.activity || item.description || "Aktivitas sistem"
                    }}
                  </p>
                  <p class="mt-1 text-xs text-[#6B7A90]">
                    {{ item.user_name || item.user_email || "Sistem" }} ·
                    {{ formatTime(item.created_at) }}
                  </p>
                </div>
              </div></template
            >
            <p v-else class="py-6 text-sm text-[#8A98AB]">
              Belum ada aktivitas audit yang dapat ditampilkan.
            </p>
          </div>
        </section>
      </div>
    </div>
    <div
      v-if="mfaSetup.open"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div
          class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Keamanan Akun
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Aktifkan MFA TOTP
            </h3>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-[#6B7A90]"
            @click="closeMfaSetup"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form
          class="max-h-[calc(92vh-90px)] space-y-4 overflow-y-auto p-6"
          @submit="confirmMfa"
        >
          <p class="text-sm leading-6 text-[#53658A]">
            Scan QR ini memakai Google Authenticator, Microsoft Authenticator,
            2FAS, atau aplikasi TOTP lain. Setelah akun tersimpan, masukkan kode
            enam digit yang sedang tampil di aplikasi.
          </p>
          <div class="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
            <div
              class="flex flex-col items-center rounded-2xl border border-[#D8E5F4] bg-white p-4 text-center shadow-sm"
            >
              <p :class="labelClass">Scan QR MFA</p>
              <img
                v-if="mfaQrCode"
                :src="mfaQrCode"
                alt="QR setup MFA FinStart"
                class="mt-3 h-[220px] w-[220px] rounded-xl border border-[#E8EEF7] bg-white p-2"
              />
              <div
                v-else
                class="mt-3 flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-dashed border-[#C9D8E8] bg-[#F8FBFE] px-4 text-xs font-semibold leading-5 text-[#70819B]"
              >
                QR belum tersedia. Gunakan secret manual.
              </div>
              <p class="mt-3 text-[11px] leading-5 text-[#70819B]">
                QR dibuat lokal di browser dari secret akun ini.
              </p>
            </div>
            <div class="rounded-2xl border border-[#D8E5F4] bg-[#F8FBFE] p-4">
              <p :class="labelClass">Secret Manual</p>
              <code
                class="mt-2 block break-all rounded-xl border border-[#D8E5F4] bg-white p-3 text-sm font-bold tracking-[0.12em] text-[#0B1F4A]"
                >{{ mfaSetup.secret }}</code
              >
              <p class="mt-3 text-[11px] leading-5 text-[#70819B]">
                Kalau tidak bisa scan QR, pilih tambah akun manual di aplikasi
                authenticator, lalu masukkan secret ini.
              </p>
              <p class="mt-3 break-all text-[11px] leading-5 text-[#70819B]">
                URI impor: {{ mfaSetup.otpauth_url }}
              </p>
              <div class="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3">
                <p
                  class="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700"
                >
                  Konfirmasi scan
                </p>
                <p class="mt-1 text-[11px] leading-5 text-sky-700">
                  Kode yang dimasukkan di bawah harus berasal dari aplikasi
                  authenticator setelah QR discan, bukan dari FinStart.
                </p>
              </div>
            </div>
          </div>
          <input
            required
            inputmode="numeric"
            maxlength="6"
            :value="mfaSetup.code"
            placeholder="Kode 6 digit dari authenticator"
            :class="inputClass"
            @change="mfaSetup = {
                  ...mfaSetup,
                  code: eventValue($event).replace(/\D/g, '').slice(0, 6),
                }"
          />
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium"
              @click="closeMfaSetup"
            >
              Batal</button
            ><button
              type="submit"
              class="h-10 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            >
              Konfirmasi MFA
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="mfaDisable.open"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div
          class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600"
            >
              Keamanan Akun
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Nonaktifkan MFA
            </h3>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-[#6B7A90]"
            @click="mfaDisable = { open: false, code: '', password: '' }"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form class="space-y-4 p-6" @submit="disableMfa">
          <p class="text-sm leading-6 text-[#53658A]">
            Masukkan password dan kode authenticator saat ini untuk
            menonaktifkan MFA.
          </p>
          <input
            required
            type="password"
            :value="mfaDisable.password"
            placeholder="Password saat ini"
            :class="inputClass"
            @change="mfaDisable = { ...mfaDisable, password: eventValue($event) }"
          /><input
            required
            inputmode="numeric"
            maxlength="6"
            :value="mfaDisable.code"
            placeholder="Kode MFA 6 digit"
            :class="inputClass"
            @change="mfaDisable = {
                  ...mfaDisable,
                  code: eventValue($event).replace(/\D/g, '').slice(0, 6),
                }"
          />
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium"
              @click="mfaDisable = { open: false, code: '', password: '' }"
            >
              Batal</button
            ><button
              type="submit"
              class="h-10 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white"
            >
              Nonaktifkan
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="isUserModalOpen"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-[#081936]/55 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl"
      >
        <div
          class="flex items-center justify-between border-b border-[#E8EEF7] px-6 py-5"
        >
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#1E5AA8]"
            >
              Administrator
            </p>
            <h3 class="mt-1 text-lg font-semibold text-[#0B1F4A]">
              Tambah Pengguna
            </h3>
          </div>
          <button
            type="button"
            class="rounded-xl p-2 text-[#6B7A90]"
            @click="isUserModalOpen = false"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
        <form class="space-y-4 p-6" @submit="createUser">
          <input
            required
            :value="newUser.name"
            placeholder="Nama pengguna"
            :class="inputClass"
            @change="newUser = { ...newUser, name: eventValue($event) }"
          /><input
            required
            type="email"
            :value="newUser.email"
            placeholder="Email"
            :class="inputClass"
            @change="newUser = { ...newUser, email: eventValue($event) }"
          /><input
            :value="newUser.phone"
            placeholder="Nomor telepon (opsional)"
            :class="inputClass"
            @change="newUser = { ...newUser, phone: eventValue($event) }"
          /><select
            :value="newUser.role_id || internalFinanceRoleId()"
            :class="inputClass"
            @change="newUser = { ...newUser, role_id: eventValue($event) }"
          >
            <option :value="internalFinanceRoleId()">
              Keuangan Internal
            </option></select
          ><input
            required
            :min-length="8"
            type="password"
            :value="newUser.password"
            placeholder="Password awal (minimal 8 karakter)"
            :class="inputClass"
            @change="newUser = { ...newUser, password: eventValue($event) }"
          />
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              class="h-10 rounded-xl border border-[#D8E5F4] px-4 text-xs font-medium"
              @click="isUserModalOpen = false"
            >
              Batal</button
            ><button
              type="submit"
              class="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0B1F4A] px-4 text-xs font-semibold text-white"
            >
              <Plus class="h-4 w-4" /> Buat Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { eventValue } from "../utils/domEvents";
import { onMounted, ref } from "vue";
import QRCode from "qrcode";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  KeyRound,
  LockKeyhole,
  Monitor,
  Plus,
  Save,
  Shield,
  Smartphone,
  UserPlus,
  Users,
  X,
} from "lucide-vue-next";
import SettingsToggle from "./settings/SettingsToggle.vue";
import { useFinStartContext } from "../composables/useFinStartContext";
import { financeApi, getApiErrorMessage } from "../services/financeApi.js";

interface PengaturanViewProps {
  userEmail: string;
  userRole?: string;
}
type SettingsTab = "profile" | "security";

function formatTime(value: any) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
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
    labels[String(role || "").toLowerCase()] || String(role || "Role internal")
  );
}

const props = defineProps<PengaturanViewProps>();
const { userEmail, userRole }: PengaturanViewProps = props;

const { notify } = useFinStartContext();
const activeTab = ref<SettingsTab>("profile");
const profile = ref({
  namaEntitas: "",
  npwp: "",
  mataUang: "IDR - Indonesian Rupiah",
  tahunFiskal: "Januari",
  alamat: "",
});
const companySettings = ref<any>({});
const securitySettings = ref<any>({
  login_alerts: true,
  session_alerts: true,
  mfa_status: "not_configured",
  mfa_pending: false,
});
const roles = ref<any[]>([]);
const users = ref<any[]>([]);
const sessions = ref<any[]>([]);
const activity = ref<any[]>([]);
const isSavingProfile = ref(false);
const isSavingSecurity = ref(false);
const isPasswordOpen = ref(false);
const isUserModalOpen = ref(false);
const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});
const newUser = ref({
  name: "",
  email: "",
  phone: "",
  role_id: "",
  password: "",
});
const mfaSetup = ref({
  open: false,
  secret: "",
  otpauth_url: "",
  setup_code: "",
  code: "",
});
const mfaQrCode = ref("");
const mfaDisable = ref({ open: false, code: "", password: "" });
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const inputClass =
  "h-12 w-full rounded-xl border border-[#D8E5F4] bg-white px-4 text-sm font-medium text-[#182338] outline-none transition focus:border-[#1E5AA8] focus:ring-4 focus:ring-[#1E5AA8]/10";
const labelClass =
  "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70819B]";
const isAdmin = () =>
  ["admin", "finance_manager", "finance"].includes(
    String(userRole || "").toLowerCase(),
  );
const internalFinanceRole = () =>
  roles.value.find(
    (role: any) => String(role.name || "").toLowerCase() === "finance_manager",
  ) ||
  roles.value[0] || { id: "1", name: "finance_manager", user_count: 0 };
const internalFinanceRoleId = () => String(internalFinanceRole().id || "1");

async function loadCompanySettings() {
  try {
    const data = await financeApi.get("/company-settings");
    companySettings.value = data || {};
    const startMonth = Number(data?.fiscal_year_start_month || 1);
    profile.value = {
      namaEntitas: data?.company_name || "",
      npwp: data?.npwp || "",
      mataUang: "IDR - Indonesian Rupiah",
      tahunFiskal: monthNames[startMonth - 1] || "Januari",
      alamat: data?.address || "",
    };
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal memuat pengaturan perusahaan."));
  }
}

async function loadSecurityData() {
  const jobs = await Promise.allSettled([
    financeApi.get("/auth/security-settings"),
    financeApi.get("/auth/sessions"),
    financeApi.get("/roles"),
    financeApi.get("/users"),
    financeApi.get("/audit", { limit: 30 }),
  ]);
  const value = (index: number, fallback: any) =>
    jobs[index].status === "fulfilled"
      ? (jobs[index] as PromiseFulfilledResult<any>).value
      : fallback;
  securitySettings.value = {
    ...securitySettings.value,
    ...(value(0, {}) || {}),
  };
  sessions.value = Array.isArray(value(1, [])) ? value(1, []) : [];
  roles.value = Array.isArray(value(2, [])) ? value(2, []) : [];
  users.value = Array.isArray(value(3, [])) ? value(3, []) : [];
  activity.value = Array.isArray(value(4, [])) ? value(4, []) : [];
}

async function handleSaveProfile(event: Event) {
  event.preventDefault();
  isSavingProfile.value = true;
  try {
    const fiscalStartMonth = Math.max(
      1,
      monthNames.indexOf(profile.value.tahunFiskal) + 1,
    );
    const saved = await financeApi.put("/company-settings", {
      ...companySettings.value,
      company_name: profile.value.namaEntitas,
      npwp: profile.value.npwp,
      currency: "IDR",
      address: profile.value.alamat,
      fiscal_year: Number(
        companySettings.value?.fiscal_year || new Date().getFullYear(),
      ),
      fiscal_year_start_month: fiscalStartMonth,
    });
    companySettings.value = saved || companySettings.value;
    await loadCompanySettings();
    notify(
      "Profil perusahaan berhasil disimpan. FinStart saat ini menggunakan Rupiah (IDR).",
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menyimpan profil perusahaan."));
  } finally {
    isSavingProfile.value = false;
  }
}

async function saveSecurity(next: any) {
  isSavingSecurity.value = true;
  try {
    const saved = await financeApi.put("/auth/security-settings", next);
    securitySettings.value = {
      ...securitySettings.value,
      ...(saved || next),
    };
    notify("Preferensi keamanan berhasil disimpan.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menyimpan preferensi keamanan."));
  } finally {
    isSavingSecurity.value = false;
  }
}

async function beginMfaSetup() {
  try {
    const data = await financeApi.post("/auth/mfa/setup", {});
    const otpauthUrl = data?.otpauth_url || "";
    mfaSetup.value = {
      open: true,
      secret: data?.secret || "",
      otpauth_url: data?.otpauth_url || "",
      setup_code: data?.setup_code || "",
      code: "",
    };
    mfaQrCode.value = otpauthUrl
      ? await QRCode.toDataURL(otpauthUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 220,
          color: { dark: "#0B1F4A", light: "#FFFFFF" },
        })
      : "";
    await loadSecurityData();
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menyiapkan MFA."));
  }
}

function closeMfaSetup() {
  mfaSetup.value = {
    open: false,
    secret: "",
    otpauth_url: "",
    setup_code: "",
    code: "",
  };
  mfaQrCode.value = "";
}

async function confirmMfa(event: Event) {
  event.preventDefault();
  try {
    const code = String(mfaSetup.value.code || "")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (code.length !== 6) {
      notify("Kode MFA harus 6 digit.");
      return;
    }
    await financeApi.post("/auth/mfa/confirm", { code });
    closeMfaSetup();
    await loadSecurityData();
    notify("Autentikasi dua langkah berhasil diaktifkan.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Kode MFA tidak valid."));
  }
}

async function disableMfa(event: Event) {
  event.preventDefault();
  try {
    await financeApi.post("/auth/mfa/disable", {
      code: mfaDisable.value.code,
      password: mfaDisable.value.password,
    });
    mfaDisable.value = { open: false, code: "", password: "" };
    await loadSecurityData();
    notify("Autentikasi dua langkah dinonaktifkan.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Password atau kode MFA tidak valid."));
  }
}

async function closeSession(session: any) {
  try {
    await financeApi.delete(`/auth/sessions/${session.id}`);
    await loadSecurityData();
    notify(
      session.current_session
        ? "Sesi ini ditutup. Silakan login kembali."
        : "Sesi aktif berhasil ditutup.",
    );
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal menutup sesi."));
  }
}

async function changePassword(event: Event) {
  event.preventDefault();
  if (passwordForm.value.new_password.length < 8)
    return notify("Password baru minimal 8 karakter.");
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password)
    return notify("Konfirmasi password belum sama.");
  try {
    await financeApi.post("/auth/password/change", {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    });
    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
    isPasswordOpen.value = false;
    notify("Password berhasil diubah. Sesi lain telah ditutup.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal mengubah password."));
  }
}

async function createUser(event: Event) {
  event.preventDefault();
  try {
    await financeApi.post("/users", {
      ...newUser.value,
      role_id: Number(internalFinanceRoleId()),
      status: "active",
    });
    newUser.value = {
      name: "",
      email: "",
      phone: "",
      role_id: internalFinanceRoleId(),
      password: "",
    };
    isUserModalOpen.value = false;
    await loadSecurityData();
    notify("Pengguna baru berhasil dibuat.");
  } catch (error) {
    notify(getApiErrorMessage(error, "Gagal membuat pengguna baru."));
  }
}

onMounted(() => {
  loadCompanySettings();
  loadSecurityData();
});
</script>
