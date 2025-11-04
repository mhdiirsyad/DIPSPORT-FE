<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen bg-ds-body">
    
    <AdminSidebar />
    
    <main class="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
      <slot />
    </main>
  </div>
</template>

<style scoped>
</style>