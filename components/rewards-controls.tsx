import React, { useEffect, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, setDoc, updateDoc  } from 'firebase/firestore'
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
import { Bubbles, CircleEllipsis, House, Minus, Plus, Upload, Utensils } from 'lucide-react'
import { Label } from './ui/label'
import Rewards, { deleteRewardType, modifyRewardType } from '@/app/dashboard/rewards/page'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import Image from 'next/image'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from './ui/badge'

interface RewardsControlsProps {
    modifyDialog: modifyRewardType
    setModifyDialog: React.Dispatch<React.SetStateAction<modifyRewardType>>
    deleteDialog: deleteRewardType
    setDeleteDialog: React.Dispatch<React.SetStateAction<deleteRewardType>>
}

const RewardSchema = z.object({
    icon: z.instanceof(File, {error: 'Please select an image file for the reward icon'})
        .refine((file) => file.size <= 10 * 1024 * 1024, {error: 'File upload is limited to a maximum of 10MB'})
        .refine((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type), {error: 'File type must be .png, .jpeg, or .webp'}),
    name: z.string()
        .min(1, 'Please enter a name for the reward')
        .max(100, 'Maxium character limit reached'),
    type: z.enum(['Home & Garden', 'Hygiene', 'Kitchen & Dining', 'Miscellaneous'], 'Please select a reward type'),
    description: z.string()
        .min(1, 'Please enter a description for the reward')
        .max(100, 'Maxium character limit reached'),
    cost: z.number()
        .min(1, 'Please enter a value within 1-99')
        .max(200, 'Cost is over the maximum amount'),
    status: z.enum(['Active', 'Inactive'], 'Please select reward status'),
})

const ModifyRewardSchema = z.object({
    icon: z.union([
            z.instanceof(File, {error: 'Please select an image file for the reward icon'})
            .refine((file) => file.size <= 10 * 1024 * 1024, {error: 'File upload is limited to a maximum of 10MB'})
            .refine((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type), {error: 'File type must be .png, .jpeg, or .webp'}),
            z.url()
        ]),
    name: z.string()
        .min(1, 'Please enter a name for the reward')
        .max(100, 'Maxium character limit reached'),
    type: z.union([
            z.enum(['Home & Garden', 'Hygiene', 'Kitchen & Dining', 'Miscellaneous'], 'Please select a reward type'),
            z.string()
        ]),
    description: z.string()
        .min(1, 'Please enter a description for the reward')
        .max(200, 'Maxium character limit reached'),
    cost: z.number()
        .min(1, 'Please enter a value within 1-99')
        .max(99, 'Cost is over the maximum amount'),
    status: z.enum(['Active', 'Inactive'], 'Please select reward status'),
})

export default function RewardsControls( { modifyDialog, setModifyDialog, deleteDialog, setDeleteDialog } : RewardsControlsProps ) {
    const addRewardForm = useForm<z.infer<typeof RewardSchema>>({
        resolver: zodResolver(RewardSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            cost: 0,
            status: 'Active'
        }
    })

    const modifyRewardForm = useForm<z.infer<typeof ModifyRewardSchema>>({
        resolver: zodResolver(ModifyRewardSchema),
        mode: 'onChange'
    })

    const [iconPreview, setIconPreview] = useState<string | null>(null)

    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function onSubmitAddReward(data: z.infer<typeof RewardSchema>) {
        try {
            const rewardId = await doc(collection(db, "ecollector_rewards")).id
            const storageRef = ref(storage, `/ecollector_assets/rewards/${rewardId}`)

            const uploadIcon = await uploadBytes(storageRef, data.icon)
            
            await setDoc(doc(db, "ecollector_rewards", rewardId), {
                "cost": data.cost,
                "description": data.description,
                "status": data.status,
                "name": data.name,
                "rewardType": data.type,
                "icon": rewardId,
            })
            console.log('Added', data.name)
        } catch (error) {
            console.log('ERROR:', error)
        }
        setAddDialogOpen(false)
    }

    async function onSubmitModifyReward(data: z.infer<typeof ModifyRewardSchema>) {
        try {
            if (modifyRewardForm.getFieldState('icon').isDirty && !(typeof data.icon === 'string')) {
                const storageRef = ref(storage, `/ecollector_assets/rewards/${modifyDialog.rewardId}`)
                const uploadIcon = await uploadBytes(storageRef, data.icon)
            }
            await setDoc(doc(db, "ecollector_rewards", modifyDialog.rewardId), {
                "cost": data.cost,
                "description": data.description,
                "status": data.status,
                "name": data.name,
                "rewardType": data.type,
                "icon": modifyDialog.rewardId,
            })
        } catch (error) {
            console.log('ERROR:', error)
        }
        handleCloseDialog('modify')
    }

    async function deleteReward(id: string, icon: string) {
        try {
            const deleteReward = await deleteDoc(doc(db, 'ecollector_rewards', id))
                .then(() => {
                    const imageRef = ref(storage, `/ecollector_assets/rewards/${icon}`)
                    const deleteIcon = deleteObject(imageRef)
                })
        } catch (error) {
            console.log('ERROR:', error)
        }
    }

    function onIconChange(event: React.ChangeEvent<HTMLInputElement>) {
        setFile(event.target.files && event.target.files[0])
        if (event.target.files) {
            addRewardForm.clearErrors('icon')
            if (!event.target.files[0].type.startsWith('image/')) {
                addRewardForm.setError('icon', {message: 'File type must be .png, .jpeg, or .webp',})
            } else {
                addRewardForm.setValue('icon', event.target.files[0])
            }
        }
    }

    function onModifyIcon(event: React.ChangeEvent<HTMLInputElement>) {
        setFile(event.target.files && event.target.files[0])
        if (event.target.files) {
            modifyRewardForm.clearErrors('icon')
            if (!event.target.files[0].type.startsWith('image/')) {
                modifyRewardForm.setError('icon', {message: 'File type must be .png, .jpeg, or .webp',})
            } else {
                modifyRewardForm.setValue('icon', event.target.files[0], {shouldDirty: true})
            }
        }
    }

    function uploadFile() {
        event?.preventDefault()
        fileInputRef.current?.click()
    }

    function handleCloseDialog(dialog: string) {
        if (dialog === 'modify') {
            setModifyDialog({
                dialogOpen: false,
                rewardId: '',
                rewardIcon: '',
                rewardName: '',
                rewardStatus: 'Inactive',
                rewardType: '',
                rewardDescription: '',
                rewardCost: 0
            })
            modifyRewardForm.reset()
            setIconPreview(null)
        } else if (dialog === 'delete') {
            setDeleteDialog({
                dialogOpen: false,
                rewardId: '',
                rewardName: '',
                rewardIcon: '',
            })
        }
        
    }

    // useEffect to reset form
    useEffect(() => {
        const resetForm = () => {
            setFile(null)
            addRewardForm.clearErrors()
            addRewardForm.reset()
        }

        if (modifyDialog.dialogOpen) {
            getDownloadURL(ref(storage, `/ecollector_assets/rewards/${modifyDialog.rewardIcon}`))
                .then((url) => {
                    setIconPreview(url)
                    modifyRewardForm.setValue('icon', url)
                })
            modifyRewardForm.reset({
                name: modifyDialog.rewardName,
                icon: modifyDialog.rewardIcon,
                description: modifyDialog.rewardDescription,
                type: modifyDialog.rewardType,
                cost: modifyDialog.rewardCost,
                status: modifyDialog.rewardStatus,
            })
        }

        return () => {
            resetForm()
        }

    }, [addDialogOpen, modifyDialog])

    const rewardName = addRewardForm.watch('name')
    const rewardDescription = addRewardForm.watch('description')
    const modifyRewardName = modifyRewardForm.watch('name')
    const modifyRewardDescription = modifyRewardForm.watch('description')

    return (
        <div className='flex gap-3'>
            {/*  Add Reward Dialog */}
            <Dialog onOpenChange={setAddDialogOpen} open={addDialogOpen}>
                <DialogTrigger asChild><Button variant={'default'} onClick={() => {setAddDialogOpen(true)}}><Plus />Add reward</Button></DialogTrigger>
                <DialogContent className='max-h-[80vh] overflow-y-scroll px-8 pt-8'>
                    <DialogHeader>
                        <DialogTitle>Add reward</DialogTitle>
                            <DialogDescription>
                                Add a new reward with the following details:
                            </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addRewardForm.handleSubmit(onSubmitAddReward)} id='addRewardForm'>
                        <FieldGroup>
                            <Controller 
                                name='icon'
                                control={addRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Icon</FieldLabel>
                                        <Input
                                            ref={fileInputRef}
                                            type='file'
                                            onChange={onIconChange}
                                            className='hidden'
                                            accept="image/*"
                                        />
                                        <div className='flex items-end'>
                                            <div className='flex-col flex items-center'>
                                                { file && file.type.startsWith('image/') && <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`${file}`} height={50}
                                                    width={50}
                                                    className='mb-2'
                                                    />
                                                }
                                                <Input
                                                    className={'w-[250px] rounded-r-none truncate'}
                                                    placeholder='No file uploaded' value={file ? file.name : ''}
                                                    aria-invalid={fieldState.invalid}
                                                    disabled
                                                />
                                            </div>
                                            <Button
                                                variant={'outline'}
                                                onClick={() => uploadFile()}
                                                className={`border-l-0 rounded-l-none`}
                                            ><Upload />Upload file</Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller 
                                name='name'
                                control={addRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Name</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {rewardName.length}/100
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
                                name='type'
                                control={addRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Type</FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-[250px]" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select reward type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Reward Types</SelectLabel>
                                                    <SelectItem value="Home & Garden"><House />Home & Garden</SelectItem>
                                                    <SelectItem value="Hygiene"><Bubbles />Hygiene</SelectItem>
                                                    <SelectItem value="Kitchen & Dining"><Utensils />Kitchen & Dining</SelectItem>
                                                    <SelectItem value="Miscellaneous"><CircleEllipsis /> Miscellaneous</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />
                            <Controller 
                                name='description'
                                control={addRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Description</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {rewardDescription.length}/200
                                            </p>
                                        </div>
                                        <Textarea
                                            {...field}
                                            maxLength={200}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </Field>
                                )}
                            />
                            <div className='flex justify-between mb-5 gap-10'>
                                <Controller
                                    name='cost'
                                    control={addRewardForm.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Cost</FieldLabel>
                                            <div className='flex'>
                                                <Button
                                                    variant='outline'
                                                    className='rounded-r-none border-r-0'
                                                    onClick={() => {
                                                        event?.preventDefault()
                                                        if (field.value > 1) {
                                                            addRewardForm.clearErrors('cost')
                                                            addRewardForm.setValue('cost', field.value - 1)
                                                        }
                                                    }}
                                                >
                                                    <Minus />
                                                </Button>
                                                <Input
                                                    {...field}
                                                    value={`${field.value}`}
                                                    type="text"
                                                    onChange={(event) => {
                                                        addRewardForm.clearErrors('cost')
                                                        const inputValue = event.target.value.replace(/[^0-9]/g, '')
                                                        if (inputValue === '') {
                                                            addRewardForm.setValue('cost', 0)
                                                        } else if (parseInt(inputValue) < 100 && parseInt(inputValue) > 0) {
                                                            addRewardForm.setValue('cost', parseInt(inputValue))
                                                        }  
                                                    }}
                                                    aria-invalid={fieldState.invalid}
                                                    className='rounded-none flex text-center'
                                                />
                                                <Button
                                                    variant='outline'
                                                    className='rounded-l-none border-l-0'
                                                    onClick={() => {
                                                        event?.preventDefault()
                                                        if (field.value < 99) {
                                                            addRewardForm.clearErrors('cost')
                                                            addRewardForm.setValue('cost', field.value + 1)
                                                        }
                                                    }}
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>
                                            { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name='status'
                                    control={addRewardForm.control}
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
                                                    <SelectLabel>Reward Status</SelectLabel>
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
                            </div>
                        </FieldGroup>
                    </form>
                    <DialogFooter>
                        <Button
                            variant='default'
                            type='submit'
                            form='addRewardForm'
                            disabled={addRewardForm.formState.isSubmitting}
                        >Add reward
                        </Button>
                        <DialogClose asChild>
                            <Button variant={'outline'}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/*  Modify Dialog */}
            <Dialog open={modifyDialog.dialogOpen} onOpenChange={ () => handleCloseDialog('modify')}>
                <DialogContent className='max-h-[80vh] overflow-y-scroll px-8 pt-8'>
                    <DialogHeader>
                        <DialogTitle>Add reward</DialogTitle>
                        <DialogDescription>
                            Add a new reward with the following details:
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={modifyRewardForm.handleSubmit(onSubmitModifyReward)} id='modifyRewardForm'>
                        <FieldGroup>
                            <Controller 
                                name='icon'
                                control={modifyRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Icon</FieldLabel>
                                        <Input
                                            ref={fileInputRef}
                                            type='file'
                                            onChange={onModifyIcon}
                                            className='hidden'
                                            accept="image/*"
                                        />
                                        <div className='flex items-end'>
                                            <div className='flex-col flex items-center'>
                                                { (file && file.type.startsWith('image/')) ? <Image
                                                    src={URL.createObjectURL(file)}
                                                    alt={`${file}`} height={50}
                                                    width={50}
                                                    className='mb-2'
                                                    />
                                                    : iconPreview && <Image
                                                    src={iconPreview}
                                                    alt={`${iconPreview}`} height={50}
                                                    width={50}
                                                    className='mb-2'
                                                    />
                                                }
                                                <Input
                                                    className={'w-[250px] rounded-r-none truncate'}
                                                    placeholder='No file uploaded' value={file ? file.name : 'Upload new file to update icon'}
                                                    aria-invalid={fieldState.invalid}
                                                    disabled
                                                />
                                            </div>
                                            <Button
                                                variant={'outline'}
                                                onClick={() => uploadFile()}
                                                className={`border-l-0 rounded-l-none`}
                                            ><Upload />Upload file</Button>
                                        </div>
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                            <Controller 
                                name='name'
                                control={modifyRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Name</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {modifyRewardName.length}/100
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
                                name='type'
                                control={modifyRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel>Type</FieldLabel>
                                        <Select
                                            name={field.name}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="w-[250px]" aria-invalid={fieldState.invalid}>
                                                <SelectValue placeholder="Select reward type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Reward Types</SelectLabel>
                                                    <SelectItem value="Home & Garden"><House />Home & Garden</SelectItem>
                                                    <SelectItem value="Hygiene"><Bubbles />Hygiene</SelectItem>
                                                    <SelectItem value="Kitchen & Dining"><Utensils />Kitchen & Dining</SelectItem>
                                                    <SelectItem value="Miscellaneous"><CircleEllipsis /> Miscellaneous</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {fieldState.invalid && (<FieldError errors={[fieldState.error]} />)}
                                    </Field>
                                )}
                            />
                            <Controller 
                                name='description'
                                control={modifyRewardForm.control}
                                render={({field, fieldState}) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className='flex justify-between items-center'>
                                            <FieldLabel>Description</FieldLabel>
                                            <p className={`${fieldState.invalid ? 'text-red-400' : 'text-gray-400'} text-[10px] h-full bottom`}>
                                                {modifyRewardDescription.length}/200
                                            </p>
                                        </div>
                                        <Textarea
                                            {...field}
                                            maxLength={200}
                                            aria-invalid={fieldState.invalid}
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                                    </Field>
                                )}
                            />
                            <div className='flex justify-between mb-5 gap-10'>
                                <Controller
                                    name='cost'
                                    control={modifyRewardForm.control}
                                    render={({field, fieldState}) => (
                                        <Field data-invalid={fieldState.invalid}>
                                            <FieldLabel>Cost</FieldLabel>
                                            <div className='flex'>
                                                <Button
                                                    variant='outline'
                                                    className='rounded-r-none border-r-0'
                                                    onClick={() => {
                                                        event?.preventDefault()
                                                        if (field.value > 1) {
                                                            modifyRewardForm.clearErrors('cost')
                                                            modifyRewardForm.setValue('cost', field.value - 1, {shouldDirty: true})
                                                        }
                                                    }}
                                                >
                                                    <Minus />
                                                </Button>
                                                <Input
                                                    {...field}
                                                    value={`${field.value}`}
                                                    type="text"
                                                    onChange={(event) => {
                                                        modifyRewardForm.clearErrors('cost')
                                                        const inputValue = event.target.value.replace(/[^0-9]/g, '')
                                                        if (inputValue === '') {
                                                            modifyRewardForm.setValue('cost', 0, {shouldDirty: true})
                                                        } else if (parseInt(inputValue) < 100 && parseInt(inputValue) > 0) {
                                                            modifyRewardForm.setValue('cost', parseInt(inputValue), {shouldDirty: true})
                                                        }  
                                                    }}
                                                    aria-invalid={fieldState.invalid}
                                                    className='rounded-none flex text-center'
                                                />
                                                <Button
                                                    variant='outline'
                                                    className='rounded-l-none border-l-0'
                                                    onClick={() => {
                                                        event?.preventDefault()
                                                        if (field.value < 99) {
                                                            modifyRewardForm.clearErrors('cost')
                                                            modifyRewardForm.setValue('cost', field.value + 1, {shouldDirty: true})
                                                        }
                                                    }}
                                                >
                                                    <Plus />
                                                </Button>
                                            </div>
                                            { fieldState.invalid && <FieldError errors={[fieldState.error]} /> }
                                        </Field>
                                    )}
                                />
                                <Controller
                                    name='status'
                                    control={modifyRewardForm.control}
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
                                                    <SelectLabel>Reward Status</SelectLabel>
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
                            </div>
                        </FieldGroup>
                    </form>
                    <DialogFooter>
                        <Button
                            variant='default'
                            type='submit' form='modifyRewardForm'
                            disabled={!(modifyRewardForm.formState.isDirty) || modifyRewardForm.formState.isSubmitting}
                        >Update reward</Button>
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
                        <DialogTitle>Delete reward</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <span className='font-bold'>{deleteDialog.rewardName}</span>? If you delete this, you can&apos;t restore it. 
                            </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant='destructive' onClick={() => deleteReward(deleteDialog.rewardId, deleteDialog.rewardIcon)}>Delete</Button>
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
