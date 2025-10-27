import React, { useEffect, useState } from 'react'

import { db } from '@/app/firebase/config'
import { Button } from '@/components/ui/button'
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
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from "@/components/ui/multi-select"
import { arrayRemove, arrayUnion, doc, Timestamp, updateDoc, setDoc, runTransaction } from 'firebase/firestore'
import { CalendarPlus } from 'lucide-react'
import DatePicker from './date-picker'
import { barangayType } from './table-columns'
import { Label } from './ui/label'
import { modifyScheduleType } from '@/app/dashboard/schedule/page'

export const barangayList: barangayType[] = [
  "Arkong Bato",
  "Bagbaguin",
  "Balangkas",
  "Parada",
  "Bignay",
  "Bisig",
  "Canumay East",
  "Canumay West",
  "Karuhatan",
  "Coloong",
  "Dalandanan",
  "Gen. T. De Leon",
  "Isla",
  "Lawang Bato",
  "Lingunan",
  "Mabolo",
  "Malanday",
  "Malinta",
  "Mapulang Lupa",
  "Marulas",
  "Maysan",
  "Palasan",
  "Pariancillo Villa",
  "Paso De Blas",
  "Pasolo",
  "Poblacion",
  "Pulo",
  "Punturin",
  "Rincon",
  "Tagalag",
  "Ugong",
  "Viente Reales",
  "Wawang Pulo",
];

interface ScheduleControlsProps {
    disabledDates: Date[],
    modifyDialog: modifyScheduleType
    setModifyDialog: React.Dispatch<React.SetStateAction<modifyScheduleType>>
    deleteDialog: modifyScheduleType
    setDeleteDialog: React.Dispatch<React.SetStateAction<modifyScheduleType>>
}

type previousScheduleType = {
    prevDate: Date | undefined,
    prevArea: string[] | undefined
}

export default function ScheduleControls( { disabledDates, modifyDialog, setModifyDialog, deleteDialog, setDeleteDialog } : ScheduleControlsProps ) {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [selectedArea, setSelectedArea] = useState<string[] | undefined>(undefined)
    const [prevSchedule, setPrevSchedule] = useState<previousScheduleType>({prevDate: undefined, prevArea: undefined})

    async function addSchedule() {
        if (selectedArea != undefined && date != undefined) {
            try {
                const docRefs = selectedArea.map((barangay) => doc(db, 'ecollector_schedule', barangay))
                await runTransaction(db, async (transaction) => {
                    for (const docRef of docRefs) {
                        transaction.update(docRef, {
                            collection_dates: arrayUnion(Timestamp.fromDate(date))
                        })
                    }
                })
            } catch (error) {
                console.log('ERROR:', error)
            }
        }
    }

    async function editSchedule() {
        if (selectedArea != undefined && date != undefined) {
            try {            
                const removeDocRefs = prevSchedule.prevArea?.filter(barangay => !selectedArea.includes(barangay))
                    .map((barangay) => doc(db, 'ecollector_schedule', barangay))
                const addDocRefs = selectedArea.filter(barangay => !prevSchedule.prevArea?.includes(barangay))
                    .map((barangay) => doc(db, 'ecollector_schedule', barangay))

                await runTransaction(db, async (transaction) => {
                    if (removeDocRefs) {
                        for (const docRef of removeDocRefs) {
                            transaction.update(docRef, {
                                collection_dates: arrayRemove(Timestamp.fromDate(date))
                            })
                        }
                    }

                    if (addDocRefs) {
                        for (const docRef of addDocRefs) {
                            transaction.update(docRef, {
                                collection_dates: arrayUnion(Timestamp.fromDate(date))
                            })
                        }
                    }
                })
            } catch (error) {
                console.log('ERROR:', error)
            }
        }
        
    }

    async function deleteSchedule() {
        if (deleteDialog.scheduleDate != undefined && deleteDialog.scheduleArea != undefined) {
            const docRefs = deleteDialog.scheduleArea.map((barangay) => doc(db, 'ecollector_schedule', barangay))
            try {
                await runTransaction(db, async (transaction) => {
                    for (const docRef of docRefs) {
                        transaction.update(docRef, {
                            collection_dates: arrayRemove(deleteDialog.scheduleDate)
                        })
                    }
                })
            } catch (error) {
                console.log('ERROR:', error)
            }
        }
    }

    // useEffect for setting modify schedule values
    useEffect(() => {
        if (modifyDialog.scheduleArea && modifyDialog.scheduleDate) {
            setPrevSchedule({prevDate: modifyDialog.scheduleDate.toDate(), prevArea: modifyDialog.scheduleArea})
            setDate(modifyDialog.scheduleDate.toDate())
            setSelectedArea(modifyDialog.scheduleArea)
        }
    }, [modifyDialog.dialogOpen])

    function handleCloseDialog() {
        setDate(undefined)
        setSelectedArea(undefined)
        setModifyDialog({dialogOpen: false, scheduleDate: undefined, scheduleArea: undefined})
        setPrevSchedule({prevDate: undefined, prevArea: undefined})
        setDeleteDialog({dialogOpen: false, scheduleDate: undefined, scheduleArea: undefined})
    }

    return (
        <div className='flex gap-3'>
            
            {/*  Add Schedule Dialog */}
            <Dialog onOpenChange={() => handleCloseDialog()}>
                <DialogTrigger asChild><Button variant={'default'}><CalendarPlus />Add schedule</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add collection schedule</DialogTitle>
                            <DialogDescription>
                                Schedule a collection date for an area or multiple areas
                            </DialogDescription>
                    </DialogHeader>
                    <div className='my-3'>
                        <div className='mb-5'>
                            <Label className='mb-3'>Collection Date</Label>
                            <DatePicker disabledDates={disabledDates?.length != 0 ? disabledDates : []} date={date} setDate={setDate}/>
                        </div>
                        <div>
                            <Label className='mb-3'>Area</Label>
                            <MultiSelect onValuesChange={(values) => setSelectedArea(values)}>
                                <MultiSelectTrigger className="w-full max-w-[400px]">
                                    <MultiSelectValue placeholder="Select area..." />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
                                    <MultiSelectGroup>
                                        { barangayList.sort().map((barangay) => {
                                            return <MultiSelectItem key={barangay} value={barangay}>{barangay}</MultiSelectItem>
                                        })}
                                    </MultiSelectGroup>
                                </MultiSelectContent>
                            </MultiSelect>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='default' onClick={() => addSchedule()} disabled={date == undefined || selectedArea == undefined}>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  Modify Dialog */}
            <Dialog open={modifyDialog.dialogOpen} onOpenChange={() => handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modify collection schedule</DialogTitle>
                            <DialogDescription>
                                Edit areas of collection schedule
                            </DialogDescription>
                    </DialogHeader>
                    <div className='my-3'>
                        <div className='mb-5'>
                            <Label className='mb-3'>Collection Date</Label>
                            <DatePicker disabledDates={disabledDates?.length != 0 ? disabledDates : []} date={date} setDate={setDate} />
                        </div>
                        <div>
                            <Label className='mb-3'>Area</Label>
                            <MultiSelect defaultValues={selectedArea} onValuesChange={(values) => {setSelectedArea(values); console.log('previous:', prevSchedule.prevArea); console.log('selected:', values)}}>
                                <MultiSelectTrigger className="w-full max-w-[400px]">
                                    <MultiSelectValue placeholder="Select area..." />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
                                    <MultiSelectGroup>
                                        { barangayList.map((barangay) => {
                                            return <MultiSelectItem key={barangay} value={barangay}>{barangay}</MultiSelectItem>
                                        })}
                                    </MultiSelectGroup>
                                </MultiSelectContent>
                            </MultiSelect>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='default' onClick={() => editSchedule()} disabled={(date?.getTime() === prevSchedule.prevDate?.getTime() && JSON.stringify(selectedArea) == JSON.stringify(prevSchedule.prevArea)) || selectedArea?.length === 0 }>Confirm</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  Delete Dialog */}
            <Dialog open={deleteDialog.dialogOpen} onOpenChange={() => handleCloseDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete schedule</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to <span>DELETE</span> the selected schedule? If you delete this, you can&apos;t restore it. 
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='destructive' onClick={() => deleteSchedule()}>Delete</Button>
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
