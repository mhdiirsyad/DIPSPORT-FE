// // app.config.ts
// export default defineAppConfig({
//   ui: {
//     // Strategi merge agar tetap kompatibel dengan default Nuxt UI
//     strategy: 'merge',

//     // Warna utama (brand)
//     primary: 'primary',

//     // Definisi warna custom (sinkron dengan file CSS sebelumnya)
//     colors: {
//       primary: '#0F47AD',

//       // brand: '#0F47AD',       // warna utama brand
//       // surface: '#ffffff',     // background kartu / konten
//       // body: '#f2f4f7',        // warna dasar body
//       text: '#0f172a',        // warna teks utama
//       muted: '#6b7280',       // teks sekunder / deskripsi
//       border: '#e5e7eb',      // garis pembatas lembut
//     },

//     // Radius dan shadow agar seragam dengan style CSS sebelumnya
//     radius: {
//       none: '0px',
//       sm: '0.5rem',   // sebelumnya dipakai di borderRadius.sm
//       md: '1rem',     // sebelumnya dipakai di borderRadius.md
//       lg: '1.25rem',
//       xl: '1.5rem',
//       full: '9999px',
//     },

//     shadow: {
//       none: 'none',
//       sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
//       md: '0 4px 12px rgba(15, 23, 42, 0.08)',
//       lg: '0 20px 45px rgba(15, 23, 42, 0.12)', // dari boxShadow.ds-lg
//     },

//     // Styling komponen global agar seragam
//     button: {
//       color: 'brand',
//       variant: {
//         solid: 'bg-[var(--ui-color-brand)] text-white hover:bg-opacity-90',
//         outline: 'border border-[var(--ui-color-brand)] text-[var(--ui-color-brand)] hover:bg-[var(--ui-color-brand)] hover:text-white',
//       },
//       rounded: 'md',
//       size: {
//         md: 'px-4 py-2.5 text-sm font-semibold',
//         lg: 'px-5 py-3 text-base font-semibold',
//       },
//     },

//     input: {
//       color: 'white',
//       rounded: 'md',
//       size: 'md',
//       variant: 'outline',
//       ring: 'focus:ring-[var(--ui-color-brand)] focus:border-[var(--ui-color-brand)]',
//     },

//     card: {
//       color: 'surface',
//       rounded: 'lg',
//       shadow: 'lg',
//       padding: 'p-6',
//     },

//     // Layout global (opsional)
//     container: {
//       padding: '2rem',
//       maxWidth: '1280px',
//     },
//   },
// })
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      gray: 'slate',
      radius: 'md',
    },
    // tambahkan ini supaya spacing variable dibuat
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },
})
