<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})

const router = useRouter()
const toast = useToast()

const form = ref({
  name: '',
  description: '',
  mapUrl: 'https://maps.google.com/',
})
const files = ref<File[]>([])
const loading = ref(false)
const errorMsg = ref<string | null>(null)

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    files.value = Array.from(input.files)
  }
}

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null

  try {
    // Step 1: create stadion
    const stadion = await $fetch('/api/stadions/create', {
      method: 'POST',
      body: form.value,
    })

    toast.add({ title: 'Stadion berhasil dibuat', color: 'success' })
    // useToast({ title: 'Stadion berhasil dibuat', color: 'green'})

    // Step 2: upload images jika ada
    if (files.value.length > 0) {
      const token = useCookie('admin_token').value
      const formData = new FormData()
      formData.append('operations', JSON.stringify({
        query: `
          mutation($stadionId: Int!, $files: [Upload!]!) {
            uploadStadionImages(stadionId: $stadionId, files: $files) {
              count
              imageUrls
            }
          }`,
        variables: { stadionId: stadion.id, files: Array(files.value.length).fill(null) },
      }))
      formData.append('map', JSON.stringify(
        Object.fromEntries(files.value.map((_, i) => [`${i}`, [`variables.files.${i}`]]))
      ))
      files.value.forEach((file, i) => formData.append(`${i}`, file))

      await fetch(`${process.env.GQL_HTTP_ENDPOINT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      toast.add({ title: 'Gambar stadion berhasil diupload', color: 'success' })
    }

    await router.push('/admin/stadiums')
  } catch (err: any) {
    console.error(err)
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
        <UInput
          v-model="form.name"
          placeholder="Stadion Diponegoro"
          required
        />
      </label>

      <label class="block">
        <span class="text-gray-700">Deskripsi</span>
        <UTextarea
          v-model="form.description"
          placeholder="Stadion dengan fasilitas yang lengkap..."
          :rows="3"
        />
      </label>

      <label class="block">
        <span class="text-gray-700">URL Google Maps</span>
        <UInput
          v-model="form.mapUrl"
          type="url"
          required
        />
      </label>

      <div>
        <span class="text-gray-700">Gambar Stadion</span>
        <UInput
          type="file"
          multiple
          accept="image/*"
          class="mt-1"
          @change="handleFileChange"
        />
        <div class="flex flex-wrap mt-2">
          <!-- <img
            v-for="(file, index) in files"
            :key="index"
            :src="file"
            class="h-20 w-20 object-cover rounded-md border"
          /> -->
        </div>
      </div>

      <p v-if="errorMsg" class="text-red-600 font-medium">
        Error: {{ errorMsg }}
      </p>

      <div class="flex gap-4 pt-2">
        <UButton type="submit" :loading="loading" color="primary">
          {{ loading ? 'Menyimpan...' : 'Simpan Stadion' }}
        </UButton>
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
