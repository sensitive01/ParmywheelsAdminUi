'use client'

import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import axios from 'axios'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Paper from '@mui/material/Paper'

// Icon Imports

const VendorBankDetails = ({ vendorId }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const { data: session, status } = useSession()

  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [isApproved, setIsApproved] = useState(false)
  const [bankDetailsId, setBankDetailsId] = useState(null)

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  })

  // Fetch existing bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!vendorId) {
        setFetchLoading(false)

        return
      }

      try {
        setFetchLoading(true)
        console.log(`Fetching bank details from: ${API_URL}/vendor/getbankdetails/${vendorId}`)
        const response = await axios.get(`${API_URL}/vendor/getbankdetails/${vendorId}`)

        if (response.data?.data && response.data.data.length > 0) {
          const bankData = response.data.data[0]

          setAccountNumber(bankData.accountnumber || '')
          setConfirmAccountNumber(bankData.accountnumber || '')
          setAccountHolderName(bankData.accountholdername || '')
          setIfscCode(bankData.ifsccode || '')
          setIsApproved(bankData.isApproved || false)
          setBankDetailsId(bankData._id)
        }
      } catch (error) {
        console.error('Error fetching bank details:', error)

        // If 404, it's fine - just means no existing details
        if (error.response?.status !== 404) {
          setSnackbar({
            open: true,
            message: 'Failed to load bank details',
            severity: 'error'
          })
        }
      } finally {
        setFetchLoading(false)
      }
    }

    fetchBankDetails()
  }, [vendorId, API_URL])

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleApprove = async () => {
    if (!bankDetailsId) return

    try {
      setLoading(true)
      await axios.put(`${API_URL}/admin/verify-vendor-bank-details/${bankDetailsId}`, { status: 'approved' })
      setSnackbar({
        open: true,
        message: 'Bank details approved successfully',
        severity: 'success'
      })
      setIsApproved(true)
    } catch (error) {
      console.error('Error approving bank details:', error)
      setSnackbar({
        open: true,
        message: 'Failed to approve bank details',
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <Card sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress />
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader
        title='Bank Account Details'
        sx={{ bgcolor: 'primary.main' }}
        titleTypographyProps={{ color: 'common.white' }}
        action={
          !isApproved &&
          bankDetailsId && (
            <Button
              variant='contained'
              color='secondary'
              onClick={handleApprove}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Approving...' : 'Approve Bank Details'}
            </Button>
          )
        }
      />
      <CardContent>
        {isApproved && (
          <Box sx={{ mb: 2 }}>
            <Alert severity='success'>Bank details are approved.</Alert>
          </Box>
        )}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant='body1' color='text.secondary'>
            Admin can only approve the bank details.
          </Typography>
        </Box>

        <Box>
          <Paper
            elevation={1}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 2,
              ':hover': { boxShadow: 2 }
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Account Number
              </Typography>
              <TextField
                fullWidth
                variant='outlined'
                value={accountNumber}
                placeholder='Enter account number'
                sx={{ mb: 2 }}
                InputProps={{
                  readOnly: true
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Confirm Account Number
              </Typography>
              <TextField
                fullWidth
                variant='outlined'
                value={confirmAccountNumber}
                placeholder='Confirm account number'
                sx={{ mb: 2 }}
                InputProps={{
                  readOnly: true
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Account Holder Name
              </Typography>
              <TextField
                fullWidth
                variant='outlined'
                value={accountHolderName}
                placeholder='Enter account holder name'
                sx={{ mb: 2 }}
                InputProps={{
                  readOnly: true
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                IFSC Code
              </Typography>
              <TextField
                fullWidth
                variant='outlined'
                value={ifscCode}
                placeholder='Enter IFSC code'
                sx={{ mb: 2 }}
                InputProps={{
                  readOnly: true
                }}
              />
            </Box>
          </Paper>
        </Box>
      </CardContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default VendorBankDetails
