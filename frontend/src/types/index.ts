/**
 * TypeScript type definitions for CareForge frontend matching backend schemas.
 */

export interface BrandSummary {
  id: string | number
  name?: string
  company_name?: string
  slug?: string
  logo_url: string
  brand_color: string
  created_at: string
  blogs_count?: number
  blog_count?: number
}

export interface BlogSummary {
  id: string | number
  brand_id: string | number
  topic: string
  slug: string
  word_count: number
  created_at: string
}

export interface BlogDetail extends BlogSummary {
  content_markdown: string
  content?: string
  company_name: string
  logo_url: string
  brand_color: string
}

export interface BrandDetail {
  id: string | number
  name?: string
  company_name: string
  slug?: string
  logo_url: string
  brand_color: string
  created_at: string
  blogs: BlogSummary[]
}

export interface GenerateRequest {
  company_name: string
  logo_url: string
  brand_color: string
  topics: string[]
}

export interface GenerateResponse {
  brand_id: number
  company_name: string
  brand_color: string
  blogs: BlogSummary[]
  brand?: BrandDetail
  failed_topics?: string[]
  message?: string
}

export interface ApiError {
  detail: string | { msg: string; loc: string[] }[]
}
