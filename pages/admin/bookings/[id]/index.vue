<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { generateTimeSlots, type Slot } from '~/utils/generateTimeSlots'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

interface Field {
  id: string
  name: string
  pricePerHour: number
  type?: string
  status?: 'Ready' | 'Maintenance'
  images?: Images[]
  slots: Slot[]
}

interface OperatingHour {
  openHour?: number
  closeHour?: number
  openTime?: string
  closeTime?: string
}

interface Images {
  imageUrl: string
}

interface StadionRow {
  id: number
  name: string
  images?: Images[]
  fields: Field[]
  operatingHours: OperatingHour[]
  description?: string
  mapUrl: string
  price?: number
  sport?: string
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

const days = getNext7Days();
const selectedDate = ref(days[0]?.value)
const toLocalDateKey = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const selectedDateKey = computed(() => toLocalDateKey(selectedDate.value))

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


// -------------------------------------------------------------------
// Fetch Data
// -------------------------------------------------------------------
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
        slots: generateTimeSlots(openHour, closeHour, field.pricePerHour)
      }))
      return { ...stadion, fields }
    }
  }
)

// Carousel state for stadion images
const stadionImageIndex = ref(0)

watch(stadion, (s) => {
  if (!s) return
  stadionImageIndex.value = 0
  // initialize per-field image index map
  if (s.fields && Array.isArray(s.fields)) {
    s.fields.forEach((f: any) => {
      if (f && f.id != null && fieldImageIndex.value[f.id] == null) fieldImageIndex.value[f.id] = 0
    })
  }
})

function nextStadionImage(){
  const len = stadion.value?.images?.length || 0
  if (!len) return
  stadionImageIndex.value = (stadionImageIndex.value + 1) % len
}

function prevStadionImage(){
  const len = stadion.value?.images?.length || 0
  if (!len) return
  stadionImageIndex.value = (stadionImageIndex.value - 1 + len) % len
}

const currentStadionImage = computed(() => stadion.value?.images?.[stadionImageIndex.value]?.imageUrl || '/placeholder-stadium.jpg')

// Per-field carousel state: map fieldId -> index
const fieldImageIndex = ref<Record<number, number>>({})

function nextFieldImage(fieldId: number){
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const len = field?.images?.length || 0
  if (!len) return
  fieldImageIndex.value[fieldId] = ((fieldImageIndex.value[fieldId] || 0) + 1) % len
}

function prevFieldImage(fieldId: number){
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const len = field?.images?.length || 0
  if (!len) return
  fieldImageIndex.value[fieldId] = ((fieldImageIndex.value[fieldId] || 0) - 1 + len) % len
}

function getFieldImageUrl(fieldId: number){
  const field = stadion.value?.fields?.find((f: any) => Number(f.id) === Number(fieldId))
  const idx = fieldImageIndex.value[fieldId] || 0
  return field?.images?.[idx]?.imageUrl || '/placeholder-field.jpg'
}

const { data: bookingsResult } = await useAsyncData(
  () => `bookings-${stadionId}-${selectedDateKey.value ?? 'none'}`,
  () => $fetch<BookingsResult[]>('/api/bookings', {
    query: {
      stadionId,
      ...(selectedDateKey.value ? { date: `${selectedDateKey.value}T00:00:00.000Z` } : {})
    }
  }), {
    watch: [selectedDateKey]
  }
)

// -------------------------------------------------------------------
// State & Methods
// -------------------------------------------------------------------
const selectedField = ref<number | null>(null)

function toggleField(id: number) {
  selectedField.value = selectedField.value === id ? null : id
}

function isFieldExpanded(id: number) {
  return selectedField.value === id
}

function isSlotBooked(fieldId: number, startHour: number) {
  if (!bookingsResult.value) return false
  const selectedKey = selectedDateKey.value
  if (!selectedKey) return false

  return bookingsResult.value.some((booking) =>
    booking.details.some(
      (detail) =>
        detail.fieldId === fieldId &&
        toLocalDateKey(detail.bookingDate) === selectedKey &&
        detail.startHour === startHour        
    )
  )
}

function getBookingCode(fieldId: number, startHour: number) {
  const selectedKey = selectedDateKey.value
  if (!selectedKey) return undefined
  const booking = bookingsResult.value?.find((b) =>
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
  if (isSlotBooked(fieldId, startHour)) {
    const bookingCode = getBookingCode(fieldId, startHour)
    console.log(fieldId, bookingCode)
    if (bookingCode) {
      navigateTo(`/admin/bookings/${stadionId}/${bookingCode}`)
    }
    return 
  } else {
    toggleSlot(fieldId, startHour, pricePerHour, fieldName)
  }
}

const selectedSlots = ref<{fieldId: number; startHour: number; date: string; pricePerHour: number; fieldName: string}[]>([])
function toggleSlot(fieldId: number, startHour: number, pricePerHour: number, fieldName: string){
  const date = selectedDate.value as string
  const index = selectedSlots.value.findIndex(
    (s) => s.fieldId === fieldId && s.startHour === startHour && s.date === date
  )

  if(index > -1) {
    selectedSlots.value.splice(index, 1)
  } else {
    selectedSlots.value.push({
      fieldId, startHour, date, pricePerHour, fieldName
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
</script>

<template>
  <div>
    <main class="min-h-screen bg-[#f5f7fb] pb-16">
      <!-- Header -->
      <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <NuxtLink to="/admin/bookings" class="text-sm font-semibold text-[#1f2a56] hover:underline">
          &larr; Kembali
        </NuxtLink>
      </header>

      <section v-if="pending" class="text-center py-16 text-gray-500">
        Memuat detail stadion...
      </section>

      <section v-else-if="error" class="mx-auto max-w-6xl p-6 text-center text-red-600">
        Terjadi kesalahan: {{ error.message }}
      </section>

      <section v-else class="mx-auto max-w-6xl space-y-6 px-6">
        <!-- Galeri -->
        <div class="grid gap-5 lg:grid-cols-[minmax(0,2.3fr)_minmax(320px,1fr)]">
          <div class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-md">
            <img 
              :src="currentStadionImage" :alt="stadion?.name"
              class="aspect-[16/9] w-full object-cover transition-transform duration-500 hover:scale-[1.01]" >

            <button @click="prevStadionImage" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
              ‹
            </button>
            <button @click="nextStadionImage" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
              ›
            </button>
          </div>
          <div class="flex flex-col gap-4">
            <div class="grid gap-4">
              <img 
                v-if="stadion?.images?.[1]" 
                :src="stadion.images[1].imageUrl" :alt="stadion?.name"
                class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44" 
                @click="stadionImageIndex = 1"
                >
              <div class="relative">
                <img 
                  v-if="stadion?.images?.[2]" 
                  :src="stadion.images[2].imageUrl" :alt="stadion?.name"
                  class="h-40 w-full rounded-[24px] object-cover shadow-sm lg:h-44" 
                  @click="stadionImageIndex = 2"
                  >
                <button
                  class="w-full relative rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black">
                  Lihat semua foto
                </button>
              </div>
            </div>

          </div>
          <div class="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm">
            <p class="text-sm text-gray-500">Mulai dari</p>
            <p class="text-3xl font-bold text-gray-900">
              Rp {{ stadion?.price?.toLocaleString('id-ID') || '0' }}
              <span class="text-sm font-medium text-gray-500">/ sesi</span>
            </p>
            <button class="mt-4 w-full rounded-xl bg-[#1f2a56] py-3 text-sm font-semibold text-white hover:bg-[#162347]">
              Cek Ketersediaan
            </button>
          </div>
        </div>

        <!-- Deskripsi -->
        <div class="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div class="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
            <div class="space-y-2">
              <h1 class="text-3xl font-bold text-gray-900">{{ stadion?.name }}</h1>
              <!-- <p class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{ stadion?.mapUrl || 'Kota tidak diketahui' }}</span>
              </p> -->
              <span class="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {{ stadion?.sport || 'Umum' }}
              </span>
            </div>

          <div class="space-y-3 text-sm text-gray-600">
            <h2 class="text-lg font-semibold text-gray-900">Deskripsi</h2>
            <p class="whitespace-pre-line">
              {{ stadion?.description || 'Belum ada deskripsi.' }}
            </p>
            <div class="rounded-2xl bg-gray-50 p-4">
              <p class="text-sm font-semibold text-gray-900">Lokasi Stadion</p>
              <div class="mt-1 flex items-center justify-between gap-4">
                <span class="text-sm text-gray-600">{{ stadion?.mapUrl || 'Tidak diketahui' }}</span>
                <a
                  v-if="stadion?.mapUrl"
                  :href="stadion.mapUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-semibold text-[#1f2a56] hover:underline"
                >
                  Buka Peta
                </a>
                <span v-else class="text-sm text-gray-400">Peta belum tersedia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div class="flex gap-3 overflow-x-auto pb-2">
          <button
            v-for="d in days"
            :key="d.value"
            class="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap"
            :class="selectedDate === d.value
              ? 'bg-[#1f2a56] text-white shadow'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
            @click="selectedDate = d.value"
          >
            {{ d.label }}
          </button>
        </div>
        <!-- Fields / Lapangan -->
        <section v-if="stadion?.fields?.length" class="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-[#1f2a56]"/>
              <h3 class="text-xl font-semibold text-gray-900">Daftar Lapangan</h3>
            </div>
          </div>

          <div v-for="field in stadion.fields" :key="field.id" class="space-y-4 border-t border-gray-100 px-6 py-5">
            <div class="flex flex-col gap-5 rounded-3xl border border-gray-200 p-5 lg:flex-row">
              <div class="relative w-full overflow-hidden rounded-[28px] border border-white shadow lg:w-[420px]">
                <img 
                  :src="getFieldImageUrl(Number(field.id))" :alt="field.name"
                  class="h-56 w-full object-cover" >
                <button @click.stop="prevFieldImage(Number(field.id))" class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
                  ‹
                </button>
                <button @click.stop="nextFieldImage(Number(field.id))" class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
                  ›
                </button>
                <span class="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">Lihat semua foto</span>
              </div>

              <div class="flex-1 space-y-3">
                <div class="flex flex-col gap-2">
                  <p class="text-2xl font-semibold text-gray-900">{{ field.name }}</p>
                  <p 
                    class="text-sm font-semibold"
                    :class="field.status === 'Ready' ? 'text-green-600' : 'text-amber-600'">
                    {{ field.status === 'Ready' ? 'Ready' : 'Maintenance' }}
                  </p>
                  <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Tipe: {{ field.type || '-' }}</span>
                  </div>
                </div>

                <button
                  class="inline-flex items-center gap-2 rounded-full bg-[#1f2a56] px-5 py-2 text-sm font-semibold text-white shadow hover:bg-[#162347]"
                  @click="toggleField(Number(field.id))">
                  {{ isFieldExpanded(Number(field.id)) ? 'Sembunyikan Jadwal' : 'Lihat Jadwal' }}
                  <span class="text-xs">{{ isFieldExpanded(Number(field.id)) ? '⌃' : '⌄' }}</span>
                </button>
              </div>
            </div>

          <transition name="expand">
            <div
              v-if="isFieldExpanded(Number(field.id))"
              class="grid gap-4 px-2 pb-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              <div
                v-for="slot in field.slots" :key="slot.start"
                class="rounded-xl border px-4 py-3 text-center shadow-sm transition-colors"
                :class="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0]))
                  ? 'bg-white text-gray-400 border-red-200 cursor-pointer hover:bg-red-50'
                  : isSlotSelected(Number(field.id), Number(slot.start.split(':')[0])) 
                  ? 'bg-blue-100 text-blue-900 border-blue-300 hover:border-[#1f2a56] hover:bg-blue cursor-default' 
                  : 'bg-white-50 text-white-900 border-blue-200 hover:border-[#1f2a56] hover:bg-white cursor-default'"
                @click="handleSlotClick(Number(field.id), Number(slot.start.split(':')[0]), Number(slot.price), field.name)"
              >
                <p
                  class="text-[0.65rem] font-semibold uppercase tracking-wide"
                  :class="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0])) ? 'text-gray-400' : 'text-gray-500'">
                  60 Menit
                </p>
                <p
                  class="text-base font-semibold"
                  :class="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0])) ? 'text-gray-500' : 'text-[#1f2a56]'"
                >
                  {{ slot.start }} - {{ slot.end }}
                </p>
                <p
                  class="font-semibold"
                  :class="isSlotBooked(Number(field.id), Number(slot.start.split(':')[0])) ? 'text-gray-400' : 'text-gray-700'"
                >
                  {{ isSlotBooked(Number(field.id), Number(slot.start.split(':')[0])) ? 'Booked' : `Rp ${slot.price.toLocaleString('id-ID')}` }}
                </p>
              </div>

              </div>
            </transition>
          </div>
        </section>
      </section>
    </main>
    <transition name="fade">
      <div
        v-if="selectedSlots.length > 0"
        class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p class="text-sm text-gray-600">
            {{ selectedSlots.length }} slot dipilih
          </p>

          <div class="flex gap-3">
            <button
            class="rounded-full border border-gray-300 bg-gray-50 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            @click="selectedSlots = []"
            >
              Batal
            </button>
            <button
            class="rounded-full bg-[#1f2a56] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#162347]"
            @click="makeBooking"
            >
              Lanjut ke Form Pemesan
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
