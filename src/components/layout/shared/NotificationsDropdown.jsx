'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import axios from 'axios'

// Util Imports
// getInitials is no longer used after removing getAvatar and dropdown content

const NotificationDropdown = () => {
  // Hooks
  const { lang: locale } = useParams()

  // States
  const [notificationsState, setNotificationsState] = useState([])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-admin-notifications`)

      if (response.data && response.data.data) {
        // Verify data structure and map to component format if needed
        // Assuming API returns array of objects with { title, subtitle, time, read, ... }
        // If structure differs, simple mapping:
        const mapped = response.data.data.map(item => ({
          ...item,
          id: item._id, // Ensure we have ID for updates
          title: item.title,
          subtitle: item.message,
          time: new Date(item.createdAt).toLocaleString(),
          read: item.isRead,
          check_read: item.check_read, // Map the check_read field

          // Add default avatars if missing
          avatarIcon: 'ri-notification-line',
          avatarColor: 'primary'
        }))

        setNotificationsState(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Optional: Poll every 30s
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [])

  // Vars
  // Vars
  const notificationCount = notificationsState.filter(notification =>
    typeof notification.check_read !== 'undefined' ? notification.check_read === false : !notification.read
  ).length

  const currentLocale = locale || 'en'

  console.log('NotificationDropdown rendered. Count:', notificationCount, 'Data:', notificationsState)

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
