import { redirect } from "next/navigation";
import { loadUserAdAccounts, saveUserSelectedAdAccounts } from "@/lib/actions/meta";
import { AnimatedBackground } from "../../(auth)/AnimatedBackground";
import { SelectAccountHero } from "./SelectAccountHero";
import { AccountCard } from "./AccountCard";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CustomScrollbarStyles } from "./CustomScrollbarStyles";
import { ROUTES } from "@/lib/constants";

export default async function SelectAccountPage() {
  const result = await loadUserAdAccounts();

  // Handle auth redirect on server side
  if (!result.success && result.needsAuth) {
    redirect(ROUTES.AUTHORIZE_META);
  }

  const accounts = result.success
    ? result.accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        accountId: acc.account_id,
        currency: acc.currency,
        status: acc.account_status === 1 ? 'active' as const : 'inactive' as const,
        spend: parseFloat(acc.amount_spent || '0') / 100,
      }))
    : [];

  async function handleSubmit(formData: FormData) {
    'use server';

    const selectedAccountIds = formData.getAll('accountId') as string[];

    if (selectedAccountIds.length === 0) {
      return;
    }

    const selectedAccounts = accounts.filter(acc => selectedAccountIds.includes(acc.id));

    const result = await saveUserSelectedAdAccounts({
      selectedAccountIds,
      accounts: selectedAccounts
    });

    if (result.success) {
      redirect(ROUTES.DASHBOARD);
    }
  }

  return (
    <>
      <AnimatedBackground />
      <CustomScrollbarStyles />

      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <SelectAccountHero />

            <div className="w-full max-w-md mx-auto">
              <form action={handleSubmit}>
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
                    <div className="space-y-3 mb-6 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                      {accounts.map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                        />
                      ))}
                    </div>

                    {/* Continue Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all"
                    >
                      Continue
                    </Button>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    You can manage your connected accounts anytime from settings
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        {/* Top App Bar */}
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="w-10" /> {/* Spacer */}

            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="JakeX Logo"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <h1 className="text-xl font-bold">JakeX</h1>
            </div>

            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        <form action={handleSubmit} className="flex-1 flex flex-col">
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
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar with Safe Area */}
          <div className="safe-area-bottom bg-background/95 backdrop-blur-md border-t border-border/50">
            <div className="px-6 py-4">
              {/* Continue Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-chart-2 hover:from-primary/90 hover:to-chart-2/90 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                Continue
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
