<script setup lang="ts">
type VenueCard = {
  id: number
  name: string
  city: string
  rating: number
  sport: string
  price: number
  image: string
}

const venues: VenueCard[] = [
  {
    id: 1,
    name: 'Dua Bola Padel',
    city: 'Kota Pekanbaru, Riau',
    rating: 4.9,
    sport: 'Padel',
    price: 250000,
    image:
      'https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    name: 'Papadelulu Padel Club',
    city: 'Kota Bandung',
    rating: 4.87,
    sport: 'Padel',
    price: 220000,
    image:
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    name: 'Joglo Padel Club',
    city: 'Kota Yogyakarta',
    rating: 4.9,
    sport: 'Padel',
    price: 240000,
    image:
      'https://images.unsplash.com/photo-1446463969211-28bf6e20f1c4?auto=format&fit=crop&w=1200&q=80',
  },
]

const goToDetail = (venueId: number) => {
  navigateTo(`/venues/${venueId}`)
}
</script>

<template>
  <main class="min-h-screen bg-[#f5f7fb]">
    <div class="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div class="text-xl font-semibold tracking-wide text-[#1f2a56]">DIPSPORTS</div>
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-500">
          <NuxtLink
            to="/admin/login"
            class="rounded-full bg-[#1f2a56] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#1b244c]"
          >
            Masuk Admin
          </NuxtLink>
        </nav>
      </header>

      <section class="flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div class="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-500">
          <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-3.15A6 6 0 109 15a6 6 0 009-1.5z" />
          </svg>
          <input
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

      <section class="rounded-3xl bg-[#1f2a56] px-10 py-12 text-white shadow-lg">
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
      </section>

      <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="venue in venues"
          :key="venue.id"
          class="cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
          @click="goToDetail(venue.id)"
        >
          <img :src="venue.image" :alt="venue.name" class="h-44 w-full object-cover" >
          <div class="space-y-3 p-5">
            <div class="text-xs font-semibold uppercase tracking-wide text-gray-400">Venue</div>
            <h3 class="text-lg font-semibold text-gray-900">{{ venue.name }}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-semibold text-yellow-500">★ {{ venue.rating.toFixed(2) }}</span>
              <span>•</span>
              <span>{{ venue.city }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="rounded-full bg-gray-100 px-3 py-1">{{ venue.sport }}</span>
              <span class="rounded-full bg-green-50 px-3 py-1 text-green-700">
                Rp {{ venue.price.toLocaleString('id-ID') }}
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>

  </main>
</template>

<style scoped>
</style>
