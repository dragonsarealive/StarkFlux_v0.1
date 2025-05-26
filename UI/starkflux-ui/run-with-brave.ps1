# PowerShell script to launch the Vite dev server and open Brave browser
# This overcomes PowerShell's lack of support for the && operator

Write-Host "Starting Vite development server..."
$viteProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -PassThru -NoNewWindow

# Wait for Vite to start (typical startup time)
Write-Host "Waiting for Vite server to initialize (5 seconds)..."
Start-Sleep -Seconds 5

# Check if the server is likely running
Write-Host "Opening Brave browser at http://localhost:5173"
Start-Process -FilePath "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe" -ArgumentList "http://localhost:5173"

Write-Host "Development environment started. Press Ctrl+C to stop the server."

# Keep the script running until user interrupts it
try {
    Wait-Process -Id $viteProcess.Id
} catch {
    Write-Host "Development server stopped."
} 