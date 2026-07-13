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

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import AddLineIcon from '@mui/icons-material/Add'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const LeadListTable = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  
  // To show follow ups inside the edit dialog
  const [currentFollowUps, setCurrentFollowUps] = useState([])

  const [formData, setFormData] = useState({
    userName: '',
    userMobile: '',
    userEmail: '',
    userPassword: '',
    leadStatus: 'New',
    status: 'Active',
    newFollowUpNotes: ''
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/admin/leads`)
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
    setSelectedId(null)
    setCurrentFollowUps([])
    setFormData({
      userName: '',
      userMobile: '',
      userEmail: '',
      userPassword: '',
      leadStatus: 'New',
      status: 'Active',
      newFollowUpNotes: ''
    })
    setOpen(true)
  }

  const handleEdit = (lead) => {
    setEditMode(true)
    setSelectedId(lead._id)
    setCurrentFollowUps(lead.followUps || [])
    setFormData({
      userName: lead.userName || '',
      userMobile: lead.userMobile || '',
      userEmail: lead.userEmail || '',
      userPassword: '', // Don't show existing password
      leadStatus: lead.leadStatus || 'New',
      status: lead.status || 'Active',
      newFollowUpNotes: ''
    })
    setOpen(true)
  }

  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
    setOpen(false)
  }

  const handleSave = async () => {
    try {
      const payload = {
        userName: formData.userName,
        userMobile: formData.userMobile,
        userEmail: formData.userEmail,
        userPassword: formData.userPassword,
        leadStatus: formData.leadStatus,
        status: formData.status
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
      case 'New': return 'info';
      case 'Contacted': return 'warning';
      case 'Follow-up': return 'primary';
      case 'Converted': return 'success';
      default: return 'default';
    }
  }

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
      <div className='overflow-x-auto p-4'>
        {loading ? (
          <Typography>Loading leads...</Typography>
        ) : (
          <table className='min-w-full text-left border-collapse'>
            <thead>
              <tr className='border-b'>
                <th className='p-3'>S.No</th>
                <th className='p-3'>Name</th>
                <th className='p-3'>Phone</th>
                <th className='p-3'>Email</th>
                <th className='p-3'>Lead Status</th>
                <th className='p-3'>Last Follow-up</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className='p-3 text-center'>No leads found.</td>
                </tr>
              ) : (
                data.map((lead, index) => {
                  const lastFollowUp = lead.followUps && lead.followUps.length > 0 
                    ? lead.followUps[lead.followUps.length - 1] 
                    : null;

                  return (
                    <tr key={lead._id} className='border-b hover:bg-gray-50'>
                      <td className='p-3'>{index + 1}</td>
                      <td className='p-3'>{lead.userName}</td>
                      <td className='p-3'>{lead.userMobile}</td>
                      <td className='p-3'>{lead.userEmail || '-'}</td>
                      <td className='p-3'>
                        <Chip label={lead.leadStatus || 'New'} color={getLeadStatusColor(lead.leadStatus)} size='small' />
                      </td>
                      <td className='p-3 text-sm'>
                        {lastFollowUp ? (
                          <>
                            <div>{new Date(lastFollowUp.date).toLocaleDateString()}</div>
                            <div className='text-gray-500 truncate max-w-[150px]'>{lastFollowUp.notes}</div>
                          </>
                        ) : '-'}
                      </td>
                      <td className='p-3'>
                        <IconButton onClick={() => handleEdit(lead)} color='primary'>
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(lead._id)} color='error'>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>{editMode ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={4} className='pt-2'>
            {/* Left side: Form */}
            <Grid item xs={12} md={editMode ? 6 : 12} size={{xs: 12, md: editMode ? 6 : 12}}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    fullWidth 
                    label='Name' 
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={6} size={{xs: 12, sm: 6}}>
                  <TextField 
                    fullWidth 
                    label='Mobile Number' 
                    value={formData.userMobile}
                    onChange={(e) => setFormData({...formData, userMobile: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} size={{xs: 12}}>
                  <TextField 
                    fullWidth 
                    label='Email' 
                    value={formData.userEmail}
                    onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} size={{xs: 12}}>
                  <TextField 
                    fullWidth 
                    label={editMode ? 'New Password (Leave empty to keep)' : 'Password'} 
                    type="password"
                    value={formData.userPassword}
                    onChange={(e) => setFormData({...formData, userPassword: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} sm={editMode ? 12 : 6} size={{xs: 12, sm: editMode ? 12 : 6}}>
                  <TextField 
                    select
                    fullWidth 
                    label='Lead Status' 
                    value={formData.leadStatus}
                    onChange={(e) => setFormData({...formData, leadStatus: e.target.value})}
                  >
                    <MenuItem value='New'>New</MenuItem>
                    <MenuItem value='Contacted'>Contacted</MenuItem>
                    <MenuItem value='Follow-up'>Follow-up</MenuItem>
                    <MenuItem value='Converted'>Converted</MenuItem>
                  </TextField>
                </Grid>
                {editMode && (
                  <Grid item xs={12} size={{xs: 12}}>
                    <TextField 
                      select
                      fullWidth 
                      label='User Status' 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <MenuItem value='Active'>Active</MenuItem>
                      <MenuItem value='Inactive'>Inactive</MenuItem>
                    </TextField>
                  </Grid>
                )}
                {editMode && (
                  <Grid item xs={12} size={{xs: 12}}>
                    <Divider className='my-4' />
                    <Typography variant='subtitle2' className='mb-2'>Add New Follow-up Note</Typography>
                    <TextField 
                      fullWidth 
                      multiline
                      rows={3}
                      label='Notes...' 
                      value={formData.newFollowUpNotes}
                      onChange={(e) => setFormData({...formData, newFollowUpNotes: e.target.value})}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>

            {/* Right side: Follow Up History (Only shown in Edit mode) */}
            {editMode && (
              <Grid item xs={12} md={6} size={{xs: 12, md: 6}}>
                <Card variant="outlined" className='h-full'>
                  <CardHeader title="Follow-up History" titleTypographyProps={{ variant: 'subtitle1' }} />
                  <Divider />
                  <div className='p-4 max-h-[400px] overflow-y-auto'>
                    {currentFollowUps.length === 0 ? (
                      <Typography variant='body2' color='text.secondary'>No follow-ups recorded yet.</Typography>
                    ) : (
                      currentFollowUps.slice().reverse().map((fu, idx) => (
                        <div key={idx} className='mb-4 last:mb-0 bg-gray-50 p-3 rounded'>
                          <Typography variant='caption' color='text.secondary' className='block mb-1'>
                            {new Date(fu.date).toLocaleString()}
                          </Typography>
                          <Typography variant='body2'>{fu.notes}</Typography>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}>{editMode ? 'Update Lead' : 'Save Lead'}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default LeadListTable
