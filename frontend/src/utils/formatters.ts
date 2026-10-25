/**
 * Pure utility functions for CareForge frontend formatting.
 */

export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Updated recently'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Saved just now'
    if (diffMins < 60) return `Updated ${diffMins}m ago`
    if (diffHours < 24) return `Updated ${diffHours}h ago`
    if (diffDays === 1) return 'Updated 1 day ago'
    if (diffDays < 30) return `Updated ${diffDays} days ago`
    return `Updated on ${date.toLocaleDateString()}`
  } catch {
    return 'Updated recently'
  }
}

export function getCompanyInitial(name: string): string {
  if (!name || !name.trim()) return 'C'
  return name.trim().charAt(0).toUpperCase()
}

export function formatSubdomain(slugOrName: string): string {
  if (!slugOrName) return 'careforge.app'
  const clean = slugOrName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return `${clean || 'company'}.careforge.app`
}

export function generateSlug(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
