<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFetch } from 'nuxt/app'
import { useAdminLayout } from '~/composables/useAdminLayout'

// Layout & routing
const route = useRoute()
const router = useRouter()
const { toggleSidebar, isSidebarOpen } = useAdminLayout()

// Ambil info admin
type MeResponse = { ok: boolean; admin: { name: string; email: string } | null }
const { data: me } = await useFetch<MeResponse>('/api/auth/me', { method: 'GET' })

const adminName = computed(() => me.value?.admin?.name || 'Admin User')
const adminEmail = computed(() => me.value?.admin?.email || 'admin@example.com')
const adminInitials = computed(() => {
  const parts = adminName.value.trim().split(/\s+/)
  const ini = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return (ini || 'A').toUpperCase()
})

// Breadcrumbs
const breadcrumbs = computed(() => {
  const pathParts = route.path.split('/').filter(p => p && p !== 'admin')
  const crumbs = [{ name: 'Dashboard', to: '/admin', isLast: pathParts.length === 0 }]
  let currentPath = '/admin'
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`
    crumbs.push({
      name: part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      to: currentPath,
      isLast: index === pathParts.length - 1
    })
  })
  return crumbs
})

// Dropdown refs
const profileMenu = ref<HTMLDetailsElement | null>(null)
const notifyMenu = ref<HTMLDetailsElement | null>(null)

const onProfileToggle = () => {
  if (profileMenu.value?.open && notifyMenu.value?.open) notifyMenu.value.open = false
}
const onNotifyToggle = () => {
  if (notifyMenu.value?.open && profileMenu.value?.open) profileMenu.value.open = false
}

// Auto-close click di luar & Esc
const handleGlobalPointerDown = (e: Event) => {
  const target = e.target as Node
  if (profileMenu.value && profileMenu.value.open && !profileMenu.value.contains(target)) {
    profileMenu.value.open = false
  }
  if (notifyMenu.value && notifyMenu.value.open && !notifyMenu.value.contains(target)) {
    notifyMenu.value.open = false
  }
}
const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (profileMenu.value?.open) profileMenu.value.open = false
    if (notifyMenu.value?.open) notifyMenu.value.open = false
  }
}
onMounted(() => {
  window.addEventListener('pointerdown', handleGlobalPointerDown, { passive: true })
  window.addEventListener('keydown', handleGlobalKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleGlobalPointerDown)
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// Logout top bar (sama seperti sidebar)
const topbarLogoutLoading = ref(false)
const handleTopbarLogout = async () => {
  if (topbarLogoutLoading.value) return
  topbarLogoutLoading.value = true
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch (e) {
    console.error('Failed to logout', e)
  } finally {
    topbarLogoutLoading.value = false
    if (profileMenu.value?.open) profileMenu.value.open = false
    await router.push('/admin/login')
  }
}
</script>

<template>
  <header class="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      
      <!-- Left: Hamburger + Breadcrumbs -->
      <div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <!-- Hamburger -->
        <button
          type="button"
          @click="toggleSidebar"
          class="lg:hidden relative flex items-center justify-center h-10 w-10 rounded-lg text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Buka sidebar"
        >
          <div class="relative h-5 w-5">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M4 6h16" class="transition-all duration-300 ease-out origin-center" :class="{ 'rotate-45 translate-y-1.5': isSidebarOpen }" />
              <path d="M4 12h16" class="transition-all duration-200 ease-out" :class="{ 'opacity-0 scale-75': isSidebarOpen }" />
              <path d="M4 18h16" class="transition-all duration-300 ease-out origin-center" :class="{ '-rotate-45 -translate-y-1.5': isSidebarOpen }" />
            </svg>
          </div>
        </button>

        <!-- Breadcrumbs -->
        <nav class="hidden lg:flex items-center text-sm font-medium min-w-0" aria-label="Breadcrumb">
          <ol class="flex items-center gap-1.5 text-gray-600 min-w-0">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.to" class="flex items-center gap-1.5 min-w-0">
              <NuxtLink
                :to="crumb.to"
                :class="[
                  'transition-all duration-200 px-2.5 py-1.5 rounded-md truncate',
                  crumb.isLast 
                    ? 'text-gray-900 font-semibold bg-gradient-to-br from-blue-50 to-indigo-50 pointer-events-none' 
                    : 'hover:text-blue-600 hover:bg-gray-50'
                ]"
                :aria-current="crumb.isLast ? 'page' : undefined"
              >
                {{ crumb.name }}
              </NuxtLink>
              <svg v-if="!crumb.isLast" class="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </li>
          </ol>
        </nav>

        <!-- Mobile Breadcrumb (last only) -->
        <div class="lg:hidden flex items-center min-w-0">
          <span class="text-sm font-semibold text-gray-900 truncate">
            {{ breadcrumbs[breadcrumbs.length - 1]?.name }}
          </span>
        </div>
      </div>

      <!-- Right: Notifications + Profile -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Notifications -->
        <details ref="notifyMenu" @toggle="onNotifyToggle" class="relative">
          <summary
            class="group list-none flex items-center justify-center h-10 w-10 rounded-lg text-gray-600 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:text-amber-600 cursor-pointer transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Notifikasi"
          >
            <div class="relative">
              <svg class="h-5 w-5 transition-transform group-hover:scale-110 duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.69 18 14.142V10c0-3.314-2.686-6-6-6S6 6.686 6 10v4.142c0 .548-.21 1.068-.595 1.453L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
          </summary>
          <div class="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-xl bg-white shadow-xl border border-gray-200/80 z-30 animate-in slide-in-from-top-2 fade-in duration-200">
            <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div class="flex items-center justify-between">
                <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg class="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.69 18 14.142V10c0-3.314-2.686-6-6-6S6 6.686 6 10v4.142c0 .548-.21 1.068-.595 1.453L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notifikasi
                </h3>
              </div>
            </div>
            <div class="p-6 text-center">
              <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-3">
                <svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405C18.21 15.21 18 14.69 18 14.142V10c0-3.314-2.686-6-6-6S6 6.686 6 10v4.142c0 .548-.21 1.068-.595 1.453L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p class="text-sm font-medium text-gray-900 mb-1">Belum ada notifikasi</p>
              <p class="text-xs text-gray-500">Notifikasi baru akan muncul di sini</p>
            </div>
          </div>
        </details>

        <!-- Divider -->
        <div class="hidden sm:block h-6 w-px bg-gray-200"></div>

        <!-- Profile -->
        <details ref="profileMenu" @toggle="onProfileToggle" class="relative">
          <summary
            class="group list-none flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Menu profil"
          >
            <!-- Avatar -->
            <div class="relative">
              <span class="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all duration-200">
                {{ adminInitials }}
              </span>
              <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
            </div>
            <!-- Nama & email singkat (≥sm) -->
            <div class="hidden sm:flex flex-col leading-tight min-w-0">
              <span class="text-xs font-semibold text-gray-900 truncate max-w-[10rem]">{{ adminName }}</span>
              <span class="text-[10px] text-gray-500 truncate max-w-[10rem]">{{ adminEmail }}</span>
            </div>
            <svg class="hidden sm:block h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <!-- Dropdown -->
          <div class="absolute right-0 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-xl border border-gray-200/80 z-30 animate-in slide-in-from-top-2 fade-in duration-200">
            <!-- Header -->
            <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div class="flex items-center gap-3">
                <span class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {{ adminInitials }}
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-gray-900 truncate">{{ adminName }}</p>
                  <p class="text-xs text-gray-600 truncate">{{ adminEmail }}</p>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div class="p-2">
              <NuxtLink
                to="/admin/profile"
                class="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200"
                @click="() => { if (profileMenu?.open) profileMenu.open = false }"
              >
                <svg class="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profil Saya</span>
              </NuxtLink>

              <div class="my-2 h-px bg-gray-100"></div>

              <button
                type="button"
                :disabled="topbarLogoutLoading"
                @click="handleTopbarLogout"
                class="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                       text-red-600 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:text-red-700
                       disabled:opacity-50 disabled:cursor-wait"
              >
                <svg
                v-if="!topbarLogoutLoading"
                width="20" height="20" viewBox="0 0 24 24"
                fill="currentColor" xmlns="http://www.w3.org/2000/svg"
                class="text-red-400 group-hover:text-red-600 transition-colors"
                >
                <path d="M16 13V11H8V8L3 12L8 16V13H16ZM20 3H12V5H20V19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z"/>
                </svg>
                <svg v-else class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.14 5.82 3 7.94l3-2.65z"/>
                </svg>
                <span>{{ topbarLogoutLoading ? 'Logging out...' : 'Logout' }}</span>
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  </header>
</template>
