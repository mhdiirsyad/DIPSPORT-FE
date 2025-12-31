<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

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
  type?: string
  status: 'Ready' | 'Maintenance'
  image: string
  gallery: string[]
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
  facilities: Array<{ name: string; icon?: string }>
  scheduleDays: Array<{ label: string; value: string }>
  courts: Court[]
  mapUrl?: string
}

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
    date.setDate(date.getDate() + idx + 1)
    return { label: formatDayLabel(date), value: date.toISOString() }
  })

const toDateKey = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

const padHour = (value: number) => value.toString().padStart(2, '0')

const createFallbackVenue = (): VenueDetail => ({
  id: 0,
  name: 'Stadion Venue Undip',
  city: 'Lokasi belum tersedia',
  sport: 'Multi Sport',
  gallery: [],
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

const mapFieldToCourt = (field: any, hours: { open: number; close: number }): Court => {
  const rawImages = field?.images?.map((img: any) => img?.imageUrl).filter(Boolean) || []

  return {
    id: Number(field?.id) || 0,
    name: field?.name ?? 'Lapangan',
    surface: field?.description || 'Permukaan belum tersedia',
    type: field?.type,
    status: field?.status === 'ACTIVE' ? 'Ready' : 'Maintenance',
    image: rawImages[0] || '',
    gallery: rawImages,
    slots: buildSlotsForField(field, hours),
  }
}

const buildVenueFromGraphQL = (stadion?: any): VenueDetail => {
  const fallback = createFallbackVenue()
  if (!stadion) return fallback

  const gallery = stadion.images?.map((img: any) => img?.imageUrl).filter(Boolean) || []
  const facilities =
    stadion.facilities
      ?.map((item: any) => ({
        name: item?.Facility?.name || '',
        icon: item?.Facility?.icon || undefined
      }))
      .filter((fac: any) => Boolean(fac.name)) ?? []

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

const activeGalleryIndex = ref(0)
const galleryLength = computed(() => venue.value?.gallery?.length ?? 0)

watch(venue, () => { activeGalleryIndex.value = 0 })

const nextGallery = () => {
  const len = galleryLength.value
  if (!len) return
  activeGalleryIndex.value = (activeGalleryIndex.value + 1) % len
}

const prevGallery = () => {
  const len = galleryLength.value
  if (!len) return
  activeGalleryIndex.value = (activeGalleryIndex.value - 1 + len) % len
}

const selectedDate = ref<string>(buildScheduleDays()[0]?.value ?? '')
const expandedCourts = ref<Record<number, boolean>>({})
const courtImageIndices = ref<Record<number, number>>({})

const selectedSlots = ref<SelectedSlot[]>([])
const isDrawerOpen = ref(false)
const isInfoModalOpen = ref(false)

const router = useRouter()
const selectionDisabled = true

const bookingCart = useState('booking-cart', () => ({
  stadionId: null as number | null,
  stadionName: '',
  slots: [] as SelectedSlot[],
}))

const selectedDayIndex = computed(() => {
  const index = venue.value?.scheduleDays.findIndex(day => day.value === selectedDate.value) ?? -1
  return index >= 0 ? index : 0
})

const selectedDayLabel = computed(() => venue.value?.scheduleDays[selectedDayIndex.value]?.label ?? '')
const selectedDayKey = computed(() => toDateKey(selectedDate.value))

const fullSelectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''
  const date = new Date(selectedDate.value)
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
})

const selectedSlotCount = computed(() => selectedSlots.value.length)

const slotKey = (courtId: number, range: string) => `${courtId}-${range}-${selectedDayKey.value ?? 'none'}`

const isSlotSelected = (courtId: number, range: string) =>
  selectedSlots.value.some(slot => slot.key === slotKey(courtId, range))

const toggleCourt = (courtId: number) => {
  expandedCourts.value = {
    ...expandedCourts.value,
    [courtId]: !expandedCourts.value[courtId],
  }
}

const nextCourtImage = (courtId: number, length: number) => {
  if (!length) return
  const current = courtImageIndices.value[courtId] ?? 0
  courtImageIndices.value[courtId] = (current + 1) % length
}

const prevCourtImage = (courtId: number, length: number) => {
  if (!length) return
  const current = courtImageIndices.value[courtId] ?? 0
  courtImageIndices.value[courtId] = (current - 1 + length) % length
}

const getCourtImageUrl = (court: Court) => {
  const index = courtImageIndices.value[court.id] ?? 0
  return court.gallery[index] || court.image
}

const isCourtExpanded = (courtId: number) => expandedCourts.value[courtId] ?? false

const isDateEqual = (date1: string, date2: string) => {
  return toDateKey(date1) === toDateKey(date2)
}

const availableCount = (court: Court) => court.slots.filter((slot) => slot.status === 'Available').length

const availableCountWithServer = (court: Court) => {
  return court.slots.filter((slot) => {
    const startHour = Number(slot.start.split(':')[0])
    const isBooked = slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number.isNaN(startHour) ? 0 : startHour)
    return !isBooked
  }).length
}

const isCourtFullyBooked = (court: Court) => {
  return court.slots.every((slot) => {
    const startHour = Number(slot.start.split(':')[0])
    return slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number.isNaN(startHour) ? 0 : startHour)
  })
}

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

const openInfoModal = () => {
  isInfoModalOpen.value = true
}

const closeInfoModal = () => {
  isInfoModalOpen.value = false
}

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

  if (court.status === 'Maintenance') return

  openInfoModal()
}

const removeSelectedSlot = (key: string) => {
  selectedSlots.value = selectedSlots.value.filter(slot => slot.key !== key)
}

const openDrawer = () => {
  if (selectionDisabled) return
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

watch(selectedDate, () => {
  selectedSlots.value = []
  isDrawerOpen.value = false
})
</script>

<template>
  <main class="min-h-screen bg-[#f5f7fb]">
    <!-- Client TopBar -->
    <ClientTopBar />

    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
      <NuxtLink 
        to="/" 
        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-[#1f2a56] hover:border-[#1f2a56] hover:shadow-md active:scale-95"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </div>

    <section class="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-4 sm:px-6">
      <div class="grid gap-3 lg:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]">
        <div class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-md">
          <img
            v-if="venue?.gallery && venue.gallery.length > 0"
            :src="venue?.gallery[activeGalleryIndex]"
            :alt="venue?.name"
            class="aspect-[16/9] w-full object-cover"
          >
          <div v-else class="aspect-[16/9] w-full flex items-center justify-center bg-gray-100">
            <PlaceholderImage text="Foto Stadion Belum Ditambahkan" />
          </div>

          <button
            v-if="(venue?.gallery?.length || 0) > 1"
            @click="prevGallery"
            class="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2.5 text-gray-700 shadow-lg hover:bg-white transition-all backdrop-blur-sm"
            aria-label="Foto sebelumnya"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            v-if="(venue?.gallery?.length || 0) > 1"
            @click="nextGallery"
            class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2.5 text-gray-700 shadow-lg hover:bg-white transition-all backdrop-blur-sm"
            aria-label="Foto berikutnya"
          >
            <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div v-if="(venue?.gallery?.length || 0) > 1" class="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:gap-2">
            <button
              v-for="(img, idx) in venue?.gallery"
              :key="`dot-${idx}`"
              class="h-1.5 sm:h-2 rounded-full transition-all"
              :class="idx === activeGalleryIndex ? 'bg-white w-6 sm:w-8' : 'bg-white/60 w-1.5 sm:w-2 hover:bg-white/80'"
              @click="activeGalleryIndex = idx"
              :aria-label="`Gambar ${idx + 1}`"
            />
          </div>
        </div>

        <div class="grid gap-3">
          <template v-if="venue?.gallery && venue.gallery.length > 1">
            <img
              v-for="(img, idx) in venue?.gallery?.slice(1, 3)"
              :key="`thumb-${idx}`"
              :src="img"
              :alt="`${venue?.name} preview ${idx + 1}`"
              class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44 cursor-pointer transition-all hover:opacity-80"
              @click="activeGalleryIndex = idx + 1"
            >
          </template>
        </div>
      </div>

      <div class="space-y-4 sm:space-y-5 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        <div class="space-y-2 pb-3 sm:pb-4 border-b border-gray-100">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ venue.name }}</h1>
        </div>

        <div class="space-y-4">
          <div>
            <h2 class="text-sm sm:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-[#1f2a56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Deskripsi
            </h2>
            <p class="text-xs sm:text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {{ venue.description || 'Belum ada deskripsi.' }}
            </p>
          </div>

          <div class="rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100 p-3 sm:p-4">
            <p class="text-xs sm:text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1f2a56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lokasi Stadion
            </p>
            <div class="flex items-center justify-between gap-3 sm:gap-4">
              <span class="text-xs sm:text-sm text-gray-700 flex-1 truncate">{{ venue.mapUrl || 'Tidak diketahui' }}</span>
              <a
                v-if="venue.mapUrl"
                :href="venue.mapUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1f2a56] hover:underline transition-colors whitespace-nowrap"
              >
                <span>Buka Peta</span>
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <span v-else class="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Peta belum tersedia</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          <h2 class="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 text-[#1f2a56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Fasilitas
          </h2>
          <ul class="grid gap-2 text-gray-700 sm:grid-cols-2">
            <li 
              v-for="(facility, index) in venue.facilities" 
              :key="index" 
              class="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-100"
            >
              <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-[#1f2a56]">
                <Icon
                  v-if="facility.icon"
                  :icon="facility.icon"
                  class="h-3.5 w-3.5 sm:h-4 sm:w-4"
                />
                <span v-else class="w-1.5 h-1.5 rounded-full bg-[#1f2a56]"></span>
              </div>
              <span class="font-medium">{{ facility.name || facility }}</span>
            </li>
          </ul>
        </div>
      </div>

      <section class="rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#1f2a56]"></span>
            <h3 class="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight">Pilih Lapangan & Jadwal</h3>
          </div>

          <SmartDatePicker v-model="selectedDate" />
        </div>

        <!-- Informasi Tanggal Terpilih -->
        <div class="px-4 sm:px-6 py-3 sm:py-3.5 bg-white border-b border-gray-200">
          <div class="flex items-center gap-2.5 sm:gap-3">
            <div class="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#1f2a56]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500 font-medium">Tanggal Dipilih</p>
                <p class="text-sm sm:text-base font-bold text-gray-900 truncate">{{ fullSelectedDateLabel }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50/30 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              v-for="(day, index) in venue?.scheduleDays.slice(0, 3)"
              :key="day.value"
              class="rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all border"
              :class="
                isDateEqual(selectedDate, day.value)
                  ? 'bg-[#1f2a56] text-white shadow border-[#1f2a56] hover:bg-[#162347]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              "
              @click="selectedDate = day.value"
            >
              {{ day.label }}
            </button>

            <button
              v-for="(day, index) in venue?.scheduleDays.slice(3)"
              :key="day.value"
              class="hidden sm:inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition-all border"
              :class="
                isDateEqual(selectedDate, day.value)
                  ? 'bg-[#1f2a56] text-white shadow border-[#1f2a56] hover:bg-[#162347]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              "
              @click="selectedDate = day.value"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

        <div
          v-for="court in venue?.courts"
          :key="court.id"
          class="border-b border-gray-100 last:border-b-0"
        >
          <div class="p-4 sm:p-5">
            <div class="flex flex-col gap-5 rounded-3xl border border-gray-200 p-5 lg:flex-row">
              <div class="relative w-full overflow-hidden rounded-[28px] border border-white shadow lg:w-[420px]">
                <img
                  v-if="getCourtImageUrl(court) && !getCourtImageUrl(court).includes('placeholder')"
                  :src="getCourtImageUrl(court)"
                  :alt="court.name"
                  class="h-56 w-full object-cover transition-transform duration-500"
                >
                <div v-else class="h-56 w-full flex items-center justify-center bg-gray-100">
                  <PlaceholderImage text="Foto Lapangan Belum Ditambahkan" />
                </div>

                <template v-if="court.gallery && court.gallery.length > 1">
                  <button
                    @click.stop="prevCourtImage(court.id, court.gallery.length)"
                    aria-label="Foto sebelumnya"
                    class="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-gray-700 hover:bg-white shadow-lg transition-all backdrop-blur-sm"
                  >
                    <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    @click.stop="nextCourtImage(court.id, court.gallery.length)"
                    aria-label="Foto berikutnya"
                    class="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-gray-700 hover:bg-white shadow-lg transition-all backdrop-blur-sm"
                  >
                    <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </template>

                <span 
                  v-if="court.gallery && court.gallery.length > 0" 
                  class="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg bg-black/75 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white"
                >
                  {{ (courtImageIndices[court.id] ?? 0) + 1 }} / {{ court.gallery.length }}
                </span>
              </div>

              <div class="flex-1 space-y-3 sm:space-y-4">
                <div class="space-y-2">
                  <h4 class="text-lg sm:text-xl font-bold text-gray-900">
                    {{ court.name }}
                  </h4>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="court.status !== 'Ready'"
                      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      Maintenance
                    </span>
                    <span
                      v-else-if="isCourtFullyBooked(court)"
                      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold border bg-red-50 text-red-700 border-red-200"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      Full Booked
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold border bg-green-50 text-green-700 border-green-200"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Ready
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {{ court.surface || 'Tidak ada deskripsi tersedia.' }}
                  </p>
                </div>

                <button
                  class="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#1f2a56] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-[#162347] transition-all active:scale-95"
                  @click="toggleCourt(court.id)"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ isCourtExpanded(court.id) ? 'Sembunyikan Jadwal' : 'Lihat Jadwal' }}</span>
                  <svg 
                    class="h-3 w-3 transition-transform" 
                    :class="isCourtExpanded(court.id) ? 'rotate-180' : ''"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <transition name="expand">
              <div
                v-if="isCourtExpanded(court.id)"
                class="mt-4 sm:mt-5 grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
              >
                <button
                  v-for="slot in court.slots"
                  :key="slot.range"
                  type="button"
                  class="group relative rounded-lg sm:rounded-xl border p-2 sm:p-3 text-left shadow-sm transition-all overflow-hidden"
                  :class="[
                    (slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0])))
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : court.status === 'Maintenance'
                      ? 'bg-orange-50 text-orange-400 border-orange-100 cursor-not-allowed'
                      : isSlotSelected(court.id, slot.range)
                      ? 'bg-[#1f2a56] text-white border-[#1f2a56] shadow-md ring-2 ring-[#1f2a56] ring-offset-2'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-[#1f2a56] hover:bg-[#1f2a56]/5 hover:shadow-md hover:scale-105 active:scale-100 cursor-pointer'
                  ]"
                  @click="toggleSlotSelection(court, slot)"
                >
                  <p
                    class="text-[10px] sm:text-[0.65rem] uppercase tracking-wide font-semibold"
                    :class="[
                      (slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0])))
                        ? 'text-gray-400'
                        : court.status === 'Maintenance'
                        ? 'text-orange-400'
                        : isSlotSelected(court.id, slot.range)
                        ? 'text-white/80'
                        : 'text-gray-500'
                    ]"
                  >
                    60 Menit
                  </p>
                  <p
                    class="text-sm sm:text-base font-bold mt-0.5"
                    :class="[
                      (slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0])))
                        ? 'text-gray-500'
                        : court.status === 'Maintenance'
                        ? 'text-orange-600'
                        : isSlotSelected(court.id, slot.range)
                        ? 'text-white'
                        : 'text-[#1f2a56]'
                    ]"
                  >
                    {{ slot.range }}
                  </p>
                  <div class="flex items-center justify-between mt-1">
                    <p
                      v-if="slot.status === 'Booked' || isSlotBookedFromServer(court.id, Number(slot.start.split(':')[0]))"
                      class="text-[10px] sm:text-xs font-semibold text-gray-400"
                    >
                      Booked
                    </p>
                    <p
                      v-else-if="court.status === 'Maintenance'"
                      class="text-[10px] sm:text-xs font-semibold text-orange-500"
                    >
                      Maintenance
                    </p>
                    <p 
                      v-else 
                      class="text-[10px] sm:text-xs font-semibold"
                      :class="isSlotSelected(court.id, slot.range) ? 'text-white' : 'text-green-600'"
                    >
                      Available
                    </p>
                    
                    <svg
                      v-if="isSlotSelected(court.id, slot.range)"
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </section>
    </section>

    <!-- Client Footer -->
    <ClientFooter />

    <!-- Info Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div 
          v-if="isInfoModalOpen" 
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          @click="closeInfoModal"
        >
          <div 
            class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            @click.stop
          >
            <!-- Decorative Background -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <!-- Close Button -->
            <button 
              @click="closeInfoModal"
              class="absolute top-4 right-4 z-10 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div class="relative p-8 space-y-6">
              <!-- Icon -->
              <div class="flex justify-center">
                <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#1f2a56] to-[#0f1a3c] shadow-lg shadow-[#1f2a56]/25">
                  <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="text-center space-y-3">
                <h3 class="text-2xl font-bold text-gray-900">Informasi</h3>
                <p class="text-gray-600 leading-relaxed">
                  Maaf, untuk saat ini Anda hanya bisa melihat sisa kuota booking lapangan. Untuk booking, silahkan datang langsung ke venue terkait.
                </p>
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span class="text-sm font-medium text-blue-900">Terima kasih atas pengertian Anda</span>
                </div>
              </div>

              <!-- Action Button -->
              <button 
                @click="closeInfoModal"
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f2a56] to-[#0f1a3c] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1f2a56]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#1f2a56]/30 hover:-translate-y-0.5"
              >
                Mengerti
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>