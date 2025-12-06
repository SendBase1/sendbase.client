import { type Configuration, LogLevel, PublicClientApplication, EventType, type EventMessage, type AuthenticationResult } from '@azure/msal-browser';

// MSAL configuration for Entra External ID
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || 'df64e57e-1fd7-43bf-ace5-c920d556e0cc',
    authority: import.meta.env.VITE_ENTRA_AUTHORITY || 'https://EmailCustomers.ciamlogin.com',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false, // Don't navigate, let React Router handle it
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error('[MSAL]', message);
            return;
          case LogLevel.Info:
            console.info('[MSAL]', message);
            return;
          case LogLevel.Verbose:
            console.debug('[MSAL]', message);
            return;
          case LogLevel.Warning:
            console.warn('[MSAL]', message);
            return;
        }
      },
      logLevel: LogLevel.Info, // More verbose for debugging
    },
  },
};

// Scopes for API access - for CIAM, use openid scopes
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Flag to track initialization
let msalInitialized = false;

// Initialize MSAL and handle redirect
export async function initializeMsal(): Promise<void> {
  if (msalInitialized) return;

  await msalInstance.initialize();

  // Handle the redirect response
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    console.log('[MSAL] Login redirect completed, account:', response.account?.username);
  }

  // Set active account if there's one
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
    msalInstance.setActiveAccount(accounts[0]);
    console.log('[MSAL] Set active account:', accounts[0].username);
  }

  // Register event callbacks
  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      msalInstance.setActiveAccount(payload.account);
      console.log('[MSAL] Login success, setting active account');
    }
    if (event.eventType === EventType.LOGOUT_SUCCESS) {
      console.log('[MSAL] Logout success');
    }
  });

  msalInitialized = true;
  console.log('[MSAL] Initialization complete');
}
