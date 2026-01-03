<template>
  <svg
    :viewBox="viewBox"
    :width="width"
    :height="height"
    :class="className"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
  >
    <rect width="100%" height="100%" fill="#f3f4f6" />

    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />

    <g transform="translate(150, 70)">
      <rect x="-30" y="-25" width="60" height="50" fill="none" stroke="#9ca3af" stroke-width="2" rx="4" />

      <path d="M -20 5 L -10 -8 L 0 2 L 10 -5 L 20 8" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

      <circle cx="10" cy="-15" r="4" fill="#9ca3af" />
    </g>

    <text x="50%" y="80%" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="500">
      {{ text }}
    </text>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  width?: number | string
  height?: number | string
  viewBox?: string
  className?: string
  text?: string
}

withDefaults(defineProps<Props>(), {
  width: 400,
  height: 300,
  viewBox: '0 0 400 300',
  className: 'w-full h-auto',
  text: 'Tidak ada gambar'
})
</script>
