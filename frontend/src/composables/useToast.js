import { reactive, readonly } from 'vue'

const state = reactive({
  visible: false,
  title: '',
  message: '',
  timer: null,
})

export function useToast() {
  function show(message, title = 'Sistem FinStart') {
    state.title = title
    state.message = message
    state.visible = true

    if (state.timer) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.visible = false
    }, 4200)
  }

  function close() {
    state.visible = false
  }

  return { toast: readonly(state), show, close }
}
