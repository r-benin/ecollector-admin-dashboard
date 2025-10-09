'use client'

import React, { useEffect, useState, useContext } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTable from '@/components/data-table'
import { collectionType } from '@/components/table-columns'


import { Button, } from '@/components/ui/button'
import RequestsNotifBadge from '@/components/requests-notif-badge'

import { DashboardContext } from '../layout'
import RequestControls from '@/components/requests-controls'
import OngoingControls from '@/components/ongoing-controls'

import {Marker} from '@vis.gl/react-google-maps';
import { usersColumns } from '@/components/table-columns'



export default function Users() {

  // useContext for Dashboard Context
  const { isLoading, usersData } = useContext(DashboardContext)

  //

  // Tab state
  const [tab, setTab] = useState('pending')

  // Control buttons active state
  const [buttonActive, setButtonActive] = useState(false)

  // State for toggle map button
  const [mapShown, setMapShown] = useState(false)

  // useState to store the ids of the selected rows
  const [selectedRows, setSelectedRows] = useState({})


  return (
    <div className="font-sans flex justify-start-safe items-start-safe max-h-screen flex-1 flex-col p-3 pb-0">
      <DataTable
        columns={usersColumns}
        data={!isLoading ? usersData : []}
        activateButtons={setButtonActive}
        setSelectedRows={setSelectedRows}
      />
    </div>
  )
}
