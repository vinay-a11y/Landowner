export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}

export const logout = () => {
  localStorage.removeItem("token")
  // Remove cookie
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  window.location.href = "/login"
}

export const getToken = () => {
  return localStorage.getItem("token")
}

export const setToken = (token) => {
  localStorage.setItem("token", token)
  // Also set as cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`
}
