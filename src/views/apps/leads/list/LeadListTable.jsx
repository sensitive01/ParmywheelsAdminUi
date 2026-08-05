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
import { DataGrid } from '@mui/x-data-grid'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import AddLineIcon from '@mui/icons-material/Add'
import { useSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const LeadListTable = () => {
  const { data: session, status: sessionStatus } = useSession()
  const isMarketing = session?.user?.role === 'Marketing'

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [viewLogOpen, setViewLogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [viewMode, setViewMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)

  // To show follow ups inside the edit dialog
  const [currentFollowUps, setCurrentFollowUps] = useState([])

  const [formData, setFormData] = useState({
    userName: '',
    userMobile: '',
    userEmail: '',
    leadDate: '',
    address: '',
    leadStatus: 'Pending',
    status: 'Active',
    newFollowUpNotes: ''
  })
  const [logData, setLogData] = useState({
    status: '',
    notes: '',
    followUpDateTime: ''
  })

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchLeads()
    }
  }, [sessionStatus])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/admin/leads`
      const userId = session?.user?.id || session?.user?._id;
      if (isMarketing && userId) {
        url += `?employeeId=${userId}&role=Marketing`
      }
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        setData(json.data || [])
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setEditMode(false)
    setViewMode(false)
    setSelectedId(null)
    setCurrentFollowUps([])
    setFormData({
      userName: '',
      userMobile: '',
      userEmail: '',
      leadDate: '',
      address: '',
      leadStatus: 'Pending',
      status: 'Active',
      newFollowUpNotes: ''
    })
    setOpen(true)
  }

  const handleEdit = (lead) => {
    setEditMode(true)
    setViewMode(false)
    setSelectedId(lead._id)
    setCurrentFollowUps(lead.followUps || [])
    setFormData({
      userName: lead.userName || '',
      userMobile: lead.userMobile || '',
      userEmail: lead.userEmail || '',
      leadDate: lead.leadDate || '',
      address: lead.address || '',
      leadStatus: lead.leadStatus || 'Pending',
      status: lead.status || 'Active',
      newFollowUpNotes: ''
    })
    setOpen(true)
  }

  const handleView = (lead) => {
    setEditMode(false)
    setViewMode(true)
    setSelectedId(lead._id)
    setCurrentFollowUps(lead.followUps || [])
    setFormData({
      userName: lead.userName || '',
      userMobile: lead.userMobile || '',
      userEmail: lead.userEmail || '',
      leadDate: lead.leadDate || '',
      address: lead.address || '',
      leadStatus: lead.leadStatus || 'Pending',
      status: lead.status || 'Active',
      newFollowUpNotes: ''
    })
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
  }

  const handleOpenLog = () => {
    setLogData({ status: '', notes: formData.newFollowUpNotes, followUpDateTime: '' })
    setLogOpen(true)
  }

  const handleLogClose = () => {
    setLogOpen(false)
  }

  const handleSaveLog = async () => {
    if (!logData.status && !logData.notes.trim()) {
      alert("Please enter a status or note.");
      return;
    }
    try {
      const payload = {
        newFollowUp: {
          status: logData.status,
          notes: logData.notes,
          doneBy: session?.user?.name || 'Admin',
          ...( (logData.status === 'Follow Up' || logData.status === 'Callback') && logData.followUpDateTime 
                ? { followUpDateTime: logData.followUpDateTime } 
                : {})
        }
      }
      const res = await fetch(`${API_URL}/admin/lead/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const json = await res.json()
        setCurrentFollowUps(json.data.followUps || [])
        setFormData(prev => ({...prev, newFollowUpNotes: ''}))
        fetchLeads()
        setLogOpen(false)
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    try {
      const payload = {
        userName: formData.userName,
        userMobile: formData.userMobile,
        userEmail: formData.userEmail,
        leadDate: formData.leadDate,
        address: formData.address,
        leadStatus: formData.leadStatus,
        status: formData.status,
        createdBy: session?.user?.id || session?.user?._id || ''
      }

      if (editMode && formData.newFollowUpNotes.trim() !== '') {
        payload.newFollowUp = {
          notes: formData.newFollowUpNotes
        }
      }

      let res;
      if (editMode) {
        res = await fetch(`${API_URL}/admin/lead/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        res = await fetch(`${API_URL}/admin/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      if (res.ok) {
        handleClose()
        fetchLeads()
      } else {
        const errorData = await res.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return
    try {
      const res = await fetch(`${API_URL}/admin/lead/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchLeads()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getLeadStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Converted': return 'success';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  }

  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 70,
      renderCell: (params) => data.findIndex(d => d._id === params.row._id) + 1
    },
    { field: 'userName', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'userMobile', headerName: 'Phone', flex: 1, minWidth: 150 },
    { 
      field: 'userEmail', 
      headerName: 'Email', 
      flex: 1.5, 
      minWidth: 200,
      renderCell: (params) => params.row.userEmail || '-'
    },
    { 
      field: 'leadStatus', 
      headerName: 'Lead Status', 
      flex: 1, 
      minWidth: 150,
      renderCell: (params) => (
        <Chip 
          label={params.row.leadStatus || 'Pending'} 
          color={getLeadStatusColor(params.row.leadStatus)} 
          size='small' 
        />
      )
    },
    {
      field: 'lastFollowUp',
      headerName: 'Last Follow-up',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => {
        const lastFollowUp = params.row.followUps && params.row.followUps.length > 0
          ? params.row.followUps[params.row.followUps.length - 1]
          : null;
        
        if (!lastFollowUp) return '-';
        return (
          <div className="flex flex-col py-2">
            <Typography variant="body2">{new Date(lastFollowUp.date).toLocaleDateString()}</Typography>
            {lastFollowUp.status && <Typography variant="caption" className='font-semibold text-gray-700'>{lastFollowUp.status}</Typography>}
            <Typography variant="caption" className='text-gray-500 truncate max-w-[150px]'>{lastFollowUp.notes}</Typography>
          </div>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center">
          <IconButton onClick={() => handleView(params.row)} color='info' size="small">
            <VisibilityOutlinedIcon />
          </IconButton>
          {!isMarketing && (
            <>
              <IconButton onClick={() => handleEdit(params.row)} color='primary' size="small">
                <EditOutlinedIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(params.row._id)} color='error' size="small">
                <DeleteOutlineIcon />
              </IconButton>
            </>
          )}
        </div>
      )
    }
  ]

  return (
    <Card>
      <CardHeader
        title='Leads'
        action={
          <Button variant='contained' onClick={handleOpen} startIcon={<AddLineIcon />}>
            Add Lead
          </Button>
        }
      />
      <Divider />
      <div className='w-full'>
        {loading ? (
          <Typography className='p-4'>Loading leads...</Typography>
        ) : (
          <DataGrid
            autoHeight
            rows={data}
            columns={columns}
            getRowId={(row) => row._id}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              }
            }}
            getRowHeight={() => 'auto'}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            }}
          />
        )}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>{viewMode ? 'View Lead' : editMode ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            {/* Form Details */}
            {viewMode ? (
              <Grid item xs={12} size={{ xs: 12 }}>
                <Card variant="outlined" className='mb-6 border-gray-200 shadow-none rounded-lg'>
                  <div className='flex justify-between items-center p-5 border-b border-gray-100'>
                    <div>
                      <Typography variant="h6" className='font-bold text-gray-800'>Lead Details</Typography>
                    </div>
                    <Button 
                      variant="contained" 
                      onClick={handleOpenLog}
                      sx={{ bgcolor: '#3eb37f', '&:hover': { bgcolor: '#2e8b57' }, color: 'white', fontWeight: 'bold', textTransform: 'none' }}
                    >
                      Add Call Log
                    </Button>
                  </div>
                  
                  <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-gray-100 mb-6'>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-1'>Name</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.userName || '-'}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-1'>Mobile Number</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.userMobile || '-'}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-1'>Email</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.userEmail || '-'}</Typography>
                      </div>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-1'>Date</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.leadDate ? new Date(formData.leadDate).toLocaleDateString() : '-'}</Typography>
                      </div>
                      <div className='md:col-span-2'>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-1'>Address</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.address || '-'}</Typography>
                      </div>
                    </div>
                    
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-2'>Lead Status</Typography>
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold text-white ${
                          formData.leadStatus === 'Pending' ? 'bg-[#3eb37f]' :
                          formData.leadStatus === 'Converted' ? 'bg-[#3eb37f]' :
                          formData.leadStatus === 'Rejected' ? 'bg-red-500' : 'bg-gray-400'
                        }`}>
                          {formData.leadStatus || 'Pending'}
                        </span>
                      </div>
                      <div>
                        <Typography variant="caption" className='font-semibold text-[#3eb37f] block mb-2'>User Status</Typography>
                        <Typography variant="body2" className='text-gray-800'>{formData.status || '-'}</Typography>
                      </div>
                    </div>
                  </div>
                </Card>
              </Grid>
            ) : (
              <Grid item xs={12} size={{ xs: 12 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Name'
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      disabled={editMode && isMarketing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Mobile Number'
                      value={formData.userMobile}
                      onChange={(e) => setFormData({ ...formData, userMobile: e.target.value })}
                      disabled={editMode && isMarketing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label='Email'
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      disabled={editMode && isMarketing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label='Date'
                      InputLabelProps={{ shrink: true }}
                      value={formData.leadDate}
                      onChange={(e) => setFormData({ ...formData, leadDate: e.target.value })}
                      disabled={editMode && isMarketing}
                    />
                  </Grid>
                  <Grid item xs={12} size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label='Address'
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={editMode && isMarketing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={editMode ? 12 : 6} size={{ xs: 12, sm: editMode ? 12 : 6 }}>
                    <TextField
                      select
                      fullWidth
                      label='Lead Status'
                      value={formData.leadStatus}
                      onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
                    >
                      <MenuItem value='Pending'>Pending</MenuItem>
                      <MenuItem value='Converted'>Converted</MenuItem>
                      <MenuItem value='Rejected'>Rejected</MenuItem>
                    </TextField>
                  </Grid>
                  {editMode && (
                    <Grid item xs={12} size={{ xs: 12 }}>
                      <TextField
                        select
                        fullWidth
                        label='User Status'
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={editMode && isMarketing}
                      >
                        <MenuItem value='Active'>Active</MenuItem>
                        <MenuItem value='Inactive'>Inactive</MenuItem>
                      </TextField>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            )}

            {/* Follow Up History (Only shown in View mode) */}
            {viewMode && (
              <Grid item xs={12} size={{ xs: 12 }}>
                <Card variant="outlined" className='shadow-none border-gray-200 mt-2'>
                  <CardHeader title="Follow-up History" titleTypographyProps={{ variant: 'subtitle1' }} />
                  <div className='overflow-x-auto w-full'>
                    <table className='min-w-full text-left border-collapse text-sm'>
                      <thead className='bg-[#3eb37f] text-white'>
                        <tr>
                          <th className='p-3 font-medium'>Date & Time</th>
                          <th className='p-3 font-medium'>Status</th>
                          <th className='p-3 font-medium'>Remark</th>
                          <th className='p-3 font-medium'>Done By</th>
                          <th className='p-3 font-medium'>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentFollowUps.length === 0 ? (
                          <tr>
                            <td colSpan='5' className='text-center p-4 text-gray-500'>
                              No follow ups recorded yet.
                            </td>
                          </tr>
                        ) : (
                          currentFollowUps
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((fu, idx) => (
                              <tr key={idx} className='border-t border-gray-100 hover:bg-gray-50'>
                                <td className='p-3'>{`${new Date(fu.date).toLocaleDateString('sv-SE')} ${new Date(fu.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`}</td>
                                <td className='p-3 font-semibold text-[#3eb37f]'>{fu.status || '-'}</td>
                                <td className='p-3 truncate max-w-[200px]'>{fu.notes || '-'}</td>
                                <td className='p-3 text-gray-500'>{fu.doneBy || '-'}</td>
                                <td className='p-3'>
                                  <Button 
                                    variant='outlined' 
                                    size='small' 
                                    sx={{ borderRadius: 1, textTransform: 'none', py: 0, px: 1, color: '#3eb37f', borderColor: '#3eb37f' }}
                                    onClick={() => {
                                      setSelectedLog(fu)
                                      setViewLogOpen(true)
                                    }}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{viewMode ? 'Close' : 'Cancel'}</Button>
          {!viewMode && (
            <Button variant='contained' onClick={handleSave}>{editMode ? 'Update Lead' : 'Save Lead'}</Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={logOpen} onClose={handleLogClose} fullWidth maxWidth='sm'>
        <DialogTitle>Add New Call Log</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                select
                fullWidth 
                label='Status' 
                value={logData.status}
                onChange={(e) => setLogData({...logData, status: e.target.value})}
              >
                <MenuItem value='RNR'>RNR</MenuItem>
                <MenuItem value='Call Busy'>Call Busy</MenuItem>
                <MenuItem value='Switched Off'>Switched Off</MenuItem>
                <MenuItem value='Not Reachable'>Not Reachable</MenuItem>
                <MenuItem value='Wrong Number'>Wrong Number</MenuItem>
                <MenuItem value='Interested'>Interested</MenuItem>
                <MenuItem value='Not Interested'>Not Interested</MenuItem>
                <MenuItem value='Follow Up'>Follow Up</MenuItem>
                <MenuItem value='Callback'>Callback</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} size={{xs: 12}}>
              <TextField 
                fullWidth 
                multiline
                rows={4}
                label='Remark' 
                value={logData.notes}
                onChange={(e) => setLogData({...logData, notes: e.target.value})}
              />
            </Grid>
            {(logData.status === 'Follow Up' || logData.status === 'Callback') && (
              <Grid item xs={12} size={{xs: 12}}>
                <TextField 
                  fullWidth 
                  type='datetime-local'
                  label='Scheduled Date & Time' 
                  InputLabelProps={{ shrink: true }}
                  value={logData.followUpDateTime}
                  onChange={(e) => setLogData({...logData, followUpDateTime: e.target.value})}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogClose} color='secondary' variant='outlined' sx={{ borderRadius: 1 }}>Cancel</Button>
          <Button variant='contained' onClick={handleSaveLog} sx={{ borderRadius: 1, bgcolor: '#e2e8f0', color: '#475569', '&:hover': { bgcolor: '#cbd5e1' } }}>Save Log</Button>
        </DialogActions>
      </Dialog>

      {/* View Individual Log Modal */}
      <Dialog open={viewLogOpen} onClose={() => setViewLogOpen(false)} fullWidth maxWidth='xs'>
        <DialogTitle>Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <div className='pt-4 space-y-4'>
              <div>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>Date & Time</Typography>
                <Typography variant='body1' className='font-medium'>{new Date(selectedLog.date).toLocaleString('sv-SE').replace('T', ' ')}</Typography>
              </div>
              <Divider />
              <div>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>Status</Typography>
                <Typography variant='body1' className='font-medium text-blue-900'>{selectedLog.status || '-'}</Typography>
              </div>
              <Divider />
              <div>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>Done By</Typography>
                <Typography variant='body1' className='font-medium'>{selectedLog.doneBy || '-'}</Typography>
              </div>
              <Divider />
              <div>
                <Typography variant='caption' color='text.secondary' className='block mb-1'>Remark</Typography>
                <Typography variant='body2' className='whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100'>{selectedLog.notes || '-'}</Typography>
              </div>
              {selectedLog.followUpDateTime && (
                <>
                  <Divider />
                  <div>
                    <Typography variant='caption' color='text.secondary' className='block mb-1'>Scheduled Date & Time</Typography>
                    <Typography variant='body1' className='font-medium text-[#3eb37f]'>{new Date(selectedLog.followUpDateTime).toLocaleString('sv-SE').replace('T', ' ')}</Typography>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default LeadListTable
