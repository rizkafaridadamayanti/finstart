<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  helper: { type: String, default: '' },
  trend: { type: String, default: '' },
  icon: { type: Object, default: null },
  tone: { type: String, default: 'blue' },
})

const toneClass = computed(() => `metric-card__icon--${props.tone}`)
</script>

<template>
  <article class="metric-card">
    <header>
      <span :class="['metric-card__icon', toneClass]"><component :is="icon" v-if="icon" :size="18" /></span>
      <em v-if="trend">{{ trend }}</em>
    </header>
    <p>{{ label }}</p>
    <strong>{{ value }}</strong>
    <small>{{ helper }}</small>
  </article>
</template>
