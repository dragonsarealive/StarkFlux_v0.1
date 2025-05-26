# Deploying StarkFlux UI to Netlify

## Prerequisites
- GitHub account
- Netlify account (free tier is sufficient)
- Repository pushed to GitHub

## Deployment Steps

### 1. Push to GitHub
First, ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 2. Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select the `starkflux-ui` repository

### 3. Configure Build Settings

Netlify should auto-detect the settings from `netlify.toml`, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (set in netlify.toml)

### 4. Environment Variables

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add the following variables:
   - `VITE_STARKNET_ALCHEMY_KEY` = `NswtRE2tY_TzSgg0iTj3Kd61wAKacsZb`
   - `VITE_PINATA_JWT` = (your Pinata JWT token)

### 5. Deploy

1. Click "Deploy site"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your site will be available at a Netlify subdomain (e.g., `amazing-site-123.netlify.app`)

### 6. Custom Domain (Optional)

To add a custom domain:
1. Go to Domain settings
2. Add custom domain
3. Follow DNS configuration instructions

## Continuous Deployment

Once connected, Netlify will automatically deploy when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployments

## Build Optimization

The current configuration includes:
- SPA routing support (redirects all routes to index.html)
- Environment variable support
- Node 18 for compatibility

## Troubleshooting

### Build Failures
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Environment Variables
- Variables must start with `VITE_` to be accessible in the app
- Set them in Netlify dashboard, not in code

### Large Bundle Size
- Current build uses code splitting
- Consider lazy loading for routes if needed 