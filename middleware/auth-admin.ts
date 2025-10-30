import { defineNuxtRouteMiddleware, useFetch, navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) {
    return
  }
  const { data, error } = await useFetch<{ authenticated: boolean }>('/api/auth/me', {
    method: 'GET',
    credentials: 'include',
  })
  const isAuthenticated = !error.value && data.value?.authenticated === true
  if (isAuthenticated && to.path === '/admin/login') {
    return navigateTo('/admin') 
  }
  if (!isAuthenticated && to.path !== '/admin/login') {
    return navigateTo('/admin/login?next=' + encodeURIComponent(to.fullPath))
  }
})