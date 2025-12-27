"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdAccount } from "@repo/database/schema";

interface AccountSelectorProps {
  accounts: AdAccount[];
  selectedAccountId: string;
  onAccountChange: (accountId: string) => void;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onAccountChange,
}: AccountSelectorProps) {
  if (accounts.length === 0) {
    return null;
  }

  const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
  const displayValue = selectedAccount
    ? selectedAccount.name || selectedAccount.id
    : 'Select Account';

  return (
    <Select
      value={selectedAccountId}
      onValueChange={(value) => value && onAccountChange(value)}
    >
      <SelectTrigger size="sm" className="min-w-50 max-w-60">
        <SelectValue>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="truncate">{displayValue}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-w-80">
        {accounts.map((account) => (
          <SelectItem
            key={account.id}
            value={account.id}
            className="**:data-item-indicator:hidden"
          >
            <div className="flex items-center gap-2 min-w-0 max-w-full">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  account.id === selectedAccountId
                    ? 'bg-green-500'
                    : 'bg-transparent'
                }`}
              />
              <span className="truncate min-w-0 flex-1">
                {account.name || account.id}
                {account.currency && (
                  <span className="text-muted-foreground ml-1">
                    ({account.currency})
                  </span>
                )}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
