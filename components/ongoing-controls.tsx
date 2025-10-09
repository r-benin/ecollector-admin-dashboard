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

import {
  Select,
  SelectGroup,
  SelectLabel,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function OngoingControls({ buttonActive, setButtonActive, rowSelection, mapShown, setMapShown } : CollectionControlsType ) {
  
    const { setResetCheckedRows } = useContext(DashboardContext)
    
    const [note, setNote] = useState('')
    const [status, setStatus] = useState('')
    
    async function modifyRows(rowSelection: object, note: string) {
        const rowIds = Object.values(rowSelection)
        console.log(rowIds)
        try {
            await rowIds.forEach((row) => {
                const docRef = doc(db, 'ecollector_requests', `${row}`)
                updateDoc(docRef, {status: status, note: note})
                console.log(row)
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
                <DialogTrigger asChild><Button disabled={!buttonActive} variant={'default'}>Modify</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modify</DialogTitle>
                            <DialogDescription>
                                Modify the status and note for the selected rows
                            </DialogDescription>
                    </DialogHeader>
                    <Label>Mark as</Label>
                    <Select onValueChange={status => {setStatus(status); console.log(status)}}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder={'Select a status'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Label>Add note</Label>
                    <Textarea maxLength={40} onChange={text => {setNote(text.target.value); console.log(note)}} placeholder='Add a note here.'></Textarea>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='default' onClick={() => modifyRows(rowSelection, note)} disabled={status === '' || note === ''}>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'} onClick={() => {setStatus('')}}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Toggle variant={'outline'} onClick={() => setMapShown(!mapShown)} defaultPressed={mapShown}><Map />Show map</Toggle>
        </div>
  )
}
