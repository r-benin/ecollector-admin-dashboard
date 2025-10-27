'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar"

import { Droplet, History, LayoutDashboard, Ticket, Users, Wrench, Calendar, Gift, MapPin } from "lucide-react"

import Image from "next/image"
import { auth } from "@/app/firebase/config"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import RequestsNotifBadge from "./requests-notif-badge"

const sidebarItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Household Collections',
        url: '/dashboard/collections',
        icon: Droplet,
        requests: true,
    },
    {
        title: 'Collection Schedule',
        url: '/dashboard/schedule',
        icon: Calendar,
    },
    {
        title: 'Rewards',
        url: '/dashboard/rewards',
        icon: Gift
    },
    {
        title: 'Collection Points',
        url: '/dashboard/points',
        icon: MapPin
    },
    {
        title: 'Transactions',
        url: '/dashboard/transactions',
        icon: History,
    },
    {
        title: 'Vouchers',
        url: '/dashboard/vouchers',
        icon: Ticket
    },
    {
        title: 'Users',
        url: '/dashboard/users',
        icon: Users
    },
]

export function AppSidebar({requests, ...props} : { requests: number } & React.ComponentProps<typeof Sidebar> ) {    
    return(
        <Sidebar>
            <SidebarHeader className="flex justify-center items-center pt-5 gap-0">
                <Image src='/ecollector-admin-logo.png' alt='ecollector admin logo' width={180} height={1}></Image>
                <span className="font-semibold">Admin Dashboard</span>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            { sidebarItems.map((item) => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                                { item.requests && requests > 0 ? 
                                                    <span className="absolute right-3">
                                                        <RequestsNotifBadge requests={requests}/>
                                                    </span>
                                                    : null
                                                }    
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="pb-5 flex items-center">
                <Button className='w-[90%]' onClick={() => { signOut(auth).then(() => {console.log('Signed out!')})}}>Log out</Button>            
            </SidebarFooter>
        </Sidebar>
    )
}