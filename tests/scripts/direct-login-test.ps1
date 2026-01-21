# Script to test direct form submission to Keycloak
$ErrorActionPreference = "Stop"

$keycloakUrl = "http://192.168.1.111:8580"
$realm = "oneeats"
$clientId = "oneeats-web"
$redirectUri = "http://localhost:8080/callback"
$username = "restaurant@oneeats.com"
$password = "restaurant123"

Write-Host "=== Testing Direct Keycloak Form Submission ==="

# Step 1: Get the login page to extract the session code
Write-Host "`n1. Getting initial authorization URL..."
$authUrl = "$keycloakUrl/realms/$realm/protocol/openid-connect/auth"
$authParams = "response_type=code&client_id=$clientId&redirect_uri=$([uri]::EscapeDataString($redirectUri))&scope=openid"
$fullAuthUrl = "$authUrl`?$authParams"

Write-Host "   URL: $fullAuthUrl"

# Get the login page
$loginPage = Invoke-WebRequest -Uri $fullAuthUrl -UseBasicParsing -MaximumRedirection 5

Write-Host "   Status: $($loginPage.StatusCode)"
Write-Host "   Final URL: $($loginPage.BaseResponse.ResponseUri)"

# Extract the form action URL
$formAction = $null
if ($loginPage.Content -match 'action="([^"]+)"') {
    $formAction = $Matches[1]
    # Decode HTML entities
    $formAction = $formAction -replace '&amp;', '&'
    Write-Host "   Form action: $formAction"
}

if (-not $formAction) {
    Write-Host "ERROR: Could not find form action URL"
    exit 1
}

# Step 2: Submit the login form
Write-Host "`n2. Submitting login form..."
$formData = @{
    username = $username
    password = $password
    credentialId = ""
}

Write-Host "   Username: $username"
Write-Host "   Password: $('*' * $password.Length) ($($password.Length) chars)"

try {
    $response = Invoke-WebRequest -Uri $formAction -Method POST -Body $formData -UseBasicParsing -MaximumRedirection 0
    Write-Host "   Response Status: $($response.StatusCode)"
    Write-Host "   Content length: $($response.Content.Length)"

    # Check if there's a redirect
    if ($response.Headers.Location) {
        Write-Host "   Location: $($response.Headers.Location)"
    }

    # Save content for analysis
    $response.Content | Out-File -FilePath "login-response.html" -Encoding UTF8
    Write-Host "   Response saved to login-response.html"
} catch {
    Write-Host "   Exception caught: $($_.Exception.Message)"

    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response
        $statusCode = [int]$errorResponse.StatusCode
        Write-Host "   Error Status Code: $statusCode"

        # Try to read the response body
        try {
            $responseStream = $errorResponse.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseStream)
            $errorContent = $reader.ReadToEnd()
            $reader.Close()

            Write-Host "   Error Response Length: $($errorContent.Length)"
            $errorContent | Out-File -FilePath "login-error-response.html" -Encoding UTF8
            Write-Host "   Error response saved to login-error-response.html"

            # Check for specific error messages
            if ($errorContent -match 'Invalid username or password') {
                Write-Host "   ERROR: Invalid username or password found in response"
            }
            if ($errorContent -match 'class="kc-feedback-text"[^>]*>([^<]+)') {
                Write-Host "   Keycloak Error: $($Matches[1])"
            }
            if ($errorContent -match 'error-message">([^<]+)') {
                Write-Host "   Error Message: $($Matches[1].Trim())"
            }
        } catch {
            Write-Host "   Could not read error response body"
        }
    }
}

Write-Host "`nDone!"
