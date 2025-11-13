export const useAdminLayout = () => {
  const isSidebarOpen = useState('isSidebarOpen', () => false)
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  const closeSidebar = () => {
    isSidebarOpen.value = false
  }
  return { isSidebarOpen, toggleSidebar, closeSidebar }
}