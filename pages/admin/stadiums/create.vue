<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

interface FacilitySelect {
  id: number
  name: string
  icon: string
}

const router = useRouter()

const form = ref({
  name: '',
  description: '',
  mapUrl: 'https://maps.google.com/',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  facilityIds: [] as number[],
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)

const {
  data: facilities,
  error: facilityError,
  pending: facilitiesPending,
  refresh: refreshFacilities,
} = await useAsyncData('facilitiesListForStadion', () =>
  $fetch<FacilitySelect[]>('/api/facilities')
)

async function retryLoadFacilities() {
  errorMsg.value = null
  await refreshFacilities()
}

if (facilityError.value) {
  errorMsg.value = 'Gagal memuat daftar fasilitas. Silakan coba lagi.'
}

const isValidUrl = (url: string): boolean => /^https?:\/\//.test(url)

async function handleSubmit() {
  errorMsg.value = null

  if (!isValidUrl(form.value.mapUrl)) {
    errorMsg.value = 'URL Peta harus diawali dengan http:// atau https://'
    return
  }

  // Validasi batas maksimal fasilitas
  if (form.value.facilityIds.length > 10) {
    errorMsg.value = 'Anda hanya dapat memilih maksimal 10 fasilitas.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/stadions/create', {
      method: 'POST',
      body: {
        ...form.value,
        description: form.value.description || undefined,
        facilityIds:
          form.value.facilityIds.length > 0 ? form.value.facilityIds : null,
      },
    })

    await router.push('/admin/stadiums')
  } catch (err: any) {
    errorMsg.value =
      err.data?.statusMessage || err.message || 'Gagal menyimpan stadion.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <!-- HEADER -->
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
        class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </header>

    <!-- FORM -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <div class="p-5 sm:p-8">
          <!-- ERROR MESSAGE -->
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <div class="grid grid-cols-1 gap-8">
            <!-- NAMA STADION -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Stadion <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Stadion Diponegoro"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <!-- DESKRIPSI -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi
              </span>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Stadion dengan fasilitas lengkap..."
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors resize-none"
              />
            </label>

            <!-- URL GOOGLE MAPS -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                URL Google Maps <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.mapUrl"
                type="url"
                required
                placeholder="https://maps.app.goo.gl/..."
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
              <p class="mt-1.5 text-xs text-gray-500">
                Salin URL dari tombol <strong>Share</strong> di Google Maps.
              </p>
            </label>

            <!-- STATUS -->
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.status"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Non-Aktif</option>
              </select>
            </label>

            <!-- FASILITAS -->
            <fieldset>
              <legend class="block text-sm font-medium text-gray-700 mb-4">
                Fasilitas
                <span
                  class="font-normal text-gray-500"
                  :class="form.facilityIds.length >= 10 ? 'text-yellow-700 font-semibold' : ''"
                >
                  ({{ form.facilityIds.length }} / 10)
                </span>
              </legend>
              <p class="text-sm text-gray-500 mb-6">
                Pilih semua fasilitas yang tersedia di stadion ini (maksimal 10).
              </p>

              <p
                v-if="form.facilityIds.length >= 10"
                class="text-sm font-semibold text-yellow-800 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2.5 mb-6"
              >
                💡 Batas maksimum 10 fasilitas telah tercapai.
              </p>

              <p v-if="facilitiesPending" class="text-sm text-gray-500">
                Memuat daftar fasilitas...
              </p>

              <p v-else-if="facilityError" class="text-sm text-red-600">
                Gagal memuat fasilitas.
                <button
                  type="button"
                  @click="retryLoadFacilities"
                  :disabled="facilitiesPending"
                  class="underline hover:no-underline disabled:opacity-50 focus:outline-none"
                >
                  {{ facilitiesPending ? 'Memuat ulang...' : 'Coba lagi' }}
                </button>
              </p>

              <div v-else-if="facilities && facilities.length > 0" class="max-w-6xl mx-auto">
                <div
                  class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 sm:gap-5"
                >
                  <label
                    v-for="facility in facilities"
                    :key="facility.id"
                    :title="facility.name"
                    class="group relative flex flex-col items-center justify-center h-32 rounded-xl border-2 transition-all duration-300"
                    :class="[
                      form.facilityIds.includes(facility.id)
                        ? 'bg-blue-50 border-blue-600 ring-4 ring-blue-600/30 shadow-blue-200 shadow-2xl'
                        : 'bg-white border-gray-300',
                      (form.facilityIds.length >= 10 && !form.facilityIds.includes(facility.id))
                        ? 'opacity-50 cursor-not-allowed hover:scale-[1] hover:shadow-none'
                        : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-gray-400 hover:bg-gray-50'
                    ]"
                  >
                    <input
                      type="checkbox"
                      v-model="form.facilityIds"
                      :value="facility.id"
                      :disabled="form.facilityIds.length >= 10 && !form.facilityIds.includes(facility.id)"
                      class="sr-only"
                    />

                    <Icon
                      :icon="facility.icon"
                      class="h-14 w-14 mb-2 text-gray-700 transition-transform group-hover:scale-110"
                      :class="form.facilityIds.includes(facility.id) ? 'text-blue-600' : ''"
                    />

                    <span
                      class="text-xs font-medium text-gray-700 capitalize text-center px-2 leading-tight"
                      :class="form.facilityIds.includes(facility.id) ? 'text-blue-700' : ''"
                    >
                      {{ facility.name }}
                    </span>

                    <div
                      v-if="form.facilityIds.includes(facility.id)"
                      class="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-md ring-2 ring-white"
                    >
                      <svg
                        class="h-4.5 w-4.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </label>
                </div>
              </div>

              <p
                v-if="facilities && facilities.length === 0"
                class="text-sm text-gray-500 mt-6 text-center"
              >
                Belum ada data fasilitas. Silakan buat master fasilitas terlebih dahulu.
              </p>

              <p class="mt-6 text-xs text-gray-500 text-center">
                💡 Ikon diambil dari data fasilitas yang sudah Anda buat.
              </p>
            </fieldset>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
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
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                class="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
                class="opacity-75"
              />
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Stadion' }}
          </button>

          <NuxtLink
            to="/admin/stadiums"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>
