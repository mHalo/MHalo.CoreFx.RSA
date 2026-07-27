using System.Text;
using System.Text.Json;
using MHalo.CoreFx.Helper;
using MHalo.CoreFx.Helper.Encrypters.RSAExtensions;

// Cross-verification harness.
// Usage: run <workDir> <checkDataset|none> <generateDataset|none>
//   Original   stage1: run work none original
//   Refactored stage2: run work original refactored
//   Original   stage3: run work refactored none

var workDir = args[0];
var checkName = args.Length > 1 ? args[1] : "none";
var genName = args.Length > 2 ? args[2] : "none";

int failures = 0;
int checks = 0;

void Check(bool condition, string label)
{
    checks++;
    if (!condition)
    {
        failures++;
        Console.WriteLine($"FAIL: {label}");
    }
}

var combos = new (RSAKeyType type, bool pem)[]
{
    (RSAKeyType.Pkcs1, false), (RSAKeyType.Pkcs1, true),
    (RSAKeyType.Pkcs8, false), (RSAKeyType.Pkcs8, true),
    (RSAKeyType.Xml, false),
};
var sizes = new[] { 1024, 2048 };

const string shortMsg = "Hello RSA 交叉验证！123";
var lsb = new StringBuilder();
for (int i = 0; i < 40; i++) lsb.Append($"第{i}段-交叉验证数据-abcdefg-");
var longMsg = lsb.ToString();

string TN(RSAKeyType t) => t.ToString();
string Kid(int size, RSAKeyType t, bool pem) => $"{size}|{TN(t)}|{pem}";

Dictionary<string, string> Generate()
{
    var data = new Dictionary<string, string>();
    data["msg|short"] = shortMsg;
    data["msg|long"] = longMsg;
    foreach (var size in sizes)
    foreach (var (type, pem) in combos)
    {
        var kid = Kid(size, type, pem);
        var (pub, pri) = RSAHelper.ExportRSAKey(type, size, pem);
        data[$"key|{kid}|pub"] = pub;
        data[$"key|{kid}|pri"] = pri;

        foreach (var m in new[] { "short", "long" })
        {
            var msg = data[$"msg|{m}"];
            data[$"enc|pkcs1|{m}|{kid}"] = RSAHelper.Encrypt(type, msg, pub, CipherAlgorithm.RSA_ECB_PKCS1Padding);
            data[$"sig|SHA256withRSA|{m}|{kid}"] = RSAHelper.SignData(type, msg, pri, SignerAlgorithm.SHA256withRSA);
        }
        data[$"enc|oaep256|short|{kid}"] = RSAHelper.Encrypt(type, shortMsg, pub, CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding);
        data[$"encpriv|pkcs1|short|{kid}"] = RSAHelper.EncryptByPrivateKey(type, shortMsg, pri, CipherAlgorithm.RSA_ECB_PKCS1Padding);
        data[$"pubfrompri|{kid}"] = RSAHelper.ExportPublicKeyFromPrivateKey(type, pri, pem);

        foreach (var (dt, dp) in combos)
        {
            var ok = RSAHelper.TryTransformKeyFormat(dt, pri, out var tpub, out var tpri, dp);
            if (!ok) throw new Exception($"transform failed {kid} -> {dt}|{dp}");
            data[$"trans|{kid}|{TN(dt)}|{dp}|pub"] = tpub;
            data[$"trans|{kid}|{TN(dt)}|{dp}|pri"] = tpri;
            // NOTE: original WPF TransformPublicKeyFormat cannot parse PEM input; only test non-PEM sources.
            if (!pem)
            {
                data[$"transpub|{kid}|{TN(dt)}|{dp}"] = RSAHelper.TransformPublicKeyFormat(pub, dt, dp);
            }
        }
        Console.WriteLine($"generated {kid}");
    }
    // legacy algorithms (MD5/SHA1 sign, OAEP-SHA1 cipher) on a single combo
    var legacyKid = Kid(2048, RSAKeyType.Pkcs8, false);
    var lpub = data[$"key|{legacyKid}|pub"];
    var lpri = data[$"key|{legacyKid}|pri"];
    data["legacy|sig|MD5withRSA"] = RSAHelper.SignData(RSAKeyType.Pkcs8, shortMsg, lpri, SignerAlgorithm.MD5withRSA);
    data["legacy|sig|SHA1withRSA"] = RSAHelper.SignData(RSAKeyType.Pkcs8, shortMsg, lpri, SignerAlgorithm.SHA1withRSA);
    data["legacy|enc|oaep1"] = RSAHelper.Encrypt(RSAKeyType.Pkcs8, shortMsg, lpub, CipherAlgorithm.RSA_ECB_OAEPWithSHA_1AndMGF1Padding);
    return data;
}

void CheckDataset(Dictionary<string, string> data, string label)
{
    foreach (var size in sizes)
    foreach (var (type, pem) in combos)
    {
        var kid = Kid(size, type, pem);
        var pub = data[$"key|{kid}|pub"];
        var pri = data[$"key|{kid}|pri"];

        Check(RSAKeyExtensions.IsValidPublicKey(pub, out var pkt) && pkt == type, $"IsValidPublicKey {label} {kid}");
        Check(RSAKeyExtensions.IsValidPrivateKey(pri, out var prkt) && prkt == type, $"IsValidPrivateKey {label} {kid}");

        // derived public key must be identical across implementations
        Check(RSAHelper.ExportPublicKeyFromPrivateKey(type, pri, pem) == data[$"pubfrompri|{kid}"], $"ExportPublicKeyFromPrivateKey {label} {kid}");
        Check(data[$"pubfrompri|{kid}"] == pub, $"pubfrompri==pub {label} {kid}");

        foreach (var m in new[] { "short", "long" })
        {
            var msg = data[$"msg|{m}"];
            Check(RSAHelper.Decrypt(type, data[$"enc|pkcs1|{m}|{kid}"], pri, CipherAlgorithm.RSA_ECB_PKCS1Padding) == msg, $"Decrypt pkcs1 {label} {kid} {m}");
            Check(RSAHelper.VerifyData(type, msg, data[$"sig|SHA256withRSA|{m}|{kid}"], pub, SignerAlgorithm.SHA256withRSA), $"Verify {label} {kid} {m}");
        }
        Check(RSAHelper.Decrypt(type, data[$"enc|oaep256|short|{kid}"], pri, CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding) == data["msg|short"], $"Decrypt oaep256 {label} {kid}");
        Check(RSAHelper.DecryptByPublicKey(type, data[$"encpriv|pkcs1|short|{kid}"], pub, CipherAlgorithm.RSA_ECB_PKCS1Padding) == data["msg|short"], $"DecryptByPublicKey {label} {kid}");

        foreach (var (dt, dp) in combos)
        {
            var ok = RSAHelper.TryTransformKeyFormat(dt, pri, out var tpub, out var tpri, dp);
            Check(ok, $"TryTransform {label} {kid}->{TN(dt)}|{dp}");
            Check(tpub == data[$"trans|{kid}|{TN(dt)}|{dp}|pub"], $"trans pub equality {label} {kid}->{TN(dt)}|{dp}");
            Check(tpri == data[$"trans|{kid}|{TN(dt)}|{dp}|pri"], $"trans pri equality {label} {kid}->{TN(dt)}|{dp}");
            if (!pem)
            {
                Check(RSAHelper.TransformPublicKeyFormat(pub, dt, dp) == data[$"transpub|{kid}|{TN(dt)}|{dp}"], $"transpub equality {label} {kid}->{TN(dt)}|{dp}");
            }
        }
    }
    var legacyKid = Kid(2048, RSAKeyType.Pkcs8, false);
    var lpub = data[$"key|{legacyKid}|pub"];
    var lpri = data[$"key|{legacyKid}|pri"];
    Check(RSAHelper.VerifyData(RSAKeyType.Pkcs8, data["msg|short"], data["legacy|sig|MD5withRSA"], lpub, SignerAlgorithm.MD5withRSA), $"legacy MD5 verify {label}");
    Check(RSAHelper.VerifyData(RSAKeyType.Pkcs8, data["msg|short"], data["legacy|sig|SHA1withRSA"], lpub, SignerAlgorithm.SHA1withRSA), $"legacy SHA1 verify {label}");
    Check(RSAHelper.Decrypt(RSAKeyType.Pkcs8, data["legacy|enc|oaep1"], lpri, CipherAlgorithm.RSA_ECB_OAEPWithSHA_1AndMGF1Padding) == data["msg|short"], $"legacy oaep1 {label}");
}

if (checkName != "none")
{
    var json = File.ReadAllText(Path.Combine(workDir, checkName + ".json"));
    var data = JsonSerializer.Deserialize<Dictionary<string, string>>(json)!;
    CheckDataset(data, checkName);
}
if (genName != "none")
{
    Directory.CreateDirectory(workDir);
    var data = Generate();
    File.WriteAllText(Path.Combine(workDir, genName + ".json"), JsonSerializer.Serialize(data));
    Console.WriteLine($"generated {genName}.json ({data.Count} entries)");
}

Console.WriteLine($"checks: {checks}, failures: {failures}");
return failures == 0 ? 0 : 1;
