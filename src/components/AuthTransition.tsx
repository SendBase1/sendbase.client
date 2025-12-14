import { Mail } from 'lucide-react';

interface AuthTransitionProps {
  message?: string;
  submessage?: string;
}

export function AuthTransition({
  message = 'Signing you in...',
  submessage = 'Please wait while we securely connect you'
}: AuthTransitionProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-[40%] -right-[20%] h-[80%] w-[80%] rounded-full bg-gradient-to-tl from-primary/5 to-transparent blur-3xl animate-pulse [animation-delay:1s]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with pulse animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-card border shadow-lg">
            <Mail className="h-10 w-10 text-foreground" />
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center">
          <div className="relative h-12 w-12">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-muted" />
            {/* Spinning arc */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {message}
          </h2>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {submessage}
          </p>
        </div>
      </div>

      {/* Brand footer - positioned relative to screen */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="text-sm font-medium">Sendbase</span>
        </div>
      </div>
    </div>
  );
}

export function RedirectingToLogin() {
  return (
    <AuthTransition
      message="Redirecting to Microsoft..."
      submessage="You'll be securely signed in with your Microsoft account"
    />
  );
}

export function ProcessingLogin() {
  return (
    <AuthTransition
      message="Welcome back!"
      submessage="Setting up your workspace..."
    />
  );
}

export function InitializingSession() {
  return (
    <AuthTransition
      message="Preparing your dashboard..."
      submessage="Just a moment while we load your data"
    />
  );
}
