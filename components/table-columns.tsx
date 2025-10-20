import CollectionBadge from '@/components/collection-badge'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from '@tanstack/react-table'
import { Timestamp } from 'firebase/firestore'
import { Badge } from './ui/badge';
import Image from 'next/image';
import { useState } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/app/firebase/config';
import { Bubbles, CircleEllipsis, Home, Utensils } from 'lucide-react';

export type barangayType =
  | "Arkong Bato"
  | "Bagbaguin"
  | "Balangkas"
  | "Parada"
  | "Bignay"
  | "Bisig"
  | "Canumay West"
  | "Karuhatan"
  | "Coloong"
  | "Dalandanan"
  | "Gen. T. De Leon"
  | "Isla"
  | "Lawang Bato"
  | "Lingunan"
  | "Mabolo"
  | "Malanday"
  | "Malinta"
  | "Mapulang Lupa"
  | "Marulas"
  | "Maysan"
  | "Palasan"
  | "Pariancillo Villa"
  | "Paso De Blas"
  | "Pasolo"
  | "Poblacion"
  | "Pulo"
  | "Punturin"
  | "Rincon"
  | "Tagalag"
  | "Ugong"
  | "Viente Reales"
  | "Wawang Pulo"
  | "Canumay East";

// Converts to formatted date
function formatTimestamp(timestamp: Timestamp, format: 'noDay' | 'withDay') {
  const fullDate = timestamp?.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Singapore'
  }).replace(',' , '')
  const weekday = timestamp?.toDate().toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'Asia/Singapore'
  })
  return format === 'noDay' ? `${fullDate}` : `${fullDate} (${weekday})`
}

export type collectionType = {
  name: string,
  collection_date: Timestamp,
  status: 'pending' | 'ongoing' | 'completed' | 'rejected' | 'cancelled'
  mobile_number: string,
  placed_on: string,
  address: string,
  collection_id: string,
  location?: {'latitude': number,'longitude': number}
  note? : string
}

export type accountType = {
  firstName: string,
  lastName: string,
  mobileNumber: string,
  email: string,
  address: {
    street: string,
    barangay: string,
    city: "Valenzuela City",
    region: "National Capital Region (NCR)",
  },
  credits: number,
  userId?: string,
  createdOn: Date
}

export type transactionType = {
  transactionId: string,
  transactionType: 'Deposit' | 'Redeem',
  transactionTitle: string,
  transactionValue: number,
  transactionDate: Timestamp
  name: string,
  userId: string
}

export type voucherType = {
  voucherId: string,
  voucherTitle: string,
  voucherPrice: number,
  voucherStatus: 'Active' | 'Redeemed' | 'Expired',
  voucherExpiry: string,
  voucherCreatedOn: Timestamp,
  userId: string,
}

export type scheduleType = {
  scheduleDate: Timestamp,
  scheduleArea: barangayType[] | string[],
}

export type rewardType = {
  rewardId: string,
  rewardIcon: string,
  rewardName: string,
  rewardStatus: 'Active' | 'Inactive',
  rewardDescription: string,
  rewardType: string,
  rewardCost: number
}

export const usersColumns: ColumnDef<accountType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'firstName',
    header: 'First Name'
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name'
  },
  {
    accessorKey: 'mobileNumber',
    header: 'Mobile Number'
  },
  {
    accessorKey: 'address.street',
    header: 'Street Address',
  },
  {
    accessorKey: 'address.barangay',
    header: 'Barangay'
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("userId")}</p>
      )
    }
  },
]

export const requestsColumns: ColumnDef<collectionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'collection_date',
    header: 'Collection Date',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('collection_date'), 'withDay')}</p>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}) => {
      const status: 'pending' | 'ongoing' | 'completed' = row.getValue('status')
      return <CollectionBadge status={status}/>
    }
  },
  {
    accessorKey: 'address',
    header: 'Address'
  },
  {
    accessorKey: 'placed_on',
    header: 'Placed on'
  },
  {
    accessorKey: 'mobile_number',
    header: 'Mobile Number'
  },
  {
    accessorKey: 'collection_id',
    header: 'Collection ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("collection_id")}</p>
      )
    }
  },
  {
    accessorKey: 'location',
    header: 'Location'
  },
]

export const ongoingColumns: ColumnDef<collectionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'collection_date',
    header: 'Collection Date',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('collection_date'), 'withDay')}</p>
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}) => {
      const status: 'pending' | 'ongoing' | 'completed' = row.getValue('status')
      return <CollectionBadge status={status}/>
    }
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'placed_on',
    header: 'Placed on'
  },
  {
    accessorKey: 'mobile_number',
    header: 'Mobile Number'
  },
  {
    accessorKey: 'collection_id',
    header: 'Collection ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("collection_id")}</p>
      )
    }
  },
   {
    accessorKey: 'location',
    header: 'Location'
  },
]

export const completedColumns: ColumnDef<collectionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'collection_date',
    header: 'Collection Date',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('collection_date'), 'withDay')}</p>
    }
  },
    {
    accessorKey: 'placed_on',
    header: 'Placed on'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}) => {
      const status: 'pending' | 'ongoing' | 'completed' = row.getValue('status')
      return <CollectionBadge status={status}/>
    }
  },
  {
    accessorKey: 'collection_id',
    header: 'Collection ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("collection_id")}</p>
      )
    }
  },
  {
    accessorKey: 'note',
    header: 'Notes'
  },
]

export const transactionsColumns: ColumnDef<transactionType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("userId")}</p>
      )
    }
  },
  {
    accessorKey: 'transactionTitle',
    header: 'Transaction'
  },
  {
    accessorKey: 'transactionType',
    header: 'Type'
  }, 
  {
    accessorKey: 'transactionValue',
    header: 'Amount',
    cell: ({row}) => {
        const transactionValue: number = row.getValue('transactionValue')
        if (transactionValue && transactionValue != 0) {
          if (row.getValue('transactionType') === 'Deposit') {
            return <p className='text-green-700'>+{row.getValue('transactionValue')}</p>
          } else {
            return <p className='text-red-700'>-{row.getValue('transactionValue')}</p>
          }
        } else {
          return <p className='text-gray-500'>0</p>
        }
        
    }
  },
  {
    accessorKey: 'transactionDate',
    header: 'Date',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('transactionDate'), 'noDay')}</p>
    }
  },
  {
    accessorKey: 'transactionId',
    header: 'Transaction ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("transactionId")}</p>
      )
    }
  },
]

export const vouchersColumns: ColumnDef<voucherType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: 'voucherId',
    header: 'Voucher Code'
  },
  {
    accessorKey: 'voucherTitle',
    header: 'Item'
  }, 
  {
    accessorKey: 'voucherStatus',
    header: 'Status',
  },
  {
    accessorKey: 'userId',
    header: 'User ID',
    cell: ({row}) => {
      return (
        <p className='overflow-hidden text-ellipsis w-[5rem]' >{row.getValue("userId")}</p>
      )
    }
  },
  {
    accessorKey: 'voucherExpiry',
    header: 'Expiry Date',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('voucherExpiry'), 'noDay')}</p>
    }
  },
  {
    accessorKey: 'voucherCreatedOn',
    header: 'Created on',
    cell: ({row}) => {
      return <p>{formatTimestamp(row.getValue('voucherCreatedOn'), 'noDay')}</p>
    }
  },

]

export const scheduleColumns: ColumnDef<scheduleType>[] = [
  {
    accessorKey: 'scheduleDate',
    header: 'Date',
    cell: ({row}) => {
      return <p className='w-[130px]'>{formatTimestamp(row.getValue('scheduleDate'), 'withDay')}</p>
    },
  },
  {
    accessorKey: 'scheduleArea',
    header: 'Area',
    cell: ({row}) => {
      const area: barangayType[] = row.getValue('scheduleArea')
      return (
        <div className='flex flex-wrap gap-y-1.5 w-[700px] h-auto'>
          {area.map((barangay, index) => {
            return <Badge key={index} className='mr-1' variant={'secondary'}>{barangay}</Badge>
          })}
        </div>
      )
    }
  },
]

export const rewardsColumns: ColumnDef<rewardType>[] = [
  {
    accessorKey: 'rewardId',
    header: 'ID',
  }, 
  {
    accessorKey: 'rewardIcon',
    header: 'Icon',
    cell: ({row}) => {
      let iconURL: string = ''
      getDownloadURL(ref(storage, `/ecollector_assets/rewards/${row.getValue('rewardIcon')}`))
      .then((url) => { iconURL = url })
      if (iconURL != null) {
        return ( <Image src={iconURL} alt={row.getValue('rewardIcon')} width={50} height={50} className='mx-3' /> )
      }
    }
  },
  {
    accessorKey: 'rewardName',
    header: 'Reward Name',
    cell: ({row}) => <p className='overflow-hidden text-ellipsis max-w-[250px]'>{row.getValue('rewardName')}</p>
  }, 
  {
    accessorKey: 'rewardType',
    header: () => <div className='flex justify-center'>Type</div>,
    cell: ({row}) => {
      return ( 
        <div className='flex justify-center'>
          <Badge variant='outline' className='text-[10px]'>
            {
              row.getValue('rewardType') === 'Home & Garden' ? <Home /> :
              row.getValue('rewardType') === 'Hygiene' ? <Bubbles /> :
              row.getValue('rewardType') === 'Kitchen & Dining' ? <Utensils /> :
              <CircleEllipsis />
            }
            {row.getValue('rewardType')}</Badge>
        </div>
      )
    }
  },
  {
    accessorKey: 'rewardDescription',
    header: 'Description',
    cell: ({ row }) => (
      <p className='break-words whitespace-normal max-w-[300px] text-ellipsis line-clamp-2 text-[10px]'>{row.getValue('rewardDescription')}</p>
    ),
  },
  {
    accessorKey: 'rewardCost',
    header: 'Cost',
  },
  {
    accessorKey: 'rewardStatus',
    header: () => <div className='flex justify-center'>Status</div>,
    cell: ({row}) => {
      return (
        <div className='flex justify-center'> {
          row.getValue('rewardStatus') === 'Active' ?
            <Badge variant='outline' className='bg-green-100 text-green-700 text-[10px]'>
              <div className='w-1.5 h-1.5 rounded-full bg-green-700'></div>{row.getValue('rewardStatus')}
            </Badge>
          : <Badge variant='outline' className='bg-red-100 text-red-700 text-[10px]'>
              <div className='w-1.5 h-1.5 rounded-full bg-red-700'></div>{row.getValue('rewardStatus')}
            </Badge>
        } </div>
      )
    }
  },  
]