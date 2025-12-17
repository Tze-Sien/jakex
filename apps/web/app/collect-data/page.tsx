"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Target,
  TrendingUp,
  Zap,
  Database,
  Sparkles,
} from "lucide-react";
import { AnimatedBackground } from "../login/components/AnimatedBackground";
import { ProgressStep } from "./components";

type StepStatus = "pending" | "loading" | "completed";

interface CollectionStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // milliseconds
}

const collectionSteps: CollectionStep[] = [
  {
    id: "connect",
    title: "Connecting to Meta",
    description: "Establishing secure connection to Meta Ads Manager",
    icon: <Zap className="w-6 h-6" />,
    duration: 1500,
  },
  {
    id: "accounts",
    title: "Fetching Ad Accounts",
    description: "Loading your selected ad account details",
    icon: <Target className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: "campaigns",
    title: "Collecting Campaigns",
    description: "Gathering campaign data and performance metrics",
    icon: <BarChart3 className="w-6 h-6" />,
    duration: 2500,
  },
  {
    id: "metrics",
    title: "Analyzing Metrics",
    description: "Processing ad performance and engagement data",
    icon: <TrendingUp className="w-6 h-6" />,
    duration: 2000,
  },
  {
    id: "insights",
    title: "Generating Insights",
    description: "Preparing AI-powered recommendations",
    icon: <Sparkles className="w-6 h-6" />,
    duration: 1500,
  },
];

export default function CollectDataPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>(
    collectionSteps.reduce(
      (acc, step, index) => ({
        ...acc,
        [step.id]: index === 0 ? "loading" : "pending",
      }),
      {}
    )
  );

  useEffect(() => {
    if (currentStepIndex >= collectionSteps.length) {
      // All steps completed, redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      return;
    }

    const currentStep = collectionSteps[currentStepIndex];

    // Complete current step and move to next
    const timer = setTimeout(() => {
      setStepStatuses((prev) => ({
        ...prev,
        [currentStep.id]: "completed",
        ...(currentStepIndex + 1 < collectionSteps.length
          ? { [collectionSteps[currentStepIndex + 1].id]: "loading" }
          : {}),
      }));
      setCurrentStepIndex((prev) => prev + 1);
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [currentStepIndex, router]);

  const progress = Math.round(
    ((currentStepIndex + 1) / collectionSteps.length) * 100
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden bg-background">
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            {/* Main Card */}
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-chart-2 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition duration-500" />

              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-10 shadow-2xl">
                {/* Header */}
                <div className="text-center space-y-4 mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-chart-2 shadow-lg shadow-primary/30">
                    <Database className="w-8 h-8 text-primary-foreground animate-pulse" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Collecting Your Data
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Please wait while we gather and analyze your ad performance
                    </p>
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-chart-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="space-y-6">
                  {collectionSteps.map((step) => (
                    <ProgressStep
                      key={step.id}
                      title={step.title}
                      description={step.description}
                      status={stepStatuses[step.id]}
                      icon={step.icon}
                    />
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        This process usually takes 10-15 seconds. Your data is
                        encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile App View */}
      <div className="lg:hidden min-h-screen bg-background flex flex-col">
        {/* Top App Bar */}
        <div className="safe-area-top bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-6 py-4 flex items-center justify-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-chart-2">
              <svg
                className="w-6 h-6 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-bold">JakeX</h1>
          </div>
        </div>

        {/* Content Area - Centered */}
        <div className="flex-1 flex items-center overflow-y-auto">
          <div className="w-full px-6 py-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-chart-2 shadow-lg shadow-primary/30">
                <Database className="w-8 h-8 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  Collecting Data
                </h2>
                <p className="text-muted-foreground mt-2 text-base">
                  Gathering your ad performance data
                </p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Progress
                </span>
                <span className="text-lg font-bold text-primary">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-chart-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-5">
              {collectionSteps.map((step) => (
                <ProgressStep
                  key={step.id}
                  title={step.title}
                  description={step.description}
                  status={stepStatuses[step.id]}
                  icon={step.icon}
                />
              ))}
            </div>

            {/* Footer Note */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-primary shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    This usually takes 10-15 seconds. Your data is encrypted and
                    secure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Safe Area */}
        <div className="safe-area-bottom bg-background/95 backdrop-blur-md border-t border-border/50">
          <div className="px-6 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Step 3 of 3 - Almost there!
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-progress-bar {
          width: 25%;
          animation: progress-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
