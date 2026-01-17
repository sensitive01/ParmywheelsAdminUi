'use client'

import { useState, useEffect } from 'react'

import { DataGrid } from '@mui/x-data-grid'
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab
} from '@mui/material'
import { Delete, Visibility, Edit } from '@mui/icons-material'
import axios from 'axios'

const KycDataTable = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  const [kycData, setKycData] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [searchText, setSearchText] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedKyc, setSelectedKyc] = useState(null)
  const [currentViewItem, setCurrentViewItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [editFormData, setEditFormData] = useState({
    idProof: '',
    idProofNumber: '',
    addressProof: '',
    addressProofNumber: '',
    status: '',
    idProofImage: null,
    addressProofImage: null
  })

  const [idProofImagePreview, setIdProofImagePreview] = useState('')
  const [addressProofImagePreview, setAddressProofImagePreview] = useState('')

  const idProofTypes = [
    'Passport',
    'Driving License',
    'Phone Bill',
    'Ration Card',
    'Pancard',
    'Latest Bank Statement',
    'Aadhar Card',
    'Bank Passbook Photo',
    'Others'
  ]

  const addressProofTypes = ['Driving License', 'Passport', 'Ration Card', 'Aadhar Card']

  const fetchVendorName = async vendorId => {
    try {
      const response = await axios.get(`${baseUrl}/vendor/fetch-vendor-data?id=${vendorId}`)

      if (response.data && response.data.data && response.data.data.vendorName) {
        return response.data.data.vendorName
      }

      return 'N/A'
    } catch (error) {
      console.error('Error fetching vendor name:', error)

      return 'N/A'
    }
  }

  useEffect(() => {
    fetchKycData()
  }, [])

  const fetchKycData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${baseUrl}/vendor/getallkyc`)

      const formattedData = await Promise.all(
        response.data.data.map(async (item, index) => {
          const vendorName = await fetchVendorName(item.vendorId)

          return {
            ...item,
            id: item._id,
            slNo: index + 1,
            vendorName: vendorName
          }
        })
      )

      setKycData(formattedData)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching KYC data',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const verifyKyc = async vendorId => {
    try {
      await axios.put(`${baseUrl}/vendor/verifykyc/${vendorId}`)
      setKycData(prevData =>
        prevData.map(item => (item.vendorId === vendorId ? { ...item, status: 'Verified' } : item))
      )
      setSnackbar({ open: true, message: 'KYC verified successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error verifying KYC',
        severity: 'error'
      })
    }
  }

  const rejectKyc = async vendorId => {
    try {
      await axios.put(`${baseUrl}/vendor/verifykyc/${vendorId}`, {
        status: 'Rejected'
      })
      setKycData(prevData =>
        prevData.map(item => (item.vendorId === vendorId ? { ...item, status: 'Rejected' } : item))
      )
      setSnackbar({ open: true, message: 'KYC rejected successfully', severity: 'success' })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error rejecting KYC',
        severity: 'error'
      })
    }
  }

  const handleView = item => {
    setCurrentViewItem(item)
    setViewDialogOpen(true)
  }

  const handleEditClick = async item => {
    try {
      setLoading(true)
      const response = await axios.get(`${baseUrl}/vendor/getkyc/${item.vendorId}`)

      if (response.data && response.data.data) {
        const kycDetails = response.data.data

        setEditFormData({
          idProof: kycDetails.idProof,
          idProofNumber: kycDetails.idProofNumber,
          addressProof: kycDetails.addressProof,
          addressProofNumber: kycDetails.addressProofNumber,
          status: kycDetails.status,
          idProofImage: null,
          addressProofImage: null
        })
        setIdProofImagePreview(kycDetails.idProofImage)
        setAddressProofImagePreview(kycDetails.addressProofImage)
        setSelectedKyc(item)
        setEditDialogOpen(true)
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error fetching KYC details',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = item => {
    setSelectedKyc(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseUrl}/admin/delete/${selectedKyc.id}`)
      setKycData(prevData => prevData.filter(item => item.id !== selectedKyc.id))
      setSnackbar({
        open: true,
        message: 'KYC record deleted successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting KYC record',
        severity: 'error'
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedKyc(null)
    }
  }

  const handleEditFormChange = e => {
    const { name, value } = e.target

    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]

    if (file) {
      if (type === 'idProof') {
        setEditFormData(prev => ({
          ...prev,
          idProofImage: file
        }))
        setIdProofImagePreview(URL.createObjectURL(file))
      } else {
        setEditFormData(prev => ({
          ...prev,
          addressProofImage: file
        }))
        setAddressProofImagePreview(URL.createObjectURL(file))
      }
    }
  }

  const handleEditSubmit = async () => {
    try {
      setLoading(true)
      const formData = new FormData()

      // Append all fields to formData
      formData.append('idProof', editFormData.idProof)
      formData.append('idProofNumber', editFormData.idProofNumber)
      formData.append('addressProof', editFormData.addressProof)
      formData.append('addressProofNumber', editFormData.addressProofNumber)
      formData.append('status', editFormData.status)

      if (editFormData.idProofImage instanceof File) {
        formData.append('idProofImage', editFormData.idProofImage)
      }

      if (editFormData.addressProofImage instanceof File) {
        formData.append('addressProofImage', editFormData.addressProofImage)
      }

      const response = await axios.put(
        `${baseUrl}/vendor/updatekyc/${selectedKyc.vendorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setSnackbar({
        open: true,
        message: 'KYC updated successfully',
        severity: 'success'
      })

      // Refresh the data
      fetchKycData()
      setEditDialogOpen(false)
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error updating KYC',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = event => {
    setSearchText(event.target.value)
  }

  const filteredData = kycData.filter(item => {
    // 1. Filter by Tab
    if (activeTab === 0) {
      if (item.status === 'Verified' || item.status === 'Rejected') return false
    } else if (activeTab === 1) {
      if (item.status !== 'Verified') return false
    } else if (activeTab === 2) {
      if (item.status !== 'Rejected') return false
    }

    // 2. Filter by Search Text
    return Object.values(item).some(value => value && value.toString().toLowerCase().includes(searchText.toLowerCase()))
  })

  const columns = [
    { field: 'slNo', headerName: 'Sl No', width: 90 },
    { field: 'vendorId', headerName: 'Vendor ID', width: 220 },
    { field: 'vendorName', headerName: 'Vendor Name', width: 220 },
    { field: 'idProof', headerName: 'ID Proof', width: 180 },
    { field: 'idProofNumber', headerName: 'ID Proof Number', width: 200 },
    {
      field: 'idProofImage',
      headerName: 'ID Proof Image',
      width: 200,
      renderCell: params => (
        <img src={params.value} alt='ID Proof' style={{ width: 50, height: 50, objectFit: 'contain' }} />
      )
    },
    { field: 'addressProof', headerName: 'Address Proof', width: 180 },
    { field: 'addressProofNumber', headerName: 'Address Proof Number', width: 200 },
    {
      field: 'addressProofImage',
      headerName: 'Address Proof Image',
      width: 200,
      renderCell: params => (
        <img src={params.value} alt='Address Proof' style={{ width: 50, height: 50, objectFit: 'contain' }} />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 250,
      renderCell: params => {
        if (params.value === 'Verified') {
          return <Chip label='Verified' color='success' />
        } else if (params.value === 'Rejected') {
          return <Chip label='Rejected' color='error' />
        }

        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant='contained' color='success' onClick={() => verifyKyc(params.row.vendorId)} size='small'>
              Approve
            </Button>
            <Button variant='contained' color='error' onClick={() => rejectKyc(params.row.vendorId)} size='small'>
              Reject
            </Button>
          </Box>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton color='primary' onClick={() => handleView(params.row)} size='small'>
            <Visibility />
          </IconButton>
          <IconButton color='primary' onClick={() => handleEditClick(params.row)} size='small'>
            <Edit />
          </IconButton>
          <IconButton color='error' onClick={() => handleDeleteClick(params.row)} size='small'>
            <Delete />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <Box sx={{ height: '100%', width: '100%', padding: 2 }}>
      <Typography variant='h3' sx={{ mb: 2, textAlign: 'center' }}>
        KYC Details
      </Typography>

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 2 }}>
        <Tab label='Pending' />
        <Tab label='Verified' />
        <Tab label='Rejected' />
      </Tabs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          label='Search'
          variant='outlined'
          value={searchText}
          onChange={handleSearch}
          size='small'
          sx={{ width: 300 }}
        />
      </Box>
      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection={false}
        loading={loading}
        autoHeight
        sx={{
          '& .MuiDataGrid-cell': {
            padding: '8px'
          }
        }}
      />

      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth='lg' fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Typography variant='h5'>KYC Details Verification</Typography>
        </DialogTitle>
        <DialogContent>
          {currentViewItem && (
            <Box sx={{ pt: 2 }}>
              {/* Vendor Information Header */}
              <Box sx={{ mb: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Vendor Name
                    </Typography>
                    <Typography variant='h6'>{currentViewItem.vendorName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Vendor ID
                    </Typography>
                    <Typography variant='h6' sx={{ fontFamily: 'monospace' }}>
                      {currentViewItem.vendorId}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Grid container spacing={4}>
                {/* ID Proof Section */}
                <Grid item xs={12} md={6}>
                  <Card variant='outlined' sx={{ height: '100%' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText'
                      }}
                    >
                      <Typography variant='h6'>ID Proof Details</Typography>
                    </Box>
                    <CardContent>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Proof Type
                          </Typography>
                          <Typography variant='body1' fontWeight='medium'>
                            {currentViewItem.idProof}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Proof Number
                          </Typography>
                          <Typography variant='body1' fontWeight='medium'>
                            {currentViewItem.idProofNumber}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                        Document Image
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          bgcolor: 'black',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={currentViewItem.idProofImage}
                          alt='ID Proof'
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Address Proof Section */}
                <Grid item xs={12} md={6}>
                  <Card variant='outlined' sx={{ height: '100%' }}>
                    <Box
                      sx={{
                        p: 2,
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'secondary.main',
                        color: 'secondary.contrastText'
                      }}
                    >
                      <Typography variant='h6'>Address Proof Details</Typography>
                    </Box>
                    <CardContent>
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Proof Type
                          </Typography>
                          <Typography variant='body1' fontWeight='medium'>
                            {currentViewItem.addressProof}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant='subtitle2' color='text.secondary'>
                            Proof Number
                          </Typography>
                          <Typography variant='body1' fontWeight='medium'>
                            {currentViewItem.addressProofNumber}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                        Document Image
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          bgcolor: 'black',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={currentViewItem.addressProofImage}
                          alt='Address Proof'
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant='contained'>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Edit KYC Details</DialogTitle>
        <DialogContent>
          {selectedKyc && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant='h6'>Vendor ID: {selectedKyc.vendorId}</Typography>
              <Typography variant='h6'>Vendor Name: {selectedKyc.vendorName}</Typography>

              <Box sx={{ display: 'flex', gap: 4 }}>
                {/* ID Proof Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle1' sx={{ mb: 2 }}>
                    ID Proof Details
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>ID Proof Type</InputLabel>
                    <Select
                      name='idProof'
                      value={editFormData.idProof}
                      onChange={handleEditFormChange}
                      label='ID Proof Type'
                    >
                      {idProofTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label='ID Proof Number'
                    name='idProofNumber'
                    value={editFormData.idProofNumber}
                    onChange={handleEditFormChange}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      ID Proof Image:
                    </Typography>
                    <input
                      accept='image/*'
                      type='file'
                      id='id-proof-image-upload'
                      onChange={e => handleImageChange(e, 'idProof')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor='id-proof-image-upload'>
                      <Button variant='contained' component='span' sx={{ mb: 1 }}>
                        Upload New ID Proof
                      </Button>
                    </label>
                    {idProofImagePreview && (
                      <img
                        src={idProofImagePreview}
                        alt='ID Proof Preview'
                        style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginTop: 1 }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Address Proof Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant='subtitle1' sx={{ mb: 2 }}>
                    Address Proof Details
                  </Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Address Proof Type</InputLabel>
                    <Select
                      name='addressProof'
                      value={editFormData.addressProof}
                      onChange={handleEditFormChange}
                      label='Address Proof Type'
                    >
                      {addressProofTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label='Address Proof Number'
                    name='addressProofNumber'
                    value={editFormData.addressProofNumber}
                    onChange={handleEditFormChange}
                    sx={{ mb: 2 }}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      Address Proof Image:
                    </Typography>
                    <input
                      accept='image/*'
                      type='file'
                      id='address-proof-image-upload'
                      onChange={e => handleImageChange(e, 'addressProof')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor='address-proof-image-upload'>
                      <Button variant='contained' component='span' sx={{ mb: 1 }}>
                        Upload New Address Proof
                      </Button>
                    </label>
                    {addressProofImagePreview && (
                      <img
                        src={addressProofImagePreview}
                        alt='Address Proof Preview'
                        style={{ maxWidth: '100%', maxHeight: 200, display: 'block', marginTop: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select name='status' value={editFormData.status} onChange={handleEditFormChange} label='Status'>
                  <MenuItem value='Verified'>Verified</MenuItem>
                  <MenuItem value='Not Verified'>Not Verified</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant='contained' color='primary' disabled={loading}>
            {loading ? 'Updating...' : 'Update KYC'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this KYC record?</Typography>
          <Typography variant='subtitle2' sx={{ mt: 2 }}>
            KYC ID: {selectedKyc?.id}
          </Typography>
          <Typography variant='subtitle2'>Vendor Name: {selectedKyc?.vendorName}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default KycDataTable
