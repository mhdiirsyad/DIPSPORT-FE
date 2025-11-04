<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { $fetch } from 'ofetch'

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
  <aside class="admin-sidebar">
    <div class="admin-sidebar__brand">
      <div class="admin-sidebar__avatar" aria-hidden="true">D</div>
      <div>
        <p class="admin-sidebar__title">Dipsport</p>
        <p class="admin-sidebar__subtitle">Admin Panel</p>
      </div>
    </div>

    <nav class="admin-sidebar__nav" aria-label="Admin utama">
      <ul>
        <li v-for="item in primaryNav" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="admin-sidebar__link"
            :class="{ 'is-active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <span class="admin-sidebar__icon">
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
            <span class="admin-sidebar__label">{{ item.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <nav class="admin-sidebar__nav admin-sidebar__nav--secondary" aria-label="Pengaturan akun">
      <ul>
        <li v-for="item in secondaryNav" :key="item.label">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="admin-sidebar__link"
            :class="{ 'is-active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
          >
            <span class="admin-sidebar__icon">
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
              <svg
                v-else
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
            <span class="admin-sidebar__label">{{ item.label }}</span>
          </NuxtLink>
          <button
            v-else
            type="button"
            class="admin-sidebar__link admin-sidebar__link--button"
            :disabled="logoutLoading"
            @click="handleAction(item)"
          >
            <span class="admin-sidebar__icon">
              <svg
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
            <span class="admin-sidebar__label">
              {{ logoutLoading ? 'Logging out...' : item.label }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 240px;
  background: var(--ds-blue-900);
  color: #e5edff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.75rem 1.25rem;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.admin-sidebar__avatar {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08));
  color: #0f172a;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
}

.admin-sidebar__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
}

.admin-sidebar__subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: rgba(229, 237, 255, 0.75);
}

.admin-sidebar__nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.25rem;
}

.admin-sidebar__nav--secondary {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(229, 237, 255, 0.12);
}

.admin-sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--ds-radius-sm);
  color: inherit;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.admin-sidebar__link:hover {
  background: rgba(255, 255, 255, 0.12);
}

.admin-sidebar__link.is-active {
  background: rgba(69, 109, 255, 0.2);
  color: #ffffff;
}

.admin-sidebar__link--button {
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  color: inherit;
  font: inherit;
}

.admin-sidebar__link--button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.admin-sidebar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(229, 237, 255, 0.85);
}

.admin-sidebar__link.is-active .admin-sidebar__icon {
  color: #ffffff;
}

.admin-sidebar__label {
  flex: 1;
  white-space: nowrap;
}

@media (max-width: 1024px) {
  .admin-sidebar {
    width: 220px;
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    position: static;
    width: 100%;
    min-height: auto;
    flex-direction: row;
    padding: 1rem;
    gap: 1rem;
  }

  .admin-sidebar__brand {
    margin-bottom: 0;
  }

  .admin-sidebar__nav,
  .admin-sidebar__nav ul {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }

  .admin-sidebar__link {
    padding: 0.5rem 0.75rem;
  }

  .admin-sidebar__nav--secondary {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
}
</style>
