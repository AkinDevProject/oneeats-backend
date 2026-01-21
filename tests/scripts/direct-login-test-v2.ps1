# Script to test direct form submission to Keycloak with session cookies
$ErrorActionPreference = "Stop"

$keycloakUrl = "http://192.168.1.111:8580"
$realm = "oneeats"
$clientId = "oneeats-web"
$redirectUri = "http://localhost:8080/callback"
$username = "restaurant@oneeats.com"
$password = "restaurant123"

Write-Host "=== Testing Direct Keycloak Form Submission (with session) ==="

# Step 1: Get the login page with session
Write-Host "`n1. Getting initial authorization URL..."
$authUrl = "$keycloakUrl/realms/$realm/protocol/openid-connect/auth"
$authParams = "response_type=code&client_id=$clientId&redirect_uri=$([uri]::EscapeDataString($redirectUri))&scope=openid"
$fullAuthUrl = "$authUrl`?$authParams"

Write-Host "   URL: $fullAuthUrl"

# Use Invoke-WebRequest with SessionVariable to maintain cookies
$session = $null
$loginPage = Invoke-WebRequest -Uri $fullAuthUrl -UseBasicParsing -MaximumRedirection 5 -SessionVariable session

Write-Host "   Status: $($loginPage.StatusCode)"
Write-Host "   Session cookies: $($session.Cookies.Count)"

# List cookies
foreach ($cookie in $session.Cookies.GetCookies($fullAuthUrl)) {
    Write-Host "     - $($cookie.Name): $($cookie.Value.Substring(0, [Math]::Min(30, $cookie.Value.Length)))..."
}

# Extract the form action URL
$formAction = $null
if ($loginPage.Content -match 'action="([^"]+)"') {
    $formAction = $Matches[1]
    $formAction = $formAction -replace '&amp;', '&'
    Write-Host "   Form action: $formAction"
}

if (-not $formAction) {
    Write-Host "ERROR: Could not find form action URL"
    exit 1
}

# Step 2: Submit the login form with session cookies
Write-Host "`n2. Submitting login form..."
$formData = @{
    username = $username
    password = $password
    credentialId = ""
}

Write-Host "   Username: $username"
Write-Host "   Password: $('*' * $password.Length) ($($password.Length) chars)"

try {
    # Use -WebSession to include the session cookies
    $response = Invoke-WebRequest -Uri $formAction -Method POST -Body $formData -UseBasicParsing -WebSession $session -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "   Response Status: $($response.StatusCode)"
    Write-Host "   Location: $($response.Headers.Location)"
    Write-Host "   SUCCESS!"
} catch {
    $ex = $_.Exception
    Write-Host "   Exception: $($ex.Message)"

    if ($ex.Response) {
        $statusCode = [int]$ex.Response.StatusCode
        Write-Host "   HTTP Status: $statusCode"

        # For 302/303 redirects after successful login
        if ($statusCode -eq 302 -or $statusCode -eq 303) {
            $location = $ex.Response.Headers['Location']
            Write-Host "   Redirect to: $location"

            if ($location -and $location.Contains('code=')) {
                Write-Host "   SUCCESS! Got authorization code!"
            }
        }

        # Try to read response body
        try {
            $stream = $ex.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $body = $reader.ReadToEnd()
            $reader.Close()

            if ($body.Length -gt 0) {
                $body | Out-File -FilePath "login-response.html" -Encoding UTF8
                Write-Host "   Response saved to login-response.html ($($body.Length) bytes)"

                if ($body -match 'Invalid username or password') {
                    Write-Host "   ERROR: Invalid username or password"
                }
                if ($body -match 'kc-feedback-text[^>]*>([^<]+)') {
                    Write-Host "   Keycloak message: $($Matches[1].Trim())"
                }
            }
        } catch {
            Write-Host "   Could not read response body: $_"
        }
    }
}

Write-Host "`nDone!"
