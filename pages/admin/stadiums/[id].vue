<!-- Halaman form "Edit Stadion" -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

interface StadionData {
  id: number;
  name: string;
  description: string | null;
  mapUrl: string;
}
interface FetchErrorData {
  data?: {
    statusMessage: string;
  };
}

const router = useRouter()
const route = useRoute()
const stadionId = route.params.id as string

const form = ref({
  name: '',
  description: '',
  mapUrl: '',
})
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const { data: stadion, error: fetchError, pending: pagePending } = await useAsyncData(
  `stadion-${stadionId}`,
  () => $fetch<StadionData>(`/api/stadions/${stadionId}`)
)

if (stadion.value) {
  form.value.name = stadion.value.name
  form.value.description = stadion.value.description || ''
  form.value.mapUrl = stadion.value.mapUrl
} else if (fetchError.value) {
  const typedError = fetchError.value as FetchErrorData
  errorMsg.value = typedError.data?.statusMessage || "Gagal memuat data stadion."
}

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null
  try {
    await $fetch('/api/stadions/update', {
      method: 'POST',
      body: {
        stadionId: stadionId,
        ...form.value
      },
    })

    await router.push('/admin/stadiums')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Edit Stadion #{{ stadionId }}</h1>

    <div v-if="pagePending" class="py-10 text-center">
      <p>Loading data stadion...</p>
    </div>

    <div v-else-if="!stadion" class="p-4 text-red-700 bg-red-100 rounded-lg">
      Error: Data stadion tidak ditemukan. {{ errorMsg }}
    </div>

    <form v-else @submit.prevent="handleSubmit" class="max-w-lg space-y-4 bg-white p-6 rounded-lg shadow">
      
      <label class="block">
        <span class="text-gray-700">Nama Stadion</span>
        <input
          v-model="form.name"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </label>

      <label class="block">
        <span class="text-gray-700">Deskripsi</span>
        <textarea
          v-model="form.description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </label>

      <label class="block">
        <span class="text-gray-700">URL Google Maps</span>
        <input
          v-model="form.mapUrl"
          type="url"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </label>
      
      <p v-if="errorMsg && !pagePending" class="text-red-600 font-medium">
        Error: {{ errorMsg }}
      </p>
      
      <div class="flex gap-4 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="ds-button-primary is-filled"
        >
          {{ loading ? 'Memperbarui...' : 'Perbarui Stadion' }}
        </button>
        <NuxtLink
          to="/admin/stadiums"
          class="ds-button-primary"
        >
          Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>