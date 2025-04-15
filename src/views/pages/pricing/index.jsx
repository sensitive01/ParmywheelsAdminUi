// // // 'use client'
// // // // React Imports
// // // import { useState } from 'react'
// // // import { useSession } from 'next-auth/react'
// // // import axios from 'axios'
// // // // MUI Imports
// // // import Grid from '@mui/material/Grid'
// // // import Card from '@mui/material/Card'
// // // import CardHeader from '@mui/material/CardHeader'
// // // import CardContent from '@mui/material/CardContent'
// // // import Button from '@mui/material/Button'
// // // import TextField from '@mui/material/TextField'
// // // import FormControl from '@mui/material/FormControl'
// // // import InputLabel from '@mui/material/InputLabel'
// // // import MenuItem from '@mui/material/MenuItem'
// // // import Select from '@mui/material/Select'
// // // import Chip from '@mui/material/Chip'
// // // import Checkbox from '@mui/material/Checkbox'
// // // import ListItemText from '@mui/material/ListItemText'
// // // // Components Imports
// // // import CustomIconButton from '@core/components/mui/IconButton'
// // // const API_URL = process.env.NEXT_PUBLIC_API_URL
// // // const amenitiesList = [
// // //   'CCTV',
// // //   'Wi-Fi',
// // //   'Covered Parking',
// // //   'Self Car Wash',
// // //   'Charging',
// // //   'Restroom',
// // //   'Security',
// // //   'Gated Parking',
// // //   'Open Parking'
// // // ]
// // // const ProductVariants = () => {
// // //   // States
// // //   const [count, setCount] = useState(1)
// // //   const [amenities, setAmenities] = useState([])
// // //   const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
// // //   const { data: session } = useSession()
// // //   const vendorId = session?.user?.id
// // //   const handleAmenitiesChange = event => {
// // //     setAmenities(event.target.value)
// // //   }
// // //   const handleParkingEntryChange = (index, field, value) => {
// // //     const updatedEntries = [...parkingEntries]
// // //     updatedEntries[index][field] = value
// // //     setParkingEntries(updatedEntries)
// // //   }
// // //   const addParkingEntry = () => {
// // //     setParkingEntries([...parkingEntries, { amount: '', text: '' }])
// // //   }
// // //   const deleteParkingEntry = index => {
// // //     const updatedEntries = parkingEntries.filter((_, i) => i !== index)
// // //     setParkingEntries(updatedEntries)
// // //   }
// // //   const deleteForm = e => {
// // //     e.preventDefault()
// // //     e.target.closest('.repeater-item')?.remove()
// // //   }
// // //   const handleSubmit = async () => {
// // //     const payload = {
// // //       vendorId, // Replace with actual vendor ID
// // //       amenities,
// // //       parkingEntries
// // //     }
// // //     try {
// // //       const response = await fetch(`${API_URL}/vendor/amenities`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify(payload)
// // //       })
// // //       console.log('Response:', response.data)
// // //     } catch (error) {
// // //       console.error('Error submitting data:', error)
// // //     }
// // //   }
// // //   return (
// // //     <Card>
// // //       <CardHeader title='Variants & Amenities' />
// // //       <CardContent>
// // //         <Grid container spacing={6}>
// // //           <Grid item xs={12}>
// // //             <FormControl fullWidth>
// // //               <InputLabel>Amenities</InputLabel>
// // //               <Select
// // //                 multiple
// // //                 value={amenities}
// // //                 onChange={handleAmenitiesChange}
// // //                 renderValue={selected => (
// // //                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// // //                     {selected.map(value => (
// // //                       <Chip key={value} label={value} color='primary' />
// // //                     ))}
// // //                   </div>
// // //                 )}
// // //               >
// // //                 {amenitiesList.map(amenity => (
// // //                   <MenuItem key={amenity} value={amenity}>
// // //                     <Checkbox checked={amenities.indexOf(amenity) > -1} />
// // //                     <ListItemText primary={amenity} />
// // //                   </MenuItem>
// // //                 ))}
// // //               </Select>
// // //             </FormControl>
// // //           </Grid>
// // //           {parkingEntries.map((entry, index) => (
// // //             <Grid key={index} item xs={12} className='repeater-item'>
// // //               <Grid container spacing={6}>
// // //                 <Grid item xs={12} sm={4}>
// // //                   <TextField
// // //                     fullWidth
// // //                     label='Service Name'
// // //                     value={entry.text}
// // //                     onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
// // //                     placeholder='Enter Service Name' />
// // //                 </Grid>
// // //                 <Grid item xs={12} sm={8}>
// // //                   <div className='flex items-center gap-6'>
// // //                     <TextField fullWidth label='Amount'
// // //                       type='number'
// // //                       value={entry.amount}
// // //                       onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
// // //                       placeholder='Enter Amount'
// // //                     />
// // //                     <CustomIconButton onClick={deleteForm} className='min-is-fit'>
// // //                       <i className='ri-close-line' />
// // //                     </CustomIconButton>
// // //                   </div>
// // //                 </Grid>
// // //               </Grid>
// // //             </Grid>
// // //           ))}
// // //           <Grid item xs={12}>
// // //             <Button variant='contained' onClick={() => setCount(count + 1)} startIcon={<i className='ri-add-line' />}>
// // //               Add Another Option
// // //             </Button>
// // //           </Grid>
// // //           <Grid item xs={12}>
// // //             <Button variant='contained' color='success' onClick={handleSubmit}>
// // //               Submit Data
// // //             </Button>
// // //           </Grid>
// // //         </Grid>
// // //       </CardContent>
// // //     </Card>
// // //   )
// // // }
// // // export default ProductVariants
// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { useSession } from 'next-auth/react'
// // // MUI Imports
// // import Grid from '@mui/material/Grid'
// // import Card from '@mui/material/Card'
// // import CardHeader from '@mui/material/CardHeader'
// // import CardContent from '@mui/material/CardContent'
// // import Button from '@mui/material/Button'
// // import TextField from '@mui/material/TextField'
// // import FormControl from '@mui/material/FormControl'
// // import InputLabel from '@mui/material/InputLabel'
// // import MenuItem from '@mui/material/MenuItem'
// // import Select from '@mui/material/Select'
// // import Chip from '@mui/material/Chip'
// // import Checkbox from '@mui/material/Checkbox'
// // import ListItemText from '@mui/material/ListItemText'
// // import Paper from '@mui/material/Paper'
// // import Table from '@mui/material/Table'
// // import TableBody from '@mui/material/TableBody'
// // import TableCell from '@mui/material/TableCell'
// // import TableContainer from '@mui/material/TableContainer'
// // import TableHead from '@mui/material/TableHead'
// // import TableRow from '@mui/material/TableRow'
// // import IconButton from '@mui/material/IconButton'
// // import EditIcon from '@mui/icons-material/Edit'
// // // Components Imports
// // import CustomIconButton from '@core/components/mui/IconButton'
// // const API_URL = process.env.NEXT_PUBLIC_API_URL
// // const amenitiesList = [
// //   'CCTV',
// //   'Wi-Fi',
// //   'Covered Parking',
// //   'Self Car Wash',
// //   'Charging',
// //   'Restroom',
// //   'Security',
// //   'Gated Parking',
// //   'Open Parking'
// // ]
// // const ProductVariants = () => {
// //   // States
// //   const [count, setCount] = useState(1)
// //   const [amenities, setAmenities] = useState([])
// //   const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
// //   const [showForm, setShowForm] = useState(true)
// //   const [savedData, setSavedData] = useState(null)
// //   const [isEditMode, setIsEditMode] = useState(false)
// //   const [isLoading, setIsLoading] = useState(true)
// //   const { data: session } = useSession()
// //   const vendorId = session?.user?.id
// //   useEffect(() => {
// //     if (vendorId) {
// //       fetchAmenitiesData()
// //     }
// //   }, [vendorId])
// //   const fetchAmenitiesData = async () => {
// //     setIsLoading(true)
// //     try {
// //       const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorId}`)
// //       const data = await response.json()
// //       if (data?.AmenitiesData) {
// //         setSavedData(data.AmenitiesData)
// //         setShowForm(false)
// //       }
// //     } catch (error) {
// //       console.error('Error fetching amenities data:', error)
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }
// //   const handleAmenitiesChange = event => {
// //     setAmenities(event.target.value)
// //   }
// //   const handleParkingEntryChange = (index, field, value) => {
// //     const updatedEntries = [...parkingEntries]
// //     updatedEntries[index][field] = value
// //     setParkingEntries(updatedEntries)
// //   }
// //   const addParkingEntry = () => {
// //     setParkingEntries([...parkingEntries, { amount: '', text: '' }])
// //   }
// //   const deleteParkingEntry = index => {
// //     const updatedEntries = parkingEntries.filter((_, i) => i !== index)
// //     setParkingEntries(updatedEntries)
// //   }
// //   const handleEdit = () => {
// //     if (savedData) {
// //       setAmenities(savedData.amenities || [])
// //       setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
// //       setIsEditMode(true)
// //       setShowForm(true)
// //     }
// //   }
// //   const handleSubmit = async () => {
// //     const payload = {
// //       vendorId,
// //       amenities,
// //       parkingEntries: parkingEntries.map(({ amount, text }) => ({ amount, text })) // Only send required fields
// //     }
// //     try {
// //       const url = isEditMode
// //         ? `${API_URL}/vendor/updateamenitiesdata/${vendorId}`
// //         : `${API_URL}/vendor/amenities`
// //       const response = await fetch(url, {
// //         method: isEditMode ? 'PUT' : 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(payload)
// //       })
// //       const data = await response.json()
// //       if (data?.AmenitiesData) {
// //         setSavedData(data.AmenitiesData)
// //         setShowForm(false)
// //         setIsEditMode(false)
// //         // Refresh the data after submission
// //         fetchAmenitiesData()
// //       }
// //     } catch (error) {
// //       console.error('Error submitting data:', error)
// //     }
// //   }
// //   const renderDataView = () => {
// //     if (isLoading) {
// //       return (
// //         <Card>
// //           <CardContent>
// //             <div>Loading...</div>
// //           </CardContent>
// //         </Card>
// //       )
// //     }
// //     if (!savedData) {
// //       return (
// //         <Card>
// //           <CardContent>
// //             <div>No data available. Please add amenities and services.</div>
// //           </CardContent>
// //         </Card>
// //       )
// //     }
// //     return (
// //       <Card>
// //         <CardHeader
// //           title='Amenities & Services'
// //           action={
// //             <Button
// //               variant="contained"
// //               color="primary"
// //               startIcon={<EditIcon />}
// //               onClick={handleEdit}
// //             >
// //               Edit
// //             </Button>
// //           }
// //         />
// //         <CardContent>
// //           <Grid container spacing={4}>
// //             <Grid item xs={12}>
// //               <Paper>
// //                 <TableContainer>
// //                   <Table>
// //                     <TableHead>
// //                       <TableRow>
// //                         <TableCell>Available Amenities</TableCell>
// //                       </TableRow>
// //                     </TableHead>
// //                     <TableBody>
// //                       <TableRow>
// //                         <TableCell>
// //                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                             {savedData.amenities.map((amenity) => (
// //                               <Chip key={amenity} label={amenity} color="primary" />
// //                             ))}
// //                           </div>
// //                         </TableCell>
// //                       </TableRow>
// //                     </TableBody>
// //                   </Table>
// //                 </TableContainer>
// //               </Paper>
// //             </Grid>
// //             <Grid item xs={12}>
// //               <Paper>
// //                 <TableContainer>
// //                   <Table>
// //                     <TableHead>
// //                       <TableRow>
// //                         <TableCell>Service Name</TableCell>
// //                         <TableCell>Amount</TableCell>
// //                       </TableRow>
// //                     </TableHead>
// //                     <TableBody>
// //                       {savedData.parkingEntries.map((entry) => (
// //                         <TableRow key={entry._id}>
// //                           <TableCell>{entry.text}</TableCell>
// //                           <TableCell>{entry.amount}</TableCell>
// //                         </TableRow>
// //                       ))}
// //                     </TableBody>
// //                   </Table>
// //                 </TableContainer>
// //               </Paper>
// //             </Grid>
// //           </Grid>
// //         </CardContent>
// //       </Card>
// //     )
// //   }
// //   const renderForm = () => (
// //     <Card>
// //       <CardHeader title={isEditMode ? 'Edit Variants & Amenities' : 'Variants & Amenities'} />
// //       <CardContent>
// //         <Grid container spacing={6}>
// //           <Grid item xs={12}>
// //             <FormControl fullWidth>
// //               <InputLabel>Amenities</InputLabel>
// //               <Select
// //                 multiple
// //                 value={amenities}
// //                 onChange={handleAmenitiesChange}
// //                 renderValue={selected => (
// //                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                     {selected.map(value => (
// //                       <Chip key={value} label={value} color='primary' />
// //                     ))}
// //                   </div>
// //                 )}
// //               >
// //                 {amenitiesList.map(amenity => (
// //                   <MenuItem key={amenity} value={amenity}>
// //                     <Checkbox checked={amenities.indexOf(amenity) > -1} />
// //                     <ListItemText primary={amenity} />
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //             </FormControl>
// //           </Grid>
// //           {parkingEntries.map((entry, index) => (
// //             <Grid key={index} item xs={12} className='repeater-item'>
// //               <Grid container spacing={6}>
// //                 <Grid item xs={12} sm={4}>
// //                   <TextField
// //                     fullWidth
// //                     label='Service Name'
// //                     value={entry.text}
// //                     onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
// //                     placeholder='Enter Service Name'
// //                   />
// //                 </Grid>
// //                 <Grid item xs={12} sm={8}>
// //                   <div className='flex items-center gap-6'>
// //                     <TextField
// //                       fullWidth
// //                       label='Amount'
// //                       type='number'
// //                       value={entry.amount}
// //                       onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
// //                       placeholder='Enter Amount'
// //                     />
// //                     {parkingEntries.length > 1 && (
// //                       <CustomIconButton onClick={() => deleteParkingEntry(index)} className='min-is-fit'>
// //                         <i className='ri-close-line' />
// //                       </CustomIconButton>
// //                     )}
// //                   </div>
// //                 </Grid>
// //               </Grid>
// //             </Grid>
// //           ))}
// //           <Grid item xs={12}>
// //             <Button
// //               variant='contained'
// //               onClick={addParkingEntry}
// //               startIcon={<i className='ri-add-line' />}
// //             >
// //               Add Another Option
// //             </Button>
// //           </Grid>
// //           <Grid item xs={12}>
// //             <Button variant='contained' color='success' onClick={handleSubmit}>
// //               {isEditMode ? 'Update' : 'Submit'} Data
// //             </Button>
// //           </Grid>
// //         </Grid>
// //       </CardContent>
// //     </Card>
// //   )
// //   return showForm ? renderForm() : renderDataView()
// // }
// // export default ProductVariants
// // // // MUI Imports
// // // import Card from '@mui/material/Card'
// // // import CardContent from '@mui/material/CardContent'
// // // // Component Imports
// // // import Pricing from '@components/pricing'
// // // const PricingPage = ({ data }) => {
// // //   return (
// // //     <Card>
// // //       <CardContent className='xl:!plb-16 xl:pli-[6.25rem] pbs-10 pbe-5 pli-5 sm:p-16'>
// // //         <Pricing data={data} />
// // //       </CardContent>
// // //     </Card>
// // //   )
// // // }
// // // export default PricingPage

// // 'use client'
// // import { useState, useEffect } from 'react'
// // import { useSession } from 'next-auth/react'
// // import { DataGrid } from '@mui/x-data-grid'
// // import Grid from '@mui/material/Grid'
// // import Card from '@mui/material/Card'
// // import CardHeader from '@mui/material/CardHeader'
// // import CardContent from '@mui/material/CardContent'
// // import Button from '@mui/material/Button'
// // import TextField from '@mui/material/TextField'
// // import FormControl from '@mui/material/FormControl'
// // import InputLabel from '@mui/material/InputLabel'
// // import MenuItem from '@mui/material/MenuItem'
// // import Select from '@mui/material/Select'
// // import Chip from '@mui/material/Chip'
// // import Checkbox from '@mui/material/Checkbox'
// // import ListItemText from '@mui/material/ListItemText'
// // import EditIcon from '@mui/icons-material/Edit'
// // import CustomIconButton from '@core/components/mui/IconButton'
// // import Stack from '@mui/material/Stack'

// // const API_URL = process.env.NEXT_PUBLIC_API_URL

// // const amenitiesList = [
// //   'CCTV',
// //   'Wi-Fi',
// //   'Covered Parking',
// //   'Self Car Wash',
// //   'Charging',
// //   'Restroom',
// //   'Security',
// //   'Gated Parking',
// //   'Open Parking'
// // ]

// // const ProductVariants = () => {
// //   // States
// //   const [count, setCount] = useState(1)
// //   const [amenities, setAmenities] = useState([])
// //   const [parkingEntries, setParkingEntries] = useState([{ amount: '', text: '' }])
// //   const [showForm, setShowForm] = useState(true)
// //   const [savedData, setSavedData] = useState(null)
// //   const [isEditMode, setIsEditMode] = useState(false)
// //   const [isLoading, setIsLoading] = useState(true)

// //   const { data: session } = useSession()
// //   const vendorId = session?.user?.id

// //   // DataGrid columns configuration
// //   const parkingColumns = [
// //     { 
// //       field: 'text', 
// //       headerName: 'Service Name', 
// //       flex: 1,
// //       renderCell: (params) => (
// //         <div style={{ fontWeight: 500 }}>{params.value}</div>
// //       )
// //     },
// //     { 
// //       field: 'amount', 
// //       headerName: 'Amount', 
// //       flex: 1,
// //       renderCell: (params) => (
// //         <div style={{ color: '#2196f3', fontWeight: 500 }}>
// //           ₹{params.value}
// //         </div>
// //       )
// //     }
// //   ]

// //   useEffect(() => {
// //     if (vendorId) {
// //       fetchAmenitiesData()
// //     }
// //   }, [vendorId])

// //   const fetchAmenitiesData = async () => {
// //     setIsLoading(true)
// //     try {
// //       const response = await fetch(`${API_URL}/vendor/getamenitiesdata/${vendorId}`)
// //       const data = await response.json()
// //       if (data?.AmenitiesData) {
// //         setSavedData(data.AmenitiesData)
// //         setShowForm(false)
// //       }
// //     } catch (error) {
// //       console.error('Error fetching amenities data:', error)
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const handleAmenitiesChange = event => {
// //     setAmenities(event.target.value)
// //   }

// //   const handleParkingEntryChange = (index, field, value) => {
// //     const updatedEntries = [...parkingEntries]
// //     updatedEntries[index][field] = value
// //     setParkingEntries(updatedEntries)
// //   }

// //   const addParkingEntry = () => {
// //     setParkingEntries([...parkingEntries, { amount: '', text: '' }])
// //   }

// //   const deleteParkingEntry = index => {
// //     const updatedEntries = parkingEntries.filter((_, i) => i !== index)
// //     setParkingEntries(updatedEntries)
// //   }

// //   const handleEdit = () => {
// //     if (savedData) {
// //       setAmenities(savedData.amenities || [])
// //       setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
// //       setIsEditMode(true)
// //       setShowForm(true)
// //     }
// //   }

// //   const handleCancel = () => {
// //     setShowForm(false)
// //     setIsEditMode(false)
// //     // Reset form data to saved state
// //     if (savedData) {
// //       setAmenities(savedData.amenities || [])
// //       setParkingEntries(savedData.parkingEntries || [{ amount: '', text: '' }])
// //     }
// //   }

// //   const handleSubmit = async () => {
// //     const payload = {
// //       vendorId,
// //       amenities,
// //       parkingEntries: parkingEntries.map(({ amount, text }) => ({ amount, text }))
// //     }

// //     try {
// //       const url = isEditMode
// //         ? `${API_URL}/vendor/updateamenitiesdata/${vendorId}`
// //         : `${API_URL}/vendor/amenities`

// //       const response = await fetch(url, {
// //         method: isEditMode ? 'PUT' : 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(payload)
// //       })

// //       const data = await response.json()
// //       if (data?.AmenitiesData) {
// //         setSavedData(data.AmenitiesData)
// //         setShowForm(false)
// //         setIsEditMode(false)
// //         fetchAmenitiesData()
// //       }
// //     } catch (error) {
// //       console.error('Error submitting data:', error)
// //     }
// //   }

// //   const renderDataView = () => {
// //     if (isLoading) {
// //       return (
// //         <Card>
// //           <CardContent>
// //             <div>Loading...</div>
// //           </CardContent>
// //         </Card>
// //       )
// //     }

// //     if (!savedData) {
// //       return (
// //         <Card>
// //           <CardContent>
// //             <div>No data available. Please add amenities and services.</div>
// //           </CardContent>
// //         </Card>
// //       )
// //     }

// //     return (
// //       <Card>
// //         <CardHeader
// //           title='Amenities & Services'
// //           action={
// //             <Button
// //               variant="contained"
// //               color="primary"
// //               startIcon={<EditIcon />}
// //               onClick={handleEdit}
// //             >
// //               Edit
// //             </Button>
// //           }
// //         />
// //         <CardContent>
// //           <Grid container spacing={4}>
// //             <Grid item xs={12}>
// //               <Card>
// //                 <CardHeader title="Available Amenities" />
// //                 <CardContent>
// //                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                     {savedData.amenities.map((amenity) => (
// //                       <Chip
// //                         key={amenity}
// //                         label={amenity}
// //                         color="primary"
// //                         variant="outlined"
// //                         style={{ padding: '15px', fontSize: '1rem' }}
// //                       />
// //                     ))}
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </Grid>
// //             <Grid item xs={12}>
// //               <Card>
// //                 <CardHeader title="Services & Pricing" />
// //                 <CardContent>
// //                   <div style={{ height: 400, width: '100%' }}>
// //                     <DataGrid
// //                       rows={savedData.parkingEntries.map((entry, index) => ({
// //                         id: index,
// //                         ...entry
// //                       }))}
// //                       columns={parkingColumns}
// //                       pageSize={5}
// //                       rowsPerPageOptions={[5, 10, 20]}
// //                       disableSelectionOnClick
// //                       autoHeight
// //                       sx={{
// //                         '& .MuiDataGrid-cell:hover': {
// //                           color: 'primary.main',
// //                         },
// //                       }}
// //                     />
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </Grid>
// //           </Grid>
// //         </CardContent>
// //       </Card>
// //     )
// //   }

// //   const renderForm = () => (
// //     <Card>
// //       <CardHeader title={isEditMode ? 'Edit Variants & Amenities' : 'Variants & Amenities'} />
// //       <CardContent>
// //         <Grid container spacing={6}>
// //           <Grid item xs={12}>
// //             <FormControl fullWidth>
// //               <InputLabel>Amenities</InputLabel>
// //               <Select
// //                 multiple
// //                 value={amenities}
// //                 onChange={handleAmenitiesChange}
// //                 renderValue={selected => (
// //                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                     {selected.map(value => (
// //                       <Chip key={value} label={value} color='primary' />
// //                     ))}
// //                   </div>
// //                 )}
// //               >
// //                 {amenitiesList.map(amenity => (
// //                   <MenuItem key={amenity} value={amenity}>
// //                     <Checkbox checked={amenities.indexOf(amenity) > -1} />
// //                     <ListItemText primary={amenity} />
// //                   </MenuItem>
// //                 ))}
// //               </Select>
// //             </FormControl>
// //           </Grid>
// //           {parkingEntries.map((entry, index) => (
// //             <Grid key={index} item xs={12} className='repeater-item'>
// //               <Grid container spacing={6}>
// //                 <Grid item xs={12} sm={4}>
// //                   <TextField
// //                     fullWidth
// //                     label='Service Name'
// //                     value={entry.text}
// //                     onChange={e => handleParkingEntryChange(index, 'text', e.target.value)}
// //                     placeholder='Enter Service Name'
// //                   />
// //                 </Grid>
// //                 <Grid item xs={12} sm={8}>
// //                   <div className='flex items-center gap-6'>
// //                     <TextField
// //                       fullWidth
// //                       label='Amount'
// //                       type='number'
// //                       value={entry.amount}
// //                       onChange={e => handleParkingEntryChange(index, 'amount', e.target.value)}
// //                       placeholder='Enter Amount'
// //                     />
// //                     {parkingEntries.length > 1 && (
// //                       <CustomIconButton onClick={() => deleteParkingEntry(index)} className='min-is-fit'>
// //                         <i className='ri-close-line' />
// //                       </CustomIconButton>
// //                     )}
// //                   </div>
// //                 </Grid>
// //               </Grid>
// //             </Grid>
// //           ))}
// //           <Grid item xs={12}>
// //             <Button
// //               variant='contained'
// //               onClick={addParkingEntry}
// //               startIcon={<i className='ri-add-line' />}
// //             >
// //               Add Another Option
// //             </Button>
// //           </Grid>
// //           <Grid item xs={12}>
// //             <Stack direction="row" spacing={2} justifyContent="flex-start">
// //               <Button variant='contained' color='success' onClick={handleSubmit}>
// //                 {isEditMode ? 'Update' : 'Submit'} Dat
// //               </Button>
// //               <Button variant='outlined' color='secondary' onClick={handleCancel}>
// //                 Cancel
// //               </Button>
// //             </Stack>
// //           </Grid>
// //         </Grid>
// //       </CardContent>
// //     </Card>
// //   )

// //   return showForm ? renderForm() : renderDataView()
// // }

// // export default ProductVariants


// 'use client'
// import { useState } from 'react'
// import axios from 'axios'
// import { 
//   Box, 
//   Button, 
//   Card, 
//   CardContent, 
//   TextField, 
//   Typography, 
//   FormControl, 
//   FormLabel, 
//   RadioGroup, 
//   FormControlLabel, 
//   Radio,
//   IconButton,
//   Snackbar,
//   Alert
// } from '@mui/material'
// import CloudUploadIcon from '@mui/icons-material/CloudUpload'
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
// import { styled } from '@mui/material/styles'
// import PlanManagementTable from './plantable'

// const VisuallyHiddenInput = styled('input')({
//   clip: 'rect(0 0 0 0)',
//   clipPath: 'inset(50%)',
//   height: 1,
//   overflow: 'hidden',
//   position: 'absolute',
//   bottom: 0,
//   left: 0,
//   whiteSpace: 'nowrap',
//   width: 1,
// })

// const PlanCreationForm = () => {
//   const [planDetails, setPlanDetails] = useState({
//     planName: '',
//     validity: '',
//     amount: '',
//     features: [''],
//     status: 'disable',
//     image: null
//   })

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   })

//   const handleInputChange = (e) => {
//     const { name, value } = e.target
//     setPlanDetails(prev => ({
//       ...prev,
//       [name]: value
//     }))
//   }

//   const handleFeatureChange = (index, value) => {
//     const newFeatures = [...planDetails.features]
//     newFeatures[index] = value
//     setPlanDetails(prev => ({
//       ...prev,
//       features: newFeatures
//     }))
//   }

//   const addFeatureField = () => {
//     setPlanDetails(prev => ({
//       ...prev,
//       features: [...prev.features, '']
//     }))
//   }

//   const removeFeatureField = (index) => {
//     const newFeatures = planDetails.features.filter((_, i) => i !== index)
//     setPlanDetails(prev => ({
//       ...prev,
//       features: newFeatures.length ? newFeatures : ['']
//     }))
//   }

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0]
//     setPlanDetails(prev => ({
//       ...prev,
//       image: file
//     }))
//   }

//   const handleCreatePlan = async () => {
//     // Validate form fields
//     if (!planDetails.planName || !planDetails.validity || 
//         !planDetails.amount || !planDetails.image) {
//       setSnackbar({
//         open: true,
//         message: 'Please fill all required fields',
//         severity: 'error'
//       })
//       return
//     }

//     // Create FormData for multipart/form-data
//     const formData = new FormData()
//     formData.append('planName', planDetails.planName)
//     formData.append('validity', planDetails.validity)
//     formData.append('amount', planDetails.amount)

//     // Append features
//     planDetails.features.forEach((feature, index) => {
//       if (feature.trim()) {
//         formData.append('features', feature.trim())
//       }
//     })

//     formData.append('status', planDetails.status)
//     formData.append('image', planDetails.image)

//     try {
//       // const response = await axios.post('http://13.48.42.169:4000/admin/createplan', formData, {
//         const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/createplan`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       })

//       // Success handling
//       setSnackbar({
//         open: true,
//         message: 'Plan created successfully!',
//         severity: 'success'
//       })

//       // Reset form after successful submission
//       setPlanDetails({
//         planName: '',
//         validity: '',
//         amount: '',
//         features: [''],
//         status: 'disable',
//         image: null
//       })

//     } catch (error) {
//       // Error handling
//       setSnackbar({
//         open: true,
//         message: error.response?.data?.message || 'Error creating plan',
//         severity: 'error'
//       })
//       console.error('Plan creation error:', error)
//     }
//   }

//   const handleCloseSnackbar = () => {
//     setSnackbar(prev => ({ ...prev, open: false }))
//   }

//   return (
//     <>
//     <Box sx={{ 
//       backgroundColor: '#329a73', 
//       minHeight: '100vh', 
//       display: 'flex', 
//       justifyContent: 'center', 
//       alignItems: 'center',
//       padding: 2 
//     }}>
//       <Card sx={{ 
//         width: '100%', 
//         maxWidth: 500, 
//         borderRadius: 3 
//       }}>
//         <CardContent sx={{ p: 3 }}>
//           <Typography 
//             variant="h5" 
//             component="h1" 
//             sx={{ 
//               mb: 3, 
//               textAlign: 'center', 
//               color: '#329a73' 
//             }}
//           >
//             Create New Plan
//           </Typography>

//           <TextField
//             fullWidth
//             label="Plan Name"
//             name="planName"
//             value={planDetails.planName}
//             onChange={handleInputChange}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             fullWidth
//             label="Validity (in days)"
//             name="validity"
//             type="number"
//             value={planDetails.validity}
//             onChange={handleInputChange}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             fullWidth
//             label="Amount"
//             name="amount"
//             type="number"
//             value={planDetails.amount}
//             onChange={handleInputChange}
//             InputProps={{
//               startAdornment: '₹'
//             }}
//             sx={{ mb: 2 }}
//           />

//           {/* Dynamic Features Input */}
//           <Typography variant="subtitle1" sx={{ mb: 1 }}>
//             Features
//           </Typography>
//           {planDetails.features.map((feature, index) => (
//             <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//               <TextField
//                 fullWidth
//                 label="Feature"
//                 name="feature"
//                 variant="outlined"
//                 value={feature}
//                 onChange={(e) => handleFeatureChange(index, e.target.value)}
//                 sx={{ mr: 1 }}
//               />
//               {index === planDetails.features.length - 1 && (
//                 <IconButton onClick={addFeatureField} color="primary">
//                   <AddCircleOutlineIcon />
//                 </IconButton>
//               )}
//               {planDetails.features.length > 1 && (
//                 <IconButton onClick={() => removeFeatureField(index)} color="error">
//                   <DeleteOutlineIcon />
//                 </IconButton>
//               )}
//             </Box>
//           ))}

//           {/* Plan Status */}
//           <FormControl component="fieldset" sx={{ mb: 2, width: '100%', mt: 2 }}>
//             <FormLabel component="legend">Plan Status</FormLabel>
//             <RadioGroup
//               row
//               name="status"
//               value={planDetails.status}
//               onChange={handleInputChange}
//             >
//               <FormControlLabel 
//                 value="enable" 
//                 control={<Radio />} 
//                 label="Enable" 
//               />
//               <FormControlLabel 
//                 value="disable" 
//                 control={<Radio />} 
//                 label="Disable" 
//               />
//             </RadioGroup>
//           </FormControl>

//           {/* Image Upload */}
//           <Button
//             component="label"
//             variant="contained"
//             startIcon={<CloudUploadIcon />}
//             sx={{ 
//               mt: 2, 
//               mb: 2, 
//               backgroundColor: '#329a73',
//               '&:hover': {
//                 backgroundColor: '#3d8b40'
//               }
//             }}
//           >
//             Upload Plan Image
//             <VisuallyHiddenInput 
//               type="file" 
//               accept="image/*"
//               onChange={handleImageUpload}
//             />
//           </Button>
//           {planDetails.image && (
//             <Typography variant="body2" sx={{ mt: 1 }}>
//               {planDetails.image.name}
//             </Typography>
//           )}

//           {/* Create Plan Button */}
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={handleCreatePlan}
//             sx={{ 
//               mt: 2, 
//               backgroundColor: '#329a73',
//               borderRadius: 2,
//               py: 1.5,
//               '&:hover': {
//                 backgroundColor: '#3d8b40'
//               }
//             }}
//           >
//             Create Plan
//           </Button>

//           {/* Snackbar for notifications */}
//           <Snackbar
//             open={snackbar.open}
//             autoHideDuration={6000}
//             onClose={handleCloseSnackbar}
//             anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//           >
//             <Alert 
//               onClose={handleCloseSnackbar}
//               severity={snackbar.severity}
//               sx={{ width: '100%' }}
//             >
//               {snackbar.message}
//             </Alert>
//           </Snackbar>
//         </CardContent>
//       </Card>
//     </Box>
//     <PlanManagementTable/>
//     </>
//   )
// }
// export default PlanCreationForm
'use client'
import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import PropTypes from 'prop-types'
import axios from 'axios'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Stack,
  Checkbox
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'

const PlanManagementTable = () => {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedPlans, setSelectedPlans] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/getallplan`)

      const plansData = (Array.isArray(response.data)
        ? response.data
        : response.data.plans
        || response.data.data
        || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features)
            ? plan.features
            : (plan.features ? plan.features.split(',').map(f => f.trim()) : [])
        }))

      setPlans(plansData)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching plans',
        severity: 'error'
      })
      console.error('Error fetching plans:', error)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/deleteplan/${selectedPlan._id}`)

      setPlans(plans.filter(plan => plan._id !== selectedPlan._id))

      setDeleteDialogOpen(false)
      setSnackbar({
        open: true,
        message: 'Plan deleted successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting plan',
        severity: 'error'
      })
      console.error('Error deleting plan:', error)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan)
    setDeleteDialogOpen(true)
  }

  const handleEditPlan = (plan) => {
    router.push(`/en/pages/planform?id=${plan._id}`)
  }

  const handleViewPlan = (plan) => {
    router.push(`/en/pages/plandetails/${plan._id}`)
  }

  const handleSelectPlan = (planId) => {
    setSelectedPlans(prev =>
      prev.includes(planId)
        ? prev.filter(id => id !== planId)
        : [...prev, planId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPlans([])
    } else {
      setSelectedPlans(plans.map(plan => plan._id))
    }

    setSelectAll(!selectAll)
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <CircularProgress />
      </Box>
    )
  }

  if (plans.length === 0) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h6" sx={{ color: '#329a73', mb: 2 }}>
          No plans found
        </Typography>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#329a73' }}
          onClick={() => router.push('/en/pages/planform')}
        >
          Create New Plan
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{
      backgroundColor: '#f4f4f4',
      minHeight: '100vh',
      p: 3
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            color: '#329a73'
          }}
        >
          Plan Management
        </Typography>

        <Button
          variant='contained'
          onClick={() => router.push('/en/pages/planform')}
          startIcon={<i className='ri-add-line' />}
          className='max-sm:is-full is-auto'
          sx={{ backgroundColor: '#329a73' }}
        >
          Add Plan
        </Button>
      </Box>

      {selectedPlans.length > 0 && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
          backgroundColor: '#e6f3ef',
          p: 2,
          borderRadius: 2
        }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {selectedPlans.length} plan(s) selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#329a73' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': {
                      color: 'white'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>S.No</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Validity</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Features</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Images</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan, index) => (
              <TableRow key={plan._id} hover>
                <TableCell>
                  <Checkbox
                    checked={selectedPlans.includes(plan._id)}
                    onChange={() => handleSelectPlan(plan._id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{plan.planName}</TableCell>
                <TableCell>{plan.role}</TableCell>
                <TableCell>{plan.validity} days</TableCell>
                <TableCell>₹{plan.amount}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {plan.features && plan.features.map((feature, index) => (
                      <Chip
                        key={index}
                        label={feature}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </Stack>
                </TableCell>
                <TableCell>
                  {plan.image && (
                    <Avatar
                      variant="rounded"
                      src={plan.image}
                      alt={`${plan.planName} image`}
                      sx={{
                        width: 70,
                        height: 70,
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: plan.status === 'enable' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}
                  >
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {/* <IconButton 
                    color="primary" 
                    onClick={() => handleViewPlan(plan)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton> */}
                  <IconButton
                    color="secondary"
                    onClick={() => handleEditPlan(plan)}
                    title="Edit Plan"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => openDeleteDialog(plan)}
                    title="Delete Plan"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Are you sure you want to delete the plan "{selectedPlan?.planName}"? 
            This action cannot be undone.
          </DialogContentText> */}
          <DialogContentText>
            Are you sure you want to delete the plan &quot;{selectedPlan?.planName}&quot;?
            This action cannot be undone.
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeletePlan} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

PlanManagementTable.propTypes = {

}

PlanManagementTable.propTypes = {
  plans: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    validity: PropTypes.number.isRequired,
    amount: PropTypes.number.isRequired,
    status: PropTypes.oneOf(['enable', 'disable']).isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string
  }))
}

export default PlanManagementTable
