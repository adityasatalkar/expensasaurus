import {
  Card,
  DateRangePicker,
  DateRangePickerValue,
  Flex,
  LineChart,
  Select,
  SelectItem,
  Text,
  Title,
} from "@tremor/react";
import { Models } from "appwrite";
import CategoryLoading from "expensasaurus/components/category/CategoryLoading";
import ExpenseByCategory from "expensasaurus/components/category/ExpenseByCategory";
import { LineChartTabsLoading } from "expensasaurus/components/dashboard/linechart";
import CategoryIcon from "expensasaurus/components/forms/CategorySelect";
import Layout from "expensasaurus/components/layout/Layout";
import useDates from "expensasaurus/hooks/useDates";
import { categories } from "expensasaurus/shared/constants/categories";
import { ENVS } from "expensasaurus/shared/constants/constants";
import { getAllLists } from "expensasaurus/shared/services/query";
import { useAuthStore } from "expensasaurus/shared/stores/useAuthStore";
import { Transaction } from "expensasaurus/shared/types/transaction";
import { calculateTotalExpensesByCategory } from "expensasaurus/shared/utils/calculation";
import { capitalize } from "expensasaurus/shared/utils/common";
import { formatCurrency } from "expensasaurus/shared/utils/currency";
import { getQueryForCategoryPage } from "expensasaurus/shared/utils/react-query";
import Head from "next/head";
import { Fragment, useState } from "react";
import { shallow } from "zustand/shallow";

const Categories = () => {
  const { endOfThisMonth, startOfThisMonth } = useDates();
  const [dates, setDates] = useState<DateRangePickerValue>({
    from: new Date(startOfThisMonth),
    to: new Date(endOfThisMonth),
  });

  const { user, userInfo } = useAuthStore(
    (state) => ({ user: state.user, userInfo: state.userInfo }),
    shallow
  ) as {
    user: Models.Session;
    userInfo: Models.User<Models.Preferences>;
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const { data: thisMonthExpenses, isLoading } = getAllLists<Transaction>(
    ["Expenses", "Stats this month", user?.userId, dates.from, dates.to],
    [
      ENVS.DB_ID,
      ENVS.COLLECTIONS.EXPENSES,
      getQueryForCategoryPage({
        dates,
        user,
        limit: 100,
      }),
    ],
    { enabled: !!user, keepPreviousData: true }
  );

  // const isLoading = true;
  // const isLoading = isCategoryLoading;

  const expensesByCategoriesThisMonth = calculateTotalExpensesByCategory(
    thisMonthExpenses?.documents || []
  );

  const dataFormatter = (number: number) => {
    return formatCurrency(userInfo?.prefs?.currency, number);
  };

  const txnsByCategory =
    thisMonthExpenses?.documents
      .filter((expense) => expense.category === selectedCategory)
      .map((expense) => {
        const date = new Date(expense.date);
        const dateResult =
          date.getDate() +
          "." +
          (date.getMonth() + 1) +
          "." +
          date.getFullYear();
        return {
          date: dateResult,
          amount: expense.amount,
        };
      }) || [];

  return (
    <Layout>
      <Head>
        <title>Expensasaurus - Analyze Spending by Category</title>
      </Head>
      <div className="mx-auto max-w-[1200px] px-4 w-full">
        {isLoading ? (
          <CategoryLoading />
        ) : (
          <>
            {" "}
            <Title className="py-10 text-center">Category</Title>
            <Flex className="flex-col md:flex-row items-baseline mb-10">
              <Text className="text-slate-600">Date Range</Text>
              <div className="mt-2 md:mt-0 md:ml-auto w-full md:w-auto">
                <DateRangePicker onValueChange={setDates} value={dates} />
              </div>
            </Flex>
            <Text className="text-slate-600 mb-4">Expenses per category</Text>
            <div className="grid xl:grid-cols-4  lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
              {Object.entries(expensesByCategoriesThisMonth).map(
                ([category, value], i) => {
                  const categoryInfo = categories.find(
                    (c) => c.category === capitalize(category)
                  );
                  const SelectedIcon = categoryInfo?.Icon;
                  if (!categoryInfo) return <Fragment key={i}></Fragment>;
                  return (
                    <ExpenseByCategory
                      key={i}
                      category={category}
                      categoryInfo={categoryInfo}
                      SelectedIcon={SelectedIcon}
                      value={value}
                      i={i}
                    />
                  );
                }
              )}
            </div>
            <div className="flex justify-between items-center my-10">
              <Text className="text-slate-600">Category wise transactions</Text>

              <Select
                className="w-[300px]"
                onValueChange={(value) => setSelectedCategory(value as string)}
                value={selectedCategory}
              >
                {Object.entries(expensesByCategoriesThisMonth).map(
                  ([category, value], i) => {
                    const categoryInfo = categories.find(
                      (c) => c.category === capitalize(category)
                    );
                    if (!categoryInfo) return <Fragment key={i}></Fragment>;
                    const SelectedIcon = () => (
                      <CategoryIcon category={categoryInfo} />
                    );
                    return (
                      <SelectItem
                        key={categoryInfo.id}
                        value={categoryInfo.key}
                        icon={SelectedIcon}
                      >
                        {categoryInfo.category}
                      </SelectItem>
                    );
                  }
                )}
              </Select>
            </div>
            {txnsByCategory.length !== 0 ? (
              <Card className="box-shadow-card">
                <LineChart
                  className="h-80 mt-8"
                  data={txnsByCategory}
                  index="date"
                  curveType="natural"
                  categories={["amount"]}
                  colors={["blue"]}
                  valueFormatter={dataFormatter}
                  showLegend={false}
                  yAxisWidth={60}
                  showXAxis
                />
              </Card>
            ) : (
              <>
                <LineChartTabsLoading animate={false} />
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
