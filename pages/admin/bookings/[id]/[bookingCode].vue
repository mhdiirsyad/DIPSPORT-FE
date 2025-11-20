<script setup lang="ts">
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})
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

const { data: booking, pending, error} = await useAsyncData(
  `booking-${bookingCode}`,
  () => $fetch<BookingResult>(`/api/bookings/${bookingCode}`)
)
</script>

<template>
  <main class="min-h-screen bg-gray-50 pb-16">
    <section v-if="pending" class="text-center py-20 text-gray-500">
      Memuat detail booking...
    </section>

    <section v-else-if="error" class="text-center py-20 text-red-600">
      Terjadi kesalahan: {{ error.message }}
    </section>

    <section v-else class="mx-auto max-w-4xl bg-white p-8 rounded-3xl shadow">
      <header class="flex justify-between items-center border-b pb-4 mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Detail Booking</h1>
        <NuxtLink
          :to="`/admin/bookings/${route.params.id}`"
          class="text-sm text-blue-600 hover:underline"
        >
          &larr; Kembali ke Stadion
        </NuxtLink>
      </header>

      <div v-if="booking" class="space-y-6">
        <div>
          <h2 class="font-semibold text-gray-800">Kode Booking</h2>
          <p class="text-lg font-mono text-gray-700">{{ booking.bookingCode }}</p>
        </div>

        <div>
          <h2 class="font-semibold text-gray-800">Informasi Pemesan</h2>
          <p>{{ booking.name }} ({{ booking.email }})</p>
        </div>

        <div>
          <h2 class="font-semibold text-gray-800">Status</h2>
          <p 
            class="text-sm font-semibold"
            :class="booking?.status === 'APPROVED' ? 'text-green-600' : 'text-amber-600'">
            {{ booking?.status }}
          </p>
        </div>

        <div>
          <h2 class="font-semibold text-gray-800 mb-2">Rincian Lapangan</h2>
          <table class="w-full border text-sm">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="border px-3 py-2 text-left">Lapangan</th>
                <th class="border px-3 py-2 text-left">Tanggal</th>
                <th class="border px-3 py-2 text-left">Jam</th>
                <th class="border px-3 py-2 text-right">Harga/Jam</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(d, i) in booking?.details" :key="i">
                <td class="border px-3 py-2">{{ d.Field.name }}</td>
                <td class="border px-3 py-2">{{ new Date(d.bookingDate).toLocaleDateString('id-ID') }}</td>
                <td class="border px-3 py-2">{{ d.startHour }}:00 - {{ d.startHour+1 }}:00</td>
                <td class="border px-3 py-2 text-right">
                  Rp {{ d.subtotal.toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pt-4 border-t">
          <h2 class="font-semibold text-gray-800">Total Pembayaran</h2>
          <p class="text-xl font-bold text-gray-900">
            Rp {{ booking?.totalPrice?.toLocaleString('id-ID') }}
          </p>
        </div>
      </div>
    </section>
  </main>
</template>