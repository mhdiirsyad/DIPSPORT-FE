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

async function setBookingStatus(newStatus: string) {
  if (!booking.value) return
  // Only allow status change when payment is PAID
  if (booking.value.paymentStatus !== 'PAID') {
    alert('Booking hanya bisa diubah setelah pembayaran status PAID')
    return
  }
  // Disallow changing after accepted or rejected
  const locked = ['APPROVED', 'CANCELLED']
  if (locked.includes(booking.value.status)) {
    alert('Status booking sudah final dan tidak bisa diubah')
    return
  }

  if (updating.value) return
  updating.value = true
  try {
    const res = await $fetch(`/api/bookings/${booking.value.bookingCode}/status`, {
      method: 'POST',
      body: { bookingStatus: newStatus }
    })

    if (res?.errors) throw new Error(res.errors[0]?.message || 'Failed to update booking status')
    await refresh()
  } catch (e: any) {
    alert(e?.message || 'Gagal mengubah status booking')
  } finally {
    updating.value = false
  }
}
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
          <p v-if="booking.institution" class="text-sm text-gray-600">Instansi: {{ booking.institution }}</p>

          <div v-if="booking.suratUrl" class="mt-3">
            <h3 class="font-medium text-gray-700">Surat Pengantar</h3>
            <div class="flex items-center gap-3 mt-2">
              <a
                :href="booking.suratUrl"
                target="_blank"
                rel="noopener"
                class="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Lihat
              </a>

              <a
                :href="booking.suratUrl"
                :download="booking.suratUrl"
                class="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm border"
              >
                Unduh
              </a>
            </div>

            <div class="mt-4">
              <iframe
                v-if="isPdf(booking.suratUrl)"
                :src="booking.suratUrl"
                class="w-full h-80 border"
              />
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 items-center">
          <div>
            <h3 class="font-medium text-gray-700">Status Pembayaran</h3>
            <p class="text-sm text-gray-600">{{ booking.paymentStatus }}</p>
          </div>
          <!-- <div class="ml-auto">
            <button
              v-if="booking.paymentStatus !== 'PAID'"
              @click.prevent="markAsPaid"
              :disabled="updating"
              class="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Tandai Lunas (PAID)
            </button>
          </div> -->
        </div>

        <!-- <div class="flex gap-3 items-center pt-3">
          <div>
            <h3 class="font-medium text-gray-700">Aksi Booking</h3>
            <p class="text-sm text-gray-600">Status: {{ booking.status }}</p>
          </div>
          <div v-if="booking.status=='PENDING'" class="ml-auto flex gap-2">
            <button
              @click.prevent="setBookingStatus('APPROVED')"
              :disabled="booking.paymentStatus !== 'PAID' || updating"
              class="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              Terima
            </button>
            <button
              @click.prevent="setBookingStatus('CANCELLED')"
              :disabled="booking.paymentStatus !== 'PAID' || updating"
              class="px-3 py-1 bg-red-600 text-white rounded text-sm disabled:opacity-50"
            >
              Tolak
            </button>
          </div>
        </div> -->

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