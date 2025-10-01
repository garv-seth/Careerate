# PowerShell script to automate database setup
Write-Host "Setting up database..." -ForegroundColor Green

# Run the database push command
npm run db:push

Write-Host "Database setup completed!" -ForegroundColor Green
