# Proper Secret Configuration Script - uses System Identity
# Secret names must be lowercase for Container Apps

$ErrorActionPreference = 'Continue'
$vault = "CareeerateSecretsVault"
$app = "careerate-web"
$rg = "Careerate"

Write-Host "Configuring secrets with proper naming..." -ForegroundColor Cyan
Write-Host ""

# Get all secrets from Key Vault
$allSecrets = az keyvault secret list --vault-name $vault --query "[].name" -o tsv

$successCount = 0
$failCount = 0
$skippedCount = 0

# Critical secrets
$criticalSecrets = @(
    "database-url",
    "openai-api-key",
    "github-client-id",
    "github-client-secret",
    "stripe-secret-key",
    "jwt-secret",
    "session-secret",
    "encryption-key"
)

Write-Host "Processing $($allSecrets.Count) secrets..." -ForegroundColor Cyan
Write-Host ""

foreach ($secret in $allSecrets) {
    # Convert to lowercase for Container App secret name
    $secretName = $secret.ToLower()

    # Skip registry credentials
    if ($secret -eq "DOCKER-HUB-TOKEN") {
        Write-Host "SKIP: $secret" -ForegroundColor Gray
        $skippedCount++
        continue
    }

    $isCritical = $criticalSecrets -contains $secretName
    $priority = if ($isCritical) { "[CRITICAL]" } else { "[INFO]" }

    try {
        Write-Host "$priority $secretName..." -NoNewline

        # Use system-assigned identity (no identityref needed)
        $result = az containerapp secret set `
            --name $app `
            --resource-group $rg `
            --secrets "${secretName}=keyvaultref:https://${vault}.vault.azure.net/secrets/${secret}" `
            --output none 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host " OK" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host " FAIL" -ForegroundColor Red
            if ($result -match "throttled") {
                Write-Host "   (Throttled - will retry)" -ForegroundColor Yellow
            }
            $failCount++
        }
    } catch {
        Write-Host " FAIL" -ForegroundColor Red
        $failCount++
    }

    # Longer pause to avoid throttling
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "  Skipped: $skippedCount" -ForegroundColor Gray
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "Restarting container app..." -ForegroundColor Yellow
    az containerapp revision restart --name $app --resource-group $rg --output none
    Write-Host "Done! Waiting 30s for health..." -ForegroundColor Green
    Start-Sleep -Seconds 30
}

Write-Host ""
$configuredSecrets = az containerapp secret list --name $app --resource-group $rg --query "[].name" -o tsv
Write-Host "Total secrets configured: $($configuredSecrets.Count)" -ForegroundColor Cyan
