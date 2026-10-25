/**
 * TypeScript type definitions for CareForge frontend matching backend schemas.
 */

export interface BrandSummary {
  id: string
  name: string
  slug: string
  logo_url: string
  brand_color: string
  created_at: string
  blogs_count: number
}

export interface BlogSummary {
  id: string
  brand_id: string
  topic: string
  slug: string
  word_count: number
  created_at: string
}

export interface BlogDetail extends BlogSummary {
  content: string
}

export interface BrandDetail extends BrandSummary {
  blogs: BlogSummary[]
}

export interface GenerateRequest {
  company_name: string
  logo_url: string
  brand_color: string
  topics: string[]
}

export interface GenerateResponse {
  brand: BrandDetail
  failed_topics: string[]
  message: string
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[]
}
