<script setup lang="ts">
definePageMeta({
  middleware: 'auth-admin',
  layout: 'admin'
})
import { useFetch } from 'nuxt/app'
const { data } = await useFetch('/api/auth/me')
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
    <p class="mt-2 text-sm opacity-80">
      Welcome, admin!
    </p>

    <form method="post" action="/api/auth/logout" class="mt-4">
      <button class="rounded border px-3 py-2">Logout</button>
    </form>
  </div>
</template>
