import { ref, computed, onMounted, onUnmounted } from 'vue'
import { AUTH } from '~/utils/constants'

interface UseAuthSessionReturn {
  isAuthenticated: Ref<boolean>
  timeRemaining: Ref<number>
  isExpiringSoon: Ref<boolean>
  checkSession: () => Promise<boolean>
  refreshSession: () => Promise<boolean>
  logout: () => Promise<void>
  startMonitoring: () => void
}

const SESSION_CHECK_INTERVAL = 60 * 1000 // Check every minute
const WARNING_THRESHOLD = 5 * 60 // 5 minutes before expiry

export const useAuthSession = (): UseAuthSessionReturn => {
  const isAuthenticated = ref(false)
  const sessionExpiry = ref<number | null>(null)
  const timeRemaining = ref(0)
  
  let checkInterval: ReturnType<typeof setInterval> | null = null
  let warningShown = false

  const isExpiringSoon = computed(() => {
    return timeRemaining.value > 0 && timeRemaining.value <= WARNING_THRESHOLD
  })

  const checkSession = async (): Promise<boolean> => {
    try {
      const data = await $fetch<{ 
        authenticated: boolean
        expiresAt?: number
      }>('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (!data?.authenticated) {
        isAuthenticated.value = false
        sessionExpiry.value = null
        return false
      }

      isAuthenticated.value = true
      
      // Use server-provided expiry time if available
      if (data.expiresAt) {
        sessionExpiry.value = data.expiresAt
      } else {
        // Fallback: calculate from current time
        sessionExpiry.value = Date.now() + (AUTH.TOKEN_MAX_AGE * 1000)
      }
      
      return true
    } catch {
      isAuthenticated.value = false
      return false
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      const isValid = await checkSession()
      
      if (isValid) {
        warningShown = false
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch {
      // Ignore logout errors
    } finally {
      isAuthenticated.value = false
      sessionExpiry.value = null
      await navigateTo('/admin/login')
    }
  }

  const updateTimeRemaining = () => {
    if (!sessionExpiry.value) {
      timeRemaining.value = 0
      return
    }

    const remaining = Math.max(0, Math.floor((sessionExpiry.value - Date.now()) / 1000))
    timeRemaining.value = remaining

    // Show warning jika akan expired dalam 5 menit
    if (isExpiringSoon.value && !warningShown) {
      warningShown = true
      showExpiryWarning()
    }

    // Auto logout jika sudah expired
    if (remaining === 0 && isAuthenticated.value) {
      handleSessionExpired()
    }
  }

  const showExpiryWarning = () => {
    const minutesRemaining = Math.ceil(timeRemaining.value / 60)
    
    if (process.client && window.confirm(
      `Sesi Anda akan berakhir dalam ${minutesRemaining} menit.\n\n` +
      `Klik OK untuk memperpanjang sesi, atau Cancel untuk logout.`
    )) {
      refreshSession()
    }
  }

  const handleSessionExpired = () => {
    if (process.client) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.')
    }
    logout()
  }

  const startMonitoring = () => {
    checkSession()

    checkInterval = setInterval(() => {
      updateTimeRemaining()
      
      // Re-check session every 5 minutes
      if (timeRemaining.value % 300 === 0) {
        checkSession()
      }
    }, 1000) // Update every second for accurate countdown
  }

  const stopMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
  }

  // Auto start monitoring when component mounted
  onMounted(() => {
    if (process.client) {
      startMonitoring()
    }
  })

  // Cleanup on unmount
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    isAuthenticated,
    timeRemaining,
    isExpiringSoon,
    checkSession,
    refreshSession,
    logout,
    startMonitoring
  }
}
