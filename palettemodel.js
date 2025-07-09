import { z } from 'zod'

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api'

const PaletteSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    colors: z.array(z.string()),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    userId: z.string().optional(),
  })
  .passthrough()

/** @typedef {z.infer<typeof PaletteSchema>} Palette */

/**
 * Create a new palette.
 * @param {object} data
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<Palette>}
 */
export async function createPalette(data, { signal } = {}) {
  return _requestJson('/palettes', { method: 'POST', body: data, signal })
}

/**
 * Retrieve a palette by ID.
 * @param {string} id
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<Palette>}
 */
export async function getPalette(id, { signal } = {}) {
  if (!id) {
    throw new Error('Palette ID is required')
  }
  return _requestJson(`/palettes/${encodeURIComponent(id)}`, { method: 'GET', signal })
}

/**
 * Delete a palette by ID.
 * @param {string} id
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<void>}
 */
export async function deletePalette(id, { signal } = {}) {
  if (!id) {
    throw new Error('Palette ID is required')
  }
  await _requestVoid(`/palettes/${encodeURIComponent(id)}`, { method: 'DELETE', signal })
}

async function _requestJson(path, { method, body, signal }) {
  const url = `${API_BASE_URL}${path}`
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  const response = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to ${method} ${url}: ${response.status} ${errorText}`)
  }
  const contentType = response.headers.get('Content-Type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response from ${url} but got '${contentType}'`)
  }
  const json = await response.json()
  const parsed = PaletteSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error(`Invalid response format from ${url}: ${parsed.error}`)
  }
  return parsed.data
}

async function _requestVoid(path, { method, signal }) {
  const url = `${API_BASE_URL}${path}`
  const response = await fetch(url, { method, signal })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to ${method} ${url}: ${response.status} ${errorText}`)
  }
}