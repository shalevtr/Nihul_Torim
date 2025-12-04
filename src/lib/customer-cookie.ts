// Customer cookie/localStorage management for public booking flow

const CUSTOMER_COOKIE_NAME = "customer_device_id"
const CUSTOMER_DATA_KEY = "customer_data"

export interface CustomerData {
  deviceId: string
  fullName: string
  phone: string
  email?: string
}

export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export function getCustomerDeviceId(): string | null {
  if (typeof window === "undefined") return null
  
  // Try to get from cookie first
  const cookies = document.cookie.split(";")
  const cookie = cookies.find((c) => c.trim().startsWith(`${CUSTOMER_COOKIE_NAME}=`))
  if (cookie) {
    return cookie.split("=")[1]
  }
  
  // Try localStorage
  const stored = localStorage.getItem(CUSTOMER_DATA_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored) as CustomerData
      return data.deviceId
    } catch {
      return null
    }
  }
  
  return null
}

export function getCustomerData(): CustomerData | null {
  if (typeof window === "undefined") return null
  
  const stored = localStorage.getItem(CUSTOMER_DATA_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as CustomerData
    } catch {
      return null
    }
  }
  
  return null
}

export function saveCustomerData(data: CustomerData): void {
  if (typeof window === "undefined") return
  
  // Save to localStorage
  localStorage.setItem(CUSTOMER_DATA_KEY, JSON.stringify(data))
  
  // Save deviceId to cookie (expires in 1 year)
  const expires = new Date()
  expires.setFullYear(expires.getFullYear() + 1)
  document.cookie = `${CUSTOMER_COOKIE_NAME}=${data.deviceId}; expires=${expires.toUTCString()}; path=/`
}

export function clearCustomerData(): void {
  if (typeof window === "undefined") return
  
  localStorage.removeItem(CUSTOMER_DATA_KEY)
  document.cookie = `${CUSTOMER_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}



