<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFetch } from 'nuxt/app'
import { gql } from 'graphql-tag'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import { QUERY_GET_DASHBOARD_STATS } from '~/graphql/queries/get_dashboard_stats'
import LineChart from '~/components/charts/LineChart.vue'
import BarChart from '~/components/charts/BarChart.vue'
import DonutChart from '~/components/charts/DonutChart.vue'

definePageMeta({ middleware: 'auth-admin', layout: 'admin' })
dayjs.locale('id')

const QUERY_GET_STADIONS_SIMPLE = gql`query GetStadionsSimple { stadions { id, name } }`
const { data: stadionsData } = await useFetch('/api/graphql', { method: 'POST', body: { query: QUERY_GET_STADIONS_SIMPLE } })
const stadionList = computed(() => (stadionsData.value as any)?.data?.stadions || [])

const startDate = ref(dayjs().subtract(6, 'day').format('YYYY-MM-DD'))
const endDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedStadionId = ref<string>('')
const activeFilter = ref<'week' | 'month' | 'custom'>('week')

watch([startDate, endDate], () => {
  const isWeek = startDate.value === dayjs().subtract(6, 'day').format('YYYY-MM-DD') && endDate.value === dayjs().format('YYYY-MM-DD')
  const isMonth = startDate.value === dayjs().startOf('month').format('YYYY-MM-DD') && endDate.value === dayjs().endOf('month').format('YYYY-MM-DD')
  
  if (!isWeek && !isMonth) {
    activeFilter.value = 'custom'
  }
})

const { data: statsResponse, pending, error, refresh } = await useFetch('/api/graphql', {
  method: 'POST',
  body: computed(() => ({
    query: QUERY_GET_DASHBOARD_STATS,
    variables: { startDate: startDate.value, endDate: endDate.value, stadionId: selectedStadionId.value || null },
  })),
})

interface DailyBookingCount { date: string; count: number }
interface DailySlot { date: string; bookedHours: number; availableHours: number }
interface UserDemographic { category: string; count: number }
interface FieldRevenue { fieldId: string; fieldName: string; revenue: number; percentage: number }

interface Stats {
  totalStadions: number; totalFields: number; totalBookings: number;
  pendingBookings: number; revenueYTD: number;
  dailyBookings: DailyBookingCount[]; weeklySlots: DailySlot[];
  recentBookings: any[]; userDemographics: UserDemographic[]; fieldRevenues: FieldRevenue[];
}

const dashboardStats = computed<Stats>(() => {
  const raw = (statsResponse.value as any)?.data?.getDashboardStats
  return {
    totalStadions: raw?.totalStadions ?? 0,
    totalFields: raw?.totalFields ?? 0,
    totalBookings: raw?.totalBookings ?? 0,
    pendingBookings: raw?.pendingBookings ?? 0,
    revenueYTD: raw?.revenueYTD ?? 0,
    dailyBookings: Array.isArray(raw?.dailyBookings) ? raw.dailyBookings : [],
    weeklySlots: Array.isArray(raw?.weeklySlots) ? raw.weeklySlots : [],
    recentBookings: Array.isArray(raw?.recentBookings) ? raw.recentBookings : [],
    userDemographics: Array.isArray(raw?.userDemographics) ? raw.userDemographics : [],
    fieldRevenues: Array.isArray(raw?.fieldRevenues) ? raw.fieldRevenues : [],
  }
})

const hasData = (dataArray: any[], key: string) => dataArray && dataArray.length > 0 && dataArray.some(item => item[key] > 0)
const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
const formatDate = (date: string) => dayjs(date).format('DD MMM, HH:mm')

const setFilter = (type: 'week' | 'month') => {
  activeFilter.value = type
  const now = dayjs()
  if (type === 'week') { startDate.value = now.subtract(6, 'day').format('YYYY-MM-DD'); endDate.value = now.format('YYYY-MM-DD') } 
  else { startDate.value = now.startOf('month').format('YYYY-MM-DD'); endDate.value = now.endOf('month').format('YYYY-MM-DD') }
}

const handlePrint = () => { window.print() }

const downloadCSV = () => {
  const rows = [
    ['Laporan Performa Lapangan'],
    [`Periode: ${startDate.value} s/d ${endDate.value}`],
    [],
    ['Nama Lapangan', 'Pendapatan', 'Kontribusi (%)'], 
    ...dashboardStats.value.fieldRevenues.map(f => [
      `"${f.fieldName}"`, 
      f.revenue,
      `${f.percentage}%`
    ])
  ]
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `Laporan_Venue_${dayjs().format('YYYYMMDD')}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200'
    case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200'
    case 'DONE': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const iconMap: Record<string, string> = {
  booking: 'M6 3C4.9 3 4 3.9 4 5V21L12 17L20 21V5C20 3.9 19.1 3 18 3H6ZM6 5H18V17.97L12 15.2L6 17.97V5Z',
  pending: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z',
  revenue: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12Z',
  stadium: 'M12 3C6.48 3 2 5.24 2 8V12C2 14.76 6.48 17 12 17C17.52 17 22 14.76 22 12V8C22 5.24 17.52 3 12 3ZM4 8C4 6.34 7.58 5 12 5C16.42 5 20 6.34 20 8C20 9.66 16.42 11 12 11C7.58 11 4 9.66 4 8Z',
  field: 'M4 5C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5H4ZM4 7H11V17H4V7ZM13 7H20V17H13V7ZM9 9C8.45 9 8 9.45 8 10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10C10 9.45 9.55 9 9 9ZM15 9C14.45 9 14 9.45 14 10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10C16 9.45 15.55 9 15 9Z',
}
const getIcon = (icon: string) => iconMap[icon] ?? iconMap.booking ?? ''

// --- LOGIKA KARTU DINAMIS ---
const statCards = computed(() => {
  const cards = [
    { 
      title: 'Total Booking', 
      value: dashboardStats.value.totalBookings, 
      icon: 'booking', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      hoverBorder: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      link: '/admin/bookings',
      helpText: 'Jumlah total booking yang tercatat dalam sistem (termasuk yang belum bayar).' 
    },
    { 
      title: 'Menunggu Konfirmasi', 
      value: dashboardStats.value.pendingBookings, 
      icon: 'pending', 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50', 
      hoverBorder: 'hover:border-amber-300',
      hoverBg: 'hover:bg-amber-50',
      link: '/admin/bookings?status=pending',
      helpText: 'Booking yang membutuhkan persetujuan admin segera.'
    },
    ...(!selectedStadionId.value ? [{ 
      title: 'Stadion Aktif', 
      value: dashboardStats.value.totalStadions, 
      icon: 'stadium', 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50', 
      hoverBorder: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      link: '/admin/stadiums',
      helpText: 'Jumlah stadion yang aktif dikelola sistem.'
    }] : []),
    { 
      title: 'Lapangan Aktif', 
      value: dashboardStats.value.totalFields, 
      icon: 'field', 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50', 
      hoverBorder: 'hover:border-indigo-300',
      hoverBg: 'hover:bg-indigo-50',
      link: '/admin/fields?status=ACTIVE',
      helpText: 'Jumlah lapangan yang aktif dikelola sistem.'
    },
    { 
      title: 'Pendapatan (YTD)', 
      value: formatRupiah(dashboardStats.value.revenueYTD), 
      icon: 'revenue', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50', 
      hoverBorder: 'hover:border-green-300',
      hoverBg: 'hover:bg-green-50',
      isCurrency: true,
      helpText: 'Total pendapatan DITERIMA (Lunas).' 
    },
  ]
  return cards
})
</script>

<template>
  <div class="flex w-full flex-col gap-5 sm:gap-6 pb-10 px-4 sm:px-0 print:space-y-4 print:pb-0">
    
    <div class="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
      <h1 class="text-2xl font-bold text-black uppercase tracking-wider">Laporan Eksekutif Venue</h1>
      <p class="text-sm text-gray-600">Periode: {{ dayjs(startDate).format('DD MMMM YYYY') }} - {{ dayjs(endDate).format('DD MMMM YYYY') }}</p>
      <p class="text-xs text-gray-400 mt-1">Dicetak pada: {{ dayjs().format('DD/MM/YYYY HH:mm') }}</p>
    </div>

    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
      <div>
        <h1 class="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Dashboard Admin</h1>
        <p class="text-xs sm:text-sm text-gray-500 mt-1">Analisis Performa & Statistik Venue</p>
      </div>
    </header>

    <div class="flex flex-col xl:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:hidden">
       <div class="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div class="relative w-full sm:w-64">
            <select v-model="selectedStadionId" class="appearance-none w-full bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-8 cursor-pointer hover:bg-gray-100 transition">
              <option value="">Semua Stadion</option>
              <option v-for="s in stadionList" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
       </div>

       <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-end">
          <div class="flex w-full sm:w-auto gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
             <button @click="setFilter('week')" 
                class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                :class="activeFilter === 'week' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'">
                7 Hari
             </button>
             <button @click="setFilter('month')" 
                class="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-all"
                :class="activeFilter === 'month' ? 'bg-white text-blue-700 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'">
                Bulan Ini
             </button>
          </div>

          <div class="w-full sm:w-auto flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500" :class="activeFilter === 'custom' ? 'border-blue-500 bg-blue-50/30' : ''">
            <input type="date" v-model="startDate" class="text-xs bg-transparent border-none text-gray-700 focus:ring-0 p-0 cursor-pointer font-medium w-full sm:w-auto" />
            <span class="text-gray-400 text-xs mx-1">s/d</span>
            <input type="date" v-model="endDate" class="text-xs bg-transparent border-none text-gray-700 focus:ring-0 p-0 cursor-pointer font-medium w-full sm:w-auto" />
          </div>
          
          <div class="hidden sm:block w-px h-8 bg-gray-200 mx-1"></div>

          <div class="flex w-full sm:w-auto gap-2 justify-end">
            <button @click="refresh()" class="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition" title="Muat Ulang">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
            
            <button @click="downloadCSV()" class="p-2 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 transition" title="Export Excel (CSV)">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </button>
  
            <button @click="handlePrint()" class="p-2 rounded-lg text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-300 transition" title="Print Laporan">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            </button>
          </div>
       </div>
    </div>

    <section v-if="pending" class="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 print:hidden">
       <div v-for="i in 5" :key="i" class="h-28 rounded-xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse"></div>
    </section>
    <section v-else-if="error" class="rounded-xl bg-red-50 border border-red-200 p-6 text-center print:hidden">
      <p class="text-red-600 font-medium">{{ error.message }}</p>
      <button @click="refresh()" class="mt-2 text-sm underline text-red-700">Coba Lagi</button>
    </section>

    <div v-else class="space-y-6 sm:space-y-8">
      <section :class="['grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-5 print:gap-2', selectedStadionId ? 'xl:grid-cols-4' : 'xl:grid-cols-5']">
        <NuxtLink
          v-for="card in statCards" :key="card.title" :to="card.link || '#'" 
          :class="['group relative rounded-xl bg-white p-4 shadow-sm border border-gray-200 transition-all duration-300 print:shadow-none print:border print:border-gray-300 print:p-3', 
                   card.hoverBorder, card.hoverBg, card.link ? 'cursor-pointer' : 'cursor-default']">
          
          <div class="flex justify-between items-start relative z-10">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                 <p class="text-[11px] font-bold uppercase tracking-wider text-gray-500 print:text-black leading-snug">{{ card.title }}</p>
                 <div v-if="card.helpText" class="group/info relative print:hidden flex-shrink-0 z-20 hidden sm:block">
                    <svg class="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 cursor-help transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-gray-900/95 text-white text-[11px] leading-tight rounded-lg shadow-xl opacity-0 group-hover/info:opacity-100 transition-all duration-200 pointer-events-none backdrop-blur-sm">
                       {{ card.helpText }}
                       <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95"></div>
                    </div>
                 </div>
              </div>
              <p class="mt-2 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight print:text-lg print:text-black whitespace-normal">{{ card.value }}</p>
            </div>
            <div :class="['p-2.5 rounded-xl transition-transform group-hover:scale-110 print:hidden flex-shrink-0 ml-2', card.bgColor]">
               <svg v-if="card.icon === 'booking'" class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
               <svg v-else-if="card.icon === 'pending'" class="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               <svg v-else-if="card.icon === 'field'" class="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
               <svg v-else-if="card.icon === 'stadium'" class="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 01-1 1h2a1 1 0 01 1 1v4a1 1 0 001 1m-6 0h6"></path></svg>
               <svg v-else class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </NuxtLink>
      </section>

      <section class="grid grid-cols-1 gap-6 lg:grid-cols-2 print:block print:mt-4">
        <div class="flex flex-col rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 print:shadow-none print:border print:border-gray-300 print:mb-4 print:break-inside-avoid">
          <div class="mb-4 sm:mb-6 print:mb-2">
            <h2 class="text-lg font-bold text-gray-900">Tren Transaksi Booking</h2>
            <p class="text-xs text-gray-500 print:hidden">Jumlah Booking pada periode terpilih.</p>
          </div>
          <div class="flex-1 min-h-[250px] sm:min-h-[300px] relative print:h-[200px] print:min-h-0">
            <ClientOnly v-if="hasData(dashboardStats.dailyBookings, 'count')" fallback-tag="div" fallback="Memuat grafik..."><LineChart :data="dashboardStats.dailyBookings" /></ClientOnly>
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50"><p class="text-sm font-medium text-gray-900">Belum Ada Data</p></div>
          </div>
        </div>

        <div class="flex flex-col rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div class="flex items-center justify-between mb-4 sm:mb-6 print:mb-2">
            <div><h2 class="text-lg font-bold text-gray-900">Okupansi Slot</h2></div>
            <span class="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 print:hidden">{{ dayjs(startDate).format('DD MMM') }} - {{ dayjs(endDate).format('DD MMM') }}</span>
          </div>
          <div class="flex-1 min-h-[250px] sm:min-h-[300px] relative print:h-[200px] print:min-h-0">
            <ClientOnly v-if="hasData(dashboardStats.weeklySlots, 'bookedHours')" fallback-tag="div" fallback="Memuat grafik..."><BarChart :data="dashboardStats.weeklySlots" /></ClientOnly>
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50"><p class="text-sm font-medium text-gray-900">Slot Kosong</p></div>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:mt-4">
        <div class="flex flex-col rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 print:shadow-none print:border print:border-gray-300 print:mb-4 print:break-inside-avoid">
          <div class="mb-4 sm:mb-6 print:mb-2"><h2 class="text-lg font-bold text-gray-900">Komposisi Pengguna</h2></div>
          <div class="flex-1 min-h-[250px] relative print:h-[200px] print:min-h-0">
             <ClientOnly v-if="hasData(dashboardStats.userDemographics, 'count')" fallback-tag="div" fallback="Memuat grafik..."><DonutChart :data="dashboardStats.userDemographics" /></ClientOnly>
             <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50"><p class="text-sm font-medium text-gray-900">Belum Ada Data</p></div>
          </div>
        </div>

        <div class="flex flex-col rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
          <div class="mb-4 sm:mb-6 flex justify-between items-center">
             <div><h2 class="text-lg font-bold text-gray-900">Performa Lapangan</h2><p class="text-xs text-gray-500 print:hidden">Kontribusi peminatan booking.</p></div>
          </div>
          <div v-if="dashboardStats.fieldRevenues.length > 0" class="space-y-4 overflow-y-auto max-h-[250px] pr-2 print:max-h-none print:overflow-visible">
             <div v-for="(field, idx) in dashboardStats.fieldRevenues" :key="field.fieldId" class="group">
                <div class="flex justify-between text-sm mb-1">
                   <span class="font-medium text-gray-700 group-hover:text-blue-600 transition">{{ idx + 1 }}. {{ field.fieldName }}</span>
                   <span class="font-semibold text-gray-900">{{ formatRupiah(field.revenue) }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden print:border print:border-gray-300">
                   <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500 print:bg-black" :style="{ width: `${field.percentage}%` }"></div>
                </div>
                <div class="flex justify-between mt-1">
                    <p class="text-[10px] text-gray-400"></p>
                    <p class="text-[10px] text-gray-400">{{ field.percentage }}% Kontribusi</p>
                </div>
             </div>
          </div>
          <div v-else class="flex-1 flex items-center justify-center text-center p-4 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50/50">
             <p class="text-sm font-medium text-gray-900">Belum Ada Pendapatan</p>
          </div>
        </div>
      </section>

      <section class="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border print:border-gray-300 print:mt-4 print:break-inside-avoid">
        <div class="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center print:border-black print:py-2">
          <div><h2 class="text-lg font-bold text-gray-900">Transaksi Terbaru</h2></div>
          <NuxtLink to="/admin/bookings" class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline print:hidden">Lihat Semua &rarr;</NuxtLink>
        </div>
        
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 print:text-black print:border-black">
              <tr>
                <th class="px-6 py-3 font-semibold print:px-2">Kode</th>
                <th class="px-6 py-3 font-semibold print:px-2">Pemesan</th>
                <th class="px-6 py-3 font-semibold print:px-2">Tanggal</th>
                <th class="px-6 py-3 font-semibold print:px-2">Total</th>
                <th class="px-6 py-3 font-semibold print:px-2">Status</th>
                <th class="px-6 py-3 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 print:divide-gray-300">
              <tr v-if="dashboardStats.recentBookings.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 italic">Belum ada transaksi terbaru.</td>
              </tr>
              <tr v-for="booking in dashboardStats.recentBookings" :key="booking.id" class="hover:bg-blue-50/50 transition-colors print:hover:bg-transparent">
                <td class="px-6 py-4 font-mono text-xs text-gray-600 print:px-2 print:py-2">#{{ booking.bookingCode }}</td>
                <td class="px-6 py-4 font-medium text-gray-900 print:px-2 print:py-2">{{ booking.name }}</td>
                <td class="px-6 py-4 text-gray-500 print:px-2 print:py-2">{{ formatDate(booking.createdAt) }}</td>
                <td class="px-6 py-4 font-medium text-gray-900 print:px-2 print:py-2">{{ formatRupiah(booking.totalPrice) }}</td>
                <td class="px-6 py-4 print:px-2 print:py-2">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold border print:border-black print:text-black print:bg-transparent" :class="getStatusBadgeClass(booking.status)">{{ booking.status }}</span>
                </td>
                <td class="px-6 py-4 text-right print:hidden">
                   <NuxtLink :to="`/admin/bookings/${booking.details?.[0]?.Field?.stadionId}/${booking.bookingCode}`" class="text-blue-600 hover:text-blue-800 font-medium text-xs">Detail</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden divide-y divide-gray-100">
           <div v-if="dashboardStats.recentBookings.length === 0" class="p-6 text-center text-gray-500 italic">
              Belum ada transaksi terbaru.
           </div>
           <div v-for="booking in dashboardStats.recentBookings" :key="booking.id" class="p-4 hover:bg-blue-50/50 transition-colors">
              <div class="flex justify-between items-start mb-2">
                 <span class="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">#{{ booking.bookingCode }}</span>
                 <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border" :class="getStatusBadgeClass(booking.status)">{{ booking.status }}</span>
              </div>
              <div class="mb-1">
                 <h3 class="text-sm font-semibold text-gray-900">{{ booking.name }}</h3>
              </div>
              <div class="flex justify-between items-end mt-2">
                 <div class="flex flex-col gap-0.5">
                    <span class="text-xs text-gray-500">{{ formatDate(booking.createdAt) }}</span>
                    <span class="text-sm font-bold text-gray-900">{{ formatRupiah(booking.totalPrice) }}</span>
                 </div>
                 <NuxtLink :to="`/admin/bookings/${booking.details?.[0]?.Field?.stadionId}/${booking.bookingCode}`" 
                    class="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-100 hover:bg-blue-100 transition">
                    Detail
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                 </NuxtLink>
              </div>
           </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@media print {
  aside, nav, header, footer, button, select, input, .no-print { display: none !important; }
  body, #__nuxt, main { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: white !important; color: black !important; }
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .grid { display: block !important; }
  .print\:grid-cols-5 { display: grid !important; grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
  .rounded-xl, table, tr { break-inside: avoid; page-break-inside: avoid; border: 1px solid #ddd !important; box-shadow: none !important; margin-bottom: 20px; }
}
</style>