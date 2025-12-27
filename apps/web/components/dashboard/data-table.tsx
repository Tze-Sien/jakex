"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewLevel = "accounts" | "campaigns" | "adSets" | "ads";

interface Breadcrumb {
  level: ViewLevel;
  id?: string;
  name: string;
}

interface DataTableProps {
  accounts: any[];
  campaigns: any[];
  adSets: any[];
  ads: any[];
}

export function DataTable({ accounts, campaigns, adSets, ads }: DataTableProps) {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("accounts");
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    { level: "accounts", name: "Ad Accounts" },
  ]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Navigate to a specific level
  const navigateTo = (level: ViewLevel, id?: string, name?: string) => {
    if (level === "accounts") {
      setBreadcrumbs([{ level: "accounts", name: "Ad Accounts" }]);
      setCurrentLevel("accounts");
      setSelectedAccountId(null);
      setSelectedCampaignId(null);
      setSelectedAdSetId(null);
    } else if (level === "campaigns" && id) {
      setBreadcrumbs([
        { level: "accounts", name: "Ad Accounts" },
        { level: "campaigns", id, name: name || "Campaigns" },
      ]);
      setCurrentLevel("campaigns");
      setSelectedAccountId(id);
      setSelectedCampaignId(null);
      setSelectedAdSetId(null);
    } else if (level === "adSets" && id) {
      const account = accounts.find((a) => a.id === selectedAccountId);
      setBreadcrumbs([
        { level: "accounts", name: "Ad Accounts" },
        { level: "campaigns", id: selectedAccountId!, name: account?.name || "Account" },
        { level: "adSets", id, name: name || "Ad Sets" },
      ]);
      setCurrentLevel("adSets");
      setSelectedCampaignId(id);
      setSelectedAdSetId(null);
    } else if (level === "ads" && id) {
      const account = accounts.find((a) => a.id === selectedAccountId);
      const campaign = campaigns.find((c) => c.id === selectedCampaignId);
      setBreadcrumbs([
        { level: "accounts", name: "Ad Accounts" },
        { level: "campaigns", id: selectedAccountId!, name: account?.name || "Account" },
        { level: "adSets", id: selectedCampaignId!, name: campaign?.name || "Campaign" },
        { level: "ads", id, name: name || "Ads" },
      ]);
      setCurrentLevel("ads");
      setSelectedAdSetId(id);
    }
    setCurrentPage(1); // Reset to first page when navigating
  };

  // Get current data based on level
  const getCurrentData = () => {
    switch (currentLevel) {
      case "accounts":
        return accounts;
      case "campaigns":
        return campaigns.filter((c) => c.account_id === selectedAccountId);
      case "adSets":
        return adSets.filter((a) => a.campaign_id === selectedCampaignId);
      case "ads":
        return ads.filter((a) => a.adset_id === selectedAdSetId);
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Render table columns based on level
  const renderTableHeader = () => {
    switch (currentLevel) {
      case "accounts":
        return (
          <tr className="border-b border-border/50">
            <th className="text-left p-4 font-semibold text-sm">Account ID</th>
            <th className="text-left p-4 font-semibold text-sm">Account Name</th>
            <th className="text-left p-4 font-semibold text-sm">Currency</th>
            <th className="text-left p-4 font-semibold text-sm">Status</th>
            <th className="text-right p-4 font-semibold text-sm">Action</th>
          </tr>
        );
      case "campaigns":
        return (
          <tr className="border-b border-border/50">
            <th className="text-left p-4 font-semibold text-sm">Campaign ID</th>
            <th className="text-left p-4 font-semibold text-sm">Campaign Name</th>
            <th className="text-left p-4 font-semibold text-sm">Objective</th>
            <th className="text-left p-4 font-semibold text-sm">Status</th>
            <th className="text-right p-4 font-semibold text-sm">Action</th>
          </tr>
        );
      case "adSets":
        return (
          <tr className="border-b border-border/50">
            <th className="text-left p-4 font-semibold text-sm">Ad Set ID</th>
            <th className="text-left p-4 font-semibold text-sm">Ad Set Name</th>
            <th className="text-left p-4 font-semibold text-sm">Optimization Goal</th>
            <th className="text-left p-4 font-semibold text-sm">Status</th>
            <th className="text-right p-4 font-semibold text-sm">Action</th>
          </tr>
        );
      case "ads":
        return (
          <tr className="border-b border-border/50">
            <th className="text-left p-4 font-semibold text-sm">Ad ID</th>
            <th className="text-left p-4 font-semibold text-sm">Ad Name</th>
            <th className="text-left p-4 font-semibold text-sm">Creative Title</th>
            <th className="text-left p-4 font-semibold text-sm">Status</th>
            <th className="text-right p-4 font-semibold text-sm">Metrics</th>
          </tr>
        );
    }
  };

  const renderTableRow = (item: any, index: number) => {
    switch (currentLevel) {
      case "accounts":
        return (
          <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
            <td className="p-4 text-sm font-mono">{item.id}</td>
            <td className="p-4 text-sm font-medium">{item.name || "Unnamed Account"}</td>
            <td className="p-4 text-sm">{item.currency || "USD"}</td>
            <td className="p-4">
              <span className="inline-flex px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-xs font-medium">
                {item.status || "ACTIVE"}
              </span>
            </td>
            <td className="p-4 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("campaigns", item.id, item.name)}
                className="gap-1"
              >
                View Campaigns
                <ChevronRight className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        );
      case "campaigns":
        return (
          <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
            <td className="p-4 text-sm font-mono">{item.id}</td>
            <td className="p-4 text-sm font-medium">{item.name || "Unnamed Campaign"}</td>
            <td className="p-4 text-sm">{item.objective || "OUTCOME_SALES"}</td>
            <td className="p-4">
              <span className="inline-flex px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-xs font-medium">
                {item.status || "ACTIVE"}
              </span>
            </td>
            <td className="p-4 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("adSets", item.id, item.name)}
                className="gap-1"
              >
                View Ad Sets
                <ChevronRight className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        );
      case "adSets":
        return (
          <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
            <td className="p-4 text-sm font-mono">{item.id}</td>
            <td className="p-4 text-sm font-medium">{item.name || "Unnamed Ad Set"}</td>
            <td className="p-4 text-sm">{item.optimization_goal || "OFFSITE_CONVERSIONS"}</td>
            <td className="p-4">
              <span className="inline-flex px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 text-xs font-medium">
                {item.status || "ACTIVE"}
              </span>
            </td>
            <td className="p-4 text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("ads", item.id, item.name)}
                className="gap-1"
              >
                View Ads
                <ChevronRight className="w-4 h-4" />
              </Button>
            </td>
          </tr>
        );
      case "ads":
        return (
          <tr key={item.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
            <td className="p-4 text-sm font-mono">{item.id}</td>
            <td className="p-4 text-sm font-medium">{item.name || "Unnamed Ad"}</td>
            <td className="p-4 text-sm">{item.creative?.title || "No title"}</td>
            <td className="p-4">
              <span className="inline-flex px-2 py-1 rounded-md bg-orange-500/10 text-orange-600 text-xs font-medium">
                {item.status || "ACTIVE"}
              </span>
            </td>
            <td className="p-4 text-right text-sm">
              <div className="flex flex-col items-end gap-1">
                <span className="text-muted-foreground">Spend: ${item.insights?.spend || "0"}</span>
                <span className="text-muted-foreground">ROAS: {item.insights?.roas || "0"}x</span>
              </div>
            </td>
          </tr>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (index === 0) {
                  navigateTo("accounts");
                } else if (index === 1 && crumb.id) {
                  navigateTo("campaigns", crumb.id, crumb.name);
                } else if (index === 2 && crumb.id) {
                  navigateTo("adSets", crumb.id, crumb.name);
                }
              }}
              className={`${
                index === breadcrumbs.length - 1
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {crumb.name}
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">{renderTableHeader()}</thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => renderTableRow(item, index))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length}{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
