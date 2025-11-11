<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Tipe data
interface StadionSelect {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE'
}

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

// Fetch daftar stadion (pastikan API mengembalikan field `status`)
const { data: stadions } = await useAsyncData('stadionListForSelect', () =>
  $fetch<StadionSelect[]>('/api/stadions')
)

const router = useRouter()

// Form state
const form = ref({
  stadionId: '',
  name: '',
  description: '',
  pricePerHour: 0,
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)

// Computed: stadion yang sedang dipilih
const selectedStadion = computed(() => {
  if (!form.value.stadionId || !stadions.value) return null
  return stadions.value.find((s) => s.id === Number(form.value.stadionId))
})

// Otomatis set status lapangan jadi INACTIVE jika stadion induk INACTIVE
function onStadionChange() {
  if (selectedStadion.value?.status === 'INACTIVE') {
    form.value.status = 'INACTIVE'
  }
}

// Submit form
async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/fields/create', {
      method: 'POST',
      body: {
        ...form.value,
        stadionId: Number(form.value.stadionId),
        pricePerHour: Number(form.value.pricePerHour),
        description: form.value.description || undefined,
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
    <!-- Header -->
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

    <!-- Form -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <div class="p-5 sm:p-8">
          <!-- Error message -->
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <div class="grid grid-cols-1 gap-8">
            <!-- Stadion Induk -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Stadion Induk <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.stadionId"
                required
                @change="onStadionChange"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              >
                <option value="" disabled>Pilih stadion</option>
                <option v-for="stadion in stadions" :key="stadion.id" :value="stadion.id">
                  {{ stadion.name }} (Status: {{ stadion.status }})
                </option>
              </select>
            </label>

            <!-- Nama Lapangan -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lapangan <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Lapangan Futsal A"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <!-- Deskripsi -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</span>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Lapangan dengan permukaan lantai yang aman..."
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors resize-none"
              />
            </label>

            <!-- Harga per Jam -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Harga per Jam <span class="text-red-500">*</span>
              </span>
              <input
                v-model.number="form.pricePerHour"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                min="0"
                placeholder="100000"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <!-- Status -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.status"
                required
                :disabled="selectedStadion?.status === 'INACTIVE'"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Non-Aktif</option>
              </select>
              <p v-if="selectedStadion?.status === 'INACTIVE'" class="mt-1.5 text-xs text-yellow-700">
                Stadion induk non-aktif, lapangan harus non-aktif.
              </p>
            </label>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center justify-start gap-3 bg-gray-50/80 px-6 py-5 sm:px-8">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Lapangan' }}
          </button>

          <NuxtLink
            to="/admin/fields"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>