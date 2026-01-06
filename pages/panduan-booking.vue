<script setup lang="ts">
useHead({
  title: 'Panduan Booking - VENUE UNDIP',
  meta: [
    { name: 'description', content: 'Panduan lengkap cara melihat ketersediaan dan booking lapangan olahraga di VENUE UNDIP khusus mahasiswa.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#f5f7fb] via-[#f8fafc] to-[#f5f7fb]">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-[#1f2a56] to-[#0f1a3c] shadow-lg shadow-[#1f2a56]/25 mb-6">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        </div>
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Panduan Booking Lapangan</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">Platform ini untuk <span class="font-semibold text-[#1f2a56]">melihat ketersediaan sisa booking</span>. Untuk melakukan booking, <span class="font-semibold text-[#1f2a56]">datang langsung ke venue</span> dan admin/operator akan membooking untuk Anda.</p>
        <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm font-semibold text-blue-800">Khusus Mahasiswa UNDIP</span>
        </div>
        <div class="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg">
          <svg class="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          <span class="text-xs font-semibold text-amber-800">Booking hanya bisa dilihat mulai dari BESOK (tidak termasuk hari ini)</span>
        </div>
      </div>

      <!-- Steps -->
      <div class="space-y-6 mb-12">
        <!-- Step 1 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                1
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Cek Ketersediaan Lapangan Online</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Buka platform VENUE UNDIP dan lihat daftar stadion yang tersedia. Platform ini menampilkan <span class="font-semibold text-blue-700">sisa booking mulai dari besok</span> (booking hari ini tidak ditampilkan).</p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Pilih stadion dan klik untuk melihat detail lapangan</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Pilih tanggal yang Anda inginkan (mulai dari besok)</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Slot <span class="font-semibold text-green-600">HIJAU</span> = tersedia, <span class="font-semibold text-red-600">MERAH</span> = sudah dibooking</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Lihat harga per jam untuk setiap lapangan</span>
                </li>
              </ul>
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p class="text-sm text-blue-900">
                  <span class="font-semibold">💡 Tips:</span> Catat jadwal slot yang masih tersedia sebelum Anda datang ke venue untuk booking.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-emerald-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
                2
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Datang Langsung ke Venue</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Setelah melihat slot yang tersedia, <span class="font-semibold text-emerald-700">datang langsung ke lokasi venue</span> untuk melakukan booking melalui admin/operator yang bertugas.</p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Bawa <span class="font-semibold">Kartu Mahasiswa UNDIP</span> sebagai bukti identitas</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Datang pada jam operasional venue</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Temui admin/operator dan sampaikan keinginan untuk booking</span>
                </li>
              </ul>
              <div class="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
                <p class="text-sm text-emerald-900">
                  <span class="font-semibold">📍 Lokasi Admin:</span> Admin/operator berada di masing-masing venue sesuai jam operasional yang tertera di platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-amber-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold text-xl shadow-lg shadow-amber-500/30">
                3
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Operator Membooking untuk Anda</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Admin/operator akan menginput data Anda ke sistem dan memproses booking. Berikan informasi berikut kepada operator:</p>
              <div class="grid sm:grid-cols-2 gap-3 mb-4">
                <div class="flex items-center gap-2 text-gray-700 text-sm">
                  <svg class="h-4 w-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Nama lengkap</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700 text-sm">
                  <svg class="h-4 w-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Nomor WhatsApp aktif</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700 text-sm">
                  <svg class="h-4 w-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Email aktif</span>
                </div>
                <div class="flex items-center gap-2 text-gray-700 text-sm">
                  <svg class="h-4 w-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Slot waktu yang diinginkan</span>
                </div>
              </div>
              <ul class="space-y-2 mb-4">
                <li class="flex items-start gap-2 text-gray-700 text-sm">
                  <span class="text-amber-600 font-bold mt-0.5">•</span>
                  <span>Operator akan mengecek ketersediaan slot secara real-time</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700 text-sm">
                  <span class="text-amber-600 font-bold mt-0.5">•</span>
                  <span>Booking akan langsung <span class="font-semibold text-green-700">APPROVED</span> (tidak ada status PENDING)</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700 text-sm">
                  <span class="text-amber-600 font-bold mt-0.5">•</span>
                  <span>Maksimal 10 slot dapat dibooking dalam satu transaksi</span>
                </li>
              </ul>
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <p class="text-sm text-amber-900">
                  <span class="font-semibold">⚡ Status Booking:</span> Booking langsung disetujui tanpa perlu menunggu verifikasi admin.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-xl shadow-lg shadow-purple-500/30">
                4
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Bayar di Tempat (Cash)</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Lakukan pembayaran secara <span class="font-semibold text-purple-700">tunai (cash)</span> langsung kepada admin/operator di venue.</p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  <span>Harga sudah tertera di platform (per jam × jumlah slot)</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Pembayaran langsung di tempat saat booking</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Operator akan memberikan bukti pembayaran</span>
                </li>
              </ul>
              <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <p class="text-sm text-purple-900">
                  <span class="font-semibold">💵 Metode Pembayaran:</span> Hanya menerima pembayaran tunai (cash) di lokasi venue. Tidak ada pembayaran online.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-green-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-xl shadow-lg shadow-green-500/30">
                5
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Terima Email Konfirmasi & Kode Booking</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Setelah pembayaran selesai, sistem akan <span class="font-semibold text-green-700">otomatis mengirim email konfirmasi</span> ke alamat email yang Anda berikan kepada operator.</p>
              <div class="grid gap-3 mb-4">
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span class="font-semibold text-green-900 text-sm">Email Konfirmasi Booking</span>
                  </div>
                  <ul class="space-y-1 text-xs text-green-800">
                    <li>• <span class="font-semibold">Kode Booking</span> (simpan untuk check-in)</li>
                    <li>• Detail booking: Tanggal, waktu, stadion, lapangan</li>
                    <li>• Informasi pembayaran yang sudah dilunasi</li>
                    <li>• Kontak admin untuk bantuan</li>
                  </ul>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 p-4 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-semibold text-blue-900 text-sm">Email Pengingat</span>
                  </div>
                  <p class="text-xs text-blue-800">Anda akan menerima email pengingat ketika waktu booking sudah dekat</p>
                </div>
                <div class="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-4 rounded-xl">
                  <div class="flex items-center gap-2 mb-2">
                    <svg class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <span class="font-semibold text-red-900 text-sm">Email Pembatalan (jika ada)</span>
                  </div>
                  <p class="text-xs text-red-800">Jika booking dibatalkan admin, Anda akan menerima notifikasi pembatalan via email</p>
                </div>
              </div>
              <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p class="text-sm text-green-900">
                  <span class="font-semibold">📧 Format Email Profesional:</span> Semua email dikirim dengan format resmi Universitas Diponegoro dan berisi informasi lengkap tentang booking Anda.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 6 -->
        <div class="group relative rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
          <div class="flex items-start gap-4 lg:gap-6">
            <div class="flex-shrink-0">
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold text-xl shadow-lg shadow-teal-500/30">
                6
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-900 mb-3">Gunakan Lapangan Sesuai Jadwal</h3>
              <p class="text-gray-600 mb-4 leading-relaxed">Datang ke venue sesuai jadwal booking Anda. Tunjukkan kode booking dari email untuk check-in.</p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Datang <span class="font-semibold">15 menit sebelum</span> waktu booking</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Tunjukkan kode booking dari email kepada petugas</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Gunakan fasilitas sesuai aturan yang berlaku</span>
                </li>
                <li class="flex items-start gap-2 text-gray-700">
                  <svg class="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span>Jaga kebersihan dan kembalikan peralatan pada tempatnya</span>
                </li>
              </ul>
              <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p class="text-sm text-red-900 mb-2">
                  <span class="font-semibold">❌ Pembatalan Booking:</span>
                </p>
                <p class="text-sm text-red-900">
                  Jika ingin membatalkan, segera hubungi admin melalui <span class="font-semibold">WhatsApp</span> atau <span class="font-semibold">email</span> dengan menyertakan kode booking. Anda akan menerima email notifikasi pembatalan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="rounded-2xl bg-white p-6 lg:p-8 shadow-lg shadow-gray-200/50 border border-gray-100/50 mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <svg class="h-7 w-7 text-[#1f2a56]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Pertanyaan Umum
        </h2>
        <div class="space-y-4">
          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
              <span>Apakah saya bisa booking online melalui platform ini?</span>
              <svg class="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="mt-3 px-4 pb-3 text-gray-600">
              <p><span class="font-semibold">Tidak.</span> Platform ini hanya untuk melihat ketersediaan sisa booking. Untuk melakukan booking, Anda harus datang langsung ke venue dan admin/operator akan membooking untuk Anda.</p>
            </div>
          </details>

          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
              <span>Apakah booking saya langsung disetujui?</span>
              <svg class="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="mt-3 px-4 pb-3 text-gray-600">
              <p><span class="font-semibold">Ya.</span> Booking langsung berstatus APPROVED tanpa perlu menunggu verifikasi admin. Setelah pembayaran selesai di venue, Anda akan langsung menerima email konfirmasi dengan kode booking.</p>
            </div>
          </details>

          <details class="group">
            <summary class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 px-4 py-3 font-semibold text-gray-900 hover:bg-gray-100 transition-colors">
              <span>Bagaimana cara pembayaran?</span>
              <svg class="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="mt-3 px-4 pb-3 text-gray-600">
              <p>Pembayaran dilakukan secara <span class="font-semibold">tunai (cash)</span> langsung kepada admin/operator di venue saat Anda melakukan booking. Tidak ada pembayaran online atau transfer.</p>
            </div>
          </details>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center rounded-2xl bg-gradient-to-br from-[#0f1f4a] via-[#1a2d5a] to-[#0f1f4a] p-8 lg:p-12 shadow-2xl shadow-[#0f1f4a]/40">
        <h2 class="text-2xl lg:text-3xl font-bold text-white mb-4">Siap Melakukan Booking?</h2>
        <p class="text-blue-100 mb-6 max-w-xl mx-auto">Temukan stadion pilihan Anda dan pesan lapangan sekarang juga dengan mudah dan cepat!</p>
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#1f2a56] shadow-lg shadow-white/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          Mulai Booking
          <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
