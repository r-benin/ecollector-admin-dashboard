import React from 'react'

import { Badge } from "@/components/ui/badge"
import { Loader, Clock8, Check, Ban, X } from 'lucide-react'

export default function CollectionBadge({status} : {status: 'pending' | 'ongoing' | 'completed' | 'cancelled' | 'rejected'}) {
  switch (status) {
    case 'pending':
        return (
            <Badge variant="outline" className='w-20 rounded-full text-yellow-700 border-yellow-700 text-[10px]'>
                <Clock8 />Pending
            </Badge>
        )
    case 'ongoing':
        return (
            <Badge variant="outline" className='w-20 rounded-full text-green-700 border-green-700 text-[10px]'>
                <Loader />Ongoing
            </Badge>
        )
    case 'completed':
        return (
            <Badge variant="outline" className='w-20 rounded-full text-green-700 border-green-700 text-[10px]'>
                <Check />Complete
            </Badge>
        )
    case 'cancelled':
        return (
            <Badge variant="outline" className='w-20 rounded-full text-gray-400 text-[10px]'>
                <Ban />Cancelled
            </Badge>
        )
    case 'rejected':
        return (
            <Badge variant="outline" className='w-20 rounded-full text-red-700 border-red-700 text-[10px]'>
                <X />Rejected
            </Badge>
        )
  }
}
