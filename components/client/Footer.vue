<template>
  <footer class="mt-16 bg-gradient-to-br from-[#0f1f4a] via-[#1a2d5a] to-[#0f1f4a] text-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <!-- Footer Content Grid -->
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <!-- Brand Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <img
              src="~/assets/images/VENUE-UNDIP-LOGO.png"
              alt="Venue UNDIP Logo"
              class="h-10 w-10 object-contain drop-shadow-lg"
            />
            <div>
              <p class="text-lg font-bold leading-tight">VENUE UNDIP</p>
              <p class="text-xs text-blue-200/70">Booking Lapangan</p>
            </div>
          </div>
          <p class="text-sm text-blue-100/80 leading-relaxed">Platform booking lapangan olahraga terpercaya untuk civitas akademika Universitas Diponegoro.</p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Navigasi</h3>
          <ul class="space-y-2.5">
            <li>
              <NuxtLink to="/" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Beranda
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </NuxtLink>
            </li>
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Stadion
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Booking Saya
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
            <li>
              <NuxtLink to="/admin/login" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Admin Panel
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Bantuan</h3>
          <ul class="space-y-2.5">
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Pusat Bantuan
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Panduan Booking
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Kebijakan Privasi
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
            <li>
              <button @click="openComingSoon" class="group inline-flex items-center gap-2 text-sm text-blue-100/80 hover:text-white transition-all duration-200">
                <span class="relative">
                  Syarat & Ketentuan
                  <span class="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold uppercase tracking-wider text-white mb-4">Hubungi Kami</h3>
          <ul class="space-y-3">
            <li class="group flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <a href="mailto:info@undip.ac.id" class="text-sm text-blue-100/80 hover:text-white transition-colors duration-200 break-all hover:underline underline-offset-2">info@undip.ac.id</a>
            </li>
            <li class="group flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <a href="tel:+622476841001" class="text-sm text-blue-100/80 hover:text-white transition-colors duration-200 hover:underline underline-offset-2">+62 xxx xxx xxx</a>
            </li>
            <li class="flex items-start gap-3">
              <svg class="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-sm text-blue-100/80">Jl. Prof. Soedarto, Tembalang, Kec. Tembalang, Kota
Semarang, Jawa Tengah</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-white/10"></div>

      <!-- Bottom Footer -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-blue-100/70 text-center sm:text-left">
          &copy; {{ new Date().getFullYear() }} VENUE UNDIP. Semua hak cipta dilindungi. Dikembangkan dengan <span class="text-red-400">❤</span> untuk civitas akademika Universitas Diponegoro.
        </p>
        
        <!-- Social Links -->
        <div class="flex items-center gap-3">
          <button @click="openComingSoon" class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:-translate-y-1" title="Facebook">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button @click="openComingSoon" class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:-translate-y-1" title="Instagram">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm0 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25zm0 1.688c-4.454 0-8.062 3.608-8.062 8.062S7.546 20.062 12 20.062s8.062-3.608 8.062-8.062S16.454 3.938 12 3.938zm0 1.312c3.727 0 6.75 3.023 6.75 6.75s-3.023 6.75-6.75 6.75-6.75-3.023-6.75-6.75 3.023-6.75 6.75-6.75zm3.938-1.312c-.58 0-1.05.47-1.05 1.05s.47 1.05 1.05 1.05 1.05-.47 1.05-1.05-.47-1.05-1.05-1.05z"/>
            </svg>
          </button>
          <button @click="openComingSoon" class="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:-translate-y-1" title="Twitter">
            <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a14.001 14.001 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Coming Soon Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div 
          v-if="isComingSoonModalOpen" 
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          @click="closeComingSoon"
        >
          <div 
            class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
            @click.stop
          >
            <!-- Decorative Background -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <!-- Close Button -->
            <button 
              @click="closeComingSoon"
              class="absolute top-4 right-4 z-10 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:scale-110"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div class="relative p-8 space-y-6">
              <!-- Icon -->
              <div class="flex justify-center">
                <div class="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#1f2a56] to-[#0f1a3c] shadow-lg shadow-[#1f2a56]/25">
                  <svg class="h-10 w-10 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>

              <!-- Content -->
              <div class="text-center space-y-3">
                <h3 class="text-2xl font-bold text-gray-900">Segera Hadir!</h3>
                <p class="text-gray-600 leading-relaxed">
                  Maaf, fitur ini sedang dalam tahap pengembangan dan akan tersedia dalam waktu dekat.
                </p>
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <svg class="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <span class="text-sm font-medium text-blue-900">Terima kasih atas pengertian Anda</span>
                </div>
              </div>

              <!-- Action Button -->
              <button 
                @click="closeComingSoon"
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f2a56] to-[#0f1a3c] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1f2a56]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#1f2a56]/30 hover:-translate-y-0.5"
              >
                Mengerti
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </footer>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>

<script setup lang="ts">
import { ref } from 'vue'

const isComingSoonModalOpen = ref(false)

const openComingSoon = () => {
  isComingSoonModalOpen.value = true
}

const closeComingSoon = () => {
  isComingSoonModalOpen.value = false
}
</script>
