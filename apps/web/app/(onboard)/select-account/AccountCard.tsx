"use client";

import { useState } from "react";

interface AdAccount {
  id: string;
  name: string;
  accountId: string;
  currency: string;
  status: "active" | "inactive";
  spend: number;
  campaigns?: number;
}

interface AccountCardProps {
  account: AdAccount;
}

export function AccountCard({ account }: AccountCardProps) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <label className="block cursor-pointer">
      <input
        type="checkbox"
        name="accountId"
        value={account.id}
        className="sr-only"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      <div
        className={`
          w-full text-left p-4 rounded-xl border-2 transition-all duration-200
          active:scale-[0.98]
          ${
            isChecked
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
              : "border-border/50 bg-card/50"
          }
        `}
      >
        <div className="flex items-start gap-3">
          {/* Selection Indicator */}
          <div
            className={`
              shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
              ${
                isChecked
                  ? "border-primary bg-primary"
                  : "border-border/50 bg-background"
              }
            `}
          >
            <svg
              className={`w-4 h-4 text-primary-foreground transition-opacity ${
                isChecked ? "opacity-100" : "opacity-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {account.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  ID: {account.accountId}
                </p>
              </div>
              <div
                className={`
                  shrink-0 px-2 py-1 rounded-md text-xs font-medium
                  ${
                    account.status === "active"
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                {account.status}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-chart-2" />
                <span className="text-xs text-muted-foreground">
                  {account.currency} {account.spend.toLocaleString()} spend
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </label>
  );
}
