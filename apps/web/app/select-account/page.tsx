"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "../login/components/AnimatedBackground";
import { AccountCard, SelectAccountHero } from "./components";

// Mock data - in production, this would come from Meta API
const mockAccounts = [
  {
    id: "1",
    name: "E-commerce Store - Main",
    accountId: "act_123456789",
    currency: "USD",
    status: "active" as const,
    spend: 45230,
    campaigns: 12,
  },
  {
    id: "2",
    name: "Brand Awareness Campaign",
    accountId: "act_987654321",
    currency: "USD",
    status: "active" as const,
    spend: 28750,
    campaigns: 8,
  },
  {
    id: "3",
    name: "Q4 Holiday Promotions",
    accountId: "act_456789123",
    currency: "USD",
    status: "active" as const,
    spend: 15400,
    campaigns: 5,
  },
  {
    id: "4",
    name: "Testing Account",
    accountId: "act_321654987",
    currency: "USD",
    status: "inactive" as const,
    spend: 2100,
    campaigns: 2,
  },
];

export default function SelectAccountPage() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedAccounts.length === 0) return;

    setIsLoading(true);
    // Simulate API call to save selected accounts
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <SelectAccountHero />

            <div className="w-full max-w-md mx-auto">
              {/* Accounts List Card */}
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-chart-2 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />

                <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl">
                  {/* Header */}
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Ad Accounts
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Select the accounts you want to analyze
                    </p>
                  </div>

                  {/* Accounts List */}
                  <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {mockAccounts.map((account) => (
                      <AccountCard
                        key={account.id}
                        account={account}
                        isSelected={selectedAccounts.includes(account.id)}
                        onSelect={handleSelectAccount}
                      />
                    ))}
                  </div>

                  {/* Selection Summary */}
                  <div className="mb-6 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="text-sm text-muted-foreground">
                      {selectedAccounts.length === 0 ? (
                        "No accounts selected"
                      ) : (
                        <span className="text-foreground font-medium">
                          {selectedAccounts.length} account
                          {selectedAccounts.length > 1 ? "s" : ""} selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinue}
                    disabled={selectedAccounts.length === 0 || isLoading}
                    className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        <span>Setting up...</span>
                      </div>
                    ) : (
                      `Continue with ${selectedAccounts.length || "0"} account${selectedAccounts.length !== 1 ? "s" : ""}`
                    )}
                  </Button>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  You can manage your connected accounts anytime from settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        {/* Top App Bar */}
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted/50 active:scale-95 transition-all"
            >
              <svg
                className="w-6 h-6 text-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-chart-2">
                <svg
                  className="w-6 h-6 text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold">JakeX</h1>
            </div>

            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-6 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">
                  Step 2 of 3
                </span>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Select Ad Accounts
              </h2>
              <p className="text-muted-foreground text-base">
                Choose which accounts you want to analyze and optimize
              </p>
            </div>

            {/* Accounts List */}
            <div className="space-y-3">
              {mockAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  isSelected={selectedAccounts.includes(account.id)}
                  onSelect={handleSelectAccount}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar with Safe Area */}
        <div className="safe-area-bottom bg-background/95 backdrop-blur-md border-t border-border/50">
          <div className="px-6 py-4 space-y-3">
            {/* Selection Summary */}
            <div className="text-center">
              <div className="text-sm text-muted-foreground">
                {selectedAccounts.length === 0 ? (
                  "Select at least one account to continue"
                ) : (
                  <span className="text-foreground font-medium">
                    {selectedAccounts.length} account
                    {selectedAccounts.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={selectedAccounts.length === 0 || isLoading}
              className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Setting up...</span>
                </div>
              ) : (
                `Continue with ${selectedAccounts.length || "0"} account${selectedAccounts.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </>
  );
}
