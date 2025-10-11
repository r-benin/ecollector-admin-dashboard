import CollectionBadge from '@/components/collection-badge'
import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef } from '@tanstack/react-table'
import { Timestamp } from 'firebase/firestore'

// Converts to formatted date
function formatTimestamp(timestamp: Timestamp, format: 'noDay' | 'withDay') {
  const fullDate = timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Singapore'
  }).replace(',' , '')
  const weekday = timestamp.toDate().toLocaleDateString('en-US', {
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
        if (row.getValue('transactionType') === 'Deposit') {
          return <p className='text-green-700'>+{row.getValue('transactionValue')}</p>
        } else {
          return <p className='text-red-700'>-{row.getValue('transactionValue')}</p>
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