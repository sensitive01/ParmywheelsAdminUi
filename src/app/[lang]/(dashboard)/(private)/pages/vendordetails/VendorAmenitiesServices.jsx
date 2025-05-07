'use client'
import { useState, useEffect } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

import CustomIconButton from '@core/components/mui/IconButton'

const amenitiesList = [
  'CCTV',
  'Wi-Fi',
  'Covered Parking',
  'Self Car Wash',
  'Charging',
  'Restroom',
  'Security',
  'Gated Parking',
  'Open Parking'
]

const VendorAmenitiesServices = ({ vendorId }) => {
  // States
  const [amenities, setAmenities] = useState([])
  const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
  const [isLoading, setIsLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // DataGrid columns configuration
  const parkingColumns = [
    { 
      field: 'text', 
      headerName: 'Service Name', 
      flex: 1,
      renderCell: (params) => (
        <div style={{ fontWeight: 500 }}>{params.value}</div>
      )
    },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      flex: 1,
      renderCell: (params) => (
        <div style={{ color: '#2196f3', fontWeight: 500 }}>
          ₹{params.value}
        </div>
      )
    }
  ]

  useEffect(() => {
    if (vendorId) {
      fetchAmenitiesData()
    }
  }, [vendorId])

  const fetchAmenitiesData = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorId}`)
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }
      
      const data = await response.json()

      // Handle both possible response formats
      const amenitiesData = data?.AmenitiesData || data?.updatedAmenitiesData
      
      if (amenitiesData) {
        // Set the form data from the fetched data
        setAmenities(amenitiesData.amenities || [])
        setParkingEntries(amenitiesData.parkingEntries?.length > 0 
          ? amenitiesData.parkingEntries 
          : [{ amount: '', text: '' }]
        )
      }
    } catch (error) {
      console.error('Error fetching amenities data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load amenities data: ' + error.message,
        severity: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmenitiesChange = event => {
    setAmenities(event.target.value)
  }

  const handleParkingEntryChange = (index, field, value) => {
    const updatedEntries = [...parkingEntries]
    updatedEntries[index][field] = value
    setParkingEntries(updatedEntries)
  }

  const addParkingEntry = () => {
    setParkingEntries([...parkingEntries, { amount: '', text: '' }])
  }

  const deleteParkingEntry = index => {
    const updatedEntries = parkingEntries.filter((_, i) => i !== index)
    setParkingEntries(updatedEntries)
  }

  // Function to update amenities only
  const updateAmenities = async () => {
    try {
      const amenitiesPayload = {
        vendorId,
        amenities
      }
      
      console.log('Submitting amenities payload:', amenitiesPayload)
      
      const amenitiesResponse = await fetch(`${API_URL}/vendor/updateamenitiesdata/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(amenitiesPayload),
        credentials: 'include'
      })
      
      if (!amenitiesResponse.ok) {
        throw new Error(`Server responded with status: ${amenitiesResponse.status}`)
      }
      
      const amenitiesData = await amenitiesResponse.json()
      console.log('Amenities update response:', amenitiesData)
      
      // Update local state if successful
      if (amenitiesData?.updatedAmenitiesData) {
        setAmenities(amenitiesData.updatedAmenitiesData.amenities || [])
      }
      
      return amenitiesData
    } catch (error) {
      console.error('Error updating amenities:', error)
      throw error
    }
  }
  
  // Function to update parking entries only
  const updateParkingEntries = async () => {
    try {
      // Validate parking entries
      if (parkingEntries.some(entry => !entry.text || !entry.amount)) {
        throw new Error('Please fill in all service name and amount fields')
      }
      
      const parkingPayload = {
        vendorId,
        parkingEntries
      }
      
      console.log('Submitting parking entries payload:', parkingPayload)
      
      const parkingResponse = await fetch(`${API_URL}/vendor/updateparkingentries/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parkingPayload),
        credentials: 'include'
      })
      
      if (!parkingResponse.ok) {
        throw new Error(`Server responded with status: ${parkingResponse.status}`)
      }
      
      const parkingData = await parkingResponse.json()
      console.log('Parking entries update response:', parkingData)
      
      // Update local state if successful
      if (parkingData?.updatedParkingEntries) {
        setParkingEntries(parkingData.updatedParkingEntries.length > 0 
          ? parkingData.updatedParkingEntries 
          : [{ amount: '', text: '' }]
        )
      }
      
      return parkingData
    } catch (error) {
      console.error('Error updating parking entries:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    setUpdateLoading(true)
    
    try {
      // Update both amenities and parking entries
      const amenitiesResult = await updateAmenities()
      const parkingResult = await updateParkingEntries()
      
      setSnackbar({
        open: true,
        message: 'Amenities and services updated successfully!',
        severity: 'success'
      })
      
      // Refresh data to ensure consistency
      await fetchAmenitiesData()
      
    } catch (error) {
      console.error('Error submitting data:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Failed to save data',
        severity: 'error'
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 6}}>
      <CardHeader 
        title='Edit Amenities & Services' 
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
      />
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} sx={{ mt: 6}}>
            <FormControl fullWidth>
              <InputLabel>Amenities</InputLabel>
              <Select
                multiple
                value={amenities}
                onChange={handleAmenitiesChange}
                renderValue={selected => (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selected.map(value => (
                      <Chip key={value} label={value} color='primary' />
                    ))}
                  </div>
                )}
              >
                {amenitiesList.map(amenity => (
                  <MenuItem key={amenity} value={amenity}>
                    <Checkbox checked={amenities.indexOf(amenity) > -1} />
                    <ListItemText primary={amenity} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* {parkingEntries.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Services & Pricing</Typography>
              <div style={{ height: 'auto', maxHeight: 300, width: '100%', mb: 4 }}>
                <DataGrid
                  rows={parkingEntries.map((entry, index) => ({
                    id: index,
                    ...entry
                  }))}
                  columns={parkingColumns}
                  pageSize={5}
                  autoHeight
                  sx={{
                    '& .MuiDataGrid-cell:hover': {
                      color: 'primary.main',
                    },
                  }}
                />
              </div>
            </Grid>
          )} */}
          
          {parkingEntries.map((entry, index) => (
            <Grid key={index} item xs={12} className='repeater-item'>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='Service Name'
                    value={entry.text || ''}
                    onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
                    placeholder='Enter Service Name'
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <div className='flex items-center gap-6'>
                    <TextField
                      fullWidth
                      label='Amount'
                      type='number'
                      value={entry.amount || ''}
                      onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
                      placeholder='Enter Amount'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>₹</InputAdornment>
                      }}
                    />
                    {parkingEntries.length > 1 && (
                      <CustomIconButton onClick={() => deleteParkingEntry(index)} className='min-is-fit'>
                        <i className='ri-close-line' />
                      </CustomIconButton>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              variant='contained'
              onClick={addParkingEntry}
              startIcon={<i className='ri-add-line' />}
            >
              Add Another Service
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-start">
              <Button 
                variant='contained' 
                color='success' 
                onClick={handleSubmit}
                disabled={isLoading || updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Amenities & Services'}
                {updateLoading && <CircularProgress size={24} sx={{ ml: 1, color: 'white' }} />}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default VendorAmenitiesServices
