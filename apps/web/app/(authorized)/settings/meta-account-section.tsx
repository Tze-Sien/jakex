"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  updateAdAccountsActivation,
  disconnectMetaAccount,
  syncAdAccountsFromMeta,
  getPaginatedAdAccounts,
} from "@/lib/actions/meta";
import { getMetaOAuthUrl } from "@/lib/actions/auth";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdAccount } from "@repo/database/schema";

interface MetaAccountSectionProps {
  adAccounts: AdAccount[];
  selectedAccountId: string | null;
  needsConnection: boolean;
  totalAccounts?: number;
}

const PAGE_SIZE = 10;

export function MetaAccountSection({
  adAccounts: initialAdAccounts,
  selectedAccountId,
  needsConnection,
  totalAccounts: initialTotal,
}: MetaAccountSectionProps) {
  const [adAccounts, setAdAccounts] = useState(initialAdAccounts);
  const [selectedAccounts, setSelectedAccounts] = useState(
    new Set(initialAdAccounts.filter((a) => a.isActive).map((a) => a.id))
  );
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const pendingChangesRef = useRef(pendingChanges);

  // Keep ref in sync with state
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil((initialTotal || initialAdAccounts.length) / PAGE_SIZE));
  const [totalCount, setTotalCount] = useState(initialTotal || initialAdAccounts.length);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
      if (searchQuery) {
        setHasSearched(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch accounts when page or search changes
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPaginatedAdAccounts({
        page: currentPage,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
      });

      if (result.success) {
        setAdAccounts(result.accounts);
        setTotalPages(result.totalPages);
        setTotalCount(result.total);
        // Update selected accounts based on isActive status, but preserve pending changes
        const currentPendingChanges = pendingChangesRef.current;
        const newSelected = new Set<string>();
        result.accounts.forEach((acc) => {
          if (currentPendingChanges.has(acc.id)) {
            if (currentPendingChanges.get(acc.id)) {
              newSelected.add(acc.id);
            }
          } else if (acc.isActive) {
            newSelected.add(acc.id);
          }
        });
        setSelectedAccounts(newSelected);
      }
    } catch {
      toast.error("Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    // Fetch if we have a connection and either:
    // - there's an active search
    // - page changed from initial
    // - search was cleared (hasSearched is true but debouncedSearch is empty)
    if (!needsConnection && (debouncedSearch || currentPage > 1 || hasSearched)) {
      fetchAccounts();
    }
  }, [currentPage, debouncedSearch, needsConnection, fetchAccounts, hasSearched]);

  const handleAccountToggle = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    const newPending = new Map(pendingChanges);

    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
      newPending.set(accountId, false);
    } else {
      newSelected.add(accountId);
      newPending.set(accountId, true);
    }
    setSelectedAccounts(newSelected);
    setPendingChanges(newPending);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Only send updates for accounts that have pending changes
      const updates = Array.from(pendingChanges.entries()).map(([id, isActive]) => ({
        id,
        isActive,
      }));

      if (updates.length === 0) {
        toast.info("No changes to save");
        setIsSaving(false);
        return;
      }

      const result = await updateAdAccountsActivation(updates);

      if (result.success) {
        toast.success("Settings saved successfully");
        // Clear pending changes
        setPendingChanges(new Map());
        // Refresh the current page
        await fetchAccounts();
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch {
      toast.error("An error occurred while saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const result = await disconnectMetaAccount();

      if (result.success) {
        toast.success("Meta account disconnected successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to disconnect Meta account");
      }
    } catch {
      toast.error("An error occurred while disconnecting");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAdAccountsFromMeta();

      if (result.success) {
        toast.success(result.message || "Accounts synced successfully");
        // Clear pending changes and reset to first page
        setPendingChanges(new Map());
        setCurrentPage(1);
        setSearchQuery("");
        // Fetch fresh data
        const refreshResult = await getPaginatedAdAccounts({ page: 1, pageSize: PAGE_SIZE });
        if (refreshResult.success) {
          setAdAccounts(refreshResult.accounts);
          setTotalPages(refreshResult.totalPages);
          setTotalCount(refreshResult.total);
          setSelectedAccounts(new Set(refreshResult.accounts.filter((a) => a.isActive).map((a) => a.id)));
        }
      } else {
        toast.error(result.error || "Failed to sync accounts");
      }
    } catch {
      toast.error("An error occurred while syncing accounts");
    } finally {
      setIsSyncing(false);
    }
  };

  const hasChanges = pendingChanges.size > 0;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Pass current path to redirect back after OAuth
      const { authUrl, state } = await getMetaOAuthUrl("/settings");
      sessionStorage.setItem("meta_oauth_state", state);
      window.location.href = authUrl;
    } catch (error) {
      console.error("OAuth error:", error);
      toast.error("Failed to connect. Please try again.");
      setIsConnecting(false);
    }
  };

  if (needsConnection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meta Account Connection</CardTitle>
          <CardDescription>Connect your Meta account to manage ads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">No Meta Account Connected</p>
              <p className="text-sm text-muted-foreground">
                Connect your Meta account to start managing your ads
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              "Connect Meta Account"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ad Accounts Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ad Accounts</CardTitle>
              <CardDescription className="mt-1.5">
                Select which ad accounts you want to activate. New accounts synced from Meta are inactive by default.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync from Meta"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or account ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Accounts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : adAccounts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {debouncedSearch ? "No Matching Accounts" : "No Ad Accounts Found"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? "Try a different search term"
                    : "Click 'Sync from Meta' to fetch your ad accounts"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {adAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={account.id}
                    checked={selectedAccounts.has(account.id)}
                    onCheckedChange={() => handleAccountToggle(account.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label htmlFor={account.id} className="font-medium cursor-pointer">
                        {account.name || account.metaAdAccountId}
                      </Label>
                      {account.id === selectedAccountId && (
                        <Badge variant="default" className="text-xs">
                          Currently Selected
                        </Badge>
                      )}
                      {account.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                      {pendingChanges.has(account.id) && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                          Unsaved
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Account ID: {account.metaAdAccountId}
                      {account.currency && ` • ${account.currency}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} accounts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedAccounts.size} account(s) selected on this page
            {hasChanges && ` • ${pendingChanges.size} unsaved change(s)`}
          </p>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Disconnect your Meta account. All data will be preserved.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger>
              <Button variant="destructive" disabled={isDisconnecting}>
                {isDisconnecting ? "Disconnecting..." : "Disconnect Meta Account"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disconnect Meta Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disconnect your Meta account from the app. All your data (ad accounts,
                  campaigns, ads, and insights) will be preserved and you can reconnect later to
                  restore access.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
