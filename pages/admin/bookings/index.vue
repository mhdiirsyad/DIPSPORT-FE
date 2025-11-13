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
  <main class="min-h-screen bg-[#f5f7fb]">
    <div class="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="text-xl font-semibold tracking-wide text-[#1f2a56]">DIPSPORTS</div>
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-500">
          <!-- <NuxtLink
            to="/admin/login"
            class="rounded-full bg-[#1f2a56] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#1b244c]"
          >
            Masuk Admin
          </NuxtLink> -->
        </nav>
      </header>

      <section class="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div class="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-3.15A6 6 0 109 15a6 6 0 009-1.5z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari venue"
            class="w-full border-none text-gray-700 placeholder:text-gray-400 focus:outline-none"
          >
        </div>
        <div class="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-1 9h-8a2 2 0 01-2-2V7h12v11a2 2 0 01-2 2z" />
          </svg>
          <select class="w-full border-none bg-transparent text-gray-700 focus:outline-none">
            <option>Pilih cabang olahraga</option>
            <option>Padel</option>
            <option>Basket</option>
            <option>Tenis</option>
          </select>
        </div>
        <button class="flex items-center gap-2 rounded-xl bg-[#1f2a56] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1b244c]">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
          </svg>
          Cari venue
        </button>
      </section>

      <!-- <section class="rounded-3xl bg-[#1f2a56] px-10 py-12 text-white shadow-lg">
        <div class="max-w-2xl space-y-4">
          <h2 class="text-3xl font-semibold leading-tight">Temukan Lapangan sesuai dengan jadwal anda</h2>
          <p class="text-sm text-blue-100">
            Universitas Diponegoro menyediakan sarana dan prasarana olahraga yang dapat mendukung kegiatan akademik,
            non-akademik, serta rekreasi bagi seluruh civitas akademika.
          </p>
          <button class="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1f2a56] shadow-sm hover:bg-blue-50">
            Booking Sekarang
          </button>
        </div>
      </section> -->

      <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="venue in paginatedStadions"
          :key="venue.id"
          class="cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
          @click="navigateTo(`/admin/bookings/${venue.id}`)"
        >
          <img :src="venue.images?.[0]?.imageUrl" :alt="venue.name" class="h-44 w-full object-cover" >
          <div class="space-y-3 p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-gray-400">Venue</div>
            <h3 class="text-lg font-semibold text-gray-900">{{ venue.name }}</h3>
            <!-- <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-semibold text-yellow-500">★ {{ venue.rating.toFixed(2) }}</span>
              <span>•</span>
              <span>{{ venue.city }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="rounded-full bg-gray-100 px-3 py-1">{{ venue.sport }}</span>
              <span class="rounded-full bg-green-50 px-3 py-1 text-green-700">
                Rp {{ venue.price.toLocaleString('id-ID') }}
              </span>
            </div> -->
          </div>
        </article>
      </section>
          <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-6">
      <button
      :disabled="currentPage === 1"
      class="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      @click="currentPage = Math.max(currentPage - 1, 1)"
      >
        Prev
      </button>
      <span class="text-sm text-gray-600">
        Halaman <span class="font-semibold">{{ currentPage }}</span> / {{ totalPages }}
      </span>
      <button
      :disabled="currentPage === totalPages"
      class="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      @click="currentPage = Math.min(currentPage + 1, totalPages)"
      >
        Next
      </button>
    </div>
    </div>

  </main>
</template>