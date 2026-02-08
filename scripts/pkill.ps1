# pkill.ps1
# PowerShell script to kill processes on commonly used development ports

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

# Run the function if script is executed directly
pkill
