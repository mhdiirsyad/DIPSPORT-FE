// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '@/assets/css/tailwind.css' 
  ],

  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
  ],

  app: {
    head: {
      htmlAttrs: {
        lang: 'id'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Platform booking lapangan olahraga online - DIPSPORT' },
        { name: 'author', content: 'DIPSPORT' }
      ],
      link: []
    },
    pageTransition: { 
      name: 'page', 
      mode: 'out-in' 
    },
    layoutTransition: { 
      name: 'layout', 
      mode: 'out-in' 
    }
  },

  ssr: true,

  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      }
    }
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      gqlHttpEndpoint: process.env.GQL_HTTP_ENDPOINT,
      bookingApiToken: process.env.BOOKING_API_TOKEN,
    },
  },
  typescript: { strict: true, typeCheck: true, shim: true },
})
