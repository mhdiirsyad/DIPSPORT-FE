<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

interface FacilityRow {
  id: number
  name: string
  icon: string | null
}

const { data: facilities, pending, error, refresh } = await useAsyncData(
  'facilitiesList',
  () => $fetch<FacilityRow[]>('/api/facilities')
)

const loadingDelete = ref(false)
const errorMsg = ref<string | null>(null)

const searchQuery = ref('')
const filteredFacilities = computed(() => {
  if (!facilities.value) return []
  if (!searchQuery.value.trim()) return facilities.value

  const query = searchQuery.value.toLowerCase().trim()
  return facilities.value.filter(
    f => f.name.toLowerCase().includes(query) || String(f.id).includes(query)
  )
})

const currentPage = ref(1)
const itemsPerPage = 10
watch(searchQuery, () => { currentPage.value = 1 })

const totalItems = computed(() => filteredFacilities.value.length)
const totalPages = computed(() => Math.max(Math.ceil(totalItems.value / itemsPerPage), 1))

const paginatedFacilities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredFacilities.value.slice(start, end)
})

const paginationSummary = computed(() => {
  if (totalItems.value === 0) return 'Tidak ada data'
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
  return `Menampilkan ${start}–${end} dari ${totalItems.value} hasil`
})

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }

async function handleDelete(id: number) {
  if (!confirm('Anda yakin ingin menghapus fasilitas ini? Ini akan menghapusnya dari semua stadion.')) return

  loadingDelete.value = true
  errorMsg.value = null
  try {
    await $fetch('/api/facilities/delete', {
      method: 'POST',
      body: { facilityId: id },
    })
    await refresh()
    if (paginatedFacilities.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message || 'Gagal menghapus fasilitas'
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-5 sm:gap-7 px-4 sm:px-0">
    <header class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-4">
      <div class="w-full sm:w-auto">
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
          Manajemen Fasilitas
        </h1>
        <p class="mt-1.5 sm:mt-2 text-xs text-gray-600 sm:text-sm lg:text-base">
          Kelola master data fasilitas (mis: Toilet, Kantin, WiFi).
        </p>
      </div>

      <NuxtLink
        to="/admin/facilities/create"
        class="w-full sm:w-auto inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-lg bg-blue-600 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px"
      >
        <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Tambah Fasilitas</span>
      </NuxtLink>
    </header>

    <div class="overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="border-b border-gray-200 p-4 sm:p-5 lg:p-6">
        <label class="relative flex items-center gap-2 sm:gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:px-3.5 sm:py-2.5">
          <svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.65 16.65M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cari fasilitas atau ID..."
            class="w-full border-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-0"
          />
        </label>
      </div>

      <div class="flex flex-col">
        <div
          v-if="error || errorMsg"
          class="m-4 sm:m-5 lg:m-6 rounded-lg border border-red-300 bg-red-50 px-3.5 py-3 sm:px-4 sm:py-3.5 text-xs sm:text-sm font-semibold text-red-700"
        >
          {{ error?.message || errorMsg }}
          <button v-if="error" @click="refresh()" class="ml-2 font-bold underline">Coba lagi</button>
        </div>

        <div
          v-else-if="pending"
          class="m-4 sm:m-5 lg:m-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-5 sm:py-6 text-center text-xs sm:text-sm font-medium text-gray-600"
        >
          Memuat data fasilitas...
        </div>

        <div
          v-else-if="filteredFacilities.length === 0"
          class="px-4 py-8 sm:px-5 sm:py-10 text-center text-xs sm:text-sm text-gray-500"
        >
          <span v-if="searchQuery">Fasilitas tidak ditemukan.</span>
          <span v-else>Belum ada data fasilitas.</span>
        </div>

        <template v-else>
          <div class="hidden md:block overflow-x-auto">
            <table class="min-w-full border-collapse">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Nama Fasilitas
                  </th>
                  <th class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Ikon
                  </th>
                  <th class="border-b border-gray-200 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr
                  v-for="facility in paginatedFacilities"
                  :key="facility.id"
                  class="transition-colors hover:bg-blue-50/50 cursor-pointer"
                  @click="navigateTo(`/admin/facilities/${facility.id}`)"
                >
                  <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">{{ facility.name }}</td>
                  <td class="whitespace-nowrap px-5 py-4">
                    <Icon
                      v-if="facility.icon"
                      :icon="facility.icon"
                      class="h-5 w-5 text-gray-700"
                    />
                    <span v-else class="text-gray-400 text-xs">—</span>
                  </td>
                  <td class="whitespace-nowrap px-5 py-4 text-right text-sm font-medium space-x-4" @click.stop>
                    <NuxtLink :to="`/admin/facilities/${facility.id}`" class="text-blue-600 hover:text-blue-800">
                      Edit
                    </NuxtLink>
                    <button
                      @click.stop="handleDelete(facility.id)"
                      :disabled="loadingDelete"
                      class="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ loadingDelete ? '...' : 'Delete' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="md:hidden divide-y divide-gray-100">
            <div
              v-for="facility in paginatedFacilities"
              :key="facility.id"
              class="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer"
              @click="navigateTo(`/admin/facilities/${facility.id}`)"
            >
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-gray-900 truncate">{{ facility.name }}</h3>
                </div>
                <Icon
                  v-if="facility.icon"
                  :icon="facility.icon"
                  class="h-6 w-6 text-gray-700 flex-shrink-0"
                />
                <span v-else class="text-gray-400 text-xs">—</span>
              </div>

              <div class="flex items-center gap-3 pt-2 border-t border-gray-100" @click.stop>
                <NuxtLink
                  :to="`/admin/facilities/${facility.id}`"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </NuxtLink>
                <button
                  @click.stop="handleDelete(facility.id)"
                  :disabled="loadingDelete"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-600 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ loadingDelete ? '...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        </template>

        <nav
          v-if="!pending && totalPages > 1"
          class="flex flex-col-reverse items-center justify-between gap-3 sm:gap-4 border-t border-gray-200 p-4 sm:flex-row sm:p-5 lg:p-6"
          aria-label="Pagination"
        >
          <p class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            {{ paginationSummary }}
          </p>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-center">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="hidden sm:inline">Prev</span>
            </button>

            <span class="text-xs sm:text-sm text-gray-600 px-2">
              <span class="font-semibold text-gray-900">{{ currentPage }}</span> /
              <span class="font-semibold text-gray-900">{{ totalPages }}</span>
            </span>

            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="hidden sm:inline">Next</span>
              <svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </div>
  </section>
</template>