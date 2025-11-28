# Environment Variables Setup

This project uses environment variables to configure the API base URL for different environments.

## Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your local backend URL (default is already set):
   ```
   VITE_API_BASE_URL=https://localhost:7220
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Production Deployment (Azure Static Web Apps)

### Option 1: Using GitHub Secrets (Current Setup - Recommended)

1. Go to your GitHub repository: `https://github.com/cade25wilson/email.client`

2. Navigate to **Settings** → **Secrets and variables** → **Actions**

3. Click **"New repository secret"**

4. Add the following secret:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://api.socialhq.app`

5. Click **"Add secret"**

6. The next deployment will automatically use this value

### Option 2: Using .env.production file (Fallback)

The `.env.production` file is already committed to the repository with the production API URL. If the GitHub secret is not set, it will use this file as a fallback.

## How It Works

- **Development**: Vite loads `.env.local` (gitignored)
- **Production Build**: Vite loads environment variables from:
  1. GitHub Secrets (if configured in the workflow)
  2. `.env.production` file (as fallback)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Base URL for the backend API | Yes |

## Verifying Configuration

After deployment, you can verify the environment variable is set correctly by:

1. Opening the browser console on your deployed site
2. The app will make requests to the configured API URL
3. Check the Network tab to see the full API request URLs

## Troubleshooting

- **Environment variable not working?**
  - Make sure the GitHub secret name matches exactly: `VITE_API_BASE_URL`
  - Redeploy after adding the secret (push a new commit or re-run the workflow)

- **Getting CORS errors?**
  - Ensure your backend API allows requests from your Azure Static Web App domain
  - Check your backend CORS configuration
