/**
 * WASM RSA 服务 —— Web Worker RPC 代理
 *
 * 所有 .NET WASM 运行时位于独立的 Web Worker 中，通过 postMessage 进行异步调用。
 * 本模块对外暴露的 API 签名与之前完全一致，页面代码无需任何改动。
 */

import type { CipherAlgorithm, RSAKeyPair, RSAKeyType, SignerAlgorithm } from '@/types/rsa'

// ── Worker lifecycle ──────────────────────────────────────────────

let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
let readyPromise: Promise<void> | null = null
let ready = false

function onWorkerMessage(e: MessageEvent) {
  const { id, type, result, error } = e.data ?? {}

  if (type === 'ready') {
    ready = true
    return
  }

  const handler = pending.get(id as number)
  if (!handler) return
  pending.delete(id as number)

  if (error) {
    handler.reject(new Error(error as string))
  } else {
    handler.resolve(result)
  }
}

function call(method: string, ...args: unknown[]): Promise<unknown> {
  if (!worker || !ready) {
    return Promise.reject(new Error('WASM worker not initialized. Call initializeRuntime() first.'))
  }

  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    worker!.postMessage({ id, method, args })
  })
}

export function initializeRuntime(): Promise<void> {
  if (ready) return Promise.resolve()
  if (readyPromise) return readyPromise

  readyPromise = new Promise<void>((resolve, reject) => {
    try {
      // public/rsaWorker.js is served as a raw static file by Vite.
      worker = new Worker('/rsaWorker.js', { type: 'module' })

      worker.onmessage = (e: MessageEvent) => {
        const data = e.data ?? {}
        if (data.type === 'ready') {
          ready = true
          resolve()
        } else {
          onWorkerMessage(e)
        }
      }

      worker.onerror = (err) => {
        const message = err instanceof ErrorEvent ? err.message : 'Worker error'
        readyPromise = null
        reject(new Error(message))
      }
    } catch (err) {
      readyPromise = null
      reject(err)
    }
  })

  readyPromise.catch(() => {
    readyPromise = null
  })

  return readyPromise
}

// ── Public API (unchanged signatures) ─────────────────────────────

export async function generateKeyPair(
  type: RSAKeyType,
  keySize: number,
  usePemFormat: boolean,
  strictBitLength = false
): Promise<RSAKeyPair> {
  const json = await call('GenerateKeyPair', type, keySize, usePemFormat, strictBitLength)
  return JSON.parse(json as string) as RSAKeyPair
}

export async function encrypt(
  type: RSAKeyType,
  plaintext: string,
  publicKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  return (await call('Encrypt', type, plaintext, publicKey, algorithm)) as string
}

export async function decrypt(
  type: RSAKeyType,
  ciphertext: string,
  privateKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  return (await call('Decrypt', type, ciphertext, privateKey, algorithm)) as string
}

export async function encryptByPrivateKey(
  type: RSAKeyType,
  plaintext: string,
  privateKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  return (await call('EncryptByPrivateKey', type, plaintext, privateKey, algorithm)) as string
}

export async function decryptByPublicKey(
  type: RSAKeyType,
  ciphertext: string,
  publicKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  return (await call('DecryptByPublicKey', type, ciphertext, publicKey, algorithm)) as string
}

export async function sign(
  type: RSAKeyType,
  data: string,
  privateKey: string,
  algorithm: SignerAlgorithm
): Promise<string> {
  return (await call('Sign', type, data, privateKey, algorithm)) as string
}

export async function verify(
  type: RSAKeyType,
  data: string,
  signature: string,
  publicKey: string,
  algorithm: SignerAlgorithm
): Promise<boolean> {
  return (await call('Verify', type, data, signature, publicKey, algorithm)) as boolean
}

export async function transformPublicKeyFormat(
  publicKey: string,
  targetType: RSAKeyType,
  usePemFormat: boolean
): Promise<string> {
  return (await call('TransformPublicKeyFormat', publicKey, targetType, usePemFormat)) as string
}

export async function transformPrivateKeyFormat(
  privateKey: string,
  targetType: RSAKeyType,
  usePemFormat: boolean
): Promise<{ success: boolean; publicKey: string; privateKey: string }> {
  const json = await call('TransformPrivateKeyFormat', privateKey, targetType, usePemFormat)
  return JSON.parse(json as string)
}

export async function detectKeyType(key: string, isPrivate: boolean): Promise<RSAKeyType | null> {
  const json = await call('DetectKeyType', key, isPrivate)
  const result = JSON.parse(json as string) as { type: number | null }
  return result.type === null ? null : (result.type as RSAKeyType)
}
