using MHalo.CoreFx.Helper;
using MHalo.CoreFx.Helper.Encrypters.RSAExtensions;
using System;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json.Nodes;

namespace RsaToolBox.Crossfrom.Core;

public static partial class RsaInteropService
{
    [JSExport]
    public static string GenerateKeyPair(int keyType, int keySize, bool usePemFormat, bool strictBitLength = false)
    {
        var (publicKey, privateKey) = RSAHelper.ExportRSAKey(
            (RSAKeyType)keyType, keySize, usePemFormat, strictBitLength);
        return new JsonObject
        {
            ["publicKey"] = publicKey,
            ["privateKey"] = privateKey
        }.ToJsonString();
    }

    [JSExport]
    public static string Encrypt(int keyType, string plaintext, string publicKey, int cipherAlgorithm)
    {
        return RSAHelper.Encrypt(
            (RSAKeyType)keyType,
            plaintext,
            publicKey,
            (CipherAlgorithm)cipherAlgorithm);
    }

    [JSExport]
    public static string Decrypt(int keyType, string ciphertext, string privateKey, int cipherAlgorithm)
    {
        return RSAHelper.Decrypt(
            (RSAKeyType)keyType,
            ciphertext,
            privateKey,
            (CipherAlgorithm)cipherAlgorithm);
    }

    [JSExport]
    public static string EncryptByPrivateKey(int keyType, string plaintext, string privateKey, int cipherAlgorithm)
    {
        return RSAHelper.EncryptByPrivateKey(
            (RSAKeyType)keyType,
            plaintext,
            privateKey,
            (CipherAlgorithm)cipherAlgorithm);
    }

    [JSExport]
    public static string DecryptByPublicKey(int keyType, string ciphertext, string publicKey, int cipherAlgorithm)
    {
        return RSAHelper.DecryptByPublicKey(
            (RSAKeyType)keyType,
            ciphertext,
            publicKey,
            (CipherAlgorithm)cipherAlgorithm);
    }

    [JSExport]
    public static string Sign(int keyType, string data, string privateKey, int signerAlgorithm)
    {
        return RSAHelper.SignData(
            (RSAKeyType)keyType,
            data,
            privateKey,
            (SignerAlgorithm)signerAlgorithm);
    }

    [JSExport]
    public static bool Verify(int keyType, string data, string signature, string publicKey, int signerAlgorithm)
    {
        return RSAHelper.VerifyData(
            (RSAKeyType)keyType,
            data,
            signature,
            publicKey,
            (SignerAlgorithm)signerAlgorithm);
    }

    [JSExport]
    public static string TransformPublicKeyFormat(string publicKey, int targetKeyType, bool usePemFormat)
    {
        return RSAHelper.TransformPublicKeyFormat(
            publicKey,
            (RSAKeyType)targetKeyType,
            usePemFormat);
    }

    [JSExport]
    public static string TransformPrivateKeyFormat(string privateKey, int targetKeyType, bool usePemFormat)
    {
        var success = RSAHelper.TryTransformKeyFormat(
            (RSAKeyType)targetKeyType,
            privateKey,
            out var publicKey,
            out var privateKeyOut,
            usePemFormat);

        return new JsonObject
        {
            ["success"] = success,
            ["publicKey"] = publicKey,
            ["privateKey"] = privateKeyOut
        }.ToJsonString();
    }

    [JSExport]
    public static string DetectKeyType(string key, bool isPrivate)
    {
        RSAKeyType? type = null;
        if (isPrivate)
        {
            RSAKeyExtensions.IsValidPrivateKey(key, out type);
        }
        else
        {
            RSAKeyExtensions.IsValidPublicKey(key, out type);
        }

        return new JsonObject
        {
            ["type"] = type.HasValue ? JsonValue.Create((int)type.Value) : null
        }.ToJsonString();
    }
}
