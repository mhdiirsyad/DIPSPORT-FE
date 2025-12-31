<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { generateTimeSlots, type Slot } from '~/utils/generateTimeSlots'
import { Icon } from '@iconify/vue'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

interface Images {
  imageUrl: string
}

interface Field {
  id: string
  name: string
  pricePerHour: number
  status?: string
  description?: string
  images?: Images[]
  gallery?: string[]
  slots: Slot[]
}

interface OperatingHour {
  openHour?: number
  closeHour?: number
  openTime?: string
  closeTime?: string
}

interface Facility {
  id: number
  name: string
  icon: string
}

interface StadionFacility {
  Facility: Facility
}

interface StadionRow {
  id: number
  name: string
  images?: Images[]
  fields: Field[]
  operatingHours: OperatingHour[]
  description?: string
  mapUrl: string
  facilities: StadionFacility[]
}

interface BookingDetails {
  bookingDate: string
  fieldId: number
  startHour: number
}

interface BookingsResult {
  bookingCode: string
  details: BookingDetails[]
}

const days = getNext7Days()
const selectedDate = ref<string>(days[0]!.value)

const toLocalDateKey = (value?: string | Date | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDateKey = computed(() => toLocalDateKey(selectedDate.value))

const isDateEqual = (date1: string, date2: string) => {
  return toLocalDateKey(date1) === toLocalDateKey(date2)
}

function hourFrom(entry: OperatingHour | undefined, key: 'open' | 'close') {
  if (!entry) return key === 'open' ? 8 : 22
  const direct = key === 'open' ? entry.openHour : entry.closeHour
  if (typeof direct === 'number') return direct
  const time = key === 'open' ? entry.openTime : entry.closeTime
  if (time) return new Date(time).getUTCHours()
  return key === 'open' ? 8 : 22
}

function extractOperatingHours(operatingHours?: OperatingHour | OperatingHour[] | null) {
  if (!operatingHours || (Array.isArray(operatingHours) && operatingHours.length === 0)) {
    return { openHour: 8, closeHour: 22 }
  }

  const entries = Array.isArray(operatingHours) ? operatingHours : [operatingHours]
  const openHour = Math.min(...entries.map((entry) => hourFrom(entry, 'open')))
  const closeHour = Math.max(...entries.map((entry) => hourFrom(entry, 'close')))

  return { openHour, closeHour }
}

const route = useRoute()
const stadionId = Number(route.params.id)

const { data: stadion, pending, error } = await useAsyncData(
  `stadion-${stadionId}`,
  () => $fetch<StadionRow>(`/api/stadions/${stadionId}`),
  {
    transform: (stadion) => {
      const { openHour, closeHour } = extractOperatingHours(stadion.operatingHours)
      const fields = stadion.fields.map(field => ({
        ...field,
        gallery: field.images?.map(img => img.imageUrl) || [],
        slots: generateTimeSlots(openHour, closeHour, field.pricePerHour)
      }))
      return { ...stadion, fields }
    }
  }
)

const stadionImageIndex = ref(0)

watch(stadion, (s) => {
  if (!s) return
  stadionImageIndex.value = 0
  if (s.fields && Array.isArray(s.fields)) {
    s.fields.forEach((f: any) => {
      if (f && f.id != null && fieldImageIndex.value[f.id] == null) fieldImageIndex.value[f.id] = 0
    })
  }
})

function nextStadionImage() {
  const len = stadion.value?.images?.length || 0
  if (!len) return
  stadionImageIndex.value = (stadionImageIndex.value + 1) % len
}

function prevStadionImage() {
  const len = stadion.value?.images?.length || 0
  if (!len) return
  stadionImageIndex.value = (stadionImageIndex.value - 1 + len) % len
}

const currentStadionImage = computed(() => stadion.value?.images?.[stadionImageIndex.value]?.imageUrl || '/placeholder-stadium.jpg')

const fieldImageIndex = ref<Record<number, number>>({})

function nextFieldImage(fieldId: number) {
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const len = field?.gallery?.length || 0
  if (!len) return
  fieldImageIndex.value[fieldId] = ((fieldImageIndex.value[fieldId] || 0) + 1) % len
}

function prevFieldImage(fieldId: number) {
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const len = field?.gallery?.length || 0
  if (!len) return
  fieldImageIndex.value[fieldId] = ((fieldImageIndex.value[fieldId] || 0) - 1 + len) % len
}

function getFieldImageUrl(fieldId: number) {
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const idx = fieldImageIndex.value[fieldId] || 0
  return field?.gallery?.[idx] || field?.images?.[idx]?.imageUrl || '/placeholder-field.jpg'
}

const { data: bookingsResult } = await useAsyncData(
  () => `bookings-${stadionId}-${selectedDateKey.value ?? 'none'}`,
  () => $fetch<BookingsResult[]>('/api/bookings', {
    query: {
      stadionId,
      ...(selectedDateKey.value ? { date: `${selectedDateKey.value}T00:00:00.000Z` } : {})
    }
  }),
  {
    watch: [selectedDateKey]
  }
)

const publicBookings = ref<BookingsResult[]>([])

const loadPublicBookings = async () => {
  if (!stadionId || !selectedDateKey.value) {
    publicBookings.value = []
    return
  }
  try {
    publicBookings.value = await $fetch<BookingsResult[]>('/api/bookings', {
      query: { stadionId, date: `${selectedDateKey.value}T00:00:00.000Z` },
    })
  } catch (error) {
    console.error('Failed to load bookings', error)
    publicBookings.value = []
  }
}

onMounted(loadPublicBookings)
watch(selectedDateKey, () => loadPublicBookings())

const expandedFields = ref<Record<number, boolean>>({})

function toggleField(id: number) {
  expandedFields.value = {
    ...expandedFields.value,
    [id]: !expandedFields.value[id],
  }
}

function isFieldExpanded(id: number) {
  return expandedFields.value[id] ?? false
}

function isSlotBooked(fieldId: number, startHour: number) {
  if (!publicBookings.value || !selectedDateKey.value) return false
  return publicBookings.value.some((booking) =>
    booking.details?.some(
      (detail) =>
        detail.fieldId === fieldId &&
        toLocalDateKey(detail.bookingDate) === selectedDateKey.value &&
        detail.startHour === startHour
    )
  )
}

function isFieldFullyBooked(field: Field) {
  return field.slots.every((slot) => {
    const startHour = Number(slot.start.split(':')[0])
    return isSlotBooked(Number(field.id), startHour)
  })
}

function getBookingCode(fieldId: number, startHour: number) {
  const selectedKey = selectedDateKey.value
  if (!selectedKey) return undefined
  const booking = publicBookings.value?.find((b) =>
    b.details.some(
      (d) =>
        d.fieldId === fieldId &&
        toLocalDateKey(d.bookingDate) === selectedKey &&
        d.startHour === startHour
    )
  )
  return booking?.bookingCode
}

function handleSlotClick(fieldId: number, startHour: number, pricePerHour: number, fieldName: string) {
  // Jika slot sudah booked, tampilkan detail booking (terlepas dari status maintenance)
  if (isSlotBooked(fieldId, startHour)) {
    const bookingCode = getBookingCode(fieldId, startHour)
    if (bookingCode) {
      navigateTo(`/admin/bookings/${stadionId}/${bookingCode}`)
    }
    return
  }
  
  // Cek apakah field sedang maintenance untuk slot yang available
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === fieldId)
  if (field && field.status !== 'ACTIVE') {
    // Jangan lakukan apapun jika maintenance dan slot belum booked
    return
  }
  
  // Toggle selection untuk slot available
  toggleSlot(fieldId, startHour, pricePerHour, fieldName)
}

const selectedSlots = ref<{fieldId: number; startHour: number; date: string; pricePerHour: number; fieldName: string}[]>([])

function toggleSlot(fieldId: number, startHour: number, pricePerHour: number, fieldName: string) {
  const date = selectedDate.value as string
  const index = selectedSlots.value.findIndex(
    (s) => s.fieldId === fieldId && s.startHour === startHour && s.date === date
  )

  if (index > -1) {
    selectedSlots.value.splice(index, 1)
  } else {
    selectedSlots.value.push({
      fieldId,
      startHour,
      date,
      pricePerHour,
      fieldName
    })
  }
}

function isSlotSelected(fieldId: number, startHour: number) {
  return selectedSlots.value.some(
    (s) => s.fieldId === fieldId && s.startHour === startHour && s.date === selectedDate.value
  )
}

function makeBooking() {
  navigateTo({
    path: `/admin/bookings/${stadionId}/create`,
    query: {
      selections: encodeURIComponent(JSON.stringify(selectedSlots.value))
    }
  })
}

function isDatePast(date: Date | null) {
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today
}

watch(() => selectedSlots.value.length, (newLength) => {
  if (newLength === 0) {
    selectedSlots.value = []
  }
})
</script>

<template>
  <div>
    <main class="min-h-screen bg-[#f5f7fb] pb-16">
      
      <header class="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <NuxtLink 
          to="/admin/bookings" 
          class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-[#1f2a56] hover:border-[#1f2a56] hover:shadow-md active:scale-95"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Kembali</span>
        </NuxtLink>
      </header>

      <section v-if="pending" class="text-center py-20">
        <div class="inline-flex flex-col items-center gap-4">
          <div class="w-12 h-12 border-4 border-gray-200 border-t-[#1f2a56] rounded-full animate-spin"></div>
          <p class="text-sm font-medium text-gray-600">Memuat detail stadion...</p>
        </div>
      </section>

      <section v-else-if="error" class="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
          <p class="text-sm text-red-700">{{ error.message }}</p>
        </div>
      </section>

      <section v-else class="mx-auto max-w-6xl space-y-4 sm:space-y-6 px-4 sm:px-6">
        
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]">
          <div class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-md">
            <img
              v-if="stadion?.images && stadion.images.length > 0"
              :src="currentStadionImage"
              :alt="stadion?.name"
              class="aspect-[16/9] w-full object-cover"
            >
            <div v-else class="aspect-[16/9] w-full flex items-center justify-center bg-gray-100">
              <PlaceholderImage text="Foto Stadion Belum Ditambahkan" />
            </div>

            <button
              v-if="(stadion?.images?.length || 0) > 1"
              @click="prevStadionImage"
              class="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2.5 text-gray-700 shadow-lg hover:bg-white transition-all backdrop-blur-sm"
              aria-label="Foto sebelumnya"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-if="(stadion?.images?.length || 0) > 1"
              @click="nextStadionImage"
              class="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2.5 text-gray-700 shadow-lg hover:bg-white transition-all backdrop-blur-sm"
              aria-label="Foto berikutnya"
            >
              <svg class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div v-if="(stadion?.images?.length || 0) > 1" class="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:gap-2">
              <button
                v-for="(img, idx) in stadion?.images"
                :key="`dot-${idx}`"
                class="h-1.5 sm:h-2 rounded-full transition-all"
                :class="idx === stadionImageIndex ? 'bg-white w-6 sm:w-8' : 'bg-white/60 w-1.5 sm:w-2 hover:bg-white/80'"
                @click="stadionImageIndex = idx"
                :aria-label="`Gambar ${idx + 1}`"
              />
            </div>
          </div>

          <div class="grid gap-4">
            <template v-if="stadion?.images && stadion.images.length > 1">
              <img
                v-for="(img, idx) in stadion?.images?.slice(1, 3)"
                :key="`thumb-${idx}`"
                :src="img.imageUrl"
                :alt="`${stadion?.name} preview ${idx + 1}`"
                class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44 cursor-pointer transition-all hover:opacity-80"
                @click="stadionImageIndex = idx + 1"
              >
            </template>
          </div>
        </div>

        <div class="space-y-4 sm:space-y-5 rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div class="space-y-2 pb-3 sm:pb-4 border-b border-gray-100">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ stadion?.name }}</h1>
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
                {{ stadion?.description || 'Belum ada deskripsi.' }}
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
                <span class="text-xs sm:text-sm text-gray-700 flex-1 truncate">{{ stadion?.mapUrl || 'Tidak diketahui' }}</span>
                <a
                  v-if="stadion?.mapUrl"
                  :href="stadion.mapUrl"
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
                v-for="facility in stadion?.facilities" 
                :key="facility.Facility.id" 
                class="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm bg-gray-50 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 border border-gray-100"
              >
                <div class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-gray-100 border border-gray-200 text-[#1f2a56]">
                  <Icon
                    v-if="facility.Facility.icon"
                    :icon="facility.Facility.icon"
                    class="h-3.5 w-3.5 sm:h-4 sm:w-4"
                  />
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-[#1f2a56]"></span>
                </div>
                <span class="font-medium">{{ facility.Facility.name }}</span>
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
                  <p class="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {{ new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50/30 border-b border-gray-200">
            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              
              <button
                v-for="(day, index) in days.slice(0, 3)"
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
                v-for="(day, index) in days.slice(3)"
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
            v-for="field in stadion?.fields"
            :key="field.id"
            class="border-b border-gray-100 last:border-b-0"
          >
            <div class="p-4 sm:p-5">
              <div class="flex flex-col gap-5 rounded-3xl border border-gray-200 p-5 lg:flex-row">
                <div class="relative w-full overflow-hidden rounded-[28px] border border-white shadow lg:w-[420px]">
                  <img
                    v-if="getFieldImageUrl(Number(field.id)) && !getFieldImageUrl(Number(field.id)).includes('placeholder')"
                    :src="getFieldImageUrl(Number(field.id))"
                    :alt="field.name"
                    class="h-56 w-full object-cover transition-transform duration-500"
                  >
                  <div v-else class="h-56 w-full flex items-center justify-center bg-gray-100">
                    <PlaceholderImage text="Foto Lapangan Belum Ditambahkan" />
                  </div>

                  <template v-if="field.gallery && field.gallery.length > 1">
                    <button
                      @click.stop="prevFieldImage(Number(field.id))"
                      aria-label="Foto sebelumnya"
                      class="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-gray-700 hover:bg-white shadow-lg transition-all backdrop-blur-sm"
                    >
                      <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      @click.stop="nextFieldImage(Number(field.id))"
                      aria-label="Foto berikutnya"
                      class="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 sm:p-2 text-gray-700 hover:bg-white shadow-lg transition-all backdrop-blur-sm"
                    >
                      <svg class="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </template>

                  <span 
                    v-if="field.gallery && field.gallery.length > 0" 
                    class="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg bg-black/75 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white"
                  >
                    {{ (fieldImageIndex[Number(field.id)] ?? 0) + 1 }} / {{ field.gallery.length }}
                  </span>
                </div>

                <div class="flex-1 space-y-3 sm:space-y-4">
                  <div class="space-y-2">
                    <h4 class="text-lg sm:text-xl font-bold text-gray-900">
                      {{ field.name }}
                    </h4>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="field.status !== 'ACTIVE'"
                        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        Maintenance
                      </span>
                      <span
                        v-else-if="isFieldFullyBooked(field)"
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
                      {{ field.description || 'Tidak ada deskripsi tersedia.' }}
                    </p>
                  </div>

                  <button
                    class="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-[#1f2a56] px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white shadow hover:bg-[#162347] transition-all active:scale-95"
                    @click="toggleField(Number(field.id))"
                  >
                    <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ isFieldExpanded(Number(field.id)) ? 'Sembunyikan Jadwal' : 'Lihat Jadwal' }}</span>
                    <svg 
                      class="h-3 w-3 transition-transform" 
                      :class="isFieldExpanded(Number(field.id)) ? 'rotate-180' : ''"
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
                  v-if="isFieldExpanded(Number(field.id))"
                  class="mt-4 sm:mt-5 grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                >
                  <button
                    v-for="slot in field.slots"
                    :key="slot.start"
                    type="button"
                    class="group relative rounded-lg sm:rounded-xl border p-2 sm:p-3 text-left shadow-sm transition-all overflow-hidden"
                    :class="[
                      isSlotBooked(Number(field.id), Number(slot.start.split(':')[0]))
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-pointer hover:bg-gray-200 hover:border-gray-300'
                        : field.status !== 'ACTIVE'
                        ? 'bg-orange-50 text-orange-400 border-orange-100 cursor-not-allowed'
                        : isSlotSelected(Number(field.id), Number(slot.start.split(':')[0]))
                        ? 'bg-[#1f2a56] text-white border-[#1f2a56] shadow-md ring-2 ring-[#1f2a56] ring-offset-2'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-[#1f2a56] hover:bg-[#1f2a56]/5 hover:shadow-md hover:scale-105 active:scale-100 cursor-pointer'
                    ]"
                    @click="handleSlotClick(Number(field.id), Number(slot.start.split(':')[0]), Number(slot.price), field.name)"
                  >
                    <div
                      v-if="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0]))"
                      class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1f2a56]/90 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100"
                    >
                      <svg class="mb-1 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span class="px-1 text-center text-[10px] font-bold text-white leading-tight">
                        Lihat Detail Booking
                      </span>
                    </div>

                    <p
                      class="text-[10px] sm:text-[0.65rem] uppercase tracking-wide font-semibold"
                      :class="[
                        isSlotBooked(Number(field.id), Number(slot.start.split(':')[0])) 
                          ? 'text-gray-400 group-hover:opacity-0 transition-opacity' 
                          : field.status !== 'ACTIVE'
                          ? 'text-orange-400'
                          : isSlotSelected(Number(field.id), Number(slot.start.split(':')[0]))
                          ? 'text-white/80'
                          : 'text-gray-500'
                      ]"
                    >
                      60 Menit
                    </p>
                    <p
                      class="text-sm sm:text-base font-bold mt-0.5"
                      :class="[
                        isSlotBooked(Number(field.id), Number(slot.start.split(':')[0]))
                          ? 'text-gray-500 group-hover:opacity-0 transition-opacity'
                          : field.status !== 'ACTIVE'
                          ? 'text-orange-600'
                          : isSlotSelected(Number(field.id), Number(slot.start.split(':')[0]))
                          ? 'text-white'
                          : 'text-[#1f2a56]'
                      ]"
                    >
                      {{ slot.start }} - {{ slot.end }}
                    </p>
                    <div class="flex items-center justify-between mt-1">
                      <p
                        v-if="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0]))"
                        class="text-[10px] sm:text-xs font-semibold text-gray-400 group-hover:opacity-0 transition-opacity"
                      >
                        Booked
                      </p>
                      <p
                        v-else-if="field.status !== 'ACTIVE'"
                        class="text-[10px] sm:text-xs font-semibold text-orange-500"
                      >
                        Maintenance
                      </p>
                      <p 
                        v-else 
                        class="text-[10px] sm:text-xs font-semibold"
                        :class="isSlotSelected(Number(field.id), Number(slot.start.split(':')[0])) ? 'text-white' : 'text-green-600'"
                      >
                        Available
                      </p>
                      
                      <svg
                        v-if="isSlotSelected(Number(field.id), Number(slot.start.split(':')[0]))"
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
    </main>

    <transition name="slide-up">
      <div
        v-if="selectedSlots.length > 0"
        class="fixed bottom-0 left-0 lg:left-64 right-0 z-50 border-t border-gray-200 bg-white shadow-2xl"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-[#1f2a56] rounded-full">
              <span class="text-sm sm:text-base font-bold text-white">{{ selectedSlots.length }}</span>
            </div>
            <div>
              <p class="text-xs sm:text-sm font-semibold text-gray-900">{{ selectedSlots.length }} Jadwal Dipilih</p>
              <p class="text-[10px] sm:text-xs text-gray-500">Lanjutkan untuk membuat booking</p>
            </div>
          </div>

          <div class="flex gap-2 sm:gap-2.5">
            <button
              type="button"
              class="rounded-lg sm:rounded-xl border border-gray-300 bg-white px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
              @click="selectedSlots = []"
            >
              Batalkan
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-[#1f2a56] px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-[#162347] transition-all active:scale-95"
              @click="makeBooking"
            >
              <span>Lanjut</span>
              <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
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