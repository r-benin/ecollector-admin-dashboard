"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { DashboardContext } from "@/app/dashboard/layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

function formatTimestamp(timestamp: Date, format: 'noDay' | 'withDay') {
  const fullDate = timestamp.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Singapore'
  }).replace(',' , '')
  const weekday = timestamp.toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'Asia/Singapore'
  })
  return format === 'noDay' ? `${fullDate}` : `${fullDate} (${weekday})`
}

const chartConfig = {
  collections: {
    label: "Collections",
    color: "var(--chart-black)",
  },
} satisfies ChartConfig

type collectionDataType = {
    date: string,
    collections: number
}

export function DashboardAreaChart() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [collectionData, setCollectionData] = React.useState<collectionDataType[] | undefined>([])
  const { transactionsData } = React.useContext(DashboardContext)

  React.useEffect(() => {
    const generateCollectionData = () => {
        const collectionObject: Record<string, number> = {}
        const transactionsArray = transactionsData.sort((a, b) => {return a.transactionDate.toDate().getTime() - b.transactionDate.toDate().getTime()})
        transactionsArray.forEach((transaction) => {
          if (transaction.transactionType == 'Deposit') {
              const transactionDate = formatTimestamp(transaction.transactionDate.toDate(), 'noDay')
              if (!collectionObject[transactionDate]) {
                  collectionObject[transactionDate] = 1
              } else {
                  collectionObject[transactionDate] += 1
              }
            }
        })

        const collectionDataArray: collectionDataType[] = Object.entries(collectionObject).map(([date, collections]) => {
            const dateFormat = new Date(date)
            const formattedDate = `${dateFormat.getFullYear()}-${dateFormat.getMonth() + 1}-${dateFormat.getDate()}`
            return {date: formattedDate, collections: collections}
        })

        setCollectionData(collectionDataArray)

        collectionDataArray.map((item) => console.log(item))
    }

    generateCollectionData()
  }, [transactionsData])



  const filteredData = collectionData?.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Collections</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-collections)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-collections)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="collections"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-collections)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
