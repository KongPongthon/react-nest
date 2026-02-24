import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateCodeChallenge,
  generateRandomString,
  getScope,
} from './oauth-script'
const scopes: string = import.meta.env.VITE_APP_SCOPES
const MSAppIDUri: string = import.meta.env.VITE_MS_APPID_URI
const MS_APPID_URI = import.meta.env.VITE_MS_APPID_URI
const VITE_APP_SCOPES = import.meta.env.VITE_APP_SCOPES
describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.stubEnv(scopes, 'user.read,mail.send')
    vi.stubEnv(MSAppIDUri, 'api://my-app/')
  })

  it('getScope: ควรต่อ String ของ scope ให้ถูกต้องตามรูปแบบ', () => {
    const result = getScope()
    expect(result).toBe(
      `${MS_APPID_URI}offline_access ${MS_APPID_URI}user.read`,
    )
  })

  it('generateRandomString: ควรสร้าง string ตามความยาวที่กำหนด', () => {
    const length = 50
    const result = generateRandomString(length)
    expect(result).toHaveLength(length)
    expect(result).toMatch(/^[A-Z0-9]+$/)
  })

  // --- Test generateCodeChallenge (Async + Crypto) ---
  it('generateCodeChallenge: ควรทำ Hash SHA-256 และ encode เป็น base64url', async () => {
    const verifier = 'test-verifier-string-1234567890-test-verifier'

    // หมายเหตุ: ใน Vitest (ถ้ารันด้วย JSDOM หรือ Happy DOM)
    // มักจะมี crypto.subtle มาให้แล้ว แต่ถ้าไม่มีอาจต้อง mock เพิ่ม
    const challenge = await generateCodeChallenge(verifier)

    expect(challenge).toBeDefined()
    expect(typeof challenge).toBe('string')
    // base64url จะต้องไม่มี +, /, =
    expect(challenge).not.toContain('+')
    expect(challenge).not.toContain('/')
    expect(challenge).not.toContain('=')
  })
})
