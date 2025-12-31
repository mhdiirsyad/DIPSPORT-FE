<template>
  <header class="sticky top-0 z-50 bg-gradient-to-br from-[#f5f7fb] via-[#f8fafc] to-[#f5f7fb] backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
      <div class="flex items-center justify-between gap-3 lg:gap-6">
        <button @click="scrollToTop" class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 text-left hover:opacity-75 transition-opacity duration-200 cursor-pointer">
          <div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f2a56] to-[#0f1a3c] shadow-lg flex-shrink-0">
            <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 4l9 5.5v9l-9 5.5-9-5.5v-9z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 13a1 1 0 100-2 1 1 0 000 2z"/>
            </svg>
          </div>
          <div class="min-w-0">
            <div class="text-lg sm:text-2xl font-bold tracking-tight text-[#1f2a56] truncate">VENUE UNDIP</div>
            <div class="hidden sm:block text-xs text-gray-500 font-medium truncate">Booking Lapangan Olahraga Universitas Diponegoro</div>
          </div>
        </button>
        
        <!-- Mobile: Icon Button with Label -->
        <NuxtLink
          to="/admin/login"
          class="sm:hidden group flex flex-col items-center justify-center gap-0.5 rounded-xl bg-gradient-to-r from-[#1f2a56] to-[#0f1a3c] px-3 py-2 text-white shadow-lg shadow-[#1f2a56]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#1f2a56]/35 hover:scale-105 flex-shrink-0"
        >
          <svg class="h-4 w-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          <span class="text-[10px] font-bold leading-none">Admin</span>
        </NuxtLink>
        
        <!-- Desktop: Full Button with Text -->
        <NuxtLink
          to="/admin/login"
          class="hidden sm:inline-flex group items-center gap-2 rounded-xl bg-gradient-to-r from-[#1f2a56] to-[#0f1a3c] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#1f2a56]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#1f2a56]/35 hover:-translate-y-0.5 flex-shrink-0"
        >
          <svg class="h-4 w-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
          </svg>
          Masuk Admin
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
