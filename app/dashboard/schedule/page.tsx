'use client'

import DataTable from '@/components/data-table'
import { useContext, useState } from 'react'
import { DashboardContext } from '../layout'
import { scheduleColumns, scheduleType } from '@/components/table-columns'
import TransactionsControls from '@/components/transactions-controls'
import { Timestamp } from 'firebase/firestore'
import ScheduleControls from '@/components/schedule-controls'
import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type modifyScheduleType = {
    dialogOpen: boolean,
    scheduleDate: Timestamp | undefined,
    scheduleArea: string[] | undefined
}

export default function Schedule() {

  // useContext for Dashboard Context
  const { isLoading, scheduleData } = useContext(DashboardContext)

  // Tab state
  const [tab, setTab] = useState('pending')

  // Control buttons active state
  const [buttonActive, setButtonActive] = useState(false)

  // State for toggle map button
  const [mapShown, setMapShown] = useState(false)

  // useState to store the ids of the selected rows
  const [selectedRows, setSelectedRows] = useState({})

  // useState to control modify schedule dialog
  const [modifyDialog, setModifyDialog] = useState<modifyScheduleType>({
    dialogOpen: false,
    scheduleDate: undefined,
    scheduleArea: undefined,
  })

  // useState to control delete schedule dialog
  const [deleteDialog, setDeleteDialog] = useState<modifyScheduleType>({
    dialogOpen: false,
    scheduleDate: undefined,
    scheduleArea: undefined,
  })

  return (
    <div className="font-sans gap-3 flex justify-start-safe items-start-safe max-h-screen flex-1 flex-col p-3 pb-0">
      <div className='w-full flex flex-row-reverse'>
        <ScheduleControls 
          disabledDates={
            scheduleData.map((schedule) => { return schedule.scheduleDate.toDate()})
          }
          modifyDialog={modifyDialog}
          setModifyDialog={setModifyDialog}
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
        />
      </div>
      <DataTable
        columns={[...scheduleColumns, {
            id: "actions",
            cell: ({ row }) => { 
              return (
                <div className='flex justify-end pr-1'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">  
                      <DropdownMenuItem onClick={() => 
                        setModifyDialog({dialogOpen: true, scheduleDate: row.getValue('scheduleDate'), scheduleArea: row.getValue('scheduleArea')})
                      }><Pencil color='black'/>Modify schedule</DropdownMenuItem>
                      <DropdownMenuItem variant='destructive' onClick={() => 
                        setDeleteDialog({dialogOpen: true, scheduleDate: row.getValue('scheduleDate'), scheduleArea: row.getValue('scheduleArea')})
                      }><Trash />Delete schedule</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            },
          },
        ]}
        data={!isLoading ? scheduleData : []}
        activateButtons={setButtonActive}
        setSelectedRows={setSelectedRows}
      />
    </div>
  )
}
