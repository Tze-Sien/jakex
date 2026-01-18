import {
  getMetaConnection,
  getAdAccountsFromDatabase,
  getCampaignsFromDatabase,
  getAdSetsFromDatabase,
  getAdsFromDatabase,
  getUserSelectedAdAccount,
} from "@/lib/actions/meta";
import { getUserDashboardPreferences } from "@/lib/actions/dashboard-queries";
import { getServerUser } from "@repo/auth/server";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { HeaderActions } from "./components/header-actions";
import { ConnectMetaCard } from "./components/connect-meta-card";
import { SelectAccountCard } from "./components/select-account-card";
import { DashboardOverview } from "./components/dashboard-overview";

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

  // Fetch all data from database (or empty arrays if no connection)
  // Note: getAdAccountsFromDatabase only returns active accounts by default
  const accounts = connection ? await getAdAccountsFromDatabase(connection.id).catch(() => []) : [];
  const hasActiveAccounts = accounts.length > 0;

  // Get selected ad account from database (for header display purposes)
  const selectedResult = await getUserSelectedAdAccount().catch(() => ({ success: false, selectedAccountId: null }));
  const selectedAccountId = selectedResult.success ? selectedResult.selectedAccountId : null;
  const campaigns = connection ? await getCampaignsFromDatabase(connection.id).catch(() => []) : [];
  const adSets = connection ? await getAdSetsFromDatabase(connection.id).catch(() => []) : [];
  const ads = connection ? await getAdsFromDatabase(connection.id).catch(() => []) : [];

  // Get last sync time from the most recent synced entity
  const allEntities = [...accounts, ...campaigns, ...adSets, ...ads];
  const syncedEntities = allEntities.filter((e): e is typeof e & { lastSyncedAt: Date } => e.lastSyncedAt != null);
  const lastSyncTime = syncedEntities.length > 0
    ? new Date(Math.max(...syncedEntities.map(e => new Date(e.lastSyncedAt).getTime())))
    : null;

  // Get user dashboard preferences
  const preferences = await getUserDashboardPreferences(userId);
  const initialSelectedAccountIds = preferences?.selectedAccountIds || accounts.map(a => a.id);
  const initialVisibleMetrics = preferences?.visibleMetrics || ["spend", "conversions", "cpc", "ctr"];
  const initialPeriod = preferences?.defaultPeriod || "last_7_days";

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
      {/* {analysisError && (
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
      )} */}

      {/* Show appropriate card based on connection and active accounts */}
      {!connection ? (
        <ConnectMetaCard />
      ) : !hasActiveAccounts ? (
        <SelectAccountCard />
      ) : (
        <DashboardOverview
          userId={userId}
          accounts={accounts.map(account => ({
            id: account.id,
            name: account.name || "Unnamed Account",
            metaAdAccountId: account.metaAdAccountId,
          }))}
          initialSelectedAccountIds={initialSelectedAccountIds}
          initialVisibleMetrics={initialVisibleMetrics}
          initialPeriod={initialPeriod}
        />
      )}
    </>
  );
}
