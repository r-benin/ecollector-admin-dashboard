import React, { useState, useEffect, useContext } from 'react'

import { Button } from "@/components/ui/button"

import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel } from "@tanstack/react-table"
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from './ui/table'
import { DashboardContext } from '@/app/dashboard/layout'
import { Skeleton } from "@/components/ui/skeleton"

import { usePathname } from 'next/navigation'

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    activateButtons?: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedRows: React.Dispatch<React.SetStateAction<object>>
}

// Component to show when loading
const LoadingSkeleton = ({colSpan} : {colSpan: number}) => {
    return (
        <>
            {Array.from({length: 10}, (_, index) => (
                <TableRow key={index}>
                    <TableCell colSpan={colSpan}  >
                        <Skeleton className="h-[20px] w-full rounded-full" />
                    </TableCell>
                </TableRow>
            ))}
        </>  
    )
}

export default function DataTable<TData, TValue> ({ columns, data, activateButtons, setSelectedRows} : DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = useState({})

    const currentPage = usePathname()

    const { isLoading, panMapLocation, resetCheckedRows, setResetCheckedRows, setCentered } = useContext(DashboardContext)

    // Updates rowSelection context with checked ids
    useEffect(() => {
        const rows = table.getFilteredSelectedRowModel().flatRows
        const rowIds = rows.map((row) => {
            return currentPage === '/dashboard/collections' ? row.getValue('collection_id') :
            currentPage === '/dashboard/users' ? row.getValue('userId') :
            currentPage === '/dashboard/transactions' ? row.getValue('transactionId') :
            currentPage === '/dashboard/vouchers' ? row.getValue('voucherId') : null
        })
        if (rows.length != 0 && activateButtons) {
            activateButtons(true)
        } else if (activateButtons) {
            activateButtons(false)
        }
        setSelectedRows(rowIds)
        console.log(rowIds)
    }, [rowSelection])

    // Resets checked rows when an action button is pressed
    useEffect(() => {
        if (resetCheckedRows) {
            setRowSelection({})
            setResetCheckedRows(false)
        }
    }, [resetCheckedRows])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel:getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        initialState :{
            columnVisibility: {
                location: false,
                rewardId: false
            }
        }
    })

    return (
        <div className='h-full w-full flex-col'>
            <div className='w-full rounded-lg border-1'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                            )}
                                    </TableHead>
                                    )
                                })}
                            </TableRow>
                            ))}
                    </TableHeader>
                    <TableBody className='cursor-pointer'>
                    {table.getRowModel().rows?.length && !isLoading ? (
                        table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                            onClick={() => {
                                if (currentPage === '/dashboard/collections') {
                                    if (row.getValue('status') === 'pending' || row.getValue('status') === 'ongoing') {
                                        panMapLocation(row.getValue('location'))
                                        setCentered(true)
                                    }
                                }
                            }}
                        >
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                { flexRender(cell.column.columnDef.cell, cell.getContext()) }
                            </TableCell>
                            ))}
                        </TableRow>
                        ))
                    ) : isLoading ? <LoadingSkeleton colSpan={columns.length}/>
                        : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-20 text-center">
                                No results. 
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
            { table.getCanNextPage() || table.getCanPreviousPage?
                <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div> : null
            }   
        </div>
  )
}


