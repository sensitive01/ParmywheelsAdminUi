// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const TableFilters = ({ filters, onFilterChange, vendors = [], selectedVendor = '', onVendorChange }) => {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [stsTypes, setStsTypes] = useState([])
  const [statusTypes, setStatusTypes] = useState([])

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
    <Grid container spacing={3} alignItems='center'>
      {/* 1. Vendor */}
      <Grid item xs={12} sm={6} md={3}>
        <Autocomplete
          fullWidth
          size='small'
          id='vendor-autocomplete'
          options={vendors}
          getOptionLabel={option => option.vendorName || ''}
          value={vendors.find(v => v._id === selectedVendor) || null}
          onChange={(event, newValue) => {
            if (onVendorChange) {
              onVendorChange(newValue ? newValue._id : '')
            }
          }}
          renderInput={params => <TextField {...params} size='small' label='Vendor' placeholder='All Vendors' />}
        />
      </Grid>

      {/* 2. Vehicle Type */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size='small'>
          <InputLabel id='vehicle-type-select'>Vehicle Type</InputLabel>
          <Select
            fullWidth
            size='small'
            value={filters.vehicleType || ''}
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

      {/* 3. Booking Type */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size='small'>
          <InputLabel id='sts-select'>Booking Type</InputLabel>
          <Select
            fullWidth
            size='small'
            value={filters.sts || ''}
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

      {/* 4. Status */}
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth size='small'>
          <InputLabel id='status-select'>Status</InputLabel>
          <Select
            fullWidth
            size='small'
            value={filters.status || ''}
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

      {/* 5. Booking From Date */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          size='small'
          label='Booking From Date'
          type='date'
          value={filters.bookingFromDate || ''}
          onChange={e => onFilterChange('bookingFromDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* 6. Booking From Time */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          size='small'
          label='Booking From Time'
          type='time'
          value={filters.bookingFromTime || ''}
          onChange={e => onFilterChange('bookingFromTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />
      </Grid>

      {/* 7. Booking To Date */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          size='small'
          label='Booking To Date'
          type='date'
          value={filters.bookingToDate || ''}
          onChange={e => onFilterChange('bookingToDate', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* 8. Booking To Time */}
      <Grid item xs={12} sm={6} md={3}>
        <TextField
          fullWidth
          size='small'
          label='Booking To Time'
          type='time'
          value={filters.bookingToTime || ''}
          onChange={e => onFilterChange('bookingToTime', e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ step: 300 }}
        />
      </Grid>
    </Grid>
  )
}

export default TableFilters
