'use client'

import { SidebarTrigger } from "@/components/ui/sidebar"

import React from 'react'
import { Separator } from "./ui/separator"

export default function DashboardHeader({ title } : {title: string} ) {
  return (
    <div className="w-full border-b h-10 flex items-center pl-3 gap-5">
        <SidebarTrigger />
        <div className="h-5">
            <Separator orientation="vertical"/>
        </div>
        <span className="font-semibold">{title}</span>
    </div>
  )
}
