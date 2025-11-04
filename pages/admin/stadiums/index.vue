<!-- Halaman tabel "Daftar Stadion" -->
<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

interface StadionRow {
  id: number;
  name: string;
  _count?: {
    fields: number;
  };
}

const { data: stadions, pending, error, refresh } = await useAsyncData(
  'stadionsList',
  () => $fetch<StadionRow[]>('/api/stadions')
)

const loadingDelete = ref(false)
const errorMsg = ref<string | null>(null)

async function handleDelete(id: number) {
  if (confirm('Anda yakin ingin menghapus stadion ini? Ini akan menghapus semua data terkait.')) {
    loadingDelete.value = true
    errorMsg.value = null
    try {
      await $fetch('/api/stadions/delete', {
        method: 'POST',
        body: { stadionId: id }
      })
      await refresh()
    } catch (err: any) {
      errorMsg.value = err.data?.statusMessage || err.message
    } finally {
      loadingDelete.value = false
    }
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Manajemen Stadion</h1>
      <NuxtLink
        to="/admin/stadiums/create"
        class="ds-button-primary is-filled"
      >
        + Tambah Stadion
      </NuxtLink>
    </div>

    <div v-if="errorMsg" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      Error: {{ errorMsg }}
    </div>

    <div v-if="pending" class="text-center py-10">
      <p>Loading data stadion...</p>
    </div>

    <div v-else-if="error" class="text-center py-10 text-red-600">
      <p>Gagal memuat data: {{ error.message }}</p>
      <button @click="refresh()" class="ds-button-primary mt-2">Coba lagi</button>
    </div>
    
    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="stadions && stadions.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              Belum ada data stadion.
            </td>
          </tr>
          <tr v-for="stadion in stadions" :key="stadion.id">
            <td class="px-6 py-4">{{ stadion.id }}</td>
            <td class="px-6 py-4 font-medium">{{ stadion.name }}</td>
            <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
              <NuxtLink 
                :to="`/admin/stadion/${stadion.id}`" 
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </NuxtLink>
              <button 
                @click="handleDelete(stadion.id)" 
                :disabled="loadingDelete" 
                class="text-red-600 hover:text-red-900 disabled:opacity-50"
              >
                {{ loadingDelete ? 'Menghapus...' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>