import { getUserProfile } from "@/lib/actions/profile";
import { getPaginatedAdAccounts, getUserSelectedAdAccount } from "@/lib/actions/meta";
import { MetaAccountSection } from "./meta-account-section";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default async function SettingsPage() {
  // Fetch user profile
  const profileResult = await getUserProfile();
  if (!profileResult.success || !profileResult.profile) {
    redirect(ROUTES.LOGIN);
  }

  // Fetch first page of ad accounts
  const adAccountsResult = await getPaginatedAdAccounts({ page: 1, pageSize: 10 });

  // Fetch selected ad account
  const selectedAccountResult = await getUserSelectedAdAccount();

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Meta Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your Meta account connections and ad accounts
        </p>
      </div>

      <MetaAccountSection
        adAccounts={adAccountsResult.success ? adAccountsResult.accounts : []}
        selectedAccountId={selectedAccountResult.selectedAccountId}
        needsConnection={adAccountsResult.needsConnection || false}
        totalAccounts={adAccountsResult.total}
      />
    </div>
  );
}
