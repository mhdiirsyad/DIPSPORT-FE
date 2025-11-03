<script setup lang="ts">
defineOptions({ name: 'AdminLogin' })

// Form state
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)
const errorField = ref<'email' | 'password' | null>(null)

const passwordFieldType = ref<'password' | 'text'>('password')
const router = useRouter()
const route = useRoute()
// $fetch is auto-imported in Nuxt 3, no need to import or destructure it

const resolveNextRoute = (rawNext: unknown) => {
  if (typeof rawNext !== 'string') {
    return '/admin'
  }

  const trimmed = rawNext.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/admin'
  }

  return trimmed || '/admin'
}

const togglePasswordVisibility = () => {
  passwordFieldType.value =
    passwordFieldType.value === 'password' ? 'text' : 'password'
}

// Validasi form client-side
function validateForm(): string | null {
  errorMsg.value = null
  errorField.value = null

  const trimmedEmail = email.value.trim()

  // Email wajib diisi
  if (!trimmedEmail) {
    errorMsg.value = 'Email harus diisi.'
    errorField.value = 'email'
    return null
  }

  // Format email harus valid
  const emailRegex = /^\S+@\S+\.\S+$/
  if (!emailRegex.test(trimmedEmail)) {
    errorMsg.value = 'Format email tidak valid. Contoh: nama@domain.com'
    errorField.value = 'email'
    return null
  }

  // Password wajib diisi
  if (!password.value.trim()) {
    errorMsg.value = 'Password harus diisi.'
    errorField.value = 'password'
    return null
  }

  // Password minimal 8 karakter
  if (password.value.length < 8) {
    errorMsg.value = 'Password minimal harus 8 karakter.'
    errorField.value = 'password'
    return null
  }

  email.value = trimmedEmail
  return trimmedEmail
}

// Submit
const onSubmit = async () => {
  const trimmedEmail = validateForm()
  if (!trimmedEmail) return

  loading.value = true
  try {
    const response = await $fetch<{ ok: boolean; admin: any }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: { email: trimmedEmail, password: password.value },
      }
    )

    if (!response?.ok) throw new Error('Login gagal')

    console.log('Next route:', resolveNextRoute(route.query.next))
    await navigateTo(resolveNextRoute('/admin'))

    // Redirect ke halaman dashboard
    // if(import.meta.client) {
    //   await router.push(resolveNextRoute(route.query.next))
    // }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Login gagal'
    errorField.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="ds-login-page">
    <div class="ds-header">
      <div class="ds-logo-container">
        <svg
          class="ds-logo"
          width="104"
          height="106"
          viewBox="0 0 104 106"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g filter="url(#filter0_ddd_24_8)">
            <rect x="12" y="4" width="80" height="80" rx="16" fill="url(#paint0_linear_24_8)" />
            <foreignObject x="24" y="16" width="56" height="56">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style="backdrop-filter: blur(2px); clip-path: url(#bgblur_0_24_8_clip_path); height: 100%; width: 100%;"
              />
            </foreignObject>
            <g data-figma-bg-blur-radius="4">
              <rect x="28" y="20" width="48" height="48" rx="8" fill="white" fill-opacity="0.2" />
              <rect x="32" y="34" width="13.33" height="30" rx="2" fill="white" />
              <rect x="49.3301" y="24" width="13.33" height="40" rx="2" fill="white" />
            </g>
          </g>
          <defs>
            <filter
              id="filter0_ddd_24_8"
              x="0"
              y="0"
              width="104"
              height="106"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_24_8" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_24_8" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_24_8" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="7.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend mode="normal" in2="effect1_dropShadow_24_8" result="effect2_dropShadow_24_8" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feMorphology radius="4" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_24_8" />
              <feOffset />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
              <feBlend mode="normal" in2="effect2_dropShadow_24_8" result="effect3_dropShadow_24_8" />
              <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_24_8" result="shape" />
            </filter>
            <clipPath id="bgblur_0_24_8_clip_path" transform="translate(-24 -16)">
              <rect x="28" y="20" width="48" height="48" rx="8" />
            </clipPath>
            <linearGradient id="paint0_linear_24_8" x1="12" y1="4" x2="92" y2="84" gradientUnits="userSpaceOnUse">
              <stop stop-color="#162953" />
              <stop offset="1" stop-color="#3D59AB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="ds-brand-name-text">DIPSPORT</h1>
    </div>

    <div class="ds-login-card">
      <h2 class="ds-login-card-title">Admin Login</h2>
      <p class="ds-login-card-subtitle">
        Please enter your credentials to continue.
      </p>

      <form @submit.prevent="onSubmit" class="ds-login-form">
        <!-- Email -->
        <label class="ds-form-label">
          <span class="ds-form-label-text">Email</span>
          <div
            class="ds-input-wrapper"
            :class="{ 'has-error': errorField === 'email' }"
          >
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              autocomplete="email"
              class="ds-input-field"
            />
          </div>
        </label>

        <!-- Password -->
        <label class="ds-form-label">
          <span class="ds-form-label-text">Password</span>
          <div
            class="ds-input-wrapper"
            :class="{ 'has-error': errorField === 'password' }"
          >
            <input
              v-model="password"
              :type="passwordFieldType"
              required
              placeholder="Enter your password"
              autocomplete="current-password"
              class="ds-input-field"
            />
            <button
              type="button"
              class="ds-password-toggle"
              :aria-pressed="passwordFieldType === 'text'"
              :aria-label="
                passwordFieldType === 'password'
                  ? 'Show password'
                  : 'Hide password'
              "
              :title="
                passwordFieldType === 'password'
                  ? 'Show password'
                  : 'Hide password'
              "
              @click="togglePasswordVisibility"
            >
              <!-- Password Hidden (Eye Open) -->
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
              <!-- Password Shown (Eye Closed) -->
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

        <!-- Forgot Password Link -->
        <div class="ds-forgot-password">
          <a href="/admin/forgot-password" class="ds-forgot-password-link">Forgot password?</a>
        </div>

        <!-- Submit Button -->
        <button
          :disabled="loading"
          class="ds-button-primary is-filled ds-login-button"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <!-- Error Message -->
        <p v-if="errorMsg" class="ds-error-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8 1.5C4.4 1.5 1.5 4.4 1.5 8S4.4 14.5 8 14.5S14.5 11.6 14.5 8S11.6 1.5 8 1.5ZM8 12C7.59 12 7.25 11.66 7.25 11.25C7.25 10.84 7.59 10.5 8 10.5C8.41 10.5 8.75 10.84 8.75 11.25C8.75 11.66 8.41 12 8 12ZM8.75 4.5H7.25V8.5H8.75V4.5Z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errorMsg }}</span>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Layout & Container */
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

.ds-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem; 
  margin-bottom: 1rem;
}

/* Logo */
.ds-logo-container {
  display: flex;
  justify-content: center;
}

.ds-logo {
  width: 80px;
  height: 82px;
  flex-shrink: 0;
}

/* Brand Name */
.ds-brand-name-text {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 700;
  font-size: 2.1rem;
  color: var(--ds-surface);
  margin: 0;
}

/* Login Card */
.ds-login-card {
  background: var(--ds-surface);
  border-radius: var(--ds-radius-md);
  padding: 1.75rem 1.5rem;
  max-width: 340px;
  width: 100%;
  box-shadow: var(--ds-shadow-lg);
  border: 1px solid var(--ds-border);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0;
}

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

/* Form Layout */
.ds-login-form {
  display: grid;
  gap: 1rem;
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

/* Input */
.ds-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  padding: 0 0.7rem;
  height: 40px;
  background: var(--ds-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ds-input-wrapper:focus-within {
  border-color: var(--ds-blue-500);
  box-shadow: 0 0 0 2px rgba(46, 111, 210, 0.2);
}

/* Error State */
.ds-input-wrapper.has-error {
  border-color: #ef4444;
}

.ds-input-wrapper.has-error:focus-within {
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

/* Input Field */
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

/* Password Toggle */
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

/* Forgot Password */
.ds-forgot-password {
  text-align: right;
  margin-top: -0.5rem;
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

/* Submit Button */
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
}

.ds-login-button:hover:not(:disabled) {
  background: var(--ds-blue-800);
}

.ds-login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error Message */
.ds-error-message {
  color: #ef4444;
  font-size: 0.8rem;
  text-align: center;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

/* Responsive */
@media (max-width: 480px) {
  .ds-header {
    gap: 0.1rem;
    margin-bottom: 1.2rem;
  }
  .ds-logo {
    width: 65px;
    height: 67px;
  }
  .ds-brand-name-text {
    font-size: 1.7rem;
  }
  .ds-login-page {
    padding: 1rem;
  }
  .ds-login-card {
    padding: 1.5rem 1.25rem;
  }
}
</style>
