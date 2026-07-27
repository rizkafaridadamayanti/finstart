<template>
  <div class="login-shell">
    <div class="login-shell-glow login-shell-glow--a" aria-hidden="true" />
    <div class="login-shell-glow login-shell-glow--b" aria-hidden="true" />

    <div class="login-panel-enter login-card">
      <!-- PANEL KIRI: ilustrasi finance & teknologi penuh -->
      <div class="login-card-left">
        <img
          :src="loginIllustration"
          alt="Ilustrasi analitik keuangan digital"
          class="login-illustration-bg"
        />
        <div class="login-illustration-tint" aria-hidden="true" />
        <div class="login-illustration-shade" aria-hidden="true" />
        <div class="login-brand-overlay">
          <button
            id="login-back-to-landing"
            type="button"
            class="login-brand"
            @click="goBack"
          >
            <span class="login-brand-icon"><KedataLogo :size="24" /></span>
            <span class="login-brand-text">
              <span class="login-brand-title">PT Kedata Indonesia Digital</span>
              <span class="login-brand-sub">Finstart Workspace</span>
            </span>
          </button>
        </div>
      </div>

      <!-- PANEL KANAN: form login -->
      <div class="login-card-right">
        <button
          id="mobile-back-to-landing"
          type="button"
          class="login-mobile-back"
          @click="goBack"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          Kembali ke Landing Page
        </button>

        <h1 class="login-title">Login</h1>
        <p class="login-subtitle">
          Masuk untuk melanjutkan operasional finansial Finstart.
        </p>

        <div v-if="error" class="login-error" role="alert">
          {{ error }}
        </div>

        <form class="login-form" novalidate @submit.prevent="handleSubmit">
          <div class="login-field">
            <label for="login-email" class="login-label">Email</label>
            <input
              id="login-email"
              v-model="email"
              name="email"
              type="email"
              placeholder="Masukkan email Anda"
              class="login-input"
              required
            />
          </div>

          <div class="login-field">
            <label for="login-password" class="login-label">Password</label>
            <div class="login-input-wrap">
              <input
                id="login-password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Masukkan kata sandi"
                class="login-input login-input--with-icon"
                required
              />
              <button
                id="btn-show-password"
                type="button"
                class="login-eye-btn"
                :aria-pressed="showPassword"
                :aria-label="
                  showPassword
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                "
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="login-row">
            <label class="login-remember">
              <input
                id="login-remember-browser"
                v-model="rememberBrowser"
                type="checkbox"
              />
              Ingat saya
            </label>
            <span class="login-forgot">Lupa Sandi?</span>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            :disabled="isLoading"
            class="login-submit"
          >
            <template v-if="isLoading">
              <ShieldCheck class="h-4 w-4 login-spin" />
              Memverifikasi Akses...
            </template>
            <template v-else> Masuk ke Dashboard </template>
          </button>
        </form>

        <p class="login-footnote">
          Belum punya akun? <span class="login-link">Hubungi Admin</span>
        </p>
        <p class="login-terms">Syarat &amp; Ketentuan</p>
        <p class="login-help">
          Ada kendala akses? Hubungi kami di
          <span class="login-help-strong">it@kedata.online</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-vue-next";
import KedataLogo from "./KedataLogo.vue";
import loginIllustration from "../assets/login-illustration.jpg";
import {
  financeApi,
  getApiErrorMessage,
  saveAuthSession,
} from "../services/financeApi.js";

const emit = defineEmits(["login-success", "back"]);

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberBrowser = ref(true);
const isLoading = ref(false);
const error = ref("");

function goBack() {
  emit("back");
}

async function handleSubmit() {
  error.value = "";

  if (!email.value || !password.value) {
    error.value = "Harap isi alamat email dan kata sandi Anda.";
    return;
  }

  isLoading.value = true;
  try {
    const session = await financeApi.login(
      email.value.trim().toLowerCase(),
      password.value,
      rememberBrowser.value,
    );
    saveAuthSession(session, rememberBrowser.value);
    isLoading.value = false;
    emit("login-success", session);
  } catch (loginError) {
    console.error(loginError);
    error.value = getApiErrorMessage(
      loginError,
      "Email atau kata sandi tidak sesuai.",
    );
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-shell {
  position: relative;
  display: flex;
  height: 100vh;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0b1f4a;
  padding: 1.5rem;
  font-family: var(--font-sans, sans-serif);
}

.login-shell-glow {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(90px);
}

.login-shell-glow--a {
  left: -6rem;
  top: -6rem;
  height: 18rem;
  width: 18rem;
  background: rgba(255, 255, 255, 0.06);
}

.login-shell-glow--b {
  right: -6rem;
  bottom: -6rem;
  height: 24rem;
  width: 24rem;
  background: rgba(56, 189, 248, 0.12);
}

.login-panel-enter {
  animation: loginPanelEnter 0.56s ease-out both;
}

@keyframes loginPanelEnter {
  from {
    opacity: 0;
    transform: translateY(22px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  position: relative;
  z-index: 10;
  display: grid;
  width: 100%;
  max-width: 72rem;
  overflow: hidden;
  border-radius: 32px;
  background: #ffffff;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .login-card {
    grid-template-columns: 1.1fr 1fr;
  }
}

.login-card-left {
  position: relative;
  display: none;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .login-card-left {
    display: block;
  }
}

.login-illustration-bg {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: 50% 50%;
}

.login-illustration-bg {
  filter: saturate(0.9);
}

.login-illustration-tint {
  position: absolute;
  inset: 0;
  background: #1e40af;
  mix-blend-mode: color;
  opacity: 0.65;
}

.login-illustration-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    165deg,
    rgba(6, 11, 29, 0.35) 0%,
    rgba(6, 11, 29, 0.05) 40%,
    rgba(6, 11, 29, 0.45) 100%
  );
}

.login-brand-overlay {
  position: relative;
  z-index: 2;
  padding: 2rem;
  background: linear-gradient(
    180deg,
    rgba(6, 11, 29, 0.65) 0%,
    rgba(6, 11, 29, 0) 55%
  );
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.login-brand-icon {
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #ffffff;
}

.login-brand-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #ffffff;
}

.login-brand-sub {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #7dd3fc;
}

.login-card-right {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  color: #0b1f4a;
  padding: 2.5rem 2rem;
}

@media (min-width: 640px) {
  .login-card-right {
    padding: 2.5rem 3rem;
  }
}

.login-mobile-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-bottom: 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  color: #53658a;
}

@media (min-width: 1024px) {
  .login-mobile-back {
    display: none;
  }
}

.login-title {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0b1f4a;
}

.login-subtitle {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7a90;
}

.login-error {
  margin-top: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid #fecdd3;
  background: #fff1f2;
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #be123c;
}

.login-form {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.login-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #53658a;
}

.login-input {
  height: 2.75rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid #d1dfef;
  background: #f9fbfd;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #182338;
  outline: none;
  transition: 0.15s ease;
}

.login-input::placeholder {
  color: #94a3b8;
}

.login-input:focus {
  border-color: #1e5aa8;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(30, 90, 168, 0.1);
}

.login-input-wrap {
  position: relative;
}

.login-input--with-icon {
  padding-right: 2.75rem;
}

.login-eye-btn {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  background: none;
  color: #8a9ab0;
  cursor: pointer;
  transition: 0.15s ease;
}

.login-eye-btn:hover {
  background: #eef4fb;
  color: #1e5aa8;
}

.login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.login-remember {
  display: flex;
  cursor: pointer;
  align-items: center;
  gap: 0.5rem;
  color: #53658a;
}

.login-remember input {
  height: 1rem;
  width: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #bfd0e6;
  background: #f9fbfd;
}

.login-forgot {
  font-weight: 600;
  color: #1e5aa8;
}

.login-submit {
  display: flex;
  height: 3rem;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.75rem;
  background: #0b1f4a;
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 12px 22px rgba(11, 31, 74, 0.2);
  cursor: pointer;
  transition: 0.15s ease;
}

.login-submit:hover:not(:disabled) {
  background: #102a56;
}

.login-submit:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.login-spin {
  animation: loginSpinPulse 1.1s ease-in-out infinite;
}

@keyframes loginSpinPulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.login-footnote {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  color: #6b7a90;
}

.login-link {
  font-weight: 700;
  color: #1e5aa8;
}

.login-terms {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.6875rem;
  color: #94a3b8;
}

.login-help {
  margin-top: 2rem;
  font-size: 0.6875rem;
  line-height: 1.5;
  color: #94a3b8;
}

.login-help-strong {
  font-weight: 600;
  color: #53658a;
}
</style>
