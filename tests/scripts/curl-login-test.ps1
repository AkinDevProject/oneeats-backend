# Test login using curl with proper session handling
$ErrorActionPreference = "Stop"

Write-Host "=== Test Login with curl ==="

# Change to temp directory
Set-Location $env:TEMP

# Step 1: Get login page and save cookies
Write-Host "`n1. Getting login page..."
$authUrl = 'http://192.168.1.111:8580/realms/oneeats/protocol/openid-connect/auth?response_type=code&client_id=oneeats-web&redirect_uri=http://localhost:8080/callback&scope=openid'

# Join array output into single string
$loginPageRaw = curl.exe -s -L -c cookies.txt -b cookies.txt $authUrl
$loginPage = $loginPageRaw -join "`n"
Write-Host "   Login page received ($($loginPage.Length) chars)"
if ($loginPage.Length -gt 0) {
    $preview = if ($loginPage.Length -gt 200) { $loginPage.Substring(0, 200) } else { $loginPage }
    Write-Host "   Content preview: $preview"
} else {
    Write-Host "   WARNING: Empty response"
}

# Extract form action
if ($loginPage -match 'action="([^"]+)"') {
    $formAction = $Matches[1] -replace '&amp;', '&'
    Write-Host "   Form action: $formAction"
} else {
    Write-Host "   ERROR: Could not find form action"
    exit 1
}

# Step 2: Submit the login form
Write-Host "`n2. Submitting login form..."
Write-Host "   Username: restaurant@oneeats.com"
Write-Host "   Password: restaurant123"

$formData = "username=restaurant%40oneeats.com&password=restaurant123&credentialId="
$loginResult = curl.exe -s -c cookies.txt -b cookies.txt -X POST $formAction -d $formData -D headers.txt -o response.html -w "%{http_code}"

Write-Host "   HTTP Status: $loginResult"

# Check headers for redirect
$headers = Get-Content headers.txt -Raw -ErrorAction SilentlyContinue
if ($headers -match 'location: (.+)') {
    $location = $Matches[1].Trim()
    Write-Host "   Redirect to: $location"

    if ($location -match 'code=') {
        Write-Host "   SUCCESS! Got authorization code!"
    }
}

# Check response content
$response = Get-Content response.html -Raw -ErrorAction SilentlyContinue
if ($response) {
    if ($response -match 'Invalid username or password') {
        Write-Host "   ERROR: Invalid username or password"
    }
    Write-Host "   Response length: $($response.Length) chars"
}

Write-Host "`nDone!"
