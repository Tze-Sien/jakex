"use client";

import { useState, useEffect } from "react";
import { Menu, Bell, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AdReportCard,
  ActionPanel,
  QuickStats,
  ProgressBar,
  Confetti,
} from "./components";

// Mock Ad Data
const mockAds = [
  {
    id: "1",
    adName: "Summer Sale - Video Ad",
    campaignName: "Summer Collection 2024",
    adImage: undefined,
    metrics: {
      roas: 4.2,
      ctr: 2.8,
      cpc: 0.42,
      cpm: 8.2,
      spend: 1200,
      conversions: 156,
      impressions: 42000,
      clicks: 1176,
    },
    healthScore: 87,
    status: "performer" as const,
    trend: "up" as const,
    aiSummary: "This ad is your top performer! It's generating excellent returns with a 4.2x ROAS. The audience is responding well to the creative, and engagement rates are above industry benchmarks.",
    recommendations: [
      "Increase budget by 30% to maximize returns",
      "Consider extending to similar audiences",
      "Creative is still fresh - no fatigue detected",
    ],
    recommendation: "Increase budget by 30% to maximize returns on this top performer",
    impact: "+$2,400/month potential",
    xpReward: 50,
  },
  {
    id: "2",
    adName: "Brand Awareness - Carousel",
    campaignName: "Brand Building Q4",
    adImage: undefined,
    metrics: {
      roas: 1.8,
      ctr: 1.2,
      cpc: 0.85,
      cpm: 12.5,
      spend: 850,
      conversions: 42,
      impressions: 68000,
      clicks: 816,
    },
    healthScore: 52,
    status: "attention" as const,
    trend: "stable" as const,
    aiSummary: "This ad is underperforming compared to your benchmarks. The CTR is below average, suggesting the creative may need refreshing or the targeting needs adjustment.",
    recommendations: [
      "Test new creative variations",
      "Review audience targeting",
      "Consider pausing if no improvement in 3 days",
    ],
    recommendation: "Test 2-3 new creative variations to improve engagement",
    impact: "+40% CTR expected",
    xpReward: 35,
  },
  {
    id: "3",
    adName: "Retargeting - Dynamic",
    campaignName: "Cart Abandonment",
    adImage: undefined,
    metrics: {
      roas: 0.6,
      ctr: 0.4,
      cpc: 2.1,
      cpm: 18.5,
      spend: 650,
      conversions: 8,
      impressions: 35000,
      clicks: 140,
    },
    healthScore: 23,
    status: "critical" as const,
    trend: "down" as const,
    aiSummary: "This ad is losing money with a 0.6x ROAS. CPC is very high and conversions are minimal. Recommend pausing immediately to prevent further budget waste.",
    recommendations: [
      "Pause this ad immediately",
      "Reallocate budget to performers",
      "Review product feed for issues",
    ],
    recommendation: "Pause this ad to stop budget waste - reallocate to performers",
    impact: "Save $650/week",
    xpReward: 25,
  },
];

export default function DashboardPage() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentXP, setCurrentXP] = useState(320);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(3);
  const [actionsCompleted, setActionsCompleted] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const maxXP = 500;
  const currentAd = mockAds[currentAdIndex];
  const hasMoreAds = currentAdIndex < mockAds.length;
  const pendingActions = mockAds.length - currentAdIndex;

  const handleApply = () => {
    const xp = currentAd?.xpReward || 25;
    setCurrentXP((prev) => {
      const newXP = prev + xp;
      if (newXP >= maxXP) {
        setLevel((l) => l + 1);
        return newXP - maxXP;
      }
      return newXP;
    });
    setActionsCompleted((prev) => prev + 1);
    setShowConfetti(true);
    setExitDirection("right");

    setTimeout(() => {
      setShowConfetti(false);
      setExitDirection(null);
      setCurrentAdIndex((prev) => prev + 1);
    }, 800);
  };

  const handleSkip = () => {
    setExitDirection("left");
    setTimeout(() => {
      setExitDirection(null);
      setCurrentAdIndex((prev) => prev + 1);
    }, 400);
  };

  const getExitClass = () => {
    if (exitDirection === "right") return "animate-card-exit-right";
    if (exitDirection === "left") return "animate-card-exit-left";
    return "animate-card-enter";
  };

  return (
    <>
      {/* Confetti on Apply */}
      <Confetti active={showConfetti} count={40} />

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
                  <p className="text-xs text-muted-foreground">Ads Optimizer</p>
                </div>
              </div>

              {/* Progress */}
              <div className="flex-1 max-w-md mx-8">
                <ProgressBar currentXP={currentXP} maxXP={maxXP} level={level} streak={streak} />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {pendingActions > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                    {pendingActions}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - 3 Column Layout */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Quick Stats */}
            <aside className="col-span-3">
              <QuickStats
                totalAds={mockAds.length}
                activeAds={mockAds.filter(a => a.status !== "critical").length}
                totalSpend={mockAds.reduce((sum, a) => sum + a.metrics.spend, 0)}
                overallRoas={mockAds.reduce((sum, a) => sum + a.metrics.roas, 0) / mockAds.length}
                pendingActions={pendingActions}
              />

              {/* Progress Summary */}
              <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/30">
                <h3 className="text-sm font-semibold text-foreground mb-3">Today&apos;s Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Actions completed</span>
                  <span className="font-bold text-foreground">{actionsCompleted}/{mockAds.length}</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(actionsCompleted / mockAds.length) * 100}%` }}
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
                      Ad {currentAdIndex + 1} of {mockAds.length}
                    </span>
                    <div className="flex items-center gap-2">
                      {mockAds.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentAdIndex
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
                    recommendation={currentAd.recommendation}
                    impact={currentAd.impact}
                    xpReward={currentAd.xpReward}
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
                    You&apos;ve reviewed all your ads for today.
                    <br />
                    Great work optimizing your campaigns!
                  </p>
                  <div className="inline-flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{actionsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Applied</div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{mockAds.length - actionsCompleted}</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
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
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Review each ad card with key metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Flip to see AI insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Apply or skip recommendations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Earn XP and level up!</span>
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

            <div className="flex items-center gap-2">
              <div className="px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500">
                🔥 {streak}
              </div>
              <div className="px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                Lv.{level}
              </div>
            </div>
          </div>

          {/* Mobile XP Bar */}
          <div className="px-4 pb-3">
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all"
                style={{ width: `${(currentXP / maxXP) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 space-y-4">
            {hasMoreAds ? (
              <>
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2">
                  {mockAds.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${idx === currentAdIndex
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
                  recommendation={currentAd.recommendation}
                  impact={currentAd.impact}
                  xpReward={currentAd.xpReward}
                  onApply={handleApply}
                  onSkip={handleSkip}
                />
              </>
            ) : (
              <div className="text-center py-12 px-6 rounded-3xl bg-green-500/10 border border-green-500/30">
                <span className="text-5xl mb-4 block">✓</span>
                <h2 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h2>
                <p className="text-sm text-muted-foreground">
                  Great work! Check back tomorrow.
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
                totalAds={mockAds.length}
                activeAds={mockAds.filter(a => a.status !== "critical").length}
                totalSpend={mockAds.reduce((sum, a) => sum + a.metrics.spend, 0)}
                overallRoas={mockAds.reduce((sum, a) => sum + a.metrics.roas, 0) / mockAds.length}
                pendingActions={pendingActions}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
