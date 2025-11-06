<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

// Tipe data
interface StadionSelect {
  id: number
  name: string
}

interface FieldData {
  id: number
  name: string
  description: string | null
  pricePerHour: number
  stadionId: number
}

interface FetchErrorData {
  data?: { statusMessage: string }
}

const router = useRouter()
const route = useRoute()
const fieldId = route.params.id as string

// State
const form = ref({
  stadionId: 0,
  name: '',
  description: '',
  pricePerHour: 0,
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Ambil daftar stadion untuk dropdown
const { data: stadions } = await useAsyncData(
  'stadionListForSelect',
  () => $fetch<StadionSelect[]>('/api/stadions')
)

// Ambil data lapangan saat ini
const { data: field, error: fetchError, pending: pagePending } = await useAsyncData(
  `field-${fieldId}`,
  () => $fetch<FieldData>(`/api/fields/${fieldId}`)
)

// Isi form jika data berhasil dimuat
if (field.value) {
  form.value.stadionId = field.value.stadionId
  form.value.name = field.value.name
  form.value.description = field.value.description || ''
  form.value.pricePerHour = field.value.pricePerHour
} else if (fetchError.value) {
  const typedError = fetchError.value as FetchErrorData
  errorMsg.value = typedError.data?.statusMessage || 'Gagal memuat data lapangan.'
}

// Fungsi submit update
async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/fields/update', {
      method: 'POST',
      body: {
        fieldId,
        ...form.value,
      },
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
          Edit Lapangan ID {{ fieldId }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Perbarui detail lapangan di bawah ini.
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

    <!-- Loading State -->
    <div v-if="pagePending" class="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
      <p class="text-gray-500">Loading data lapangan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="!field" class="p-4 text-red-700 bg-red-100 rounded-lg">
      Error: Data lapangan tidak ditemukan. {{ errorMsg }}
    </div>

    <!-- Form Edit -->
    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <div class="p-5 sm:p-6">
          <!-- Error Submit -->
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
                placeholder="Lapangan dengan permukaan lantai yang aman, dilengkapi dengan pencahayaan malam hari."
              />
            </label>

            <!-- Harga per Jam -->
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Harga per Jam <span class="text-red-500">*</span>
              </span>
              <input
                v-model.number="form.pricePerHour"
                type="text" inputmode="numeric" pattern="[0-9]*" required
                min="0"
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
            class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Memperbarui...' : 'Perbarui Lapangan' }}
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