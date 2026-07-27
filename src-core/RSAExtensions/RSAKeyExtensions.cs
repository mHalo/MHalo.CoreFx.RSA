using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;
using System.Xml;
// ReSharper disable InconsistentNaming
// ReSharper disable MemberCanBePrivate.Global

namespace MHalo.CoreFx.Helper.Encrypters.RSAExtensions
{
    /// <summary>
    /// RSA key import/export helpers. Support XML format and PEM format.
    /// BouncyCastle only: no dependency on System.Security.Cryptography.RSA,
    /// so the code runs on browser-wasm.
    /// </summary>
    public static class RSAKeyExtensions
    {
        #region ImportKey

        /// <summary>
        /// Import a private key (base64 body, PEM or XML) into BouncyCastle CRT key parameters.
        /// </summary>
        /// <param name="type">密钥类型</param>
        /// <param name="privateKey">私钥内容</param>
        /// <param name="isPem">是否为PEM格式,当密钥类型为Xml时，此参数不起效</param>
        public static RsaPrivateCrtKeyParameters ImportPrivateKey(RSAKeyType type, string privateKey, bool isPem = false)
        {
            if (isPem)
            {
                privateKey = PemFormatUtil.RemoveFormat(privateKey);
            }
            switch (type)
            {
                case RSAKeyType.Pkcs1:
                    return ParsePkcs1PrivateKey(Convert.FromBase64String(privateKey));
                case RSAKeyType.Pkcs8:
                    return ParsePkcs8PrivateKey(Convert.FromBase64String(privateKey));
                case RSAKeyType.Xml:
                    return RSAXmlExtensions.ParseXmlPrivateKey(privateKey);
                default:
                    throw new ArgumentOutOfRangeException(nameof(type), type, null);
            }
        }

        /// <summary>
        /// Import a public key (base64 body, PEM or XML) into BouncyCastle key parameters.
        /// </summary>
        /// <param name="type">密钥类型</param>
        /// <param name="publicKey">公钥内容</param>
        /// <param name="isPem">是否为PEM格式,当密钥类型为Xml时，此参数不起效</param>
        public static RsaKeyParameters ImportPublicKey(RSAKeyType type, string publicKey, bool isPem = false)
        {
            if (isPem)
            {
                publicKey = PemFormatUtil.RemoveFormat(publicKey);
            }

            switch (type)
            {
                case RSAKeyType.Pkcs1:
                    return ParsePkcs1PublicKey(Convert.FromBase64String(publicKey));
                case RSAKeyType.Pkcs8:
                    return ParsePkcs8PublicKey(Convert.FromBase64String(publicKey));
                case RSAKeyType.Xml:
                    return RSAXmlExtensions.ParseXmlPublicKey(publicKey);
                default:
                    throw new ArgumentOutOfRangeException(nameof(type), type, null);
            }
        }

        private static RsaPrivateCrtKeyParameters ParsePkcs1PrivateKey(byte[] privateKey)
        {
            RsaPrivateKeyStructure structure = RsaPrivateKeyStructure.GetInstance(Asn1Object.FromByteArray(privateKey));
            return new RsaPrivateCrtKeyParameters(
                structure.Modulus,
                structure.PublicExponent,
                structure.PrivateExponent,
                structure.Prime1,
                structure.Prime2,
                structure.Exponent1,
                structure.Exponent2,
                structure.Coefficient);
        }

        private static RsaPrivateCrtKeyParameters ParsePkcs8PrivateKey(byte[] privateKey)
        {
            AsymmetricKeyParameter key = PrivateKeyFactory.CreateKey(privateKey);
            if (key is not RsaPrivateCrtKeyParameters rsaKey)
            {
                throw new ArgumentException("The pkcs8 private key is not a valid RSA private key.");
            }
            return rsaKey;
        }

        private static RsaKeyParameters ParsePkcs1PublicKey(byte[] publicKey)
        {
            RsaPublicKeyStructure structure = RsaPublicKeyStructure.GetInstance(Asn1Object.FromByteArray(publicKey));
            return new RsaKeyParameters(false, structure.Modulus, structure.PublicExponent);
        }

        private static RsaKeyParameters ParsePkcs8PublicKey(byte[] publicKey)
        {
            AsymmetricKeyParameter key = PublicKeyFactory.CreateKey(publicKey);
            if (key is not RsaKeyParameters rsaKey || rsaKey.IsPrivate)
            {
                throw new ArgumentException("The pkcs8 public key is not a valid RSA public key.");
            }
            return rsaKey;
        }

        #endregion

        #region ExportKey

        /// <summary>
        /// Export a private key. Output is byte-for-byte identical to the original
        /// System.Security.Cryptography.RSA based implementation.
        /// </summary>
        /// <param name="privateKey">BouncyCastle CRT private key parameters</param>
        /// <param name="type">密钥类型</param>
        /// <param name="usePemFormat">当密钥类型为Xml时，此参数不起效</param>
        public static string ExportPrivateKey(RsaPrivateCrtKeyParameters privateKey, RSAKeyType type, bool usePemFormat = false)
        {
            var key = type switch
            {
                RSAKeyType.Pkcs1 => Convert.ToBase64String(ExportPkcs1PrivateKey(privateKey)),
                RSAKeyType.Pkcs8 => Convert.ToBase64String(ExportPkcs8PrivateKey(privateKey)),
                RSAKeyType.Xml => privateKey.ToXmlPrivateKeyString(),
                _ => string.Empty
            };

            if (usePemFormat && type != RSAKeyType.Xml)
            {
                key = PemFormatUtil.GetPrivateKeyFormat(type, key);
            }

            return key;
        }

        /// <summary>
        /// Export a public key. Output is byte-for-byte identical to the original
        /// System.Security.Cryptography.RSA based implementation.
        /// </summary>
        /// <param name="publicKey">BouncyCastle public key parameters</param>
        /// <param name="type">密钥类型</param>
        /// <param name="usePemFormat">当密钥类型为Xml时，此参数不起效</param>
        public static string ExportPublicKey(RsaKeyParameters publicKey, RSAKeyType type, bool usePemFormat = false)
        {
            var key = type switch
            {
                RSAKeyType.Pkcs1 => Convert.ToBase64String(ExportPkcs1PublicKey(publicKey)),
                RSAKeyType.Pkcs8 => Convert.ToBase64String(ExportPkcs8PublicKey(publicKey)),
                RSAKeyType.Xml => publicKey.ToXmlPublicKeyString(),
                _ => string.Empty
            };

            if (usePemFormat && type != RSAKeyType.Xml)
            {
                key = PemFormatUtil.GetPublicKeyFormat(type, key);
            }

            return key;
        }

        /// <summary>
        /// PKCS#1 RSAPrivateKey DER, identical to .NET ExportRSAPrivateKey().
        /// </summary>
        public static byte[] ExportPkcs1PrivateKey(RsaPrivateCrtKeyParameters privateKey)
        {
            var structure = new RsaPrivateKeyStructure(
                privateKey.Modulus,
                privateKey.PublicExponent,
                privateKey.Exponent,
                privateKey.P,
                privateKey.Q,
                privateKey.DP,
                privateKey.DQ,
                privateKey.QInv);
            return structure.GetDerEncoded();
        }

        /// <summary>
        /// PKCS#8 PrivateKeyInfo DER, identical to .NET ExportPkcs8PrivateKey().
        /// </summary>
        public static byte[] ExportPkcs8PrivateKey(RsaPrivateCrtKeyParameters privateKey)
        {
            return PrivateKeyInfoFactory.CreatePrivateKeyInfo(privateKey).GetDerEncoded();
        }

        /// <summary>
        /// PKCS#1 RSAPublicKey DER, identical to .NET ExportRSAPublicKey().
        /// </summary>
        public static byte[] ExportPkcs1PublicKey(RsaKeyParameters publicKey)
        {
            var structure = new RsaPublicKeyStructure(publicKey.Modulus, publicKey.Exponent);
            return structure.GetDerEncoded();
        }

        /// <summary>
        /// X.509 SubjectPublicKeyInfo DER, identical to .NET ExportSubjectPublicKeyInfo().
        /// </summary>
        public static byte[] ExportPkcs8PublicKey(RsaKeyParameters publicKey)
        {
            return SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(publicKey).GetDerEncoded();
        }

        #endregion

        #region CreateAsymmetricKeyParameter

        private static class XMLRSAKeyManager
        {
            private static readonly Dictionary<string, AsymmetricKeyParameter> cachedParameters = new();
            public static AsymmetricKeyParameter GetPrivateParameters(string privateKeyContent)
            {
                if (cachedParameters.TryGetValue(privateKeyContent, out AsymmetricKeyParameter? param))
                {
                    return param;
                }
                param = RSAXmlExtensions.ParseXmlPrivateKey(privateKeyContent);
                cachedParameters[privateKeyContent] = param;
                return param;
            }
            public static AsymmetricKeyParameter GetPublicParameters(string publicKeyContent)
            {
                if (cachedParameters.TryGetValue(publicKeyContent, out AsymmetricKeyParameter? param))
                {
                    return param;
                }
                param = RSAXmlExtensions.ParseXmlPublicKey(publicKeyContent);
                cachedParameters[publicKeyContent] = param;
                return param;
            }
        }

        internal static AsymmetricKeyParameter CreateAsymmetricPublicKeyParameter(RSAKeyType keyType, string publicKeyContent)
        {
            AsymmetricKeyParameter publicKeyParameter;
            if (keyType.Equals(RSAKeyType.Pkcs1))
            {
                publicKeyContent = PemFormatUtil.RemoveFormat(publicKeyContent);
                byte[] keyByte = Convert.FromBase64String(publicKeyContent);
                RsaPublicKeyStructure publicKeyStructure = RsaPublicKeyStructure.GetInstance(Asn1Object.FromByteArray(keyByte));
                // 创建RSA公钥参数
                publicKeyParameter = new RsaKeyParameters(false, publicKeyStructure.Modulus, publicKeyStructure.PublicExponent);

            }
            else if (keyType.Equals(RSAKeyType.Pkcs8))
            {
                publicKeyContent = PemFormatUtil.RemoveFormat(publicKeyContent);
                byte[] keyByte = Convert.FromBase64String(publicKeyContent);
                publicKeyParameter = PublicKeyFactory.CreateKey(keyByte);
            }
            else
            {
                // 获取RSA参数
                publicKeyParameter = XMLRSAKeyManager.GetPublicParameters(publicKeyContent);
            }
            return publicKeyParameter;
        }

        internal static AsymmetricKeyParameter CreateAsymmetricPrivateKeyParameter(RSAKeyType keyType, string privateKeyContent)
        {
            AsymmetricKeyParameter privateKeyParameter;
            if (keyType.Equals(RSAKeyType.Pkcs1))
            {
                privateKeyContent = PemFormatUtil.RemoveFormat(privateKeyContent);
                byte[] keyByte = Convert.FromBase64String(privateKeyContent);

                RsaPrivateKeyStructure privateKeyStructure = RsaPrivateKeyStructure.GetInstance(Asn1Object.FromByteArray(keyByte));
                // 创建RSA私钥参数
                privateKeyParameter = new RsaPrivateCrtKeyParameters(
                    privateKeyStructure.Modulus,
                    privateKeyStructure.PublicExponent,
                    privateKeyStructure.PrivateExponent,
                    privateKeyStructure.Prime1,
                    privateKeyStructure.Prime2,
                    privateKeyStructure.Exponent1,
                    privateKeyStructure.Exponent2,
                    privateKeyStructure.Coefficient);
            }
            else if (keyType.Equals(RSAKeyType.Pkcs8))
            {
                privateKeyContent = PemFormatUtil.RemoveFormat(privateKeyContent);
                byte[] keyByte = Convert.FromBase64String(privateKeyContent);
                privateKeyParameter = PrivateKeyFactory.CreateKey(keyByte);
            }
            else
            {
                // 获取RSA参数
                privateKeyParameter = XMLRSAKeyManager.GetPrivateParameters(privateKeyContent);
            }
            return privateKeyParameter;
        }
        #endregion



        #region KeyValidator

        public static bool IsValidPublicKey(string publicKey, out RSAKeyType? keyType)
        {
            keyType = null;
            publicKey = PemFormatUtil.RemoveFormat(publicKey);
            try
            {
                ParsePkcs1PublicKey(Convert.FromBase64String(publicKey));
                keyType = RSAKeyType.Pkcs1;
                return true;
            }
            catch
            {
                try
                {
                    ParsePkcs8PublicKey(Convert.FromBase64String(publicKey));
                    keyType = RSAKeyType.Pkcs8;
                    return true;
                }
                catch
                {
                    try
                    {
                        XmlDocument xmlDoc = new XmlDocument();
                        xmlDoc.LoadXml(publicKey);
                        if (xmlDoc.DocumentElement!.Name.Equals("RSAKeyValue"))
                        {
                            var rootNode = xmlDoc.DocumentElement!;
                            // 检查是否包含Modulus和Exponent元素，这两个是公钥和私钥都必须有的
                            XmlNode? modulusNode = rootNode.SelectSingleNode("Modulus");
                            XmlNode? exponentNode = rootNode.SelectSingleNode("Exponent");
                            if (modulusNode != null && exponentNode != null && rootNode.ChildNodes.Count == 2)
                            {
                                keyType = RSAKeyType.Xml;
                                return true;
                            }
                        }
                    }
                    catch
                    {
                        // ignored
                    }

                    return false;
                }
            }
        }
        public static bool IsValidPrivateKey(string privateKey, out RSAKeyType? keyType)
        {
            keyType = null;
            privateKey = PemFormatUtil.RemoveFormat(privateKey);
            try
            {
                ParsePkcs1PrivateKey(Convert.FromBase64String(privateKey));
                keyType = RSAKeyType.Pkcs1;
                return true;
            }
            catch
            {
                try
                {
                    ParsePkcs8PrivateKey(Convert.FromBase64String(privateKey));
                    keyType = RSAKeyType.Pkcs8;
                    return true;
                }
                catch
                {
                    try
                    {
                        RSAXmlExtensions.ParseXmlPrivateKey(privateKey);
                        keyType = RSAKeyType.Xml;
                        return true;
                    }
                    catch
                    {
                        // ignored
                    }

                    return false;
                }
            }
        }

        #endregion

    }
}
