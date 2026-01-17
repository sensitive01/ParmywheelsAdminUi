'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

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
  Tabs,
  ListItemAvatar
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
import PersonIcon from '@mui/icons-material/Person'
import LaunchIcon from '@mui/icons-material/Launch' // Icon for the link button
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import { useNotifications } from '@/contexts/NotificationContext'

const NotificationsPage = () => {
  const { lang } = useParams()

  const { notifications, chatNotifications, bankNotifications, kycNotifications, markAsRead, clearAll } =
    useNotifications()

  const [activeTab, setActiveTab] = useState(0)

  // Pagination state
  const [page, setPage] = useState(1)
  const rowsPerPage = 20

  const handleClearAll = () => {
    clearAll(activeTab)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setPage(1) // Reset pagination on tab change
  }

  const handleMarkAsRead = (id, event) => {
    event.stopPropagation()
    markAsRead(id)
  }

  // Handler for navigation
  // Handler for navigation
  const handleViewDetails = (notification, event) => {
    event.stopPropagation()

    if (notification.type === 'kyc') {
      window.open(`/${lang || 'en'}/pages/kyconboarding`, '_blank')
    } else if (notification.vendorId) {
      // Option 1: Open in new tab (recommended for admin dashboards)
      window.open(`/${lang || 'en'}/pages/vendordetails/${notification.vendorId}`, '_blank')
    }
  }

  // Removed local fetching and notificationStore subscription as Context handles it

  // Format the timestamp
  const formatTime = date => {
    if (!date) return ''
    const notificationDate = new Date(date)
    const now = new Date()

    if (notificationDate.toDateString() === now.toDateString()) {
      return notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const oneWeekAgo = new Date()

    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    if (notificationDate > oneWeekAgo) {
      return (
        notificationDate.toLocaleDateString([], { weekday: 'short' }) +
        ' ' +
        notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    }

    return notificationDate.toLocaleDateString()
  }

  const isCancellationNotification = notification => {
    return (
      notification.type === 'booking_cancelled' ||
      notification.type === 'cancelled_subscription' ||
      notification.title?.toLowerCase().includes('cancelled') ||
      notification.message?.toLowerCase().includes('cancelled')
    )
  }

  const getNotificationIcon = notification => {
    const type = notification.type
    const title = notification.title?.toLowerCase() || ''

    if (isCancellationNotification(notification)) {
      return <CancelIcon color='error' />
    } else if (type === 'chat') {
      return <ChatIcon color='primary' />
    } else if (type === 'bank') {
      return <AccessTimeIcon color='warning' />
    } else if (type === 'kyc') {
      return <VerifiedUserIcon color='info' />
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

  const currentList =
    activeTab === 0
      ? notifications
      : activeTab === 1
        ? chatNotifications
        : activeTab === 2
          ? bankNotifications
          : kycNotifications

  const startIndex = (page - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedNotifications = currentList.slice(startIndex, endIndex)
  const totalPages = Math.ceil(currentList.length / rowsPerPage)

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h4' sx={{ mb: 2 }}>
        Notifications
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', alignItems: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label='notification tabs'>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                Callback Requests
                <Chip
                  label={notifications.length}
                  size='small'
                  color={notifications.length > 0 ? 'primary' : 'default'}
                  variant={activeTab === 0 ? 'filled' : 'outlined'}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                Help & Support
                <Chip
                  label={chatNotifications.length}
                  size='small'
                  color={chatNotifications.length > 0 ? 'primary' : 'default'}
                  variant={activeTab === 1 ? 'filled' : 'outlined'}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                Bank Approvals
                <Chip
                  label={bankNotifications.length}
                  size='small'
                  color={bankNotifications.length > 0 ? 'warning' : 'default'}
                  variant={activeTab === 2 ? 'filled' : 'outlined'}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                KYC Verification
                <Chip
                  label={kycNotifications.length}
                  size='small'
                  color={kycNotifications.length > 0 ? 'info' : 'default'}
                  variant={activeTab === 3 ? 'filled' : 'outlined'}
                />
              </Box>
            }
          />
        </Tabs>
        {currentList.length > 0 && (
          <Button
            variant='outlined'
            size='small'
            startIcon={<ClearAllIcon />}
            onClick={handleClearAll}
            sx={{ ml: 'auto', mr: 2 }}
          >
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
              const isChat = notification.type === 'chat'
              const isBank = notification.type === 'bank'
              const isKyc = notification.type === 'kyc'

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
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* View Vendor Button (For Chat OR Bank OR KYC based on ID presence) */}
                        {(isChat || isBank || isKyc) && notification.vendorId && (
                          <Button
                            variant='outlined'
                            size='small'
                            color='primary'
                            endIcon={<LaunchIcon />}
                            onClick={e => handleViewDetails(notification, e)}
                          >
                            {isKyc ? 'View Details' : 'View Vendor'}
                          </Button>
                        )}

                        {!notification.read && (
                          <Tooltip title='Mark as Read'>
                            <IconButton
                              edge='end'
                              aria-label='mark as read'
                              onClick={e => handleMarkAsRead(notification.id, e)}
                            >
                              <CheckCircleIcon color='success' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    }
                  >
                    {/* Render Avatar for Chat or Bank Notifications */}
                    {/* Render Avatar for Chat or Bank or KYC Notifications */}
                    {(isChat || isBank || isKyc) && notification.vendorImage ? (
                      <ListItemAvatar>
                        <Avatar src={notification.vendorImage} alt={notification.vendorName || 'Vendor'}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                    ) : (
                      <ListItemIcon>{getNotificationIcon(notification)}</ListItemIcon>
                    )}

                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant='subtitle1' fontWeight={notification.read ? 'regular' : 'bold'}>
                            {/* If Chat or Bank, Show Vendor Name clearly */}
                            {(isChat || isBank || isKyc) && notification.vendorName
                              ? `${notification.vendorName} - ${notification.title}`
                              : notification.title}
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
