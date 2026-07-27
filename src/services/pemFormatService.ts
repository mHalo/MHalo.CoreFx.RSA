const publicKeyHeaders: Record<number, [string, string]> = {
  0: ['-----BEGIN RSA PUBLIC KEY-----', '-----END RSA PUBLIC KEY-----'],
  1: ['-----BEGIN PUBLIC KEY-----', '-----END PUBLIC KEY-----']
}

const privateKeyHeaders: Record<number, [string, string]> = {
  0: ['-----BEGIN RSA PRIVATE KEY-----', '-----END RSA PRIVATE KEY-----'],
  1: ['-----BEGIN PRIVATE KEY-----', '-----END PRIVATE KEY-----']
}

export function formatPublicKey(type: number, base64Body: string): string {
  const headers = publicKeyHeaders[type]
  if (!headers) throw new Error(`Public key type ${type} does not support PEM formatting`)
  return wrapWithPem(headers[0], headers[1], base64Body)
}

export function formatPrivateKey(type: number, base64Body: string): string {
  const headers = privateKeyHeaders[type]
  if (!headers) throw new Error(`Private key type ${type} does not support PEM formatting`)
  return wrapWithPem(headers[0], headers[1], base64Body)
}

export function removePemFormatting(key: string): string {
  return key
    .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
    .replace(/-----END RSA PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
    .replace(/-----END RSA PUBLIC KEY-----/g, '')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '')
    .trim()
}

function wrapWithPem(begin: string, end: string, body: string): string {
  const lines: string[] = [begin]
  for (let i = 0; i < body.length; i += 64) {
    lines.push(body.slice(i, i + 64))
  }
  lines.push(end)
  return lines.join('\n')
}
