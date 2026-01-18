"use client";

import { useState, useEffect } from "react";
import { AccountMultiSelector } from "@/components/dashboard/account-multi-selector";
import { MetricsSelector } from "@/components/dashboard/metrics-selector";
import { OverviewMetricsCards } from "@/components/dashboard/overview-metrics-cards";
import { AccountStatusSummary } from "@/components/dashboard/account-status-summary";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import {
  getOverviewMetrics,
  getAccountStatusSummary,
  getDateRangeFromPeriod,
  type OverviewMetrics,
} from "@/lib/actions/dashboard-queries";

interface AdAccount {
  id: string;
  name: string;
  metaAdAccountId: string;
}

interface DashboardOverviewProps {
  userId: string;
  accounts: AdAccount[];
  initialSelectedAccountIds: string[];
  initialVisibleMetrics: string[];
  initialPeriod: string;
}

export function DashboardOverview({
  userId,
  accounts,
  initialSelectedAccountIds,
  initialVisibleMetrics,
  initialPeriod,
}: DashboardOverviewProps) {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(
    initialSelectedAccountIds
  );
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(
    initialVisibleMetrics
  );
  const [period, setPeriod] = useState<string>(initialPeriod);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    performing: 0,
    normal: 0,
    underperforming: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch metrics when period or selected accounts change
  useEffect(() => {
    async function fetchData() {
      if (selectedAccountIds.length === 0) {
        setMetrics(null);
        setStatusCounts({ performing: 0, normal: 0, underperforming: 0 });
        return;
      }

      setIsLoading(true);
      try {
        const dateRange = await getDateRangeFromPeriod(period);

        const [metricsData, statusData] = await Promise.all([
          getOverviewMetrics(userId, selectedAccountIds, dateRange),
          getAccountStatusSummary(selectedAccountIds, dateRange),
        ]);

        setMetrics(metricsData);
        setStatusCounts(statusData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, selectedAccountIds, period]);

  return (
    <div className="space-y-6">
      {/* Account Selector */}
      <AccountMultiSelector
        userId={userId}
        accounts={accounts}
        selectedAccountIds={selectedAccountIds}
        onSelectionChange={setSelectedAccountIds}
      />

      {/* Period Selector and Metrics Customizer */}
      <div className="flex items-center justify-between">
        <PeriodSelector value={period} onValueChange={setPeriod} />
        <MetricsSelector
          userId={userId}
          selectedMetrics={visibleMetrics}
          onSelectionChange={setVisibleMetrics}
        />
      </div>

      {selectedAccountIds.length > 0 ? (
        <>
          {/* Status Summary */}
          <AccountStatusSummary statusCounts={statusCounts} />

          {/* Metrics Cards */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading metrics...
            </div>
          ) : metrics ? (
            <OverviewMetricsCards
              metrics={metrics}
              selectedMetrics={visibleMetrics}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          Select at least one account to view metrics
        </div>
      )}
    </div>
  );
}
