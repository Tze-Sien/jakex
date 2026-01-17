"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

interface DashboardErrorProps {
  error: Error;
  reset: () => void;
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-3xl bg-card border border-border/50">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Unable to Load Dashboard
        </h2>

        <p className="text-muted-foreground mb-6">
          We encountered an error while loading your ad data. This could be due to a connection issue or an API problem.
        </p>

        <div className="p-4 mb-6 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-sm text-muted-foreground font-mono">
            {error.message}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} size="lg" className="w-full">
            Try Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.location.href = ROUTES.AUTHORIZE_META}
          >
            Check Connection
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          If this problem persists, please contact support
        </p>
      </div>
    </div>
  );
}
