"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Settings } from "lucide-react";

export function SelectAccountCard() {
  const router = useRouter();

  const handleGoToSettings = () => {
    router.push(ROUTES.SETTINGS);
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>Select an Ad Account</CardTitle>
        <CardDescription>
          You&apos;re connected to Meta, but you haven&apos;t selected an ad account yet. Please select one to view your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGoToSettings}
          className="inline-flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          <span>Go to Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
}
