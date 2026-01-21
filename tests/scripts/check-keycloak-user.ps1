# Script to check Keycloak user status
$ErrorActionPreference = "Stop"

Write-Host "Getting admin token..."
$tokenResp = Invoke-RestMethod -Uri 'http://localhost:8580/realms/master/protocol/openid-connect/token' -Method POST -ContentType 'application/x-www-form-urlencoded' -Body 'grant_type=password&client_id=admin-cli&username=admin&password=admin'
$token = $tokenResp.access_token
Write-Host "Admin token obtained"

Write-Host "`nSearching for user restaurant@oneeats.com..."
$headers = @{
    Authorization = "Bearer $token"
}
$users = Invoke-RestMethod -Uri 'http://localhost:8580/admin/realms/oneeats/users?username=restaurant@oneeats.com' -Headers $headers

if ($users.Count -eq 0) {
    Write-Host "ERROR: User not found!"
    exit 1
}

$user = $users[0]
Write-Host "User found: $($user.username)"
Write-Host "  ID: $($user.id)"
Write-Host "  Email: $($user.email)"
Write-Host "  Enabled: $($user.enabled)"
Write-Host "  Email Verified: $($user.emailVerified)"

# Check brute force status
Write-Host "`nChecking brute force status..."
try {
    $bfStatus = Invoke-RestMethod -Uri "http://localhost:8580/admin/realms/oneeats/attack-detection/brute-force/users/$($user.id)" -Headers $headers
    Write-Host "Brute force status:"
    Write-Host "  Disabled: $($bfStatus.disabled)"
    Write-Host "  Num Failures: $($bfStatus.numFailures)"
    Write-Host "  Last Failure: $($bfStatus.lastFailure)"
    Write-Host "  Last IP Failure: $($bfStatus.lastIPFailure)"
} catch {
    Write-Host "No brute force data (user not locked)"
}

# Clear brute force if locked
Write-Host "`nClearing brute force lockout..."
try {
    Invoke-RestMethod -Uri "http://localhost:8580/admin/realms/oneeats/attack-detection/brute-force/users/$($user.id)" -Method DELETE -Headers $headers
    Write-Host "Brute force lockout cleared successfully"
} catch {
    Write-Host "Failed to clear or no lockout to clear"
}

Write-Host "`nDone!"
