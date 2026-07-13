'use client'

import { useState, useEffect } from 'react'
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

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddLineIcon from '@mui/icons-material/Add'
import tableStyles from '@core/styles/table.module.css'
import classnames from 'classnames'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const LeavesTable = () => {
  const [data, setData] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  
  const getToday = () => new Date().toISOString().split('T')[0]
  
  const [formData, setFormData] = useState({
    employeeId: '',
    fromDate: getToday(),
    toDate: getToday(),
    category: 'Leave',
    type: 'Casual',
    permissionType: 'Personal Work',
    permissionDate: getToday(),
    startTime: '',
    endTime: '',
    reason: '',
    status: 'Pending'
  })

  useEffect(() => {
    fetchEmployees()
    fetchLeaves()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/employees`)
      if (res.ok) {
        const json = await res.json()
        setEmployees(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
    }
  }

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/leaves`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setEditMode(false)
    setSelectedId(null)
    setFormData({
      employeeId: '',
      fromDate: getToday(),
      toDate: getToday(),
      category: 'Leave',
      type: 'Casual',
      permissionType: 'Personal Work',
      permissionDate: getToday(),
      startTime: '',
      endTime: '',
      reason: '',
      status: 'Pending'
    })
    setOpen(true)
  }

  const handleEdit = (record) => {
    setEditMode(true)
    setSelectedId(record._id)
    setFormData({
      employeeId: record.employeeId?._id || record.employeeId,
      fromDate: record.fromDate ? new Date(record.fromDate).toISOString().split('T')[0] : getToday(),
      toDate: record.toDate ? new Date(record.toDate).toISOString().split('T')[0] : getToday(),
      category: record.category || 'Leave',
      type: record.type || 'Casual',
      permissionType: record.permissionType || 'Personal Work',
      permissionDate: record.permissionDate ? new Date(record.permissionDate).toISOString().split('T')[0] : getToday(),
      startTime: record.startTime || '',
      endTime: record.endTime || '',
      reason: record.reason || '',
      status: record.status || 'Pending'
    })
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
  }

  const handleSave = async () => {
    try {
      let res;
      if (editMode) {
        res = await fetch(`${API_URL}/admin/leave/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        res = await fetch(`${API_URL}/admin/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      if (res.ok) {
        handleClose()
        fetchLeaves()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return
    try {
      const res = await fetch(`${API_URL}/admin/leave/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchLeaves()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'error';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  }

  return (
    <>
      <CardHeader 
        title='Leave & Permission Requests' 
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<AddLineIcon />}>
            Add Request
          </Button>
        }
      />
      <Divider />
      <div className='overflow-x-auto'>
        {loading ? (
          <div className='p-4'>
            <Typography>Loading records...</Typography>
          </div>
        ) : (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Employee Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date / Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="8" className='text-center'>No records found.</td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr key={record._id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className='font-medium'>{record.employeeId?.userName || 'Unknown'}</div>
                      <div className='text-xs text-gray-500'>{record.employeeId?.designation || ''}</div>
                    </td>
                    <td>
                      <Chip label={record.category || 'Leave'} color={record.category === 'Permission' ? 'info' : 'secondary'} size='small' />
                    </td>
                    <td>{record.category === 'Permission' ? record.permissionType : record.type}</td>
                    <td className='text-sm'>
                      {record.category === 'Permission' ? (
                        <>
                          <div>{record.permissionDate ? new Date(record.permissionDate).toLocaleDateString() : '-'}</div>
                          <div className='text-xs text-gray-500'>{record.startTime} to {record.endTime}</div>
                        </>
                      ) : (
                        <div>{record.fromDate ? new Date(record.fromDate).toLocaleDateString() : '-'} to {record.toDate ? new Date(record.toDate).toLocaleDateString() : '-'}</div>
                      )}
                    </td>
                    <td className='text-sm text-gray-600 max-w-[200px] truncate'>{record.reason}</td>
                    <td>
                      <Chip label={record.status} color={getStatusColor(record.status)} size='small' />
                    </td>
                    <td>
                      <div className='flex items-center'>
                        <IconButton onClick={() => handleEdit(record)} color='primary'>
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(record._id)} color='error'>
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
        <DialogTitle>{editMode ? 'Edit Request' : 'New Request'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                select
                fullWidth 
                label='Employee' 
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                disabled={editMode}
              >
                {employees.map(emp => (
                  <MenuItem key={emp._id} value={emp._id}>{emp.userName} ({emp.designation || 'No Role'})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                select
                fullWidth 
                label='Category' 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <MenuItem value='Leave'>Leave</MenuItem>
                <MenuItem value='Permission'>Permission</MenuItem>
              </TextField>
            </Grid>

            {formData.category === 'Leave' ? (
              <>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    select
                    fullWidth 
                    label='Leave Type' 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <MenuItem value='Sick'>Sick</MenuItem>
                    <MenuItem value='Casual'>Casual</MenuItem>
                    <MenuItem value='Earned'>Earned</MenuItem>
                    <MenuItem value='Unpaid'>Unpaid</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='From Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.fromDate}
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='To Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.toDate}
                    onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    select
                    fullWidth 
                    label='Permission Type' 
                    value={formData.permissionType}
                    onChange={(e) => setFormData({...formData, permissionType: e.target.value})}
                  >
                    <MenuItem value='Late Coming'>Late Coming</MenuItem>
                    <MenuItem value='Early Going'>Early Going</MenuItem>
                    <MenuItem value='Personal Work'>Personal Work</MenuItem>
                    <MenuItem value='Other'>Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4} size={{xs: 12, sm: 4}}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.permissionDate}
                    onChange={(e) => setFormData({...formData, permissionDate: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={4} size={{xs: 12, sm: 4}}>
                  <TextField 
                    fullWidth 
                    type="time"
                    label='Start Time' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={4} size={{xs: 12, sm: 4}}>
                  <TextField 
                    fullWidth 
                    type="time"
                    label='End Time' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                fullWidth 
                multiline
                rows={3}
                label='Reason' 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              />
            </Grid>
            {editMode && (
              <Grid item xs={12} size={{xs: 12}}>
                <TextField 
                  select
                  fullWidth 
                  label='Status' 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value='Pending'>Pending</MenuItem>
                  <MenuItem value='Approved'>Approved</MenuItem>
                  <MenuItem value='Rejected'>Rejected</MenuItem>
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
  )
}

export default LeavesTable
