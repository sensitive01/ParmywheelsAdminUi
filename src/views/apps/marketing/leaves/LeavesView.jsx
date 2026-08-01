'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { useSession } from 'next-auth/react'
import Chip from '@mui/material/Chip'
import { DataGrid } from '@mui/x-data-grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import AddLineIcon from '@mui/icons-material/Add'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const getStatusColor = (status) => {
  switch (status) {
    case 'Approved': return 'success';
    case 'Rejected': return 'error';
    case 'Pending': return 'warning';
    default: return 'default';
  }
}

const LeavesView = () => {
  const { data: session } = useSession()
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    permissionDate: '',
    startTime: '',
    endTime: '',
    reason: '',
    category: 'Leave',
    type: 'Casual',
    permissionType: 'Late Coming'
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyLeaves()
    }
  }, [session])

  const fetchMyLeaves = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/leaves?employeeId=${session.user.id}`)
      if (res.ok) {
        const json = await res.json()
        setLeaves(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching leaves:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const submitLeave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        employeeId: session.user.id,
        ...formData
      }

      const response = await fetch(`${API_URL}/admin/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        alert("Leave request submitted successfully")
        setFormData({
          fromDate: '',
          toDate: '',
          permissionDate: '',
          startTime: '',
          endTime: '',
          reason: '',
          category: 'Leave',
          type: 'Casual',
          permissionType: 'Late Coming'
        })
        setOpen(false)
        fetchMyLeaves()
      } else {
        const errData = await response.json()
        alert(`Error: ${errData.message}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert("Failed to submit leave request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader 
          title="My Leave History" 
          action={
            <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddLineIcon />}>
              Add Request
            </Button>
          }
        />
        <CardContent>
          <div className="w-full">
            <DataGrid
              sx={{
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
              autoHeight
              rows={leaves.map((r, i) => ({ ...r, id: r._id, sno: i + 1 }))}
              columns={[
                { field: 'sno', headerName: 'S.No', width: 70 },
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
                  flex: 1,
                  minWidth: 200,
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
                  flex: 1,
                  minWidth: 200,
                  renderCell: (params) => <div className='text-sm text-gray-600 truncate py-2' title={params.row.reason}>{params.row.reason}</div>
                },
                {
                  field: 'status',
                  headerName: 'Status',
                  width: 120,
                  renderCell: (params) => (
                    <Chip label={params.row.status} color={getStatusColor(params.row.status)} size='small' />
                  )
                }
              ]}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 }
                }
              }}
              getRowHeight={() => 'auto'}
              getEstimatedRowHeight={() => 70}
              disableRowSelectionOnClick
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <form onSubmit={submitLeave} className="flex flex-col gap-4 pt-4">
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              fullWidth
              required
            >
              <MenuItem value="Leave">Leave</MenuItem>
              <MenuItem value="Permission">Permission</MenuItem>
            </TextField>

            {formData.category === 'Leave' && (
              <TextField
                select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="Sick">Sick</MenuItem>
                <MenuItem value="Casual">Casual</MenuItem>
                <MenuItem value="Emergency">Emergency</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            )}

            {formData.category === 'Permission' && (
              <TextField
                select
                label="Type"
                name="permissionType"
                value={formData.permissionType}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="Late Coming">Late Coming</MenuItem>
                <MenuItem value="Early Going">Early Going</MenuItem>
                <MenuItem value="Personal Work">Personal Work</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            )}

            {formData.category === 'Leave' ? (
              <TextField
                type="date"
                label="From Date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            ) : (
              <TextField
                type="date"
                label="Date"
                name="permissionDate"
                value={formData.permissionDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            )}

            {formData.category === 'Leave' && (
              <TextField
                type="date"
                label="To Date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            )}

            {formData.category === 'Permission' && (
              <div className="flex gap-4">
                <TextField
                  type="time"
                  label="From Time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  type="time"
                  label="To Time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </div>
            )}

            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
            />

            <Button type="submit" variant="contained" disabled={loading}>
              Submit Request
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LeavesView
