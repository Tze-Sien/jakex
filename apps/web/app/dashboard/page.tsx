import {
  getMetaConnection,
  getAdAccountsFromDatabase,
  getCampaignsFromDatabase,
  getAdSetsFromDatabase,
  getAdsFromDatabase,
  getUserSelectedAdAccount,
} from "@/app/actions/meta";
import { HeaderActions } from "@/components/dashboard/header-actions";

export default async function DashboardPage() {
  // TEMPORARY: Bypass authentication and use mock user ID
  const userId = "00000000-0000-0000-0000-000000000000";

  // Get user's META connection
  const connection = await getMetaConnection(userId).catch((error) => {
    console.error("Error fetching META connection:", error);
    return null;
  });

  // Fetch all data from database (or empty arrays if no connection)
  const accounts = connection ? await getAdAccountsFromDatabase(connection.id).catch(() => []) : [];
  const campaigns = connection ? await getCampaignsFromDatabase(connection.id).catch(() => []) : [];
  const adSets = connection ? await getAdSetsFromDatabase(connection.id).catch(() => []) : [];
  const ads = connection ? await getAdsFromDatabase(connection.id).catch(() => []) : [];

  // Get selected ad account from database
  const selectedResult = connection ? await getUserSelectedAdAccount(userId).catch(() => ({ success: false, selectedAccountId: null })) : { success: false, selectedAccountId: null };
  const selectedAccountId = selectedResult.success ? selectedResult.selectedAccountId : null;

  // Get last sync time from the most recent synced entity
  const allEntities = [...accounts, ...campaigns, ...adSets, ...ads];
  const syncedEntities = allEntities.filter((e): e is typeof e & { lastSyncedAt: Date } => e.lastSyncedAt != null);
  const lastSyncTime = syncedEntities.length > 0
    ? new Date(Math.max(...syncedEntities.map(e => new Date(e.lastSyncedAt).getTime())))
    : null;

  return (
    <div className="min-h-screen">
      {/* Header */}
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
            <HeaderActions
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              lastSyncTime={lastSyncTime}
            />
          </div>
        </div>
      </header>

      {/* Empty Body */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Content will go here */}
      </main>
    </div>
  );
}
