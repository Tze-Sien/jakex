"use client";

import { useState, useRef } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  ArrowUpRight,
  Clock,
  Shield,
  Sparkles,
  Download } from
"lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { AiAnalysis } from "@repo/database/schema";
import type { Recommendation } from "@/lib/llm/meta-ads/schemas";

interface AIAnalysisBoxProps {
  analysis: AiAnalysis | null;
  isLoading?: boolean;
}

export function AIAnalysisBox({ analysis, isLoading = false }: AIAnalysisBoxProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!analysis) return;

    // Temporarily expand the report if it's collapsed
    const wasExpanded = isExpanded;
    if (!wasExpanded) {
      setIsExpanded(true);
      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Trigger browser's native print dialog
    // User can save as PDF from there
    window.print();

    // Restore the original expanded state after a delay
    if (!wasExpanded) {
      setTimeout(() => {
        setIsExpanded(false);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-linear-to-br from-primary/5 via-blue-50/50 to-transparent dark:from-primary/10 dark:via-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">AI 表现分析</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Sparkles className="w-3 h-3" />
                正在分析您的广告表现...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>);

  }

  if (!analysis) {
    return null;
  }

  const recommendations = analysis.recommendations as Recommendation[];
  const keyFindings = analysis.keyFindings as string[];

  return (
    <Card ref={reportRef} className="border-primary/20 bg-linear-to-br from-primary/5 via-blue-50/50 to-transparent dark:from-primary/10 dark:via-blue-950/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-primary to-blue-600 shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-bold">AI 表现分析</CardTitle>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  已验证
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Sparkles className="w-3 h-3" />
                基于您的数据的 AI 洞察
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              className="h-8 gap-2">

              <Download className="w-4 h-4" />
              下载 PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0">

              {isExpanded ?
              <ChevronUp className="w-4 h-4" /> :

              <ChevronDown className="w-4 h-4" />
              }
            </Button>
          </div>
        </div>

      </CardHeader>

      {isExpanded &&
      <CardContent className="space-y-6">
          {/* JakeX Advice - First Section */}
          {analysis.practicalAdvice &&
        <Alert className="border-amber-300 dark:border-amber-700 bg-linear-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-amber-950/30">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 h-fit">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base mb-3 text-amber-900 dark:text-amber-100 flex items-center gap-2">
                    JakeX 建议
                    <Badge variant="outline" className="text-xs border-amber-600 text-amber-700 dark:text-amber-300">
                      可执行
                    </Badge>
                  </h4>
                  <AlertDescription>
                    <div className="text-sm text-amber-900/90 dark:text-amber-100/90 leading-relaxed prose prose-sm max-w-none prose-headings:text-amber-900 dark:prose-headings:text-amber-100 prose-strong:text-amber-900 dark:prose-strong:text-amber-100 prose-strong:font-bold prose-p:text-amber-900/80 dark:prose-p:text-amber-100/80">
                      <div dangerouslySetInnerHTML={{
                    __html: analysis.practicalAdvice.
                    replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').
                    replace(/\n\n/g, '</p><p>').
                    replace(/^/, '<p>').
                    replace(/$/, '</p>')
                  }} />
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
        }

          {/* Overall Assessment - Featured Section */}
          <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 via-white to-blue-50/50 dark:from-primary/20 dark:via-gray-900 dark:to-blue-950/30 p-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">总体评估</h3>
              </div>
              <p className="text-base leading-relaxed text-foreground/90">
                {analysis.overallAssessment}
              </p>
            </div>
          </div>

          {/* Two Column Layout: Key Findings & Performance */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Findings */}
            {keyFindings && keyFindings.length > 0 &&
          <Card className="border-yellow-200 dark:border-yellow-900 bg-linear-to-br from-yellow-50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-yellow-500/20">
                      <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    关键洞察
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {keyFindings.map((finding, index) =>
                <li key={index} className="flex gap-3 group">
                        <div className="mt-1">
                          <CheckCircle2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-sm leading-relaxed flex-1 text-foreground/80">
                          {finding}
                        </span>
                      </li>
                )}
                  </ul>
                </CardContent>
              </Card>
          }

            {/* Performance Analysis */}
            {analysis.performanceAnalysis &&
          <Card className="border-green-200 dark:border-green-900 bg-linear-to-br from-green-50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-green-500/20">
                      <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    性能分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                    {analysis.performanceAnalysis}
                  </p>
                </CardContent>
              </Card>
          }
          </div>

          {/* Recommendations with Tabs */}
          {recommendations && recommendations.length > 0 &&
        <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/20">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  战略建议
                  <Badge variant="secondary" className="ml-auto">
                    {recommendations.length} 项行动
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="high" className="gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      高
                    </TabsTrigger>
                    <TabsTrigger value="medium">中</TabsTrigger>
                    <TabsTrigger value="low">低</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-4 space-y-3">
                    {recommendations.map((rec, index) =>
                <RecommendationCard key={index} rec={rec} />
                )}
                  </TabsContent>

                  <TabsContent value="high" className="mt-4 space-y-3">
                    {recommendations.filter((r) => r.priority === "high").map((rec, index) =>
                <RecommendationCard key={index} rec={rec} />
                )}
                  </TabsContent>

                  <TabsContent value="medium" className="mt-4 space-y-3">
                    {recommendations.filter((r) => r.priority === "medium").map((rec, index) =>
                <RecommendationCard key={index} rec={rec} />
                )}
                  </TabsContent>

                  <TabsContent value="low" className="mt-4 space-y-3">
                    {recommendations.filter((r) => r.priority === "low").map((rec, index) =>
                <RecommendationCard key={index} rec={rec} />
                )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
        }

          <Separator className="my-6" />

          {/* Metadata Footer - Enhanced */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {analysis.latencyMs &&
            <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{(analysis.latencyMs / 1000).toFixed(1)}秒 处理时间</span>
                </div>
            }
            </div>
            {analysis.createdAt &&
          <div className="text-xs text-muted-foreground">
                {new Date(analysis.createdAt).toLocaleString()}
              </div>
          }
          </div>
        </CardContent>
      }
    </Card>);

}

// Recommendation Card Component
function RecommendationCard({ rec }: { rec: Recommendation }) {
  const priorityConfig = {
    high: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-900",
      badge: "destructive" as const
    },
    medium: {
      icon: TrendingUp,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-900",
      badge: "default" as const
    },
    low: {
      icon: CheckCircle2,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-900",
      badge: "secondary" as const
    }
  };

  const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.low;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.border} ${config.bg} hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h5 className="font-semibold text-sm">{rec.title}</h5>
            <Badge variant={config.badge} className="text-xs shrink-0">
              {rec.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {rec.description}
          </p>
          {rec.actionableSteps && rec.actionableSteps.length > 0 && (
            <div className="space-y-2 mb-3">
              <p className="text-xs font-medium">行动步骤：</p>
              <ul className="space-y-1.5">
                {rec.actionableSteps.map((step: string, stepIndex: number) => (
                  <li
                    key={stepIndex}
                    className="text-xs text-muted-foreground flex gap-2 items-start"
                  >
                    <ArrowUpRight className={`w-3 h-3 mt-0.5 shrink-0 ${config.color}`} />
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {rec.expectedImpact && (
            <div className="flex items-start gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-900 dark:text-green-100">预期影响</p>
                <p className="text-xs text-green-700 dark:text-green-300">{rec.expectedImpact}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}