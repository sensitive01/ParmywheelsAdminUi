'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import axios from 'axios'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]) // Callback requests
  const [chatNotifications, setChatNotifications] = useState([]) // Help & Support
  const [bankNotifications, setBankNotifications] = useState([]) // Bank Approvals]
  const [loading, setLoading] = useState(true)

  const processNotifications = data => {
    // 1. Callbacks (General)
    const serverNotifications = data.data || []

    const formattedNotifications = serverNotifications.map(n => ({
      id: n._id,
      title: `Callback Request - ${n.department || 'General'}`,
      message: `${n.name} from ${n.department} requested a callback.`,
      type: 'server',
      timestamp: n.callbackTime,
      read: typeof n.check_read !== 'undefined' ? n.check_read : n.isRead || false,
      source: 'server',

      // Preserve raw checks if needed
      check_read: n.check_read
    }))

    // 2. Help & Support (Chat)
    const serverChatNotifications = data.helpAndSupports || []

    const formattedChatNotifications = serverChatNotifications.map(n => ({
      id: n._id,
      title: `Help Request - ${n.vendorName || n.status || 'Pending'}`,
      message: n.description || 'New help request',
      type: 'chat',
      timestamp: n.createdAt || n.date,
      read: n.isRead || false,
      source: 'server',
      vendorId: n.vendorid,
      vendorName: n.vendorName || 'Unknown Vendor',
      vendorImage: n.vendorImage
    }))

    // 3. Bank Approvals
    const serverBankNotifications = data.bankApprovalNotification || []

    const formattedBankNotifications = serverBankNotifications.map(n => ({
      id: n._id,
      title: 'Bank Approval Request',
      message: `Account Holder: ${n.accountholdername}`,
      type: 'bank',
      timestamp: n.updatedAt || n.createdAt,
      read: n.isApproved, // Using isApproved as read status logic for consistency
      source: 'server',
      vendorId: n.vendorId,
      vendorName: n.vendorName || n.accountholdername, // Fallback
      vendorImage: n.vendorImage || n.bankpassbookimage
    }))

    // Sort all by date descending
    formattedNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    formattedChatNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    formattedBankNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    setNotifications(formattedNotifications)
    setChatNotifications(formattedChatNotifications)
    setBankNotifications(formattedBankNotifications)
    setLoading(false)
  }

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/get-admin-notifications`)

      if (response.data) {
        processNotifications(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setLoading(false)
    }
  }, [])

  const markAsRead = async id => {
    // Optimistic Update
    const markRead = list => list.map(n => (n.id === id ? { ...n, read: true } : n))

    setNotifications(prev => markRead(prev))
    setChatNotifications(prev => markRead(prev))
    setBankNotifications(prev => markRead(prev))

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/update-admin-notification/${id}`, {
        isRead: true,
        check_read: true
      })

      // Optionally refetch to be sure
      // fetchNotifications()
    } catch (error) {
      console.error('Error marking as read:', error)

      // Revert if needed? usually fine to just leave it or refetch
      fetchNotifications()
    }
  }

  const clearAll = async typeIndex => {
    // typeIndex: 0 = General, 1 = Chat, 2 = Bank

    // Calls the endpoint that clears advNotification and chatboxSchema
    if (typeIndex === 0 || typeIndex === 1) {
      if (typeIndex === 0) setNotifications([])
      if (typeIndex === 1) setChatNotifications([])

      try {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/clear-all-admin-notifications`)
        fetchNotifications()
      } catch (error) {
        console.error('Error clearing notifications:', error)
      }
    } else {
      // For Chat and Bank, if no specific clear-all endpoint exists, we might need to iterate
      // OR the user needs to add endpoints.
      // For now, I will clear local state and trigger a refresh,
      // assuming the user might implement the backend logic I will provide.
      if (typeIndex === 1) setChatNotifications([])
      if (typeIndex === 2) setBankNotifications([])

      // TODO: Call API for clearing these types if available
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Computed counts (unread)
  const unreadCount =
    notifications.filter(n => !n.read).length +
    chatNotifications.filter(n => !n.read).length +
    bankNotifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        chatNotifications,
        bankNotifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
