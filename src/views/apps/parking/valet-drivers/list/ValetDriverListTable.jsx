'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const ValetDriverListTable = () => {
  const [data, setData] = useState([])
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    licenseNumber: '',
    status: 'active'
  })
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    fetchVendors()
    fetchDrivers('')
  }, [])

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_URL}/vendor/all-vendors`)
      if (res.ok) {
        const result = await res.json()
        setVendors(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    }
  }

  const fetchDrivers = async (vendorId) => {
    setLoading(true)
    try {
      const query = vendorId ? `?vendorId=${vendorId}` : ''
      const res = await fetch(`${API_URL}/admin/valet-drivers${query}`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching drivers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVendorChange = (e) => {
    const val = e.target.value
    setSelectedVendor(val)
    fetchDrivers(val)
  }

  const handleEdit = (driver) => {
    setSelectedDriverId(driver._id)
    setFormData({
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      phone: driver.phone || '',
      email: driver.email || '',
      licenseNumber: driver.licenseNumber || '',
      status: driver.status || 'active'
    })
    setProofFile(null)
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
    setProofFile(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        e.target.value = null
        return
      }
      setProofFile(file)
    }
  }

  const handleSave = async () => {
    const form = new FormData()
    form.append('firstName', formData.firstName)
    form.append('lastName', formData.lastName)
    form.append('phone', formData.phone)
    form.append('email', formData.email)
    form.append('licenseNumber', formData.licenseNumber)
    form.append('status', formData.status)

    if (proofFile) {
      form.append('proof', proofFile)
    }

    try {
      const res = await fetch(`${API_URL}/admin/valet-driver/${selectedDriverId}`, {
        method: 'PUT',
        body: form
      })
      if (res.ok) {
        handleClose()
        fetchDrivers(selectedVendor)
      } else {
        console.error("Failed to update driver")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (driverId) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return
    try {
      const res = await fetch(`${API_URL}/admin/valet-driver/${driverId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchDrivers(selectedVendor)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Card>
      <CardHeader 
        title='Valet Drivers' 
        action={
          <TextField
            select
            size="small"
            value={selectedVendor}
            onChange={handleVendorChange}
            sx={{ minWidth: 200 }}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value="">
              <em>All Vendors</em>
            </MenuItem>
            {vendors.map((v) => (
              <MenuItem key={v._id} value={v._id}>
                {v.vendorName || v.companyName || v.email}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <Divider />
      <div className='overflow-x-auto p-4'>
        {loading ? (
          <Typography>Loading drivers...</Typography>
        ) : (
          <table className='min-w-full text-left border-collapse'>
            <thead>
              <tr className='border-b'>
                <th className='p-3'>S.No</th>
                <th className='p-3'>Name</th>
                <th className='p-3'>Phone</th>
                <th className='p-3'>Email</th>
                <th className='p-3'>Vendor</th>
                <th className='p-3'>Proof</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className='p-3 text-center'>No valet drivers found.</td>
                </tr>
              ) : (
                data.map((driver, index) => (
                  <tr key={driver._id} className='border-b hover:bg-gray-50'>
                    <td className='p-3'>{index + 1}</td>
                    <td className='p-3'>{driver.firstName} {driver.lastName}</td>
                    <td className='p-3'>{driver.phone || '-'}</td>
                    <td className='p-3'>{driver.email || '-'}</td>
                    <td className='p-3'>{driver.vendorId ? (driver.vendorId.vendorName || driver.vendorId.companyName || driver.vendorId.email) : 'Unknown'}</td>
                    <td className='p-3'>
                      {driver.proofUrl ? (
                        <a href={driver.proofUrl} target='_blank' rel='noopener noreferrer' className='text-blue-500 flex items-center'>
                          <InsertDriveFileOutlinedIcon fontSize='small' className='mr-1' /> View
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className='p-3'>
                      <Chip label={driver.status} color={driver.status === 'active' ? 'success' : 'default'} size='small' />
                    </td>
                    <td className='p-3'>
                      <IconButton onClick={() => handleEdit(driver)} color='primary'>
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(driver._id)} color='error'>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>Edit Valet Driver</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='First Name' 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Last Name' 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Phone' 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Email' 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                fullWidth 
                label='License Number' 
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <Typography variant='caption' className='mb-1 block'>Proof Document (Max 5MB)</Typography>
              <TextField 
                fullWidth 
                type="file"
                inputProps={{ accept: "image/*,application/pdf" }}
                onChange={handleFileChange}
              />
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                select
                fullWidth 
                label='Status' 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}>Update</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ValetDriverListTable
