import {
  getMetaConnection,
  getAdAccountsFromDatabase,
  getCampaignsFromDatabase,
  getAdSetsFromDatabase,
  getAdsFromDatabase,
  getUserSelectedAdAccount,
} from "@/lib/actions/meta";
import { getLatestAIAnalysis } from "@/lib/actions/ai-analysis";
import { getServerUser } from "@repo/auth/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { HeaderActions } from "./components/header-actions";
import { AIAnalysisBox } from "./components/ai-analysis-box";
import { ConnectMetaCard } from "./components/connect-meta-card";
import { SelectAccountCard } from "./components/select-account-card";

export default async function DashboardPage() {
  // Get the authenticated user
  const user = await getServerUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  const userId = user.id;
  console.log(userId);

  // Get user's META connection
  const connection = await getMetaConnection(userId).catch((error) => {
    console.error("Error fetching META connection:", error);
    return null;
  });

  // Get selected ad account from database
  const selectedResult = await getUserSelectedAdAccount().catch(() => ({ success: false, selectedAccountId: null }));
  const selectedAccountId = selectedResult.success ? selectedResult.selectedAccountId : null;

  // Fetch all data from database (or empty arrays if no connection)
  const accounts = connection ? await getAdAccountsFromDatabase(connection.id).catch(() => []) : [];
  const campaigns = connection ? await getCampaignsFromDatabase(connection.id).catch(() => []) : [];
  const adSets = connection ? await getAdSetsFromDatabase(connection.id).catch(() => []) : [];
  const ads = connection ? await getAdsFromDatabase(connection.id).catch(() => []) : [];

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
    latestAnalysis = await getLatestAIAnalysis();
  } catch (error) {
    analysisError = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch AI analysis:", error);
  }

  return (
    <>
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Here&apos;s an overview of your ad performance.
          </p>
        </div>
        <HeaderActions
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          lastSyncTime={lastSyncTime}
        />
      </div>

      {/* Debug Info - Remove in production */}
      {analysisError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
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

      {/* Show appropriate card based on connection and account selection status */}
      {!connection ? (
        <ConnectMetaCard />
      ) : !selectedAccountId ? (
        <SelectAccountCard />
      ) : (
        /* Placeholder for future content */
        <div className="text-center text-muted-foreground py-12">
          <p>Dashboard content coming soon...</p>
          <p className="text-sm mt-2">Click the Sync button above to fetch data and generate AI analysis</p>
        </div>
      )}
    </>
  );
}
