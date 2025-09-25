@echo off
echo Cleaning up dependency files...
rm package-lock.json pnpm-lock.yaml >nul 2>&1
rd /s /q node_modules >nul 2>&1

echo Installing dependencies with pnpm...
pnpm install

echo Done! You can now run your project with "pnpm dev"