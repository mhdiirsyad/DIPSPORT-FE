<script setup lang="ts">
import { computed } from 'vue'

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

const { data: stadionsData, pending, error, refresh } = await useAsyncData<StadiumCard[]>(
  'home-stadions',
  () => $fetch<StadiumCard[]>('/api/stadions')
)

const topStadions = computed(() => {
  if (!stadionsData.value) return []
  return stadionsData.value.slice(0, 3)
})

const getCoverImage = (stadion: StadiumCard) => stadion.images?.[0]?.imageUrl || fallbackImage

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
            class="w-full border-none text-gray-700 placeholder:text-gray-400 focus:outline-none"
          >
        </div>
        <div class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10m-1 9h-8a2 2 0 01-2-2V7h12v11a2 2 0 01-2 2z" />
          </svg>
          <select class="w-full border-none bg-transparent text-gray-700 focus:outline-none">
            <option>Semua status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>
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

      <section class="rounded-3xl bg-[#1f2a56] px-10 py-12 text-white shadow-lg">
        <div class="max-w-2xl space-y-4">
          <h2 class="text-3xl font-semibold leading-tight">Temukan Stadion dan Lapangan favoritmu</h2>
          <p class="text-sm text-blue-100">
            Pantau ketersediaan lapangan dan kelola jadwal booking dari satu tempat.
          </p>
          <button class="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1f2a56] shadow-sm hover:bg-blue-50">
            Lihat Semua Stadion
          </button>
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

      <section v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="stadion in topStadions"
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
