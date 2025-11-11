<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface Images {
  imageUrl: string
}

interface StadionRow {
  id: number
  name: string
  images?: Images[]
  _count?: { fields: number }
}

// -------------------------------------------------------------------
// Data Fetching
// -------------------------------------------------------------------
const { data: stadions, pending, error, refresh } = await useAsyncData(
  'stadionsList',
  () => $fetch<StadionRow[]>('/api/stadions')
)
// console.log(stadions.value)
// -------------------------------------------------------------------
// Search (dengan debounce)
// -------------------------------------------------------------------
const searchQuery = ref('')
const debouncedSearch = ref('')

const applyDebounce = useDebounceFn(() => {
  debouncedSearch.value = searchQuery.value.trim().toLowerCase()
}, 400)

watch(searchQuery, applyDebounce)

const filteredStadions = computed(() => {
  if (!stadions.value) return []
  if (!debouncedSearch.value) return stadions.value
  return stadions.value.filter(stadion =>
    stadion.name.toLowerCase().includes(debouncedSearch.value)
  )
})

// -------------------------------------------------------------------
// Pagination (opsional bisa dihapus jika ingin infinite scroll)
// -------------------------------------------------------------------
const currentPage = ref(1)
const itemsPerPage = 8

const totalPages = computed(() => Math.ceil(filteredStadions.value.length / itemsPerPage))
const paginatedStadions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredStadions.value.slice(start, start + itemsPerPage)
})
</script>

<template>
  <section class="flex flex-col gap-8">
    <!-- Header -->
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Manajemen Stadion
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Tambah, edit, atau lihat daftar stadion yang terdaftar di DIPSPORT.
        </p>
      </div>

      <NuxtLink
        to="/admin/stadiums/create"
        class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Tambah Stadion
      </NuxtLink>
    </header>

    <!-- Search -->
    <div class="max-w-md">
      <label class="relative block">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari stadion..."
          class="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </label>
    </div>

    <!-- Content -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
      {{ error.message }}
      <button @click="refresh()" class="ml-2 underline font-semibold">Coba lagi</button>
    </div>

    <div v-else-if="pending" class="py-10 text-center text-gray-500">
      Memuat data stadion...
    </div>

    <div v-else-if="filteredStadions.length === 0" class="py-10 text-center text-gray-500">
      <p v-if="searchQuery">Tidak ditemukan stadion dengan kata kunci tersebut.</p>
      <p v-else>Belum ada data stadion.</p>
    </div>

    <!-- Card Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="stadion in paginatedStadions"
        :key="stadion.id"
        @click="navigateTo(`/admin/stadiums/${stadion.id}`)"
        class="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
      >
        <div class="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            :src="stadion.images?.[0]?.imageUrl || '/placeholder-stadium.jpg'"
            :alt="stadion.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div class="p-4">
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {{ stadion.name }}
          </h3>
          <p v-if="stadion._count?.fields" class="text-sm text-gray-500 mt-1">
            {{ stadion._count.fields }} fasilitas
          </p>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-6">
      <button
        @click="currentPage = Math.max(currentPage - 1, 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Prev
      </button>
      <span class="text-sm text-gray-600">
        Halaman <span class="font-semibold">{{ currentPage }}</span> / {{ totalPages }}
      </span>
      <button
        @click="currentPage = Math.min(currentPage + 1, totalPages)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </section>
</template>