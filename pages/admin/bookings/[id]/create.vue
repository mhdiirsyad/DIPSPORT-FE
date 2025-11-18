<script setup lang="ts">
import { $fetch } from 'ofetch'
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

const form = reactive({
  name: '',
  contact: '',
  email: '',
  isAcademic: false,
  institution: '',
  suratFile: null as File | null
})

const errorMsg = ref<string | null>(null)

function handleFileUpload(e: Event){
  const input = e.target as HTMLInputElement
  form.suratFile = input.files?.[0] || null
}

const totalPrice = computed(() => {
  if(form.isAcademic) {
    return 0
  }

  return selectedSlots.value.reduce((sum, s) => sum + (s.pricePerHour || 0), 0)
})

async function handleSubmit(){
  const formData = new FormData()
  
  Object.entries(form).forEach(([key, value]) => {
    if(value !== null || value !== undefined && key !== 'suratFile') {
      formData.append(key, String(value))
    }
  })

  if(form.suratFile) {
    formData.append('suratFile', form.suratFile)
  }

  formData.append('selelctions', JSON.stringify(selectedSlots.value))

  try {
    const response = await $fetch('/api/bookings/create', {
      method: 'POST',
      body: formData
    })

    // if (form.isAcademic && form.suratFile) {
    //   const uploadUrl = `/api/bookings/${response.createBooking.bookingCode}/upload`
    //   const uploadForm = new FormData()
    //   uploadForm.append('file', form.suratFile)
    //   await $fetch(uploadUrl, {
    //     method: 'POST',
    //     body: uploadForm
    //   })
    // }
    navigateTo(`/admin/bookings/${stadionId}/${response.createBooking.bookingCode}`)
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message || 'Gagal membuat booking.'
  }
}
</script>

<template>
  <main class="max-w-3xl mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold">Data Pemesan</h1>

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
        <input v-model="form.name" type="text" class="input" required />
      </div>

      <div>
        <label class="block text-sm font-medium">Kontak</label>
        <input v-model="form.contact" type="text" class="input" required />
      </div>

      <div>
        <label class="block text-sm font-medium">Email</label>
        <input v-model="form.email" type="email" class="input" required />
      </div>

      <div class="flex items-center gap-2">
        <input id="academic" type="checkbox" v-model="form.isAcademic" />
        <label for="academic">Booking Akademik? (harga jadi 0)</label>
      </div>

      <div v-if="form.isAcademic" class="space-y-3">
        <div>
          <label class="block text-sm font-medium">Institusi</label>
          <input v-model="form.institution" type="text" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium">Upload Surat (PDF)</label>
          <input type="file" accept="application/pdf" @change="handleFileUpload" />
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
