import type { CipherAlgorithm, RSAKeyPair, RSAKeyType, SignerAlgorithm } from '@/types/rsa'

interface DotnetRuntime {
  getConfig(): { mainAssemblyName: string }
  getAssemblyExports(assemblyName: string): Promise<Record<string, unknown>>
}

interface DotnetHost {
  create(): Promise<DotnetRuntime>
}

let exports: Record<string, (...args: unknown[]) => unknown> | null = null

export async function initializeRuntime(): Promise<void> {
  if (exports) return

  // The .NET 9 WASM host is published under wwwroot/_framework/ and served
  // from Vite's publicDir (src/public) at the web root. The specifier is
  // kept non-static so Rollup leaves the runtime URL untouched.
  const dotnetJsUrl = '/wasm-core/wwwroot/_framework/dotnet.js'
  const { dotnet } = (await import(/* @vite-ignore */ dotnetJsUrl)) as {
    dotnet: DotnetHost
  }
  const runtime = await dotnet.create()
  const config = runtime.getConfig()
  const assemblyExports = await runtime.getAssemblyExports(config.mainAssemblyName)
  let svc: Record<string, unknown> = assemblyExports.RsaToolBox as Record<string, unknown>
  svc = svc.Crossfrom as Record<string, unknown>
  svc = svc.Core as Record<string, unknown>
  exports = svc.RsaInteropService as Record<string, (...args: unknown[]) => unknown>
}

export async function generateKeyPair(
  type: RSAKeyType,
  keySize: number,
  usePemFormat: boolean
): Promise<RSAKeyPair> {
  ensureExports()
  const json = exports!.GenerateKeyPair(type, keySize, usePemFormat) as string
  return JSON.parse(json) as RSAKeyPair
}

export async function encrypt(
  type: RSAKeyType,
  plaintext: string,
  publicKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  ensureExports()
  return exports!.Encrypt(type, plaintext, publicKey, algorithm) as string
}

export async function decrypt(
  type: RSAKeyType,
  ciphertext: string,
  privateKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  ensureExports()
  return exports!.Decrypt(type, ciphertext, privateKey, algorithm) as string
}

export async function encryptByPrivateKey(
  type: RSAKeyType,
  plaintext: string,
  privateKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  ensureExports()
  return exports!.EncryptByPrivateKey(type, plaintext, privateKey, algorithm) as string
}

export async function decryptByPublicKey(
  type: RSAKeyType,
  ciphertext: string,
  publicKey: string,
  algorithm: CipherAlgorithm
): Promise<string> {
  ensureExports()
  return exports!.DecryptByPublicKey(type, ciphertext, publicKey, algorithm) as string
}

export async function sign(
  type: RSAKeyType,
  data: string,
  privateKey: string,
  algorithm: SignerAlgorithm
): Promise<string> {
  ensureExports()
  return exports!.Sign(type, data, privateKey, algorithm) as string
}

export async function verify(
  type: RSAKeyType,
  data: string,
  signature: string,
  publicKey: string,
  algorithm: SignerAlgorithm
): Promise<boolean> {
  ensureExports()
  return exports!.Verify(type, data, signature, publicKey, algorithm) as boolean
}

export async function transformPublicKeyFormat(
  publicKey: string,
  targetType: RSAKeyType,
  usePemFormat: boolean
): Promise<string> {
  ensureExports()
  return exports!.TransformPublicKeyFormat(publicKey, targetType, usePemFormat) as string
}

export async function transformPrivateKeyFormat(
  privateKey: string,
  targetType: RSAKeyType,
  usePemFormat: boolean
): Promise<{ success: boolean; publicKey: string; privateKey: string }> {
  ensureExports()
  const json = exports!.TransformPrivateKeyFormat(privateKey, targetType, usePemFormat) as string
  return JSON.parse(json)
}

export async function detectKeyType(key: string, isPrivate: boolean): Promise<RSAKeyType | null> {
  ensureExports()
  const json = exports!.DetectKeyType(key, isPrivate) as string
  const result = JSON.parse(json) as { type: number | null }
  return result.type === null ? null : (result.type as RSAKeyType)
}

function ensureExports(): void {
  if (!exports) {
    throw new Error('WASM runtime not initialized. Call initializeRuntime() first.')
  }
}
