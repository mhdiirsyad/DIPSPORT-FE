<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'

type StadiumCard = {
  id: number
  name: string
  status?: string
  description?: string
  images?: Array<{ id: number; imageUrl: string | null }>
  fields?: Array<{ id: number }>
}

const fallbackImage =
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80'

const searchQuery = ref('')

const { data: stadionsData, pending, error, refresh } = await useAsyncData<StadiumCard[]>(
  'home-stadions',
  () => $fetch<StadiumCard[]>('/api/stadions')
)

const filteredStadions = computed(() => {
  const list = stadionsData.value || []
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return list
  return list.filter((stadion) => stadion.name?.toLowerCase().includes(query))
})

const displayedStadions = computed(() => {
  if (searchQuery.value.trim()) return filteredStadions.value
  return filteredStadions.value.slice(0, 3)
})

const getCoverImage = (stadion: StadiumCard) => stadion.images?.[0]?.imageUrl || fallbackImage

const totalStadions = computed(() => stadionsData.value?.length ?? 0)
const totalFields = computed(() =>
  stadionsData.value?.reduce((sum, s) => sum + (s.fields?.length ?? 0), 0) ?? 0
)

const activeFieldCount = (stadion?: StadiumCard) => stadion?.fields?.length ?? 0

const totalFreeFields = computed(() =>
  stadionsData.value?.reduce((sum, s) => sum + activeFieldCount(s), 0) ?? 0
)
const stadionWithMostFields = computed(() => {
  const list = stadionsData.value || []
  if (!list.length) return null
  return list.reduce((max, current) => {
    const maxLen = activeFieldCount(max)
    const currLen = activeFieldCount(current)
    return currLen > maxLen ? current : max
  })
})
const topFreeStadions = computed(() => {
  const list = stadionsData.value || []
  const mapped = [...list]
    .map((s) => ({
      ...s,
      freeFields: activeFieldCount(s),
      cover: getCoverImage(s),
    }))
    .filter((s) => s.freeFields > 0)
    .sort((a, b) => b.freeFields - a.freeFields)

  if (mapped.length === 0) {
    return [...list]
      .map((s) => ({ ...s, freeFields: activeFieldCount(s), cover: getCoverImage(s) }))
      .sort((a, b) => b.freeFields - a.freeFields)
      .slice(0, 3)
  }
  return mapped.slice(0, 3)
})

const goToDetail = (stadionId: number) => {
  navigateTo(`/venues/${stadionId}`)
}
</script>

<template>
  <main class="min-h-screen bg-[#f5f7fb]">
    <div class="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="text-xl font-semibold tracking-wide text-[#1f2a56]">VENUE UNDIP</div>
        <NuxtLink
          to="/admin/login"
          class="rounded-full bg-[#1f2a56] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#1b244c]"
        >
          Masuk Admin
        </NuxtLink>
      </header>

      <section class="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
        <div
          class="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500"
        >
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-3.15A6 6 0 109 15a6 6 0 009-1.5z" />
          </svg>
          <input
            type="text"
            placeholder="Cari stadion"
            v-model="searchQuery"
            class="w-full border-none text-gray-700 placeholder:text-gray-400 focus:outline-none"
          >
        </div>
        <button
          class="ml-auto flex items-center gap-2 rounded-full bg-[#1f2a56] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1b244c]"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v2H4zm0 6h16v2H4zm0 6h16v2H4z" />
          </svg>
          Cari stadion
        </button>
      </section>

      <section class="rounded-3xl bg-gradient-to-br from-[#0f1f4a] via-[#0c1840] to-[#0f1f4a] px-6 py-9 text-white shadow-xl sm:px-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-3 max-w-xl">
            <p class="text-xs uppercase tracking-[0.25em] text-blue-200/80">Ringkasan Lapangan</p>
            <h2 class="text-3xl font-semibold leading-tight">Lapangan kosong siap dipakai</h2>
            <p class="text-sm text-blue-100">Urutkan stadion dengan lapangan aktif terbanyak dan lompat langsung ke venue tujuan.</p>
            <div v-if="stadionWithMostFields" class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100">
              <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
              Stadion unggulan: {{ stadionWithMostFields.name }}
            </div>
          </div>
          <div class="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/12 bg-white/8 p-4 shadow-sm backdrop-blur transition hover:border-white/25 hover:bg-white/12">
              <p class="text-[11px] uppercase tracking-wide text-blue-100/90">Total Stadion</p>
              <p class="text-3xl font-bold">{{ totalStadions }}</p>
              <p class="text-xs text-blue-100/80 mt-1">Lokasi terdaftar</p>
            </div>
            <div class="rounded-2xl border border-white/12 bg-white/8 p-4 shadow-sm backdrop-blur transition hover:border-white/25 hover:bg-white/12">
              <p class="text-[11px] uppercase tracking-wide text-blue-100/90">Total Lapangan Aktif</p>
              <p class="text-3xl font-bold">{{ totalFreeFields }}</p>
              <p class="text-xs text-blue-100/80 mt-1">Siap dijadwalkan</p>
            </div>
            <NuxtLink
              v-if="stadionWithMostFields"
              :to="`/venues/${stadionWithMostFields.id}`"
              class="rounded-2xl border border-white/15 bg-white/12 p-4 shadow-sm transition hover:border-white/30 hover:bg-white/18 backdrop-blur"
            >
              <p class="text-[11px] uppercase tracking-wide text-blue-100/90">Lapangan Terbanyak</p>
              <p class="text-base font-semibold leading-tight">{{ stadionWithMostFields.name }}</p>
              <p class="text-sm text-blue-100/90">{{ activeFieldCount(stadionWithMostFields) }} lapangan aktif</p>
              <p class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white underline-offset-4 hover:underline">
                Lihat detail
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              </p>
            </NuxtLink>
            <div v-else class="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-sm backdrop-blur">
              <p class="text-[11px] uppercase tracking-wide text-blue-100/90">Lapangan Terbanyak</p>
              <p class="text-sm text-blue-100">Data belum tersedia</p>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-3 lg:grid-cols-3">
          <article
            v-for="stadion in topFreeStadions"
            :key="stadion.id"
            class="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/8 p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/14"
          >
            <div class="h-14 w-14 overflow-hidden rounded-xl border border-white/20 shadow-sm">
              <img :src="stadion.cover" :alt="stadion.name" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold leading-tight truncate">{{ stadion.name }}</p>
              <p class="text-xs text-blue-100/80">{{ stadion.freeFields }} lapangan aktif</p>
            </div>
            <NuxtLink
              :to="`/venues/${stadion.id}`"
              class="inline-flex items-center gap-1 rounded-lg bg-white/90 px-3 py-2 text-xs font-bold text-[#0f1f4a] shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Lihat
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </NuxtLink>
            <NuxtLink
              :to="`/venues/${stadion.id}`"
              class="absolute inset-0 rounded-2xl focus:outline-none"
              aria-label="Buka detail stadion"
            />
          </article>
        </div>
      </section>

      <section v-if="pending" class="grid w-full place-items-center rounded-3xl bg-white py-12 shadow">
        <p class="text-gray-500">Memuat data stadion...</p>
      </section>
      <section
        v-else-if="error"
        class="grid w-full place-items-center rounded-3xl bg-white py-12 shadow text-red-600"
      >
        <div class="space-y-3 text-center">
          <p>Gagal memuat stadion: {{ error.message }}</p>
          <button class="rounded-full bg-[#1f2a56] px-5 py-2 text-white shadow" @click="refresh()">Coba lagi</button>
        </div>
      </section>

      <section v-else-if="searchQuery && filteredStadions.length === 0" class="grid w-full place-items-center rounded-3xl bg-white py-12 shadow text-gray-500">
        <div class="space-y-2 text-center">
          <p>Tidak ada stadion yang cocok dengan pencarian.</p>
          <p class="text-sm text-gray-400">Coba gunakan kata kunci lain.</p>
        </div>
      </section>

      <section v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="stadion in displayedStadions"
          :key="stadion.id"
          class="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          @click="goToDetail(stadion.id)"
        >
          <div class="overflow-hidden">
            <img
              :src="getCoverImage(stadion)"
              :alt="stadion.name"
              class="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
            <div class="flex flex-1 flex-col space-y-3 p-5">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Stadion</p>
              <h3 class="text-lg font-semibold text-gray-900">{{ stadion.name }}</h3>
              <div class="mt-auto text-sm text-gray-500">
                Total Lapangan:&nbsp;
                <span class="font-semibold text-gray-900">{{ stadion.fields?.length ?? 0 }}</span>
              </div>
            </div>
        </article>
      </section>
    </div>
  </main>
</template>

<style scoped>
</style>
