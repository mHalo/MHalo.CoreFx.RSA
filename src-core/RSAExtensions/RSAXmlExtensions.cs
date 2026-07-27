using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using System.Text;
using System.Xml.Linq;
// ReSharper disable InconsistentNaming
// ReSharper disable MemberCanBePrivate.Global

namespace MHalo.CoreFx.Helper.Encrypters.RSAExtensions
{
    /// <summary>
    /// XML (RSAKeyValue) format import/export, byte-for-byte compatible with .NET
    /// <c>RSA.ToXmlString()</c> / <c>RSA.FromXmlString()</c>. BouncyCastle only.
    /// </summary>
    public static class RSAXmlExtensions
    {
        /// <summary>
        /// Parse an XML private key (&lt;RSAKeyValue&gt; with Modulus/Exponent/P/Q/DP/DQ/InverseQ/D)
        /// into BouncyCastle CRT key parameters.
        /// </summary>
        public static RsaPrivateCrtKeyParameters ParseXmlPrivateKey(string privateKey)
        {
            try
            {
                XElement root = XElement.Parse(privateKey);

                var modulus = root.Element("Modulus");
                var exponent = root.Element("Exponent");
                var p = root.Element("P");
                var q = root.Element("Q");
                var dp = root.Element("DP");
                var dq = root.Element("DQ");
                var inverseQ = root.Element("InverseQ");
                var d = root.Element("D");

                if (modulus?.Value == null || exponent?.Value == null || p?.Value == null ||
                    q?.Value == null || dp?.Value == null || dq?.Value == null ||
                    inverseQ?.Value == null || d?.Value == null)
                {
                    throw new ArgumentException("The xml private key is missing required elements.");
                }

                return new RsaPrivateCrtKeyParameters(
                    ToBigInteger(modulus.Value),
                    ToBigInteger(exponent.Value),
                    ToBigInteger(d.Value),
                    ToBigInteger(p.Value),
                    ToBigInteger(q.Value),
                    ToBigInteger(dp.Value),
                    ToBigInteger(dq.Value),
                    ToBigInteger(inverseQ.Value));
            }
            catch (Exception e)
            {
                throw new Exception("The xml private key is incorrect.", e);
            }
        }

        /// <summary>
        /// Parse an XML public key (&lt;RSAKeyValue&gt; with Modulus/Exponent)
        /// into BouncyCastle key parameters.
        /// </summary>
        public static RsaKeyParameters ParseXmlPublicKey(string publicKey)
        {
            try
            {
                XElement root = XElement.Parse(publicKey);

                var modulus = root.Element("Modulus");
                var exponent = root.Element("Exponent");

                if (modulus?.Value == null || exponent?.Value == null)
                {
                    throw new ArgumentException("The xml public key is missing required elements.");
                }

                return new RsaKeyParameters(false, ToBigInteger(modulus.Value), ToBigInteger(exponent.Value));
            }
            catch (Exception e)
            {
                throw new Exception("The xml public key is incorrect.", e);
            }
        }

        /// <summary>
        /// Export private key parameters as XML, identical to .NET <c>RSA.ToXmlString(true)</c>.
        /// Element order: Modulus, Exponent, P, Q, DP, DQ, InverseQ, D.
        /// </summary>
        public static string ToXmlPrivateKeyString(this RsaPrivateCrtKeyParameters privateKey)
        {
            int modulusLength = privateKey.Modulus.ToByteArrayUnsigned().Length;
            int halfLength = modulusLength / 2;

            var sb = new StringBuilder();
            sb.Append("<RSAKeyValue>");
            AppendElement(sb, "Modulus", privateKey.Modulus.ToByteArrayUnsigned());
            AppendElement(sb, "Exponent", privateKey.PublicExponent.ToByteArrayUnsigned());
            AppendElement(sb, "P", ToPaddedBytes(privateKey.P, halfLength));
            AppendElement(sb, "Q", ToPaddedBytes(privateKey.Q, halfLength));
            AppendElement(sb, "DP", ToPaddedBytes(privateKey.DP, halfLength));
            AppendElement(sb, "DQ", ToPaddedBytes(privateKey.DQ, halfLength));
            AppendElement(sb, "InverseQ", ToPaddedBytes(privateKey.QInv, halfLength));
            AppendElement(sb, "D", ToPaddedBytes(privateKey.Exponent, modulusLength));
            sb.Append("</RSAKeyValue>");
            return sb.ToString();
        }

        /// <summary>
        /// Export public key parameters as XML, identical to .NET <c>RSA.ToXmlString(false)</c>.
        /// </summary>
        public static string ToXmlPublicKeyString(this RsaKeyParameters publicKey)
        {
            var sb = new StringBuilder();
            sb.Append("<RSAKeyValue>");
            AppendElement(sb, "Modulus", publicKey.Modulus.ToByteArrayUnsigned());
            AppendElement(sb, "Exponent", publicKey.Exponent.ToByteArrayUnsigned());
            sb.Append("</RSAKeyValue>");
            return sb.ToString();
        }

        private static BigInteger ToBigInteger(string base64)
        {
            return new BigInteger(1, Convert.FromBase64String(base64));
        }

        private static void AppendElement(StringBuilder sb, string name, byte[] unsignedBigEndian)
        {
            sb.Append('<').Append(name).Append('>')
                .Append(Convert.ToBase64String(unsignedBigEndian))
                .Append("</").Append(name).Append('>');
        }

        /// <summary>
        /// .NET XML keys store P/Q/DP/DQ/InverseQ at half the modulus byte length and D at the
        /// full modulus byte length (unsigned big-endian, left-padded with zeros).
        /// </summary>
        private static byte[] ToPaddedBytes(BigInteger value, int length)
        {
            byte[] bytes = value.ToByteArrayUnsigned();
            if (bytes.Length == length)
            {
                return bytes;
            }
            if (bytes.Length > length)
            {
                // Defensive: keep the least significant bytes.
                byte[] trimmed = new byte[length];
                Buffer.BlockCopy(bytes, bytes.Length - length, trimmed, 0, length);
                return trimmed;
            }
            byte[] padded = new byte[length];
            Buffer.BlockCopy(bytes, 0, padded, length - bytes.Length, bytes.Length);
            return padded;
        }
    }
}
