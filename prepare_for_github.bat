@echo off
echo Preparing StarkFlux for GitHub...

echo Adding core files...
git add README.md
git add .gitignore
git add .cursorrules
git add Scarb.toml
git add Scarb.lock
git add package.json
git add package-lock.json

echo Adding source code...
git add src/

echo Adding memory bank...
git add memory-bank/

echo Adding UI documentation...
git add UI/*.md

echo Adding UI source...
git add UI/starkflux-ui/src/
git add UI/starkflux-ui/public/
git add UI/starkflux-ui/*.json
git add UI/starkflux-ui/*.md
git add UI/starkflux-ui/*.toml
git add UI/starkflux-ui/index.html
git add UI/starkflux-ui/tsconfig*.json
git add UI/starkflux-ui/vite.config.ts
git add UI/starkflux-ui/.gitignore

echo Adding documentation...
git add *.md
git add packages/

echo Creating commit...
git commit -m "Initial commit: StarkFlux v0.1 - Component Marketplace for Starknet"

echo Setting up remote...
git remote add origin git@github.com:dragonsarealive/StarkFlux_v0.1.git

echo Ready to push! Run: git push -u origin main 