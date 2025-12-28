import {
  getMetaConnection,
  getAdAccountsFromDatabase,
  getCampaignsFromDatabase,
  getAdSetsFromDatabase,
  getAdsFromDatabase,
  getUserSelectedAdAccount,
} from "@/app/actions/meta";
import { getLatestAIAnalysis } from "@/app/actions/ai-analysis";
import { HeaderActions } from "@/components/dashboard/header-actions";
import { AIAnalysisBox } from "@/components/dashboard/ai-analysis-box";

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

  // Get latest AI analysis
  let latestAnalysis = null;
  let analysisError = null;
  try {
    latestAnalysis = await getLatestAIAnalysis(userId);
  } catch (error) {
    analysisError = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch AI analysis:", error);
  }

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Debug Info - Remove in production */}
        {analysisError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
              Database Error (Debug Info):
            </h3>
            <p className="text-xs text-red-800 dark:text-red-200 font-mono">
              {analysisError}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-2">
              Check your DATABASE_URL environment variable in Vercel
            </p>
          </div>
        )}

        {/* AI Analysis Box */}
        <AIAnalysisBox analysis={latestAnalysis} isLoading={false} />

        {/* Placeholder for future content */}
        <div className="text-center text-muted-foreground py-12">
          <p>Dashboard content coming soon...</p>
          <p className="text-sm mt-2">Click the Sync button above to fetch data and generate AI analysis</p>
        </div>
      </main>
    </div>
  );
}
