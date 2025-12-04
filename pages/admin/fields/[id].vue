<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

interface StadionSelect {
  id: number
  name: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface FieldData {
  id: number
  name: string
  description: string | null
  pricePerHour: number
  stadionId: number
  status: 'ACTIVE' | 'INACTIVE'
  images?: { id: number; fieldId?: number; imageUrl: string }[]
}

interface FetchErrorData {
  data?: { statusMessage: string }
}

const router = useRouter()
const route = useRoute()
const fieldId = route.params.id as string

const form = ref({
  stadionId: 0,
  name: '',
  description: '',
  pricePerHour: 0,
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE', 
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const existingImages = ref<{ id: number; fieldId?: number; imageUrl: string }[]>([])
const removedImageIds = ref<number[]>([])
const selectedImages = ref<File[]>([])
const imagePreviews = ref<string[]>([])

const { data: stadions } = await useAsyncData(
  'stadionListForSelect',
  () => $fetch<StadionSelect[]>('/api/stadions')
)

const { data: field, error: fetchError, pending: pagePending } = await useAsyncData(
  `field-${fieldId}`,
  () => $fetch<FieldData>(`/api/fields/${fieldId}`)
)

if (field.value) {
  form.value.stadionId = field.value.stadionId
  form.value.name = field.value.name
  form.value.description = field.value.description || ''
  form.value.pricePerHour = field.value.pricePerHour
  form.value.status = field.value.status 
  existingImages.value = field.value.images ? [...field.value.images] : []
} else if (fetchError.value) {
  const typedError = fetchError.value as FetchErrorData
  errorMsg.value = typedError.data?.statusMessage || 'Gagal memuat data lapangan.'
}

const selectedStadion = computed(() => {
  if (!form.value.stadionId || !stadions.value) return null
  return stadions.value.find(s => s.id === form.value.stadionId)
})

function onStadionChange() {
  if (selectedStadion.value?.status === 'INACTIVE') {
    form.value.status = 'INACTIVE'
  }
}

function handleImageInput(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  const currentExisting = existingImages.value.length
  if (currentExisting + selectedImages.value.length + files.length > 10) {
    errorMsg.value = 'Maksimal 10 gambar per lapangan.'
    return
  }
  files.forEach((f) => {
    if (!f.type.startsWith('image/')) return
    selectedImages.value.push(f)
    const reader = new FileReader()
    reader.onload = () => imagePreviews.value.push(String(reader.result))
    reader.readAsDataURL(f)
  })
}

function removeNewImage(idx: number) {
  selectedImages.value.splice(idx, 1)
  imagePreviews.value.splice(idx, 1)
}

function markRemoveExisting(idx: number) {
  const item = existingImages.value[idx]
  if (!item) return
  removedImageIds.value.push(item.id)
  existingImages.value.splice(idx, 1)
}

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    const updated: any = await $fetch('/api/fields/update', {
      method: 'POST',
      body: {
        fieldId,
        ...form.value,
        stadionId: Number(form.value.stadionId),
        pricePerHour: Number(form.value.pricePerHour),
        description: form.value.description || undefined,
      },
    } as any) as any

    // delete removed images
    if (removedImageIds.value.length > 0) {
      await $fetch('/api/fields/delete-image', { method: 'POST', body: { imageIds: removedImageIds.value } } as any)
    }

    // upload new images
    if (selectedImages.value.length > 0 && updated?.id) {
      const operations = {
        query: `mutation($fieldId:Int!,$files:[Upload!]!){ uploadFieldImages(fieldId:$fieldId,files:$files){ count imageUrls } }`,
        variables: { fieldId: Number(updated.id), files: selectedImages.value.map(() => null) },
      }

      const map: Record<string, string[]> = {}
      selectedImages.value.forEach((_, i) => { map[String(i)] = [`variables.files.${i}`] })

      const fd = new FormData()
      fd.append('operations', JSON.stringify(operations))
      fd.append('map', JSON.stringify(map))
      selectedImages.value.forEach((file, i) => fd.append(String(i), file, file.name))

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/fields/upload')
        xhr.withCredentials = true
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) return resolve(null)
          try { const body = JSON.parse(xhr.responseText); return reject(new Error(body?.statusMessage || body?.error || xhr.statusText)) } catch(e){ return reject(new Error(xhr.statusText || `HTTP ${xhr.status}`)) }
        }
        xhr.onerror = () => reject(new Error('Network error saat mengupload gambar'))
        xhr.send(fd)
      })
    }

    await router.push('/admin/fields')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Edit Lapangan ID {{ fieldId }}
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Perbarui detail lapangan di bawah ini.
        </p>
      </div>

      <NuxtLink
        to="/admin/fields"
        class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Kembali</span>
      </NuxtLink>
    </header>

    <div v-if="pagePending" class="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
      <p class="text-gray-500">Loading data lapangan...</p>
    </div>

    <div v-else-if="!field" class="p-4 text-red-700 bg-red-100 rounded-lg">
      Error: Data lapangan tidak ditemukan. {{ errorMsg }}
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <div class="p-5 sm:p-8">
          <div
            v-if="errorMsg"
            class="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700"
          >
            {{ errorMsg }}
          </div>

          <div class="grid grid-cols-1 gap-8">
            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Stadion Induk <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.stadionId"
                required
                @change="onStadionChange"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              >
                <option value="" disabled>Pilih stadion</option>
                <option v-for="stadion in stadions" :key="stadion.id" :value="stadion.id">
                  {{ stadion.name }} (Status: {{ stadion.status }})
                </option>
              </select>
            </label>

            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lapangan <span class="text-red-500">*</span>
              </span>
              <input
                v-model="form.name"
                type="text"
                required
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Deskripsi
              </span>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Lapangan dengan permukaan lantai yang aman, dilengkapi dengan pencahayaan malam hari."
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors resize-none"
              />
            </label>

            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Harga per Jam <span class="text-red-500">*</span>
              </span>
              <input
                v-model.number="form.pricePerHour"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                required
                min="0"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              />
            </label>

            <label class="block mb-6">
              <span class="block text-sm font-medium text-gray-700 mb-1.5">
                Status <span class="text-red-500">*</span>
              </span>
              <select
                v-model="form.status"
                required
                :disabled="selectedStadion?.status === 'INACTIVE'"
                class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Non-Aktif</option>
              </select>
              <p v-if="selectedStadion?.status === 'INACTIVE'" class="mt-1.5 text-xs text-yellow-700">
                Stadion induk non-aktif, lapangan harus non-aktif.
              </p>
            </label>

            <!-- Images -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Gambar Lapangan</label>

              <p class="text-sm text-gray-500 mb-3">Hapus gambar lama atau tambahkan gambar baru (maks 10 total).</p>

              <div class="flex gap-3 flex-wrap mb-3">
                <div v-for="(img, idx) in existingImages" :key="img.id" class="relative w-32 h-20 rounded overflow-hidden border">
                  <img :src="img.imageUrl" class="w-full h-full object-cover" :alt="`Gambar ${idx+1}`" />
                  <button type="button" @click="markRemoveExisting(idx)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow">✕</button>
                </div>

                <div v-for="(p, i) in imagePreviews" :key="i" class="relative w-32 h-20 rounded overflow-hidden border">
                  <img :src="p" class="w-full h-full object-cover" :alt="`Preview ${i+1}`" />
                  <button type="button" @click="removeNewImage(i)" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow">✕</button>
                </div>
              </div>

              <div>
                <input type="file" accept="image/*" multiple @change="handleImageInput" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-start gap-3 bg-gray-50/80 px-6 py-5 sm:px-8">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75" />
            </svg>
            {{ loading ? 'Memperbarui...' : 'Perbarui Lapangan' }}
          </button>
          <NuxtLink
            to="/admin/fields"
            class="inline-flex items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
          >
            Batal
          </NuxtLink>
        </div>
      </form>
    </div>
  </section>
</template>