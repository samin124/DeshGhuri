# setup-pkill.ps1
# Automatically adds the pkill function to your PowerShell profile

Write-Host "🚀 Setting up pkill command in PowerShell..." -ForegroundColor Cyan

# Get PowerShell profile path
$profilePath = $PROFILE

# Check if profile exists
if (-not (Test-Path $profilePath)) {
    Write-Host "📝 Creating PowerShell profile at: $profilePath" -ForegroundColor Yellow
    New-Item -Path $profilePath -ItemType File -Force | Out-Null
}

# Define the pkill function
$pkillFunction = @'

# pkill - Kill processes on development ports
function pkill {
    Write-Host "🔍 Scanning for processes on development ports..." -ForegroundColor Cyan

    # Define ports to check
    $ports = @(3000, 3001, 3002, 5173, 8080, 8000, 4000, 5000)

    $killedProcesses = 0

    foreach ($port in $ports) {
        # Get PIDs listening on the port
        $connections = netstat -ano | findstr ":$port" | findstr "LISTENING"

        if ($connections) {
            # Extract PIDs from netstat output
            $pids = $connections | ForEach-Object {
                if ($_ -match '\s+(\d+)\s*$') {
                    $matches[1]
                }
            } | Select-Object -Unique

            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction Stop
                    $processName = $process.ProcessName

                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "✅ Killed $processName (PID: $pid) on port $port" -ForegroundColor Green
                    $killedProcesses++
                }
                catch {
                    Write-Host "⚠️  Could not kill process with PID $pid on port $port" -ForegroundColor Yellow
                }
            }
        }
    }

    if ($killedProcesses -eq 0) {
        Write-Host "✨ No processes found on development ports. All clear!" -ForegroundColor Green
    }
    else {
        Write-Host "`n🎉 Successfully killed $killedProcesses process(es)!" -ForegroundColor Green
    }
}

'@

# Check if pkill function already exists in profile
$profileContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue

if ($profileContent -like "*function pkill*") {
    Write-Host "⚠️  pkill function already exists in your PowerShell profile" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"

    if ($response -eq 'y' -or $response -eq 'Y') {
        # Remove old pkill function
        $profileContent = $profileContent -replace '(?s)# pkill - Kill processes on development ports.*?^}', ''
        Set-Content -Path $profilePath -Value $profileContent
        Add-Content -Path $profilePath -Value $pkillFunction
        Write-Host "✅ pkill function updated successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Setup cancelled" -ForegroundColor Red
        exit
    }
}
else {
    # Add pkill function to profile
    Add-Content -Path $profilePath -Value $pkillFunction
    Write-Host "✅ pkill function added to PowerShell profile!" -ForegroundColor Green
}

Write-Host "`n📋 PowerShell profile location: $profilePath" -ForegroundColor Cyan
Write-Host "`n🎯 To use pkill:" -ForegroundColor Cyan
Write-Host "   1. Restart PowerShell (or run: . `$PROFILE)" -ForegroundColor White
Write-Host "   2. Type: pkill" -ForegroundColor White
Write-Host "   3. All development ports (3000, 3001, etc.) will be killed!" -ForegroundColor White

Write-Host "`n✨ Setup complete! Happy coding! 🚀" -ForegroundColor Green
