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

const AttendanceTable = () => {
  const [data, setData] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    remarks: ''
  })

  useEffect(() => {
    fetchEmployees()
    fetchAttendance()
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

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/attendance`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setEditMode(false)
    setSelectedId(null)
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      remarks: ''
    })
    setOpen(true)
  }

  const handleEdit = (record) => {
    setEditMode(true)
    setSelectedId(record._id)
    setFormData({
      employeeId: record.employeeId?._id || record.employeeId,
      date: new Date(record.date).toISOString().split('T')[0],
      status: record.status || 'Present',
      remarks: record.remarks || ''
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
        res = await fetch(`${API_URL}/admin/attendance/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        res = await fetch(`${API_URL}/admin/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      
      if (res.ok) {
        handleClose()
        fetchAttendance()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return
    try {
      const res = await fetch(`${API_URL}/admin/attendance/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchAttendance()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'success';
      case 'Absent': return 'error';
      case 'Half-day': return 'warning';
      default: return 'default';
    }
  }

  return (
    <>
      <CardHeader 
        title='Attendance Records' 
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<AddLineIcon />}>
            Log Attendance
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
                <th>Date</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className='text-center'>No attendance records found.</td>
                </tr>
              ) : (
                data.map((record, index) => (
                  <tr key={record._id}>
                    <td>{index + 1}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.employeeId?.userName || 'Unknown'}</td>
                    <td>{record.employeeId?.designation || '-'}</td>
                    <td>
                      <Chip label={record.status} color={getStatusColor(record.status)} size='small' />
                    </td>
                    <td className='text-sm text-gray-600 max-w-[200px] truncate'>{record.remarks || '-'}</td>
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
        <DialogTitle>{editMode ? 'Edit Attendance' : 'Log Attendance'}</DialogTitle>
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
                fullWidth 
                type="date"
                label='Date' 
                InputLabelProps={{ shrink: true }}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                disabled={editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
              <TextField 
                select
                fullWidth 
                label='Status' 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <MenuItem value='Present'>Present</MenuItem>
                <MenuItem value='Absent'>Absent</MenuItem>
                <MenuItem value='Half-day'>Half-day</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                fullWidth 
                multiline
                rows={2}
                label='Remarks (Optional)' 
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              />
            </Grid>
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

export default AttendanceTable
