<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: false })

type Slot = {
  range: string
  status: 'Booked' | 'Available'
  price?: number
  previousPrice?: number
  highlight?: boolean
}

type Court = {
  id: number
  name: string
  surface: string
  type: string
  status: 'Ready' | 'Maintenance'
  image: string
  slots: Slot[]
}

type VenueDetail = {
  id: number
  name: string
  city: string
  rating: number
  sport: string
  gallery: string[]
  description: string
  location: string
  price: number
  facilities: string[]
  scheduleDays: Array<{ label: string }>
  courts: Court[]
}

const DETAIL_DATA: Record<number, VenueDetail> = {
  1: {
    id: 1,
    name: 'Dua Bola Padel',
    city: 'Kota Pekanbaru, Riau',
    rating: 4.9,
    sport: 'Padel',
    gallery: [
      'https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1600&q=80',
    ],
    description:
      'Lapangan Super Panoramic pertama di Pekanbaru.\nTersedia 3 lapangan dengan warna berbeda.\nBooking lapanganmu, sesuaikan gayamu.\nSee you on court!',
    location: 'Jl. Soekarno Hatta, Jl. Melayu No.2',
    price: 250000,
    facilities: ['Cafe & Resto', 'Jual Minuman', 'Musholla', 'Parkir Mobil', 'Parkir Motor', 'Ruang Ganti'],
    scheduleDays: [
      { label: 'Sel 11 Nov' },
      { label: 'Rab 12 Nov' },
      { label: 'Kam 13 Nov' },
      { label: 'Jum 14 Nov' },
      { label: 'Sab 15 Nov' },
      { label: 'Min 16 Nov' },
      { label: 'Sen 17 Nov' },
    ],
    courts: [
      {
        id: 1,
        name: 'Green Court',
        surface: 'Turf 12mm',
        type: 'Indoor',
        status: 'Ready',
        image: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=1400&q=80',
        slots: [
          { range: '06:00 - 07:00', status: 'Available', price: 300000, previousPrice: 350000, highlight: true },
          { range: '07:00 - 08:00', status: 'Booked' },
          { range: '08:00 - 09:00', status: 'Booked' },
          { range: '09:00 - 10:00', status: 'Booked' },
          { range: '10:00 - 11:00', status: 'Booked' },
          { range: '11:00 - 12:00', status: 'Booked' },
          { range: '12:00 - 13:00', status: 'Booked' },
          { range: '13:00 - 14:00', status: 'Booked' },
          { range: '14:00 - 15:00', status: 'Booked' },
          { range: '15:00 - 16:00', status: 'Booked' },
          { range: '16:00 - 17:00', status: 'Booked' },
          { range: '17:00 - 18:00', status: 'Booked' },
          { range: '18:00 - 19:00', status: 'Booked' },
          { range: '19:00 - 20:00', status: 'Booked' },
          { range: '20:00 - 21:00', status: 'Booked' },
          { range: '21:00 - 22:00', status: 'Booked' },
          { range: '22:00 - 23:00', status: 'Available', price: 300000, previousPrice: 350000 },
          { range: '23:00 - 00:00', status: 'Available', price: 300000, previousPrice: 350000 },
        ],
      },
      {
        id: 2,
        name: 'Dark Court',
        surface: 'Turf 10mm',
        type: 'Indoor',
        status: 'Ready',
        image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1400&q=80',
        slots: [
          { range: '06:00 - 07:00', status: 'Available', price: 320000, previousPrice: 360000, highlight: true },
          { range: '07:00 - 08:00', status: 'Available', price: 320000, previousPrice: 360000 },
          { range: '08:00 - 09:00', status: 'Booked' },
          { range: '09:00 - 10:00', status: 'Booked' },
          { range: '10:00 - 11:00', status: 'Booked' },
          { range: '11:00 - 12:00', status: 'Booked' },
          { range: '12:00 - 13:00', status: 'Booked' },
          { range: '13:00 - 14:00', status: 'Booked' },
          { range: '14:00 - 15:00', status: 'Available', price: 320000 },
          { range: '15:00 - 16:00', status: 'Booked' },
          { range: '16:00 - 17:00', status: 'Booked' },
          { range: '17:00 - 18:00', status: 'Booked' },
          { range: '18:00 - 19:00', status: 'Booked' },
          { range: '19:00 - 20:00', status: 'Booked' },
          { range: '20:00 - 21:00', status: 'Booked' },
          { range: '21:00 - 22:00', status: 'Booked' },
          { range: '22:00 - 23:00', status: 'Available', price: 320000 },
          { range: '23:00 - 00:00', status: 'Available', price: 320000 },
        ],
      },
      {
        id: 3,
        name: 'Blue Court',
        surface: 'Turf 8mm',
        type: 'Indoor',
        status: 'Maintenance',
        image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1400&q=80',
        slots: [
          { range: '06:00 - 07:00', status: 'Booked' },
          { range: '07:00 - 08:00', status: 'Booked' },
          { range: '08:00 - 09:00', status: 'Booked' },
          { range: '09:00 - 10:00', status: 'Booked' },
          { range: '10:00 - 11:00', status: 'Booked' },
          { range: '11:00 - 12:00', status: 'Booked' },
          { range: '12:00 - 13:00', status: 'Booked' },
          { range: '13:00 - 14:00', status: 'Booked' },
          { range: '14:00 - 15:00', status: 'Booked' },
          { range: '15:00 - 16:00', status: 'Booked' },
          { range: '16:00 - 17:00', status: 'Booked' },
          { range: '17:00 - 18:00', status: 'Booked' },
          { range: '18:00 - 19:00', status: 'Booked' },
          { range: '19:00 - 20:00', status: 'Booked' },
          { range: '20:00 - 21:00', status: 'Booked' },
          { range: '21:00 - 22:00', status: 'Booked' },
          { range: '22:00 - 23:00', status: 'Available', price: 280000, previousPrice: 320000 },
          { range: '23:00 - 00:00', status: 'Available', price: 280000, previousPrice: 320000 },
        ],
      },
    ],
  },
}

const route = useRoute()
const venueId = Number(route.params.id)
const venue = DETAIL_DATA[venueId] ?? DETAIL_DATA[1]

const selectedDayIndex = ref(0)
const expandedCourts = ref<Record<number, boolean>>({})

const toggleCourt = (courtId: number) => {
  expandedCourts.value = {
    ...expandedCourts.value,
    [courtId]: !expandedCourts.value[courtId],
  }
}

const isCourtExpanded = (courtId: number) => expandedCourts.value[courtId] ?? false
const availableCount = (court: Court) => court.slots.filter((slot) => slot.status === 'Available').length
</script>

<template>
  <main class="min-h-screen bg-[#f5f7fb] pb-16">
    <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <NuxtLink to="/" class="text-sm font-semibold text-[#1f2a56] hover:underline">&larr; Kembali</NuxtLink>
      <span />
    </header>

    <section class="mx-auto max-w-6xl space-y-6 px-6">
      <div class="grid gap-5 lg:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]">
        <div class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-md">
          <img
            :src="venue.gallery[0]"
            :alt="venue.name"
            class="aspect-[16/9] w-full object-cover transition-transform duration-500 hover:scale-[1.01]"
          />
        </div>
        <div class="flex flex-col gap-4">
          <div class="grid gap-4">
            <img
              :src="venue.gallery[1]"
              :alt="`${venue.name} preview 1`"
              class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44"
            />
            <div class="relative">
              <img
                :src="venue.gallery[2]"
                :alt="`${venue.name} preview 2`"
                class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44"
              />
              <button
                class="absolute inset-x-4 bottom-4 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black"
              >
                Lihat semua foto
              </button>
            </div>
          </div>
          <div class="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <p class="text-sm text-gray-500">Mulai dari</p>
            <p class="text-3xl font-bold text-gray-900">
              Rp {{ venue.price.toLocaleString('id-ID') }}
              <span class="text-sm font-medium text-gray-500">/ sesi</span>
            </p>
            <button class="mt-4 w-full rounded-xl bg-[#1f2a56] py-3 text-sm font-semibold text-white hover:bg-[#162347]">
              Cek Ketersediaan
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
          <div class="space-y-2">
            <h1 class="text-3xl font-bold text-gray-900">{{ venue.name }}</h1>
            <p class="flex items-center gap-2 text-sm text-gray-500">
              <span class="font-semibold text-yellow-500">★ {{ venue.rating.toFixed(1) }}</span>
              <span>•</span>
              <span>{{ venue.city }}</span>
            </p>
            <span class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {{ venue.sport }}
            </span>
          </div>

          <div class="space-y-3 text-sm text-gray-600">
            <h2 class="text-lg font-semibold text-gray-900">Deskripsi</h2>
            <p class="whitespace-pre-line">
              {{ venue.description }}
            </p>
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-900">Lokasi Venue</p>
              <div class="mt-1 flex items-center justify-between">
                <span>{{ venue.location }}</span>
                <button class="text-sm font-semibold text-[#1f2a56] hover:underline">Buka Peta</button>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h2 class="text-lg font-semibold text-gray-900">Fasilitas</h2>
            <ul class="grid gap-3 text-gray-600 sm:grid-cols-2">
              <li v-for="facility in venue.facilities" :key="facility" class="flex items-center gap-2">
                <span>•</span> {{ facility }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section class="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-[#1f2a56]"></span>
            <h3 class="text-xl font-semibold text-gray-900">Pilih Lapangan</h3>
          </div>
          <div class="flex gap-3 text-sm">
            <button class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 hover:bg-gray-50">
              Filter Waktu
            </button>
            <button class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 hover:bg-gray-50">
              Cabor
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 px-6 py-4">
          <button
            v-for="(day, index) in venue.scheduleDays"
            :key="day.label"
            class="rounded-2xl px-4 py-3 text-sm font-semibold transition-all"
            :class="
              index === selectedDayIndex
                ? 'bg-[#1f2a56] text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            "
            @click="selectedDayIndex = index"
          >
            {{ day.label }}
          </button>
          <button
            class="ml-auto flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            <span class="text-lg">▦</span>
          </button>
        </div>

        <div
          v-for="court in venue.courts"
          :key="court.id"
          class="space-y-4 border-t border-gray-100 px-6 py-5"
        >
          <div class="flex flex-col gap-5 rounded-3xl border border-gray-200 p-5 lg:flex-row">
            <div class="relative w-full overflow-hidden rounded-[28px] border border-white shadow lg:w-[420px]">
              <img :src="court.image" :alt="court.name" class="h-56 w-full object-cover" />
              <span class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                Lihat semua foto
              </span>
            </div>

            <div class="flex-1 space-y-4">
              <div class="flex flex-col gap-2">
                <p class="text-2xl font-semibold text-gray-900">
                  {{ court.name }}
                  <span class="text-sm text-gray-400">›</span>
                </p>
                <p class="text-sm font-semibold" :class="court.status === 'Ready' ? 'text-green-600' : 'text-amber-600'">
                  {{ court.status === 'Ready' ? 'Ready' : 'Maintenance' }}
                </p>
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>Cabang: {{ venue.sport }}</span>
                  <span>Tipe: {{ court.type }}</span>
                  <span>Permukaan: {{ court.surface }}</span>
                </div>
              </div>

              <button
                class="inline-flex items-center gap-2 rounded-full bg-[#1f2a56] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#162347]"
                @click="toggleCourt(court.id)"
              >
                {{ isCourtExpanded(court.id) ? 'Sembunyikan Jadwal' : `${availableCount(court)} Jadwal Tersedia` }}
                <span class="text-xs">{{ isCourtExpanded(court.id) ? '⌃' : '⌄' }}</span>
              </button>
            </div>
          </div>

          <transition name="expand">
            <div
              v-if="isCourtExpanded(court.id)"
              class="grid gap-4 px-2 pb-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"
            >
              <div
                v-for="slot in court.slots"
                :key="slot.range"
                class="rounded-3xl border px-4 py-3 text-center"
                :class="
                  slot.status === 'Available'
                    ? slot.highlight
                      ? 'border-[#1f2a56]/30 bg-[#1f2a56]/10 shadow-sm'
                      : 'border-gray-200 bg-white'
                    : 'border-transparent text-gray-400'
                "
              >
                <p class="text-xs uppercase text-gray-400">60 Menit</p>
                <p class="text-base font-semibold text-gray-900">{{ slot.range }}</p>
                <p v-if="slot.status === 'Booked'" class="text-sm font-medium text-gray-400">Booked</p>
                <div v-else class="text-sm text-gray-600">
                  <p v-if="slot.previousPrice" class="text-xs text-gray-400 line-through">
                    Rp{{ slot.previousPrice!.toLocaleString('id-ID') }}
                  </p>
                  <p class="font-semibold text-gray-900">
                    Rp{{ slot.price!.toLocaleString('id-ID') }}
                  </p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </section>
    </section>
  </main>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>



