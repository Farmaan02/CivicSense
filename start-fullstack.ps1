# CivicSense Fullstack Startup Script
Write-Host "🚀 Starting CivicSense Fullstack Application..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Start Backend Server
Write-Host "🎯 Starting Backend Server (Port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\farma\OneDrive\Desktop\civicSense\scripts'; node backend-server.js"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server  
Write-Host "🎨 Starting Frontend Server (Port 3000)..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\farma\OneDrive\Desktop\civicSense'; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 5

Write-Host "✅ CivicSense Fullstack Application Started!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend: http://localhost:3001" -ForegroundColor White
Write-Host "🌐 You can now access your application!" -ForegroundColor Yellow

# Keep this window open
Read-Host "Press Enter to close this window"