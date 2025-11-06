<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue'

defineOptions({ name: 'AdminSchedules' })
definePageMeta({
  name: 'admin-schedules',
  layout: 'admin',
  middleware: 'auth-admin',
  ssr: false,
})

type DayCode =
  | 'SENIN'
  | 'SELASA'
  | 'RABU'
  | 'KAMIS'
  | 'JUMAT'
  | 'SABTU'
  | 'MINGGU'

type OperatingHourRecord = {
  id: number
  stadionId: number
  stadionName: string
  stadionMapUrl: string | null
  day: DayCode
  openTime: string
  closeTime: string
}

type GraphqlOperatingHour = {
  id: number
  day: string
  openTime: string
  closeTime: string
  stadionId: number
  Stadion: { id: number; name: string; mapUrl: string | null } | null
}

const DAY_LABELS: Record<DayCode, string> = {
  SENIN: 'Senin',
  SELASA: 'Selasa',
  RABU: 'Rabu',
  KAMIS: 'Kamis',
  JUMAT: 'Jumat',
  SABTU: 'Sabtu',
  MINGGU: 'Minggu',
}

const DAY_ORDER: DayCode[] = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU']

const toDayCode = (value: string): DayCode => {
  const upper = value.toUpperCase() as DayCode
  if (upper in DAY_LABELS) {
    return upper
  }
  return 'SENIN'
}

const stadionDetailCache = new Map<number, { name: string; mapUrl: string | null }>()

const GET_OPERATING_HOURS = `
  query GetOperatingHoursWithStadion($stadionId: Int!) {
    operatingHoursByStadion(stadionId: $stadionId) {
      id
      day
      openTime
      closeTime
      stadionId
      Stadion {
        id
        name
        mapUrl
      }
    }
  }
`

const rawSchedules = ref<OperatingHourRecord[]>([])
const loading = ref(false)
const fetchError = ref<string | null>(null)
const requestIdRef = ref(0)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 5
const stadionOptions = ref<Array<{ id: number; name: string }>>([])
const stadionOptionsLoading = ref(false)

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const authToken = useCookie<string | null>('admin_token')

const resolvedStadionId = computed<number>(() => {
  const queryValue = route.query.stadionId
  const first = Array.isArray(queryValue) ? queryValue[0] : queryValue
  const parsed = first ? Number.parseInt(first, 10) : NaN
  return Number.isFinite(parsed) ? parsed : 1
})

const fallbackStadionName = computed(() => {
  const queryValue = route.query.stadionName
  const name = Array.isArray(queryValue) ? queryValue[0] : queryValue
  if (typeof name === 'string' && name.trim()) {
    return name.trim()
  }
  return `Stadion #${resolvedStadionId.value}`
})

const fetchSchedules = async () => {
  const requestId = requestIdRef.value + 1
  requestIdRef.value = requestId
  loading.value = true
  fetchError.value = null

  try {
    const endpoint = runtimeConfig.public.gqlHttpEndpoint || 'http://localhost:4000/graphql'
    console.debug('[schedules] fetching', {
      endpoint,
      stadionId: resolvedStadionId.value,
      hasToken: Boolean(authToken.value),
    })
    const response = await $fetch<{
      data?: { operatingHoursByStadion: GraphqlOperatingHour[] }
      errors?: Array<{ message?: string }>
    }>(endpoint, {
      method: 'POST',
      body: {
        query: GET_OPERATING_HOURS,
        variables: { stadionId: resolvedStadionId.value },
      },
      headers: {
        'Content-Type': 'application/json',
        ...(authToken.value ? { Authorization: `Bearer ${authToken.value}` } : {}),
      },
      credentials: 'include',
    })


    console.debug('[schedules] raw response', response)

    if (response?.errors?.length) {
      throw new Error(response.errors[0]?.message || 'Gagal memuat jadwal')
    }

    const items = response?.data?.operatingHoursByStadion ?? []
    console.debug('[schedules] fetched operating hours', items)

    items.forEach((item) => {
      const trimmed = item.Stadion?.name?.trim()
      if (trimmed) {
        stadionDetailCache.set(item.stadionId, {
          name: trimmed,
          mapUrl: item.Stadion?.mapUrl ?? null,
        })
      }
    })

    const missingIds = items
      .filter((item) => !item.Stadion?.name?.trim())
      .map((item) => item.stadionId)
      .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
    const idsToFetch = [...new Set(missingIds.filter((id) => !stadionDetailCache.has(id)))]

    if (idsToFetch.length > 0) {
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const detail = await $fetch<{ id: number; name?: string; mapUrl?: string | null }>(
              `/api/stadions/${id}`,
              { credentials: 'include' },
            )
            stadionDetailCache.set(id, {
              name: detail?.name?.trim() || `Stadion #${id}`,
              mapUrl: detail?.mapUrl ?? null,
            })
          } catch (err) {
            console.debug('[schedules] stadion detail fallback', id, err)
            stadionDetailCache.set(id, {
              name: `Stadion #${id}`,
              mapUrl: null,
            })
          }
        }),
      )
    }

    if (requestId === requestIdRef.value) {
      rawSchedules.value = items.map((item) => {
        const day = toDayCode(item.day)
        const cached = stadionDetailCache.get(item.stadionId)
        return {
          id: item.id,
          stadionId: item.stadionId,
          stadionName:
            item.Stadion?.name?.trim() || cached?.name || fallbackStadionName.value,
          stadionMapUrl: item.Stadion?.mapUrl ?? cached?.mapUrl ?? null,
          day,
          openTime: item.openTime,
          closeTime: item.closeTime,
        }
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tidak dapat memuat jadwal'
    if (requestId === requestIdRef.value) {
      fetchError.value = message
      rawSchedules.value = []
      console.error('[schedules] fetch error', message)
    }
  } finally {
    if (requestId === requestIdRef.value) {
      loading.value = false
    }
  }
}

const loadStadionOptions = async () => {
  stadionOptionsLoading.value = true
  try {
    const data = await $fetch<Array<{ id: number; name: string }>>('/api/stadions', {
      credentials: 'include',
    })
    stadionOptions.value = Array.isArray(data)
      ? data.map((item) => ({
          id: Number(item.id),
          name: item.name?.trim() || `Stadion #${item.id}`,
        }))
      : []

    stadionOptions.value.forEach((stadion) => {
      if (!stadionDetailCache.has(stadion.id)) {
        stadionDetailCache.set(stadion.id, { name: stadion.name, mapUrl: null })
      }
    })

    if (!formState.stadionId && stadionOptions.value.length > 0) {
      formState.stadionId = String(stadionOptions.value[0]!.id)
    }
  } catch (error) {
    console.error('[schedules] failed to load stadion options', error)
  } finally {
    stadionOptionsLoading.value = false
  }
}

const DAY_OPTIONS = DAY_ORDER.map((code) => ({
  value: code,
  label: DAY_LABELS[code],
}))

const DEFAULT_FORM = {
  stadionId: '' as string,
  day: 'SENIN' as DayCode,
  open: '08:00',
  close: '22:00',
}

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const formState = reactive({ ...DEFAULT_FORM })
const modalSubmitting = ref(false)
const modalError = ref<string | null>(null)
const editingId = ref<number | null>(null)

const deleteModalOpen = ref(false)
const deleteTarget = ref<TableRow | null>(null)
const deleteSubmitting = ref(false)
const deleteError = ref<string | null>(null)

const modalTitle = computed(() =>
  modalMode.value === 'edit' ? 'Edit Jam Operasional' : 'Tambah Jam Operasional',
)
const modalPrimaryLabel = computed(() =>
  modalMode.value === 'edit' ? 'Simpan Perubahan' : 'Simpan',
)

const resetFormState = () => {
  Object.assign(formState, DEFAULT_FORM)
  if (stadionOptions.value.length > 0) {
    formState.stadionId = String(stadionOptions.value[0]!.id)
  }
  modalError.value = null
  editingId.value = null
  editingBaseDate.value = null
}

const openModal = (mode: 'create' | 'edit') => {
  if (!stadionOptions.value.length) {
    loadStadionOptions()
  }
  modalMode.value = mode
  resetFormState()
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
  editingId.value = null
  resetFormState()
}

const openDeleteModal = (row: TableRow) => {
  deleteTarget.value = row
  deleteError.value = null
  deleteModalOpen.value = true
}

const closeDeleteModal = () => {
  deleteModalOpen.value = false
  deleteTarget.value = null
  deleteError.value = null
}

const editingBaseDate = ref<string | null>(null)

const toIsoUtcTime = (time: string, baseDate?: string | null) => {
  const [hours, minutes] = time.split(':')
  const h = Number.parseInt(hours ?? '0', 10)
  const m = Number.parseInt(minutes ?? '0', 10)
  const dateSeed = baseDate && baseDate.match(/\d{4}-\d{2}-\d{2}/)
    ? `${baseDate}T00:00:00.000Z`
    : '1970-01-01T00:00:00.000Z'
  const date = new Date(dateSeed)
  date.setUTCHours(h, m, 0, 0)
  return date.toISOString()
}

const submitModal = async () => {
  if (!formState.stadionId && modalMode.value === 'create') {
    modalError.value = 'Silakan pilih stadion'
    return
  }

  const baseDate = modalMode.value === 'edit' ? editingBaseDate.value : null
  const openIso = toIsoUtcTime(formState.open, baseDate)
  const closeIso = toIsoUtcTime(formState.close, baseDate)

  if (openIso >= closeIso) {
    modalError.value = 'Jam tutup harus lebih besar dari jam buka'
    return
  }

  modalSubmitting.value = true
  modalError.value = null

  const payloadBase = {
    day: formState.day,
    open: openIso,
    close: closeIso,
  }

  try {
    if (modalMode.value === 'edit') {
      if (!editingId.value) {
        throw new Error('ID jam operasional tidak ditemukan')
      }
      await $fetch('/api/operating-hours/update', {
        method: 'POST',
        body: {
          id: editingId.value,
          ...payloadBase,
        },
        credentials: 'include',
      })
    } else {
      await $fetch('/api/operating-hours/create', {
        method: 'POST',
        body: {
          stadionId: Number.parseInt(formState.stadionId, 10),
          ...payloadBase,
        },
        credentials: 'include',
      })
    }

    await fetchSchedules()
    closeModal()
  } catch (error: any) {
    console.error('[schedules] submit failed', error)
    const message =
      error?.data?.statusMessage || error?.message || 'Gagal menyimpan jadwal'
    modalError.value = message
  } finally {
    modalSubmitting.value = false
  }
}

if (import.meta.client) {
  onMounted(() => {
    loadStadionOptions()
    fetchSchedules()
  })

  watch(
    () => resolvedStadionId.value,
    (newId, oldId) => {
      if (oldId !== undefined && newId !== oldId) {
        fetchSchedules()
      }
    },
  )
}

const extractTime = (value: string): string => {
  const match = value.match(/(\d{2}:\d{2})/)
  return match && match[1] ? match[1] : value
}

type TableRow = OperatingHourRecord & {
  dayLabel: string
  openTimeDisplay: string
  closeTimeDisplay: string
}

const tableRows = computed<TableRow[]>(() =>
  rawSchedules.value
    .map((record) => ({
      ...record,
      dayLabel: DAY_LABELS[record.day],
      openTimeDisplay: extractTime(record.openTime),
      closeTimeDisplay: extractTime(record.closeTime),
    }))
    .sort((a, b) => {
      const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      if (dayDiff !== 0) return dayDiff
      return a.stadionName.localeCompare(b.stadionName)
    }),
)

// Filtered schedules based on search input
const filteredRows = computed(() => {
  if (!searchQuery.value) {
    return tableRows.value
  }
  const query = searchQuery.value.toLowerCase()
  return tableRows.value.filter((row) =>
    [row.stadionName, row.day, row.dayLabel].some((value) =>
      value.toLowerCase().includes(query),
    ),
  )
})

const totalPages = computed(() => {
  if (filteredRows.value.length === 0) return 1
  return Math.ceil(filteredRows.value.length / itemsPerPage)
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRows.value.slice(start, start + itemsPerPage)
})

const paginationRange = computed(() => {
  const range: number[] = []
  const maxVisible = 5
  const total = totalPages.value || 1

  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let page = start; page <= end; page += 1) {
    range.push(page)
  }

  return range
})

watch(searchQuery, () => {
  currentPage.value = 1
})

watch(
  filteredRows,
  (rows) => {
    const safeTotal = Math.max(1, Math.ceil(rows.length / itemsPerPage))
    if (currentPage.value > safeTotal) {
      currentPage.value = safeTotal
    }
  },
  { immediate: true },
)

const goToPage = (page: number) => {
  if (page >= 1 && page <= (totalPages.value || 1)) {
    currentPage.value = page
  }
}

const handleEdit = (row: TableRow) => {
  if (!stadionOptions.value.length) {
    loadStadionOptions()
  }
  openModal('edit')
  editingId.value = row.id
  formState.stadionId = String(row.stadionId)
  formState.day = row.day
  formState.open = isoToTime(row.openTime)
  formState.close = isoToTime(row.closeTime)
  const baseDate = row.openTime?.split('T')?.[0]
  editingBaseDate.value = baseDate || null
}

const isoToTime = (value: string) => {
  const date = new Date(value)
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const handleAddNew = () => {
  openModal('create')
}

const handleDelete = (row: TableRow) => {
  openDeleteModal(row)
}

const submitDelete = async () => {
  if (!deleteTarget.value) return
  deleteSubmitting.value = true
  deleteError.value = null

  try {
    await $fetch('/api/operating-hours/delete', {
      method: 'POST',
      body: { id: deleteTarget.value.id },
      credentials: 'include',
    })
    await fetchSchedules()
    closeDeleteModal()
  } catch (error: any) {
    const message =
      error?.data?.statusMessage || error?.message || 'Gagal menghapus jadwal'
    deleteError.value = message
  } finally {
    deleteSubmitting.value = false
  }
}
</script>

<template>
  <section class="flex w-full flex-col gap-7">
    <!-- Header Section -->
    <header class="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
          Jam Operasional Stadion
        </h1>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">
          Tinjau dan kelola jendela operasional harian untuk setiap venue VENUE UNDIP.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2.5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:translate-y-px sm:px-6"
        @click="handleAddNew"
      >
        <svg
          class="h-5 w-5"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 5V19M19 12H5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>Tambah Jadwal Baru</span>
      </button>
    </header>

    <!-- Card Container -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <!-- Search Bar -->
      <div class="border-b border-gray-200 p-5 sm:p-6">
        <label class="relative flex items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
          <span class="flex text-gray-500" aria-hidden="true">
            <svg
              class="h-5 w-5"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21 21L16.65 16.65M18 11C18 14.866 14.866 18 11 18C7.13401 18 4 14.866 4 11C4 7.13401 7.13401 4 11 4C14.866 4 18 7.13401 18 11Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="search"
            class="w-full border-0 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-0"
            placeholder="Cari stadion, kode hari, atau nama hari..."
          />
        </label>
      </div>

      <!-- Error Alert -->
      <div
        v-if="fetchError"
        class="mx-5 my-5 rounded-lg border border-red-300 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-700 sm:mx-6"
      >
        {{ fetchError }}
      </div>

      <!-- Body Content -->
      <div v-else class="flex flex-col gap-4 p-5 sm:p-6">
        <!-- Loading States -->
        <div
          v-if="loading && rawSchedules.length === 0"
          class="rounded-lg border border-dashed border-gray-300 bg-gray-50 py-6 text-center text-sm font-medium text-gray-600"
        >
          Memuat jadwal...
        </div>
        <div
          v-else-if="loading"
          class="rounded-lg border-0 bg-transparent py-2 text-left text-xs text-gray-500"
        >
          Memperbarui data jadwal...
        </div>

        <!-- Data Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Stadion
                </th>
                <th
                  class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Hari
                </th>
                <th
                  class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Buka
                </th>
                <th
                  class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Tutup
                </th>
                <th
                  class="border-b border-gray-200 px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              <tr
                v-for="row in paginatedRows"
                :key="row.id"
                class="transition-colors hover:bg-blue-50/50"
              >
                <td class="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-900">
                  {{ row.stadionName }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                  <span
                    class="inline-flex w-fit min-w-[3.25rem] items-center justify-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700"
                  >
                    {{ row.day }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm text-gray-900">
                  {{ row.openTimeDisplay }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm text-gray-900">
                  {{ row.closeTimeDisplay }}
                </td>
                <td class="whitespace-nowrap px-5 py-4 text-sm">
                  <div class="inline-flex items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      @click="handleEdit(row)"
                    >
                      <svg
                        class="h-4 w-4"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M13.5 6.5L17.5 10.5M4 20H8L18.5 9.5C19.3284 8.67157 19.3284 7.32843 18.5 6.5L17.5 5.5C16.6716 4.67157 15.3284 4.67157 14.5 5.5L4 16V20Z"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Ubah
                    </button>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      @click="handleDelete(row)"
                    >
                      <svg
                        class="h-4 w-4"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L17.3333 19.3333C17.2989 20.0102 16.7364 20.5333 16.0582 20.5333H7.94185C7.26366 20.5333 6.7011 20.0102 6.66667 19.3333L6 6M9.33333 6V4.66667C9.33333 3.93029 9.93029 3.33333 10.6667 3.33333H13.3333C14.0697 3.33333 14.6667 3.93029 14.6667 4.66667V6M5 6H19"
                          stroke="currentColor"
                          stroke-width="1.6"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div
            v-if="!loading && paginatedRows.length === 0"
            class="flex flex-col items-center justify-center gap-3 py-16 text-center"
          >
            <svg
              class="h-14 w-14 text-gray-300"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M9 5H15"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p class="text-sm font-semibold text-gray-900">Tidak ada hasil</p>
            <p class="text-xs text-gray-500">
              Coba cari dengan nama stadion atau hari lain.
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <footer
          v-if="totalPages > 1"
          class="flex items-center justify-center gap-1 border-t border-gray-200 pt-4"
        >
          <button
            type="button"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            ‹
          </button>

          <button
            v-if="paginationRange.length > 0 && paginationRange[0]! > 1"
            type="button"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
            @click="goToPage(1)"
          >
            1
          </button>

          <span
            v-if="paginationRange.length > 0 && paginationRange[0]! > 2"
            class="px-1 text-sm font-semibold text-gray-500"
          >
            …
          </span>

          <button
            v-for="page in paginationRange"
            :key="page"
            type="button"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors"
            :class="
              page === currentPage
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            "
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <span
            v-if="
              paginationRange.length > 0 &&
              paginationRange[paginationRange.length - 1]! < (totalPages || 0) - 1
            "
            class="px-1 text-sm font-semibold text-gray-500"
          >
            …
          </span>

          <button
            v-if="
              paginationRange.length > 0 &&
              paginationRange[paginationRange.length - 1]! < (totalPages || 0)
            "
            type="button"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50"
            @click="goToPage(totalPages || 1)"
          >
            {{ totalPages }}
          </button>

          <button
            type="button"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="currentPage === (totalPages || 1)"
            @click="goToPage(currentPage + 1)"
          >
            ›
          </button>
        </footer>
      </div>
    </div>
  </section>

  <div
    v-if="modalOpen"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-ds-lg">
      <div class="mb-4 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-ds-text">
            {{ modalTitle }}
          </h2>
          <p class="text-sm text-ds-muted">
            Pilih stadion dan tentukan jendela operasional.
          </p>
        </div>
        <button
          type="button"
          class="text-ds-muted hover:text-ds-text"
          @click="closeModal"
        >
          <span class="sr-only">Tutup</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <form class="grid gap-4" @submit.prevent="submitModal">
        <label class="grid gap-1">
          <span class="text-sm font-medium text-ds-text">Stadion</span>
          <select
            v-model="formState.stadionId"
            class="h-10 rounded-md border border-ds-border bg-white px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
            :disabled="modalMode === 'edit' || stadionOptionsLoading || modalSubmitting"
            required
          >
            <option value="" disabled hidden>Pilih stadion</option>
            <option
              v-for="stadion in stadionOptions"
              :key="stadion.id"
              :value="String(stadion.id)"
            >
              {{ stadion.name }}
            </option>
          </select>
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium text-ds-text">Hari</span>
          <select
            v-model="formState.day"
            class="h-10 rounded-md border border-ds-border bg-white px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
            :disabled="modalSubmitting"
            required
          >
            <option
              v-for="option in DAY_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label class="grid gap-1">
            <span class="text-sm font-medium text-ds-text">Jam Buka</span>
            <input
              v-model="formState.open"
              type="time"
              class="h-10 rounded-md border border-ds-border bg-white px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
              :disabled="modalSubmitting"
              required
            />
          </label>

          <label class="grid gap-1">
            <span class="text-sm font-medium text-ds-text">Jam Tutup</span>
            <input
              v-model="formState.close"
              type="time"
              class="h-10 rounded-md border border-ds-border bg-white px-3 text-sm text-ds-text focus:border-ds-blue-500 focus:outline-none focus:ring-2 focus:ring-ds-blue-500/20"
              :disabled="modalSubmitting"
              required
            />
          </label>
        </div>

        <p v-if="modalError" class="text-sm font-semibold text-red-500">
          {{ modalError }}
        </p>

        <div class="mt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            class="text-sm font-semibold text-ds-muted hover:text-ds-text"
            @click="closeModal"
            :disabled="modalSubmitting"
          >
            Batal
          </button>
          <button
            type="submit"
            class="inline-flex h-10 items-center justify-center rounded-md bg-ds-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-ds-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="modalSubmitting"
          >
            {{ modalSubmitting ? 'Menyimpan...' : modalPrimaryLabel }}
          </button>
        </div>
      </form>

      <p v-if="stadionOptionsLoading" class="mt-3 text-xs text-ds-muted">
        Memuat data stadion...
      </p>
    </div>
  </div>

  <div
    v-if="deleteModalOpen && deleteTarget"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-ds-lg">
      <div class="mb-3">
        <h2 class="text-lg font-semibold text-ds-text">Hapus Jam Operasional</h2>
        <p class="text-sm text-ds-muted">
          Tindakan ini akan menghapus jendela operasional untuk
          <strong>{{ deleteTarget.stadionName }}</strong> pada hari
          <strong>{{ DAY_LABELS[deleteTarget.day] }}</strong>.
        </p>
      </div>

      <p class="text-sm text-ds-muted">
        Apakah Anda yakin ingin melanjutkan? Perubahan ini tidak dapat dibatalkan.
      </p>

      <p v-if="deleteError" class="mt-3 text-sm font-semibold text-red-500">
        {{ deleteError }}
      </p>

      <div class="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          class="text-sm font-semibold text-ds-muted hover:text-ds-text"
          @click="closeDeleteModal"
          :disabled="deleteSubmitting"
        >
          Batal
        </button>
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          @click="submitDelete"
          :disabled="deleteSubmitting"
        >
          {{ deleteSubmitting ? 'Menghapus...' : 'Hapus' }}
        </button>
      </div>
    </div>
  </div>
</template>
