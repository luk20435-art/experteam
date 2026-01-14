const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface ApiOptions extends RequestInit {
  body?: any
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }

  // ถ้ามี body และเป็น object → แปลงเป็น JSON
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)

  // ถ้า 401 → token หมด → ล็อกเอ้าท์อัตโนมัติ
  if (response.status === 401) {
    localStorage.removeItem('access_token')
    window.location.href = '/auth/login'
    throw new Error('เซสชันหมดอายุ กรุณาล็อกอินใหม่')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์')
  }

  return data
}