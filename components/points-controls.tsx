import React, { useEffect, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, GeoPoint, setDoc, updateDoc  } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref, uploadBytes  } from 'firebase/storage'
import { db } from '@/app/firebase/config'
import { storage } from '@/app/firebase/config'
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Bubbles, CircleEllipsis, House, MapPinPlus, Minus, Plus, Upload, Utensils } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import Image from 'next/image'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from './ui/badge'
import PinLocationMap from './pin-location-map'
import { deletePointType, modifyPointType } from '@/app/dashboard/points/page'

interface PointsControlsProps {
    modifyDialog: modifyPointType
    setModifyDialog: React.Dispatch<React.SetStateAction<modifyPointType>>
    deleteDialog: deletePointType
    setDeleteDialog: React.Dispatch<React.SetStateAction<deletePointType>>
}

const AddPointSchema = z.object({
    pointName: z.string()
        .min(1, 'Please enter a name for the collection point')
        .max(100, 'Maximum character limit reached'),
    pointCoordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    pointAddress: z.string()
        .min(1, 'Please set the pin location for the collection point'),
    pointStatus: z.enum(['Active', 'Inactive'], 'Please set the status for the collection point')
})

const ModifyPointSchema = z.object({
    pointName: z.string()
        .min(1, 'Please enter a name for the collection point')
        .max(100, 'Maximum character limit reached'),
    pointCoordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
    }),
    pointAddress: z.string()
        .min(1, 'Please set the pin location for the collection point'),
    pointStatus: z.enum(['Active', 'Inactive'], 'Please set the status for the collection point')
})

export default function PointsControls( { modifyDialog, setModifyDialog, deleteDialog, setDeleteDialog } : PointsControlsProps ) {
    const [pinLocation, setPinLocation] = useState<GeoPoint | null>(null)
    const [address, setAddress] = useState<string>('WEW')
    
    const addPointForm = useForm<z.infer<typeof AddPointSchema>>({
        resolver: zodResolver(AddPointSchema),
        mode: 'onChange',
        defaultValues: {
            pointName: '',
            pointCoordinates: {latitude: 0, longitude: 0},
            pointAddress: '',
            pointStatus: 'Active'
        }
    })

    const modifyPointForm = useForm<z.infer<typeof ModifyPointSchema>>({
        resolver: zodResolver(ModifyPointSchema),
        mode: 'onChange'
    })

    const [iconPreview, setIconPreview] = useState<string | null>(null)

    const [addDialogOpen, setAddDialogOpen] = useState(false)

    async function onSubmitAddPoint(data: z.infer<typeof AddPointSchema>) {
        try {
            await addDoc(collection(db, 'ecollector_collection_points'), {
                "name": data.pointName,
                "coordinates": new GeoPoint(data.pointCoordinates.latitude, data.pointCoordinates.longitude),
                "address": data.pointAddress,
                "description": 'Collection Point',
                "status": data.pointStatus,
            })
            console.log('Added', data.pointName)
        } catch (error) {
            console.log('ERROR:', error)
        }
        setAddDialogOpen(false)
    }

    async function onSubmitModifyPoint(data: z.infer<typeof ModifyPointSchema>) {
        try {
            await setDoc(doc(db, 'ecollector_collection_points', modifyDialog.pointId), {
                "name": data.pointName,
                "coordinates": new GeoPoint(data.pointCoordinates.latitude, data.pointCoordinates.longitude),
                "address": data.pointAddress,
                "description": 'Collection Point',
                "status": data.pointStatus,
            })
        } catch (error) {
            console.log('ERROR:', error)
        }
        handleCloseDialog('modify')
    }

    async function deletePoint() {
        try {
            const deletePoint = await deleteDoc(doc(db, 'ecollector_collection_points', deleteDialog.pointId))
        } catch (error) {
            console.log('ERROR:', error)
        }
        handleCloseDialog('delete')
    }

    // useEffect to reset values when dialog is closed
    // Also listens to modifyDialog for opening the dialog
    useEffect(() => {
        const resetValues = () => {
            setAddress('')
            setPinLocation(null)
            addPointForm.clearErrors()
            addPointForm.reset({
                pointName: '',
                pointCoordinates: {latitude: 0, longitude: 0},
                pointAddress: '',
                pointStatus: 'Active'
            })
        }        

        return resetValues()
    }, [addDialogOpen])

    // useEffect to handle opening of modify and delete form dialog

    useEffect(() =>{
        if (modifyDialog.dialogOpen) {
            modifyPointForm.reset({
                pointName: modifyDialog.pointName,
                pointStatus: modifyDialog.pointStatus,
                pointCoordinates: modifyDialog.pointCoordinates,
                pointAddress: modifyDialog.pointAddress,
            })
            setPinLocation(new GeoPoint(modifyDialog.pointCoordinates.latitude, modifyDialog.pointCoordinates.longitude))
        }
    }, [modifyDialog])

    // useEffect to set coordinates form field
    useEffect(() => {
        if (pinLocation && address && addDialogOpen) {
            addPointForm.clearErrors('pointCoordinates')
            addPointForm.clearErrors('pointAddress')
            addPointForm.setValue('pointCoordinates', pinLocation, {shouldDirty: true}) 
            addPointForm.setValue('pointAddress', address, {shouldDirty: true})
        }

        if (pinLocation && address && modifyDialog.dialogOpen) {
            modifyPointForm.clearErrors('pointCoordinates')
            modifyPointForm.clearErrors('pointAddress')
            modifyPointForm.setValue('pointCoordinates', pinLocation, {shouldDirty: true}) 
            modifyPointForm.setValue('pointAddress', address, {shouldDirty: true})
        }
    }, [pinLocation, address])

    // Handles close modify and delete dialog

    function handleCloseDialog(dialog: 'modify' | 'delete') {
        if (dialog === 'modify') {
            setModifyDialog({
                dialogOpen: false,
                pointName: '',
                pointStatus: 'Inactive',
                pointCoordinates: {latitude: 0, longitude: 0},
                pointAddress: '',
                pointId: ''
            })
            modifyPointForm.clearErrors()
        } else if (dialog === 'delete') {
            setDeleteDialog({
                dialogOpen: false,
                pointId: '',
                pointName: ''
            })
        }
        setAddress('')
        setPinLocation(null)
        
    }

    const pointName = addPointForm.watch('pointName')
    const modifyPointName = modifyPointForm.watch('pointName')

    return (
        <div className='flex gap-3'>
            {/*  Add Point Dialog */}
            <Dialog onOpenChange={setAddDialogOpen} open={addDialogOpen}>
                <DialogTrigger asChild><Button variant={'default'} onClick={() => {setAddDialogOpen(true)}}><MapPinPlus />Add collection point</Button></DialogTrigger>
                <DialogContent className='max-h-[80vh] overflow-y-scroll px-8 pt-8'>
                    <DialogHeader>
                        <DialogTitle>Add collection point</DialogTitle>
                            <DialogDescription>
                                Assign the name and the location for the collection point
                            </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addPointForm.handleSubmit(onSubmitAddPoint)} id='addPointForm'>
                        <FieldGroup>
                            <Controller
                                name='pointName'
                                control={addPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Name</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {pointName.length}/100
                                            </p>
                                        </div>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            maxLength={100}
                                        />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />
                            <Controller
                                name='pointStatus'
                                control={addPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-[230px]" aria-invalid={fieldState.invalid} >
                                                <SelectValue placeholder="Assign status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                <SelectLabel>Collection Point Status</SelectLabel>
                                                <SelectItem value="Active">
                                                    <Badge variant='outline' className='bg-green-100 text-green-700'>
                                                        <div className='w-1.5 h-1.5 rounded-full bg-green-700'></div>Active
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Inactive">
                                                    <Badge variant='outline' className='bg-red-100 text-red-700'>
                                                        <div className='w-1.5 h-1.5 rounded-full bg-red-700'></div>Inactive
                                                    </Badge>
                                                </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />

                            <Controller
                                name='pointAddress'
                                control={addPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid} className='mb-3'>
                                        <FieldLabel>Location</FieldLabel>
                                        <FieldDescription>Pin a location on the map or search for the address</FieldDescription>
                                        <Input {...field} disabled/>
                                        <PinLocationMap
                                            className='w-full h-[300px] mb-100'
                                            pinLocation={pinLocation}
                                            setPinLocation={setPinLocation}
                                            setAddress={setAddress}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                    <DialogFooter>
                        <Button
                            variant='default'
                            type='submit'
                            form='addPointForm'
                            disabled={addPointForm.formState.isSubmitting}
                        >Add collection point
                        </Button>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  Modify Dialog */}
            <Dialog onOpenChange={() => handleCloseDialog('modify')} open={modifyDialog.dialogOpen}>
                <DialogContent className='max-h-[80vh] overflow-y-scroll px-8 pt-8'>
                    <DialogHeader>
                        <DialogTitle>Add collection point</DialogTitle>
                            <DialogDescription>
                                Assign the name and the location for the collection point
                            </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={modifyPointForm.handleSubmit(onSubmitModifyPoint)} id='modifyPointForm'>
                        <FieldGroup>
                            <Controller
                                name='pointName'
                                control={modifyPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Name</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {modifyPointName.length}/100
                                            </p>
                                        </div>
                                        <Input
                                            {...field}
                                            aria-invalid={fieldState.invalid}
                                            maxLength={100}
                                        />
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />
                            <Controller
                                name='pointStatus'
                                control={modifyPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Status</FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-[230px]" aria-invalid={fieldState.invalid} >
                                                <SelectValue placeholder="Assign status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                <SelectLabel>Collection Point Status</SelectLabel>
                                                <SelectItem value="Active">
                                                    <Badge variant='outline' className='bg-green-100 text-green-700'>
                                                        <div className='w-1.5 h-1.5 rounded-full bg-green-700'></div>Active
                                                    </Badge>
                                                </SelectItem>
                                                <SelectItem value="Inactive">
                                                    <Badge variant='outline' className='bg-red-100 text-red-700'>
                                                        <div className='w-1.5 h-1.5 rounded-full bg-red-700'></div>Inactive
                                                    </Badge>
                                                </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller
                                name='pointAddress'
                                control={modifyPointForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid} className='mb-3'>
                                        <FieldLabel>Location</FieldLabel>
                                        <FieldDescription>Pin a location on the map or search for the address</FieldDescription>
                                        <Input {...field} disabled/>
                                        <PinLocationMap
                                            className='w-full h-[300px] mb-100'
                                            pinLocation={pinLocation}
                                            setPinLocation={setPinLocation}
                                            setAddress={setAddress}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </Field>
                                )}
                            />
                        </FieldGroup>
                    </form>
                    <DialogFooter>
                        <Button
                            variant='default'
                            type='submit'
                            form='modifyPointForm'
                            disabled={modifyPointForm.formState.isSubmitting || !(modifyPointForm.formState.isDirty)}
                        >Confirm changes
                        </Button>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  Delete Dialog */}
            <Dialog open={deleteDialog.dialogOpen} onOpenChange={() => handleCloseDialog('delete')}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete collection point</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete collection point <span className='font-bold'>{deleteDialog.pointName}</span>? If you delete this, you can&apos;t restore it. 
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='destructive' onClick={() => deletePoint()}>Delete</Button>
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
