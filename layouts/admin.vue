<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    <main class="admin-layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--ds-body);
}

.admin-layout__content {
  flex: 1;
  padding: 2rem;
  min-width: 0;
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-layout__content {
    padding: 1.5rem 1rem;
  }
}
</style>
