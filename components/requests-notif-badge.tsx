import React from 'react'
import { Badge } from './ui/badge'

export default function RequestsNotifBadge({ requests } : { requests: number }) {
  return (
    <Badge variant={'default'}>{requests}</Badge>
  )
}
