// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/ui',
  ],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      gqlHttpEndpoint: process.env.GQL_HTTP_ENDPOINT
    }
  },
  
  typescript: {
    strict: true,
    typeCheck: true,
    shim: true
  }
})