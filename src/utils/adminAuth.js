const ADMIN_CREDENTIALS_KEY = 'adminCredentials'

const defaultCredentials = {
  username: 'admin',
  password: 'admin123'
}
export const getAdminCredentials = () => {
  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      return defaultCredentials
    }
  }
  return defaultCredentials
}

export const saveAdminCredentials = (username, password) => {
  const credentials = {
    username: username,
    password: password
  }
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials))
}

export const validateCredentials = (username, password) => {
  const credentials = getAdminCredentials()
  return username === credentials.username && password === credentials.password
}

export const resetAdminCredentials = () => {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(defaultCredentials))
  return defaultCredentials
}

