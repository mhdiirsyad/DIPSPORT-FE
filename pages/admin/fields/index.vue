<script setup lang="ts">
import { ref } from 'vue'
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin',
})

// Tipe data yang kita harapkan
interface FieldRow {
  id: number;
  name: string;
  pricePerHour: number;
  stadion: {
    id: number;
    name: string;
  }
}

// Ambil data dari "Jembatan"
const { data: fields, pending, error, refresh } = await useAsyncData(
  'fieldsList',
  () => $fetch<FieldRow[]>('/api/fields/index')
)

const loadingDelete = ref(false)
const errorMsg = ref<string | null>(null)

// Fungsi Delete
async function handleDelete(id: number) {
  if (confirm('Anda yakin ingin menghapus lapangan ini?')) {
    loadingDelete.value = true
    errorMsg.value = null
    try {
      await $fetch('/api/fields/delete', {
        method: 'POST',
        body: { fieldId: id }
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
  <section class="flex w-full flex-col gap-7">
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Manajemen Lapangan
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Tambah, edit, atau hapus data lapangan di semua stadion.
        </p>
      </div>
      <NuxtLink
        to="/admin/fields/create"
        class="ds-button-primary"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5V19M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>Tambah Lapangan</span>
      </NuxtLink>
    </header>

    <div v-if="errorMsg" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      Error: {{ errorMsg }}
    </div>

    <div v-if="pending" class="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
      <p class="text-gray-500">Loading data lapangan...</p>
    </div>

    <div v-else-if="error" class="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200 text-red-600">
      <p>Gagal memuat data: {{ error.message }}</p>
      <button @click="refresh()" class="ds-button-primary mt-4">Coba lagi</button>
    </div>

    <div v-else-if="fields && fields.length === 0" class="bg-white shadow-sm border border-gray-200 rounded-xl p-12 text-center">
      <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada data lapangan</h3>
      <p class="mt-1 text-sm text-gray-500">Silakan buat lapangan baru untuk memulai.</p>
    </div>

    <div v-else class="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Lapangan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stadion Induk
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Harga/Jam
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="field in fields" :key="field.id" class="transition-colors hover:bg-blue-50/50 cursor-pointer" @click="navigateTo(`/admin/fields/${field.id}`)">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ field.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-600">{{ field.stadion?.name || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Rp {{ field.pricePerHour.toLocaleString('id-ID') }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <NuxtLink 
                  :to="`/admin/fields/${field.id}`" 
                  @click.stop
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Edit
                </NuxtLink>
                <button 
                  @click.stop="handleDelete(field.id)" 
                  :disabled="loadingDelete" 
                  class="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ loadingDelete ? '...' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>