# Set critical environment variables directly on Container App
# This avoids Key Vault throttling and identity issues

$app = "careerate-web"
$rg = "Careerate"
$vault = "CareeerateSecretsVault"

Write-Host "Setting critical environment variables directly..." -ForegroundColor Cyan
Write-Host ""

# Critical secrets to fetch and set
$critical = @(
    "DATABASE-URL",
    "OPENAI-API-KEY",
    "ANTHROPIC-API-KEY",
    "GITHUB-CLIENT-ID",
    "GITHUB-CLIENT-SECRET",
    "GITHUB-REDIRECT-URI",
    "STRIPE-SECRET-KEY",
    "STRIPE-WEBHOOK-SECRET",
    "VITE-STRIPE-PUBLIC-KEY",
    "JWT-SECRET",
    "JWT-REFRESH-SECRET",
    "SESSION-SECRET",
    "ENCRYPTION-KEY",
    "AZURE-OPENAI-KEY",
    "AZURE-OPENAI-ENDPOINT"
)

$envVars = @()

Write-Host "Fetching secrets from Key Vault..." -ForegroundColor Yellow

foreach ($secretName in $critical) {
    try {
        Write-Host "  Fetching $secretName..." -NoNewline
        $value = az keyvault secret show --vault-name $vault --name $secretName --query "value" -o tsv 2>&1

        if ($LASTEXITCODE -eq 0 -and $value) {
            # Convert to env var format (uppercase with underscores)
            $envName = $secretName.Replace("-", "_")
            $envVars += "${envName}='${value}'"
            Write-Host " OK" -ForegroundColor Green
        } else {
            Write-Host " SKIP (not found)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ERROR" -ForegroundColor Red
    }
}

if ($envVars.Count -eq 0) {
    Write-Host ""
    Write-Host "No secrets fetched. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting $($envVars.Count) environment variables on container app..." -ForegroundColor Cyan

# Join all env vars
$envString = $envVars -join " "

try {
    az containerapp update `
        --name $app `
        --resource-group $rg `
        --set-env-vars $envString `
        --output none

    Write-Host "Environment variables set successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Restarting app to apply changes..." -ForegroundColor Yellow
    az containerapp revision restart --name $app --resource-group $rg --output none
    Write-Host "Done!" -ForegroundColor Green
} catch {
    Write-Host "Failed to set environment variables: $_" -ForegroundColor Red
    exit 1
}
