'use client'

import DataTable from '@/components/data-table'
import { useContext, useState } from 'react'
import { DashboardContext } from '../layout'
import { vouchersColumns } from '@/components/table-columns'
import VoucherControls from '@/components/voucher-controls'

export default function Vouchers() {
  // useContext for Dashboard Context
  const { isLoading, vouchersData } = useContext(DashboardContext)

  // Tab state
  const [tab, setTab] = useState('pending')

  // Control buttons active state
  const [buttonActive, setButtonActive] = useState(false)

  // State for toggle map button
  const [mapShown, setMapShown] = useState(false)

  // useState to store the ids of the selected rows
  const [selectedRows, setSelectedRows] = useState({})

  return (
    <div className="font-sans gap-3 flex justify-start-safe items-start-safe max-h-screen flex-1 flex-col p-3 pb-0">
      <div className='w-full flex flex-row-reverse'><VoucherControls buttonActive={buttonActive} rowSelection={selectedRows} setMapShown={setMapShown} mapShown={mapShown} setButtonActive={setButtonActive} /></div>
      <DataTable
        columns={vouchersColumns}
        data={!isLoading ? vouchersData : []}
        activateButtons={setButtonActive}
        setSelectedRows={setSelectedRows}
      />
    </div>
  )
}
