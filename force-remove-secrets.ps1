# Force remove broken secrets using direct ARM API

$app = "careerate-web"
$rg = "Careerate"
$sub = "46c583cc-1f11-4953-9502-d8d723fca7e9"

Write-Host "Force removing broken secrets from Container App..." -ForegroundColor Cyan

# Get the full Container App configuration
Write-Host "Getting current configuration..." -ForegroundColor Yellow
$resourceId = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.App/containerApps/$app"

$config = az rest --method GET --uri "https://management.azure.com$resourceId?api-version=2023-05-01" | ConvertFrom-Json

Write-Host "Current secrets count:" $config.properties.configuration.secrets.Count -ForegroundColor Gray

# Filter out the problematic secrets
Write-Host "Removing broken secret references..." -ForegroundColor Yellow
$goodSecrets = $config.properties.configuration.secrets | Where-Object {
    $_.name -notin @('phi-4-endpoint', 'phi-4-key', 'azure-openai-key', 'azure-openai-endpoint', 'ai-hub-endpoint', 'ai-hub-key')
}

Write-Host "Keeping" $goodSecrets.Count "good secrets" -ForegroundColor Gray

# Update secrets list
$config.properties.configuration.secrets = $goodSecrets

# Also remove env vars that reference those secrets
Write-Host "Removing env vars that reference broken secrets..." -ForegroundColor Yellow
$containers = $config.properties.template.containers
foreach ($container in $containers) {
    $goodEnvVars = $container.env | Where-Object {
        -not ($_.secretRef -in @('phi-4-endpoint', 'phi-4-key', 'azure-openai-key', 'azure-openai-endpoint', 'ai-hub-endpoint', 'ai-hub-key'))
    }
    $container.env = $goodEnvVars
}

# Save updated config to temp file
$tempFile = "$env:TEMP\container-app-config.json"
$config | ConvertTo-Json -Depth 100 | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "Applying updated configuration..." -ForegroundColor Yellow

# Apply the updated configuration
$result = az rest --method PUT --uri "https://management.azure.com$resourceId?api-version=2023-05-01" --body "@$tempFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully removed broken secrets!" -ForegroundColor Green
} else {
    Write-Host "Failed to update Container App" -ForegroundColor Red
    Write-Host "Exit code:" $LASTEXITCODE -ForegroundColor Red
    exit 1
}
