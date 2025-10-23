import { Badge } from "./ui/badge"

interface StatusBadgeProps {
    status: 'Active' | 'Inactive'
}

export default function StatusBadge({ status } : StatusBadgeProps) {
    return (
        status === 'Active' ? 
            <Badge variant='outline' className='bg-green-100 text-green-700 text-[10px]'>
                <div className='w-1.5 h-1.5 rounded-full bg-green-700'></div>{status}
            </Badge> :
            <Badge variant='outline' className='bg-red-100 text-red-700 text-[10px]'>
                <div className='w-1.5 h-1.5 rounded-full bg-red-700'></div>{status}
            </Badge>
    )
}