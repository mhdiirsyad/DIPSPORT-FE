<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useAdminLayout } from '~/composables/useAdminLayout'

// --- 1. PERUBAHAN TIPE: Menambahkan 'facility' ---
type NavItem = {
  label: string
  icon: 'dashboard' | 'stadium' | 'field' | 'facility' | 'schedule' | 'booking' | 'profile' | 'logout'
  to?: string
  action?: 'logout'
  exact?: boolean
}

const router = useRouter()
const route = useRoute()
const logoutLoading = ref(false)
const { isSidebarOpen, closeSidebar } = useAdminLayout()

// --- 2. PERUBAHAN NAV: Menambahkan 'Manajemen Fasilitas' ---
const primaryNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin', exact: true },
  { label: 'Manajemen Stadion', icon: 'stadium', to: '/admin/stadiums' },
  { label: 'Manajemen Lapangan', icon: 'field', to: '/admin/fields' },
  { label: 'Manajemen Fasilitas', icon: 'facility', to: '/admin/facilities' }, // <-- BARIS BARU
  { label: 'Manajemen Jadwal', icon: 'schedule', to: '/admin/schedules' },
  { label: 'Manajemen Booking', icon: 'booking', to: '/admin/bookings' },
]

const secondaryNav: NavItem[] = [
  { label: 'Profil', icon: 'profile', to: '/admin/profile' },
  { label: 'Logout', icon: 'logout', action: 'logout' },
]

const normalizePath = (input: string) => input.replace(/\/+$/, '') || '/'
const currentPath = computed(() => normalizePath((route as RouteLocationNormalizedLoaded).path || '/'))

const isActive = (item: NavItem) => {
  if (!item.to) return false
  const target = normalizePath(item.to)
  if (item.exact) return currentPath.value === target
  return currentPath.value === target || currentPath.value.startsWith(`${target}/`)
}

const handleNavClick = () => {
  if (window.innerWidth < 1024) closeSidebar()
}

const handleAction = async (item: NavItem) => {
  if (item.action === 'logout') {
    if (logoutLoading.value) return
    logoutLoading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Failed to logout', error)
    } finally {
      logoutLoading.value = false
      await router.push('/admin/login')
      handleNavClick()
    }
  }
}
</script>

<template>
  <aside
    class="bg-ds-blue-900 text-white flex flex-col justify-between h-full fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 ease-in-out border-r border-ds-blue-800"
    :class="[isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']"
  >
    <!-- Logo & Title -->
    <div class="px-6 py-7 border-b border-ds-blue-800">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg blur-md opacity-30"></div>
          <img
            src="~/assets/images/logo-dipsport.svg"
            alt="Dipsport Logo"
            class="relative h-11 w-auto drop-shadow-lg mt-2"
          />
        </div>
        <div class="flex flex-col">
          <p class="font-bold text-base text-white leading-tight tracking-wide">VENUE UNDIP</p>
          <p class="text-xs text-blue-200/90 leading-tight font-medium">Admin Panel</p>
        </div>
      </div>
    </div>

    <!-- Primary Navigation -->
    <nav aria-label="Admin utama" class="px-4 py-6 flex-1">
      <p class="px-3 mb-3 text-[10px] uppercase tracking-widest font-bold text-blue-400">Main Menu</p>
      <ul class="space-y-1">
        <li v-for="item in primaryNav" :key="item.to">
          <NuxtLink
            :to="item.to"
            @click="handleNavClick"
            class="group relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            :class="[
              isActive(item)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-200 hover:bg-ds-blue-800 hover:text-white'
            ]"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <span
              v-if="isActive(item)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
            ></span>

            <span
              class="w-5 h-5 flex-shrink-0 transition-transform duration-200"
              :class="[isActive(item) ? 'text-white' : 'text-blue-300 group-hover:text-white']"
            >
              <!-- Dashboard -->
              <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 11H11V5H5V11ZM5 19H11V13H5V19ZM13 19H19V13H13V19ZM13 5V11H19V5H13Z"/>
              </svg>

              <!-- Stadium -->
              <svg v-else-if="item.icon === 'stadium'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C6.48 3 2 5.24 2 8V12C2 14.76 6.48 17 12 17C17.52 17 22 14.76 22 12V8C22 5.24 17.52 3 12 3ZM4 8C4 6.34 7.58 5 12 5C16.42 5 20 6.34 20 8C20 9.66 16.42 11 12 11C7.58 11 4 9.66 4 8ZM20 12C20 12.24 19.94 12.48 19.8 12.71C18.92 14.15 15.78 15 12 15C8.22 15 5.08 14.15 4.2 12.71C4.06 12.48 4 12.24 4 12V10.74C5.77 11.64 8.64 12.25 12 12.25C15.36 12.25 18.23 11.64 20 10.74V12Z"/>
              </svg>

              <!-- Field -->
              <svg v-else-if="item.icon === 'field'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5H4ZM4 7H11V17H4V7ZM13 7H20V17H13V7ZM9 9C8.45 9 8 9.45 8 10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10C10 9.45 9.55 9 9 9ZM15 9C14.45 9 14 9.45 14 10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10C16 9.45 15.55 9 15 9Z"/>
              </svg>

              <!-- Facility (NEW) -->
              <svg v-else-if="item.icon === 'facility'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 19V17H13V19H11ZM11 15V13H13V15H11ZM7 15V13H9V15H7ZM7 11V9H9V11H7ZM11 11V9H13V11H11ZM15 11V9H17V11H15ZM15 7V5H17V7H15ZM11 7V5H13V7H11ZM5 7V5H7V7H5ZM5 11V9H3V11H5ZM5 15V13H3V15H5ZM5 19V17H3V19H5ZM15 19V17H17V19H15ZM19 19V17H21V19H19ZM19 15V13H21V15H19ZM19 11V9H21V11H19ZM19 7V5H21V7H19ZM15 3V5H9V3H15Z"/>
              </svg>

              <!-- Schedule -->
              <svg v-else-if="item.icon === 'schedule'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3V5H5C3.9 5 3 5.9 3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V7C21 5.9 20.1 5 19 5H17V3H15V5H9V3H7ZM5 9H19V19H5V9ZM7 11V13H12V11H7ZM13 11V13H17V11H13ZM7 15V17H12V15H7ZM13 15V17H17V15H13Z"/>
              </svg>

              <!-- Booking -->
              <svg v-else-if="item.icon === 'booking'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3C4.9 3 4 3.9 4 5V21L12 17L20 21V5C20 3.9 19.1 3 18 3H6ZM6 5H18V17.97L12 15.2L6 17.97V5Z"/>
              </svg>
            </span>

            <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>

            <svg
              v-if="isActive(item)"
              class="w-4 h-4 text-white opacity-75"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Secondary Navigation (Account) -->
    <nav class="px-4 pb-6 border-t border-ds-blue-800" aria-label="Pengaturan akun">
      <div class="pt-6">
        <p class="px-3 mb-3 text-[10px] uppercase tracking-widest font-bold text-blue-400">Account</p>
        <ul class="space-y-1">
          <li v-for="item in secondaryNav" :key="item.label">
            <!-- Profile Link -->
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              @click="handleNavClick"
              class="group relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              :class="[
                isActive(item)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-200 hover:bg-ds-blue-800 hover:text-white'
              ]"
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              <span
                v-if="isActive(item)"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
              ></span>

              <span
                class="w-5 h-5 flex-shrink-0 transition-transform duration-200"
                :class="[isActive(item) ? 'text-white' : 'text-blue-300 group-hover:text-white']"
              >
                <svg v-if="item.icon === 'profile'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12ZM12 14C8.13 14 2 16.17 2 20V22H22V20C22 16.17 15.87 14 12 14Z"/>
                </svg>
              </span>

              <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>

              <svg
                v-if="isActive(item)"
                class="w-4 h-4 text-white opacity-75"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>

            <!-- Logout Button -->
            <button
              v-else
              type="button"
              class="group w-full relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-red-300 hover:bg-red-900/30 hover:text-red-200 disabled:opacity-50 disabled:cursor-wait"
              :disabled="logoutLoading"
              @click="handleAction(item)"
            >
              <span class="w-5 h-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110">
                <svg
                  v-if="!logoutLoading"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 13V11H8V8L3 12L8 16V13H16ZM20 3H12V5H20V19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z"/>
                </svg>
                <svg
                  v-else
                  class="animate-spin"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
              </span>
              <span class="flex-1 whitespace-nowrap text-left">
                {{ logoutLoading ? 'Logging out...' : item.label }}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>