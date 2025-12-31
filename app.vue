<script setup lang="ts">
const isHydrated = ref(false)

onMounted(() => {
  isHydrated.value = true
})
</script>

<template>
  <div>
    <div 
      v-if="!isHydrated"
      class="fixed inset-0 bg-white z-[9999] flex items-center justify-center"
      style="transition: opacity 0.3s ease-out"
    >
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F47AD] mx-auto"></div>
        <p class="mt-4 text-gray-600 text-sm">Loading...</p>
      </div>
    </div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  visibility: visible;
  opacity: 1;
}

#__nuxt {
  min-height: 100vh;
}
</style>
