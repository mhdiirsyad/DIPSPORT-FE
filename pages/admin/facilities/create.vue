<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { availableIcons, VALID_FACILITY_ICONS } from '~/utils/validIconList'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

const router = useRouter()

const form = ref({
  name: '',
  icon: VALID_FACILITY_ICONS[0],
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/facilities/create', {
      method: 'POST',
      body: form.value,
    })
    await router.push('/admin/facilities')
  } catch (err: any) {
    errorMsg.value =
      err.data?.statusMessage || err.message || 'Gagal menyimpan fasilitas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Tambah Fasilitas Baru
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Buat master data fasilitas (mis: Toilet, Kantin, Mushola, dll).
        </p>
      </div>

      <NuxtLink
        to="/admin/facilities"
        class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </header>

    <!-- Form Card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <!-- Form Body -->
        <div class="p-5 sm:p-8">
          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <div class="grid grid-cols-1 gap-8">
            <!-- Nama Fasilitas -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Fasilitas <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Mis: Toilet Umum, Kantin, Mushola"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <!-- Pilih Ikon -->
            <fieldset>
              <legend class="block text-sm font-medium text-gray-700 mb-4">
                Pilih Ikon <span class="text-red-500">*</span>
              </legend>
              <p class="text-sm text-gray-500 mb-6">
                Pilih ikon yang paling sesuai untuk merepresentasikan fasilitas ini.
              </p>

              <div class="max-w-6xl mx-auto">
                <div
                  class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-5"
                >
                  <label
                    v-for="icon in availableIcons"
                    :key="icon.value"
                    :title="icon.name"
                    class="group relative flex flex-col items-center justify-center h-32 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                    :class="[
                      form.icon === icon.value
                        ? 'bg-blue-50 border-blue-600 ring-4 ring-blue-600/30 shadow-blue-200 shadow-2xl'
                        : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                    ]"
                  >
                    <input
                      type="radio"
                      v-model="form.icon"
                      :value="icon.value"
                      class="sr-only"
                    />

                    <Icon
                      :icon="icon.value"
                      class="h-14 w-14 mb-2 text-gray-700 transition-transform group-hover:scale-110"
                      :class="form.icon === icon.value ? 'text-blue-600' : ''"
                    />

                    <span
                      class="text-xs font-medium text-gray-700 capitalize text-center px-2 leading-tight"
                      :class="form.icon === icon.value ? 'text-blue-700' : ''"
                    >
                      {{ icon.name }}
                    </span>

                    <!-- Checkmark -->
                    <div
                      v-if="form.icon === icon.value"
                      class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-md ring-2 ring-white"
                    >
                      <svg
                        class="h-4.5 w-4.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>

              <p class="mt-6 text-xs text-gray-500 text-center">
                💡 Pilih ikon yang paling mudah dikenali oleh pengguna.
              </p>
            </fieldset>
          </div>
        </div>

        <!-- Action Buttons (LEFT-ALIGNED) -->
        <div class="flex items-center justify-start gap-3 bg-gray-50/80 px-6 py-5 sm:px-8">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Fasilitas' }}
          </button>

          <NuxtLink
            to="/admin/facilities"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>
