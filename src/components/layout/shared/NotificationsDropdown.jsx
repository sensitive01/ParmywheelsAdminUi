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

      if (response.data) {
        const callbackRequests = response.data.data || []
        const helpRequests = response.data.helpAndSupports || []
        const bankApprovalNotification = response.data.bankApprovalNotification || []

        const mappedCallbacks = callbackRequests.map(item => ({
          ...item,
          id: item._id,
          title: `Callback Request - ${item.department || 'General'}`,
          subtitle: `${item.name} requested a callback.`,
          time: new Date(item.callbackTime || item.createdAt).toLocaleString(),
          read: typeof item.check_read !== 'undefined' ? item.check_read : item.isRead,
          check_read: item.check_read
        }))

        const mappedHelpRequests = helpRequests.map(item => ({
          ...item,
          id: item._id,
          title: `Help Request - ${item.status || 'Pending'}`,
          subtitle: item.description || 'New help request',
          time: new Date(item.createdAt || item.date).toLocaleString(),
          read: item.isRead,
          check_read: item.isRead // Normalize for count filter
        }))

        const mappedBankRequests = bankApprovalNotification.map(item => ({
          ...item,
          id: item._id,
          title: 'Bank Approval Request',
          subtitle: `Account Holder: ${item.accountholdername}`,
          time: new Date(item.updatedAt || item.createdAt).toLocaleString(),
          read: item.isApproved, // Assuming isApproved acts as 'read' or processed status for now, or false if we want it unread until actionable
          check_read: item.isApproved
        }))

        setNotificationsState([...mappedCallbacks, ...mappedHelpRequests, ...mappedBankRequests])
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
