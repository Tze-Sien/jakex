"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { setUserSelectedAdAccount } from "@/lib/actions/meta";

interface AdAccount {
  id: string;
  metaAdAccountId: string;
  name: string | null;
  currency: string | null;
  timezone: string | null;
  accountStatus: number | null;
  isActive: boolean;
}

interface AccountPickerCardProps {
  accounts: AdAccount[];
}

export function AccountPickerCard({ accounts }: AccountPickerCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const filteredAccounts = accounts.filter((account) => {
    const query = searchQuery.toLowerCase();
    const name = account.name?.toLowerCase() || "";
    const metaId = account.metaAdAccountId.toLowerCase();
    return name.includes(query) || metaId.includes(query);
  });

  const handleConfirm = () => {
    if (!selectedAccountId) return;

    startTransition(async () => {
      const result = await setUserSelectedAdAccount(selectedAccountId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Select an Ad Account</CardTitle>
          <CardDescription>
            Choose an ad account to view your dashboard.
          </CardDescription>
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

          {/* Account List */}
          <ScrollArea className="h-64">
            {filteredAccounts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No accounts found matching your search.
              </div>
            ) : (
              <RadioGroup
                value={selectedAccountId}
                onValueChange={setSelectedAccountId}
                className="space-y-2 pr-4"
              >
                {filteredAccounts.map((account) => (
                  <Label
                    key={account.id}
                    htmlFor={account.id}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-accent"
                  >
                    <RadioGroupItem value={account.id} id={account.id} />
                    <div className="space-y-0.5">
                      <div className="font-medium">
                        {account.name || "Unnamed Account"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {account.metaAdAccountId}
                        {account.currency && ` • ${account.currency}`}
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </ScrollArea>

          {/* Account Count */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            {filteredAccounts.length} of {accounts.length} account
            {accounts.length !== 1 ? "s" : ""}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleConfirm}
            disabled={!selectedAccountId || isPending}
            className="w-full"
          >
            {isPending ? "Confirming..." : "Confirm Selection"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
