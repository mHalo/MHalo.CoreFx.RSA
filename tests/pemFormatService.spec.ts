import { describe, expect, it } from 'vitest'
import { formatPublicKey, formatPrivateKey, removePemFormatting } from '@/services/pemFormatService'

describe('pemFormatService', () => {
  it('formats PKCS#1 public key', () => {
    const body = 'AAAA'
    const result = formatPublicKey(0, body)
    expect(result).toContain('-----BEGIN RSA PUBLIC KEY-----')
    expect(result).toContain('-----END RSA PUBLIC KEY-----')
    expect(result).toContain('AAAA')
  })

  it('formats PKCS#8 private key', () => {
    const body = 'BBBB'
    const result = formatPrivateKey(1, body)
    expect(result).toContain('-----BEGIN PRIVATE KEY-----')
    expect(result).toContain('-----END PRIVATE KEY-----')
    expect(result).toContain('BBBB')
  })

  it('removes PEM formatting and line breaks', () => {
    const key = '-----BEGIN PUBLIC KEY-----\nABCD\nEFGH\n-----END PUBLIC KEY-----'
    expect(removePemFormatting(key)).toBe('ABCDEFGH')
  })
})
