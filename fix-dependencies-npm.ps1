Write-Host "Cleaning up dependency files..."
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

Write-Host "Installing dependencies with npm..."
npm install

Write-Host "Done! You can now run your project with 'npm run dev'"