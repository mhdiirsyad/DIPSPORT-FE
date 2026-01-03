<script setup lang="ts">
import { ref } from 'vue'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  icon?: string
}

const isOpen = ref(false)
const options = ref<ConfirmationOptions>({
  title: 'Konfirmasi',
  message: 'Apakah Anda yakin?',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  type: 'info'
})

let resolvePromise: ((value: boolean) => void) | null = null

const open = (opts: ConfirmationOptions): Promise<boolean> => {
  options.value = {
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    type: 'info',
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
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999]"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-md"
          aria-hidden="true"
          @click="cancel"
        ></div>

        <div class="relative flex min-h-screen items-center justify-center p-4 overflow-y-auto">
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div class="relative w-full max-w-lg bg-white rounded-2xl text-left overflow-hidden shadow-2xl border border-gray-100">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 transition-colors duration-200"
                    :class="{
                      'bg-red-100 text-red-600': options.type === 'danger',
                      'bg-amber-100 text-amber-600': options.type === 'warning',
                      'bg-blue-100 text-blue-600': options.type === 'info',
                      'bg-green-100 text-green-600': options.type === 'success'
                    }"
                  >
                    <svg v-if="options.type === 'danger'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <svg v-else-if="options.type === 'warning'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <svg v-else-if="options.type === 'success'" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 class="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      {{ options.title }}
                    </h3>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500">
                        {{ options.message }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button
                  type="button"
                  class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm transition-all active:scale-95"
                  :class="{
                    'bg-red-600 hover:bg-red-700 focus:ring-red-500': options.type === 'danger',
                    'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500': options.type === 'warning',
                    'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500': options.type === 'info',
                    'bg-green-600 hover:bg-green-700 focus:ring-green-500': options.type === 'success'
                  }"
                  @click="confirm"
                >
                  {{ options.confirmText }}
                </button>
                <button
                  type="button"
                  class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all active:scale-95"
                  @click="cancel"
                >
                  {{ options.cancelText }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
