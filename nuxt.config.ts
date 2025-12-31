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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      // Preload critical CSS
      link: [
        { rel: 'preload', as: 'style', href: '/_nuxt/assets/css/tailwind.css' }
      ]
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

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      gqlHttpEndpoint: process.env.GQL_HTTP_ENDPOINT,
      bookingApiToken: process.env.BOOKING_API_TOKEN,
    },
  },
  typescript: { strict: true, typeCheck: true, shim: true },
})
