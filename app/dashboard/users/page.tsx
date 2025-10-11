'use client'

import DataTable from '@/components/data-table'
import { useContext, useState } from 'react'
import { DashboardContext } from '../layout'
import { usersColumns } from '@/components/table-columns'

export default function Users() {

  // useContext for Dashboard Context
  const { isLoading, usersData } = useContext(DashboardContext)

  // Tab state
  const [tab, setTab] = useState('pending')

  // Control buttons active state
  const [buttonActive, setButtonActive] = useState(false)

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
