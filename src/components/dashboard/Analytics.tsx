import { useEffect, useState } from "react";
import { api } from "~/utils/api";

type AnalyticsData = {
  expenseCount: number;
  incomeCount: number;
};

type AnalyticsProps = {
  userId: string;
};

export default function Analytics({ userId }: AnalyticsProps) {
  const { data, isLoading, isError, error } = api.expense.getanalytics.useQuery({ userId });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (data) {
      setAnalytics(data);
    }
  }, [data]);

  if (isLoading) {
    return <p className="text-gray-500">Loading analytics...</p>;
  }

  if (isError) {
    return <p className="text-red-500">Error: {error.message}</p>;
  }

  return (
    <section className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics Overview</h2>
      {analytics ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Income:</span>
            <span className="font-semibold text-green-600">{analytics.expenseCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Total Expense:</span>
            <span className="font-semibold text-red-600">{analytics.incomeCount}</span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No analytics data available.</p>
      )}
    </section>
  );
}
