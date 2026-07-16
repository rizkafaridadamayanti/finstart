<script setup>
import { computed, ref, watch } from "vue";
import { AlertTriangle, X } from "lucide-vue-next";

const props = defineProps({
  open: { type: Boolean, default: false },
  eyebrow: { type: String, default: "Konfirmasi" },
  title: { type: String, default: "Lanjutkan tindakan?" },
  message: { type: String, default: "" },
  details: { type: Array, default: () => [] },
  impactTitle: { type: String, default: "" },
  impactItems: { type: Array, default: () => [] },
  confirmLabel: { type: String, default: "Lanjutkan" },
  cancelLabel: { type: String, default: "Batalkan" },
  variant: { type: String, default: "danger" },
  requireReason: { type: Boolean, default: false },
  reasonLabel: { type: String, default: "Alasan" },
  reasonPlaceholder: { type: String, default: "Tulis alasan singkat..." },
  defaultReason: { type: String, default: "" },
});

const emit = defineEmits(["confirm", "cancel"]);
const reason = ref(props.defaultReason);

watch(
  () => props.open,
  (open) => {
    if (open) reason.value = props.defaultReason;
  },
);

const canConfirm = computed(() => {
  return !props.requireReason || reason.value.trim().length > 0;
});

function closeDialog() {
  emit("cancel");
}

function confirmDialog() {
  if (!canConfirm.value) return;
  emit("confirm", reason.value.trim());
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="confirm-overlay"
      role="dialog"
      aria-modal="true"
      @click.self="closeDialog"
    >
      <section class="confirm-card">
      <header class="confirm-header">
        <div class="confirm-icon" :class="variant">
          <AlertTriangle :size="20" />
        </div>
        <div>
          <p class="confirm-eyebrow">{{ eyebrow }}</p>
          <h3>{{ title }}</h3>
        </div>
        <button
          type="button"
          class="confirm-close"
          aria-label="Tutup"
          @click="closeDialog"
        >
          <X :size="18" />
        </button>
      </header>

      <div class="confirm-body">
        <p v-if="message" class="confirm-message">{{ message }}</p>

        <dl v-if="details.length" class="confirm-details">
          <div v-for="item in details" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>

        <label v-if="requireReason" class="confirm-reason">
          <span>{{ reasonLabel }}</span>
          <textarea
            v-model="reason"
            rows="3"
            :placeholder="reasonPlaceholder"
            autocomplete="off"
          ></textarea>
        </label>

        <div v-if="impactItems.length" class="confirm-impact">
          <p>{{ impactTitle || "Yang akan terdampak" }}</p>
          <ul>
            <li v-for="item in impactItems" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>

      <footer class="confirm-actions">
        <button
          type="button"
          class="confirm-button secondary"
          @click="closeDialog"
        >
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="confirm-button primary"
          :class="variant"
          :disabled="!canConfirm"
          @click="confirmDialog"
        >
          {{ confirmLabel }}
        </button>
      </footer>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 130000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(17, 24, 39, 0.55);
  backdrop-filter: blur(8px);
}

.confirm-card {
  width: min(520px, calc(100vw - 32px));
  max-height: calc(100dvh - 48px);
  overflow: hidden auto;
  border: 1px solid #dce7f4;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.28);
}

.confirm-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: flex-start;
  border-bottom: 1px solid #e8eef7;
  padding: 22px 24px 18px;
}

.confirm-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 14px;
}

.confirm-icon.danger {
  background: #fff1f3;
  color: #e11d48;
}

.confirm-icon.warning {
  background: #fff7e8;
  color: #b86a00;
}

.confirm-eyebrow {
  margin: 0 0 4px;
  color: #e11d48;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.confirm-header h3 {
  margin: 0;
  color: #102a56;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.2;
}

.confirm-close {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 12px;
  color: #8a98ab;
  transition:
    background-color 0.18s ease,
    color 0.18s ease;
}

.confirm-close:hover {
  background: #f4f8fc;
  color: #102a56;
}

.confirm-body {
  display: grid;
  gap: 16px;
  padding: 22px 24px 6px;
}

.confirm-message {
  margin: 0;
  color: #53658a;
  font-size: 14px;
  line-height: 1.7;
}

.confirm-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
  background: #f8fbfe;
}

.confirm-details div:first-child:last-child,
.confirm-details div:nth-child(3) {
  grid-column: 1 / -1;
}

.confirm-details dt {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.confirm-details dd {
  margin: 5px 0 0;
  overflow-wrap: anywhere;
  color: #182338;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
}

.confirm-reason {
  display: grid;
  gap: 8px;
  color: #70819b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.confirm-reason textarea {
  min-height: 88px;
  resize: vertical;
  border: 1px solid #d8e5f4;
  border-radius: 16px;
  padding: 12px 14px;
  color: #182338;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 1.5;
  outline: none;
  text-transform: none;
}

.confirm-reason textarea:focus {
  border-color: #1e5aa8;
  box-shadow: 0 0 0 3px rgba(30, 90, 168, 0.12);
}

.confirm-impact {
  border: 1px solid #fecdd3;
  border-radius: 18px;
  padding: 15px 16px;
  background: #fff1f3;
  color: #881337;
}

.confirm-impact p {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
}

.confirm-impact ul {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #4a1725;
  font-size: 13px;
  line-height: 1.65;
}

.confirm-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 22px 24px 24px;
}

.confirm-button {
  min-height: 48px;
  border-radius: 16px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 900;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.confirm-button:hover {
  transform: translateY(-1px);
}

.confirm-button.secondary {
  border: 1px solid #d8e5f4;
  background: #ffffff;
  color: #53658a;
}

.confirm-button.secondary:hover {
  background: #f8fbfe;
  color: #102a56;
}

.confirm-button.primary.danger {
  background: #e11d48;
  color: #ffffff;
}

.confirm-button.primary.warning {
  background: #0b1f4a;
  color: #ffffff;
}

.confirm-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

@media (max-width: 640px) {
  .confirm-overlay {
    align-items: flex-end;
    padding: 12px;
  }

  .confirm-card {
    width: 100%;
    border-radius: 22px;
  }

  .confirm-header,
  .confirm-body,
  .confirm-actions {
    padding-left: 18px;
    padding-right: 18px;
  }

  .confirm-details,
  .confirm-actions {
    grid-template-columns: 1fr;
  }
}
</style>
