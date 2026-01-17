import { redirect } from "next/navigation";
import { loadUserAdAccounts } from "@/lib/actions/meta";
import { AnimatedBackground } from "../(auth)/AnimatedBackground";
import { SelectAccountClient } from "./SelectAccountClient";


export default async function SelectAccountPage() {
  const result = await loadUserAdAccounts();

  // Handle auth redirect on server side
  if (!result.success && result.needsAuth) {
    redirect('/authorize-meta');
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

  return (
    <>
      <AnimatedBackground />
      <SelectAccountClient accounts={accounts} />
    </>
  );
}
