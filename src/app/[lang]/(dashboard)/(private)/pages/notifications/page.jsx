'use client'

import { useState, useEffect } from 'react'

import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  ListItemIcon,
  Avatar,
  Tooltip,
  Chip,
  Pagination,
  Tab,
  Tabs
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import EventIcon from '@mui/icons-material/Event'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import WarningIcon from '@mui/icons-material/Warning'
import ChatIcon from '@mui/icons-material/Chat'

import { notificationStore } from '@/utils/requestNotificationPermission'

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([])
  const [chatNotifications, setChatNotifications] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  const rowsPerPage = 20

  const handleClearAll = () => {
    if (activeTab === 0) {
      if (notificationStore) {
        notificationStore.clearHistory()
        setNotifications([])
      }
    } else {
      setChatNotifications([])
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setPage(1) // Reset pagination on tab change
  }

  const handleMarkAsRead = async (id, event) => {
    event.stopPropagation()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-admin-notification/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isRead: true, check_read: true })
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  useEffect(() => {
    // Load initial notifications
    const fetchNotifications = async () => {
      let combinedNotifications = []

      // 1. Get local history
      if (notificationStore) {
        combinedNotifications = notificationStore.getHistory()
      }

      // 2. Fetch server notifications
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-admin-notifications`)

        if (response.ok) {
          const result = await response.json()

          // Process General Notifications (Data)
          const serverNotifications = result.data || []

          const formattedServerNotifications = serverNotifications.map(n => ({
            id: n._id,
            title: `Callback Request - ${n.department || 'General'}`,
            message: `${n.name} from ${n.department} requested a callback. Contact: ${n.mobile} / ${n.email}`,
            type: 'server',
            timestamp: n.callbackTime,
            read: typeof n.check_read !== 'undefined' ? n.check_read : n.isRead || false,
            source: 'server'
          }))

          combinedNotifications = [...formattedServerNotifications, ...combinedNotifications]
          combinedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          setNotifications(combinedNotifications)

          // Process Chat Notifications (helpAndSupports)
          const serverChatNotifications = result.helpAndSupports || []

          const formattedChatNotifications = serverChatNotifications.map(n => ({
            id: n._id,
            title: `Help Request - ${n.status || 'Pending'}`,
            message: n.description || 'New help request',
            type: 'chat',
            timestamp: n.createdAt || n.date,
            read: false,
            source: 'server',
            vendorId: n.vendorid
          }))

          formattedChatNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          setChatNotifications(formattedChatNotifications)
        }
      } catch (error) {
        console.error('Failed to fetch server notifications:', error)
      }
    }

    fetchNotifications()

    // Subscribe to new local notifications
    if (notificationStore) {
      const unsubscribe = notificationStore.addListener(notification => {
        setNotifications(prev => [notification, ...prev])
      })

      return unsubscribe
    }
  }, [])

  // Format the timestamp
  const formatTime = date => {
    if (!date) return ''

    const notificationDate = new Date(date)
    const now = new Date()

    // If today, show time only
    if (notificationDate.toDateString() === now.toDateString()) {
      return notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // If within the last week, show day and time
    const oneWeekAgo = new Date()

    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (notificationDate > oneWeekAgo) {
      return (
        notificationDate.toLocaleDateString([], { weekday: 'short' }) +
        ' ' +
        notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }

    // Otherwise show full date
    return notificationDate.toLocaleDateString()
  }

  // Determine if notification is related to cancellation
  const isCancellationNotification = notification => {
    return (
      notification.type === 'booking_cancelled' ||
      notification.type === 'cancelled_subscription' ||
      notification.title?.toLowerCase().includes('cancelled') ||
      notification.message?.toLowerCase().includes('cancelled')
    )
  }

  // Get icon based on notification type
  const getNotificationIcon = notification => {
    const type = notification.type
    const title = notification.title?.toLowerCase() || ''

    if (isCancellationNotification(notification)) {
      return <CancelIcon color='error' />
    } else if (type === 'chat') {
      return <ChatIcon color='primary' />
    } else if (title.includes('completed')) {
      return <CheckCircleIcon color='success' />
    } else if (title.includes('parked') || type === 'parked') {
      return <LocalParkingIcon color='info' />
    } else if (title.includes('scheduled') || type === 'scheduled_subscription') {
      return <EventIcon color='primary' />
    } else if (title.includes('approved')) {
      return <CheckCircleIcon color='primary' />
    } else {
      return <AccessTimeIcon color='action' />
    }
  }

  // Get current list based on active tab
  const currentList = activeTab === 0 ? notifications : chatNotifications

  // Calculate pagination
  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedNotifications = currentList.slice(startIndex, endIndex)
  const totalPages = Math.ceil(currentList.length / rowsPerPage)

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' sx={{ mb: 2 }}>
        Notifications
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label='notification tabs'>
          <Tab label='Callback Requests' />
          <Tab label='Help & Support' />
        </Tabs>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2
        }}
      >
        {currentList.length > 0 && (
          <Button variant='outlined' size='small' startIcon={<ClearAllIcon />} onClick={handleClearAll}>
            Clear All
          </Button>
        )}
      </Box>

      {currentList.length === 0 ? (
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <NotificationsIcon color='disabled' sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant='h6' color='textSecondary'>
            No notifications yet
          </Typography>
        </Box>
      ) : (
        <>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, p: 2 }}>
            {paginatedNotifications.map((notification, index) => {
              const isCancellation = isCancellationNotification(notification)

              return (
                <div key={notification.id || index}>
                  <ListItem
                    alignItems='flex-start'
                    sx={{
                      bgcolor: isCancellation ? 'rgba(211, 47, 47, 0.04)' : 'inherit',
                      borderLeft: isCancellation ? '4px solid #d32f2f' : 'none',
                      borderRadius: 1,
                      mb: 1
                    }}
                    secondaryAction={
                      !notification.read && (
                        <Tooltip title='Mark as Read'>
                          <IconButton
                            edge='end'
                            aria-label='mark as read'
                            onClick={e => handleMarkAsRead(notification.id, e)}
                          >
                            <CheckCircleIcon color='success' />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemIcon>{getNotificationIcon(notification)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='subtitle1' fontWeight={notification.read ? 'regular' : 'bold'}>
                            {notification.title}
                          </Typography>
                          {isCancellation && (
                            <Chip
                              label='Cancelled'
                              size='small'
                              color='error'
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box component='span' sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                          <Typography variant='body2' color='textPrimary' component='span'>
                            {notification.message}
                          </Typography>
                          <Typography variant='caption' color='textSecondary' component='span' sx={{ mt: 0.5 }}>
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < paginatedNotifications.length - 1 && <Divider component='li' variant='inset' />}
                </div>
              )
            })}
          </List>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color='primary'
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default NotificationsPage
