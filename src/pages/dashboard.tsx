import { Title } from "@tremor/react";
import CategoriesPieChart, {
  CategoriesPieChartLoading,
} from "expensasaurus/components/dashboard/categorypiechart";
import LineChartTabs, {
  LineChartTabsLoading,
} from "expensasaurus/components/dashboard/linechart";
import DashboardStatistics, {
  DashboardStatisticsLoading,
} from "expensasaurus/components/dashboard/stats";
import Layout from "expensasaurus/components/layout/Layout";
import useDashboard from "expensasaurus/hooks/useDashboard";
import Head from "next/head";

const dashboard = () => {
  const {
    statistics,
    incomeThisMonth,
    expenseThisMonth,
    expensesAndPercentByCategoryThisMonth,
    isLoading,
  } = useDashboard();

  // const isLoading = true;
  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Monthly Performance Dashboard</title>
      </Head>
      <main className="max-w-[1200px] w-full mx-auto pt-10 px-4">
        <Title className="font-thin text-center mb-10">
          Monthly Performance Dashboard
        </Title>
        {isLoading ? (
          <DashboardStatisticsLoading />
        ) : (
          <DashboardStatistics stats={statistics} />
        )}

        <div className="flex flex-col md:flex-row justify-between gap-4 mt-8">
          <div className="w-full md:w-[66%]">
            {isLoading ? (
              <>
                <LineChartTabsLoading />
              </>
            ) : (
              <LineChartTabs />
            )}
          </div>
          <div className="w-full md:w-[32%]">
            {isLoading ? (
              <CategoriesPieChartLoading />
            ) : (
              <CategoriesPieChart
                incomeThisMonth={incomeThisMonth}
                expensesAndPercentByCategoryThisMonth={
                  expensesAndPercentByCategoryThisMonth
                }
                expenseThisMonth={expenseThisMonth}
              />
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default dashboard;
