<script setup lang="ts">

import { computed, ref, watch, onMounted } from 'vue'



definePageMeta({ layout: false })



type Slot = {
  start: string
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



type SelectedSlot = {

  key: string

  courtId: number

  courtName: string

  range: string

  price: number

  dateLabel: string

  dateKey: string

}

type BookingDetailRecord = {
  fieldId: number
  bookingDate: string
  startHour: number
}

type BookingRecord = {
  bookingCode: string
  details: BookingDetailRecord[]
}



type VenueDetail = {

  id: number

  name: string

  city: string



  sport: string

  gallery: string[]

  description: string

  location: string

  price: number

  facilities: string[]

  scheduleDays: Array<{ label: string; value: string }>

  courts: Court[]

  mapUrl?: string

}



const FALLBACK_IMAGES = [

  'https://images.unsplash.com/photo-1530543787849-128d94430c6b?auto=format&fit=crop&w=1600&q=80',

  'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80',

  'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1600&q=80',

]



const fallbackOperatingHours = { open: 6, close: 22 }



const formatDayLabel = (date: Date) => {

  return new Intl.DateTimeFormat('id-ID', {

    weekday: 'short',

    day: '2-digit',

    month: 'short',

  }).format(date)

}



const buildScheduleDays = () =>

  Array.from({ length: 7 }, (_, idx) => {

    const date = new Date()

    date.setDate(date.getDate() + idx)

    return { label: formatDayLabel(date), value: date.toISOString() }

  })

const toDateKey = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}



const padHour = (value: number) => value.toString().padStart(2, '0')



const ensureGallery = (images?: Array<string | null | undefined>) => {

  const valid = (images ?? []).filter((url): url is string => Boolean(url))

  const gallery = [...valid]

  let idx = 0

  while (gallery.length < 3) {

    const fallbackImage = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0]!

    gallery.push(fallbackImage)

    idx += 1

  }

  return gallery.slice(0, 3)

}



const createFallbackVenue = (): VenueDetail => ({

  id: 0,

  name: 'Stadion Venue Undip',

  city: 'Lokasi belum tersedia',



  sport: 'Multi Sport',

  gallery: ensureGallery(),

  description: 'Deskripsi belum tersedia.',

  location: 'Lokasi belum tersedia',

  price: 0,

  facilities: [],

  scheduleDays: buildScheduleDays(),

  courts: [],

  mapUrl: undefined,

})



const buildSlotsForField = (field: any, hours: { open: number; close: number }): Slot[] => {

  const booked = new Set(

    (field?.bookingDetails ?? [])

      .map((detail: any) => Number(detail?.startHour))

      .filter((val: number) => Number.isFinite(val))

  )



  const slots: Slot[] = []

  const openHour = Number.isFinite(hours.open) ? hours.open : fallbackOperatingHours.open

  const closeHour = Number.isFinite(hours.close) ? hours.close : fallbackOperatingHours.close



  for (let hour = openHour; hour < closeHour; hour++) {
    const next = hour + 1
    const startTime = `${padHour(hour)}:00`
    const range = `${startTime} - ${padHour(next)}:00`
    const isBooked = booked.has(hour)

    slots.push({
      start: startTime,
      range,
      status: isBooked ? 'Booked' : 'Available',
      price: !isBooked && field?.pricePerHour ? Number(field.pricePerHour) : undefined,
      highlight: !isBooked && hour === openHour,
    })
  }



  return slots

}



const mapFieldToCourt = (field: any, hours: { open: number; close: number }): Court => ({

  id: Number(field?.id) || 0,

  name: field?.name ?? 'Lapangan',

  surface: field?.description || 'Permukaan belum tersedia',

  type: 'Indoor',

  status: field?.status === 'ACTIVE' ? 'Ready' : 'Maintenance',

  image: field?.images?.[0]?.imageUrl ?? FALLBACK_IMAGES[0],

  slots: buildSlotsForField(field, hours),

})



const buildVenueFromGraphQL = (stadion?: any): VenueDetail => {

  const fallback = createFallbackVenue()

  if (!stadion) return fallback



  const gallery = ensureGallery(stadion.images?.map((img: any) => img?.imageUrl))

  const facilities =

    stadion.facilities

      ?.map((item: any) => item?.Facility?.name)

      .filter((name: string | undefined): name is string => Boolean(name)) ?? []

  const fields = Array.isArray(stadion.fields) ? stadion.fields : []

  const prices = fields

    .map((field: any) => Number(field?.pricePerHour))

    .filter((val: number) => Number.isFinite(val) && val >= 0)



  const hours = {

    open: Number(stadion.operatingHours?.openHour ?? fallbackOperatingHours.open),

    close: Number(stadion.operatingHours?.closeHour ?? fallbackOperatingHours.close),

  }



  return {

    id: Number(stadion.id) || fallback.id,

    name: stadion.name ?? fallback.name,

    city: stadion.city ?? fallback.city,



    sport: fields.length ? 'Multi Sport' : fallback.sport,

    gallery,

    description: stadion.description || fallback.description,

    location: stadion.mapUrl ? 'Klik tombol untuk membuka peta' : fallback.location,

    price: prices.length ? Math.min(...prices) : fallback.price,

    facilities: facilities.length ? facilities : fallback.facilities,

    scheduleDays: buildScheduleDays(),

    courts: fields.length ? fields.map((field: any) => mapFieldToCourt(field, hours)) : fallback.courts,

    mapUrl: stadion.mapUrl ?? undefined,

  }

}



const route = useRoute()

const stadionId = Number(route.params.id ?? 0)



const { data: stadionData } = await useAsyncData(

  `stadion-detail-${stadionId}`,

  () => $fetch(`/api/stadions/${stadionId}`)

)



const venue = computed(() => buildVenueFromGraphQL(stadionData.value))



const selectedDayIndex = ref(0)

const expandedCourts = ref<Record<number, boolean>>({})

const selectedSlots = ref<SelectedSlot[]>([])

const isDrawerOpen = ref(false)

const router = useRouter()

const bookingCart = useState('booking-cart', () => ({
  stadionId: null as number | null,
  stadionName: '',
  slots: [] as SelectedSlot[],
}))



const toggleCourt = (courtId: number) => {

  expandedCourts.value = {

    ...expandedCourts.value,

    [courtId]: !expandedCourts.value[courtId],

  }

}



const isCourtExpanded = (courtId: number) => expandedCourts.value[courtId] ?? false

const availableCount = (court: Court) => court.slots.filter((slot) => slot.status === 'Available').length

const selectedDayValue = computed(() => venue.value?.scheduleDays[selectedDayIndex.value]?.value ?? null)

const selectedDayLabel = computed(() => venue.value?.scheduleDays[selectedDayIndex.value]?.label ?? '')

const selectedDayKey = computed(() => toDateKey(selectedDayValue.value))

const selectedSlotCount = computed(() => selectedSlots.value.length)

const slotKey = (courtId: number, range: string) => `${courtId}-${range}-${selectedDayKey.value ?? 'none'}`

const isSlotSelected = (courtId: number, range: string) =>
  selectedSlots.value.some(slot => slot.key === slotKey(courtId, range))

const publicBookings = ref<BookingRecord[]>([])
const loadPublicBookings = async () => {
  if (!stadionId || !selectedDayKey.value) {
    publicBookings.value = []
    return
  }
  try {
    publicBookings.value = await $fetch<BookingRecord[]>('/api/public-bookings', {
      query: { stadionId, date: `${selectedDayKey.value}T00:00:00.000Z` },
    })
  } catch (error) {
    console.error('Failed to load bookings', error)
    publicBookings.value = []
  }
}

onMounted(loadPublicBookings)
watch(selectedDayKey, () => loadPublicBookings())

const isSlotBookedFromServer = (fieldId: number, startHour: number) => {
  if (!publicBookings.value || !selectedDayKey.value) return false
  return publicBookings.value.some((booking) =>
    booking.details?.some(
      detail =>
        detail.fieldId === fieldId &&
        toDateKey(detail.bookingDate) === selectedDayKey.value &&
        detail.startHour === startHour
    )
  )
}

const toggleSlotSelection = (court: Court, slot: Slot) => {

  if (slot.status === 'Booked') return

  const startHour = Number(slot.start.split(':')[0])
  if (isSlotBookedFromServer(court.id, Number.isNaN(startHour) ? 0 : startHour)) return

  const dateKey = selectedDayKey.value

  if (!dateKey) return

  const key = slotKey(court.id, slot.range)

  const exists = selectedSlots.value.some(selected => selected.key === key)

  if (exists) {

    selectedSlots.value = selectedSlots.value.filter(selected => selected.key !== key)

    return

  }

  selectedSlots.value = [

    ...selectedSlots.value,

    {

      key,

      courtId: court.id,

      courtName: court.name,

      range: slot.range,

      price: slot.price ?? 0,

      dateLabel: selectedDayLabel.value,

      dateKey,

    },

  ]

  isDrawerOpen.value = true

}

const removeSelectedSlot = (key: string) => {

  selectedSlots.value = selectedSlots.value.filter(slot => slot.key !== key)

}

const openDrawer = () => {

  if (selectedSlots.value.length) {

    isDrawerOpen.value = true

  }

}

const closeDrawer = () => {

  isDrawerOpen.value = false

}

const proceedToOrder = () => {
  if (!selectedSlots.value.length || !venue.value) return
  bookingCart.value = {
    stadionId: venue.value.id,
    stadionName: venue.value.name,
    slots: selectedSlots.value.map(slot => ({ ...slot })),
  }
  isDrawerOpen.value = false
  router.push('/booking/order')
}

watch(selectedDayIndex, () => {

  selectedSlots.value = []
  isDrawerOpen.value = false

})

</script>



<template>

  <main class="min-h-screen bg-[#f5f7fb] pb-16">

    <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">

      <NuxtLink to="/" class="text-sm font-semibold text-[#1f2a56] hover:underline">&larr; Kembali</NuxtLink>

      <button
        type="button"
        class="relative inline-flex items-center gap-2 rounded-full border border-[#1f2a56] px-4 py-2 text-sm font-semibold text-[#1f2a56] transition disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        :disabled="!selectedSlotCount"
        @click="openDrawer"
      >
        Jadwal Dipilih
        <span
          v-if="selectedSlotCount"
          class="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1f2a56] px-1 text-xs text-white"
        >
          {{ selectedSlotCount }}
        </span>
      </button>

    </header>



    <section class="mx-auto max-w-6xl space-y-6 px-6">

      <div class="grid gap-5 lg:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]">

        <div class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-md">

          <img

            :src="venue?.gallery[0]"

            :alt="venue?.name"

            class="aspect-[16/9] w-full object-cover transition-transform duration-500 hover:scale-[1.01]"

          >

        </div>

        <div class="flex flex-col gap-4">

          <div class="grid gap-4">

            <img

              :src="venue?.gallery[1]"

              :alt="`${venue?.name} preview 1`"

              class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44"

            >

            <div class="relative">

              <img

                :src="venue?.gallery[2]"

                :alt="`${venue?.name} preview 2`"

                class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44"

              >

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

              Rp {{ venue?.price.toLocaleString('id-ID') }}

              <span class="text-sm font-medium text-gray-500">/ sesi</span>

            </p>

            <button class="mt-4 w-full rounded-xl bg-[#1f2a56] py-3 text-sm font-semibold text-white hover:bg-[#162347]">

              Cek Ketersediaan

            </button>

          </div>

        </div>

      </div>



      <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-gray-900">{{ venue.name }}</h1>
          <p class="text-sm text-gray-500">{{ venue.city }}</p>
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
            <div class="mt-1 flex items-center justify-between gap-4">
              <span class="text-sm text-gray-600">{{ venue.location }}</span>
              <a
                v-if="venue.mapUrl"
                :href="venue.mapUrl"
                target="_blank"
                rel="noopener"
                class="text-sm font-semibold text-[#1f2a56] hover:underline"
              >
                Buka Peta
              </a>
              <span v-else class="text-sm text-gray-400">Peta belum tersedia</span>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h2 class="text-lg font-semibold text-gray-900">Fasilitas</h2>
          <ul class="grid gap-3 text-gray-600 sm:grid-cols-2">
            <li v-for="facility in venue.facilities" :key="facility" class="flex items-center gap-2">
              <svg class="h-4 w-4 text-[#1f2a56]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 10l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2" />
              </svg>
              <span>{{ facility }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <section class="rounded-3xl border border-gray-100 bg-white shadow-sm">

        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">

          <div class="flex items-center gap-2">

            <span class="h-2.5 w-2.5 rounded-full bg-[#1f2a56]" />

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

            v-for="(day, index) in venue?.scheduleDays"

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

            <span class="text-lg">?</span>

          </button>

        </div>



        <div

          v-for="court in venue?.courts"

          :key="court.id"

          class="space-y-4 border-t border-gray-100 px-6 py-5"

        >

          <div class="flex flex-col gap-5 rounded-3xl border border-gray-200 p-5 lg:flex-row">

            <div class="relative w-full overflow-hidden rounded-[28px] border border-white shadow lg:w-[420px]">

              <img :src="court.image" :alt="court.name" class="h-56 w-full object-cover" >

              <span class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">

                Lihat semua foto

              </span>

            </div>



            <div class="flex-1 space-y-4">

              <div class="flex flex-col gap-2">

                <p class="text-2xl font-semibold text-gray-900">

                  {{ court.name }}

                  <span class="text-sm text-gray-400"></span>

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

                <span class="text-xs">{{ isCourtExpanded(court.id) ? '^' : '?' }}</span>

              </button>

            </div>

          </div>



          <transition name="expand">

            <div

              v-if="isCourtExpanded(court.id)"

              class="grid gap-4 px-2 pb-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6"

            >

              <button

                v-for="slot in court.slots"

                :key="slot.range"

                type="button"

                class="relative rounded-xl border px-4 py-3 text-left shadow-sm transition-colors"

                :disabled="slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0]))"

                :class="[

                  slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0]))

                    ? 'bg-white text-gray-400 border-gray-200 cursor-not-allowed'

                    : isSlotSelected(court.id, slot.range)

                      ? 'bg-[#1f2a56] text-white border-[#1f2a56]'

                      : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-[#1f2a56] hover:bg-white cursor-pointer'

                ]"

                @click="toggleSlotSelection(court, slot)"

              >

                <p

                  class="text-[0.65rem] uppercase tracking-wide font-semibold"

                  :class="isSlotSelected(court.id, slot.range) ? 'text-white/80' : 'text-gray-400'"

                >

                  60 Menit

                </p>

                <p

                  class="text-base font-semibold"

                  :class="[

                    slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0]))

                      ? 'text-gray-500'

                      : isSlotSelected(court.id, slot.range)

                        ? 'text-white'

                        : 'text-[#1f2a56]'

                  ]"

                >

                  {{ slot.range }}

                </p>

                <p
                  v-if="slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0]))"
                  class="text-sm font-semibold text-gray-400"
                >

                  Booked

                </p>

                <div

                  v-else

                  class="text-sm"

                  :class="isSlotSelected(court.id, slot.range) ? 'text-white/90' : 'text-gray-700'"

                >

                  <p v-if="slot.previousPrice" class="text-xs text-gray-400 line-through">

                    Rp{{ slot.previousPrice!.toLocaleString('id-ID') }}

                  </p>

                  <p class="font-semibold">

                    Rp{{ slot.price!.toLocaleString('id-ID') }}

                  </p>

                </div>

                <span

                  v-if="isSlotSelected(court.id, slot.range)"

                  class="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border border-white/50 bg-white/10"

                >

                  <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3">

                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />

                  </svg>

                </span>

              </button>

            </div>

          </transition>

        </div>

      </section>

    </section>

  </main>

  <Teleport to="body">
    <transition name="fade">
      <div v-if="isDrawerOpen" class="fixed inset-0 z-40">
        <div class="absolute inset-0 bg-black/40" @click="closeDrawer"></div>
        <div class="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
          <header class="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.4em] text-[#1f2a56]">Jadwal Dipilih</p>
              <p class="text-sm text-gray-500">{{ selectedDayLabel }}</p>
            </div>
            <button class="text-gray-500 hover:text-gray-800" @click="closeDrawer">
              <span class="sr-only">Tutup</span>
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <p v-if="!selectedSlots.length" class="text-sm text-gray-500">
              Belum ada jadwal yang dipilih. Silakan pilih slot tersedia.
            </p>

            <article
              v-for="item in selectedSlots"
              :key="item.key"
              class="flex items-start justify-between rounded-xl border border-gray-200 bg-[#f4f6fc] px-4 py-3 text-sm text-[#1f2a56]"
            >
              <div>
                <p class="text-sm font-semibold">{{ item.courtName }}</p>
                <p>{{ item.dateLabel }} &bull; {{ item.range }}</p>
                <p class="mt-1 font-semibold">Rp{{ item.price.toLocaleString('id-ID') }}</p>
              </div>
              <button class="text-[#b91c1c] hover:text-red-700" @click="removeSelectedSlot(item.key)">
                <span class="sr-only">Hapus slot</span>
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M10 11v6m4-6v6M9 7l.867-1.8A1 1 0 0 1 10.79 5h2.42a1 1 0 0 1 .923.2L15 7" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" />
                </svg>
              </button>
            </article>
          </section>

          <footer class="border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              class="w-full rounded-xl bg-[#1f2a56] px-4 py-3 text-sm font-semibold text-white shadow hover:bg-[#162347] disabled:cursor-not-allowed disabled:bg-gray-300"
              :disabled="!selectedSlots.length"
              @click="proceedToOrder"
            >
              Selanjutnya
            </button>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>

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




