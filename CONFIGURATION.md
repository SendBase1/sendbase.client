# Configuration Guide

This guide explains how to configure the frontend application for different environments.

## Environment Configuration

The application uses environment variables for configuration. These are managed through `.env` files.

### Environment Files

- **`.env.local`** - Your local development configuration (gitignored)
- **`.env.example`** - Template file showing all available variables
- **`.env.production`** - Production environment configuration

### Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your values:
   ```env
   VITE_API_BASE_URL=https://localhost:7220
   VITE_APP_DOMAIN=yourdomain.com
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

## Configuration Options

### API Configuration

#### `VITE_API_BASE_URL`
- **Description**: Base URL for your backend API
- **Default**: `https://localhost:7220`
- **Examples**:
  - Local development: `https://localhost:7220`
  - Staging: `https://api-staging.yourdomain.com`
  - Production: `https://api.yourdomain.com`

#### `VITE_APP_DOMAIN`
- **Description**: Your application domain (used in marketing site code examples)
- **Default**: `yourdomain.com`
- **Examples**:
  - Local: `localhost:59592`
  - Production: `yourdomain.com`

### Feature Flags

#### `VITE_ENABLE_DEBUG`
- **Description**: Enable debug mode with additional logging
- **Default**: `false`
- **Values**: `true` or `false`

## Using Configuration in Code

### Import the config

```typescript
import { config } from '@/lib/config';
```

### Access configuration values

```typescript
// Get the API base URL
const apiUrl = config.apiBaseUrl;

// Get app domain
const domain = config.appDomain;

// Check feature flags
if (config.features.enableDebug) {
  console.log('Debug mode enabled');
}
```

### API Endpoints

All API endpoints are centralized in the config:

```typescript
// Auth endpoints
config.api.auth.login     // '/api/auth/login'
config.api.auth.register  // '/api/auth/register'

// Resource endpoints
config.api.domains        // '/api/v1/domains'
config.api.emails         // '/api/v1/emails'
config.api.messages       // '/api/v1/messages'
```

### Helper Functions

```typescript
import { getApiUrl } from '@/lib/config';

// Construct full API URL
const fullUrl = getApiUrl('/api/v1/domains');
// Result: https://localhost:7220/api/v1/domains
```

## Environment-Specific Configuration

### Local Development
```env
VITE_API_BASE_URL=https://localhost:7220
VITE_APP_DOMAIN=localhost:59592
VITE_ENABLE_DEBUG=true
```

### Staging
```env
VITE_API_BASE_URL=https://api-staging.yourdomain.com
VITE_APP_DOMAIN=staging.yourdomain.com
VITE_ENABLE_DEBUG=true
```

### Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_DOMAIN=yourdomain.com
VITE_ENABLE_DEBUG=false
```

## Changing Your Domain

To change the domain across the entire frontend:

1. Open `.env.local`
2. Update the `VITE_API_BASE_URL` variable:
   ```env
   VITE_API_BASE_URL=https://your-new-domain.com
   ```
3. Restart the dev server

**That's it!** The entire frontend will now use the new domain for all API calls.

## Best Practices

1. **Never commit `.env.local`** - It's gitignored for a reason
2. **Keep `.env.example` updated** - Always add new variables to the example file
3. **Use meaningful defaults** - The config file has sensible defaults for local development
4. **Document new variables** - Update this guide when adding new configuration options
5. **Validate in code** - The config file validates required variables

## Troubleshooting

### Changes not taking effect
- Restart the dev server after changing environment variables
- Clear browser cache if necessary
- Check browser console for any errors

### API calls failing
- Verify `VITE_API_BASE_URL` is correct
- Ensure the backend server is running
- Check browser network tab for the actual URLs being called

### Environment variables undefined
- Make sure variable names start with `VITE_`
- Restart dev server after adding new variables
- Check for typos in variable names
