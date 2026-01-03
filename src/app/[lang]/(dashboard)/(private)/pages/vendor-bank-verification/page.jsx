'use client'

import { useState, useEffect, useCallback } from 'react'

import { useParams } from 'next/navigation'
import Link from 'next/link'

import axios from 'axios'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'

const VendorBankVerification = () => {
  const params = useParams()
  const { lang: locale } = params
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      // TODO: Verify the correct endpoint with backend
      const response = await axios.get(`${API_URL}/admin/get-all-vendor-bank-details`)

      if (response.data?.data) {
        setData(response.data.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching bank details:', error)
      setSnackbar({ open: true, message: 'Failed to fetch bank details', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }, [API_URL])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleApproveClick = id => {
    setSelectedId(id)
    setApproveDialogOpen(true)
  }

  const handleApproveConfirm = async () => {
    try {
      await axios.put(`${API_URL}/admin/verify-vendor-bank-details/${selectedId}`, { status: 'approved' })
      setSnackbar({ open: true, message: 'Approved successfully', severity: 'success' })
      setApproveDialogOpen(false)
      setSelectedId(null)
      fetchData()
    } catch (error) {
      console.error('Error approving:', error)
      setSnackbar({ open: true, message: 'Failed to approve', severity: 'error' })
    }
  }

  const handleRejectClick = id => {
    setSelectedId(id)
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    try {
      await axios.put(`${API_URL}/admin/verify-vendor-bank-details/${selectedId}`, {
        status: 'rejected',
        reason: rejectionReason
      })
      setSnackbar({ open: true, message: 'Rejected successfully', severity: 'success' })
      setRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedId(null)
      fetchData()
    } catch (error) {
      console.error('Error rejecting:', error)
      setSnackbar({ open: true, message: 'Failed to reject', severity: 'error' })
    }
  }

  return (
    <Card>
      <CardHeader title='Vendor Bank Details Verification' />
      <CardContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                <TableCell>Vendor ID</TableCell>
                <TableCell>Account Holder</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>IFSC</TableCell>
                <TableCell>Passbook</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align='center'>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align='center'>
                    No pending verifications found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow key={row._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.vendorId}</TableCell>
                    <TableCell>{row.accountholdername}</TableCell>
                    <TableCell>{row.accountnumber}</TableCell>
                    <TableCell>{row.ifsccode}</TableCell>
                    <TableCell>
                      {row.bankpassbookimage ? (
                        <a href={row.bankpassbookimage} target='_blank' rel='noopener noreferrer'>
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.isApproved ? 'Approved' : 'Pending'}
                        color={row.isApproved ? 'success' : 'warning'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell align='center'>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <Button
                          variant='outlined'
                          color='primary'
                          size='small'
                          component={Link}
                          href={`/${locale}/pages/vendordetails/${row.vendorId}`}
                        >
                          View Details
                        </Button>
                        {!row.isApproved && (
                          <>
                            <Button
                              variant='contained'
                              color='success'
                              size='small'
                              onClick={() => handleApproveClick(row._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant='contained'
                              color='error'
                              size='small'
                              onClick={() => handleRejectClick(row._id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Confirm Approval</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to approve these bank details?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveConfirm} variant='contained' color='success'>
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Bank Details</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Please provide a reason for rejection:</Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant='contained' color='error'>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default VendorBankVerification
