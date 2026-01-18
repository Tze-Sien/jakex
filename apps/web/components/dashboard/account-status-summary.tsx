"use client";

import { CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountStatusSummaryProps {
  statusCounts: {
    performing: number;
    normal: number;
    underperforming: number;
  };
}

export function AccountStatusSummary({ statusCounts }: AccountStatusSummaryProps) {
  const total =
    statusCounts.performing + statusCounts.normal + statusCounts.underperforming;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Performance Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 rounded-lg border border-green-200 bg-green-50">
            <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700">
              {statusCounts.performing}
            </div>
            <div className="text-sm text-green-600 mt-1">Performing</div>
          </div>

          <div className="flex flex-col items-center p-4 rounded-lg border border-gray-200 bg-gray-50">
            <MinusCircle className="h-8 w-8 text-gray-600 mb-2" />
            <div className="text-2xl font-bold text-gray-700">
              {statusCounts.normal}
            </div>
            <div className="text-sm text-gray-600 mt-1">Normal</div>
          </div>

          <div className="flex flex-col items-center p-4 rounded-lg border border-red-200 bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-700">
              {statusCounts.underperforming}
            </div>
            <div className="text-sm text-red-600 mt-1">Underperforming</div>
          </div>
        </div>

        {total === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm mt-4">
            No accounts selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
