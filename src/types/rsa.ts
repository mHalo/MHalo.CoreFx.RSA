export enum RSAKeyType {
  Pkcs1 = 0,
  Pkcs8 = 1,
  Xml = 2
}

export enum CipherAlgorithm {
  RSA_ECB_PKCS1Padding = 0,
  RSA_ECB_OAEPWithSHA_1AndMGF1Padding = 1,
  RSA_ECB_OAEPWithSHA_256AndMGF1Padding = 2
}

export enum SignerAlgorithm {
  SHA1withRSA = 0,
  SHA256withRSA = 1,
  SHA384withRSA = 2,
  SHA512withRSA = 3,
  SHA1withECDSA = 4,
  SHA224withECDSA = 5,
  SHA256withECDSA = 6,
  SHA384withECDSA = 7,
  SHA512withECDSA = 8,
  MD5withRSA = 9
}

export interface RSAKeyPair {
  publicKey: string
  privateKey: string
}
