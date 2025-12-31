<script setup lang="ts">
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

const confirmationModal = ref<any>(null)

interface Field {
  name: string
}

interface BookingDetail {
  fieldId: number
  bookingDate: string,
  startHour: number,
  subtotal: number,
  Field: Field
}

interface BookingResult {
  bookingCode: string
  name: string
  contact: string
  email: string
  institution?: string
  suratUrl?: string
  isAcademic: boolean
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
  details: BookingDetail[]
}

const route = useRoute()
const bookingCode = route.params.bookingCode

const { data: booking, pending, error, refresh } = await useAsyncData(
  `booking-${bookingCode}`,
  () => $fetch<BookingResult>(`/api/bookings/${bookingCode}`)
)

const isPdf = (url?: string) => {
  return !!url && url.toLowerCase().endsWith('.pdf')
}

const updating = ref(false)

async function markAsPaid() {
  if (!booking.value) return
  if (booking.value.paymentStatus === 'PAID') return
  if (updating.value) return
  updating.value = true
  try {
    const res = await $fetch(`/api/bookings/${booking.value.bookingCode}/payment`, {
      method: 'POST',
      body: { paymentStatus: 'PAID' }
    })

    if (res?.errors) throw new Error(res.errors[0]?.message || 'Failed to update payment status')
    await refresh()
  } catch (e: any) {
    alert(e?.message || 'Gagal mengubah status pembayaran')
  } finally {
    updating.value = false
  }
}

async function cancelBooking() {
  if (!booking.value) return
  if (booking.value.status === 'CANCELLED') {
    alert('Booking sudah dibatalkan')
    return
  }
  
  const confirmed = await confirmationModal.value?.open({
    title: 'Batalkan Booking',
    message: `Apakah Anda yakin ingin membatalkan booking dengan kode ${booking.value.bookingCode}? Tindakan ini tidak dapat dibatalkan.`,
    confirmText: 'Ya, Batalkan',
    cancelText: 'Tidak, Kembali',
    type: 'danger'
  })
  
  if (!confirmed) return

  if (updating.value) return
  updating.value = true
  try {
    const res = await $fetch(`/api/bookings/${booking.value.bookingCode}/status`, {
      method: 'POST',
      body: { bookingStatus: 'CANCELLED' }
    })

    if (res?.errors) throw new Error(res.errors[0]?.message || 'Failed to update booking status')
    await refresh()
  } catch (e: any) {
    alert(e?.message || 'Gagal membatalkan booking')
  } finally {
    updating.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-6 sm:gap-8 px-4 sm:px-6 pb-12 relative">
    
    <!-- HEADER -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 shrink-0 hidden sm:flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl uppercase font-bold text-gray-900 tracking-tight">Detail Booking</h1>
          <p class="text-sm text-gray-500 mt-1" v-if="booking">
            Kode: <span class="font-mono font-bold text-gray-700">{{ booking.bookingCode }}</span>
          </p>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-3">
        <NuxtLink
          :to="`/admin/bookings/${route.params.id}`"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all active:scale-95 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </NuxtLink>

        <!-- TOMBOL TANDAI LUNAS DISEMBUNYIKAN SEMENTARA -->
        <!-- <button
          v-if="booking && booking.paymentStatus !== 'PAID'"
          @click="markAsPaid"
          :disabled="updating"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg v-if="updating" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ updating ? 'Memproses...' : 'Tandai Lunas' }}</span>
        </button> -->
      </div>
    </header>

    <!-- LOADING STATE -->
    <div v-if="pending" class="p-12 text-center rounded-2xl border border-gray-300 bg-white">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
      <p class="text-sm text-gray-500 font-medium">Memuat detail booking...</p>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="p-8 text-center rounded-2xl border border-red-200 bg-red-50 text-red-700">
      <svg class="w-12 h-12 mx-auto mb-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="font-bold mb-2">Terjadi Kesalahan</p>
      <p class="text-sm">{{ error.message }}</p>
      <NuxtLink :to="`/admin/bookings/${route.params.id}`" class="mt-4 inline-block underline hover:no-underline">
        Kembali ke daftar
      </NuxtLink>
    </div>

    <!-- CONTENT -->
    <div v-else-if="booking" class="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      
      <!-- ===================== INFORMASI PEMESAN CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Informasi Pemesan</h3>
            <p class="text-xs text-gray-500 mt-0.5">Data kontak dan institusi pemesan.</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</p>
                <p class="text-sm font-medium text-gray-900">{{ booking.name }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</p>
                <p class="text-sm font-medium text-gray-900">{{ booking.email }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor Kontak</p>
                <p class="text-sm font-medium text-gray-900">{{ booking.contact }}</p>
              </div>
              <div class="space-y-1" v-if="booking.institution">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Institusi</p>
                <p class="text-sm font-medium text-gray-900">{{ booking.institution }}</p>
              </div>
            </div>

            <div v-if="booking.isAcademic" class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span class="text-sm font-bold text-blue-900">Booking Akademik</span>
            </div>

            <!-- SURAT PENGANTAR -->
            <div v-if="booking.suratUrl" class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Surat Pengantar</h4>
              <div class="flex items-center gap-3">
                <a
                  :href="booking.suratUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat
                </a>
              </div>

              <!-- PDF PREVIEW -->
              <div v-if="isPdf(booking.suratUrl)" class="mt-4">
                <iframe
                  :src="booking.suratUrl"
                  class="w-full h-96 border border-gray-300 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== STATUS CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Status Booking</h3>
            <p class="text-xs text-gray-500 mt-0.5">Informasi status persetujuan booking.</p>
          </div>
          <div class="p-6">
            <!-- STATUS PEMBAYARAN DISEMBUNYIKAN SEMENTARA -->
            <!-- <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl border" :class="booking.paymentStatus === 'PAID' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'">
                <p class="text-xs font-bold uppercase tracking-wider mb-2" :class="booking.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'">Status Pembayaran</p>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :class="booking.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-amber-500'"></div>
                  <p class="text-lg font-bold" :class="booking.paymentStatus === 'PAID' ? 'text-green-900' : 'text-amber-900'">
                    {{ booking.paymentStatus === 'PAID' ? 'Lunas' : booking.paymentStatus }}
                  </p>
                </div>
              </div>
            </div> -->

            <div class="p-4 rounded-xl border" :class="booking.status === 'APPROVED' ? 'bg-green-50 border-green-200' : booking.status === 'CANCELLED' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'">
              <p class="text-xs font-bold uppercase tracking-wider mb-2" :class="booking.status === 'APPROVED' ? 'text-green-700' : booking.status === 'CANCELLED' ? 'text-red-700' : 'text-blue-700'">Status Booking</p>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="booking.status === 'APPROVED' ? 'bg-green-500' : booking.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'"></div>
                <p class="text-lg font-bold" :class="booking.status === 'APPROVED' ? 'text-green-900' : booking.status === 'CANCELLED' ? 'text-red-900' : 'text-blue-900'">
                  {{ booking.status }}
                </p>
              </div>
            </div>

            <!-- ACTION BUTTONS -->
            <div v-if="booking.status !== 'CANCELLED'" class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Tindakan</p>
              <div class="flex gap-3">
                <button
                  @click="cancelBooking"
                  :disabled="updating"
                  class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <svg v-if="updating" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>{{ updating ? 'Membatalkan...' : 'Batalkan Booking' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== RINCIAN LAPANGAN CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Rincian Lapangan</h3>
            <p class="text-xs text-gray-500 mt-0.5">Daftar lapangan dan jadwal yang dibooking.</p>
          </div>
          <div class="p-6">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Lapangan</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Tanggal</th>
                    <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-50">Jam</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(d, i) in booking.details" :key="i" class="hover:bg-gray-50 transition-colors">
                    <td class="px-4 py-3 font-medium text-gray-900">{{ d.Field.name }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ new Date(d.bookingDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ d.startHour }}:00 - {{ d.startHour + 1 }}:00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- METADATA -->
      <div class="w-full">
        <div class="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p class="text-xs text-gray-500">
            Dibuat pada: <span class="font-medium text-gray-700">{{ new Date(booking.createdAt).toLocaleString('id-ID') }}</span>
          </p>
        </div>
      </div>

      <!-- MOBILE ACTIONS -->
      <div class="sm:hidden flex flex-col gap-3">
        <!-- TOMBOL TANDAI LUNAS DISEMBUNYIKAN SEMENTARA -->
        <!-- <button
          v-if="booking.paymentStatus !== 'PAID'"
          @click="markAsPaid"
          :disabled="updating"
          class="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm active:bg-green-700 disabled:opacity-70"
        >
          <svg v-if="updating" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ updating ? 'Memproses...' : 'Tandai Lunas' }}</span>
        </button> -->

        <NuxtLink
          :to="`/admin/bookings/${route.params.id}`"
          class="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-sm font-bold text-gray-700 active:bg-gray-50"
        >
          Kembali
        </NuxtLink>
      </div>

    </div>
  </section>

  <ConfirmationModal ref="confirmationModal" />
</template>