<script setup lang="ts">
defineOptions({ name: 'AdminLogin' })

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const errorField = ref<'email' | 'password' | null>(null)
const passwordFieldType = ref<'password' | 'text'>('password')
const router = useRouter()
const route = useRoute()

const togglePasswordVisibility = () => {
  passwordFieldType.value =
    passwordFieldType.value === 'password' ? 'text' : 'password'
}

function validateForm(): string | null {
  errorMsg.value = null
  errorField.value = null

  const trimmedEmail = email.value.trim()
  const emailRegex = /^\S+@\S+\.\S+$/

  if (!trimmedEmail) {
    errorMsg.value = 'Email harus diisi.'
    errorField.value = 'email'
    return null
  }

  if (!emailRegex.test(trimmedEmail)) {
    errorMsg.value = 'Format email tidak valid. Contoh: nama@domain.com'
    errorField.value = 'email'
    return null
  }

  if (!password.value.trim()) {
    errorMsg.value = 'Password harus diisi.'
    errorField.value = 'password'
    return null
  }

  if (password.value.length < 8) {
    errorMsg.value = 'Password minimal harus 8 karakter.'
    errorField.value = 'password'
    return null
  }

  email.value = trimmedEmail
  return trimmedEmail
}

const onSubmit = async () => {
  const trimmedEmail = validateForm()
  if (!trimmedEmail) return

  loading.value = true
  try {
    const response = await $fetch<{ ok: boolean; admin: any }>('/api/auth/login', {
      method: 'POST',
      body: { email: trimmedEmail, password: password.value },
    })

    if (!response?.ok) throw new Error('Login gagal')

    await navigateTo('/admin')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Login gagal'
    errorField.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-ds-gradient-blue px-6">
    <div class="flex flex-col items-center gap-[0.25rem] mb-6">
      <div class="flex justify-center">
        <img
          src="~/assets/images/logo-dipsport.svg"
          alt="Dipsport Logo"
          class="w-20 h-20 sm:w-[80px] sm:h-[82px]"
        />
      </div>
      <h1 class="text-[2.1rem] font-bold text-ds-surface">DIPSPORT</h1>
    </div>

    <div
      class="flex w-full max-w-[340px] flex-col items-center rounded-md border border-ds-border bg-ds-surface px-6 py-7 text-center shadow-ds-lg"
    >
      <h2 class="text-[1.3rem] font-bold text-ds-blue-900 mb-1">Admin Login</h2>
      <p class="text-xs text-ds-muted mb-6">
        Please enter your credentials to continue.
      </p>

      <form @submit.prevent="onSubmit" class="grid gap-4 w-full text-left">
        <label class="grid gap-1">
          <span class="text-sm font-medium text-ds-text">Email</span>
          <div
            :class="[
              'relative flex items-center rounded-sm border px-3 h-10 transition-all',
              errorField === 'email'
                ? 'border-red-500 ring-1 ring-red-200'
                : 'border-ds-border focus-within:border-ds-blue-500 focus-within:ring-2 focus-within:ring-ds-blue-500/20'
            ]"
          >
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              autocomplete="email"
              class="flex-1 bg-transparent text-sm text-ds-text placeholder:text-ds-muted outline-none"
            />
          </div>
        </label>

        <label class="grid gap-1">
          <span class="text-sm font-medium text-ds-text">Password</span>
          <div
            :class="[
              'relative flex items-center rounded-sm border px-3 h-10 transition-all',
              errorField === 'password'
                ? 'border-red-500 ring-1 ring-red-200'
                : 'border-ds-border focus-within:border-ds-blue-500 focus-within:ring-2 focus-within:ring-ds-blue-500/20'
            ]"
          >
            <input
              v-model="password"
              :type="passwordFieldType"
              required
              placeholder="Enter your password"
              autocomplete="current-password"
              class="flex-1 bg-transparent text-sm text-ds-text placeholder:text-ds-muted outline-none pr-2"
            />
            <button
              type="button"
              class="flex items-center justify-center text-ds-muted"
              @click="togglePasswordVisibility"
            >
              <svg
                v-if="passwordFieldType === 'password'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                class="w-4 h-4"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17Z"
                  fill="#6B7280"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                class="w-4 h-4"
              >
                <path
                  d="M12 7C14.76 7 17 9.24 17 12C17 12.73 16.8 13.41 16.47 14.03L17.72 15.28C18.89 14.15 19.82 12.66 20.3 11.2C21.27 7.61 17 4.5 12 4.5ZM2.39 3.73L1.11 5L3 6.89C2.06 7.83 1.32 8.96 1 10.2C2.73 14.39 7 17.5 12 17.5C13.38 17.5 14.67 17.27 15.84 16.84L18.73 19.73L20 18.46L2.39 3.73Z"
                  fill="#6B7280"
                />
              </svg>
            </button>
          </div>
        </label>

        <div class="text-right -mt-2">
          <a
            href="/admin/forgot-password"
            class="text-xs font-medium text-ds-blue-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button
          :disabled="loading"
          class="flex h-10 w-full items-center justify-center rounded-sm bg-ds-blue-700 text-ds-surface font-bold text-sm hover:bg-ds-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <p
          v-if="errorMsg"
          class="mt-2 flex items-center justify-center gap-1 text-sm text-red-500 font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8S4.4 14.5 8 14.5S14.5 11.6 14.5 8S11.6 1.5 8 1.5ZM8 12C7.59 12 7.25 11.66 7.25 11.25C7.25 10.84 7.59 10.5 8 10.5C8.41 10.5 8.75 10.84 8.75 11.25C8.75 11.66 8.41 12 8 12ZM8.75 4.5H7.25V8.5H8.75V4.5Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ errorMsg }}</span>
        </p>
      </form>
    </div>
  </div>
</template>