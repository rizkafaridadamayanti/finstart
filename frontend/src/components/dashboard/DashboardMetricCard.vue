<template>
  <div
    class="dashboard-card-enter dashboard-surface dashboard-lift group overflow-hidden rounded-2xl p-5"
  >
    <div class="flex items-start justify-between gap-3">
      <p
        class="text-[11px] font-semibold uppercase tracking-[0.11em] text-[#7A8CA8]"
      >
        {{ label }}
      </p>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ring-1"
        :class="styleByTone[tone]"
      >
        <component :is="icon" class="h-[18px] w-[18px]" />
      </div>
    </div>
    <div class="mt-5">
      <p class="text-[25px] font-semibold tracking-[-0.02em] text-[#102A56]">
        {{ value }}
      </p>
      <p
        class="mt-2 flex items-center gap-1.5 text-[12px] leading-5 text-[#6B7A90]"
      >
        <span
          class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#ECFBF4] text-[#0E9F6E]"
        >
          <TrendingUp class="h-2.5 w-2.5" />
        </span>
        {{ detail }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { TrendingUp } from "lucide-vue-next";

defineProps<{
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "green" | "amber" | "purple";
  icon: Component;
}>();

const styleByTone = {
  blue: "bg-[#EAF4FF] text-[#1E5AA8] ring-[#B9D9F8]",
  green: "bg-[#EAFBF3] text-[#0E9F6E] ring-[#BCEBD5]",
  amber: "bg-[#FFF7E8] text-[#D48A00] ring-[#F7DCA3]",
  purple: "bg-[#F7F0FF] text-[#8B2CF5] ring-[#D8C4FA]",
};
</script>
