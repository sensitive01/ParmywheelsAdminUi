
// // React Imports
// import { useState, useEffect } from 'react'


// // MUI Imports
// import Grid from '@mui/material/Grid'
// import CardContent from '@mui/material/CardContent'
// import FormControl from '@mui/material/FormControl'
// import InputLabel from '@mui/material/InputLabel'
// import MenuItem from '@mui/material/MenuItem'
// import Select from '@mui/material/Select'
// import TextField from '@mui/material/TextField'

// const TableFilters = ({ setData, bookingData }) => {
//   const [vehicleType, setVehicleType] = useState('')
//   const [sts, setSts] = useState('')
//   const [status, setStatus] = useState('')
//   const [bookingDate, setBookingDate] = useState('')

//   useEffect(() => {
//     const filteredData = bookingData?.filter(booking => {
//       if (vehicleType && booking.vehicleType !== vehicleType) return false
//       if (sts && booking.sts !== sts) return false
//       if (status && booking.status !== status) return false
//       if (bookingDate && booking.bookingDate !== bookingDate) return false
      
// return true
//     })

//     setData(filteredData ?? [])
//   }, [vehicleType, sts, status, bookingDate, bookingData])

//   return (
//     <CardContent>
//       <Grid container spacing={8} style={{marginTop: "-55px"}}>
//         <Grid item xs={12} sm={3} style={{width:'400px'}}>
//           <FormControl fullWidth>
//             <InputLabel id='vehicle-type-select'>Vehicle Type</InputLabel>
//             <Select
//               fullWidth
//               value={vehicleType}
//               onChange={e => setVehicleType(e.target.value)}
//               labelId='vehicle-type-select'
//             >
//               <MenuItem value=''>Select Vehicle Type</MenuItem>
//               <MenuItem value='Car'>Car</MenuItem>
//               <MenuItem value='Bike'>Bike</MenuItem>
//               <MenuItem value='Other'>Other</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <FormControl fullWidth>
//             <InputLabel id='sts-select'>STS</InputLabel>
//             <Select
//               fullWidth
//               value={sts}
//               onChange={e => setSts(e.target.value)}
//               labelId='sts-select'
//             >
//               <MenuItem value=''>Select STS</MenuItem>
//               <MenuItem value='Instant'>Instant</MenuItem>
//               <MenuItem value='Subscription'>Subscription</MenuItem>
//               <MenuItem value='Schedule'>Schedule</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <FormControl fullWidth>
//             <InputLabel id='status-select'>Status</InputLabel>
//             <Select
//               fullWidth
//               value={status}
//               onChange={e => setStatus(e.target.value)}
//               labelId='status-select'
//             >
//               <MenuItem value=''>Select Status</MenuItem>
//               <MenuItem value='Pending'>Pending</MenuItem>
//               <MenuItem value='Approved'>Approved</MenuItem>
//               <MenuItem value='Cancelled'>Cancelled</MenuItem>
//               <MenuItem value='PARKED'>Parked</MenuItem>
//               <MenuItem value='COMPLETED'>Completed</MenuItem>
//             </Select>
//           </FormControl>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             fullWidth
//             label='Booking Date'
//             type='date'
//             value={bookingDate}
//             onChange={e => setBookingDate(e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>
//       </Grid>
//     </CardContent>
//   )
// }


// export default TableFilters


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

const TableFilters = ({ filters, onFilterChange, bookingData }) => {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [stsTypes, setStsTypes] = useState([])
  const [statusTypes, setStatusTypes] = useState([])
  const [bookingDates, setBookingDates] = useState([])

  useEffect(() => {
    if (bookingData && bookingData.length > 0) {
      // Get unique vehicle types
      const uniqueVehicleTypes = [...new Set(bookingData.map(item => item.vehicleType))].filter(Boolean)
      setVehicleTypes(uniqueVehicleTypes)

      // Get unique sts types
      const uniqueStsTypes = [...new Set(bookingData.map(item => item.sts))].filter(Boolean)
      setStsTypes(uniqueStsTypes)

      // Get unique status types
      const uniqueStatusTypes = [...new Set(bookingData.map(item => item.status))].filter(Boolean)
      setStatusTypes(uniqueStatusTypes)

      // Get unique booking dates
      const uniqueBookingDates = [...new Set(bookingData.map(item => item.bookingDate))].filter(Boolean)
      setBookingDates(uniqueBookingDates)
    }
  }, [bookingData])

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
