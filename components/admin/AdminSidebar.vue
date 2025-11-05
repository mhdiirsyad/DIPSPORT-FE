<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type NavItem = {
  label: string
  icon: 'dashboard' | 'stadium' | 'field' | 'schedule' | 'booking' | 'profile' | 'logout'
  to?: string
  action?: 'logout'
  exact?: boolean
}

const router = useRouter()
const route = useRoute()
const logoutLoading = ref(false)

const primaryNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin', exact: true },
  { label: 'Manajemen Stadion', icon: 'stadium', to: '/admin/stadiums' },
  { label: 'Manajemen Lapangan', icon: 'field', to: '/admin/fields' },
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
  if (item.exact) {
    return currentPath.value === target
  }
  return currentPath.value === target || currentPath.value.startsWith(`${target}/`)
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
    }
  }
}
</script>

<template>
  <aside
    class="w-full lg:w-60 bg-ds-blue-900 text-[#e5edff] flex flex-col justify-between p-5 lg:p-7 lg:h-screen lg:sticky lg:top-0"
  >
    <div>
      <div class="flex items-center gap-3 mb-8">
        <div
          class="w-11 h-11 rounded-full bg-gradient-to-br from-white/20 to-white/10 grid place-items-center font-bold text-lg flex-shrink-0 text-white"
        >
          D
        </div>
        <div>
          <p class="font-bold text-base text-white">Dipsport</p>
          <p class="text-xs text-[#e5edff]/75">Admin Panel</p>
        </div>
      </div>

      <nav aria-label="Admin utama">
        <ul class="grid gap-1 w-full">
          <li v-for="item in primaryNav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
              :class="[
                isActive(item)
                  ? 'bg-white/10 text-white'
                  : 'hover:bg-white/10'
              ]"
              :aria-current="isActive(item) ? 'page' : undefined"
            >
              <span
                class="w-5 h-5 flex-shrink-0"
                :class="[isActive(item) ? 'text-white' : 'text-[#e5edff]/85']"
              >
                <svg
                  v-if="item.icon === 'dashboard'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 11H11V5H5V11ZM5 19H11V13H5V19ZM13 19H19V13H13V19ZM13 5V11H19V5H13Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'stadium'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3C6.48 3 2 5.24 2 8V12C2 14.76 6.48 17 12 17C17.52 17 22 14.76 22 12V8C22 5.24 17.52 3 12 3ZM4 8C4 6.34 7.58 5 12 5C16.42 5 20 6.34 20 8C20 9.66 16.42 11 12 11C7.58 11 4 9.66 4 8ZM20 12C20 12.24 19.94 12.48 19.8 12.71C18.92 14.15 15.78 15 12 15C8.22 15 5.08 14.15 4.2 12.71C4.06 12.48 4 12.24 4 12V10.74C5.77 11.64 8.64 12.25 12 12.25C15.36 12.25 18.23 11.64 20 10.74V12Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'field'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 5C2.9 5 2 5.9 2 7V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V7C22 5.9 21.1 5 20 5H4ZM4 7H11V17H4V7ZM13 7H20V17H13V7ZM9 9C8.45 9 8 9.45 8 10C8 10.55 8.45 11 9 11C9.55 11 10 10.55 10 10C10 9.45 9.55 9 9 9ZM15 9C14.45 9 14 9.45 14 10C14 10.55 14.45 11 15 11C15.55 11 16 10.55 16 10C16 9.45 15.55 9 15 9Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'schedule'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 3V5H5C3.9 5 3 5.9 3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V7C21 5.9 20.1 5 19 5H17V3H15V5H9V3H7ZM5 9H19V19H5V9ZM7 11V13H12V11H7ZM13 11V13H17V11H13ZM7 15V17H12V15H7ZM13 15V17H17V15H13Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  v-else-if="item.icon === 'booking'"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 3C4.9 3 4 3.9 4 5V21L12 17L20 21V5C20 3.9 19.1 3 18 3H6ZM6 5H18V17.97L12 15.2L6 17.97V5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>

    <nav class="mt-8 pt-6 border-t border-white/10" aria-label="Pengaturan akun">
      <ul class="grid gap-1">
        <li v-for="item in secondaryNav" :key="item.label">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
            :class="[
              isActive(item)
                ? 'bg-white/10 text-white'
                : 'hover:bg-white/10'
            ]"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <span
              class="w-5 h-5 flex-shrink-0"
              :class="[isActive(item) ? 'text-white' : 'text-[#e5edff]/85']"
            >
              <svg
                v-if="item.icon === 'profile'"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.76 12 17 9.76 17 7C17 4.24 14.76 2 12 2C9.24 2 7 4.24 7 7C7 9.76 9.24 12 12 12ZM12 14C8.13 14 2 16.17 2 20V22H22V20C22 16.17 15.87 14 12 14Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="flex-1 whitespace-nowrap">{{ item.label }}</span>
          </NuxtLink>

          <button
            v-else
            type="button"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-60 disabled:cursor-wait"
            :disabled="logoutLoading"
            @click="handleAction(item)"
          >
            <span class="w-5 h-5 flex-shrink-0 text-[#e5edff]/85">
              <svg
                v-if="item.icon === 'logout'"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 13V11H8V8L3 12L8 16V13H16ZM20 3H12V5H20V19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span class="flex-1 whitespace-nowrap text-left">
              {{ logoutLoading ? 'Logging out...' : item.label }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
/* Tidak ada style khusus yang diperlukan untuk fungsionalitas ini */
</style>