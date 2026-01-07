<script setup lang="ts">
import { ref } from 'vue'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  icon?: string
  mode?: 'confirm' | 'alert'
}

const isOpen = ref(false)
const options = ref<ConfirmationOptions>({
  title: 'Konfirmasi',
  message: 'Apakah Anda yakin?',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  type: 'info',
  mode: 'confirm'
})

let resolvePromise: ((value: boolean) => void) | null = null

const open = (opts: ConfirmationOptions): Promise<boolean> => {
  options.value = {
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    type: 'info',
    mode: 'confirm',
    ...opts
  }
  isOpen.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const confirm = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(true)
}

const cancel = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-scale">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        role="dialog"
        aria-modal="true"
        @click="cancel"
      >
        <div
          class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          @click.stop
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div v-if="options.type === 'danger'" class="absolute top-0 left-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
           <div v-if="options.type === 'warning'" class="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
           <div v-if="options.type === 'success'" class="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <button
            @click="cancel"
            class="absolute top-4 right-4 z-10 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-110 focus:outline-none"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <div class="relative p-8 space-y-6 text-center">
            
            <div class="flex justify-center">
              <div
                class="inline-flex items-center justify-center h-20 w-20 rounded-full shadow-lg transition-all duration-300"
                :class="{
                  'bg-gradient-to-br from-red-600 to-red-800 shadow-red-600/30': options.type === 'danger',
                  'bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/30': options.type === 'warning',
                  'bg-gradient-to-br from-[#1f2a56] to-[#0f1a3c] shadow-[#1f2a56]/25': options.type === 'info',
                  'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-600/30': options.type === 'success'
                }"
              >
                 <svg v-if="options.type === 'danger'" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <svg v-else-if="options.type === 'warning'" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <svg v-else-if="options.type === 'success'" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="h-10 w-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-2xl font-bold text-gray-900" id="modal-title">
                {{ options.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed whitespace-pre-line">
                {{ options.message }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                v-if="options.mode === 'confirm'"
                type="button"
                class="order-2 sm:order-1 flex-1 inline-flex items-center justify-center px-4 py-3.5 text-sm font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl transition-all duration-200 focus:outline-none hover:border-gray-400 active:scale-[0.98]"
                @click="cancel"
              >
                {{ options.cancelText }}
              </button>

              <button
                type="button"
                class="order-1 sm:order-2 flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none active:scale-[0.98]"
                 :class="{
                  'bg-gradient-to-r from-red-600 to-red-800 shadow-red-600/20 hover:shadow-red-600/30': options.type === 'danger',
                  'bg-gradient-to-r from-amber-500 to-amber-700 shadow-amber-500/20 hover:shadow-amber-500/30': options.type === 'warning',
                  'bg-gradient-to-r from-[#1f2a56] to-[#0f1a3c] shadow-[#1f2a56]/20 hover:shadow-[#1f2a56]/30': options.type === 'info',
                  'bg-gradient-to-r from-emerald-600 to-emerald-800 shadow-emerald-600/20 hover:shadow-emerald-600/30': options.type === 'success'
                }"
                @click="confirm"
              >
                {{ options.confirmText }}
                 <svg v-if="options.mode === 'alert'" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: opacity 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
}

.modal-scale-enter-active .relative,
.modal-scale-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-scale-enter-from .relative,
.modal-scale-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>