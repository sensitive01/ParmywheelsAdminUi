'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
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
import InputAdornment from '@mui/material/InputAdornment'

import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import AddLineIcon from '@mui/icons-material/Add'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import classnames from 'classnames'
import { DataGrid } from '@mui/x-data-grid'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const AttendanceTable = () => {
  const [data, setData] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isFilterApplied, setIsFilterApplied] = useState(false)

  // Dialog State
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedRecord, setSelectedRecord] = useState(null)
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

  const fetchAttendance = async (clearFilters = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (!clearFilters && search) params.append('search', search)
      if (!clearFilters && startDate) params.append('startDate', startDate)
      if (!clearFilters && endDate) params.append('endDate', endDate)

      const res = await fetch(`${API_URL}/admin/attendance?${params.toString()}`)
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

  const handleApplyFilter = () => {
    setIsFilterApplied(true)
    fetchAttendance()
  }

  const handleClearFilter = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
    setIsFilterApplied(false)
    fetchAttendance(true)
  }

  const handleOpen = () => {
    setEditMode(false)
    setSelectedId(null)
    setSelectedRecord(null)
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
    setSelectedRecord(record)
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

  const handleSetLogout = async (id) => {
    if (!window.confirm("Are you sure you want to set logout to current time?")) return
    try {
      const res = await fetch(`${API_URL}/admin/attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setLogout: true })
      })
      
      if (res.ok) {
        fetchAttendance()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="shadow-none border p-4">
      <div className="flex flex-col gap-6">
        <Typography variant="h4" className="text-center font-bold">Attendance Records</Typography>
        
        {/* Filters Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <TextField
            size="small"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterAltOutlinedIcon color="primary" />
                </InputAdornment>
              ),
            }}
            className="w-full md:w-64"
          />

          <div className="flex items-end gap-3 flex-1 justify-center">
            <TextField
              size="small"
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleApplyFilter} style={{ height: '40px' }}>
              Apply Filter
            </Button>
            {isFilterApplied && (
              <Button variant="outlined" color="secondary" onClick={handleClearFilter} style={{ height: '40px' }}>
                Clear Filter
              </Button>
            )}
          </div>

          <Button variant="contained" color="primary" onClick={handleOpen} startIcon={<AddLineIcon />}>
            Add Attendance
          </Button>
        </div>

        <div className='mt-4 w-full'>
          <DataGrid
            autoHeight
            rows={data
              .filter(record => {
                if (!search) return true;
                const searchLower = search.toLowerCase();
                const empName = record.employeeId?.userName?.toLowerCase() || '';
                const empMobile = record.employeeId?.userMobile?.toLowerCase() || '';
                return empName.includes(searchLower) || empMobile.includes(searchLower);
              })
              .map((r, i) => ({ ...r, id: r._id, sno: i + 1 }))
            }
            columns={[
              { field: 'sno', headerName: 'S.No', width: 70 },
              { 
                field: 'employeeName', 
                headerName: 'Employee name', 
                flex: 1, 
                minWidth: 150,
                renderCell: (params) => <div className='font-semibold'>{params.row.employeeId?.userName || 'Unknown'}</div>
              },
              { 
                field: 'photoUrl', 
                headerName: 'Photo', 
                width: 100,
                renderCell: (params) => params.value ? (
                  <img src={params.value} alt="Employee" className="w-10 h-10 rounded-full object-cover border my-1" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 my-1">N/A</div>
                )
              },
              { 
                field: 'date', 
                headerName: 'Date', 
                width: 150,
                renderCell: (params) => new Date(params.row.date).toLocaleDateString()
              },
              { 
                field: 'loginTime', 
                headerName: 'Login Time', 
                width: 150,
                renderCell: (params) => params.row.loginTime || params.row.createdAt ? formatTime(params.row.loginTime || params.row.createdAt) : '-'
              },
              { 
                field: 'logoutTime', 
                headerName: 'Logout Time', 
                width: 180,
                renderCell: (params) => params.value ? (
                  formatTime(params.value)
                ) : (
                  <div className="flex items-center gap-1 text-red-500 font-semibold text-sm h-full">
                    <WarningAmberIcon fontSize="small" /> Not Set
                  </div>
                )
              },
              {
                field: 'actions',
                headerName: 'Actions',
                width: 120,
                sortable: false,
                renderCell: (params) => (
                  <Button 
                    variant="contained" 
                    size="small"
                    color="info" 
                    startIcon={<RemoveRedEyeOutlinedIcon />} 
                    onClick={() => handleEdit(params.row)}
                    className="normal-case"
                  >
                    View
                  </Button>
                )
              }
            ]}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            disableRowSelectionOnClick
            loading={loading}
          />
        </div>
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'View Attendance' : 'Log Attendance'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            {editMode && selectedRecord && (
              <Grid size={{xs: 12}}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-2 p-4 border rounded-lg bg-gray-50">
                  {selectedRecord.photoUrl ? (
                    <img src={selectedRecord.photoUrl} alt="Employee" className="w-16 h-16 rounded-full object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">N/A</div>
                  )}
                  <div className="flex-1">
                    <Typography variant="h6" className="font-semibold text-gray-800">{selectedRecord.employeeId?.userName || 'Unknown'}</Typography>
                    <Typography variant="body2" color="textSecondary" className="mb-2">Emp ID: {selectedRecord.employeeId?.employeeId || 'N/A'}</Typography>
                    <div className="flex flex-wrap gap-4">
                      <Typography variant="body2"><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString()}</Typography>
                      <Typography variant="body2"><strong>Login:</strong> {selectedRecord.loginTime || selectedRecord.createdAt ? formatTime(selectedRecord.loginTime || selectedRecord.createdAt) : '-'}</Typography>
                      <Typography variant="body2"><strong>Logout:</strong> {selectedRecord.logoutTime ? formatTime(selectedRecord.logoutTime) : 'Not Set'}</Typography>
                    </div>
                  </div>
                </div>
              </Grid>
            )}
            {!editMode && (
              <>
                <Grid size={{xs: 12}}>
                  <TextField 
                    select
                    fullWidth 
                    label='Employee' 
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp._id} value={emp._id}>{emp.userName} ({emp.designation || 'No Role'})</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                  <TextField 
                    fullWidth 
                    type="date"
                    label='Date' 
                    InputLabelProps={{ shrink: true }}
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
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
                <Grid size={{xs: 12}}>
                  <TextField 
                    fullWidth 
                    multiline
                    rows={2}
                    label='Remarks (Optional)' 
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{editMode ? 'Close' : 'Cancel'}</Button>
          {!editMode && <Button variant='contained' onClick={handleSave}>Save</Button>}
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default AttendanceTable
