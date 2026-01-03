import { ref, computed, watch, type Ref } from 'vue'
import { PAGINATION } from '~/utils/constants'

export interface UsePaginationOptions {
  itemsPerPage?: number
  initialPage?: number
  resetOnItemsChange?: boolean
}

export interface UsePaginationReturn<T> {
  currentPage: Ref<number>
  totalPages: Ref<number>
  totalItems: Ref<number>
  paginatedItems: Ref<T[]>
  summary: Ref<string>
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
  hasNextPage: Ref<boolean>
  hasPrevPage: Ref<boolean>
  isFirstPage: Ref<boolean>
  isLastPage: Ref<boolean>
}

/**
 * Composable untuk pagination logic
 * Menangani pagination dengan automatic computed properties
 * 
 * @example
 * const { currentPage, paginatedItems, summary, nextPage, prevPage } = usePagination(items)
 * 
 * @param items - Ref array of items to paginate
 * @param options - Pagination options
 * @returns Pagination state and methods
 */
export const usePagination = <T = any>(
  items: Ref<T[]>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> => {
  const {
    itemsPerPage = PAGINATION.ITEMS_PER_PAGE,
    initialPage = 1,
    resetOnItemsChange = true,
  } = options

  const currentPage = ref(initialPage)

  // Total items
  const totalItems = computed(() => items.value.length)

  // Total pages
  const totalPages = computed(() => {
    return Math.max(Math.ceil(totalItems.value / itemsPerPage), 1)
  })

  // Paginated items
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return items.value.slice(start, end)
  })

  // Summary text
  const summary = computed(() => {
    if (totalItems.value === 0) return 'Tidak ada data'
    
    const start = (currentPage.value - 1) * itemsPerPage + 1
    const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
    return `Menampilkan ${start}-${end} dari ${totalItems.value} data`
  })

  // Navigation helpers
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)
  const isFirstPage = computed(() => currentPage.value === 1)
  const isLastPage = computed(() => currentPage.value === totalPages.value)

  // Navigation methods
  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Reset page when items change (optional)
  if (resetOnItemsChange) {
    watch(
      () => items.value.length,
      () => {
        if (currentPage.value > totalPages.value) {
          currentPage.value = Math.max(totalPages.value, 1)
        }
      }
    )
  }

  // Auto-adjust current page if it exceeds total pages
  watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages) {
      currentPage.value = Math.max(newTotalPages, 1)
    }
  })

  return {
    currentPage,
    totalPages,
    totalItems,
    paginatedItems,
    summary,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    isFirstPage,
    isLastPage,
  }
}
