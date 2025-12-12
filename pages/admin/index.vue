<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFetch } from 'nuxt/app'
import { gql } from 'graphql-tag'
import { print } from 'graphql'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

import { useDashboardLogic, type DashboardCardItem } from '~/composables/useDashboardLogic'
import { QUERY_GET_FIELDS } from '~/graphql/queries/get_fields'
import { QUERY_GET_BOOKINGS } from '~/graphql/queries/get_bookings'
import { QUERY_GET_STADIONS } from '~/graphql/queries/get_stadions'

definePageMeta({ middleware: 'auth-admin', layout: 'admin' })
dayjs.locale('id')

const getQueryString = (query: any) => typeof query === 'string' ? query : print(query)
const { calculateDailyStats, calculateRangeStats } = useDashboardLogic()

const filterMode = ref<'daily' | 'range'>('daily')
const singleDate = ref(dayjs().add(1, 'day').format('YYYY-MM-DD'))
const formattedSingleDate = computed(() => dayjs(singleDate.value).format('dddd, DD MMMM YYYY'))

const startDate = ref(dayjs().format('YYYY-MM-DD'))
const endDate = ref(dayjs().add(6, 'day').format('YYYY-MM-DD'))
const selectedStadionId = ref<string>('')

const printTimestamp = ref('')

const formattedRangeDate = computed(() => {
  return `${dayjs(startDate.value).format('DD MMM YYYY')} - ${dayjs(endDate.value).format('DD MMM YYYY')}`
})

const setRange = (days: number) => {
  const start = dayjs()
  startDate.value = start.format('YYYY-MM-DD')
  endDate.value = start.add(days - 1, 'day').format('YYYY-MM-DD')
}

const isRangeActive = (days: number) => {
  const targetStart = dayjs().format('YYYY-MM-DD')
  const targetEnd = dayjs().add(days - 1, 'day').format('YYYY-MM-DD')
  return startDate.value === targetStart && endDate.value === targetEnd
}

const resetFilters = () => {
  selectedStadionId.value = ''
  filterMode.value = 'daily'
  singleDate.value = dayjs().add(1, 'day').format('YYYY-MM-DD')
}

const handlePrint = () => {
  printTimestamp.value = dayjs().format('DD MMMM YYYY, HH:mm WIB')
  setTimeout(() => window.print(), 100)
}

const QUERY_OP_HOURS_INLINE = gql`query GetOpHours { operatingHours { openHour closeHour } }`
const { data: opHoursData } = await useFetch('/api/graphql', {
  method: 'POST',
  body: { query: getQueryString(QUERY_OP_HOURS_INLINE) }
})
const opHours = computed(() => (opHoursData.value as any)?.data?.operatingHours || { openHour: 8, closeHour: 22 })

const { data: fieldsData } = await useFetch('/api/graphql', {
  method: 'POST',
  body: computed(() => ({
    query: getQueryString(QUERY_GET_FIELDS),
    variables: { stadionId: null }
  }))
})
const allFields = computed<any[]>(() => (fieldsData.value as any)?.data?.fields || [])

const { data: stadionsData } = await useFetch('/api/graphql', {
  method: 'POST',
  body: { query: getQueryString(QUERY_GET_STADIONS) }
})
const stadionList = computed(() => (stadionsData.value as any)?.data?.stadions || [])

const bookingPayload = computed(() => {
  const vars: any = { stadionId: selectedStadionId.value || undefined }

  if (filterMode.value === 'daily') {
    vars.date = new Date(singleDate.value).toISOString()
  } else {
    vars.startDate = new Date(startDate.value).toISOString()
    vars.endDate = new Date(endDate.value).toISOString()
  }

  return {
    query: getQueryString(QUERY_GET_BOOKINGS),
    variables: vars
  }
})

const { data: bookingsResponse, pending: isLoading, refresh: refreshBookings } = await useFetch('/api/graphql', {
  method: 'POST',
  body: bookingPayload,
  watch: [singleDate, startDate, endDate, filterMode, selectedStadionId] 
})

const rawBookings = computed<any[]>(() => (bookingsResponse.value as any)?.data?.bookings || [])

const dashboardData = computed<DashboardCardItem[]>(() => {
  let fieldsToCheck = allFields.value.filter(f => f.status === 'ACTIVE')

  if (selectedStadionId.value) {
    fieldsToCheck = fieldsToCheck.filter(f =>
      String(f.stadionId) === String(selectedStadionId.value) ||
      String(f.Stadion?.id) === String(selectedStadionId.value)
    )
  }

  return filterMode.value === 'daily'
    ? calculateDailyStats(fieldsToCheck, rawBookings.value, opHours.value, singleDate.value)
    : calculateRangeStats(fieldsToCheck, rawBookings.value, opHours.value, startDate.value, endDate.value)
})

const totalAvailable = computed(() => dashboardData.value.reduce((acc, curr) => acc + curr.remaining, 0))
const totalBooked = computed(() => dashboardData.value.reduce((acc, curr) => acc + curr.totalBooked, 0))

const switchMode = (mode: 'daily' | 'range') => {
  filterMode.value = mode
}
</script>

<template>
  <div class="w-full pb-16 px-4 sm:px-6 print:p-0 print:pb-0">
    
    <div class="hidden print:flex items-center gap-6 mb-8 border-b-2 border-gray-900 pb-6">
      <div class="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-lg border border-gray-300">
        <span class="text-xs font-bold text-gray-500 text-center">LOGO<br>INSTANSI</span>
      </div>
      
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900 uppercase tracking-tight">Laporan Operasional Lapangan</h1>
        <h2 class="text-lg font-semibold text-gray-700">VENUE UNDIP</h2>
        <p class="text-sm text-gray-500 mt-1">Jl. Prof. Soedarto, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah</p>
      </div>

      <div class="text-right">
        <div class="mb-2">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Periode Data</p>
          <p class="text-base font-bold text-gray-900">
            {{ filterMode === 'daily' ? formattedSingleDate : formattedRangeDate }}
          </p>
        </div>
        <div>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">Dicetak Pada</p>
          <p class="text-sm font-medium text-gray-700">{{ printTimestamp }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 print:hidden">
      <div class="flex items-start gap-4">
        <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 shrink-0 hidden sm:flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-800" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 11H11V5H5V11ZM5 19H11V13H5V19ZM13 19H19V13H13V19ZM13 5V11H19V5H13Z"/>
            </svg>
        </div>
        <div>
          <h1 class="text-2xl uppercase font-bold text-gray-900 tracking-tight">Dashboard Analisis</h1>
          <p class="text-sm text-gray-500 mt-1 leading-relaxed">
            Pantau ketersediaan lapangan secara real-time untuk efisiensi manajemen.
          </p>
        </div>
      </div>

      <div class="bg-gray-100 p-1.5 rounded-xl flex w-full md:w-auto md:inline-flex border border-gray-200/50">
        <button 
          @click="switchMode('daily')" 
          class="flex-1 md:flex-none justify-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2" 
          :class="filterMode === 'daily' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Harian
        </button>
        <button 
          @click="switchMode('range')" 
          class="flex-1 md:flex-none justify-center px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2" 
          :class="filterMode === 'range' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Rentang
        </button>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-col lg:flex-row gap-5 items-end print:hidden">
      <div class="flex-1 w-full">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lokasi Stadion</label>
        <div class="relative">
          <select v-model="selectedStadionId" class="appearance-none w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 p-3 pr-10 transition-colors hover:bg-gray-100/50 cursor-pointer font-medium">
            <option value="">Semua Stadion</option>
            <option v-for="s in stadionList" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      <div class="flex-[2] w-full">
        <div class="flex justify-between items-center mb-2">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            {{ filterMode === 'daily' ? 'Pilih Tanggal' : 'Pilih Periode Waktu' }}
          </label>
          <div v-if="filterMode === 'range'" class="flex gap-2">
            <button @click="setRange(7)" class="text-[10px] font-semibold px-2 py-1 rounded transition-colors" :class="isRangeActive(7) ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'">7 Hari ke Depan</button>
            <button @click="setRange(30)" class="text-[10px] font-semibold px-2 py-1 rounded transition-colors" :class="isRangeActive(30) ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'">1 Bulan ke Depan</button>
          </div>
        </div>
        <div v-if="filterMode === 'daily'" class="flex flex-col sm:flex-row items-center gap-3">
          <input type="date" v-model="singleDate" class="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium cursor-pointer">
          <div class="hidden sm:flex items-center gap-2 w-full text-sm font-medium text-gray-600 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 border-dashed">{{ formattedSingleDate }}</div>
        </div>
        <div v-else class="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div class="relative w-full"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-400 text-xs font-bold uppercase">Dari</span></div><input type="date" v-model="startDate" class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-12 p-2.5 font-medium cursor-pointer shadow-sm"></div>
          <div class="text-gray-400 shrink-0"><svg class="w-4 h-4 transform rotate-90 sm:rotate-0 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></div>
          <div class="relative w-full"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span class="text-gray-400 text-xs font-bold uppercase">Smp</span></div><input type="date" v-model="endDate" class="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-12 p-2.5 font-medium cursor-pointer shadow-sm"></div>
        </div>
      </div>

      <div class="flex gap-2 w-full lg:w-auto">
        <button @click="handlePrint()" class="flex-1 lg:flex-none px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-semibold transition-all flex items-center justify-center gap-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          <span class="hidden sm:inline">Cetak</span>
        </button>
        <button @click="refreshBookings()" class="flex-1 lg:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 font-semibold transition-all flex items-center justify-center gap-2 group shadow-sm">
          <svg v-if="!isLoading" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
          <span>{{ isLoading ? 'Memuat...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 print:mb-6 print:break-inside-avoid">
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 print:bg-white print:text-black print:border-2 print:border-gray-800 print:shadow-none">
        <div class="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 print:hidden">
          <svg class="w-40 h-40" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>
        </div>
        <p class="relative z-10 text-blue-100 text-xs font-bold uppercase tracking-wider mb-3 print:text-gray-600">
          {{ filterMode === 'daily' ? 'Sisa Kapasitas Besok' : 'Total Kuota Periode Ini' }}
        </p>
        <div class="relative z-10 flex items-baseline gap-2">
          <h2 class="text-6xl font-extrabold tracking-tight print:text-black">{{ totalAvailable }}</h2>
          <span class="text-xl font-medium text-blue-100 print:text-gray-800">Jam Kosong</span>
        </div>
        <div class="relative z-10 mt-2 text-sm text-blue-200 font-medium print:text-gray-500">Siap digunakan</div>
      </div>

      <div class="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center print:border-2 print:border-gray-800">
        <p class="relative z-10 text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 print:text-gray-600">
          {{ filterMode === 'daily' ? 'Terbooking Besok' : 'Total Terbooking (Volume)' }}
        </p>
        <div class="relative z-10 flex items-baseline gap-2">
          <h2 class="text-6xl font-extrabold text-gray-900 tracking-tight print:text-black">{{ totalBooked }}</h2>
          <span class="text-xl font-medium text-gray-500 print:text-gray-800">Jam Terisi</span>
        </div>
        <div class="relative z-10 mt-2 text-sm text-gray-500 font-medium flex items-center gap-1"></div>
      </div>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse print:hidden">
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl h-64 border border-gray-200 p-5 flex flex-col justify-between">
         <div class="space-y-3"><div class="h-4 bg-gray-200 rounded w-3/4"></div><div class="h-10 bg-gray-200 rounded w-full"></div></div>
      </div>
    </div>

    <div v-else-if="dashboardData.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 print:border-gray-800 print:py-10">
      <div class="p-4 bg-gray-50 rounded-full mb-4 print:hidden">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      </div>
      <h3 class="text-lg font-bold text-gray-900">Tidak ada data lapangan</h3>
      <p class="text-gray-500 mt-1 max-w-sm text-center">Belum ada lapangan yang aktif atau sesuai dengan filter lokasi yang Anda pilih.</p>
      
      <button @click="resetFilters()" class="mt-6 px-5 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors print:hidden flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Reset Filter Pencarian
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 gap-6 print:gap-4">
      <div v-for="item in dashboardData" :key="item.id" class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col print:shadow-none print:border-gray-400 break-inside-avoid">
        
        <div class="p-5 border-b border-gray-100 bg-gray-50/50 print:bg-white print:border-gray-300 print:p-3">
          <div class="flex justify-between items-start gap-4">
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-bold text-gray-900 line-clamp-2 print:text-black print:text-sm" :title="item.name">
                {{ item.name }}
              </h3>
              
              <div class="flex items-start gap-1.5 mt-2 print:mt-1">
                <svg class="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5 print:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wide break-words print:text-gray-700">
                  {{ item.stadionName }}
                </p>
              </div>
            </div>

            <span class="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide shadow-sm print:border-gray-800 print:text-black" :class="item.statusColor">
              {{ item.statusLabel }}
            </span>
          </div>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-center print:p-3">
          <div class="flex justify-between items-end mb-3 print:mb-1">
            <div>
              <span class="text-xs font-bold uppercase text-gray-400 block mb-1 print:text-gray-600">Sisa</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-4xl font-extrabold text-gray-900 tracking-tighter print:text-2xl">{{ item.remaining }}</span>
                <span class="text-sm font-semibold text-gray-400 print:text-gray-600 print:text-xs">/ {{ item.totalCapacity }}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-400 block mb-1 print:text-gray-600">Terisi</span>
              <span class="text-xl font-bold print:text-base" :class="item.occupancyRate > 80 ? 'text-red-600' : 'text-blue-600'">
                {{ Math.round(item.occupancyRate) }}%
              </span>
            </div>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner print:border print:border-gray-300 print:h-2">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out relative print-color-exact"
              :class="item.occupancyRate > 80 ? 'bg-red-500' : (item.occupancyRate > 50 ? 'bg-amber-500' : 'bg-green-500')"
              :style="{ width: `${Math.max(item.occupancyRate, 5)}%` }"
            ></div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-100 group-hover:bg-blue-50/30 transition-colors print:hidden">
          <NuxtLink :to="`/admin/bookings/${item.id}`" class="flex items-center justify-center w-full py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-700 bg-white border border-gray-200 hover:border-blue-300 rounded-xl shadow-sm hover:shadow transition-all gap-2">
            Lihat Jadwal Detail
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="hidden print:flex fixed bottom-0 left-0 w-full justify-between items-center text-[10px] text-gray-400 border-t border-gray-200 pt-2 px-6 bg-white">
      <p>Sistem Informasi Manajemen Lapangan - VENUE UNDIP</p>
      <p>Halaman ini dicetak secara otomatis oleh sistem.</p>
    </div>

  </div>
</template>

<style scoped>
@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .grid { display: grid !important; }
  .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
  .print-color-exact { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  
  .bg-gradient-to-br { background: none !important; }
}
</style>

<style>
@media print {
  nav, header, aside, footer, .sidebar, .top-bar, .layout-header, .navbar { display: none !important; }
  body, #__nuxt, #__layout { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: white !important; }
}
</style>