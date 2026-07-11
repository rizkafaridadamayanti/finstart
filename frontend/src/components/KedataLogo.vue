<template>
  <img :src="kedataLogo" :alt="alt" :class="computedClass" :style="logoStyle" />
</template>

<script setup>
import { computed } from "vue";
import kedataLogo from "../assets/kedata-logo.png";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "Logo PT Kedata Indonesia Digital",
  },
  size: {
    type: [Number, String],
    default: 36,
  },
});

const computedClass = computed(() => props.class || "");

const logoStyle = computed(() => {
  const requestedSize = Number(props.size);
  const size =
    Number.isFinite(requestedSize) && requestedSize > 0 ? requestedSize : 36;

  return {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    maxWidth: `${size}px`,
    objectFit: "contain",
    display: "block",
    flexShrink: 0,
  };
});
</script>
