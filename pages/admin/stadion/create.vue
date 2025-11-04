<!-- Halaman form "Buat Stadion" -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
definePageMeta({
  middleware: 'auth-admin',
})

const router = useRouter()
const form = ref({
  name: '',
  description: '',
  mapUrl: 'https://maps.google.com/',
})
const loading = ref(false)
const errorMsg = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    await $fetch('/api/stadions/create', {
      method: 'POST',
      body: form.value,
    })
    await router.push('/admin/stadion')
  } catch (err: any) {
    errorMsg.value = err.data?.statusMessage || err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-4">Tambah Stadion Baru</h1>

    <form @submit.prevent="handleSubmit" class="max-w-lg space-y-4 bg-white p-6 rounded-lg shadow">
      
      <label class="block">
        <span class="text-gray-700">Nama Stadion</span>
        <input
          v-model="form.name"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Stadion Jatidiri"
        />
      </label>

      <label class="block">
        <span class="text-gray-700">Deskripsi</span>
        <textarea
          v-model="form.description"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
          placeholder="Stadion kebanggaan..."
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

      <p v-if="errorMsg" class="text-red-600 font-medium">
        Error: {{ errorMsg }}
      </p>

      <div class="flex gap-4 pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="ds-button-primary is-filled"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Stadion' }}
        </button>
        <NuxtLink
          to="/admin/stadion"
          class="ds-button-primary"
        >
          Batal
        </NuxtLink>
      </div>
    </form>
  </div>
</template>