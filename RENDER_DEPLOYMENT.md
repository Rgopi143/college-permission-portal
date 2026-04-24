# Render Deployment Guide

## Quick Setup

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select "Static Site" as the service type

3. **Configure Environment Variables**
   In your Render dashboard, add these environment variables:
   
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_APP_NAME=CollegeFlow
   VITE_APP_VERSION=1.0.0
   VITE_DEV_MODE=false
   VITE_DEBUG_MODE=false
   ```

4. **Build Settings**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Node Version: `18` or higher

## Automatic Deployment

The `render.yaml` file enables automatic deployment. When you push to GitHub:
- Render will automatically build and deploy your app
- The build process runs `npm install` and `npm run build`
- Static files are served from the `dist` directory

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Your Google Gemini API key

### Optional Variables
- `VITE_APP_NAME`: Application name (default: CollegeFlow)
- `VITE_APP_VERSION`: Application version (default: 1.0.0)
- `VITE_DEV_MODE`: Development mode (default: false)
- `VITE_DEBUG_MODE`: Debug mode (default: false)

## Troubleshooting

### Build Fails
1. Check that all environment variables are set correctly
2. Ensure `package.json` has the correct build script
3. Verify all dependencies are properly installed

### Runtime Errors
1. Check browser console for errors
2. Verify Supabase connection details
3. Ensure API keys are valid and have proper permissions

### Performance Issues
1. Enable build caching in Render settings
2. Optimize bundle size by checking the dist folder
3. Consider using a CDN for static assets

## Custom Domain

To use a custom domain:
1. Go to your service settings in Render
2. Click "Custom Domains"
3. Add your domain name
4. Update DNS records as instructed by Render

## SSL Certificates

Render provides free SSL certificates for all services. They are automatically configured when you add a custom domain.
