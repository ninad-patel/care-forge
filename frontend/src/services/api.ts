import type {
  BlogDetail,
  BrandDetail,
  BrandSummary,
  GenerateRequest,
  GenerateResponse,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

class ApiServiceError extends Error {
  status: number
  detail?: string

  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.name = 'ApiServiceError'
    this.status = status
    this.detail = detail
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = ''
    try {
      const errorJson = await res.json()
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((d: { msg?: string }) => d.msg || '').join(', ')
      }
    } catch {
      errorDetail = res.statusText
    }
    throw new ApiServiceError(
      res.status,
      errorDetail || `API request failed with status ${res.status}`,
      errorDetail
    )
  }
  return res.json()
}

export const api = {
  async getBrands(): Promise<BrandSummary[]> {
    const res = await fetch(`${BASE_URL}/api/brands`)
    return handleResponse<BrandSummary[]>(res)
  },

  async getBrandById(id: string): Promise<BrandDetail> {
    const res = await fetch(`${BASE_URL}/api/brands/${id}`)
    return handleResponse<BrandDetail>(res)
  },

  async getBlogById(id: string): Promise<BlogDetail> {
    const res = await fetch(`${BASE_URL}/api/blogs/${id}`)
    return handleResponse<BlogDetail>(res)
  },

  async generateBlogs(data: GenerateRequest): Promise<GenerateResponse> {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse<GenerateResponse>(res)
  },

  async deleteBrand(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/brands/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      throw new ApiServiceError(res.status, `Failed to delete brand with ID ${id}`)
    }
  },
}
