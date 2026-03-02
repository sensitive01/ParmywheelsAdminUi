'use client'

// React Imports
import { useState, useEffect, useMemo, useCallback } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

// Util Imports
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'
import ActionStatusButton from './ActionStatusButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL
const VENDORS_API_URL = 'https://api.parkmywheels.com/vendor/all-vendors'

export const stsChipColor = {
  instant: { color: '#ff4d49', text: 'Instant' },
  subscription: { color: '#72e128', text: 'Subscription' },
  schedule: { color: '#fdb528', text: 'Schedule' }
}

export const statusChipColor = {
  completed: { color: 'success' },
  pending: { color: 'warning' },
  parked: { color: '#666CFF' },
  cancelled: { color: 'error' },
  approved: { color: 'info' }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

const PayableTimeTimer = ({ parkedDate, parkedTime }) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00')

  useEffect(() => {
    if (!parkedDate || !parkedTime) {
      setElapsedTime('00:00:00')

      return
    }

    const [day, month, year] = parkedDate.split('-')
    const [timePart, ampm] = parkedTime.split(' ')
    let [hours, minutes] = timePart.split(':')

    if (ampm && ampm.toUpperCase() === 'PM' && hours !== '12') {
      hours = parseInt(hours) + 12
    } else if (ampm && ampm.toUpperCase() === 'AM' && hours === '12') {
      hours = '00'
    }

    const parkingStartTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)

    const timer = setInterval(() => {
      const now = new Date()
      const diffMs = now - parkingStartTime

      if (diffMs < 0) {
        setElapsedTime('00:00:00')

        return
      }

      // Convert milliseconds to hours, minutes, seconds
      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      // Format with leading zeros
      const formattedHours = hours.toString().padStart(2, '0')
      const formattedMinutes = minutes.toString().padStart(2, '0')
      const formattedSeconds = seconds.toString().padStart(2, '0')

      setElapsedTime(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [parkedDate, parkedTime])

  return <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{elapsedTime}</Typography>
}

const columnHelper = createColumnHelper()

const BookingEdit = ({ vendorId }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [filteredData, setFilteredData] = useState([])
  const [error, setError] = useState(null)
  const { lang: locale } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [vendors, setVendors] = useState([])
  const [vendorName, setVendorName] = useState('')

  // Filters: 'all', 'instant/schedule' (Bookings), 'subscription' (Subscription Bookings)
  const [viewType, setViewType] = useState('bookings') // 'bookings' or 'subscription'
  // Booking Source Filter: 'all', 'user', 'vendor'
  const [bookingSourceFilter, setBookingSourceFilter] = useState('user')

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('pending') // 'pending', 'approved', 'parked', 'completed', 'cancelled', 'all'

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Use provided vendorId prop or fallback to session user id
  const effectiveVendorId = vendorId || session?.user?.id

  // Fetch vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(VENDORS_API_URL)

        if (!response.ok) {
          throw new Error('Failed to fetch vendors')
        }

        const result = await response.json()

        if (result && result.data) {
          setVendors(result.data)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
      }
    }

    fetchVendors()
  }, [])

  // Set vendor name when vendors data or effectiveVendorId changes
  useEffect(() => {
    if (effectiveVendorId && vendors.length > 0) {
      const vendor = vendors.find(v => v.vendorId === effectiveVendorId)

      if (vendor) {
        setVendorName(vendor.vendorName)
      }
    }
  }, [effectiveVendorId, vendors])

  // Function to parse date and time from booking
  const parseBookingDateTime = useCallback(booking => {
    if (!booking.bookingDate || !booking.bookingTime) return null

    try {
      const [day, month, year] = booking.bookingDate.split('-')
      const [timePart, ampm] = booking.bookingTime.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }

      return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`)
    } catch (e) {
      console.error('Error parsing booking datetime:', e)

      return null
    }
  }, [])

  // Function to parse date string to DateTime object
  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null

    try {
      // Check if date is in YYYY-MM-DD format
      let dateParts

      if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
        const [year, month, day] = dateStr.split('-')

        dateParts = { day, month, year }
      }

      // Otherwise assume DD-MM-YYYY format
      else if (dateStr.includes('-')) {
        const [day, month, year] = dateStr.split('-')

        dateParts = { day, month, year }
      } else {
        return null
      }

      // Parse time
      const [timePart, ampm] = timeStr.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)

      if (ampm && ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12
      } else if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0
      }

      return new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T${hours}:${minutes}:00`)
    } catch (e) {
      console.error('Error parsing date/time:', e)

      return null
    }
  }

  // Function to calculate duration between two dates
  const calculateDuration = (startDate, startTime, endDate, endTime) => {
    if (!startDate || !startTime) return 'N/A'

    try {
      const startDateTime = parseDateTime(startDate, startTime)
      const endDateTime = endDate && endTime ? parseDateTime(endDate, endTime) : new Date()

      if (!startDateTime) return 'N/A'

      const diffMs = endDateTime - startDateTime

      if (diffMs < 0) return 'N/A'

      const diffSecs = Math.floor(diffMs / 1000)
      const hours = Math.floor(diffSecs / 3600)
      const minutes = Math.floor((diffSecs % 3600) / 60)
      const seconds = diffSecs % 60

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } catch (e) {
      console.error('Error calculating duration:', e)

      return 'N/A'
    }
  }

  // Function to cancel a booking
  const cancelBooking = async bookingId => {
    try {
      const response = await fetch(`${API_URL}/vendor/cancelbooking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to cancel booking')
      }

      return true
    } catch (error) {
      console.error('Error cancelling booking:', error)

      return false
    }
  }

  // Function to delete a booking
  const deleteBooking = async bookingId => {
    try {
      const response = await fetch(`${API_URL}/vendor/deletebooking/${bookingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      return true
    } catch (error) {
      console.error('Error deleting booking:', error)

      return false
    }
  }

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (isBulkDeleting) {
      const selectedIds = Object.keys(rowSelection)

      try {
        setLoading(true)

        // Delete each selected booking sequentially
        // Since there is no bulk API, we loop.
        for (const idIdx of selectedIds) {
          const bookingId = filteredData[parseInt(idIdx)]?._id

          if (bookingId) {
            await deleteBooking(bookingId)
          }
        }

        setData(prev => {
          const idsToDelete = selectedIds.map(idx => filteredData[parseInt(idx)]?._id).filter(id => id)

          return prev.filter(booking => !idsToDelete.includes(booking._id))
        })
        setRowSelection({})
      } catch (error) {
        console.error('Error in bulk delete:', error)
      } finally {
        setLoading(false)
      }
    } else if (bookingToDelete) {
      try {
        const success = await deleteBooking(bookingToDelete)

        if (success) {
          setData(prev => prev.filter(booking => booking._id !== bookingToDelete))
        }
      } catch (error) {
        console.error('Error deleting single booking:', error)
      }
    }

    setDeleteDialogOpen(false)
    setBookingToDelete(null)
    setIsBulkDeleting(false)
  }

  // Function to check and update bookings for auto-cancellation
  // Wrapped in useCallback to be stable for dependencies
  // Function to check and update bookings for auto-cancellation
  const checkAndUpdateBookings = async currentBookings => {
    try {
      const now = new Date()

      // Create a copy of the current data to avoid direct state mutation
      // We use the passed argument (which could be fresh from fetch) or state
      const sourceData = currentBookings || data

      if (!sourceData || sourceData.length === 0) return

      const updatedBookings = [...sourceData]
      let needsUpdate = false

      for (const booking of updatedBookings) {
        try {
          // Skip if not pending or approved
          const status = booking.status?.toLowerCase()

          if (status !== 'pending' && status !== 'approved') {
            continue
          }

          const bookingDateTime = parseBookingDateTime(booking)

          if (!bookingDateTime) continue

          // Check if the booking time has passed by more than 10 minutes
          const tenMinutesAfterBooking = new Date(bookingDateTime.getTime() + 10 * 60000)

          if (now > tenMinutesAfterBooking) {
            // Update locally first for immediate UI feedback
            booking.status = 'cancelled'
            needsUpdate = true

            // Send cancellation request to server
            await cancelBooking(booking._id)
            console.log(`Booking ${booking._id} has been auto-cancelled`)
          }
        } catch (e) {
          console.error(`Error processing booking ${booking._id}:`, e)
        }
      }

      if (needsUpdate) {
        setData(updatedBookings)
      }
    } catch (e) {
      console.error('Error in auto-cancellation check:', e)
    }
  }

  const fetchData = async () => {
    if (!effectiveVendorId) {
      setLoading(false)
      setError('Vendor ID not available')

      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log(`Fetching bookings from: ${API_URL}/vendor/fetchbookingsbyvendorid/${effectiveVendorId}`)
      const response = await fetch(`${API_URL}/vendor/fetchbookingsbyvendorid/${effectiveVendorId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const result = await response.json()

      if (result && result.bookings) {
        // Filter out status explicitly here if needed, but filtering seems generic
        // We will filter by booking type (instant/schedule vs subscription) in the useEffect for filtering
        const allBookings = result.bookings

        // Sort bookings by creation date (latest first)
        const sortedBookings = allBookings.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt)
          }

          try {
            const dateA = parseBookingDateTime(a)
            const dateB = parseBookingDateTime(b)

            if (dateA && dateB) {
              return dateB - dateA
            }

            if (a._id && b._id) {
              return b._id.localeCompare(a._id)
            }

            return 0
          } catch (e) {
            return 0
          }
        })

        setData(sortedBookings)

        // After fetching data, check for bookings that need auto-cancellation
        // Pass the fresh sortedBookings to avoid stale state
        await checkAndUpdateBookings(sortedBookings)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Effect to fetch data
  useEffect(() => {
    fetchData()
  }, [effectiveVendorId])

  // Effect for auto-cancellation interval
  useEffect(() => {
    // Set up interval to check for auto-cancellation every minute
    const intervalId = setInterval(() => {
      checkAndUpdateBookings()
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [data])

  // Apply filters: View Type (Bookings vs Subscription) + Booking Source (User vs Vendor) + Global Search
  useEffect(() => {
    let result = [...data]

    // 1. Filter by View Type (Bookings vs Subscription)
    if (viewType === 'subscription') {
      result = result.filter(item => item.sts?.toLowerCase() === 'subscription')
    } else {
      // 'bookings' includes instant and schedule
      result = result.filter(item => {
        const type = item.sts?.toLowerCase()

        return type === 'instant' || type === 'schedule'
      })
    }

    // 2. Filter by Booking Source (User vs Vendor)
    // Same logic as OrderListTable:
    // User bookings: userid exists AND userid != vendorId
    // Vendor bookings: userid is missing OR userid == vendorId
    // 2. Filter by Booking Source (User vs Vendor vs My Space)
    // 2. Filter by Booking Source (User vs Vendor)
    if (bookingSourceFilter === 'user') {
      result = result.filter(item => item.userid && String(item.userid) !== String(effectiveVendorId))
    } else {
      // Vendor bookings: userid is missing OR userid == vendorId
      result = result.filter(item => !item.userid || String(item.userid) === String(effectiveVendorId))
    }

    // 3. Filter by Status
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status?.toLowerCase() === statusFilter)
    }

    // 4. Global Text Filter
    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase()

      result = result.filter(item => {
        return (
          (item.vehicleNumber && item.vehicleNumber.toLowerCase().includes(lowercasedFilter)) ||
          (item.personName && item.personName.toLowerCase().includes(lowercasedFilter)) ||
          (item.mobileNumber && item.mobileNumber.toLowerCase().includes(lowercasedFilter)) ||
          (item.vehicleType && item.vehicleType.toLowerCase().includes(lowercasedFilter)) ||
          (item.status && item.status.toLowerCase().includes(lowercasedFilter))
        )
      })
    }

    setFilteredData(result)
  }, [data, viewType, bookingSourceFilter, globalFilter, effectiveVendorId, statusFilter])

  /* eslint-enable react-hooks/exhaustive-deps */

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        enableSorting: false
      },
      {
        id: 'sno',
        header: 'S.No',
        cell: ({ row }) => <Typography>{row.index + 1}</Typography>,
        enableSorting: false
      },
      columnHelper.accessor('customer', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <CustomAvatar src='/images/avatars/1.png' skin='light' size={34} />
            <div className='flex flex-col'>
              <Typography className='font-medium'>{row.original.personName || 'Unknown'}</Typography>
              <Typography variant='body2'>{row.original.mobileNumber || 'N/A'}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: ({ row }) => {
          const vehicleType = row.original.vehicleType?.toLowerCase()

          const vehicleIcons = {
            car: { icon: 'ri-car-fill', color: '#ff4d49' },
            bike: { icon: 'ri-motorbike-fill', color: '#72e128' },
            default: { icon: 'ri-roadster-fill', color: '#282a42' }
          }

          const { icon, color } = vehicleIcons[vehicleType] || vehicleIcons.default

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className={icon} style={{ fontSize: '16px', color }}></i>
              {row.original.vehicleType || 'N/A'}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('vehicleNumber', {
        header: 'Vehicle Number',
        cell: ({ row }) => (
          <Typography style={{ color: '#666cff' }}>
            {row.original.vehicleNumber ? `#${row.original.vehicleNumber}` : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('sts', {
        header: 'Booking Type',
        cell: ({ row }) => {
          const stsKey = row.original.sts?.toLowerCase()
          const chipData = stsChipColor[stsKey] || { color: 'text.secondary', text: row.original.sts || 'N/A' }

          return (
            <Typography
              sx={{
                color: chipData.color,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <i className='ri-circle-fill' style={{ fontSize: '10px', color: chipData.color }}></i>
              {chipData.text}
            </Typography>
          )
        }
      }),
      {
        id: 'bookingDateTime',
        header: 'Booking Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.bookingDate, row.bookingTime)

          return dateTime ? dateTime.getTime() : 0
        },
        sortingFn: 'basic',
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            if (!timeStr) return 'N/A'
            const raw = String(timeStr).trim()

            if (/NaN/i.test(raw)) return 'N/A'
            if (/(AM|PM)/i.test(raw)) return raw

            try {
              const [h, m] = raw.split(':').map(Number)

              if (Number.isNaN(h)) return 'N/A'
              const period = h >= 12 ? 'PM' : 'AM'
              const hours12 = h % 12 || 12

              return `${hours12}:${String(m || 0).padStart(2, '0')} ${period}`
            } catch (e) {
              return 'N/A'
            }
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.bookingDate)}, ${formatTimeDisplay(row.original.bookingTime || 'N/A')}`}
            </Typography>
          )
        }
      },
      {
        id: 'parkingEntryDateTime',
        header: 'Parking Entry Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.parkedDate, row.parkedTime)

          return dateTime ? dateTime.getTime() : 0
        },
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            if (!timeStr) return 'N/A'

            return timeStr
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.parkedDate)}, ${formatTimeDisplay(row.original.parkedTime || 'N/A')}`}
            </Typography>
          )
        }
      },
      {
        id: 'exitVehicleDateTime',
        header: 'Parking Exit Date & Time',
        accessorFn: row => {
          const dateTime = parseDateTime(row.exitvehicledate, row.exitvehicletime)

          return dateTime ? dateTime.getTime() : 0
        },
        cell: ({ row }) => {
          const formatDateDisplay = dateStr => {
            if (!dateStr) return 'N/A'

            try {
              if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                return new Date(dateStr).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              } else if (dateStr.includes('-')) {
                const [day, month, year] = dateStr.split('-')

                return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              }

              return dateStr
            } catch (e) {
              return dateStr
            }
          }

          const formatTimeDisplay = timeStr => {
            if (!timeStr) return 'N/A'

            return timeStr
          }

          return (
            <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className='ri-calendar-2-line' style={{ fontSize: '16px', color: '#666' }}></i>
              {`${formatDateDisplay(row.original.exitvehicledate)}, ${formatTimeDisplay(row.original.exitvehicletime || 'N/A')}`}
            </Typography>
          )
        }
      },
      {
        id: 'payableTime',
        header: 'Payable Time',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase()

          if (status === 'completed') return row.original.hour || 'N/A'
          const isParked = status === 'parked'

          if (isParked) {
            return (
              <div className='flex items-center gap-2'>
                <i className='ri-time-line' style={{ fontSize: '16px', color: '#666CFF' }}></i>
                <PayableTimeTimer parkedDate={row.original.parkedDate} parkedTime={row.original.parkedTime} />
              </div>
            )
          }

          return row.original.hour || 'N/A'
        }
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const status = row.original.status?.toUpperCase()
          const isCompleted = status === 'COMPLETED'

          if (isCompleted) {
            let duration = row.original.hour

            if (!duration || duration === 'N/A') {
              duration = calculateDuration(
                row.original.parkedDate,
                row.original.parkedTime,
                row.original.exitvehicledate,
                row.original.exitvehicletime
              )
            }

            return (
              <Typography sx={{ fontWeight: 500, color: '#72e128', fontFamily: 'monospace' }}>{duration}</Typography>
            )
          }

          return <Typography>N/A</Typography>
        }
      },
      ...((bookingSourceFilter === 'user'
        ? [
            {
              id: 'charges',
              header: 'Charges',
              cell: ({ row }) => <Typography>₹{Number(row.original.amount || 0).toFixed(2)}</Typography>
            },
            {
              id: 'handlingFee',
              header: 'Handling Fee',
              cell: ({ row }) => <Typography>₹{Number(row.original.handlingfee || 0).toFixed(2)}</Typography>
            },
            {
              id: 'gst',
              header: 'GST',
              cell: ({ row }) => <Typography>₹{Number(row.original.gstamout || 0).toFixed(2)}</Typography>
            },
            {
              id: 'platformFee',
              header: 'Platform Fee',
              cell: ({ row }) => (
                <Typography sx={{ color: '#ff4d49', fontWeight: 500 }}>
                  - ₹{Number(row.original.releasefee || 0).toFixed(2)}
                </Typography>
              )
            },
            {
              id: 'receivableAmount',
              header: 'Receivable',
              cell: ({ row }) => (
                <Typography sx={{ color: '#72e128', fontWeight: 500 }}>
                  ₹{Number(row.original.recievableamount || 0).toFixed(2)}
                </Typography>
              )
            },
            {
              id: 'total',
              header: 'Total',
              cell: ({ row }) => (
                <Typography fontWeight={600}>
                  ₹{Number(row.original.totalamout || row.original.amount || 0).toFixed(2)}
                </Typography>
              )
            }
          ]
        : [
            {
              id: 'charges',
              header: 'Charges',
              cell: ({ row }) => <Typography>₹{Number(row.original.amount || 0).toFixed(2)}</Typography>
            },
            {
              id: 'platformFee',
              header: 'Platform Fee',
              cell: ({ row }) => (
                <Typography sx={{ color: '#ff4d49', fontWeight: 500 }}>
                  - ₹{Number(row.original.releasefee || 0).toFixed(2)}
                </Typography>
              )
            },
            {
              id: 'receivableAmount',
              header: 'Receivable',
              cell: ({ row }) => (
                <Typography sx={{ color: '#72e128', fontWeight: 500 }}>
                  ₹{Number(row.original.recievableamount || 0).toFixed(2)}
                </Typography>
              )
            },
            {
              id: 'total',
              header: 'Total',
              cell: ({ row }) => (
                <Typography fontWeight={600}>
                  ₹{Number(row.original.totalamout || row.original.amount || 0).toFixed(2)}
                </Typography>
              )
            }
          ]) || []),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const statusKey = row.original.status?.toLowerCase()
          const chipData = statusChipColor[statusKey] || { color: 'default' }

          return (
            <Chip
              label={row.original.status || 'N/A'}
              variant='tonal'
              size='small'
              sx={
                chipData.color.startsWith('#')
                  ? {
                      backgroundColor: chipData.color,
                      color: 'white'
                    }
                  : {}
              }
              color={!chipData.color.startsWith('#') ? chipData.color : undefined}
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <OptionMenu
              iconButtonProps={{ size: 'medium' }}
              iconClassName='text-[22px]'
              options={[
                {
                  text: 'View',
                  icon: 'ri-eye-line',
                  menuItemProps: {
                    onClick: () => {
                      const selectedId = row.original._id

                      if (selectedId) {
                        router.push(`/pages/bookingdetails/${selectedId}`)
                      }
                    }
                  }
                },
                {
                  text: 'Delete',
                  icon: 'ri-delete-bin-7-line',
                  menuItemProps: {
                    onClick: () => {
                      const selectedId = row.original._id

                      if (!selectedId) return
                      setBookingToDelete(selectedId)
                      setIsBulkDeleting(false)
                      setDeleteDialogOpen(true)
                    }
                  }
                }
              ]}
            />
          </div>
        )
      }),
      columnHelper.accessor('statusAction', {
        header: 'Change Status',
        cell: ({ row }) => (
          <ActionStatusButton
            bookingId={row.original._id}
            currentStatus={row.original.status}
            bookingDetails={row.original}
            vendorId={vendorId}
            onUpdate={fetchData}
          />
        ),
        enableSorting: false
      })
    ],
    [router, fetchData, vendorId, bookingSourceFilter]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader title={vendorName ? `Booking Vendor - ${vendorName}` : 'Booking Management'} />
      <Divider />
      <CardContent>
        {/* Top Controls Row: Search, Booking Type, New Booking */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flex: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search Bookings'
              sx={{ width: { xs: '100%', sm: '300px' } }}
            />
            {/* Booking Type Dropdown moved here */}
            <FormControl size='small' sx={{ minWidth: 160 }}>
              <InputLabel id='booking-type-select-label'>Booking Type</InputLabel>
              <Select
                labelId='booking-type-select-label'
                id='booking-type-select'
                value={viewType}
                label='Booking Type'
                onChange={e => setViewType(e.target.value)}
              >
                <MenuItem value='bookings'>Bookings</MenuItem>
                <MenuItem value='subscription'>Subscription</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {Object.keys(rowSelection).length > 0 && (
              <Button
                variant='outlined'
                color='error'
                startIcon={<i className='ri-delete-bin-line' />}
                onClick={() => {
                  setIsBulkDeleting(true)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete Selected ({Object.keys(rowSelection).length})
              </Button>
            )}
            <Button
              variant='contained'
              component={Link}
              href={getLocalizedUrl('/pages/wizard-examples/property-listing', locale)}
              startIcon={<i className='ri-add-line' />}
              sx={{
                backgroundColor: '#22c55e',
                '&:hover': { backgroundColor: '#16a34a' }
              }}
            >
              New Booking
            </Button>
          </Box>
        </Box>

        {/* Secondary Controls Row: Status Tabs (Left) + User/Vendor Toggle (Right) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
            gap: 2,
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            pb: 2
          }}
        >
          {/* Status Tabs */}
          <Box sx={{ display: 'flex', gap: 0, overflowX: 'auto', maxWidth: { xs: '100%', lg: '65%' } }}>
            {['pending', 'approved', 'parked', 'completed', 'cancelled', 'all'].map(status => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                sx={{
                  textTransform: 'capitalize',
                  color: statusFilter === status ? '#22c55e' : '#64748b',
                  fontWeight: statusFilter === status ? 600 : 400,
                  borderBottom: statusFilter === status ? '2px solid #22c55e' : '2px solid transparent',
                  borderRadius: 0,
                  px: 2,
                  py: 1.5,
                  minWidth: 'auto',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    color: '#22c55e'
                  }
                }}
              >
                {status}
              </Button>
            ))}
          </Box>

          {/* Booking Source Toggle: User vs Vendor */}
          <Box
            sx={{
              backgroundColor: '#f1f5f9',
              p: 0.5,
              borderRadius: '12px',
              display: 'inline-flex',
              gap: 1,
              flexShrink: 0
            }}
          >
            {[
              { label: 'User Bookings', value: 'user' },
              { label: 'Vendor Bookings', value: 'vendor' }
            ].map(type => (
              <Button
                key={type.value}
                onClick={() => setBookingSourceFilter(type.value)}
                sx={{
                  textTransform: 'capitalize',
                  color: bookingSourceFilter === type.value ? '#fff' : '#64748b',
                  backgroundColor: bookingSourceFilter === type.value ? '#22c55e' : 'transparent',
                  fontWeight: 600,
                  borderRadius: '8px',
                  px: 2, // slightly reduced padding
                  py: 1,
                  fontSize: '0.85rem',
                  boxShadow: bookingSourceFilter === type.value ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: bookingSourceFilter === type.value ? '#16a34a' : '#e2e8f0',
                    color: bookingSourceFilter === type.value ? '#fff' : '#1e293b'
                  }
                }}
              >
                {type.label}
              </Button>
            ))}
          </Box>
        </Box>
      </CardContent>
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='flex justify-center items-center p-8'>
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity='error' className='m-4'>
            {error}
          </Alert>
        ) : table.getFilteredRowModel().rows.length === 0 ? (
          <Alert severity='info' className='m-4'>
            No bookings found
          </Alert>
        ) : (
          <>
            <table className={tableStyles.table}>
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='ri-arrow-up-s-line text-xl' />,
                              desc: <i className='ri-arrow-down-s-line text-xl' />
                            }[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component='div'
              className='border-bs'
              count={table.getFilteredRowModel().rows.length}
              rowsPerPage={table.getState().pagination.pageSize}
              page={table.getState().pagination.pageIndex}
              onPageChange={(_, page) => table.setPageIndex(page)}
              onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
            />
          </>
        )}
      </div>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby='delete-dialog-title'
        aria-describedby='delete-dialog-description'
      >
        <DialogTitle id='delete-dialog-title'>
          {isBulkDeleting ? 'Confirm Bulk Deletion' : 'Confirm Deletion'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='delete-dialog-description'>
            {isBulkDeleting
              ? `Are you sure you want to delete ${Object.keys(rowSelection).length} selected bookings? This action cannot be undone.`
              : 'Are you sure you want to delete this booking? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color='error' variant='contained' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default BookingEdit
