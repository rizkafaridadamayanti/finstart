<template>
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    :aria-label="label"
    :disabled="disabled"
    class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border p-0.5 transition disabled:cursor-not-allowed disabled:opacity-55"
    :class="
      checked
        ? 'border-[#0B1F4A] bg-[#0B1F4A]'
        : 'border-[#C9D8E8] bg-[#EEF4FB]'
    "
    @click="emit('update:checked', !checked)"
  >
    <span
      class="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
      :class="checked ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    checked: boolean;
    label: string;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  "update:checked": [checked: boolean];
}>();
</script>
