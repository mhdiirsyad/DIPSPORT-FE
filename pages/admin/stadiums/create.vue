<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

const router = useRouter()

// Form state
const form = ref({
  name: '',
  description: '',
  mapUrl: 'https://maps.google.com/'
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Validasi URL
const isValidUrl = (url: string): boolean => {
  return /^https?:\/\//.test(url)
}

// Submit handler
async function handleSubmit() {
  // Reset error
  errorMsg.value = null

  // Validasi URL
  if (!isValidUrl(form.value.mapUrl)) {
    errorMsg.value = 'URL Peta harus diawali dengan http:// atau https://'
    return
  }

  loading.value = true

  try {
    await $fetch('/api/stadions/create', {
      method: 'POST',
      body: form.value
    })

    // Berhasil → redirect
    await router.push('/admin/stadiums')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message || 'Gagal menyimpan stadion.'
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
          Tambah Stadion Baru
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Isi detail formulir untuk mendaftarkan stadion baru.
        </p>
      </div>

      <NuxtLink
        to="/admin/stadiums"
        class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px sm:px-6"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </header>

    <!-- Form Card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <!-- Form Fields -->
        <div class="p-5 sm:p-6">
          <!-- Error Alert -->
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <!-- Form Grid -->
          <div class="grid grid-cols-1 gap-6 sm:max-w-xl">
            <!-- Nama Stadion -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Stadion <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Stadion Diponegoro"
              />
            </label>

            <!-- Deskripsi -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi
              </span>
              <textarea
                v-model="form.description"
                rows="4"
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                placeholder="Stadion dengan fasilitas dan perlengkapan olahraga yang lengkap, tribun berkapasitas 5000 penonton."
              />
            </label>

            <!-- URL Google Maps -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                URL Google Maps <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.mapUrl"
                type="url"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="https://maps.app.goo.gl/..."
              />
              <p class="mt-1.5 text-xs text-gray-500">
                Salin URL dari tombol <strong>Share</strong> di Google Maps.
              </p>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-start gap-3 bg-gray-50/75 px-5 py-4 sm:px-6">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Stadion' }}
          </button>

          <NuxtLink
            to="/admin/stadiums"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>