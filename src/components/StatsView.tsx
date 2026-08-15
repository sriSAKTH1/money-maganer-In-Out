import React, { useState } from 'react';
import { Transaction, Category, UserSettings } from '../types';
import { calculateCategoryStats, getTodayISOString } from '../utils/formatters';
import { SpendingTrendsChart } from './SpendingTrendsChart';

interface StatsViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
}

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

// Emoji mapping for common financial categories
const CATEGORY_EMOJI_MAP: Record<string, string> = {
  gift: '🎁',
  'gift & bonus': '🎁',
  gifts: '🎁',
  bonus: '🎁',
  apparel: '🧥',
  clothing: '🧥',
  clothes: '🧥',
  shopping: '🛍️',
  food: '🍜',
  'food & dining': '🍜',
  dining: '🍜',
  restaurant: '🍽️',
  groceries: '🛒',
  grocery: '🛒',
  transport: '🚖',
  'travel & transport': '🚖',
  travel: '🚖',
  fuel: '⛽',
  petrol: '⛽',
  car: '🚗',
  taxi: '🚖',
  bills: '🧾',
  'bills & utilities': '🧾',
  utilities: '⚡',
  entertainment: '🎬',
  movies: '🍿',
  salary: '💼',
  income: '💰',
  freelance: '💻',
  business: '🏢',
  investment: '📈',
  investments: '📈',
  health: '🩺',
  medical: '💊',
  education: '🎓',
  rent: '🏠',
  home: '🏠',
  coffee: '☕',
  other: '🪙',
  'other income': '🪙',
  'other expense': '📦',
};

// Curated high-contrast, beautiful palette for distinct categories
const VIBRANT_DISTINCT_PALETTE = [
  '#FF5964', // Vibrant Coral Red (Gift / Primary)
  '#FF9248', // Warm Peach / Orange (Apparel)
  '#FDCB58', // Warm Golden Yellow (Food / Dining)
  '#38BDF8', // Sky Blue (Transport)
  '#A78BFA', // Soft Lilac / Purple (Bills & Utilities)
  '#34D399', // Emerald Mint (Shopping & Supplies)
  '#F472B6', // Bright Rose Pink (Entertainment)
  '#2DD4BF', // Turquoise Teal (Health & Wellness)
  '#818CF8', // Indigo Violet (Education)
  '#FB7185', // Strawberry Coral (Miscellaneous)
  '#4ADE80', // Lime / Fresh Green (Investments & Savings)
  '#E879F9', // Orchid Fuchsia (Subscriptions)
];

export const StatsView: React.FC<StatsViewProps> = ({
  transactions,
  categories,
  settings,
}) => {
  const [statsType, setStatsType] = useState<'expense' | 'income'>('expense');
  const [period, setPeriod] = useState<StatsPeriod>('monthly');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<string | null>(null);

  const today = getTodayISOString();

  // Date range filters
  let startDate: string | undefined;
  if (period === 'daily') {
    startDate = today;
  } else if (period === 'weekly') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    startDate = d.toISOString().substring(0, 10);
  } else if (period === 'monthly') {
    startDate = today.substring(0, 7) + '-01';
  } else if (period === 'yearly') {
    startDate = today.substring(0, 4) + '-01-01';
  }

  const statsData = calculateCategoryStats(statsType, transactions, categories, startDate);

  const formatAmount = (amount: number) => {
    if (settings.hide_balance) return `${settings.currency_symbol} xxx`;
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${settings.currency_symbol} ${formatted}`;
  };

  // Helper to get matching emoji
  const getCategoryEmoji = (category: Category) => {
    const lowerName = category.name.toLowerCase().trim();
    if (CATEGORY_EMOJI_MAP[lowerName]) return CATEGORY_EMOJI_MAP[lowerName];
    for (const [key, emoji] of Object.entries(CATEGORY_EMOJI_MAP)) {
      if (lowerName.includes(key) || key.includes(lowerName)) return emoji;
    }
    return '🏷️';
  };

  // Prepare items with distinct colors
  const itemsWithColors = statsData.items.map((item, idx) => {
    const assignedColor = VIBRANT_DISTINCT_PALETTE[idx % VIBRANT_DISTINCT_PALETTE.length];
    return {
      ...item,
      sliceColor: item.category.color && item.category.color !== '#5A5A40' && !item.category.color.startsWith('#5A')
        ? item.category.color
        : assignedColor,
      emoji: getCategoryEmoji(item.category),
    };
  });

  // Calculate angles for pie chart slices & callout leader lines
  const total = statsData.total;
  let accumulatedAngle = -90; // Start at 12 o'clock

  interface SliceGeometry {
    item: (typeof itemsWithColors)[0];
    startAngle: number;
    endAngle: number;
    midAngle: number;
    path: string;
    percent: number;
    color: string;
    isSingleFull: boolean;
  }

  const cx = 175;
  const cy = 160;
  const r = 78; // outer radius of the pie

  const slices: SliceGeometry[] = itemsWithColors.map((item) => {
    const percent = total > 0 ? item.amount / total : 0;
    const angleSpan = percent * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    accumulatedAngle = endAngle;

    if (percent >= 0.999) {
      return {
        item,
        startAngle,
        endAngle,
        midAngle: 0,
        path: '',
        percent: 1,
        color: item.sliceColor,
        isSingleFull: true,
      };
    }

    const radStart = (startAngle * Math.PI) / 180;
    const radEnd = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(radStart);
    const y1 = cy + r * Math.sin(radStart);
    const x2 = cx + r * Math.cos(radEnd);
    const y2 = cy + r * Math.sin(radEnd);

    const largeArcFlag = angleSpan > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      item,
      startAngle,
      endAngle,
      midAngle,
      path,
      percent,
      color: item.sliceColor,
      isSingleFull: false,
    };
  });

  // Calculate leader line & label placement with collision avoidance for close angles
  interface CalloutLayout {
    slice: SliceGeometry;
    startX: number;
    startY: number;
    elbowX: number;
    elbowY: number;
    endX: number;
    endY: number;
    isRight: boolean;
    textAnchor: 'start' | 'end';
    labelX: number;
    labelY: number;
  }

  const callouts: CalloutLayout[] = slices.map((slice, idx) => {
    const radMid = (slice.midAngle * Math.PI) / 180;
    const isRight = Math.cos(radMid) >= -0.05;

    // Start on pie circumference
    const startX = cx + r * Math.cos(radMid);
    const startY = cy + r * Math.sin(radMid);

    // Stagger elbow radii slightly for adjacent slices to prevent line overlap
    const elbowRadius = r + 24 + (idx % 2 === 1 ? 14 : 0);
    const rawElbowX = cx + elbowRadius * Math.cos(radMid);
    const rawElbowY = cy + elbowRadius * Math.sin(radMid);

    // Elbow clamp to stay cleanly within the SVG viewport
    const elbowX = Math.max(35, Math.min(315, rawElbowX));
    const elbowY = Math.max(28, Math.min(292, rawElbowY));

    // Horizontal leader extension
    const horizontalLength = 16;
    const endX = isRight ? elbowX + horizontalLength : elbowX - horizontalLength;
    const endY = elbowY;

    const textAnchor = isRight ? 'start' : 'end';
    const labelX = isRight ? endX + 4 : endX - 4;
    const labelY = endY;

    return {
      slice,
      startX,
      startY,
      elbowX,
      elbowY,
      endX,
      endY,
      isRight,
      textAnchor,
      labelX,
      labelY,
    };
  });

  // Current highlighted item ID (hover takes precedence over click selection)
  const highlightedId = hoveredCategoryId || activeCategoryId;

  return (
    <div className="space-y-4 pb-2">
      {/* Top Segment Controls */}
      <div className="bento-card p-4 space-y-3">
        {/* Income / Expense Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#D6CEC3]/30 dark:bg-[#1C1B18] rounded-full border border-[#D6CEC3]/50 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              setStatsType('expense');
              setActiveCategoryId(null);
              setHoveredCategoryId(null);
            }}
            className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statsType === 'expense'
                ? 'bg-[#C28B70] text-white shadow-xs'
                : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
            }`}
          >
            Expense Analytics
          </button>
          <button
            type="button"
            onClick={() => {
              setStatsType('income');
              setActiveCategoryId(null);
              setHoveredCategoryId(null);
            }}
            className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statsType === 'income'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
            }`}
          >
            Income Analytics
          </button>
        </div>

        {/* Period Selector Pills */}
        <div className="flex bg-[#F9F7F2] dark:bg-[#1C1B18] p-1 rounded-full border border-[#D6CEC3]/40 dark:border-white/5 text-[11px] font-semibold">
          {(['daily', 'weekly', 'monthly', 'yearly', 'all'] as StatsPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPeriod(p);
                setActiveCategoryId(null);
                setHoveredCategoryId(null);
              }}
              className={`flex-1 py-1.5 capitalize rounded-full transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#5A5A40] text-white font-bold shadow-2xs'
                  : 'text-[#2D2926]/60 dark:text-[#E8E4DC]/60 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Canvas Card */}
      <div className="bento-card p-4 sm:p-5 space-y-3 bg-[#F9F7F2] dark:bg-[#1E2024] border border-[#D6CEC3]/60 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center border-b border-[#D6CEC3]/30 dark:border-white/5 pb-2.5">
          <div>
            <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              {statsType === 'expense' ? 'Expense' : 'Income'} Breakdown
            </h3>
            <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
              Hover over pie slices or list rows to highlight details
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider font-bold text-[#2D2926]/50 dark:text-[#E8E4DC]/50 block">
              Total {statsType}
            </span>
            <p className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              {formatAmount(statsData.total)}
            </p>
          </div>
        </div>

        {statsData.items.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#2D2926]/60 dark:text-[#E8E4DC]/60 italic">
            No {statsType} transactions recorded for this period.
          </div>
        ) : (
          <div className="w-full flex items-center justify-center py-2 select-none">
            <svg
              viewBox="0 0 350 320"
              className="w-full max-w-[380px] h-auto overflow-visible"
              aria-label="Category Distribution Pie Chart"
            >
              <defs>
                <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
                </filter>
                <filter id="glowShadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Pie Slices with Dynamic Radial Pop-out on Hover */}
              <g>
                {slices.map((slice) => {
                  const isTarget = highlightedId === slice.item.category.id;
                  const isDimmed = highlightedId !== null && !isTarget;

                  // Pop out slice radially on hover
                  const radMid = (slice.midAngle * Math.PI) / 180;
                  const popDistance = isTarget ? 7 : 0;
                  const popX = Math.cos(radMid) * popDistance;
                  const popY = Math.sin(radMid) * popDistance;

                  if (slice.isSingleFull) {
                    return (
                      <circle
                        key={slice.item.category.id}
                        cx={cx}
                        cy={cy}
                        r={isTarget ? r + 3 : r}
                        fill={slice.color}
                        className="cursor-pointer transition-all duration-300 ease-out"
                        stroke={isTarget ? '#FFFFFF' : '#1E2024'}
                        strokeWidth={isTarget ? '3' : '1.5'}
                        filter={isTarget ? 'url(#glowShadow)' : 'url(#subtleShadow)'}
                        onMouseEnter={() => setHoveredCategoryId(slice.item.category.id)}
                        onMouseLeave={() => setHoveredCategoryId(null)}
                        onClick={() =>
                          setActiveCategoryId(
                            activeCategoryId === slice.item.category.id ? null : slice.item.category.id
                          )
                        }
                      />
                    );
                  }

                  return (
                    <g
                      key={slice.item.category.id}
                      transform={`translate(${popX}, ${popY})`}
                      className="transition-transform duration-300 ease-out"
                    >
                      <path
                        d={slice.path}
                        fill={slice.color}
                        stroke={isTarget ? '#FFFFFF' : '#1E2024'}
                        strokeWidth={isTarget ? '3' : '1.5'}
                        opacity={isDimmed ? 0.35 : 1}
                        filter={isTarget ? 'url(#glowShadow)' : 'url(#subtleShadow)'}
                        className="cursor-pointer transition-all duration-300 hover:brightness-110"
                        onMouseEnter={() => setHoveredCategoryId(slice.item.category.id)}
                        onMouseLeave={() => setHoveredCategoryId(null)}
                        onClick={() =>
                          setActiveCategoryId(
                            activeCategoryId === slice.item.category.id ? null : slice.item.category.id
                          )
                        }
                      />
                    </g>
                  );
                })}
              </g>

              {/* Leader Lines & Callout Labels (Linked with Hover Highlight) */}
              <g>
                {callouts.map((callout) => {
                  const isTarget = highlightedId === callout.slice.item.category.id;
                  const isDimmed = highlightedId !== null && !isTarget;

                  // Leader line path: Start -> Elbow -> End
                  const leaderPath = `M ${callout.startX} ${callout.startY} L ${callout.elbowX} ${callout.elbowY} L ${callout.endX} ${callout.endY}`;

                  return (
                    <g
                      key={`callout-${callout.slice.item.category.id}`}
                      opacity={isDimmed ? 0.2 : 1}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredCategoryId(callout.slice.item.category.id)}
                      onMouseLeave={() => setHoveredCategoryId(null)}
                      onClick={() =>
                        setActiveCategoryId(
                          activeCategoryId === callout.slice.item.category.id
                            ? null
                            : callout.slice.item.category.id
                        )
                      }
                    >
                      {/* Highlight backdrop pill for active callout */}
                      {isTarget && (
                        <rect
                          x={callout.isRight ? callout.labelX - 4 : callout.labelX - 90}
                          y={callout.labelY - 14}
                          width="94"
                          height="28"
                          rx="8"
                          fill={callout.slice.color}
                          fillOpacity="0.18"
                          stroke={callout.slice.color}
                          strokeWidth="1"
                        />
                      )}

                      {/* Leader connector line */}
                      <path
                        d={leaderPath}
                        fill="none"
                        stroke={callout.slice.color}
                        strokeWidth={isTarget ? '2.5' : '1.75'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Endpoint Indicator Dot */}
                      <circle
                        cx={callout.endX}
                        cy={callout.endY}
                        r={isTarget ? 3.5 : 2}
                        fill={callout.slice.color}
                      />

                      {/* Line 1: Emoji + Category Name */}
                      <text
                        x={callout.labelX}
                        y={callout.labelY - 5}
                        textAnchor={callout.textAnchor}
                        fill="currentColor"
                        className={`text-[11px] select-none transition-all ${
                          isTarget
                            ? 'font-extrabold text-[#111111] dark:text-[#FFFFFF]'
                            : 'font-bold text-[#2D2926] dark:text-[#E8E4DC]'
                        }`}
                      >
                        {callout.slice.item.emoji} {callout.slice.item.category.name}
                      </text>

                      {/* Line 2: Percentage */}
                      <text
                        x={callout.labelX}
                        y={callout.labelY + 9}
                        textAnchor={callout.textAnchor}
                        fill="currentColor"
                        className={`text-[10px] select-none transition-all ${
                          isTarget
                            ? 'font-bold text-[#111111] dark:text-[#FFFFFF]'
                            : 'font-semibold text-[#2D2926]/75 dark:text-[#E8E4DC]/75'
                        }`}
                      >
                        {(callout.slice.percent * 100).toFixed(1)} %
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        )}
      </div>

      {/* Breakdown List with Dynamic Hover & Highlight Sync */}
      <div className="bento-card p-4 sm:p-5 space-y-3 bg-[#F9F7F2] dark:bg-[#1E2024] border border-[#D6CEC3]/60 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center border-b border-[#D6CEC3]/30 dark:border-white/5 pb-2">
          <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
            Detailed Summary
          </h3>
          <span className="text-[10px] font-bold text-[#2D2926]/50 dark:text-[#E8E4DC]/50 uppercase">
            {statsData.items.length} {statsData.items.length === 1 ? 'Category' : 'Categories'}
          </span>
        </div>

        <div className="divide-y divide-[#D6CEC3]/30 dark:divide-white/5">
          {itemsWithColors.map((item) => {
            const isTarget = highlightedId === item.category.id;
            const isDimmed = highlightedId !== null && !isTarget;
            const percentageInt = Math.round(item.percentage);

            return (
              <div
                key={item.category.id}
                onMouseEnter={() => setHoveredCategoryId(item.category.id)}
                onMouseLeave={() => setHoveredCategoryId(null)}
                onClick={() =>
                  setActiveCategoryId(
                    activeCategoryId === item.category.id ? null : item.category.id
                  )
                }
                className={`py-3.5 px-3 flex items-center justify-between cursor-pointer rounded-2xl transition-all duration-200 ${
                  isTarget
                    ? 'bg-black/5 dark:bg-white/10 ring-1.5 shadow-sm scale-[1.01]'
                    : isDimmed
                    ? 'opacity-40 hover:opacity-100'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  borderColor: isTarget ? item.sliceColor : undefined,
                }}
              >
                {/* Left: Percentage Badge matching Category Color */}
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-12 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-[#1C1B18] transition-all duration-200 ${
                      isTarget ? 'scale-110 shadow-md ring-2 ring-white/80' : 'shadow-2xs'
                    }`}
                    style={{ backgroundColor: item.sliceColor }}
                  >
                    {percentageInt}%
                  </div>

                  {/* Middle: Category Icon / Emoji + Category Name */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-base leading-none transition-transform duration-200 ${isTarget ? 'scale-125' : ''}`}>
                      {item.emoji}
                    </span>
                    <span
                      className={`text-xs transition-colors duration-150 ${
                        isTarget
                          ? 'font-extrabold text-[#111111] dark:text-[#FFFFFF]'
                          : 'font-bold text-[#2D2926] dark:text-[#E8E4DC]'
                      }`}
                    >
                      {item.category.name}
                    </span>
                  </div>
                </div>

                {/* Right: Currency Amount formatted cleanly */}
                <div className="text-right">
                  <span
                    className={`font-serif-bento text-xs sm:text-sm tracking-tight transition-all duration-150 ${
                      isTarget
                        ? 'font-extrabold text-[#111111] dark:text-[#FFFFFF] scale-105 inline-block'
                        : 'font-bold text-[#2D2926] dark:text-[#E8E4DC]'
                    }`}
                  >
                    {formatAmount(item.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6-Month Spending Trends Line Chart (Recharts Integration) */}
      <SpendingTrendsChart transactions={transactions} settings={settings} />
    </div>
  );
};
