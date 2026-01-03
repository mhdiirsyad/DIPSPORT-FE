import { ref, computed, watch, type Ref } from 'vue'
import { SEARCH } from '~/utils/constants'

export interface UseSearchOptions {
  debounceDelay?: number
  minLength?: number
  caseSensitive?: boolean
}

export interface UseSearchReturn<T> {
  searchQuery: Ref<string>
  debouncedQuery: Ref<string>
  filteredItems: Ref<T[]>
  isSearching: Ref<boolean>
  hasResults: Ref<boolean>
  resultCount: Ref<number>
  clearSearch: () => void
}

/**
 * Composable untuk search/filter functionality dengan debouncing
 * 
 * @example
 * const { searchQuery, filteredItems, clearSearch } = useSearch(
 *   items,
 *   (item) => [item.name, item.id.toString()]
 * )
 * 
 * @param items - Ref array of items to search through
 * @param searchKeys - Function that returns array of searchable strings for each item
 * @param options - Search configuration options
 * @returns Search state and methods
 */
export const useSearch = <T = any>(
  items: Ref<T[]>,
  searchKeys: (item: T) => string[],
  options: UseSearchOptions = {}
): UseSearchReturn<T> => {
  const {
    debounceDelay = SEARCH.DEBOUNCE_DELAY,
    minLength = SEARCH.MIN_SEARCH_LENGTH,
    caseSensitive = false,
  } = options

  const searchQuery = ref('')
  const debouncedQuery = ref('')
  const isSearching = ref(false)

  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  // Debounced search watcher
  watch(searchQuery, (newValue) => {
    isSearching.value = true

    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(() => {
      debouncedQuery.value = newValue
      isSearching.value = false
    }, debounceDelay)
  })

  const filteredItems = computed(() => {
    const query = debouncedQuery.value.trim()

    if (!query || query.length < minLength) {
      return items.value
    }

    const searchTerm = caseSensitive ? query : query.toLowerCase()

    return items.value.filter((item) => {
      const keys = searchKeys(item)
      
      return keys.some((key) => {
        const searchableKey = caseSensitive ? key : key.toLowerCase()
        return searchableKey.includes(searchTerm)
      })
    })
  })

  const hasResults = computed(() => filteredItems.value.length > 0)
  const resultCount = computed(() => filteredItems.value.length)

  const clearSearch = () => {
    searchQuery.value = ''
    debouncedQuery.value = ''
    isSearching.value = false
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
      debounceTimeout = null
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }
  })

  return {
    searchQuery,
    debouncedQuery,
    filteredItems,
    isSearching,
    hasResults,
    resultCount,
    clearSearch,
  }
}

/**
 * Utility function untuk membuat searchKeys dari object properties
 * 
 * @example
 * const { filteredItems } = useSearch(
 *   items,
 *   createSearchKeys(['name', 'id', 'email'])
 * )
 */
export const createSearchKeys = <T extends Record<string, any>>(
  properties: (keyof T)[]
) => {
  return (item: T): string[] => {
    return properties.map((prop) => {
      const value = item[prop]
      return value != null ? String(value) : ''
    })
  }
}
