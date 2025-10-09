"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { Button } from "@/components/ui/button"
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
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
