'use client'

import DataTable from '@/components/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useContext, useState } from 'react'

import RequestsNotifBadge from '@/components/requests-notif-badge'

import OngoingControls from '@/components/ongoing-controls'
import RequestControls from '@/components/requests-controls'
import { DashboardContext } from '../layout'

import CompletedControls from '@/components/completed-controls'
import OngoingCollectionMap from '@/components/ongoing-collection-map'
import RequestsCollectionMap from '@/components/requests-collection-map'
import { completedColumns, ongoingColumns, requestsColumns } from '@/components/table-columns'

export default function Collections() {

  // useContext for Dashboard Context
  const { isLoading, pendingData, ongoingData, completedData} = useContext(DashboardContext)

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
      <Tabs defaultValue='pending' onValueChange={setTab}>
        <div className='flex justify-between'>
          <TabsList>
            <TabsTrigger value='pending'>
              Requests <RequestsNotifBadge requests={pendingData.length}/>
            </TabsTrigger>
            <TabsTrigger value='ongoing'>For Collection</TabsTrigger>
            <TabsTrigger value='completed'>Completed</TabsTrigger>
          </TabsList>
          {
            tab === 'pending' ?
              <RequestControls buttonActive={buttonActive} rowSelection={selectedRows} setMapShown={setMapShown} mapShown={mapShown} setButtonActive={setButtonActive} />
            : tab === 'ongoing' ?
              <OngoingControls buttonActive={buttonActive} rowSelection={selectedRows} setMapShown={setMapShown} mapShown={mapShown} setButtonActive={setButtonActive} />
            : <CompletedControls buttonActive={buttonActive} rowSelection={selectedRows} setMapShown={setMapShown} mapShown={mapShown} setButtonActive={setButtonActive} />
          }
        </div>
        <div className='flex-row flex gap-5'>
          {
            <TabsContent value={tab} className={mapShown ? 'w-1/2' : 'w-full'}>
              <DataTable
                columns={tab === 'pending' ? requestsColumns : tab === 'ongoing' ? ongoingColumns : completedColumns}
                data={isLoading ? [] :!isLoading && tab === 'pending' ? pendingData :
                  !isLoading && tab === 'ongoing' ? ongoingData :
                  !isLoading && tab === 'completed' ? completedData
                  : [] }
                activateButtons={setButtonActive}
                setSelectedRows={setSelectedRows}
              />
            </TabsContent>
          }
          {mapShown && tab === 'pending' ? <RequestsCollectionMap className='w-full h-[80vh] border-1 rounded-lg overflow-hidden transition-all'>
          </RequestsCollectionMap> : mapShown && tab === 'ongoing' ? <OngoingCollectionMap className='w-full h-[80vh] border-1 rounded-lg overflow-hidden transition-all'>
          </OngoingCollectionMap> : null}
        </div>

      </Tabs>
    </div>
  )
}
