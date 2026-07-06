<script setup>
import { CheckCircle2, X } from 'lucide-vue-next'
import { useToast } from '../../composables/useToast'

const { toast, close } = useToast()
</script>

<template>
  <Transition name="toast">
    <section v-if="toast.visible" class="global-toast" role="status">
      <span class="global-toast__icon"><CheckCircle2 :size="17" /></span>
      <div class="global-toast__body">
        <strong>{{ toast.title }}</strong>
        <p>{{ toast.message }}</p>
      </div>
      <button class="icon-plain" type="button" aria-label="Tutup notifikasi" @click="close">
        <X :size="17" />
      </button>
    </section>
  </Transition>
</template>
