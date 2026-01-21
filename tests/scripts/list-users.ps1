# Script to list all users in the oneeats realm
$ErrorActionPreference = "Stop"

$keycloakUrl = "http://192.168.1.111:8580"
$realm = "oneeats"

Write-Host "Getting admin token..."
$tokenResp = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType 'application/x-www-form-urlencoded' -Body 'grant_type=password&client_id=admin-cli&username=admin&password=admin'
$token = $tokenResp.access_token
Write-Host "Admin token obtained"

Write-Host "`nListing all users in '$realm' realm..."
$users = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?max=100" -Headers @{Authorization = "Bearer $token"}

Write-Host "Found $($users.Count) users:"
foreach ($user in $users) {
    Write-Host "  - $($user.username) (ID: $($user.id), Email: $($user.email), Enabled: $($user.enabled))"
}

# Also check user count
$userCount = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users/count" -Headers @{Authorization = "Bearer $token"}
Write-Host "`nTotal user count: $userCount"
