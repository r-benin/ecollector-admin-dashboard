"use client"

import { DashboardAreaChart } from "@/components/dashboard-area-chart"

export default function Dashboard() {
  return (
    <div className="font-sans flex justify-center-safe items-start-safe max-h-screen flex-1">
      <div className="w-full m-5">
        <DashboardAreaChart />
      </div>
    </div>
  );
}
