'use client'

import DataTable from '@/components/data-table'
import { useContext, useState } from 'react'
import { DashboardContext } from '../layout'
import { rewardsColumns, scheduleType } from '@/components/table-columns'
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
import RewardsControls from '@/components/rewards-controls'

export type modifyRewardType = {
    dialogOpen: boolean,
    rewardId: string,
    rewardIcon: string,
    rewardName: string,
    rewardStatus: 'Active' | 'Inactive',
    rewardType: string,
    rewardDescription: string,
    rewardCost: number,
}

export type deleteRewardType = {
    dialogOpen: boolean,
    rewardId: string,
    rewardName: string,
    rewardIcon: string
}

export default function Rewards() {

  // useContext for Dashboard Context
  const { isLoading, rewardsData } = useContext(DashboardContext)

  // Tab state
  const [tab, setTab] = useState('pending')

  // Control buttons active state
  const [buttonActive, setButtonActive] = useState(false)

  // State for toggle map button
  const [mapShown, setMapShown] = useState(false)

  // useState to store the ids of the selected rows
  const [selectedRows, setSelectedRows] = useState({})

  // useState to control modify schedule dialog
  const [modifyDialog, setModifyDialog] = useState<modifyRewardType>({
    dialogOpen: false,
    rewardId: '',
    rewardIcon: '',
    rewardName: '',
    rewardStatus: 'Inactive',
    rewardType: '',
    rewardDescription: '',
    rewardCost: 0,
  })

  // useState to control delete schedule dialog
  const [deleteDialog, setDeleteDialog] = useState<deleteRewardType>({
    dialogOpen: false,
    rewardId: '',
    rewardName: '',
    rewardIcon: ''
  })

  return (
    <div className="font-sans gap-3 flex justify-start-safe items-start-safe flex-1 flex-col p-3 pb-0">
      <div className='w-full flex flex-row-reverse'>
        <RewardsControls 
          modifyDialog={modifyDialog}
          setModifyDialog={setModifyDialog}
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
        />
      </div>
      <DataTable
        columns={[...rewardsColumns, {
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
                        setModifyDialog({
                          dialogOpen: true,
                          rewardId: row.getValue('rewardId'),
                          rewardIcon: row.getValue('rewardIcon'),
                          rewardName: row.getValue('rewardName'),
                          rewardStatus: row.getValue('rewardStatus'),
                          rewardType: row.getValue('rewardType'),
                          rewardDescription: row.getValue('rewardDescription'),
                          rewardCost: row.getValue('rewardCost')
                        })
                      }><Pencil color='black'/>Modify reward</DropdownMenuItem>
                      <DropdownMenuItem variant='destructive' onClick={() => 
                        setDeleteDialog({
                          dialogOpen: true,
                          rewardId: row.getValue('rewardId'),
                          rewardName: row.getValue('rewardName'),
                          rewardIcon: row.getValue('rewardIcon')
                        })
                      }><Trash />Delete reward</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            },
          },
        ]}
        data={!isLoading ? rewardsData : []}
        activateButtons={setButtonActive}
        setSelectedRows={setSelectedRows}
      />
    </div>
  )
}
