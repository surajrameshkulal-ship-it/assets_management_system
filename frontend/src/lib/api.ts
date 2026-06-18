const API_BASE = '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('assetflow_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new ApiError(res.status, err.detail || 'Request failed')
  }
  return res.json()
}

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'employee'
  department?: string
  created_at: string
}

export interface DashboardStats {
  total_assets: number
  assigned_assets: number
  available_assets: number
  maintenance_assets: number
  total_licenses: number
  expiring_licenses: number
  open_tickets: number
  total_employees: number
}

export interface Asset {
  id: string
  name: string
  category: string
  serial_number: string
  status: 'available' | 'assigned' | 'maintenance' | 'retired'
  assigned_to?: string
  location?: string
  purchase_date?: string
  warranty_expiry?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface License {
  id: string
  name: string
  vendor: string
  license_key?: string
  seats: number
  used_seats: number
  status: 'active' | 'expiring' | 'expired' | 'compliance_risk'
  expiry_date?: string
  cost?: number
  assigned_assets: string[]
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  full_name: string
  email: string
  department: string
  job_title?: string
  phone?: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  asset_id?: string
  assigned_to?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  action: string
  entity: string
  entity_id: string
  user: string
  details: string
  timestamp: string
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>('/auth/me'),

  getStats: () => request<DashboardStats>('/dashboard/stats'),
  getActivity: () => request<ActivityLog[]>('/dashboard/activity'),
  getAssetDistribution: () => request<{ category: string; count: number }[]>('/dashboard/asset-distribution'),

  getAssets: () => request<Asset[]>('/assets'),
  createAsset: (data: Partial<Asset>) =>
    request<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
  updateAsset: (id: string, data: Partial<Asset>) =>
    request<Asset>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAsset: (id: string) => request<{ message: string }>(`/assets/${id}`, { method: 'DELETE' }),

  getLicenses: () => request<License[]>('/licenses'),
  createLicense: (data: Partial<License>) =>
    request<License>('/licenses', { method: 'POST', body: JSON.stringify(data) }),

  getEmployees: () => request<Employee[]>('/employees'),
  createEmployee: (data: Partial<Employee>) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify(data) }),

  getTickets: () => request<Ticket[]>('/tickets'),
  createTicket: (data: { title: string; description: string; priority?: string }) =>
    request<Ticket>('/tickets', { method: 'POST', body: JSON.stringify(data) }),

  generateReport: (prompt: string, context_type: string) =>
    request<{ report: string; generated_at: string }>('/ai/report', {
      method: 'POST',
      body: JSON.stringify({ prompt, context_type }),
    }),
}

export { ApiError }
