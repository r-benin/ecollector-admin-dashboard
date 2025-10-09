

import React, { useState, useContext } from 'react'
import { Toggle } from "@/components/ui/toggle"

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

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import { Button } from '@/components/ui/button'
import { doc, updateDoc, addDoc, GeoPoint, Timestamp, collection } from 'firebase/firestore'
import { db } from '@/app/firebase/config'
import { Map } from 'lucide-react'

interface CollectionControlsType {
    buttonActive: boolean,
    setButtonActive: (boolean: boolean) => void
    rowSelection: object,
    mapShown: boolean,
    setMapShown: (boolean: boolean) => void
}

export default function RequestControls({ buttonActive, setButtonActive, rowSelection, mapShown, setMapShown } : CollectionControlsType ) {
  
    const { setResetCheckedRows } = useContext(DashboardContext)
    
    const [note, setNote] = useState('')
    
    async function approveRows(rowSelection: object) {
        const rowIds = Object.values(rowSelection)
        console.log(rowIds)
        try {
            await rowIds.forEach((row) => {
                const docRef = doc(db, 'ecollector_requests', `${row}`)
                updateDoc(docRef, {status: 'ongoing'})
                console.log(row)
            })
            setButtonActive(false)
            setResetCheckedRows(true)
            console.log('Updated', rowIds)
        } catch (error) {
            console.log('Error updating database!', error)
        }
    }

    async function rejectRows(rowSelection: object, note: string) {
        const rowIds = Object.values(rowSelection)
        try {
            await rowIds.forEach((row) => {
                const docRef = doc(db, 'ecollector_requests', `${row}`)
                updateDoc(docRef, {status: 'rejected', note: note})
            })
            setButtonActive(false)
            setResetCheckedRows(true)
            console.log('Rejected', rowIds)
        } catch (error) {
            console.log('Error updating database!', error)
        }
    }
    
    return (
        <div className='flex gap-3'>
            <Dialog>
                <DialogTrigger asChild><Button disabled={!buttonActive}>Approve</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm collection</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to <span className='font-semibold'>APPROVE</span> the selected requests?
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button onClick={() => approveRows(rowSelection)}>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog>
                <DialogTrigger asChild><Button disabled={!buttonActive} variant={'outline'}>Reject</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm collection</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to <span className='font-semibold'>REJECT</span> the selected requests?
                            </DialogDescription>
                    </DialogHeader>
                    <Label>Reason</Label>
                    <Textarea maxLength={60} onChange={text => {setNote(text.target.value); console.log(note)}} placeholder='Type the reason for rejection here.'></Textarea>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='destructive' onClick={() => rejectRows(rowSelection, note)} disabled={note === ''}>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toggle variant={'outline'} onClick={() => setMapShown(!mapShown)} defaultPressed={mapShown}><Map />Show map</Toggle>
        </div>
  )
}
