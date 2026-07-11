<template>
  <template
    v-for="(line, lineIndex) in parsedLines"
    :key="`${line.text}-${lineIndex}`"
  >
    <li
      v-if="line.isList"
      class="ml-4 list-disc pl-1 text-[12px] leading-5"
      :class="textClass"
    >
      <template v-for="(part, partIndex) in line.parts" :key="partIndex">
        <strong v-if="part.emphasis" class="font-semibold text-[#0B1F4A]">{{
          part.text
        }}</strong>
        <span v-else>{{ part.text }}</span>
      </template>
    </li>
    <p v-else class="text-[12px] leading-5" :class="textClass">
      <template v-for="(part, partIndex) in line.parts" :key="partIndex">
        <strong v-if="part.emphasis" class="font-semibold text-[#0B1F4A]">{{
          part.text
        }}</strong>
        <span v-else>{{ part.text }}</span>
      </template>
    </p>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ text: string; sender: "ai" | "user" }>();

const textClass = computed(() =>
  props.sender === "user" ? "text-[#0B1F4A]" : "text-[#213B61]",
);
const parsedLines = computed(() =>
  String(props.text || "")
    .split("\n")
    .map((line) => ({
      text: line,
      isList: line.trim().startsWith("-") || line.trim().startsWith("*"),
      parts: line.split(/(\*\*.*?\*\*)/g).map((part) => ({
        emphasis: part.startsWith("**") && part.endsWith("**"),
        text:
          part.startsWith("**") && part.endsWith("**")
            ? part.slice(2, -2)
            : part,
      })),
    })),
);
</script>
