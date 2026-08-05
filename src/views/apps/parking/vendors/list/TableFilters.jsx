// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const TableFilters = ({ filters, onFilterChange, bookingData }) => {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [stsTypes, setStsTypes] = useState([])
  const [statusTypes, setStatusTypes] = useState([])
  const [bookingDates, setBookingDates] = useState([])

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${API_URL}/vendor/booking-filters`)
        if (response.ok) {
          const result = await response.json()
          setVehicleTypes(result.vehicleTypes || [])
          setStsTypes(result.stsTypes || [])
          setStatusTypes(result.statusTypes || [])
        }
      } catch (error) {
        console.error('Error fetching filter options:', error)
      }
    }
    fetchFilterOptions()
  }, [])

  return (
    <CardContent>
      <Grid container spacing={8} style={{marginTop: "-55px"}}>
        <Grid item xs={12} sm={3} style={{width:'400px'}}>
          <FormControl fullWidth>
            <InputLabel id='vehicle-type-select'>Vehicle Type</InputLabel>
            <Select
              fullWidth
              value={filters.vehicleType}
              onChange={e => onFilterChange('vehicleType', e.target.value)}
              labelId='vehicle-type-select'
              label='Vehicle Type'
            >
              <MenuItem value=''>All Vehicle Types</MenuItem>
              {vehicleTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id='sts-select'>Booking Type</InputLabel>
            <Select
              fullWidth
              value={filters.sts}
              onChange={e => onFilterChange('sts', e.target.value)}
              labelId='sts-select'
              label='Booking Type'
            >
              <MenuItem value=''>All Booking Types</MenuItem>
              {stsTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl fullWidth>
            <InputLabel id='status-select'>Status</InputLabel>
            <Select
              fullWidth
              value={filters.status}
              onChange={e => onFilterChange('status', e.target.value)}
              labelId='status-select'
              label='Status'
            >
              <MenuItem value=''>All Statuses</MenuItem>
              {statusTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label='Booking Date'
            type='date'
            value={filters.bookingDate}
            onChange={e => onFilterChange('bookingDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
