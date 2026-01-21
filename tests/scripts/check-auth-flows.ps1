# Script to check authentication flows and browser flow configuration
$ErrorActionPreference = "Stop"

$keycloakUrl = "http://192.168.1.111:8580"
$realm = "oneeats"

Write-Host "Getting admin token..."
$tokenResp = Invoke-RestMethod -Uri "$keycloakUrl/realms/master/protocol/openid-connect/token" -Method POST -ContentType 'application/x-www-form-urlencoded' -Body 'grant_type=password&client_id=admin-cli&username=admin&password=admin'
$token = $tokenResp.access_token
Write-Host "Admin token obtained"

$headers = @{Authorization = "Bearer $token"}

# Get realm settings
Write-Host "`n=== Realm Settings ==="
$realmSettings = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm" -Headers $headers
Write-Host "Browser Flow: $($realmSettings.browserFlow)"
Write-Host "Login With Email Allowed: $($realmSettings.loginWithEmailAllowed)"
Write-Host "Registration Email As Username: $($realmSettings.registrationEmailAsUsername)"
Write-Host "Duplicate Emails Allowed: $($realmSettings.duplicateEmailsAllowed)"

# Check if user can be found by email
Write-Host "`n=== User Search Tests ==="
$userByEmail = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?email=restaurant@oneeats.com" -Headers $headers
Write-Host "Search by email: Found $($userByEmail.Count) user(s)"

$userByUsername = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?username=restaurant@oneeats.com" -Headers $headers
Write-Host "Search by username: Found $($userByUsername.Count) user(s)"

$userBySearch = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users?search=restaurant" -Headers $headers
Write-Host "Search by 'restaurant': Found $($userBySearch.Count) user(s)"

# Get user details
if ($userByEmail.Count -gt 0) {
    $user = $userByEmail[0]
    Write-Host "`n=== User Details ==="
    Write-Host "ID: $($user.id)"
    Write-Host "Username: $($user.username)"
    Write-Host "Email: $($user.email)"
    Write-Host "Enabled: $($user.enabled)"
    Write-Host "Email Verified: $($user.emailVerified)"
    Write-Host "Required Actions: $($user.requiredActions -join ', ')"

    # Get user's credentials
    Write-Host "`n=== User Credentials ==="
    try {
        $credentials = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/users/$($user.id)/credentials" -Headers $headers
        Write-Host "Credentials count: $($credentials.Count)"
        foreach ($cred in $credentials) {
            Write-Host "  - Type: $($cred.type), ID: $($cred.id), CreatedDate: $($cred.createdDate)"
        }
    } catch {
        Write-Host "Could not retrieve credentials: $_"
    }
}

# Get authentication flows
Write-Host "`n=== Authentication Flows ==="
$flows = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/authentication/flows" -Headers $headers
Write-Host "Available flows:"
foreach ($flow in $flows) {
    Write-Host "  - $($flow.alias) (Built-in: $($flow.builtIn))"
}

# Get browser flow executions
Write-Host "`n=== Browser Flow Executions ==="
try {
    $browserFlow = $realmSettings.browserFlow
    $executions = Invoke-RestMethod -Uri "$keycloakUrl/admin/realms/$realm/authentication/flows/$browserFlow/executions" -Headers $headers
    foreach ($exec in $executions) {
        Write-Host "  - $($exec.displayName): $($exec.requirement) (Authenticator: $($exec.authenticator))"
    }
} catch {
    Write-Host "Could not get browser flow executions: $_"
}
