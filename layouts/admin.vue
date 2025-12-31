<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminLayout } from '~/composables/useAdminLayout'
import { useConfirmation } from '~/composables/useConfirmation'

const { isSidebarOpen, closeSidebar } = useAdminLayout()
const { registerModal } = useConfirmation()
const confirmModal = ref(null)

onMounted(() => {
  registerModal(confirmModal.value)
})
</script>

<template>
  <div class="flex min-h-screen">
    <ConfirmationModal ref="confirmModal" />
    
    <AdminSidebar />

    <div
      v-if="isSidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-hidden="true"
    />

    <div class="flex-1 flex flex-col lg:pl-60">
      
      <AdminTopBar />

      <main class="flex-1 p-6 sm:p-8 bg-gray-100">
        <slot />
      </main>

      <AdminFooter />
    </div>
  </div>
</template>