<template>
  <div
    class="dashboard-row rounded-xl border px-4 py-3"
    :class="toneClass[tone]"
  >
    <p class="text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
      {{ label }}
    </p>
    <p class="mt-1 text-sm font-semibold">{{ value }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  tone: "navy" | "blue" | "green";
}>();

const toneClass = {
  navy: "border-[#DCE7F4] bg-[#F9FBFE] text-[#102A56]",
  blue: "border-[#D7E8FA] bg-[#F4F9FF] text-[#1E5AA8]",
  green: "border-[#D5F0E1] bg-[#F1FBF6] text-[#16885B]",
};
</script>
