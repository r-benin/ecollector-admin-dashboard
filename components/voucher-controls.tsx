import { useContext } from 'react'
import { DashboardContext } from '@/app/dashboard/layout'

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { db } from '@/app/firebase/config'
import { Button } from '@/components/ui/button'
import { deleteDoc, doc } from 'firebase/firestore'
import { Trash } from 'lucide-react'

interface CollectionControlsType {
    buttonActive: boolean,
    setButtonActive: (boolean: boolean) => void
    rowSelection: object,
    mapShown: boolean,
    setMapShown: (boolean: boolean) => void
}

export default function VoucherControls({ buttonActive, setButtonActive, rowSelection, mapShown, setMapShown } : CollectionControlsType ) {
  
    const { setResetCheckedRows } = useContext(DashboardContext)
    
    async function deleteRows(rowSelection: object) {
        const rowIds = Object.values(rowSelection)
        console.log(rowIds)
        try {
            await rowIds.forEach((row) => {
                const docRef = doc(db, 'ecollector_vouchers', `${row}`)
                deleteDoc(docRef)
            })
            setButtonActive(false)
            setResetCheckedRows(true)
            console.log('Updated', rowIds)
        } catch (error) {
            console.log('Error updating database!', error)
        }
    }

    return (
        <div className='flex gap-3'>
            <Dialog>
                <DialogTrigger asChild><Button disabled={!buttonActive} variant={'destructive'}><Trash />Delete</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete selected rows</DialogTitle>
                            <DialogDescription>
                                Deleted vouchers can&apos;t be restored. Are you sure you want to <span >DELETE</span> the selected rows? 
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='destructive' onClick={() => {deleteRows(rowSelection)}}>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
  )
}
