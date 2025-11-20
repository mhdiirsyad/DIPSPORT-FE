<script setup lang="ts">
import { print } from 'graphql'
import { $fetch } from 'ofetch'
import { MUTATION_CREATE_BOOKING } from '~/graphql/mutations/create_booking'
definePageMeta({
  layout: 'admin',
  middleware: 'auth-admin'
})

const route = useRoute()
const stadionId = Number(route.params.id)
const selectedSlots = ref<any[]>([])
try {
  const raw = route.query.selections as string
  if (raw) selectedSlots.value = JSON.parse(decodeURIComponent(raw))
} catch {
  selectedSlots.value = []
}

const bookingForm = reactive({
  name: '',
  contact: '',
  email: '',
  isAcademic: false,
  institution: '',
  suratFile: null as File | null
})

const errorMsg = ref<string | null>(null)
const uploadProgress = ref<number | null>(null)

function handleFileUpload(e: Event){
  const input = e.target as HTMLInputElement
  bookingForm.suratFile = input.files?.[0] || null
}

const totalPrice = computed(() => {
  if(bookingForm.isAcademic) {
    return 0
  }

  return selectedSlots.value.reduce((sum, s) => sum + (s.pricePerHour || 0), 0)
})

async function handleSubmit(){
  errorMsg.value = null
  uploadProgress.value = null

  // Basic validations
  if (!bookingForm.name || !bookingForm.contact || !bookingForm.email) {
    errorMsg.value = 'Nama, kontak, dan email wajib diisi.'
    return
  }

  if (selectedSlots.value.length === 0) {
    errorMsg.value = 'Pilih minimal satu slot.'
    return
  }

  if (bookingForm.isAcademic && !bookingForm.institution) {
    errorMsg.value = 'Institusi harus diisi untuk booking akademik.'
    return
  }

  if (bookingForm.isAcademic && !bookingForm.suratFile) {
    errorMsg.value = 'Upload surat pengantar (PDF) diperlukan untuk booking akademik.'
    return
  }

  const details = selectedSlots.value.map((slot) => {
    const price = bookingForm.isAcademic ? 0 : (slot.pricePerHour || 0)
    return {
      fieldId: Number(slot.fieldId),
      bookingDate: slot.date,
      startHour: Number(slot.startHour),
      pricePerHour: price,
      subtotal: price,
    }
  })

  const operations = {
    query: print(MUTATION_CREATE_BOOKING),
    variables: {
      name: bookingForm.name,
      contact: bookingForm.contact,
      email: bookingForm.email,
      institution: bookingForm.isAcademic ? bookingForm.institution : null,
      isAcademic: bookingForm.isAcademic,
      details,
      suratFile: null,
    }
  }

  const map = { '0': ['variables.suratFile'] }

  const fd = new FormData()
  fd.append('operations', JSON.stringify(operations))
  fd.append('map', JSON.stringify(map))
  if (bookingForm.suratFile) fd.append('0', bookingForm.suratFile, bookingForm.suratFile.name)

  try {
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/bookings/create')
      xhr.withCredentials = true

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) uploadProgress.value = Math.round((ev.loaded / ev.total) * 100)
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText)
            const bookingCode = json?.bookingCode || json?.createBooking?.bookingCode
            if (!bookingCode) return reject(new Error('Server tidak mengembalikan booking code'))
            resolve(bookingCode)
          } catch (e) {
            reject(e)
          }
        } else {
          let msg = xhr.statusText || `HTTP ${xhr.status}`
          try { const body = JSON.parse(xhr.responseText); msg = body?.statusMessage || body?.error || msg } catch {}
          reject(new Error(msg))
        }
      }

      xhr.onerror = () => reject(new Error('Network error saat mengirim request'))
      xhr.send(fd)
    }).then((bookingCode: any) => {
      navigateTo(`/admin/bookings/${stadionId}/${bookingCode}`)
    })
  } catch (err: any) {
    errorMsg.value = err?.message || 'Gagal membuat booking.'
  } finally {
    uploadProgress.value = null
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold">Data Pemesan</h1>

    <div v-if="errorMsg" class="text-red-600 bg-red-50 p-3 rounded">{{ errorMsg }}</div>

    <!-- ===================== SELECTED SLOTS ===================== -->
    <section class="border rounded-xl p-4 bg-gray-50">
      <h2 class="font-semibold mb-3">Slot yang Dipilih</h2>

      <div v-if="selectedSlots.length === 0" class="text-sm text-gray-500">
        <h1>tidak ada slot yang dipilih</h1>
      </div>

      <div v-else class="space-y-2">
        <div 
          v-for="slot in selectedSlots" 
          :key="slot.fieldId + '-' + slot.startHour"
          class="p-3 rounded-lg bg-white border shadow-sm"
        >
          <p class="font-medium">{{ slot.fieldName }}</p>
          <p class="text-sm text-gray-600">
            {{ slot.date.split('T')[0] }} • {{ slot.startHour }}:00 - {{ slot.startHour + 1 }}:00
          </p>

          <p class="font-semibold mt-1">
            Rp {{ slot.pricePerHour.toLocaleString('id-ID') }}
          </p>
        </div>
      </div>

      <hr class="my-4" />

      <!-- TOTAL -->
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">Total</span>
        <span class="text-xl font-bold"
          >Rp {{ totalPrice.toLocaleString('id-ID') }}</span
        >
      </div>
    </section>

    <!-- ===================== FORM ===================== -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium">Nama</label>
        <input v-model="bookingForm.name" type="text" class="input" required />
      </div>

      <div>
        <label class="block text-sm font-medium">Kontak</label>
        <input v-model="bookingForm.contact" type="text" class="input" required />
      </div>

      <div>
        <label class="block text-sm font-medium">Email</label>
        <input v-model="bookingForm.email" type="email" class="input" required />
      </div>

      <div class="flex items-center gap-2">
        <input id="academic" type="checkbox" v-model="bookingForm.isAcademic" />
        <label for="academic">Booking Akademik? (harga jadi 0)</label>
      </div>

      <div v-if="bookingForm.isAcademic" class="space-y-3">
        <div>
          <label class="block text-sm font-medium">Institusi</label>
          <input v-model="bookingForm.institution" type="text" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium">Upload Surat (PDF)</label>
          <input type="file" accept="application/pdf" @change="handleFileUpload" />
          <div v-if="uploadProgress !== null" class="mt-2">
            <div class="w-full bg-gray-200 rounded h-2">
              <div :style="{ width: uploadProgress + '%' }" class="bg-blue-600 h-2 rounded"></div>
            </div>
            <div class="text-sm text-gray-600 mt-1">Uploading: {{ uploadProgress }}%</div>
          </div>
        </div>
      </div>

      <!-- SUBMIT -->
      <button
        type="submit"
        class="mt-6 w-full rounded-full bg-[#1f2a56] px-6 py-3 font-semibold text-white shadow hover:bg-[#162347]"
      >
        Buat Booking
      </button>
    </form>
  </main>
</template>


<style scoped>
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px 12px;
}
</style>
