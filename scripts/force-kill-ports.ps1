$ports = @(3000, 3001, 3002, 5173)

Write-Host "Forcing kill of processes on ports: $ports" -ForegroundColor Yellow
Write-Host ""

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "Port $port : Killing process $($process.Name) (PID: $processId)" -ForegroundColor Red
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "  Killed successfully" -ForegroundColor Green
                }
            }
            catch {
                Write-Host "  Error killing process $processId : $_" -ForegroundColor Red
            }
        }
    }
    else {
        Write-Host "Port $port : FREE" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Port cleanup complete!" -ForegroundColor Cyan
