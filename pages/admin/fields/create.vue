<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

// Tipe untuk data dropdown stadion
interface StadionSelect {
  id: number
  name: string
}

// Ambil daftar stadion untuk dropdown
const { data: stadions } = await useAsyncData(
  'stadionListForSelect',
  () => $fetch<StadionSelect[]>('/api/stadions')
)

const router = useRouter()
const form = ref({
  stadionId: '',
  name: '',
  description: '',
  pricePerHour: 0,
})
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/fields/create', {
      method: 'POST',
      body: form.value,
    })
    await router.push('/admin/fields')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Tambah Lapangan Baru
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Isi detail formulir untuk mendaftarkan lapangan baru.
        </p>
      </div>

      <NuxtLink
        to="/admin/fields"
        class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </header>

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <div class="p-5 sm:p-6">
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <div class="grid grid-cols-1 gap-6 sm:max-w-xl">
            <!-- Stadion Induk -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Stadion Induk <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.stadionId"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value="" disabled>Pilih stadion</option>
                <option v-for="stadion in stadions" :key="stadion.id" :value="stadion.id">
                  {{ stadion.name }} (ID: {{ stadion.id }})
                </option>
              </select>
            </label>

            <!-- Nama Lapangan -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lapangan <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Lapangan Futsal A"
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
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
              />
            </label>

            <!-- Harga per Jam -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Harga per Jam <span class="text-red-500">*</span>
              </span>
              <input
                v-model.number="form.pricePerHour"
                type="number"
                required
                min="0"
                placeholder="100000"
                class="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </label>
          </div>
        </div>

        <!-- Footer Aksi -->
        <div class="flex items-center justify-start gap-3 bg-gray-50/75 px-5 py-4 sm:px-6">
          <button
            type="submit"
            :disabled="loading"
            class="ds-button-primary"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Lapangan' }}
          </button>

          <NuxtLink
            to="/admin/fields"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>