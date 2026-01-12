'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'

import { useNotifications } from '@/contexts/NotificationContext'

// Util Imports
// getInitials is no longer used after removing getAvatar and dropdown content

const NotificationDropdown = () => {
  // Hooks
  const { lang: locale } = useParams()

  const { unreadCount } = useNotifications()
  const notificationCount = unreadCount

  const currentLocale = locale || 'en'

  console.log('NotificationDropdown rendered. Count:', notificationCount)

  return (
    <Link href={`/${currentLocale}/pages/notifications`}>
      <IconButton className='text-textPrimary' style={{ color: 'inherit' }}>
        <Badge
          color='error'
          className='cursor-pointer'
          badgeContent={notificationCount}
          invisible={false}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='ri-notification-2-line' style={{ fontSize: '24px' }} />
        </Badge>
      </IconButton>
    </Link>
  )
}

export default NotificationDropdown
