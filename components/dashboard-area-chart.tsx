"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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
import { DashboardContext } from "@/app/dashboard/layout"

export const description = "An interactive area chart"

const chartData = [
  { date: "2025-04-01", collections: 222 },
  { date: "2025-04-02", collections: 97 },
  { date: "2025-04-03", collections: 167 },
  { date: "2025-04-04", collections: 242 },
  { date: "2025-04-05", collections: 373 },
  { date: "2025-04-06", collections: 301 },
  { date: "2025-04-07", collections: 245 },
  { date: "2025-04-08", collections: 409 },
  { date: "2025-04-09", collections: 59 },
  { date: "2025-04-10", collections: 261 },
  { date: "2025-04-11", collections: 327 },
  { date: "2025-04-12", collections: 292 },
  { date: "2025-04-13", collections: 342 },
  { date: "2025-04-14", collections: 137 },
  { date: "2025-04-15", collections: 120 },
  { date: "2025-04-16", collections: 138 },
  { date: "2025-04-17", collections: 446 },
  { date: "2025-04-18", collections: 364 },
  { date: "2025-04-19", collections: 243 },
  { date: "2025-04-20", collections: 89 },
  { date: "2025-04-21", collections: 137 },
  { date: "2025-04-22", collections: 224 },
  { date: "2025-04-23", collections: 138 },
  { date: "2025-04-24", collections: 387 },
  { date: "2025-04-25", collections: 215 },
  { date: "2025-04-26", collections: 75 },
  { date: "2025-04-27", collections: 383 },
  { date: "2025-04-28", collections: 122 },
  { date: "2025-04-29", collections: 315 },
  { date: "2025-04-30", collections: 454 },
  { date: "2025-05-01", collections: 165 },
  { date: "2025-05-02", collections: 293 },
  { date: "2025-05-03", collections: 247 },
  { date: "2025-05-04", collections: 385 },
  { date: "2025-05-05", collections: 481 },
  { date: "2025-05-06", collections: 498 },
  { date: "2025-05-07", collections: 388 },
  { date: "2025-05-08", collections: 149 },
  { date: "2025-05-09", collections: 227 },
  { date: "2025-05-10", collections: 293 },
  { date: "2025-05-11", collections: 335 },
  { date: "2025-05-12", collections: 197 },
  { date: "2025-05-13", collections: 197 },
  { date: "2025-05-14", collections: 448 },
  { date: "2025-05-15", collections: 473 },
  { date: "2025-05-16", collections: 338 },
  { date: "2025-05-17", collections: 499 },
  { date: "2025-05-18", collections: 315 },
  { date: "2025-05-19", collections: 235 },
  { date: "2025-05-20", collections: 177 },
  { date: "2025-05-21", collections: 82 },
  { date: "2025-05-22", collections: 81 },
  { date: "2025-05-23", collections: 252 },
  { date: "2025-05-24", collections: 294 },
  { date: "2025-05-25", collections: 201 },
  { date: "2025-05-26", collections: 213 },
  { date: "2025-05-27", collections: 420 },
  { date: "2025-05-28", collections: 233 },
  { date: "2025-05-29", collections: 78 },
  { date: "2025-05-30", collections: 340 },
  { date: "2025-05-31", collections: 178 },
  { date: "2025-08-01", collections: 178 },
  { date: "2025-08-02", collections: 470 },
  { date: "2025-08-03", collections: 103 },
  { date: "2025-08-04", collections: 439 },
  { date: "2025-08-05", collections: 88 },
  { date: "2025-08-06", collections: 294 },
  { date: "2025-08-07", collections: 323 },
  { date: "2025-08-08", collections: 385 },
  { date: "2025-08-09", collections: 438 },
  { date: "2025-08-10", collections: 155 },
  { date: "2025-08-11", collections: 92 },
  { date: "2025-08-12", collections: 492 },
  { date: "2025-08-13", collections: 81 },
  { date: "2025-08-14", collections: 426 },
  { date: "2025-08-15", collections: 307 },
  { date: "2025-08-16", collections: 371 },
  { date: "2025-08-17", collections: 475 },
  { date: "2025-08-18", collections: 107 },
  { date: "2025-08-19", collections: 341 },
  { date: "2025-08-20", collections: 408 },
  { date: "2025-08-21", collections: 169 },
  { date: "2025-08-22", collections: 317 },
  { date: "2025-08-23", collections: 480 },
  { date: "2025-08-24", collections: 132 },
  { date: "2025-08-25", collections: 141 },
  { date: "2025-08-26", collections: 434 },
  { date: "2025-08-27", collections: 448 },
  { date: "2025-08-28", collections: 149 },
  { date: "2025-08-29", collections: 103 },
  { date: "2025-08-30", collections: 446 },
];

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

        transactionsData.forEach((transaction) => {
            if (transaction.transactionType == 'Deposit') {

                if (!collectionObject[transaction.transactionDate]) {
                    collectionObject[transaction.transactionDate] = 1
                } else {
                    collectionObject[transaction.transactionDate] += 1
                }
            }
        })

        const collectionDataArray: collectionDataType[] = Object.entries(collectionObject).map(([date, collections]) => {
            const dateFormat = new Date(date)
            const formattedDate = `${dateFormat.getFullYear()}-${dateFormat.getMonth() + 1}-${dateFormat.getDate()}`
            return {date: formattedDate, collections: collections}
        })

        setCollectionData(collectionDataArray)

        console.log('WEW')
        console.log(collectionObject)
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
