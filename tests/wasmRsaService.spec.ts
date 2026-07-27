import { describe, expect, it, beforeAll } from 'vitest'
import {
  initializeRuntime,
  generateKeyPair,
  encrypt,
  decrypt,
  sign,
  verify,
  transformPublicKeyFormat
} from '@/services/wasmRsaService'
import { CipherAlgorithm, RSAKeyType, SignerAlgorithm } from '@/types/rsa'

const longText = 'A'.repeat(500)

beforeAll(async () => {
  await initializeRuntime()
})

describe('wasmRsaService compatibility', () => {
  it.skip('generates a PKCS#8 key pair and round-trips PKCS#1 v1.5 encryption', async () => {
    const pair = await generateKeyPair(RSAKeyType.Pkcs8, 2048, false)
    expect(pair.publicKey).toBeTruthy()
    expect(pair.privateKey).toBeTruthy()

    const cipher = await encrypt(RSAKeyType.Pkcs8, longText, pair.publicKey, CipherAlgorithm.RSA_ECB_PKCS1Padding)
    const plain = await decrypt(RSAKeyType.Pkcs8, cipher, pair.privateKey, CipherAlgorithm.RSA_ECB_PKCS1Padding)
    expect(plain).toBe(longText)
  })

  it.skip('round-trips OAEP-SHA256 encryption', async () => {
    const pair = await generateKeyPair(RSAKeyType.Pkcs8, 2048, false)
    const cipher = await encrypt(RSAKeyType.Pkcs8, longText, pair.publicKey, CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding)
    const plain = await decrypt(RSAKeyType.Pkcs8, cipher, pair.privateKey, CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding)
    expect(plain).toBe(longText)
  })

  it.skip('round-trips SHA256withRSA signature', async () => {
    const pair = await generateKeyPair(RSAKeyType.Pkcs8, 2048, false)
    const signature = await sign(RSAKeyType.Pkcs8, 'hello world', pair.privateKey, SignerAlgorithm.SHA256withRSA)
    const valid = await verify(RSAKeyType.Pkcs8, 'hello world', signature, pair.publicKey, SignerAlgorithm.SHA256withRSA)
    expect(valid).toBe(true)
  })

  it.skip('transforms public key format', async () => {
    const pair = await generateKeyPair(RSAKeyType.Pkcs1, 2048, false)
    const pkcs8 = await transformPublicKeyFormat(pair.publicKey, RSAKeyType.Pkcs8, false)
    expect(pkcs8).toBeTruthy()
    expect(pkcs8).not.toBe(pair.publicKey)
  })
})
