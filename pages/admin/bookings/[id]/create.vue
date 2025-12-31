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

  // if (bookingForm.isAcademic && !bookingForm.suratFile) {
  //   errorMsg.value = 'Upload surat pengantar (PDF) diperlukan untuk booking akademik.'
  //   return
  // }

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
  const vars = {
    name: bookingForm.name,
    contact: bookingForm.contact,
    email: bookingForm.email,
    institution: bookingForm.isAcademic ? bookingForm.institution : undefined,
    isAcademic: bookingForm.isAcademic,
    details,
    suratFile: null as File | null
  }

  if (bookingForm.suratFile) vars.suratFile = null

  const operations = {
    query: print(MUTATION_CREATE_BOOKING),
    variables: vars
  }

  try {
    if (bookingForm.suratFile) {
      const fd = new FormData()
      fd.append('operations', JSON.stringify(operations))
      const map = { '0': ['variables.suratFile'] }
      fd.append('map', JSON.stringify(map))
      fd.append('0', bookingForm.suratFile, bookingForm.suratFile.name)

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
      }).then((bookingCode) => {
        navigateTo(`/admin/bookings/${stadionId}/${bookingCode}`)
      })
    } else {
      const payload = {
        name: bookingForm.name,
        contact: bookingForm.contact,
        email: bookingForm.email,
        institution: bookingForm.isAcademic ? bookingForm.institution : undefined,
        isAcademic: bookingForm.isAcademic,
        details,
      }

      const resp = await $fetch('/api/bookings/create', {
        method: 'POST',
        body: payload,
        credentials: 'include',
      })

      const bookingCode = resp?.bookingCode || resp?.createBooking?.bookingCode
      if (!bookingCode) throw new Error('Server tidak mengembalikan booking code')
      navigateTo(`/admin/bookings/${stadionId}/${bookingCode}`)
    }
  } catch (e) {
    const err = e as Error
    errorMsg.value = err?.message || 'Gagal membuat booking.'
  } finally {
    uploadProgress.value = null
  }
}

watch(() => bookingForm.isAcademic, (val) => {
  if (!val) bookingForm.suratFile = null
})
</script>

<template>
  <section class="flex w-full flex-col gap-6 sm:gap-8 px-4 sm:px-6 pb-12 relative">
    
    <!-- HEADER -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 shrink-0 hidden sm:flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl uppercase font-bold text-gray-900 tracking-tight">Buat Booking Baru</h1>
          <p class="text-sm text-gray-500 mt-1">
            Lengkapi informasi pemesan untuk membuat booking lapangan olahraga.
          </p>
        </div>
      </div>
    </header>

    <!-- ERROR MESSAGE -->
    <div v-if="errorMsg" class="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex items-start gap-3 shadow-sm">
      <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      <div>
        <p class="font-bold text-sm">Terjadi Kesalahan</p>
        <p class="text-sm">{{ errorMsg }}</p>
      </div>
    </div>

    <form id="booking-form" @submit.prevent="handleSubmit" class="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      
      <!-- ===================== SELECTED SLOTS CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Slot yang Dipilih</h3>
            <p class="text-xs text-gray-500 mt-0.5">Review jadwal booking sebelum melanjutkan.</p>
          </div>
          
          <div class="p-6">
            <div v-if="selectedSlots.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-500 font-medium">Tidak ada slot yang dipilih</p>
              <p class="text-xs text-gray-400 mt-1">Silakan pilih slot terlebih dahulu</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="slot in selectedSlots" 
                :key="slot.fieldId + '-' + slot.startHour"
                class="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-bold text-gray-900 text-base">{{ slot.fieldName }}</p>
                    <div class="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="font-medium">{{ slot.date.split('T')[0] }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-1.5 text-sm text-gray-600">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="font-medium">{{ slot.startHour }}:00 - {{ slot.startHour + 1 }}:00</span>
                    </div>
                  </div>
                  <!-- HARGA DISEMBUNYIKAN SEMENTARA -->
                  <!-- <div class="text-right">
                    <p class="text-xs text-gray-500 uppercase tracking-wide font-bold">Harga</p>
                    <p class="text-lg font-bold text-blue-600 mt-1">Rp {{ slot.pricePerHour.toLocaleString('id-ID') }}</p>
                  </div> -->
                </div>
              </div>

              <!-- TOTAL PEMBAYARAN DISEMBUNYIKAN SEMENTARA -->
              <!-- <div class="mt-6 pt-6 border-t border-gray-200">
                <div class="flex justify-between items-center bg-blue-600 p-4 rounded-xl shadow-sm">
                  <span class="text-base font-bold text-white uppercase tracking-wide">Total Pembayaran</span>
                  <span class="text-2xl font-bold text-white">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== INFORMASI PEMESAN CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Informasi Pemesan</h3>
            <p class="text-xs text-gray-500 mt-0.5">Data kontak untuk konfirmasi booking.</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Lengkap <span class="text-red-500">*</span></label>
              <input 
                v-model="bookingForm.name" 
                type="text" 
                required 
                placeholder="Masukkan nama lengkap" 
                class="block w-full rounded-xl border border-gray-300 pl-4 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all" 
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nomor Kontak <span class="text-red-500">*</span></label>
              <input 
                v-model="bookingForm.contact" 
                type="text" 
                required 
                placeholder="Contoh: 081234567890" 
                class="block w-full rounded-xl border border-gray-300 pl-4 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all" 
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Alamat Email <span class="text-red-500">*</span></label>
              <input 
                v-model="bookingForm.email" 
                type="email" 
                required 
                placeholder="contoh@email.com" 
                class="block w-full rounded-xl border border-gray-300 pl-4 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all" 
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== BOOKING AKADEMIK CARD ===================== -->
      <div class="w-full">
        <div class="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-gray-200 bg-gray-50/50">
            <h3 class="text-base font-bold text-gray-900">Kategori Booking</h3>
            <p class="text-xs text-gray-500 mt-0.5">Pilih jenis booking untuk keperluan akademik atau umum.</p>
          </div>
          <div class="p-6 space-y-6">
            <div class="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <input 
                id="academic" 
                type="checkbox" 
                v-model="bookingForm.isAcademic"
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
              />
              <div class="flex-1">
                <label for="academic" class="block text-sm font-bold text-gray-900 cursor-pointer">
                  Booking untuk Keperluan Akademik
                </label>
                <p class="text-xs text-gray-600 mt-1">
                  Centang jika booking ini untuk kegiatan akademik (gratis biaya).
                </p>
              </div>
            </div>

            <div v-if="bookingForm.isAcademic" class="space-y-4 pl-4 border-l-4 border-blue-500">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Institusi <span class="text-red-500">*</span></label>
                <input 
                  v-model="bookingForm.institution" 
                  type="text" 
                  required 
                  placeholder="Contoh: Universitas Diponegoro" 
                  class="block w-full rounded-xl border border-gray-300 pl-4 pr-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all" 
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider">Upload Surat Pengantar (PDF)</label>
                <div class="relative">
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    @change="handleFileUpload"
                    class="block w-full text-sm text-gray-900 border border-gray-300 rounded-xl cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500 file:mr-4 file:py-3 file:px-4 file:rounded-l-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" 
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  💡 Format file harus PDF, maksimal 5MB.
                </p>
                
                <div v-if="uploadProgress !== null" class="mt-3 space-y-2">
                  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      :style="{ width: uploadProgress + '%' }" 
                      class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    ></div>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-600 font-medium">Mengunggah file...</span>
                    <span class="text-blue-600 font-bold">{{ uploadProgress }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4">
        <button
          type="button"
          @click="$router.back()"
          class="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all active:scale-95"
        >
          Batal
        </button>

        <button
          type="submit"
          :disabled="uploadProgress !== null"
          class="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <svg v-if="uploadProgress !== null" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ uploadProgress !== null ? 'Menyimpan...' : 'Buat Booking' }}</span>
        </button>
      </div>

    </form>
  </section>
</template>