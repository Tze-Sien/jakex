"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { saveUserDashboardPreferences } from "@/lib/actions/dashboard-queries";

interface AdAccount {
  id: string;
  name: string;
  metaAdAccountId: string;
}

interface AccountMultiSelectorProps {
  userId: string;
  accounts: AdAccount[];
  selectedAccountIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function AccountMultiSelector({
  userId,
  accounts,
  selectedAccountIds,
  onSelectionChange,
}: AccountMultiSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleAccount = (accountId: string) => {
    const newSelection = selectedAccountIds.includes(accountId)
      ? selectedAccountIds.filter((id) => id !== accountId)
      : [...selectedAccountIds, accountId];

    onSelectionChange(newSelection);
    handleSave(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = accounts.map((a) => a.id);
    onSelectionChange(allIds);
    handleSave(allIds);
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
    handleSave([]);
  };

  const handleSave = async (selectedIds: string[]) => {
    setIsSaving(true);
    try {
      await saveUserDashboardPreferences(userId, {
        selectedAccountIds: selectedIds,
      });
    } catch (error) {
      console.error("Failed to save account selection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Select Ad Accounts</CardTitle>
            <CardDescription>
              Choose which accounts to include in the overview
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isSaving || selectedAccountIds.length === accounts.length}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={isSaving || selectedAccountIds.length === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const isSelected = selectedAccountIds.includes(account.id);
            return (
              <div
                key={account.id}
                className={cn(
                  "flex items-start space-x-3 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50",
                  isSelected && "bg-muted border-primary"
                )}
                onClick={() => handleToggleAccount(account.id)}
              >
                <Checkbox
                  id={account.id}
                  checked={isSelected}
                  onCheckedChange={() => handleToggleAccount(account.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={account.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {account.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {account.metaAdAccountId}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            );
          })}
        </div>
        {accounts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No ad accounts found. Connect your Meta account to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
