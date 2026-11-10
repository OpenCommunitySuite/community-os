param(
    [Parameter(Mandatory)][string]$Directory,
    [Parameter(Mandatory)][ValidatePattern('^communityos-test-stand:[a-zA-Z0-9_.-]+$')][string]$Image
)
$ErrorActionPreference = 'Stop'
$checkout = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$destination = [IO.Path]::GetFullPath($Directory)
if ($destination -eq $checkout -or $destination.StartsWith($checkout + [IO.Path]::DirectorySeparatorChar,
        [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Keep secrets outside the repository.'
}
if (!(Test-Path -LiteralPath $destination -PathType Container)) {
    throw 'Create the private configuration directory before running init.'
}
if (Get-ChildItem -LiteralPath $destination -Force) {
    throw 'Use an empty private directory.'
}

function New-StandSecret {
    [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
}

$config = [ordered]@{
    image = $Image
    postgres_password = New-StandSecret
    web_password = New-StandSecret
    pfx_password = New-StandSecret
    creator_password = New-StandSecret
    administrator_password = New-StandSecret
}
$rsa = [Security.Cryptography.RSA]::Create(2048)
try {
    $request = [Security.Cryptography.X509Certificates.CertificateRequest]::new(
        'CN=localhost', $rsa, [Security.Cryptography.HashAlgorithmName]::SHA256,
        [Security.Cryptography.RSASignaturePadding]::Pkcs1)
    $names = [Security.Cryptography.X509Certificates.SubjectAlternativeNameBuilder]::new()
    $names.AddDnsName('localhost')
    $names.AddIpAddress([Net.IPAddress]::Loopback)
    $request.CertificateExtensions.Add($names.Build())
    $cert = $request.CreateSelfSigned([DateTimeOffset]::UtcNow.AddMinutes(-5), [DateTimeOffset]::UtcNow.AddDays(30))
    try {
        [IO.File]::WriteAllBytes((Join-Path $destination 'https.pfx'),
            $cert.Export([Security.Cryptography.X509Certificates.X509ContentType]::Pfx, $config.pfx_password))
        [IO.File]::WriteAllText((Join-Path $destination 'https.pem'), $cert.ExportCertificatePem())
        $config | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $destination 'stand.json')
        Write-Output "Private stand configuration created in $destination"
        Write-Output "Certificate SHA-256: $($cert.GetCertHashString([Security.Cryptography.HashAlgorithmName]::SHA256))"
    }
    finally {
        $cert.Dispose()
    }
}
finally {
    $rsa.Dispose()
}
