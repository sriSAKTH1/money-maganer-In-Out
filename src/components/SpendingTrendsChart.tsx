import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Calendar } from 'lucide-react';
import { Transaction, UserSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SpendingTrendsChartProps {
  transactions: Transaction[];
  settings: UserSettings;
}

export interface MonthlyTrendPoint {
  monthKey: string;
  monthName: string;
  fullMonth: string;
  year: number;
  spending: number;
  income: number;
  net: number;
  txCount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: MonthlyTrendPoint;
    color: string;
    name: string;
  }>;
  label?: string;
  settings: UserSettings;
}

const CustomTrendTooltip: React.FC<CustomTooltipProps> = ({ active, payload, settings }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#FAF8F5]/95 dark:bg-[#1E2024]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#D6CEC3]/80 dark:border-white/10 shadow-xl text-xs space-y-2 min-w-[170px]">
        <div className="flex items-center justify-between border-b border-[#D6CEC3]/40 dark:border-white/10 pb-1.5">
          <span className="font-bold text-[#2D2926] dark:text-[#E8E4DC]">{data.fullMonth}</span>
          <span className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
            {data.txCount} {data.txCount === 1 ? 'expense' : 'expenses'}
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between space-x-2">
            <span className="flex items-center space-x-1.5 text-[#C28B70] dark:text-[#E0A890] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#C28B70]" />
              <span>Spending:</span>
            </span>
            <span className="font-serif-bento font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              {formatCurrency(data.spending, settings.currency_symbol, settings.hide_balance)}
            </span>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <span className="flex items-center space-x-1.5 text-[#059669] dark:text-[#34D399] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
              <span>Income:</span>
            </span>
            <span className="font-serif-bento font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              {formatCurrency(data.income, settings.currency_symbol, settings.hide_balance)}
            </span>
          </div>

          <div className="flex items-center justify-between space-x-2 border-t border-[#D6CEC3]/30 dark:border-white/5 pt-1 text-[11px]">
            <span className="text-[#2D2926]/70 dark:text-[#E8E4DC]/70 font-medium">Net Savings:</span>
            <span
              className={`font-serif-bento font-bold ${
                data.net >= 0
                  ? 'text-[#059669] dark:text-[#34D399]'
                  : 'text-[#C28B70] dark:text-[#E0A890]'
              }`}
            >
              {data.net >= 0 ? '+' : ''}
              {formatCurrency(data.net, settings.currency_symbol, settings.hide_balance)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({
  transactions,
  settings,
}) => {
  const [chartMode, setChartMode] = useState<'spending' | 'comparison'>('spending');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  // Compute 6-Month Rolling Trend Data
  const trendData: MonthlyTrendPoint[] = React.useMemo(() => {
    const points: MonthlyTrendPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNumber = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${monthNumber}`;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const fullMonth = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const monthTxs = transactions.filter((tx) => tx.date && tx.date.startsWith(monthKey));
      const spending = monthTxs
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const income = monthTxs
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const txCount = monthTxs.filter((tx) => tx.type === 'expense').length;

      points.push({
        monthKey,
        monthName,
        fullMonth,
        year,
        spending,
        income,
        net: income - spending,
        txCount,
      });
    }

    return points;
  }, [transactions]);

  // Aggregate Metrics
  const total6MonthSpending = trendData.reduce((sum, p) => sum + p.spending, 0);
  const avgMonthlySpending = total6MonthSpending > 0 ? total6MonthSpending / 6 : 0;
  const peakSpendingMonth = trendData.reduce(
    (max, curr) => (curr.spending > max.spending ? curr : max),
    trendData[0]
  );

  // Month-over-Month Delta (Current month vs Previous month)
  const currentMonthData = trendData[trendData.length - 1];
  const previousMonthData = trendData[trendData.length - 2];
  const prevSpend = previousMonthData?.spending || 0;
  const currSpend = currentMonthData?.spending || 0;
  const momPctChange =
    prevSpend > 0
      ? ((currSpend - prevSpend) / prevSpend) * 100
      : currSpend > 0
      ? 100
      : 0;

  const maxChartSpend = Math.max(...trendData.map((d) => Math.max(d.spending, chartMode === 'comparison' ? d.income : 0)), 100);

  return (
    <div className="bento-card p-4 sm:p-5 space-y-4 bg-[#F9F7F2] dark:bg-[#1E2024] border border-[#D6CEC3]/60 dark:border-white/5 shadow-sm">
      {/* Header with Title & View Mode Pill Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#D6CEC3]/30 dark:border-white/5 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#C28B70]/15 dark:bg-[#C28B70]/25 text-[#C28B70] dark:text-[#E0A890]">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              6-Month Spending Trends
            </h3>
          </div>
          <p className="text-[11px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 pl-8">
            Monthly expenditure momentum & historical pattern
          </p>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center bg-[#D6CEC3]/30 dark:bg-[#151618] p-1 rounded-full border border-[#D6CEC3]/50 dark:border-white/5 self-start sm:self-auto text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setChartMode('spending')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              chartMode === 'spending'
                ? 'bg-[#C28B70] text-white shadow-2xs'
                : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
            }`}
          >
            Spending Trend
          </button>
          <button
            type="button"
            onClick={() => setChartMode('comparison')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              chartMode === 'comparison'
                ? 'bg-[#5A5A40] text-white shadow-2xs'
                : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
            }`}
          >
            Income vs Spending
          </button>
        </div>
      </div>

      {/* Summary KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#D6CEC3]/40 dark:border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D2926]/50 dark:text-[#E8E4DC]/50">
            6M Total Spend
          </p>
          <p className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC] mt-0.5">
            {formatCurrency(total6MonthSpending, settings.currency_symbol, settings.hide_balance)}
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#D6CEC3]/40 dark:border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D2926]/50 dark:text-[#E8E4DC]/50">
            Monthly Avg
          </p>
          <p className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#A1A892] mt-0.5">
            {formatCurrency(avgMonthlySpending, settings.currency_symbol, settings.hide_balance)}
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#D6CEC3]/40 dark:border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D2926]/50 dark:text-[#E8E4DC]/50 truncate">
            Peak Month ({peakSpendingMonth?.monthName})
          </p>
          <p className="font-serif-bento text-sm font-bold text-[#C28B70] dark:text-[#E0A890] mt-0.5 truncate">
            {formatCurrency(peakSpendingMonth?.spending || 0, settings.currency_symbol, settings.hide_balance)}
          </p>
        </div>

        <div className="p-2.5 rounded-2xl bg-white/70 dark:bg-white/5 border border-[#D6CEC3]/40 dark:border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#2D2926]/50 dark:text-[#E8E4DC]/50">
            MoM Trend
          </p>
          <div className="flex items-center space-x-1 mt-0.5">
            {momPctChange > 0 ? (
              <span className="flex items-center text-xs font-bold text-[#C28B70] dark:text-[#E0A890]">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                +{Math.abs(momPctChange).toFixed(1)}%
              </span>
            ) : momPctChange < 0 ? (
              <span className="flex items-center text-xs font-bold text-[#059669] dark:text-[#34D399]">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                -{Math.abs(momPctChange).toFixed(1)}%
              </span>
            ) : (
              <span className="text-xs font-bold text-[#2D2926]/60 dark:text-[#E8E4DC]/60">0.0%</span>
            )}
            <span className="text-[9px] text-[#2D2926]/40 dark:text-[#E8E4DC]/40">vs last mo</span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="pt-2">
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 14, right: 14, left: -14, bottom: 2 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-[#D6CEC3]/30 dark:text-white/5"
              />
              <XAxis
                dataKey="monthName"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }}
                className="text-[#2D2926]/70 dark:text-[#E8E4DC]/70"
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#2D2926]/50 dark:text-[#E8E4DC]/50"
                tickFormatter={(val) =>
                  `${settings.currency_symbol}${
                    val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                  }`
                }
              />
              <Tooltip content={<CustomTrendTooltip settings={settings} />} />
              
              {/* Average Reference Line */}
              {avgMonthlySpending > 0 && chartMode === 'spending' && (
                <ReferenceLine
                  y={avgMonthlySpending}
                  stroke="#A1A892"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '6M Avg',
                    position: 'insideTopRight',
                    fill: '#A1A892',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              {/* Spending Trend Line */}
              <Line
                type="monotone"
                dataKey="spending"
                name="Spending"
                stroke="#C28B70"
                strokeWidth={3.5}
                dot={{
                  r: 4.5,
                  fill: '#FAF8F5',
                  stroke: '#C28B70',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: '#C28B70',
                  stroke: '#FFFFFF',
                  strokeWidth: 2.5,
                }}
                animationDuration={800}
              />

              {/* Income Line (when comparison is enabled) */}
              {chartMode === 'comparison' && (
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#FAF8F5',
                    stroke: '#059669',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#059669',
                    stroke: '#FFFFFF',
                    strokeWidth: 2.5,
                  }}
                  animationDuration={800}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-5 pt-2 text-[11px] font-semibold text-[#2D2926]/70 dark:text-[#E8E4DC]/70">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C28B70]" />
            <span>Monthly Spending</span>
          </div>
          {chartMode === 'comparison' && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#059669]" />
              <span>Monthly Income</span>
            </div>
          )}
          {chartMode === 'spending' && avgMonthlySpending > 0 && (
            <div className="flex items-center space-x-1.5 text-[#A1A892]">
              <span className="w-3.5 h-0.5 border-t-2 border-dashed border-[#A1A892]" />
              <span>Average Baseline</span>
            </div>
          )}
        </div>
      </div>

      {/* 6-Month Timeline Progress Ribbon */}
      <div className="pt-2 border-t border-[#D6CEC3]/30 dark:border-white/5 space-y-2">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#2D2926]/50 dark:text-[#E8E4DC]/50">
          <span>6-Month Progression Breakdown</span>
          <span>Share of 6M Total</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {trendData.map((pt) => {
            const isSelected = selectedMonthKey === pt.monthKey;
            const spendShare = total6MonthSpending > 0 ? (pt.spending / total6MonthSpending) * 100 : 0;
            const isHighest = pt.monthKey === peakSpendingMonth.monthKey;

            return (
              <div
                key={pt.monthKey}
                onClick={() => setSelectedMonthKey(isSelected ? null : pt.monthKey)}
                className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-white dark:bg-white/10 ring-2 ring-[#C28B70] border-transparent shadow-xs'
                    : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border-[#D6CEC3]/30 dark:border-white/5'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-[11px] font-bold text-[#2D2926] dark:text-[#E8E4DC]">
                    {pt.monthName}
                  </span>
                  {isHighest && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C28B70]" title="Highest spend month" />
                  )}
                </div>

                <p className="font-serif-bento text-xs font-bold text-[#C28B70] dark:text-[#E0A890] mt-0.5">
                  {formatCurrency(pt.spending, settings.currency_symbol, settings.hide_balance)}
                </p>

                {/* Micro mini bar */}
                <div className="w-full bg-[#D6CEC3]/30 dark:bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, maxChartSpend > 0 ? (pt.spending / maxChartSpend) * 100 : 0)}%`,
                      backgroundColor: isHighest ? '#C28B70' : '#A1A892',
                    }}
                  />
                </div>

                <span className="text-[9px] font-medium text-[#2D2926]/50 dark:text-[#E8E4DC]/50 mt-1 block">
                  {spendShare.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
