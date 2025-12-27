"use client";

import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/app/dashboard/components";
import { triggerSync } from "@/app/actions/sync";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";
import { AccountSelector } from "./account-selector";
import { AccountSelectionDialog } from "./account-selection-dialog";
import type { AdAccount, Campaign, AdSet, Ad } from "@repo/database/schema";

interface DashboardClientProps {
  userId: string;
  lastSyncTime: Date | null;
  dataSource: "database" | "api";
  accounts: AdAccount[];
  campaigns: Campaign[];
  adSets: AdSet[];
  rawAds: Ad[];
  initialSelectedAccountId: string | null;
}

export function DashboardClient({
  userId,
  lastSyncTime,
  dataSource,
  accounts,
  campaigns,
  adSets,
  rawAds,
  initialSelectedAccountId,
}: DashboardClientProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    initialSelectedAccountId || ''
  );
  // Only show dialog if user has NEVER selected an account (initialSelectedAccountId is null from server)
  // The server fetches from database, so if null, truly no selection exists
  const [showAccountDialog, setShowAccountDialog] = useState(
    initialSelectedAccountId === null && accounts.length > 0
  );

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setSyncMessage('✓ Syncing data to database...');

    try {
      const result = await triggerSync(userId);

      if (result.success) {
        setSyncMessage(`✓ ${result.message}`);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        setSyncMessage(`✗ ${result.error || 'Sync failed'}`);
      }
    } catch (error) {
      setSyncMessage('✗ Sync failed');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const formatSyncTime = (date: Date | null) => {
    if (!date) return 'Never synced';

    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Filter data based on selected account
  const filteredData = useMemo(() => {
    // If no account is selected, return empty data
    if (!selectedAccountId) {
      return { campaigns: [], adSets: [], ads: [] };
    }

    // Filter campaigns by account
    const filteredCampaigns = campaigns.filter(
      (campaign) => campaign.adAccountId === selectedAccountId
    );
    const campaignIds = new Set(filteredCampaigns.map((c) => c.id));

    // Filter ad sets by campaigns
    const filteredAdSets = adSets.filter(
      (adSet) => adSet.campaignId && campaignIds.has(adSet.campaignId)
    );
    const adSetIds = new Set(filteredAdSets.map((a) => a.id));

    // Filter ads by ad sets
    const filteredAds = rawAds.filter(
      (ad) => ad.adSetId && adSetIds.has(ad.adSetId)
    );

    return {
      campaigns: filteredCampaigns,
      adSets: filteredAdSets,
      ads: filteredAds,
    };
  }, [selectedAccountId, campaigns, adSets, rawAds]);

  const handleAccountSelected = async (accountId: string) => {
    // Update local state immediately to close dialog
    setSelectedAccountId(accountId);
    setShowAccountDialog(false);

    // Refresh the page to get updated data (the dialog already saved to DB)
    // Add small delay to ensure DB write completes
    setTimeout(() => {
      router.refresh();
    }, 300);
  };

  const handleAccountChange = async (accountId: string) => {
    setSelectedAccountId(accountId);
    // Save to database
    const { setUserSelectedAdAccount } = await import("@/app/actions/meta");
    await setUserSelectedAdAccount(accountId);
  };

  return (
    <>
      {/* Account Selection Dialog */}
      <AccountSelectionDialog
        open={showAccountDialog}
        accounts={accounts}
        onAccountSelected={handleAccountSelected}
      />

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block min-h-screen relative z-10">
        {/* Clean Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">JakeX</h1>
                  <p className="text-xs text-muted-foreground">Ads Manager</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Sync Status & Button */}
                <div className="flex items-center gap-2">
                  {syncMessage && (
                    <span className={`text-xs px-2 py-1 rounded-md ${
                      syncMessage.startsWith('✓')
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}>
                      {syncMessage}
                    </span>
                  )}
                  {!syncMessage && lastSyncTime && (
                    <span className="text-xs text-muted-foreground">
                      {dataSource === 'database' ? '📊 DB' : '🌐 API'} • {formatSyncTime(lastSyncTime)}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isSyncing ? 'Syncing...' : 'Sync'}
                    </span>
                  </Button>
                </div>

                {/* Account Selector */}
                <AccountSelector
                  accounts={accounts}
                  selectedAccountId={selectedAccountId}
                  onAccountChange={handleAccountChange}
                />

                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Data Table */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <DataTable
            accounts={accounts}
            campaigns={filteredData.campaigns}
            adSets={filteredData.adSets}
            ads={filteredData.ads}
          />
        </main>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="safe-area-top bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-chart-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-foreground">JakeX</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSync}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                </Button>
                <AccountSelector
                  accounts={accounts}
                  selectedAccountId={selectedAccountId}
                  onAccountChange={handleAccountChange}
                />
                <LogoutButton />
              </div>
            </div>

            {/* Mobile Sync Status */}
            {syncMessage && (
              <div className={`mt-2 text-xs px-2 py-1 rounded-md text-center ${
                syncMessage.startsWith('✓')
                  ? 'bg-green-500/10 text-green-600'
                  : 'bg-red-500/10 text-red-600'
              }`}>
                {syncMessage}
              </div>
            )}
            {!syncMessage && lastSyncTime && (
              <div className="mt-2 text-xs text-muted-foreground text-center">
                {dataSource === 'database' ? '📊 Database' : '🌐 API'} • Last sync: {formatSyncTime(lastSyncTime)}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Content - Data Table */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            <DataTable
              accounts={accounts}
              campaigns={filteredData.campaigns}
              adSets={filteredData.adSets}
              ads={filteredData.ads}
            />
          </div>
        </div>
      </div>
    </>
  );
}
