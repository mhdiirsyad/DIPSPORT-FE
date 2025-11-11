<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

defineOptions({ name: 'AdminSchedules' })
definePageMeta({
  name: 'admin-schedules',
  layout: 'admin',
  middleware: 'auth-admin',
  ssr: false,
})

type OperatingHoursRecord = {
  id: number
  openHour: number
  closeHour: number
}

const FALLBACK_HOURS = { openHour: 8, closeHour: 22 }

const { data: operatingHours, pending, error, refresh } = await useAsyncData<OperatingHoursRecord | null>(
  'operating-hours',
  () => $fetch<OperatingHoursRecord | null>('/api/operating-hours')
)

const editing = ref(false)
const submitting = ref(false)
const submitError = ref<string | null>(null)
const formState = reactive({
  open: '',
  close: '',
})

const padHour = (hour: number) => String(hour).padStart(2, '0')

const toTimeInputValue = (hour?: number | null) => {
  if (typeof hour !== 'number' || Number.isNaN(hour)) return ''
  const bounded = Math.min(24, Math.max(0, hour))
  return `${padHour(bounded)}:00`
}

const displayHour = (hour?: number | null) => {
  if (typeof hour !== 'number' || Number.isNaN(hour)) return '-'
  const bounded = Math.min(24, Math.max(0, hour))
  return `${padHour(bounded)}:00 WIB`
}

const parseTimeInput = (value: string) => {
  if (!value) return null
  const [hoursPart] = value.split(':')
  const hour = Number(hoursPart)
  if (!Number.isInteger(hour)) return null
  return hour
}

const syncFormFromData = () => {
  const source = operatingHours.value ?? FALLBACK_HOURS
  formState.open = toTimeInputValue(source.openHour)
  formState.close = toTimeInputValue(source.closeHour)
}

watch(
  () => operatingHours.value,
  () => {
    if (!editing.value) {
      syncFormFromData()
    }
  },
  { immediate: true }
)

watch(editing, (isEditing) => {
  if (!isEditing) {
    submitError.value = null
    syncFormFromData()
  }
})

const hasExistingHours = computed(() => Boolean(operatingHours.value))

const startEditing = () => {
  editing.value = true
  submitError.value = null
  if (!formState.open || !formState.close) {
    syncFormFromData()
  }
}

const cancelEditing = () => {
  editing.value = false
}

const handleSubmit = async () => {
  if (!formState.open || !formState.close) {
    submitError.value = 'Jam buka dan jam tutup wajib diisi.'
    return
  }

  const openHour = parseTimeInput(formState.open)
  const closeHour = parseTimeInput(formState.close)

  if (openHour === null || closeHour === null) {
    submitError.value = 'Format jam tidak valid.'
    return
  }

  if (openHour < 0 || openHour > 23) {
    submitError.value = 'Jam buka harus antara 0 dan 23.'
    return
  }

  if (closeHour < 1 || closeHour > 24) {
    submitError.value = 'Jam tutup harus antara 1 dan 24.'
    return
  }

  if (closeHour <= openHour) {
    submitError.value = 'Jam tutup harus lebih besar daripada jam buka.'
    return
  }

  submitting.value = true
  submitError.value = null

  try {
    const updated = await $fetch<OperatingHoursRecord>('/api/operating-hours/update', {
      method: 'POST',
      body: {
        openHour,
        closeHour,
      },
    })
    operatingHours.value = updated
    editing.value = false
  } catch (err: any) {
    submitError.value = err?.data?.statusMessage || err?.message || 'Gagal menyimpan jam operasional.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-ds-blue-600">
          Jam Operasional
        </p>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Pengaturan Jadwal Operasional
        </h1>
      </div>
      <button
        type="button"
        class="ds-button-primary whitespace-nowrap"
        :disabled="pending || Boolean(error)"
        @click="startEditing"
      >
        {{ hasExistingHours ? 'Ubah Jadwal' : 'Set Jadwal' }}
      </button>
    </header>

    <div v-if="pending" class="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
      Memuat jam operasional terbaru...
    </div>

    <div
      v-else-if="error"
      class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
    >
      <p class="font-semibold">
        Gagal memuat data: {{ error.message }}
      </p>
      <button class="mt-3 font-semibold underline" @click="refresh">
        Coba lagi
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p class="text-sm font-medium text-gray-500">Jam Buka</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ displayHour(operatingHours?.openHour) }}
            </p>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-500">Jam Tutup</p>
            <p class="mt-1 text-xl font-semibold text-gray-900">
              {{ displayHour(operatingHours?.closeHour) }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="editing"
        class="rounded-xl border border-ds-border bg-white p-6 shadow-ds-lg transition-all"
      >
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-1 text-sm font-medium text-ds-text">
              Jam Buka (WIB)
              <select
                v-model="formState.open"
                class="h-11 rounded-md border border-ds-border px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
                required
                :disabled="submitting"
              >
                <option value="" disabled>Pilih jam buka</option>
                <option v-for="hour in 24" :key="`open-${hour-1}`" :value="toTimeInputValue(hour - 1)">
                  {{ padHour(hour - 1) }}:00
                </option>
              </select>
            </label>
            <label class="grid gap-1 text-sm font-medium text-ds-text">
              Jam Tutup (WIB)
              <select
                v-model="formState.close"
                class="h-11 rounded-md border border-ds-border px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
                required
                :disabled="submitting"
              >
                <option value="" disabled>Pilih jam tutup</option>
                <option v-for="hour in 24" :key="`close-${hour}`" :value="toTimeInputValue(hour)">
                  {{ padHour(hour) }}:00
                </option>
              </select>
            </label>
          </div>

          <p v-if="submitError" class="text-sm font-semibold text-red-600">
            {{ submitError }}
          </p>

          <div class="flex items-center justify-end gap-3">
            <button
              type="button"
              class="text-sm font-semibold text-ds-muted hover:text-ds-text"
              :disabled="submitting"
              @click="cancelEditing"
            >
              Batal
            </button>
            <button
              type="submit"
              class="inline-flex h-11 items-center justify-center rounded-md bg-ds-blue-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-ds-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="submitting"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
