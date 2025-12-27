"use client";

import { useState } from "react";
import { Menu, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdReportCard,
  ActionPanel,
  QuickStats,
  LogoutButton,
  type AdReportCardProps,
} from "@/app/dashboard/components";
import { recordAdReview } from "@/app/actions/ads";

interface DashboardClientProps {
  ads: AdReportCardProps[];
  userId: string;
  totalSpend: number;
  averageRoas: number;
}

export function DashboardClient({
  ads,
  userId,
  totalSpend,
  averageRoas,
}: DashboardClientProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [actionsCompleted, setActionsCompleted] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const currentAd = ads[currentAdIndex];
  const hasMoreAds = currentAdIndex < ads.length;
  const pendingActions = ads.length - currentAdIndex;

  const handleApply = async () => {
    if (!currentAd) return;

    try {
      await recordAdReview(userId, currentAd.id, "apply");
      setActionsCompleted((prev) => prev + 1);
      setExitDirection("right");

      setTimeout(() => {
        setExitDirection(null);
        setCurrentAdIndex((prev) => prev + 1);
      }, 400);
    } catch (error) {
      console.error("Failed to record review:", error);
    }
  };

  const handleSkip = async () => {
    if (!currentAd) return;

    try {
      await recordAdReview(userId, currentAd.id, "skip");
      setExitDirection("left");

      setTimeout(() => {
        setExitDirection(null);
        setCurrentAdIndex((prev) => prev + 1);
      }, 400);
    } catch (error) {
      console.error("Failed to record review:", error);
    }
  };

  const getExitClass = () => {
    if (exitDirection === "right") return "animate-card-exit-right";
    if (exitDirection === "left") return "animate-card-exit-left";
    return "animate-card-enter";
  };

  return (
    <>
      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block min-h-screen relative z-10">
        {/* Clean Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {pendingActions > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                      {pendingActions}
                    </span>
                  )}
                </Button>
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - 3 Column Layout */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Quick Stats */}
            <aside className="col-span-3">
              <QuickStats
                totalAds={ads.length}
                activeAds={ads.filter(a => a.status !== "critical").length}
                totalSpend={totalSpend}
                overallRoas={averageRoas}
                pendingActions={pendingActions}
              />

              {/* Progress Summary */}
              <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/30">
                <h3 className="text-sm font-semibold text-foreground mb-3">Review Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Ads reviewed</span>
                  <span className="font-bold text-foreground">{actionsCompleted}/{ads.length}</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(actionsCompleted / ads.length) * 100}%` }}
                  />
                </div>
              </div>
            </aside>

            {/* Center - Ad Cards & Actions */}
            <div className="col-span-6 space-y-6">
              {hasMoreAds ? (
                <>
                  {/* Card Navigation */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Ad {currentAdIndex + 1} of {ads.length}
                    </span>
                    <div className="flex items-center gap-2">
                      {ads.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentAdIndex
                              ? "w-6 bg-primary"
                              : idx < currentAdIndex
                                ? "bg-green-500"
                                : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ad Report Card */}
                  <div className={exitDirection ? getExitClass() : "animate-card-enter"}>
                    <AdReportCard {...currentAd} />
                  </div>

                  {/* Action Panel */}
                  <ActionPanel
                    recommendation={currentAd.recommendations[0] || "Review this ad"}
                    impact="Potential improvement"
                    xpReward={0}
                    onApply={handleApply}
                    onSkip={handleSkip}
                  />
                </>
              ) : (
                /* All Done State */
                <div className="text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl">
                    <span className="text-4xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">All Caught Up!</h2>
                  <p className="text-muted-foreground mb-6">
                    You&apos;ve reviewed all your ads.
                    <br />
                    Great work optimizing your campaigns!
                  </p>
                  <div className="inline-flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{actionsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Reviewed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Tips */}
            <aside className="col-span-3 space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <span>💡</span> Pro Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tap on the ad card to flip it and see detailed AI analysis and performance breakdown.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-card/50 border border-border/30">
                <h3 className="font-semibold text-foreground mb-3">How it works</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Review each ad with key metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Flip to see AI insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Apply or skip recommendations</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="lg:hidden min-h-screen flex flex-col relative z-10">
        {/* Mobile Header */}
        <header className="safe-area-top bg-background/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-foreground">JakeX</span>
            </div>

            <LogoutButton />
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {hasMoreAds ? (
              <>
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2">
                  {ads.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === currentAdIndex
                          ? "w-8 bg-primary"
                          : idx < currentAdIndex
                            ? "w-1.5 bg-green-500"
                            : "w-1.5 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Ad Card */}
                <div className={exitDirection ? getExitClass() : ""}>
                  <AdReportCard {...currentAd} />
                </div>

                {/* Action Panel */}
                <ActionPanel
                  recommendation={currentAd.recommendations[0] || "Review this ad"}
                  impact="Potential improvement"
                  xpReward={0}
                  onApply={handleApply}
                  onSkip={handleSkip}
                />
              </>
            ) : (
              <div className="text-center py-12 px-6 rounded-3xl bg-green-500/10 border border-green-500/30">
                <span className="text-5xl mb-4 block">✓</span>
                <h2 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h2>
                <p className="text-sm text-muted-foreground">
                  Great work! Check back later.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-background z-[60]">
            <div className="safe-area-top p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <QuickStats
                totalAds={ads.length}
                activeAds={ads.filter(a => a.status !== "critical").length}
                totalSpend={totalSpend}
                overallRoas={averageRoas}
                pendingActions={pendingActions}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
