import { Check } from "lucide-react";

interface AdAccount {
  id: string;
  name: string;
  accountId: string;
  currency: string;
  status: "active" | "inactive";
  spend: number;
  campaigns: number;
}

interface AccountCardProps {
  account: AdAccount;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  return (
    <button
      onClick={() => onSelect(account.id)}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        ${
          isSelected
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
            : "border-border/50 bg-card/50 hover:border-border hover:shadow-md"
        }
        active:scale-[0.98]
      `}
    >
      <div className="flex items-start gap-3">
        {/* Selection Indicator */}
        <div
          className={`
          shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
          ${
            isSelected
              ? "border-primary bg-primary"
              : "border-border/50 bg-background"
          }
        `}
        >
          {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
        </div>

        {/* Account Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">
                {account.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                ID: {account.accountId}
              </p>
            </div>
            <div
              className={`
              shrink-0 px-2 py-1 rounded-md text-xs font-medium
              ${
                account.status === "active"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
              }
            `}
            >
              {account.status}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-chart-1" />
              <span className="text-xs text-muted-foreground">
                {account.campaigns} campaigns
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-chart-2" />
              <span className="text-xs text-muted-foreground">
                ${account.spend.toLocaleString()} spend
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
