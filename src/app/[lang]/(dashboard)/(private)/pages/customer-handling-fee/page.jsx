'use client'

import { useState, useEffect } from 'react'

import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'

// Icon Imports
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const CustomerHandlingFee = () => {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Form State
  const [handlingfee, setHandlingFee] = useState('')
  const [description, setDescription] = useState('Customer handling fee')
  const [isActive, setIsActive] = useState(true)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchFees = async () => {
    setLoading(true)

    try {
      const response = await axios.get(`${API_URL}/admin/get-customer-handling-fee`)

      console.log('Fetched fees:', response.data)

      let data = []

      // Handle different response structures
      if (response.data?.data && Array.isArray(response.data.data)) {
        data = response.data.data
      } else if (response.data?.handlingFee) {
        // If it returns a single object or an array under 'handlingFee'
        if (Array.isArray(response.data.handlingFee)) {
          data = response.data.handlingFee
        } else {
          data = [response.data.handlingFee]
        }
      } else if (Array.isArray(response.data)) {
        data = response.data
      }

      setFees(data)
    } catch (error) {
      console.error('Error fetching fees:', error)
      setSnackbar({
        open: true,
        message: 'Failed to fetch handling fees',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFees()
  }, [])

  const handleOpenDialog = (fee = null) => {
    if (fee) {
      setEditMode(true)
      setCurrentId(fee._id)
      setHandlingFee(fee.handlingfee)
      setDescription(fee.description || '') // Ensure it doesn't become uncontrolled
      setIsActive(fee.isActive)
    } else {
      setEditMode(false)
      setCurrentId(null)
      setHandlingFee('')
      setDescription('Customer handling fee')
      setIsActive(true)
    }

    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditMode(false)
    setCurrentId(null)
    setHandlingFee('')
  }

  const handleSubmit = async () => {
    if (!handlingfee) {
      setSnackbar({
        open: true,
        message: 'Please enter a handling fee',
        severity: 'error'
      })

      return
    }

    try {
      const payload = {
        handlingfee: Number(handlingfee),
        description,
        isActive
      }

      let response

      if (editMode && currentId) {
        response = await axios.put(`${API_URL}/admin/update-customer-handling-fee/${currentId}`, payload)

        // Instant UI Update: Update the specific item in the list
        setFees(prevFees => prevFees.map(f => (f._id === currentId ? { ...f, ...payload } : f)))

        setSnackbar({
          open: true,
          message: 'Fee updated successfully',
          severity: 'success'
        })
      } else {
        response = await axios.post(`${API_URL}/admin/add-customer-handling-fee`, payload)

        // Instant UI Update: Add to list immediately
        // If backend returns the new object (as per fixed controller), use it.
        // Otherwise, construct a temp object (might lack _id if backend is old, but helps visual)
        const newFee = response.data?.handlingFee || { ...payload, _id: Date.now().toString() }

        setFees(prevFees => [newFee, ...prevFees])

        setSnackbar({
          open: true,
          message: 'Fee added successfully',
          severity: 'success'
        })
      }

      handleCloseDialog()

      // Still fetch to ensure consistency with DB (especially if backend generates IDs or formats)
      fetchFees()
    } catch (error) {
      console.error('Error saving fee:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save fee',
        severity: 'error'
      })
    }
  }

  // Conflict Dialog State
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)
  const [conflictingFee, setConflictingFee] = useState(null)

  const handlePreSubmit = () => {
    if (!handlingfee) {
      setSnackbar({
        open: true,
        message: 'Please enter a handling fee',
        severity: 'error'
      })

      return
    }

    // Check if we are trying to set this fee as active
    if (isActive) {
      // Find if there is another active fee
      const existingActive = fees.find(f => f.isActive && f._id !== currentId)

      if (existingActive) {
        setConflictingFee(existingActive)
        setConflictDialogOpen(true)

        return
      }
    }

    // No conflict, proceed
    handleSubmit()
  }

  const handleConfirmConflict = async () => {
    try {
      // 1. Deactivate the existing active fee
      if (conflictingFee) {
        await axios.put(`${API_URL}/admin/update-customer-handling-fee/${conflictingFee._id}`, {
          ...conflictingFee,
          isActive: false
        })
      }

      // 2. Proceed with the original submit
      await handleSubmit()

      // 3. Close conflict dialog
      setConflictDialogOpen(false)
      setConflictingFee(null)
    } catch (error) {
      console.error('Error resolving conflict:', error)
      setSnackbar({
        open: true,
        message: 'Failed to deactivate existing fee',
        severity: 'error'
      })
    }
  }

  const handleDelete = async id => {
    try {
      // Trying simple delete first as per standard REST
      await axios.delete(`${API_URL}/admin/delete-customer-handling-fee/${id}`)
      setSnackbar({
        open: true,
        message: 'Fee deleted successfully',
        severity: 'success'
      })
      fetchFees()
    } catch (error) {
      console.error('Error deleting fee:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete fee',
        severity: 'error'
      })
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Customer Handling Fee Configuration'
            action={
              <Button variant='contained' startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Add New Fee
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>S.No</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align='right'>Handling Fee</TableCell>
                    <TableCell align='center'>Status</TableCell>
                    <TableCell align='center'>Created At</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        No handling fees configured.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fees.map((row, index) => (
                      <TableRow key={row._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell component='th' scope='row'>
                          {row.description}
                        </TableCell>
                        <TableCell align='right'>{row.handlingfee}</TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={row.isActive ? 'Active' : 'Inactive'}
                            color={row.isActive ? 'success' : 'default'}
                            size='small'
                            variant={row.isActive ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell align='center'>
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell align='center'>
                          <IconButton color='primary' onClick={() => handleOpenDialog(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color='error' onClick={() => handleDelete(row._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth='sm'>
        <DialogTitle>{editMode ? 'Edit Handling Fee' : 'Add Handling Fee'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Description'
              fullWidth
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={editMode} // Disable editing if not creating new
            />
            <TextField
              label='Handling Fee'
              type='number'
              fullWidth
              value={handlingfee}
              onChange={e => setHandlingFee(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position='end'>%</InputAdornment>
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Typography>Active Status:</Typography>
              <Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            </div>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handlePreSubmit} variant='contained' color='primary'>
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Confirmation Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)}>
        <DialogTitle>Active Fee Conflict</DialogTitle>
        <DialogContent>
          <Typography>
            Fee <strong>{conflictingFee?.description}</strong> is currently active. Only one fee can be active at a
            time.
          </Typography>
          <Typography sx={{ mt: 2 }}>Do you want to deactivate it and set this new fee as active?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleConfirmConflict} variant='contained' color='primary'>
            Yes, Deactivate & Proceed
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant='filled'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

// Helper Box component import was missing in previous snippet
import Box from '@mui/material/Box'

export default CustomerHandlingFee
