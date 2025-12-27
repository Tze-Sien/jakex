"use client";

import { useState } from "react";
import { Menu, Bell, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdReportCard,
  ActionPanel,
  QuickStats,
  LogoutButton,
  type AdReportCardProps,
} from "@/app/dashboard/components";
import { recordAdReview } from "@/app/actions/ads";
import { triggerManualSync, syncMockDataToDatabase } from "@/app/actions/meta";
import { useRouter } from "next/navigation";
import { DataTable } from "./data-table";

interface DashboardClientProps {
  ads: AdReportCardProps[];
  userId: string;
  totalSpend: number;
  averageRoas: number;
  lastSyncTime: Date | null;
  dataSource: "database" | "api";
  accounts?: any[];
  campaigns?: any[];
  adSets?: any[];
  rawAds?: any[];
}

export function DashboardClient({
  ads,
  userId,
  totalSpend,
  averageRoas,
  lastSyncTime,
  dataSource,
  accounts = [],
  campaigns = [],
  adSets = [],
  rawAds = [],
}: DashboardClientProps) {
  const router = useRouter();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [actionsCompleted, setActionsCompleted] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const currentAd = ads[currentAdIndex];
  const hasMoreAds = currentAdIndex < ads.length;
  const pendingActions = ads.length - currentAdIndex;

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    // In mock mode, sync generated data to database
    if (userId === "00000000-0000-0000-0000-000000000000") {
      setSyncMessage('✓ Syncing mock data to database...');

      try {
        const result = await syncMockDataToDatabase(userId);

        if (result.success) {
          setSyncMessage(`✓ ${result.message}`);
          setTimeout(() => {
            router.refresh();
          }, 1000);
        } else {
          setSyncMessage(`✗ ${result.error || 'Mock sync failed'}`);
        }
      } catch (error) {
        setSyncMessage('✗ Mock sync failed');
        console.error('Mock sync error:', error);
      } finally {
        setIsSyncing(false);
        setTimeout(() => setSyncMessage(null), 5000);
      }
      return;
    }

    try {
      const result = await triggerManualSync(userId);

      if (result.success) {
        setSyncMessage(`✓ ${result.message}`);
        // Refresh the page to show new data
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
      // Clear message after 5 seconds
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

  const handleApply = async () => {
    if (!currentAd) return;

    try {
      // Skip recording in mock mode
      if (userId !== "00000000-0000-0000-0000-000000000000") {
        await recordAdReview(userId, currentAd.id, "apply");
      }
      setActionsCompleted((prev) => prev + 1);
      setExitDirection("right");

      setTimeout(() => {
        setExitDirection(null);
        setCurrentAdIndex((prev) => prev + 1);
      }, 400);
    } catch (error) {
      console.error("Failed to record review:", error);
    }
  };

  const handleSkip = async () => {
    if (!currentAd) return;

    try {
      // Skip recording in mock mode
      if (userId !== "00000000-0000-0000-0000-000000000000") {
        await recordAdReview(userId, currentAd.id, "skip");
      }
      setExitDirection("left");

      setTimeout(() => {
        setExitDirection(null);
        setCurrentAdIndex((prev) => prev + 1);
      }, 400);
    } catch (error) {
      console.error("Failed to record review:", error);
    }
  };

  const getExitClass = () => {
    if (exitDirection === "right") return "animate-card-exit-right";
    if (exitDirection === "left") return "animate-card-exit-left";
    return "animate-card-enter";
  };

  return (
    <>
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block min-h-screen relative z-10">
        {/* Clean Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
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
              <div className="flex items-center gap-2">
                {/* Sync Status & Button */}
                <div className="flex items-center gap-2 mr-2">
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

                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {pendingActions > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {pendingActions}
                    </span>
                  )}
                </Button>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Data Table */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <DataTable
            accounts={accounts}
            campaigns={campaigns}
            adSets={adSets}
            ads={rawAds}
          />
        </main>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="safe-area-top bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
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
              campaigns={campaigns}
              adSets={adSets}
              ads={rawAds}
            />
          </div>
        </div>
      </div>
    </>
  );
}
