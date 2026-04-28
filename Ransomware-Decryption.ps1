# --- CONFIGURATION ---
$TargetFolder = "C:\Users\Employee1\Downloads\SecretFiles"
$Password = "P@ssw0rd123!"
$Extension = ".encrypted"

function Invoke-AESDecryption($File, $Password) {
    $Bytes = [System.IO.File]::ReadAllBytes($File)
    $Salt = [System.Text.Encoding]::UTF8.GetBytes("ProjectSalt")
    $Key = New-Object System.Security.Cryptography.PasswordDeriveBytes($Password, $Salt, "SHA256", 1000)
    
    $AES = [System.Security.Cryptography.Aes]::Create()
    $AES.Key = $Key.GetBytes(32)
    $AES.IV = $Key.GetBytes(16)
    
    $Decryptor = $AES.CreateDecryptor()
    $DecryptedBytes = $Decryptor.TransformFinalBlock($Bytes, 0, $Bytes.Length)
    
    $OriginalPath = $File.Replace($Extension, "")
    [System.IO.File]::WriteAllBytes($OriginalPath, $DecryptedBytes)
    Remove-Item $File 
}

Write-Host "Scanning for encrypted files in: $TargetFolder" -ForegroundColor Cyan

$EncryptedFiles = Get-ChildItem -Path $TargetFolder -Filter "*$Extension" -Recurse

foreach ($File in $EncryptedFiles) {
    Write-Host "Restoring: $($File.Name)"
    Invoke-AESDecryption $File.FullName $Password
}

Write-Host "Recovery Complete." -ForegroundColor Green
