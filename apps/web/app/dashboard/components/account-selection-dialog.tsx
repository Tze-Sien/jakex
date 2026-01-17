"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { setUserSelectedAdAccount } from "@/lib/actions/meta";
import type { AdAccount } from "@repo/database/schema";

interface AccountSelectionDialogProps {
  open: boolean;
  accounts: AdAccount[];
  onAccountSelected: (accountId: string) => void;
}

export function AccountSelectionDialog({
  open,
  accounts,
  onAccountSelected,
}: AccountSelectionDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;

    setIsSelecting(true);
    try {
      const result = await setUserSelectedAdAccount(selectedId);
      if (result.success) {
        onAccountSelected(selectedId);
      }
    } catch (error) {
      console.error("Failed to set selected account:", error);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Select an Ad Account</AlertDialogTitle>
          <AlertDialogDescription>
            Please select an ad account to continue. You can change this later from the header.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedId(account.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                selectedId === account.id
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-green-500/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {account.name || account.id}
                  </div>
                  {account.currency && (
                    <div className="text-sm text-muted-foreground">
                      Currency: {account.currency}
                    </div>
                  )}
                </div>
                {selectedId === account.id && (
                  <div className="ml-3 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <AlertDialogFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || isSelecting}
            className="w-full sm:w-auto"
          >
            {isSelecting ? "Selecting..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
