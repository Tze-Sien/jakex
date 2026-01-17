"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetaAccountSection } from "./meta-account-section";
import { ProfileSection } from "./profile-section";
import type { AdAccount } from "@repo/database/schema";

interface SettingsClientProps {
  profile: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    status: string;
  };
  adAccounts: AdAccount[];
  selectedAccountId: string | null;
  needsConnection: boolean;
}

export function SettingsClient({
  profile,
  adAccounts,
  selectedAccountId,
  needsConnection,
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="meta">Meta Account</TabsTrigger>
      </TabsList>

      <TabsContent value="meta" className="mt-6">
        <MetaAccountSection
          adAccounts={adAccounts}
          selectedAccountId={selectedAccountId}
          needsConnection={needsConnection}
        />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <ProfileSection profile={profile} />
      </TabsContent>
    </Tabs>
  );
}
