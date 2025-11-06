<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

// Tipe data
interface StadionRow {
  id: number
  name: string
  _count?: { fields: number }
}

// -------------------------------------------------------------------
// Data Fetching
// -------------------------------------------------------------------
const { data: rawStadions, pending, error, refresh } = await useAsyncData(
  'stadionsList',
  () => $fetch<StadionRow[]>('/api/stadions')
)

const loadingDelete = ref(false)
const errorMsg = ref<string | null>(null)

// -------------------------------------------------------------------
// Search & Filter
// -------------------------------------------------------------------
const searchQuery = ref('')

const filteredStadions = computed(() => {
  if (!rawStadions.value) return []
  if (!searchQuery.value.trim()) return rawStadions.value
  const query = searchQuery.value.toLowerCase().trim()
  return rawStadions.value.filter((stadion) =>
    stadion.name.toLowerCase().includes(query) ||
    String(stadion.id).includes(query)
  )
})

// -------------------------------------------------------------------
// Pagination
// -------------------------------------------------------------------
const currentPage = ref(1)
const itemsPerPage = 10

// Reset ke halaman 1 saat search berubah
watch(searchQuery, () => {
  currentPage.value = 1
})

// Total item setelah filter
const totalItems = computed(() => filteredStadions.value.length)

// Total halaman
const totalPages = computed(() => {
  return Math.max(Math.ceil(totalItems.value / itemsPerPage), 1)
})

// Data untuk halaman saat ini
const paginatedStadions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredStadions.value.slice(start, end)
})

// Teks ringkasan pagination
const paginationSummary = computed(() => {
  if (totalItems.value === 0) return 'Tidak ada data'
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
  return `Menampilkan ${start}–${end} dari ${totalItems.value} hasil`
})

// Navigasi halaman
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// -------------------------------------------------------------------
// Event Handlers
// -------------------------------------------------------------------
async function handleDelete(id: number) {
  if (!confirm('Anda yakin ingin menghapus stadion ini? Ini akan menghapus semua data terkait.')) {
    return
  }
  loadingDelete.value = true
  errorMsg.value = null
  try {
    await $fetch('/api/stadions/delete', {
      method: 'POST',
      body: { stadionId: id }
    })
    await refresh()
    // Jika halaman jadi kosong setelah hapus, mundur 1 halaman
    if (paginatedStadions.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message || 'Gagal menghapus stadion.'
  } finally {
    loadingDelete.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Manajemen Stadion
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Tambah, edit, atau hapus data stadion yang terdaftar di VENUE UNDIP.
        </p>
      </div>
      <NuxtLink
        to="/admin/stadiums/create"
        class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px sm:px-6"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5V19M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Tambah Stadion</span>
      </NuxtLink>
    </header>

    <!-- Table Card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <!-- Search Bar -->
      <div class="border-b border-gray-200 p-5 sm:p-6">
        <label class="relative flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
          <svg class="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            class="w-full border-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-0"
            placeholder="Cari berdasarkan nama stadion atau ID..."
          />
        </label>
      </div>

      <!-- Table Content -->
      <div class="flex flex-col">
        <!-- Error -->
        <div
          v-if="error || errorMsg"
          class="m-5 sm:m-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
        >
          {{ error?.message || errorMsg }}
          <button v-if="error" @click="refresh()" class="ml-2 font-bold underline">Coba lagi</button>
        </div>

        <!-- Loading -->
        <div
          v-else-if="pending"
          class="m-5 sm:m-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm font-medium text-gray-600"
        >
          Memuat data stadion...
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredStadions.length === 0" class="px-5 sm:px-6 py-10 text-center text-sm text-gray-500">
          <span v-if="searchQuery">Stadion tidak ditemukan.</span>
          <span v-else>Belum ada data stadion.</span>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  ID
                </th>
                <th class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Nama Stadion
                </th>
                <th class="border-b border-gray-200 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr
                v-for="stadion in paginatedStadions"
                :key="stadion.id"
                class="transition-colors hover:bg-blue-50/50 cursor-pointer"
              >
                <!-- Area yang bisa diklik (kecuali kolom Aksi) -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm text-gray-600"
                  @click="navigateTo(`/admin/stadiums/${stadion.id}`)"
                >
                  {{ stadion.id }}
                </td>
                <td
                  class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900"
                  @click="navigateTo(`/admin/stadiums/${stadion.id}`)"
                >
                  {{ stadion.name }}
                </td>

                <!-- Kolom Aksi: tidak ikut navigasi -->
                <td
                  class="whitespace-nowrap px-5 py-4 text-right text-sm font-medium space-x-4"
                  @click.stop
                >
                  <NuxtLink
                    :to="`/admin/stadiums/${stadion.id}`"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Edit
                  </NuxtLink>
                  <button
                    @click.stop="handleDelete(stadion.id)"
                    :disabled="loadingDelete"
                    class="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {{ loadingDelete ? 'Menghapus...' : 'Delete' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav
          v-if="!pending && totalPages > 1"
          class="flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-200 p-5 sm:flex-row sm:p-6"
          aria-label="Pagination"
        >
          <p class="text-sm text-gray-600">
            {{ paginationSummary }}
          </p>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Prev</span>
            </button>
            <span class="text-sm text-gray-600">
              Halaman
              <span class="font-semibold text-gray-900">{{ currentPage }}</span>
              /
              <span class="font-semibold text-gray-900">{{ totalPages }}</span>
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </div>
  </section>
</template>