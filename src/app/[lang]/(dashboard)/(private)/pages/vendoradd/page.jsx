'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Paper from '@mui/material/Paper'
import Container from '@mui/material/Container'

// Icon Imports
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'

// Custom Components
import CustomIconButton from '@/@core/components/mui/IconButton'

// Styled Component Imports
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import { styled } from '@mui/material/styles'
import CustomAvatar from '@core/components/mui/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useDropzone } from 'react-dropzone'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
    '& .dropzone': {
        minHeight: 'unset',
        padding: theme.spacing(12),
        [theme.breakpoints.down('sm')]: {
            paddingInline: theme.spacing(5)
        },
        '&+.MuiList-root .MuiListItem-root .file-name': {
            fontWeight: theme.typography.body1.fontWeight
        }
    }
}))

// Product Image Component
const ProductImage = ({ onChange, existingImage }) => {
    const [files, setFiles] = useState([])

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            setFiles(acceptedFiles)
            if (onChange) {
                onChange(acceptedFiles[0])
            }
        }
    })

    const renderFilePreview = file => {
        return file.type?.startsWith('image') ? (
            <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
        ) : (
            <i className='ri-file-text-line' />
        )
    }

    const handleRemoveFile = file => {
        const filteredFiles = files.filter(i => i.name !== file.name)
        setFiles(filteredFiles)
        if (onChange && filteredFiles.length === 0) {
            onChange(null)
        }
    }

    const handleRemoveAllFiles = () => {
        setFiles([])
        if (onChange) {
            onChange(null)
        }
    }

    return (
        <Dropzone>
            <Card>
                <CardHeader title='Upload Vendor Banner' />
                <CardContent>
                    <div {...getRootProps({ className: 'dropzone' })}>
                        <input {...getInputProps()} />
                        <div className='flex items-center flex-col gap-2 text-center'>
                            <CustomAvatar variant='rounded' skin='light' color='secondary'>
                                <i className='ri-upload-2-line' />
                            </CustomAvatar>
                            <Typography variant='h4'>Drag and Drop Your Image Here</Typography>
                            <Typography color='text.disabled'>or</Typography>
                            <Button variant='outlined' size='small'>
                                Browse Image
                            </Button>
                        </div>
                    </div>
                    {existingImage && files.length === 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Typography variant="body2">Current image is being used</Typography>
                        </Box>
                    )}
                    {files.length > 0 && (
                        <>
                            <List>
                                {files.map(file => (
                                    <ListItem key={file.name} className='pis-4 plb-3'>
                                        <div className='file-details'>
                                            <div className='file-preview'>{renderFilePreview(file)}</div>
                                            <div>
                                                <Typography className='file-name font-medium' color='text.primary'>
                                                    {file.name}
                                                </Typography>
                                                <Typography className='file-size' variant='body2'>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </Typography>
                                            </div>
                                        </div>
                                        <IconButton onClick={() => handleRemoveFile(file)}>
                                            <i className='ri-close-line text-xl' />
                                        </IconButton>
                                    </ListItem>
                                ))}
                            </List>
                            <div className='buttons'>
                                <Button color='error' variant='outlined' onClick={handleRemoveAllFiles}>
                                    Remove All
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </Dropzone>
    )
}

// Main Vendor Create Component
const VendorCreate = () => {
    const { data: session } = useSession()
    const router = useRouter()
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    // States for form data
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [vendorName, setVendorName] = useState('')
    const [contacts, setContacts] = useState([{ id: 1, name: '', mobile: '' }])
    const [address, setAddress] = useState('')
    const [landMark, setLandMark] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [parkingEntries, setParkingEntries] = useState([{ type: '', count: '' }])
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    })

    // Handlers for form inputs
    const handleAddContact = () => setContacts([...contacts, { id: Date.now(), name: '', mobile: '' }])
    const handleRemoveContact = id => setContacts(contacts.filter(contact => contact.id !== id))
    const handleAddParkingEntry = () => setParkingEntries([...parkingEntries, { type: '', count: '' }])
    const handleRemoveParkingEntry = index => setParkingEntries(parkingEntries.filter((_, i) => i !== index))

    // Submit handler
    const handleSubmit = async () => {
        if (!vendorName || !address || !password || !confirmPassword) {
            setSnackbar({
                open: true,
                message: 'Please fill in all required fields',
                severity: 'error'
            })
            return
        }

        if (password !== confirmPassword) {
            setSnackbar({
                open: true,
                message: 'Passwords do not match',
                severity: 'error'
            })
            return
        }

        const formData = new FormData()
        formData.append('vendorName', vendorName)
        formData.append('address', address)
        formData.append('landmark', landMark)
        formData.append('latitude', latitude)
        formData.append('longitude', longitude)
        formData.append('password', password)

        const formattedContacts = contacts.map(contact => ({
            name: contact.name,
            mobile: contact.mobile
        }))
        formData.append('contacts', JSON.stringify(formattedContacts))

        const formattedParkingEntries = parkingEntries
            .filter(entry => entry.type && entry.count)
            .map(entry => ({
                type: entry.type,
                count: entry.count
            }))
        formData.append('parkingEntries', JSON.stringify(formattedParkingEntries))

        if (image) {
            formData.append('image', image)
        }

        try {
            setLoading(true)

            // const response = await axios.post(`${API_URL}/vendor/signup`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // })
            const response = await axios.post(
                'http://localhost:4000/vendor/signup',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
              );


            if (response.status === 201) {
                setSnackbar({
                    open: true,
                    message: 'Vendor created successfully!',
                    severity: 'success'
                })

                // Reset form
                setVendorName('')
                setContacts([{ id: 1, name: '', mobile: '' }])
                setAddress('')
                setLandMark('')
                setLatitude('')
                setLongitude('')
                setParkingEntries([{ type: '', count: '' }])
                setPassword('')
                setConfirmPassword('')
                setImage(null)
                setImagePreview(null)

                router.push('/apps/ecommerce/products/list')
            } else {
                setSnackbar({
                    open: true,
                    message: response.data.message || 'Failed to create vendor',
                    severity: 'error'
                })
            }
        } catch (error) {
            console.error('Error creating vendor:', error)
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Something went wrong!',
                severity: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardContent>
                <Typography variant='h4' sx={{ mb: 4 }} align='center'>
                    Create New Vendor
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label='Vendor Name'
                            value={vendorName}
                            onChange={e => setVendorName(e.target.value)}
                            required
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {contacts.map((contact, index) => (
                        <Grid item xs={12} key={contact.id || index}>
                            <Grid container spacing={3} alignItems='center'>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label={`Contact Name ${index + 1}`}
                                        value={contact.name}
                                        onChange={e => {
                                            const updatedContacts = [...contacts]
                                            updatedContacts[index].name = e.target.value
                                            setContacts(updatedContacts)
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <TextField
                                            fullWidth
                                            label={`Contact Number ${index + 1}`}
                                            value={contact.mobile}
                                            onChange={e => {
                                                const updatedContacts = [...contacts]
                                                updatedContacts[index].mobile = e.target.value
                                                setContacts(updatedContacts)
                                            }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position='start'>IN (+91)</InputAdornment>
                                            }}
                                        />
                                        {contacts.length > 1 && (
                                            <IconButton onClick={() => handleRemoveContact(contact.id)} color='error'>
                                                <RemoveIcon />
                                            </IconButton>
                                        )}
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Button variant='contained' onClick={handleAddContact} startIcon={<AddIcon />}>
                            Add Another Contact
                        </Button>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label='Address'
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder='Enter complete address'
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Latitude'
                            value={latitude}
                            onChange={e => setLatitude(e.target.value)}
                            placeholder='Enter latitude (e.g., 28.6139)'
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Longitude'
                            value={longitude}
                            onChange={e => setLongitude(e.target.value)}
                            placeholder='Enter longitude (e.g., 77.209)'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label='Landmark'
                            value={landMark}
                            onChange={e => setLandMark(e.target.value)}
                            placeholder='Enter a nearby landmark'
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Password'
                            type='password'
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label='Confirm Password'
                            type='password'
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sx={{ mb: 3 }}>
                        <ProductImage
                            onChange={(file) => {
                                setImage(file)
                                if (file) {
                                    const previewUrl = URL.createObjectURL(file)
                                    setImagePreview(previewUrl)
                                }
                            }}
                            existingImage={imagePreview}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Parking Entries</Typography>
                        <Grid container spacing={2}>
                            {parkingEntries.map((entry, index) => (
                                <Grid key={index} item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Parking Type</InputLabel>
                                                <Select
                                                    value={entry.type}
                                                    onChange={(e) => {
                                                        const updatedEntries = [...parkingEntries]
                                                        updatedEntries[index].type = e.target.value
                                                        setParkingEntries(updatedEntries)
                                                    }}
                                                    label="Parking Type"
                                                >
                                                    <MenuItem value="Cars">Cars</MenuItem>
                                                    <MenuItem value="Bikes">Bikes</MenuItem>
                                                    <MenuItem value="Others">Others</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <TextField
                                                    label="Count"
                                                    value={entry.count}
                                                    onChange={(e) => {
                                                        const updatedEntries = [...parkingEntries]
                                                        updatedEntries[index].count = e.target.value
                                                        setParkingEntries(updatedEntries)
                                                    }}
                                                    fullWidth
                                                />
                                                {parkingEntries.length > 1 && (
                                                    <CustomIconButton onClick={() => handleRemoveParkingEntry(index)} color='error'>
                                                        <RemoveIcon />
                                                    </CustomIconButton>
                                                )}
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 2, mb: 4 }}>
                            <Button variant="contained" onClick={handleAddParkingEntry} startIcon={<AddIcon />}>
                                Add Another Option
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{ px: 4, py: 1 }}
                        >
                            {loading ? 'Creating...' : 'Create Vendor'}
                        </Button>
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

// Main Page Component
const VendorCreatePage = () => {
    return (
        <div maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" sx={{ mb: 4 }}>
                New Vendor
            </Typography>
            <VendorCreate />
        </div>
    )
}

export default VendorCreatePage
