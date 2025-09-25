// API client utilities for CivicPulse platform

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006"

// Debug logging for environment variables
if (typeof window !== 'undefined') {
  console.log('[API] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
  console.log('[API] API_BASE_URL:', API_BASE_URL)
}

export interface User {
  id: string
  email: string
  name: string
  role: "citizen" | "admin" | "moderator"
  avatar?: string
  createdAt: string
}

export interface CreateReportRequest {
  description: string
  contactInfo?: string
  anonymous: boolean
  useLocation: boolean
  media?: File
  location?: {
    lat: number
    lng: number
    address?: string
  }
}

export interface CreateReportResponse {
  success: boolean
  trackingId: string
  id: string
  message: string
  report: {
    trackingId: string
    title: string
    status: string
    createdAt: string
    hasLocation: boolean
    hasMedia: boolean
  }
}

export interface AIAnalysisResult {
  issueType: string
  severity: "low" | "medium" | "high" | "urgent"
  confidence: number
  suggestedTitle: string
  shortDesc: string
}

export interface AIAnalysisResponse {
  success: boolean
  data: AIAnalysisResult
  meta: {
    provider: string
    timestamp: string
  }
}

export interface MediaUploadResponse {
  success: boolean
  url: string
  filename: string
  originalName: string
  size: number
  mimetype: string
  mediaType: "image" | "video" | "audio" | "unknown"
  uploadedAt: string
  sizeFormatted: string
}

export interface Report {
  _id: string
  id: string
  trackingId: string
  title: string
  description: string
  status: string
  severity: string
  priority: string
  createdAt: string
  updatedAt: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  mediaUrl?: string
  contactInfo?: string
  createdBy: string
  anonymous: boolean
  category: string
  viewCount: number
  upvotes: number
  downvotes: number
}

export interface ApiError {
  error: string
  details?: string
}

export interface AdminLoginResponse {
  token: string
  admin: {
    id: string
    username: string
    email?: string
    role: string
    permissions: string[]
    profile?: {
      firstName?: string
      lastName?: string
      position?: string
    }
    lastLogin?: string
  }
}

export interface AdminGuestResponse {
  token: string
  expiresAt: string
  admin: {
    id: string
    username: string
    role: string
    permissions: string[]
    profile: {
      firstName: string
      lastName: string
      position: string
    }
  }
}

export interface AdminVerifyResponse {
  valid: boolean
  admin: {
    id: string
    username: string
    email?: string
    role: string
    permissions: string[]
    profile?: {
      firstName?: string
      lastName?: string
      position?: string
    }
  }
}

export interface AdminReportsResponse {
  reports: Report[]
  pagination: {
    total: number
    offset: number
    limit: number
    hasMore: boolean
  }
}

export interface AnalyticsMostCommonResponse {
  period: string
  dateRange: {
    from: string
    to: string
  }
  data: Array<{
    category: string
    count: number
  }>
  total: number
}

export interface AnalyticsResolutionTimeResponse {
  period: string
  dateRange: {
    from: string
    to: string
  }
  averageResolutionTime: number
  averageResolutionTimeHours: number
  resolvedCount: number
  unit: string
}

export interface AnalyticsTopLocationsResponse {
  data: Array<{
    address: string
    count: number
  }>
  total: number
  limit: number
}

export interface AnalyticsWeeklySummaryResponse {
  dateRange: {
    from: string
    to: string
  }
  summary: string
  data: {
    totalReports: number
    statusBreakdown: Record<string, number>
    categoryBreakdown: Record<string, number>
    resolvedCount: number
  }
  generatedAt: string
  aiGenerated: boolean
}

export interface AnalyticsHeatmapResponse {
  data: Array<{
    lat: number
    lng: number
    intensity: number
    status: string
    priority: string
    category: string
  }>
  total: number
  bounds: {
    north: number
    south: number
    east: number
    west: number
  } | null
}

export interface Team {
  id: string
  name: string
  description: string
  department: string
  members: Array<{
    name: string
    email: string
    role: string
  }>
  specialties: string[]
  capacity: number
  currentLoad: number
  availableCapacity: number
  canTakeAssignment: boolean
  assignedReports: Array<{
    reportId: string
    assignedAt: string
    priority: string
  }>
  isActive: boolean
  contactInfo: {
    phone?: string
    email?: string
    location?: string
  }
  workingHours: {
    start: string
    end: string
    days: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface GuestAuthResponse {
  token: string
  user: {
    name: string
  }
}

export class ApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`
    }

    return headers
  }

  async createReport(data: CreateReportRequest): Promise<CreateReportResponse> {
    const formData = new FormData()

    formData.append("description", data.description)
    // Convert boolean values to strings as expected by the backend
    formData.append("anonymous", data.anonymous.toString())
    formData.append("useLocation", data.useLocation.toString())

    if (data.contactInfo) {
      formData.append("contactInfo", data.contactInfo)
    }

    if (data.media) {
      formData.append("media", data.media)
    }

    if (data.location) {
      // Stringify the location object as expected by the backend
      formData.append("location", JSON.stringify(data.location))
    }

    try {
      const response = await fetch(`${this.baseUrl}/reports`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result as CreateReportResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append("media", file)

    try {
      const response = await fetch(`${this.baseUrl}/media/upload`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result as MediaUploadResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getReports(options?: {
    format?: "map" | "list"
    status?: string
    severity?: string
    limit?: number
  }): Promise<Report[]> {
    const params = new URLSearchParams()

    if (options?.format) {
      params.append("format", options.format)
    }
    if (options?.status) {
      params.append("status", options.status)
    }
    if (options?.severity) {
      params.append("severity", options.severity)
    }
    if (options?.limit) {
      params.append("limit", options.limit.toString())
    }

    const url = `${this.baseUrl}/reports${params.toString() ? `?${params.toString()}` : ""}`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<Report[]>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getReport(trackingId: string): Promise<Report> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${trackingId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Report not found. Please check your tracking ID.")
        }
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<Report>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getMediaInfo(filename: string): Promise<{
    filename: string
    url: string
    size: number
    sizeFormatted: string
    uploadedAt: string
    lastModified: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/media/info/${filename}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Media file not found.")
        }
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async checkHealth(): Promise<{
    status: string
    timestamp: string
    reportsCount: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)

      if (!response.ok) {
        throw new Error(`Server health check failed: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async analyzeImage(mediaUrl: string): Promise<AIAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/analyze-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaUrl }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return (result as AIAnalysisResponse).data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAIStatus(): Promise<{
    configured: boolean
    provider: string
    features: string[]
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/status`)

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()
      
      console.log('[API] Admin login response:', response.status, result)

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || `Login failed with status ${response.status}`)
      }

      return result as AdminLoginResponse
    } catch (error) {
      console.error('[API] Admin login error:', error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async adminGuestLogin(password: string): Promise<AdminGuestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const result = await response.json()
      
      console.log('[API] Guest login response:', response.status, result)

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || `Guest login failed with status ${response.status}`)
      }

      return result as AdminGuestResponse
    } catch (error) {
      console.error('[API] Guest login error:', error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async verifyAdminToken(token: string): Promise<AdminVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Token verification failed")
      }

      return result as AdminVerifyResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAdminReports(options?: {
    format?: "map" | "list"
    status?: string
    severity?: string
    assignedTo?: string
    category?: string
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<AdminReportsResponse> {
    const params = new URLSearchParams()

    if (options?.format) params.append("format", options.format)
    if (options?.status) params.append("status", options.status)
    if (options?.severity) params.append("severity", options.severity)
    if (options?.assignedTo) params.append("assignedTo", options.assignedTo)
    if (options?.category) params.append("category", options.category)
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())
    if (options?.sortBy) params.append("sortBy", options.sortBy)
    if (options?.sortOrder) params.append("sortOrder", options.sortOrder)

    const url = `${this.baseUrl}/admin/reports${params.toString() ? `?${params.toString()}` : ""}`

    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          handleAuthError(new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`), response.status)
        }
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AdminReportsResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async assignReport(
    reportId: string,
    teamId: string,
    assignedBy?: string,
  ): Promise<{
    message: string
    report: {
      id: string
      trackingId: string
      assignedTo: string
      updatedAt: string
    }
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/assign`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ teamId, assignedBy }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          handleAuthError(new Error(error.details || error.error || "Failed to assign report"), response.status)
        }
        throw new Error(error.details || error.error || "Failed to assign report")
      }

      return result
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async updateReportStatus(
    reportId: string,
    status: string,
    note?: string,
    updatedBy?: string,
  ): Promise<{
    message: string
    report: {
      id: string
      trackingId: string
      status: string
      updatedAt: string
      updates: Array<{
        type: string
        message: string
        createdBy: string
        createdAt: string
        oldStatus?: string
        newStatus?: string
        note?: string
      }>
    }
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/status`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, note, updatedBy }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          handleAuthError(new Error(error.details || error.error || "Failed to update report status"), response.status)
        }
        throw new Error(error.details || error.error || "Failed to update report status")
      }

      return result
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getTeams(options?: {
    department?: string
    specialty?: string
    available?: boolean
  }): Promise<Team[]> {
    const params = new URLSearchParams()

    if (options?.department) params.append("department", options.department)
    if (options?.specialty) params.append("specialty", options.specialty)
    if (options?.available !== undefined) params.append("available", options.available.toString())

    const url = `${this.baseUrl}/teams${params.toString() ? `?${params.toString()}` : ""}`

    try {
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        // Handle auth errors specifically
        if (response.status === 401 || response.status === 403) {
          handleAuthError(new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`), response.status)
        }
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<Team[]>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getTeam(teamId: string): Promise<Team> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Team not found.")
        }
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<Team>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async createTeam(teamData: {
    name: string
    description?: string
    department: string
    members?: Array<{
      name: string
      email: string
      role: string
    }>
    specialties?: string[]
    capacity?: number
    contactInfo?: {
      phone?: string
      email?: string
      location?: string
    }
    workingHours?: {
      start: string
      end: string
      days: string[]
    }
  }): Promise<Team> {
    try {
      const response = await fetch(`${this.baseUrl}/teams`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(teamData),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Failed to create team")
      }

      return result as Team
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAnalyticsMostCommon(period: "week" | "month" = "week"): Promise<AnalyticsMostCommonResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/most-common?period=${period}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AnalyticsMostCommonResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAnalyticsResolutionTime(period: "week" | "month" = "month"): Promise<AnalyticsResolutionTimeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/avg-resolution-time?period=${period}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AnalyticsResolutionTimeResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAnalyticsTopLocations(limit = 10): Promise<AnalyticsTopLocationsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/top-locations?limit=${limit}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AnalyticsTopLocationsResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAnalyticsWeeklySummary(from: string, to: string): Promise<AnalyticsWeeklySummaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/weekly-summary?from=${from}&to=${to}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AnalyticsWeeklySummaryResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async getAnalyticsHeatmapData(): Promise<AnalyticsHeatmapResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/heatmap-data`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw new Error(error.details || error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json() as Promise<AnalyticsHeatmapResponse>
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async assignReportsToTeam(
    teamId: string,
    reportIds: string[],
    priority = "medium",
  ): Promise<{
    message: string
    team: {
      id: string
      name: string
      currentLoad: number
      capacity: number
      availableCapacity: number
      assignedReports: Array<{
        reportId: string
        assignedAt: string
        priority: string
      }>
    }
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${teamId}/assign`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reportIds, priority }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Failed to assign reports to team")
      }

      return result
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Login failed")
      }

      return result as AuthResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Signup failed")
      }

      return result as AuthResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }

  async guestLogin(): Promise<GuestAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok) {
        const error = result as ApiError
        throw new Error(error.details || error.error || "Guest login failed")
      }

      return result as GuestAuthResponse
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Unable to connect to server. Please check your internet connection.")
      }
      throw error
    }
  }
}

// Default API client instance
export const apiClient = new ApiClient()

export const api = apiClient

// Enhanced error handling for authentication failures
const handleAuthError = (error: Error, statusCode: number): never => {
  // Clear auth state on 401/403 errors
  if (statusCode === 401 || statusCode === 403) {
    // Clear auth token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
    }
    // Clear auth token from API client
    apiClient.setAuthToken(null)
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/admin'
    }
  }
  throw error
}
