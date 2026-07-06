<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [String, Number], default: '-' },
})

const label = computed(() => String(props.value || '-').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
const tone = computed(() => {
  const value = String(props.value || '').toLowerCase()
  if (['active', 'paid', 'completed', 'posted', 'closed', 'approved', 'ongoing', 'success'].some((item) => value.includes(item))) return 'success'
  if (['overdue', 'cancelled', 'inactive', 'rejected', 'late', 'unpaid'].some((item) => value.includes(item))) return 'danger'
  if (['draft', 'planning', 'pending', 'review'].some((item) => value.includes(item))) return 'warning'
  return 'info'
})
</script>

<template>
  <span :class="['status-badge', `status-badge--${tone}`]">{{ label }}</span>
</template>
