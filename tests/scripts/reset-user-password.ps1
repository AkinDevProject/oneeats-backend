# Script to reset Keycloak user password via Admin API
$ErrorActionPreference = "Stop"

$keycloakUrl = "http://192.168.1.111:8580"
$realm = "oneeats"
$username = "restaurant@oneeats.com"
$newPassword = "restaurant123"

Write-Host "Getting admin token..."
$tokenResp = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType 'application/x-www-form-urlencoded' -Body 'grant_type=password&client_id=admin-cli&username=admin&password=admin'
$token = $tokenResp.access_token
Write-Host "Admin token obtained"

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`nSearching for user $username..."
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?username=$([uri]::EscapeDataString($username))" -Headers @{Authorization = "Bearer $token"}

if ($users.Count -eq 0) {
    Write-Host "ERROR: User not found!"
    exit 1
}

$user = $users[0]
$userId = $user.id
Write-Host "User found: $($user.username) (ID: $userId)"

Write-Host "`nResetting password to '$newPassword'..."
$passwordBody = @{
    type = "password"
    value = $newPassword
    temporary = $false
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users/$userId/reset-password" -Method PUT -Headers $headers -Body $passwordBody
    Write-Host "Password reset successful!"
} catch {
    Write-Host "ERROR: Failed to reset password - $_"
    exit 1
}

Write-Host "`nVerifying login with new password..."
try {
    $loginResp = Invoke-RestMethod -Uri "$keycloakUrl/realms/$realm/protocol/openid-connect/token" -Method POST -ContentType 'application/x-www-form-urlencoded' -Body "grant_type=password&client_id=oneeats-web&client_secret=oneeats-web-secret-dev&username=$([uri]::EscapeDataString($username))&password=$([uri]::EscapeDataString($newPassword))"
    Write-Host "Login verification SUCCESSFUL!"
    Write-Host "Access token obtained (first 50 chars): $($loginResp.access_token.Substring(0, 50))..."
} catch {
    Write-Host "ERROR: Login verification failed - $_"
    exit 1
}

Write-Host "`nDone! Password has been reset and verified."
