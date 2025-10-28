'use client'

import DataTable from "@/components/data-table";
import { DashboardContext } from "../layout";
import { useContext, useState } from "react";
import { pointColumns } from "@/components/table-columns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import PointsControls from "@/components/points-controls";

export type modifyPointType = {
    dialogOpen: boolean,
    pointName: string,
    pointStatus: 'Active' | 'Inactive',
    pointCoordinates: {latitude: number, longitude: number},
    pointAddress: string,
    pointId: string
}

export type deletePointType = {
    dialogOpen: boolean,
    pointName: string,
    pointId: string,
}

export default function CollectionPoints() {
    
    const { pointsData, isLoading } = useContext(DashboardContext)

    const [selectedRows, setSelectedRows] = useState({})
    const [buttonActive, setButtonActive] = useState(false)

    const [modifyDialog, setModifyDialog] = useState<modifyPointType>({
        dialogOpen: false,
        pointName: '',
        pointStatus: 'Inactive',
        pointCoordinates: {latitude: 0, longitude: 0},
        pointAddress: '',
        pointId: ''
    })

    const [deleteDialog, setDeleteDialog] = useState<deletePointType>({
        dialogOpen: false,
        pointName: '',
        pointId: '',
    })


    return (
        <div className="font-sans gap-3 flex justify-start-safe items-start-safe flex-1 flex-col p-3 pb-0">
        <div className='w-full flex flex-row-reverse'>
            <PointsControls 
                modifyDialog={modifyDialog}
                setModifyDialog={setModifyDialog}
                deleteDialog={deleteDialog}
                setDeleteDialog={setDeleteDialog}
            />
        </div>
        <DataTable
            columns={[...pointColumns, {
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
                        <DropdownMenuItem onClick={() => {
                            setModifyDialog({
                                dialogOpen: true,
                                pointName: row.getValue('pointName'),
                                pointStatus: row.getValue('pointStatus'),
                                pointCoordinates: row.getValue('pointCoordinates'),
                                pointAddress: row.getValue('pointAddress'),
                                pointId: row.getValue('pointId')
                            })
                        }}><Pencil color='black'/>Modify collection point</DropdownMenuItem>
                        <DropdownMenuItem variant='destructive' onClick={() => {
                            setDeleteDialog({
                                dialogOpen: true,
                                pointId: row.getValue('pointId'),
                                pointName: row.getValue('pointName')
                            })
                        }}><Trash />Delete collection point</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                )
                },
            },
            ]}
            data={!isLoading ? pointsData : []}
            activateButtons={setButtonActive}
            setSelectedRows={setSelectedRows}
        />
        </div>
    )
}