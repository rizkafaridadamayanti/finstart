<template>
  <div
    class="flex flex-col gap-2 border-t border-[#E8EEF7] bg-white px-4 py-3 text-xs text-[#6B7A90] sm:flex-row sm:items-center sm:justify-between"
  >
    <span>Menampilkan {{ start }}-{{ end }} dari {{ total }} data terbaru</span>
    <div class="flex items-center gap-2">
      <button
        type="button"
        :disabled="currentPage <= 1"
        :class="[buttonClass, currentPage <= 1 && disabledClass]"
        @click="emit('page-change', currentPage - 1)"
      >
        Sebelumnya
      </button>
      <span
        class="min-w-[72px] text-center text-[11px] font-bold text-[#0B1F4A]"
      >
        Hal {{ currentPage }}/{{ pages }}
      </span>
      <button
        type="button"
        :disabled="currentPage >= pages"
        :class="[buttonClass, currentPage >= pages && disabledClass]"
        @click="emit('page-change', currentPage + 1)"
      >
        Berikutnya
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  TABLE_PAGE_SIZE,
  safePage,
  totalPages,
} from "../../utils/tablePagination.js";

const props = withDefaults(
  defineProps<{
    page: number;
    total: number;
    pageSize?: number;
  }>(),
  {
    pageSize: TABLE_PAGE_SIZE,
  },
);

const emit = defineEmits<{
  (_event: "page-change", _page: number): void;
}>();

const pages = computed(() => totalPages(props.total, props.pageSize));
const currentPage = computed(() =>
  safePage(props.page, props.total, props.pageSize),
);
const start = computed(() =>
  props.total ? (currentPage.value - 1) * props.pageSize + 1 : 0,
);
const end = computed(() =>
  Math.min(props.total, currentPage.value * props.pageSize),
);

const disabledClass = "cursor-not-allowed opacity-45";
const buttonClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-[#D8E5F4] bg-white px-3 text-[11px] font-bold text-[#0B1F4A] transition hover:bg-[#F8FBFE] disabled:cursor-not-allowed disabled:opacity-45";
</script>
