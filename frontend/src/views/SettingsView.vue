<script setup>
import { computed, ref } from 'vue'
import { useFinanceStore } from '../stores/financeStore'

const financeStore = useFinanceStore()
const activeTab = ref('company')

const companyForm = ref({ ...financeStore.companySettings })

const securityForm = ref({ ...financeStore.securitySettings })

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const userList = computed(() => financeStore.accessUsers)
const showUserModal = ref(false)

const userForm = ref({
  name: '',
  email: '',
  role: 'Finance Staff',
})

const activeUsers = computed(() => {
  return userList.value.filter((user) => user.status === 'Aktif').length
})

function saveCompanyProfile() {
  if (
    !companyForm.value.entityName.trim() ||
    !companyForm.value.email.trim() ||
    !companyForm.value.baseCurrency
  ) {
    alert('Nama perusahaan, email, dan mata uang utama wajib diisi.')
    return
  }

  financeStore.updateCompanySettings(companyForm.value)
  alert('Profil perusahaan berhasil disimpan dan akan tetap tersimpan setelah refresh.')
}

function saveSecuritySettings() {
  financeStore.updateSecuritySettings(securityForm.value)
  alert('Pengaturan keamanan berhasil disimpan.')
}

function changePassword() {
  if (
    !passwordForm.value.currentPassword ||
    !passwordForm.value.newPassword ||
    !passwordForm.value.confirmPassword
  ) {
    alert('Lengkapi seluruh data kata sandi.')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    alert('Kata sandi baru minimal terdiri dari 8 karakter.')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('Konfirmasi kata sandi belum sama.')
    return
  }

  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }

  alert('Prototype: kata sandi berhasil diperbarui.')
}

function openUserModal() {
  userForm.value = {
    name: '',
    email: '',
    role: 'Finance Staff',
  }

  showUserModal.value = true
}

function closeUserModal() {
  showUserModal.value = false
}

function addUser() {
  if (!userForm.value.name.trim() || !userForm.value.email.trim()) {
    alert('Nama dan email pengguna wajib diisi.')
    return
  }

  const result = financeStore.addAccessUser({
    name: userForm.value.name,
    email: userForm.value.email,
    role: userForm.value.role,
  })

  if (!result.ok) {
    alert(result.message)
    return
  }

  closeUserModal()
  alert('Pengguna baru berhasil ditambahkan.')
}

function toggleUserStatus(user) {
  if (user.role === 'Owner') {
    alert('Akun Owner tidak dapat dinonaktifkan.')
    return
  }

  financeStore.toggleAccessUserStatus(user.id)
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">SYSTEM SETTINGS</p>
        <h1>Settings</h1>
        <p>
          Kelola profil perusahaan, tahun fiskal, keamanan, dan akses pengguna.
        </p>
      </div>
    </div>

    <div class="settings-tabs">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'company' }"
        @click="activeTab = 'company'"
      >
        Profil Perusahaan
      </button>

      <button
        class="tab-button"
        :class="{ active: activeTab === 'security' }"
        @click="activeTab = 'security'"
      >
        Keamanan & Akses
      </button>
    </div>

    <template v-if="activeTab === 'company'">
      <div class="settings-layout">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h3>Profil Entitas Perusahaan</h3>
              <p>Informasi utama perusahaan yang digunakan pada dokumen keuangan.</p>
            </div>
          </div>

          <form @submit.prevent="saveCompanyProfile">
            <div class="form-grid">
              <label>
                Nama Entitas
                <input
                  v-model="companyForm.entityName"
                  type="text"
                  placeholder="Nama perusahaan"
                  required
                />
              </label>

              <label>
                Jenis Bisnis
                <input
                  v-model="companyForm.businessType"
                  type="text"
                  placeholder="Contoh: Startup Teknologi"
                />
              </label>

              <label>
                Email Perusahaan
                <input
                  v-model="companyForm.email"
                  type="email"
                  placeholder="finance@perusahaan.id"
                  required
                />
              </label>

              <label>
                Nomor Telepon
                <input
                  v-model="companyForm.phone"
                  type="text"
                  placeholder="+62"
                />
              </label>

              <label>
                NPWP Perusahaan
                <input
                  v-model="companyForm.npwp"
                  type="text"
                  placeholder="00.000.000.0-000.000"
                />
              </label>

              <label>
                Mata Uang Utama
                <select v-model="companyForm.baseCurrency">
                  <option>IDR</option>
                  <option>USD</option>
                  <option>SGD</option>
                </select>
              </label>

              <label>
                Tahun Fiskal
                <select v-model="companyForm.fiscalYear">
                  <option>Januari - Desember</option>
                  <option>April - Maret</option>
                  <option>Juli - Juni</option>
                </select>
              </label>

              <label class="full-width">
                Alamat Perusahaan
                <textarea
                  v-model="companyForm.address"
                  rows="4"
                  placeholder="Alamat lengkap perusahaan"
                ></textarea>
              </label>
            </div>

            <div class="modal-actions">
              <button type="submit" class="primary-button">
                Simpan Profil Perusahaan
              </button>
            </div>
          </form>
        </article>

        <aside class="settings-info-card">
          <p class="eyebrow">INFORMASI SISTEM</p>
          <h3>FinStart Accounting</h3>

          <div class="settings-info-list">
            <div>
              <span>Mata Uang</span>
              <strong>{{ companyForm.baseCurrency }}</strong>
            </div>

            <div>
              <span>Tahun Fiskal</span>
              <strong>{{ companyForm.fiscalYear }}</strong>
            </div>

            <div>
              <span>Status Sistem</span>
              <strong class="success-text">Aktif</strong>
            </div>
          </div>

          <p class="settings-note">
            Data prototype tersimpan pada browser menggunakan localStorage.
            Backend/database dapat ditambahkan pada tahap berikutnya.
          </p>
        </aside>
      </div>
    </template>

    <template v-else>
      <div class="security-metrics">
        <article class="security-stat">
          <p>Pengguna Aktif</p>
          <h2>{{ activeUsers }} Pengguna</h2>
          <small>Akun yang masih dapat masuk ke sistem</small>
        </article>

        <article class="security-stat">
          <p>Autentikasi Dua Faktor</p>
          <h2>{{ securityForm.twoFactor ? 'Aktif' : 'Nonaktif' }}</h2>
          <small>Lapisan keamanan akun tambahan</small>
        </article>

        <article class="security-stat">
          <p>Batas Sesi Login</p>
          <h2>{{ securityForm.sessionTimeout }} Menit</h2>
          <small>Pengguna perlu login kembali setelah sesi berakhir</small>
        </article>
      </div>

      <div class="settings-layout">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h3>Keamanan Akun</h3>
              <p>Atur keamanan dasar pada aplikasi FinStart.</p>
            </div>
          </div>

          <div class="security-option">
            <div>
              <strong>Autentikasi Dua Faktor</strong>
              <p>Tambahkan verifikasi tambahan ketika pengguna login.</p>
            </div>

            <label class="switch">
              <input v-model="securityForm.twoFactor" type="checkbox" />
              <span></span>
            </label>
          </div>

          <div class="security-option">
            <div>
              <strong>Notifikasi Login</strong>
              <p>Kirim notifikasi ketika ada login dari perangkat baru.</p>
            </div>

            <label class="switch">
              <input v-model="securityForm.loginAlert" type="checkbox" />
              <span></span>
            </label>
          </div>

          <div class="security-option">
            <div>
              <strong>Batas Waktu Sesi</strong>
              <p>Atur durasi sesi pengguna sebelum login ulang.</p>
            </div>

            <select v-model="securityForm.sessionTimeout" class="filter-select">
              <option value="15">15 Menit</option>
              <option value="30">30 Menit</option>
              <option value="60">60 Menit</option>
              <option value="120">120 Menit</option>
            </select>
          </div>

          <div class="modal-actions">
            <button class="primary-button" @click="saveSecuritySettings">
              Simpan Keamanan
            </button>
          </div>
        </article>

        <article class="panel">
          <div class="panel-header">
            <div>
              <h3>Ubah Kata Sandi</h3>
              <p>Gunakan kata sandi yang kuat dan tidak digunakan di tempat lain.</p>
            </div>
          </div>

          <form @submit.prevent="changePassword">
            <div class="password-form">
              <label>
                Kata Sandi Saat Ini
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="Masukkan kata sandi saat ini"
                />
              </label>

              <label>
                Kata Sandi Baru
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="Minimal 8 karakter"
                />
              </label>

              <label>
                Konfirmasi Kata Sandi Baru
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="Ulangi kata sandi baru"
                />
              </label>
            </div>

            <div class="modal-actions">
              <button type="submit" class="secondary-button">
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </article>
      </div>

      <article class="panel settings-user-panel">
        <div class="panel-header">
          <div>
            <h3>Manajemen Akses Pengguna</h3>
            <p>Kelola peran dan status pengguna yang dapat mengakses FinStart.</p>
          </div>

          <button class="primary-button" @click="openUserModal">
            + Tambah Pengguna
          </button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Peran</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="user in userList" :key="user.id">
                <td>
                  <strong>{{ user.name }}</strong>
                </td>

                <td>{{ user.email }}</td>

                <td>
                  <span class="account-type">{{ user.role }}</span>
                </td>

                <td>
                  <span
                    class="status-badge"
                    :class="{ danger: user.status === 'Tidak Aktif' }"
                  >
                    {{ user.status }}
                  </span>
                </td>

                <td>
                  <button
                    class="table-action"
                    @click="toggleUserStatus(user)"
                  >
                    {{ user.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </template>

    <div
      v-if="showUserModal"
      class="modal-backdrop"
      @click.self="closeUserModal"
    >
      <form class="modal-card" @submit.prevent="addUser">
        <div class="modal-header">
          <div>
            <p class="eyebrow">AKSES PENGGUNA</p>
            <h3>Tambah Pengguna Baru</h3>
          </div>

          <button type="button" class="modal-close" @click="closeUserModal">
            ×
          </button>
        </div>

        <div class="form-grid">
          <label>
            Nama Pengguna
            <input
              v-model="userForm.name"
              type="text"
              placeholder="Contoh: Dinda Lestari"
              required
            />
          </label>

          <label>
            Email Pengguna
            <input
              v-model="userForm.email"
              type="email"
              placeholder="dinda@finstart.id"
              required
            />
          </label>

          <label class="full-width">
            Peran Pengguna
            <select v-model="userForm.role">
              <option>Owner</option>
              <option>Finance Manager</option>
              <option>Finance Staff</option>
              <option>Project Manager</option>
              <option>Viewer</option>
            </select>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeUserModal">
            Batal
          </button>

          <button type="submit" class="primary-button">
            Simpan Pengguna
          </button>
        </div>
      </form>
    </div>
  </section>
</template>