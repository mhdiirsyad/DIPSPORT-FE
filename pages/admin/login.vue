<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFetch } from 'nuxt/app'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const passwordFieldType = ref<'password' | 'text'>('password')

const router = useRouter()
const route = useRoute()

const togglePasswordVisibility = () => {
  passwordFieldType.value =
    passwordFieldType.value === 'password' ? 'text' : 'password'
}

const onSubmit = async () => { // Validasi Client Side
  errorMsg.value = null

  // 1. Cek email kosong
  if (!email.value.trim()) {
    errorMsg.value = 'Email harus diisi.'
    return
  }

  // 2. Cek format email (harus ada @ dan .)
  const emailRegex = /^\S+@\S+\.\S+$/
  if (!emailRegex.test(email.value)) {
    errorMsg.value = 'Format email tidak valid. Contoh: nama@domain.com'
    return
  }

  // 3. Cek password kosong
  if (!password.value.trim()) {
    errorMsg.value = 'Password harus diisi.'
    return
  }

  loading.value = true
  try {
    const { data, error } = await useFetch<{ ok: boolean; admin: any }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { email: email.value, password: password.value },
      }
    )
    if (error.value) {
      throw new Error((error.value as any).statusMessage || 'Login gagal')
    }
    if (!data.value?.ok) throw new Error('Login gagal')
    await router.push((route.query.next as string) || '/admin')
  } catch (e: any) {
    errorMsg.value = e?.message || 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ds-login-page">
    <h1 class="ds-brand-name-text">DIPSPORT</h1>

    <div class="ds-login-card">
      <h2 class="ds-login-card-title">Admin Login</h2>
      <p class="ds-login-card-subtitle">
        Please enter your credentials to continue.
      </p>

      <form @submit.prevent="onSubmit" class="ds-login-form">
        <label class="ds-form-label">
          <span class="ds-form-label-text">Email</span>
          <div class="ds-input-wrapper">
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="ds-input-field"
            />
          </div>
        </label>

        <label class="ds-form-label">
          <span class="ds-form-label-text">Password</span>
          <div class="ds-input-wrapper">
            <input
              v-model="password"
              :type="passwordFieldType"
              required
              placeholder="Enter your password"
              class="ds-input-field"
            />
            <button
              type="button"
              class="ds-password-toggle"
              @click="togglePasswordVisibility"
            >
              <svg
                v-if="passwordFieldType === 'password'"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9.5C10.62 9.5 9.5 10.62 9.5 12C9.5 13.38 10.62 14.5 12 14.5C13.38 14.5 14.5 13.38 14.5 12C14.5 10.62 13.38 9.5 12 9.5Z"
                  fill="#6B7280"
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
                  d="M12 7C14.76 7 17 9.24 17 12C17 12.73 16.8 13.41 16.47 14.03L17.72 15.28C18.89 14.15 19.82 12.66 20.3 11.2C21.27 7.61 17 4.5 12 4.5C10.7 4.5 9.49 4.73 8.4 5.18L9.97 6.75C10.6 6.88 11.27 7 12 7ZM2.39 3.73L1.11 5L3 6.89C2.06 7.83 1.32 8.96 1 10.2C2.73 14.39 7 17.5 12 17.5C13.38 17.5 14.67 17.27 15.84 16.84L18.73 19.73L20 18.46L2.39 3.73ZM7.53 9.8L9.09 11.36C9.03 11.57 9 11.78 9 12C9 13.66 10.34 15 12 15C12.22 15 12.43 14.97 12.64 14.91L14.2 16.47C13.53 16.8 12.79 17 12 17C9.24 17 7 14.76 7 12C7 11.21 7.2 10.47 7.53 9.8Z"
                  fill="#6B7280"
                />
              </svg>
            </button>
          </div>
        </label>

        <div class="ds-forgot-password">
          <a href="#" class="ds-forgot-password-link">Forgot password?</a>
        </div>

        <button
          :disabled="loading"
          class="ds-button-primary is-filled ds-login-button"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <p v-if="errorMsg" class="ds-error-message">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.ds-login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ds-blue-900);
  background-image: var(--ds-gradient-blue);
  padding: 1.5rem;
}

/* Brand Text */
.ds-brand-name-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 700;
  font-size: 2.2rem;
  color: var(--ds-surface);
  margin-bottom: 1rem;
}

/* Login Card */
.ds-login-card {
  background: var(--ds-surface);
  border-radius: var(--ds-radius-md);
  padding: 1.75rem 1.5rem; /* Atas-bawah 1.75rem, kiri-kanan 1.5rem */
  max-width: 340px;
  width: 100%;
  box-shadow: var(--ds-shadow-lg);
  border: 1px solid var(--ds-border);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Title & Subtitle */
.ds-login-card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--ds-blue-900);
  margin: 0 0 0.5rem 0; 
}

.ds-login-card-subtitle {
  font-size: 0.75rem;
  color: var(--ds-muted);
  margin: 0 0 1.5rem 0;
}

/* Form */
.ds-login-form {
  display: grid;
  gap: 0.75rem;
  text-align: left;
  width: 100%;
}

.ds-form-label {
  display: grid;
  gap: 0.25rem;
}

.ds-form-label-text {
  font-size: 0.8rem;
  color: var(--ds-text);
  font-weight: 500;
}

.ds-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  padding: 0 0.7rem;
  height: 40px;
  background: var(--ds-surface);
  transition: border-color 0.2s ease;
}

.ds-input-wrapper:focus-within {
  border-color: var(--ds-blue-500);
}

.ds-input-field {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--ds-text);
  padding-right: 0.5rem;
}

.ds-input-field::placeholder {
  color: var(--ds-muted);
  opacity: 0.7;
}

.ds-password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-muted);
}

.ds-forgot-password {
  text-align: right;
  margin-top: -0.25rem;
  margin-bottom: 0.75rem;
}

.ds-forgot-password-link {
  font-size: 0.7rem;
  color: var(--ds-blue-600);
  text-decoration: none;
  font-weight: 500;
}

.ds-forgot-password-link:hover {
  text-decoration: underline;
}

.ds-login-button {
  width: 100%;
  height: 40px;
  border-radius: var(--ds-radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
  background: var(--ds-blue-700);
  color: var(--ds-surface);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  margin-top: 0.25rem;
}

.ds-login-button:hover:not(:disabled) {
  background: var(--ds-blue-800);
}

.ds-login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.ds-error-message {
  color: #ef4444;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 0.75rem;
  font-weight: 500;
}
</style>