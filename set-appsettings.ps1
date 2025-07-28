$appSettings = Get-Content -Raw -Path appsettings.json | ConvertFrom-Json

foreach ($setting in $appSettings) {
    $name = $setting.name
    $value = $setting.value
    Write-Host "Setting: $name"
    az webapp config appsettings set --resource-group Careerate --name careerate --settings "$name=$value"
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to set setting: $name"
        break
    }
} 