'use client'

import { useState, useEffect } from 'react'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid2'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddLineIcon from '@mui/icons-material/Add'
import tableStyles from '@core/styles/table.module.css'
import classnames from 'classnames'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const EmployeeListTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    userName: '',
    userMobile: '',
    userEmail: '',
    userPassword: '',
    employeeId: '',
    designation: '',
    dob: '',
    gender: '',
    joiningDate: '',
    salary: '',
    status: 'Active'
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/employees`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setEditMode(false)
    setSelectedId(null)
    setErrors({})
    setFormData({
      userName: '',
      userMobile: '',
      userEmail: '',
      userPassword: '',
      employeeId: '',
      designation: '',
      dob: '',
      gender: '',
      joiningDate: '',
      salary: '',
      status: 'Active'
    })
    setOpen(true)
  }

  const handleEdit = (emp) => {
    setEditMode(true)
    setSelectedId(emp._id)
    setErrors({})
    setFormData({
      userName: emp.userName || '',
      userMobile: emp.userMobile || '',
      userEmail: emp.userEmail || '',
      userPassword: '', // Don't show password on edit, only if they want to change
      employeeId: emp.employeeId || '',
      designation: emp.designation || '',
      dob: emp.dob || '',
      gender: emp.gender || '',
      joiningDate: emp.joiningDate || '',
      salary: emp.salary || '',
      status: emp.status || 'Active'
    })
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
  }

  const handleSave = async () => {
    const newErrors = {}
    if (!formData.userMobile || !/^\d{10}$/.test(formData.userMobile)) {
      newErrors.userMobile = 'Enter a valid 10-digit mobile number'
    }
    if (!formData.userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.userEmail)) {
      newErrors.userEmail = 'Enter a valid email address'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})

    try {
      let res;
      if (editMode) {
        res = await fetch(`${API_URL}/admin/employee/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        res = await fetch(`${API_URL}/admin/employee`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      if (res.ok) {
        handleClose()
        fetchEmployees()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return
    try {
      const res = await fetch(`${API_URL}/admin/employee/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchEmployees()
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <CardHeader 
        title='Employee Directory' 
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<AddLineIcon />}>
            Add Employee
          </Button>
        }
      />
      <Divider />
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='p-4'>
            <Typography>Loading employees...</Typography>
          </div>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" className='text-center'>No employees found.</td>
                </tr>
              ) : (
                data.map((emp, index) => (
                  <tr key={emp._id}>
                    <td>{index + 1}</td>
                    <td>{emp.userName}</td>
                    <td>{emp.employeeId || '-'}</td>
                    <td>{emp.userMobile}</td>
                    <td>{emp.designation || '-'}</td>
                    <td>
                      <Chip label={emp.status} color={emp.status === 'Active' ? 'success' : 'default'} size='small' />
                    </td>
                    <td>
                      <div className='flex items-center'>
                        <IconButton onClick={() => handleEdit(emp)} color='primary'>
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(emp._id)} color='error'>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Employee ID' 
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Name' 
                value={formData.userName}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Mobile Number' 
                value={formData.userMobile}
                onChange={(e) => {
                  setFormData({...formData, userMobile: e.target.value})
                  if (errors.userMobile) setErrors({...errors, userMobile: ''})
                }}
                error={!!errors.userMobile}
                helperText={errors.userMobile}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label='Email' 
                value={formData.userEmail}
                onChange={(e) => {
                  setFormData({...formData, userEmail: e.target.value})
                  if (errors.userEmail) setErrors({...errors, userEmail: ''})
                }}
                error={!!errors.userEmail}
                helperText={errors.userEmail}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                label={editMode ? 'New Password (Leave empty to keep)' : 'Password'} 
                type={showPassword ? 'text' : 'password'}
                value={formData.userPassword}
                onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={() => setShowPassword(!showPassword)}
                        edge='end'
                      >
                        {showPassword ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                select
                fullWidth 
                label='Designation' 
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              >
                <MenuItem value='Marketing'>Marketing</MenuItem>
              </TextField>
            </Grid>

            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                select
                fullWidth 
                label='Gender' 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <MenuItem value='Male'>Male</MenuItem>
                <MenuItem value='Female'>Female</MenuItem>
                <MenuItem value='Other'>Other</MenuItem>
              </TextField>
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                type="date"
                label='Date of Birth' 
                InputLabelProps={{ shrink: true }}
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                type="date"
                label='Joining Date' 
                InputLabelProps={{ shrink: true }}
                value={formData.joiningDate}
                onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
              />
            </Grid>
            <Grid
              size={{xs: 12, sm: 6}}>
              <TextField 
                fullWidth 
                type="number"
                label='Salary' 
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
              />
            </Grid>
            {editMode && (
              <Grid size={{xs: 12}}>
                <TextField 
                  select
                  fullWidth 
                  label='Status' 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value='Active'>Active</MenuItem>
                  <MenuItem value='Inactive'>Inactive</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}>{editMode ? 'Update' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EmployeeListTable
