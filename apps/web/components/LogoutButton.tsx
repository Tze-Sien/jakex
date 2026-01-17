"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@repo/auth";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await signOut();

      if (error) {
        console.error("Logout error:", error);
        setIsLoading(false);
        return;
      }

      // Redirect to login page after successful logout
      window.location.href = ROUTES.LOGIN;
    } catch (err) {
      console.error("Unexpected logout error:", err);
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      disabled={isLoading}
      className="relative"
      title="Logout"
    >
      <LogOut className="w-5 h-5" />
    </Button>
  );
}
