'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'

type OrderData = {
  date: string
  total: number
}

const chartConfig = {
  total: {
    label: 'Sales',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md dark:bg-gray-800 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Sales: <span className="font-mono font-medium">€{payload[0].value?.toFixed(2)}</span>
      </p>
    </div>
  )
}

export function OrdersChart({ data }: { data: OrderData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-[var(--theme-elevation-500)]">
        No order data available
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
      <LineChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `€${value}`} />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Line
          dataKey="total"
          type="monotone"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
