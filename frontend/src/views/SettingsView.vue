<script setup>
import { computed, ref } from 'vue'
import { useCompanySettings } from '@/composables/useCompanySettings'

const activeTab = ref('company')

const {
  companyForm,
  isLoading,
  isSavingCompany,
  errorMessage,
  successMessage,
  loadSettings,
  saveCompanySettings,
} = useCompanySettings()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const fiscalYearText = computed(() => {
  const year = Number(companyForm.value.fiscal_year)
  return Number.isFinite(year) ? `Tahun buku ${year}` : 'Tahun buku belum diatur'
})

async function saveCompanyProfile() {
  if (
    !String(companyForm.value.company_name || '').trim() ||
    !String(companyForm.value.email || '').trim() ||
    !companyForm.value.currency ||
    !companyForm.value.fiscal_year
  ) {
    errorMessage.value = 'Nama perusahaan, email, mata uang, dan tahun buku wajib diisi.'
    return
  }

  await saveCompanySettings()
}

function changePassword() {
  if (
    !passwordForm.value.currentPassword ||
    !passwordForm.value.newPassword ||
    !passwordForm.value.confirmPassword
  ) {
    window.alert('Lengkapi seluruh data kata sandi.')
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    window.alert('Kata sandi baru minimal terdiri dari 8 karakter.')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    window.alert('Konfirmasi kata sandi belum sama.')
    return
  }

  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }

  window.alert(
    'Fitur ubah kata sandi membutuhkan API autentikasi khusus. Data tidak disimpan ke localStorage.',
  )
}
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <p class="eyebrow">SYSTEM SETTINGS</p>
        <h1>Settings</h1>
        <p>
          Kelola profil perusahaan, tahun buku, keamanan, dan akses pengguna.
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

    <article v-if="errorMessage" class="receivable-message error-message">
      {{ errorMessage }}
    </article>

    <article v-if="successMessage" class="receivable-message success-message">
      {{ successMessage }}
    </article>

    <template v-if="activeTab === 'company'">
      <div class="settings-layout">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h3>Profil Entitas Perusahaan</h3>
              <p>Informasi utama perusahaan yang digunakan pada dokumen keuangan.</p>
            </div>

            <button
              type="button"
              class="table-action"
              :disabled="isLoading"
              @click="loadSettings"
            >
              {{ isLoading ? 'Memuat...' : 'Refresh' }}
            </button>
          </div>

          <form @submit.prevent="saveCompanyProfile">
            <div class="form-grid">
              <label>
                Nama Entitas
                <input
                  v-model="companyForm.company_name"
                  type="text"
                  placeholder="Nama perusahaan"
                  required
                />
              </label>

              <label>
                URL Logo <span class="optional-label">(opsional)</span>
                <input
                  v-model="companyForm.logo_url"
                  type="url"
                  placeholder="https://contoh.id/logo.png"
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
                <select v-model="companyForm.currency">
                  <option>IDR</option>
                  <option>USD</option>
                  <option>SGD</option>
                </select>
              </label>

              <label>
                Tahun Buku
                <input
                  v-model.number="companyForm.fiscal_year"
                  type="number"
                  min="2000"
                  max="2100"
                  required
                />
              </label>

              <label>
                Kota <span class="optional-label">(opsional)</span>
                <input
                  v-model="companyForm.city"
                  type="text"
                  placeholder="Contoh: Yogyakarta"
                />
              </label>

              <label>
                Provinsi <span class="optional-label">(opsional)</span>
                <input
                  v-model="companyForm.province"
                  type="text"
                  placeholder="Contoh: DI Yogyakarta"
                />
              </label>

              <label>
                Kode Pos <span class="optional-label">(opsional)</span>
                <input
                  v-model="companyForm.postal_code"
                  type="text"
                  placeholder="Contoh: 55281"
                />
              </label>

              <label class="full-width">
                Website <span class="optional-label">(opsional)</span>
                <input
                  v-model="companyForm.website"
                  type="url"
                  placeholder="https://perusahaan.id"
                />
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
              <button type="submit" class="primary-button" :disabled="isSavingCompany">
                {{ isSavingCompany ? 'Menyimpan...' : 'Simpan Profil Perusahaan' }}
              </button>
            </div>
          </form>
        </article>

        <aside class="settings-info-card">
          <p class="eyebrow">INFORMASI SISTEM</p>
          <h3>{{ companyForm.company_name || 'FinStart Accounting' }}</h3>

          <div class="settings-info-list">
            <div>
              <span>Mata Uang</span>
              <strong>{{ companyForm.currency || 'IDR' }}</strong>
            </div>

            <div>
              <span>Tahun Fiskal</span>
              <strong>{{ fiscalYearText }}</strong>
            </div>

            <div>
              <span>Status Sistem</span>
              <strong class="success-text">Aktif</strong>
            </div>
          </div>

          <p class="settings-note">
            Profil perusahaan disimpan pada database MySQL melalui API FinStart,
            bukan pada browser atau localStorage.
          </p>
        </aside>
      </div>
    </template>

    <template v-else>
      <div class="security-metrics">
        <article class="security-stat">
          <p>Pengaturan Keamanan</p>
          <h2>Belum Terhubung</h2>
          <small>Memerlukan endpoint autentikasi dan manajemen pengguna</small>
        </article>

        <article class="security-stat">
          <p>Autentikasi Dua Faktor</p>
          <h2>Belum Diatur</h2>
          <small>Belum disimpan agar tidak menjadi data browser semu</small>
        </article>

        <article class="security-stat">
          <p>Manajemen Akses</p>
          <h2>Backend Terpisah</h2>
          <small>Gunakan API users/roles saat modul autentikasi tersedia</small>
        </article>
      </div>

      <div class="settings-layout">
        <article class="panel">
          <div class="panel-header">
            <div>
              <h3>Keamanan Akun</h3>
              <p>Pengaturan keamanan tidak lagi menggunakan financeStore atau localStorage.</p>
            </div>
          </div>

          <div class="security-option">
            <div>
              <strong>Autentikasi Dua Faktor</strong>
              <p>Fitur ini membutuhkan konfigurasi dari backend autentikasi.</p>
            </div>

            <span class="account-type">Menunggu API</span>
          </div>

          <div class="security-option">
            <div>
              <strong>Notifikasi Login</strong>
              <p>Fitur ini membutuhkan pencatatan perangkat dan notifikasi server.</p>
            </div>

            <span class="account-type">Menunggu API</span>
          </div>

          <div class="security-option">
            <div>
              <strong>Batas Waktu Sesi</strong>
              <p>Fitur ini harus diatur dari token/session backend, bukan dari browser.</p>
            </div>

            <span class="account-type">Menunggu API</span>
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
            <p>Data pengguna dan role belum ditampilkan karena endpoint users belum dibuat.</p>
          </div>
        </div>

        <div class="empty-table">
          Modul akses pengguna perlu dihubungkan ke API autentikasi/roles tersendiri.
        </div>
      </article>
    </template>
  </section>
</template>

<style scoped>
.receivable-message {
  margin-bottom: 16px;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
}
.error-message {
  border: 1px solid #f3c7c7;
  background: #fff6f6;
  color: #a84343;
}
.success-message {
  border: 1px solid #bfe8d0;
  background: #f1fff6;
  color: #23774b;
}
.optional-label {
  color: #8d9cb3;
  font-size: 10px;
  font-weight: 500;
}
</style>
