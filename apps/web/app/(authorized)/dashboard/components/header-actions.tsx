"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccountSelector } from "./account-selector";
import { triggerSyncAndAnalysis } from "@/lib/actions/sync";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { AdAccount } from "@repo/database/schema";
import { ROUTES } from "@/lib/constants";
import { LogoutButton } from "@/components/LogoutButton";

interface HeaderActionsProps {
  accounts: AdAccount[];
  selectedAccountId: string | null;
  lastSyncTime: Date | null;
}

export function HeaderActions({
  accounts,
  selectedAccountId,
  lastSyncTime,
}: HeaderActionsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSync = async () => {
    if (!user) return;

    setIsSyncing(true);
    setSyncMessage(null);
    setSyncMessage('✓ Syncing data and running AI analysis...');

    try {
      const result = await triggerSyncAndAnalysis();

      if (result.success) {
        setSyncMessage(`✓ ${result.message}`);
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        // Check if token expired and needs re-authentication
        if (result.needsAuth) {
          setSyncMessage(`✗ Session expired. Redirecting to re-authenticate...`);
          router.push(ROUTES.AUTHORIZE_META);
        } else if (result.step === 'connection_check') {
          // User doesn't have a Meta connection - redirect to authorize page
          setSyncMessage(`✗ ${result.error}`);
          router.push(ROUTES.AUTHORIZE_META);

        } else if (result.step === 'analysis') {
          // Show the actual error message from analysis
          setSyncMessage(`✓ Sync completed. ✗ AI analysis failed: ${result.error || 'Unknown error'}`);
          console.error('AI Analysis error:', result.error);
        } else {
          setSyncMessage(`✗ ${result.error || 'Sync failed'}`);
        }
      }
    } catch (error) {
      setSyncMessage('✗ Sync failed');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleAccountChange = async (accountId: string) => {
    const { setUserSelectedAdAccount } = await import("@/lib/actions/meta");
    await setUserSelectedAdAccount(accountId);
    router.refresh();
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

  return (
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
            📊 DB • {formatSyncTime(lastSyncTime)}
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
      {selectedAccountId && (
        <AccountSelector
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
        />
      )}

      {/* Logout Button */}
      <LogoutButton />
    </div>
  );
}
