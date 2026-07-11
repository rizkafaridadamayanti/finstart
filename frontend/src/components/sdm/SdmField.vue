<template>
  <div class="space-y-2">
    <label
      :class="
        dark
          ? 'text-[9px] font-extrabold text-[#64708F] uppercase tracking-wide'
          : labelClass
      "
      >{{ label }}</label
    >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    dark?: boolean;
    labelClass?: string;
  }>(),
  {
    dark: false,
    labelClass:
      "text-[10px] font-semibold uppercase tracking-[0.14em] text-[#70819B]",
  },
);
</script>
