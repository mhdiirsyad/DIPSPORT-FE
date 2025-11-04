/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'ds-blue-900': '#162953',
        'ds-blue-800': '#1f3a7b',
        'ds-blue-700': '#3D59AB',
        'ds-blue-600': '#4a68c1',
        'ds-surface': '#ffffff',
        'ds-body': '#f2f4f7',
        'ds-muted': '#6b7280',
        'ds-text': '#0f172a',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '1rem',
      },
      boxShadow: {
        'ds-lg': '0 20px 45px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        'ds-gradient-blue':
          'radial-gradient(circle at top, #244f9e 0%, #162953 40%, #122145 85%)',
      },
    },
  },
  plugins: [],
};