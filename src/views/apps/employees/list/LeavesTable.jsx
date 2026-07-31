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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import tableStyles from '@core/styles/table.module.css'
import classnames from 'classnames'
import { DataGrid } from '@mui/x-data-grid'

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

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/admin/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchLeaves()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
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
      <div className='w-full'>
          <DataGrid
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
              },
            }}
            autoHeight
            rows={data.map((r, i) => ({ ...r, id: r._id, sno: i + 1 }))}
            columns={[
              { field: 'sno', headerName: 'S.No', width: 70 },
              {
                field: 'employeeName',
                headerName: 'Employee Name',
                flex: 1,
                minWidth: 150,
                renderCell: (params) => (
                  <div className="py-2">
                    <div className='font-medium leading-tight'>{params.row.employeeId?.userName || 'Unknown'}</div>
                    <div className='text-xs text-gray-500 mt-1'>{params.row.employeeId?.designation || ''}</div>
                  </div>
                )
              },
              {
                field: 'category',
                headerName: 'Category',
                width: 120,
                renderCell: (params) => (
                  <Chip label={params.row.category || 'Leave'} color={params.row.category === 'Permission' ? 'info' : 'secondary'} size='small' />
                )
              },
              {
                field: 'type',
                headerName: 'Type',
                width: 150,
                renderCell: (params) => params.row.category === 'Permission' ? params.row.permissionType : params.row.type
              },
              {
                field: 'dateDuration',
                headerName: 'Date / Duration',
                width: 220,
                renderCell: (params) => (
                  <div className="text-sm py-2">
                    {params.row.category === 'Permission' ? (
                      <>
                        <div className='leading-tight'>{params.row.permissionDate ? new Date(params.row.permissionDate).toLocaleDateString() : '-'}</div>
                        <div className='text-xs text-gray-500 mt-1'>{params.row.startTime} to {params.row.endTime}</div>
                      </>
                    ) : (
                      <div>{params.row.fromDate ? new Date(params.row.fromDate).toLocaleDateString() : '-'} to {params.row.toDate ? new Date(params.row.toDate).toLocaleDateString() : '-'}</div>
                    )}
                  </div>
                )
              },
              {
                field: 'reason',
                headerName: 'Reason',
                width: 200,
                renderCell: (params) => <div className='text-sm text-gray-600 truncate py-2' title={params.row.reason}>{params.row.reason}</div>
              },
              {
                field: 'status',
                headerName: 'Status',
                width: 120,
                renderCell: (params) => (
                  <Chip label={params.row.status} color={getStatusColor(params.row.status)} size='small' />
                )
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 160,
                sortable: false,
                renderCell: (params) => (
                  <div className='flex items-center h-full gap-1'>
                    {params.row.status === 'Pending' && (
                      <>
                        <IconButton onClick={() => handleUpdateStatus(params.row._id, 'Approved')} color='success' title="Approve" size="small">
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleUpdateStatus(params.row._id, 'Rejected')} color='warning' title="Reject" size="small">
                          <HighlightOffIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    <IconButton onClick={() => handleEdit(params.row)} color='primary' title="Edit" size="small">
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row._id)} color='error' title="Delete" size="small">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                )
              }
            ]}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            getRowHeight={() => 'auto'}
            getEstimatedRowHeight={() => 70}
            disableRowSelectionOnClick
            loading={loading}
          />
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'Edit Request' : 'New Request'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid size={{xs: 12}} size={12}>
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
            <Grid
              size={{xs: 12, sm: 6}}
              size={{
                xs: 12,
                sm: 6
              }}>
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
                <Grid
                  size={{xs: 12, sm: 6}}
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
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
                <Grid
                  size={{xs: 12, sm: 6}}
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='From Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.fromDate}
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                  />
                </Grid>
                <Grid
                  size={{xs: 12, sm: 6}}
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
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
                <Grid
                  size={{xs: 12, sm: 6}}
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
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
                <Grid
                  size={{xs: 12, sm: 4}}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.permissionDate}
                    onChange={(e) => setFormData({...formData, permissionDate: e.target.value})}
                  />
                </Grid>
                <Grid
                  size={{xs: 12, sm: 4}}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
                  <TextField 
                    fullWidth 
                    type="time"
                    label='Start Time' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </Grid>
                <Grid
                  size={{xs: 12, sm: 4}}
                  size={{
                    xs: 12,
                    sm: 4
                  }}>
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

            <Grid size={{xs: 12}} size={12}>
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
              <Grid size={{xs: 12}} size={12}>
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
  );
}

export default LeavesTable
