'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const BookingSummaryChart = () => {
  // Hooks
  const theme = useTheme()
  
  // State for API data
  const [bookingData, setBookingData] = useState({
    totalCompletedBookings: 0,
    totalMonths: 0,
    totalAmount: '0.00',
    totalAmountThisMonth: '0.00'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/transaction-summary')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        
        if (data.success) {
          setBookingData({
            totalCompletedBookings: data.totalCompletedBookings,
            totalMonths: data.totalMonths,
            totalAmount: data.totalAmount,
            totalAmountThisMonth: data.totalAmountThisMonth
          })
        } else {
          setError(data.message || 'Failed to fetch booking summary')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const options = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: [
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main
    ],
    grid: {
      padding: {
        bottom: -30
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '15px',
      offsetY: 5,
      itemMargin: {
        horizontal: 28,
        vertical: 6
      },
      labels: {
        colors: theme.palette.text.secondary
      },
      markers: {
        offsetY: 1,
        offsetX: theme.direction === 'rtl' ? 4 : -1,
        width: 10,
        height: 10
      }
    },
    tooltip: { 
      enabled: true,
      y: {
        formatter: (value) => `${value} ${value === 1 ? 'transaction' : 'transactions'}`
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 4, lineCap: 'round', colors: [theme.palette.background.paper] },
    labels: ['Total Transactions', 'Months Tracked', 'Total Amount', 'This Month'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        endAngle: 130,
        startAngle: -130,
        customScale: 0.9,
        donut: {
          size: '83%',
          labels: {
            show: true,
            name: {
              offsetY: 25,
              fontSize: '0.9375rem',
              color: theme.palette.text.secondary
            },
            value: {
              offsetY: -15,
              fontWeight: 500,
              fontSize: '1.75rem',
              formatter: (value) => `${value}`,
              color: theme.palette.text.primary
            },
            total: {
              show: true,
              label: 'Total Transactions',
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                return `${total}`
              }
            }
          }
        }
      }
    }
  }

  const series = [
    bookingData.totalCompletedBookings,
    bookingData.totalMonths,
    parseFloat(bookingData.totalAmount) || 0,
    parseFloat(bookingData.totalAmountThisMonth) || 0
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader title="Transaction Summary" />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Transaction Summary" />
        <CardContent>
          <Typography color="error" variant="body2">
            Error: {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Transaction Summary'
        subheader={`Last ${bookingData.totalMonths} month(s) | Total: ₹${bookingData.totalAmount}`}
      />
      <CardContent>
        <AppReactApexCharts 
          type='donut' 
          height={373} 
          width='100%' 
          options={options} 
          series={series} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            This Month: <strong>₹{bookingData.totalAmountThisMonth}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Bookings: <strong>{bookingData.totalCompletedBookings}</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BookingSummaryChart
