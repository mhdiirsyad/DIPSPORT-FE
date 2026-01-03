<template>
  <div class="min-h-screen flex flex-col">
    <ClientTopBar />

    <main class="flex-1">
      <slot />
    </main>

    <ClientFooter />
  </div>
</template>
