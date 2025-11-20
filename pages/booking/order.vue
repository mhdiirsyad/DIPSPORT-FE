<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ layout: false })

const router = useRouter()
const bookingCart = useState('booking-cart', () => ({
  stadionId: null as number | null,
  stadionName: '',
  slots: [] as Array<{
    key: string
    courtId: number
    courtName: string
    range: string
    price: number
    dateLabel: string
    dateKey: string
  }>,
}))

if (!bookingCart.value.stadionId || bookingCart.value.slots.length === 0) {
  await navigateTo('/')
}

const stadionId = bookingCart.value.stadionId

const { data: stadion, pending } = await useAsyncData(
  () => (stadionId ? `booking-stadion-${stadionId}` : ""),
  () => $fetch(`/api/stadions/:id`, {
    params: { id: stadionId },
  }),
  { immediate: Boolean(stadionId) }
)

const orderSlots = computed(() => bookingCart.value.slots)
const totalPrice = computed(() =>
  orderSlots.value.reduce((sum, slot) => sum + (slot.price || 0), 0)
)

const customerName = ref('')
const customerContact = ref('')
const customerEmail = ref('')
const customerInstitution = ref('')
const customerAcademic = ref(false)
const bookingLoading = ref(false)
const bookingError = ref<string | null>(null)
const bookingSuccess = ref<string | null>(null)
const customerSuratUrl = ref('')

const formatDateLong = (slotDate: string, label: string) => {
  try {
    const d = new Date(slotDate)
    if (Number.isNaN(d.getTime())) return label
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch {
    return label
  }
}

const removeSlot = (key: string) => {
  const filtered = bookingCart.value.slots.filter(slot => slot.key !== key)
  bookingCart.value = { ...bookingCart.value, slots: filtered }
  if (!filtered.length && bookingCart.value.stadionId) {
    router.push(`/venues/${bookingCart.value.stadionId}`)
  }
}

const addMore = () => {
  if (bookingCart.value.stadionId) {
    router.push(`/venues/${bookingCart.value.stadionId}`)
  } else {
    router.push('/')
  }
}

const createBooking = async () => {
  if (!orderSlots.value.length) return
  if (!customerName.value || !customerContact.value || !customerEmail.value) {
    bookingError.value = 'Nama, kontak, dan email wajib diisi.'
    return
  }
  bookingLoading.value = true
  bookingError.value = null
  bookingSuccess.value = null
  const details = orderSlots.value.map(slot => {
    const [startText] = slot.range.split('-')
    const [hourText] = startText?.trim().split(':') ?? []
    const startHour = Number(hourText)
    return {
      fieldId: slot.courtId,
      bookingDate: `${slot.dateKey}T00:00:00.000Z`,
      startHour: Number.isNaN(startHour) ? 0 : startHour,
      pricePerHour: slot.price,
    }
  })
  try {
    const result = await $fetch('/api/bookings/create', {
      method: 'POST',
      body: {
        name: customerName.value,
        contact: customerContact.value,
        email: customerEmail.value,
        institution: customerInstitution.value || undefined,
        isAcademic: customerAcademic.value,
        suratUrl: customerAcademic.value ? (customerSuratUrl.value || 'https://placeholder.local/surat.pdf') : undefined,
        details,
      },
    })
    console.log('Booking created', result)
    bookingCart.value = { stadionId: null, stadionName: '', slots: [] }
    bookingSuccess.value = `Booking berhasil! Kode: ${result?.bookingCode || ''}`
    setTimeout(() => {
      bookingSuccess.value = null
      navigateTo('/')
    }, 1500)
  } catch (error: any) {
    bookingError.value = error?.data?.statusMessage || error?.message || 'Gagal membuat booking'
  } finally {
    bookingLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#f5f7fb] pb-16 pt-10">
    <div class="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
      <section class="space-y-6">
        <div class="rounded-3xl bg-white p-6 shadow-sm">
          <header class="mb-6">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-500">Detail Venue</p>
            <h1 class="text-2xl font-bold text-[#1f2a56]">
              {{ stadion?.name || bookingCart.stadionName }}
            </h1>
            <p v-if="stadion?.mapUrl" class="text-sm text-gray-500">
              <a :href="stadion.mapUrl" class="text-[#1f2a56] underline" target="_blank" rel="noopener">
                Lihat lokasi di peta
              </a>
            </p>
          </header>
          <div class="space-y-4">
            <article
              v-for="slot in orderSlots"
              :key="slot.key"
              class="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3"
            >
              <div>
                <p class="text-sm font-semibold text-[#1f2a56]">{{ slot.courtName }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDateLong(slot.dateKey, slot.dateLabel) }} • {{ slot.range }}
                </p>
                <p class="text-base font-semibold text-[#1f2a56]">
                  Rp{{ slot.price.toLocaleString('id-ID') }}
                </p>
              </div>
              <button class="text-red-500 hover:text-red-700" @click="removeSlot(slot.key)">
                <span class="sr-only">Hapus slot</span>
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M10 11v6m4-6v6M9 7l.867-1.8A1 1 0 0 1 10.79 5h2.42a1 1 0 0 1 .923.2L15 7" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 7v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" />
                </svg>
              </button>
            </article>
          </div>
          <button class="mt-4 text-sm font-semibold text-[#1f2a56] hover:underline" @click="addMore">
            Tambah Jadwal
          </button>
        </div>
      </section>

      <aside class="space-y-4">
        <div class="rounded-3xl bg-white p-4 shadow-sm">
          <p class="mb-3 font-semibold text-[#1f2a56]">Data Pemesan</p>
          <div class="space-y-3 text-sm">
            <label class="block">
              <span class="text-gray-600">Nama Lengkap</span>
              <input
                v-model="customerName"
                type="text"
                class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#1f2a56] focus:outline-none focus:ring-2 focus:ring-[#1f2a56]/20"
              />
            </label>
            <label class="block">
              <span class="text-gray-600">Kontak</span>
              <input
                v-model="customerContact"
                type="text"
                class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#1f2a56] focus:outline-none focus:ring-2 focus:ring-[#1f2a56]/20"
              />
            </label>
            <label class="block">
              <span class="text-gray-600">Email</span>
              <input
                v-model="customerEmail"
                type="email"
                class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#1f2a56] focus:outline-none focus:ring-2 focus:ring-[#1f2a56]/20"
              />
            </label>
            <label class="block">
              <span class="text-gray-600">Instansi (opsional)</span>
              <input
                v-model="customerInstitution"
                type="text"
                class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#1f2a56] focus:outline-none focus:ring-2 focus:ring-[#1f2a56]/20"
              />
            </label>
            <label class="inline-flex items-center gap-2 text-gray-600">
              <input v-model="customerAcademic" type="checkbox" class="rounded border-gray-300 text-[#1f2a56] focus:ring-[#1f2a56]" />
              Pemesan berasal dari unit akademik
            </label>
            <label v-if="customerAcademic" class="block">
              <span class="text-gray-600">URL Surat Pengantar</span>
              <input
                v-model="customerSuratUrl"
                type="url"
                placeholder="https://contoh.com/surat.pdf"
                class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-[#1f2a56] focus:outline-none focus:ring-2 focus:ring-[#1f2a56]/20"
              />
            </label>
          </div>
        </div>

        <div v-if="bookingError" class="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {{ bookingError }}
        </div>
        <div v-else-if="bookingSuccess" class="rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {{ bookingSuccess }}
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="font-semibold text-[#1f2a56]">Gunakan Voucher</p>
            <span class="text-gray-400">+</span>
          </div>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm">
          <p class="mb-3 font-semibold text-[#1f2a56]">Rincian Biaya</p>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center justify-between">
              <span>Biaya Sewa</span>
              <span>Rp{{ totalPrice.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Biaya Tambahan</span>
              <span>Rp0</span>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm font-semibold text-[#1f2a56]">
            <span>Total Bayar</span>
            <span>Rp{{ totalPrice.toLocaleString('id-ID') }}</span>
          </div>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm">
          <p class="mb-2 font-semibold text-[#1f2a56]">Atur Pembayaran</p>
          <p class="text-sm text-gray-600">Bayar Lunas</p>
          <p class="text-base font-bold text-[#1f2a56]">Rp{{ totalPrice.toLocaleString('id-ID') }}</p>
        </div>

        <div class="rounded-3xl bg-white p-4 shadow-sm">
          <p class="font-semibold text-[#1f2a56]">Kebijakan Reschedule & Pembatalan</p>
          <p class="mt-1 text-sm text-gray-500">Hubungi admin untuk informasi lebih lanjut.</p>
        </div>

        <button
          class="w-full rounded-xl bg-[#1f2a56] py-3 text-sm font-semibold text-white shadow hover:bg-[#162347] disabled:cursor-not-allowed disabled:bg-gray-400"
          @click="createBooking"
          :disabled="pending || !orderSlots.length || bookingLoading"
        >
          {{ bookingLoading ? 'Memproses...' : 'Buat Booking' }}
        </button>
      </aside>
    </div>
  </main>
</template>
